const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ydmrupmxtyyecykpxitb.supabase.co',
  'sb_publishable_Mt6ZI4t0oJrto5x1uu6RvQ_GhTnZOK-'
);

async function runTest() {
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'test_1723097143444@example.com', // Let's use the one we created earlier
    password: 'password123'
  });
  
  const { data, error } = await supabase.rpc('activate_member_plan', {
      p_member_id: 'febfe73f-8613-4e3a-8d28-4c8b8c349c92',
      p_plan_id: '123e4567-e89b-12d3-a456-426614174000',
      p_start_date: '2026-08-01',
      p_expiry_date: '2026-09-01',
      p_amount_paid: 1000,
      p_payment_mode: 'UPI'
  });
  console.log(error);
}

runTest().catch(console.error);
