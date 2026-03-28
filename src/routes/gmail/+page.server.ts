import { getGoogleClient } from '$lib/server/google';
import type { PageServerLoad } from './$types';
import { emails as mockEmails, commitments as mockCommitments } from '$lib/data';

export const load: PageServerLoad = async ({ request }) => {
    const services = getGoogleClient(request);

    if (!services || !services.gmail) {
        return {
            isAuthenticated: false,
            emails: mockEmails,
            commitments: mockCommitments
        };
    }

    const { gmail } = services;

    try {
        // Fetch last 15 messages from Inbox
        const res = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 15,
            q: 'label:INBOX'
        });

        const messages = res.data.messages || [];
        const emails = await Promise.all(messages.map(async (msg) => {
            try {
                const detail = await gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id!
                });

                const headers = detail.data.payload?.headers || [];
                const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || 'No Subject';
                const sender = headers.find(h => h.name?.toLowerCase() === 'from')?.value || 'Unknown Sender';
                const dateHeader = headers.find(h => h.name?.toLowerCase() === 'date')?.value || '';
                
                // Extract name from "Name <email@example.com>"
                const senderName = sender.replace(/<.*>/, '').trim() || sender;

                // Format time: if today, show time, else show date
                const msgDate = new Date(dateHeader);
                const now = new Date();
                const isToday = msgDate.toDateString() === now.toDateString();
                
                const timeStr = isToday 
                    ? msgDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
                    : msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

                return {
                    id: msg.id,
                    sender: senderName,
                    subject,
                    preview: detail.data.snippet ? decodeHtmlEntities(detail.data.snippet) : '',
                    time: timeStr
                };
            } catch (err) {
                console.error(`Error fetching message ${msg.id}:`, err);
                return null;
            }
        }));

        // Filter out any failed requests
        const validEmails = emails.filter(e => e !== null);

        // Heuristic for commitments: look for action-oriented keywords
        const actionKeywords = ['action required', 'urgent', 'deadline', 'please review', 'follow up', 'important'];
        const commitments = validEmails
            .filter(e => {
                const searchStr = (e.subject + ' ' + e.preview).toLowerCase();
                return actionKeywords.some(kw => searchStr.includes(kw));
            })
            .slice(0, 3)
            .map(e => ({
                sender: e.sender,
                subject: e.subject,
                time: e.time,
                summary: e.preview.length > 120 ? e.preview.slice(0, 120) + '...' : e.preview,
                urgent: e.subject.toLowerCase().includes('urgent') || e.preview.toLowerCase().includes('urgent')
            }));

        return {
            isAuthenticated: true,
            emails: validEmails,
            commitments
        };
    } catch (e) {
        console.error('Error fetching Gmail messages:', e);
        return {
            isAuthenticated: false,
            emails: [],
            commitments: [],
            error: 'Failed to fetch messages'
        };
    }
};

function decodeHtmlEntities(text: string) {
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
}
