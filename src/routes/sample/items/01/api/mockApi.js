/**
 * モックAPI実装
 * 
 * ローカルストレージを使用してAPIの動作をシミュレートします。
 * 実際のAPI実装に置き換える際のインターフェースを提供します。
 */

import {
  productStorage,
  categoryStorage,
  tagStorage,
  priceHistoryStorage,
  stockHistoryStorage
} from './localStorage.js';
import { generateProducts, categories as mockCategories, tags as mockTags } from './mockData.js';
import { CONFIG } from '../config.js';

// 遅延を追加してAPIの非同期性をシミュレート
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * フィルタリングとページネーション処理
 */
function applyFiltersAndPagination(items, params) {
  let filtered = [...items];
  
  // 検索フィルター
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(item => 
      item.name?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower)
    );
  }
  
  // カテゴリーフィルター
  if (params.categoryId) {
    filtered = filtered.filter(item => item.categoryId === params.categoryId);
  }
  
  // タグフィルター
  if (params.tags && params.tags.length > 0) {
    filtered = filtered.filter(item => 
      params.tags.some(tagId => item.tags?.includes(tagId))
    );
  }
  
  // 在庫状態フィルター
  if (params.stockStatus && params.stockStatus.length > 0) {
    filtered = filtered.filter(item => 
      params.stockStatus.includes(item.stockStatus)
    );
  }
  
  // 価格範囲フィルター
  if (params.minPrice !== undefined) {
    filtered = filtered.filter(item => item.price >= params.minPrice);
  }
  if (params.maxPrice !== undefined) {
    filtered = filtered.filter(item => item.price <= params.maxPrice);
  }
  
  // ステータスフィルター
  if (params.status && params.status.length > 0) {
    filtered = filtered.filter(item => params.status.includes(item.status));
  }
  
  // ソート
  const sortBy = params.sortBy || 'updatedAt';
  const sortOrder = params.sortOrder || 'desc';
  
  filtered.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // 日付の場合はDateオブジェクトに変換
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  // ページネーション
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 12;
  const start = (page - 1) * limit;
  const paginatedItems = filtered.slice(start, start + limit);
  
  return {
    data: paginatedItems,
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit)
  };
}

/**
 * 商品モックAPI
 */
export const products = {
  async list(params = {}) {
    await delay();
    const allProducts = productStorage.load();
    return applyFiltersAndPagination(allProducts, params);
  },

  async get(id) {
    await delay();
    const products = productStorage.load();
    const product = products.find(p => p.id === id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  },

  async create(data) {
    await delay();
    const newProduct = {
      ...data,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    productStorage.saveOne(newProduct);
    
    // 初期価格履歴を追加
    priceHistoryStorage.addEntry(newProduct.id, newProduct.price, 'システム');
    
    return newProduct;
  },

  async update(id, data) {
    await delay();
    const products = productStorage.load();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Product not found');
    }
    
    const oldProduct = products[index];
    const updatedProduct = {
      ...oldProduct,
      ...data,
      id, // IDは変更不可
      updatedAt: new Date().toISOString()
    };
    
    products[index] = updatedProduct;
    productStorage.save(products);
    
    // 価格が変更された場合は履歴に追加
    if (data.price !== undefined && oldProduct.price !== data.price) {
      priceHistoryStorage.addEntry(id, data.price, 'ユーザー');
    }
    
    return updatedProduct;
  },

  async delete(id) {
    await delay();
    productStorage.deleteOne(id);
  },

  async deleteMany(ids) {
    await delay();
    productStorage.deleteMany(ids);
  },

  async updateStock(id, adjustment) {
    await delay();
    const products = productStorage.load();
    const product = products.find(p => p.id === id);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    const newStock = product.stock + adjustment.quantity;
    const stockStatus = newStock === 0 ? 'out_of_stock' : 
                       newStock < CONFIG.INVENTORY.LOW_STOCK_THRESHOLD ? 'low_stock' : 'in_stock';
    
    const updatedProduct = {
      ...product,
      stock: newStock,
      stockStatus,
      updatedAt: new Date().toISOString()
    };
    
    productStorage.saveOne(updatedProduct);
    
    // 在庫履歴に追加
    stockHistoryStorage.addEntry(
      id,
      adjustment.quantity,
      adjustment.type,
      adjustment.reason,
      adjustment.changedBy || 'ユーザー'
    );
    
    return updatedProduct;
  }
};

/**
 * カテゴリーモックAPI
 */
export const categories = {
  async list() {
    await delay();
    return categoryStorage.load();
  },

  async create(data) {
    await delay();
    const newCategory = {
      ...data,
      id: `cat-${Date.now()}`
    };
    categoryStorage.saveOne(newCategory);
    return newCategory;
  },

  async update(id, data) {
    await delay();
    const categories = categoryStorage.load();
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    const updatedCategory = {
      ...categories[index],
      ...data,
      id // IDは変更不可
    };
    
    categories[index] = updatedCategory;
    categoryStorage.save(categories);
    return updatedCategory;
  },

  async delete(id) {
    await delay();
    categoryStorage.deleteOne(id);
  }
};

/**
 * タグモックAPI
 */
export const tags = {
  async list() {
    await delay();
    return tagStorage.load();
  },

  async create(data) {
    await delay();
    const newTag = {
      ...data,
      id: `tag-${Date.now()}`
    };
    tagStorage.saveOne(newTag);
    return newTag;
  },

  async update(id, data) {
    await delay();
    const tags = tagStorage.load();
    const index = tags.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error('Tag not found');
    }
    
    const updatedTag = {
      ...tags[index],
      ...data,
      id // IDは変更不可
    };
    
    tags[index] = updatedTag;
    tagStorage.save(tags);
    return updatedTag;
  },

  async delete(id) {
    await delay();
    tagStorage.deleteOne(id);
  }
};

/**
 * 価格履歴モックAPI
 */
export const priceHistory = {
  async list(productId) {
    await delay();
    return priceHistoryStorage.getByProductId(productId);
  }
};

/**
 * 在庫履歴モックAPI
 */
export const stockHistory = {
  async list(productId) {
    await delay();
    return stockHistoryStorage.getByProductId(productId);
  }
};

/**
 * ファイルアップロードモックAPI
 */
export const files = {
  async upload(file) {
    await delay(300); // ファイルアップロードのシミュレート
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve({
          url: e.target.result,
          filename: file.name,
          size: file.size,
          mimeType: file.type
        });
      };
      
      reader.onerror = () => {
        reject(new Error('File upload failed'));
      };
      
      reader.readAsDataURL(file);
    });
  }
};