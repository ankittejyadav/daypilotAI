<script>
    import { onMount, tick } from 'svelte';
    import { fly, fade } from 'svelte/transition';

    let { user } = $props();

    let messages = $state([
        { role: 'assistant', content: 'Hello! I\'m your DayPilot assistant. How can I help you manage your day?' }
    ]);
    let input = $state('');
    let isLoading = $state(false);
    let currentTool = $state(null);
    let chatContainer = $state(null);

    const scrollToBottom = async () => {
        await tick();
        if (chatContainer) {
            chatContainer.scrollTo({
                top: chatContainer.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        input = '';
        messages = [...messages, { role: 'user', content: userMessage }];
        isLoading = true;
        
        await scrollToBottom();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.slice(0, -1)
                })
            });

            const data = await response.json();

            if (data.error) {
                const errorDetail = data.details ? `: ${data.details}` : '';
                messages = [...messages, { role: 'assistant', content: `Error: ${data.error}${errorDetail}` }];
            } else {
                // Synchronize history from backend to include tool calls/responses
                if (data.history) {
                    messages = data.history.map(m => ({
                        role: m.role === 'model' ? 'assistant' : 'user',
                        content: m.parts?.[0]?.text || '[Complex Interaction]',
                        parts: m.parts
                    }));
                } else {
                    messages = [...messages, { role: 'assistant', content: data.response }];
                }
            }
        } catch (e) {
            messages = [...messages, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the AI service.' }];
        } finally {
            isLoading = false;
            await scrollToBottom();
        }
    };

    onMount(() => {
        scrollToBottom();
    });
</script>

<div class="chat-wrapper">
    <div class="chat-container" bind:this={chatContainer}>
        {#each messages as msg, i}
            <div class="message-row" class:user-row={msg.role === 'user'}>
                <div 
                    class="message-bubble" 
                    class:user-bubble={msg.role === 'user'}
                    class:ai-bubble={msg.role === 'assistant'}
                    in:fly={{ y: 20, duration: 400, delay: 0 }}
                >
                    <p>{@html msg.content.replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        {/each}

        {#if isLoading}
            <div class="message-row">
                <div class="thinking-bubble ai-bubble" in:fade>
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        {/if}
    </div>

    <div class="input-area glass">
        <input 
            type="text" 
            placeholder="Ask anything..." 
            bind:value={input}
            onkeydown={(e) => e.key === 'Enter' && sendMessage()}
            disabled={isLoading}
        />
        <button class="send-btn" onclick={sendMessage} disabled={isLoading || !input.trim()}>
            <span class="material-symbols-outlined">
                {isLoading ? 'hourglass_empty' : 'send'}
            </span>
        </button>
    </div>
</div>

<style>
    .chat-wrapper {
        display: flex;
        flex-direction: column;
        height: calc(100dvh - 200px); /* Adjust for Nav and Tab bar */
        max-width: 100%;
        margin: 0 auto;
    }

    .chat-container {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        scrollbar-width: thin;
        scrollbar-color: var(--surface-dim) transparent;
    }

    .message-row {
        display: flex;
        width: 100%;
    }

    .user-row {
        justify-content: flex-end;
    }

    .message-bubble {
        max-width: 80%;
        padding: 1rem 1.25rem;
        border-radius: var(--radius-2xl);
        font-size: 0.9375rem;
        line-height: 1.5;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }

    .ai-bubble {
        background: var(--surface-container-low);
        color: var(--on-surface);
        border-bottom-left-radius: 4px;
        border: 1px solid var(--outline-variant);
    }

    .user-bubble {
        background: linear-gradient(135deg, var(--primary), var(--primary-container));
        color: var(--on-primary);
        border-bottom-right-radius: 4px;
        box-shadow: 0 8px 16px rgba(11, 26, 125, 0.15);
    }

    .thinking-bubble {
        display: flex;
        gap: 4px;
        padding: 0.75rem 1rem;
        border-radius: var(--radius-2xl);
        background: var(--surface-container-low);
        width: fit-content;
    }

    .dot {
        width: 6px;
        height: 6px;
        background: var(--outline);
        border-radius: 50%;
        animation: pulse 1.5s infinite ease-in-out;
    }

    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.4; }
        50% { transform: scale(1.2); opacity: 1; }
    }

    .input-area {
        margin-top: 1rem;
        padding: 0.75rem;
        display: flex;
        gap: 0.5rem;
        border-radius: var(--radius-3xl);
        border: 1px solid var(--outline-variant);
        background: var(--surface-container-lowest);
        box-shadow: 0 8px 32px rgba(0,0,0,0.05);
    }

    input {
        flex: 1;
        background: transparent;
        border: none;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        color: var(--on-surface);
        outline: none;
    }

    .send-btn {
        background: var(--primary);
        color: var(--on-primary);
        border: none;
        width: 44px;
        height: 44px;
        border-radius: var(--radius-2xl);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .send-btn:hover:not(:disabled) {
        transform: scale(1.05);
        background: var(--primary-container);
    }

    .send-btn:active:not(:disabled) {
        transform: scale(0.95);
    }

    .send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .material-symbols-outlined {
        font-size: 20px;
    }
</style>
