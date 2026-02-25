import NodeID3 from 'node-id3';
import axios from 'axios';
import fs from 'fs';

export async function addMetadata(filePath: string, trackName: string, artistName: string, albumName: string, coverArtUrl?: string) {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found for metadata tagging: ${filePath}`);
        return;
    }

    try {
        let imageBuffer = null;
        if (coverArtUrl) {
            try {
                const response = await axios.get(coverArtUrl, { responseType: 'arraybuffer' });
                imageBuffer = Buffer.from(response.data, 'binary');
            } catch (imageError) {
                console.error(`Failed to download cover art from ${coverArtUrl}:`, imageError);
            }
        }

        const tags: NodeID3.Tags = {
            title: trackName,
            artist: artistName,
            album: albumName,
        };

        if (imageBuffer) {
            tags.image = {
                mime: 'image/jpeg',
                type: {
                    id: 3,
                    name: 'front cover'
                },
                description: 'Cover Art',
                imageBuffer: imageBuffer,
            };
        }

        const success = NodeID3.write(tags, filePath);
        if (success) {
            console.log(`✅ Successfully embedded ID3 metadata into ${filePath}`);
        } else {
            console.error(`❌ Failed to write ID3 metadata to ${filePath}`);
        }
    } catch (error) {
        console.error(`Error embedding metadata to ${filePath}:`, error);
    }
}
