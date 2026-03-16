import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as crypto from "crypto";

admin.initializeApp();
const db = admin.firestore();

/**
 * SePay Webhook (Automated VietQR)
 * URL will be: https://asia-southeast1-edu-victorchuyen.cloudfunctions.net/sepayWebhook
 */
export const sepayWebhook = functions.region("asia-southeast1").https.onRequest(async (req, res) => {
  // CORS (Optional, SePay calls server-to-server)
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.status(204).send("");
    return;
  }

  const { transferAmount, content } = req.body;

  if (!transferAmount || !content) {
    res.status(400).json({ error: "Invalid webhook payload" });
    return;
  }

  try {
    // 1. Extract transaction code using regex (e.g. EVABCD1234)
    const matches = String(content).toUpperCase().match(/EV[A-Z0-9]{4}\d{4}/);
    const transactionCode = matches ? matches[0] : null;

    if (!transactionCode) {
      console.warn(`SePay: No transaction code found in content: ${content}`);
      res.json({ success: true, message: "Ignored: No EV code" });
      return;
    }

    // 2. Query the pending payment by transaction_code
    const paymentsRef = db.collection("payments");
    const snapshot = await paymentsRef
      .where("transaction_code", "==", transactionCode)
      .where("status", "==", "pending")
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.warn(`SePay: Pending payment not found for code: ${transactionCode}`);
      res.json({ success: true, message: "Ignored: Not found or handled" });
      return;
    }

    const paymentDoc = snapshot.docs[0];
    const paymentData = paymentDoc.data();

    // 3. Verify amount
    if (Number(transferAmount) < Number(paymentData.amount)) {
      console.warn(`SePay: Insufficient amount. Expected ${paymentData.amount}, got ${transferAmount}`);
      res.json({ success: true, message: "Ignored: Insufficient amount" });
      return;
    }

    // 4. Update payment status
    await paymentDoc.ref.update({ status: "completed" });

    // 5. Grant access
    if (paymentData.plan_type === "course" && paymentData.course_id) {
      const enrollId = `${paymentData.user_id}_${paymentData.course_id}`;
      await db.collection("enrollments").doc(enrollId).set({
        id: enrollId,
        user_id: paymentData.user_id,
        course_id: paymentData.course_id,
        status: "completed",
        payment_method: "sepay_vietqr",
        amount_paid: Number(paymentData.amount),
        currency: "VND",
        created_at: admin.firestore.Timestamp.now().toDate().toISOString(),
        completion_percentage: 0,
        progress: {},
      });
      console.log(`[SePay] Enrolled ${paymentData.user_email} to ${paymentData.course_id}`);
    } else if (paymentData.plan_type === "vip") {
      await db.collection("users").doc(paymentData.user_id).update({
        role: "vip"
      });
      console.log(`[SePay] Upgraded ${paymentData.user_email} to VIP`);
    }

    res.json({ success: true, message: "Processed successfully" });
  } catch (error: any) {
    console.error("SePay Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * VNPAY Callback (GET Request)
 * URL will be: https://asia-southeast1-edu-victorchuyen.cloudfunctions.net/vnpayCallback
 */
export const vnpayCallback = functions.region("asia-southeast1").https.onRequest(async (req, res) => {
  const secretKey = process.env.VNPAY_SECURE_SECRET || functions.config().vnpay.secret;
  const appUrl = process.env.APP_URL || functions.config().app.url;

  if (!secretKey) {
    res.status(500).send("VNPAY Secret not configured");
    return;
  }

  const vnp_Params = { ...req.query } as Record<string, string>;
  const secureHash = vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  const sortedParams = Object.keys(vnp_Params)
    .sort()
    .reduce((obj: any, key) => { obj[key] = vnp_Params[key]; return obj; }, {});

  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = crypto.createHmac("sha512", secretKey);
  const expectedHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  if (secureHash !== expectedHash) {
    res.redirect(`${appUrl}/dashboard/student?payment=failed&reason=invalid_signature`);
    return;
  }

  const responseCode = vnp_Params["vnp_ResponseCode"];
  if (responseCode !== "00") {
    res.redirect(`${appUrl}/dashboard/student?payment=failed&code=${responseCode}`);
    return;
  }

  try {
    const orderInfo: string = vnp_Params["vnp_OrderInfo"] || "";
    const uidMatch = orderInfo.match(/uid:([^|]+)/);
    const cidMatch = orderInfo.match(/cid:([^|]+)/);

    if (uidMatch && cidMatch) {
      const userId = uidMatch[1];
      const courseId = cidMatch[1];
      const enrollId = `${userId}_${courseId}`;
      await db.collection("enrollments").doc(enrollId).set({
        id: enrollId,
        user_id: userId,
        course_id: courseId,
        status: "completed",
        payment_method: "vnpay",
        amount_paid: Number(vnp_Params["vnp_Amount"]) / 100,
        currency: "VND",
        created_at: admin.firestore.Timestamp.now().toDate().toISOString(),
        completion_percentage: 0,
        progress: {},
      });
    }
    res.redirect(`${appUrl}/dashboard/student?payment=success`);
  } catch (err) {
    console.error("VNPAY Callback Error:", err);
    res.redirect(`${appUrl}/dashboard/student?payment=error`);
  }
});
