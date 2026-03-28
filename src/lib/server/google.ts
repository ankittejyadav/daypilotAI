import { google } from 'googleapis';
import { env } from '$env/dynamic/private';
import { parse } from 'cookie';

const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URL || 'http://localhost:5173/api/auth/callback'
);

const getRedirectUri = (request: Request) => {
    const origin = new URL(request.url).origin;
    return `${origin}/api/auth/callback`;
};

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
            getRedirectUri(request)
        );

        client.setCredentials(tokens);
        return {
            calendar: google.calendar({ version: 'v3', auth: client }),
            gmail: google.gmail({ version: 'v1', auth: client }),
            tasks: google.tasks({ version: 'v1', auth: client }),
            auth: client
        };
    } catch (e) {
        console.error('Failed to parse daypilot_session in getGoogleClient:', e);
        return null;
    }
};
