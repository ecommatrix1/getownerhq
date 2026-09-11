import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { encryptSecret } from './utils/encryption';
import { META_GRAPH_BASE } from './utils/meta';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.getownerhq.in';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${proto}://${host}`;

  const { code, state, error, error_description } = req.query || {};

  // Handle user cancellation or Meta auth error
  if (error || !code) {
    const errorMsg = encodeURIComponent(error_description || error || 'Authorization cancelled');
    return res.redirect(302, `${baseUrl}/#/dashboard/whatsapp?error=${errorMsg}`);
  }

  try {
    const appId = process.env.META_APP_ID || process.env.WHATSAPP_APP_ID;
    const appSecret = process.env.META_APP_SECRET || process.env.WHATSAPP_APP_SECRET;

    if (!appId || !appSecret) {
      throw new Error('Meta App credentials (META_APP_ID / META_APP_SECRET) are missing in server environment variables.');
    }

    // 1. Verify CSRF state & extract gym_id + owner_id
    if (!state) {
      throw new Error('Missing state parameter from OAuth callback.');
    }

    let parsedState: { gym_id: string; owner_id: string; ts: string; sig: string };
    try {
      parsedState = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'));
    } catch {
      throw new Error('Invalid state encoding.');
    }

    const { gym_id, owner_id, ts, sig } = parsedState;
    if (!gym_id || !owner_id || !ts || !sig) {
      throw new Error('State parameter is missing mandatory security attributes.');
    }

    // Check expiration (max 15 minutes)
    const stateAge = Date.now() - parseInt(ts, 10);
    if (isNaN(stateAge) || stateAge < 0 || stateAge > 15 * 60 * 1000) {
      throw new Error('OAuth state has expired. Please initiate the connection again.');
    }

    const expectedSig = crypto
      .createHmac('sha256', appSecret)
      .update(`${gym_id}:${owner_id}:${ts}`)
      .digest('hex');

    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      throw new Error('State signature verification failed. Potential CSRF attempt.');
    }

    const redirectUri = `${baseUrl}/api/whatsapp-callback`;

    // 2. Exchange authorization code for access token
    const tokenUrl = `${META_GRAPH_BASE}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error?.message || 'Failed to exchange code for access token');
    }

    const shortLivedToken = tokenData.access_token;

    // 3. Exchange for long-lived system/user token (~60 days)
    const longLivedUrl = `${META_GRAPH_BASE}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();
    const finalToken = longLivedData.access_token || shortLivedToken;

    // Calculate token expiration (default to 60 days if omitted by Graph API)
    const expiresInSeconds = longLivedData.expires_in || tokenData.expires_in || 5184000;
    const tokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    // 4. Debug token to discover WABA ID
    const debugUrl = `${META_GRAPH_BASE}/debug_token?input_token=${finalToken}&access_token=${appId}|${appSecret}`;
    const debugRes = await fetch(debugUrl);
    const debugData = await debugRes.json();

    let wabaId = '';
    const granularScopes = debugData?.data?.granular_scopes || [];
    for (const scope of granularScopes) {
      if (scope.target_ids && scope.target_ids.length > 0) {
        wabaId = scope.target_ids[0];
        break;
      }
    }

    // Fallback: If not in granular scopes, query businesses/owned WABAs
    if (!wabaId) {
      const meUrl = `${META_GRAPH_BASE}/me?fields=id,name&access_token=${finalToken}`;
      const meRes = await fetch(meUrl);
      const meData = await meRes.json();
      wabaId = meData.id || '';
    }

    // 5. Discover phone numbers associated with this WABA
    let phoneNumberId = '';
    let displayPhoneNumber = '';
    let verifiedName = '';

    if (wabaId) {
      const phoneUrl = `${META_GRAPH_BASE}/${wabaId}/phone_numbers?access_token=${finalToken}`;
      const phoneRes = await fetch(phoneUrl);
      const phoneData = await phoneRes.json();

      if (phoneData?.data && phoneData.data.length > 0) {
        const primaryPhone = phoneData.data[0];
        phoneNumberId = primaryPhone.id;
        displayPhoneNumber = primaryPhone.display_phone_number;
        verifiedName = primaryPhone.verified_name;
      }

      // 6. Automatically subscribe OwnerHQ's Webhook to the gym owner's WABA
      try {
        await fetch(`${META_GRAPH_BASE}/${wabaId}/subscribed_apps`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${finalToken}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (subErr) {
        console.warn('WABA webhook subscription warning:', subErr);
      }
    }

    // 7. Initialize Supabase Admin & verify gym ownership matches state owner_id
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ydmrupmxtyyecykpxitb.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: gymRecord, error: gymLookupErr } = await supabase
      .from('gyms')
      .select('id, owner_user_id')
      .eq('id', gym_id)
      .maybeSingle();

    if (gymLookupErr || !gymRecord || gymRecord.owner_user_id !== owner_id) {
      throw new Error('Tenant ownership validation failed: Gym does not match authorized owner.');
    }

    // 8. Encrypt Meta Access Token before storing (AES-256-GCM)
    const encryptedAccessToken = encryptSecret(finalToken);

    // 9. Upsert credentials into Supabase (whatsapp_accounts)
    const { error: upsertErr } = await supabase
      .from('whatsapp_accounts')
      .upsert(
        {
          gym_id,
          waba_id: wabaId || 'waba_pending',
          phone_number_id: phoneNumberId || 'phone_pending',
          display_phone_number: displayPhoneNumber || null,
          verified_name: verifiedName || null,
          meta_access_token: encryptedAccessToken,
          token_type: 'user_long_lived',
          token_expires_at: tokenExpiresAt,
          account_status: 'active',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'gym_id' }
      );

    if (upsertErr) {
      console.error('Failed to save whatsapp_account to Supabase:', upsertErr);
      throw new Error(`Database error: ${upsertErr.message}`);
    }

    // Redirect gym owner to dashboard with success query param
    return res.redirect(302, `${baseUrl}/#/dashboard/whatsapp?connected=true&phone=${encodeURIComponent(displayPhoneNumber || '')}`);
  } catch (err: any) {
    console.error('WhatsApp Callback error:', err);
    return res.redirect(302, `${baseUrl}/#/dashboard/whatsapp?error=${encodeURIComponent(err.message || 'Connection failed')}`);
  }
}
