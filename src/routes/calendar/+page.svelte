<script>
    import { enhance } from '$app/forms';
    import { prepMeetings as mockPrep, timeline as mockTimeline } from '$lib/data';

    let { data, form } = $props();
    let showAddModal = $state(false);
    let syncing = $state(false);

    const formatTime = (isoString) => {
        if (!isoString) return '';
        if (typeof isoString === 'string' && isoString.includes(':') && !isoString.includes('T')) return isoString;
        try {
            return new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }).format(new Date(isoString));
        } catch (e) {
            return isoString;
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        try {
            return new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
            }).format(new Date(isoString));
        } catch (e) {
            return isoString;
        }
    };

    // Unified timeline from database
    const timeline = $derived(data.events.length > 0 
        ? data.events.map(e => ({
            time: formatTime(e.startTime),
            title: e.title,
            team: e.zoomId ? 'Video Call' : 'Solo',
            context: e.description || 'No additional context provided.',
            type: e.isUrgent ? 'primary' : 'compact',
            missing: !e.description
        }))
        : mockTimeline);

    // Unified prep meetings from database
    const prepMeetings = $derived(data.events.filter(e => e.needsPrep).length > 0
        ? data.events.filter(e => e.needsPrep).slice(0, 2)
        : mockPrep);
</script>

<div class="calendar-page">
    <header class="page-header flex-between align-center">
        <div>
            <p class="label-sm">Schedule Insights</p>
            <h1 class="headline-font">Smart Calendar</h1>
        </div>
        <div class="header-actions">
            {#if data.isAuthenticated}
                <form method="POST" action="?/sync" use:enhance={() => {
                    syncing = true;
                    return async ({ update }) => {
                        syncing = false;
                        await update();
                    };
                }}>
                    <button class="secondary-btn-sm flex-center gap-2" disabled={syncing}>
                        <span class="material-symbols-outlined" class:spin={syncing}>sync</span>
                        <span>{syncing ? 'Syncing...' : 'Sync Google'}</span>
                    </button>
                </form>
            {/if}
            <button class="action-btn" onclick={() => showAddModal = true}>
                <span class="material-symbols-outlined">add</span>
                <span>New Event</span>
            </button>
        </div>
    </header>

    {#if !data.isAuthenticated}
        <section class="demo-banner">
            <div class="banner-content">
                <span class="material-symbols-outlined">sparkles</span>
                <p><strong>Demo Mode Active:</strong> Showing sample data for your presentation. Connect Google to use real data.</p>
            </div>
            <a href="/api/auth/google" class="connect-link">Connect Calendar</a>
        </section>
    {/if}

    {#if form?.error}
        <div class="error-banner">
            <span class="material-symbols-outlined">error</span>
            <p>{form.error}</p>
        </div>
    {/if}

    <section class="section">
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
                            <p class="time-loc">{m.startTime ? formatTime(m.startTime) : m.time} • {m.location || 'Location TBD'}</p>
                        </div>
                        <div class="icon-wrap">
                            <span class="material-symbols-outlined text-primary">warning</span>
                        </div>
                    </div>
                    
                    <div class="briefing-box">
                        <p class="label-xs">AI Briefing</p>
                        <div class="brief-item">
                            <span class="material-symbols-outlined x-small">history</span>
                            <p><strong>Context:</strong> {m.description ? (m.description.slice(0, 100) + '...') : (m.briefing?.lastDiscussed || 'Analyzing historical context...')}</p>
                        </div>
                        {#if m.briefing?.links}
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

    <section class="section">
        <div class="flex-between">
            <h2 class="label-sm outline-text">Schedule Overview</h2>
            <span class="date-text">{data.events[0] ? formatDate(data.events[0].startTime) : 'Wednesday, Oct 24'}</span>
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

{#if showAddModal}
    <div class="modal-overlay" onclick={() => showAddModal = false}>
        <div class="modal-content" onclick={(e) => e.stopPropagation()}>
            <h2 class="headline-font">Add New Event</h2>
            <form method="POST" action="?/addEvent" use:enhance={() => {
                return async ({ update }) => {
                    showAddModal = false;
                    await update();
                };
            }}>
                <div class="form-group">
                    <label for="title">Event Title</label>
                    <input type="text" id="title" name="title" required placeholder="e.g. Design Review" />
                </div>
                <div class="form-group">
                    <label for="startTime">Time</label>
                    <input type="text" id="startTime" name="startTime" required placeholder="e.g. 2026-03-28T14:30:00Z" />
                </div>
                <div class="form-group">
                    <label for="location">Location</label>
                    <input type="text" id="location" name="location" placeholder="e.g. Room 402" />
                </div>
                <div class="form-group">
                    <label for="context">Context / Notes</label>
                    <textarea id="context" name="context" placeholder="What is this about?"></textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" class="secondary-btn" onclick={() => showAddModal = false}>Cancel</button>
                    <button type="submit" class="primary-btn-sm">Save to Database</button>
                </div>
            </form>
        </div>
    </div>
{/if}

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

    .primary-btn { width: 100%; border: none; background: linear-gradient(135deg, var(--primary), var(--primary-container)); color: white; padding: 1rem; border-radius: var(--radius-xl); font-weight: 800; font-size: 0.875rem; letter-spacing: 0.05em; cursor: pointer; box-shadow: 0 8px 32px rgba(11, 26, 125, 0.2); transition: transform 0.2s; }
    .primary-btn:active { transform: scale(0.98); }

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

    .header-actions { display: flex; gap: 1rem; align-items: center; }

    .demo-banner {
        background: var(--secondary-container);
        color: var(--on-secondary-container);
        padding: 0.75rem 1.25rem;
        border-radius: var(--radius-xl);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;
    }
    .banner-content { display: flex; align-items: center; gap: 0.75rem; }
    .connect-link { color: var(--primary); font-weight: 700; text-decoration: none; background: white; padding: 4px 12px; border-radius: var(--radius-full); }

    .error-banner {
        background: var(--error-container);
        color: var(--error);
        padding: 0.75rem 1.25rem;
        border-radius: var(--radius-xl);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.875rem;
    }

    .action-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--primary);
        border: none;
        padding: 0.625rem 1.25rem;
        border-radius: var(--radius-full);
        font-weight: 700;
        font-size: 0.875rem;
        cursor: pointer;
        color: white;
        box-shadow: 0 4px 12px rgba(11, 26, 125, 0.2);
    }

    .secondary-btn-sm {
        background: var(--surface-container-high);
        border: 1px solid var(--outline-variant);
        padding: 0.5rem 1rem;
        border-radius: var(--radius-full);
        font-weight: 700;
        font-size: 0.875rem;
        cursor: pointer;
        color: var(--on-surface);
    }

    .modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
    }
    .modal-content {
        background: var(--surface-container-lowest);
        padding: 2rem;
        border-radius: var(--radius-3xl);
        width: 100%;
        max-width: 450px;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        box-shadow: var(--shadow-ambient);
    }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
    .form-group label { font-size: 0.75rem; font-weight: 700; color: var(--outline); text-transform: uppercase; }
    .form-group input, .form-group textarea {
        background: var(--surface-container-low);
        border: 1px solid var(--outline-variant);
        padding: 0.75rem;
        border-radius: var(--radius-lg);
        font-family: inherit;
        font-size: 0.875rem;
        width: 100%;
    }
    .form-group textarea { min-height: 100px; resize: vertical; }

    .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem; }
    .secondary-btn { background: none; border: 1px solid var(--outline-variant); padding: 0.75rem 1.5rem; border-radius: var(--radius-xl); cursor: pointer; font-weight: 700; }
    .primary-btn-sm { background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: var(--radius-xl); cursor: pointer; font-weight: 700; }

    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .flex-between { display: flex; justify-content: space-between; }
    .align-center { align-items: center; }
    .flex-center { display: flex; align-items: center; }
    .gap-2 { gap: 0.5rem; }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot.error { background: var(--error); }
    .outline-text { color: var(--outline); }
    .x-small { font-size: 16px; }
    .error-text { color: var(--error); }
    .italic-text { font-size: 0.75rem; font-style: italic; color: var(--on-surface-variant); }
</style>
