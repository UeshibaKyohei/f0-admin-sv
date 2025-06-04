import { config } from '../config.js';
import { mockDataService } from './mockDataService.js';

/**
 * データサービス
 *
 * 設定に応じてモックデータまたは実際のAPIからデータを取得
 * 本番環境では各メソッドのAPIコール部分を実装
 */
export const dataService = {
	/**
	 * KPIメトリクスデータを取得
	 * @param {string} period - 期間 (daily, monthly, quarterly)
	 * @returns {Promise<Array>} KPIメトリクスの配列
	 *
	 * 想定API: GET /api/v1/kpi/metrics?period={period}
	 *
	 * DBテーブル: kpi_metrics
	 * - metric_id: UUID
	 * - metric_type: VARCHAR(50) - revenue, profit_rate, customers, unit_price
	 * - value: DECIMAL(15,2)
	 * - change_percentage: DECIMAL(5,2)
	 * - trend: VARCHAR(10) - up, down, stable
	 * - period: VARCHAR(20)
	 * - created_at: TIMESTAMP
	 */
	async getKpiMetrics(period) {
		if (config.useMockData) {
			return mockDataService.getKpiMetrics(period);
		}

		// 本番実装例:
		// const response = await fetch(`${config.apiBaseUrl}/kpi/metrics?period=${period}`);
		// return await response.json();
		throw new Error('Real API not implemented yet');
	},

	/**
	 * 売上・利益データを取得
	 * @param {string} period - 期間
	 * @returns {Promise<Object>} グラフ用データ
	 *
	 * 想定API: GET /api/v1/revenue/analysis?period={period}
	 *
	 * DBテーブル: revenue_data
	 * - revenue_id: UUID
	 * - date: DATE
	 * - revenue_amount: DECIMAL(15,2)
	 * - profit_amount: DECIMAL(15,2)
	 * - target_amount: DECIMAL(15,2)
	 * - period_type: VARCHAR(20)
	 */
	async getRevenueData(period) {
		if (config.useMockData) {
			return mockDataService.getRevenueData(period);
		}

		throw new Error('Real API not implemented yet');
	},

	/**
	 * アクティビティフィードを取得
	 * @param {number} limit - 取得件数
	 * @returns {Promise<Array>} アクティビティの配列
	 *
	 * 想定API: GET /api/v1/activities?limit={limit}
	 *
	 * DBテーブル: activity_logs
	 * - activity_id: UUID
	 * - activity_type: VARCHAR(50) - achievement, alert, info, system
	 * - title: VARCHAR(200)
	 * - description: TEXT
	 * - severity: VARCHAR(20) - success, warning, error, info
	 * - created_at: TIMESTAMP
	 * - created_by: UUID (users.user_id)
	 */
	async getActivities(limit = 10) {
		if (config.useMockData) {
			return mockDataService.getActivities(limit);
		}

		throw new Error('Real API not implemented yet');
	},

	/**
	 * 部門別パフォーマンスデータを取得
	 * @returns {Promise<Array>} 部門データの配列
	 *
	 * 想定API: GET /api/v1/departments/performance
	 *
	 * DBテーブル: department_performance
	 * - department_id: UUID
	 * - department_name: VARCHAR(100)
	 * - performance_score: INTEGER (0-100)
	 * - target_score: INTEGER (0-100)
	 * - trend: VARCHAR(10)
	 * - evaluated_at: DATE
	 */
	async getDepartmentPerformance() {
		if (config.useMockData) {
			return mockDataService.getDepartmentPerformance();
		}

		throw new Error('Real API not implemented yet');
	},

	/**
	 * 財務サマリーデータを取得
	 * @param {string} period - 期間
	 * @returns {Promise<Array>} 財務データの配列
	 *
	 * 想定API: GET /api/v1/financial/summary?period={period}
	 *
	 * DBテーブル: financial_summary
	 * - summary_id: UUID
	 * - category: VARCHAR(50) - revenue, cost_of_sales, sg_a, operating_profit, ordinary_profit
	 * - actual_amount: DECIMAL(15,2)
	 * - budget_amount: DECIMAL(15,2)
	 * - variance_percentage: DECIMAL(5,2)
	 * - period: VARCHAR(20)
	 * - fiscal_year: INTEGER
	 * - fiscal_month: INTEGER
	 */
	async getFinancialSummary(period) {
		if (config.useMockData) {
			return mockDataService.getFinancialSummary(period);
		}

		throw new Error('Real API not implemented yet');
	}
};
