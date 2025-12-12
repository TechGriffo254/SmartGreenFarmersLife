# Smart Greenhouse Farmers Life - Installation Guide

## 🎯 Complete Setup Instructions

### Step 1: Install Dependencies

#### Backend
```powershell
cd backend
npm install
```

#### Frontend
```powershell
cd frontend
npm install
```

### Step 2: Environment Configuration

#### Backend `.env`
Copy `.env.example` to `.env` and fill in your credentials:

```powershell
cd backend
Copy-Item .env.example .env
notepad .env
```

Required variables:
- `MONGODB_URI` - Get from MongoDB Atlas
- `JWT_SECRET` - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `GEMINI_API_KEY` - Get from https://makersuite.google.com/app/apikey
- `WEATHER_API_KEY` - Get from https://openweathermap.org/api
- `HF_API_KEY` - Get from https://huggingface.co/settings/tokens

#### Frontend `.env`
```powershell
cd frontend
Copy-Item .env.example .env
notepad .env
```

### Step 3: Start Development Servers

#### Terminal 1 - Backend
```powershell
cd backend
npm run dev
```

#### Terminal 2 - Frontend  
```powershell
cd frontend
npm run dev
```

### Step 4: Access Application

Open browser: **http://localhost:3000**

Default login:
- Email: `admin@greenhouse.com`
- Password: `admin123`

---

## 🔧 Troubleshooting

### MongoDB Connection Issues
1. Whitelist IP in MongoDB Atlas: Network Access → Add IP Address → Allow Access from Anywhere (`0.0.0.0/0`)
2. Check connection string format
3. Verify username/password

### Port Already in Use
```powershell
# Backend (Port 5000)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Frontend (Port 3000)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module Not Found Errors
```powershell
# Clean install
cd backend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

cd ../frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Vite Build Errors
```powershell
cd frontend
npm run build
# Check for any import errors or missing dependencies
```

---

## 📦 Production Build

### Backend
```powershell
cd backend
npm start
```

### Frontend
```powershell
cd frontend
npm run build
npm run preview
```

---

## 🚀 First-Time Setup Checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB Atlas cluster created
- [ ] API keys obtained (Gemini, Weather, HuggingFace)
- [ ] Backend `.env` configured
- [ ] Frontend `.env` configured
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend server running on port 5000
- [ ] Frontend dev server running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can login with default credentials
- [ ] Real-time updates working
- [ ] Language switcher working

---

## 🌐 Browser Support

- Chrome 90+ (Recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

**Note:** Camera and voice features require HTTPS in production or localhost in development.

---

## 📞 Need Help?

Create an issue on GitHub with:
- Error message
- Steps to reproduce
- Your environment (OS, Node version, browser)
- Console logs (if applicable)
