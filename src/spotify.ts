import SpotifyWebApi from 'spotify-web-api-node';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import express from 'express';
// We'll use the built-in child_process.exec to open the URL automatically for convenience
import { exec } from 'child_process';

dotenv.config();

const TOKEN_PATH = path.join(__dirname, '..', 'spotify-tokens.json');

export const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: 'http://127.0.0.1:3000/callback'
});

export async function authenticateSpotify(): Promise<boolean> {
    // Try to load existing tokens
    if (fs.existsSync(TOKEN_PATH)) {
        try {
            const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
            spotifyApi.setAccessToken(tokens.access_token);
            spotifyApi.setRefreshToken(tokens.refresh_token);

            try {
                // Test the token
                await spotifyApi.getMe();
                console.log('✅ Successfully authenticated with existing Spotify tokens.');
            } catch (authError) {
                console.log('Existing access token expired. Attempting refresh...');
                // Try to refresh
                const data = await spotifyApi.refreshAccessToken();
                const newAccessToken = data.body['access_token'];
                spotifyApi.setAccessToken(newAccessToken);

                // Update file
                tokens.access_token = newAccessToken;
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
                console.log('✅ Successfully refreshed Spotify access token.');
            }

            // Set up auto-refresh
            setInterval(refreshAccessToken, 1000 * 60 * 45); // refresh every 45 mins
            return true;
        } catch (error) {
            console.log('Existing tokens invalid or refresh failed, initiating new login flow...');
        }
    }

    // If we reach here, we need a new login
    return new Promise((resolve) => {
        const app = express();
        let server: any;

        const scopes = [
            'user-read-currently-playing',
            'user-read-recently-played',
            'playlist-read-private',
            'playlist-read-collaborative',
            'user-modify-playback-state',
            'user-library-read',
            'user-read-private'
        ];
        const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'state-musical-music');

        app.get('/callback', async (req: express.Request, res: express.Response) => {
            const error = req.query.error;
            const code = req.query.code;
            const state = req.query.state;

            if (error) {
                console.error('\n❌ Callback Error:', error);
                res.send('Callback Error! Check the terminal.');
                return;
            }

            if (code && typeof code === 'string') {
                try {
                    const data = await spotifyApi.authorizationCodeGrant(code);
                    const access_token = data.body['access_token'];
                    const refresh_token = data.body['refresh_token'];
                    const expires_in = data.body['expires_in'];

                    spotifyApi.setAccessToken(access_token);
                    spotifyApi.setRefreshToken(refresh_token);

                    fs.writeFileSync(TOKEN_PATH, JSON.stringify({
                        access_token,
                        refresh_token,
                        expires_in
                    }));

                    console.log('\n✅ Successfully authenticated with Spotify!');
                    res.send(`
                        <html>
                            <head>
                                <style>
                                    body {
                                        background: radial-gradient(circle at top left, #2a0845, #000000);
                                        color: white;
                                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;
                                        height: 100vh;
                                        margin: 0;
                                        overflow: hidden;
                                    }
                                    .card {
                                        background: rgba(255, 255, 255, 0.05);
                                        backdrop-filter: blur(20px);
                                        -webkit-backdrop-filter: blur(20px);
                                        border: 1px solid rgba(255, 255, 255, 0.1);
                                        padding: 40px 60px;
                                        border-radius: 24px;
                                        text-align: center;
                                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                                        animation: slideUp 0.8s ease-out;
                                    }
                                    h1 {
                                        font-size: 3rem;
                                        margin-bottom: 10px;
                                        background: linear-gradient(to right, #a18cd1 0%, #fbc2eb 100%);
                                        -webkit-background-clip: text;
                                        -webkit-text-fill-color: transparent;
                                    }
                                    p {
                                        font-size: 1.1rem;
                                        color: rgba(255, 255, 255, 0.7);
                                        line-height: 1.6;
                                    }
                                    .check {
                                        width: 80px;
                                        height: 80px;
                                        background: #22c55e;
                                        border-radius: 50%;
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;
                                        margin: 0 auto 30px;
                                        box-shadow: 0 0 30px rgba(34, 197, 94, 0.4);
                                    }
                                    svg {
                                        width: 40px;
                                        height: 40px;
                                        color: white;
                                    }
                                    @keyframes slideUp {
                                        from { opacity: 0; transform: translateY(30px); }
                                        to { opacity: 1; transform: translateY(0); }
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="card">
                                    <div class="check">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <h1>Success!</h1>
                                    <p><b>AuraSync</b> is now connected to your Spotify account.<br>You can safely close this tab and return to the daemon.</p>
                                </div>
                            </body>
                        </html>
                    `);

                    setInterval(refreshAccessToken, 1000 * 60 * 45);

                    // Close the server and resolve the promise
                    if (server) {
                        server.close();
                    }
                    resolve(true);

                } catch (err) {
                    console.error('\n❌ Error getting Tokens:', err);
                    res.send('Error getting tokens! Check the terminal.');
                }
            } else {
                res.send('No code provided!');
            }
        });

        server = app.listen(3000, () => {
            console.log('\n======================================================');
            console.log('Spotify Authentication Required!');
            console.log('1. A new browser window should open automatically to log you in.');
            console.log('2. If it does not, open the following URL in your browser:');
            console.log(`\n   ${authorizeURL}\n`);
            console.log('3. Log in to Spotify and agree to the permissions.');
            console.log('4. Look for the "Success!" message in your browser.');
            console.log('======================================================\n');

            // Try to open the URL automatically
            if (process.platform === 'win32') {
                // Use PowerShell to avoid CMD's escaping issues with '&'
                exec(`powershell -Command "Start-Process '${authorizeURL}'"`);
            } else {
                const startCmd = process.platform === 'darwin' ? 'open' : 'xdg-open';
                exec(`${startCmd} "${authorizeURL}"`);
            }
        });
    });
}

async function refreshAccessToken() {
    try {
        const data = await spotifyApi.refreshAccessToken();
        const access_token = data.body['access_token'];

        spotifyApi.setAccessToken(access_token);
        if (data.body['refresh_token']) {
            spotifyApi.setRefreshToken(data.body['refresh_token']);
        }

        // Update tokens file
        const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
        tokens.access_token = access_token;
        if (data.body['refresh_token']) tokens.refresh_token = data.body['refresh_token'];
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));

        console.log('🔄 Spotify access token refreshed');
    } catch (error) {
        console.error('Could not refresh access token', error);
    }
}

export async function pauseTrack() {
    return spotifyApi.pause().catch(err => console.error('Spotify Pause Error:', err.message));
}

export async function playTrack() {
    return spotifyApi.play().catch(err => console.error('Spotify Play Error:', err.message));
}

export async function skipNext() {
    return spotifyApi.skipToNext().catch(err => console.error('Spotify Skip Error:', err.message));
}

export async function skipPrevious() {
    return spotifyApi.skipToPrevious().catch(err => console.error('Spotify Prev Error:', err.message));
}

export async function seekTrack(positionMs: number) {
    return spotifyApi.seek(positionMs).catch(err => console.error('Spotify Seek Error:', err.message));
}
