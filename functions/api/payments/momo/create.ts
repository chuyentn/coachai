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
    const { amount, orderId, orderInfo, userId, courseId, redirectUrl } = body;

    const partnerCode = env.MOMO_PARTNER_CODE || 'MOMOBQUK20250710_TEST';
    const accessKey = env.MOMO_ACCESS_KEY;
    const secretKey = env.MOMO_SECRET_KEY;
    const endpoint = env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
    
    // Multi-tenant URLs: Use VITE_APP_DOMAIN if available, fallback to env.APP_URL
    const baseUrl = env.VITE_APP_DOMAIN || env.APP_URL;
    const ipnUrl = env.MOMO_IPN_URL || `${baseUrl}/api/payments/momo/ipn`;
    const finalRedirectUrl = redirectUrl || env.MOMO_REDIRECT_URL || `${baseUrl}/api/payments/momo/return`;
    const appName = env.VITE_APP_NAME || "CoachAI";

    if (!accessKey || !secretKey) {
      return new Response(JSON.stringify({ error: "MoMo API keys are not configured in environment variables." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const requestId = String(Date.now());
    const finalOrderId = orderId || `MM${requestId}`;
    const extraData = btoa(JSON.stringify({ userId, courseId })); // Base64 extra data
    const requestType = "captureWallet";

    // Signature raw string per MoMo documentation
    // accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${finalOrderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${finalRedirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    // HMAC SHA256 using Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      encoder.encode(rawSignature)
    );
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const requestBody = {
      partnerCode,
      partnerName: appName,
      storeId: appName,
      requestId,
      amount: Number(amount),
      orderId: finalOrderId,
      orderInfo,
      redirectUrl: finalRedirectUrl,
      ipnUrl,
      lang: "vi",
      extraData,
      requestType,
      signature,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const result: any = await response.json();

    return new Response(JSON.stringify(result), {
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
