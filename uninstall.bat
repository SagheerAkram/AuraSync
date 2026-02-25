@echo off
setlocal
cd /d "%~dp0"
title AuraSync Elite ^| Uninstall

echo.
echo ======================================================
echo    AuraSync: System Restoration
echo ======================================================
echo.

:: Admin Check
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Admin Rights Required.
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit
)

echo [>] Stopping all processes...
taskkill /f /im node.exe >nul 2>&1
powershell -Command "Get-Process | Where-Object { $_.CommandLine -like '*shadow_scrubber.ps1*' } | Stop-Process -Force" >nul 2>&1

echo [>] Removing startup triggers...
set "VBS=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\AuraSyncStartup.vbs"
if exist "%VBS%" del /f /q "%VBS%"

echo [>] Restoring system fidelity...
call "bin\aura_shield.bat" uninstall >nul 2>&1

echo [>] Deleting session data...
if exist "spotify-tokens.json" del /f /q "spotify-tokens.json"
if exist ".aura_lock" del /f /q ".aura_lock"
if exist "sync_debug.log" del /f /q "sync_debug.log"

echo.
echo [+] System Restored to original state.
echo.
pause
exit
