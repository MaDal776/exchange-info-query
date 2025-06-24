/**
 * 数据采集器
 * 负责从各交易所API获取数据，并进行标准化处理
 */

const fs = require('fs').promises;
const path = require('path');
const ApiClient = require('./apiClient');
const RawDataLogger = require('./rawDataLogger');
const exchangeConfig = require('../config/exchanges').exchangeConfig;

class DataCollector {
  /**
   * 从OKX获取币种充提信息
   * @returns {Promise<Array>} 标准化后的币种信息
   */
  static async fetchOkxData() {
    try {
      const response = await ApiClient.okxRequest('GET', '/api/v5/asset/currencies');
      
      // 保存原始API响应数据
      await RawDataLogger.saveRawResponse('OKX', '/api/v5/asset/currencies', response);
      
      if (response.code !== '0') {
        throw new Error(`OKX API Error: ${response.msg}`);
      }
      
      // 标准化数据结构
      const tokens = {};
      
      for (const item of response.data) {
        const symbol = item.ccy;
        const chain = item.chain;
        
        if (!tokens[symbol]) {
          tokens[symbol] = {
            symbol,
            name: item.name || symbol,
            exchanges: []
          };
        }
        
        // 查找该交易所是否已存在
        let exchange = tokens[symbol].exchanges.find(ex => ex.name === 'OKX');
        
        if (!exchange) {
          exchange = {
            name: 'OKX',
            chains: []
          };
          tokens[symbol].exchanges.push(exchange);
        }
        
        // 添加链信息
        const chainName = chain.split('-')[0]; // 提取链名称，如 "BTC-Bitcoin" 取 "BTC"
        
        exchange.chains.push({
          chain: chainName,
          deposit_status: item.canDep ? 'open' : 'closed',
          withdraw_status: item.canWd ? 'open' : 'closed',
          contract_address: item.ctAddr || '',
          min_withdraw: item.minWd || '',
          withdraw_fee: item.minFee || ''
        });
      }
      
      return Object.values(tokens);
    } catch (error) {
      console.error(`Error fetching OKX data: ${error.message}`);
      return [];
    }
  }
  
  /**
   * 从Binance获取币种充提信息
   * @returns {Promise<Array>} 标准化后的币种信息
   */
  static async fetchBinanceData() {
    try {
      const response = await ApiClient.binanceRequest('GET', '/sapi/v1/capital/config/getall');
      
      // 保存原始API响应数据
      await RawDataLogger.saveRawResponse('Binance', '/sapi/v1/capital/config/getall', response);
      
      // 标准化数据结构
      const tokens = {};
      
      for (const item of response) {
        const symbol = item.coin;
        
        if (!tokens[symbol]) {
          tokens[symbol] = {
            symbol,
            name: item.name || symbol,
            exchanges: []
          };
        }
        
        // 创建交易所对象
        const exchange = {
          name: 'Binance',
          chains: []
        };
        
        // 添加链信息
        if (item.networkList && item.networkList.length > 0) {
          for (const network of item.networkList) {
            exchange.chains.push({
              chain: network.network,
              deposit_status: network.depositEnable ? 'open' : 'closed',
              withdraw_status: network.withdrawEnable ? 'open' : 'closed',
              contract_address: network.contractAddress || '',
              min_withdraw: network.minWithdrawAmount || '',
              withdraw_fee: network.withdrawFee || ''
            });
          }
        }
        
        tokens[symbol].exchanges.push(exchange);
      }
      
      return Object.values(tokens);
    } catch (error) {
      console.error(`Error fetching Binance data: ${error.message}`);
      return [];
    }
  }
  
  /**
   * 从Bybit获取币种充提信息
   * @returns {Promise<Array>} 标准化后的币种信息
   */
  static async fetchBybitData() {
    try {
      const response = await ApiClient.bybitRequest('GET', '/v5/asset/coin/query-info');
      
      // 保存原始API响应数据
      await RawDataLogger.saveRawResponse('Bybit', '/v5/asset/coin/query-info', response);
      
      if (response.retCode !== 0) {
        throw new Error(`Bybit API Error: ${response.retMsg}`);
      }
      
      // 标准化数据结构
      const tokens = {};
      
      for (const item of response.result.rows) {
        const symbol = item.coin;
        
        if (!tokens[symbol]) {
          tokens[symbol] = {
            symbol,
            name: item.name || symbol,
            exchanges: []
          };
        }
        
        // 创建交易所对象
        const exchange = {
          name: 'Bybit',
          chains: []
        };
        
        // 添加链信息
        if (item.chains && item.chains.length > 0) {
          for (const chain of item.chains) {
            exchange.chains.push({
              chain: chain.chain,
              deposit_status: chain.chainDeposit === '1' ? 'open' : 'closed',
              withdraw_status: chain.chainWithdraw === '1' ? 'open' : 'closed',
              contract_address: '', // Bybit API不返回合约地址
              min_withdraw: chain.withdrawMin || '',
              withdraw_fee: chain.withdrawFee || ''
            });
          }
        }
        
        tokens[symbol].exchanges.push(exchange);
      }
      
      return Object.values(tokens);
    } catch (error) {
      console.error(`Error fetching Bybit data: ${error.message}`);
      return [];
    }
  }
  
  /**
   * 从Gate.io获取币种充提信息
   * @returns {Promise<Array>} 标准化后的币种信息
   */
  static async fetchGateData() {
    try {
      const response = await ApiClient.gateRequest('GET', '/api/v4/spot/currencies');
      
      // 保存原始API响应数据
      await RawDataLogger.saveRawResponse('Gate.io', '/api/v4/spot/currencies', response);
      
      // 标准化数据结构
      const tokens = {};
      
      for (const item of response) {
        const symbol = item.currency;
        
        if (!tokens[symbol]) {
          tokens[symbol] = {
            symbol,
            name: item.name || symbol,
            exchanges: []
          };
        }
        
        // 查找该交易所是否已存在
        let exchange = tokens[symbol].exchanges.find(ex => ex.name === 'Gate.io');
        
        if (!exchange) {
          exchange = {
            name: 'Gate.io',
            chains: []
          };
          tokens[symbol].exchanges.push(exchange);
        }
        
        // 添加链信息
        exchange.chains.push({
          chain: item.chain,
          deposit_status: item.deposit_disabled ? 'closed' : 'open',
          withdraw_status: item.withdraw_disabled ? 'closed' : 'open',
          contract_address: '', // Gate.io API不返回合约地址
          min_withdraw: item.min_withdraw_amount || '',
          withdraw_fee: item.withdraw_fee || ''
        });
      }
      
      return Object.values(tokens);
    } catch (error) {
      console.error(`Error fetching Gate.io data: ${error.message}`);
      return [];
    }
  }
  
  /**
   * 从Bitget获取币种充提信息
   * @returns {Promise<Array>} 标准化后的币种信息
   */
  static async fetchBitgetData() {
    try {
      const response = await ApiClient.bitgetRequest('GET', '/api/v2/spot/public/coins');
      
      // 保存原始API响应数据
      await RawDataLogger.saveRawResponse('Bitget', '/api/v2/spot/public/coins', response);
      
      if (response.code !== '00000') {
        throw new Error(`Bitget API Error: ${response.msg}`);
      }
      
      // 标准化数据结构
      const tokens = {};
      
      for (const item of response.data) {
        const symbol = item.coin;
        
        if (!tokens[symbol]) {
          tokens[symbol] = {
            symbol,
            name: symbol, // Bitget API不返回币种名称
            exchanges: []
          };
        }
        
        // 创建交易所对象
        const exchange = {
          name: 'Bitget',
          chains: []
        };
        
        // 添加链信息
        if (item.chains && item.chains.length > 0) {
          for (const chain of item.chains) {
            exchange.chains.push({
              chain: chain.chain,
              deposit_status: chain.rechargeable === 'true' ? 'open' : 'closed',
              withdraw_status: chain.withdrawable === 'true' ? 'open' : 'closed',
              contract_address: chain.contractAddress || '',
              min_withdraw: chain.minWithdrawAmount || '',
              withdraw_fee: chain.withdrawFee || ''
            });
          }
        }
        
        tokens[symbol].exchanges.push(exchange);
      }
      
      return Object.values(tokens);
    } catch (error) {
      console.error(`Error fetching Bitget data: ${error.message}`);
      return [];
    }
  }
  
  /**
   * 合并所有交易所的数据
   * @returns {Promise<Object>} 合并后的数据
   */
  static async mergeAllExchangeData() {
    try {
      // 并行获取所有交易所数据
      const [okxTokens, binanceTokens, bybitTokens, gateTokens, bitgetTokens] = await Promise.all([
        this.fetchOkxData(),
        this.fetchBinanceData(),
        this.fetchBybitData(),
        this.fetchGateData(),
        this.fetchBitgetData()
      ]);
      
      // 合并所有交易所数据
      const allTokens = {};
      
      // 处理函数，将交易所数据合并到allTokens
      const processExchangeTokens = (tokens) => {
        for (const token of tokens) {
          if (!allTokens[token.symbol]) {
            allTokens[token.symbol] = {
              symbol: token.symbol,
              name: token.name,
              exchanges: []
            };
          }
          
          // 合并交易所信息
          for (const exchange of token.exchanges) {
            allTokens[token.symbol].exchanges.push(exchange);
          }
        }
      };
      
      // 处理各交易所数据
      processExchangeTokens(okxTokens);
      processExchangeTokens(binanceTokens);
      processExchangeTokens(bybitTokens);
      processExchangeTokens(gateTokens);
      processExchangeTokens(bitgetTokens);
      
      // 构建最终数据结构
      const result = {
        last_update: new Date().toISOString(),
        tokens: Object.values(allTokens)
      };
      
      return result;
    } catch (error) {
      console.error(`Error merging exchange data: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 保存数据到JSON文件
   * @param {Object} data - 要保存的数据
   * @returns {Promise<void>}
   */
  static async saveDataToFile(data) {
    try {
      const dataDir = path.join(__dirname, '../data');
      const filePath = path.join(dataDir, 'exchange_data.json');
      
      // 确保数据目录存在
      await fs.mkdir(dataDir, { recursive: true });
      
      // 写入数据
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      
      console.log(`Data saved to ${filePath} at ${new Date().toISOString()}`);
    } catch (error) {
      console.error(`Error saving data to file: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 读取上次保存的数据
   * @returns {Promise<Object>} 上次保存的数据
   */
  static async readLastSavedData() {
    try {
      const filePath = path.join(__dirname, '../data/exchange_data.json');
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.warn(`No previous data found or error reading data: ${error.message}`);
      return null;
    }
  }
  
  /**
   * 执行数据采集任务
   * @returns {Promise<Object>} 采集的数据
   */
  static async collectData() {
    try {
      console.log(`Starting data collection at ${new Date().toISOString()}`);
      
      // 获取并合并数据
      const data = await this.mergeAllExchangeData();
      
      // 保存数据
      await this.saveDataToFile(data);
      
      console.log(`Data collection completed at ${new Date().toISOString()}`);
      
      return data;
    } catch (error) {
      console.error(`Error in data collection: ${error.message}`);
      
      // 出错时尝试读取上次保存的数据
      const lastData = await this.readLastSavedData();
      
      if (lastData) {
        console.log('Using last saved data due to collection error');
        return lastData;
      } else {
        // 如果没有上次数据，返回空结构
        return {
          last_update: new Date().toISOString(),
          tokens: [],
          error: error.message
        };
      }
    }
  }
}

module.exports = DataCollector;
