@echo off
title AuraSync_Daemon
:: Move to root directory from /bin
cd /d "%~dp0.."
call npm start
