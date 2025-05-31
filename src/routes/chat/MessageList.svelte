<script>
  import { onMount, tick } from 'svelte';
  import { 
    selectedChat, 
    messages, 
    currentUser, 
    typingUsers,
    markAsRead,
    toggleReaction
  } from './chatStore.js';
  import { generateMockMessages, mockUsers, emojiList, fileTypeIcons, typingTexts } from './mockData.js';
  
  let messageContainer;
  let showScrollToBottom = $state(false);
  let contextMenu = $state({ show: false, x: 0, y: 0, message: null });
  let showEmojiPicker = $state(null);
  let typingAnimationIndex = $state(0);
  
  // メッセージリスト
  const chatMessages = $derived($selectedChat ? ($messages[$selectedChat.id] || []) : []);
  
  // タイピング中のユーザー
  const typingUsersInChat = $derived(
    Array.from($typingUsers.values())
      .filter(t => t.chatId === $selectedChat?.id && t.userId !== $currentUser?.id)
      .map(t => mockUsers.find(u => u.id === t.userId))
      .filter(Boolean)
  );
  
  // タイピングアニメーション
  $effect(() => {
    if (typingUsersInChat.length > 0) {
      const interval = setInterval(() => {
        typingAnimationIndex = (typingAnimationIndex + 1) % typingTexts.length;
      }, 500);
      
      return () => clearInterval(interval);
    }
  });
  
  // メッセージの送信者情報を取得
  function getSenderInfo(senderId) {
    if (senderId === 'current-user') {
      return $currentUser;
    }
    return mockUsers.find(u => u.id === senderId) || { name: '不明なユーザー' };
  }
  
  // メッセージが自分のものか判定
  function isOwnMessage(senderId) {
    return senderId === 'current-user' || senderId === $currentUser?.id;
  }
  
  // スクロール位置の監視
  function handleScroll() {
    if (messageContainer) {
      const { scrollTop, scrollHeight, clientHeight } = messageContainer;
      showScrollToBottom = scrollHeight - scrollTop - clientHeight > 100;
    }
  }
  
  // 最下部へスクロール
  function scrollToBottom() {
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }
  
  // コンテキストメニュー表示
  function showContextMenu(event, message) {
    event.preventDefault();
    contextMenu = {
      show: true,
      x: event.clientX,
      y: event.clientY,
      message
    };
  }
  
  // コンテキストメニューを閉じる
  function hideContextMenu() {
    contextMenu.show = false;
  }
  
  // メッセージをコピー
  function copyMessage(message) {
    navigator.clipboard.writeText(message.content);
    hideContextMenu();
  }
  
  // メッセージを削除（実際は削除フラグを立てる）
  function deleteMessage(message) {
    console.log('メッセージを削除:', message.id);
    hideContextMenu();
  }
  
  // リアクション追加
  function addReaction(messageId, emoji) {
    toggleReaction($selectedChat.id, messageId, emoji);
    showEmojiPicker = null;
  }
  
  // タイムスタンプのフォーマット
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString('ja-JP', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // ファイルサイズのフォーマット
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
  
  onMount(() => {
    // モックメッセージを設定
    const mockMessages = generateMockMessages();
    messages.set(mockMessages);
    
    // 初期スクロール
    tick().then(scrollToBottom);
    
    // 未読メッセージを既読にする
    if ($selectedChat && chatMessages.length > 0) {
      const unreadMessageIds = chatMessages
        .filter(msg => !msg.readBy.includes('current-user'))
        .map(msg => msg.id);
      
      if (unreadMessageIds.length > 0) {
        setTimeout(() => {
          markAsRead($selectedChat.id, unreadMessageIds);
        }, 1000);
      }
    }
    
    // クリックイベントでコンテキストメニューを閉じる
    document.addEventListener('click', hideContextMenu);
    
    return () => {
      document.removeEventListener('click', hideContextMenu);
    };
  });
  
  // チャット切り替え時にスクロール
  $effect(() => {
    if ($selectedChat) {
      tick().then(scrollToBottom);
    }
  });
</script>

<div 
  bind:this={messageContainer}
  class="flex-1 overflow-y-auto p-4 space-y-4"
  onscroll={handleScroll}
>
  {#each chatMessages as message, i (message.id)}
    {@const sender = getSenderInfo(message.senderId)}
    {@const isOwn = isOwnMessage(message.senderId)}
    {@const showAvatar = !isOwn && (i === 0 || chatMessages[i-1]?.senderId !== message.senderId)}
    
    <div 
      class={`chat ${isOwn ? 'chat-end' : 'chat-start'}`}
      oncontextmenu={(e) => showContextMenu(e, message)}
    >
      {#if showAvatar}
        <div class="chat-image avatar">
          <div class="w-10 rounded-full">
            <img src={sender.avatar} alt={sender.name} />
          </div>
        </div>
      {/if}
      
      <div class="chat-header">
        {#if !isOwn && showAvatar}
          {sender.name}
        {/if}
        <time class="text-xs opacity-50 ml-1">{formatTimestamp(message.timestamp)}</time>
      </div>
      
      <div class={`chat-bubble ${isOwn ? 'chat-bubble-primary' : ''} relative group`}>
        {message.content}
        
        <!-- ファイル添付 -->
        {#if message.attachments?.length > 0}
          <div class="mt-2 space-y-1">
            {#each message.attachments as file}
              <div class="flex items-center gap-2 p-2 bg-base-200 rounded">
                <span class="text-2xl">
                  {fileTypeIcons[file.type] || fileTypeIcons.default}
                </span>
                <div class="flex-1">
                  <div class="text-sm font-medium">{file.name}</div>
                  <div class="text-xs opacity-70">{formatFileSize(file.size)}</div>
                </div>
                <button class="btn btn-circle btn-ghost btn-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            {/each}
          </div>
        {/if}
        
        <!-- リアクション -->
        {#if message.reactions?.length > 0}
          <div class="flex gap-1 mt-2 flex-wrap">
            {#each message.reactions as reaction}
              <button 
                class="btn btn-xs"
                onclick={() => addReaction(message.id, reaction.emoji)}
              >
                {reaction.emoji}
                {#if message.reactions.filter(r => r.emoji === reaction.emoji).length > 1}
                  <span class="ml-1">
                    {message.reactions.filter(r => r.emoji === reaction.emoji).length}
                  </span>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
        
        <!-- リアクション追加ボタン -->
        <button 
          class="absolute -right-8 top-0 btn btn-circle btn-ghost btn-xs opacity-0 group-hover:opacity-100 transition-opacity"
          onclick={() => showEmojiPicker = showEmojiPicker === message.id ? null : message.id}
        >
          😊
        </button>
      </div>
      
      <div class="chat-footer opacity-50">
        {#if message.readBy.length > 1}
          既読 {message.readBy.length - 1}
        {/if}
      </div>
    </div>
    
    <!-- 絵文字ピッカー -->
    {#if showEmojiPicker === message.id}
      <div class="card bg-base-100 shadow-xl p-2 ml-12 max-w-xs">
        <div class="grid grid-cols-8 gap-1">
          {#each emojiList as emoji}
            <button 
              class="btn btn-ghost btn-sm"
              onclick={() => addReaction(message.id, emoji)}
            >
              {emoji}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  {/each}
  
  <!-- タイピングインジケーター -->
  {#if typingUsersInChat.length > 0}
    <div class="chat chat-start">
      <div class="chat-image avatar">
        <div class="w-10 rounded-full">
          <img src={typingUsersInChat[0].avatar} alt={typingUsersInChat[0].name} />
        </div>
      </div>
      <div class="chat-bubble">
        <span class="loading loading-dots loading-sm"></span>
      </div>
    </div>
  {/if}
</div>

<!-- スクロールトゥボトムボタン -->
{#if showScrollToBottom}
  <button 
    class="btn btn-circle btn-primary absolute bottom-20 right-8 shadow-lg"
    onclick={scrollToBottom}
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  </button>
{/if}

<!-- コンテキストメニュー -->
{#if contextMenu.show}
  <ul 
    class="menu bg-base-100 shadow-lg rounded-box fixed z-50"
    style={`left: ${contextMenu.x}px; top: ${contextMenu.y}px;`}
  >
    <li><button onclick={() => copyMessage(contextMenu.message)}>コピー</button></li>
    {#if isOwnMessage(contextMenu.message.senderId)}
      <li><button>編集</button></li>
      <li><button onclick={() => deleteMessage(contextMenu.message)} class="text-error">削除</button></li>
    {/if}
    <li><button>転送</button></li>
    <li><button>ピン留め</button></li>
  </ul>
{/if}