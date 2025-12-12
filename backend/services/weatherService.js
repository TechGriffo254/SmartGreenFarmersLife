const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY;
    this.baseUrl = process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5';
  }

  async getCurrentWeather(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return {
        success: true,
        data: {
          temperature: response.data.main.temp,
          humidity: response.data.main.humidity,
          description: response.data.weather[0].description,
          windSpeed: response.data.wind.speed,
          rainfall: response.data.rain ? response.data.rain['1h'] || 0 : 0,
          icon: response.data.weather[0].icon,
          timestamp: new Date(response.data.dt * 1000)
        }
      };
    } catch (error) {
      console.error('Weather API Error:', error.message);
      throw new Error('Failed to fetch current weather');
    }
  }

  async getWeatherForecast(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      // Process 7-day forecast
      const dailyData = this.processForecastData(response.data.list);

      return {
        success: true,
        forecast: dailyData
      };
    } catch (error) {
      console.error('Weather Forecast Error:', error.message);
      throw new Error('Failed to fetch weather forecast');
    }
  }

  processForecastData(forecastList) {
    const dailyMap = new Map();

    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          temps: [],
          humidity: [],
          rainfall: 0,
          description: item.weather[0].description,
          icon: item.weather[0].icon
        });
      }

      const dayData = dailyMap.get(date);
      dayData.temps.push(item.main.temp);
      dayData.humidity.push(item.main.humidity);
      if (item.rain) {
        dayData.rainfall += item.rain['3h'] || 0;
      }
    });

    return Array.from(dailyMap.values())
      .slice(0, 7)
      .map(day => ({
        date: day.date,
        avgTemp: (day.temps.reduce((a, b) => a + b, 0) / day.temps.length).toFixed(1),
        maxTemp: Math.max(...day.temps).toFixed(1),
        minTemp: Math.min(...day.temps).toFixed(1),
        avgHumidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
        rainfall: day.rainfall.toFixed(1),
        description: day.description,
        icon: day.icon
      }));
  }

  getCropRecommendations(weatherData, language = 'en') {
    const { temperature, humidity, rainfall } = weatherData;
    const recommendations = [];

    // Temperature-based recommendations
    if (temperature >= 25 && temperature <= 35) {
      recommendations.push(
        language === 'sw' 
          ? { crop: 'Nyanya (Tomatoes)', reason: 'Joto ni nzuri kwa ukuaji' }
          : { crop: 'Tomatoes', reason: 'Optimal temperature for growth' }
      );
      recommendations.push(
        language === 'sw'
          ? { crop: 'Pilipili (Peppers)', reason: 'Hupenda joto la wastani' }
          : { crop: 'Peppers', reason: 'Thrives in moderate heat' }
      );
    }

    if (temperature >= 15 && temperature <= 25) {
      recommendations.push(
        language === 'sw'
          ? { crop: 'Mboga za Majani (Leafy Greens)', reason: 'Joto baridi ni bora' }
          : { crop: 'Leafy Greens', reason: 'Cool temperature ideal' }
      );
    }

    // Humidity-based recommendations
    if (humidity >= 60 && humidity <= 80) {
      recommendations.push(
        language === 'sw'
          ? { crop: 'Matango (Cucumbers)', reason: 'Unyevu wa wastani ni mzuri' }
          : { crop: 'Cucumbers', reason: 'Moderate humidity beneficial' }
      );
    }

    // Rainfall consideration
    if (rainfall < 5) {
      recommendations.push(
        language === 'sw'
          ? { crop: 'Mboga za Drought-resistant', reason: 'Mvua ni kidogo' }
          : { crop: 'Drought-resistant vegetables', reason: 'Low rainfall period' }
      );
    }

    return recommendations.length > 0 ? recommendations : [
      language === 'sw'
        ? { crop: 'Mazao ya Kawaida', reason: 'Hali ya hewa ni wastani' }
        : { crop: 'General crops', reason: 'Moderate weather conditions' }
    ];
  }
}

module.exports = new WeatherService();
