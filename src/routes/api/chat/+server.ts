import { json } from '@sveltejs/kit';
import { chatWithAI } from '$lib/server/ai';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { message, history } = await request.json();
    
    if (!message) {
        return json({ error: 'Message is required' }, { status: 400 });
    }

    // Get userId from session cookie
    const sessionCookie = cookies.get('daypilot_session');
    let userId: number | undefined = undefined;
    
    if (sessionCookie) {
        try {
            const session = JSON.parse(sessionCookie);
            userId = session.userId;
        } catch (e) {
            console.error('Failed to parse session cookie for chat:', e);
        }
    }

    try {
        const result = await chatWithAI(request, history || [], message, userId);
        return json(result);
    } catch (error) {
        console.error('Chat API Error:', error);
        return json({ 
            error: 'Failed to process AI request',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
