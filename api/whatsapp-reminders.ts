import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { decryptSecret } from './utils/encryption';
import { META_GRAPH_BASE } from './utils/meta';

/**
 * Format local date as YYYY-MM-DD with day offset
 */
function getDateStringWithOffset(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

/**
 * Normalize phone to E.164 without leading plus (Meta standard, e.g. 919876543210)
 */
function normalizePhone(phone: string): string {
  const cleaned = (phone || '').replace(/\D/g, '');
  if (cleaned.length === 10) return `91${cleaned}`;
  return cleaned;
}

/**
 * Automated Expiry Reminders Dispatcher
 * Runs on cron schedule (e.g. daily at 09:00 AM IST)
 * Scans gyms with active official WhatsApp accounts and dispatches renewal reminders.
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

  try {
    // 1. Fetch all gyms with active official WhatsApp connections
    const { data: accounts, error: accErr } = await supabase
      .from('whatsapp_accounts')
      .select('gym_id, phone_number_id, meta_access_token, gyms(name, owner_name, upi_id)')
      .eq('account_status', 'active');

    if (accErr) {
      console.error('[WhatsApp Reminders] Failed to fetch active accounts:', accErr);
      return res.status(500).json({ error: accErr.message });
    }

    if (!accounts || accounts.length === 0) {
      return res.status(200).json({ status: 'NO_ACTIVE_ACCOUNTS', dispatched: 0 });
    }

    // Days offset configurations to check:
    // 3 days prior, 1 day prior, day of expiry
    const reminderTriggers: Array<{ offset: number; jobType: string }> = [
      { offset: 3, jobType: 'expiry_reminder_3d' },
      { offset: 1, jobType: 'expiry_reminder_1d' },
      { offset: 0, jobType: 'expiry_expired' },
    ];

    let totalDispatched = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const acc of accounts) {
      const gymId = acc.gym_id;
      const phoneNumberId = acc.phone_number_id;
      const rawToken = acc.meta_access_token;
      const gymData: any = Array.isArray(acc.gyms) ? acc.gyms[0] : acc.gyms;
      const gymName = gymData?.name || 'OwnerHQ Gym';

      if (!phoneNumberId || !rawToken) continue;

      // Decrypt stored system/user token
      const accessToken = decryptSecret(rawToken);

      for (const trigger of reminderTriggers) {
        const targetDate = getDateStringWithOffset(trigger.offset);

        // Fetch members expiring on target date
        const { data: members, error: memErr } = await supabase
          .from('members')
          .select('id, full_name, mobile, expiry_date, status')
          .eq('gym_id', gymId)
          .eq('expiry_date', targetDate);

        if (memErr || !members || members.length === 0) continue;

        for (const member of members) {
          if (!member.mobile) continue;

          // 2. Deterministic Idempotency Key
          const idempotencyKey = crypto
            .createHash('sha256')
            .update(`${gymId}:${member.id}:${trigger.jobType}:${targetDate}`)
            .digest('hex');

          const recipientPhone = normalizePhone(member.mobile);
          const templateName = 'membership_expiry_reminder';

          // 3. Pre-Flight Claim: Atomic INSERT with 'sending' status to prevent race conditions
          const { data: claimRecord, error: claimErr } = await supabase
            .from('whatsapp_messages')
            .insert({
              gym_id: gymId,
              member_id: member.id,
              recipient_phone: recipientPhone,
              template_name: templateName,
              idempotency_key: idempotencyKey,
              status: 'sending',
            })
            .select('id')
            .single();

          if (claimErr) {
            // If unique constraint violation on idempotency_key, another worker or run has already claimed it
            if (claimErr.code === '23505' || claimErr.message?.includes('duplicate key')) {
              totalSkipped++;
              continue;
            }
            console.error('[WhatsApp Reminders] Failed to pre-claim message send:', claimErr);
            totalErrors++;
            continue;
          }

          // 4. Dispatch official WhatsApp message via Meta Graph API
          try {
            const sendUrl = `${META_GRAPH_BASE}/${phoneNumberId}/messages`;
            const payload = {
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: recipientPhone,
              type: 'template',
              template: {
                name: templateName,
                language: { code: 'en' },
                components: [
                  {
                    type: 'body',
                    parameters: [
                      { type: 'text', text: member.full_name || 'Member' },
                      { type: 'text', text: gymName },
                      { type: 'text', text: member.expiry_date || targetDate },
                    ],
                  },
                ],
              },
            };

            const metaRes = await fetch(sendUrl, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });

            const metaData = await metaRes.json();

            if (!metaRes.ok || metaData.error) {
              const metaError = metaData.error || {};
              const isRetryable =
                metaRes.status === 429 ||
                metaRes.status >= 500 ||
                metaError.code === 130429 ||
                metaError.is_transient === true;

              console.warn(
                `[WhatsApp Reminders] Meta dispatch error for member ${member.id}:`,
                metaError.message
              );

              // Update claimed record to failed with error classification
              await supabase
                .from('whatsapp_messages')
                .update({
                  status: 'failed',
                  error_message: `[Code ${metaError.code || metaRes.status}]: ${metaError.message || 'Meta API error'} (Retryable: ${isRetryable})`,
                })
                .eq('id', claimRecord.id);

              totalErrors++;
              continue;
            }

            const wamid = metaData.messages?.[0]?.id || null;

            // 5. Update claimed record to 'sent' with returned wamid
            await supabase
              .from('whatsapp_messages')
              .update({
                wamid: wamid,
                status: 'sent',
                sent_at: new Date().toISOString(),
              })
              .eq('id', claimRecord.id);

            // 6. Dual-write to legacy reminder_logs for backward-compatible dashboard visibility
            try {
              await supabase.from('reminder_logs').insert({
                gym_id: gymId,
                member_id: member.id,
                reminder_type: trigger.jobType,
                sent_at: new Date().toISOString(),
              });
            } catch (legacyErr) {
              console.warn('[WhatsApp Reminders] Legacy reminder_logs write notice:', legacyErr);
            }

            totalDispatched++;
          } catch (sendErr: any) {
            // Provider send ambiguity: Network timed out or failed while Meta may have received it
            console.error(`[WhatsApp Reminders] Ambiguous network exception sending to ${member.id}:`, sendErr);
            await supabase
              .from('whatsapp_messages')
              .update({
                status: 'failed',
                error_message: `Network timeout / ambiguous send: ${sendErr.message}`,
              })
              .eq('id', claimRecord.id);
            totalErrors++;
          }
        }
      }
    }

    return res.status(200).json({
      status: 'COMPLETED',
      dispatched: totalDispatched,
      skipped: totalSkipped,
      errors: totalErrors,
    });
  } catch (err: any) {
    console.error('[WhatsApp Reminders] Unexpected cron failure:', err);
    return res.status(500).json({ error: 'Internal cron failure', message: err.message });
  }
}
