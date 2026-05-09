# Hướng dẫn Quản trị viên (Admin Guide)

Admin Dashboard là trung tâm điều khiển toàn bộ hệ thống. Dưới đây là các thao tác cơ bản.

## 1. Truy cập Dashboard
- Đường dẫn: `/dashboard/admin` hoặc `/admin`.
- Quyền: Chỉ tài khoản có Role `admin` trong Firestore mới có thể truy cập.

## 2. Quản lý Cài đặt Hệ thống
- **Thông tin App**: Thay đổi tên ứng dụng, email hỗ trợ, số hotline. Các thông tin này sẽ cập nhật ngay lập tức trên trang chủ và navbar.
- **Affiliate Rate**: Thiết lập tỷ lệ hoa hồng (mặc định 30-50%).
- **Lưu cài đặt**: Nhấn nút "Lưu cài đặt" để đồng bộ dữ liệu về Google Sheets (Tab `Tenants`).

## 3. Phê duyệt Giao dịch
- **Nâng cấp VIP**: Khi học viên chuyển khoản, thông tin sẽ xuất hiện trong tab Finance. Admin kiểm tra tài khoản ngân hàng và nhấn "Xác nhận" để kích hoạt Role VIP cho học viên.
- **Rút tiền (Payout)**: Khi giảng viên gửi yêu cầu rút tiền, Admin thực hiện chuyển khoản bên ngoài và nhấn "Mark as Paid" để cập nhật trạng thái lịch sử.

## 4. Quản lý Khóa học
- Giảng viên tạo khóa học mới sẽ ở trạng thái `draft`.
- Admin vào tab Quản lý khóa học, kiểm tra nội dung và nhấn "Duyệt" (Publish) để khóa học hiển thị công khai.

## 5. Thao tác trên Google Sheets
- Nếu Dashboard gặp sự cố, bạn có thể mở trực tiếp file Google Sheets thông qua nút "Google Sheets" trong phần Cài đặt.
- **Lưu ý**: Không thay đổi cấu trúc các cột (Header) trong file Sheet để tránh lỗi đồng bộ.
