<script>
    import { page } from '$app/state';
    
    import { navItems } from '$lib/data';
    
    let activePath = $derived(page.url.pathname);
</script>

<nav class="bottom-nav">
    {#each navItems as item}
        <a 
            class="nav-item" 
            class:active={activePath === item.href}
            href={item.href}
        >
            <span class="material-symbols-outlined" class:icon-fill={activePath === item.href}>
                {item.icon}
            </span>
            <span class="nav-label">{item.label}</span>
        </a>
    {/each}
</nav>

<style>
    .bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 80px;
        display: flex;
        justify-content: space-around;
        padding: 0.75rem 1rem 2rem 1rem;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(40px);
        -webkit-backdrop-filter: blur(40px);
        border-top: 1px solid var(--outline-variant);
        z-index: 100;
        border-radius: var(--radius-3xl) var(--radius-3xl) 0 0;
        box-shadow: 0 -8px 32px rgba(13, 30, 37, 0.06);
    }

    .nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        color: var(--outline);
        gap: 4px;
        padding: 6px 16px;
        border-radius: var(--radius-xl);
        transition: all 0.2s ease-out;
    }

    .nav-item:active {
        transform: scale(0.95);
    }

    .nav-item.active {
        color: var(--primary);
        background: var(--primary-fixed);
    }

    .nav-label {
        font-family: 'Inter', sans-serif;
        font-size: 0.625rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05rem;
    }

    .material-symbols-outlined {
        font-size: 24px;
        transition: font-variation-settings 0.2s;
    }
</style>
