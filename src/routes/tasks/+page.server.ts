import { getGoogleClient } from '$lib/server/google';
import { query } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { tasks as mockTasks } from '$lib/data';

export const load: PageServerLoad = async ({ request, parent }) => {
    const services = getGoogleClient(request);
    
    if (!services || !services.tasks) {
        return {
            isAuthenticated: false,
            tasks: mockTasks
        };
    }

    const { tasks: googleTasks } = services;

    try {
        // 1. Fetch all task lists
        const taskListsRes = await googleTasks.tasklists.list({
            maxResults: 10
        });
        
        const taskLists = taskListsRes.data.items || [];
        const allMappedTasks: any[] = [];

        // 2. Fetch tasks for each list
        for (const list of taskLists) {
            if (!list.id) continue;

            const res = await googleTasks.tasks.list({
                tasklist: list.id,
                showCompleted: true,
                maxResults: 50
            });

            const items = res.data.items || [];
            
            const mappedTasks = items.map(t => {
                // Format due date logic
                let dueStr = 'No due date';
                if (t.due) {
                    const dueDate = new Date(t.due);
                    const now = new Date();
                    const isToday = dueDate.toDateString() === now.toDateString();
                    dueStr = isToday 
                        ? `Today`
                        : dueDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
                } else if (t.status === 'completed') {
                    dueStr = 'Done';
                }

                // Heuristic for priority from notes
                const notes = t.notes || '';
                const priorityMatch = notes.match(/Priority:\s*(High|Medium|Low)/i);
                const priority = priorityMatch ? priorityMatch[1] : 'Medium';
                
                // Use the list name as the category
                const category = list.title || 'General';

                return {
                    id: t.id,
                    title: t.title || 'Untitled Task',
                    priority: priority,
                    due: dueStr,
                    status: t.status === 'completed' ? 'done' : 'pending',
                    category: category
                };
            });

            allMappedTasks.push(...mappedTasks);
        }

        // Sort: pending first, then by priority (High > Medium > Low)
        const sortedTasks = allMappedTasks.sort((a, b) => {
            if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
            const pMap: Record<string, number> = { 'High': 0, 'Medium': 1, 'Low': 2 };
            return (pMap[a.priority] ?? 1) - (pMap[b.priority] ?? 1);
        });

        return {
            isAuthenticated: true,
            tasks: sortedTasks
        };
    } catch (e: any) {
        console.error('Error fetching Google Tasks:', e);
        
        let errorMessage = 'Failed to fetch tasks';
        if (e.message?.includes('not enabled')) {
            errorMessage = 'Google Tasks API is not enabled in your Google Cloud Project. Please enable it in the GCP Console.';
        } else if (e.code === 403) {
            errorMessage = 'Permission denied. Please ensure you have the correct scopes.';
        }

        return {
            isAuthenticated: true, // Still authenticated, just the API call failed
            tasks: [],
            error: errorMessage
        };
    }
};
