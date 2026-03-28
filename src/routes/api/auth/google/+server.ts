import { google } from 'googleapis';
import { error, redirect, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ url: requestUrl }) => {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
        throw error(500, 'Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.');
    }

    const redirectUri = `${requestUrl.origin}/api/auth/callback`;

    const oauth2Client = new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        redirectUri
    );

    const scopes = [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/tasks.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
    });

    throw redirect(302, url);
};
