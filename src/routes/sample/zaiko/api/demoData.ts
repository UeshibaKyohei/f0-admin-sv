// デモデータ生成
import type { 
  Warehouse, 
  WarehouseArea, 
  InventoryItem, 
  Product, 
  Category, 
  Tag,
  ProductAttribute,
  InventoryAlert 
} from '../types';

// カテゴリデータ
export const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'IT機器', code: 'IT', parentId: undefined, sortOrder: 1, isActive: true },
  { id: 'cat-2', name: 'オフィス家具', code: 'FUR', parentId: undefined, sortOrder: 2, isActive: true },
  { id: 'cat-3', name: '事務用品', code: 'OFF', parentId: undefined, sortOrder: 3, isActive: true },
  { id: 'cat-4', name: '電子機器', code: 'ELEC', parentId: undefined, sortOrder: 4, isActive: true },
  // サブカテゴリ
  { id: 'cat-1-1', name: 'PC・ノートPC', code: 'IT-PC', parentId: 'cat-1', sortOrder: 1, isActive: true },
  { id: 'cat-1-2', name: '周辺機器', code: 'IT-PER', parentId: 'cat-1', sortOrder: 2, isActive: true },
  { id: 'cat-1-3', name: 'ネットワーク機器', code: 'IT-NET', parentId: 'cat-1', sortOrder: 3, isActive: true },
];

// タグデータ
export const DEMO_TAGS: Tag[] = [
  { id: 'tag-1', name: '新商品', color: 'badge-primary' },
  { id: 'tag-2', name: '在庫僅少', color: 'badge-warning' },
  { id: 'tag-3', name: '人気商品', color: 'badge-success' },
  { id: 'tag-4', name: '要検査', color: 'badge-error' },
  { id: 'tag-5', name: '長期保管', color: 'badge-info' },
  { id: 'tag-6', name: 'エコ商品', color: 'badge-accent' },
];

// 製品リスト（デモ用）
const DEMO_PRODUCTS: Partial<Product>[] = [
  { 
    name: 'ノートPC Dell Latitude', 
    sku: 'LT-DELL-001',
    categoryId: 'cat-1-1',
    tags: ['tag-3'],
    manufacturer: 'Dell',
    model: 'Latitude 5520',
    unit: '台',
    minStockLevel: 5,
    reorderPoint: 10,
    reorderQuantity: 20,
    attributes: [
      { id: 'attr-1', name: 'CPU', value: 'Intel Core i5', sortOrder: 1 },
      { id: 'attr-2', name: 'メモリ', value: '8GB', sortOrder: 2 },
      { id: 'attr-3', name: 'ストレージ', value: '256GB SSD', sortOrder: 3 }
    ]
  },
  { name: 'モニター 24インチ', sku: 'MON-24-001' },
  { name: 'キーボード ワイヤレス', sku: 'KB-WL-001' },
  { name: 'マウス ワイヤレス', sku: 'MS-WL-001' },
  { name: 'USBハブ 4ポート', sku: 'USB-HUB-001' },
  { name: 'HDMIケーブル 2m', sku: 'CBL-HDMI-002' },
  { name: 'LANケーブル Cat6 5m', sku: 'CBL-LAN-005' },
  { name: 'オフィスチェア エルゴノミクス', sku: 'CHR-ERG-001' },
  { name: 'デスク 140×70cm', sku: 'DSK-140-001' },
  { name: 'プリンター複合機', sku: 'PRN-MFP-001' },
  { name: 'トナーカートリッジ 黒', sku: 'TNR-BLK-001' },
  { name: 'コピー用紙 A4 500枚', sku: 'PPR-A4-500' },
  { name: 'ボールペン 黒 12本入', sku: 'PEN-BLK-012' },
  { name: 'ノート A4 5冊セット', sku: 'NTB-A4-005' },
  { name: 'ファイルボックス', sku: 'FBX-STD-001' },
  { name: 'ホワイトボード 90×60cm', sku: 'WBD-090-001' },
  { name: 'プロジェクター フルHD', sku: 'PRJ-FHD-001' },
  { name: 'ウェブカメラ 1080p', sku: 'CAM-HD-001' },
  { name: 'ヘッドセット ノイズキャンセリング', sku: 'HDS-NC-001' },
  { name: '延長コード 3m 6口', sku: 'PWR-EXT-003' }
];

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

// 在庫アイテムの生成
export function generateInventoryItems(warehouses: Warehouse[]): InventoryItem[] {
  const items: InventoryItem[] = [];
  const statuses: InventoryItem['status'][] = ['available', 'reserved', 'damaged', 'in_transit'];
  const units = ['個', '箱', 'パレット'];
  
  let itemId = 1;
  
  // 各倉庫に在庫を配置
  warehouses.forEach(warehouse => {
    // 各倉庫に10-20個の在庫アイテムを生成
    const itemCount = 10 + Math.floor(Math.random() * 11);
    
    for (let i = 0; i < itemCount; i++) {
      const product = DEMO_PRODUCTS[Math.floor(Math.random() * DEMO_PRODUCTS.length)];
      const area = warehouse.areas[Math.floor(Math.random() * warehouse.areas.length)];
      const hasRfid = Math.random() > 0.3; // 70%の確率でRFIDタグ付き
      const hasExpiry = product.name.includes('トナー') || product.name.includes('用紙'); // 一部商品は有効期限あり
      
      const item: InventoryItem = {
        id: `item-${itemId++}`,
        productId: `prod-${itemId}`,
        productName: product.name,
        sku: product.sku,
        quantity: Math.floor(Math.random() * 100) + 1,
        unit: units[Math.floor(Math.random() * units.length)],
        warehouseId: warehouse.id,
        areaId: area.id,
        location: `${area.code} 棚${Math.floor(Math.random() * 5) + 1}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        rfidTag: hasRfid ? `RFID-${Date.now()}-${itemId}` : undefined,
        lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 過去30日以内
        expiryDate: hasExpiry 
          ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000) // 今後1年以内
          : undefined,
        lotNumber: hasExpiry ? `LOT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}` : undefined
      };
      
      items.push(item);
    }
  });
  
  return items;
}

// 初期デモデータの生成
export function generateInitialDemoData() {
  const warehouses = generateWarehouses();
  const inventoryItems = generateInventoryItems(warehouses);
  
  return {
    warehouses,
    inventoryItems
  };
}