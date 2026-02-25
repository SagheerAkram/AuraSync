import fs from 'fs';
import path from 'path';

const LOGS_DIR = path.join(__dirname, '..', 'logs');
const HISTORY_FILE = path.join(LOGS_DIR, 'listen_history.jsonl');
const COUNTS_FILE = path.join(LOGS_DIR, 'play_counts.json');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

export interface TrackInfo {
    trackName: string;
    artistName: string;
    albumName: string;
    coverArtUrl?: string;
    durationMs: number;
}

/**
 * Logs a new song play event.
 * - Appends a line to listen_history.jsonl (chronological log)
 * - Increments the count in play_counts.json
 */
export function logPlay(track: TrackInfo): void {
    try {
        // --- 1. Append to chronological listen history ---
        const historyEntry = {
            timestamp: new Date().toISOString(),
            track: track.trackName,
            artist: track.artistName,
            album: track.albumName,
            duration_ms: track.durationMs,
        };
        fs.appendFileSync(HISTORY_FILE, JSON.stringify(historyEntry) + '\n', 'utf-8');

        // --- 2. Update play count ---
        const key = `${track.artistName} - ${track.trackName}`;
        let counts: Record<string, number> = {};

        if (fs.existsSync(COUNTS_FILE)) {
            try {
                counts = JSON.parse(fs.readFileSync(COUNTS_FILE, 'utf-8'));
            } catch {
                counts = {};
            }
        }

        counts[key] = (counts[key] || 0) + 1;
        fs.writeFileSync(COUNTS_FILE, JSON.stringify(counts, null, 2), 'utf-8');

        console.log(`📝 Logged: "${key}" (${counts[key]}x played)`);
    } catch (error) {
        console.error('Failed to write log:', error);
    }
}
