<script>
  import { fileStore } from './fileStore.js';
  
  let { open = false, currentPath, onComplete } = $props();
  
  let folderName = $state('');
  let error = $state('');
  let isCreating = $state(false);
  
  // モーダルが開かれた時の処理
  $effect(() => {
    if (open) {
      // モーダルが開いた時は必ず初期化
      folderName = '';
      error = '';
      isCreating = false;
    }
  });
  
  async function handleCreate() {
    // 二重送信防止
    if (isCreating) return;
    
    // バリデーション
    const trimmedName = folderName.trim();
    
    if (!trimmedName) {
      error = 'フォルダ名を入力してください';
      return;
    }
    
    if (trimmedName.includes('/')) {
      error = 'フォルダ名に / は使用できません';
      return;
    }
    
    if (trimmedName.includes('\\')) {
      error = 'フォルダ名に \\ は使用できません';
      return;
    }
    
    // 予約語のチェック
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'LPT1', '.', '..'];
    if (reservedNames.includes(trimmedName.toUpperCase())) {
      error = 'このフォルダ名は使用できません';
      return;
    }
    
    // 作成処理
    isCreating = true;
    error = '';
    
    try {
      await fileStore.createFolder(trimmedName, currentPath);
      onComplete();
    } catch (e) {
      error = 'フォルダの作成に失敗しました';
      isCreating = false;
    }
  }
  
  function handleCancel() {
    open = false;
  }
</script>

<input type="checkbox" id="create-folder-modal" class="modal-toggle" bind:checked={open} />
<div class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg mb-4">新規フォルダ</h3>
    
    <form onsubmit={(e) => e.preventDefault()}>
      <div class="form-control">
        <label class="label">
          <span class="label-text">フォルダ名</span>
        </label>
        <input 
          type="text" 
          placeholder="新しいフォルダ" 
          class="input input-bordered {error ? 'input-error' : ''}"
          bind:value={folderName}
          disabled={isCreating}
          autofocus
        />
        {#if error}
          <label class="label">
            <span class="label-text-alt text-error">{error}</span>
          </label>
        {/if}
      </div>
    </form>
    
    <div class="modal-action">
      <button 
        class="btn" 
        onclick={handleCancel}
        disabled={isCreating}
      >
        キャンセル
      </button>
      <button 
        class="btn btn-primary"
        onclick={handleCreate}
        disabled={isCreating || !folderName.trim()}
      >
        {#if isCreating}
          <span class="loading loading-spinner loading-sm"></span>
        {/if}
        作成
      </button>
    </div>
  </div>
  <label class="modal-backdrop" for="create-folder-modal">Close</label>
</div>