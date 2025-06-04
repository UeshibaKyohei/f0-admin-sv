// API通信クライアント
// DEMO_MODEがtrueの場合はモックデータを返却、falseの場合は実際のAPIを呼び出し

import { DEMO_MODE, DEMO_DELAY, API_CONFIG } from '../constants';
import { generateInitialDemoData } from './demoDataV2';
import type { 
  InventoryItem, 
  Warehouse, 
  Product, 
  Category, 
  Tag, 
  InventoryAlert,
  InventoryMovement,
  InventoryHistory
} from '../types';

/**
 * APIレスポンス共通型
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * API遅延シミュレーション
 */
function simulateDelay(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, DEMO_DELAY));
}

/**
 * HTTPクライアント（本実装時にfetch関数を使用）
 */
async function httpClient<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  if (DEMO_MODE) {
    // DEMOモードでは実際のHTTP通信は行わない
    await simulateDelay();
    throw new Error('Demo mode: HTTP requests are disabled');
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        // 本実装時: 認証ヘッダーなどを追加
        // 'Authorization': `Bearer ${token}`,
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * 在庫管理API
 */
export const inventoryApi = {
  /**
   * 在庫一覧取得
   * 本実装時: GET /api/v1/inventory?warehouse_id={id}&limit={limit}&offset={offset}
   */
  async getInventoryItems(warehouseId?: string): Promise<ApiResponse<InventoryItem[]>> {
    if (DEMO_MODE) {
      await simulateDelay();
      const demoData = generateInitialDemoData();
      let items = demoData.inventoryItems;
      
      if (warehouseId) {
        items = items.filter(item => item.warehouseId === warehouseId);
      }
      
      return { success: true, data: items };
    }

    // 本実装時のAPI呼び出し
    const endpoint = warehouseId 
      ? `${API_CONFIG.ENDPOINTS.INVENTORY.LIST}?warehouse_id=${warehouseId}`
      : API_CONFIG.ENDPOINTS.INVENTORY.LIST;
    
    return httpClient<InventoryItem[]>(endpoint);
  },

  /**
   * 在庫アイテム作成
   * 本実装時: POST /api/v1/inventory
   */
  async createInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<InventoryItem>> {
    if (DEMO_MODE) {
      await simulateDelay();
      const newItem: InventoryItem = {
        ...item,
        id: `item-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return { success: true, data: newItem };
    }

    return httpClient<InventoryItem>(API_CONFIG.ENDPOINTS.INVENTORY.CREATE, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  /**
   * 在庫アイテム更新
   * 本実装時: PUT /api/v1/inventory/{id}
   */
  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> {
    if (DEMO_MODE) {
      await simulateDelay();
      // モックでは更新されたアイテムを返却
      return { 
        success: true, 
        data: { 
          ...updates, 
          id, 
          updatedAt: new Date() 
        } as InventoryItem 
      };
    }

    const endpoint = API_CONFIG.ENDPOINTS.INVENTORY.UPDATE.replace(':id', id);
    return httpClient<InventoryItem>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * 在庫アイテム削除
   * 本実装時: DELETE /api/v1/inventory/{id}
   */
  async deleteInventoryItem(id: string): Promise<ApiResponse<void>> {
    if (DEMO_MODE) {
      await simulateDelay();
      return { success: true };
    }

    const endpoint = API_CONFIG.ENDPOINTS.INVENTORY.DELETE.replace(':id', id);
    return httpClient<void>(endpoint, {
      method: 'DELETE',
    });
  },

  /**
   * 在庫移動
   * 本実装時: POST /api/v1/inventory/{id}/move
   */
  async moveInventory(movement: Omit<InventoryMovement, 'id' | 'requestedAt'>): Promise<ApiResponse<InventoryMovement>> {
    if (DEMO_MODE) {
      await simulateDelay();
      const newMovement: InventoryMovement = {
        ...movement,
        id: `move-${Date.now()}`,
        requestedAt: new Date(),
      };
      return { success: true, data: newMovement };
    }

    const endpoint = API_CONFIG.ENDPOINTS.INVENTORY.MOVE.replace(':id', movement.itemId);
    return httpClient<InventoryMovement>(endpoint, {
      method: 'POST',
      body: JSON.stringify(movement),
    });
  }
};

/**
 * 倉庫管理API
 */
export const warehouseApi = {
  /**
   * 倉庫一覧取得
   * 本実装時: GET /api/v1/warehouses
   */
  async getWarehouses(): Promise<ApiResponse<Warehouse[]>> {
    if (DEMO_MODE) {
      await simulateDelay();
      const demoData = generateInitialDemoData();
      return { success: true, data: demoData.warehouses };
    }

    return httpClient<Warehouse[]>(API_CONFIG.ENDPOINTS.WAREHOUSES.LIST);
  },

  /**
   * 倉庫エリア取得
   * 本実装時: GET /api/v1/warehouses/{id}/areas
   */
  async getWarehouseAreas(warehouseId: string): Promise<ApiResponse<any[]>> {
    if (DEMO_MODE) {
      await simulateDelay();
      const demoData = generateInitialDemoData();
      const warehouse = demoData.warehouses.find(w => w.id === warehouseId);
      return { success: true, data: warehouse?.areas || [] };
    }

    const endpoint = API_CONFIG.ENDPOINTS.WAREHOUSES.AREAS.replace(':id', warehouseId);
    return httpClient<any[]>(endpoint);
  }
};

/**
 * 商品マスタAPI
 */
export const productApi = {
  /**
   * 商品一覧取得
   * 本実装時: GET /api/v1/products?category_id={id}&limit={limit}&offset={offset}
   */
  async getProducts(categoryId?: string): Promise<ApiResponse<Product[]>> {
    if (DEMO_MODE) {
      await simulateDelay();
      const demoData = generateInitialDemoData();
      let products = demoData.products;
      
      if (categoryId) {
        products = products.filter(p => p.categoryId === categoryId);
      }
      
      return { success: true, data: products };
    }

    const endpoint = categoryId 
      ? `${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?category_id=${categoryId}`
      : API_CONFIG.ENDPOINTS.PRODUCTS.LIST;
    
    return httpClient<Product[]>(endpoint);
  },

  /**
   * カテゴリ一覧取得
   * 本実装時: GET /api/v1/products/categories
   */
  async getCategories(): Promise<ApiResponse<Category[]>> {
    if (DEMO_MODE) {
      await simulateDelay();
      const demoData = generateInitialDemoData();
      return { success: true, data: demoData.categories };
    }

    return httpClient<Category[]>(API_CONFIG.ENDPOINTS.PRODUCTS.CATEGORIES);
  },

  /**
   * タグ一覧取得
   * 本実装時: GET /api/v1/products/tags
   */
  async getTags(): Promise<ApiResponse<Tag[]>> {
    if (DEMO_MODE) {
      await simulateDelay();
      const demoData = generateInitialDemoData();
      return { success: true, data: demoData.tags };
    }

    return httpClient<Tag[]>(API_CONFIG.ENDPOINTS.PRODUCTS.TAGS);
  }
};

/**
 * RFID管理API
 */
export const rfidApi = {
  /**
   * RFIDスキャン
   * 本実装時: POST /api/v1/rfid/scan
   */
  async scanRfid(rfidTag: string): Promise<ApiResponse<InventoryItem | null>> {
    if (DEMO_MODE) {
      await simulateDelay();
      // モックでは適当な在庫アイテムを返却
      const demoData = generateInitialDemoData();
      const item = demoData.inventoryItems.find(i => i.rfidTag === rfidTag);
      return { success: true, data: item || null };
    }

    return httpClient<InventoryItem | null>(API_CONFIG.ENDPOINTS.RFID.SCAN, {
      method: 'POST',
      body: JSON.stringify({ rfidTag }),
    });
  },

  /**
   * RFID一括登録
   * 本実装時: POST /api/v1/rfid/bulk-register
   */
  async bulkRegisterRfid(updates: { itemId: string, rfidTag: string }[]): Promise<ApiResponse<void>> {
    if (DEMO_MODE) {
      await simulateDelay();
      return { success: true };
    }

    return httpClient<void>(API_CONFIG.ENDPOINTS.RFID.BULK_REGISTER, {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }
};

/**
 * アラート管理API
 */
export const alertApi = {
  /**
   * アラート一覧取得
   * 本実装時: GET /api/v1/alerts?is_active={boolean}
   */
  async getAlerts(isActive?: boolean): Promise<ApiResponse<InventoryAlert[]>> {
    if (DEMO_MODE) {
      await simulateDelay();
      const demoData = generateInitialDemoData();
      let alerts = demoData.alerts;
      
      if (isActive !== undefined) {
        alerts = alerts.filter(a => a.isActive === isActive);
      }
      
      return { success: true, data: alerts };
    }

    const endpoint = isActive !== undefined 
      ? `${API_CONFIG.ENDPOINTS.ALERTS.LIST}?is_active=${isActive}`
      : API_CONFIG.ENDPOINTS.ALERTS.LIST;
    
    return httpClient<InventoryAlert[]>(endpoint);
  },

  /**
   * アラート作成
   * 本実装時: POST /api/v1/alerts
   */
  async createAlert(alert: Omit<InventoryAlert, 'id' | 'createdAt' | 'triggeredAt'>): Promise<ApiResponse<InventoryAlert>> {
    if (DEMO_MODE) {
      await simulateDelay();
      const newAlert: InventoryAlert = {
        ...alert,
        id: `alert-${Date.now()}`,
        createdAt: new Date(),
        triggeredAt: alert.isActive ? new Date() : null,
      };
      return { success: true, data: newAlert };
    }

    return httpClient<InventoryAlert>(API_CONFIG.ENDPOINTS.ALERTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(alert),
    });
  }
};

/**
 * 履歴API
 */
export const historyApi = {
  /**
   * 履歴一覧取得
   * 本実装時: GET /api/v1/history?item_id={id}&limit={limit}&offset={offset}
   */
  async getHistory(itemId?: string, limit: number = 50): Promise<ApiResponse<InventoryHistory[]>> {
    if (DEMO_MODE) {
      await simulateDelay();
      const demoData = generateInitialDemoData();
      let history = demoData.history;
      
      if (itemId) {
        history = history.filter(h => h.itemId === itemId);
      }
      
      return { success: true, data: history.slice(0, limit) };
    }

    const params = new URLSearchParams();
    if (itemId) params.append('item_id', itemId);
    params.append('limit', limit.toString());
    
    const endpoint = `${API_CONFIG.ENDPOINTS.HISTORY.LIST}?${params.toString()}`;
    return httpClient<InventoryHistory[]>(endpoint);
  }
};