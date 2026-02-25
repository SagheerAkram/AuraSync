@echo off
setlocal
cd /d "%~dp0"
title AuraSync Elite ^| Relogin

echo.
echo ======================================================
echo    AuraSync: Credential Reset
echo ======================================================
echo.

echo [>] Stopping engine...
taskkill /f /im node.exe >nul 2>&1
if exist ".aura_lock" del /f /q ".aura_lock"

echo [>] Clearing tokens...
if exist "spotify-tokens.json" del /f /q "spotify-tokens.json"

echo [+] Tokens cleared. Run AuraSync.bat to login again.
echo.
pause
exit
