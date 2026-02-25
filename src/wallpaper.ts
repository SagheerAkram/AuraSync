import os from 'os';
import path from 'path';
import sharp from 'sharp';
import axios from 'axios';
import { setWallpaper } from 'wallpaper';
import fs from 'fs';

const TEMP_DIR = path.join(os.tmpdir(), 'musical-music-wallpaper');

export async function updateWallpaper(coverArtUrl: string) {
    try {
        if (!fs.existsSync(TEMP_DIR)) {
            fs.mkdirSync(TEMP_DIR, { recursive: true });
        }

        const rawImagePath = path.join(TEMP_DIR, 'raw_cover.jpg');
        const processedImagePath = path.join(TEMP_DIR, 'processed_wallpaper.jpg');

        // Download the original cover art
        const response = await axios.get(coverArtUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(rawImagePath, Buffer.from(response.data, 'binary'));

        // Process image: Add heavy blur, darken slightly, and expand to a desktop-friendly ratio (16:9)
        // We'll create a 1920x1080 background with the blurred image, and overlay the sharp image in the center (optional, let's just make it a cool abstract blurred background for now)
        await sharp(rawImagePath)
            .resize(1920, 1080, { fit: 'cover', position: 'center' })
            .blur(50) // Heavy blur for abstract glassmorphism feel
            .modulate({ brightness: 0.6, saturation: 1.2 }) // Darken and saturate slightly
            .jpeg({ quality: 90 })
            .toFile(processedImagePath);

        // Set the processed image as the Windows wallpaper
        await setWallpaper(processedImagePath);
        console.log(`🖼️ Wallpaper updated dramatically to match current track!`);

    } catch (error) {
        console.error('❌ Failed to update wallpaper:', error);
    }
}
