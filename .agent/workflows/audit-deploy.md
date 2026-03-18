---
description: Quy trình kiểm tra (Audit) và Triển khai (Deploy) hệ thống Edu-Vibe
---

Tài liệu này hướng dẫn cách kiểm tra toàn diện hệ thống trước khi cập nhật lên Cloudflare Pages và Google Apps Script.

## 1. Kiểm tra Môi trường (Environment Audit)
// turbo
1. So khớp các biến trong `.env` với Dashboard Cloudflare Pages.
2. Đảm bảo `RESEND_API_KEY` đã được thêm vào **Settings > Functions > Environment Variables** trên Cloudflare.
3. Kiểm tra `VITE_CAL_API_KEY` và `VITE_CAL_EVENT_PATH` đã có trong file `.env`.

## 2. Kiểm tra Chất lượng Code (Code Quality)
// turbo
1. Chạy lệnh kiểm tra lỗi cú pháp: `npm run lint`.
2. Thử Build local để đảm bảo không có lỗi Bundling: `npm run build`.

## 3. Kiểm tra Luồng Dữ liệu (Backend & CRM Audit)
1. Thử gửi một Form liên hệ (Contact) và kiểm tra xem Iframe Cal.com có hiển thị đúng không.
2. Kiểm tra Google Sheets (Tab `Leads`) xem data có đổ về kèm Tag chính xác (ví dụ: `[Newsletter]`) không.
3. Kiểm tra Hòm thư cá nhân xem có nhận được Email có **Master Template** (Logo + Footer Up-sell) không.

## 4. Quy trình Deploy
// turbo
1. Đưa code lên Github: `git add .`, `git commit -m "feat: upgrade crm & booking"`, `git push origin main`.
2. Cloudflare Pages sẽ tự động Build. Theo dõi tiến độ tại Dashboard Cloudflare.
3. Nếu có cập nhật Logic Google Sheets, hãy `Deploy > New Deployment` trên Apps Script và cập nhật lại URL vào `VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL` trong Dashboard Cloudflare.

## 5. Danh sách Kiểm tra (Final Checklist)
- [ ] Mọi link trong Email Footer (Up-sell VIP) hoạt động đúng.
- [ ] Cal.com đã bật chế độ "Requires Confirmation" (để Victor chủ động duyệt/huỷ).
- [ ] Email từ `onboarding@resend.dev` đã được đổi thành Domain chính thức (nếu đã Verify domain).
