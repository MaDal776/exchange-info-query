/**
 * 交易所配置文件
 * 包含支持的交易所列表及其API配置
 */

module.exports = {
  // 支持的交易所列表
  supportedExchanges: ['okx', 'binance', 'bybit', 'gate', 'bitget'],
  
  // 交易所API配置
  exchangeConfig: {
    okx: {
      name: 'OKX',
      baseUrl: 'https://www.okx.com',
      apiPath: '/api/v5/asset/currencies',
      // API密钥信息从环境变量中获取
      requiresAuth: true
    },
    binance: {
      name: 'Binance',
      baseUrl: 'https://api.binance.com',
      apiPath: '/sapi/v1/capital/config/getall',
      requiresAuth: true
    },
    bybit: {
      name: 'Bybit',
      baseUrl: 'https://api.bybit.com',
      apiPath: '/v5/asset/coin/query-info',
      requiresAuth: true
    },
    gate: {
      name: 'Gate.io',
      baseUrl: 'https://api.gateio.ws',
      apiPath: '/api/v4/spot/currencies',
      requiresAuth: true
    },
    bitget: {
      name: 'Bitget',
      baseUrl: 'https://api.bitget.com',
      apiPath: '/api/v2/spot/public/coins',
      requiresAuth: true
    }
  },
  
  // 数据刷新配置
  refreshConfig: {
    interval: '5 * * * *', // 每小时的第5分钟执行，cron格式
    timeout: 15000 // API请求超时时间，毫秒
  }
};
