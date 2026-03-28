<script>
    let { events = [] } = $props();
    
    // Format events for the timeline
    const timelineEvents = $derived(events.map(e => ({
        time: e.start?.dateTime ? new Date(e.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day',
        title: e.summary,
        type: 'meeting',
        location: e.location || 'Zoom'
    })).slice(0, 4));
</script>

<div class="timeline-snapshot glass-card">
    <div class="timeline">
        {#each timelineEvents as event}
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
        {#if timelineEvents.length === 0}
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
