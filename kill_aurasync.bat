@echo off
setlocal
cd /d "%~dp0"
title AuraSync Elite ^| Emergency Kill Switch

echo.
echo ======================================================
echo    AuraSync Emergency Kill Switch
echo ======================================================
echo.

echo [>] Stopping all Node.js processes...
taskkill /f /im node.exe >nul 2>&1

echo [>] Stopping AuraSync windows...
taskkill /f /fi "WINDOWTITLE eq AuraSync*" >nul 2>&1

echo [>] Stopping Scrubber process...
powershell -Command "Get-Process | Where-Object { $_.CommandLine -like '*shadow_scrubber.ps1*' } | Stop-Process -Force" >nul 2>&1

echo [>] Deleting lock files...
if exist ".aura_lock" del /f /q ".aura_lock"
if exist ".seek_signal" del /f /q ".seek_signal"

echo.
echo [+] System Sanitized. All AuraSync processes stopped.
echo.
pause
exit
