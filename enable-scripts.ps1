# 需要以管理员身份运行此脚本
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "请以管理员身份运行此脚本！" -ForegroundColor Red
    Write-Host "右键点击 PowerShell，选择'以管理员身份运行'" -ForegroundColor Yellow
    Write-Host "按任意键退出..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# 显示当前执行策略
Write-Host "当前执行策略:" -ForegroundColor Yellow
Get-ExecutionPolicy

# 设置为 RemoteSigned
Write-Host "`n正在设置执行策略为 RemoteSigned..." -ForegroundColor Green
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# 确认设置成功
Write-Host "`n设置后的执行策略:" -ForegroundColor Yellow
Get-ExecutionPolicy

Write-Host "`n执行策略已更新，现在可以运行 PowerShell 脚本了！" -ForegroundColor Green
Write-Host "按任意键继续..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 