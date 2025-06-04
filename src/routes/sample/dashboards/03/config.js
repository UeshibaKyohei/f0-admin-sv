/**
 * カスタマーサクセスダッシュボード設定
 *
 * @description
 * このファイルはダッシュボードの動作モードや各種設定を管理します。
 * 本番環境では USE_MOCK_DATA を false に設定してください。
 *
 * ===========================================
 * RDBスキーマ設計 (本番環境用データベース構造)
 * ===========================================
 *
 * 【customers】顧客マスター
 * - id (BIGINT PRIMARY KEY)
 * - company_name (VARCHAR)
 * - segment (ENUM: enterprise, business, starter)
 * - subscription_start (DATE)
 * - subscription_plan (VARCHAR)
 * - monthly_revenue (DECIMAL)
 * - health_score (TINYINT 0-100)
 * - created_at, updated_at (TIMESTAMP)
 *
 * 【customer_satisfaction】顧客満足度データ
 * - id (BIGINT PRIMARY KEY)
 * - customer_id (BIGINT FK→customers.id)
 * - nps_score (TINYINT -100～100)
 * - csat_score (TINYINT 0-100)
 * - ces_score (DECIMAL 1.0-7.0)
 * - survey_date (DATE)
 * - feedback_text (TEXT)
 *
 * 【support_tickets】サポートチケット
 * - id (BIGINT PRIMARY KEY)
 * - customer_id (BIGINT FK→customers.id)
 * - priority (ENUM: low, medium, high, critical)
 * - status (ENUM: open, in_progress, resolved, closed, escalated)
 * - category (ENUM: technical, billing, feature_request, general)
 * - created_at (TIMESTAMP)
 * - resolved_at (TIMESTAMP NULL)
 * - sla_target_hours (TINYINT)
 *
 * 【customer_engagement】エンゲージメントログ
 * - id (BIGINT PRIMARY KEY)
 * - customer_id (BIGINT FK→customers.id)
 * - feature_category (VARCHAR)
 * - engagement_score (TINYINT 0-100)
 * - last_login (TIMESTAMP)
 * - feature_usage_count (INT)
 * - session_duration_minutes (INT)
 * - recorded_at (DATE)
 *
 * 【revenue_retention】収益・維持率データ
 * - id (BIGINT PRIMARY KEY)
 * - customer_id (BIGINT FK→customers.id)
 * - period_start (DATE)
 * - period_end (DATE)
 * - mrr (DECIMAL) -- Monthly Recurring Revenue
 * - churn_risk_score (TINYINT 0-100)
 * - ltv (DECIMAL) -- Life Time Value
 * - retention_status (ENUM: retained, churned, at_risk)
 */

export const config = {
	// モックデータ使用フラグ（本番環境では false に設定）
	USE_MOCK_DATA: true,

	// API エンドポイント（本番環境用）
	API_ENDPOINTS: {
		CUSTOMERS: '/api/customers',
		SATISFACTION: '/api/satisfaction',
		CHURN_ANALYSIS: '/api/churn-analysis',
		CUSTOMER_HEALTH: '/api/customer-health',
		SUPPORT_TICKETS: '/api/support-tickets',
		REVENUE_RETENTION: '/api/revenue-retention',
		ENGAGEMENT: '/api/engagement',
		METRICS: '/api/customer-metrics'
	},

	// リフレッシュ間隔（ミリ秒）
	REFRESH_INTERVALS: {
		CUSTOMER_METRICS: 60000, // 1分
		SATISFACTION_DATA: 300000, // 5分
		SUPPORT_TICKETS: 30000, // 30秒
		HEALTH_SCORES: 120000, // 2分
		ENGAGEMENT_DATA: 180000 // 3分
	},

	// 顧客健全性スコア設定
	HEALTH_SCORE_THRESHOLDS: {
		EXCELLENT: 90, // 優良顧客
		GOOD: 75, // 健全
		AT_RISK: 50, // 要注意
		CRITICAL: 30 // 危険
	},

	// NPS・満足度設定
	SATISFACTION_CONFIG: {
		NPS_SCALE: { min: -100, max: 100 },
		CSAT_SCALE: { min: 0, max: 100 },
		CES_SCALE: { min: 1, max: 7 },
		TARGET_NPS: 70,
		TARGET_CSAT: 85,
		TARGET_CES: 3.0
	},

	// チャーン分析設定
	CHURN_RISK_LEVELS: {
		LOW: { threshold: 30, color: 'success' },
		MEDIUM: { threshold: 60, color: 'warning' },
		HIGH: { threshold: 80, color: 'error' },
		CRITICAL: { threshold: 100, color: 'error' }
	},

	// サポートチケット設定
	SUPPORT_TICKET_CONFIG: {
		PRIORITIES: ['low', 'medium', 'high', 'critical'],
		STATUSES: ['open', 'in_progress', 'resolved', 'closed', 'escalated'],
		CATEGORIES: ['technical', 'billing', 'feature_request', 'general'],
		SLA_TARGETS: {
			critical: 2, // 2時間以内
			high: 8, // 8時間以内
			medium: 24, // 24時間以内
			low: 72 // 72時間以内
		}
	},

	// エンゲージメント設定
	ENGAGEMENT_CONFIG: {
		FEATURE_CATEGORIES: [
			'core_features',
			'advanced_features',
			'admin_features',
			'mobile_features',
			'api_features'
		],
		ENGAGEMENT_LEVELS: {
			HIGH: 80,
			MEDIUM: 60,
			LOW: 40
		}
	},

	// 収益・維持率設定
	REVENUE_CONFIG: {
		RETENTION_TARGET: 95, // 目標維持率 95%
		CHURN_TARGET: 5, // 目標解約率 5%
		REVENUE_GROWTH_TARGET: 15, // 目標成長率 15%
		LTV_CALCULATION_MONTHS: 24 // LTV計算期間
	}
};

/**
 * フィーチャーフラグ
 * 開発中の機能の表示/非表示を制御
 * MOCK_MODE_ONLY: trueの場合、モックモード時のみ表示される機能
 */
export const featureFlags = {
	// UI表示フラグ（モック専用機能）
	SHOW_EXPORT_BUTTON: { enabled: config.USE_MOCK_DATA, mockModeOnly: true },
	SHOW_DEMO_ALERTS: { enabled: config.USE_MOCK_DATA, mockModeOnly: true },
	SHOW_DEBUG_INFO: { enabled: config.USE_MOCK_DATA, mockModeOnly: true },
	SHOW_SAMPLE_DATA_BANNER: { enabled: config.USE_MOCK_DATA, mockModeOnly: true },

	// 機能フラグ（本番・モック共通）
	SHOW_ADVANCED_ANALYTICS: { enabled: true, mockModeOnly: false },
	ENABLE_REAL_TIME_UPDATES: { enabled: !config.USE_MOCK_DATA, mockModeOnly: false },

	// 将来実装予定の機能
	ENABLE_PREDICTIVE_ANALYTICS: { enabled: false, mockModeOnly: false },
	SHOW_CUSTOMER_JOURNEY_MAP: { enabled: false, mockModeOnly: false },
	ENABLE_A_B_TESTING: { enabled: false, mockModeOnly: false },

	// サンプル機能（モック専用）
	SHOW_MOCK_DATA_GENERATOR: { enabled: config.USE_MOCK_DATA, mockModeOnly: true },
	SHOW_SCENARIO_SWITCHER: { enabled: config.USE_MOCK_DATA, mockModeOnly: true },
	ENABLE_DEMO_MODE: { enabled: config.USE_MOCK_DATA, mockModeOnly: true }
};

/**
 * フィーチャーフラグのヘルパー関数
 */
export const isFeatureEnabled = (flagName) => {
	const flag = featureFlags[flagName];
	if (!flag) return false;

	// モック専用機能で、かつモックモードが無効な場合はfalse
	if (flag.mockModeOnly && !config.USE_MOCK_DATA) {
		return false;
	}

	return flag.enabled;
};

/**
 * UI設定
 * デザインとレイアウトの設定
 */
export const uiConfig = {
	// カラーテーマ
	COLORS: {
		PRIMARY: 'rgb(99, 102, 241)',
		SUCCESS: 'rgb(34, 197, 94)',
		WARNING: 'rgb(245, 158, 11)',
		ERROR: 'rgb(239, 68, 68)',
		INFO: 'rgb(59, 130, 246)'
	},

	// チャート設定
	CHART_CONFIG: {
		ANIMATION_DURATION: 750,
		RESPONSIVE: true,
		MAINTAIN_ASPECT_RATIO: false,
		DEFAULT_HEIGHT: 320
	},

	// グリッドレイアウト
	GRID_CONFIG: {
		COLUMNS: 12,
		GAP: 4,
		BREAKPOINTS: {
			SM: 640,
			MD: 768,
			LG: 1024,
			XL: 1280
		}
	},

	// アニメーション設定
	ANIMATIONS: {
		DURATION: {
			FAST: 150,
			NORMAL: 300,
			SLOW: 500
		},
		EASING: 'cubic-bezier(0.4, 0, 0.2, 1)'
	}
};
