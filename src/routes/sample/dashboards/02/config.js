/**
 * プロジェクト管理ダッシュボード設定
 *
 * @description
 * このファイルはダッシュボードの動作モードや各種設定を管理します。
 * 本番環境では USE_MOCK_DATA を false に設定してください。
 */

export const config = {
	// モックデータ使用フラグ（本番環境では false に設定）
	USE_MOCK_DATA: true,

	// API エンドポイント（本番環境用）
	API_ENDPOINTS: {
		PROJECTS: '/api/projects',
		TASKS: '/api/tasks',
		TEAM_MEMBERS: '/api/team-members',
		MILESTONES: '/api/milestones',
		GANTT_DATA: '/api/gantt-data'
	},

	// リフレッシュ間隔（ミリ秒）
	REFRESH_INTERVALS: {
		PROJECT_STATUS: 30000, // 30秒
		TEAM_WORKLOAD: 60000, // 1分
		MILESTONES: 60000, // 1分
		TASKS: 30000 // 30秒
	},

	// カンバンボード設定
	KANBAN_COLUMNS: [
		{ id: 'todo', name: '未着手', color: 'base-300' },
		{ id: 'in_progress', name: '進行中', color: 'info' },
		{ id: 'review', name: 'レビュー', color: 'warning' },
		{ id: 'done', name: '完了', color: 'success' }
	],

	// ガントチャート設定
	GANTT_CONFIG: {
		DEFAULT_VIEW: 'month', // month, quarter, year
		SHOW_WEEKENDS: true,
		HIGHLIGHT_TODAY: true,
		ENABLE_DRAG_DROP: true // タスクのドラッグ&ドロップ
	},

	// チームメンバー稼働率の閾値
	WORKLOAD_THRESHOLDS: {
		OVERLOAD: 100, // 過負荷（赤）
		HIGH: 80, // 高負荷（黄）
		NORMAL: 60, // 通常（緑）
		LOW: 40 // 低負荷（青）
	},

	// プロジェクトステータス定義
	PROJECT_STATUS: {
		ON_TRACK: { label: '順調', color: 'success' },
		AT_RISK: { label: 'リスクあり', color: 'warning' },
		DELAYED: { label: '遅延', color: 'error' },
		COMPLETED: { label: '完了', color: 'base-300' }
	}
};

/**
 * フィーチャーフラグ
 * 開発中の機能の表示/非表示を制御
 */
export const featureFlags = {
	SHOW_EXPORT_BUTTON: config.USE_MOCK_DATA,
	SHOW_DEMO_ALERTS: config.USE_MOCK_DATA,
	ENABLE_REAL_TIME_UPDATES: !config.USE_MOCK_DATA,
	SHOW_DEBUG_INFO: config.USE_MOCK_DATA
};
