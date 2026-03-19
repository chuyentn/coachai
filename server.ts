import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import axios from "axios";
import dotenv from "dotenv";

import { Resend } from 'resend';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// --- AI Rotation Manager (High Availability) ---
class AIRotator {
  private geminiKeys: string[] = [];
  private openaiKeys: string[] = [];
  private geminiIndex: number = 0;
  private openaiIndex: number = 0;

  constructor() {
    this.geminiKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "").split(",").map(k => k.trim()).filter(k => k);
    this.openaiKeys = (process.env.OPENAI_API_KEYS || process.env.OPENAI_API_KEY || "").split(",").map(k => k.trim()).filter(k => k);
    console.log(`AIRotator initialized: ${this.geminiKeys.length} Gemini keys, ${this.openaiKeys.length} OpenAI keys.`);
  }

  async callGemini(courseTitle: string, lessonTitle: string, message: string): Promise<string> {
    if (this.geminiKeys.length === 0) throw new Error("No Gemini keys configured");
    
    // Try each key in a round-robin fashion
    let lastError: any = null;
    for (let i = 0; i < this.geminiKeys.length; i++) {
        const currentKey = this.geminiKeys[this.geminiIndex];
        try {
            const { GoogleGenAI } = await import("@google/genai");
            const ai = new GoogleGenAI({ apiKey: currentKey });
            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: [{
                    role: "user",
                    parts: [{ text: `Bạn là một chuyên gia AI Coach hỗ trợ học viên trong khóa học "${courseTitle}". Bài học: "${lessonTitle}". Trả lời ngắn gọn, chuyên nghiệp. Câu hỏi: ${message}` }]
                }],
                config: { systemInstruction: "AI Coach chuyên nghiệp." }
            });
            return response.text || "Xin lỗi, tôi gặp chút trục trặc.";
        } catch (error: any) {
            console.warn(`Gemini Key [${this.geminiIndex}] failed:`, error.message);
            lastError = error;
            this.geminiIndex = (this.geminiIndex + 1) % this.geminiKeys.length; // Rotate to next key
            if (error.status === 429 || error.status === 403) continue; // Rate limit or auth error -> try next
            else throw error; // Other critical error -> fail
        }
    }
    throw lastError;
  }

  async callOpenAI(courseTitle: string, lessonTitle: string, message: string): Promise<string> {
    if (this.openaiKeys.length === 0) throw new Error("No OpenAI keys configured");
    
    const currentKey = this.openaiKeys[this.openaiIndex];
    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "AI Coach chuyên nghiệp." },
                { role: "user", content: `Khóa học: ${courseTitle}. Bài học: ${lessonTitle}. Câu hỏi: ${message}` }
            ]
        }, {
            headers: { "Authorization": `Bearer ${currentKey}`, "Content-Type": "application/json" }
        });
        return response.data.choices[0].message.content;
    } catch (error: any) {
        console.warn(`OpenAI Key [${this.openaiIndex}] failed:`, error.message);
        this.openaiIndex = (this.openaiIndex + 1) % this.openaiKeys.length;
        throw error;
    }
  }
}

const aiRotator = new AIRotator();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- VNPAY Integration ---
  app.post("/api/payments/vnpay/create", (req, res) => {
    const { amount, orderId, orderInfo, userId, courseId } = req.body;
    const tmnCode = process.env.VNPAY_TMN_CODE;
    const secretKey = process.env.VNPAY_SECURE_SECRET;
    const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const returnUrl = `${process.env.APP_URL}/api/payments/vnpay/callback`;

    // P1.4 Fix: Guard against missing env vars instead of crashing with secretKey!
    if (!secretKey || !tmnCode) {
      console.error("VNPAY_SECURE_SECRET or VNPAY_TMN_CODE is not configured");
      return res.status(500).json({ error: "Payment gateway not configured" });
    }

    const date = new Date();
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
      vnp_IpAddr: req.ip || "127.0.0.1",
      vnp_CreateDate: createDate,
    };

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
    res.json({ url: finalUrl });
  });

  // P1.3 Fix: Verify VNPAY signature before accepting payment and creating enrollment
  app.get("/api/payments/vnpay/callback", async (req, res) => {
    const secretKey = process.env.VNPAY_SECURE_SECRET;
    if (!secretKey) {
      console.error("VNPAY_SECURE_SECRET is not configured");
      return res.redirect("/dashboard/student?payment=error");
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
      console.error("VNPAY signature mismatch — possible tampering");
      return res.redirect("/dashboard/student?payment=failed&reason=invalid_signature");
    }

    const responseCode = vnp_Params["vnp_ResponseCode"];
    if (responseCode !== "00") {
      console.warn(`VNPAY payment failed with code: ${responseCode}`);
      return res.redirect(`/dashboard/student?payment=failed&code=${responseCode}`);
    }

    // Signature valid and payment successful — create enrollment in Firestore
    try {
      const { initializeApp, getApps, getApp } = await import("firebase-admin/app");
      const { getFirestore } = await import("firebase-admin/firestore");

      if (!getApps().length) {
        initializeApp(); // Uses GOOGLE_APPLICATION_CREDENTIALS or Firebase default
      }
      const adminDb = getFirestore(getApp());

      // Extract userId and courseId embedded in vnp_OrderInfo
      const orderInfo: string = vnp_Params["vnp_OrderInfo"] || "";
      const uidMatch = orderInfo.match(/uid:([^|]+)/);
      const cidMatch = orderInfo.match(/cid:([^|]+)/);

      if (uidMatch && cidMatch) {
        const userId = uidMatch[1];
        const courseId = cidMatch[1];
        const enrollId = `${userId}_${courseId}`;
        await adminDb.collection("enrollments").doc(enrollId).set({
          id: enrollId,
          user_id: userId,
          course_id: courseId,
          status: "completed",
          payment_method: "vnpay",
          amount_paid: Number(vnp_Params["vnp_Amount"]) / 100,
          currency: "VND",
          created_at: new Date().toISOString(),
          completion_percentage: 0,
          progress: {},
        });
        console.log(`Enrollment created: ${enrollId}`);
      }
    } catch (err) {
      console.error("Failed to create enrollment after VNPAY callback:", err);
    }

    res.redirect("/dashboard/student?payment=success");
  });

  // --- MoMo Integration (Simplified) ---
  app.post("/api/payments/momo/create", async (req, res) => {
    // MoMo requires a more complex signature and partner setup
    // This is a placeholder for the logic
    res.json({ url: "https://test-payment.momo.vn/..." });
  });

  // --- SEPAY Webhook Integration (Free Automated VietQR Variant) ---
  app.post("/api/webhooks/sepay", async (req, res) => {
    const { transferAmount, content } = req.body;

    if (!transferAmount || !content) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    try {
      // 1. Extract transaction code using regex (e.g. EVABCD1234)
      const matches = String(content).toUpperCase().match(/EV[A-Z0-9]{4}\d{4}/);
      const transactionCode = matches ? matches[0] : null;

      if (!transactionCode) {
        console.warn(`SePay: No transaction code found in content: ${content}`);
        return res.json({ success: true, message: "Ignored: No EV code" });
      }

      const { initializeApp, getApps, getApp } = await import("firebase-admin/app");
      const { getFirestore } = await import("firebase-admin/firestore");

      if (!getApps().length) {
        initializeApp();
      }
      const adminDb = getFirestore(getApp());

      // 2. Query the pending payment by transaction_code
      const paymentsRef = adminDb.collection("payments");
      const snapshot = await paymentsRef
        .where("transaction_code", "==", transactionCode)
        .where("status", "==", "pending")
        .limit(1)
        .get();

      if (snapshot.empty) {
        console.warn(`SePay: Pending payment not found for code: ${transactionCode}`);
        return res.json({ success: true, message: "Ignored: Payment not found or already processed" });
      }

      const paymentDoc = snapshot.docs[0];
      const paymentData = paymentDoc.data();

      // 3. Verify amount
      if (Number(transferAmount) < Number(paymentData.amount)) {
        console.warn(`SePay: Insufficient amount for ${transactionCode}. Expected ${paymentData.amount}, got ${transferAmount}`);
        return res.json({ success: true, message: "Ignored: Insufficient amount" });
      }

      // 4. Fulfillment: Update payment status
      await paymentDoc.ref.update({ status: 'completed' });

      // 5. Grant access based on plan
      if (paymentData.plan_type === 'course' && paymentData.course_id) {
        // Create course enrollment
        const enrollId = `${paymentData.user_id}_${paymentData.course_id}`;
        await adminDb.collection("enrollments").doc(enrollId).set({
          id: enrollId,
          user_id: paymentData.user_id,
          course_id: paymentData.course_id,
          status: "completed",
          payment_method: "sepay_vietqr",
          amount_paid: Number(paymentData.amount),
          currency: "VND",
          created_at: new Date().toISOString(),
          completion_percentage: 0,
          progress: {},
        });
        console.log(`[SePay] Auto-enrolled ${paymentData.user_email} to course ${paymentData.course_id}`);
      } else if (paymentData.plan_type === 'vip') {
        // Upgrade user role
        await adminDb.collection("users").doc(paymentData.user_id).update({
          role: 'vip'
        });
        console.log(`[SePay] Upgraded ${paymentData.user_email} to VIP`);
      }

      return res.json({ success: true, message: "Processed successfully" });
    } catch (error) {
      console.error("SePay webhook error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // --- PayPal Integration ---
  app.post("/api/payments/paypal/create", (req, res) => {
    // PayPal usually handled client-side with @paypal/react-paypal-js
    // But we can verify on backend
    res.json({ status: "ok" });
  });

  // --- AI Chat with Rotation & Fallback ---
  app.post("/api/ai/chat", async (req, res) => {
    const { message, courseTitle, lessonTitle } = req.body;
    if (!message) return res.status(400).json({ error: "message is required" });

    try {
      // 1. Try Gemini first (as requested)
      const aiText = await aiRotator.callGemini(courseTitle, lessonTitle, message);
      res.json({ text: aiText });
    } catch (geminiError) {
      console.error("Gemini failed after all keys, trying OpenAI fallback...");
      try {
        // 2. Fallback to OpenAI if Gemini fails or is not configured
        const aiText = await aiRotator.callOpenAI(courseTitle, lessonTitle, message);
        res.json({ text: aiText });
      } catch (openaiError) {
        console.error("All AI providers failed.");
        res.status(500).json({ error: "Hệ thống AI đang bảo trì, vui lòng thử lại sau." });
      }
    }
  });

  // --- Resend Email Integration ---
  app.post("/api/email/send", async (req, res) => {
    const { to, subject, html } = req.body;

    if (!resend) {
      console.error("RESEND_API_KEY is not configured");
      return res.status(500).json({ error: "Email service not configured" });
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'Edu Victor Chuyen <onboarding@resend.dev>', // Default Resend domain for testing
        to: [to],
        subject: subject,
        html: html,
      });

      if (error) {
        console.error("Resend error:", error);
        return res.status(400).json({ error });
      }

      res.json({ success: true, data });
    } catch (error) {
      console.error("Email send error:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
