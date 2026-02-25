@echo off
echo.
echo  =========================================
echo    AuraSync | Stop Service
echo  =========================================
echo.
echo  Stopping background processes...

taskkill /F /FI "WINDOWTITLE eq AuraSync_Daemon" /T
taskkill /F /IM node.exe /FI "MODULES eq node.exe" /T >nul 2>&1

echo.
echo  AuraSync has been stopped.
echo.
pause
exit
