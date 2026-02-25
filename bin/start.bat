@echo off
title AuraSync_Daemon
:: Move to root directory from /bin
cd /d "%~dp0.."
echo  🌌 AuraSync Engine Starting...
echo.
npm start
pause
