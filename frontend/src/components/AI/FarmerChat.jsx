import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const FarmerChat = () => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const language = i18n.language || 'sw';
  const isSwahili = language === 'sw';

  useEffect(() => {
    // Initialize Web Speech API
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = isSwahili ? 'sw-KE' : 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setListening(false);
      };

      recognitionRef.current.onerror = () => {
        setListening(false);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      synthRef.current.cancel();
    };
  }, [isSwahili]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert(t('Voice input not supported in this browser'));
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.lang = isSwahili ? 'sw-KE' : 'en-US';
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const speak = (text) => {
    if (!voiceEnabled || !synthRef.current) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isSwahili ? 'sw-KE' : 'en-US';
    utterance.rate = 0.9;
    
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const toggleVoiceOutput = () => {
    if (speaking) {
      synthRef.current.cancel();
      setSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: userMessage.content,
        language,
        conversationHistory: messages.slice(-6)
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.data.message,
        timestamp: response.data.data.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-speak response
      if (voiceEnabled) {
        speak(assistantMessage.content);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: isSwahili 
          ? 'Samahani, kuna tatizo la mawasiliano. Jaribu tena.'
          : 'Sorry, there was a communication error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    synthRef.current.cancel();
    setSpeaking(false);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {isSwahili ? '🌾 Mshauri wa Kilimo' : '🌾 AI Agronomist'}
            </h2>
            <p className="text-sm text-green-100">
              {isSwahili 
                ? 'Uliza swali lolote kuhusu kilimo' 
                : 'Ask any farming question'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleVoiceOutput}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
              title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
            >
              {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition"
              >
                {isSwahili ? 'Futa' : 'Clear'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-lg mb-2">👋</p>
              <p>{isSwahili ? 'Karibu! Uliza swali lako' : 'Welcome! Ask your question'}</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.role === 'user' ? 'text-green-100' : 'text-gray-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-2">
              <Loader className="animate-spin" size={16} />
              <span className="text-sm text-gray-500">
                {isSwahili ? 'Inaandika...' : 'Typing...'}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-3 rounded-lg transition ${
              listening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={loading}
          >
            {listening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isSwahili ? 'Andika ujumbe...' : 'Type message...'}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            disabled={loading || listening}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            <Send size={20} />
          </button>
        </div>
        {listening && (
          <p className="text-sm text-red-600 mt-2 flex items-center gap-2">
            <span className="animate-pulse">🎤</span>
            {isSwahili ? 'Inasikiza...' : 'Listening...'}
          </p>
        )}
      </form>
    </div>
  );
};

export default FarmerChat;
