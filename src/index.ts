import dotenv from 'dotenv';
import { authenticateSpotify, spotifyApi, seekTrack } from './spotify';
import { downloadTrack } from './downloader';
import { logPlay } from './logger';
import fs from 'fs';
import path from 'path';
import { detectAd, jumpAd } from './aurajump';

dotenv.config();

const POLL_INTERVAL = 500;

// Robust Path Resolution (Using CWD to ensure consistency with .bat launchers)
const PROJECT_ROOT = process.cwd();
const SEEK_SIGNAL_PATH = path.join(PROJECT_ROOT, '.seek_signal');
const LOCK_FILE_PATH = path.join(PROJECT_ROOT, '.aura_lock');
const SYNC_LOG_PATH = path.join(PROJECT_ROOT, 'sync_debug.log');
const PLAYLISTS_ROOT = path.join(PROJECT_ROOT, 'Playlists');
const LIBRARY_PATH = path.join(PROJECT_ROOT, 'library');

let currentTrackDurationMs = 0;

function logSync(msg: string) {
    const timestamp = new Date().toISOString();
    try {
        fs.appendFileSync(SYNC_LOG_PATH, `[${timestamp}] ${msg}\n`);
    } catch (e) { }
    console.log(msg);
}

function createLock() {
    if (fs.existsSync(LOCK_FILE_PATH)) {
        const pid = fs.readFileSync(LOCK_FILE_PATH, 'utf8');
        try {
            process.kill(parseInt(pid), 0);
            logSync('⚠️ AuraSync Elite is already active (PID: ' + pid + '). Resource Guard engaged.');
            process.exit(0);
        } catch (e) {
            try { fs.unlinkSync(LOCK_FILE_PATH); } catch (err) { }
        }
    }
    fs.writeFileSync(LOCK_FILE_PATH, process.pid.toString());
}

function removeLock() {
    try {
        if (fs.existsSync(LOCK_FILE_PATH)) fs.unlinkSync(LOCK_FILE_PATH);
    } catch (e) { }
}

process.on('SIGINT', () => { removeLock(); process.exit(); });
process.on('SIGTERM', () => { removeLock(); process.exit(); });
process.on('exit', () => removeLock());

async function monitorCurrentlyPlaying() {
    let lastTrackId = '';

    setInterval(async () => {
        try {
            const isAd = await detectAd();
            if (isAd) {
                await jumpAd();
                return;
            }

            const data = await spotifyApi.getMyCurrentPlayingTrack();

            if (data.body && data.body.item) {
                // @ts-ignore
                const track = data.body.item;
                const durationMs = track.duration_ms;
                const trackId = track.id;

                if (track.type === 'track') {
                    const trackName = track.name;
                    // @ts-ignore
                    const artistName = track.artists[0].name;
                    // @ts-ignore
                    const albumName = track.album.name;
                    // @ts-ignore
                    const coverArtUrl = track.album.images?.[0]?.url;

                    currentTrackDurationMs = durationMs;

                    if (trackId !== lastTrackId) {
                        lastTrackId = trackId;
                        console.log(`🎵 Now Playing: ${artistName} - ${trackName}`);
                        logPlay({ trackName, artistName, albumName, coverArtUrl, durationMs });
                        await downloadTrack(trackName, artistName, albumName, coverArtUrl);
                    }
                }
            }
        } catch (error) {
            // Silently handle polling errors
        }

        try {
            if (fs.existsSync(SEEK_SIGNAL_PATH)) {
                const signal = fs.readFileSync(SEEK_SIGNAL_PATH, 'utf8').trim();
                const percent = parseFloat(signal);
                if (!isNaN(percent) && currentTrackDurationMs > 0) {
                    const targetMs = Math.floor(currentTrackDurationMs * percent);
                    console.log(`🎯 Shadow Scrubber: Seeking to ${targetMs}ms`);
                    await seekTrack(targetMs);
                }
                try { fs.unlinkSync(SEEK_SIGNAL_PATH); } catch (e) { }
            }
        } catch (seekErr) { }
    }, POLL_INTERVAL);
}

async function syncFullLibrary() {
    try {
        logSync('📚 Syncing "Saved Tracks" archive...');
        let offset = 0;
        let total = 1;
        while (offset < total) {
            const data = await spotifyApi.getMySavedTracks({ limit: 50, offset });
            total = data.body.total;
            for (const item of data.body.items) {
                const track = item.track;
                await downloadTrack(track.name, track.artists[0].name, track.album.name, track.album.images?.[0]?.url);
            }
            offset += 50;
        }
        logSync('✅ Full Library archived successfully.');
    } catch (error: any) {
        logSync('❌ Library Sync Error: ' + error.message);
    }
}

async function syncUserPlaylists() {
    logSync('🔄 Initiating Elite Playlist Sync...');
    try {
        if (!fs.existsSync(PLAYLISTS_ROOT)) {
            logSync('📂 Creating root Playlists directory...');
            fs.mkdirSync(PLAYLISTS_ROOT, { recursive: true });
        }

        let pOffset = 0;
        let pTotal = 1;
        while (pOffset < pTotal) {
            logSync(`📡 Fetching playlists (Offset: ${pOffset})...`);
            const pData = await spotifyApi.getUserPlaylists({ limit: 20, offset: pOffset });
            pTotal = pData.body.total;
            logSync(`📊 Total Playlists Found: ${pTotal}`);

            for (const playlist of pData.body.items) {
                logSync(`📂 Processing Playlist: ${playlist.name} (ID: ${playlist.id})`);
                let tOffset = 0;
                let tTotal = 1;
                while (tOffset < tTotal) {
                    const tData = await spotifyApi.getPlaylistTracks(playlist.id, { limit: 50, offset: tOffset });
                    tTotal = tData.body.total;
                    for (const item of tData.body.items) {
                        const track = item.track;
                        if (track && track.type === 'track') {
                            // @ts-ignore
                            await downloadTrack(track.name, track.artists[0].name, track.album.name, track.album.images?.[0]?.url, playlist.name);
                        }
                    }
                    tOffset += 50;
                }
                logSync(`✅ Syncing Finished for: ${playlist.name}`);
            }
            pOffset += pData.body.items.length;
            if (pData.body.items.length === 0) break;
        }
        logSync('✨ Elite Playlist Mirroring complete.');
    } catch (error: any) {
        logSync('❌ Playlist Sync Error: ' + error.message);
    }
}

async function main() {
    // Delete old debug log on fresh start
    if (fs.existsSync(SYNC_LOG_PATH)) {
        try { fs.unlinkSync(SYNC_LOG_PATH); } catch (e) { }
    }

    createLock();
    logSync('🌌 AuraSync Elite: Starting Professional Suite...');

    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
        logSync('❌ ERROR: Missing Spotify Credentials in .env');
        process.exit(1);
    }

    try {
        logSync('🔑 Authenticating with Spotify...');
        await authenticateSpotify();

        // Parallel sync
        logSync('📡 Starting parallel library and playlist mirroring...');
        syncUserPlaylists();
        syncFullLibrary();

        logSync('🎧 Elite Monitoring Active. Audio Fidelity Engaged.');
        monitorCurrentlyPlaying();
    } catch (err: any) {
        logSync('❌ CRITICAL ENGINE FAILURE: ' + err.message);
    }
}

main().catch((err) => {
    logSync('❌ FATAL ERROR: ' + err.message);
});
