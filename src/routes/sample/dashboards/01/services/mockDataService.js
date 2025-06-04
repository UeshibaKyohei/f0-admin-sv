import { config } from '../config.js';

/**
 * モックデータサービス
 * 開発・デモ用のダミーデータを提供
 */
export const mockDataService = {
	// KPIメトリクスのモックデータ
	getKpiMetrics(period) {
		const baseMetrics = [
			{
				metric_id: '1',
				metric_type: 'revenue',
				label: '売上高',
				value: this._getValueByPeriod(period, 4.2, 125.4, 365.0),
				unit: 'M',
				change_percentage: this._randomVariance(23.5),
				trend: 'up',
				sparkline: this._generateSparkline(10)
			},
			{
				metric_id: '2',
				metric_type: 'profit_rate',
				label: '利益率',
				value: this._randomVariance(28.3, 0.1),
				unit: '%',
				change_percentage: this._randomVariance(5.2),
				trend: 'up',
				sparkline: this._generateSparkline(10, 20, 30)
			},
			{
				metric_id: '3',
				metric_type: 'customers',
				label: '顧客数',
				value: Math.floor(12847 + this._randomVariance(0, 100)),
				unit: '',
				change_percentage: this._randomVariance(8.7),
				trend: 'up',
				sparkline: this._generateSparkline(10, 30, 50)
			},
			{
				metric_id: '4',
				metric_type: 'unit_price',
				label: '顧客単価',
				value: Math.floor(9758 + this._randomVariance(0, 50)),
				unit: '',
				change_percentage: this._randomVariance(-2.1),
				trend: 'down',
				sparkline: this._generateSparkline(10, 39, 50)
			}
		];

		// シミュレーションが有効な場合は値を変動させる
		if (config.simulation.enabled) {
			return baseMetrics.map((metric) => ({
				...metric,
				value:
					metric.unit === '%'
						? this._randomVariance(metric.value, 0.1)
						: metric.unit === 'M'
							? this._randomVariance(metric.value, 0.5)
							: Math.floor(metric.value + this._randomVariance(0, 50))
			}));
		}

		return baseMetrics;
	},

	// 売上データのモック
	getRevenueData(period) {
		const dataMap = {
			daily: {
				labels: ['月', '火', '水', '木', '金', '土', '日'],
				revenue: [4.2, 4.8, 4.5, 5.1, 5.5, 6.2, 6.8],
				profit: [1.2, 1.4, 1.3, 1.5, 1.6, 1.8, 2.0],
				target: [4.5, 4.5, 4.5, 5.0, 5.0, 6.0, 6.0]
			},
			monthly: {
				labels: [
					'1月',
					'2月',
					'3月',
					'4月',
					'5月',
					'6月',
					'7月',
					'8月',
					'9月',
					'10月',
					'11月',
					'12月'
				],
				revenue: [8.5, 9.2, 8.8, 9.5, 10.2, 11.0, 11.5, 12.0, 11.8, 12.5, 13.0, 13.5],
				profit: [2.1, 2.3, 2.2, 2.4, 2.6, 2.8, 2.9, 3.1, 3.0, 3.2, 3.3, 3.5],
				target: [9.0, 9.0, 9.0, 9.5, 9.5, 10.0, 11.0, 11.0, 12.0, 12.0, 12.5, 13.0]
			},
			quarterly: {
				labels: ['Q1', 'Q2', 'Q3', 'Q4'],
				revenue: [26.5, 30.7, 35.3, 39.0],
				profit: [6.6, 7.8, 9.0, 10.0],
				target: [27.0, 29.0, 34.0, 38.0]
			}
		};

		const data = dataMap[period] || dataMap.monthly;

		// シミュレーションが有効な場合は値を変動させる
		if (config.simulation.enabled) {
			return {
				...data,
				revenue: data.revenue.map((v) => this._randomVariance(v, 0.1)),
				profit: data.profit.map((v) => this._randomVariance(v, 0.05))
			};
		}

		return data;
	},

	// アクティビティのモック
	getActivities(limit) {
		const templates = [
			{
				type: 'achievement',
				title: '月間売上目標達成',
				description: '営業1部が110%達成',
				icon: '🎯',
				color: 'success'
			},
			{
				type: 'alert',
				title: '在庫レベル警告',
				description: '商品A: 残り20個',
				icon: '⚠️',
				color: 'warning'
			},
			{
				type: 'info',
				title: '新規大口契約',
				description: 'X社: ¥5.2M/年',
				icon: '📝',
				color: 'info'
			},
			{
				type: 'system',
				title: 'レポート生成完了',
				description: '月次財務レポート',
				icon: '📊',
				color: 'base'
			},
			{
				type: 'achievement',
				title: '顧客満足度向上',
				description: 'NPS: 72 → 78',
				icon: '⭐',
				color: 'success'
			},
			{
				type: 'alert',
				title: '支払い遅延',
				description: 'Y社: 3日遅延',
				icon: '💰',
				color: 'error'
			},
			{
				type: 'info',
				title: '新商品リリース',
				description: 'Product-Z 販売開始',
				icon: '🚀',
				color: 'info'
			}
		];

		const activities = [];
		const now = Date.now();

		for (let i = 0; i < limit; i++) {
			const template = templates[i % templates.length];
			activities.push({
				activity_id: `act_${i + 1}`,
				...template,
				created_at: new Date(now - i * 3600000).toISOString(), // 1時間ずつ遡る
				time: this._getRelativeTime(i * 3600000)
			});
		}

		return activities;
	},

	// 部門パフォーマンスのモック
	getDepartmentPerformance() {
		const departments = [
			{
				department_id: 'dept_1',
				department_name: '営業部',
				performance_score: 92,
				target_score: 85,
				trend: 'up'
			},
			{
				department_id: 'dept_2',
				department_name: '開発部',
				performance_score: 78,
				target_score: 80,
				trend: 'down'
			},
			{
				department_id: 'dept_3',
				department_name: 'マーケティング',
				performance_score: 85,
				target_score: 75,
				trend: 'up'
			},
			{
				department_id: 'dept_4',
				department_name: 'カスタマーサポート',
				performance_score: 95,
				target_score: 90,
				trend: 'up'
			},
			{
				department_id: 'dept_5',
				department_name: '管理部',
				performance_score: 88,
				target_score: 85,
				trend: 'stable'
			}
		];

		// シミュレーションが有効な場合はスコアを変動させる
		if (config.simulation.enabled) {
			return departments.map((dept) => ({
				...dept,
				performance_score: Math.min(
					100,
					Math.max(0, dept.performance_score + Math.floor(this._randomVariance(0, 2)))
				)
			}));
		}

		return departments;
	},

	// 財務サマリーのモック
	getFinancialSummary(period) {
		const categories = [
			{ category: 'revenue', label: '売上高', icon: '💰', color: 'primary' },
			{ category: 'cost_of_sales', label: '売上原価', icon: '📦', color: 'warning' },
			{ category: 'sg_a', label: '販管費', icon: '💼', color: 'info' },
			{ category: 'operating_profit', label: '営業利益', icon: '📈', color: 'success' },
			{ category: 'ordinary_profit', label: '経常利益', icon: '💎', color: 'success' }
		];

		const periodData = {
			daily: [
				{ actual: 42.5, budget: 40.0, variance: 6.3 },
				{ actual: 25.5, budget: 24.0, variance: 6.3 },
				{ actual: 8.5, budget: 9.0, variance: -5.6 },
				{ actual: 8.5, budget: 7.0, variance: 21.4 },
				{ actual: 8.2, budget: 6.8, variance: 20.6 }
			],
			monthly: [
				{ actual: 125.0, budget: 118.0, variance: 5.9 },
				{ actual: 75.0, budget: 70.8, variance: 5.9 },
				{ actual: 25.0, budget: 26.0, variance: -3.8 },
				{ actual: 25.0, budget: 21.2, variance: 17.9 },
				{ actual: 24.0, budget: 20.0, variance: 20.0 }
			],
			quarterly: [
				{ actual: 365.0, budget: 350.0, variance: 4.3 },
				{ actual: 219.0, budget: 210.0, variance: 4.3 },
				{ actual: 73.0, budget: 77.0, variance: -5.2 },
				{ actual: 73.0, budget: 63.0, variance: 15.9 },
				{ actual: 70.0, budget: 60.0, variance: 16.7 }
			]
		};

		const data = periodData[period] || periodData.monthly;

		return categories.map((cat, index) => ({
			...cat,
			...data[index],
			summary_id: `fin_${index + 1}`
		}));
	},

	// ヘルパーメソッド
	_getValueByPeriod(period, daily, monthly, quarterly) {
		const values = { daily, monthly, quarterly };
		return values[period] || monthly;
	},

	_randomVariance(base, range = null) {
		if (range === null) {
			range = base * config.simulation.varianceRange;
		}
		return base + (Math.random() - 0.5) * 2 * range;
	},

	_generateSparkline(count, min = 30, max = 80) {
		const data = [];
		for (let i = 0; i < count; i++) {
			data.push(min + Math.random() * (max - min));
		}
		return data;
	},

	_getRelativeTime(milliseconds) {
		const minutes = Math.floor(milliseconds / 60000);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) return `${days}日前`;
		if (hours > 0) return `${hours}時間前`;
		if (minutes > 0) return `${minutes}分前`;
		return '今';
	}
};
