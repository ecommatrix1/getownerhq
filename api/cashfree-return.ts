import crypto from 'crypto';

function verifyCashfreeSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  // Verify Cashfree webhook signature
  const signature = req.headers['x-webhook-signature'] || req.headers['X-Webhook-Signature'];
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

  if (clientSecret && signature) {
    const rawBody = JSON.stringify(req.body || {});
    if (!verifyCashfreeSignature(rawBody, signature, clientSecret)) {
      console.error('[Cashfree Return] Invalid webhook signature');
      return res.status(401).send('Invalid webhook signature');
    }
  } else if (clientSecret) {
    // Signature header missing but we have secret configured - reject
    console.error('[Cashfree Return] Missing webhook signature header');
    return res.status(401).send('Missing webhook signature');
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

    // Cashfree already includes the verified authorization status directly
    // in the callback body — no separate status-check call needed.
    const cfStatus = String(body.cf_status || "").toUpperCase();
    const cfCheckoutStatus = String(body.cf_checkoutStatus || "").toUpperCase();

    console.log("[Cashfree Return] Callback status:", {
      cfStatus,
      cfCheckoutStatus,
    });

    const status =
      cfStatus === "ACTIVE" || cfCheckoutStatus === "SUCCESS"
        ? "ACTIVE"
        : "UNKNOWN";

    // If Cashfree says ACTIVE, activate the gym through our
    // existing secure verification endpoint.
    if (status === "ACTIVE") {
      // Use the fixed production domain directly instead of deriving it from
      // request headers, which can be unreliable behind Cashfree's redirect.
      const verifyUrl = "https://www.getownerhq.in/api/verify-cashfree-session";

      console.log("[Cashfree Return] Calling verify endpoint:", verifyUrl);

      const verifyResponse = await fetch(verifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          gym_id: gymId,
          plan_name: planName,
        }),
      });

      const verifyText = await verifyResponse.text();

      console.log(
        "[Cashfree Return] Verify response status:",
        verifyResponse.status,
      );
      console.log("[Cashfree Return] Verify response body:", verifyText);

      if (!verifyResponse.ok) {
        console.error(
          "[Cashfree Return] Verify call failed with non-OK status",
        );
      } else {
        try {
          const verifyData = JSON.parse(verifyText);
          console.log("[Cashfree Return] Verification result:", verifyData);
        } catch (parseErr) {
          console.error(
            "[Cashfree Return] Verify response was not valid JSON:",
            verifyText,
          );
        }
      }
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
