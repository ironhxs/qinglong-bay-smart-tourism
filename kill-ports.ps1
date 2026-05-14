# Kill processes using specific ports
Write-Host 'Checking ports 5001 and 3000-3002...' -ForegroundColor Cyan

# Check port 5001
 = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue | 
               Where-Object State -EQ Listen | 
               Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue
if () {
     = (Get-Process -Id  -ErrorAction SilentlyContinue).ProcessName
    Write-Host "Found process using port 5001:  (ID: )" -ForegroundColor Yellow
    Stop-Process -Id  -Force
    Write-Host "Stopped process on port 5001" -ForegroundColor Green
} else {
    Write-Host "No process found using port 5001" -ForegroundColor Green
}

# Check ports 3000-3002
foreach ( in 3000..3002) {
     = Get-NetTCPConnection -LocalPort  -ErrorAction SilentlyContinue | 
               Where-Object State -EQ Listen | 
               Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue
    if () {
         = (Get-Process -Id  -ErrorAction SilentlyContinue).ProcessName
        Write-Host "Found process using port :  (ID: )" -ForegroundColor Yellow
        Stop-Process -Id  -Force
        Write-Host "Stopped process on port " -ForegroundColor Green
    } else {
        Write-Host "No process found using port " -ForegroundColor Green
    }
}

Write-Host 'All ports cleared' -ForegroundColor Green
