/**
 * 原始API响应数据记录器
 * 用于保存各交易所API的原始返回数据，便于问题排查
 */

const fs = require('fs').promises;
const path = require('path');

class RawDataLogger {
  /**
   * 保存原始API响应数据
   * @param {string} exchange - 交易所名称
   * @param {string} endpoint - API端点
   * @param {Object} response - API响应数据
   */
  static async saveRawResponse(exchange, endpoint, response) {
    try {
      // 创建目录路径
      const dirPath = path.join(__dirname, '../data/raw_responses', exchange);
      await fs.mkdir(dirPath, { recursive: true });
      
      // 生成文件名，包含时间戳
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${endpoint.replace(/\//g, '_')}.json`;
      const filePath = path.join(dirPath, fileName);
      
      // 写入数据
      await fs.writeFile(filePath, JSON.stringify(response, null, 2), 'utf8');
      console.log(`Raw API response saved: ${filePath}`);
    } catch (error) {
      console.error(`Error saving raw API response: ${error.message}`);
    }
  }
}

module.exports = RawDataLogger;
