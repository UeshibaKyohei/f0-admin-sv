<script>
  import { onMount } from 'svelte';
  import { CONFIG } from './config.js';
  import { 
    products, 
    categories, 
    tags,
    categoryProductCounts,
    tagProductCounts
  } from './stores/itemStore.js';
  import {
    filteredProducts,
    paginatedProducts,
    statistics,
    uiState,
    filters,
    pagination,
    setViewMode,
    clearSelection,
    selectAllProducts,
    resetFilters,
    goToPage
  } from './stores/uiStore.js';
  import ItemList from './ItemList.svelte';
  import ItemFilters from './ItemFilters.svelte';
  import ItemDetail from './ItemDetail.svelte';
  
  let showDetailModal = $state(false);
  let selectedProduct = $state(null);
  let showCreateModal = $state(false);
  
  // ストアの初期化
  onMount(() => {
    products.initialize();
    categories.initialize();
    tags.initialize();
  });
  
  // 商品詳細を表示
  function showProductDetail(product) {
    selectedProduct = product;
    showDetailModal = true;
  }
  
  // 新規作成
  function createNewProduct() {
    selectedProduct = null;
    showCreateModal = true;
  }
  
  // 選択した商品を削除
  function deleteSelectedProducts() {
    if ($uiState.selectedProducts.length === 0) return;
    
    if (confirm(`選択した${$uiState.selectedProducts.length}件の商品を削除しますか？`)) {
      products.deleteMany($uiState.selectedProducts);
      clearSelection();
    }
  }
  
  // 全選択/全解除
  function toggleSelectAll() {
    if ($uiState.selectedProducts.length === $paginatedProducts.products.length) {
      clearSelection();
    } else {
      selectAllProducts($paginatedProducts.products.map(p => p.id));
    }
  }
  
  // データのリセット（開発用）
  function resetDemoData() {
    if (confirm('デモデータをリセットしますか？現在のデータはすべて削除されます。')) {
      localStorage.clear();
      location.reload();
    }
  }
</script>

<div class="min-h-screen bg-base-200">
  <div class="container mx-auto p-4">
    <!-- ヘッダー -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">商品管理システム</h1>
      <p class="text-base-content/70">ECサイトの商品マスターデータを管理します</p>
    </div>
    
    <!-- 統計情報 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="stat bg-base-100 rounded-box shadow">
        <div class="stat-title">総商品数</div>
        <div class="stat-value text-primary">{$statistics.totalProducts}</div>
        <div class="stat-desc">登録済み商品</div>
      </div>
      <div class="stat bg-base-100 rounded-box shadow">
        <div class="stat-title">総在庫金額</div>
        <div class="stat-value text-secondary text-2xl">
          ¥{$statistics.totalValue.toLocaleString()}
        </div>
        <div class="stat-desc">在庫 × 単価</div>
      </div>
      <div class="stat bg-base-100 rounded-box shadow">
        <div class="stat-title">在庫状況</div>
        <div class="stat-value text-warning">{$statistics.lowStock}</div>
        <div class="stat-desc">在庫少 / {$statistics.outOfStock} 在庫切れ</div>
      </div>
      <div class="stat bg-base-100 rounded-box shadow">
        <div class="stat-title">平均価格</div>
        <div class="stat-value text-info text-2xl">
          ¥{$statistics.averagePrice.toLocaleString()}
        </div>
        <div class="stat-desc">全商品平均</div>
      </div>
    </div>
    
    <!-- フィルターとアクション -->
    <div class="bg-base-100 rounded-box shadow p-4 mb-6">
      <ItemFilters />
      
      <!-- アクションバー -->
      <div class="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t">
        <div class="flex items-center gap-2">
          <button 
            onclick={createNewProduct}
            class="btn btn-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            新規作成
          </button>
          
          {#if $uiState.selectedProducts.length > 0}
            <button 
              onclick={deleteSelectedProducts}
              class="btn btn-error"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" />
              </svg>
              削除 ({$uiState.selectedProducts.length})
            </button>
          {/if}
          
          <button 
            onclick={resetFilters}
            class="btn btn-ghost"
          >
            フィルターをリセット
          </button>
          
          {#if CONFIG.IS_MOCK_MODE && CONFIG.UI.SHOW_MOCK_CONTROLS}
            <button 
              onclick={resetDemoData}
              class="btn btn-ghost btn-sm"
            >
              デモデータリセット
            </button>
          {/if}
        </div>
        
        <div class="flex items-center gap-2">
          <span class="text-sm text-base-content/70">表示モード:</span>
          <div class="btn-group">
            <button 
              class="btn btn-sm"
              class:btn-active={$uiState.viewMode === 'grid'}
              onclick={() => setViewMode('grid')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
              </svg>
              グリッド
            </button>
            <button 
              class="btn btn-sm"
              class:btn-active={$uiState.viewMode === 'list'}
              onclick={() => setViewMode('list')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
              </svg>
              リスト
            </button>
          </div>
        </div>
      </div>
      
      {#if $filteredProducts.length !== $products.length}
        <div class="text-sm text-base-content/70 mt-2">
          {$filteredProducts.length} / {$products.length} 件を表示
        </div>
      {/if}
    </div>
    
    <!-- 商品リスト -->
    {#if $paginatedProducts.products.length > 0}
      <ItemList 
        products={$paginatedProducts.products}
        viewMode={$uiState.viewMode}
        selectedProducts={$uiState.selectedProducts}
        onSelectAll={toggleSelectAll}
        onProductClick={showProductDetail}
      />
      
      <!-- ページネーション -->
      {#if $paginatedProducts.totalPages > 1}
        <div class="flex justify-center mt-6">
          <div class="join">
            <button 
              class="join-item btn"
              disabled={$pagination.currentPage === 1}
              onclick={() => goToPage($pagination.currentPage - 1)}
            >
              «
            </button>
            
            {#each Array($paginatedProducts.totalPages) as _, i}
              {@const page = i + 1}
              {#if page === 1 || page === $paginatedProducts.totalPages || 
                   (page >= $pagination.currentPage - 2 && page <= $pagination.currentPage + 2)}
                <button 
                  class="join-item btn"
                  class:btn-active={page === $pagination.currentPage}
                  onclick={() => goToPage(page)}
                >
                  {page}
                </button>
              {:else if page === $pagination.currentPage - 3 || page === $pagination.currentPage + 3}
                <button class="join-item btn btn-disabled">...</button>
              {/if}
            {/each}
            
            <button 
              class="join-item btn"
              disabled={$pagination.currentPage === $paginatedProducts.totalPages}
              onclick={() => goToPage($pagination.currentPage + 1)}
            >
              »
            </button>
          </div>
        </div>
      {/if}
    {:else}
      <div class="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="text-base-content/70">商品が見つかりませんでした</p>
        <button 
          onclick={resetFilters}
          class="btn btn-primary mt-4"
        >
          フィルターをリセット
        </button>
      </div>
    {/if}
  </div>
</div>

<!-- 商品詳細モーダル -->
{#if showDetailModal && selectedProduct}
  <ItemDetail 
    product={selectedProduct}
    onClose={() => showDetailModal = false}
    onSave={(updates) => {
      products.update(selectedProduct.id, updates);
      showDetailModal = false;
    }}
  />
{/if}

<!-- 新規作成モーダル -->
{#if showCreateModal}
  <ItemDetail 
    product={null}
    onClose={() => showCreateModal = false}
    onSave={(newProduct) => {
      products.add(newProduct);
      showCreateModal = false;
    }}
  />
{/if}