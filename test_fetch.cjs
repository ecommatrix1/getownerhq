const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ydmrupmxtyyecykpxitb.supabase.co',
  'sb_publishable_Mt6ZI4t0oJrto5x1uu6RvQ_GhTnZOK-'
);

async function runTest() {
  const { data: signInData } = await supabase.auth.signInWithPassword({
    email: 'test_1723097143444@example.com', // wait, let's just sign up a new user and create a gym and member
    password: 'password123'
  });
  
  const email = `test_debug_${Date.now()}@example.com`;
  const { data: authData } = await supabase.auth.signUp({ email, password: 'password123' });
  await new Promise(res => setTimeout(res, 1000));
  
  const { data: gym } = await supabase.from('gyms').insert({
    owner_user_id: authData.user.id,
    name: "Debug Gym",
    slug: `debug-gym-${Date.now()}`
  }).select().single();
  
  const { data: member } = await supabase.from('members').insert({
    gym_id: gym.id,
    full_name: "Pending Member",
    mobile: "8888888888",
    status: "pending"
  }).select().single();
  
  console.log("Member Columns:", Object.keys(member));
}

runTest().catch(console.error);
