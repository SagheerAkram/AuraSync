import fs from 'fs';
import path from 'path';
import ytDlp from 'yt-dlp-exec';
import sanitize from 'sanitize-filename';
import { addMetadata } from './metadata';

const LIBRARY_PATH = path.join(__dirname, '..', 'library');

export async function downloadTrack(trackName: string, artistName: string, albumName: string, coverArtUrl?: string) {
    // Create safe directory paths
    const safeArtist = sanitize(artistName);
    const safeAlbum = sanitize(albumName);
    const safeTrackName = sanitize(trackName);

    const artistDir = path.join(LIBRARY_PATH, safeArtist);
    const albumDir = path.join(artistDir, safeAlbum);

    if (!fs.existsSync(LIBRARY_PATH)) fs.mkdirSync(LIBRARY_PATH);
    if (!fs.existsSync(artistDir)) fs.mkdirSync(artistDir);
    if (!fs.existsSync(albumDir)) fs.mkdirSync(albumDir);

    const outputPath = path.join(albumDir, `${safeTrackName}.mp3`);

    // Skip if already downloaded
    if (fs.existsSync(outputPath)) {
        console.log(`⏭️ Already downloaded: ${trackName}`);
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
        console.log(`✅ Success: Saved to ${outputPath}`);
        await addMetadata(outputPath, trackName, artistName, albumName, coverArtUrl);
    } catch (error) {
        console.error(`❌ Failed to download ${trackName}:`, error);
    }
}
