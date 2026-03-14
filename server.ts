import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- VNPAY Integration ---
  app.post("/api/payments/vnpay/create", (req, res) => {
    const { amount, orderId, orderInfo } = req.body;
    const tmnCode = process.env.VNPAY_TMN_CODE;
    const secretKey = process.env.VNPAY_SECURE_SECRET;
    const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const returnUrl = `${process.env.APP_URL}/api/payments/vnpay/callback`;

    const date = new Date();
    const createDate = date.toISOString().replace(/[-:T]/g, "").slice(0, 14);
    
    let vnp_Params: any = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
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
    const hmac = crypto.createHmac("sha512", secretKey!);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    const finalUrl = vnpUrl + "?" + new URLSearchParams(vnp_Params).toString();
    res.json({ url: finalUrl });
  });

  app.get("/api/payments/vnpay/callback", (req, res) => {
    // In a real app, verify signature here and update Supabase enrollment
    // For demo, redirect back to dashboard
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
