import React, { useState } from 'react';

/**
 * 交易所数据表格组件
 * 
 * @param {Object} props
 * @param {Object} props.data - 代币数据，包含交易所和链信息
 */
function ExchangeTable({ data }) {
  if (!data || !data.exchanges || data.exchanges.length === 0) {
    return <div className="no-data">没有可用数据</div>;
  }

  // 获取状态显示样式
  const getStatusClass = (status) => {
    if (status === 'open') return 'status status-open';
    if (status === 'closed') return 'status status-closed';
    return 'status status-maintenance';
  };

  // 获取状态显示文本
  const getStatusText = (status) => {
    if (status === 'open') return '开启';
    if (status === 'closed') return '关闭';
    return '维护中';
  };

  // 截断合约地址显示
  const truncateAddress = (address) => {
    if (!address) return '-';
    if (address.length <= 16) return address;
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  };
  
  // 合约地址复制功能
  const [copiedAddress, setCopiedAddress] = useState(null);
  
  const copyToClipboard = (address) => {
    if (!address) return;
    
    navigator.clipboard.writeText(address)
      .then(() => {
        setCopiedAddress(address);
        // 2秒后重置复制状态
        setTimeout(() => setCopiedAddress(null), 2000);
      })
      .catch(err => console.error('复制失败:', err));
  };

  return (
    <div className="exchange-table-container">
      <h2>{data.symbol} - {data.name} 交易所支持情况</h2>
      
      <table className="exchange-table">
        <thead>
          <tr>
            <th>交易所</th>
            <th>链</th>
            <th>充值状态</th>
            <th>提现状态</th>
            <th>合约地址</th>
            <th>最小提现量</th>
            <th>提现手续费</th>
          </tr>
        </thead>
        <tbody>
          {data.exchanges.map((exchange, exchangeIndex) => (
            exchange.chains.map((chain, chainIndex) => (
              <tr key={`${exchangeIndex}-${chainIndex}`}>
                {chainIndex === 0 ? (
                  <td rowSpan={exchange.chains.length}>{exchange.name}</td>
                ) : null}
                <td>{chain.chain}</td>
                <td>
                  <span className={getStatusClass(chain.deposit_status)}>
                    {getStatusText(chain.deposit_status)}
                  </span>
                </td>
                <td>
                  <span className={getStatusClass(chain.withdraw_status)}>
                    {getStatusText(chain.withdraw_status)}
                  </span>
                </td>
                <td className="contract-address" title={chain.contract_address}>
                  {chain.contract_address ? (
                    <div className="address-container">
                      <a 
                        href={`https://etherscan.io/address/${chain.contract_address}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {truncateAddress(chain.contract_address)}
                      </a>
                      <button 
                        className={`copy-btn ${copiedAddress === chain.contract_address ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(chain.contract_address)}
                        title="复制合约地址"
                      >
                        {copiedAddress === chain.contract_address ? '已复制' : '复制'}
                      </button>
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td>{chain.min_withdraw || '-'}</td>
                <td>{chain.withdraw_fee || '-'}</td>
              </tr>
            ))
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExchangeTable;
