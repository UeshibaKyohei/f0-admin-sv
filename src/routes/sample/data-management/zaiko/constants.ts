// 在庫管理システムの定数定義

// 在庫ステータス
export const INVENTORY_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  DAMAGED: 'damaged',
  IN_TRANSIT: 'in_transit'
} as const;

// 在庫ステータスの表示名
export const INVENTORY_STATUS_LABELS: Record<string, string> = {
  available: '利用可能',
  reserved: '予約済み',
  damaged: '破損',
  in_transit: '輸送中'
};

// 在庫ステータスの色
export const INVENTORY_STATUS_COLORS: Record<string, string> = {
  available: 'success',
  reserved: 'warning',
  damaged: 'error',
  in_transit: 'info'
};

// 倉庫タイプ
export const WAREHOUSE_TYPES = {
  INTERNAL: 'internal',
  EXTERNAL: 'external',
  BPO: 'bpo'
} as const;

// 倉庫タイプの表示名
export const WAREHOUSE_TYPE_LABELS: Record<string, string> = {
  internal: '社内倉庫',
  external: '外部倉庫',
  bpo: 'BPOセンター'
};

// 在庫移動ステータス
export const MOVEMENT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

// 在庫移動ステータスの表示名
export const MOVEMENT_STATUS_LABELS: Record<string, string> = {
  pending: '保留中',
  in_progress: '処理中',
  completed: '完了',
  cancelled: 'キャンセル'
};

// 在庫アクション
export const INVENTORY_ACTIONS = {
  CREATED: 'created',
  UPDATED: 'updated',
  MOVED: 'moved',
  DELETED: 'deleted',
  ADJUSTED: 'adjusted'
} as const;

// 在庫アクションの表示名
export const INVENTORY_ACTION_LABELS: Record<string, string> = {
  created: '新規登録',
  updated: '更新',
  moved: '移動',
  deleted: '削除',
  adjusted: '数量調整'
};

// 単位の選択肢
export const UNIT_OPTIONS = [
  { value: 'piece', label: '個' },
  { value: 'box', label: '箱' },
  { value: 'pallet', label: 'パレット' },
  { value: 'kg', label: 'kg' },
  { value: 'liter', label: 'リットル' },
  { value: 'meter', label: 'メートル' }
];

// ページネーション
export const ITEMS_PER_PAGE = 20;

// 在庫警告閾値
export const LOW_STOCK_THRESHOLD = 10;

// デモモード設定
export const DEMO_MODE = true;
export const DEMO_DELAY = 500; // ミリ秒

// API設定
export const API_CONFIG = {
  // 本実装時は実際のAPIエンドポイントに変更
  BASE_URL: DEMO_MODE ? '/api/mock' : '/api/v1',
  ENDPOINTS: {
    // 在庫管理API
    INVENTORY: {
      LIST: '/inventory',
      CREATE: '/inventory',
      UPDATE: '/inventory/:id',
      DELETE: '/inventory/:id',
      MOVE: '/inventory/:id/move',
      BULK_UPDATE: '/inventory/bulk'
    },
    // 倉庫管理API
    WAREHOUSES: {
      LIST: '/warehouses',
      AREAS: '/warehouses/:id/areas'
    },
    // 商品マスタAPI
    PRODUCTS: {
      LIST: '/products',
      CATEGORIES: '/products/categories',
      TAGS: '/products/tags'
    },
    // RFID管理API
    RFID: {
      SCAN: '/rfid/scan',
      REGISTER: '/rfid/register',
      BULK_REGISTER: '/rfid/bulk-register'
    },
    // アラート管理API
    ALERTS: {
      LIST: '/alerts',
      CREATE: '/alerts',
      UPDATE: '/alerts/:id',
      DELETE: '/alerts/:id'
    },
    // 履歴API
    HISTORY: {
      LIST: '/history',
      ITEM: '/history/item/:id'
    }
  }
};

// Mock表示設定
export const MOCK_UI_CONFIG = {
  // デバッグパネルの表示
  SHOW_DEBUG_PANEL: DEMO_MODE,
  // サンプルデータ生成ボタンの表示
  SHOW_SAMPLE_BUTTONS: DEMO_MODE,
  // Mock APIレスポンス時間の表示
  SHOW_API_TIMING: DEMO_MODE
};