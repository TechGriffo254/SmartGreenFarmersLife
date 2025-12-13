const express = require('express');
const router = express.Router();
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * GET /api/weather/forecast
 * Get 5-day weather forecast for location
 */
router.get('/forecast', async (req, res) => {
  try {
    const { lat = -1.2864, lon = 36.8172 } = req.query; // Default: Nairobi

    if (!process.env.OPENWEATHER_KEY) {
      return res.status(500).json({
        success: false,
        message: 'OpenWeatherMap API key not configured'
      });
    }

    // Get 5-day forecast
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast`,
      {
        params: {
          lat,
          lon,
          appid: process.env.OPENWEATHER_KEY,
          units: 'metric',
          cnt: 40 // 5 days * 8 (3-hour intervals)
        },
        timeout: 10000
      }
    );

    const forecastData = response.data;
    
    // Group by day
    const dailyForecasts = [];
    const days = {};

    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      
      if (!days[date]) {
        days[date] = {
          date,
          temps: [],
          conditions: [],
          humidity: [],
          rainfall: 0,
          windSpeed: []
        };
      }

      days[date].temps.push(item.main.temp);
      days[date].conditions.push(item.weather[0].main);
      days[date].humidity.push(item.main.humidity);
      days[date].windSpeed.push(item.wind.speed);
      
      if (item.rain && item.rain['3h']) {
        days[date].rainfall += item.rain['3h'];
      }
    });

    // Calculate daily averages
    Object.keys(days).slice(0, 5).forEach(date => {
      const day = days[date];
      dailyForecasts.push({
        date,
        tempMin: Math.round(Math.min(...day.temps)),
        tempMax: Math.round(Math.max(...day.temps)),
        tempAvg: Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length),
        humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
        rainfall: Math.round(day.rainfall * 10) / 10,
        windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length * 10) / 10,
        condition: day.conditions.sort((a, b) => 
          day.conditions.filter(c => c === b).length - day.conditions.filter(c => c === a).length
        )[0]
      });
    });

    res.json({
      success: true,
      data: {
        location: {
          lat,
          lon,
          name: forecastData.city.name,
          country: forecastData.city.country
        },
        forecasts: dailyForecasts,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Weather forecast error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather forecast',
      error: error.message
    });
  }
});

/**
 * POST /api/weather/crop-advice
 * Get AI crop recommendations based on weather forecast
 */
router.post('/crop-advice', async (req, res) => {
  try {
    const { forecasts, cropType = 'general', language = 'sw' } = req.body;

    if (!forecasts || !Array.isArray(forecasts)) {
      return res.status(400).json({
        success: false,
        message: 'Weather forecasts array is required'
      });
    }

    // Build weather summary
    const avgTemp = Math.round(forecasts.reduce((sum, f) => sum + f.tempAvg, 0) / forecasts.length);
    const totalRain = forecasts.reduce((sum, f) => sum + f.rainfall, 0);
    const avgHumidity = Math.round(forecasts.reduce((sum, f) => sum + f.humidity, 0) / forecasts.length);
    const conditions = forecasts.map(f => f.condition).join(', ');

    const weatherSummary = language === 'sw'
      ? `Siku 5 zijazo: Joto wastani ${avgTemp}°C, Mvua jumla ${totalRain.toFixed(1)}mm, Unyevu ${avgHumidity}%. Hali: ${conditions}.`
      : `Next 5 days: Avg temp ${avgTemp}°C, Total rain ${totalRain.toFixed(1)}mm, Humidity ${avgHumidity}%. Conditions: ${conditions}.`;

    const prompt = language === 'sw'
      ? `Wewe ni mshauri wa kilimo. Hali ya hewa: ${weatherSummary}. Mazao: ${cropType}. Toa ushauri wa haraka (maneno 100) kuhusu: 1) Je, ni wakati mzuri wa kupanda? 2) Tahadhari gani? 3) Shughuli za kilimo zipi? 4) Udhibiti wa wadudu?`
      : `You are a farming advisor. Weather: ${weatherSummary}. Crop: ${cropType}. Provide quick advice (100 words max) on: 1) Good time to plant? 2) Precautions? 3) Farming activities? 4) Pest control?`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const advice = response.text();

    res.json({
      success: true,
      data: {
        weatherSummary: {
          avgTemp,
          totalRain,
          avgHumidity,
          days: forecasts.length
        },
        advice,
        cropType,
        language,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Crop advice error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate crop advice',
      error: error.message
    });
  }
});

module.exports = router;
