import dotenv from 'dotenv';
import { authenticateSpotify, spotifyApi } from './spotify';
import { initDiscord, updatePresence } from './discord';
import { downloadTrack } from './downloader';
import { startServer, updateServerData } from './server';
import { logPlay } from './logger';

dotenv.config();

const POLL_INTERVAL = 10000; // Poll Spotify every 10 seconds

let currentSyncStatus = '';

async function monitorCurrentlyPlaying() {
    let lastTrackId = '';

    setInterval(async () => {
        try {
            const data = await spotifyApi.getMyCurrentPlayingTrack();
            const queueData = await (spotifyApi as any).getQueue().catch(() => null); // getQueue might not be in all TS types

            if (data.body && data.body.item) {
                // @ts-ignore
                const track = data.body.item;
                const isPlaying = data.body.is_playing;
                const progressMs = data.body.progress_ms || 0;
                // @ts-ignore
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
                    // @ts-ignore
                    const trackUrl = track.external_urls.spotify;

                    // Get next track name
                    let nextUp = '';
                    if (queueData && queueData.body && queueData.body.queue && queueData.body.queue.length > 0) {
                        nextUp = `${queueData.body.queue[0].name} ┃ ${queueData.body.queue[0].artists[0].name}`;
                    }

                    // Update presence every poll to keep timestamps/pause state in sync
                    updatePresence(trackName, artistName, albumName, progressMs, durationMs, isPlaying, trackUrl, currentSyncStatus, nextUp, coverArtUrl);

                    // Update live visualizer dashboard
                    updateServerData({ trackName, artistName, albumName, coverArtUrl, trackUrl, progressMs, durationMs, isPlaying });

                    if (trackId !== lastTrackId) {
                        lastTrackId = trackId;
                        console.log(`🎵 Now Playing: ${artistName} - ${trackName}`);

                        currentSyncStatus = `${artistName} - ${trackName}`;
                        logPlay({ trackName, artistName, albumName, coverArtUrl, durationMs });
                        await downloadTrack(trackName, artistName, albumName, coverArtUrl);
                        currentSyncStatus = ''; // Reset when done
                    }
                }
            }
        } catch (error) {
            console.error('Error polling currently playing track:', error);
        }
    }, POLL_INTERVAL);
}

async function main() {
    console.log('Starting AuraSync Daemon...');

    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
        console.error('❌ Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env file.');
        console.error('Please create a .env file and add your Spotify developer keys.');
        process.exit(1);
    }

    // 1. Authenticate Spotify
    await authenticateSpotify();

    // 2. Initialize Discord RPC
    await initDiscord();

    // Sync full library before polling
    await syncFullLibrary();

    // 3. Start Live Experience Server
    startServer();

    // 4. Start Polling
    console.log('🎧 Monitoring Spotify for listening activity...');
    monitorCurrentlyPlaying();
}

async function syncFullLibrary() {
    console.log('🔄 Checking if full library sync is needed...');
    // We only want to sync heavily on first run (we'll just use a dumb simple check, like if the artist table exists/is empty. Actually, let's just do a manual blast. If files exist, yt-dlp skips them anyway)
    try {
        console.log('📚 Fetching your "Saved Tracks" from Spotify...');
        const limit = 50;
        let offset = 0;
        let total = 1; // dummy initial value to enter loop

        // This is a simplified "sync". It will fetch the latest saved tracks.
        while (offset < total) {
            const data = await spotifyApi.getMySavedTracks({ limit, offset });
            total = data.body.total;
            const tracks = data.body.items;

            for (const item of tracks) {
                const track = item.track;
                const trackName = track.name;
                const artistName = track.artists[0].name;
                const albumName = track.album.name;
                // Get highest res image
                const coverArtUrl = track.album.images.length > 0 ? track.album.images[0].url : undefined;

                // Queue the download (it skips if exists)
                await downloadTrack(trackName, artistName, albumName, coverArtUrl);
            }
            offset += limit;
        }

    } catch (error) {
        console.error('Failed to sync full library:', error);
    }
}

main().catch(console.error);
