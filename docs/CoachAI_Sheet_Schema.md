# Coach AI Control Panel - Google Sheets Schema

Tạo 1 file Google Sheet tên: `CoachAI_Control_Panel`.
Chia thành 5 sheet sau để dùng làm CMS cho trang `/coachai`.

## 1. Sheet: bots
Đây là sheet chính để render card trên `/coachai`.

| Cột | Kiểu | Mô tả |
| :--- | :--- | :--- |
| `id` | text | ID duy nhất, ví dụ `bot_student_ai_01` |
| `title` | text | Tên bot/card hiển thị |
| `slug` | text | Slug nội bộ |
| `role_target` | enum | `student`, `teacher`, `admin`, `all` |
| `category` | enum | `gem`, `notebooklm`, `course`, `support`, `tool` |
| `short_desc` | text | Mô tả ngắn 1-2 câu |
| `long_desc` | text | Mô tả chi tiết popup/modal |
| `button_primary_text` | text | Ví dụ: Mở Gem |
| `button_primary_url` | url | Link Gem hoặc NotebookLM |
| `button_secondary_text` | text | Ví dụ: Xem khóa học |
| `button_secondary_url` | url | Link course/pricing |
| `thumbnail_url` | url | Ảnh card |
| `course_slug` | text | Khóa học liên quan |
| `owner_role` | enum | `admin`, `teacher` |
| `owner_email` | text | Người chịu trách nhiệm |
| `status` | enum | `active`, `draft`, `hidden`, `coming_soon` |
| `featured` | boolean | Có nổi bật trang đầu không (`TRUE`/`FALSE`) |
| `sort_order` | number | Thứ tự hiển thị (từ nhỏ đến lớn) |
| `tags` | text | Tags (comma separated) ví dụ: `ai,affiliate,teacher` |
| `language` | enum | `vi`, `en` |
| `updated_at` | datetime | Thời gian cập nhật |
| `updated_by` | text | Email người cập nhật |

## 2. Sheet: courses_ai
Dùng để tự động tham chiếu dữ liệu khóa học vào bot.

| Cột | Mô tả |
| :--- | :--- |
| `course_slug` | Slug khóa học (tham chiếu chéo với `bots`) |
| `course_name` | Tên khóa học |
| `teacher_name` | Tên Giảng viên |
| `gem_url` | Link Gem dành riêng của khóa |
| `notebooklm_url` | Link NotebookLM của khóa |
| `support_doc_url` | Link Docs/Drive hỗ trợ |
| `pricing_url` | Link trang thanh toán/giá |
| `status` | `active`, `draft`, `hidden` |

## 3. Sheet: teachers_permissions
Chỉ định quyền hạn giáo viên.

| Cột | Mô tả |
| :--- | :--- |
| `teacher_email` | Email giáo viên muốn cấp quyền |
| `teacher_name` | Tên giáo viên |
| `allowed_role` | `teacher` |
| `can_edit_bots` | `TRUE` hoặc `FALSE` |
| `can_edit_courses`| `TRUE` hoặc `FALSE` |
| `allowed_course_slugs`| Các slug họ được phép quản lý (comma separated) |
| `allowed_bot_ids` | Các bot ID họ được quản lý (comma separated) |
| `status` | `active`, `inactive` |

## 4. Sheet: page_content
Các nội dung động trên trang giao diện (Hero, CTA, FAQ).

| Cột | Mô tả |
| :--- | :--- |
| `key` | ID key, ví dụ: `hero_title`, `hero_subtitle` |
| `value_vi` | Nội dung cho bản tiếng Việt |
| `value_en` | Nội dung cho bản tiếng Anh |
| `status` | `active`, `hidden` |
| `updated_at` | Thời gian cập nhật cuối |

## 5. Sheet: audit_log
Ghi log tự động bất kỳ ai (admin/teacher) thay đổi dữ liệu nào.

| Cột | Mô tả |
| :--- | :--- |
| `timestamp` | Thời điểm chỉnh sửa |
| `user_email`| Người thực hiện thay đổi |
| `action` | `create`, `update`, `hide`, `delete` |
| `sheet_name`| `bots`, `courses_ai`, `page_content` |
| `record_id` | ID của dòng bị tác động |
| `changes_json`| Nội dung dữ liệu cũ và mới ở định dạng JSON |
