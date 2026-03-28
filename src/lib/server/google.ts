import { google } from 'googleapis';
import { env } from '$env/dynamic/private';
import { parse } from 'cookie';

const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URL || 'http://localhost:5173/api/auth/callback'
);

export const getGoogleClient = (request: Request) => {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
        throw new Error('GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing. Please configure your .env file.');
    }
    
    const cookies = parse(request.headers.get('cookie') || '');
    const sessionCookie = cookies.daypilot_session;

    if (!sessionCookie) {
        return null;
    }

    try {
        const session = JSON.parse(sessionCookie);
        const tokens = session.tokens;

        if (!tokens) return null;

        const client = new google.auth.OAuth2(
            env.GOOGLE_CLIENT_ID,
            env.GOOGLE_CLIENT_SECRET,
            env.GOOGLE_REDIRECT_URL || 'http://localhost:5173/api/auth/callback'
        );

        client.setCredentials(tokens);
        return google.calendar({ version: 'v3', auth: client });
    } catch (e) {
        console.error('Failed to parse daypilot_session in getGoogleClient:', e);
        return null;
    }
};
