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
set "STARTUP_VBS=%STARTUP_FOLDER%\AuraSyncStartup.vbs"
set "OLD_SHORTCUT=%STARTUP_FOLDER%\AuraSync.lnk"

if exist "%OLD_SHORTCUT%" (
    del "%OLD_SHORTCUT%"
)

if not exist "%STARTUP_VBS%" (
    echo  Configuring automatic startup...
    echo Set WshShell = CreateObject^("WScript.Shell"^) > "%STARTUP_VBS%"
    echo WshShell.CurrentDirectory = "%~dp0" >> "%STARTUP_VBS%"
    echo WshShell.Run chr^(34^) ^& "%~dp0start.bat" ^& Chr^(34^), 0 >> "%STARTUP_VBS%"
    echo Set WshShell = Nothing >> "%STARTUP_VBS%"
)

echo  Starting AuraSync in the background...
echo.

start "" wscript "%~dp0run_hidden.vbs"

echo  Done! AuraSync is now active and will
echo  launch automatically on next PC boot.
echo.
timeout /t 3
exit
