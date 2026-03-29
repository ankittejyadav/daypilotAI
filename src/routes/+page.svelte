<script>
    import { onMount } from 'svelte';
    import InsightCard from '$lib/components/Dashboard/InsightCard.svelte';
    import BriefingCard from '$lib/components/Dashboard/BriefingCard.svelte';
    import TimelineSnapshot from '$lib/components/Dashboard/TimelineSnapshot.svelte';
    
    let { data } = $props();
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    
    // Detailed briefing from loader
    const briefing = $derived(data.briefing || {
        nextMeeting: { title: "No upcoming meetings", time: "--", location: "", urgent: false },
        emailSummary: { count: 0, topSubject: "No untracked emails", topSender: "" },
        taskSummary: { count: 0, topTitle: "Today's list is clear", dueDate: "" },
        financeSummary: { status: "Healthy", alert: "No alerts" }
    });
</script>

<div class="dashboard">
    <header class="editorial-header">
        <p class="label-sm primary-text">{today}</p>
        <h1 class="headline-font main-title">Good Morning, {data.user?.name || 'Guest'}.</h1>
        <p class="subtitle">Your command center is synchronized.</p>
    </header>

    {#if !data.user}
        <section class="demo-banner">
            <div class="banner-content">
                <span class="material-symbols-outlined">sparkles</span>
                <p><strong>Demo Mode Active:</strong> You are viewing sample data. Connect your accounts to see real insights.</p>
            </div>
            <a href="/login" class="connect-link">Get Started</a>
        </section>
    {/if}

    <section class="priority-grid">
        <div class="primary-slot">
            {#if briefing.nextMeeting}
                <BriefingCard 
                    title={briefing.nextMeeting.title}
                    subtitle={briefing.nextMeeting.time}
                    info={briefing.nextMeeting.location}
                    icon="calendar_today"
                    type="primary"
                    urgent={true}
                    href="/calendar"
                />
            {:else}
                <BriefingCard 
                    title="No Upcoming Events"
                    subtitle="Your schedule is clear for now."
                    icon="event_busy"
                    href="/calendar"
                />
            {/if}
        </div>
        <div class="secondary-slots">
            <BriefingCard 
                title="{briefing.emailSummary.count} Unread"
                subtitle="From {briefing.emailSummary.topSender}: {briefing.emailSummary.topSubject}"
                icon="mail"
                href="/gmail"
            />
            <BriefingCard 
                title="{briefing.taskSummary.count} Tasks"
                subtitle="Next: {briefing.taskSummary.topTitle}"
                info="Due: {briefing.taskSummary.dueDate}"
                icon="task_alt"
                href="/tasks"
            />
            <BriefingCard 
                title={briefing.financeSummary.status}
                subtitle={briefing.financeSummary.alert}
                info="1 priority alert"
                icon="payments"
                href="/finance"
            />
        </div>
    </section>

    <div class="two-column-layout">
        <section class="snapshot-column">
            <div class="section-header">
                <h2 class="headline-font">Timeline Snapshot</h2>
                <button class="text-link-sm">View Calendar</button>
            </div>
            <TimelineSnapshot events={data.calendarEvents} />
        </section>

        <section class="commitments-column">
            <div class="section-header">
                <h2 class="headline-font">Key Commitments</h2>
                <button class="text-link-sm">View Gmail</button>
            </div>
            <div class="commitments-list glass-card">
                {#each data.commitments.slice(0, 3) as commitment}
                    <div class="commitment-item">
                        <div class="commitment-info">
                            <h4 class="headline-font">{commitment.sender}</h4>
                            <p class="commitment-text">{commitment.summary}</p>
                        </div>
                        <span class="label-sm time-label">{commitment.time}</span>
                    </div>
                {/each}
                {#if data.commitments.length === 0}
                    <p class="empty-state">No commitments found.</p>
                {/if}
            </div>
        </section>
    </div>

    <section class="insights-section">
        <div class="section-header">
            <h2 class="headline-font">Actionable Insights</h2>
            <button class="text-link-sm">Analytics</button>
        </div>
        <div class="insight-grid">
            {#each data.insights as insight}
                <InsightCard {...insight} />
            {/each}
        </div>
    </section>

    <section class="summary-card glass-premium">
        <div class="summary-content">
            <div class="text-group">
                <h2 class="headline-font">Daily Alignment</h2>
                <p>You've achieved <span class="highlight">{data.focusScore}%</span> of your target focus tasks this week. Your performance is dynamically tracked based on task completion.</p>
            </div>
            <div class="radial-progress">
                <svg viewBox="0 0 36 36" class="circular-chart">
                    <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path class="circle" stroke-dasharray="{data.focusScore}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <text x="18" y="20.35" class="percentage">{data.focusScore}%</text>
                </svg>
            </div>
        </div>
    </section>
</div>

<style>
    .dashboard {
        display: flex;
        flex-direction: column;
        gap: 3rem;
        padding-bottom: 5rem;
    }

    .editorial-header {
        margin-top: 1rem;
    }

    .primary-text {
        color: var(--primary);
        letter-spacing: 0.15em;
        margin-bottom: 0.5rem;
    }

    .main-title {
        font-size: 2.75rem;
        letter-spacing: -0.04em;
        line-height: 1.1;
        background: linear-gradient(135deg, var(--on-surface) 30%, var(--primary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .subtitle {
        font-size: 1.125rem;
        color: var(--on-surface-variant);
        margin-top: 0.75rem;
        font-weight: 500;
    }

    .priority-grid {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 1.5rem;
    }

    .secondary-slots {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.25rem;
    }

    @media (max-width: 1024px) {
        .priority-grid {
            grid-template-columns: 1fr;
        }
        .two-column-layout {
            grid-template-columns: 1fr !important;
        }
    }

    .two-column-layout {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
    }

    .glass-card {
        padding: 1.5rem;
        background: var(--surface-container-low);
        border-radius: var(--radius-3xl);
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .section-header h2 {
        font-size: 1.25rem;
    }

    .commitment-item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 1rem 0;
        border-bottom: 1px solid var(--outline-variant);
        gap: 1rem;
    }

    .commitment-item:last-child {
        border-bottom: none;
    }

    .commitment-info h4 {
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
    }

    .commitment-text {
        font-size: 0.75rem;
        color: var(--on-surface-variant);
        line-height: 1.4;
    }

    .time-label {
        font-size: 0.625rem;
        color: var(--primary);
        white-space: nowrap;
    }

    .text-link-sm {
        background: none;
        border: none;
        color: var(--primary);
        font-weight: 700;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05rem;
        cursor: pointer;
    }

    .insight-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1.25rem;
    }

    .summary-card {
        padding: 2.5rem;
        border-radius: var(--radius-3xl);
        background: var(--surface-container-low);
    }

    .summary-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 3rem;
    }

    .summary-content p {
        font-size: 1.125rem;
        color: var(--on-surface-variant);
        line-height: 1.6;
        margin-top: 1rem;
    }

    .highlight {
        color: var(--primary);
        font-weight: 800;
    }

    .radial-progress {
        width: 120px;
        flex-shrink: 0;
    }

    .circular-chart {
        display: block;
        margin: 10px auto;
        max-width: 80%;
        max-height: 250px;
    }

    .circle-bg {
        fill: none;
        stroke: var(--surface-container-high);
        stroke-width: 3.8;
    }

    .circle {
        fill: none;
        stroke: var(--primary);
        stroke-width: 3.8;
        stroke-linecap: round;
        transition: stroke-dasharray 0.3s ease;
    }

    .percentage {
        fill: var(--on-surface);
        font-family: 'Manrope', sans-serif;
        font-size: 0.5rem;
        font-weight: 800;
        text-anchor: middle;
    }

    .glass-premium {
        background: rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 8px 32px 0 rgba(13, 30, 37, 0.04);
    }

    .empty-state {
        color: var(--on-surface-variant);
        font-size: 0.875rem;
        text-align: center;
        padding: 1rem 0;
    }
</style>


