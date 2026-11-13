@echo off
cd /d "%~dp0"
title Zin ^& Gin — export design PDF
echo Installing export tools (first run only)...
call npm install
call npx playwright install chromium
echo.
echo Building site and exporting PDF...
call npm run build
start /B npm run preview >nul 2>&1
timeout /t 3 /nobreak >nul
call npm run export:pdf
echo.
echo Opening exports folder...
start "" "%~dp0exports"
pause
