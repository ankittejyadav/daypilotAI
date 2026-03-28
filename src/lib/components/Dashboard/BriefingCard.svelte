<script>
    let { title, subtitle, info, icon, type = 'default', urgent = false, href = '#' } = $props();
</script>

<a {href} class="briefing-card glass {type}" class:urgent>
    <div class="card-header">
        <div class="icon-wrap">
            <span class="material-symbols-outlined">{icon}</span>
        </div>
        {#if urgent}
            <span class="badge label-sm">Urgent</span>
        {/if}
    </div>
    <div class="card-body">
        <h3 class="headline-font">{title}</h3>
        <p class="subtitle">{subtitle}</p>
        {#if info}
            <p class="info label-sm">{info}</p>
        {/if}
    </div>
</a>

<style>
    .briefing-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 1.5rem;
        border-radius: var(--radius-3xl);
        text-decoration: none;
        color: var(--on-surface);
        min-height: 180px;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .briefing-card:active {
        transform: scale(0.98);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .icon-wrap {
        width: 40px;
        height: 40px;
        background: var(--surface-container-high);
        border-radius: var(--radius-xl);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary);
    }

    .badge {
        background: var(--error-container);
        color: var(--on-error-container);
        padding: 2px 8px;
        border-radius: var(--radius-full);
        font-size: 0.625rem;
    }

    .card-body h3 {
        font-size: 1.125rem;
        margin-bottom: 0.25rem;
        line-height: 1.2;
    }

    .subtitle {
        font-size: 0.875rem;
        color: var(--on-surface-variant);
        margin-bottom: 0.5rem;
    }

    .info {
        color: var(--primary);
        font-weight: 700;
        opacity: 0.8;
    }

    /* Types */
    .primary {
        background: linear-gradient(135deg, var(--primary), var(--primary-container));
        color: white;
    }
    .primary .icon-wrap { background: rgba(255, 255, 255, 0.2); color: white; }
    .primary .subtitle { color: rgba(255, 255, 255, 0.7); }
    .primary .info { color: white; }

    .urgent {
        border: 2px solid var(--error);
    }
</style>
