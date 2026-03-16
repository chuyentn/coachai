import crypto from "crypto";

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

    // P1.4 Fix: Guard against missing env vars instead of crashing with secretKey!
    if (!secretKey || !tmnCode || !appUrl) {
      console.error("VNPAY_SECURE_SECRET, VNPAY_TMN_CODE, or APP_URL is not configured.");
      return new Response(JSON.stringify({ error: "Payment gateway is missing Cloudflare Environment Variables." }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const returnUrl = `${appUrl}/api/payments/vnpay/callback`; // Cái này về sau phải viết webhook serverless riêng nếu xài Cloudflare

    const date = new Date();
    // VNPAY Create Date format: yyyyMMddHHmmss
    const createDate = date.toISOString().replace(/[-:T]/g, "").slice(0, 14);
    
    let vnp_Params: any = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      // Embed userId and courseId so the callback can create the enrollment server-side
      vnp_OrderInfo: `${orderInfo}|uid:${userId}|cid:${courseId}`,
      vnp_OrderType: "other",
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: request.headers.get('cf-connecting-ip') || "127.0.0.1",
      vnp_CreateDate: createDate,
    };

    // Sort params by alphabetical order
    vnp_Params = Object.keys(vnp_Params)
      .sort()
      .reduce((obj: any, key) => {
        obj[key] = vnp_Params[key];
        return obj;
      }, {});

    const signData = new URLSearchParams(vnp_Params).toString();
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    const finalUrl = vnpUrl + "?" + new URLSearchParams(vnp_Params).toString();
    
    return new Response(JSON.stringify({ url: finalUrl }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (err: any) {
    console.error('Lỗi VNPAY Create Server:', err.message);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};
