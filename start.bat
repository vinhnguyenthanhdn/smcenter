@echo off
echo ========================================
echo   Speech Checker - Starting Server
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed!
    echo.
    echo Please install Python from https://www.python.org/downloads/
    echo.
    echo Alternative: Open index.html directly in Chrome/Edge
    echo Note: Some features may not work with file:// protocol
    echo.
    pause
    exit /b 1
)

echo Starting HTTP server on port 8000...
echo.
python server.py

pause

