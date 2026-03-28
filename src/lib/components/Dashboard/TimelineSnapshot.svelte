<script>
    let { events = [] } = $props();
    
    // Format and group events for the timeline
    const groupedEvents = $derived(() => {
        const groups = [];
        let currentGroup = null;

        events.slice(0, 8).forEach(e => {
            const startDate = e.start?.dateTime || e.start?.date;
            if (!startDate) return;
            
            // For all-day events (e.start.date), we want to treat them as local time start of day
            const dateObj = e.start?.dateTime ? new Date(e.start.dateTime) : new Date(e.start.date + 'T00:00:00');
            
            const dateStr = dateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
            
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            
            let displayDate = dateStr;
            const eventDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
            
            if (eventDay.getTime() === today.getTime()) displayDate = 'Today';
            else if (eventDay.getTime() === tomorrow.getTime()) displayDate = 'Tomorrow';

            if (!currentGroup || currentGroup.displayDate !== displayDate) {
                currentGroup = { date: dateStr, displayDate, items: [] };
                groups.push(currentGroup);
            }

            currentGroup.items.push({
                time: e.start?.dateTime ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day',
                title: e.summary,
                location: e.location || 'Zoom'
            });
        });
        return groups;
    });
</script>

<div class="timeline-snapshot glass-card">
    <div class="timeline">
        {#each groupedEvents() as group}
            <div class="date-header">
                <span class="label-xs date-label text-primary">{group.displayDate}</span>
                <div class="line"></div>
            </div>
            {#each group.items as event}
                <div class="timeline-item">
                    <div class="time-column">
                        <span class="label-sm">{event.time}</span>
                    </div>
                    <div class="content-column">
                        <div class="marker"></div>
                        <div class="event-details">
                            <h4 class="headline-font">{event.title}</h4>
                            <p class="subtitle">{event.location}</p>
                        </div>
                    </div>
                </div>
            {/each}
        {/each}
        {#if events.length === 0}
            <p class="empty-state">No upcoming events scheduled.</p>
        {/if}
    </div>
</div>

<style>
    .timeline-snapshot {
        padding: 1.5rem;
        background: var(--surface-container-low);
        border-radius: var(--radius-3xl);
    }

    .timeline {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .date-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: -0.5rem;
        margin-top: 0.5rem;
    }

    .date-header:first-child {
        margin-top: 0;
    }

    .date-label {
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        white-space: nowrap;
        font-size: 0.625rem;
        color: var(--primary);
    }

    .date-header .line {
        height: 1px;
        flex-grow: 1;
        background: var(--outline-variant);
        opacity: 0.5;
    }

    .timeline-item {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
    }

    .time-column {
        width: 60px;
        flex-shrink: 0;
        text-align: right;
        color: var(--on-surface-variant);
    }

    .content-column {
        display: flex;
        gap: 1rem;
        position: relative;
    }

    .marker {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--primary);
        border: 2px solid white;
        margin-top: 4px;
        z-index: 2;
    }

    .timeline-item::after {
        content: '';
        position: absolute;
        left: 75px;
        top: 16px;
        bottom: -24px;
        width: 2px;
        background: var(--outline-variant);
        z-index: 1;
    }

    .timeline-item:last-child::after {
        display: none;
    }

    .event-details h4 {
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
    }

    .subtitle {
        font-size: 0.75rem;
        color: var(--on-surface-variant);
    }

    .empty-state {
        color: var(--on-surface-variant);
        font-size: 0.875rem;
        text-align: center;
        padding: 1rem 0;
    }
</style>
