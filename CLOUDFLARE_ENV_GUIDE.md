# 🌐 HƯỚNG DẪN CẤU HÌNH BIẾN MÔI TRƯỜNG (ENV) - CLOUDFLARE PAGES

Tài liệu này giúp bạn cấu hình chính xác các biến môi trường trên Cloudflare để hệ thống **CoachAI Pro** hoạt động hoàn hảo.

---

## 🏗️ 1. Nơi cấu hình (Where to add)
Bạn cần thêm các biến này vào:
**Cloudflare Dashboard** > **Workers & Pages** > **[Tên dự án của bạn]** > **Settings** > **Functions** (hoặc **Environment Variables**) > **Production**.

> [!IMPORTANT]
> Sau khi thêm hoặc sửa biến ENV trên Cloudflare, bạn **PHẢI** nhấn "Retry Deployment" hoặc Push code mới để các thay đổi có hiệu lực.

---

## 🎨 2. Nhóm A: Frontend (Biến có tiền tố VITE_)
Các biến này điều khiển giao diện, Branding và kết nối API công khai.

| Tên biến | Ví dụ giá trị | Ghi chú |
| :--- | :--- | :--- |
| `VITE_APP_NAME` | `CoachAI` | Tên hiển thị trên Navbar/Footer |
| `VITE_COMPANY_NAME` | `Victor Chuyen` | Tên công ty/Thương hiệu |
| `VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL` | `https://script.google.com/.../exec` | URL App Script (Webhook) |
| `VITE_GOOGLE_SHEET_EDIT_URL` | `https://docs.google.com/spreadsheets/d/.../edit` | Link để Admin mở Sheet nhanh |
| `VITE_GEMINI_API_KEY` | `AIzaSy...` | Key dự phòng cho Frontend |
| `VITE_GA_MEASUREMENT_ID` | `G-XXXXXXXX` | Google Analytics 4 |

---

## 🔐 3. Nhóm B: Backend & Secrets (Biến bảo mật)
Các biến này chạy ở phía Server (Cloudflare Workers), tuyệt đối không để lộ.

### 🤖 Cấu hình AI Rotation (Xoay vòng AI)
Đây là tính năng độc quyền để tránh lỗi Quota.

*   `GEMINI_API_KEYS`: Nhập nhiều Key, cách nhau bằng dấu phẩy `,`.
    *   *Ví dụ:* `key1,key2,key3`
*   `OPENAI_API_KEYS`: Nhập key OpenAI (sk-...) để làm phương án dự phòng cuối cùng.

### 📧 Email & Dịch vụ khác
*   `RESEND_API_KEY`: Key từ Resend.com để gửi mail tự động.
*   `APP_URL`: URL trang web của bạn (ví dụ: `https://edu.victorchuyen.net`).

---

## 💳 4. Cổng thanh toán (Payments)
| Tên biến | Mô tả |
| :--- | :--- |
| `PAYPAL_CLIENT_ID` | Lấy từ PayPal Developer Dashboard |
| `PAYPAL_CLIENT_SECRET` | Key bí mật của PayPal |
| `MOMO_PARTNER_CODE` | Mã đối tác MoMo |
| `MOMO_ACCESS_KEY` | Access Key MoMo |
| `MOMO_SECRET_KEY` | Secret Key MoMo |

---

## 💡 Mẹo nhỏ (Pro-Tips)
1. **Dữ liệu động từ Sheets**: Các thông tin như Link Zalo, Telegram, Facebook, Content Hero... **không cần** cài ở đây. Bạn chỉ cần cài trong tab `page_content` của Google Sheets, hệ thống sẽ tự lấy về theo thời gian thực.
2. **Bảo mật**: Luôn chọn loại **Secret** trong Cloudflare cho các biến `API_KEYS` và `SECRET_KEY` để đảm bảo an toàn tối đa.

---
*Tài liệu được chuẩn hóa bởi CoachAI - Victor Chuyen*
