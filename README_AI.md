# Hướng dẫn Cấu hình AI Multi-Key (Gemini & OpenAI)

Hệ thống Edu-Vibe hỗ trợ cơ chế **Xoay vòng Key (Rotation)** tự động để đảm bảo AI Coach luôn hoạt động ngay cả khi một số Key bị hết hạn mức (Rate Limit).

## 🛠 Cách cấu hình trong file `.env`

Bạn cần mở file `.env` ở thư mục gốc và cập nhật các dòng sau:

### 1. Cấu hình Gemini (Ưu tiên)
Sử dụng cho AI Coach và AI Role-Play. Bạn có thể nhập nhiều Key phân cách bởi dấu phẩy.

```env
GEMINI_API_KEYS="AIzaSyA...,AIzaSyB...,AIzaSyC..."
```

### 2. Cấu hình OpenAI (Dự phòng)
Sử dụng khi bạn muốn chuyển sang GPT-4 hoặc dùng làm phương án dự phòng cho Gemini.

```env
OPENAI_API_KEYS="sk-proj-...,sk-proj-..."
```

## ☁️ Hướng dẫn thiết lập trên Cloudflare (Dành cho bản Online)

Như hình ảnh bạn đã mở trong Dashboard Cloudflare, bạn cần thực hiện các bước sau để cấu hình "chuẩn" cho bản Online:

1. **Truy cập**: Settings > Variables and Secrets.
2. **Xóa biến cũ (nếu cần)**: Xóa biến `GEMINI_API_KEY` (nếu là dạng cũ, chỉ có 1 key).
3. **Thêm biến mới**:
   - Nhấn **Add variable**.
   - **Name**: `GEMINI_API_KEYS`
   - **Value**: Dán chuỗi các Key của bạn (ví dụ: `key1,key2,key3`).
   - Làm tương tự với `OPENAI_API_KEYS` nếu có.
4. **Lưu ý về Type**: Đảm bảo chọn Type là **Secret** (Secret variable) để bảo mật Key của bạn, không để ở dạng **Plaintext** nếu có thể (mặc dù Cloudflare Pages hỗ trợ cả hai, nhưng Secret là chuẩn nhất).
5. **Redeploy**: Sau khi lưu các biến, bạn cần vào tab **Deployments** và thực hiện **Retry deployment** hoặc đẩy code mới lên để hệ thống nhận cấu hình mới.

## 🚀 Cơ chế hoạt động của Group AI High Availability

1. **Ưu tiên Gemini**: Hệ thống sẽ luôn thử các Key trong `GEMINI_API_KEYS` trước.
2. **Round-Robin**: Hệ thống sẽ xoay vòng qua các Key trong danh sách.
3. **Tự động chuyển tiếp (Failover)**: Nếu một Key gặp lỗi `429 (Too Many Requests)` hoặc `Quota Exceeded`, hệ thống sẽ lập tức thử Key tiếp theo trong danh sách mà không làm gián đoạn trải nghiệm của học viên.
4. **Hỗ trợ OpenAI**: Nếu cấu hình OpenAI, hệ thống có thể được thiết lập để dùng GPT nếu toàn bộ Gemini Keys đều lỗi.

## ⚠️ Lưu ý quan trọng
- Không để khoảng trắng sau dấu phẩy giữa các Key.
- Các Key phải được đặt trong dấu ngoặc kép `" "`.
- Đảm bảo các Key còn hiệu lực và đã được kích hoạt trong AI Studio (Gemini) hoặc OpenAI Dashboard.
