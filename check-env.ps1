Write-Host "正在检查青龙湾系统环境..." -ForegroundColor Green

Write-Host "`n1. Node.js 版本:" -ForegroundColor Yellow
node --version

Write-Host "`n2. NPM 版本:" -ForegroundColor Yellow
npm --version

Write-Host "`n3. 检查目录结构:" -ForegroundColor Yellow
Get-ChildItem

Write-Host "`n4. 检查数据库:" -ForegroundColor Yellow
Get-ChildItem -Path "./database"

Write-Host "`n5. 检查前端:" -ForegroundColor Yellow
Get-ChildItem -Path "./frontend"

Write-Host "`n6. 检查后端:" -ForegroundColor Yellow
Get-ChildItem -Path "./backend"

Write-Host "`n7. 检查 package.json:" -ForegroundColor Yellow
Get-Content -Path "./package.json"

Write-Host "`n环境检查完成!" -ForegroundColor Green
Write-Host "按任意键继续..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 