@echo off
setlocal
cd /d "%~dp0"
echo =====================================
echo EcoFusion RentalCars - Development
echo =====================================
if not exist backend\.env copy backend\.env.example backend\.env
if not exist frontend\.env.local copy frontend\.env.local.example frontend\.env.local
echo.
echo Backend:  http://localhost:8000
 echo Frontend: http://localhost:5173
 echo.
start "EcoFusion API" cmd /k "cd /d "%~dp0backend" && call run-backend.bat"
timeout /t 2 >nul
start "EcoFusion Frontend" cmd /k "cd /d "%~dp0frontend" && call run-frontend.bat"
timeout /t 3 >nul
start http://localhost:5173
