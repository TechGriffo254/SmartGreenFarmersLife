const mongoose = require('mongoose');

const aiConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    language: {
      type: String,
      enum: ['en', 'sw'],
      default: 'en'
    }
  }],
  greenhouseContext: {
    deviceId: String,
    currentTemperature: Number,
    currentHumidity: Number,
    currentSoilMoisture: Number
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

aiConversationSchema.index({ userId: 1, sessionId: 1 });
aiConversationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AIConversation', aiConversationSchema);
