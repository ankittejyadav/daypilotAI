import { json } from '@sveltejs/kit';
import { processIncomingWebhook } from '$lib/server/ai';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url }) => {
    try {
        const payload = await request.json();
        const userIdStr = url.searchParams.get('userId');
        
        if (!userIdStr) {
            return json({ error: 'userId query parameter is required' }, { status: 400 });
        }

        const userId = parseInt(userIdStr);
        if (isNaN(userId)) {
            return json({ error: 'Invalid userId' }, { status: 400 });
        }

        console.log(`Incoming Webhook for User ${userId}:`, payload);
        
        const result = await processIncomingWebhook(payload, userId);
        
        return json({
            success: true,
            status: result.status,
            aiResult: result.aiResponse,
            stored: result.stored
        });

    } catch (error) {
        console.error('Webhook API Error:', error);
        return json({ 
            error: 'Failed to process webhook',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
