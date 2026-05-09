# Cấu trúc Kỹ thuật (Architecture)

Hệ thống Edu-Vibe được xây dựng theo mô hình **Hybrid SaaS**, kết hợp sức mạnh của Cloud Infrastructure hiện đại và sự linh hoạt của Spreadsheet-based CMS.

## 1. Stack Công nghệ
- **Frontend**: React.js, Vite, Tailwind CSS, Motion (Animation).
- **Backend/Database**: Firebase (Auth, Firestore).
- **CMS & Logic Service**: Google Sheets, Google Apps Script.
- **Hosting**: Vercel hoặc Cloudflare Pages.

## 2. Mô hình Dữ liệu (Hybrid Model)
Hệ thống phân tách dữ liệu thành 2 loại:
- **Dữ liệu Động & Bảo mật (Firebase)**:
    - User Profiles, Authentication.
    - Lịch sử giao dịch nhạy cảm.
    - Trạng thái bài học (Progress).
- **Dữ liệu Nội dung & Cấu hình (Google Sheets)**:
    - Danh sách khóa học, video, tài liệu.
    - Cấu hình thương hiệu (App Name, Colors).
    - Danh sách Leads & Đơn hàng thô.

## 3. Giao tiếp Hệ thống (Communication)
- **Webhooks**: Frontend gửi yêu cầu đến Google Apps Script thông qua `VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL`.
- **Direct Sheet Access**: Admin có thể chỉnh sửa trực tiếp vào file Sheet để cập nhật nội dung hàng loạt.
- **Real-time Sync**: Firebase Firestore đảm bảo các thông báo và trạng thái người dùng được cập nhật tức thì.

## 4. Bảo mật
- **Firebase Auth**: Quản lý đăng nhập, reset mật khẩu và phân quyền (Roles).
- **Security Rules**: Firestore Rules đảm bảo người dùng chỉ có thể xem/sửa dữ liệu của chính mình.
- **Environment Variables**: Toàn bộ API Keys và Webhook URLs được quản lý qua file `.env`.
