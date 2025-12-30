# 🚀 Deploy Speech Checker lên Vercel

## 📋 Tổng quan

Ứng dụng này sử dụng:
- **Frontend**: Static HTML/CSS/JS (tự động deploy)
- **Backend**: Vercel Serverless Functions (Python)
- **API Key**: Environment variable trên Vercel (bảo mật)

## 🎯 Chuẩn bị

### 1. Tạo GitHub Repository

```bash
# Init git (nếu chưa có)
git init

# Add files
git add .

# Commit
git commit -m "Initial commit - Speech Checker"

# Create repo trên GitHub và push
git remote add origin https://github.com/YOUR_USERNAME/check-speech.git
git branch -M main
git push -u origin main
```

### 2. Lấy Gemini API Key

1. Truy cập: https://makersuite.google.com/app/apikey
2. Tạo API key mới
3. Copy key (sẽ dùng ở bước sau)

## 🌐 Deploy lên Vercel

### Option 1: Deploy qua Vercel Dashboard (Dễ nhất)

1. **Truy cập Vercel**
   - Vào: https://vercel.com
   - Sign in với GitHub account

2. **Import Project**
   - Click "Add New" → "Project"
   - Chọn GitHub repository `check-speech`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Other** (để mặc định)
   - Root Directory: `./` (để mặc định)
   - Build Command: Để trống
   - Output Directory: `./` (để mặc định)

4. **Add Environment Variable**
   - Click "Environment Variables"
   - Name: `GEMINI_API_KEY`
   - Value: Paste API key của bạn
   - Environment: **Production**, **Preview**, **Development** (chọn cả 3)
   - Click "Add"

5. **Deploy**
   - Click "Deploy"
   - Đợi 1-2 phút
   - Done! 🎉

### Option 2: Deploy qua Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variable
vercel env add GEMINI_API_KEY

# Paste your API key when prompted
# Select: Production, Preview, Development (all)

# Deploy again to apply env vars
vercel --prod
```

## ✅ Kiểm tra Deploy

Sau khi deploy xong, Vercel sẽ cho bạn URL, ví dụ:
```
https://check-speech-abc123.vercel.app
```

### Test API endpoint:

Mở browser:
```
https://check-speech-abc123.vercel.app/api/analyze
```

Nếu thấy lỗi "No video data provided" → **Thành công!** ✅

## 🔧 Cấu trúc Project cho Vercel

```
check-speech/
├── api/
│   └── analyze.py          # Serverless function
├── public/
│   ├── banner.png
│   └── logo.jpg
├── index.html              # Frontend
├── styles.css
├── app.js
├── vercel.json             # Vercel config
├── requirements.txt        # Python dependencies
└── .vercelignore          # Files to ignore
```

## 🔄 Auto Deploy

Mỗi khi bạn push code mới lên GitHub:
```bash
git add .
git commit -m "Update features"
git push
```

Vercel sẽ **TỰ ĐỘNG deploy** lại! 🚀

## 🌍 Custom Domain (Optional)

1. Vào Vercel Dashboard → Project Settings
2. Domains → Add Domain
3. Nhập domain của bạn (miễn phí)
4. Follow hướng dẫn config DNS

Ví dụ: `speech-checker.yourdomain.com`

## 🔐 Bảo mật

### Environment Variables trên Vercel

- ✅ API key được lưu bảo mật
- ✅ Không bao giờ lộ ra client
- ✅ Chỉ truy cập được từ serverless function

### Update API Key

Nếu cần đổi API key:
1. Vào Project Settings → Environment Variables
2. Edit `GEMINI_API_KEY`
3. Save
4. Redeploy (Vercel tự động)

## 📊 Logs & Monitoring

### Xem Logs

Vercel Dashboard → Your Project → Functions → Logs

### Monitor Usage

- Bandwidth
- Function invocations
- Errors

## 💰 Pricing

**Vercel Free Tier:**
- ✅ 100GB bandwidth/month
- ✅ Unlimited serverless function invocations
- ✅ Unlimited projects
- ✅ Custom domains

**Đủ cho 1000+ users/month!**

## ❓ Troubleshooting

### Lỗi: "API key not configured"

**Giải pháp:**
1. Kiểm tra Environment Variable đã add chưa
2. Redeploy project

### Lỗi: 504 Timeout

**Nguyên nhân:** Video quá dài

**Giải pháp:**
- Giới hạn video < 5 phút
- Hoặc nâng timeout trong `analyze.py`

### Lỗi: Build failed

**Giải pháp:**
1. Check `vercel.json` syntax
2. Check `requirements.txt` có đúng

## 🎉 Hoàn thành!

Sau khi deploy xong:

1. ✅ Website public tại: `https://your-project.vercel.app`
2. ✅ Tự động SSL (HTTPS)
3. ✅ Global CDN (nhanh toàn cầu)
4. ✅ Auto deploy khi push GitHub
5. ✅ API key bảo mật 100%

**Giờ bạn có thể share link cho học sinh sử dụng!** 🚀

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- GitHub Issues: Create issue in your repo
