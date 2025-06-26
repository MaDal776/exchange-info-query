# 交易所信息整合查询系统

本系统用于整合多家加密货币交易所的币种充提状态和合约地址信息，提供统一的查询接口和前端界面。

## 功能特点

- 支持多家交易所：OKX、Binance、Bybit、Gate.io、Bitget
- 自动采集并整合各交易所API数据
- 支持多链和多合约地址
- 提供币种充值/提现状态查询
- 提供合约地址查询
- 定时自动更新数据
- 响应式前端界面，支持移动端

## 系统架构

- 后端：Node.js + Express
- 前端：React
- 数据存储：本地JSON文件
- 定时任务：node-cron

## 目录结构

```
exchange-info-query/
├── backend/                # 后端代码
│   ├── app.js             # 主应用入口
│   ├── config/            # 配置文件
│   │   └── exchanges.js   # 交易所配置
│   ├── data/              # 数据存储目录
│   │   └── exchange_data.json  # 合并后的交易所数据
│   └── scripts/           # 脚本文件
│       ├── apiClient.js   # API客户端
│       ├── dataCollector.js  # 数据采集器
│       └── scheduler.js   # 定时任务调度器
├── frontend/              # 前端代码
│   ├── public/            # 静态资源
│   └── src/               # 源代码
│       ├── components/    # React组件
│       ├── App.js         # 主应用组件
│       └── index.js       # 入口文件
├── .env                   # 环境变量配置
└── ecosystem.config.js    # PM2配置文件
```

## 安装与部署

### 环境要求

- Node.js 14.x 或更高版本
- npm 6.x 或更高版本
- PM2 (生产环境)

### 安装步骤

1. 克隆代码库
```
git clone <repository-url> exchange-info-query
cd exchange-info-query
```

2. 安装后端依赖
```
cd backend
npm install
cd ..
```

3. 安装前端依赖
```
cd frontend
npm install
cd ..
```

4. 配置环境变量
```
cp .env.example .env
```
然后编辑 `.env` 文件，填入各交易所的API密钥和其他配置。

### 开发环境运行

1. 启动后端服务
```
cd backend
node app.js
```

2. 启动前端开发服务器
```
cd frontend
npm start
```

3. 访问开发环境
浏览器打开 http://localhost:3001

### 生产环境部署

1. 构建前端
```
cd frontend
bash build.sh
```

2. 使用PM2启动后端服务
```
pm2 start ecosystem.config.js
```

3. 配置Nginx (示例配置)
```nginx
server {
    listen 8081;
    server_name your ip;  # 替换为您的域名或IP

    # 前端应用
    location / {
        proxy_pass http://localhost:3001;  # Next.js前端服务 如果你是3000端口 这里修改为3000
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API请求
    location /api {
        proxy_pass http://localhost:4000;  # Express后端服务
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## API文档

### 获取所有支持的代币列表

```
GET /api/tokens
```

响应示例:
```json
[
  {
    "symbol": "BTC",
    "name": "Bitcoin"
  },
  {
    "symbol": "ETH",
    "name": "Ethereum"
  }
]
```

### 获取代币状态信息

```
GET /api/status?symbol=BTC
```

响应示例:
```json
{
  "symbol": "BTC",
  "name": "Bitcoin",
  "exchanges": [
    {
      "name": "OKX",
      "chains": [
        {
          "chain": "BTC",
          "deposit_status": "open",
          "withdraw_status": "open",
          "contract_address": null,
          "min_withdraw": "0.001",
          "withdraw_fee": "0.0005"
        }
      ]
    }
  ],
  "last_update": "2025-06-24T13:55:50.299Z"
}
```

### 获取最后更新时间

```
GET /api/last_update
```

响应示例:
```json
{
  "last_update": "2025-06-24T13:55:50.299Z"
}
```

## 数据刷新

系统默认按照 `.env` 文件中 `REFRESH_INTERVAL` 配置的时间间隔自动刷新数据。默认配置为每小时的第5分钟执行一次数据采集。

## 错误处理

- 如果API请求失败，系统会使用上次成功保存的数据
- 所有API错误都会记录到控制台
- 生产环境中错误会记录到 `logs/error.log` 文件

## 安全注意事项

- API密钥应妥善保管，不要提交到代码库
- 生产环境应配置HTTPS
- 考虑添加API访问限制和认证机制

## 维护与监控

- 使用PM2监控Node.js进程
- 定期检查日志文件
- 监控数据更新时间，确保数据保持最新

## 许可证

MIT
