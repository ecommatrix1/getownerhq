-- 1. Gyms Table
CREATE TABLE public.gyms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL,
    owner_name TEXT,
    owner_mobile TEXT,
    upi_id TEXT,
    tagline TEXT,
    subscription_status TEXT DEFAULT 'trial',
    subscription_plan TEXT DEFAULT 'Starter',
    trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '14 days'),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Gyms
CREATE INDEX idx_gyms_owner_id ON public.gyms(owner_user_id);
CREATE INDEX idx_gyms_slug ON public.gyms(slug);

-- RLS for Gyms
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view their own gym" ON public.gyms FOR SELECT USING (auth.uid() = owner_user_id);
CREATE POLICY "Owners can update their own gym" ON public.gyms FOR UPDATE USING (auth.uid() = owner_user_id);
CREATE POLICY "Public can view gym by slug" ON public.gyms FOR SELECT USING (true);

-- 🚀 OPTIMIZATION: SECURITY DEFINER FUNCTION FOR RLS
-- This prevents the O(N) nested loop subquery performance crash at 10,000+ users
CREATE OR REPLACE FUNCTION public.get_auth_gym_id()
RETURNS SETOF UUID AS $$
  SELECT id FROM public.gyms WHERE owner_user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Gym Plans Table
CREATE TABLE public.gym_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    duration_months INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_plans_gym_id ON public.gym_plans(gym_id);

ALTER TABLE public.gym_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view plans" ON public.gym_plans FOR SELECT USING (true);
CREATE POLICY "Owners can insert plans" ON public.gym_plans FOR INSERT WITH CHECK (
    gym_id IN (SELECT public.get_auth_gym_id())
);
CREATE POLICY "Owners can delete plans" ON public.gym_plans FOR DELETE USING (
    gym_id IN (SELECT public.get_auth_gym_id())
);

-- 3. Members Table
CREATE TABLE public.members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    plan_id UUID REFERENCES public.gym_plans(id),
    start_date DATE,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (gym_id, mobile)
);

CREATE INDEX idx_members_gym_id ON public.members(gym_id);
CREATE INDEX idx_members_mobile ON public.members(mobile);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can self-register" ON public.members FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can view members" ON public.members FOR SELECT USING (
    gym_id IN (SELECT public.get_auth_gym_id())
);
CREATE POLICY "Owners can update members" ON public.members FOR UPDATE USING (
    gym_id IN (SELECT public.get_auth_gym_id())
);

-- 4. Payments Table
CREATE TABLE public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.gym_plans(id) NOT NULL,
    amount NUMERIC NOT NULL,
    payment_mode TEXT NOT NULL,
    receipt_number TEXT NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payments_gym_id ON public.payments(gym_id);
CREATE INDEX idx_payments_member_id ON public.payments(member_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view payments" ON public.payments FOR SELECT USING (
    gym_id IN (SELECT public.get_auth_gym_id())
);
CREATE POLICY "Owners can insert payments" ON public.payments FOR INSERT WITH CHECK (
    gym_id IN (SELECT public.get_auth_gym_id())
);
