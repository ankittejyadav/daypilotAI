<script lang="ts">
    import { enhance } from '$app/forms';
    let { form } = $props();

    let loading = $state(false);
</script>

<svelte:head>
    <title>Login | DayPilot AI</title>
</svelte:head>

<div class="login-container">
    <div class="login-card glass">
        <div class="header">
            <div class="logo">
                <span class="material-symbols-outlined logo-icon">explore</span>
                <span class="app-name">DayPilot AI</span>
            </div>
            <h1>Welcome Back</h1>
            <p class="subtitle">Enter your credentials to access your command center.</p>
        </div>

        <form 
            method="POST" 
            action="?/login" 
            use:enhance={() => {
                loading = true;
                return async ({ update }) => {
                    await update();
                    loading = false;
                };
            }}
        >
            <div class="input-group">
                <label for="username">Username</label>
                <div class="input-wrapper">
                    <span class="material-symbols-outlined input-icon">person</span>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        placeholder="admin" 
                        required 
                        value={form?.username ?? ''}
                    />
                </div>
            </div>

            <div class="input-group">
                <label for="password">Password</label>
                <div class="input-wrapper">
                    <span class="material-symbols-outlined input-icon">lock</span>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        placeholder="••••••••" 
                        required 
                    />
                </div>
            </div>

            {#if form?.message}
                <div class="error-message">
                    <span class="material-symbols-outlined">error</span>
                    {form.message}
                </div>
            {/if}

            <button type="submit" class="login-button" disabled={loading}>
                {#if loading}
                    <span class="spinner"></span>
                {:else}
                    Login
                    <span class="material-symbols-outlined">arrow_forward</span>
                {/if}
            </button>
        </form>

        <div class="footer">
            <p>Demo Credentials: <code>admin</code> / <code>admin123</code></p>
        </div>
    </div>
    
    <div class="background-decor">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="blob blob-3"></div>
    </div>
</div>

<style>
    .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--surface-container-lowest);
        position: relative;
        overflow: hidden;
        font-family: 'Manrope', sans-serif;
    }

    .login-card {
        width: 100%;
        max-width: 440px;
        padding: 3rem;
        border-radius: 2rem;
        z-index: 10;
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.08);
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.5);
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
    }

    .header {
        text-align: left;
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 2rem;
    }

    .logo-icon {
        color: var(--primary);
        font-size: 2rem;
    }

    .app-name {
        font-weight: 900;
        font-size: 1.5rem;
        letter-spacing: -0.04em;
        color: var(--primary);
    }

    h1 {
        font-size: 2.25rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        color: var(--on-surface);
        margin: 0;
        line-height: 1.1;
    }

    .subtitle {
        color: var(--outline);
        font-size: 1rem;
        margin-top: 0.5rem;
        font-weight: 500;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    label {
        font-size: 0.875rem;
        font-weight: 700;
        color: var(--on-surface-variant);
        padding-left: 0.25rem;
    }

    .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }

    .input-icon {
        position: absolute;
        left: 1.25rem;
        color: var(--outline);
        font-size: 1.25rem;
    }

    input {
        width: 100%;
        padding: 1rem 1rem 1rem 3.25rem;
        border-radius: 1rem;
        border: 1.5px solid var(--outline-variant);
        background: var(--surface-container-low);
        font-size: 1rem;
        font-family: inherit;
        font-weight: 600;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        color: var(--on-surface);
    }

    input:focus {
        outline: none;
        border-color: var(--primary);
        background: white;
        box-shadow: 0 0 0 4px var(--primary-container);
    }

    .login-button {
        margin-top: 1rem;
        padding: 1rem;
        border-radius: 1rem;
        border: none;
        background: var(--primary);
        color: white;
        font-size: 1rem;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 8px 16px rgba(98, 0, 238, 0.2);
    }

    .login-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px rgba(98, 0, 238, 0.3);
        background: var(--primary-fixed-dim);
    }

    .login-button:active:not(:disabled) {
        transform: translateY(0);
    }

    .login-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .error-message {
        background: var(--error-container);
        color: var(--on-error-container);
        padding: 1rem;
        border-radius: 1rem;
        font-size: 0.875rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .footer {
        text-align: center;
        font-size: 0.875rem;
        color: var(--outline);
        font-weight: 500;
    }

    code {
        background: var(--surface-container-high);
        padding: 0.2rem 0.4rem;
        border-radius: 0.4rem;
        font-weight: 700;
        color: var(--primary);
    }

    .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    /* Background blobs */
    .background-decor {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
    }

    .blob {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.5;
        animation: float 20s infinite alternate;
    }

    .blob-1 {
        width: 500px;
        height: 500px;
        background: var(--primary-container);
        top: -100px;
        right: -100px;
    }

    .blob-2 {
        width: 400px;
        height: 400px;
        background: var(--tertiary-container);
        bottom: -50px;
        left: -100px;
        animation-delay: -5s;
    }

    .blob-3 {
        width: 300px;
        height: 300px;
        background: var(--secondary-container);
        bottom: 20%;
        right: 15%;
        animation-delay: -10s;
    }

    @keyframes float {
        0% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0, 0) scale(1); }
    }

    @media (max-width: 480px) {
        .login-card {
            padding: 2rem;
            margin: 1rem;
            border-radius: 1.5rem;
        }
    }
</style>
