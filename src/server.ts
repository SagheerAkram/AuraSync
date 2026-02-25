import express from 'express';
import path from 'path';

const app = express();
const PORT = 3333;

let currentSongData = {
    trackName: '',
    artistName: '',
    albumName: '',
    coverArtUrl: '',
    trackUrl: '',
    progressMs: 0,
    durationMs: 0,
    isPlaying: false
};

export function startServer() {
    // Serve static files from the public folder
    app.use(express.static(path.join(__dirname, '../public')));

    // API to get current song data
    app.get('/api/status', (req, res) => {
        res.json(currentSongData);
    });

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🌐 AuraSync Live Experience available at http://localhost:${PORT}`);
    });
}

export function updateServerData(data: any) {
    currentSongData = { ...currentSongData, ...data };
}
