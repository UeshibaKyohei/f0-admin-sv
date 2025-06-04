// 在庫管理システムの型定義
// RDB設計: PostgreSQL想定、プライマリキーは全てUUID(v4)、作成・更新日時は自動設定

/**
 * カテゴリマスタテーブル: categories
 * - 階層構造対応（parent_id による自己参照）
 * - インデックス: parent_id, code, sort_order
 */
export interface Category {
  id: string;
  name: string;
  parentId?: string; // 親カテゴリID（階層構造対応）
  code: string; // カテゴリコード
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

/**
 * タグマスタテーブル: tags
 * - 商品とは多対多の関係（product_tags中間テーブル経由）
 * - インデックス: name
 */
export interface Tag {
  id: string;
  name: string;
  color: string; // DaisyUIのカラークラス名
  description?: string;
}

/**
 * 商品属性テーブル: product_attributes
 * - 商品の規格・仕様情報（サイズ、色、電圧など）
 * - 外部キー: product_id
 * - インデックス: product_id, name
 */
export interface ProductAttribute {
  id: string;
  name: string; // 例: "サイズ", "色", "電圧"
  value: string; // 例: "A4", "黒", "100V"
  unit?: string; // 例: "mm", "V", "kg"
  sortOrder: number;
}

/**
 * 商品マスタテーブル: products
 * - 外部キー: category_id → categories.id
 * - 多対多: tags (product_tags中間テーブル経由)
 * - 一対多: product_attributes
 * - インデックス: sku, jan_code, category_id, name
 * - 論理削除: is_active
 */
export interface Product {
  id: string;
  name: string;
  sku: string;
  janCode?: string; // JANコード
  categoryId: string;
  subCategoryIds?: string[]; // 複数カテゴリ対応
  tags: string[]; // タグID配列
  attributes: ProductAttribute[]; // 商品属性
  description?: string;
  manufacturer?: string; // メーカー
  model?: string; // 型番
  unit: string; // 基本単位
  minStockLevel: number; // 最小在庫数（アラート基準）
  maxStockLevel?: number; // 最大在庫数
  reorderPoint: number; // 発注点
  reorderQuantity: number; // 発注数量
  leadTimeDays?: number; // リードタイム（日）
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 倉庫マスタテーブル: warehouses
 * - 一対多: warehouse_areas
 * - インデックス: name, type
 * - 使用量は集計値（リアルタイム計算 or バッチ更新）
 */
export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number; // 最大収容可能数
  currentUsage: number; // 現在の使用量
  areas: WarehouseArea[]; // 倉庫内のエリア
  type: 'internal' | 'external' | 'bpo'; // 社内/外部/BPOセンター
}

/**
 * 倉庫エリアテーブル: warehouse_areas
 * - 外部キー: warehouse_id → warehouses.id
 * - インデックス: warehouse_id, code, floor
 * - 複合インデックス: (floor, row, column) - 位置の一意性担保
 */
export interface WarehouseArea {
  id: string;
  warehouseId: string;
  name: string;
  code: string; // エリアコード（例：A-1-1）
  capacity: number;
  currentUsage: number;
  location: {
    floor: number;
    row: string;
    column: number;
  };
}

/**
 * 在庫アイテムテーブル: inventory_items
 * - 外部キー: product_id → products.id, warehouse_id → warehouses.id, area_id → warehouse_areas.id
 * - インデックス: product_id, warehouse_id, area_id, status, rfid_tag, serial_number
 * - 複合インデックス: (warehouse_id, area_id), (product_id, warehouse_id)
 * - ユニーク制約: rfid_tag, serial_number (NULLでない場合)
 */
export interface InventoryItem {
  id: string;
  productId: string;
  product?: Product; // 商品マスター情報（JOIN用）
  quantity: number;
  unit: string; // 単位（個、箱、パレットなど）
  warehouseId: string;
  warehouse?: Warehouse; // 倉庫情報（JOIN用）
  areaId: string;
  area?: WarehouseArea; // エリア情報（JOIN用）
  location: string; // 詳細な位置情報
  status: 'available' | 'reserved' | 'damaged' | 'in_transit';
  rfidTag?: string; // RFIDタグ（オプション）
  serialNumber?: string; // シリアル番号（オプション）
  batchNumber?: string; // バッチ番号（オプション）
  lotNumber?: string; // ロット番号（オプション）
  manufacturingDate?: Date; // 製造日
  expiryDate?: Date; // 有効期限
  lastInspectionDate?: Date; // 最終検査日
  nextInspectionDate?: Date; // 次回検査日
  cost?: number; // 仕入原価
  notes?: string; // 備考
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // 登録者
  updatedBy?: string; // 最終更新者
}

// 在庫アラートの型定義
export interface InventoryAlert {
  id: string;
  productId: string;
  warehouseId?: string; // 特定倉庫のみ or 全倉庫
  alertType: 'low_stock' | 'overstock' | 'expiry' | 'inspection_due' | 'no_movement';
  threshold: number; // 閾値
  thresholdUnit?: string; // 閾値の単位（日数、個数など）
  isActive: boolean;
  notificationEmails?: string[]; // 通知先メールアドレス
  notificationChannels: ('email' | 'slack' | 'teams' | 'in_app')[];
  lastTriggered?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 在庫移動の型定義
export interface InventoryMovement {
  id: string;
  itemId: string;
  fromWarehouseId: string;
  fromAreaId: string;
  toWarehouseId: string;
  toAreaId: string;
  quantity: number;
  reason: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  requestedBy: string;
  requestedAt: Date;
  completedAt?: Date;
}

// 在庫履歴の型定義
export interface InventoryHistory {
  id: string;
  itemId: string;
  action: 'created' | 'updated' | 'moved' | 'deleted' | 'adjusted';
  previousValue: any;
  newValue: any;
  reason: string;
  performedBy: string;
  performedAt: Date;
}

// 検索フィルターの型定義
export interface InventoryFilter {
  keyword?: string;
  warehouseId?: string;
  areaId?: string;
  status?: InventoryItem['status'];
  rfidTag?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// ダッシュボード統計の型定義
export interface DashboardStats {
  totalItems: number;
  totalWarehouses: number;
  totalValue: number;
  lowStockItems: number;
  expiringItems: number; // 期限切れ間近の商品数
  activeAlerts: number; // アクティブなアラート数
  recentMovements: InventoryMovement[];
  warehouseUtilization: {
    warehouseId: string;
    warehouseName: string;
    utilizationRate: number;
  }[];
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    itemCount: number;
    totalValue: number;
  }[];
}