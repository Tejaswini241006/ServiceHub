@echo off
:: ============================================================
::  ServiceHub — Local Start Script for Windows
::  Usage:  double-click start.bat  OR  run from cmd
:: ============================================================
setlocal enabledelayedexpansion

echo.
echo  ╔══════════════════════════════════════╗
echo  ║       ServiceHub — Local Start        ║
echo  ╚══════════════════════════════════════╝
echo.

set ROOT=%~dp0
set BACKEND=%ROOT%backend
set FRONTEND=%ROOT%frontend
set VENV=%BACKEND%\.venv

:: Check python
python --version >nul 2>&1 || (echo [ERROR] Python not found. Install Python 3.10+. & pause & exit /b 1)
node --version   >nul 2>&1 || (echo [ERROR] Node.js not found. Install Node.js 18+. & pause & exit /b 1)

echo [INFO]  Setting up Python virtual environment...
if not exist "%VENV%" (
    python -m venv "%VENV%"
)

call "%VENV%\Scripts\activate.bat"

echo [INFO]  Installing Python packages...
pip install --quiet -r "%BACKEND%\requirements.txt"

cd /d "%BACKEND%"
set FLASK_APP=run.py
set FLASK_ENV=development

if not exist "%BACKEND%\servicehub.db" (
    echo [INFO]  Initialising database...
    if not exist "%BACKEND%\migrations\env.py" flask db init
    flask db migrate -m "initial schema"
    flask db upgrade
    echo [INFO]  Seeding demo data...
    python seed.py
) else (
    flask db upgrade
)

echo [INFO]  Installing npm packages...
cd /d "%FRONTEND%"
if not exist "node_modules" npm install

echo.
echo  Backend  --^>  http://localhost:5000
echo  Frontend --^>  http://localhost:5173
echo.
echo  Demo accounts:
echo    Admin:    admin@servicehub.com   / Admin@123
echo    Customer: customer1@example.com  / Customer@123
echo    Provider: rajesh@provider.com    / Provider@123
echo.
echo  Close this window to stop the servers.
echo.

:: Start backend in new window
start "ServiceHub Backend" cmd /k "cd /d %BACKEND% && call %VENV%\Scripts\activate.bat && set FLASK_ENV=development && python run.py"

:: Give it a moment
timeout /t 2 /nobreak >nul

:: Start frontend in new window
start "ServiceHub Frontend" cmd /k "cd /d %FRONTEND% && npm run dev"

echo [OK]  Both servers started in separate windows.
pause
