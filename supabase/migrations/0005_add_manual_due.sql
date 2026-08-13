-- Create RPC to add or edit manual dues
CREATE OR REPLACE FUNCTION public.add_manual_due(
    p_member_id UUID,
    p_amount NUMERIC
)
RETURNS JSON AS $$
DECLARE
    v_gym_id UUID;
    v_member_gym_id UUID;
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

    -- 3. Update Member Dues (Add the amount, which can be negative to reduce)
    UPDATE public.members
    SET outstanding_dues = GREATEST(0, COALESCE(outstanding_dues, 0) + p_amount)
    WHERE id = p_member_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Dues updated successfully.'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
