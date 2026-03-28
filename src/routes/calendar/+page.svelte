<script>
    import { prepMeetings as mockPrep, timeline as mockTimeline } from '$lib/data';

    let { data } = $props();

    const formatTime = (isoString) => {
        if (!isoString) return '';
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(new Date(isoString));
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        }).format(new Date(isoString));
    };

    // Filter events for "Prep" (simple heuristic: has description or many attendees)
    const prepMeetings = $derived(data.isAuthenticated 
        ? data.events.filter(e => e.description || e.attendees > 1).slice(0, 2)
        : mockPrep);

    const timeline = $derived(data.isAuthenticated
        ? data.events.map(e => ({
            time: formatTime(e.startTime),
            title: e.title,
            team: e.attendees > 1 ? `${e.attendees} Guests` : 'Solo',
            context: e.description || 'No additional context provided.',
            type: e.attendees > 2 ? 'primary' : 'compact',
            missing: !e.description
        }))
        : mockTimeline);
</script>

<div class="calendar-page">
    <header class="page-header">
        <p class="label-sm">Schedule Insights</p>
        <h1 class="headline-font">Smart Calendar</h1>
    </header>

    {#if !data.isAuthenticated}
        <section class="auth-section">
            <div class="auth-card">
                <div class="auth-icon">
                    <span class="material-symbols-outlined">calendar_today</span>
                </div>
                <h2 class="headline-font">Connect Your Google Calendar</h2>
                <p>Sync your schedule to get AI-powered briefings, prep summaries, and a unified view of your day.</p>
                <a href="/api/auth/google" class="primary-btn auth-btn">
                    <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" width="20" height="20" />
                    <span>Connect with Google</span>
                </a>
            </div>
        </section>
    {/if}

    <section class="section" class:muted={!data.isAuthenticated}>
        <h2 class="label-sm outline-text flex-center gap-2">
            <span class="dot error"></span>
            Meetings Needing Prep
        </h2>
        <div class="prep-cards">
            {#each prepMeetings as m}
                <div class="prep-card">
                    <div class="card-top">
                        <div class="m-info">
                            <span class="chip-error">High Priority</span>
                            <h2 class="headline-font" style="font-size: 1.25rem; margin: 0.5rem 0;">{m.title}</h2>
                            <p class="time-loc">{data.isAuthenticated ? formatTime(m.startTime) : m.time} • {m.location || 'Location TBD'}</p>
                        </div>
                        <div class="icon-wrap">
                            <span class="material-symbols-outlined text-primary">warning</span>
                        </div>
                    </div>
                    
                    <div class="briefing-box">
                        <p class="label-xs">AI Briefing</p>
                        <div class="brief-item">
                            <span class="material-symbols-outlined x-small">history</span>
                            <p><strong>Context:</strong> {data.isAuthenticated ? (m.description?.slice(0, 100) || 'Analyzing historical context...') : m.briefing.lastDiscussed}</p>
                        </div>
                        {#if !data.isAuthenticated && m.briefing?.links}
                        <div class="brief-item">
                            <span class="material-symbols-outlined x-small">link</span>
                            <div class="links">
                                {#each m.briefing.links as link}
                                    <span class="link-chip">{link}</span>
                                {/each}
                            </div>
                        </div>
                        {/if}
                    </div>
                    
                    <button class="primary-btn">Generate Preparation Summary</button>
                </div>
            {/each}
        </div>
    </section>

    <section class="section" class:muted={!data.isAuthenticated}>
        <div class="flex-between">
            <h2 class="label-sm outline-text">Schedule Overview</h2>
            <span class="date-text">{data.isAuthenticated && data.events[0] ? formatDate(data.events[0].startTime) : 'Wednesday, Oct 24'}</span>
        </div>
        
        <div class="timeline">
            {#each timeline as item}
                <div class="timeline-row">
                    <div class="time-col">
                        <span class="time-label" class:primary-text={item.type === 'primary'}>{item.time}</span>
                        <div class="guide-line"></div>
                    </div>
                    <div class="event-col">
                        <div class="event-card" class:low={item.type !== 'primary'}>
                            <div class="flex-between mb-4">
                                <h4 class="headline-font">{item.title}</h4>
                                <span class="team-chip" class:primary-chip={item.type === 'primary'}>{item.team}</span>
                            </div>
                            <div class="context-box">
                                <p class="label-xs">Context</p>
                                {#if item.missing}
                                    <div class="flex-center gap-2">
                                        <span class="material-symbols-outlined x-small error-text">error_outline</span>
                                        <p class="italic-text">No previous documents found.</p>
                                    </div>
                                {:else}
                                    <p class="context-text">{item.context}</p>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </section>
</div>

<style>
    .calendar-page { display: flex; flex-direction: column; gap: 2.5rem; }
    .section { display: flex; flex-direction: column; gap: 1.5rem; }
    
    .prep-card {
        background: var(--surface-container-lowest);
        border-radius: var(--radius-3xl);
        padding: 1.5rem;
        box-shadow: var(--shadow-ambient);
    }

    .card-top { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
    .chip-error { background: var(--error-container); color: var(--error); font-size: 0.625rem; font-weight: 700; padding: 4px 12px; border-radius: var(--radius-full); display: inline-block; margin-bottom: 0.5rem; }
    .time-loc { font-size: 0.875rem; color: var(--on-surface-variant); }

    .icon-wrap { background: var(--surface-container-low); padding: 12px; border-radius: var(--radius-xl); color: var(--primary); }

    .briefing-box { background: var(--surface-container-low); padding: 1.25rem; border-radius: var(--radius-xl); display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
    .label-xs { font-size: 0.625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--primary); margin-bottom: 0.5rem; }

    .brief-item { display: flex; gap: 0.75rem; font-size: 0.875rem; align-items: flex-start; }
    .brief-item strong { color: var(--on-surface); }
    .links { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .link-chip { background: rgba(11, 26, 125, 0.05); color: var(--primary); text-decoration: none; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 0.75rem; }

    .primary-btn { width: 100%; border: none; background: linear-gradient(135deg, var(--primary), var(--primary-container)); color: white; padding: 1rem; border-radius: var(--radius-xl); font-weight: 800; font-size: 0.875rem; letter-spacing: 0.05em; cursor: pointer; box-shadow: 0 8px 32px rgba(11, 26, 125, 0.2); }

    .timeline { display: flex; flex-direction: column; }
    .timeline-row { display: flex; gap: 1.5rem; }
    .time-col { display: flex; flex-direction: column; align-items: center; width: 60px; }
    .time-label { font-size: 0.75rem; font-weight: 700; color: var(--outline); }
    .primary-text { color: var(--primary); }
    .guide-line { flex: 1; width: 1px; background: var(--outline-variant); margin: 8px 0; }
    
    .event-col { flex: 1; padding-bottom: 2rem; }
    .event-card { background: var(--surface-container-low); padding: 1.5rem; border-radius: var(--radius-2xl); }
    .event-card.low { background: var(--surface-container-low); opacity: 0.9; }

    .team-chip { background: var(--surface-container-highest); font-size: 0.625rem; font-weight: 700; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; }
    .primary-chip { background: var(--primary-fixed); color: var(--on-primary-fixed); }

    .context-box { background: var(--surface-container-lowest); padding: 1rem; border-radius: var(--radius-xl); }
    .context-text { font-size: 0.875rem; color: var(--on-surface-variant); line-height: 1.6; }

    .auth-section {
        background: var(--surface-container-low);
        border-radius: var(--radius-3xl);
        padding: 3rem 2rem;
        text-align: center;
        border: 2px dashed var(--outline-variant);
    }

    .auth-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        max-width: 400px;
        margin: 0 auto;
    }

    .auth-icon {
        width: 64px;
        height: 64px;
        background: var(--primary-container);
        color: var(--primary);
        border-radius: var(--radius-2xl);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .auth-icon .material-symbols-outlined { font-size: 32px; }

    .auth-card p {
        color: var(--on-surface-variant);
        font-size: 0.875rem;
        line-height: 1.6;
    }

    .auth-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        text-decoration: none;
        max-width: 280px;
    }

    .muted {
        opacity: 0.5;
        pointer-events: none;
        filter: grayscale(0.5);
    }

    .flex-center { display: flex; align-items: center; }
    .gap-2 { gap: 0.5rem; }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot.error { background: var(--error); }
    .outline-text { color: var(--outline); }
    .x-small { font-size: 16px; }
    .error-text { color: var(--error); }
    .italic-text { font-size: 0.75rem; font-style: italic; color: var(--on-surface-variant); }
</style>
