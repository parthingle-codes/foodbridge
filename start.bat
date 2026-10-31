@echo off
title FOODBRIDGE - Community Food Rescue Network
color 0A

echo.
echo   ==================================================
echo   🌿  FOODBRIDGE - Full Stack Launcher
echo   ==================================================
echo.

set "ROOT=%~dp0"

:: 1. BACKEND SETUP
echo   [1/3] Setting up Backend...
cd /d "%ROOT%backend"

if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo         ✅ Created backend .env
    )
)

if not exist "node_modules\" (
    echo         📦 Installing backend dependencies...
    call npm install
)

echo         🚀 Starting Backend on http://localhost:5000 ...
start "FOODBRIDGE Backend (Port 5000)" cmd /k "cd /d "%ROOT%backend" && node src/server.js"

:: 2. FRONTEND SETUP
echo.
echo   [2/3] Setting up Frontend...
cd /d "%ROOT%frontend"

if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo         ✅ Created frontend .env
    )
)

if not exist "node_modules\" (
    echo         📦 Installing frontend dependencies...
    call npm install
)

:: 3. LAUNCH
echo.
echo   [3/3] Opening FOODBRIDGE in browser...
timeout /t 2 /nobreak >nul
start "" http://localhost:5173

echo.
echo   ==================================================
echo   ✨ FOODBRIDGE is running!
echo      Frontend: http://localhost:5173
echo      Backend:  http://localhost:5000/api
echo   ==================================================
echo   Demo Accounts (password: password123):
echo     Donor:      donor@foodbridge.demo
echo     NGO:        ngo1@foodbridge.demo
echo     Volunteer:  volunteer1@foodbridge.demo
echo     Biofarm:    biofarm@foodbridge.demo
echo     Admin:      admin@foodbridge.demo
echo   Demo OTP:     123456
echo   ==================================================
echo.

call npx vite --host
