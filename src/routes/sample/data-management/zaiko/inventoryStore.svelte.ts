// 在庫管理ストア - Svelte 5 ルーンを使用
import type { 
  Warehouse, 
  WarehouseArea, 
  InventoryItem, 
  InventoryMovement,
  InventoryHistory,
  InventoryFilter,
  DashboardStats,
  Product,
  Category,
  Tag,
  InventoryAlert
} from './types';
import { DEMO_MODE, DEMO_DELAY, LOW_STOCK_THRESHOLD } from './constants';
import { 
  inventoryApi, 
  warehouseApi, 
  productApi, 
  rfidApi, 
  alertApi, 
  historyApi 
} from './api/apiClient';

// ストアの作成
function createInventoryStore() {
  // 状態管理
  let warehouses = $state<Warehouse[]>([]);
  let inventoryItems = $state<InventoryItem[]>([]);
  let movements = $state<InventoryMovement[]>([]);
  let history = $state<InventoryHistory[]>([]);
  let products = $state<Product[]>([]);
  let categories = $state<Category[]>([]);
  let tags = $state<Tag[]>([]);
  let alerts = $state<InventoryAlert[]>([]);
  let currentFilter = $state<InventoryFilter>({});
  let isLoading = $state(false);
  let error = $state<string | null>(null);

  // 派生値
  const filteredItems = $derived.by(() => {
    let items = [...inventoryItems];

    if (currentFilter.keyword) {
      const keyword = currentFilter.keyword.toLowerCase();
      items = items.filter(item => {
        // 商品情報で検索
        const product = item.product || products.find(p => p.id === item.productId);
        if (product) {
          // 商品名、SKU、メーカー、型番で検索
          if (product.name.toLowerCase().includes(keyword) ||
              product.sku.toLowerCase().includes(keyword) ||
              product.manufacturer?.toLowerCase().includes(keyword) ||
              product.model?.toLowerCase().includes(keyword)) {
            return true;
          }
          
          // カテゴリ名で検索
          const category = categories.find(c => c.id === product.categoryId);
          if (category && category.name.toLowerCase().includes(keyword)) {
            return true;
          }
          
          // タグ名で検索
          const matchingTag = product.tags.some(tagId => {
            const tag = tags.find(t => t.id === tagId);
            return tag && tag.name.toLowerCase().includes(keyword);
          });
          if (matchingTag) return true;
        }
        
        // RFIDタグ、シリアル番号で検索
        return item.rfidTag?.toLowerCase().includes(keyword) ||
               item.serialNumber?.toLowerCase().includes(keyword) ||
               item.batchNumber?.toLowerCase().includes(keyword) ||
               item.lotNumber?.toLowerCase().includes(keyword);
      });
    }

    if (currentFilter.warehouseId) {
      items = items.filter(item => item.warehouseId === currentFilter.warehouseId);
    }

    if (currentFilter.areaId) {
      items = items.filter(item => item.areaId === currentFilter.areaId);
    }

    if (currentFilter.status) {
      items = items.filter(item => item.status === currentFilter.status);
    }

    return items;
  });

  const dashboardStats = $derived.by((): DashboardStats => {
    // 低在庫アイテムを計算
    const lowStockItems = inventoryItems.filter(item => {
      const product = item.product || products.find(p => p.id === item.productId);
      return product && item.quantity < product.minStockLevel;
    });
    
    // 期限切れ間近のアイテムを計算（30日以内）
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringItems = inventoryItems.filter(item => 
      item.expiryDate && new Date(item.expiryDate) <= thirtyDaysFromNow
    );
    
    // カテゴリ別の分析
    const categoryBreakdown = categories
      .filter(cat => !cat.parentId) // トップレベルカテゴリのみ
      .map(category => {
        const itemsInCategory = inventoryItems.filter(item => {
          const product = item.product || products.find(p => p.id === item.productId);
          return product && (product.categoryId === category.id || 
                            product.categoryId.startsWith(category.id + '-'));
        });
        
        return {
          categoryId: category.id,
          categoryName: category.name,
          itemCount: itemsInCategory.length,
          totalValue: itemsInCategory.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0)
        };
      });
    
    const stats: DashboardStats = {
      totalItems: inventoryItems.length,
      totalWarehouses: warehouses.length,
      totalValue: inventoryItems.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0),
      lowStockItems: lowStockItems.length,
      expiringItems: expiringItems.length,
      activeAlerts: alerts.filter(a => a.isActive).length,
      recentMovements: movements.slice(0, 5),
      warehouseUtilization: warehouses.map(warehouse => ({
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        utilizationRate: (warehouse.currentUsage / warehouse.capacity) * 100
      })),
      categoryBreakdown
    };
    return stats;
  });

  // デモ用の遅延処理
  async function simulateDelay() {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, DEMO_DELAY));
    }
  }

  // 倉庫の取得
  async function loadWarehouses() {
    isLoading = true;
    error = null;
    try {
      await simulateDelay();
      // デモデータは別途生成
      return warehouses;
    } catch (err) {
      error = '倉庫データの読み込みに失敗しました';
      throw err;
    } finally {
      isLoading = false;
    }
  }

  // 在庫アイテムの取得
  async function loadInventoryItems() {
    isLoading = true;
    error = null;
    try {
      await simulateDelay();
      return inventoryItems;
    } catch (err) {
      error = '在庫データの読み込みに失敗しました';
      throw err;
    } finally {
      isLoading = false;
    }
  }

  // 在庫アイテムの追加
  async function addInventoryItem(item: Omit<InventoryItem, 'id' | 'lastUpdated'>) {
    isLoading = true;
    error = null;
    try {
      await simulateDelay();
      const newItem: InventoryItem = {
        ...item,
        id: `item-${Date.now()}`,
        lastUpdated: new Date()
      };
      inventoryItems = [...inventoryItems, newItem];
      
      // 履歴に追加
      addHistory({
        itemId: newItem.id,
        action: 'created',
        previousValue: null,
        newValue: newItem,
        reason: '新規登録',
        performedBy: 'デモユーザー'
      });
      
      // 倉庫の使用量を更新
      updateWarehouseUsage(item.warehouseId, item.areaId, item.quantity);
      
      return newItem;
    } catch (err) {
      error = '在庫の追加に失敗しました';
      throw err;
    } finally {
      isLoading = false;
    }
  }

  // 在庫アイテムの更新
  async function updateInventoryItem(id: string, updates: Partial<InventoryItem>) {
    isLoading = true;
    error = null;
    try {
      // APIクライアント経由で更新（DEMO_MODEの場合はモック処理）
      const response = await inventoryApi.updateInventoryItem(id, updates);
      
      if (!response.success) {
        throw new Error(response.error || '在庫の更新に失敗しました');
      }
      
      // ローカル状態の更新
      const index = inventoryItems.findIndex(item => item.id === id);
      if (index !== -1) {
        const previousItem = inventoryItems[index];
        const updatedItem = response.data!;
        
        inventoryItems = inventoryItems.map(item => 
          item.id === id ? updatedItem : item
        );
        
        // 履歴に追加
        addHistory({
          itemId: id,
          action: 'updated',
          previousValue: previousItem,
          newValue: updatedItem,
          reason: '情報更新',
          performedBy: 'デモユーザー' // 本実装時: 認証ユーザー情報を使用
        });
      }
      
      return response.data!;
    } catch (err) {
      error = '在庫の更新に失敗しました';
      console.error('Update inventory item error:', err);
      throw err;
    } finally {
      isLoading = false;
    }
  }

  // 在庫の移動
  async function moveInventory(movement: Omit<InventoryMovement, 'id' | 'requestedAt'>) {
    isLoading = true;
    error = null;
    try {
      await simulateDelay();
      const newMovement: InventoryMovement = {
        ...movement,
        id: `move-${Date.now()}`,
        requestedAt: new Date()
      };
      
      movements = [...movements, newMovement];
      
      // 在庫アイテムの位置を更新
      const item = inventoryItems.find(i => i.id === movement.itemId);
      if (item) {
        await updateInventoryItem(item.id, {
          warehouseId: movement.toWarehouseId,
          areaId: movement.toAreaId,
          status: 'in_transit'
        });
        
        // 履歴に追加
        addHistory({
          itemId: item.id,
          action: 'moved',
          previousValue: { 
            warehouseId: movement.fromWarehouseId, 
            areaId: movement.fromAreaId 
          },
          newValue: { 
            warehouseId: movement.toWarehouseId, 
            areaId: movement.toAreaId 
          },
          reason: movement.reason,
          performedBy: movement.requestedBy
        });
      }
      
      return newMovement;
    } catch (err) {
      error = '在庫の移動に失敗しました';
      throw err;
    } finally {
      isLoading = false;
    }
  }

  // 在庫の削除
  async function deleteInventoryItem(id: string) {
    isLoading = true;
    error = null;
    try {
      await simulateDelay();
      const item = inventoryItems.find(i => i.id === id);
      if (!item) throw new Error('在庫アイテムが見つかりません');
      
      inventoryItems = inventoryItems.filter(i => i.id !== id);
      
      // 履歴に追加
      addHistory({
        itemId: id,
        action: 'deleted',
        previousValue: item,
        newValue: null,
        reason: '削除',
        performedBy: 'デモユーザー'
      });
      
      // 倉庫の使用量を更新
      updateWarehouseUsage(item.warehouseId, item.areaId, -item.quantity);
      
      return true;
    } catch (err) {
      error = '在庫の削除に失敗しました';
      throw err;
    } finally {
      isLoading = false;
    }
  }

  // フィルターの設定
  function setFilter(filter: InventoryFilter) {
    currentFilter = filter;
  }

  // 履歴の追加（内部用）
  function addHistory(entry: Omit<InventoryHistory, 'id' | 'performedAt'>) {
    const newEntry: InventoryHistory = {
      ...entry,
      id: `hist-${Date.now()}`,
      performedAt: new Date()
    };
    history = [...history, newEntry];
  }

  // 倉庫使用量の更新（内部用）
  function updateWarehouseUsage(warehouseId: string, areaId: string, quantityChange: number) {
    warehouses = warehouses.map(warehouse => {
      if (warehouse.id === warehouseId) {
        const newUsage = warehouse.currentUsage + quantityChange;
        const updatedAreas = warehouse.areas.map(area => {
          if (area.id === areaId) {
            return {
              ...area,
              currentUsage: area.currentUsage + quantityChange
            };
          }
          return area;
        });
        return {
          ...warehouse,
          currentUsage: newUsage,
          areas: updatedAreas
        };
      }
      return warehouse;
    });
  }

  // データの初期化（デモ用）
  function initializeWithDemoData(demoData: {
    warehouses: Warehouse[];
    inventoryItems: InventoryItem[];
    products: Product[];
    categories: Category[];
    tags: Tag[];
    alerts: InventoryAlert[];
  }) {
    warehouses = demoData.warehouses;
    inventoryItems = demoData.inventoryItems;
    products = demoData.products;
    categories = demoData.categories;
    tags = demoData.tags;
    alerts = demoData.alerts;
    movements = [];
    history = [];
  }

  return {
    // Getters
    get warehouses() { return warehouses; },
    get inventoryItems() { return inventoryItems; },
    get filteredItems() { return filteredItems; },
    get movements() { return movements; },
    get history() { return history; },
    get products() { return products; },
    get categories() { return categories; },
    get tags() { return tags; },
    get alerts() { return alerts; },
    get dashboardStats() { return dashboardStats; },
    get isLoading() { return isLoading; },
    get error() { return error; },
    get currentFilter() { return currentFilter; },
    
    // Methods
    loadWarehouses,
    loadInventoryItems,
    addInventoryItem,
    updateInventoryItem,
    moveInventory,
    deleteInventoryItem,
    setFilter,
    initializeWithDemoData
  };
}

// ストアのインスタンスをエクスポート
export const inventoryStore = createInventoryStore();