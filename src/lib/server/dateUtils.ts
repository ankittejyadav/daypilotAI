/**
 * Utility functions for handling dates in the DayPilot AI application.
 */

/**
 * Parses a time string like "10:30 AM" and combines it with today's date.
 * Returns an ISO date string (UTC) for that time today.
 * 
 * @param timeStr - e.g. "9:00 AM", "1:30 PM"
 * @returns ISO Date string
 */
export const getTodayAtTime = (timeStr: string): string => {
    const now = new Date();
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    // Use a fixed timezone offset for demo consistency if needed, 
    // or just use local system time which is standard for a dev server.
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
    return date.toISOString();
};

/**
 * Formats a Date object as a human-readable "Today, 4:00 PM" style string.
 */
export const formatRelativeDate = (date: Date): string => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
        return `Today, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + `, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
};
