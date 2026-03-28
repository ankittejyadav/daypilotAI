<script>
    let { 
        category = "Email", 
        title = "1 Urgent Commitment", 
        description = "Follow up with the Design Team regarding the Q3 proposal.", 
        icon = "mail", 
        status = "Pending since 8:45 AM", 
        type = "primary" 
    } = $props();
</script>

<div class="insight-card {type}">
    <div class="card-header">
        <span class="category-chip">{category}</span>
    </div>
    <div class="card-body">
        <h3 class="headline-font">{title}</h3>
        <p class="description">{description}</p>
    </div>
    <div class="card-footer">
        <span class="material-symbols-outlined icon-small">{icon}</span>
        <span class="status-text">{status}</span>
    </div>
</div>

<style>
    .insight-card {
        background-color: var(--surface-container-lowest);
        border-radius: var(--radius-3xl);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 180px;
        box-shadow: var(--shadow-ambient);
        transition: transform 0.2s ease-out;
        cursor: pointer;
    }

    .insight-card:active {
        transform: scale(0.98);
    }

    .category-chip {
        font-size: 0.625rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        padding: 4px 12px;
        border-radius: var(--radius-full);
        display: inline-block;
        margin-bottom: 1rem;
    }

    .primary .category-chip { background: rgba(11, 26, 125, 0.1); color: var(--primary); }
    .secondary .category-chip { background: rgba(82, 103, 114, 0.1); color: var(--secondary); }
    .tertiary .category-chip { background: var(--on-tertiary-fixed-variant); color: white; }
    .error .category-chip { background: var(--error); color: white; }

    .insight-card.secondary { background-color: var(--surface-container-low); box-shadow: none; }
    .insight-card.tertiary { background-color: var(--tertiary-fixed); box-shadow: none; }
    .insight-card.error { background-color: var(--error-container); box-shadow: none; }

    h3 {
        font-size: 1.125rem;
        line-height: 1.3;
        margin-bottom: 0.5rem;
    }

    .primary h3 { color: var(--primary); }
    .tertiary h3 { color: var(--on-tertiary-fixed-variant); }
    .error h3 { color: var(--error); }

    .description {
        font-size: 0.875rem;
        color: var(--on-surface-variant);
        line-height: 1.4;
    }

    .tertiary .description { color: rgba(12, 82, 22, 0.8); }

    .card-footer {
        margin-top: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .icon-small {
        font-size: 20px;
        color: var(--outline);
    }

    .primary .icon-small { color: var(--primary); }
    .error .icon-small { color: var(--error); }

    .status-text {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--on-surface-variant);
    }
</style>
