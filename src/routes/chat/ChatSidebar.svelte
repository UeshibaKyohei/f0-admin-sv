<script>
  import { onMount } from 'svelte';
  import { 
    chats, 
    selectedChat, 
    currentUser,
    searchQuery,
    filteredChats,
    unreadCounts,
    onlineUsers,
    sidebarOpen,
    isMobile,
    showUserProfile,
    profileUser
  } from './chatStore.js';
  import { mockChats, mockUsers, generateMockMessages, statusColors } from './mockData.js';
  
  let searchInput;
  
  // 検索フォーカスイベント
  function handleFocusSearch() {
    searchInput?.focus();
  }
  
  // チャット選択
  function selectChat(chat) {
    selectedChat.set(chat);
    // モバイルの場合はサイドバーを閉じる
    if ($isMobile) {
      sidebarOpen.set(false);
    }
  }
  
  // ユーザープロフィール表示
  function showProfile(user, event) {
    event.stopPropagation();
    profileUser.set(user);
    showUserProfile.set(true);
  }
  
  // 新しいチャット開始
  function startNewChat() {
    // 実装: ユーザー選択モーダルを表示
    console.log('新しいチャットを開始');
  }
  
  onMount(() => {
    // モックデータをストアに設定
    chats.set(mockChats);
    
    // モックメッセージを設定
    const mockMessages = generateMockMessages();
    chats.update(chatList => {
      chatList.forEach(chat => {
        if (mockMessages[chat.id]) {
          const unreadCount = mockMessages[chat.id].filter(
            msg => !msg.readBy.includes('current-user') && msg.senderId !== 'current-user'
          ).length;
          chat.unreadCount = unreadCount;
        }
      });
      return chatList;
    });
    
    // オンラインユーザーを設定
    onlineUsers.set(new Set(['user-1', 'user-2', 'user-5']));
    
    // イベントリスナー
    window.addEventListener('focus-search', handleFocusSearch);
    
    return () => {
      window.removeEventListener('focus-search', handleFocusSearch);
    };
  });
  
  // チャットの最終メッセージ時刻をフォーマット
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '今';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}時間前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}日前`;
    
    return date.toLocaleDateString('ja-JP');
  }
</script>

<div class={`
  ${$isMobile ? 'absolute inset-y-0 left-0 z-50' : 'relative'}
  ${$sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  w-80 bg-base-100 border-r border-base-300 flex flex-col
  transition-transform duration-300 ease-in-out
`}>
  <!-- ヘッダー -->
  <div class="p-4 border-b border-base-300">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold">チャット</h2>
      <div class="flex gap-2">
        <button 
          class="btn btn-circle btn-sm btn-ghost"
          onclick={startNewChat}
          title="新しいチャット"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        {#if $isMobile}
          <button 
            class="btn btn-circle btn-sm btn-ghost"
            onclick={() => sidebarOpen.set(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        {/if}
      </div>
    </div>
    
    <!-- 検索バー -->
    <div class="join w-full">
      <span class="btn btn-square btn-sm join-item">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
      <input
        bind:this={searchInput}
        bind:value={$searchQuery}
        type="text"
        placeholder="検索... (Ctrl+K)"
        class="input input-bordered input-sm join-item flex-1"
      />
    </div>
  </div>
  
  <!-- 現在のユーザー（自分） -->
  <div class="p-4 border-b border-base-300 bg-base-200/50">
    {#if $currentUser}
      <div class="text-xs text-base-content/70 mb-2">あなたのプロフィール</div>
      <div class="flex items-center gap-3">
        <div class="avatar online">
          <div class="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src={$currentUser.avatar} alt={$currentUser.name} />
          </div>
        </div>
        <div class="flex-1">
          <div class="font-semibold">{$currentUser.name}</div>
          <div class="text-sm text-base-content/70">{$currentUser.statusMessage}</div>
        </div>
        <div class="dropdown dropdown-end">
          <button 
            tabindex="0"
            class="btn btn-circle btn-ghost btn-sm"
            title="設定">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><a><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>プロフィール編集</a></li>
            <li><a><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>ステータス変更</a></li>
            <li><a><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>通知設定</a></li>
            <div class="divider my-0"></div>
            <li><a><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>ログアウト</a></li>
          </ul>
        </div>
      </div>
    {/if}
  </div>
  
  <!-- チャットリスト -->
  <div class="flex-1 overflow-y-auto">
    {#each $filteredChats as chat (chat.id)}
      {@const isSelected = $selectedChat?.id === chat.id}
      {@const unread = $unreadCounts[chat.id] || 0}
      {@const isOnline = chat.type === 'direct' && $onlineUsers.has(chat.participants.find(p => p !== 'current-user'))}
      
      <button
        class={`
          w-full p-4 hover:bg-base-200 transition-colors
          ${isSelected ? 'bg-base-200' : ''}
          ${chat.isPinned ? 'border-l-4 border-primary' : ''}
        `}
        onclick={() => selectChat(chat)}
      >
        <div class="flex items-center gap-3">
          <!-- アバター -->
          <div class="relative">
            {#if chat.type === 'direct'}
              <div class={`avatar ${isOnline ? 'online' : 'offline'}`}>
                <div class="w-12 rounded-full">
                  <img src={chat.avatar} alt={chat.name} />
                </div>
              </div>
            {:else}
              <div class="avatar-group -space-x-6">
                {#each chat.participants.slice(0, 3) as participantId}
                  {@const user = mockUsers.find(u => u.id === participantId)}
                  {#if user}
                    <div class="avatar">
                      <div class="w-8">
                        <img src={user.avatar} alt={user.name} />
                      </div>
                    </div>
                  {/if}
                {/each}
                {#if chat.participants.length > 3}
                  <div class="avatar placeholder">
                    <div class="w-8 bg-neutral text-neutral-content">
                      <span class="text-xs">+{chat.participants.length - 3}</span>
                    </div>
                  </div>
                {/if}
              </div>
            {/if}
            
            {#if chat.isPinned}
              <div class="absolute -top-1 -right-1 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 12V4h1a1 1 0 000-2H7a1 1 0 000 2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                </svg>
              </div>
            {/if}
          </div>
          
          <!-- チャット情報 -->
          <div class="flex-1 text-left">
            <div class="flex items-center justify-between">
              <div class="font-semibold">{chat.name}</div>
              <div class="text-xs text-base-content/70">
                {formatTime(chat.lastMessageTime)}
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="text-sm text-base-content/70 truncate">
                {chat.lastMessage}
              </div>
              {#if unread > 0}
                <div class="badge badge-primary badge-sm">{unread}</div>
              {/if}
            </div>
          </div>
        </div>
      </button>
    {/each}
  </div>
  
  <!-- オンラインユーザー -->
  <div class="p-4 border-t border-base-300">
    <div class="text-sm font-semibold mb-2">オンライン ({$onlineUsers.size})</div>
    <div class="flex gap-2 flex-wrap">
      {#each mockUsers.filter(u => $onlineUsers.has(u.id)) as user}
        <button
          class="avatar online cursor-pointer"
          onclick={(e) => showProfile(user, e)}
          title={user.name}
        >
          <div class="w-8 rounded-full">
            <img src={user.avatar} alt={user.name} />
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>

<!-- モバイル用オーバーレイ -->
{#if $isMobile && $sidebarOpen}
  <div 
    class="fixed inset-0 bg-black/50 z-40"
    onclick={() => sidebarOpen.set(false)}
  />
{/if}