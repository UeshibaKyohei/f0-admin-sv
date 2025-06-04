<script>
  import { onMount } from 'svelte';
  
  let { onSend, onStop, loading = false } = $props();
  
  let message = $state('');
  let selectedFiles = $state([]);
  let textareaElement;
  
  // 外部からメッセージを設定するイベントリスナー
  onMount(() => {
    const handleSetMessage = (event) => {
      message = event.detail;
      autoResize();
      textareaElement?.focus();
    };
    
    window.addEventListener('setmessage', handleSetMessage);
    return () => window.removeEventListener('setmessage', handleSetMessage);
  });
  
  // テキストエリアの自動リサイズ
  function autoResize() {
    if (textareaElement) {
      textareaElement.style.height = 'auto';
      textareaElement.style.height = Math.min(textareaElement.scrollHeight, 200) + 'px';
    }
  }
  
  // メッセージ送信
  function handleSubmit(e) {
    e.preventDefault();
    if (message.trim() && !loading) {
      onSend(message);
      message = '';
      if (textareaElement) {
        textareaElement.style.height = 'auto';
      }
    }
  }
  
  // キーボードショートカット
  function handleKeydown(e) {
    // Ctrl+Enter または Cmd+Enter で送信
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  }
  
  // ファイル選択
  function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    selectedFiles = [...selectedFiles, ...files];
    e.target.value = '';
  }
  
  // ファイル削除
  function removeFile(index) {
    selectedFiles = selectedFiles.filter((_, i) => i !== index);
  }
</script>

<div class="border-t border-base-300 p-4 bg-base-100">
  <!-- ファイル表示 -->
  {#if selectedFiles.length > 0}
    <div class="mb-3 flex flex-wrap gap-2">
      {#each selectedFiles as file, index}
        <div class="badge badge-lg gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
          </svg>
          {file.name}
          <button 
            class="btn btn-ghost btn-xs btn-square"
            onclick={() => removeFile(index)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      {/each}
    </div>
  {/if}
  
  <form onsubmit={handleSubmit} class="flex gap-2">
    <div class="flex-1 relative">
      <textarea
        bind:this={textareaElement}
        bind:value={message}
        oninput={autoResize}
        onkeydown={handleKeydown}
        placeholder="メッセージを入力..."
        class="textarea textarea-bordered w-full min-h-[50px] max-h-[200px] pr-24 resize-none"
        rows="1"
        disabled={loading}
      ></textarea>
      
      <!-- ツールボタン -->
      <div class="absolute bottom-2 right-2 flex gap-1">
        <!-- ファイル添付 -->
        <label class="btn btn-ghost btn-xs btn-square" title="ファイル添付">
          <input 
            type="file" 
            class="hidden" 
            multiple
            onchange={handleFileSelect}
            accept="image/*,.txt,.pdf,.doc,.docx,.xls,.xlsx,.csv,.json,.xml"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
          </svg>
        </label>
      </div>
    </div>
    
    <!-- 送信/停止ボタン -->
    {#if loading}
      <button 
        type="button" 
        class="btn btn-square btn-ghost"
        onclick={onStop}
        title="停止"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
        </svg>
      </button>
    {:else}
      <button 
        type="submit" 
        class="btn btn-square btn-primary"
        disabled={!message.trim()}
        title="送信 (Ctrl+Enter / Cmd+Enter)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </button>
    {/if}
  </form>
  
  <div class="text-xs text-base-content/50 mt-2">
    Ctrl+Enter (Mac: Cmd+Enter) で送信 • ファイルをドラッグ&ドロップで添付
  </div>
</div>