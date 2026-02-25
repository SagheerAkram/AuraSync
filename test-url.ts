import dotenv from 'dotenv';
import SpotifyWebApi from 'spotify-web-api-node';

dotenv.config();

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: 'http://127.0.0.1:8888/callback'
});

const scopes = ['user-read-currently-playing', 'user-read-recently-played', 'playlist-read-private', 'playlist-read-collaborative'];

console.log("CLIENT ID:", process.env.SPOTIFY_CLIENT_ID);
console.log("CLIENT SECRET LENGTH:", process.env.SPOTIFY_CLIENT_SECRET?.length);
console.log("AUTHORIZE URL:", spotifyApi.createAuthorizeURL(scopes, 'state-musical-music'));
