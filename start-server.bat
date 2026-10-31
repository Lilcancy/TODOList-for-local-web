@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$pidFile='.server.pid'; if(Test-Path $pidFile){ $old=(Get-Content $pidFile).Trim(); if(Get-Process -Id $old -ErrorAction SilentlyContinue){ Write-Host ('Already running (PID '+$old+')'); Start-Process 'http://localhost:8000'; exit } }; $p=Start-Process pythonw -ArgumentList '-m','http.server','8000' -WorkingDirectory (Get-Location) -WindowStyle Hidden -PassThru; $p.Id | Out-File -Encoding ascii $pidFile; Write-Host ('Started (PID '+$p.Id+')'); Start-Sleep -Milliseconds 800; Start-Process 'http://localhost:8000'"
pause
