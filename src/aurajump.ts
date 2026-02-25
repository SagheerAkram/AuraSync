import { exec } from 'child_process';
import { spotifyApi } from './spotify';

/**
 * Detects if the current track is an advertisement.
 * Combines Spotify API data and Window Title monitoring.
 */
export async function detectAd(): Promise<boolean> {
    try {
        // 1. Check via Spotify API
        const data = await spotifyApi.getMyCurrentPlayingTrack();
        if (data.body && data.body.currently_playing_type === 'ad') {
            return true;
        }

        // 2. Fallback: Check Window Title via PowerShell
        // Spotify Free sets the window title to "Advertisement" during ads.
        return new Promise((resolve) => {
            const cmd = `powershell -Command "Get-Process Spotify -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -eq 'Advertisement' -or $_.MainWindowTitle -eq 'Spotify'} | Select-Object -ExpandProperty MainWindowTitle"`;
            exec(cmd, (error, stdout) => {
                if (stdout.trim() === 'Advertisement') {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    } catch (e) {
        return false;
    }
}

/**
 * Rapidly bypasses the current segment (usually an ad).
 * Level: Phantom Stealth.
 */
export async function jumpAd() {
    console.log('⚡ Phantom Skip Triggered...');

    try {
        // Step 1: Attempt Silent API Skip (The "Sky" Method)
        // If AuraShield is working, the ad servers are blocked, and a simple skip 
        // often forces the client to move to the next "real" track in the queue.
        await spotifyApi.skipToNext();
        console.log('✅ Silent API Skip successful.');
        return;
    } catch (e) {
        // Step 2: Stealth Restart Fallback
        // Only hits here if the ad has "Locked" the skip operation.
        console.log('⚠️ API Skip Locked. Initiating Phantom Restart...');

        return new Promise((resolve) => {
            // Kill Spotify forcefully (silent)
            exec('taskkill /F /IM Spotify.exe', (error) => {
                setTimeout(() => {
                    // Start Spotify MINIMIZED to avoid stealing focus/visibility
                    // Use PowerShell for a more reliable minimized launch
                    const startCmd = `powershell -Command "Start-Process spotify.exe -WindowStyle Minimized"`;
                    exec(startCmd, (err) => {
                        if (err) console.error('Phantom Restart Error:', err);

                        // Force playback via API once it's back up
                        setTimeout(async () => {
                            try {
                                await spotifyApi.play();
                                console.log('✅ Phantom Restart Complete. Silent fun restored.');
                            } catch (pErr) {
                                // Ignore play errors if client hasn't fully loaded
                            }
                            resolve(true);
                        }, 2000); // Give Spotify 2s to initialize
                    });
                }, 400); // 400ms cooling
            });
        });
    }
}
