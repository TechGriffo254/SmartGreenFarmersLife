const mongoose = require('mongoose');

const sensorAverageSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  greenhouseId: {
    type: String,
    default: 'greenhouse-001',
    index: true
  },
  averageTemperature: {
    type: Number,
    default: null
  },
  averageHumidity: {
    type: Number,
    default: null
  },
  averageSoilMoisture: {
    type: Number,
    default: null
  },
  averageLightIntensity: {
    type: Number,
    default: null
  },
  averageWaterLevel: {
    type: Number,
    default: null
  },
  dataPointsCount: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index for efficient queries
sensorAverageSchema.index({ deviceId: 1, startTime: -1 });
sensorAverageSchema.index({ greenhouseId: 1, startTime: -1 });

module.exports = mongoose.model('SensorAverage', sensorAverageSchema);
