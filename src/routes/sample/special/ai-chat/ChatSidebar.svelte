<script>
  import { conversations, currentConversationId, searchConversations, togglePinConversation, exportChatHistory } from './chatStore.js';
  
  let { open, onNewChat, onDeleteChat, isMobile = false } = $props();
  
  let searchQuery = $state('');
  let showExportMenu = $state({});
  
  const filteredConversations = $derived($searchConversations(searchQuery));
  const pinnedConversations = $derived(filteredConversations.filter(c => c.pinned));
  const unpinnedConversations = $derived(filteredConversations.filter(c => !c.pinned));
  
  function selectConversation(id) {
    $currentConversationId = id;
    if (isMobile) {
      open = false;
    }
  }
  
  function handleExport(conversationId, format) {
    exportChatHistory(conversationId, format);
    showExportMenu[conversationId] = false;
  }
</script>

{#if open}
  <aside class="h-[calc(100vh-5rem)] bg-base-200 flex flex-col border-r border-base-300">
    <!-- ヘッダー -->
    <div class="p-4 border-b border-base-300">
      <button 
        class="btn btn-primary w-full gap-2"
        onclick={onNewChat}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        新しいチャット
      </button>
    </div>
    
    <!-- 検索 -->
    <div class="p-4">
      <label class="input input-bordered input-sm flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 opacity-70">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input 
          type="text" 
          placeholder="会話を検索..." 
          class="grow"
          bind:value={searchQuery}
        />
      </label>
    </div>
    
    <!-- 会話リスト -->
    <div class="flex-1 overflow-y-auto px-2">
      {#if pinnedConversations.length > 0}
        <div class="mb-4">
          <h3 class="text-xs font-semibold text-base-content/50 px-2 mb-2">ピン留め</h3>
          {#each pinnedConversations as conversation}
            <div class="relative group">
              <button
                class={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                  $currentConversationId === conversation.id 
                    ? 'bg-primary text-primary-content' 
                    : 'hover:bg-base-300'
                }`}
                onclick={() => selectConversation(conversation.id)}
              >
                <div class="font-medium truncate">{conversation.title}</div>
                <div class="text-xs opacity-70 mt-1">
                  {new Date(conversation.updatedAt).toLocaleDateString()}
                </div>
              </button>
              
              <!-- アクションボタン -->
              <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="dropdown dropdown-end">
                  <button class="btn btn-ghost btn-xs btn-square" aria-label="会話オプション">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                    </svg>
                  </button>
                  <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><button onclick={() => togglePinConversation(conversation.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ピン留めを解除
                    </button></li>
                    <li>
                      <details>
                        <summary>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                          エクスポート
                        </summary>
                        <ul>
                          <li><button onclick={() => handleExport(conversation.id, 'json')}>JSON形式</button></li>
                          <li><button onclick={() => handleExport(conversation.id, 'markdown')}>Markdown形式</button></li>
                          <li><button onclick={() => handleExport(conversation.id, 'txt')}>テキスト形式</button></li>
                        </ul>
                      </details>
                    </li>
                    <li><button onclick={() => onDeleteChat(conversation.id)} class="text-error">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      削除
                    </button></li>
                  </ul>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
      
      {#if unpinnedConversations.length > 0}
        <div>
          {#if pinnedConversations.length > 0}
            <h3 class="text-xs font-semibold text-base-content/50 px-2 mb-2">すべての会話</h3>
          {/if}
          {#each unpinnedConversations as conversation}
            <div class="relative group">
              <button
                class={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                  $currentConversationId === conversation.id 
                    ? 'bg-primary text-primary-content' 
                    : 'hover:bg-base-300'
                }`}
                onclick={() => selectConversation(conversation.id)}
              >
                <div class="font-medium truncate">{conversation.title}</div>
                <div class="text-xs opacity-70 mt-1">
                  {new Date(conversation.updatedAt).toLocaleDateString()}
                </div>
              </button>
              
              <!-- アクションボタン -->
              <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="dropdown dropdown-end">
                  <button class="btn btn-ghost btn-xs btn-square" aria-label="会話オプション">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                    </svg>
                  </button>
                  <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><button onclick={() => togglePinConversation(conversation.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.625c0-2.485-2.015-4.5-4.5-4.5s-4.5 2.015-4.5 4.5m0 0V21m0-12.375c0-2.485-2.015-4.5-4.5-4.5S3 6.14 3 8.625m9 12.375H4.5m15 0H12" />
                      </svg>
                      ピン留め
                    </button></li>
                    <li>
                      <details>
                        <summary>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                          エクスポート
                        </summary>
                        <ul>
                          <li><button onclick={() => handleExport(conversation.id, 'json')}>JSON形式</button></li>
                          <li><button onclick={() => handleExport(conversation.id, 'markdown')}>Markdown形式</button></li>
                          <li><button onclick={() => handleExport(conversation.id, 'txt')}>テキスト形式</button></li>
                        </ul>
                      </details>
                    </li>
                    <li><button onclick={() => onDeleteChat(conversation.id)} class="text-error">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      削除
                    </button></li>
                  </ul>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
      
      {#if filteredConversations.length === 0}
        <div class="text-center text-base-content/50 p-4">
          {searchQuery ? '検索結果がありません' : '会話がありません'}
        </div>
      {/if}
    </div>
    
    <!-- フッター -->
    <div class="p-4 border-t border-base-300">
      <div class="text-xs text-base-content/50 text-center">
        {$conversations.length} 件の会話
      </div>
    </div>
  </aside>
{/if}