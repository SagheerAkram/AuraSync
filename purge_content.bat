@echo off
setlocal
cd /d "%~dp0"
title AuraSync Elite ^| CONTENT PURGE

echo.
echo ======================================================
echo    AuraSync: Copyright Protection Purge
echo ======================================================
echo.
echo  [!] This will delete all downloaded songs locally.
echo  [!] Files in .gitignore will NEVER be sent to GitHub.
echo.
pause

echo [>] Stopping engine...
taskkill /f /im node.exe >nul 2>&1

echo [>] Purging Library...
if exist "library" rmdir /s /q "library"
mkdir library

echo [>] Purging Playlists...
if exist "Playlists" rmdir /s /q "Playlists"
mkdir Playlists

echo [>] Cleaning cache...
if exist "aurasync_data" rmdir /s /q "aurasync_data"

echo.
echo [+] LOCAL CONTENT PURGED.
echo [+] Your GitHub repo is 100% safe.
echo.
pause
exit
