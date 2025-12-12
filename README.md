# Smart Greenhouse Farmers Life

IoT-powered smart greenhouse management system with AI assistant, pest detection, and multilingual support.

Version: 2.0.0  
License: MIT  
Node: >= 18.0.0  
React: 18.2.0

## Features

### Real-Time IoT Monitoring
- Live sensor data from ESP32 devices (temperature, humidity, soil moisture, light, water level)
- WebSocket-based real-time updates
- Automated data aggregation every 5 minutes for analytics
- Historical data visualization with charts

### AI Farming Assistant (Google Gemini)
- Context-aware agricultural advice
- Bilingual support (English & Swahili)
- Voice input/output capabilities
- Real-time greenhouse condition awareness

### Pest & Disease Detection
- AI-powered image analysis using YOLO11 models
- Camera capture or image upload
- Instant pest identification with confidence scores
- Organic treatment recommendations in local language

### Weather Integration
- Real-time weather data (OpenWeatherMap API)
- 7-day forecast
- Season-appropriate crop recommendations
- Weather-based farming insights

### Multilingual Support
- Full English & Swahili translations
- Language switcher in settings
- Voice features support both languages

### Analytics & Insights
- Historical data trends
- Average calculations
- Custom date range analysis
- Data export capabilities

## Quick Start

### Prerequisites

```bash
# Required
node >= 18.0.0
npm >= 9.0.0

# Optional for IoT devices
Arduino IDE
ESP32 Development Board
```

### 1. Clone Repository

```bash
git clone https://github.com/TechGriffo254/SmartGreenFarmersLife.git
cd SmartGreenFarmersLife
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartgreenhouse?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# OpenWeatherMap
WEATHER_API_KEY=your_weather_api_key_here
WEATHER_API_URL=https://api.openweathermap.org/data/2.5

# Hugging Face
HF_API_KEY=your_hugging_face_api_key_here
HF_PEST_MODEL_1=underdogquality/yolo11s-pest-detection
HF_PEST_MODEL_2=Yudsky/pest-detection-yolo11

# CORS
CORS_ORIGIN=http://localhost:3000

# Data Aggregation
AGGREGATION_INTERVAL_MINUTES=5

# IoT Device Auth
IOT_PINCODE=123456
```

Start backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_WEATHER_API_KEY=your_weather_api_key_here
VITE_HF_API_KEY=your_hugging_face_api_key_here

VITE_APP_NAME=Smart Greenhouse Farmers Life
VITE_DEFAULT_LANGUAGE=en
```

Start frontend:

```bash
npm run dev
```

Visit **http://localhost:3000**

## Project Structure

```
SmartGreenFarmersLife/
├── backend/                    # Express.js backend
│   ├── models/                 # MongoDB models
│   │   ├── User.js
│   │   ├── SensorData.js
│   │   ├── SensorAverage.js   # NEW: 5-min averages
│   │   ├── PestDetection.js   # NEW: Pest analysis
│   │   └── AIConversation.js  # NEW: AI chat history
│   ├── routes/                 # API endpoints
│   │   ├── aiRoutes.js        # NEW: AI assistant
│   │   ├── pestRoutes.js      # NEW: Pest detection
│   │   ├── weatherRoutes.js   # NEW: Weather API
│   │   ├── analyticsRoutes.js # NEW: Data aggregation
│   │   ├── iotRoutes.js
│   │   ├── authRoutes.js
│   │   └── ...
│   ├── services/               # Business logic
│   │   ├── geminiService.js   # NEW: Google Gemini AI
│   │   ├── pestDetectionService.js  # NEW: YOLO11
│   │   ├── weatherService.js  # NEW: Weather API
│   │   └── dataAggregationService.js # NEW: Cron job
│   ├── middleware/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AI/
│   │   │   │   └── AIAssistant.js      # NEW
│   │   │   ├── PestDetection/
│   │   │   │   └── PestDetection.js    # NEW
│   │   │   ├── Dashboard/
│   │   │   ├── auth/
│   │   │   └── ...
│   │   ├── i18n/               # NEW: Translations
│   │   │   ├── config.js
│   │   │   └── locales/
│   │   │       ├── en.json
│   │   │       └── sw.json
│   │   ├── context/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.jsx
│   ├── index.html              # Vite entry point
│   ├── vite.config.js          # NEW: Vite config
│   ├── .env.example
│   └── package.json
│
├── arduino/                    # ESP32 firmware
│   └── esp32_greenhouse_koyeb_ready.ino
│
└── README.md                   # This file
```

## API Configuration

### Required API Keys

1. **Google Gemini AI** (Free tier available)
   - Visit: https://makersuite.google.com/app/apikey
   - Create API key
   - Add to `.env`: `GEMINI_API_KEY=your_key`

2. **OpenWeatherMap** (Free tier: 1000 calls/day)
   - Visit: https://openweathermap.org/api
   - Sign up and get API key
   - Add to `.env`: `WEATHER_API_KEY=your_key`

3. **Hugging Face** (Free tier available)
   - Visit: https://huggingface.co/settings/tokens
   - Create access token
   - Add to `.env`: `HF_API_KEY=your_key`

4. **MongoDB Atlas** (Free tier: 512MB)
   - Visit: https://www.mongodb.com/cloud/atlas
   - Create cluster
   - Whitelist your IP: `0.0.0.0/0` (development)
   - Get connection string
   - Add to `.env`: `MONGODB_URI=your_connection_string`

## IoT Device Setup

### Hardware Required
- ESP32 Development Board
- DHT11 (Temperature & Humidity)
- Soil Moisture Sensor
- LDR (Light Sensor)
- HC-SR04 (Ultrasonic - Water Level)
- Relay Module (Pump Control)
- Servo Motor (Ventilation)
- Breadboard & Jumper Wires

### Upload Firmware

1. Open `arduino/esp32_greenhouse_koyeb_ready.ino` in Arduino IDE
2. Update WiFi credentials:
   ```cpp
   const char* ssid = "Your_WiFi_SSID";
   const char* password = "Your_WiFi_Password";
   ```
3. Update backend URL:
   ```cpp
   const char* backendHost = "localhost";  // or your server IP
   const int backendPort = 5000;
   const bool useHTTPS = false;
   ```
4. Upload to ESP32

## Available Scripts

### Backend
```bash
npm start      # Production mode
npm run dev    # Development with nodemon
```

### Frontend
```bash
npm run dev    # Development server
npm run build  # Production build
npm run preview # Preview production build
```

## Data Flow

```
IoT Device (ESP32)
    ↓ POST /api/iot
Backend Server
    ↓ Save to MongoDB
    ↓ Emit via Socket.IO
Frontend Dashboard (Real-time)
    ↓
Every 5 minutes: Cron Job
    ↓ Aggregate data
    ↓ Calculate averages
SensorAverage Collection
    ↓
Analytics Dashboard
```

## Authentication

Default admin credentials (change after first login):

```
Email: admin@greenhouse.com
Password: admin123
```

## Supported Languages

- 🇬🇧 English
- 🇰🇪 Swahili (Kiswahili)

Change language in Settings or via language selector.

## Features Overview

### Dashboard
- Real-time sensor gauges
- Device control panel
- Quick stats
- Alert notifications

### AI Assistant
- Natural language queries
- Voice input (microphone)
- Voice output (text-to-speech)
- Context-aware responses
- Bilingual support

### Pest Detection
- Camera capture
- Image upload
- YOLO11 detection
- Confidence scores
- Treatment recommendations
- Detection history

### Weather
- Current conditions
- 7-day forecast
- Crop recommendations
- Season-based insights

### Analytics
- Historical charts
- Average calculations
- Trend analysis
- Data export

## Deployment

### Local Development
Already covered in Quick Start above.

### Production Deployment
Coming soon: Deployment guides for:
- Vercel (Frontend)
- Railway/Render (Backend)
- Koyeb (Full-stack)

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

**TechGriffo254**
- GitHub: [@TechGriffo254](https://github.com/TechGriffo254)
- Repository: [SmartGreenFarmersLife](https://github.com/TechGriffo254/SmartGreenFarmersLife)

## Acknowledgments

- Google Gemini AI for intelligent assistance
- Hugging Face for YOLO11 models
- OpenWeatherMap for weather data
- MongoDB Atlas for database
- Socket.IO for real-time communication

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API examples in `/docs`

---

Made for farmers worldwide.
