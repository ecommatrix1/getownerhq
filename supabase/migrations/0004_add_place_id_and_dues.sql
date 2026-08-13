-- 1. Add google_place_id to gyms
ALTER TABLE public.gyms ADD COLUMN google_place_id TEXT;

-- 2. Add outstanding_dues to members
ALTER TABLE public.members ADD COLUMN outstanding_dues NUMERIC(10,2) DEFAULT 0;

-- 3. Create RPC to refresh outstanding_dues
-- For every member whose status is 'expired' and NOT yet 'lost' (i.e. <= 90 days expired),
-- outstanding_dues = plan_price * LEAST(3, FLOOR(days_since_expiry / 30))
CREATE OR REPLACE FUNCTION public.refresh_outstanding_dues()
RETURNS JSON AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    WITH updated AS (
        UPDATE public.members m
        SET outstanding_dues = (
            SELECT gp.price * LEAST(3, FLOOR(EXTRACT(DAY FROM (now() - m.expiry_date)) / 30))
            FROM public.gym_plans gp
            WHERE gp.id = m.current_plan_id
        )
        WHERE m.expiry_date < now() 
          AND (now() - m.expiry_date) <= interval '90 days'
          AND m.current_plan_id IS NOT NULL
        RETURNING id
    )
    SELECT count(*) INTO v_updated_count FROM updated;

    RETURN json_build_object(
        'success', true,
        'message', 'Dues refreshed successfully',
        'updated_count', v_updated_count
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Create RPC to record partial payment
CREATE OR REPLACE FUNCTION public.record_partial_payment(
    p_member_id UUID,
    p_amount NUMERIC,
    p_payment_mode TEXT
)
RETURNS JSON AS $$
DECLARE
    v_gym_id UUID;
    v_member_gym_id UUID;
    v_plan_id UUID;
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
    SELECT gym_id, current_plan_id INTO v_member_gym_id, v_plan_id
    FROM public.members
    WHERE id = p_member_id;

    IF v_member_gym_id IS NULL OR v_member_gym_id != v_gym_id THEN
        RETURN json_build_object('success', false, 'message', 'Member not found or unauthorized.');
    END IF;

    -- 3. Update Member Dues
    UPDATE public.members
    SET outstanding_dues = GREATEST(0, outstanding_dues - p_amount)
    WHERE id = p_member_id;

    -- 4. Generate Receipt Number
    v_receipt_number := 'REC-' || floor(extract(epoch from now()))::text || floor(random() * 1000)::text;

    -- 5. Insert Payment
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
        v_plan_id,
        p_amount,
        p_payment_mode,
        v_receipt_number,
        now()
    );

    RETURN json_build_object(
        'success', true,
        'message', 'Partial payment recorded successfully.',
        'receipt_number', v_receipt_number
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. Update activate_member_plan to reset dues
CREATE OR REPLACE FUNCTION public.activate_member_plan(
    p_member_id UUID,
    p_plan_id UUID,
    p_start_date DATE,
    p_expiry_date DATE,
    p_amount_paid NUMERIC,
    p_payment_mode TEXT
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

    -- 4. Update Member (Reset dues to 0)
    UPDATE public.members
    SET 
        status = 'active',
        current_plan_id = p_plan_id,
        start_date = p_start_date,
        expiry_date = p_expiry_date,
        amount_paid = p_amount_paid,
        payment_mode = p_payment_mode,
        outstanding_dues = 0
    WHERE id = p_member_id;

    -- 5. Generate Receipt Number
    v_receipt_number := 'REC-' || floor(extract(epoch from now()))::text || floor(random() * 1000)::text;

    -- 6. Insert Payment
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

    RETURN json_build_object(
        'success', true,
        'message', 'Plan activated successfully.',
        'receipt_number', v_receipt_number
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
