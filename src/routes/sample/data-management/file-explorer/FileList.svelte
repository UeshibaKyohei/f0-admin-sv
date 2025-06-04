<script>
  import { formatFileSize, getFileIcon, fileStore } from './fileStore.js';
  
  let { files = [], selectedItems = [], viewMode = 'grid', onSelect, onOpen } = $props();
  
  let draggedItem = $state(null);
  let dragOverFolder = $state(null);
  
  function handleClick(e, file) {
    if (e.ctrlKey || e.metaKey) {
      onSelect(file, true);
    } else {
      onSelect(file, false);
    }
  }
  
  function handleDoubleClick(file) {
    onOpen(file);
  }
  
  function isSelected(file) {
    return selectedItems.some(item => item.id === file.id);
  }
  
  // ドラッグ&ドロップ処理
  function handleDragStart(e, file) {
    draggedItem = file;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', file.id);
  }
  
  function handleDragOver(e, file) {
    e.preventDefault();
    if (file.type === 'folder' && draggedItem && draggedItem.id !== file.id) {
      e.dataTransfer.dropEffect = 'move';
      dragOverFolder = file.id;
    }
  }
  
  function handleDragLeave(e) {
    dragOverFolder = null;
  }
  
  function handleDrop(e, targetFolder) {
    e.preventDefault();
    
    if (draggedItem && targetFolder.type === 'folder' && draggedItem.id !== targetFolder.id) {
      // 親フォルダへの移動を防ぐ
      if (!draggedItem.path.startsWith(targetFolder.path + '/')) {
        fileStore.move(draggedItem.id, targetFolder.path);
      }
    }
    
    draggedItem = null;
    dragOverFolder = null;
  }
  
  function handleDragEnd() {
    draggedItem = null;
    dragOverFolder = null;
  }
  
  function getIconComponent(iconType) {
    switch (iconType) {
      case 'folder':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>`;
      case 'image':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>`;
      case 'pdf':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>`;
      case 'word':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>`;
      case 'excel':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>`;
      case 'powerpoint':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>`;
      default:
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>`;
    }
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) { // 24時間以内
      return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 604800000) { // 1週間以内
      return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
    } else {
      return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric' });
    }
  }
</script>

{#if files.length === 0}
  <div class="flex flex-col items-center justify-center h-full text-base-content/50">
    <svg class="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
    </svg>
    <p class="text-lg font-medium">フォルダは空です</p>
    <p class="text-sm mt-1">ファイルをドラッグ＆ドロップするか、アップロードボタンを使用してください</p>
  </div>
{:else if viewMode === 'grid'}
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 p-6">
    {#each files as file}
      <button
        class="group relative flex flex-col items-center p-4 rounded-lg hover:bg-base-200 transition-all cursor-pointer {isSelected(file) ? 'shadow-lg shadow-primary/20 bg-base-200' : ''} {dragOverFolder === file.id ? 'bg-base-200 shadow-lg shadow-primary/30' : ''}"
        onclick={(e) => handleClick(e, file)}
        ondblclick={() => handleDoubleClick(file)}
        draggable="true"
        ondragstart={(e) => handleDragStart(e, file)}
        ondragover={(e) => handleDragOver(e, file)}
        ondragleave={handleDragLeave}
        ondrop={(e) => handleDrop(e, file)}
        ondragend={handleDragEnd}
      >
        <!-- ダウンロードアイコン -->
        {#if isSelected(file)}
          <button 
            class="absolute top-2 right-2 btn btn-circle btn-xs btn-primary"
            onclick={(e) => {
              e.stopPropagation();
              fileStore.downloadFile(file.id);
            }}
            title="ダウンロード"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
          </button>
        {/if}
        
        <!-- アイコン -->
        <div class="w-16 h-16 mb-2 flex items-center justify-center">
          <svg class="w-12 h-12 {file.type === 'folder' ? 'text-primary' : 'text-base-content/50'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {@html getIconComponent(getFileIcon(file))}
          </svg>
        </div>
        
        <!-- ファイル名 -->
        <span class="text-sm text-center line-clamp-2">{file.name}</span>
        
        <!-- スター（フォルダのみ） -->
        {#if file.starred && file.type === 'folder'}
          <button 
            class="absolute top-2 left-2 btn btn-circle btn-xs btn-ghost"
            onclick={(e) => {
              e.stopPropagation();
              fileStore.toggleStar(file.id);
            }}
            title="お気に入りから削除"
          >
            <svg class="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
          </button>
        {:else if file.type === 'folder'}
          <button 
            class="absolute top-2 left-2 btn btn-circle btn-xs btn-ghost opacity-0 group-hover:opacity-100 transition-opacity"
            onclick={(e) => {
              e.stopPropagation();
              fileStore.toggleStar(file.id);
            }}
            title="お気に入りに追加"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
            </svg>
          </button>
        {/if}
      </button>
    {/each}
  </div>
{:else}
  <div class="overflow-x-auto">
    <table class="table table-zebra">
      <thead>
        <tr>
          <th class="w-8"></th>
          <th>名前</th>
          <th>変更日</th>
          <th>サイズ</th>
          <th>共有</th>
          <th class="w-8"></th>
        </tr>
      </thead>
      <tbody>
        {#each files as file}
          <tr 
            class="hover cursor-pointer {isSelected(file) ? 'bg-primary/5' : ''} {dragOverFolder === file.id ? 'bg-primary/10' : ''}"
            onclick={(e) => handleClick(e, file)}
            ondblclick={() => handleDoubleClick(file)}
            draggable="true"
            ondragstart={(e) => handleDragStart(e, file)}
            ondragover={(e) => handleDragOver(e, file)}
            ondragleave={handleDragLeave}
            ondrop={(e) => handleDrop(e, file)}
            ondragend={handleDragEnd}
          >
            <td>
              {#if isSelected(file)}
                <button 
                  class="btn btn-circle btn-xs btn-primary"
                  onclick={(e) => {
                    e.stopPropagation();
                    fileStore.downloadFile(file.id);
                  }}
                  title="ダウンロード"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                </button>
              {/if}
            </td>
            <td>
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 {file.type === 'folder' ? 'text-primary' : 'text-base-content/50'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {@html getIconComponent(getFileIcon(file))}
                </svg>
                <span class="font-medium">{file.name}</span>
              </div>
            </td>
            <td class="text-sm text-base-content/70">{formatDate(file.modified)}</td>
            <td class="text-sm text-base-content/70">{formatFileSize(file.size)}</td>
            <td>
              {#if file.shared}
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              {/if}
            </td>
            <td>
              {#if file.type === 'folder'}
                <button 
                  class="btn btn-circle btn-xs btn-ghost"
                  onclick={(e) => {
                    e.stopPropagation();
                    fileStore.toggleStar(file.id);
                  }}
                  title={file.starred ? 'お気に入りから削除' : 'お気に入りに追加'}
                >
                  {#if file.starred}
                    <svg class="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  {:else}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                    </svg>
                  {/if}
                </button>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}