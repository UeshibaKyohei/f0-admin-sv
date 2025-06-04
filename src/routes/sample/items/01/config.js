/**
 * ECサイト商品管理システム設定
 * 
 * このファイルはシステムの動作モードや各種設定を管理します。
 * 本番環境では環境変数から設定を読み込むことを想定しています。
 */

// 動作モード設定
export const CONFIG = {
  // モックモードフラグ
  // true: ローカルストレージを使用したデモモード
  // false: API通信を行う本番モード
  IS_MOCK_MODE: true,
  
  // API設定（本番モード時に使用）
  API: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    TIMEOUT: 30000,
    RETRY_COUNT: 3
  },
  
  // ページネーション設定
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 12,
    PAGE_SIZE_OPTIONS: [12, 24, 48, 96]
  },
  
  // ファイルアップロード設定
  FILE_UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
    MAX_FILES_PER_PRODUCT: 10
  },
  
  // 在庫管理設定
  INVENTORY: {
    LOW_STOCK_THRESHOLD: 10,
    WARNING_DAYS_BEFORE_EXPIRY: 30
  },
  
  // UI設定
  UI: {
    SHOW_MOCK_CONTROLS: true, // モック用コントロールの表示
    DEFAULT_VIEW_MODE: 'grid',
    ANIMATION_DURATION: 300
  }
};

// 機能フラグ
export const FEATURES = {
  // 価格履歴機能
  PRICE_HISTORY: true,
  // 在庫履歴機能
  STOCK_HISTORY: true,
  // 一括インポート/エクスポート機能
  BULK_OPERATIONS: false,
  // AI商品説明生成機能
  AI_DESCRIPTION: false,
  // バーコードスキャン機能
  BARCODE_SCAN: false
};

// 検証ルール
export const VALIDATION = {
  PRODUCT: {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 200,
    DESCRIPTION_MAX_LENGTH: 2000,
    PRICE_MIN: 0,
    PRICE_MAX: 999999999,
    STOCK_MIN: 0,
    STOCK_MAX: 999999
  },
  CATEGORY: {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    MAX_DEPTH: 5
  },
  TAG: {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 50,
    MAX_TAGS_PER_PRODUCT: 10
  }
};

// ステータス定義
export const STATUS = {
  PRODUCT: {
    ACTIVE: { value: 'active', label: '販売中', color: 'badge-primary' },
    INACTIVE: { value: 'inactive', label: '非公開', color: 'badge-ghost' },
    DISCONTINUED: { value: 'discontinued', label: '販売終了', color: 'badge-error' }
  },
  STOCK: {
    IN_STOCK: { value: 'in_stock', label: '在庫あり', color: 'badge-success' },
    LOW_STOCK: { value: 'low_stock', label: '在庫少', color: 'badge-warning' },
    OUT_OF_STOCK: { value: 'out_of_stock', label: '在庫切れ', color: 'badge-error' }
  }
};

// デフォルト値
export const DEFAULTS = {
  PRODUCT: {
    status: 'active',
    stock: 0,
    price: 0,
    images: [],
    resources: [],
    tags: []
  },
  FILTERS: {
    search: '',
    categoryId: null,
    tags: [],
    stockStatus: [],
    priceRange: { min: null, max: null },
    status: [],
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  }
};