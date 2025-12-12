const cron = require('node-cron');
const SensorData = require('../models/SensorData');
const SensorAverage = require('../models/SensorAverage');

class DataAggregationService {
  constructor() {
    this.intervalMinutes = parseInt(process.env.AGGREGATION_INTERVAL_MINUTES) || 5;
    this.cronExpression = `*/${this.intervalMinutes} * * * *`;
  }

  start() {
    console.log(`📊 Starting data aggregation service (every ${this.intervalMinutes} minutes)`);
    
    // Run immediately on startup
    this.aggregateData();

    // Schedule periodic aggregation
    cron.schedule(this.cronExpression, () => {
      this.aggregateData();
    });
  }

  async aggregateData() {
    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - this.intervalMinutes * 60 * 1000);

      console.log(`🔄 Aggregating sensor data from ${startTime.toISOString()} to ${endTime.toISOString()}`);

      // Get all unique deviceIds
      const devices = await SensorData.distinct('deviceId', {
        timestamp: { $gte: startTime, $lte: endTime }
      });

      console.log(`📱 Found ${devices.length} devices with data in this period`);

      for (const deviceId of devices) {
        await this.aggregateDeviceData(deviceId, startTime, endTime);
      }

      console.log(`✅ Data aggregation completed successfully`);
    } catch (error) {
      console.error('❌ Error in data aggregation:', error);
    }
  }

  async aggregateDeviceData(deviceId, startTime, endTime) {
    try {
      const aggregation = await SensorData.aggregate([
        {
          $match: {
            deviceId,
            timestamp: { $gte: startTime, $lte: endTime }
          }
        },
        {
          $group: {
            _id: '$deviceId',
            greenhouseId: { $first: '$greenhouseId' },
            avgTemperature: { $avg: '$temperature' },
            avgHumidity: { $avg: '$humidity' },
            avgSoilMoisture: { $avg: '$soilMoisture' },
            avgLightIntensity: { $avg: '$lightIntensity' },
            avgWaterLevel: { $avg: '$waterLevel' },
            count: { $sum: 1 }
          }
        }
      ]);

      if (aggregation.length === 0) {
        console.log(`⚠️  No data found for device ${deviceId}`);
        return;
      }

      const data = aggregation[0];

      // Create or update average record
      const averageData = {
        deviceId,
        greenhouseId: data.greenhouseId || 'greenhouse-001',
        averageTemperature: data.avgTemperature ? parseFloat(data.avgTemperature.toFixed(2)) : null,
        averageHumidity: data.avgHumidity ? parseFloat(data.avgHumidity.toFixed(2)) : null,
        averageSoilMoisture: data.avgSoilMoisture ? parseFloat(data.avgSoilMoisture.toFixed(2)) : null,
        averageLightIntensity: data.avgLightIntensity ? parseFloat(data.avgLightIntensity.toFixed(2)) : null,
        averageWaterLevel: data.avgWaterLevel ? parseFloat(data.avgWaterLevel.toFixed(2)) : null,
        dataPointsCount: data.count,
        startTime,
        endTime,
        createdAt: new Date()
      };

      await SensorAverage.create(averageData);

      console.log(`✓ Aggregated ${data.count} data points for device ${deviceId}`);
    } catch (error) {
      console.error(`Error aggregating data for device ${deviceId}:`, error);
    }
  }

  async getAverages(deviceId, days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const averages = await SensorAverage.find({
        deviceId,
        startTime: { $gte: startDate }
      })
      .sort({ startTime: 1 })
      .select('-__v');

      return averages;
    } catch (error) {
      console.error('Error fetching averages:', error);
      throw error;
    }
  }

  async getLatestAverage(deviceId) {
    try {
      const latest = await SensorAverage.findOne({ deviceId })
        .sort({ startTime: -1 })
        .select('-__v');

      return latest;
    } catch (error) {
      console.error('Error fetching latest average:', error);
      throw error;
    }
  }

  async cleanupOldData(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await SensorAverage.deleteMany({
        createdAt: { $lt: cutoffDate }
      });

      console.log(`🗑️  Cleaned up ${result.deletedCount} old average records`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      throw error;
    }
  }
}

module.exports = new DataAggregationService();
