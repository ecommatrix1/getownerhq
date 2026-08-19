import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { subscription_id, gym_id, plan_name } = req.body || {};

    if (!subscription_id || !gym_id || !plan_name) {
      return res.status(400).json({ success: false, message: 'Missing subscription_id, gym_id, or plan_name' });
    }

    const clientId = process.env.CASHFREE_CLIENT_ID || process.env.VITE_CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
    const mode = process.env.CASHFREE_MODE || process.env.CASHFREE_ENV || (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox');

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        success: false,
        message: 'Cashfree API credentials (CASHFREE_CLIENT_ID / CASHFREE_CLIENT_SECRET) are not configured on server.'
      });
    }

    const baseUrl = mode === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';

    const response = await fetch(`${baseUrl}/subscriptions/${subscription_id}`, {
      method: 'GET',
      headers: {
        'x-client-id': clientId,
        'x-client-secret': clientSecret,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status || 400).json({
        success: false,
        message: data.message || 'Failed to fetch Cashfree subscription details',
        subscription_status: data.subscription_status || 'UNKNOWN'
      });
    }

    const subStatus = (data.subscription_status || '').toUpperCase();

    if (subStatus === 'ACTIVE') {
      // Server-side authorization verification succeeded! Update Supabase DB securely.
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ydmrupmxtyyecykpxitb.supabase.co';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Mt6ZI4t0oJrto5x1uu6RvQ_GhTnZOK-';

      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: updateError } = await supabase
        .from('gyms')
        .update({
          subscription_status: 'active',
          subscription_plan: plan_name
        })
        .eq('id', gym_id);

      if (updateError) {
        console.error('Failed to update gym subscription in DB:', updateError);
        return res.status(500).json({
          success: false,
          message: 'Mandate authorized at Cashfree, but failed updating database record.',
          subscription_status: 'ACTIVE'
        });
      }

      return res.status(200).json({
        success: true,
        subscription_status: 'ACTIVE',
        subscription_id: data.subscription_id,
        message: `Subscription mandate verified! ${plan_name} plan activated.`,
        api_endpoint: `${baseUrl}/subscriptions/${subscription_id}`
      });
    } else {
      return res.status(200).json({
        success: false,
        subscription_status: subStatus || 'INITIALIZED',
        subscription_id: data.subscription_id,
        message: `Subscription status is ${subStatus || 'INITIALIZED'}. Mandate authorization requires customer completion.`,
        api_endpoint: `${baseUrl}/subscriptions/${subscription_id}`
      });
    }
  } catch (error: any) {
    console.error('Verify subscription error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error verifying subscription' });
  }
}
