@echo off
setlocal
cd /d "%~dp0"
start "EcoFusion API" cmd /k ""%~dp0backend\run-backend.bat""
timeout /t 2 >nul
start "EcoFusion Frontend" cmd /k ""%~dp0frontend\run-frontend.bat""
timeout /t 2 >nul
start http://localhost:5173
