Write-Host "正在启动青龙湾前端服务..." -ForegroundColor Green

# 进入frontend目录
Set-Location -Path "$PSScriptRoot\frontend"

# 启动前端服务
npm run dev 