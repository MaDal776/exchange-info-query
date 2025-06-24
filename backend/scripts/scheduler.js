/**
 * 定时任务调度器
 * 负责定时执行数据采集任务
 */

const cron = require('node-cron');
const DataCollector = require('./dataCollector');
const exchangeConfig = require('../config/exchanges').refreshConfig;
require('dotenv').config({ path: '../../.env' });

class Scheduler {
  /**
   * 启动定时任务
   */
  static startScheduledTasks() {
    // 获取配置的刷新间隔，默认每小时的第5分钟执行
    const refreshInterval = process.env.REFRESH_INTERVAL || exchangeConfig.interval || '5 * * * *';
    
    console.log(`Starting scheduled data collection with interval: ${refreshInterval}`);
    
    // 立即执行一次数据采集
    this.runDataCollection();
    
    // 设置定时任务
    cron.schedule(refreshInterval, () => {
      console.log(`Running scheduled data collection at ${new Date().toISOString()}`);
      this.runDataCollection();
    });
    
    console.log('Scheduler started successfully');
  }
  
  /**
   * 执行数据采集任务
   */
  static async runDataCollection() {
    try {
      await DataCollector.collectData();
    } catch (error) {
      console.error(`Error in scheduled data collection: ${error.message}`);
    }
  }
}

module.exports = Scheduler;
