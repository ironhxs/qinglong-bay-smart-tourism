Write-Host "正在启动青龙湾生态智能系统..." -ForegroundColor Green

# 启动后端
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path './backend'; npx ts-node-dev --respawn --transpile-only src/index.ts"

# 启动前端
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path './frontend'; npx vite"

Write-Host "服务启动中，请稍候..." -ForegroundColor Yellow
Write-Host "前端地址: http://localhost:3000" -ForegroundColor Cyan
Write-Host "后端地址: http://localhost:4000" -ForegroundColor Cyan 