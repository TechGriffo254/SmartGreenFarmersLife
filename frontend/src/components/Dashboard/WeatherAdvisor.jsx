import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Cloud, Droplets, Wind, ThermometerSun, Loader, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const WeatherAdvisor = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [cropType, setCropType] = useState('general');
  const [location, setLocation] = useState({ lat: -1.2864, lon: 36.8172, name: 'Nairobi' }); // Default Nairobi

  const language = i18n.language || 'sw';
  const isSwahili = language === 'sw';

  const crops = [
    { value: 'general', label: isSwahili ? 'Jumla' : 'General' },
    { value: 'maize', label: isSwahili ? 'Mahindi' : 'Maize' },
    { value: 'tomato', label: isSwahili ? 'Nyanya' : 'Tomatoes' },
    { value: 'beans', label: isSwahili ? 'Maharagwe' : 'Beans' },
    { value: 'cabbage', label: isSwahili ? 'Kabichi' : 'Cabbage' },
    { value: 'kale', label: isSwahili ? 'Sukuma Wiki' : 'Kale' }
  ];

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const response = await api.get('/weather/forecast', {
        params: {
          lat: location.lat,
          lon: location.lon
        }
      });

      if (response.data.success) {
        setWeather(response.data.data);
        toast.success(isSwahili ? 'Hali ya hewa imepakiwa' : 'Weather loaded');
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
      toast.error(isSwahili ? 'Imeshindwa kupata hali ya hewa' : 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvice = async () => {
    if (!weather) return;

    setLoadingAdvice(true);
    try {
      const response = await api.post('/weather/crop-advice', {
        forecasts: weather.forecasts,
        cropType,
        language
      });

      if (response.data.success) {
        setAdvice(response.data.data);
      }
    } catch (error) {
      console.error('Advice fetch error:', error);
      toast.error(isSwahili ? 'Imeshindwa kupata ushauri' : 'Failed to fetch advice');
    } finally {
      setLoadingAdvice(false);
    }
  };

  const getConditionEmoji = (condition) => {
    const map = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Thunderstorm': '⛈️',
      'Drizzle': '🌦️',
      'Snow': '🌨️',
      'Mist': '🌫️',
      'Fog': '🌫️'
    };
    return map[condition] || '🌤️';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <h1 className="text-3xl font-bold">
            {isSwahili ? '🌤️ Mshauri wa Hali ya Hewa' : '🌤️ Weather Crop Advisor'}
          </h1>
          <p className="mt-2 text-blue-100">
            {isSwahili 
              ? 'Pata ushauri wa mazao kulingana na utabiri wa hali ya hewa' 
              : 'Get crop recommendations based on weather forecast'}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Location & Refresh */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-800">
                📍 {weather?.location.name || location.name}, {weather?.location.country || 'KE'}
              </h2>
            </div>
            <button
              onClick={fetchWeather}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {isSwahili ? 'Sasisha' : 'Refresh'}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader className="animate-spin mx-auto mb-4" size={48} />
              <p className="text-gray-600">{isSwahili ? 'Inapakia hali ya hewa...' : 'Loading weather...'}</p>
            </div>
          ) : weather ? (
            <>
              {/* 5-Day Forecast */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {weather.forecasts.map((day, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-4"
                  >
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <div className="text-4xl my-3">{getConditionEmoji(day.condition)}</div>
                      <p className="text-2xl font-bold text-gray-800">{day.tempMax}°C</p>
                      <p className="text-sm text-gray-500">{day.tempMin}°C</p>
                      
                      <div className="mt-3 space-y-1 text-xs text-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Droplets size={12} />
                            <span>{isSwahili ? 'Mvua' : 'Rain'}</span>
                          </div>
                          <span className="font-medium">{day.rainfall}mm</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Cloud size={12} />
                            <span>{isSwahili ? 'Unyevu' : 'Humidity'}</span>
                          </div>
                          <span className="font-medium">{day.humidity}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Wind size={12} />
                            <span>{isSwahili ? 'Upepo' : 'Wind'}</span>
                          </div>
                          <span className="font-medium">{day.windSpeed} m/s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Crop Selection & Get Advice */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {isSwahili ? '🌱 Chagua Zao' : '🌱 Select Crop'}
                </h3>
                <div className="flex flex-col md:flex-row gap-4">
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    {crops.map(crop => (
                      <option key={crop.value} value={crop.value}>{crop.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={fetchAdvice}
                    disabled={loadingAdvice}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition font-medium"
                  >
                    {loadingAdvice ? (
                      <span className="flex items-center gap-2">
                        <Loader className="animate-spin" size={16} />
                        {isSwahili ? 'Inapata ushauri...' : 'Getting advice...'}
                      </span>
                    ) : (
                      <span>{isSwahili ? 'Pata Ushauri' : 'Get Advice'}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* AI Advice */}
              {advice && (
                <div className="bg-green-50 border border-green-300 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="text-green-600" />
                    {isSwahili ? '🌾 Ushauri wa Kilimo' : '🌾 Farming Advice'}
                  </h3>
                  
                  {/* Weather Summary */}
                  <div className="mb-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{advice.weatherSummary.avgTemp}°C</p>
                      <p className="text-xs text-gray-600">{isSwahili ? 'Joto Wastani' : 'Avg Temp'}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{advice.weatherSummary.totalRain.toFixed(1)}mm</p>
                      <p className="text-xs text-gray-600">{isSwahili ? 'Mvua Jumla' : 'Total Rain'}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{advice.weatherSummary.avgHumidity}%</p>
                      <p className="text-xs text-gray-600">{isSwahili ? 'Unyevu Wastani' : 'Avg Humidity'}</p>
                    </div>
                  </div>

                  {/* Advice Text */}
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{advice.advice}</p>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    {isSwahili ? 'Zao' : 'Crop'}: {crops.find(c => c.value === advice.cropType)?.label || advice.cropType}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Cloud size={64} className="mx-auto mb-4 text-gray-300" />
              <p>{isSwahili ? 'Bonyeza "Sasisha" kupata hali ya hewa' : 'Click "Refresh" to load weather'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherAdvisor;
