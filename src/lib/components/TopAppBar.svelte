<script>
    let { user = null } = $props();
</script>

<header class="top-app-bar">
    <div class="logo-group">
        <div class="profile-image">
            {#if user?.avatarUrl}
                <img src={user.avatarUrl} alt={user.name} />
            {:else}
                <span class="material-symbols-outlined placeholder-icon">account_circle</span>
            {/if}
        </div>
        <span class="app-name">DayPilot AI</span>
    </div>
    <div class="actions">
        {#if !user}
            <a href="/login" class="login-link">Login</a>
        {:else}
            <a href="/api/auth/logout" class="logout-link">Logout</a>
        {/if}
        <button class="icon-button" aria-label="Notifications">
            <span class="material-symbols-outlined">notifications</span>
        </button>
    </div>
</header>

<style>
    .top-app-bar {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 64px;
        display: flex;
        justify-content: space-between;
        padding: 0 1.5rem;
        align-items: center;
        background: rgba(244, 250, 255, 0.8);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-bottom: 1px solid var(--outline-variant);
        z-index: 100;
    }

    .logo-group {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .profile-image {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-full);
        overflow: hidden;
        background: var(--primary-fixed-dim);
    }

    .profile-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .app-name {
        font-family: 'Manrope', sans-serif;
        font-weight: 800;
        font-size: 1.25rem;
        letter-spacing: -0.025em;
        color: var(--primary);
    }

    .icon-button {
        background: none;
        border: none;
        color: var(--primary);
        cursor: pointer;
        padding: 8px;
        border-radius: var(--radius-full);
        transition: background 0.2s;
    }

    .placeholder-icon {
        font-size: 40px;
        color: var(--primary);
    }

    .actions {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .login-link, .logout-link {
        font-size: 0.875rem;
        font-weight: 700;
        color: var(--primary);
        text-decoration: none;
        padding: 4px 12px;
        border-radius: var(--radius-full);
        background: var(--primary-container);
    }
    
    .logout-link {
        background: var(--surface-container-highest);
        color: var(--on-surface-variant);
    }

    .icon-button:hover {
        background: var(--surface-container-low);
    }

    .icon-button:active {
        transform: scale(0.9);
    }
</style>
