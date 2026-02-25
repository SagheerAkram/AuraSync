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
echo  1. ⚡ START AURASYNC (Background Mode)
echo  2. 🛑 STOP AURASYNC
echo  3. 🛠️ CONFIGURE AUTO-STARTUP
echo  4. 🌐 OPEN LIVE VISUALIZER (localhost:3333)
echo  5. 📂 VIEW LOGS
echo  6. 🔄 FORCE SYNC ^& REPAIR (Clears tokens ^& Resyncs)
echo  7. 🐛 START IN DEBUG MODE (Visible Window)
echo  8. ❌ EXIT
echo.
set /p choice="Select an option [1-8]: "

if "%choice%"=="1" goto START_APP
if "%choice%"=="2" goto STOP_APP
if "%choice%"=="3" goto SETUP_STARTUP
if "%choice%"=="4" goto OPEN_WEB
if "%choice%"=="5" goto VIEW_LOGS
if "%choice%"=="6" goto REPAIR_APP
if "%choice%"=="7" goto DEBUG_APP
if "%choice%"=="8" exit
goto MENU

:START_APP
echo.
echo  Starting AuraSync in shadow mode...
start "" wscript "%~dp0bin\run_hidden.vbs"
echo  AuraSync is now monitoring in the background. Exiting...
timeout /t 3 >nul
exit

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

:REPAIR_APP
echo.
echo  🛠️  Initiating Deep Repair...
echo  Stopping active sessions...
taskkill /F /FI "WINDOWTITLE eq AuraSync_Daemon*" /T >nul 2>&1
echo  Clearing cached authentication tokens...
if exist "%~dp0spotify-tokens.json" del "%~dp0spotify-tokens.json"
echo  Flushing library cache (safe)...
echo.
echo  Success! Next step: Start AuraSync in DEBUG MODE [Option 7] to re-log in.
timeout /t 5 >nul
goto MENU

:DEBUG_APP
echo.
echo  🐛 Starting AuraSync in DEBUG MODE (Visible Window)...
echo  [!] Use this to see logs or re-authenticate.
echo  [!] Close the new window to stop the debug session.
start "AuraSync_Debug" cmd /k "cd /d \"%~dp0bin\" && start.bat"
timeout /t 3 >nul
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
