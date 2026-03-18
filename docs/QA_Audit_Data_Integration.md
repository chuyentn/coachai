# Báo Cáo QA Audit - Tích hợp Dữ liệu Coach AI

Dựa trên yêu cầu tích hợp dữ liệu AI Hub (Bots, Courses AI, Page Content) vào thẳng core Google Sheet hiện tại (`1mq9Ri-oqvqMPBYLMnBxixD57hmmwkuASFL-m2CsIC0k`) mà không tạo mới file rời rạc, dưới đây là kết quả Audit và Kiến trúc đã được chuẩn hóa.

## 1. Tích Hợp Schema (Đã Hoàn Thành)
File `google-apps-script.js` đã được cập nhật để chứa chung một `SCHEMA` tổng thống nhất toàn bộ dữ liệu của hệ thống:
```javascript
const SCHEMA = {
  
  // -- CÁC MODULE CŨ CÒN NGUYÊN BẢN --
  'Courses': [ ... ],
  'Leads': [ ... ],
  'Comments': [ ... ],
  'Teachers': [ ... ],
  
  // -- CÁC MODULE MỚI THÊM VÀO --
  'bots': [ 'id', 'title', 'slug', 'role_target', 'category', 'short_desc', 'long_desc', 'button_primary_text', 'button_primary_url', 'button_secondary_text', 'button_secondary_url', 'thumbnail_url', 'course_slug', 'owner_role', 'owner_email', 'status', 'featured', 'sort_order', 'tags', 'language', 'updated_at', 'updated_by' ],
  'courses_ai': [ 'course_slug', 'course_name', 'teacher_name', 'gem_url', 'notebooklm_url', 'support_doc_url', 'pricing_url', 'status' ],
  'page_content': [ 'key', 'value_vi', 'value_en', 'status', 'updated_at' ]
};
```

## 2. API Endpoints Chuẩn Hóa
Đã thêm và map các phương thức GET mới vào hàm `doGet(e)` để React Frontend có thể gọi thông qua Web App URL:
- `?action=getConfig&lang=vi`: Trả về toàn bộ Hero Content và danh sách Bots cho lần tải trang đầu tiên của `/coachai`.
- `?action=getBots&role=student&lang=vi`: Trả về riêng danh sách Bot đã được lọc theo role và ngôn ngữ.

*Các endpoint cũ như `getCourses`, `getLeads` vẫn giữ nguyên không bị ảnh hưởng.*

## 3. Khởi Tạo Tự Động (Auto-Seed)
Bạn **CHỈ CẦN** copy toàn bộ nội dung file `google-apps-script.js` ở project này (Version 5.0), dán đè vào Apps Script gắn với Sheet `1mq9Ri-oqvq.` của bạn.
Sau đó, chạy hàm `setupSheets()` hoặc gọi webhook URL `?action=setup`. 
Hệ thống sẽ tự động:
1. Tạo thêm các tab `bots`, `courses_ai`, `page_content` mà không làm mất `Teachers` hay `Courses` cũ.
2. Tạo Header có màu xám, in đậm, đóng băng dòng 1 ở các tab này.
3. Bơm (Seed) sẵn 5 mẫu Card Bots chuẩn và nội dung Hero vào thẳng Sheet để frontend chạy ngay lập tức.

## 4. Frontend Fallback Test
Trong lúc chờ bạn Deploy Web App của Apps Script và lấy URL dán vào `src/pages/CoachAI.tsx`, trang `/coachai` đã được trang bị **Fallback JSON Data** khớp 100% với kiến trúc Sheet. 
Nghĩa là bạn có thể `npm run dev` và xem UI của trang Coach AI ngay bây giờ kể cả khi API chưa nối.

## 🚀 Bước Tiếp Theo Dành Cho Bạn (Action Required)
1. Mở Sheet: `https://docs.google.com/spreadsheets/d/1mq9Ri-oqvqMPBYLMnBxixD57hmmwkuASFL-m2CsIC0k/edit`
2. Mở `Extensions` (Tiện ích mở rộng) -> `Apps Script`
3. Copy toàn bộ code trong `google-apps-script.js` ở VSCode dán đè vào đó.
4. Chạy hàm `setupSheets` để cấu hình tự động.
5. Triển khai (Deploy) làm Web App.
6. Lấy Web App URL dán vào biến `APPS_SCRIPT_API_URL` ở dòng 7 file `src/pages/CoachAI.tsx`.
