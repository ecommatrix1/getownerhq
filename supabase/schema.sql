-- getOwnerHQ Postgres / Supabase Database Schema
-- Run this script in the Supabase SQL Editor to set up tables, RLS policies, and functions.

-- 1. GYMS TABLE
CREATE TABLE IF NOT EXISTS public.gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  city TEXT,
  tagline TEXT,
  owner_name TEXT,
  owner_mobile TEXT,
  upi_id TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled')),
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '14 days'),
  subscription_plan TEXT DEFAULT 'Starter',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. GYM PLANS TABLE
CREATE TABLE IF NOT EXISTS public.gym_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_months INT NOT NULL CHECK (duration_months > 0),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expiring', 'expired')),
  plan_id UUID REFERENCES public.gym_plans(id) ON DELETE SET NULL,
  start_date DATE,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_gym_member_mobile UNIQUE (gym_id, mobile)
);

-- 4. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.gym_plans(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('Cash', 'UPI', 'Card', 'Bank Transfer')),
  receipt_number TEXT NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. REMINDER LOGS TABLE
CREATE TABLE IF NOT EXISTS public.reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR GYMS
CREATE POLICY "Owners can view their own gym" ON public.gyms
  FOR SELECT USING (auth.uid() = owner_user_id);

CREATE POLICY "Owners can insert their own gym" ON public.gyms
  FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Owners can update their own gym" ON public.gyms
  FOR UPDATE USING (auth.uid() = owner_user_id);

-- PUBLIC GYM SLUG LOOKUP POLICY (Allow anonymous lookup for QR self-registration page)
CREATE POLICY "Public can view basic gym slug info" ON public.gyms
  FOR SELECT USING (true);

-- RLS POLICIES FOR GYM_PLANS
CREATE POLICY "Owners can manage gym plans" ON public.gym_plans
  FOR ALL USING (
    gym_id IN (SELECT id FROM public.gyms WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Public can view plans for QR registration" ON public.gym_plans
  FOR SELECT USING (true);

-- RLS POLICIES FOR MEMBERS
CREATE POLICY "Owners can manage their gym members" ON public.members
  FOR ALL USING (
    gym_id IN (SELECT id FROM public.gyms WHERE owner_user_id = auth.uid())
  );

-- PUBLIC QR INSERT POLICY (Anonymous users can self-register with status='pending')
CREATE POLICY "Public anonymous insert pending member" ON public.members
  FOR INSERT WITH CHECK (status = 'pending');

-- RLS POLICIES FOR PAYMENTS
CREATE POLICY "Owners can manage gym payments" ON public.payments
  FOR ALL USING (
    gym_id IN (SELECT id FROM public.gyms WHERE owner_user_id = auth.uid())
  );

-- RLS POLICIES FOR REMINDER LOGS
CREATE POLICY "Owners can manage reminder logs" ON public.reminder_logs
  FOR ALL USING (
    gym_id IN (SELECT id FROM public.gyms WHERE owner_user_id = auth.uid())
  );

-- FUNCTION: Refresh member status daily
CREATE OR REPLACE FUNCTION refresh_member_statuses()
RETURNS void AS $$
BEGIN
  -- Mark as expired if expiry_date has passed
  UPDATE public.members
  SET status = 'expired'
  WHERE expiry_date < CURRENT_DATE AND status != 'pending';

  -- Mark as expiring if expiry_date is within 3 days (inclusive of today)
  UPDATE public.members
  SET status = 'expiring'
  WHERE expiry_date >= CURRENT_DATE AND expiry_date <= (CURRENT_DATE + INTERVAL '3 days') AND status != 'pending';

  -- Mark as active otherwise
  UPDATE public.members
  SET status = 'active'
  WHERE expiry_date > (CURRENT_DATE + INTERVAL '3 days') AND status != 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- pg_cron daily schedule (uncomment if pg_cron is enabled on Supabase project)
-- SELECT cron.schedule('0 0 * * *', 'SELECT refresh_member_statuses()');
