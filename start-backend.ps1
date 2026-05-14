Write-Host "正在启动青龙湾后端服务..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\backend"
$env:PORT = 5000
npm run dev 