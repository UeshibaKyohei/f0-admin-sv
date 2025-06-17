<script>
  let { 
    selectedItems = [], 
    viewMode = 'grid', 
    sortBy = 'name',
    searchQuery = '',
    onViewModeChange,
    onSortChange,
    onCreateFolder,
    onUpload,
    onRename,
    onDelete,
    onDownload
  } = $props();
</script>

<div class="bg-base-100 border-b border-base-300">
  <div class="flex items-center justify-between px-6 py-3 gap-4">
    <!-- 左側: 常時表示ボタン -->
    <div class="flex items-center gap-2">
      <button class="btn btn-primary btn-sm gap-2" onclick={onUpload}>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        アップロード
      </button>
      
      <button class="btn btn-sm gap-2" onclick={onCreateFolder}>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
        </svg>
        新規フォルダ
      </button>
    </div>

    <!-- 中央: 選択時のアクション -->
    {#if selectedItems.length > 0}
      <div class="flex items-center gap-2">
        <button 
          class="btn btn-sm gap-2" 
          onclick={onDownload}
          disabled={selectedItems.some(item => item.type === 'folder')}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
          ダウンロード
        </button>
        
        <button 
          class="btn btn-sm gap-2" 
          onclick={onRename}
          disabled={selectedItems.length !== 1}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          名前変更
        </button>
        
        <button class="btn btn-sm btn-error gap-2" onclick={onDelete}>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          削除
        </button>
      </div>
    {/if}

    <!-- 右側: 検索・表示オプション -->
    <div class="flex items-center gap-2">
      <!-- 検索 -->
      <div class="relative">
        <input 
          type="text" 
          placeholder="検索" 
          class="input input-bordered input-sm w-48 pr-10"
          bind:value={searchQuery}
        />
        <svg class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      
      <!-- ソート -->
      <select 
        class="select select-bordered select-sm"
        value={sortBy}
        onchange={(e) => onSortChange(e.target.value)}
      >
        <option value="name">名前</option>
        <option value="date">更新日</option>
        <option value="size">サイズ</option>
      </select>
      
      <!-- 表示モード -->
      <div class="btn-group">
        <button 
          class="btn btn-sm {viewMode === 'grid' ? 'btn-active' : ''}"
          onclick={() => onViewModeChange('grid')}
          aria-label="グリッド表示"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
          </svg>
        </button>
        <button 
          class="btn btn-sm {viewMode === 'list' ? 'btn-active' : ''}"
          onclick={() => onViewModeChange('list')}
          aria-label="リスト表示"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>

</div>