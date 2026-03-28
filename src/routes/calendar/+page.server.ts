import { getGoogleClient } from '$lib/server/google';
import { query } from '$lib/server/db';
import { parse } from 'cookie';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { timeline as mockTimeline } from '$lib/data';
import { getTodayAtTime } from '$lib/server/dateUtils';

export const load: PageServerLoad = async ({ request }) => {
    const services = getGoogleClient(request);
    const isAuthenticated = !!(services && services.calendar);

    if (!isAuthenticated) {
        const mappedEvents = mockTimeline.map((event, index) => ({
            id: index,
            title: event.title,
            startTime: getTodayAtTime(event.time),
            location: event.team || 'Zoom',
            zoomId: '882-192',
            description: event.context,
            needsPrep: index === 0,
            isUrgent: index === 0,
            briefing: {
                lastDiscussed: "Previous sync",
                links: ["Meeting Notes", "Project Deck"]
            }
        }));

        return {
            isAuthenticated: false,
            events: mappedEvents
        };
    }

    const cookies = parse(request.headers.get('cookie') || '');
    const session = cookies.daypilot_session ? JSON.parse(cookies.daypilot_session) : null;
    const userId = session?.userId;

    try {
        let events = [];
        if (userId) {
            const res = await query('SELECT * FROM calendar_events WHERE user_id = $1 ORDER BY start_time ASC', [userId]);
            events = res.rows;
        } else {
            // Fallback to Demo User events
            const demoUserRes = await query('SELECT id FROM users WHERE email = $1', ['demo@daypilot-ai.com']);
            if (demoUserRes.rows.length > 0) {
                const demoUserId = demoUserRes.rows[0].id;
                const res = await query('SELECT * FROM calendar_events WHERE user_id = $1 ORDER BY start_time ASC', [demoUserId]);
                events = res.rows;
            }
        }

        const mappedEvents = events.map(event => ({
            id: event.id,
            title: event.title,
            startTime: event.start_time,
            location: event.location || 'Zoom',
            zoomId: event.zoom_id || '',
            description: event.ai_context || '',
            needsPrep: event.needs_prep,
            isUrgent: event.is_urgent,
            briefing: {
                lastDiscussed: "Previous sync",
                links: ["Meeting Notes", "Project Deck"]
            }
        }));

        return {
            isAuthenticated,
            events: mappedEvents
        };
    } catch (error) {
        console.error('Error fetching calendar events from DB:', error);
        return {
            isAuthenticated,
            events: [],
            error: 'Failed to fetch calendar events from database'
        };
    }
};

export const actions: Actions = {
    sync: async ({ request }) => {
        const services = getGoogleClient(request);
        if (!services || !services.calendar) {
            return fail(401, { error: 'Not authenticated with Google' });
        }

        const cookies = parse(request.headers.get('cookie') || '');
        const session = cookies.daypilot_session ? JSON.parse(cookies.daypilot_session) : null;
        const userId = session?.userId;

        if (!userId) return fail(400, { error: 'No user session found' });

        const { calendar } = services;

        try {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            const response = await calendar.events.list({
                calendarId: 'primary',
                timeMin: startOfDay.toISOString(),
                maxResults: 50,
                singleEvents: true,
                orderBy: 'startTime',
            });

            const gEvents = response.data.items || [];
            
            for (const ge of gEvents) {
                const startTime = ge.start?.dateTime || ge.start?.date;
                const title = ge.summary || 'No Title';
                const location = ge.location || '';
                const description = ge.description || '';
                
                // Simple logic for needs_prep and is_urgent for the demo
                const needsPrep = description.length > 10 || (ge.attendees || []).length > 2;
                const isUrgent = title.toLowerCase().includes('urgent') || title.toLowerCase().includes('sync');

                await query(`
                    INSERT INTO calendar_events (user_id, title, start_time, location, ai_context, needs_prep, is_urgent)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT DO NOTHING
                `, [userId, title, startTime, location, description, needsPrep, isUrgent]);
            }

            return { success: true, count: gEvents.length };
        } catch (e) {
            console.error('Sync failed:', e);
            return fail(500, { error: 'Failed to sync with Google' });
        }
    },

    addEvent: async ({ request }) => {
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const startTime = formData.get('startTime') as string;
        const location = formData.get('location') as string;
        const context = formData.get('context') as string;

        const cookies = parse(request.headers.get('cookie') || '');
        const session = cookies.daypilot_session ? JSON.parse(cookies.daypilot_session) : null;
        let userId = session?.userId;

        if (!userId) {
            // If no session, try to get Demo User ID
            const demoRes = await query('SELECT id FROM users WHERE email = $1', ['demo@daypilot.ai']);
            if (demoRes.rows.length > 0) userId = demoRes.rows[0].id;
        }

        if (!userId) return fail(400, { error: 'User not found' });

        try {
            await query(`
                INSERT INTO calendar_events (user_id, title, start_time, location, ai_context, needs_prep)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [userId, title, startTime, location, context, (context?.length > 0)]);

            return { success: true };
        } catch (e) {
            console.error('Failed to add event:', e);
            return fail(500, { error: 'Failed to save event to database' });
        }
    }
};
