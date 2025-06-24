import React, { useState, useEffect, useRef } from 'react';

/**
 * 代币选择器组件
 * 
 * @param {Object} props
 * @param {Array} props.tokens - 代币列表
 * @param {string} props.selectedToken - 当前选中的代币
 * @param {Function} props.onTokenChange - 代币选择变化时的回调函数
 */
function TokenSelector({ tokens, selectedToken, onTokenChange }) {
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredTokens, setFilteredTokens] = useState([]);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // 初始化输入值
  useEffect(() => {
    if (selectedToken) {
      const token = tokens.find(t => t.symbol === selectedToken);
      if (token) {
        setInputValue(`${token.symbol} - ${token.name}`);
      }
    }
  }, [selectedToken, tokens]);

  // 处理输入变化
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // 过滤代币
    if (value.trim() === '') {
      setFilteredTokens(tokens);
    } else {
      const filtered = tokens.filter(token => 
        token.symbol.toLowerCase().includes(value.toLowerCase()) || 
        token.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTokens(filtered);
    }
    
    setIsDropdownOpen(true);
  };

  // 处理代币选择
  const handleTokenSelect = (symbol) => {
    onTokenChange(symbol);
    setIsDropdownOpen(false);
  };

  // 处理点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 初始化过滤后的代币列表
  useEffect(() => {
    setFilteredTokens(tokens);
  }, [tokens]);

  // 处理输入框获取焦点
  const handleFocus = () => {
    setIsDropdownOpen(true);
  };

  return (
    <div className="token-selector">
      <label htmlFor="token-input">选择代币：</label>
      <div className="token-input-container">
        <input
          ref={inputRef}
          id="token-input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder="输入代币符号或名称"
          disabled={tokens.length === 0}
        />
        {isDropdownOpen && filteredTokens.length > 0 && (
          <div className="token-dropdown" ref={dropdownRef}>
            <div className="token-dropdown-content">
              {filteredTokens.slice(0, 10).map((token) => (
                <div 
                  key={token.symbol} 
                  className={`token-item ${selectedToken === token.symbol ? 'selected' : ''}`}
                  onClick={() => handleTokenSelect(token.symbol)}
                >
                  <span className="token-symbol">{token.symbol}</span>
                  <span className="token-name">{token.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TokenSelector;
