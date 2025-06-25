import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TokenSelector from './components/TokenSelector';
import ExchangeTable from './components/ExchangeTable';
import UpdateTime from './components/UpdateTime';

// API基础URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

function App() {
  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState('');
  const [tokenData, setTokenData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 获取所有代币列表
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/tokens`);
        setTokens(response.data);
        
        // 如果有代币，默认选择第一个
        if (response.data.length > 0) {
          setSelectedToken(response.data[0].symbol);
        }
      } catch (err) {
        console.error('获取代币列表失败:', err);
        setError('获取代币列表失败，请稍后再试');
      }
    };

    fetchTokens();
  }, []);

  // 获取最后更新时间
  useEffect(() => {
    const fetchLastUpdate = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/last_update`);
        setLastUpdate(response.data.last_update);
      } catch (err) {
        console.error('获取更新时间失败:', err);
      }
    };

    fetchLastUpdate();
    
    // 每60秒刷新一次更新时间
    const intervalId = setInterval(fetchLastUpdate, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  // 获取选定代币的数据
  const fetchTokenData = async () => {
    if (!selectedToken) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/status?symbol=${selectedToken}`);
      setTokenData(response.data);
      setLastUpdate(response.data.last_update);
    } catch (err) {
      console.error('获取代币数据失败:', err);
      setError('获取代币数据失败，请稍后再试');
      setTokenData(null);
    } finally {
      setLoading(false);
    }
  };

  // 当选择的代币变化时获取数据
  useEffect(() => {
    if (selectedToken) {
      fetchTokenData();
    }
  }, [selectedToken]);

  // 处理代币选择变化
  const handleTokenChange = (symbol) => {
    setSelectedToken(symbol);
  };

  // 处理刷新按钮点击
  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 调用后端手动刷新API
      const refreshResponse = await axios.post(`${API_BASE_URL}/refresh`);
      
      if (refreshResponse.data.success) {
        // 刷新成功后，获取最新的代币数据
        await fetchTokenData();
        setLastUpdate(refreshResponse.data.last_update);
      } else {
        setError('刷新数据失败，请稍后再试');
      }
    } catch (err) {
      console.error('手动刷新数据失败:', err);
      setError('刷新数据失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>交易所信息整合查询系统</h1>
      
      <UpdateTime lastUpdate={lastUpdate} />
      
      <div className="controls">
        <TokenSelector 
          tokens={tokens} 
          selectedToken={selectedToken} 
          onTokenChange={handleTokenChange} 
        />
        <button onClick={handleRefresh} disabled={loading}>
          {loading ? '加载中...' : '刷新数据'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading"></div>
      ) : (
        tokenData && <ExchangeTable data={tokenData} />
      )}
    </div>
  );
}

export default App;
