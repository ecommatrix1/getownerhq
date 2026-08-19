import { supabase } from "./supabase";
import { Gym, GymPlan, Member, Payment, WhatsAppTemplate } from "../types";

export const DEFAULT_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: "tpl-1",
    title: "Stage 1: Renewal Reminder",
    category: "reminder",
    body: "Hi {member_name}! Your membership at {gym_name} is expiring on {expiry_date}. We'd love to have you continue training with us — renew anytime at the front desk or via UPI: {upi_id}. See you soon!",
  },
  {
    id: "tpl-2",
    title: "Stage 2: Payment Confirmation",
    category: "payment-confirmation",
    body: "Thanks for renewing at {gym_name}, {member_name}! Your {plan_name} is now active until {expiry_date}. Receipt: {receipt_number}. See you at the gym!",
  },
  {
    id: "tpl-3",
    title: "Stage 3: Review Request",
    category: "review-request",
    body: "Hey {member_name}, thanks for renewing at {gym_name}! If you've enjoyed training with us, we'd really appreciate a quick, honest review — it helps other people in {city} find us. {google_review_link}",
  },
];

export const api = {
  // --- AUTH & GYM PROFILE ---
  async getCurrentGym(): Promise<Gym | null> {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) return null;

    const userId = sessionData.session.user.id;
    const userEmail = sessionData.session.user.email || 'owner@gym.com';

    const { data, error } = await supabase
      .from("gyms")
      .select("*")
      .eq("owner_user_id", userId)
      .maybeSingle();

    if (!error && data) {
      return data as Gym;
    }

    // Auto-Recovery: If authenticated user has an auth account but missing gym profile row
    console.warn("[getCurrentGym] Authenticated user missing gym profile row. Creating auto-recovery profile...");
    const gymName = userEmail.split('@')[0].toUpperCase() + " GYM";
    const baseSlug = gymName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${baseSlug || 'my-gym'}-${Date.now().toString().slice(-4)}`;

    const { data: newGym, error: insertError } = await supabase
      .from("gyms")
      .insert({
        owner_user_id: userId,
        name: gymName,
        slug: slug,
        city: 'Main Branch',
        owner_name: 'Gym Owner',
        owner_mobile: '9999999999',
        subscription_status: 'trial',
        subscription_plan: 'Starter'
      })
      .select()
      .single();

    if (!insertError && newGym) {
      return newGym as Gym;
    }

    return null;
  },

  async getGymBySlug(slug: string): Promise<Gym | null> {
    const cleanSlug = decodeURIComponent(slug || '').trim().replace(/\/+$/, '').toLowerCase();
    if (!cleanSlug) return null;

    try {
      const { data, error } = await supabase
        .from("gyms")
        .select("*")
        .ilike("slug", cleanSlug)
        .maybeSingle();

      if (!error && data) {
        return data as Gym;
      }
    } catch (e) {
      console.warn("Supabase getGymBySlug fallback engaged:", e);
    }

    // Dynamic Fallback: If DB query returns null or RLS restricts anon select, generate Gym from slug
    const formattedName = cleanSlug
      .split(/[-_]+/)
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      id: `gym-${cleanSlug}`,
      owner_user_id: 'owner-public',
      name: formattedName || 'Fitness Club',
      city: 'Fitness Center',
      slug: cleanSlug,
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      subscription_status: 'active',
      subscription_plan: 'Growth',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Gym;
  },

  async signUpOwner(
    email: string,
    pass: string,
    gymName: string,
    city: string,
  ) {
    const cleanEmail = email.trim().toLowerCase();
    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: pass,
    });

    if (authError) return { success: false, message: authError.message };
    if (!authData.user)
      return { success: false, message: "Signup failed. No user returned." };

    // Debug logs for RLS issue
    console.log("[SignUp] authData.user.id:", authData.user.id);
    console.log(
      "[SignUp] authData.session:",
      authData.session ? "Exists" : "NULL",
    );

    // CRITICAL FIX: If email confirmation is ON, Supabase doesn't log the user in immediately.
    // The insert will fail RLS because there is no session token.
    // In test modes, we can force login or we must tell the user to confirm email first.
    // To ensure the insert works if session is missing, we would need a trigger, but since we are client-side:
    if (!authData.session) {
      console.warn(
        '[SignUp] No active session returned! Check Supabase "Confirm email" settings. RLS insert will fail without a session.',
      );
      // Attempt to sign in directly (if email confirm is off but session didn't stick)
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password: pass });
      if (signInError || !signInData.session) {
        return {
          success: false,
          message:
            "Signup succeeded but login failed (Please confirm your email first).",
        };
      }
      console.log("[SignUp] Forced sign-in successful. Session exists.");
    }

    // Generate slug
    const baseSlug = gymName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    let slug = baseSlug || "my-gym";
    let counter = 1;
    while (true) {
      const { data: existing } = await supabase
        .from("gyms")
        .select("id")
        .eq("slug", slug)
        .single();
      if (!existing) break;
      slug = `${baseSlug}-${counter++}`;
    }

    const payload = {
      owner_user_id: authData.user.id,
      name: gymName.trim(),
      slug,
      city: city.trim(),
      owner_name: email.split("@")[0],
    };

    console.log("[SignUp] Gym Insert Payload:", payload);

    // 2. Insert Gym record
    const { data: gymData, error: gymError } = await supabase
      .from("gyms")
      .insert(payload)
      .select()
      .single();

    if (gymError || !gymData) {
      console.error("[SignUp] Gym Insert Error:", gymError);
      return {
        success: false,
        message: gymError?.message || "Failed to create gym profile",
      };
    }

    // 3. Insert Default Plans
    await supabase.from("gym_plans").insert([
      {
        gym_id: gymData.id,
        name: "Monthly Membership",
        duration_months: 1,
        price: 1200,
      },
      {
        gym_id: gymData.id,
        name: "Quarterly Saver",
        duration_months: 3,
        price: 3200,
      },
      {
        gym_id: gymData.id,
        name: "Annual Gold Pass",
        duration_months: 12,
        price: 10000,
      },
    ]);

    return {
      success: true,
      message: "Gym account created successfully!",
      gym: gymData as Gym,
    };
  },

  async signInOwner(email: string, pass: string) {
    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: pass,
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Logged in successfully" };
  },

  async signOutOwner() {
    await supabase.auth.signOut();
  },

  // --- MEMBERS ---
  async getMembers(gymId: string): Promise<Member[]> {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("gym_id", gymId)
      .order("registered_at", { ascending: false })
      .limit(3000);

    if (error) {
      console.error("Error fetching members:", error);
      return [];
    }
    return data as Member[];
  },

  async updateMemberDetails(
    memberId: string,
    updates: { full_name?: string; mobile?: string; start_date?: string }
  ) {
    const { data, error } = await supabase
      .from("members")
      .update(updates)
      .eq("id", memberId)
      .select()
      .single();

    if (error) {
      console.error("Error updating member details:", error);
      return { success: false, message: error.message };
    }
    return { success: true, member: data as Member };
  },

  async deleteMember(memberId: string) {
    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", memberId);

    if (error) {
      console.error("Error deleting member:", error);
      return { success: false, message: error.message };
    }
    return { success: true, message: "Member deleted successfully." };
  },

  async registerMemberPublic(
    gymId: string,
    fullName: string,
    mobile: string,
    joinDate?: string,
  ) {
    const cleanMobile = mobile.replace(/\D/g, "");
    const { data, error } = await supabase
      .from("members")
      .insert({
        gym_id: gymId,
        full_name: fullName.trim(),
        mobile: cleanMobile,
        status: "pending",
        start_date: joinDate || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return {
          success: false,
          message:
            "This mobile number is already registered at this gym. Please speak to reception to activate your pass.",
        };
      }
      console.error("[Public Registration] Insert failed:", error.message);
      return {
        success: false,
        message: "Registration could not be saved. Please try again or ask reception to add you manually.",
      };
    }

    return {
      success: true,
      message: "Registration successful!",
      member: data as Member,
    };
  },

  async addMemberManual(gymId: string, fullName: string, mobile: string) {
    return this.registerMemberPublic(gymId, fullName, mobile);
  },

  async recordPartialPayment(
    memberId: string,
    amount: number,
    paymentMode: string,
    txnRef?: string
  ) {
    const { data, error } = await supabase.rpc("record_partial_payment", {
      p_member_id: memberId,
      p_amount: amount,
      p_payment_mode: paymentMode,
      p_txn_ref: txnRef || null,
    });
    if (error) return { success: false, message: error.message };
    return data as { success: boolean; message: string; receipt_number?: string };
  },

  async addManualDue(
    memberId: string,
    amount: number
  ) {
    const { data, error } = await supabase.rpc("add_manual_due", {
      p_member_id: memberId,
      p_amount: amount,
    });
    if (error) return { success: false, message: error.message };
    return data as { success: boolean; message: string };
  },

  async activateMemberPlan(
    memberId: string,
    planId: string,
    startDate: string,
    expiryDate: string,
    amountPaid: number,
    paymentMode: string,
    newDues: number = 0,
    txnRef?: string
  ) {
    const { data, error } = await supabase.rpc("activate_member_plan", {
      p_member_id: memberId,
      p_plan_id: planId,
      p_start_date: startDate,
      p_expiry_date: expiryDate,
      p_amount_paid: amountPaid,
      p_payment_mode: paymentMode,
      p_new_dues: newDues,
      p_txn_ref: txnRef || null
    });

    if (error) {
      console.error("activate_member_plan failed:", error);
      return {
        success: false,
        message: error.message || "Failed to activate member plan.",
      };
    }

    const result = data as {
      success?: boolean;
      receipt_number?: string;
      message?: string;
    } | null;

    if (!result?.success || !result.receipt_number) {
      return {
        success: false,
        message: result?.message || "Failed to activate member plan.",
      };
    }

    return {
      success: true,
      message: result.message || `Plan activated! Receipt ${result.receipt_number} generated.`,
      receiptNumber: result.receipt_number,
    };
  },

  // --- PLANS ---
  async getGymPlans(gymId: string): Promise<GymPlan[]> {
    const defaultPlans: GymPlan[] = [
      {
        id: `plan-m-${gymId}`,
        gym_id: gymId,
        name: "Monthly Membership",
        duration_months: 1,
        price: 1200,
        created_at: new Date().toISOString(),
      },
      {
        id: `plan-q-${gymId}`,
        gym_id: gymId,
        name: "Quarterly Saver",
        duration_months: 3,
        price: 3200,
        created_at: new Date().toISOString(),
      },
      {
        id: `plan-a-${gymId}`,
        gym_id: gymId,
        name: "Annual Gold Pass",
        duration_months: 12,
        price: 10000,
        created_at: new Date().toISOString(),
      },
    ];

    try {
      const { data, error } = await supabase
        .from("gym_plans")
        .select("*")
        .eq("gym_id", gymId)
        .order("price", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as GymPlan[];
      }

      // Auto-seed default plans if empty
      const payload = [
        { gym_id: gymId, name: "Monthly Membership", duration_months: 1, price: 1200 },
        { gym_id: gymId, name: "Quarterly Saver", duration_months: 3, price: 3200 },
        { gym_id: gymId, name: "Annual Gold Pass", duration_months: 12, price: 10000 },
      ];

      const { data: inserted, error: seedError } = await supabase
        .from("gym_plans")
        .insert(payload)
        .select();

      if (!seedError && inserted && inserted.length > 0) {
        return inserted as GymPlan[];
      }
    } catch (e) {
      console.warn("[getGymPlans] Fallback to default plans engaged:", e);
    }

    return defaultPlans;
  },

  async addPlan(
    gymId: string,
    name: string,
    duration_months: number,
    price: number,
  ) {
    const { data, error } = await supabase
      .from("gym_plans")
      .insert({ gym_id: gymId, name, duration_months, price })
      .select()
      .single();
    return { success: !error, data: data as GymPlan, message: error?.message };
  },

  async deletePlan(planId: string) {
    const { error } = await supabase
      .from("gym_plans")
      .delete()
      .eq("id", planId);
    return { success: !error, message: error?.message };
  },

  // --- PAYMENTS ---
  async getPayments(gymId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("gym_id", gymId)
        .limit(3000);

      if (error || !data) return [];

      // Map payment_date / created_at / paid_at to paid_at & created_at for frontend
      const mapped = data.map((p: any) => ({
        ...p,
        paid_at: p.paid_at || p.payment_date || p.created_at || new Date().toISOString(),
        created_at: p.created_at || p.payment_date || p.paid_at || new Date().toISOString(),
      }));

      // Sort descending by date
      mapped.sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime());
      return mapped as Payment[];
    } catch (e) {
      console.warn("[getPayments] Error fetching payments:", e);
      return [];
    }
  },

  // --- SETTINGS ---
  async updateGymProfile(gymId: string, updates: Partial<Gym>) {
    const { error } = await supabase
      .from("gyms")
      .update(updates)
      .eq("id", gymId);
    return { success: !error, message: error?.message };
  },
};
