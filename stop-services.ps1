# Stop processes using specific ports
function Stop-ProcessOnPort {
    param (
        [int]$port
    )
    
    $processInfo = netstat -ano | findstr ":$port" | findstr "LISTENING"
    if ($processInfo) {
        $processId = ($processInfo -split ' ')[-1]
        Write-Host "Found process using port $($port): PID $processId"
        try {
            Stop-Process -Id $processId -Force
            Write-Host "Successfully stopped process $processId on port $($port)" -ForegroundColor Green
        } catch {
            Write-Host "Failed to stop process $processId" -ForegroundColor Red
        }
    } else {
        Write-Host "No process found using port $($port)" -ForegroundColor Yellow
    }
}

Write-Host "Checking and stopping processes on ports..." -ForegroundColor Cyan

# Check backend port 5001
Stop-ProcessOnPort -port 5001

# Check frontend ports 3000-3002
for ($port = 3000; $port -le 3002; $port++) {
    Stop-ProcessOnPort -port $port
}

Write-Host "All port checks completed" -ForegroundColor Green
Write-Host "All services stopped" -ForegroundColor Green
