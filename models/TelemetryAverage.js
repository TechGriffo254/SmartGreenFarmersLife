const mongoose = require('mongoose');

const sensorAverageSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  temperature: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  soilMoisture: {
    type: Number,
    required: true
  },
  sampleCount: {
    type: Number,
    required: true
  },
  periodStart: {
    type: Date,
    required: true,
    index: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index for efficient queries
sensorAverageSchema.index({ deviceId: 1, periodStart: -1 });

module.exports = mongoose.model('SensorAverage', sensorAverageSchema);
