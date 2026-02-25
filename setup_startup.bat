@echo off
setlocal
set "SCRIPT_PATH=%~dp0run_hidden.vbs"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_NAME=AuraSync.lnk"

echo Setting up AuraSync to run at startup...

powershell -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut('%STARTUP_FOLDER%\%SHORTCUT_NAME%');$s.TargetPath='%SCRIPT_PATH%';$s.WorkingDirectory='%~dp0';$s.Save()"

echo Done! AuraSync will now run in the background on Windows startup.
echo.
echo  - Launch silently: Double-click 'START_AURASYNC.bat'
echo  - Stop service:    Double-click 'STOP_AURASYNC.bat'
echo.
pause
