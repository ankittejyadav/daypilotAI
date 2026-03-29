import type { PageServerLoad } from './$types';
import { getGoogleClient } from '$lib/server/google';
import { query } from '$lib/server/db';
import { alerts as mockAlerts, insights as mockInsights } from '$lib/data';

export const load: PageServerLoad = async ({ request, parent }) => {
    const google = getGoogleClient(request);
    const { user } = await parent(); // From layout
    
    // Default fallback values if no connection is available
    let briefing = {
        nextMeeting: { title: "No upcoming meetings", time: "--", location: "Zoom", urgent: false },
        emailSummary: { count: 0, topSubject: "No untracked emails", topSender: "" },
        taskSummary: { count: 0, topTitle: "Today's list is clear", dueDate: "" },
        financeSummary: { status: "Healthy", alert: "No alerts" }
    };
    
    let insights: any[] = [];
    let commitments: any[] = [];
    let calendarEvents: any[] = [];
    let focusScore = 0;

    // Calculate data from Database
    const targetUserId = user?.id;
    let dbInsights: any[] = [];

    if (targetUserId) {
        try {
            // 1. Fetch DB Insights
            const insightsRes = await query(
                'SELECT * FROM insights WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
                [targetUserId]
            );
            dbInsights = insightsRes.rows.map(row => ({
                category: row.category,
                title: row.title,
                description: row.description,
                icon: row.icon || 'star',
                status: row.status_text,
                type: row.priority_level || 'secondary'
            }));

            // 2. Fetch DB Calendar Events for Briefing
            const eventsRes = await query(
                'SELECT * FROM calendar_events WHERE user_id = $1 AND start_time > NOW() ORDER BY start_time ASC LIMIT 1',
                [targetUserId]
            );
            if (eventsRes.rows.length > 0) {
                const event = eventsRes.rows[0];
                briefing.nextMeeting = {
                    title: event.title,
                    time: new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    location: event.location || 'Local',
                    urgent: event.is_urgent
                };
            }

            // 3. Fetch DB Tasks for Briefing & Focus Score
            const tasksRes = await query(
                'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
                [targetUserId]
            );
            const allTasks = tasksRes.rows;
            const pendingTasks = allTasks.filter(t => t.status === 'pending');
            const completedTasks = allTasks.filter(t => t.status === 'done');

            if (pendingTasks.length > 0) {
                briefing.taskSummary = {
                    count: pendingTasks.length,
                    topTitle: pendingTasks[pendingTasks.length - 1].title,
                    dueDate: pendingTasks[pendingTasks.length - 1].due_datetime ? new Date(pendingTasks[pendingTasks.length - 1].due_datetime).toLocaleDateString() : "Today"
                };
            }

            if (allTasks.length > 0) {
                focusScore = Math.round((completedTasks.length / allTasks.length) * 100);
            }

            // 4. Fetch DB Financial Alerts
            const alertsRes = await query(
                'SELECT * FROM financial_alerts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
                [targetUserId]
            );
            if (alertsRes.rows.length > 0) {
                briefing.financeSummary = {
                    status: "Monitored",
                    alert: alertsRes.rows[0].title
                };
            }
        } catch (err) {
            console.error('Error fetching dashboard DB data:', err);
        }
    }

    if (!google) {
        return {
            briefing,
            insights: dbInsights.length > 0 ? dbInsights : [],
            commitments: [],
            calendarEvents: [],
            focusScore: focusScore || 0
        };
    }

    try {
        // 1. Fetch Calendar Events & Insights
        const calendarRes = await google.calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date(new Date().setHours(0,0,0,0)).toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime'
        });
        calendarEvents = calendarRes.data.items || [];
        const now = new Date();
        const upcomingEvents = calendarEvents.filter(e => {
            const end = e.end?.dateTime ? new Date(e.end.dateTime) : (e.end?.date ? new Date(e.end.date + 'T23:59:59') : new Date());
            return end > now;
        });
        const nextEvent = upcomingEvents[0];
        
        briefing.nextMeeting = nextEvent ? {
            title: nextEvent.summary as string,
            time: nextEvent.start?.dateTime ? new Date(nextEvent.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day',
            location: nextEvent.location || 'Zoom',
            urgent: true
        } : briefing.nextMeeting;

        if (calendarEvents.length > 3) {
            insights.push({ category: "Calendar", title: "Busy Day Ahead", description: `You have ${calendarEvents.length} meetings today. Preparation suggested.`, icon: "calendar_today", status: "Review schedule", type: "secondary" });
        } else if (calendarEvents.length > 0) {
            insights.push({ category: "Calendar", title: "Light Schedule", description: "You have plenty of time for deep focus work today.", icon: "calendar_today", status: "Focus mode suggested", type: "secondary" });
        }

        // 2. Fetch Gmail, Extract Commitments & Insights
        const gmailListRes = await google.gmail.users.messages.list({
            userId: 'me',
            q: 'is:unread category:primary',
            maxResults: 10
        });

        const messages = gmailListRes.data.messages || [];
        const actionKeywords = ['action required', 'urgent', 'deadline', 'please review', 'follow up', 'important', 'review'];

        if (messages.length > 0) {
            const firstMsg = await google.gmail.users.messages.get({ userId: 'me', id: messages[0].id as string });
            const headers = firstMsg.data.payload?.headers || [];
            const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
            const sender = headers.find(h => h.name === 'From')?.value || 'Unknown';
            briefing.emailSummary = {
                count: messages.length,
                topSubject: subject,
                topSender: sender.split('<')[0].trim()
            };

            // commitment scan
            for (const msg of messages.slice(0, 5)) {
                const detail = await google.gmail.users.messages.get({ userId: 'me', id: msg.id as string });
                const snippet = detail.data.snippet?.toLowerCase() || '';
                const subj = (detail.data.payload?.headers?.find(h => h.name === 'Subject')?.value || '').toLowerCase();
                const from = detail.data.payload?.headers?.find(h => h.name === 'From')?.value || 'Unknown';

                if (actionKeywords.some(kw => snippet.includes(kw) || subj.includes(kw))) {
                    commitments.push({
                        sender: from.split('<')[0].trim(),
                        summary: detail.data.snippet || '',
                        time: "Today",
                        urgent: subj.includes('urgent') || snippet.includes('urgent')
                    });
                }
            }
        }

        if (commitments.length > 0) {
            insights.unshift({ category: "Email", title: `${commitments.length} Commitments`, description: "I've detected action-oriented threads requiring your attention.", icon: "mail", status: "Priority scan", type: "primary" });
        }

        // 3. Fetch Tasks, Calculate Focus Score & Insights
        const taskListsRes = await google.tasks.tasklists.list();
        const firstListId = taskListsRes.data.items?.[0]?.id;
        if (firstListId) {
            const tasksRes = await google.tasks.tasks.list({ tasklist: firstListId, showCompleted: true, maxResults: 20 });
            const allTasks = tasksRes.data.items || [];
            const pendingTasks = allTasks.filter(t => t.status === 'needsAction');
            const completedTasks = allTasks.filter(t => t.status === 'completed');
            
            briefing.taskSummary = {
                count: pendingTasks.length,
                topTitle: pendingTasks[0]?.title || "No pending tasks",
                dueDate: pendingTasks[0]?.due ? new Date(pendingTasks[0].due).toLocaleDateString() : "Today"
            };

            if (allTasks.length > 0) {
                focusScore = Math.round((completedTasks.length / allTasks.length) * 100);
            }
        }

        // 4. Finance (Fallback to DB if available)
        if (!briefing.financeSummary.alert || briefing.financeSummary.alert === 'No alerts') {
            briefing.financeSummary = { status: "Healthy", alert: "No active alerts" };
        }

        return {
            briefing,
            insights: [...dbInsights, ...insights],
            commitments: commitments.length > 0 ? commitments : [],
            calendarEvents,
            focusScore: focusScore || 0
        };
    } catch (e) {
        console.error('Error in dynamic dashboard loader:', e);
        return {
            briefing,
            insights: dbInsights.length > 0 ? dbInsights : [],
            commitments: [],
            calendarEvents: [],
            focusScore: focusScore || 0
        };
    }
};
