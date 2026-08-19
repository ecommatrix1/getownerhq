import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const payload = req.body || {};
    console.log('Cashfree Subscription Webhook Received:', JSON.stringify(payload));

    const subData = payload.data?.subscription || payload.subscription || payload.data;
    const customerData = payload.data?.customer_details || payload.customer_details;

    if (subData && (subData.subscription_id || payload.subscription_id)) {
      const subStatus = (subData.subscription_status || payload.type || payload.event || '').toUpperCase();
      const gymId = customerData?.customer_id || subData.customer_id;

      if (gymId && (subStatus.includes('ACTIVE') || subStatus.includes('SUCCESS') || subStatus.includes('CHARGED'))) {
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ydmrupmxtyyecykpxitb.supabase.co';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Mt6ZI4t0oJrto5x1uu6RvQ_GhTnZOK-';
        const supabase = createClient(supabaseUrl, supabaseKey);

        const amount = Number(subData.recurring_amount || subData.authorization_amount || 0);
        const planName = amount >= 999 ? 'Growth' : 'Starter';

        await supabase
          .from('gyms')
          .update({
            subscription_status: 'active',
            subscription_plan: planName
          })
          .eq('id', gymId);
      }
    }

    return res.status(200).json({ status: 'OK' });
  } catch (err: any) {
    console.error('Subscription webhook processing error:', err);
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
}
