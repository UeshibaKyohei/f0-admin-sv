<script>
  import { fileStore } from './fileStore.js';
  
  let { open = false, item = null, onComplete } = $props();
  
  let newName = $state('');
  let error = $state('');
  let isRenaming = $state(false);
  
  // モーダルが開かれた時、またはアイテムが変更された時の処理
  $effect(() => {
    if (open && item) {
      // モーダルが開いた時は元の名前をセット
      newName = item.name;
      error = '';
      isRenaming = false;
    }
  });
  
  async function handleRename() {
    // 二重送信防止
    if (isRenaming || !item) return;
    
    // バリデーション
    const trimmedName = newName.trim();
    
    if (!trimmedName) {
      error = '名前を入力してください';
      return;
    }
    
    if (trimmedName === item.name) {
      // 名前が変更されていない場合は何もしない
      onComplete();
      return;
    }
    
    if (trimmedName.includes('/')) {
      error = '名前に / は使用できません';
      return;
    }
    
    if (trimmedName.includes('\\')) {
      error = '名前に \\ は使用できません';
      return;
    }
    
    // 予約語のチェック（フォルダの場合のみ）
    if (item.type === 'folder') {
      const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'LPT1', '.', '..'];
      const nameWithoutExt = trimmedName.split('.')[0];
      if (reservedNames.includes(nameWithoutExt.toUpperCase())) {
        error = 'この名前は使用できません';
        return;
      }
    }
    
    // リネーム処理
    isRenaming = true;
    error = '';
    
    try {
      await fileStore.rename(item.id, trimmedName);
      onComplete();
    } catch (e) {
      error = '名前の変更に失敗しました';
      isRenaming = false;
    }
  }
  
  function handleCancel() {
    open = false;
  }
</script>

<input type="checkbox" id="rename-modal" class="modal-toggle" bind:checked={open} />
<div class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg mb-4">名前の変更</h3>
    
    {#if item}
      <form onsubmit={(e) => e.preventDefault()}>
        <div class="form-control">
          <label class="label">
            <span class="label-text">新しい名前</span>
          </label>
          <input 
            type="text" 
            class="input input-bordered {error ? 'input-error' : ''}"
            bind:value={newName}
            disabled={isRenaming}
            autofocus
          />
          {#if error}
            <label class="label">
              <span class="label-text-alt text-error">{error}</span>
            </label>
          {/if}
        </div>
      </form>
    {/if}
    
    <div class="modal-action">
      <button 
        class="btn" 
        onclick={handleCancel}
        disabled={isRenaming}
      >
        キャンセル
      </button>
      <button 
        class="btn btn-primary"
        onclick={handleRename}
        disabled={isRenaming || !newName.trim() || !item}
      >
        {#if isRenaming}
          <span class="loading loading-spinner loading-sm"></span>
        {/if}
        変更
      </button>
    </div>
  </div>
  <label class="modal-backdrop" for="rename-modal">Close</label>
</div>