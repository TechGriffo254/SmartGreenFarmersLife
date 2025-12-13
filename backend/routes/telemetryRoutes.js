const express = require('express');
const router = express.Router();
const { z } = require('zod');

// Zod schema for telemetry validation
const telemetrySchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  temperature: z.number().min(-50).max(100),
  humidity: z.number().min(0).max(100),
  soilMoisture: z.number().min(0).max(100),
  timestamp: z.string().datetime().optional()
});

/**
 * POST /api/telemetry
 * Ingests IoT telemetry data and broadcasts to connected clients via Socket.IO
 */
router.post('/telemetry', async (req, res) => {
  try {
    // Validate request body
    const validatedData = telemetrySchema.parse(req.body);
    
    // Add server timestamp if not provided
    const telemetryData = {
      ...validatedData,
      timestamp: validatedData.timestamp || new Date().toISOString(),
      receivedAt: new Date()
    };

    // Get Socket.IO instance from app
    const io = req.app.get('io');
    
    // Broadcast to all connected clients in < 1s
    if (io) {
      io.emit('telemetry:update', telemetryData);
      console.log(`📡 Telemetry broadcast for device: ${telemetryData.deviceId}`);
    }

    // Store in MongoDB for aggregation
    const SensorData = require('../models/SensorData');
    await SensorData.create({
      deviceId: telemetryData.deviceId,
      sensorType: 'telemetry',
      temperature: telemetryData.temperature,
      humidity: telemetryData.humidity,
      soilMoisture: telemetryData.soilMoisture,
      timestamp: new Date(telemetryData.timestamp)
    });

    res.status(201).json({
      success: true,
      message: 'Telemetry data received',
      data: telemetryData
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Telemetry ingestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process telemetry data',
      error: error.message
    });
  }
});

/**
 * GET /api/telemetry/latest/:deviceId
 * Get the latest telemetry reading for a device
 */
router.get('/telemetry/latest/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const SensorData = require('../models/SensorData');

    const latestReading = await SensorData.findOne({
      deviceId,
      sensorType: 'telemetry'
    }).sort({ timestamp: -1 }).limit(1);

    if (!latestReading) {
      return res.status(404).json({
        success: false,
        message: 'No telemetry data found for this device'
      });
    }

    res.json({
      success: true,
      data: latestReading
    });

  } catch (error) {
    console.error('Error fetching latest telemetry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch telemetry data',
      error: error.message
    });
  }
});

/**
 * GET /api/averages
 * Get averaged telemetry data for charting
 * Query params: deviceId (required), days (default: 7)
 */
router.get('/averages', async (req, res) => {
  try {
    const { deviceId, days = 7 } = req.query;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'deviceId query parameter is required'
      });
    }

    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 90) {
      return res.status(400).json({
        success: false,
        message: 'days must be between 1 and 90'
      });
    }

    const TelemetryAverage = require('../models/TelemetryAverage');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const averages = await TelemetryAverage.find({
      deviceId,
      periodStart: { $gte: startDate }
    }).sort({ periodStart: 1 }).lean();

    res.json({
      success: true,
      data: averages,
      meta: {
        deviceId,
        days: daysNum,
        count: averages.length,
        startDate,
        endDate: new Date()
      }
    });

  } catch (error) {
    console.error('Error fetching averages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch averages',
      error: error.message
    });
  }
});

module.exports = router;
