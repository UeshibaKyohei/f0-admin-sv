<script>
  import { onMount } from 'svelte';
  import FolderTree from './FolderTree.svelte';
  import FileList from './FileList.svelte';
  import Toolbar from './Toolbar.svelte';
  import FileUploadModal from './FileUploadModal.svelte';
  import CreateFolderModal from './CreateFolderModal.svelte';
  import RenameModal from './RenameModal.svelte';
  import DeleteConfirmModal from './DeleteConfirmModal.svelte';
  import FilePreviewModal from './FilePreviewModal.svelte';
  import { fileStore, storageInfo } from './fileStore.js';

  let currentPath = $state('/');
  let selectedItems = $state([]);
  let viewMode = $state('grid'); // grid or list
  let sortBy = $state('name'); // name, date, size
  let searchQuery = $state('');
  let showUploadModal = $state(false);
  let showCreateFolderModal = $state(false);
  let showRenameModal = $state(false);
  let showDeleteModal = $state(false);
  let showPreviewModal = $state(false);
  let previewFile = $state(null);
  let renameItem = $state(null);
  let deleteItems = $state([]);
  let isDraggingOver = $state(false);

  // 現在のパスのファイル一覧を取得
  const currentFiles = $derived.by(() => {
    const files = $fileStore;
    return files.filter(file => {
      const parentPath = file.path.substring(0, file.path.lastIndexOf('/'));
      return parentPath === currentPath || (currentPath === '/' && parentPath === '');
    }).filter(file => {
      if (!searchQuery) return true;
      return file.name.toLowerCase().includes(searchQuery.toLowerCase());
    }).sort((a, b) => {
      // フォルダを先に表示
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.modified) - new Date(a.modified);
        case 'size':
          return (b.size || 0) - (a.size || 0);
        default:
          return 0;
      }
    });
  });

  // パスのパンくずリストを生成
  const breadcrumbs = $derived.by(() => {
    if (currentPath === '/') return [{ name: 'ホーム', path: '/' }];
    const parts = currentPath.split('/').filter(Boolean);
    const crumbs = [{ name: 'ホーム', path: '/' }];
    let path = '';
    for (const part of parts) {
      path += '/' + part;
      crumbs.push({ name: part, path });
    }
    return crumbs;
  });

  function handleNavigate(path) {
    currentPath = path;
    selectedItems = [];
  }

  function handleSelect(item, isMultiple = false) {
    if (isMultiple) {
      const index = selectedItems.findIndex(i => i.id === item.id);
      if (index >= 0) {
        selectedItems = selectedItems.filter(i => i.id !== item.id);
      } else {
        selectedItems = [...selectedItems, item];
      }
    } else {
      selectedItems = [item];
    }
  }

  function handleOpen(item) {
    if (item.type === 'folder') {
      handleNavigate(item.path);
    } else {
      previewFile = item;
      showPreviewModal = true;
    }
  }

  function handleCreateFolder() {
    showCreateFolderModal = true;
  }

  function handleUpload() {
    showUploadModal = true;
  }

  function handleRename() {
    if (selectedItems.length === 1) {
      renameItem = selectedItems[0];
      showRenameModal = true;
    }
  }

  function handleDelete() {
    if (selectedItems.length > 0) {
      deleteItems = selectedItems;
      showDeleteModal = true;
    }
  }

  function handleDownload() {
    selectedItems.forEach(item => {
      if (item.type !== 'folder') {
        fileStore.downloadFile(item.id);
      }
    });
  }

  // ドラッグ&ドロップ処理
  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    isDraggingOver = true;
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    // ドラッグが子要素に移動した場合は無視
    if (e.currentTarget.contains(e.relatedTarget)) return;
    isDraggingOver = false;
  }

  async function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    isDraggingOver = false;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // ファイルをアップロード
      for (const file of files) {
        await fileStore.uploadFile(file, currentPath);
      }
    }
  }

  onMount(async () => {
    // 初期データをロード
    await fileStore.initialize();
  });
</script>

<!-- DaisyUIのコンテナとカードコンポーネントを使用 -->
<div class="min-h-full flex flex-col">
  <!-- メインレイアウト -->
  <div class="flex flex-1">
    <!-- 左サイドバー -->
    <aside class="w-64 bg-base-100 border-r border-base-300">
      <div class="flex flex-col h-full">
        <!-- ヘッダー -->
        <header class="p-4 border-b border-base-300">
          <h2 class="text-xl font-bold flex items-center gap-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
            </svg>
            ファイルマネージャー
          </h2>
        </header>

        <!-- フォルダツリー -->
        <div class="flex-1 overflow-y-auto p-4">
          <FolderTree 
            files={$fileStore} 
            {currentPath} 
            onNavigate={handleNavigate} 
          />
        </div>

        <!-- ストレージ情報 -->
        <footer class="p-4 border-t border-base-300">
          <div class="space-y-2">
            <div class="text-sm text-base-content/70">ストレージ使用状況</div>
            <progress class="progress progress-primary w-full" value={$storageInfo.percentage} max="100"></progress>
            <div class="text-xs text-base-content/50">{$storageInfo.usedFormatted} / {$storageInfo.totalFormatted}</div>
          </div>
        </footer>
      </div>
    </aside>

    <!-- メインコンテンツ -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- ツールバー -->
      <Toolbar 
        {selectedItems}
        {viewMode}
        {sortBy}
        bind:searchQuery
        onViewModeChange={(mode) => viewMode = mode}
        onSortChange={(sort) => sortBy = sort}
        onCreateFolder={handleCreateFolder}
        onUpload={handleUpload}
        onRename={handleRename}
        onDelete={handleDelete}
        onDownload={handleDownload}
      />

      <!-- パンくずリスト -->
      <nav class="px-6 py-2 bg-base-100 border-b border-base-300">
        <div class="breadcrumbs text-sm">
          <ul>
            {#each breadcrumbs as crumb, i}
              <li>
                {#if i < breadcrumbs.length - 1}
                  <button 
                    class="link link-hover"
                    onclick={() => handleNavigate(crumb.path)}
                  >
                    {crumb.name}
                  </button>
                {:else}
                  <span class="font-medium">{crumb.name}</span>
                {/if}
              </li>
            {/each}
          </ul>
        </div>
      </nav>

      <!-- ファイルリスト -->
      <div 
        class="flex-1 overflow-y-auto bg-base-100 relative"
        ondragover={handleDragOver}
        ondragleave={handleDragLeave}
        ondrop={handleDrop}
        role="region"
        aria-label="ファイルリスト"
      >
        <FileList 
          files={currentFiles}
          {selectedItems}
          {viewMode}
          onSelect={handleSelect}
          onOpen={handleOpen}
        />
        
        <!-- ドラッグオーバー時のオーバーレイ -->
        {#if isDraggingOver}
          <div class="absolute inset-0 bg-primary/10 backdrop-blur-sm flex items-center justify-center pointer-events-none z-10">
            <div class="bg-base-100 rounded-box p-8 shadow-xl border-2 border-dashed border-primary">
              <div class="text-center">
                <svg class="w-16 h-16 mx-auto mb-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p class="text-lg font-semibold">ファイルをドロップしてアップロード</p>
                <p class="text-sm text-base-content/70 mt-2">現在のフォルダ: {currentPath}</p>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<!-- モーダル -->
<FileUploadModal 
  bind:open={showUploadModal} 
  {currentPath}
  onComplete={() => {
    showUploadModal = false;
  }}
/>

<CreateFolderModal 
  bind:open={showCreateFolderModal} 
  {currentPath}
  onComplete={() => {
    showCreateFolderModal = false;
  }}
/>

<RenameModal 
  bind:open={showRenameModal} 
  item={renameItem}
  onComplete={() => {
    showRenameModal = false;
    renameItem = null;
  }}
/>

<DeleteConfirmModal 
  bind:open={showDeleteModal} 
  items={deleteItems}
  onComplete={() => {
    showDeleteModal = false;
    deleteItems = [];
    selectedItems = [];
  }}
/>

<FilePreviewModal
  bind:open={showPreviewModal}
  file={previewFile}
  onClose={() => {
    showPreviewModal = false;
    previewFile = null;
  }}
/>