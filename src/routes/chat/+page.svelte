<script>
    import ChatInterface from '$lib/components/ChatInterface.svelte';
    import { fade } from 'svelte/transition';

    let { data } = $props();
</script>

<svelte:head>
    <title>DayPilot AI | Assistant</title>
</svelte:head>

<div class="chat-page" in:fade={{ duration: 300 }}>
    <header class="chat-header">
        <div class="status-indicator">
            <span class="pulse-dot"></span>
            <span class="status-label">AI Is Online</span>
        </div>
        <h1 class="headline-font">DayPilot Assistant</h1>
        <p class="subtitle">Your personalized daily command agent.</p>
    </header>

    <ChatInterface user={data.user} />
</div>

<style>
    .chat-page {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        height: 100%;
    }

    .chat-header {
        text-align: center;
        padding-bottom: 0.5rem;
    }

    h1 {
        font-size: 1.75rem;
        color: var(--on-surface);
        margin-bottom: 0.25rem;
    }

    .subtitle {
        color: var(--outline);
        font-size: 0.875rem;
    }

    .status-indicator {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--surface-container-high);
        padding: 0.25rem 0.75rem;
        border-radius: var(--radius-full);
        margin-bottom: 1rem;
    }

    .pulse-dot {
        width: 8px;
        height: 8px;
        background: #4CAF50;
        border-radius: 50%;
        box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
        animation: pulse-ring 2s infinite;
    }

    .status-label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--on-surface-variant);
        letter-spacing: 0.05rem;
    }

    @keyframes pulse-ring {
        0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
        100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
    }
</style>
