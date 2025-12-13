# Complete Feature Testing Guide

## Overview
All 5 new features have been implemented:
1. ✅ IoT Data Pipeline (Telemetry + Averages)
2. ✅ AI Agronomist Chat
3. ✅ Pest & Disease Scanner
4. ✅ Weather Crop Advisor
5. ✅ Swahili Translations

---

## Prerequisites

### 1. Install Dependencies
```powershell
# Backend (ROOT directory)
cd c:\Users\Admin\workspaces\SmartGreenFarmersLife
npm install

# Frontend
cd c:\Users\Admin\workspaces\SmartGreenFarmersLife\frontend
npm install
```

### 2. Configure Environment Variables
Create `.env` file in ROOT directory:
```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_key_from_google_ai_studio
HF_API_TOKEN=your_huggingface_token
OPENWEATHER_KEY=your_openweathermap_key
```

**Get API Keys:**
- Gemini: https://aistudio.google.com/app/apikey
- HuggingFace: https://huggingface.co/settings/tokens
- OpenWeatherMap: https://openweathermap.org/api

---

## Start Servers

### Backend (Terminal 1)
```powershell
cd c:\Users\Admin\workspaces\SmartGreenFarmersLife
node server.js
```
**Expected Output:**
```
🚀 Server running on port 5000
📊 MongoDB Connected: smart-greenhouse
⏰ Telemetry aggregation service started (every 5 minutes)
```

### Frontend (Terminal 2)
```powershell
cd c:\Users\Admin\workspaces\SmartGreenFarmersLife\frontend
npm run dev
```
**Expected Output:**
```
VITE v7.2.7  ready in 450 ms
➜  Local:   http://localhost:3000/
```

---

## Feature Testing

### 1. IoT Telemetry System ✅

**Test POST Telemetry:**
```powershell
$body = @{
    deviceId = "ESP32-GH-001"
    temperature = 26.5
    humidity = 72
    soilMoisture = 65
    lightLevel = 850
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/telemetry" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Telemetry data saved successfully",
  "data": { "deviceId": "ESP32-GH-001", ... }
}
```

**Test GET Averages:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/averages?deviceId=ESP32-GH-001&days=7"
```

**Frontend Check:**
- Socket.IO should broadcast new data in <1s
- Dashboard graphs should update automatically

---

### 2. AI Agronomist Chat ✅

**Backend Test:**
```powershell
$body = @{
    message = "Jinsi ya kupanda mahindi?"
    language = "sw"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/ai/chat" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response (Swahili):**
```json
{
  "success": true,
  "data": {
    "message": "Panda mahindi wakati wa mvua. Tumia mbegu za ubora. Panda kwa nafasi ya cm 75x25. Weka mbolea DAP (50kg/ekari) wakati wa kupanda. Nyunyiza Urea baada ya wiki 3-4. Palilia mara 2-3. Vuna baada ya miezi 3-4.",
    "language": "sw"
  }
}
```

**Frontend Test:**
1. Login to dashboard
2. Click "AI Agronomist" in sidebar
3. Type or speak question (Swahili/English)
4. Verify voice input works (Chrome/Edge)
5. Verify AI response auto-speaks
6. Test language toggle (top-right)

---

### 3. Pest & Disease Scanner ✅

**Backend Test:**
```powershell
# Save a sample plant image as base64
$imagePath = "C:\path\to\plant_image.jpg"
$imageBytes = [System.IO.File]::ReadAllBytes($imagePath)
$base64 = [System.Convert]::ToBase64String($imageBytes)

$body = @{
    imageBase64 = "data:image/jpeg;base64,$base64"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/pest/detect" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "detections": [
      {
        "label": "Tomato___Late_blight",
        "confidence": 85,
        "diseaseType": "disease"
      }
    ],
    "totalFound": 1
  }
}
```

**Frontend Test:**
1. Navigate to "Pest Scanner"
2. Upload plant image or capture photo
3. Wait for HuggingFace inference (20-30s first time)
4. Verify detections displayed with confidence %
5. Verify AI remedy auto-fetched (Swahili/English)
6. Test "Try Again" button

**Note:** First request may return 503 (model loading). Wait 20s and retry.

---

### 4. Weather Crop Advisor ✅

**Backend Test - Get Forecast:**
```powershell
# Default: Nairobi (-1.2864, 36.8172)
Invoke-RestMethod -Uri "http://localhost:5000/api/weather/forecast?lat=-1.2864&lon=36.8172"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "location": {
      "name": "Nairobi",
      "country": "KE"
    },
    "forecasts": [
      {
        "date": "2025-12-13",
        "tempMin": 18,
        "tempMax": 26,
        "tempAvg": 22,
        "humidity": 65,
        "rainfall": 0,
        "windSpeed": 3.2,
        "condition": "Clouds"
      }
      // ... 4 more days
    ]
  }
}
```

**Backend Test - Get Crop Advice:**
```powershell
$forecasts = @(
  @{ date = "2025-12-13"; tempAvg = 22; rainfall = 0; humidity = 65; condition = "Clouds" }
)

$body = @{
    forecasts = $forecasts
    cropType = "maize"
    language = "sw"
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:5000/api/weather/crop-advice" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Frontend Test:**
1. Navigate to "Weather Advisor"
2. Verify 5-day forecast displays with emojis
3. Select crop (Maize, Tomatoes, Beans, etc.)
4. Click "Pata Ushauri" (Get Advice)
5. Verify AI advice in Swahili/English
6. Test "Refresh" button
7. Check weather summary (avg temp, total rain, humidity)

---

### 5. Swahili Translations ✅

**Test Language Toggle:**
1. Login to dashboard
2. Click language toggle (top-right): EN ↔ SW
3. Navigate through all pages:
   - Overview
   - Sensor Monitoring
   - Device Control
   - AI Agronomist
   - Pest Scanner
   - Weather Advisor
   - Alerts
   - Analytics
   - Settings

**Verify Translations:**
- All labels, buttons, messages in correct language
- Error messages translated
- Toast notifications translated
- Date/time formats appropriate

---

## Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| AI Chat (Text) | ✅ | ✅ | ✅ | ✅ |
| Voice Input | ✅ | ✅ | ❌ | ⚠️ |
| Voice Output | ✅ | ✅ | ✅ | ✅ |
| Pest Scanner | ✅ | ✅ | ✅ | ✅ |
| Weather | ✅ | ✅ | ✅ | ✅ |

**Note:** Web Speech API limited in Firefox/Safari. Component gracefully degrades to text-only.

---

## Troubleshooting

### Backend Server Won't Start
**Error:** `Cannot find module 'axios'`
```powershell
cd c:\Users\Admin\workspaces\SmartGreenFarmersLife
npm install axios
```

**Error:** `GEMINI_API_KEY not configured`
- Add API key to `.env` file
- Restart server

### Frontend Build Errors
**Error:** Module not found
```powershell
cd c:\Users\Admin\workspaces\SmartGreenFarmersLife\frontend
npm install
```

### Pest Detection Returns 503
**Issue:** HuggingFace model loading (first request)
**Solution:** Wait 20 seconds and retry

### Weather API Returns 401
**Issue:** Invalid OpenWeatherMap API key
**Solution:** 
1. Get free key: https://openweathermap.org/api
2. Add to `.env`: `OPENWEATHER_KEY=your_key`
3. Restart server

### Voice Input Not Working
**Issue:** Browser doesn't support Web Speech API
**Solution:** Use Chrome or Edge browser

---

## Production Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to strong random string
- [ ] Update MONGODB_URI with production database
- [ ] Add API rate limiting for external services
- [ ] Enable CORS only for production domain
- [ ] Set NODE_ENV=production
- [ ] Configure SSL/TLS certificates
- [ ] Set up error monitoring (Sentry)
- [ ] Add request logging
- [ ] Test with real IoT devices
- [ ] Backup database regularly
- [ ] Document API endpoints (Swagger)

---

## API Endpoints Summary

### Telemetry
- POST `/api/telemetry` - Submit sensor data
- GET `/api/telemetry/latest/:deviceId` - Get latest reading
- GET `/api/averages?deviceId=xxx&days=7` - Get aggregated data

### AI Services
- POST `/api/ai/chat` - Chat with agronomist
- POST `/api/ai/pest-remedy` - Get pest remedies

### Pest Detection
- POST `/api/pest/detect` - Detect pests from image

### Weather
- GET `/api/weather/forecast?lat=xxx&lon=xxx` - 5-day forecast
- POST `/api/weather/crop-advice` - AI crop recommendations

---

## Success Criteria

All features working if:
✅ Backend starts without errors
✅ Frontend loads at http://localhost:3000
✅ Login works
✅ Dashboard displays all 9 navigation items
✅ Telemetry POST returns 201
✅ AI chat responds in <5s
✅ Pest detection returns results (after model loads)
✅ Weather forecast displays 5 days
✅ Language toggle switches EN ↔ SW
✅ Voice input works in Chrome/Edge
✅ All Swahili translations display correctly

---

## Next Steps

After testing:
1. Deploy backend to Koyeb/Railway/Render
2. Deploy frontend to Vercel/Netlify
3. Connect real ESP32 IoT devices
4. Add user authentication improvements
5. Implement push notifications
6. Add offline mode (PWA)
7. Create mobile app (React Native)
8. Add data export (CSV/PDF)
9. Implement farmer community forum
10. Add marketplace for farm products
