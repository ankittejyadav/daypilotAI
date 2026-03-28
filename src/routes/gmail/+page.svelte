<script>
    import { commitments as mockCommitments, emails as mockEmails } from '$lib/data';

    let { data } = $props();

    const emails = $derived(data.isAuthenticated ? data.emails : mockEmails);
    const commitments = $derived(data.isAuthenticated ? data.commitments : mockCommitments);
</script>

<div class="gmail-page">
    <header class="page-header">
        <p class="label-sm">Actionable Intelligence</p>
        <h1 class="headline-font">Inbox Insights</h1>
    </header>

    {#if !data.isAuthenticated}
        <section class="demo-banner">
            <div class="banner-content">
                <span class="material-symbols-outlined">sparkles</span>
                <p><strong>Demo Mode Active:</strong> Showing sample inbox data. Connect Gmail to sync your real threads.</p>
            </div>
            <a href="/api/auth/google" class="connect-link">Connect Gmail</a>
        </section>
    {/if}

    <section class="section">
        <h2 class="headline-font">Urgent Commitments</h2>
        <div class="commitments-list">
            {#if commitments.length === 0}
                <div class="empty-state">
                    <span class="material-symbols-outlined">check_circle</span>
                    <p>No urgent commitments found in your recent activity.</p>
                </div>
            {:else}
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
            {/if}
        </div>
    </section>

    <section class="section" class:muted={!data.isAuthenticated}>
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

    /* Auth & Empty State Styles */
    .auth-section {
        background: var(--surface-container-low);
        border-radius: var(--radius-3xl);
        padding: 3rem 2rem;
        text-align: center;
        border: 2px dashed var(--outline-variant);
        margin-bottom: 2rem;
    }

    .auth-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        max-width: 440px;
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
        width: 100%;
        max-width: 280px;
        border: none;
        background: linear-gradient(135deg, var(--primary), var(--primary-container));
        color: white;
        padding: 1rem;
        border-radius: var(--radius-xl);
        font-weight: 800;
        font-size: 0.875rem;
        box-shadow: 0 8px 32px rgba(11, 26, 125, 0.2);
    }

    .muted {
        opacity: 0.5;
        pointer-events: none;
        filter: grayscale(0.5);
    }

    .empty-state {
        padding: 3rem;
        text-align: center;
        background: var(--surface-container-lowest);
        border-radius: var(--radius-2xl);
        color: var(--outline);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
    }

    .empty-state .material-symbols-outlined {
        font-size: 48px;
        opacity: 0.3;
    }

    .empty-state p {
        font-size: 0.875rem;
        font-weight: 600;
    }
</style>
