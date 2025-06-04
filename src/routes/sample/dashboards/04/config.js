/**
 * 在庫・物流管理ダッシュボード設定
 *
 * @description
 * サプライチェーン管理、在庫最適化、配送追跡に特化したダッシュボード設定。
 * リアルタイムモニタリングと予測分析機能を提供します。
 *
 * ===========================================
 * RDBスキーマ設計 (本番環境用データベース構造)
 * ===========================================
 *
 * 【warehouses】倉庫マスター
 * - id (BIGINT PRIMARY KEY)
 * - name (VARCHAR) 倉庫名
 * - location_lat (DECIMAL) 緯度
 * - location_lng (DECIMAL) 経度
 * - address (TEXT) 住所
 * - capacity (INT) 収容能力
 * - current_utilization (DECIMAL) 現在の使用率
 * - manager_id (BIGINT) 責任者ID
 * - status (ENUM: active, maintenance, closed)
 *
 * 【inventory】在庫データ
 * - id (BIGINT PRIMARY KEY)
 * - warehouse_id (BIGINT FK→warehouses.id)
 * - product_id (BIGINT FK→products.id)
 * - current_stock (INT) 現在庫数
 * - reserved_stock (INT) 予約済み在庫
 * - minimum_threshold (INT) 最低在庫基準
 * - maximum_threshold (INT) 最大在庫基準
 * - reorder_point (INT) 発注点
 * - last_updated (TIMESTAMP)
 *
 * 【products】商品マスター
 * - id (BIGINT PRIMARY KEY)
 * - sku (VARCHAR UNIQUE) 商品コード
 * - name (VARCHAR) 商品名
 * - category (VARCHAR) カテゴリ
 * - unit_cost (DECIMAL) 仕入単価
 * - unit_price (DECIMAL) 販売単価
 * - weight (DECIMAL) 重量
 * - dimensions (JSON) 寸法情報
 * - turnover_rate (DECIMAL) 回転率
 *
 * 【deliveries】配送データ
 * - id (BIGINT PRIMARY KEY)
 * - order_id (BIGINT) 注文ID
 * - warehouse_id (BIGINT FK→warehouses.id)
 * - vehicle_id (BIGINT FK→vehicles.id)
 * - destination_lat (DECIMAL) 配送先緯度
 * - destination_lng (DECIMAL) 配送先経度
 * - current_lat (DECIMAL) 現在位置緯度
 * - current_lng (DECIMAL) 現在位置経度
 * - status (ENUM: pending, in_transit, delivered, failed)
 * - estimated_arrival (TIMESTAMP) 予定到着時刻
 * - actual_arrival (TIMESTAMP) 実際到着時刻
 *
 * 【vehicles】車両マスター
 * - id (BIGINT PRIMARY KEY)
 * - license_plate (VARCHAR) ナンバープレート
 * - vehicle_type (ENUM: truck, van, motorcycle)
 * - capacity_kg (DECIMAL) 積載重量
 * - capacity_m3 (DECIMAL) 積載容積
 * - fuel_efficiency (DECIMAL) 燃費
 * - driver_id (BIGINT) 運転手ID
 * - current_status (ENUM: available, in_use, maintenance)
 *
 * 【inventory_movements】在庫移動履歴
 * - id (BIGINT PRIMARY KEY)
 * - warehouse_id (BIGINT FK→warehouses.id)
 * - product_id (BIGINT FK→products.id)
 * - movement_type (ENUM: inbound, outbound, transfer, adjustment)
 * - quantity (INT) 数量
 * - reference_id (BIGINT) 参照ID（注文・移動指示など）
 * - recorded_at (TIMESTAMP)
 * - recorded_by (BIGINT) 作業者ID
 */

export const config = {
	// ===========================================
	// モックデータ設定（開発・デモ用）
	// ===========================================
	// 本番環境では false に設定し、実際のAPIエンドポイントを使用
	USE_MOCK_DATA: true,

	// API エンドポイント（本番環境用）
	API_ENDPOINTS: {
		WAREHOUSES: '/api/v1/warehouses',
		INVENTORY: '/api/v1/inventory',
		PRODUCTS: '/api/v1/products',
		DELIVERIES: '/api/v1/deliveries',
		VEHICLES: '/api/v1/vehicles',
		MOVEMENTS: '/api/v1/inventory/movements',
		ANALYTICS: '/api/v1/logistics/analytics',
		PREDICTIONS: '/api/v1/logistics/predictions'
	},

	// リフレッシュ間隔（ミリ秒）
	REFRESH_INTERVALS: {
		DELIVERY_TRACKING: 15000, // 15秒（配送追跡）
		INVENTORY_LEVELS: 60000, // 1分（在庫レベル）
		WAREHOUSE_STATUS: 30000, // 30秒（倉庫状況）
		VEHICLE_LOCATIONS: 10000, // 10秒（車両位置）
		ALERTS: 5000 // 5秒（アラート）
	},

	// 在庫アラート設定
	INVENTORY_ALERTS: {
		CRITICAL_LOW: 5, // 在庫切れ危険（5%以下）
		LOW_STOCK: 20, // 在庫不足（20%以下）
		OVERSTOCK: 90, // 過剰在庫（90%以上）
		OUT_OF_STOCK: 0 // 在庫切れ
	},

	// 配送ステータス設定
	DELIVERY_STATUS: {
		PENDING: { color: 'warning', label: '準備中', priority: 1 },
		IN_TRANSIT: { color: 'info', label: '配送中', priority: 2 },
		DELIVERED: { color: 'success', label: '配送完了', priority: 3 },
		DELAYED: { color: 'error', label: '遅延', priority: 4 },
		FAILED: { color: 'error', label: '配送失敗', priority: 5 }
	},

	// 倉庫容量設定
	WAREHOUSE_CAPACITY: {
		EXCELLENT: 85, // 効率的利用（85%以下）
		GOOD: 95, // 適正利用（95%以下）
		WARNING: 98, // 要注意（98%以下）
		CRITICAL: 100 // 満杯状態
	},

	// 地図表示設定
	MAP_CONFIG: {
		DEFAULT_CENTER: { lat: 35.6762, lng: 139.6503 }, // 東京
		DEFAULT_ZOOM: 10,
		WAREHOUSE_ICON_SIZE: 32,
		VEHICLE_ICON_SIZE: 24,
		ROUTE_COLOR: '#3b82f6',
		ROUTE_WEIGHT: 4
	},

	// 商品カテゴリ設定（RDB: product_categories テーブルまたはENUMで管理推奨）
	PRODUCT_CATEGORIES: {
		electronics: { color: 'primary', icon: '📱', turnover: 'high', displayName: 'Electronics' },
		clothing: { color: 'secondary', icon: '👕', turnover: 'medium', displayName: 'Clothing' },
		food: { color: 'accent', icon: '🍎', turnover: 'high', displayName: 'Food' },
		furniture: { color: 'neutral', icon: '🪑', turnover: 'low', displayName: 'Furniture' },
		books: { color: 'info', icon: '📚', turnover: 'medium', displayName: 'Books' },
		toys: { color: 'success', icon: '🧸', turnover: 'seasonal', displayName: 'Toys' }
	},

	// 予測分析設定
	PREDICTION_CONFIG: {
		DEMAND_FORECAST_DAYS: 30, // 需要予測期間
		REORDER_RECOMMENDATION: true, // 発注推奨
		SEASONAL_ADJUSTMENT: true, // 季節調整
		TREND_ANALYSIS_MONTHS: 12 // トレンド分析期間
	},

	// 車両タイプ設定
	VEHICLE_TYPES: {
		TRUCK: { capacity_kg: 4000, capacity_m3: 25, icon: '🚛', color: 'primary' },
		VAN: { capacity_kg: 1500, capacity_m3: 10, icon: '🚐', color: 'secondary' },
		MOTORCYCLE: { capacity_kg: 50, capacity_m3: 1, icon: '🏍️', color: 'accent' }
	}
};

/**
 * フィーチャーフラグ
 * 在庫・物流特有の機能制御
 */
export const featureFlags = {
	// モック専用機能
	SHOW_SAMPLE_DELIVERIES: { enabled: config.USE_MOCK_DATA, mockModeOnly: true },
	SHOW_DEMO_VEHICLES: { enabled: config.USE_MOCK_DATA, mockModeOnly: true },
	SHOW_MOCK_LOCATIONS: { enabled: config.USE_MOCK_DATA, mockModeOnly: true },
	ENABLE_SIMULATION_MODE: { enabled: config.USE_MOCK_DATA, mockModeOnly: true },

	// 本番・モック共通機能
	SHOW_REAL_TIME_TRACKING: { enabled: true, mockModeOnly: false },
	ENABLE_INVENTORY_ALERTS: { enabled: true, mockModeOnly: false },
	SHOW_PREDICTION_ANALYTICS: { enabled: true, mockModeOnly: false },

	// 地図・位置情報機能
	ENABLE_MAP_VIEW: { enabled: true, mockModeOnly: false },
	SHOW_DELIVERY_ROUTES: { enabled: true, mockModeOnly: false },
	ENABLE_GEOFENCING: { enabled: false, mockModeOnly: false },

	// 高度な分析機能
	ENABLE_AI_OPTIMIZATION: { enabled: false, mockModeOnly: false },
	SHOW_CARBON_FOOTPRINT: { enabled: false, mockModeOnly: false },
	ENABLE_ROUTE_OPTIMIZATION: { enabled: false, mockModeOnly: false },

	// 実験的機能
	ENABLE_DRONE_DELIVERY: { enabled: false, mockModeOnly: false },
	SHOW_AUTONOMOUS_VEHICLES: { enabled: false, mockModeOnly: false }
};

/**
 * フィーチャーフラグヘルパー関数
 */
export const isFeatureEnabled = (flagName) => {
	const flag = featureFlags[flagName];
	if (!flag) return false;

	if (flag.mockModeOnly && !config.USE_MOCK_DATA) {
		return false;
	}

	return flag.enabled;
};

/**
 * UI設定
 * 在庫・物流ダッシュボード特有のUI設定
 */
export const uiConfig = {
	// カラーパレット（DaisyUIテーマ対応）
	COLORS: {
		WAREHOUSE: 'oklch(var(--su))', // 倉庫：成功色
		IN_TRANSIT: 'oklch(var(--in))', // 配送中：情報色
		DELIVERED: 'oklch(var(--su))', // 配送完了：成功色
		DELAYED: 'oklch(var(--wa))', // 遅延：警告色
		FAILED: 'oklch(var(--er))', // 失敗：エラー色
		LOW_STOCK: 'oklch(var(--wa))', // 低在庫：警告色
		OUT_OF_STOCK: 'oklch(var(--er))', // 在庫切れ：エラー色
		OVERSTOCK: 'oklch(var(--ac))' // 過剰在庫：アクセント色
	},

	// アニメーション設定
	ANIMATIONS: {
		MAP_MARKERS: {
			DURATION: 2000,
			EASING: 'ease-in-out'
		},
		INVENTORY_UPDATES: {
			DURATION: 800,
			EASING: 'cubic-bezier(0.4, 0, 0.2, 1)'
		},
		ALERT_PULSE: {
			DURATION: 1500,
			ITERATION: 'infinite'
		}
	},

	// チャート設定
	CHART_CONFIG: {
		INVENTORY_HEATMAP: {
			CELL_SIZE: 40,
			BORDER_RADIUS: 8,
			ANIMATION_DELAY: 50
		},
		DELIVERY_TIMELINE: {
			BAR_HEIGHT: 24,
			SPACING: 8,
			GRADIENT: true
		}
	},

	// レスポンシブ設定
	BREAKPOINTS: {
		MAP_MOBILE: 768, // モバイルでは簡易マップ
		SIDEBAR_COLLAPSE: 1024, // サイドバー折りたたみ
		GRID_STACKING: 640 // グリッド縦積み
	}
};

/**
 * アラート設定
 * 在庫・物流アラートの重要度と表示設定
 */
export const alertConfig = {
	PRIORITY_LEVELS: {
		CRITICAL: {
			color: 'error',
			icon: '🚨',
			autoHide: false,
			sound: true,
			notification: true
		},
		HIGH: {
			color: 'warning',
			icon: '⚠️',
			autoHide: false,
			sound: false,
			notification: true
		},
		MEDIUM: {
			color: 'info',
			icon: 'ℹ️',
			autoHide: true,
			autoHideDelay: 10000,
			sound: false,
			notification: false
		},
		LOW: {
			color: 'success',
			icon: '✅',
			autoHide: true,
			autoHideDelay: 5000,
			sound: false,
			notification: false
		}
	},

	ALERT_TYPES: {
		INVENTORY_LOW: { priority: 'HIGH', category: 'inventory' },
		INVENTORY_OUT: { priority: 'CRITICAL', category: 'inventory' },
		DELIVERY_DELAYED: { priority: 'MEDIUM', category: 'delivery' },
		VEHICLE_BREAKDOWN: { priority: 'HIGH', category: 'fleet' },
		WAREHOUSE_FULL: { priority: 'HIGH', category: 'warehouse' },
		SYSTEM_ERROR: { priority: 'CRITICAL', category: 'system' }
	}
};
