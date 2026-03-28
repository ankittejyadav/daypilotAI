import { getGoogleClient } from '$lib/server/google';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
    const calendar = getGoogleClient(request);

    if (!calendar) {
        return {
            isAuthenticated: false,
            events: []
        };
    }

    try {
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: (new Date()).toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = response.data.items || [];
        
        // Map raw Google events to our existing format if needed, or just pass them through
        // For now, let's map them to a simplified version of our Meeting/TimelineItem format.
        const mappedEvents = events.map(event => ({
            id: event.id,
            title: event.summary || 'No Title',
            startTime: event.start?.dateTime || event.start?.date,
            endTime: event.end?.dateTime || event.end?.date,
            description: event.description || '',
            location: event.location || '',
            hangoutLink: event.hangoutLink || '',
            attendees: (event.attendees || []).length
        }));

        return {
            isAuthenticated: true,
            events: mappedEvents
        };
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        return {
            isAuthenticated: false,
            events: [],
            error: 'Failed to fetch calendar events'
        };
    }
};
