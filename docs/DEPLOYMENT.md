# Hướng dẫn Triển khai (Deployment Guide)

Quy trình triển khai Edu-Vibe lên môi trường Production.

## 1. Chuẩn bị Môi trường
- **Node.js**: Phiên bản 18 trở lên.
- **Tài khoản Firebase**: Đã khởi tạo dự án và bật Authentication + Firestore.
- **Google Sheet**: Đã copy file template và cấu hình Google Apps Script.

## 2. Cấu hình .env
Tạo file `.env` (hoặc cấu hình Environment Variables trên Hosting):
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL=...
VITE_GOOGLE_SHEET_EDIT_URL=...
```

## 3. Build & Deploy Frontend
Sử dụng lệnh:
```bash
npm install
npm run build
```
Sau đó upload thư mục `dist` lên:
- **Vercel**: `vercel --prod`
- **Cloudflare Pages**: Link repository và cấu hình build command `npm run build`.

## 4. Cấu hình Google Apps Script
1. Mở file Google Sheets -> Extensions -> Apps Script.
2. Dán mã nguồn backend (nằm trong thư mục `.agent/scripts` hoặc template).
3. Nhấn "Deploy" -> "New Deployment" -> Loại: "Web App".
4. Set "Who has access" là "Anyone".
5. Copy URL nhận được và dán vào `VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL`.

## 5. Kiểm tra sau triển khai
- Thử đăng ký tài khoản mới.
- Kiểm tra dữ liệu có đổ về Google Sheets không.
- Thử thay đổi cấu hình Admin và xem trang chủ có cập nhật không.
