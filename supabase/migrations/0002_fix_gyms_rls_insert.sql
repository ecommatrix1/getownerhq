-- 0002_fix_gyms_rls_insert.sql
-- Fixes the RLS issue where new owners could not insert their gym during signup.

ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;

-- 1. Drop existing policies if needed (Optional, depending on if you want to replace them, but we are only adding INSERT)
-- DROP POLICY IF EXISTS "Owners can insert their own gym" ON public.gyms;

-- 2. Create the INSERT policy that restricts creation to one gym per authenticated user
CREATE POLICY "Owners can insert their own gym" ON public.gyms
FOR INSERT
WITH CHECK (
    auth.uid() = owner_user_id AND
    NOT EXISTS (
        SELECT 1 FROM public.gyms 
        WHERE owner_user_id = auth.uid()
    )
);
