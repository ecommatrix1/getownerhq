import { createClient } from '@supabase/supabase-js';

/**
 * WhatsApp Event Queue Worker
 * Claims pending events from whatsapp_events via Postgres atomic locking (FOR UPDATE SKIP LOCKED)
 * and processes delivery status updates and inbound message receipts.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Strictly verify dedicated CRON_SECRET authorization
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = (req.headers.authorization || '').trim();

  if (process.env.NODE_ENV === 'production' || cronSecret) {
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({
        error: 'Unauthorized: Valid CRON_SECRET Bearer token required in Authorization header.',
      });
    }
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    'https://ydmrupmxtyyecykpxitb.supabase.co';
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const workerId = `worker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const batchSize = 50;

  try {
    // 1. Claim batch of pending events using Postgres FOR UPDATE SKIP LOCKED
    const { data: events, error: claimError } = await supabase.rpc(
      'claim_whatsapp_events_batch',
      {
        batch_size: batchSize,
        worker_id: workerId,
        lease_duration_seconds: 60,
      }
    );

    if (claimError) {
      console.error('[WhatsApp Worker] Failed to claim event batch:', claimError);
      return res.status(500).json({ error: 'Failed to claim events batch', details: claimError.message });
    }

    if (!events || events.length === 0) {
      return res.status(200).json({ status: 'NO_EVENTS_PENDING', processed: 0 });
    }

    console.log(`[WhatsApp Worker] Claimed ${events.length} events for processing.`);

    let processedCount = 0;
    let failureCount = 0;

    for (const evt of events) {
      try {
        const { event_type, payload, gym_id } = evt;

        if (event_type === 'message_status') {
          // Status payload structure: { id (wamid), status ('sent'|'delivered'|'read'|'failed'), timestamp, errors: [...] }
          const wamid = payload.id;
          const status = payload.status;
          const timestamp = payload.timestamp ? new Date(parseInt(payload.timestamp, 10) * 1000).toISOString() : new Date().toISOString();

          if (wamid && status) {
            const updateFields: Record<string, any> = {
              status: status,
            };

            if (status === 'sent') updateFields.sent_at = timestamp;
            if (status === 'delivered') updateFields.delivered_at = timestamp;
            if (status === 'read') updateFields.read_at = timestamp;
            if (status === 'failed') {
              updateFields.error_message = payload.errors ? JSON.stringify(payload.errors) : 'Delivery failed';
            }

            await supabase
              .from('whatsapp_messages')
              .update(updateFields)
              .eq('wamid', wamid);
          }
        } else if (event_type === 'messages') {
          // Inbound message received from member
          console.log(`[WhatsApp Worker] Inbound message registered from ${payload.from} for gym ${gym_id}`);
        }

        // Fencing Token: Atomically mark processed ONLY if this worker still holds the valid lease
        const { data: updatedEvt } = await supabase
          .from('whatsapp_events')
          .update({
            status: 'processed',
            processed_at: new Date().toISOString(),
          })
          .eq('id', evt.id)
          .eq('locked_by', workerId)
          .gte('lease_until', new Date().toISOString())
          .select('id')
          .maybeSingle();

        if (!updatedEvt) {
          console.warn(`[WhatsApp Worker] Fencing token rejection: Worker ${workerId} lost lease on event ${evt.id}. Discarding update.`);
          continue;
        }

        processedCount++;
      } catch (evtErr: any) {
        console.error(`[WhatsApp Worker] Error processing event ${evt.id}:`, evtErr);
        failureCount++;

        const nextAttempts = (evt.attempt_count || 0) + 1;
        const newStatus = nextAttempts >= 5 ? 'dead' : 'failed';

        await supabase
          .from('whatsapp_events')
          .update({
            status: newStatus,
            attempt_count: nextAttempts,
            last_error: evtErr.message || 'Unknown processing error',
            locked_at: null,
            locked_by: null,
            lease_until: null,
          })
          .eq('id', evt.id)
          .eq('locked_by', workerId);
      }
    }

    return res.status(200).json({
      status: 'SUCCESS',
      processed: processedCount,
      failed: failureCount,
      total: events.length,
    });
  } catch (err: any) {
    console.error('[WhatsApp Worker] Unexpected worker error:', err);
    return res.status(500).json({ error: 'Internal worker failure', message: err.message });
  }
}
