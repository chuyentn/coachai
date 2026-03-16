export const onRequestPost = async (context: any) => {
  const { request, env } = context;

  // Xử lý CORS chống block trên trình duyệt
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
    const { amount, orderId, orderInfo, userId, courseId } = body;

    const tmnCode = env.VNPAY_TMN_CODE;
    const secretKey = env.VNPAY_SECURE_SECRET;
    const appUrl = env.APP_URL;

    if (!secretKey || !tmnCode || !appUrl) {
      console.error("VNPAY_SECURE_SECRET, VNPAY_TMN_CODE, or APP_URL is not configured.");
      return new Response(JSON.stringify({ error: "Payment gateway is missing Cloudflare Environment Variables." }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const vnpUrl = env.VNPAY_ENDPOINT || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const returnUrl = `${appUrl}/api/payments/vnpay/callback`;

    const date = new Date();
    // VNPAY Create Date format: yyyyMMddHHmmss
    const createDate = date.toISOString().replace(/[-:T]/g, "").slice(0, 14);
    
    let vnp_Params: any = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: String(orderId),
      // Embed userId and courseId so the callback can use it later
      vnp_OrderInfo: `${orderInfo}|uid:${userId}|cid:${courseId}`,
      vnp_OrderType: "other",
      vnp_Amount: String(Math.floor(amount * 100)),
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: request.headers.get('cf-connecting-ip') || "127.0.0.1",
      vnp_CreateDate: createDate,
    };

    // Sort params by alphabetical order
    vnp_Params = Object.keys(vnp_Params)
      .sort()
      .reduce((obj: any, key) => {
        if (vnp_Params[key] !== '' && vnp_Params[key] !== undefined && vnp_Params[key] !== null) {
          // encode URL component appropriately per VNPAY's requirement
          obj[key] = encodeURIComponent(String(vnp_Params[key])).replace(/%20/g, '+');
        }
        return obj;
      }, {});

    const signData = Object.entries(vnp_Params)
      .map(([key, val]) => `${key}=${val}`)
      .join('&');

    // Use Web Crypto API instead of Node.js crypto for Cloudflare Pages support
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      encoder.encode(signData)
    );
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signed = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    vnp_Params["vnp_SecureHash"] = signed;

    const finalUrl = vnpUrl + "?" + Object.entries(vnp_Params).map(([k, v]) => `${k}=${v}`).join('&');
    
    return new Response(JSON.stringify({ url: finalUrl }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (err: any) {
    console.error('Lỗi VNPAY Create Server:', err.stack);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};
