<script>
  import { onMount } from 'svelte';
  
  let { onSend, onStop, loading = false } = $props();
  
  let message = $state('');
  let selectedFiles = $state([]);
  let inputElement;
  let isComposing = $state(false);
  
  // 外部からメッセージを設定するイベントリスナー
  onMount(() => {
    const handleSetMessage = (event) => {
      message = event.detail;
      inputElement?.focus();
    };
    
    window.addEventListener('setmessage', handleSetMessage);
    return () => window.removeEventListener('setmessage', handleSetMessage);
  });
  
  // メッセージ送信
  function handleSubmit(e) {
    e?.preventDefault();
    if (message.trim() && !loading && !isComposing) {
      onSend(message);
      message = '';
    }
  }
  
  // キーボードショートカット
  function handleKeydown(e) {
    // Enter で送信（日本語入力中でない場合）
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit();
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
  
  <form onsubmit={handleSubmit} class="space-y-2">
    <!-- DaisyUI v5 推奨のinput構造 -->
    <label class="input input-bordered flex items-center gap-2 pr-2">
      <!-- ファイル添付アイコン -->
      <label class="cursor-pointer opacity-70 hover:opacity-100 transition-opacity" title="ファイル添付">
        <input 
          type="file" 
          class="hidden" 
          multiple
          onchange={handleFileSelect}
          accept="image/*,.txt,.pdf,.doc,.docx,.xls,.xlsx,.csv,.json,.xml"
          disabled={loading}
        />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4">
          <path fill-rule="evenodd" d="M2 4a2 2 0 0 1 2-2h5.293a1 1 0 0 1 .707.293l4.707 4.707A1 1 0 0 1 15 7.707V12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm5.5 1.5a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2h-2v2a1 1 0 1 1-2 0v-2h-2a1 1 0 1 1 0-2h2v-2a1 1 0 0 1 1-1Z" clip-rule="evenodd" />
        </svg>
      </label>
      
      <!-- 入力フィールド -->
      <input 
        type="text"
        bind:this={inputElement}
        bind:value={message}
        onkeydown={handleKeydown}
        oncompositionstart={() => isComposing = true}
        oncompositionend={() => isComposing = false}
        placeholder="メッセージを入力..."
        class="grow"
        disabled={loading}
      />
      
      <!-- キーボードショートカット表示（オプション） -->
      {#if !message && !loading}
        <kbd class="kbd kbd-sm">Enter</kbd>
      {/if}
      
      <!-- 送信/停止ボタン -->
      {#if loading}
        <button 
          type="button" 
          class="btn btn-ghost btn-sm btn-square"
          onclick={onStop}
          title="停止"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4">
            <path d="M5.5 3.5A1.5 1.5 0 0 1 7 2h2a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 9 14H7a1.5 1.5 0 0 1-1.5-1.5v-9Z" />
          </svg>
        </button>
      {:else}
        <button 
          type="submit" 
          class="btn btn-primary btn-sm btn-square"
          disabled={!message.trim()}
          title="送信 (Enter)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4">
            <path d="M1.756 4.568A1.5 1.5 0 0 0 1 5.871v.984c0 .332.228.623.549.701a18.009 18.009 0 0 0 5.373.639 10.77 10.77 0 0 1-.006 2.224 17.95 17.95 0 0 0-5.368.639c-.32.078-.548.369-.548.701v.984a1.5 1.5 0 0 0 2.244 1.303l9.5-5.5a1.5 1.5 0 0 0 0-2.593l-9.5-5.5a1.5 1.5 0 0 0-1.488.065Z" />
          </svg>
        </button>
      {/if}
    </label>
  </form>
  
  <div class="text-xs text-base-content/50 mt-2 flex items-center gap-2">
    <span>Enter で送信</span>
    <span>•</span>
    <span>Shift+Enter で改行</span>
    <span>•</span>
    <span>ファイルをドラッグ&ドロップで添付</span>
  </div>
</div>

<style>
  /* カスタムスタイル（スコープ付き） */
  .input:focus-within {
    @apply ring-2 ring-primary/20;
  }
</style>