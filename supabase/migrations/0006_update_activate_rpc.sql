-- Update activate_member_plan to accept p_new_dues and set it correctly
DROP FUNCTION IF EXISTS public.activate_member_plan(UUID, UUID, DATE, DATE, NUMERIC, TEXT);

CREATE OR REPLACE FUNCTION public.activate_member_plan(
    p_member_id UUID,
    p_plan_id UUID,
    p_start_date DATE,
    p_expiry_date DATE,
    p_amount_paid NUMERIC,
    p_payment_mode TEXT,
    p_new_dues NUMERIC DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
    v_gym_id UUID;
    v_member_gym_id UUID;
    v_plan_gym_id UUID;
    v_plan_name TEXT;
    v_receipt_number TEXT;
BEGIN
    -- 1. Get authenticated user's gym
    SELECT id INTO v_gym_id
    FROM public.gyms
    WHERE owner_user_id = auth.uid()
    LIMIT 1;

    IF v_gym_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Gym not found or unauthorized.');
    END IF;

    -- 2. Verify member belongs to this gym
    SELECT gym_id INTO v_member_gym_id
    FROM public.members
    WHERE id = p_member_id;

    IF v_member_gym_id IS NULL OR v_member_gym_id != v_gym_id THEN
        RETURN json_build_object('success', false, 'message', 'Member not found or unauthorized.');
    END IF;

    -- 3. Verify plan belongs to this gym
    SELECT gym_id, name INTO v_plan_gym_id, v_plan_name
    FROM public.gym_plans
    WHERE id = p_plan_id;

    IF v_plan_gym_id IS NULL OR v_plan_gym_id != v_gym_id THEN
        RETURN json_build_object('success', false, 'message', 'Plan not found or unauthorized.');
    END IF;

    -- 4. Update Member with the new calculated dues
    UPDATE public.members
    SET 
        status = 'active',
        current_plan_id = p_plan_id,
        start_date = p_start_date,
        expiry_date = p_expiry_date,
        amount_paid = p_amount_paid,
        payment_mode = p_payment_mode,
        outstanding_dues = GREATEST(0, p_new_dues)
    WHERE id = p_member_id;

    -- 5. Generate Receipt Number
    v_receipt_number := 'REC-' || floor(extract(epoch from now()))::text || floor(random() * 1000)::text;

    -- 6. Insert Payment if they paid something
    IF p_amount_paid > 0 THEN
        INSERT INTO public.payments (
            gym_id,
            member_id,
            plan_id,
            amount,
            payment_mode,
            receipt_number,
            payment_date
        ) VALUES (
            v_gym_id,
            p_member_id,
            p_plan_id,
            p_amount_paid,
            p_payment_mode,
            v_receipt_number,
            now()
        );
    END IF;

    RETURN json_build_object(
        'success', true,
        'message', 'Plan activated successfully.',
        'receipt_number', v_receipt_number
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
