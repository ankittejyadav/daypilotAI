import { fail, redirect, isRedirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { query } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, cookies }) => {
    // If already authenticated, redirect to home
    const sessionCookie = cookies.get('daypilot_session');
    if (sessionCookie) {
        throw redirect(303, '/');
    }
    return {};
};

export const actions: Actions = {
    login: async ({ request, cookies }) => {
        const data = await request.formData();
        const username = data.get('username') as string;
        const password = data.get('password') as string;

        if (!username || !password) {
            return fail(400, { username, missing: true, message: 'Username and password are required' });
        }

        try {
            const result = await query(
                'SELECT * FROM users WHERE username = $1 LIMIT 1',
                [username]
            );

            const user = result.rows[0];

            if (!user) {
                return fail(400, { username, message: 'Invalid username or password' });
            }

            // Simple password check (plain text for demo)
            if (user.password_hash !== password) {
                return fail(400, { username, message: 'Invalid username or password' });
            }

            // Create session
            const session = {
                userId: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatar_url
            };

            cookies.set('daypilot_session', JSON.stringify(session), {
                path: '/',
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });

            throw redirect(303, '/');

        } catch (err) {
            if (isRedirect(err)) throw err;
            console.error('Login error:', err);
            return fail(500, { message: 'An internal error occurred' });
        }
    }
};
