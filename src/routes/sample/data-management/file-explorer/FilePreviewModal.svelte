<script>
  import { formatFileSize, getFileIcon } from './fileStore.js';
  
  let { open = false, file = null, onClose } = $props();
  
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  function canPreview(file) {
    if (!file) return false;
    const ext = file.name.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'txt', 'md', 'json', 'js', 'css', 'html'].includes(ext);
  }
</script>

<input type="checkbox" id="preview-modal" class="modal-toggle" bind:checked={open} />
<div class="modal">
  <div class="modal-box max-w-4xl">
    {#if file}
      <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        {file.name}
      </h3>
      
      <!-- ファイル情報 -->
      <div class="grid grid-cols-2 gap-4 mb-6 p-4 bg-base-200 rounded-lg">
        <div>
          <p class="text-sm text-base-content/70">サイズ</p>
          <p class="font-medium">{formatFileSize(file.size)}</p>
        </div>
        <div>
          <p class="text-sm text-base-content/70">種類</p>
          <p class="font-medium">{file.mimeType || 'ファイル'}</p>
        </div>
        <div>
          <p class="text-sm text-base-content/70">作成日</p>
          <p class="font-medium">{formatDate(file.created)}</p>
        </div>
        <div>
          <p class="text-sm text-base-content/70">更新日</p>
          <p class="font-medium">{formatDate(file.modified)}</p>
        </div>
      </div>
      
      <!-- プレビューエリア -->
      {#if canPreview(file)}
        <div class="border border-base-300 rounded-lg p-4 mb-4 bg-base-100">
          {#if file.mimeType?.startsWith('image/')}
            <img 
              src="/api/placeholder/600/400" 
              alt={file.name}
              class="max-w-full mx-auto"
            />
          {:else}
            <pre class="text-sm overflow-auto max-h-96"><code>// ファイルの内容をここに表示
// 実際の実装では、ファイルの内容を読み込んで表示します
{file.data || 'サンプルテキストコンテンツ'}</code></pre>
          {/if}
        </div>
      {:else}
        <div class="text-center py-12 text-base-content/50">
          <svg class="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p>このファイルはプレビューできません</p>
        </div>
      {/if}
    {/if}
    
    <div class="modal-action">
      <button class="btn" onclick={onClose}>
        閉じる
      </button>
    </div>
  </div>
  <label class="modal-backdrop" for="preview-modal">Close</label>
</div>