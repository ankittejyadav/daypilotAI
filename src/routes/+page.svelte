<script>
    import InsightCard from '$lib/components/Dashboard/InsightCard.svelte';
    import { insights } from '$lib/data';
    
    let { data } = $props();
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
</script>

<div class="dashboard">
    <section class="hero-section">
        <p class="date-label uppercase tracking-widest">{today}</p>
        <h1 class="headline-font">Good Morning, {data.user?.name || 'Alex'}.</h1>
        <p class="subtitle">Your day is curated and ready.</p>
    </section>

    <section class="insights-section">
        <div class="section-header">
            <h2 class="headline-font">Your Top Insights</h2>
            <button class="text-link">See All Insights</button>
        </div>
        <div class="insight-grid">
            {#each insights as insight}
                <InsightCard {...insight} />
            {/each}
        </div>
    </section>

    <section class="summary-section card glass">
        <div class="summary-content">
            <div class="text-group">
                <h2 class="headline-font">Weekly Summary</h2>
                <p class="summary-text">You've cleared 85% of your scheduled tasks this week. Your peak focus time was between 9 AM and 11 AM.</p>
            </div>
            <div class="status-icon">
                <span class="material-symbols-outlined">trending_up</span>
            </div>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: 85%;"></div>
        </div>
    </section>

    <!-- FAB -->
    <button class="fab">
        <span class="material-symbols-outlined icon-large">add</span>
    </button>
</div>

<style>
    .dashboard {
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
    }

    .date-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--on-surface-variant);
        margin-bottom: 0.25rem;
    }

    h1 {
        font-size: 2rem;
        letter-spacing: -0.02em;
    }

    .subtitle {
        color: var(--on-surface-variant);
        font-size: 1rem;
        margin-top: 0.25rem;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 1.5rem;
    }

    .section-header h2 {
        font-size: 1.25rem;
    }

    .text-link {
        background: none;
        border: none;
        color: var(--primary);
        font-weight: 700;
        font-size: 0.875rem;
        cursor: pointer;
    }

    .insight-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1rem;
    }

    .summary-section {
        background: var(--surface-container-highest);
        border: none;
        padding: 2rem;
    }

    .summary-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .summary-text {
        font-size: 0.875rem;
        color: var(--on-surface-variant);
        margin-top: 0.5rem;
    }

    .status-icon {
        width: 48px;
        height: 48px;
        background-color: var(--primary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-xl);
    }

    .progress-bar {
        height: 8px;
        background-color: var(--surface-container);
        border-radius: var(--radius-full);
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background-color: var(--primary);
        border-radius: var(--radius-full);
    }

    .fab {
        position: fixed;
        bottom: 112px;
        right: 1.5rem;
        width: 56px;
        height: 56px;
        border-radius: var(--radius-xl);
        background-color: var(--primary);
        color: white;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 32px 0 rgba(11, 26, 125, 0.3);
        cursor: pointer;
        z-index: 90;
        transition: transform 0.2s;
    }

    .fab:active {
        transform: scale(0.9);
    }

    .icon-large {
        font-size: 32px;
    }
</style>
