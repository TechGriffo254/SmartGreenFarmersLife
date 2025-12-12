import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Mic, MicOff, Volume2, VolumeX, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AIAssistant = ({ deviceId }) => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = i18n.language === 'sw' ? 'sw-KE' : 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error(t('common.error'));
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Add initial greeting
    setMessages([{
      role: 'assistant',
      content: t('aiAssistant.greeting'),
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    // Update speech recognition language when i18n language changes
    if (recognitionRef.current) {
      recognitionRef.current.lang = i18n.language === 'sw' ? 'sw-KE' : 'en-US';
    }
  }, [i18n.language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window && voiceEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = i18n.language === 'sw' ? 'sw-KE' : 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/ai/chat`,
        {
          message: input,
          language: i18n.language,
          sessionId,
          deviceId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const assistantMessage = {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date(),
        context: response.data.context
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak response if voice is enabled
      if (voiceEnabled) {
        speakText(response.data.message);
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      toast.error(t('messages.errorOccurred'));
      
      const errorMessage = {
        role: 'assistant',
        content: t('messages.errorOccurred'),
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: t('aiAssistant.greeting'),
      timestamp: new Date()
    }]);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-green-600 text-white rounded-t-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{t('aiAssistant.title')}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="p-2 hover:bg-green-700 rounded-lg transition"
              title={voiceEnabled ? t('aiAssistant.voiceOutput') : t('aiAssistant.voiceOutput')}
            >
              {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button
              onClick={clearChat}
              className="p-2 hover:bg-green-700 rounded-lg transition"
              title={t('aiAssistant.clearChat')}
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-green-600 text-white'
                  : message.isError
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.context && (
                <div className="mt-2 pt-2 border-t border-green-500 text-xs opacity-80">
                  <p>📊 {t('dashboard.temperature')}: {message.context.temperature}°C</p>
                  <p>💧 {t('dashboard.humidity')}: {message.context.humidity}%</p>
                  <p>🌱 {t('dashboard.soilMoisture')}: {message.context.soilMoisture}%</p>
                </div>
              )}
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-gray-600">{t('aiAssistant.thinking')}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('aiAssistant.placeholder')}
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={loading}
          />
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`p-3 rounded-lg transition ${
              isListening
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={loading}
            title={t('aiAssistant.voiceInput')}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('aiAssistant.send')}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIAssistant;
