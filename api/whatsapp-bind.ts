import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || process.env.META_APP_SECRET;
  if (!secret) {
    return crypto.createHash('sha256').update('ownerhq-local-dev-secret-do-not-use-in-prod').digest();
  }
  return crypto.createHash('sha256').update(secret).digest();
}

function encryptSecret(plaintext: string): string {
  if (!plaintext) return '';
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized: Missing bearer token.' });

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ydmrupmxtyyecykpxitb.supabase.co';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !userData?.user) {
      return res.status(401).json({ success: false, message: 'Invalid session.' });
    }

    const { gym_id, phone_number_id, waba_id, display_phone_number, access_token } = req.body || {};

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    let gymQuery = supabaseAdmin.from('gyms').select('id, name').eq('owner_user_id', userData.user.id);
    if (gym_id) gymQuery = gymQuery.eq('id', gym_id);
    const { data: gymData, error: gymErr } = await gymQuery.maybeSingle();

    if (gymErr || !gymData) {
      return res.status(403).json({ success: false, message: 'Gym not found or access denied.' });
    }

    const targetPhoneId = phone_number_id || '1337129959481336';
    const targetWabaId = waba_id || '2136993520216955';
    const targetDisplay = display_phone_number || '+1 555-159-5641';

    // Remove any stale records holding this phone_number_id
    await supabaseAdmin
      .from('whatsapp_accounts')
      .delete()
      .eq('phone_number_id', targetPhoneId)
      .neq('gym_id', gymData.id);

    const updatePayload: any = {
      gym_id: gymData.id,
      phone_number_id: targetPhoneId,
      waba_id: targetWabaId,
      display_phone_number: targetDisplay,
      verified_name: 'Test Number',
      account_status: 'active',
      updated_at: new Date().toISOString(),
    };

    if (access_token) {
      updatePayload.meta_access_token = encryptSecret(access_token);
    }

    const { error: upsertErr } = await supabaseAdmin
      .from('whatsapp_accounts')
      .upsert(updatePayload, { onConflict: 'gym_id' });

    if (upsertErr) throw upsertErr;

    return res.status(200).json({
      success: true,
      message: 'WhatsApp account bound successfully.',
      account: {
        gym_id: gymData.id,
        phone_number_id: targetPhoneId,
        waba_id: targetWabaId,
        display_phone_number: targetDisplay,
      },
    });
  } catch (err: any) {
    console.error('WhatsApp bind error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
