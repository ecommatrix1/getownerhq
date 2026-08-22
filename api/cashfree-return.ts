export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  try {
    const query = req.query || {};
    const body = req.body || {};

    // Cashfree sends subscription information in the POST body.
    // We also keep our own values in the return URL query string.
    const subscriptionId =
      body.subscription_id || body.subscriptionId || query.subscription_id;

    const gymId = query.gym_id;
    const planName = query.plan_name;

    console.log("[Cashfree Return] Received:", {
      subscriptionId,
      gymId,
      planName,
      body,
    });

    if (!subscriptionId || !gymId || !planName) {
      console.error("[Cashfree Return] Missing required values");

      return res.status(400).send("Missing Cashfree subscription information");
    }

    const baseUrl =
      process.env.CASHFREE_MODE === "production" ||
      process.env.CASHFREE_ENV === "production"
        ? "https://api.cashfree.com/pg"
        : "https://sandbox.cashfree.com/pg";

    const clientId =
      process.env.CASHFREE_CLIENT_ID || process.env.VITE_CASHFREE_CLIENT_ID;

    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("[Cashfree Return] Missing Cashfree credentials");
      return res.status(500).send("Cashfree credentials are not configured");
    }

    // Fetch the final subscription status from Cashfree.
    const response = await fetch(`${baseUrl}/subscriptions/${subscriptionId}`, {
      method: "GET",
      headers: {
        "x-client-id": clientId,
        "x-client-secret": clientSecret,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    console.log("[Cashfree Return] Subscription status:", data);

    const status = String(data.subscription_status || "").toUpperCase();

    // If Cashfree says ACTIVE, activate the gym through our
    // existing secure verification endpoint.
    if (status === "ACTIVE") {
      const origin =
        req.headers.origin ||
        `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;

      const verifyResponse = await fetch(
        `${origin}/api/verify-cashfree-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subscription_id: subscriptionId,
            gym_id: gymId,
            plan_name: planName,
          }),
        },
      );

      const verifyData = await verifyResponse.json();

      console.log("[Cashfree Return] Verification result:", verifyData);
    }

    // Send the customer back to the React billing page.
    const redirectUrl =
      `https://www.getownerhq.in/#/dashboard/billing` +
      `?subscription_id=${encodeURIComponent(subscriptionId)}` +
      `&subscription_status=${encodeURIComponent(status || "UNKNOWN")}` +
      `&plan_name=${encodeURIComponent(planName)}`;

    return res.redirect(303, redirectUrl);
  } catch (error: any) {
    console.error("[Cashfree Return] Error:", error);

    return res
      .status(500)
      .send(error.message || "Cashfree return processing failed");
  }
}
