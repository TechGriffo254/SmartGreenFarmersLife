const cron = require('node-cron');
const SensorData = require('../models/SensorData');
const TelemetryAverage = require('../models/TelemetryAverage');

/**
 * Aggregation service that runs every 5 minutes
 * Computes averages for each device and stores in TelemetryAverage collection
 */
class AggregationService {
  constructor() {
    this.isRunning = false;
    this.cronJob = null;
  }

  /**
   * Start the aggregation cron job (every 5 minutes)
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Aggregation service already running');
      return;
    }

    // Run every 5 minutes: */5 * * * *
    this.cronJob = cron.schedule('*/5 * * * *', async () => {
      await this.aggregate();
    });

    this.isRunning = true;
    console.log('✅ Telemetry aggregation service started (every 5 minutes)');

    // Run initial aggregation after 30 seconds
    setTimeout(() => this.aggregate(), 30000);
  }

  /**
   * Stop the aggregation service
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.isRunning = false;
      console.log('🛑 Telemetry aggregation service stopped');
    }
  }

  /**
   * Perform aggregation for all devices
   */
  async aggregate() {
    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      console.log(`\n🔄 Running telemetry aggregation: ${fiveMinutesAgo.toISOString()} to ${now.toISOString()}`);

      // Get distinct device IDs
      const devices = await SensorData.distinct('deviceId', {
        sensorType: 'telemetry',
        timestamp: { $gte: fiveMinutesAgo, $lt: now }
      });

      if (devices.length === 0) {
        console.log('📊 No devices with telemetry data in this period');
        return;
      }

      for (const deviceId of devices) {
        await this.aggregateDevice(deviceId, fiveMinutesAgo, now);
      }

      console.log(`✅ Aggregation completed for ${devices.length} device(s)\n`);

    } catch (error) {
      console.error('❌ Aggregation error:', error);
    }
  }

  /**
   * Aggregate data for a single device
   */
  async aggregateDevice(deviceId, periodStart, periodEnd) {
    try {
      const result = await SensorData.aggregate([
        {
          $match: {
            deviceId,
            sensorType: 'telemetry',
            timestamp: { $gte: periodStart, $lt: periodEnd }
          }
        },
        {
          $group: {
            _id: null,
            avgTemperature: { $avg: '$temperature' },
            avgHumidity: { $avg: '$humidity' },
            avgSoilMoisture: { $avg: '$soilMoisture' },
            count: { $sum: 1 }
          }
        }
      ]);

      if (result.length === 0 || result[0].count === 0) {
        console.log(`  📊 ${deviceId}: No data in this period`);
        return;
      }

      const { avgTemperature, avgHumidity, avgSoilMoisture, count } = result[0];

      // Store the average
      await TelemetryAverage.create({
        deviceId,
        temperature: Math.round(avgTemperature * 100) / 100,
        humidity: Math.round(avgHumidity * 100) / 100,
        soilMoisture: Math.round(avgSoilMoisture * 100) / 100,
        sampleCount: count,
        periodStart,
        periodEnd
      });

      console.log(`  ✓ ${deviceId}: Avg computed from ${count} samples`);

    } catch (error) {
      console.error(`  ❌ Error aggregating ${deviceId}:`, error.message);
    }
  }
}

// Singleton instance
const aggregationService = new AggregationService();

module.exports = aggregationService;
