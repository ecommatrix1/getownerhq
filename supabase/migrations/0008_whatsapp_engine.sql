-- ==============================================================================
-- 0008_whatsapp_engine.sql
-- ADDITIVE MIGRATION: Official WhatsApp Multi-Tenant Automation Engine
-- Safe: Does NOT modify any existing tables (gyms, members, payments remain untouched)
-- ==============================================================================

-- 1. WHATSAPP ACCOUNTS (Per-Gym OAuth / Embedded Signup Credentials)
CREATE TABLE IF NOT EXISTS public.whatsapp_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL UNIQUE,
    waba_id TEXT NOT NULL,
    phone_number_id TEXT NOT NULL UNIQUE,
    display_phone_number TEXT,
    verified_name TEXT,
    meta_access_token TEXT NOT NULL, -- Encrypted / Restricted System User Token
    token_type TEXT DEFAULT 'user_long_lived' CHECK (token_type IN ('user_long_lived', 'system')),
    token_expires_at TIMESTAMPTZ,    -- Expiration timestamp for user-delegated tokens (~60 days)
    account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'disconnected', 'revoked')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wa_accounts_gym_id ON public.whatsapp_accounts(gym_id);
CREATE INDEX IF NOT EXISTS idx_wa_accounts_phone_number_id ON public.whatsapp_accounts(phone_number_id);

-- 2. WHATSAPP INBOUND EVENTS (Durable Webhook Storage + Concurrency Locking)
CREATE TABLE IF NOT EXISTS public.whatsapp_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
    provider_event_id TEXT UNIQUE, -- Meta wamid or unique webhook change ID
    event_type TEXT NOT NULL,      -- 'messages', 'message_status', 'template_status'
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed', 'dead')),
    locked_at TIMESTAMPTZ,
    locked_by TEXT,
    lease_until TIMESTAMPTZ,       -- Dynamic lease expiration timestamp
    attempt_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_wa_events_status_lease ON public.whatsapp_events(status, lease_until);
CREATE INDEX IF NOT EXISTS idx_wa_events_gym_id ON public.whatsapp_events(gym_id);

-- 3. WHATSAPP OUTBOUND MESSAGES (Delivery Lifecycle & Idempotency Tracking)
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    recipient_phone TEXT NOT NULL, -- Normalized E.164 (e.g. 919876543210)
    template_name TEXT,
    template_language TEXT DEFAULT 'en',
    idempotency_key TEXT UNIQUE,   -- Deterministic SHA-256 (gym_id + member_id + trigger + date_window)
    wamid TEXT UNIQUE,             -- Meta returned WhatsApp message ID
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'sending', 'sent', 'delivered', 'read', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wa_messages_gym_id ON public.whatsapp_messages(gym_id);
CREATE INDEX IF NOT EXISTS idx_wa_messages_wamid ON public.whatsapp_messages(wamid);
CREATE INDEX IF NOT EXISTS idx_wa_messages_idempotency ON public.whatsapp_messages(idempotency_key);

-- 4. AUTOMATION JOBS (Scheduled Expiry & Welcome Queue)
CREATE TABLE IF NOT EXISTS public.automation_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    job_type TEXT NOT NULL CHECK (job_type IN ('expiry_reminder_3d', 'expiry_reminder_1d', 'expiry_expired', 'welcome_registration')),
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    locked_at TIMESTAMPTZ,
    locked_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_jobs_queue ON public.automation_jobs(status, scheduled_for);

-- ==============================================================================
-- 5. ATOMIC QUEUE CLAIM RPC (FOR UPDATE SKIP LOCKED + 5-MIN STALE RECOVERY)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.claim_whatsapp_events_batch(
    batch_size INT, 
    worker_id TEXT, 
    lease_duration_seconds INT DEFAULT 60
)
RETURNS SETOF public.whatsapp_events AS $$
BEGIN
    RETURN QUERY
    UPDATE public.whatsapp_events
    SET status = 'processing',
        locked_at = now(),
        locked_by = worker_id,
        lease_until = now() + (COALESCE(lease_duration_seconds, 60) || ' seconds')::INTERVAL,
        attempt_count = whatsapp_events.attempt_count + 1
    WHERE id IN (
        SELECT id FROM public.whatsapp_events
        WHERE status = 'pending'
           OR (status = 'processing' AND (lease_until IS NULL OR lease_until < now()))
        ORDER BY created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT batch_size
    )
    RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.whatsapp_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_jobs ENABLE ROW LEVEL SECURITY;

-- whatsapp_accounts: Only the gym owner can view/manage their account
CREATE POLICY "Owners can view own whatsapp account"
    ON public.whatsapp_accounts FOR SELECT
    USING (gym_id IN (SELECT public.get_auth_gym_id()));

CREATE POLICY "Owners can update own whatsapp account"
    ON public.whatsapp_accounts FOR UPDATE
    USING (gym_id IN (SELECT public.get_auth_gym_id()));

-- whatsapp_messages: Gym owners can view outbound message logs
CREATE POLICY "Owners can view own whatsapp messages"
    ON public.whatsapp_messages FOR SELECT
    USING (gym_id IN (SELECT public.get_auth_gym_id()));

-- whatsapp_events: Gym owners can view their incoming/status event logs
CREATE POLICY "Owners can view own whatsapp events"
    ON public.whatsapp_events FOR SELECT
    USING (gym_id IN (SELECT public.get_auth_gym_id()));

-- automation_jobs: Gym owners can view scheduled automations
CREATE POLICY "Owners can view own automation jobs"
    ON public.automation_jobs FOR SELECT
    USING (gym_id IN (SELECT public.get_auth_gym_id()));
