// ローカルストレージAPI

const STORAGE_KEYS = {
  PRODUCTS: 'ec_products',
  CATEGORIES: 'ec_categories',
  TAGS: 'ec_tags',
  PRICE_HISTORY: 'ec_price_history',
  STOCK_HISTORY: 'ec_stock_history'
};

// データの保存
export function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

// データの読み込み
export function loadFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

// 商品データの保存と読み込み
export const productStorage = {
  save: (products) => saveToLocalStorage(STORAGE_KEYS.PRODUCTS, products),
  load: () => loadFromLocalStorage(STORAGE_KEYS.PRODUCTS) || [],
  
  // 単一商品の保存
  saveOne: (product) => {
    const products = productStorage.load();
    const index = products.findIndex(p => p.id === product.id);
    
    if (index !== -1) {
      products[index] = { ...product, updatedAt: new Date() };
    } else {
      products.push({ ...product, createdAt: new Date(), updatedAt: new Date() });
    }
    
    return productStorage.save(products);
  },
  
  // 単一商品の削除
  deleteOne: (productId) => {
    const products = productStorage.load();
    const filtered = products.filter(p => p.id !== productId);
    return productStorage.save(filtered);
  },
  
  // 複数商品の削除
  deleteMany: (productIds) => {
    const products = productStorage.load();
    const filtered = products.filter(p => !productIds.includes(p.id));
    return productStorage.save(filtered);
  }
};

// カテゴリーデータの保存と読み込み
export const categoryStorage = {
  save: (categories) => saveToLocalStorage(STORAGE_KEYS.CATEGORIES, categories),
  load: () => loadFromLocalStorage(STORAGE_KEYS.CATEGORIES) || [],
  
  saveOne: (category) => {
    const categories = categoryStorage.load();
    const index = categories.findIndex(c => c.id === category.id);
    
    if (index !== -1) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    
    return categoryStorage.save(categories);
  },
  
  deleteOne: (categoryId) => {
    const categories = categoryStorage.load();
    const filtered = categories.filter(c => c.id !== categoryId);
    return categoryStorage.save(filtered);
  }
};

// タグデータの保存と読み込み
export const tagStorage = {
  save: (tags) => saveToLocalStorage(STORAGE_KEYS.TAGS, tags),
  load: () => loadFromLocalStorage(STORAGE_KEYS.TAGS) || [],
  
  saveOne: (tag) => {
    const tags = tagStorage.load();
    const index = tags.findIndex(t => t.id === tag.id);
    
    if (index !== -1) {
      tags[index] = tag;
    } else {
      tags.push(tag);
    }
    
    return tagStorage.save(tags);
  },
  
  deleteOne: (tagId) => {
    const tags = tagStorage.load();
    const filtered = tags.filter(t => t.id !== tagId);
    return tagStorage.save(filtered);
  }
};

// 価格履歴の保存と読み込み
export const priceHistoryStorage = {
  save: (history) => saveToLocalStorage(STORAGE_KEYS.PRICE_HISTORY, history),
  load: () => loadFromLocalStorage(STORAGE_KEYS.PRICE_HISTORY) || [],
  
  addEntry: (productId, price, changedBy = 'システム') => {
    const history = priceHistoryStorage.load();
    const newEntry = {
      id: `price-${productId}-${Date.now()}`,
      productId,
      price,
      changedAt: new Date(),
      changedBy
    };
    history.push(newEntry);
    priceHistoryStorage.save(history);
    return newEntry;
  },
  
  getByProductId: (productId) => {
    const history = priceHistoryStorage.load();
    return history
      .filter(h => h.productId === productId)
      .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
  }
};

// 在庫履歴の保存と読み込み
export const stockHistoryStorage = {
  save: (history) => saveToLocalStorage(STORAGE_KEYS.STOCK_HISTORY, history),
  load: () => loadFromLocalStorage(STORAGE_KEYS.STOCK_HISTORY) || [],
  
  addEntry: (productId, quantity, type, reason, changedBy = 'システム') => {
    const history = stockHistoryStorage.load();
    const newEntry = {
      id: `stock-${productId}-${Date.now()}`,
      productId,
      quantity,
      type,
      reason,
      changedAt: new Date(),
      changedBy
    };
    history.push(newEntry);
    stockHistoryStorage.save(history);
    return newEntry;
  },
  
  getByProductId: (productId) => {
    const history = stockHistoryStorage.load();
    return history
      .filter(h => h.productId === productId)
      .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
  }
};

// 初期データのセットアップ
export function initializeData(products, categories, tags, forceReset = false) {
  // forceResetがtrueの場合、または画像データがない古いデータの場合は強制リセット
  const existingProducts = productStorage.load();
  const hasOldData = existingProducts.length > 0 && 
                     existingProducts.some(p => !p.images || p.images.length === 0);
  
  if (forceReset || !existingProducts.length || hasOldData) {
    productStorage.save(products);
    
    // 価格履歴もリセット
    const priceHistory = [];
    products.forEach(product => {
      priceHistory.push({
        id: `price-${product.id}-initial`,
        productId: product.id,
        price: product.price,
        changedAt: product.createdAt,
        changedBy: 'システム初期化'
      });
    });
    priceHistoryStorage.save(priceHistory);
  }
  
  if (forceReset || !categoryStorage.load().length) {
    categoryStorage.save(categories);
  }
  if (forceReset || !tagStorage.load().length) {
    tagStorage.save(tags);
  }
}

// データのリセット
export function resetAllData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}