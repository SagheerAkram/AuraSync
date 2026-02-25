import fs from 'fs';
import path from 'path';
import ytDlp from 'yt-dlp-exec';
import sanitize from 'sanitize-filename';
import { addMetadata } from './metadata';

// Use process.cwd() to ensure we are always relative to the project root where the .bat files are
const PROJECT_ROOT = process.cwd();
const LIBRARY_PATH = path.join(PROJECT_ROOT, 'library');
const PLAYLISTS_ROOT = path.join(PROJECT_ROOT, 'Playlists');

export async function downloadTrack(trackName: string, artistName: string, albumName: string, coverArtUrl?: string, playlistName?: string) {
    // Create safe directory paths
    const safeArtist = sanitize(artistName);
    const safeAlbum = sanitize(albumName);
    const safeTrackName = sanitize(trackName);

    let targetDir: string;

    if (playlistName) {
        const safePlaylist = sanitize(playlistName);
        const playlistDir = path.join(PLAYLISTS_ROOT, safePlaylist);
        if (!fs.existsSync(PLAYLISTS_ROOT)) fs.mkdirSync(PLAYLISTS_ROOT, { recursive: true });
        if (!fs.existsSync(playlistDir)) fs.mkdirSync(playlistDir, { recursive: true });
        targetDir = playlistDir;
    } else {
        const artistDir = path.join(LIBRARY_PATH, safeArtist);
        const albumDir = path.join(artistDir, safeAlbum);
        if (!fs.existsSync(LIBRARY_PATH)) fs.mkdirSync(LIBRARY_PATH, { recursive: true });
        if (!fs.existsSync(artistDir)) fs.mkdirSync(artistDir, { recursive: true });
        if (!fs.existsSync(albumDir)) fs.mkdirSync(albumDir, { recursive: true });
        targetDir = albumDir;
    }

    const outputPath = path.join(targetDir, `${safeTrackName}.mp3`);

    // Skip if already downloaded
    if (fs.existsSync(outputPath)) {
        return;
    }

    // To search youtube: "ytsearch1: track artist album"
    const query = `ytsearch1:${trackName} ${artistName} audio`;

    console.log(`📥 Downloading: ${artistName} - ${trackName}...`);
    try {
        await ytDlp(query, {
            extractAudio: true,
            audioFormat: 'mp3',
            audioQuality: 0,
            output: outputPath,
            noPlaylist: true,
        });
        await addMetadata(outputPath, trackName, artistName, albumName, coverArtUrl);
    } catch (error) {
        console.error(`❌ Failed to download ${trackName}:`, error);
    }
}
