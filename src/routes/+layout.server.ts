import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
    const sessionCookie = cookies.get('daypilot_session');
    
    if (sessionCookie) {
        try {
            const session = JSON.parse(sessionCookie);
            return {
                isAuthenticated: true,
                user: {
                    id: session.userId,
                    name: session.name,
                    email: session.email,
                    avatarUrl: session.avatarUrl
                }
            };
        } catch (e) {
            console.error('Failed to parse session cookie:', e);
            return { user: null, isAuthenticated: false };
        }
    }

    return {
        user: null,
        isAuthenticated: false
    };
};
