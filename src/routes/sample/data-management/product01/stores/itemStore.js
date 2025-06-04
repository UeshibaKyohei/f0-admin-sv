import { writable, derived } from 'svelte/store';
import { 
  productStorage, 
  categoryStorage, 
  tagStorage,
  priceHistoryStorage,
  stockHistoryStorage,
  initializeData 
} from '../api/localStorage.js';
import { generateProducts, categories as mockCategories, tags as mockTags } from '../api/mockData.js';

// 商品ストア
function createProductStore() {
  const { subscribe, set, update } = writable([]);
  
  return {
    subscribe,
    
    // 初期化
    initialize: () => {
      const mockProducts = generateProducts();
      initializeData(mockProducts, mockCategories, mockTags);
      const products = productStorage.load();
      set(products);
    },
    
    // 商品の追加
    add: (product) => {
      const newProduct = {
        ...product,
        id: `prod-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      productStorage.saveOne(newProduct);
      update(products => [...products, newProduct]);
      
      // 初期価格履歴を追加
      priceHistoryStorage.addEntry(newProduct.id, newProduct.price, 'システム');
      
      return newProduct;
    },
    
    // 商品の更新
    update: (productId, updates) => {
      update(products => {
        const newProducts = products.map(p => 
          p.id === productId 
            ? { ...p, ...updates, updatedAt: new Date() }
            : p
        );
        productStorage.save(newProducts);
        
        // 価格が変更された場合は履歴に追加
        const oldProduct = products.find(p => p.id === productId);
        if (oldProduct && updates.price && oldProduct.price !== updates.price) {
          priceHistoryStorage.addEntry(productId, updates.price, 'ユーザー');
        }
        
        return newProducts;
      });
    },
    
    // 商品の削除
    delete: (productId) => {
      update(products => {
        const newProducts = products.filter(p => p.id !== productId);
        productStorage.save(newProducts);
        return newProducts;
      });
    },
    
    // 複数商品の削除
    deleteMany: (productIds) => {
      update(products => {
        const newProducts = products.filter(p => !productIds.includes(p.id));
        productStorage.save(newProducts);
        return newProducts;
      });
    },
    
    // 在庫の更新
    updateStock: (productId, quantity, type, reason) => {
      update(products => {
        const newProducts = products.map(p => {
          if (p.id === productId) {
            const newStock = p.stock + quantity;
            const stockStatus = newStock === 0 ? 'out_of_stock' : 
                              newStock < 10 ? 'low_stock' : 'in_stock';
            
            return { ...p, stock: newStock, stockStatus, updatedAt: new Date() };
          }
          return p;
        });
        
        productStorage.save(newProducts);
        
        // 在庫履歴に追加
        stockHistoryStorage.addEntry(productId, quantity, type, reason, 'ユーザー');
        
        return newProducts;
      });
    },
    
    // データのリロード
    reload: () => {
      const products = productStorage.load();
      set(products);
    }
  };
}

// カテゴリーストア
function createCategoryStore() {
  const { subscribe, set, update } = writable([]);
  
  return {
    subscribe,
    
    initialize: () => {
      const categories = categoryStorage.load();
      set(categories);
    },
    
    add: (category) => {
      const newCategory = {
        ...category,
        id: `cat-${Date.now()}`
      };
      
      categoryStorage.saveOne(newCategory);
      update(categories => [...categories, newCategory]);
      
      return newCategory;
    },
    
    update: (categoryId, updates) => {
      update(categories => {
        const newCategories = categories.map(c => 
          c.id === categoryId ? { ...c, ...updates } : c
        );
        categoryStorage.save(newCategories);
        return newCategories;
      });
    },
    
    delete: (categoryId) => {
      update(categories => {
        const newCategories = categories.filter(c => c.id !== categoryId);
        categoryStorage.save(newCategories);
        return newCategories;
      });
    }
  };
}

// タグストア
function createTagStore() {
  const { subscribe, set, update } = writable([]);
  
  return {
    subscribe,
    
    initialize: () => {
      const tags = tagStorage.load();
      set(tags);
    },
    
    add: (tag) => {
      const newTag = {
        ...tag,
        id: `tag-${Date.now()}`
      };
      
      tagStorage.saveOne(newTag);
      update(tags => [...tags, newTag]);
      
      return newTag;
    },
    
    update: (tagId, updates) => {
      update(tags => {
        const newTags = tags.map(t => 
          t.id === tagId ? { ...t, ...updates } : t
        );
        tagStorage.save(newTags);
        return newTags;
      });
    },
    
    delete: (tagId) => {
      update(tags => {
        const newTags = tags.filter(t => t.id !== tagId);
        tagStorage.save(newTags);
        return newTags;
      });
    }
  };
}

// ストアのエクスポート
export const products = createProductStore();
export const categories = createCategoryStore();
export const tags = createTagStore();

// カテゴリーツリー構造の派生ストア
export const categoryTree = derived(categories, ($categories) => {
  const tree = [];
  const categoryMap = new Map();
  
  // まずすべてのカテゴリーをマップに格納
  $categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });
  
  // 親子関係を構築
  $categories.forEach(cat => {
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        parent.children.push(categoryMap.get(cat.id));
      }
    } else {
      tree.push(categoryMap.get(cat.id));
    }
  });
  
  // ソート
  const sortCategories = (cats) => {
    cats.sort((a, b) => a.sortOrder - b.sortOrder);
    cats.forEach(cat => {
      if (cat.children.length > 0) {
        sortCategories(cat.children);
      }
    });
  };
  
  sortCategories(tree);
  
  return tree;
});

// カテゴリーごとの商品数を計算する派生ストア
export const categoryProductCounts = derived(
  [categories, products],
  ([$categories, $products]) => {
    const counts = {};
    
    // 各カテゴリーの商品数を計算
    $categories.forEach(cat => {
      counts[cat.id] = $products.filter(p => p.categoryId === cat.id).length;
    });
    
    return counts;
  }
);

// タグごとの商品数を計算する派生ストア
export const tagProductCounts = derived(
  [tags, products],
  ([$tags, $products]) => {
    const counts = {};
    
    // 各タグの商品数を計算
    $tags.forEach(tag => {
      counts[tag.id] = $products.filter(p => p.tags.includes(tag.id)).length;
    });
    
    return counts;
  }
);