@echo off
echo 正在启动青龙湾生态智能系统...

REM 启动后端
start cmd /k "cd backend && npx ts-node-dev --respawn --transpile-only src/index.ts"

REM 启动前端
start cmd /k "cd frontend && npx vite"

echo 服务启动中，请稍候...
echo 前端地址: http://localhost:3000
echo 后端地址: http://localhost:4000 