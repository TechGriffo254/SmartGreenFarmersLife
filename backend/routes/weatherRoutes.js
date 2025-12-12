const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');
const { protect } = require('../middleware/auth');

// GET /api/weather/current - Get current weather
router.get('/current', protect, async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const weather = await weatherService.getCurrentWeather(
      parseFloat(lat),
      parseFloat(lon)
    );

    res.json(weather);
  } catch (error) {
    console.error('Weather API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current weather',
      error: error.message
    });
  }
});

// GET /api/weather/forecast - Get 7-day forecast
router.get('/forecast', protect, async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const forecast = await weatherService.getWeatherForecast(
      parseFloat(lat),
      parseFloat(lon)
    );

    res.json(forecast);
  } catch (error) {
    console.error('Weather Forecast Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather forecast',
      error: error.message
    });
  }
});

// GET /api/weather/recommendations - Get crop recommendations based on weather
router.get('/recommendations', protect, async (req, res) => {
  try {
    const { lat, lon, language = 'en' } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Get current weather
    const weather = await weatherService.getCurrentWeather(
      parseFloat(lat),
      parseFloat(lon)
    );

    // Get crop recommendations
    const recommendations = weatherService.getCropRecommendations(
      weather.data,
      language
    );

    res.json({
      success: true,
      weather: weather.data,
      recommendations
    });
  } catch (error) {
    console.error('Weather Recommendations Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crop recommendations',
      error: error.message
    });
  }
});

module.exports = router;
