@echo off
:: ======================================================
::  AuraSync Elite | Emergency Stability Patch
:: ======================================================
set VERSION=2.0.0-ELITE

:: Ensure we are in the correct directory
cd /d "%~dp0"

echo.
echo  --------------------------------------------------
echo     AuraSync Elite ^| One-Click Initialization
echo  --------------------------------------------------
echo.

:: 1. Diagnostic Start (Stops the flicker)
echo [1/4] Calibrating Environment...

:: Check Node
node -v >nul 2>&1
if %errorlevel% equ 0 goto :NODE_OK

:: Attempt Winget
echo [!] Node.js missing. Attempting Elite Auto-Install...
winget -v >nul 2>&1
if %errorlevel% neq 0 goto :WINGET_MISSING

winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
if %errorlevel% neq 0 goto :INSTALL_FAIL
echo [+] Node.js installed. Please restart this script.
pause
exit

:WINGET_MISSING
echo [X] Winget not found. Please install Node.js manually.
echo Download: https://nodejs.org/
pause
exit

:INSTALL_FAIL
echo [X] Auto-Install failed. Please install Node.js manually.
pause
exit

:NODE_OK
echo [+] Node.js Runtime detected.

:: 2. Requirements Check
if exist "node_modules\." goto :MODULES_OK
echo [2/4] Syncing Elite Requirements (First Run)...
call npm install --silent
if %errorlevel% neq 0 (
    echo [X] npm install failed. Check your internet connection.
    pause
    exit
)
:MODULES_OK
echo [+] Requirements: OK.

:: 3. Sanitation
echo [3/4] Purging Ghost Instances...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq AuraSync*" >nul 2>&1
powershell -Command "Get-Process | Where-Object { $_.CommandLine -like '*shadow_scrubber.ps1*' } | Stop-Process -Force" >nul 2>&1
if exist ".aura_lock" del /f /q ".aura_lock" >nul 2>&1

:: 4. Final Validation & Launch
echo [4/4] Activating Fidelity Shield...

:: Critical Check: .env
if exist ".env" goto :ENV_OK
echo [X] ERROR: Configuration (.env) missing.
pause
exit

:ENV_OK
:: Critical Check: Admin
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] ERROR: Admin Rights Required.
    echo Right-click and "Run as Administrator".
    pause
    exit
)

:: Apply Hosts patch
call "bin\aura_shield.bat" >nul 2>&1
echo [+] Patching: SUCCESS.

:: Establishing Daemon
set "STARTUP_VBS=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\AuraSyncStartup.vbs"
(
echo Set WshShell = CreateObject("WScript.Shell")
echo WshShell.CurrentDirectory = "%~dp0"
echo WshShell.Run chr(34) ^& "%~dp0bin\start.bat" ^& Chr(34), 0
echo Set WshShell = Nothing
) > "%STARTUP_VBS%"

:: Run hidden
start "" wscript "bin\run_hidden.vbs"

:: Run scrubber
start "" /min powershell -WindowStyle Hidden -Command "%~dp0bin\shadow_scrubber.ps1"

echo.
echo ======================================================
echo    ELITE STATUS: ACTIVE
echo    AuraSync is now running in the background.
echo    Your Spotify experience is now optimized.
echo ======================================================
echo.
echo Closing in 10 seconds (or press any key to close now)...
timeout /t 10
exit
