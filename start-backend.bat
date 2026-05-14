@echo off
echo 正在启动青龙湾后端服务...
cd backend
npx ts-node-dev --respawn --transpile-only src/index.ts
pause 