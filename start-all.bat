@echo off
echo ========================================
echo Customer Segmentation System - Startup
echo ========================================
echo.

echo Starting MongoDB...
start "MongoDB" cmd /k "mongod"
timeout /t 3 /nobreak > nul

echo Starting ML Service (Python)...
start "ML Service" cmd /k "cd ml-service && python app.py"
timeout /t 3 /nobreak > nul

echo Starting Backend API...
start "Backend API" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo All services are starting!
echo ========================================
echo ML Service: http://localhost:5001
echo Backend API: http://localhost:5000
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to open the frontend in your browser...
pause > nul

start http://localhost:5173

echo.
echo To stop all services, close all the command windows.
echo.
pause
