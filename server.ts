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

  // --- PayPal Integration ---
  app.post("/api/payments/paypal/create", (req, res) => {
    // PayPal usually handled client-side with @paypal/react-paypal-js
    // But we can verify on backend
    res.json({ status: "ok" });
  });

  // --- P1.6 Fix: Gemini AI Chat (server-side, key never sent to client) ---
  app.post("/api/ai/chat", async (req, res) => {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.status(500).json({ error: "AI service not configured" });
    }

    const { message, courseTitle, lessonTitle } = req.body;
    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `Bạn là một chuyên gia AI Coach hỗ trợ học viên trong khóa học "${courseTitle}". 
            Học viên đang xem bài học: "${lessonTitle}". 
            Hãy trả lời ngắn gọn, chuyên nghiệp và tập trung vào kiến thức chuyên môn.
            
            Câu hỏi của học viên: ${message}` }]
          }
        ],
        config: {
          systemInstruction: "Bạn là một AI Coach chuyên nghiệp, nhiệt tình và có kiến thức sâu rộng về công nghệ và kinh doanh.",
        }
      });
      res.json({ text: response.text || "Xin lỗi, tôi gặp chút trục trặc. Bạn có thể thử lại không?" });
    } catch (error) {
      console.error("Gemini AI error:", error);
      res.status(500).json({ error: "AI service error" });
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
