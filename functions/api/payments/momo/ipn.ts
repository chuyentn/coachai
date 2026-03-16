export const onRequestPost = async (context: any) => {
  const { request, env } = context;

  try {
    const body: any = await request.json();
    const { 
      partnerCode, 
      orderId, 
      requestId, 
      amount, 
      orderInfo, 
      orderType, 
      transId, 
      resultCode, 
      message, 
      payType, 
      responseTime, 
      extraData, 
      signature 
    } = body;

    const secretKey = env.MOMO_SECRET_KEY;
    const accessKey = env.MOMO_ACCESS_KEY;

    if (!secretKey || !accessKey) {
      return new Response(JSON.stringify({ resultCode: 99, message: "Server misconfiguration" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // MoMo IPN Signature raw string:
    // accessKey=$accessKey&amount=$amount&extraData=$extraData&message=$message&orderId=$orderId&orderInfo=$orderInfo&orderType=$orderType&partnerCode=$partnerCode&requestId=$requestId&responseTime=$responseTime&resultCode=$resultCode&transId=$transId
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    // Verify signature using Web Crypto API
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
    const computedSignature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (computedSignature !== signature) {
      console.error("Invalid MoMo signature", { computedSignature, signature });
      return new Response(JSON.stringify({ resultCode: 98, message: "Invalid signature" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If payment is successful (resultCode 0)
    if (resultCode === 0) {
      // In a real production app, you would use a Service Account or Admin SDK to update Firestore.
      // Since this is a Cloudflare Function, we assume there's a separate mechanism or we use Firestore REST API.
      // For now, we'll log it as requested.
      console.log(`MoMo Payment Success: Order ${orderId}, Amount ${amount}, TransId ${transId}`);
      
      // Note: Implementation of actual Firestore update would require FB_PROJECT_ID and FB_API_KEY if using REST API.
      // OR the frontend listener will handle it if we update via a backend that Cloudflare can call.
    } else {
      console.warn(`MoMo Payment Failed: Order ${orderId}, ResultCode ${resultCode}, Message ${message}`);
    }

    // MoMo expects a 204 or a JSON response with resultCode 0
    return new Response(JSON.stringify({ resultCode: 0, message: "Success" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error("MoMo IPN Error:", err.message);
    return new Response(JSON.stringify({ resultCode: 99, message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
