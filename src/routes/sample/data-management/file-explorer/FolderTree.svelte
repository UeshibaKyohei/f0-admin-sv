<script>
  import { folderTree } from './fileStore.js';
  
  let { files, currentPath, onNavigate } = $props();
  
  let expandedFolders = $state(new Set(['/Documents', '/Images']));
  
  function toggleFolder(path) {
    if (expandedFolders.has(path)) {
      expandedFolders.delete(path);
    } else {
      expandedFolders.add(path);
    }
    expandedFolders = new Set(expandedFolders);
  }
  
  function handleNavigate(path) {
    onNavigate(path);
  }
</script>

<div class="space-y-1">
  <!-- ルート -->
  <button
    class="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-base-200 transition-colors {currentPath === '/' ? 'bg-primary/10 text-primary font-medium' : ''}"
    onclick={() => handleNavigate('/')}
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
    </svg>
    <span class="text-sm">ホーム</span>
  </button>
  
  <!-- スター付き -->
  <div class="mt-4 mb-2 px-3 text-xs font-medium text-base-content/50">お気に入り</div>
  {#each files.filter(f => f.starred && f.type === 'folder') as file}
    <button
      class="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-base-200 transition-colors {currentPath === file.path ? 'bg-primary/10 text-primary font-medium' : ''}"
      onclick={() => file.type === 'folder' ? handleNavigate(file.path) : null}
    >
      {#if file.type === 'folder'}
        <svg class="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      {:else}
        <svg class="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      {/if}
      <span class="text-sm truncate">{file.name}</span>
    </button>
  {/each}
  
  <!-- フォルダツリー -->
  <div class="mt-4 mb-2 px-3 text-xs font-medium text-base-content/50">フォルダ</div>
  {#each $folderTree as folder}
    <div>
      <div class="flex items-center">
        {#if folder.children.length > 0}
          <button
            class="p-1 hover:bg-base-200 rounded"
            onclick={() => toggleFolder(folder.path)}
            aria-label={expandedFolders.has(folder.path) ? 'フォルダを閉じる' : 'フォルダを開く'}
          >
            <svg 
              class="w-4 h-4 transition-transform {expandedFolders.has(folder.path) ? 'rotate-90' : ''}" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        {:else}
          <div class="w-6"></div>
        {/if}
        <button
          class="flex-1 flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-base-200 transition-colors {currentPath === folder.path ? 'bg-primary/10 text-primary font-medium' : ''}"
          onclick={() => handleNavigate(folder.path)}
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
          </svg>
          <span class="text-sm truncate">{folder.name}</span>
        </button>
      </div>
      
      {#if expandedFolders.has(folder.path) && folder.children.length > 0}
        <div class="ml-6">
          {#each folder.children as child}
            <div class="flex items-center">
              {#if child.children?.length > 0}
                <button
                  class="p-1 hover:bg-base-200 rounded"
                  onclick={() => toggleFolder(child.path)}
                  aria-label={expandedFolders.has(child.path) ? 'フォルダを閉じる' : 'フォルダを開く'}
                >
                  <svg 
                    class="w-4 h-4 transition-transform {expandedFolders.has(child.path) ? 'rotate-90' : ''}" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              {:else}
                <div class="w-6"></div>
              {/if}
              <button
                class="flex-1 flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-base-200 transition-colors {currentPath === child.path ? 'bg-primary/10 text-primary font-medium' : ''}"
                onclick={() => handleNavigate(child.path)}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                </svg>
                <span class="text-sm truncate">{child.name}</span>
              </button>
            </div>
            
            {#if expandedFolders.has(child.path) && child.children?.length > 0}
              <div class="ml-6">
                <!-- 再帰的に子フォルダを表示（3階層まで） -->
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</div>