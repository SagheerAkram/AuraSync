@echo off
setlocal
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "STARTUP_VBS=%STARTUP_FOLDER%\AuraSyncStartup.vbs"

echo Setting up AuraSync to run at startup...

echo Set WshShell = CreateObject^("WScript.Shell"^) > "%STARTUP_VBS%"
echo WshShell.CurrentDirectory = "%~dp0" >> "%STARTUP_VBS%"
echo WshShell.Run chr^(34^) ^& "%~dp0start.bat" ^& Chr^(34^), 0 >> "%STARTUP_VBS%"
echo Set WshShell = Nothing >> "%STARTUP_VBS%"

echo Done! AuraSync will now run in the background on Windows startup.
echo.
echo  - Launch silently: Double-click 'START_AURASYNC.bat'
echo  - Stop service:    Double-click 'STOP_AURASYNC.bat'
echo.
pause
