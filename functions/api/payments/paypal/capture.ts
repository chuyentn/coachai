export const onRequestPost = async (context: any) => {
  const { request, env } = context;

  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const body: any = await request.json();
    const { orderId } = body;

    const clientId = env.PAYPAL_CLIENT_ID;
    const clientSecret = env.PAYPAL_CLIENT_SECRET;
    const apiUrl = env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ error: "PayPal API keys are not configured." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 1. Get Access Token
    const auth = btoa(`${clientId}:${clientSecret}`);
    const tokenRes = await fetch(`${apiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData: any = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Capture Order
    const captureRes = await fetch(`${apiUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const captureData: any = await captureRes.json();

    // 3. Logic update status (simulated per existing patterns)
    if (captureData.status === 'COMPLETED') {
      console.log('PayPal Payment Captured Successfully:', orderId);
      // Actual Firestore update would be handled by a client-side listener or a dedicated backend service
      // as Cloudflare Pages Functions don't have direct Admin SDK access without external auth setup.
    }

    return new Response(JSON.stringify(captureData), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};
