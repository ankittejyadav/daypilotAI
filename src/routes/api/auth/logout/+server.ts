import { redirect } from '@sveltejs/kit';
import { serialize } from 'cookie';

export const GET = async ({ cookies }) => {
    // Clear the session cookie
    cookies.set('daypilot_session', '', {
        path: '/',
        expires: new Date(0),
        httpOnly: true,
        sameSite: 'lax'
    });

    throw redirect(302, '/');
};
