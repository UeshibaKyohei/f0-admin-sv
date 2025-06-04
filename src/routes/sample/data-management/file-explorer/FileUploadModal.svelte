<script>
  import { fileStore } from './fileStore.js';
  
  let { open = false, currentPath, onComplete } = $props();
  
  let files = $state([]);
  let uploading = $state(false);
  let dragOver = $state(false);
  
  function handleFileSelect(e) {
    const selectedFiles = Array.from(e.target.files);
    files = [...files, ...selectedFiles];
  }
  
  function handleDrop(e) {
    e.preventDefault();
    dragOver = false;
    const droppedFiles = Array.from(e.dataTransfer.files);
    files = [...files, ...droppedFiles];
  }
  
  function handleDragOver(e) {
    e.preventDefault();
    dragOver = true;
  }
  
  function handleDragLeave(e) {
    e.preventDefault();
    dragOver = false;
  }
  
  function removeFile(index) {
    files = files.filter((_, i) => i !== index);
  }
  
  async function handleUpload() {
    uploading = true;
    
    for (const file of files) {
      await fileStore.uploadFile(file, currentPath);
    }
    
    uploading = false;
    files = [];
    onComplete();
  }
  
  function formatFileSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
</script>

<input type="checkbox" id="upload-modal" class="modal-toggle" bind:checked={open} />
<div class="modal">
  <div class="modal-box max-w-2xl">
    <h3 class="font-bold text-lg mb-4">ファイルのアップロード</h3>
    
    <!-- ドロップゾーン -->
    <div 
      class="border-2 border-dashed border-base-300 rounded-lg p-8 text-center mb-4 transition-colors {dragOver ? 'border-primary bg-primary/5' : ''}"
      ondrop={handleDrop}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
    >
      <svg class="w-12 h-12 mx-auto mb-4 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
      </svg>
      <p class="text-base-content/70 mb-2">ファイルをドラッグ＆ドロップ</p>
      <p class="text-sm text-base-content/50 mb-4">または</p>
      <label for="file-input" class="btn btn-primary btn-sm">
        ファイルを選択
      </label>
      <input 
        id="file-input"
        type="file" 
        multiple
        class="hidden"
        onchange={handleFileSelect}
      />
    </div>
    
    <!-- ファイルリスト -->
    {#if files.length > 0}
      <div class="space-y-2 mb-4 max-h-64 overflow-y-auto">
        {#each files as file, index}
          <div class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <div>
                <p class="font-medium text-sm">{file.name}</p>
                <p class="text-xs text-base-content/50">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button 
              class="btn btn-ghost btn-sm btn-circle"
              onclick={() => removeFile(index)}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        {/each}
      </div>
    {/if}
    
    <div class="modal-action">
      <button 
        class="btn" 
        onclick={() => {
          open = false;
          files = [];
        }}
        disabled={uploading}
      >
        キャンセル
      </button>
      <button 
        class="btn btn-primary"
        onclick={handleUpload}
        disabled={files.length === 0 || uploading}
      >
        {#if uploading}
          <span class="loading loading-spinner loading-sm"></span>
        {/if}
        アップロード
      </button>
    </div>
  </div>
  <label class="modal-backdrop" for="upload-modal">Close</label>
</div>