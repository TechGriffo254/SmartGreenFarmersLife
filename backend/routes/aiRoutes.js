const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const SensorData = require('../models/SensorData');
const { protect } = require('../middleware/auth');

// POST /api/ai/chat - Chat with AI assistant
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, language = 'en', sessionId, deviceId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get current greenhouse context
    let context = {};
    if (deviceId) {
      const latestData = await SensorData.findOne({ deviceId })
        .sort({ timestamp: -1 })
        .select('temperature humidity soilMoisture');
      
      if (latestData) {
        context = {
          temperature: latestData.temperature,
          humidity: latestData.humidity,
          soilMoisture: latestData.soilMoisture
        };
      }
    }

    // Get AI response
    const aiResponse = await geminiService.chat(
      req.user._id,
      message,
      language,
      context
    );

    // Save conversation
    if (sessionId) {
      await geminiService.saveConversation(
        req.user._id,
        sessionId,
        message,
        aiResponse.response,
        language,
        context
      );
    }

    res.json({
      success: true,
      message: aiResponse.response,
      language: aiResponse.language,
      context
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI response',
      error: error.message
    });
  }
});

// GET /api/ai/conversations - Get user's conversation history
router.get('/conversations', protect, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const AIConversation = require('../models/AIConversation');

    const conversations = await AIConversation.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .select('-__v');

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
});

// GET /api/ai/conversation/:sessionId - Get specific conversation
router.get('/conversation/:sessionId', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const AIConversation = require('../models/AIConversation');

    const conversation = await AIConversation.findOne({
      userId: req.user._id,
      sessionId
    }).select('-__v');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation',
      error: error.message
    });
  }
});

module.exports = router;
