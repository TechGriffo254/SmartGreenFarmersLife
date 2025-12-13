const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * POST /api/ai/chat
 * Chat with AI agronomist - supports streaming responses
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, language = 'en', conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key not configured'
      });
    }

    // System prompt based on language
    const systemPrompt = language === 'sw' 
      ? `Wewe ni mshauri wa kilimo wa Kenya. Jibu kwa Kiswahili. Fupisha majibu yako hadi maneno 80. Toa ushauri wa vitendo kuhusu kilimo, udhibiti wa wadudu, na usimamizi wa mazao. Tumia lugha rahisi inayoeleweka na wakulima wa kawaida.`
      : `You are a helpful Kenyan agronomist assistant. Reply in English. Keep answers ≤ 80 words. Provide actionable advice about farming, pest control, and crop management. Use simple language that local farmers can understand.`;

    // Build conversation context
    const context = conversationHistory.slice(-4).map(msg => 
      `${msg.role === 'user' ? 'Farmer' : 'Agronomist'}: ${msg.content}`
    ).join('\n');

    const fullPrompt = `${systemPrompt}\n\nConversation context:\n${context}\n\nFarmer: ${message}\n\nAgronomist:`;

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Check if streaming is requested
    const streaming = req.query.stream === 'true';

    if (streaming) {
      // Set up SSE headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        const result = await model.generateContentStream(fullPrompt);

        for await (const chunk of result.stream) {
          const text = chunk.text();
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        res.end();

      } catch (streamError) {
        console.error('Streaming error:', streamError);
        res.write(`data: ${JSON.stringify({ error: streamError.message })}\n\n`);
        res.end();
      }

    } else {
      // Non-streaming response
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      res.json({
        success: true,
        data: {
          message: text,
          language,
          timestamp: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI request',
      error: error.message
    });
  }
});

/**
 * POST /api/ai/pest-remedy
 * Get pest remedy suggestions from detected pests
 */
router.post('/pest-remedy', async (req, res) => {
  try {
    const { pestLabels, language = 'sw' } = req.body;

    if (!pestLabels || !Array.isArray(pestLabels) || pestLabels.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Pest labels array is required'
      });
    }

    const pestList = pestLabels.join(', ');
    
    const prompt = language === 'sw'
      ? `Wadudu hawa wamegundulika: ${pestList}. Toa dawa za haraka (maneno 60) kwa Kiswahili: jinsi ya kudhibiti na kuzuia. Tumia vifaa vya ndani na mbinu za asili.`
      : `These pests detected: ${pestList}. Provide quick remedies (60 words max) in English: how to control and prevent. Use local materials and organic methods.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const remedy = response.text();

    res.json({
      success: true,
      data: {
        pests: pestLabels,
        remedy,
        language,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Pest remedy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pest remedy',
      error: error.message
    });
  }
});

module.exports = router;
