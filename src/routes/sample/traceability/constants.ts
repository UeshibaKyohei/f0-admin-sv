/**
 * 工場トレーサビリティシステム 定数定義
 */

// ステータス定義
export const BATCH_STATUS = {
	PENDING: 'pending',
	IN_PROGRESS: 'in_progress',
	COMPLETED: 'completed',
	CANCELLED: 'cancelled'
} as const;

export const STEP_STATUS = {
	PENDING: 'pending',
	IN_PROGRESS: 'in_progress',
	COMPLETED: 'completed',
	SKIPPED: 'skipped'
} as const;

// 優先度定義
export const PRIORITY = {
	HIGH: 'high',
	NORMAL: 'normal',
	LOW: 'low'
} as const;

// アラートタイプ
export const ALERT_TYPE = {
	TEMPERATURE: 'temperature',
	DIMENSION: 'dimension',
	PRESSURE: 'pressure',
	VIBRATION: 'vibration',
	MANUAL: 'manual',
	QUALITY: 'quality',
	EQUIPMENT: 'equipment',
	MATERIAL: 'material',
	PROCESS: 'process',
	OTHER: 'other'
} as const;

// アラート重要度
export const ALERT_SEVERITY = {
	CRITICAL: 'critical',
	WARNING: 'warning',
	INFO: 'info'
} as const;

// 作業ログタイプ
export const LOG_TYPE = {
	START: 'start',
	END: 'end',
	PAUSE: 'pause',
	RESUME: 'resume',
	QUALITY_CHECK: 'quality_check',
	ISSUE: 'issue',
	COMMENT: 'comment',
	UPDATE: 'update'
} as const;

// UI設定
export const UI_CONFIG = {
	// リフレッシュ間隔（ミリ秒）
	REFRESH_INTERVAL: 5000,

	// ページネーション
	DEFAULT_PAGE_SIZE: 10,
	PAGE_SIZE_OPTIONS: [10, 20, 50, 100],

	// アニメーション
	ANIMATION_DURATION: 300,

	// グラフ設定
	GANTT_ZOOM_LEVELS: [0.5, 0.75, 1, 1.25, 1.5, 2],

	// 色設定（DaisyUIテーマと連携）
	STATUS_COLORS: {
		completed: 'success',
		in_progress: 'primary',
		pending: 'neutral',
		critical: 'error',
		warning: 'warning',
		info: 'info'
	}
} as const;

// 日本語ラベル
export const LABELS = {
	// ステータス
	STATUS: {
		pending: '待機中',
		in_progress: '進行中',
		completed: '完了',
		cancelled: 'キャンセル',
		skipped: 'スキップ'
	},

	// 優先度
	PRIORITY: {
		high: '高',
		normal: '中',
		low: '低'
	},

	// アラートタイプ
	ALERT_TYPE: {
		temperature: '温度異常',
		dimension: '寸法誤差',
		pressure: '圧力異常',
		vibration: '振動異常',
		manual: '手動検査',
		quality: '品質異常',
		equipment: '設備異常',
		material: '材料異常',
		process: 'プロセス異常',
		other: 'その他'
	},

	// アラート重要度
	ALERT_SEVERITY: {
		critical: '重大',
		warning: '警告',
		info: '情報'
	},

	// ログタイプ
	LOG_TYPE: {
		start: '開始',
		end: '終了',
		pause: '一時停止',
		resume: '再開',
		quality_check: '品質チェック',
		issue: '問題',
		comment: 'コメント',
		update: '更新'
	}
} as const;

// APIエンドポイント（本番環境用）
export const API_ENDPOINTS = {
	BATCHES: '/api/batches',
	PROCESS_STEPS: '/api/process-steps',
	ALERTS: '/api/alerts',
	WORK_LOGS: '/api/work-logs',
	WEBSOCKET: '/ws'
} as const;

// バリデーションルール
export const VALIDATION = {
	BATCH_ID_PATTERN: /^BATCH-\d{4}-\d{3}$/,
	MIN_QUANTITY: 1,
	MAX_QUANTITY: 999999,
	MAX_DESCRIPTION_LENGTH: 500,
	MAX_COMMENT_LENGTH: 1000
} as const;
