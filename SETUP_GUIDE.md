# Hướng dẫn Setup API Key - Speech Checker

## 📋 Tổng quan

API key giờ đây được lưu **AN TOÀN** ở server-side trong file `.env` thay vì client-side.

**Ưu điểm:**
- ✅ Bảo mật tuyệt đối - Client không bao giờ thấy API key
- ✅ Setup 1 lần duy nhất
- ✅ Toàn bộ users sử dụng chung 1 API key

## 🚀 Cài đặt

### Bước 1: Cài đặt Python dependencies

```bash
pip install -r requirements.txt
```

Hoặc từng package:
```bash
pip install Flask Flask-CORS python-dotenv requests
```

### Bước 2: Tạo file .env

Copy file template:
```bash
copy .env.example .env
```

Hoặc tạo file `.env` mới với nội dung:
```
GEMINI_API_KEY=your_actual_api_key_here
```

### Bước 3: Lấy Gemini API Key

1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập Google account
3. Click "Create API Key"
4. Copy API key

### Bước 4: Paste API Key vào .env

Mở file `.env` và thay thế:
```
GEMINI_API_KEY=AIzaSy...yourActualKeyHere...xyz123
```

### Bước 5: Chạy Server

```bash
python server.py
```

Server sẽ:
- Tự động mở browser tại http://localhost:8000
- Check API key có hợp lệ không
- Sẵn sàng phân tích speech

## 📂 Cấu trúc Files

```
d:\Project\check-speech\
├── .env                    # API key (KHÔNG commit lên Git)
├── .env.example            # Template file
├── server.py               # Flask server với API proxy
├── app.js                  # Client code (Không chứa API key)
├── index.html              # Giao diện
├── styles.css              # Styling
├── requirements.txt        # Python dependencies
└── public/
    ├── banner.png
    └── logo.jpg
```

## 🔒 Bảo mật

### File .env đã được gitignore

File `.gitignore` đã có:
```
.env
.env.local
*.key
```

**QUAN TRỌNG:** Không bao giờ commit file `.env` lên Git!

### Kiểm tra API Key

Test xem server đã load API key chưa:
```bash
# Mở browser
http://localhost:8000/api/health
```

Response:
```json
{
  "status": "ok",
  "api_key_configured": true
}
```

## ❓ Troubleshooting

### Lỗi: "API key not configured"

**Nguyên nhân:** File `.env` chưa có hoặc API key chưa đúng

**Giải pháp:**
1. Kiểm tra file `.env` có tồn tại không
2. Kiểm tra API key có đúng format không
3. Restart server sau khi sửa `.env`

### Lỗi: "ModuleNotFoundError: No module named 'flask'"

**Nguyên nhân:** Chưa cài Python dependencies

**Giải pháp:**
```bash
pip install -r requirements.txt
```

### Lỗi: "Analysis failed"

**Nguyên nhân:** API key không hợp lệ hoặc hết quota

**Giải pháp:**
1. Kiểm tra API key còn hợp lệ
2. Check quota tại Google AI Studio
3. Tạo API key mới nếu cần

## 🔄 Workflow

1. **User uploads video** → Client
2. **Client gửi video data** → Server endpoint `/api/analyze`
3. **Server đọc API key từ .env** → Gọi Gemini API
4. **Gemini trả kết quả** → Server
5. **Server trả về Client** → Hiển thị results

**Client không bao giờ biết hoặc thấy API key!**

## 📝 Notes

- API key chỉ setup **1 lần duy nhất**
- Mọi users trong tổ chức dùng chung API key
- Admin có thể thay đổi API key bất cứ lúc nào bằng cách:
  1. Sửa file `.env`
  2. Restart server
  3. Done!

## 🎉 Hoàn thành!

Sau khi setup xong, bạn có thể:
1. Upload video speech
2. Click "Analyze Speech"
3. Xem kết quả chi tiết

Không cần nhập API key nữa! 🚀
