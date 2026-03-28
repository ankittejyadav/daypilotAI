<script>
    import { tasks as mockTasks } from '$lib/data';

    let { data } = $props();

    const tasks = $derived(data.isAuthenticated ? data.tasks : mockTasks);
    let pendingCount = $derived(tasks.filter(t => t.status === 'pending').length);
</script>

<div class="tasks-page">
    <header class="page-header">
        <p class="label-sm">Daily Focus</p>
        <h1 class="headline-font">Task Manager</h1>
    </header>

    {#if data.error}
        <div class="error-banner">
            <span class="material-symbols-outlined">warning</span>
            <p>{data.error}</p>
        </div>
    {/if}

    {#if !data.isAuthenticated}
        <section class="demo-banner">
            <div class="banner-content">
                <span class="material-symbols-outlined">sparkles</span>
                <p><strong>Demo Mode Active:</strong> Showing prioritized sample tasks. Connect Google Tasks to sync your real to-do lists.</p>
            </div>
            <a href="/api/auth/google" class="connect-link">Connect Tasks</a>
        </section>
    {/if}

    <div class="stats-grid">
        <div class="stat-card">
            <span class="stat-num">{pendingCount}</span>
            <span class="stat-lbl">Active Tasks</span>
        </div>
        <div class="stat-card primary">
            <span class="stat-num">{data.isAuthenticated ? 'Optimal' : 'Demo'}</span>
            <span class="stat-lbl">Efficiency</span>
        </div>
    </div>

    <section class="section">
        <div class="flex-between">
            <h2 class="headline-font">{data.isAuthenticated ? 'Your Tasks' : 'Prioritized Tasks'}</h2>
            {#if data.isAuthenticated}
                <button class="add-btn">
                    <span class="material-symbols-outlined x-small">add</span>
                    New Task
                </button>
            {/if}
        </div>

        <div class="task-list card">
            {#if tasks.length === 0}
                <div class="empty-state">
                    <span class="material-symbols-outlined">playlist_add_check</span>
                    <p>All caught up!</p>
                </div>
            {:else}
                {#each tasks as task}
                    <div class="task-item" class:done={task.status === 'done'}>
                        <button class="check-circ" class:checked={task.status === 'done'}>
                            {#if task.status === 'done'}
                                <span class="material-symbols-outlined x-small">check</span>
                            {/if}
                        </button>
                        <div class="task-info">
                            <div class="flex-between">
                                <span class="task-title">{task.title}</span>
                                <span class="priority-tag {task.priority.toLowerCase()}">{task.priority}</span>
                            </div>
                            <div class="task-meta">
                                <span class="category">{task.category}</span>
                                <span class="dot-sep">•</span>
                                <span class="due">{task.due}</span>
                            </div>
                        </div>
                    </div>
                {/each}
            {/if}
        </div>
    </section>

    {#if data.isAuthenticated}
        <button class="primary-btn-fixed">
            <span class="material-symbols-outlined">auto_awesome</span>
            Prioritize with AI
        </button>
    {/if}
</div>

<style>
    .tasks-page { display: flex; flex-direction: column; gap: 2rem; }
    
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .stat-card { background: var(--surface-container-low); padding: 1.5rem; border-radius: var(--radius-2xl); display: flex; flex-direction: column; gap: 4px; }
    .stat-card.primary { background: var(--primary-fixed); color: var(--primary); }
    .stat-num { font-size: 1.5rem; font-weight: 800; font-family: 'Manrope', sans-serif; }
    .stat-lbl { font-size: 0.75rem; font-weight: 600; color: var(--on-surface-variant); }

    .add-btn { background: var(--surface-container-highest); border: none; color: var(--primary); font-weight: 700; font-size: 0.75rem; display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: var(--radius-full); cursor: pointer; }

    .task-list { padding: 0; overflow: hidden; }
    .task-item { display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--surface-container); transition: opacity 0.3s; }
    .task-item.done { opacity: 0.6; }
    .task-item:last-child { border-bottom: none; }

    .check-circ { width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--outline-variant); background: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; flex-shrink: 0; }
    .check-circ.checked { background: var(--primary); border-color: var(--primary); }

    .task-info { flex: 1; min-width: 0; }
    .task-title { font-weight: 700; font-size: 0.875rem; color: var(--on-surface); }
    .task-item.done .task-title { text-decoration: line-through; }

    .priority-tag { font-size: 0.625rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }
    .priority-tag.high { background: var(--error-container); color: var(--error); }
    .priority-tag.medium { background: var(--secondary-container); color: var(--secondary); }

    .task-meta { font-size: 0.75rem; color: var(--on-surface-variant); margin-top: 4px; }
    .dot-sep { margin: 0 6px; }

    .primary-btn-fixed { position: fixed; bottom: 112px; left: 50%; transform: translateX(-50%); background: var(--primary); color: white; border: none; padding: 1rem 2rem; border-radius: var(--radius-full); font-weight: 800; font-size: 0.875rem; display: flex; align-items: center; gap: 8px; box-shadow: 0 8px 32px rgba(11, 26, 125, 0.3); cursor: pointer; white-space: nowrap; z-index: 90; }

    .x-small { font-size: 16px; }

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
        grid-column: 1 / -1;
    }

    .empty-state .material-symbols-outlined {
        font-size: 48px;
        opacity: 0.3;
    }

    .empty-state p {
        font-size: 0.875rem;
        font-weight: 600;
    }

    .error-banner {
        background: var(--error-container);
        color: var(--on-error-container);
        padding: 1rem;
        border-radius: var(--radius-xl);
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
        border: 1px solid var(--error);
    }

    .error-banner p {
        font-size: 0.875rem;
        font-weight: 600;
    }
</style>
