@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$pidFile='.server.pid'; if(Test-Path $pidFile){ $old=(Get-Content $pidFile).Trim(); Stop-Process -Id $old -ErrorAction SilentlyContinue; Remove-Item $pidFile -ErrorAction SilentlyContinue; Write-Host 'Stopped' } else { Write-Host 'Not running' }"
pause
