<script>
  import { onMount } from 'svelte';
  import SuggestionButtons from './SuggestionButtons.svelte';

  let { message, onRegenerate, onSuggestionSelect } = $props();
  
  let copying = $state(false);
  
  // メッセージのフォーマット（Markdown対応）
  function formatMessage(content) {
    // 簡易的なMarkdown処理
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-base-300 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br>');
  }
  
  // コピー機能
  async function copyToClipboard() {
    copying = true;
    try {
      await navigator.clipboard.writeText(message.content);
      setTimeout(() => {
        copying = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      copying = false;
    }
  }
  
  // アイコンの取得
  const getIcon = () => {
    if (message.role === 'user') {
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>`;
    } else {
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>`;
    }
  };
</script>

<div class="chat-message relative">
  <div class={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
    {#if message.role === 'assistant'}
      <div class="avatar avatar-placeholder">
        <div class="w-10 h-10 rounded-full bg-primary text-primary-content">
          {@html getIcon()}
        </div>
      </div>
    {/if}
    
    <div class={`flex flex-col max-w-[70%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
      <div class={`rounded-lg px-4 py-3 ${
        message.role === 'user' 
          ? 'bg-primary text-primary-content' 
          : 'bg-base-200 text-base-content'
      }`}>
        <div class="prose prose-sm max-w-none">
          {@html formatMessage(message.content)}
        </div>
        
        {#if message.model}
          <div class="text-xs opacity-70 mt-2">
            {message.model}
          </div>
        {/if}
      </div>
      
      <div class="text-xs text-base-content/50 mt-1 px-1">
        {new Date(message.timestamp).toLocaleTimeString()}
      </div>
      
      <!-- アクションボタン -->
      <div class="flex gap-1 mt-1">
          <button 
            class="btn btn-ghost btn-xs"
            onclick={copyToClipboard}
            title="コピー"
          >
            {#if copying}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-success">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
            {/if}
          </button>
          
          {#if onRegenerate && message.role === 'assistant'}
            <button 
              class="btn btn-ghost btn-xs"
              onclick={onRegenerate}
              title="再生成"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          {/if}
        </div>
    </div>
    
    {#if message.role === 'user'}
      <div class="avatar avatar-placeholder">
        <div class="w-10 h-10 rounded-full bg-base-300 text-base-content">
          {@html getIcon()}
        </div>
      </div>
    {/if}
  </div>
  
  <!-- AIメッセージの場合、選択肢を表示 -->
  {#if message.role === 'assistant' && message.suggestions && message.suggestions.length > 0}
    <div class={`mt-2 ${message.role === 'user' ? 'mr-[52px]' : 'ml-[52px]'}`}>
      <SuggestionButtons 
        suggestions={message.suggestions} 
        onSelect={onSuggestionSelect}
      />
    </div>
  {/if}
</div>