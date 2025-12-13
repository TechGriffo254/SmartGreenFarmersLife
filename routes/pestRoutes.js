const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * POST /api/pest/detect
 * Detect pests from uploaded image using HuggingFace PlantVillage model
 */
router.post('/detect', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required'
      });
    }

    if (!process.env.HF_API_TOKEN) {
      return res.status(500).json({
        success: false,
        message: 'HuggingFace API token not configured'
      });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    // Call HuggingFace Inference API
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification',
      imageBuffer,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_TOKEN}`,
          'Content-Type': 'application/octet-stream'
        },
        timeout: 30000
      }
    );

    // Process results
    const predictions = response.data;
    
    // Filter predictions with confidence > 30%
    const detections = predictions
      .filter(pred => pred.score > 0.3)
      .map(pred => ({
        label: pred.label,
        confidence: Math.round(pred.score * 100),
        diseaseType: pred.label.includes('healthy') ? 'healthy' : 'disease'
      }))
      .slice(0, 5); // Top 5 predictions

    res.json({
      success: true,
      data: {
        detections,
        totalFound: detections.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Pest detection error:', error.message);
    
    // Handle model loading errors
    if (error.response?.status === 503) {
      return res.status(503).json({
        success: false,
        message: 'Model is loading, please try again in 20 seconds',
        retryAfter: 20
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to detect pests',
      error: error.message
    });
  }
});

module.exports = router;
