import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v21.0';
const META_OAUTH_DIALOG_BASE = `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth`;
const REQUIRED_WHATSAPP_SCOPES = 'whatsapp_business_management,whatsapp_business_messaging';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') {
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

    // 1. Authenticate the caller's session (Strict Tenant Isolation)
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '') || req.query?.token;

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
        message: 'Authentication failed: Invalid or expired session token.',
      });
    }

    const ownerUserId = userData.user.id;
    const requestedGymId = req.query?.gym_id || req.body?.gym_id;

    // Resolve gym belonging to authenticated user
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    let query = supabaseAdmin.from('gyms').select('id, owner_user_id').eq('owner_user_id', ownerUserId);
    if (requestedGymId) {
      query = query.eq('id', requestedGymId);
    }

    const { data: gymData, error: gymError } = await query.maybeSingle();

    if (gymError || !gymData) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Authenticated user does not own this gym.',
      });
    }

    const verifiedGymId = gymData.id;

    const appId = process.env.META_APP_ID || process.env.WHATSAPP_APP_ID;
    const appSecret = process.env.META_APP_SECRET || process.env.WHATSAPP_APP_SECRET;
    const configId = process.env.META_CONFIG_ID; // Optional Meta Embedded Signup Config ID

    if (!appId || !appSecret) {
      return res.status(500).json({
        success: false,
        message: 'Meta App credentials (META_APP_ID / META_APP_SECRET) are missing on server.',
      });
    }

    // Resolve Base URL dynamically
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.getownerhq.in';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const redirectUri = encodeURIComponent(`${proto}://${host}/api/whatsapp-callback`);

    // 2. Create tamper-proof HMAC signature binding gym_id AND owner_user_id
    const timestamp = Date.now().toString();
    const signature = crypto
      .createHmac('sha256', appSecret)
      .update(`${verifiedGymId}:${ownerUserId}:${timestamp}`)
      .digest('hex');

    const statePayload = Buffer.from(
      JSON.stringify({
        gym_id: verifiedGymId,
        owner_id: ownerUserId,
        ts: timestamp,
        sig: signature,
      })
    ).toString('base64url');

    // Scopes required for WhatsApp Cloud API & WABA management
    const scopes = encodeURIComponent(REQUIRED_WHATSAPP_SCOPES);

    let authUrl = `${META_OAUTH_DIALOG_BASE}?client_id=${appId}&redirect_uri=${redirectUri}&state=${statePayload}&response_type=code`;

    if (configId) {
      // Embedded Signup flow with pre-configured Meta asset config ID
      authUrl += `&config_id=${configId}`;
    } else {
      // Standard dialog OAuth with direct scopes
      authUrl += `&scope=${scopes}`;
    }

    // If request asks for JSON or is API fetch
    if (req.headers.accept?.includes('application/json') || req.method === 'POST') {
      return res.status(200).json({ success: true, auth_url: authUrl });
    }

    // Direct browser navigation redirect
    return res.redirect(302, authUrl);
  } catch (error: any) {
    console.error('WhatsApp Connect error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
