@echo off
setlocal
title AuraSync_Launcher

echo.
echo  =========================================
echo    AuraSync | Background Launcher
echo  =========================================
echo.

:: --- Silent Auto-Startup Config ---
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_NAME=AuraSync.lnk"
set "SCRIPT_PATH=%~dp0run_hidden.vbs"

if not exist "%STARTUP_FOLDER%\%SHORTCUT_NAME%" (
    echo  Configuring automatic startup...
    powershell -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut('%STARTUP_FOLDER%\%SHORTCUT_NAME%');$s.TargetPath='%SCRIPT_PATH%';$s.WorkingDirectory='%~dp0';$s.Save()" >nul 2>&1
)

echo  Starting AuraSync in the background...
echo.

start "" wscript "%~dp0run_hidden.vbs"

echo  Done! AuraSync is now active and will
echo  launch automatically on next PC boot.
echo.
timeout /t 3
exit
