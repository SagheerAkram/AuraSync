import DiscordRPC from 'discord-rpc';

// Set this to your Discord App Client ID in .env
const clientId = process.env.DISCORD_CLIENT_ID || 'YOUR_DISCORD_CLIENT_ID';
let rpc: DiscordRPC.Client | null = null;
const startTimestamp = new Date();

export async function initDiscord() {
    rpc = new DiscordRPC.Client({ transport: 'ipc' });

    rpc.on('ready', () => {
        console.log('🎮 Connected to local Discord RPC!');
        setIdlePresence();
    });

    try {
        await rpc.login({ clientId }).catch(console.error);
    } catch (err) {
        console.error('Discord RPC failed to initialize. (Is Discord running?)', err);
    }
}

export function updatePresence(
    trackName: string,
    artistName: string,
    albumName: string,
    progressMs: number,
    durationMs: number,
    isPlaying: boolean,
    trackUrl: string,
    syncStatus?: string,
    nextUp?: string,
    coverArtUrl?: string
) {
    if (!rpc) return;

    if (!isPlaying) {
        rpc.setActivity({
            details: `⏸️ Paused: ${trackName}`,
            state: `👤 ${artistName} · 💿 ${albumName}`,
            largeImageKey: coverArtUrl || 'aurasync_logo',
            largeImageText: 'AuraSync | Passive Listening',
            instance: false,
        }).catch(console.error);
        return;
    }

    // Calculate timestamps
    const now = Date.now();
    const startTimestamp = Math.floor((now - progressMs) / 1000);
    const endTimestamp = Math.floor((now - progressMs + durationMs) / 1000);

    rpc.setActivity({
        details: `🎧 ${trackName}`,
        state: nextUp ? `⏭️ Next: ${nextUp}` : `👤 ${artistName} ┃ 💿 ${albumName}`,
        startTimestamp,
        endTimestamp,
        largeImageKey: coverArtUrl || 'aurasync_logo',
        largeImageText: syncStatus ? `📡 Syncing: ${syncStatus}` : `AuraSync Pro | Sync Established`,
        smallImageKey: syncStatus ? 'https://img.icons8.com/ios-filled/50/ffffff/sync.png' : 'https://img.icons8.com/ios-filled/50/ffffff/play.png',
        smallImageText: syncStatus ? 'Downloading to Library...' : 'High-Fidelity Audio',
        buttons: [
            { label: 'View on Spotify', url: trackUrl },
            { label: 'AuraSync Home', url: 'https://github.com/' } // Dummy link for pro feel
        ],
        instance: false,
    }).catch(console.error);
}

export function setIdlePresence() {
    if (!rpc) return;

    rpc.setActivity({
        details: 'Idle',
        state: 'Listening to nothing',
        startTimestamp,
        largeImageKey: 'spotify_icon',
        largeImageText: 'AuraSync Daemon',
        instance: false,
    }).catch(console.error);
}
