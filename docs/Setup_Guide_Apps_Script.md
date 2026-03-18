# Hướng dẫn Setup Data (Google Sheets & Apps Script) từ A-Z

Chào bạn, vì dữ liệu là nền tảng quan trọng nhất, chúng ta sẽ tạm dừng phần giao diện Web (React) và ưu tiên cấu hình chuẩn hệ thống CMS trên Google Sheet của bạn trước.

Dưới đây là các bước chi tiết bạn cần thực hiện theo thứ tự:

## Bước 1: Mở File Google Sheets Gốc
1. Truy cập trực tiếp vào Google Sheet Hệ thống của bạn:
   [Link Google Sheet Hệ Thống](https://docs.google.com/spreadsheets/d/1mq9Ri-oqvqMPBYLMnBxixD57hmmwkuASFL-m2CsIC0k/edit)
2. Đảm bảo bạn đang đăng nhập bằng **tài khoản Owner** (có toàn quyền chỉnh sửa file này).

## Bước 2: Cập Nhật Google Apps Script (Version 5.0)
Hệ thống hiện tại có chứa thông tin Giáo viên (Teachers), Leads, Courses. Đoạn code `google-apps-script.js` trong VSCode của bạn đã được tôi viết lại thành mục tiêu Version 5.0 (Tương thích ngược 100% với cái cũ và thêm module AI Hub).

1. Tại cửa sổ Google Sheets đang mở, trên thanh menu click vào **Tiện ích mở rộng (Extensions)** > Chọn **Apps Script**.
2. Một tab mới mở ra chứa trình soạn thảo mã (Code.gs).
3. **XÓA TOÀN BỘ** code cũ đang có trong đó.
4. Mở file `google-apps-script.js` trong thư mục dự án VSCode của bạn.
5. **COPY** toàn bộ nội dung file đó và **PASTE** vào màn hình Apps Script.
6. Nhấn nút **Lưu (Save)** biểu tượng đĩa mềm hoặc phím tắt `Ctrl + S`.

## Bước 3: Chạy Lệnh Khởi Tạo (Auto Setup)
Bước này để cấu hình cấu trúc tự động (tạo sheet mới, format tiêu đề, nhồi dữ liệu mẫu) mà bạn không cần tạo tay.

1. Ở phía trên màn hình Apps Script, chỗ có nút **Chạy (Run)**, bạn tìm dropdown đang ghi chữ `doGet` hoặc chữ khác.
2. Click vào dropdown đó, chọn hàm **`setupSheets`**.
3. Bấm nút **Chạy (Run)**.
   *(Lưu ý: Nếu Google hiện thông báo yêu cầu cấp quyền "Authorization Required", hãy ấn Review Permissions -> Chọn tài khoản Google -> Chọn Advanced (Nâng cao) -> Go to App (Không an toàn) -> Allow (Cho phép))*
4. Quan sát ở khung "Execution log" (Nhật ký thực thi) bên dưới, nếu hiện chữ `Execution completed` là thành công.
5. Quay lại file Google Sheets, bạn sẽ thấy nó tự đẻ ra thêm 3 sheet mới: `bots`, `courses_ai`, `page_content` đã được tô màu xám ở dòng 1 và đóng băng chuẩn chỉnh, đồng thời có vài dòng dữ liệu mẫu tôi chuẩn bị sẵn.

## Bước 4: Triển Khai Thành Web App (Lấy API Link)
Để biến Apps Script vừa rồi thành 1 link API kết nối được với website frontend:

1. Trở lại tab Apps Script. Góc trên cùng bên phải, click vào nút màu xanh **Deploy (Triển khai)**.
2. Chọn **New deployment (Triển khai mới)**.
3. Ở cột bên trái của hộp thoại "Select type" (Chọn loại), chọn **Web app** (biểu tượng bánh răng).
4. Điền các thiết lập cực kỳ quan trọng sau:
   - **Description (Mô tả):** Ghi chú ví dụ "V5.0 - Add CoachAI Hub"
   - **Execute as (Thực thi dưới quyền):** Trỏ chọn `Me (tên-email-của-bạn)`
   - **Who has access (Ai có quyền truy cập):** Bắt buộc chọn `Anyone (Bất kỳ ai)`
5. Bấm nút **Deploy (Triển khai)** ở góc dưới. Google có thể đòi cấp quyền một lần nữa (làm tương tự Bước 3 nếu hỏi).
6. Màn hình cuối cùng sẽ hiện ra một dòng **Web app URL** (bắt đầu bằng `https://script.google.com/macros/s/...`). 
7. **COPY LINK ĐÓ DÁN VÀO ĐÂY CHO TÔI ĐỂ KIỂM TRA.**

## 🎯 Hoàn Thành
Làm xong 4 bước trên coi như 80% công việc lõi Data CMS đã xong. Nếu quá trình làm có lỗi ở đâu, bạn hãy gửi thông báo lỗi cho tôi nhé!
