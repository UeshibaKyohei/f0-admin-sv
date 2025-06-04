/**
 * ダッシュボード設定
 *
 * 本番環境では環境変数から取得することを推奨
 * import.meta.env.VITE_USE_MOCK_DATA など
 */
export const config = {
	// モックデータを使用するかどうか
	// true: ローカルのモックデータを使用（開発・デモ用）
	// false: 実際のAPIからデータを取得（本番用）
	useMockData: true,

	// API エンドポイント（本番環境用）
	apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',

	// データ更新間隔（ミリ秒）
	refreshInterval: {
		kpiMetrics: 30000, // 30秒
		revenueData: 60000, // 1分
		activityFeed: 15000, // 15秒
		departmentData: 300000, // 5分
		financialData: 300000 // 5分
	},

	// リアルタイムシミュレーション設定（モック用）
	simulation: {
		enabled: true,
		varianceRange: 0.05 // ±5%の変動
	}
};
