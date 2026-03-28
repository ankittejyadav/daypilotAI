<script>
    import { commitments, emails } from '$lib/data';
</script>

<div class="gmail-page">
    <header class="page-header">
        <p class="label-sm">Actionable Intelligence</p>
        <h1 class="headline-font">Inbox Insights</h1>
    </header>

    <section class="section">
        <h2 class="headline-font">Urgent Commitments</h2>
        <div class="commitments-list">
            {#each commitments as c}
                <div class="commitment-card" class:urgent={c.urgent}>
                    <div class="card-header">
                        <span class="sender">{c.sender}</span>
                        <span class="time">{c.time}</span>
                    </div>
                    <div class="card-body">
                        <h3 class="subject">{c.subject}</h3>
                        <p class="summary">{c.summary}</p>
                    </div>
                    {#if c.urgent}
                        <div class="urgent-badge">Action Required</div>
                    {/if}
                </div>
            {/each}
        </div>
    </section>

    <section class="section">
        <div class="flex-between">
            <h2 class="headline-font">Recent Activity</h2>
        </div>
        <div class="email-list card">
            {#each emails as email}
                <div class="email-item">
                    <div class="avatar">
                        {email.sender[0]}
                    </div>
                    <div class="email-content">
                        <div class="flex-between">
                            <span class="sender-name">{email.sender}</span>
                            <span class="email-time">{email.time}</span>
                        </div>
                        <h3 class="email-subject">{email.subject}</h3>
                        <p class="email-preview">{email.preview}</p>
                    </div>
                </div>
            {/each}
        </div>
    </section>
</div>

<style>
    .gmail-page {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .commitments-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .commitment-card {
        background: var(--surface-container-low);
        padding: 1.5rem;
        border-radius: var(--radius-2xl);
        position: relative;
        overflow: hidden;
    }

    .commitment-card.urgent {
        background: var(--primary-fixed);
        border-left: 4px solid var(--primary);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }

    .sender { font-weight: 700; font-size: 0.75rem; color: var(--primary); }
    .time { font-size: 0.75rem; color: var(--outline); }

    .subject { font-size: 1.125rem; margin-bottom: 0.25rem; }
    .summary { font-size: 0.875rem; color: var(--on-surface-variant); }

    .urgent-badge {
        position: absolute;
        top: 0;
        right: 0;
        background: var(--primary);
        color: white;
        font-size: 0.625rem;
        font-weight: 700;
        padding: 4px 12px;
        border-radius: 0 0 0 var(--radius-lg);
        text-transform: uppercase;
    }

    .email-list {
        padding: 0;
        overflow: hidden;
    }

    .email-item {
        display: flex;
        gap: 1rem;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid var(--surface-container);
        cursor: pointer;
    }

    .email-item:hover { background: var(--surface-container-low); }

    .avatar {
        width: 40px;
        height: 40px;
        background: var(--surface-dim);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        color: var(--on-surface-variant);
        flex-shrink: 0;
    }

    .email-content { flex: 1; }
    .sender-name { font-weight: 700; font-size: 0.875rem; }
    .email-time { font-size: 0.75rem; color: var(--outline); }
    .email-subject { font-size: 0.875rem; font-weight: 600; margin: 2px 0; }
    .email-preview { font-size: 0.875rem; color: var(--on-surface-variant); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px; }

    .flex-between { display: flex; justify-content: space-between; align-items: center; }
</style>
