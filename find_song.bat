@echo off
setlocal
cd /d "%~dp0"
title AuraFinder ^| Elite Search

echo.
echo ======================================================
echo    AuraFinder: Local Library Search
echo ======================================================
echo.

set /p song="Enter song or artist name: "

if "%song%"=="" (
    echo [!] No search term.
    timeout /t 2 >nul
    exit
)

echo [>] Searching archives...
echo ------------------------------------------------------
dir /s /b "library\*%song%*" 2>nul
dir /s /b "Playlists\*%song%*" 2>nul
echo ------------------------------------------------------
echo.
pause
exit
