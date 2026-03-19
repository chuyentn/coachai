# Hướng dẫn Vận hành & Triển khai SaaS (Edu-Vibe White-label)

Tài liệu này hướng dẫn cách triển khai một trang web mới dựa trên bộ mã nguồn Edu-Vibe cho các đối tác/đại lý.

## 1. Cấu hình Biến môi trường (Environment Variables)

Mỗi đại lý cần có một bộ biến môi trường riêng trong Cloudflare Pages (vào Settings -> Variables and Secrets).

| Biến | Ý nghĩa | Ví dụ |
|------|---------|-------|
| `VITE_APP_NAME` | Tên thương hiệu hiển thị | `AI Academy` |
| `VITE_COMPANY_NAME` | Tên công ty/tổ chức | `Công ty TNHH Giải pháp AI` |
| `VITE_SUPPORT_EMAIL` | Email nhận hỗ trợ & gửi thông báo | `hotro@aiacademy.vn` |
| `VITE_CONTACT_PHONE` | Hotline Zalo/Phone | `0912.345.678` |
| `VITE_APP_LOGO_URL` | Link ảnh Logo (nên dùng CDN) | `https://my-cdn.com/logo-academy.png` |
| `VITE_APP_DOMAIN` | Domain của đại lý (không có https://) | `academy.edu.vn` |
| `VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL` | Link Apps Script riêng của đại lý | `https://script.google.com/macros/s/.../exec` |

## 2. Quản lý nội dung (Headless CMS)

Tất cả nội dung text trên Landing Page được quản lý tại sheet `page_content`.

1. **Copy file Google Sheet mẫu**: Tạo bản sao của Master Sheet.
2. **Cập nhật sheet `page_content`**: Thay đổi các giá trị ở cột `value` cho tương ứng với thương hiệu mới.
3. **Deploy Apps Script**:
   - Vào thẻ "Extensions" -> "Apps Script".
   - Dán mã nguồn từ file `COACH_AI_APP_SCRIPT_V5.js`.
   - Lưu và "Deploy" -> "New Deployment" -> "Web App".
   - Chọn "Anyone" có quyền truy cập.
   - Copy URL nhận được dán vào `VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL`.

## 3. Hệ thống Email & Thanh toán

- **Email**: Hệ thống sử dụng Resend API. Đảm bảo domain của đại lý đã được Verify trên Resend Dashboard.
- **Thanh toán**: Cấu hình các biến `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`... trong Cloudflare Environment để tiền đổ về tài khoản của đại lý đó.

## 4. Kiểm tra trước khi Launch

1. Truy cập vào trang web của đại lý.
2. Kiểm tra phần Footer xem tên Công ty và Bản quyền có đúng không.
3. Gửi một yêu cầu liên hệ (Contact) để kiểm tra Email xác nhận có đúng tên thương hiệu không.
4. Thử tạo một link thanh toán để xem trang Redirect có quay lại đúng Domain của đại lý không.

---
*Tài liệu này được tạo tự động bởi hệ thống Quản trị SaaS Edu-Vibe.*
