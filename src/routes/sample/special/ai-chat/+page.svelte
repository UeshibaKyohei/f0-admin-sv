<script>
  import { onMount } from 'svelte';
  import ChatSidebar from './ChatSidebar.svelte';
  import ChatMessage from './ChatMessage.svelte';
  import ChatInput from './ChatInput.svelte';
  import LoadingIndicator from './LoadingIndicator.svelte';
  import { 
    conversations, 
    currentConversationId, 
    messages, 
    isLoading,
    createNewConversation,
    deleteConversation,
    sendMessage,
    regenerateLastMessage,
    stopGeneration,
    initializeChat
  } from './chatStore.js';
  import { isMockMode } from './config.js';
  import { mockQuickActions } from './mockData.js';

  let sidebarOpen = $state(true);
  let currentMessages = $derived($messages[$currentConversationId] || []);
  let currentConversation = $derived($conversations.find(c => c.id === $currentConversationId));
  let messagesContainer;
  
  // モバイル対応
  let isMobile = $state(false);
  
  onMount(() => {
    // チャットの初期化
    initializeChat();
    
    // レスポンシブ対応
    isMobile = window.innerWidth < 768;
    const handleResize = () => {
      isMobile = window.innerWidth < 768;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  // メッセージが更新されたらスクロール
  $effect(() => {
    if (currentMessages && messagesContainer) {
      // 少し遅延を入れてDOMが更新されるのを待つ
      setTimeout(() => {
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    }
  });

  // サイドバー開閉
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  // メッセージ送信
  async function handleSendMessage(content) {
    await sendMessage(content);
  }

  // テンプレートをセット
  function setTemplate(template) {
    // ChatInputコンポーネントに値を設定するため、カスタムイベントを使用
    const event = new CustomEvent('setmessage', { detail: template });
    window.dispatchEvent(event);
  }
  
  // 選択肢を選択した時の処理
  function handleSuggestionSelect(suggestion) {
    // 選択肢のプロンプトを入力欄にセット
    const event = new CustomEvent('setmessage', { detail: suggestion.prompt });
    window.dispatchEvent(event);
  }

  // 会話削除
  async function handleDeleteConversation(id) {
    if (confirm('この会話を削除してもよろしいですか？')) {
      await deleteConversation(id);
    }
  }
</script>

<div class="flex h-[calc(100vh-5rem)] bg-base-200">
  <!-- サイドバー -->
  <div class="w-80 flex-shrink-0">
    <ChatSidebar 
      bind:open={sidebarOpen}
      onNewChat={createNewConversation}
      onDeleteChat={handleDeleteConversation}
      {isMobile}
    />
  </div>

  <!-- メインチャットエリア -->
  <div class="flex-1 flex flex-col bg-base-100 h-full overflow-hidden">
    <!-- ヘッダー -->
    <div class="navbar bg-base-200 shadow-md flex-shrink-0">
      <div class="flex-1">
        <h1 class="text-xl font-bold">{currentConversation?.title || 'AI アシスタント'}</h1>
      </div>
    </div>

    <!-- メッセージエリア -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4" bind:this={messagesContainer}>
      {#if currentMessages.length === 0}
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="text-6xl mb-4">🤖</div>
            <h2 class="text-2xl font-bold mb-2">AI アシスタントへようこそ</h2>
            <p class="text-base-content/70">質問を入力して会話を始めましょう</p>
            
            <!-- クイックアクション（モックモード時のみ表示） -->
            {#if isMockMode()}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-2xl mx-auto">
                {#each mockQuickActions as action}
                  <button class="btn btn-outline" onclick={() => setTemplate(action.prompt)}>
                    {@html action.icon}
                    {action.text}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {:else}
        {#each currentMessages as message, index}
          <ChatMessage 
            {message} 
            onRegenerate={index === currentMessages.length - 1 && message.role === 'assistant' ? regenerateLastMessage : undefined}
            onSuggestionSelect={handleSuggestionSelect}
          />
        {/each}
      {/if}
      
      {#if $isLoading}
        <LoadingIndicator />
      {/if}
    </div>

    <!-- 入力エリア -->
    <ChatInput 
      onSend={handleSendMessage}
      onStop={stopGeneration}
      loading={$isLoading}
    />
  </div>
</div>

<style>
  :global(.chat-message) {
    animation: fadeIn 0.3s ease-in;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>