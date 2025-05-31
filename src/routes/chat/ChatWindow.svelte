<script>
  import { selectedChat, currentUser, onlineUsers, sidebarOpen, isMobile } from './chatStore.js';
  import MessageList from './MessageList.svelte';
  import MessageInput from './MessageInput.svelte';
  import { mockUsers } from './mockData.js';
  
  let showChatInfo = $state(false);
  
  // チャット参加者の情報を取得
  const chatParticipants = $derived(
    $selectedChat ? $selectedChat.participants
      .map(id => mockUsers.find(u => u.id === id) || { id, name: '不明なユーザー' })
      .filter(u => u.id !== $currentUser?.id) : []
  );
  
  // チャットのオンライン状態
  const isOnline = $derived(
    $selectedChat?.type === 'direct' && 
    $onlineUsers.has($selectedChat.participants.find(p => p !== $currentUser?.id))
  );
</script>

<div class="flex flex-col h-full">
  <!-- チャットヘッダー -->
  <div class="navbar bg-base-100 border-b border-base-300 px-4">
    <div class="navbar-start">
      {#if $isMobile}
        <button 
          class="btn btn-circle btn-ghost btn-sm"
          onclick={() => sidebarOpen.set(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      {/if}
      
      <div class="flex items-center gap-3 ml-2">
        {#if $selectedChat}
          <!-- アバター -->
          {#if $selectedChat.type === 'direct'}
            <div class={`avatar ${isOnline ? 'online' : 'offline'}`}>
              <div class="w-10 rounded-full">
                <img src={$selectedChat.avatar} alt={$selectedChat.name} />
              </div>
            </div>
          {:else}
            <div class="avatar-group -space-x-6">
              {#each chatParticipants.slice(0, 3) as user}
                <div class="avatar">
                  <div class="w-8">
                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} />
                  </div>
                </div>
              {/each}
            </div>
          {/if}
          
          <!-- チャット名とステータス -->
          <div>
            <h3 class="font-semibold">{$selectedChat.name}</h3>
            {#if $selectedChat.type === 'direct'}
              <p class="text-sm text-base-content/70">
                {isOnline ? 'オンライン' : 'オフライン'}
              </p>
            {:else}
              <p class="text-sm text-base-content/70">
                {$selectedChat.participants.length}人のメンバー
              </p>
            {/if}
          </div>
        {/if}
      </div>
    </div>
    
    <div class="navbar-end">
      <!-- 音声通話 -->
      <button class="btn btn-circle btn-ghost btn-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </button>
      
      <!-- ビデオ通話 -->
      <button class="btn btn-circle btn-ghost btn-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
      
      <!-- チャット情報 -->
      <button 
        class="btn btn-circle btn-ghost btn-sm"
        onclick={() => showChatInfo = !showChatInfo}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  </div>
  
  <!-- メッセージエリア -->
  <div class="flex-1 flex">
    <div class="flex-1 flex flex-col">
      <!-- メッセージリスト -->
      <MessageList />
      
      <!-- メッセージ入力 -->
      <MessageInput />
    </div>
    
    <!-- チャット情報サイドバー -->
    {#if showChatInfo}
      <div class="w-80 border-l border-base-300 bg-base-100 p-4 overflow-y-auto">
        <h3 class="font-semibold mb-4">チャット情報</h3>
        
        {#if $selectedChat?.type === 'group'}
          <!-- メンバー一覧 -->
          <div class="mb-6">
            <h4 class="text-sm font-semibold mb-2">メンバー ({$selectedChat.participants.length})</h4>
            <div class="space-y-2">
              {#each $selectedChat.participants as participantId}
                {@const user = mockUsers.find(u => u.id === participantId) || { id: participantId, name: participantId === 'current-user' ? $currentUser?.name : '不明' }}
                {@const isOnline = $onlineUsers.has(participantId) || participantId === 'current-user'}
                <div class="flex items-center gap-2">
                  <div class={`avatar ${isOnline ? 'online' : 'offline'}`}>
                    <div class="w-8 rounded-full">
                      <img 
                        src={user.avatar || (participantId === 'current-user' ? $currentUser?.avatar : `https://ui-avatars.com/api/?name=${user.name}`)} 
                        alt={user.name} 
                      />
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="text-sm font-medium">
                      {participantId === 'current-user' ? $currentUser?.name : user.name}
                      {#if participantId === 'current-user'}
                        <span class="badge badge-primary badge-xs ml-1">あなた</span>
                      {/if}
                    </div>
                    {#if user.role}
                      <div class="text-xs text-base-content/70">{user.role}</div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
        
        <!-- 共有ファイル -->
        <div class="mb-6">
          <h4 class="text-sm font-semibold mb-2">共有ファイル</h4>
          <div class="text-sm text-base-content/70">ファイルはありません</div>
        </div>
        
        <!-- 設定 -->
        <div class="space-y-2">
          <label class="flex items-center justify-between cursor-pointer">
            <span class="text-sm">通知をミュート</span>
            <input type="checkbox" class="toggle toggle-sm" />
          </label>
          
          {#if $selectedChat?.type === 'direct'}
            <button class="btn btn-sm btn-error btn-outline w-full">
              ユーザーをブロック
            </button>
          {:else}
            <button class="btn btn-sm btn-error btn-outline w-full">
              チャットを退出
            </button>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>