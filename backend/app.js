/**
 * 交易所信息整合查询系统 - 后端服务
 */

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const Scheduler = require('./scripts/scheduler');
require('dotenv').config({ path: '../.env' });

// 创建Express应用
const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 允许跨域请求
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 读取JSON数据文件
async function readDataFile() {
  try {
    const dataPath = path.join(__dirname, 'data/exchange_data.json');
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading data file: ${error.message}`);
    return { last_update: new Date().toISOString(), tokens: [] };
  }
}

// API路由

// 获取最后更新时间
app.get('/api/last_update', async (req, res) => {
  try {
    const data = await readDataFile();
    res.json({ last_update: data.last_update });
  } catch (error) {
    console.error(`Error in /api/last_update: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 手动刷新数据
app.post('/api/refresh', async (req, res) => {
  try {
    console.log('Manual data refresh triggered at', new Date().toISOString());
    // 调用scheduler的数据采集功能
    await Scheduler.runDataCollection();
    const data = await readDataFile();
    res.json({ success: true, message: 'Data refreshed successfully', last_update: data.last_update });
  } catch (error) {
    console.error('Error refreshing data:', error);
    res.status(500).json({ success: false, error: 'Failed to refresh data' });
  }
});

// 获取所有支持的代币列表
app.get('/api/tokens', async (req, res) => {
  try {
    const data = await readDataFile();
    const tokens = data.tokens.map(token => ({
      symbol: token.symbol,
      name: token.name
    }));
    res.json(tokens);
  } catch (error) {
    console.error(`Error in /api/tokens: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取指定代币的所有交易所充提状态及合约信息
app.get('/api/status', async (req, res) => {
  try {
    const symbol = req.query.symbol;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol parameter is required' });
    }
    
    const data = await readDataFile();
    const token = data.tokens.find(t => t.symbol.toUpperCase() === symbol.toUpperCase());
    
    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }
    
    res.json({
      symbol: token.symbol,
      name: token.name,
      exchanges: token.exchanges,
      last_update: data.last_update
    });
  } catch (error) {
    console.error(`Error in /api/status: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  
  // 启动定时任务
  Scheduler.startScheduledTasks();
});

module.exports = app;
