import React from 'react';

/**
 * 更新时间显示组件
 * 
 * @param {Object} props
 * @param {string} props.lastUpdate - 最后更新时间
 */
function UpdateTime({ lastUpdate }) {
  // 格式化时间显示
  const formatDateTime = (isoString) => {
    if (!isoString) return '未知';
    
    try {
      const date = new Date(isoString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('日期格式化错误:', error);
      return isoString;
    }
  };

  return (
    <div className="update-time">
      <span>数据最后更新时间: {formatDateTime(lastUpdate)}</span>
    </div>
  );
}

export default UpdateTime;
