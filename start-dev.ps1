# 停止可能占用端口的服务
Write-Host "正在停止可能占用端口的服务..." -ForegroundColor Yellow
& "$PSScriptRoot\stop-services.ps1"

# 等待端口完全释放
Write-Host "正在等待端口释放..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# 在新窗口启动后端
Write-Host "正在新窗口启动后端..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$PSScriptRoot\start-backend.ps1`""

# 等待后端启动
Write-Host "等待后端服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 在新窗口启动前端
Write-Host "正在新窗口启动前端..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$PSScriptRoot\start-frontend.ps1`""

Write-Host "开发环境已启动!" -ForegroundColor Cyan
Write-Host "后端API: http://localhost:5001/api" -ForegroundColor Green
Write-Host "WebSocket: ws://localhost:5001/ws" -ForegroundColor Green
Write-Host "前端页面: http://localhost:3000 (如果3000被占用会自动使用下一个可用端口)" -ForegroundColor Green 