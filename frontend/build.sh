#!/bin/bash

# 交易所信息整合查询系统 - 前端构建脚本

echo "开始构建前端应用..."

# 设置生产环境变量
export NODE_ENV=production
export REACT_APP_API_URL=/api

# 安装依赖
npm install

# 构建应用
npm run build

echo "前端构建完成！"
