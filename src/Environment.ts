import 'dotenv/config';

export const botUsername: string = process.env.BOT_USERNAME ?? '';
export const testing: boolean = process.env.TESTING === 'true';
export const twitchClientId = process.env.TWITCH_CLIENT_ID ?? '';
export const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET ?? '';
export const twitchAuthToken = process.env.AUTH_TOKEN ?? '';
export const secret = process.env.SECRET ?? '';
export const ngrokUrl = process.env.NGROK_URL ?? 'localhost:8081';
export const apiEnabled = process.env.API_ENABLED === 'true';
export const sessionSecret = process.env.SESSION_SECRET ?? '';
