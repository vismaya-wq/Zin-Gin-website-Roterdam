@echo off
cd /d "%~dp0"
title Zin ^& Gin — local preview
echo.
echo  Building and starting preview server...
echo  Keep THIS window open while you browse.
echo  Site URL: http://localhost:4321/
echo.
start "" "http://localhost:4321/"
call npm run serve
