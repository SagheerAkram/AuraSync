@echo off
chcp 65001 >nul
setlocal
set "VERSION=1.2.0"
title AuraSync Control Center

:MENU
cls
echo.
echo  ======================================================
echo     🌌 AuraSync ^| Ultra-Premium Control Center v%VERSION%
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
echo  1. ⚡ START AURASYNC (Background + Auto-Startup)
echo  2. 🛑 STOP AURASYNC
echo  3. 🌐 OPEN LIVE VISUALIZER (localhost:3333)
echo  4. 📂 VIEW LOGS
echo  5. 🔄 FORCE SYNC ^& REPAIR (Clears tokens ^& Resyncs)
echo  6. 🐛 START IN DEBUG MODE (Visible Window)
echo  7. ❌ EXIT
echo.
set /p choice="Select an option [1-7]: "

if "%choice%"=="1" goto START_APP
if "%choice%"=="2" goto STOP_APP
if "%choice%"=="3" goto OPEN_WEB
if "%choice%"=="4" goto VIEW_LOGS
if "%choice%"=="5" goto REPAIR_APP
if "%choice%"=="6" goto DEBUG_APP
if "%choice%"=="7" exit
goto MENU

:START_APP
echo.
echo  Configuring persistent background service...
pushd "%~dp0"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "STARTUP_VBS=%STARTUP_FOLDER%\AuraSyncStartup.vbs"

:: Cleanup old shortcut if exists
if exist "%STARTUP_FOLDER%\AuraSync.lnk" del "%STARTUP_FOLDER%\AuraSync.lnk"

:: Write fresh unblockable VBS
echo Set WshShell = CreateObject^("WScript.Shell"^) > "%STARTUP_VBS%"
echo WshShell.CurrentDirectory = "%~dp0" >> "%STARTUP_VBS%"
echo WshShell.Run chr^(34^) ^& "%~dp0bin\start.bat" ^& Chr^(34^), 0 >> "%STARTUP_VBS%"
echo Set WshShell = Nothing >> "%STARTUP_VBS%"

echo  Starting AuraSync in shadow mode...
start "" wscript "%~dp0bin\run_hidden.vbs"
popd
echo.
echo  Success! AuraSync is now running ^& set to launch on boot.
timeout /t 3 >nul
exit

:STOP_APP
echo.
echo  Terminating AuraSync background process...
taskkill /f /fi "WINDOWTITLE eq AuraSync_Daemon*" /im node.exe >nul 2>&1
echo  Done.
timeout /t 2 >nul
goto MENU


:REPAIR_APP
echo.
echo  🛠️  Initiating Deep Repair...
echo  Stopping active sessions...
taskkill /F /FI "WINDOWTITLE eq AuraSync_Daemon*" /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1
echo  Clearing cached authentication tokens...
if exist "%~dp0spotify-tokens.json" del "%~dp0spotify-tokens.json"
echo.
echo  [!] Success! You MUST now select "START IN DEBUG MODE" to log in.
pause
goto MENU

:DEBUG_APP
echo.
echo  🐛 Starting AuraSync in DEBUG MODE...
echo  [!] Close the new window to stop debugging.
echo.
pushd "%~dp0"
start "AuraSync_Debug" cmd /k npm start
popd
goto MENU

:OPEN_WEB
start http://localhost:3333
goto MENU

:VIEW_LOGS
if exist "%~dp0logs\listen_history.jsonl" (
    start notepad "%~dp0logs\listen_history.jsonl"
) else (
    echo.
    echo  [!] No history data found yet.
    timeout /t 2 >nul
)
goto MENU
