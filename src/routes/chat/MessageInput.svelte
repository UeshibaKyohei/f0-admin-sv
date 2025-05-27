<script>
  import { selectedChat, currentUser, sendMessage, setTyping } from './chatStore.js';
  import { emojiList } from './mockData.js';
  
  let messageText = $state('');
  let showEmojiPicker = $state(false);
  let attachments = $state([]);
  let fileInput;
  let isTyping = false;
  let typingTimeout;
  
  // タイピング状態の管理
  function handleInput() {
    if (!isTyping && messageText.trim()) {
      isTyping = true;
      setTyping($selectedChat.id, $currentUser.id, true);
    }
    
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      if (isTyping) {
        isTyping = false;
        setTyping($selectedChat.id, $currentUser.id, false);
      }
    }, 1000);
  }
  
  // メッセージ送信
  async function handleSend() {
    if (!messageText.trim() && attachments.length === 0) return;
    
    // タイピング状態をクリア
    if (isTyping) {
      isTyping = false;
      setTyping($selectedChat.id, $currentUser.id, false);
    }
    
    // メッセージを送信
    await sendMessage(
      $selectedChat.id,
      messageText.trim(),
      'text',
      attachments
    );
    
    // 入力をクリア
    messageText = '';
    attachments = [];
    showEmojiPicker = false;
  }
  
  // キーボードショートカット
  function handleKeydown(event) {
    // Enter: 送信、Shift+Enter: 改行
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }
  
  // ファイル選択
  function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    
    const newAttachments = files.map(file => ({
      id: `file-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    
    attachments = [...attachments, ...newAttachments];
    
    // ファイル入力をリセット
    event.target.value = '';
  }
  
  // 添付ファイル削除
  function removeAttachment(id) {
    attachments = attachments.filter(a => a.id !== id);
  }
  
  // 絵文字を挿入
  function insertEmoji(emoji) {
    messageText += emoji;
    showEmojiPicker = false;
  }
  
  // ドラッグ&ドロップ
  let isDragging = $state(false);
  
  function handleDragOver(event) {
    event.preventDefault();
    isDragging = true;
  }
  
  function handleDragLeave() {
    isDragging = false;
  }
  
  function handleDrop(event) {
    event.preventDefault();
    isDragging = false;
    
    const files = Array.from(event.dataTransfer.files);
    const newAttachments = files.map(file => ({
      id: `file-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    
    attachments = [...attachments, ...newAttachments];
  }
</script>

<div 
  class={`border-t border-base-300 p-4 ${isDragging ? 'bg-primary/10' : ''}`}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
>
  <!-- 添付ファイルプレビュー -->
  {#if attachments.length > 0}
    <div class="mb-2 flex gap-2 flex-wrap">
      {#each attachments as attachment}
        <div class="badge badge-lg gap-2">
          <span class="truncate max-w-[150px]">{attachment.name}</span>
          <button 
            class="btn btn-ghost btn-xs btn-circle"
            onclick={() => removeAttachment(attachment.id)}
          >
            ✕
          </button>
        </div>
      {/each}
    </div>
  {/if}
  
  <!-- 入力エリア -->
  <div class="flex gap-2 items-end">
    <!-- ファイル添付ボタン -->
    <input 
      bind:this={fileInput}
      type="file" 
      multiple 
      class="hidden"
      onchange={handleFileSelect}
    />
    <button 
      class="btn btn-circle btn-ghost btn-sm"
      onclick={() => fileInput.click()}
      title="ファイルを添付"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
    </button>
    
    <!-- 絵文字ピッカー -->
    <div class="relative">
      <button 
        class="btn btn-circle btn-ghost btn-sm"
        onclick={() => showEmojiPicker = !showEmojiPicker}
        title="絵文字"
      >
        😊
      </button>
      
      {#if showEmojiPicker}
        <div class="absolute bottom-12 left-0 card bg-base-100 shadow-xl p-2 z-10">
          <div class="grid grid-cols-8 gap-1 max-w-xs">
            {#each emojiList as emoji}
              <button 
                class="btn btn-ghost btn-sm"
                onclick={() => insertEmoji(emoji)}
              >
                {emoji}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
    
    <!-- テキスト入力 -->
    <textarea
      bind:value={messageText}
      oninput={handleInput}
      onkeydown={handleKeydown}
      placeholder="メッセージを入力..."
      class="textarea textarea-bordered flex-1 min-h-[44px] max-h-32"
      rows="1"
    />
    
    <!-- 送信ボタン -->
    <button 
      class="btn btn-circle btn-primary btn-sm"
      onclick={handleSend}
      disabled={!messageText.trim() && attachments.length === 0}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    </button>
  </div>
  
  <!-- ドラッグ&ドロップインジケーター -->
  {#if isDragging}
    <div class="absolute inset-0 flex items-center justify-center bg-primary/20 pointer-events-none">
      <div class="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="text-lg font-semibold">ファイルをドロップ</p>
      </div>
    </div>
  {/if}
</div>

<style>
  /* テキストエリアの自動リサイズ */
  textarea {
    resize: none;
    overflow-y: auto;
  }
</style>