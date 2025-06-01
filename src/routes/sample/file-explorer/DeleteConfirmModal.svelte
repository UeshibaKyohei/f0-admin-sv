<script>
  import { fileStore } from './fileStore.js';
  
  let { open = false, items = [], onComplete } = $props();
  
  let isDeleting = $state(false);
  
  async function handleDelete() {
    if (isDeleting) return;
    
    isDeleting = true;
    
    try {
      const ids = items.map(item => item.id);
      await fileStore.delete(ids);
      onComplete();
    } catch (error) {
      console.error('Failed to delete items:', error);
      isDeleting = false;
      // エラーハンドリング - 必要に応じてエラーメッセージを表示
    }
  }
</script>

<input type="checkbox" id="delete-modal" class="modal-toggle" bind:checked={open} />
<div class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg mb-4">削除の確認</h3>
    
    <p class="mb-4">
      {#if items.length === 1}
        「{items[0].name}」を削除してもよろしいですか？
      {:else}
        {items.length}個のアイテムを削除してもよろしいですか？
      {/if}
    </p>
    
    {#if items.some(item => item.type === 'folder')}
      <div class="alert alert-warning mb-4">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <span>フォルダを削除すると、中のファイルもすべて削除されます。</span>
      </div>
    {/if}
    
    <div class="modal-action">
      <button 
        class="btn" 
        onclick={() => open = false}
        disabled={isDeleting}
      >
        キャンセル
      </button>
      <button 
        class="btn btn-error" 
        onclick={handleDelete}
        disabled={isDeleting}
      >
        {#if isDeleting}
          <span class="loading loading-spinner loading-sm"></span>
        {/if}
        削除
      </button>
    </div>
  </div>
  <label class="modal-backdrop" for="delete-modal">Close</label>
</div>