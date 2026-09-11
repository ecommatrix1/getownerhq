import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Disable automatic body parser in Vercel to preserve exact raw body for HMAC verification
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Helper to extract raw body buffer/string from incoming Node/Vercel request stream
 */
async function getRawBody(req: any): Promise<string> {
  if (typeof req.rawBody === 'string') return req.rawBody;
  if (Buffer.isBuffer(req.rawBody)) return req.rawBody.toString('utf-8');
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf-8');

  // If already parsed into an object by a pre-middleware
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return JSON.stringify(req.body);
  }

  // Stream reader
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

export default async function handler(req: any, res: any) {
  // ---------------------------------------------------------------------------
  // 1. GET: Webhook Verification Handshake (Meta Challenge)
  // ---------------------------------------------------------------------------
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'] || req.query.hub_mode;
    const token = req.query['hub.verify_token'] || req.query.hub_verify_token;
    const challenge = req.query['hub.challenge'] || req.query.hub_challenge;

    const expectedVerifyToken =
      process.env.META_WEBHOOK_VERIFY_TOKEN ||
      process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ||
      'ownerhq_whatsapp_webhook_secret';

    if (mode === 'subscribe' && token === expectedVerifyToken) {
      console.log('[WhatsApp Webhook] Meta challenge verification succeeded.');
      return res.status(200).send(challenge);
    } else {
      console.warn('[WhatsApp Webhook] Verification token mismatch or invalid mode:', { mode, token });
      return res.status(403).json({ error: 'Forbidden: Invalid verification token' });
    }
  }

  // Reject methods other than POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ---------------------------------------------------------------------------
  // 2. POST: Secure Ingestion with Cryptographic Signature Verification
  // ---------------------------------------------------------------------------
  try {
    const appSecret = process.env.META_APP_SECRET || process.env.WHATSAPP_APP_SECRET;

    if (!appSecret) {
      console.error('[WhatsApp Webhook] Missing META_APP_SECRET in environment.');
      return res.status(500).json({ error: 'Server misconfiguration: META_APP_SECRET required.' });
    }

    const rawBody = await getRawBody(req);

    // Validate Meta Hub Signature: x-hub-signature-256
    const hubSignature = (req.headers['x-hub-signature-256'] || req.headers['X-Hub-Signature-256'] || '') as string;

    if (!hubSignature || !hubSignature.startsWith('sha256=')) {
      console.warn('[WhatsApp Webhook] Missing or malformed x-hub-signature-256 header.');
      return res.status(401).json({ error: 'Unauthorized: Missing or malformed signature' });
    }

    const signatureHex = hubSignature.slice(7); // Remove 'sha256='
    const expectedSignatureHex = crypto
      .createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex');

    const sigBuf = Buffer.from(signatureHex, 'hex');
    const expBuf = Buffer.from(expectedSignatureHex, 'hex');

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      console.warn('[WhatsApp Webhook] Signature verification failed.');
      return res.status(401).json({ error: 'Unauthorized: Invalid signature' });
    }

    // -------------------------------------------------------------------------
    // 3. Payload Parsing & Multi-Tenant Routing
    // -------------------------------------------------------------------------
    let parsedBody: any;
    try {
      parsedBody = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    } catch (parseErr) {
      console.error('[WhatsApp Webhook] Failed to parse JSON payload:', parseErr);
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    if (parsedBody.object !== 'whatsapp_business_account' || !Array.isArray(parsedBody.entry)) {
      // Return 200 for Meta ping / non-WABA events so Meta does not keep retrying test pings
      return res.status(200).json({ status: 'IGNORED_NON_WABA_OBJECT' });
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

    // Collect all phone_number_ids & waba_ids in this webhook batch for fast tenant resolution
    const phoneIds = new Set<string>();
    const wabaIds = new Set<string>();

    for (const entry of parsedBody.entry) {
      if (entry.id) wabaIds.add(entry.id);
      for (const change of entry.changes || []) {
        const phoneId = change.value?.metadata?.phone_number_id;
        if (phoneId) phoneIds.add(phoneId);
      }
    }

    // Map phone_number_id -> gym_id and waba_id -> gym_id
    const gymByPhone = new Map<string, string>();
    const gymByWaba = new Map<string, string>();

    if (phoneIds.size > 0 || wabaIds.size > 0) {
      const { data: accounts } = await supabase
        .from('whatsapp_accounts')
        .select('gym_id, phone_number_id, waba_id')
        .in('phone_number_id', Array.from(phoneIds));

      if (accounts) {
        for (const acc of accounts) {
          if (acc.phone_number_id) gymByPhone.set(acc.phone_number_id, acc.gym_id);
          if (acc.waba_id) gymByWaba.set(acc.waba_id, acc.gym_id);
        }
      }

      // Fallback query by WABA ID if any phone ID didn't resolve
      if (gymByPhone.size < phoneIds.size && wabaIds.size > 0) {
        const { data: wabaAccounts } = await supabase
          .from('whatsapp_accounts')
          .select('gym_id, waba_id')
          .in('waba_id', Array.from(wabaIds));

        if (wabaAccounts) {
          for (const acc of wabaAccounts) {
            if (acc.waba_id) gymByWaba.set(acc.waba_id, acc.gym_id);
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // 4. Deep Event Unrolling (Zero-Loss Ingestion)
    // -------------------------------------------------------------------------
    const eventsToInsert: Array<{
      gym_id: string | null;
      provider_event_id: string;
      event_type: string;
      payload: any;
      status: 'pending';
    }> = [];

    for (const entry of parsedBody.entry) {
      const entryWabaId = entry.id;

      for (const change of entry.changes || []) {
        const field = change.field || 'messages';
        const value = change.value || {};
        const metadata = value.metadata || {};
        const phoneNumberId = metadata.phone_number_id;

        // Resolve gym_id
        const gymId =
          (phoneNumberId && gymByPhone.get(phoneNumberId)) ||
          (entryWabaId && gymByWaba.get(entryWabaId)) ||
          null;

        // 4A. Inbound Messages
        if (Array.isArray(value.messages) && value.messages.length > 0) {
          for (const msg of value.messages) {
            eventsToInsert.push({
              gym_id: gymId,
              provider_event_id: msg.id, // Meta wamid is globally unique
              event_type: 'messages',
              payload: {
                ...msg,
                contacts: value.contacts,
                metadata: value.metadata,
                entry_id: entryWabaId,
              },
              status: 'pending',
            });
          }
        }

        // 4B. Delivery Status Updates (sent -> delivered -> read -> failed)
        if (Array.isArray(value.statuses) && value.statuses.length > 0) {
          for (const statusObj of value.statuses) {
            // Distinct composite key so multiple status transitions for the same wamid are not lost
            const statusEventId = `${statusObj.id}:${statusObj.status}`;
            eventsToInsert.push({
              gym_id: gymId,
              provider_event_id: statusEventId,
              event_type: 'message_status',
              payload: {
                ...statusObj,
                metadata: value.metadata,
                entry_id: entryWabaId,
              },
              status: 'pending',
            });
          }
        }

        // 4C. Fallback for other change events (e.g. template status changes)
        if (!value.messages?.length && !value.statuses?.length) {
          const fallbackEventId = `${entryWabaId}:${field}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
          eventsToInsert.push({
            gym_id: gymId,
            provider_event_id: fallbackEventId,
            event_type: field,
            payload: {
              change,
              entry_id: entryWabaId,
            },
            status: 'pending',
          });
        }
      }
    }

    // -------------------------------------------------------------------------
    // 5. Atomic Durable Insertion with Idempotency
    // -------------------------------------------------------------------------
    if (eventsToInsert.length > 0) {
      const { error: insertErr } = await supabase
        .from('whatsapp_events')
        .upsert(eventsToInsert, {
          onConflict: 'provider_event_id',
          ignoreDuplicates: true,
        });

      if (insertErr) {
        console.error('[WhatsApp Webhook] Ingestion failed to write to database:', insertErr);
        // CRITICAL: Return 500 to tell Meta to retry delivery with exponential backoff!
        return res.status(500).json({ error: 'Database ingestion failed. Meta should retry.' });
      }

      console.log(`[WhatsApp Webhook] Successfully ingested ${eventsToInsert.length} events into queue.`);
    }

    // Return 200 OK only after durable database persistence
    return res.status(200).json({ status: 'EVENT_RECEIVED' });
  } catch (error: any) {
    console.error('[WhatsApp Webhook] Unexpected runtime failure:', error);
    // Return 500 on unexpected exception so Meta retries the webhook
    return res.status(500).json({ error: 'Internal server error during ingestion' });
  }
}
