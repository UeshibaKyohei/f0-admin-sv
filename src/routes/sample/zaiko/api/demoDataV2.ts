// 拡張版デモデータ生成
import type { Warehouse, WarehouseArea, InventoryItem, InventoryAlert, Product } from '../types';
import { generateProducts, DEMO_CATEGORIES, DEMO_TAGS } from './masterData';

// エリアコードの生成
function generateAreaCode(floor: number, row: string, column: number): string {
  return `${floor}F-${row}-${column}`;
}

// 倉庫エリアの生成
function generateWarehouseAreas(warehouseId: string, floors: number = 2): WarehouseArea[] {
  const areas: WarehouseArea[] = [];
  const rows = ['A', 'B', 'C', 'D'];
  
  for (let floor = 1; floor <= floors; floor++) {
    for (const row of rows) {
      for (let column = 1; column <= 4; column++) {
        const area: WarehouseArea = {
          id: `area-${warehouseId}-${floor}${row}${column}`,
          warehouseId,
          name: `${floor}階 ${row}列 ${column}番`,
          code: generateAreaCode(floor, row, column),
          capacity: 100,
          currentUsage: Math.floor(Math.random() * 80),
          location: { floor, row, column }
        };
        areas.push(area);
      }
    }
  }
  
  return areas;
}

// 倉庫データの生成
export function generateWarehouses(): Warehouse[] {
  const warehouses: Warehouse[] = [
    {
      id: 'wh-001',
      name: '本社倉庫',
      location: '東京都千代田区丸の内1-1-1 本社ビル B1F',
      capacity: 5000,
      currentUsage: 3200,
      type: 'internal',
      areas: generateWarehouseAreas('wh-001', 2)
    },
    {
      id: 'wh-002',
      name: '第2倉庫',
      location: '東京都江東区有明3-5-7 倉庫棟',
      capacity: 8000,
      currentUsage: 5600,
      type: 'internal',
      areas: generateWarehouseAreas('wh-002', 3)
    },
    {
      id: 'wh-003',
      name: '外部委託倉庫',
      location: '千葉県市川市塩浜2-10-1',
      capacity: 10000,
      currentUsage: 7200,
      type: 'external',
      areas: generateWarehouseAreas('wh-003', 2)
    },
    {
      id: 'wh-004',
      name: 'BPOセンター倉庫',
      location: '埼玉県さいたま市大宮区桜木町4-333',
      capacity: 3000,
      currentUsage: 1800,
      type: 'bpo',
      areas: generateWarehouseAreas('wh-004', 1)
    }
  ];
  
  return warehouses;
}

// 在庫アイテムの生成（拡張版）
export function generateInventoryItems(warehouses: Warehouse[], products: Product[]): InventoryItem[] {
  const items: InventoryItem[] = [];
  const statuses: InventoryItem['status'][] = ['available', 'reserved', 'damaged', 'in_transit'];
  const now = new Date();
  let itemId = 1;
  
  // 各倉庫に在庫を配置
  warehouses.forEach(warehouse => {
    // 各倉庫に商品を配置（商品ごとに複数個の在庫を持つ可能性）
    products.forEach(product => {
      // 70%の確率でその倉庫に在庫を配置
      if (Math.random() > 0.3) {
        const area = warehouse.areas[Math.floor(Math.random() * warehouse.areas.length)];
        const hasRfid = Math.random() > 0.3; // 70%の確率でRFIDタグ付き
        const hasSerial = product.categoryId === 'cat-1-1' || product.categoryId === 'cat-4'; // PCや電子機器はシリアル番号付き
        const hasBatch = product.categoryId === 'cat-3-2'; // 用紙類はバッチ番号付き
        
        // 在庫数をランダムに設定（最小在庫数を考慮）
        const baseQuantity = Math.max(1, Math.floor(product.minStockLevel * (0.5 + Math.random() * 2)));
        
        const item: InventoryItem = {
          id: `item-${itemId++}`,
          productId: product.id,
          product: product, // 商品情報を含む
          quantity: baseQuantity,
          unit: product.unit,
          warehouseId: warehouse.id,
          warehouse: warehouse,
          areaId: area.id,
          area: area,
          location: `${area.code} 棚${Math.floor(Math.random() * 5) + 1}`,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          rfidTag: hasRfid ? `RFID-${Date.now()}-${itemId}` : undefined,
          serialNumber: hasSerial ? `SN-${product.sku}-${String(itemId).padStart(6, '0')}` : undefined,
          batchNumber: hasBatch ? `BATCH-${new Date().getFullYear()}${String(Math.floor(Math.random() * 999)).padStart(3, '0')}` : undefined,
          lotNumber: product.categoryId === 'cat-3-2' ? `LOT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}` : undefined,
          manufacturingDate: hasBatch ? new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000) : undefined,
          expiryDate: product.categoryId === 'cat-3-2' 
            ? new Date(now.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000) // 今後1年以内
            : undefined,
          cost: Math.random() * 100000, // ランダムな原価
          createdAt: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          createdBy: 'デモユーザー',
          updatedBy: 'デモユーザー'
        };
        
        items.push(item);
      }
    });
  });
  
  return items;
}

// 在庫アラートの生成
export function generateInventoryAlerts(products: Product[]): InventoryAlert[] {
  const alerts: InventoryAlert[] = [];
  const now = new Date();
  
  // 各商品に対してアラートを設定（50%の確率）
  products.forEach((product, index) => {
    if (Math.random() > 0.5) {
      alerts.push({
        id: `alert-${index + 1}`,
        productId: product.id,
        alertType: 'low_stock',
        threshold: product.minStockLevel,
        thresholdUnit: product.unit,
        isActive: true,
        notificationChannels: ['in_app', 'email'],
        notificationEmails: ['inventory@example.com'],
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: now
      });
    }
    
    // 有効期限がある商品には期限アラートを設定
    if (product.categoryId === 'cat-3-2' && Math.random() > 0.7) {
      alerts.push({
        id: `alert-exp-${index + 1}`,
        productId: product.id,
        alertType: 'expiry',
        threshold: 30, // 30日前に通知
        thresholdUnit: '日',
        isActive: true,
        notificationChannels: ['in_app'],
        createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: now
      });
    }
  });
  
  return alerts;
}

// 初期デモデータの生成（拡張版）
export function generateInitialDemoData() {
  const products = generateProducts();
  const warehouses = generateWarehouses();
  const inventoryItems = generateInventoryItems(warehouses, products);
  const alerts = generateInventoryAlerts(products);
  
  return {
    products,
    warehouses,
    inventoryItems,
    alerts,
    categories: DEMO_CATEGORIES,
    tags: DEMO_TAGS
  };
}