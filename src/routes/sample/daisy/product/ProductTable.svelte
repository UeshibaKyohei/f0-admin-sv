<script>
  import { onMount, onDestroy } from 'svelte';
  
  let { 
    products = [],
    selectedProducts = new Set(),
    toggleSelection,
    toggleAllSelection,
    editProduct,
    deleteProduct,
    viewMode = 'pagination',
    loadMore,
    isLoadingMore = false,
    hasMore = false
  } = $props();
  
  let tableContainer = $state();
  let sentinelRef = $state();
  let observer;
  
  let allSelected = $derived(
    products.length > 0 && products.every(p => selectedProducts.has(p.id))
  );
  
  // Setup intersection observer for infinite scroll
  onMount(() => {
    if (viewMode === 'infinite' && sentinelRef) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
            loadMore();
          }
        },
        { 
          root: null,
          rootMargin: '100px',
          threshold: 0.1 
        }
      );
      
      observer.observe(sentinelRef);
    }
  });
  
  onDestroy(() => {
    if (observer) {
      observer.disconnect();
    }
  });
  
  // Watch for viewMode changes
  $effect(() => {
    if (viewMode === 'infinite' && sentinelRef && !observer) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
            loadMore();
          }
        },
        { 
          root: null,
          rootMargin: '100px',
          threshold: 0.1 
        }
      );
      
      observer.observe(sentinelRef);
    } else if (viewMode !== 'infinite' && observer) {
      observer.disconnect();
      observer = null;
    }
  });
  
  // Get stock status badge
  function getStockBadge(stock) {
    if (stock === 0) {
      return { class: 'badge-error', text: '在庫なし' };
    } else if (stock <= 10) {
      return { class: 'badge-warning', text: '在庫少' };
    } else {
      return { class: 'badge-success', text: '在庫あり' };
    }
  }
  
  // Format price
  function formatPrice(price) {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(price);
  }
  
  // Handle row click for mobile
  function handleRowClick(product, event) {
    // Don't trigger if clicking on action buttons or checkboxes
    if (event.target.closest('.no-row-click')) return;
    
    // On mobile, clicking the row opens edit modal
    if (window.innerWidth < 768) {
      editProduct(product);
    }
  }
</script>

<div class="overflow-x-auto" bind:this={tableContainer}>
  <table class="table table-zebra">
    <thead>
      <tr>
        <th>
          <label class="no-row-click">
            <input 
              type="checkbox" 
              class="checkbox"
              checked={allSelected}
              onchange={toggleAllSelection}
            />
          </label>
        </th>
        <th>商品画像</th>
        <th>商品名 / SKU</th>
        <th>カテゴリ</th>
        <th>価格</th>
        <th>在庫</th>
        <th>ステータス</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      {#each products as product (product.id)}
        {@const stockBadge = getStockBadge(product.stock)}
        <tr 
          class="hover cursor-pointer transition-colors"
          onclick={(e) => handleRowClick(product, e)}
        >
          <th>
            <label class="no-row-click">
              <input 
                type="checkbox" 
                class="checkbox"
                checked={selectedProducts.has(product.id)}
                onchange={() => toggleSelection(product.id)}
              />
            </label>
          </th>
          <td>
            <div class="avatar">
              <div class="mask mask-squircle h-12 w-12">
                <img 
                  src={product.image} 
                  alt={product.name}
                  loading="lazy"
                />
              </div>
            </div>
          </td>
          <td>
            <div class="flex flex-col">
              <span class="font-bold">{product.name}</span>
              <span class="text-sm opacity-50">{product.sku}</span>
            </div>
          </td>
          <td>
            <span class="badge badge-ghost badge-sm">{product.category}</span>
          </td>
          <td class="font-mono">{formatPrice(product.price)}</td>
          <td>
            <div class="flex items-center gap-2">
              <span class="font-mono">{product.stock}</span>
              <span class="badge {stockBadge.class} badge-sm">
                {stockBadge.text}
              </span>
            </div>
          </td>
          <td>
            {#if product.status === 'active'}
              <span class="badge badge-success">販売中</span>
            {:else}
              <span class="badge badge-ghost">停止中</span>
            {/if}
          </td>
          <td>
            <div class="flex gap-1 no-row-click">
              <div class="tooltip" data-tip="編集">
                <button 
                  class="btn btn-ghost btn-xs"
                  onclick={() => editProduct(product)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
              
              <div class="tooltip" data-tip="削除">
                <button 
                  class="btn btn-ghost btn-xs text-error"
                  onclick={() => deleteProduct(product.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost btn-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </div>
                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10">
                  <li><a onclick={() => editProduct(product)}>編集</a></li>
                  <li><a>複製</a></li>
                  <li><a>在庫履歴</a></li>
                  <li><a class="text-error" onclick={() => deleteProduct(product.id)}>削除</a></li>
                </ul>
              </div>
            </div>
          </td>
        </tr>
      {/each}
      
      {#if products.length === 0}
        <tr>
          <td colspan="8" class="text-center py-8">
            <div class="flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-base-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p class="text-base-content/60">商品が見つかりません</p>
            </div>
          </td>
        </tr>
      {/if}
    </tbody>
  </table>
  
  <!-- Infinite scroll sentinel -->
  {#if viewMode === 'infinite'}
    <div 
      bind:this={sentinelRef}
      class="flex justify-center py-4"
    >
      {#if isLoadingMore}
        <span class="loading loading-spinner loading-md"></span>
      {:else if hasMore}
        <span class="text-base-content/60">スクロールして更に表示</span>
      {:else if products.length > 0}
        <span class="text-base-content/60">すべて表示しました</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  /* Mobile responsive adjustments */
  @media (max-width: 768px) {
    table {
      font-size: 0.875rem;
    }
    
    th:nth-child(4),
    td:nth-child(4),
    th:nth-child(7),
    td:nth-child(7) {
      display: none;
    }
  }
  
  /* Hover effect for rows */
  tr.hover:hover {
    background-color: var(--fallback-b2, oklch(var(--b2) / 0.2));
  }
</style>