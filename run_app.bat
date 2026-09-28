@echo off
title IP-SAKTI Sahayak — Launcher
echo ======================================================================
echo           Starting IP-SAKTI Sahayak (Ayurvedic IP Advisor)
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Python FastAPI Backend on port 8000...
start "IP-SAKTI Backend (Port 8000)" cmd /k "cd backend && python server.py"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Vite Frontend on port 5173...
start "IP-SAKTI Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ======================================================================
echo Application started successfully!
echo Opening browser to http://localhost:5173/ ...
echo ======================================================================
start http://localhost:5173/

echo.
echo Both servers are running. Close the server windows to stop.
pause
