# 🎤 Speech Checker - AI-Powered English Speech Analysis

Ứng dụng web phân tích bài speech tiếng Anh của học sinh sử dụng Google Gemini AI. Được thiết kế cho trường học và trung tâm đào tạo tiếng Anh.

![Speech Checker](public/banner.png)

## ✨ Tính năng

- 📤 **Upload video dễ dàng** - Drag & drop hoặc click để chọn
- 🎬 **Hỗ trợ video 1-10 phút** - Định dạng MP4, MOV, AVI, WebM
- 🤖 **AI phân tích chuyên sâu** - Powered by Google Gemini 1.5 Flash
- 📊 **Kết quả chi tiết**:
  - Điểm số tổng thể (0-100)
  - Điểm mạnh (Strengths)
  - Điểm cần cải thiện (Areas for Improvement)
  - Phản hồi chi tiết về phát âm, ngữ pháp, nội dung
- 🎨 **Giao diện đẹp, hiện đại** - Dark theme với animations mượt mà
- 🔒 **Bảo mật API key** - Serverless backend với environment variables
- 📱 **Responsive** - Hoạt động tốt trên mọi thiết bị

## 🚀 Demo

**Live Demo:** [https://check-speech.vercel.app](https://your-deployed-url.vercel.app)

## 🏗️ Công nghệ

### Frontend
- HTML5, CSS3, Vanilla JavaScript
- Modern design with CSS variables
- Smooth animations and transitions

### Backend
- Vercel Serverless Functions (Python)
- Google Gemini 1.5 Flash API
- Environment variables cho API key

### Deployment
- Frontend: Vercel (auto-deploy từ GitHub)
- Serverless Functions: Vercel Python Runtime
- Free hosting với SSL (HTTPS)

## 📦 Cài đặt Local

### Prerequisites
- Python 3.7+ (cho local testing)
- Git

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/check-speech.git
cd check-speech
```

### Setup Python Environment (Optional - cho local testing)

```bash
# Tạo virtual environment
python -m venv venv

# Activate
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Configure API Key (cho local)

1. Copy file template:
```bash
copy .env.example .env
```

2. Sửa file `.env`:
```
GEMINI_API_KEY=your_actual_api_key_here
```

3. Lấy API key từ: https://makersuite.google.com/app/apikey

### Run Local Server (cho testing)

```bash
python server.py
```

Mở browser: http://localhost:8000

## 🌐 Deploy lên Vercel (Production)

Chi tiết xem file: **[VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)**

### Quick Start

1. **Push lên GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect Vercel**
   - Vào https://vercel.com
   - Import GitHub repository
   - Add environment variable `GEMINI_API_KEY`
   - Deploy!

3. **Done!** 🎉

## 📁 Cấu trúc Project

```
check-speech/
├── api/
│   └── analyze.py          # Vercel serverless function
├── public/
│   ├── banner.png          # Banner image
│   └── logo.jpg            # Logo
├── index.html              # Main HTML
├── styles.css              # Styling
├── app.js                  # Frontend logic
├── server.py               # Local development server
├── vercel.json             # Vercel configuration
├── requirements.txt        # Python dependencies
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── README.md               # This file
├── VERCEL_DEPLOY.md        # Deployment guide
└── SETUP_GUIDE.md          # Setup instructions
```

## 🎯 Cách sử dụng

1. **Upload Video**
   - Kéo thả video vào vùng upload
   - Hoặc click để browse file
   - Video phải dài 1-10 phút

2. **Analyze**
   - Click nút "Analyze Speech"
   - Đợi AI xử lý (30s - 2 phút tùy video)

3. **Xem Kết quả**
   - Điểm số tổng thể
   - Điểm mạnh và điểm cần cải thiện
   - Phản hồi chi tiết

4. **New Analysis**
   - Click "New Analysis" để phân tích video mới

## 🔐 Bảo mật

- ✅ API key được lưu server-side (Vercel environment variables)
- ✅ Không bao giờ expose API key ra client
- ✅ HTTPS/SSL mặc định
- ✅ CORS configured properly

## 📊 Phản hồi AI bao gồm

- **Pronunciation** - Phát âm và độ rõ ràng
- **Fluency** - Độ trôi chảy và tốc độ nói
- **Grammar** - Ngữ pháp và cấu trúc câu
- **Vocabulary** - Vốn từ vựng và cách sử dụng
- **Content** - Tổ chức nội dung và logic
- **Delivery** - Sự tự tin và cách trình bày

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Erik-Karik**

## 📧 Contact

- **Địa chỉ:** 153 Văn Tiến Dũng, Hòa Xuân, Quận Cẩm Lệ, TP Đà Nẵng
- **SĐT:** 093 556 37 27
- **Email:** anhngusm.vp@gmail.com

## 🙏 Acknowledgments

- Google Gemini AI for speech analysis
- Vercel for free hosting
- Open source community

---

**Made with ❤️ for English language learners**
