<script>
  import { onMount } from 'svelte';
  import ProductTable from './ProductTable.svelte';
  import ProductModal from './ProductModal.svelte';
  import ProductFilters from './ProductFilters.svelte';
  import DeleteModal from './DeleteModal.svelte';
  import { generateMockProducts } from './mockData.js';
  
  // State management
  let products = $state([]);
  let filteredProducts = $state([]);
  let selectedProducts = $state(new Set());
  let isLoading = $state(true);
  let viewMode = $state('pagination'); // 'pagination' | 'infinite'
  
  // Modal state
  let isModalOpen = $state(false);
  let editingProduct = $state(null);
  let isDeleteModalOpen = $state(false);
  let productsToDelete = $state([]);
  
  // Filter state
  let searchQuery = $state('');
  let selectedCategory = $state('all');
  let priceRange = $state({ min: 0, max: 10000 });
  let stockFilter = $state('all');
  let sortBy = $state('name');
  let sortOrder = $state('asc');
  
  // Pagination state
  let currentPage = $state(1);
  let itemsPerPage = $state(20);
  let totalPages = $derived(Math.ceil(filteredProducts.length / itemsPerPage));
  
  // Infinite scroll state
  let displayedItems = $state(20);
  let isLoadingMore = $state(false);
  
  // Simulate API call for infinite scroll
  async function loadMoreFromAPI() {
    // In real app, this would be an API call like:
    // const response = await fetch(`/api/products?page=${currentPage}&limit=20`);
    // const newProducts = await response.json();
    // products = [...products, ...newProducts];
    
    // For demo, we simulate loading more from existing data
    return new Promise(resolve => {
      setTimeout(() => {
        displayedItems = Math.min(displayedItems + 20, filteredProducts.length);
        resolve();
      }, 500);
    });
  }
  
  // Categories for filter
  const categories = ['all', 'Electronics', 'Clothing', 'Food', 'Books', 'Home', 'Sports'];
  
  // Load initial data
  onMount(() => {
    setTimeout(() => {
      products = generateMockProducts(500);
      filteredProducts = [...products];
      isLoading = false;
    }, 1000);
  });
  
  // Filter and sort products
  $effect(() => {
    let result = [...products];
    
    // Search filter
    if (searchQuery) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Price filter
    result = result.filter(product => 
      product.price >= priceRange.min && product.price <= priceRange.max
    );
    
    // Stock filter
    if (stockFilter !== 'all') {
      switch (stockFilter) {
        case 'in-stock':
          result = result.filter(product => product.stock > 10);
          break;
        case 'low-stock':
          result = result.filter(product => product.stock > 0 && product.stock <= 10);
          break;
        case 'out-of-stock':
          result = result.filter(product => product.stock === 0);
          break;
      }
    }
    
    // Sorting
    result.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    filteredProducts = result;
    currentPage = 1; // Reset to first page when filters change
    displayedItems = 20; // Reset infinite scroll
  });
  
  // Pagination data
  const paginatedProducts = $derived(() => {
    if (viewMode === 'infinite') {
      return filteredProducts.slice(0, displayedItems);
    }
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredProducts.slice(start, end);
  });
  
  // Handle infinite scroll
  async function loadMore() {
    if (isLoadingMore || displayedItems >= filteredProducts.length) return;
    
    isLoadingMore = true;
    
    try {
      await loadMoreFromAPI();
    } catch (error) {
      console.error('Failed to load more products:', error);
      // In real app, show error toast
    } finally {
      isLoadingMore = false;
    }
  }
  
  // Handle product actions
  function createProduct() {
    editingProduct = null;
    isModalOpen = true;
  }
  
  function editProduct(product) {
    editingProduct = { ...product };
    isModalOpen = true;
  }
  
  function deleteProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
      productsToDelete = [product];
      isDeleteModalOpen = true;
    }
  }
  
  function confirmDelete() {
    const idsToDelete = productsToDelete.map(p => p.id);
    products = products.filter(p => !idsToDelete.includes(p.id));
    idsToDelete.forEach(id => selectedProducts.delete(id));
    selectedProducts = new Set(selectedProducts);
    isDeleteModalOpen = false;
    productsToDelete = [];
  }
  
  function saveProduct(productData) {
    if (editingProduct) {
      // Update existing product
      products = products.map(p => 
        p.id === productData.id ? productData : p
      );
    } else {
      // Create new product
      const newProduct = {
        ...productData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      products = [newProduct, ...products];
    }
    isModalOpen = false;
  }
  
  // Bulk actions
  function deleteSelected() {
    if (selectedProducts.size === 0) return;
    
    productsToDelete = products.filter(p => selectedProducts.has(p.id));
    isDeleteModalOpen = true;
  }
  
  function exportData() {
    const exportProducts = selectedProducts.size > 0 
      ? products.filter(p => selectedProducts.has(p.id))
      : filteredProducts;
    
    const csv = [
      ['ID', 'Name', 'SKU', 'Category', 'Price', 'Stock', 'Status'],
      ...exportProducts.map(p => [
        p.id,
        p.name,
        p.sku,
        p.category,
        p.price,
        p.stock,
        p.status
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
  }
  
  // Toggle selection
  function toggleSelection(id) {
    if (selectedProducts.has(id)) {
      selectedProducts.delete(id);
    } else {
      selectedProducts.add(id);
    }
    selectedProducts = new Set(selectedProducts);
  }
  
  function toggleAllSelection() {
    const currentProducts = paginatedProducts();
    const allSelected = currentProducts.every(p => selectedProducts.has(p.id));
    
    if (allSelected) {
      currentProducts.forEach(p => selectedProducts.delete(p.id));
    } else {
      currentProducts.forEach(p => selectedProducts.add(p.id));
    }
    selectedProducts = new Set(selectedProducts);
  }
</script>

<div class="container mx-auto p-4 max-w-7xl">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    <div>
      <h1 class="text-3xl font-bold">商品管理</h1>
      <p class="text-base-content/60">
        {filteredProducts.length}件の商品 
        {selectedProducts.size > 0 && `(${selectedProducts.size}件選択中)`}
      </p>
    </div>
    
    <div class="flex flex-wrap gap-2">
      <button 
        class="btn btn-primary"
        onclick={createProduct}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        新規作成
      </button>
      
      {#if selectedProducts.size > 0}
        <button 
          class="btn btn-error"
          onclick={deleteSelected}
        >
          選択した商品を削除 ({selectedProducts.size})
        </button>
      {/if}
      
      <div class="tooltip tooltip-bottom" data-tip="CSVエクスポート">
        <button 
          class="btn btn-ghost btn-square"
          onclick={exportData}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
  
  <!-- View Mode Toggle -->
  <div class="flex justify-end mb-4">
    <div class="join">
      <input 
        class="join-item btn btn-sm"
        type="radio" 
        name="view-mode" 
        aria-label="ページネーション"
        checked={viewMode === 'pagination'}
        onchange={() => viewMode = 'pagination'}
      />
      <input 
        class="join-item btn btn-sm"
        type="radio" 
        name="view-mode" 
        aria-label="無限スクロール"
        checked={viewMode === 'infinite'}
        onchange={() => viewMode = 'infinite'}
      />
    </div>
  </div>
  
  <!-- Filters -->
  <ProductFilters
    bind:searchQuery
    bind:selectedCategory
    bind:priceRange
    bind:stockFilter
    bind:sortBy
    bind:sortOrder
    {categories}
  />
  
  <!-- Loading State -->
  {#if isLoading}
    <div class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else}
    <!-- Product Table -->
    <ProductTable
      products={paginatedProducts()}
      {selectedProducts}
      {toggleSelection}
      {toggleAllSelection}
      {editProduct}
      {deleteProduct}
      {viewMode}
      {loadMore}
      {isLoadingMore}
      hasMore={displayedItems < filteredProducts.length}
    />
    
    <!-- Pagination -->
    {#if viewMode === 'pagination' && totalPages > 1}
      <div class="flex justify-center mt-6">
        <div class="join">
          <button 
            class="join-item btn"
            disabled={currentPage === 1}
            onclick={() => currentPage = 1}
          >
            «
          </button>
          <button 
            class="join-item btn"
            disabled={currentPage === 1}
            onclick={() => currentPage--}
          >
            ‹
          </button>
          
          {#each Array(Math.min(5, totalPages)) as _, i}
            {@const pageNum = currentPage <= 3 ? i + 1 : 
                              currentPage >= totalPages - 2 ? totalPages - 4 + i :
                              currentPage - 2 + i}
            {#if pageNum > 0 && pageNum <= totalPages}
              <button 
                class="join-item btn"
                class:btn-active={pageNum === currentPage}
                onclick={() => currentPage = pageNum}
              >
                {pageNum}
              </button>
            {/if}
          {/each}
          
          <button 
            class="join-item btn"
            disabled={currentPage === totalPages}
            onclick={() => currentPage++}
          >
            ›
          </button>
          <button 
            class="join-item btn"
            disabled={currentPage === totalPages}
            onclick={() => currentPage = totalPages}
          >
            »
          </button>
        </div>
      </div>
    {/if}
  {/if}
  
  <!-- Product Modal -->
  {#if isModalOpen}
    <ProductModal
      product={editingProduct}
      {categories}
      onSave={saveProduct}
      onClose={() => isModalOpen = false}
    />
  {/if}
  
  <!-- Delete Confirmation Modal -->
  {#if isDeleteModalOpen}
    <DeleteModal
      products={productsToDelete}
      onConfirm={confirmDelete}
      onClose={() => {
        isDeleteModalOpen = false;
        productsToDelete = [];
      }}
    />
  {/if}
</div>

<style>
  /* Add any component-specific styles here */
</style>