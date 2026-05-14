Write-Host "正在初始化青龙湾数据库..." -ForegroundColor Green

# 执行迁移脚本
Write-Host "`n1. 创建数据库表..." -ForegroundColor Yellow
node backend/scripts/migrate.js

# 执行种子数据脚本
Write-Host "`n2. 插入示例数据..." -ForegroundColor Yellow
node backend/scripts/seed.js

Write-Host "`n数据库初始化完成!" -ForegroundColor Green
Write-Host "按任意键继续..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 