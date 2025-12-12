const mongoose = require('mongoose');

const pestDetectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  greenhouseId: {
    type: String,
    default: 'greenhouse-001',
    index: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  detections: [{
    label: String,
    confidence: Number,
    bbox: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    }
  }],
  modelUsed: {
    type: String,
    enum: ['underdogquality/yolo11s-pest-detection', 'Yudsky/pest-detection-yolo11'],
    required: true
  },
  recommendation: {
    type: String
  },
  language: {
    type: String,
    enum: ['en', 'sw'],
    default: 'en'
  },
  processingTime: {
    type: Number // milliseconds
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

pestDetectionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('PestDetection', pestDetectionSchema);
