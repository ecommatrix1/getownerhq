export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const { gym_id, plan_name, amount, owner_name, owner_email, owner_mobile } =
      req.body || {};

    if (!gym_id || !plan_name || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters (gym_id, plan_name, amount)",
      });
    }

    const clientId =
      process.env.CASHFREE_CLIENT_ID || process.env.VITE_CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
    const mode =
      process.env.CASHFREE_MODE ||
      process.env.CASHFREE_ENV ||
      (process.env.NODE_ENV === "production" ? "production" : "sandbox");

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        success: false,
        message:
          "Cashfree API credentials (CASHFREE_CLIENT_ID / CASHFREE_CLIENT_SECRET) are not configured on server environment variables.",
      });
    }

    const baseUrl =
      mode === "production"
        ? "https://api.cashfree.com/pg"
        : "https://sandbox.cashfree.com/pg";

    const growthPlanId =
      process.env.CASHFREE_GROWTH_PLAN_ID ||
      process.env.VITE_CASHFREE_GROWTH_PLAN_ID ||
      "getownerhq_growth_999";
    const starterPlanId =
      process.env.CASHFREE_STARTER_PLAN_ID ||
      process.env.VITE_CASHFREE_STARTER_PLAN_ID ||
      "getownerhq_starter_499";
    const planCode = plan_name.toLowerCase().includes("growth")
      ? growthPlanId
      : starterPlanId;

    const subscriptionId = `sub_${gym_id.slice(0, 8)}_${Date.now()}`;
    const cleanPhone = (owner_mobile || "9999999999")
      .replace(/\D/g, "")
      .slice(-10);

    console.log(
      `[Cashfree API] Environment: ${mode} (${baseUrl}/subscriptions)`,
    );
    console.log(
      `[Cashfree API] Target Plan ID: "${planCode}" for Plan: "${plan_name}"`,
    );

    const payload: any = {
      subscription_id: subscriptionId,
      customer_details: {
        customer_id: gym_id.slice(0, 36),
        customer_name: owner_name || "Gym Owner",
        customer_email: owner_email || `${gym_id.slice(0, 8)}@getownerhq.in`,
        customer_phone: cleanPhone.length === 10 ? cleanPhone : "9999999999",
      },
      plan_details: {
        plan_id: planCode,
        plan_name: `${plan_name} Plan`,
        type: "PERIODIC",
        recurring_amount: Number(amount),
        max_amount: Number(amount),
        intervals: 1,
        interval_type: "MONTH",
      },
      authorization_details: {
        authorization_amount: Number(amount),
        payment_methods: ["enach", "upi", "card"],
      },
      subscription_meta: {
        return_url: `https://www.getownerhq.in/#/dashboard/billing?subscription_id=${subscriptionId}`,
        notification_url: "https://www.getownerhq.in/api/cashfree-webhook",
      },
      subscription_note: `getOwnerHQ ${plan_name} Subscription Mandate`,
    };

    const response = await fetch(`${baseUrl}/subscriptions`, {
      method: "POST",
      headers: {
        "x-client-id": clientId,
        "x-client-secret": clientSecret,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (
      !response.ok ||
      (!data.subscription_session_id && !data.subscription_id)
    ) {
      console.error("Cashfree subscription creation error:", data);
      return res.status(response.status || 400).json({
        success: false,
        message:
          data.message || "Failed to create Cashfree subscription session",
        details: data,
        sent_plan_id: planCode,
        api_endpoint: `${baseUrl}/subscriptions`,
      });
    }

    return res.status(200).json({
      success: true,
      subscription_session_id: data.subscription_session_id,
      subscription_id: data.subscription_id || subscriptionId,
      subscription_status: data.subscription_status || "INITIALIZED",
      sent_plan_id: planCode,
      mode,
      api_endpoint: `${baseUrl}/subscriptions`,
    });
  } catch (error: any) {
    console.error("Create subscription session exception:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error creating Cashfree subscription",
    });
  }
}
