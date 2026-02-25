@echo off
setlocal
set "VERSION=1.2.0"
title AuraSync Control Center

:MENU
cls
echo.
echo  ======================================================
echo     🌌 AuraSync | Ultra-Premium Control Center v%VERSION%
echo  ======================================================
echo.

:: Check if running
tasklist /FI "WINDOWTITLE eq AuraSync_Daemon*" | find "node.exe" >nul
if %errorlevel% equ 0 (
    echo  [!] STATUS: ACTIVE (Running in Background)
) else (
    echo  [ ] STATUS: INACTIVE
)
echo.
echo  1. ⚡ START AURASYNC (Background Mode)
echo  2. 🛑 STOP AURASYNC
echo  3. 🛠️ CONFIGURE AUTO-STARTUP
echo  4. 🌐 OPEN LIVE VISUALIZER (localhost:3333)
echo  5. 📂 VIEW LOGS
echo  6. ❌ EXIT
echo.
set /p choice="Select an option [1-6]: "

if "%choice%"=="1" goto START_APP
if "%choice%"=="2" goto STOP_APP
if "%choice%"=="3" goto SETUP_STARTUP
if "%choice%"=="4" goto OPEN_WEB
if "%choice%"=="5" goto VIEW_LOGS
if "%choice%"=="6" exit
goto MENU

:START_APP
echo.
echo  Starting AuraSync in shadow mode...
start "" wscript "%~dp0bin\run_hidden.vbs"
timeout /t 2 >nul
goto MENU

:STOP_APP
echo.
echo  Terminating AuraSync background process...
taskkill /f /fi "WINDOWTITLE eq AuraSync_Daemon*" /im node.exe >nul 2>&1
echo  Done.
timeout /t 2 >nul
goto MENU

:SETUP_STARTUP
echo.
echo  Configuring unblockable Windows Startup task...
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "STARTUP_VBS=%STARTUP_FOLDER%\AuraSyncStartup.vbs"

:: Cleanup old shortcut if exists
if exist "%STARTUP_FOLDER%\AuraSync.lnk" del "%STARTUP_FOLDER%\AuraSync.lnk"

:: Write fresh unblockable VBS
echo Set WshShell = CreateObject^("WScript.Shell"^) > "%STARTUP_VBS%"
echo WshShell.CurrentDirectory = "%~dp0" >> "%STARTUP_VBS%"
echo WshShell.Run chr^(34^) ^& "%~dp0bin\start.bat" ^& Chr^(34^), 0 >> "%STARTUP_VBS%"
echo Set WshShell = Nothing >> "%STARTUP_VBS%"

echo  Success! AuraSync will now launch automatically on boot.
timeout /t 3 >nul
goto MENU

:OPEN_WEB
start http://localhost:3333
goto MENU

:VIEW_LOGS
if exist "%~dp0logs\listen_history.jsonl" (
    start notepad "%~dp0logs\listen_history.jsonl"
) else (
    echo No history data found yet.
    timeout /t 2 >nul
)
goto MENU
