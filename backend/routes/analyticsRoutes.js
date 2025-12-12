const express = require('express');
const router = express.Router();
const dataAggregationService = require('../services/dataAggregationService');
const { protect } = require('../middleware/auth');

// GET /api/analytics/averages - Get aggregated average data
router.get('/averages', protect, async (req, res) => {
  try {
    const { deviceId, days = 7 } = req.query;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'deviceId is required'
      });
    }

    const averages = await dataAggregationService.getAverages(
      deviceId,
      parseInt(days)
    );

    res.json({
      success: true,
      data: averages,
      count: averages.length
    });
  } catch (error) {
    console.error('Error fetching averages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch average data',
      error: error.message
    });
  }
});

// GET /api/analytics/latest-average - Get latest average for device
router.get('/latest-average', protect, async (req, res) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'deviceId is required'
      });
    }

    const latest = await dataAggregationService.getLatestAverage(deviceId);

    if (!latest) {
      return res.status(404).json({
        success: false,
        message: 'No average data found for this device'
      });
    }

    res.json({
      success: true,
      data: latest
    });
  } catch (error) {
    console.error('Error fetching latest average:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest average',
      error: error.message
    });
  }
});

// POST /api/analytics/trigger-aggregation - Manually trigger data aggregation
router.post('/trigger-aggregation', protect, async (req, res) => {
  try {
    // Check if user is admin (you may want to add admin middleware)
    await dataAggregationService.aggregateData();

    res.json({
      success: true,
      message: 'Data aggregation triggered successfully'
    });
  } catch (error) {
    console.error('Error triggering aggregation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger aggregation',
      error: error.message
    });
  }
});

module.exports = router;
