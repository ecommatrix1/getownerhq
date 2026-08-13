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
