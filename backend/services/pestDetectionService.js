const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const PestDetection = require('../models/PestDetection');
const geminiService = require('./geminiService');

class PestDetectionService {
  constructor() {
    this.apiKey = process.env.HF_API_KEY;
    this.model1 = process.env.HF_PEST_MODEL_1 || 'underdogquality/yolo11s-pest-detection';
    this.model2 = process.env.HF_PEST_MODEL_2 || 'Yudsky/pest-detection-yolo11';
    this.timeout = 30000; // 30 seconds
  }

  async detectPests(imagePath, userId, language = 'en') {
    const startTime = Date.now();
    
    try {
      // Try first model
      let result = await this.callHuggingFaceModel(imagePath, this.model1);
      let modelUsed = this.model1;

      // If first model fails or times out, try second model
      if (!result || result.error) {
        console.log('First model failed, trying fallback model...');
        result = await this.callHuggingFaceModel(imagePath, this.model2);
        modelUsed = this.model2;
      }

      if (!result || result.error) {
        throw new Error('Both pest detection models failed');
      }

      // Process detections
      const detections = this.processDetections(result);
      
      // Generate AI recommendation if pests detected
      let recommendation = '';
      if (detections.length > 0) {
        const topDetection = detections[0];
        recommendation = await geminiService.generatePestRecommendation(
          topDetection,
          language
        );
      }

      const processingTime = Date.now() - startTime;

      // Save to database
      const pestDetectionRecord = new PestDetection({
        userId,
        imageUrl: imagePath,
        detections,
        modelUsed,
        recommendation,
        language,
        processingTime
      });

      await pestDetectionRecord.save();

      return {
        success: true,
        detections,
        recommendation,
        modelUsed,
        processingTime
      };
    } catch (error) {
      console.error('Pest Detection Error:', error);
      throw error;
    }
  }

  async callHuggingFaceModel(imagePath, modelName) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const apiUrl = `https://api-inference.huggingface.co/models/${modelName}`;

      const response = await axios.post(apiUrl, imageBuffer, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/octet-stream'
        },
        timeout: this.timeout
      });

      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.error(`Timeout calling model ${modelName}`);
      } else {
        console.error(`Error calling model ${modelName}:`, error.message);
      }
      return { error: error.message };
    }
  }

  processDetections(rawData) {
    // HuggingFace YOLO models typically return array of detections
    if (!Array.isArray(rawData)) {
      return [];
    }

    return rawData
      .filter(detection => detection.score > 0.3) // Filter low confidence
      .map(detection => ({
        label: detection.label,
        confidence: detection.score,
        bbox: detection.box ? {
          x: detection.box.xmin,
          y: detection.box.ymin,
          width: detection.box.xmax - detection.box.xmin,
          height: detection.box.ymax - detection.box.ymin
        } : null
      }))
      .sort((a, b) => b.confidence - a.confidence) // Sort by confidence
      .slice(0, 10); // Top 10 detections
  }

  async getDetectionHistory(userId, limit = 20) {
    try {
      const history = await PestDetection.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('-__v');

      return history;
    } catch (error) {
      console.error('Error fetching detection history:', error);
      throw error;
    }
  }
}

module.exports = new PestDetectionService();
