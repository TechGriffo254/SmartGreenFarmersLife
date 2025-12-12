# Smart Greenhouse Farmers Life - Quick Start

## Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account
- API Keys ready

## 1. Environment Setup (5 minutes)

### Backend Configuration
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add your keys:
```
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-secret-key-min-32-chars
GEMINI_API_KEY=your-gemini-key
WEATHER_API_KEY=your-openweather-key
HF_API_KEY=your-huggingface-key
```

### Frontend Configuration
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```
VITE_API_URL=http://localhost:5000
VITE_GEMINI_API_KEY=your-gemini-key
```

## 2. Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```

Expected output:
```
Server running on port 5000
Connected to MongoDB
Starting data aggregation service
```

## 3. Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.0.8  ready in 500 ms
Local: http://localhost:3000
```

## 4. Test the System

1. Open browser: http://localhost:3000
2. Login with demo account:
   - Email: admin@greenhouse.com
   - Password: admin123

3. Test features:
   - Dashboard (sensor monitoring)
   - AI Assistant (chat with voice)
   - Pest Detection (upload/camera)
   - Weather & Recommendations
   - Language toggle (EN/SW)

## 5. API Keys (Free Tier)

### Google Gemini
- Visit: https://makersuite.google.com/app/apikey
- Create project → Get API key
- Free: 60 requests/minute

### OpenWeatherMap
- Visit: https://openweathermap.org/api
- Sign up → Generate key
- Free: 1000 calls/day

### HuggingFace
- Visit: https://huggingface.co/settings/tokens
- Create read token
- Free: Unlimited inference

### MongoDB Atlas
- Visit: https://www.mongodb.com/cloud/atlas/register
- Create cluster → Get connection string
- Free: 512MB storage

## Troubleshooting

### Port Already in Use
```bash
# Backend
netstat -ano | findstr :5000
taskkill /PID <pid> /F

# Frontend
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

### MongoDB Connection Failed
- Check MONGODB_URI format
- Whitelist IP: 0.0.0.0/0 in Atlas
- Verify username/password

### Dependencies Issues
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

See `KOYEB_DEPLOYMENT_GUIDE.md` for cloud deployment steps.

## Repository
https://github.com/TechGriffo254/SmartGreenFarmersLife
