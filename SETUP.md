# Smart Greenhouse Farmers Life v2.0

## Installation

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

## Testing the System

### 1. Backend Test
```bash
cd backend
npm run dev
```

Visit: http://localhost:5000
Expected: JSON response with API status

### 2. Frontend Test
```bash
cd frontend
npm run dev
```

Visit: http://localhost:3000
Expected: Login page loads

### 3. Login Test
Credentials:
- Email: admin@greenhouse.com
- Password: admin123

## Pushing to New Repository

First, create the repository on GitHub:
1. Go to https://github.com/new
2. Repository name: SmartGreenFarmersLife
3. Don't initialize with README

Then push:
```bash
git remote add origin https://github.com/TechGriffo254/SmartGreenFarmersLife.git
git push -u origin main
```

Or if remote already exists:
```bash
git push newrepo main
```

## Required Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_key
WEATHER_API_KEY=your_weather_key
HF_API_KEY=your_huggingface_key
PORT=5000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_GEMINI_API_KEY=your_gemini_key
VITE_WEATHER_API_KEY=your_weather_key
VITE_HF_API_KEY=your_huggingface_key
```

## Features

- Real-time IoT monitoring
- AI farming assistant (Google Gemini)
- Pest detection (YOLO11)
- Weather integration
- Multilingual support (English/Swahili)
- Data aggregation & analytics
