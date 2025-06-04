import { writable, derived } from 'svelte/store';
import { products } from './itemStore.js';
import { CONFIG, DEFAULTS } from '../config.js';

// フィルター初期値
const initialFilters = DEFAULTS.FILTERS;

// UI状態初期値
const initialUIState = {
  viewMode: CONFIG.UI.DEFAULT_VIEW_MODE,
  selectedProducts: [],
  isLoading: false,
  error: null
};

// フィルターストア
export const filters = writable(initialFilters);

// UI状態ストア
export const uiState = writable(initialUIState);

// フィルター操作のヘルパー関数
export function updateFilter(key, value) {
  filters.update(f => ({ ...f, [key]: value }));
}

export function resetFilters() {
  filters.set(initialFilters);
}

// UI状態操作のヘルパー関数
export function setViewMode(mode) {
  uiState.update(state => ({ ...state, viewMode: mode }));
}

export function toggleProductSelection(productId) {
  uiState.update(state => {
    const selectedProducts = state.selectedProducts.includes(productId)
      ? state.selectedProducts.filter(id => id !== productId)
      : [...state.selectedProducts, productId];
    
    return { ...state, selectedProducts };
  });
}

export function selectAllProducts(productIds) {
  uiState.update(state => ({ ...state, selectedProducts: productIds }));
}

export function clearSelection() {
  uiState.update(state => ({ ...state, selectedProducts: [] }));
}

export function setLoading(isLoading) {
  uiState.update(state => ({ ...state, isLoading }));
}

export function setError(error) {
  uiState.update(state => ({ ...state, error }));
}

// フィルター済み商品の派生ストア
export const filteredProducts = derived(
  [products, filters],
  ([$products, $filters]) => {
    let filtered = [...$products];
    
    // 検索フィルター
    if ($filters.search) {
      const searchLower = $filters.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }
    
    // カテゴリーフィルター
    if ($filters.categoryId) {
      filtered = filtered.filter(product => 
        product.categoryId === $filters.categoryId
      );
    }
    
    // タグフィルター
    if ($filters.tags.length > 0) {
      filtered = filtered.filter(product => 
        $filters.tags.some(tagId => product.tags.includes(tagId))
      );
    }
    
    // 在庫状態フィルター
    if ($filters.stockStatus.length > 0) {
      filtered = filtered.filter(product => 
        $filters.stockStatus.includes(product.stockStatus)
      );
    }
    
    // 価格範囲フィルター
    if ($filters.priceRange.min !== null) {
      filtered = filtered.filter(product => 
        product.price >= $filters.priceRange.min
      );
    }
    if ($filters.priceRange.max !== null) {
      filtered = filtered.filter(product => 
        product.price <= $filters.priceRange.max
      );
    }
    
    // ステータスフィルター
    if ($filters.status.length > 0) {
      filtered = filtered.filter(product => 
        $filters.status.includes(product.status)
      );
    }
    
    // ソート
    filtered.sort((a, b) => {
      let aValue = a[$filters.sortBy];
      let bValue = b[$filters.sortBy];
      
      // 日付の場合はDateオブジェクトに変換
      if ($filters.sortBy === 'createdAt' || $filters.sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if ($filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  }
);

// 統計情報の派生ストア
export const statistics = derived(
  [products, filteredProducts],
  ([$products, $filteredProducts]) => {
    return {
      totalProducts: $products.length,
      filteredProducts: $filteredProducts.length,
      totalValue: $filteredProducts.reduce((sum, p) => sum + (p.price * p.stock), 0),
      outOfStock: $filteredProducts.filter(p => p.stockStatus === 'out_of_stock').length,
      lowStock: $filteredProducts.filter(p => p.stockStatus === 'low_stock').length,
      activeProducts: $filteredProducts.filter(p => p.status === 'active').length,
      averagePrice: $filteredProducts.length > 0 
        ? Math.round($filteredProducts.reduce((sum, p) => sum + p.price, 0) / $filteredProducts.length)
        : 0
    };
  }
);

// ページネーション設定
export const pagination = writable({
  currentPage: 1,
  itemsPerPage: CONFIG.PAGINATION.DEFAULT_PAGE_SIZE
});

// ページネーション済み商品の派生ストア
export const paginatedProducts = derived(
  [filteredProducts, pagination],
  ([$filteredProducts, $pagination]) => {
    const start = ($pagination.currentPage - 1) * $pagination.itemsPerPage;
    const end = start + $pagination.itemsPerPage;
    
    return {
      products: $filteredProducts.slice(start, end),
      totalPages: Math.ceil($filteredProducts.length / $pagination.itemsPerPage),
      totalItems: $filteredProducts.length,
      currentPage: $pagination.currentPage,
      itemsPerPage: $pagination.itemsPerPage
    };
  }
);

// ページネーション操作のヘルパー関数
export function goToPage(page) {
  pagination.update(p => ({ ...p, currentPage: page }));
}

export function setItemsPerPage(items) {
  pagination.update(p => ({ ...p, itemsPerPage: items, currentPage: 1 }));
}