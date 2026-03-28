import { google } from 'googleapis';
import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { serialize } from 'cookie';
import { query } from '$lib/server/db';

export const GET = async ({ url }: RequestEvent) => {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
        throw error(500, 'Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.');
    }

    const oauth2Client = new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        env.GOOGLE_REDIRECT_URL || 'http://localhost:5173/api/auth/callback'
    );

    const code = url.searchParams.get('code');
    if (!code) {
        throw error(400, 'Missing authorization code');
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Fetch user info from Google
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data: userInfo } = await oauth2.userinfo.get();

        if (!userInfo.email || !userInfo.name) {
            throw error(500, 'Could not retrieve user info from Google');
        }

        // Upsert user into database
        const expiryDate = tokens.expiry_date ? new Date(tokens.expiry_date) : null;
        
        const upsertQuery = `
            INSERT INTO users (name, email, avatar_url, google_access_token, google_refresh_token, google_token_expiry)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (email) DO UPDATE SET
                name = EXCLUDED.name,
                avatar_url = EXCLUDED.avatar_url,
                google_access_token = EXCLUDED.google_access_token,
                google_refresh_token = COALESCE(EXCLUDED.google_refresh_token, users.google_refresh_token),
                google_token_expiry = EXCLUDED.google_token_expiry
            RETURNING id;
        `;

        const res = await query(upsertQuery, [
            userInfo.name,
            userInfo.email,
            userInfo.picture,
            tokens.access_token,
            tokens.refresh_token,
            expiryDate
        ]);

        const userId = res.rows[0].id;

        // Create session object
        const session = {
            userId,
            email: userInfo.email,
            name: userInfo.name,
            tokens
        };

        const cookie = serialize('daypilot_session', JSON.stringify(session), {
            httpOnly: true,
            secure: !dev,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });

        return new Response(null, {
            status: 302,
            headers: {
                'Location': '/',
                'Set-Cookie': cookie
            }
        });
    } catch (e) {
        console.error('Error during auth callback:', e);
        throw error(500, 'Authentication failed');
    }
};
