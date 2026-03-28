<script>
    import { alerts, bills, transactions } from '$lib/data';
</script>

<div class="finance-page">
    <header class="page-header">
        <p class="label-sm">Today's Focus</p>
        <h1 class="headline-font">Financial Health</h1>
    </header>

    <section class="section">
        <div class="section-title">
            <h2 class="headline-font">Risk Alerts</h2>
            <span class="status-pill error">2 Critical</span>
        </div>
        <div class="alerts-grid">
            {#each alerts as alert}
                <div class="alert-card {alert.type}">
                    <div class="alert-icon-wrap">
                        <span class="material-symbols-outlined">{alert.icon}</span>
                    </div>
                    <div class="alert-content">
                        <h3>{alert.title}</h3>
                        <p>{alert.description}</p>
                        <button class="action-btn">
                            {alert.action}
                            <span class="material-symbols-outlined x-small">arrow_forward</span>
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    </section>

    <section class="editorial-card card glass-indigo">
        <div class="flex-between">
            <div class="text-group">
                <p class="label-sm white-low">Financial Score</p>
                <h2 class="headline-font white">Healthy</h2>
            </div>
            <div class="stat-circle">
                <span class="material-symbols-outlined">query_stats</span>
            </div>
        </div>
        <div class="card-body">
            <p class="summary-text white">
                You've saved <span class="bold green">$420.50</span> this month in hidden fees by using automated bill protection.
            </p>
            <div class="progress-track">
                <div class="progress-fill green-bar" style="width: 82%;"></div>
            </div>
        </div>
    </section>

    <section class="section">
        <h2 class="headline-font ml-2">Upcoming Bills</h2>
        <div class="bills-row">
            {#each bills as bill}
                <div class="bill-card">
                    <div class="bill-icon" style="color: {bill.color}">
                        <span class="material-symbols-outlined">{bill.icon}</span>
                    </div>
                    <div class="bill-info">
                        <p class="bill-category">{bill.category}</p>
                        <p class="bill-date">{bill.date}</p>
                        <p class="bill-amount">${bill.amount.toFixed(2)}</p>
                    </div>
                </div>
            {/each}
        </div>
    </section>

    <section class="section">
        <div class="flex-between ml-2">
            <h2 class="headline-font">Banking Activity</h2>
            <button class="text-link-sm">See All</button>
        </div>
        <div class="activity-list card">
            {#each transactions as tx}
                <div class="tx-item">
                    <div class="tx-icon">
                        <span class="material-symbols-outlined">{tx.icon}</span>
                    </div>
                    <div class="tx-info">
                        <p class="tx-name">{tx.name}</p>
                        <p class="tx-details">{tx.category} • {tx.date}</p>
                    </div>
                    <div class="tx-amount" class:positive={tx.positive}>
                        {tx.positive ? '+' : '-'}${Math.abs(tx.amount).toLocaleString()}
                    </div>
                </div>
            {/each}
        </div>
    </section>
</div>

<style>
    .finance-page {
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
    }

    .label-sm {
        font-size: 0.625rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--primary);
    }

    h1 {
        font-size: 2rem;
        margin-top: 0.25rem;
    }

    .section {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .section-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .status-pill {
        font-size: 0.625rem;
        font-weight: 700;
        padding: 4px 12px;
        border-radius: var(--radius-full);
        text-transform: uppercase;
    }

    .status-pill.error { background: var(--error-container); color: var(--on-error-container); }

    .alerts-grid {
        display: grid;
        gap: 1rem;
    }

    .alert-card {
        display: flex;
        gap: 1rem;
        padding: 1.25rem;
        background: var(--surface-container-lowest);
        border-radius: var(--radius-xl);
        border-left: 4px solid var(--error);
        box-shadow: var(--shadow-ambient);
    }

    .alert-card.tertiary { border-left-color: var(--tertiary-fixed-dim); }

    .alert-icon-wrap {
        padding: 8px;
        background: var(--error-container);
        border-radius: var(--radius-lg);
        height: fit-content;
        color: var(--error);
    }

    .tertiary .alert-icon-wrap { background: var(--tertiary-fixed); color: var(--on-tertiary-fixed-variant); }

    .alert-content h3 { font-size: 1rem; margin-bottom: 0.25rem; }
    .alert-content p { font-size: 0.875rem; color: var(--on-surface-variant); }

    .action-btn {
        margin-top: 0.75rem;
        background: none;
        border: none;
        color: var(--primary);
        font-weight: 700;
        font-size: 0.875rem;
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
    }

    .editorial-card {
        background: linear-gradient(135deg, var(--primary), var(--primary-container));
        padding: 1.5rem;
        border-radius: var(--radius-3xl);
    }

    .white { color: white; }
    .white-low { color: rgba(255, 255, 255, 0.7); }

    .flex-between { display: flex; justify-content: space-between; align-items: flex-start; }

    .stat-circle {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-full);
        border: 2px solid rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }

    .card-body { margin-top: 1.5rem; }
    .summary-text { font-size: 0.875rem; margin-bottom: 1rem; }
    .bold { font-weight: 700; }
    .green { color: #91d78a; }

    .progress-track {
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-full);
        overflow: hidden;
    }

    .green-bar { background: #acf4a4; box-shadow: 0 0 12px rgba(145, 215, 138, 0.5); }

    .bills-row {
        display: flex;
        gap: 1rem;
        overflow-x: auto;
        padding-bottom: 1rem;
        scrollbar-width: none;
    }

    .bill-card {
        flex-shrink: 0;
        width: 160px;
        background: var(--surface-container-low);
        padding: 1.25rem;
        border-radius: var(--radius-2xl);
    }

    .bill-icon {
        width: 40px;
        height: 40px;
        background: white;
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
    }

    .bill-category { font-weight: 700; font-size: 0.875rem; }
    .bill-date { font-size: 0.75rem; color: var(--on-surface-variant); margin-bottom: 0.75rem; }
    .bill-amount { font-weight: 800; font-size: 1.125rem; color: var(--primary); }

    .tx-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid var(--surface-container);
    }

    .tx-item:last-child { border-bottom: none; }

    .tx-icon {
        width: 48px;
        height: 48px;
        background: var(--surface);
        border-radius: var(--radius-xl);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary);
    }

    .tx-info { flex: 1; }
    .tx-name { font-weight: 700; font-size: 0.875rem; }
    .tx-details { font-size: 0.75rem; color: var(--on-surface-variant); }

    .tx-amount { font-weight: 800; font-size: 0.875rem; }
    .tx-amount.positive { color: #0c5216; }

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

    .x-small { font-size: 16px; }
</style>
