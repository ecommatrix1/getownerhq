import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v26.0';
const META_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || process.env.META_APP_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Critical Security Error: ENCRYPTION_SECRET environment variable is missing in production.');
    }
    return crypto.createHash('sha256').update('ownerhq-local-dev-secret-do-not-use-in-prod').digest();
  }
  return crypto.createHash('sha256').update(secret).digest();
}

function decryptSecret(ciphertext: string): string {
  if (!ciphertext) return '';
  const parts = ciphertext.split(':');
  if (parts.length !== 3) return ciphertext;
  try {
    const [ivHex, encryptedHex, authTagHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Failed to decrypt secret:', err);
    return '';
  }
}

function normalizePhone(phone: string): string {
  const cleaned = (phone || '').replace(/\D/g, '');
  if (cleaned.length === 10) return `91${cleaned}`;
  return cleaned;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      'https://ydmrupmxtyyecykpxitb.supabase.co';
    const supabaseAnonKey =
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      '';
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

    // 1. Authenticate caller session
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required: Missing bearer token.',
      });
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);

    if (userError || !userData?.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Invalid or expired session.',
      });
    }

    const ownerUserId = userData.user.id;
    const { gym_id, recipient_phone, message_text } = req.body || {};

    if (!recipient_phone) {
      return res.status(400).json({ success: false, message: 'Missing recipient_phone.' });
    }

    // 2. Validate gym ownership
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    let gymQuery = supabaseAdmin.from('gyms').select('id, name').eq('owner_user_id', ownerUserId);
    if (gym_id) {
      gymQuery = gymQuery.eq('id', gym_id);
    }
    const { data: gymData, error: gymErr } = await gymQuery.maybeSingle();

    if (gymErr || !gymData) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Gym not found or access denied.' });
    }

    // 3. Fetch gym active WhatsApp account
    const { data: waAccount, error: waErr } = await supabaseAdmin
      .from('whatsapp_accounts')
      .select('*')
      .eq('gym_id', gymData.id)
      .eq('account_status', 'active')
      .maybeSingle();

    if (waErr || !waAccount) {
      return res.status(400).json({
        success: false,
        message: 'No active Official WhatsApp account connected for this gym. Please connect WhatsApp first.',
      });
    }

    const accessToken = decryptSecret(waAccount.meta_access_token);
    const phoneNumberId = waAccount.phone_number_id;

    if (!accessToken || !phoneNumberId) {
      return res.status(500).json({
        success: false,
        message: 'Decryption failed or missing phone_number_id for WhatsApp account.',
      });
    }

    const formattedRecipient = normalizePhone(recipient_phone);
    const bodyText =
      message_text ||
      `Hello! This is an official test message from ${gymData.name} via OwnerHQ WhatsApp Cloud API. Your connection is live and verified!`;

    // 4. Send official WhatsApp template message via Meta Graph API
    // Note: Meta requires a pre-approved template for business-initiated messages outside the 24h window.
    // 'hello_world' is Meta's built-in default template available across all WhatsApp Business Accounts.
    const sendUrl = `${META_GRAPH_BASE}/${phoneNumberId}/messages`;
    const templatePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedRecipient,
      type: 'template',
      template: {
        name: 'hello_world',
        language: { code: 'en_US' },
      },
    };

    let metaRes = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templatePayload),
    });

    let metaData = await metaRes.json();

    // If hello_world template isn't available in en_US, retry with free-form text fallback
    if (!metaRes.ok && metaData.error?.code === 100) {
      const textPayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedRecipient,
        type: 'text',
        text: {
          preview_url: false,
          body: bodyText,
        },
      };

      metaRes = await fetch(sendUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(textPayload),
      });

      metaData = await metaRes.json();
    }

    if (!metaRes.ok || metaData.error) {
      console.warn('[WhatsApp Test Send] Meta dispatch error:', metaData.error);
      return res.status(metaRes.status || 400).json({
        success: false,
        message: metaData.error?.message || 'Meta API error occurred',
        error_details: metaData.error,
      });
    }

    const wamid = metaData.messages?.[0]?.id || null;

    // 5. Record test message in whatsapp_messages for audit trail
    await supabaseAdmin.from('whatsapp_messages').insert({
      gym_id: gymData.id,
      recipient_phone: formattedRecipient,
      template_name: 'direct_test_message',
      wamid,
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: { type: 'test_send', initiated_by: ownerUserId },
    });

    return res.status(200).json({
      success: true,
      wamid,
      recipient: formattedRecipient,
      message: `Test message successfully dispatched to ${formattedRecipient} from official WhatsApp!`,
    });
  } catch (error: any) {
    console.error('WhatsApp test send error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
