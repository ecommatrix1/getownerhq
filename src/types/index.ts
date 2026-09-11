export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled';
export type MemberStatus = 'pending' | 'active' | 'expiring' | 'expired';
export type PaymentMode = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';

export interface Gym {
  id: string;
  owner_user_id: string;
  name: string;
  slug: string;
  city: string;
  tagline?: string;
  owner_name?: string;
  owner_mobile?: string;
  upi_id?: string;
  google_place_id?: string;
  subscription_status: SubscriptionStatus;
  trial_ends_at: string;
  subscription_plan: string;
  created_at: string;
}

export interface GymPlan {
  id: string;
  gym_id: string;
  name: string;
  duration_months: number;
  price: number;
  created_at: string;
}

export interface Member {
  id: string;
  gym_id: string;
  full_name: string;
  mobile: string;
  status: MemberStatus;
  plan_id?: string | null;
  current_plan_id?: string | null;
  start_date?: string | null;
  expiry_date?: string | null;
  amount_paid?: number;
  payment_mode?: PaymentMode;
  outstanding_dues?: number;
  registered_at: string;
}

export interface Payment {
  id: string;
  gym_id: string;
  member_id: string;
  plan_name?: string | null;
  amount: number;
  payment_mode: PaymentMode;
  receipt_number: string;
  paid_at: string;
  created_at: string;
  txn_ref?: string | null;
}

export interface ReminderLog {
  id: string;
  gym_id: string;
  member_id: string;
  reminder_type: string;
  sent_at: string;
}

export interface WhatsAppTemplate {
  id: string;
  title: string;
  category: 'reminder' | 'payment-confirmation' | 'review-request';
  body: string;
}

export interface WhatsAppAccount {
  id: string;
  gym_id: string;
  waba_id: string;
  phone_number_id: string;
  display_phone_number?: string;
  verified_name?: string;
  token_type?: 'user_long_lived' | 'system';
  token_expires_at?: string | null;
  account_status: 'active' | 'disconnected' | 'revoked';
  created_at: string;
  updated_at: string;
}

export interface WhatsAppEvent {
  id: string;
  gym_id?: string | null;
  provider_event_id?: string | null;
  event_type: string;
  payload: Record<string, any>;
  status: 'pending' | 'processing' | 'processed' | 'failed' | 'dead';
  attempt_count: number;
  last_error?: string | null;
  created_at: string;
  processed_at?: string | null;
}

export interface WhatsAppMessage {
  id: string;
  gym_id: string;
  member_id?: string | null;
  recipient_phone: string;
  template_name?: string | null;
  template_language: string;
  idempotency_key?: string | null;
  wamid?: string | null;
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  error_message?: string | null;
  sent_at?: string | null;
  delivered_at?: string | null;
  read_at?: string | null;
  created_at: string;
}

export interface AutomationJob {
  id: string;
  gym_id: string;
  member_id: string;
  job_type: 'expiry_reminder_3d' | 'expiry_reminder_1d' | 'expiry_expired' | 'welcome_registration';
  scheduled_for: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}
