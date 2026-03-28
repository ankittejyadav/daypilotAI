import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { env } from '$env/dynamic/private';
import { getGoogleClient } from './google';
import * as mockData from '../data';
import { query } from './db';

// Initialize Gemini
const API_KEY = env.GEMINI_API_KEY;
const IS_KEY_VALID = API_KEY && API_KEY !== 'REPLACE_WITH_YOUR_GEMINI_API_KEY';

const genAI = new GoogleGenerativeAI(IS_KEY_VALID ? API_KEY : 'dummy_key');
const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    tools: [
        {
            functionDeclarations: [
                {
                    name: 'list_calendar_events',
                    description: 'Lists the user\'s calendar events for a specific time range.',
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            timeMin: { type: SchemaType.STRING, description: 'The start of the time range (ISO date string).' },
                            timeMax: { type: SchemaType.STRING, description: 'The end of the time range (ISO date string).' }
                        },
                        required: ['timeMin']
                    }
                },
                {
                    name: 'create_calendar_event',
                    description: 'Creates a new calendar event.',
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            summary: { type: SchemaType.STRING, description: 'The title of the event.' },
                            start: { type: SchemaType.STRING, description: 'The start time (ISO date string).' },
                            end: { type: SchemaType.STRING, description: 'The end time (ISO date string).' },
                            description: { type: SchemaType.STRING, description: 'A description of the event.' }
                        },
                        required: ['summary', 'start', 'end']
                    }
                },
                {
                    name: 'list_tasks',
                    description: 'Lists the user\'s tasks.',
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {}
                    }
                },
                {
                    name: 'create_task',
                    description: 'Creates a new task.',
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            title: { type: SchemaType.STRING, description: 'The title of the task.' },
                            notes: { type: SchemaType.STRING, description: 'Additional notes for the task.' },
                            due: { type: SchemaType.STRING, description: 'The due date (ISO date string).' }
                        },
                        required: ['title']
                    }
                },
                {
                    name: 'list_emails',
                    description: 'Lists the user\'s emails based on a search query.',
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            query: { type: SchemaType.STRING, description: 'The Gmail search query (e.g., "from:google", "is:urgent").' },
                            maxResults: { type: SchemaType.NUMBER, description: 'Maximum number of results to return.' }
                        }
                    }
                },
                {
                    name: 'store_data_point',
                    description: 'Saves a high-priority piece of information (Task, Calendar Event, Dashboard Insight, or Bill) to the user\'s personal database for long-term tracking.',
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            type: { 
                                type: SchemaType.STRING, 
                                description: 'The kind of data to store (task, event, insight, or bill).'
                            },
                            data: {
                                type: SchemaType.OBJECT,
                                description: 'The data object to store. Fields depend on the type.',
                                properties: {
                                    title: { type: SchemaType.STRING },
                                    description: { type: SchemaType.STRING },
                                    category: { type: SchemaType.STRING },
                                    priority: { type: SchemaType.STRING, description: 'High, Medium, Low' },
                                    due_date: { type: SchemaType.STRING, description: 'ISO date string' },
                                    amount: { type: SchemaType.NUMBER },
                                    status_text: { type: SchemaType.STRING },
                                    priority_level: { type: SchemaType.STRING, description: 'primary, secondary, tertiary, error' }
                                }
                            }
                        },
                        required: ['type', 'data']
                    }
                },
                {
                    name: 'search_my_database',
                    description: 'Queries the user\'s personal database for stored tasks, events, bills, or insights. Use this to find information previously saved via store_data_point.',
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            query_text: { type: SchemaType.STRING, description: 'Keywords to search for in titles and descriptions.' },
                            category_filter: { type: SchemaType.STRING, description: 'Filter by category (e.g., "Finance", "Work", "Urgent").' },
                            limit: { type: SchemaType.NUMBER, description: 'Max results to return.' }
                        }
                    }
                }
            ]
        }
    ]
});

/**
 * Provides a mock response for the AI assistant when the Gemini API is unavailable.
 * Uses keywords to detect intent and formats responses using mock data.
 */
const getMockResponse = (message: string, history: any[]) => {
    const msg = message.toLowerCase();
    let response = "I'm currently in **Demo Mode** because no Gemini API key was found in the `.env` file. ";
    
    if (msg.includes('task') || msg.includes('todo')) {
        const taskList = mockData.tasks.map(t => `- [${t.status === 'done' ? 'x' : ' '}] **${t.title}** (${t.priority} priority, due ${t.due})`).join('\n');
        response += `\n\nHere are your current tasks:\n${taskList}`;
    } else if (msg.includes('calendar') || msg.includes('event') || msg.includes('meeting')) {
        const events = mockData.timeline.map(e => `- **${e.time}**: ${e.title} (${e.team})`).join('\n');
        response += `\n\nHere's your schedule for today:\n${events}`;
    } else if (msg.includes('email') || msg.includes('mail')) {
        const emails = mockData.emails.map(e => `- **From ${e.sender}**: ${e.subject}`).join('\n');
        response += `\n\nI found these recent emails for you:\n${emails}`;
    } else if (msg.includes('finance') || msg.includes('bill') || msg.includes('money')) {
        const bills = mockData.bills.map(b => `- **${b.category}**: $${b.amount.toFixed(2)} on ${b.date}`).join('\n');
        response += `\n\nHere are your upcoming bills:\n${bills}`;
    } else {
        response += "\n\nI can help you manage your tasks, check your calendar, or look through your emails. Try asking about 'my tasks' or 'my calendar'!";
    }

    return {
        response,
        history: [...history, { role: 'user', parts: [{ text: message }] }, { role: 'model', parts: [{ text: response }] }]
    };
};

export const chatWithAI = async (request: Request, history: any[], message: string, userId?: number) => {
    if (!IS_KEY_VALID) {
        console.log('AI falling back to Mock Mode (API Key missing or placeholder).');
        return getMockResponse(message, history);
    }
    
    const google = getGoogleClient(request);
    
    // We don't throw an error here anymore to allow Demo Mode with mock data
    const isDemoMode = !google;

    const chat = model.startChat({
        history: history.map(h => ({
            role: h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
            parts: h.parts || [{ text: h.content || '' }]
        }))
    });

    let result;
    try {
        result = await chat.sendMessage(message);
    } catch (e: any) {
        console.error('Gemini SendMessage Error:', e);
        throw new Error(`Gemini API Error: ${e.message || 'Unknown error'}`);
    }
    
    let call = result.response.functionCalls()?.[0];

    // Handle Function Calling Loop
    while (call) {
        console.log(`AI Calling Tool (${isDemoMode ? 'DEMO' : 'LIVE'}): ${call.name}`, call.args);
        
        let functionResponse;
        try {
            switch (call.name) {
                case 'list_calendar_events': {
                    if (isDemoMode) {
                        functionResponse = mockData.timeline.map(t => ({
                            summary: t.title,
                            start: { dateTime: `2024-10-24T${t.time.replace(' PM', ':00').replace(' AM', ':00')}` },
                            description: t.context
                        }));
                    } else {
                        const args = call.args as any;
                        const res = await google!.calendar.events.list({
                            calendarId: 'primary',
                            timeMin: args.timeMin as string,
                            timeMax: args.timeMax as string,
                            singleEvents: true,
                            orderBy: 'startTime'
                        });
                        functionResponse = res.data.items || [];
                    }
                    break;
                }
                case 'create_calendar_event': {
                    if (isDemoMode) {
                        const args = call.args as any;
                        functionResponse = { status: 'success', message: 'DEMO: Event created.', event: args };
                    } else {
                        const args = call.args as any;
                        const res = await google!.calendar.events.insert({
                            calendarId: 'primary',
                            requestBody: {
                                summary: args.summary as string,
                                description: args.description as string,
                                start: { dateTime: args.start as string },
                                end: { dateTime: args.end as string }
                            }
                        });
                        functionResponse = res.data;
                    }
                    break;
                }
                case 'list_tasks': {
                    if (isDemoMode) {
                        functionResponse = mockData.tasks;
                    } else {
                        const res = await google!.tasks.tasks.list({ tasklist: '@default' });
                        functionResponse = res.data.items || [];
                    }
                    break;
                }
                case 'create_task': {
                    if (isDemoMode) {
                        const args = call.args as any;
                        functionResponse = { status: 'success', message: 'DEMO: Task created.', task: args };
                    } else {
                        const args = call.args as any;
                        const res = await google!.tasks.tasks.insert({
                            tasklist: '@default',
                            requestBody: {
                                title: args.title as string,
                                notes: args.notes as string,
                                due: args.due as string
                            }
                        });
                        functionResponse = res.data;
                    }
                    break;
                }
                case 'list_emails': {
                    if (isDemoMode) {
                        functionResponse = mockData.emails;
                    } else {
                        const args = call.args as any;
                        const res = await google!.gmail.users.messages.list({
                            userId: 'me',
                            q: args.query as string,
                            maxResults: (args.maxResults as number) || 10
                        });
                        
                        const messages = res.data.messages || [];
                        const detailedMessages = await Promise.all(
                            messages.slice(0, 5).map(async (m) => {
                                const detail = await google!.gmail.users.messages.get({ userId: 'me', id: m.id! });
                                return {
                                    snippet: detail.data.snippet,
                                    subject: detail.data.payload?.headers?.find(h => h.name === 'Subject')?.value,
                                    from: detail.data.payload?.headers?.find(h => h.name === 'From')?.value
                                };
                            })
                        );
                        functionResponse = detailedMessages;
                    }
                    break;
                }
                case 'store_data_point': {
                    if (!userId) {
                        functionResponse = { error: 'Authentication required to store data.' };
                    } else {
                        const { type, data } = call.args as any;
                        try {
                            switch (type) {
                                case 'task':
                                    await query(
                                        'INSERT INTO tasks (user_id, title, priority, due_datetime, category) VALUES ($1, $2, $3, $4, $5)',
                                        [userId, data.title, data.priority || 'Medium', data.due_date, data.category || 'General']
                                    );
                                    break;
                                case 'event':
                                    await query(
                                        'INSERT INTO calendar_events (user_id, title, start_time, ai_context) VALUES ($1, $2, $3, $4)',
                                        [userId, data.title, data.due_date, data.description]
                                    );
                                    break;
                                case 'insight':
                                    await query(
                                        'INSERT INTO insights (user_id, category, title, description, status_text, priority_level) VALUES ($1, $2, $3, $4, $5, $6)',
                                        [userId, data.category || 'General', data.title, data.description, data.status_text, data.priority_level || 'secondary']
                                    );
                                    break;
                                case 'bill':
                                    await query(
                                        'INSERT INTO bills (user_id, category, due_date, amount) VALUES ($1, $2, $3, $4)',
                                        [userId, data.category || 'General', data.due_date, data.amount]
                                    );
                                    break;
                            }
                            functionResponse = { status: 'success', message: `${type} successfully tracked in your database.` };
                        } catch (err) {
                            console.error('DB Store Error:', err);
                            functionResponse = { error: 'Failed to store data in database.' };
                        }
                    }
                    break;
                }
                case 'search_my_database': {
                    if (!userId) {
                        functionResponse = { error: 'Authentication required to search database.' };
                    } else {
                        const { query_text, category_filter, limit = 10 } = call.args as any;
                        try {
                            // Search across multiple relevant tables
                            const tasksRes = await query(
                                "SELECT 'task' as source, title, priority as meta, due_datetime as date FROM tasks WHERE user_id = $1 AND (title ILIKE $2 OR category ILIKE $2) LIMIT $3",
                                [userId, `%${query_text || ''}%`, limit]
                            );
                            const insightsRes = await query(
                                "SELECT 'insight' as source, title, status_text as meta, created_at as date FROM insights WHERE user_id = $1 AND (title ILIKE $2 OR description ILIKE $2) LIMIT $3",
                                [userId, `%${query_text || ''}%`, limit]
                            );
                            const eventsRes = await query(
                                "SELECT 'event' as source, title, start_time::text as meta, start_time as date FROM calendar_events WHERE user_id = $1 AND (title ILIKE $2) LIMIT $3",
                                [userId, `%${query_text || ''}%`, limit]
                            );
                            
                            functionResponse = [
                                ...tasksRes.rows,
                                ...insightsRes.rows,
                                ...eventsRes.rows
                            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);
                        } catch (err) {
                            console.error('DB Search Error:', err);
                            functionResponse = { error: 'Failed to search database.' };
                        }
                    }
                    break;
                }
                default:
                    functionResponse = { error: 'Unknown function' };
            }
        } catch (error) {
            console.error(`Error executing tool ${call.name}:`, error);
            functionResponse = { error: 'Failed to execute tool' };
        }

        result = await chat.sendMessage([{
            functionResponse: {
                name: call.name,
                response: { content: functionResponse }
            }
        }]);
        
        call = result.response.functionCalls()?.[0];
    }

    return {
        response: result.response.text(),
        history: await chat.getHistory()
    };
};
