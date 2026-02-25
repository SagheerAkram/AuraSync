@echo off
setlocal EnableDelayedExpansion

:: AuraShield: Advanced Privacy & Ad-Management Patch
:: This script modifies the hosts file and clears local cache.
:: Requires Administrative Privileges.

:: Check for Admin rights
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo.
    echo  [!] ERROR: AuraShield requires Administrative Privileges.
    echo  Please restart AuraSync.bat as Administrator.
    pause
    exit /b
)

echo.
echo  🛡️  Initializing AuraShield Privacy Patch...
echo  ------------------------------------------

:: 1. Build the Blocklist
set HOSTS=%windir%\System32\drivers\etc\hosts
set TEMP_HOSTS=%temp%\hosts_new

:: Create a backup if not already present
if not exist "%HOSTS%.bak" copy "%HOSTS%" "%HOSTS%.bak"

echo  [*] Injecting privacy routing into hosts file...

:: Use a temporary file to build the new hosts
copy /y "%HOSTS%" "%TEMP_HOSTS%" >nul

:: List of ad-delivery domains
set DOMAINS=adeventtracker.spotify.com ads-fa.spotify.com analytics.spotify.com audio-ak-spotify-com.akamaized.net audio-sp-spotify-com.akamaized.net heads-fa.spotify.com image-ak-spotify-com.akamaized.net image-sp-spotify-com.akamaized.net pagead2.googlesyndication.com pubads.g.doubleclick.net securepubads.g.doubleclick.net crashdump.spotify.com log.spotify.com gads.pubmatic.com ads.pubmatic.com spclient.wg.spotify.com

for %%d in (%DOMAINS%) do (
    findstr /i "%%d" "%TEMP_HOSTS%" >nul
    if !errorlevel! NEQ 0 (
        echo 0.0.0.0 %%d >> "%TEMP_HOSTS%"
    )
)

:: Move the new hosts file into place
move /y "%TEMP_HOSTS%" "%HOSTS%" >nul

echo  [+] Privacy routing injected successfully.

:: 2. Clear Spotify Cache
echo  [*] Purging local ad-cache...
set SPOTIFY_DATA=%LocalAppData%\Spotify\Storage

if exist "%SPOTIFY_DATA%" (
    taskkill /f /im Spotify.exe >nul 2>&1
    timeout /t 2 >nul
    del /s /q "%SPOTIFY_DATA%\*" >nul 2>&1
    echo  [+] Local ad-cache purged.
) else (
    echo  [!] Spotify data folder not found. Skipping cache purge.
)

echo  🛡️  AuraShield is now ACTIVE.
echo  ------------------------------------------
timeout /t 2 >nul
exit /b
