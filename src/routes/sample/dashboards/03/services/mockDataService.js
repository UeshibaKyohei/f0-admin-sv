/**
 * カスタマーサクセスダッシュボード モックデータサービス
 *
 * @description
 * このファイルは開発・デモ用のモックデータを提供します。
 * 実際のRDBの構造を模倣したデータ形式で、本番環境への移行を容易にします。
 *
 * RDBテーブル設計:
 *
 * customers テーブル:
 * - customer_id: UUID PRIMARY KEY
 * - company_name: VARCHAR(200) NOT NULL
 * - segment: ENUM('enterprise', 'business', 'starter')
 * - contract_value: DECIMAL(12,2)
 * - contract_start_date: DATE
 * - contract_end_date: DATE
 * - health_score: INTEGER (0-100)
 * - churn_risk_score: INTEGER (0-100)
 * - created_at: TIMESTAMP DEFAULT NOW()
 * - updated_at: TIMESTAMP DEFAULT NOW()
 *
 * satisfaction_surveys テーブル:
 * - survey_id: UUID PRIMARY KEY
 * - customer_id: UUID REFERENCES customers(customer_id)
 * - survey_type: ENUM('nps', 'csat', 'ces')
 * - score: INTEGER
 * - feedback_text: TEXT
 * - survey_date: DATE
 * - created_at: TIMESTAMP DEFAULT NOW()
 *
 * support_tickets テーブル:
 * - ticket_id: UUID PRIMARY KEY
 * - customer_id: UUID REFERENCES customers(customer_id)
 * - title: VARCHAR(200) NOT NULL
 * - description: TEXT
 * - priority: ENUM('low', 'medium', 'high', 'critical')
 * - status: ENUM('open', 'in_progress', 'resolved', 'closed', 'escalated')
 * - category: ENUM('technical', 'billing', 'feature_request', 'general')
 * - assignee_id: UUID REFERENCES users(user_id)
 * - satisfaction_rating: INTEGER (1-5)
 * - created_at: TIMESTAMP DEFAULT NOW()
 * - updated_at: TIMESTAMP DEFAULT NOW()
 *
 * customer_health_scores テーブル:
 * - health_id: UUID PRIMARY KEY
 * - customer_id: UUID REFERENCES customers(customer_id)
 * - overall_score: INTEGER (0-100)
 * - usage_score: INTEGER (0-100)
 * - engagement_score: INTEGER (0-100)
 * - support_score: INTEGER (0-100)
 * - payment_score: INTEGER (0-100)
 * - calculated_at: TIMESTAMP DEFAULT NOW()
 */

// モック顧客データ
const mockCustomers = [
	{
		customer_id: 'cust_001',
		company_name: '株式会社サンプル',
		segment: 'enterprise',
		contract_value: 5200000,
		contract_start_date: '2023-01-15',
		contract_end_date: '2024-01-14',
		health_score: 92,
		churn_risk_score: 15,
		last_activity: '2024-12-20T14:30:00Z'
	},
	{
		customer_id: 'cust_002',
		company_name: 'テック株式会社',
		segment: 'enterprise',
		contract_value: 3800000,
		contract_start_date: '2023-03-20',
		contract_end_date: '2024-03-19',
		health_score: 78,
		churn_risk_score: 35,
		last_activity: '2024-12-19T16:45:00Z'
	},
	{
		customer_id: 'cust_003',
		company_name: '株式会社イノベーション',
		segment: 'business',
		contract_value: 1200000,
		contract_start_date: '2023-06-10',
		contract_end_date: '2024-06-09',
		health_score: 45,
		churn_risk_score: 75,
		last_activity: '2024-12-15T09:20:00Z'
	},
	{
		customer_id: 'cust_004',
		company_name: 'デジタル株式会社',
		segment: 'business',
		contract_value: 2100000,
		contract_start_date: '2023-02-28',
		contract_end_date: '2024-02-27',
		health_score: 88,
		churn_risk_score: 20,
		last_activity: '2024-12-20T11:15:00Z'
	},
	{
		customer_id: 'cust_005',
		company_name: 'スタートアップA社',
		segment: 'starter',
		contract_value: 500000,
		contract_start_date: '2023-08-15',
		contract_end_date: '2024-08-14',
		health_score: 65,
		churn_risk_score: 45,
		last_activity: '2024-12-19T20:10:00Z'
	}
];

// モック満足度データ
const mockSatisfactionData = [
	{ customer_id: 'cust_001', survey_type: 'nps', score: 9, survey_date: '2024-12-18' },
	{ customer_id: 'cust_002', survey_type: 'nps', score: 7, survey_date: '2024-12-17' },
	{ customer_id: 'cust_003', survey_type: 'nps', score: 4, survey_date: '2024-12-16' },
	{ customer_id: 'cust_004', survey_type: 'nps', score: 8, survey_date: '2024-12-19' },
	{ customer_id: 'cust_005', survey_type: 'nps', score: 6, survey_date: '2024-12-18' }
];

// モックサポートチケットデータ
const mockSupportTickets = [
	{
		ticket_id: 'ticket_001',
		customer_id: 'cust_001',
		title: 'ログイン機能が正常に動作しない',
		priority: 'high',
		status: 'open',
		category: 'technical',
		assignee_name: '佐藤 花子',
		created_at: '2024-12-20T09:30:00Z',
		updated_at: '2024-12-20T14:15:00Z',
		satisfaction_rating: null
	},
	{
		ticket_id: 'ticket_002',
		customer_id: 'cust_002',
		title: '料金プランの変更について',
		priority: 'medium',
		status: 'in_progress',
		category: 'billing',
		assignee_name: '田中 太郎',
		created_at: '2024-12-19T16:45:00Z',
		updated_at: '2024-12-20T10:30:00Z',
		satisfaction_rating: null
	}
];

// モック収益データ
const mockRevenueData = {
	monthly_recurring_revenue: 45200000,
	annual_recurring_revenue: 542400000,
	revenue_growth_rate: 12.3,
	customer_lifetime_value: 3800000,
	average_revenue_per_user: 89000,
	retention_rate: 94.2,
	churn_rate: 5.8,
	expansion_revenue: 8600000
};

/**
 * 顧客メトリクスを取得
 */
export function getCustomerMetrics(segment = 'all', dateRange = '30days') {
	const filteredCustomers =
		segment === 'all' ? mockCustomers : mockCustomers.filter((c) => c.segment === segment);

	const metrics = [
		{
			title: '総顧客数',
			value: filteredCustomers.length.toString(),
			change: '+5.2%',
			trend: 'up',
			icon: 'users',
			color: 'primary'
		},
		{
			title: 'NPS スコア',
			value: '72',
			change: '+3pt',
			trend: 'up',
			icon: 'star',
			color: 'success'
		},
		{
			title: 'CSAT スコア',
			value: '88%',
			change: '+2.1%',
			trend: 'up',
			icon: 'heart',
			color: 'secondary'
		},
		{
			title: '平均解約率',
			value: '2.3%',
			change: '-0.5%',
			trend: 'down',
			icon: 'logout',
			color: 'warning'
		},
		{
			title: '月間収益',
			value: '¥45.2M',
			change: '+12.3%',
			trend: 'up',
			icon: 'currency',
			color: 'info'
		},
		{
			title: '平均 LTV',
			value: '¥3.8M',
			change: '+8.7%',
			trend: 'up',
			icon: 'chart',
			color: 'accent'
		}
	];

	return Promise.resolve(metrics);
}

/**
 * 満足度トレンドデータを取得
 */
export function getSatisfactionTrends(segment = 'all', dateRange = '30days', metricType = 'nps') {
	// 時系列データの生成
	const labels = [];
	const scores = [];
	const benchmarkScores = [];

	for (let i = 11; i >= 0; i--) {
		const date = new Date();
		date.setMonth(date.getMonth() - i);
		labels.push(date.toLocaleDateString('ja-JP', { month: 'short' }));

		// メトリクスタイプに応じたスコア生成
		let baseScore = metricType === 'nps' ? 72 : metricType === 'csat' ? 88 : 6.2;
		let variation = (Math.random() - 0.5) * 10;
		scores.push(Math.round((baseScore + variation) * 10) / 10);

		// ベンチマークスコア
		let benchmarkScore = metricType === 'nps' ? 65 : metricType === 'csat' ? 80 : 6.8;
		benchmarkScores.push(benchmarkScore);
	}

	return Promise.resolve({
		labels,
		datasets: [
			{
				label: 'スコア',
				data: scores,
				borderColor: 'rgb(99, 102, 241)',
				backgroundColor: 'rgba(99, 102, 241, 0.1)'
			},
			{
				label: '業界平均',
				data: benchmarkScores,
				borderColor: 'rgb(156, 163, 175)',
				backgroundColor: 'transparent'
			}
		]
	});
}

/**
 * チャーン分析データを取得
 */
export function getChurnAnalysis(segment = 'all', dateRange = '30days') {
	const riskSegments = [
		{
			level: '高リスク',
			count: 234,
			percentage: 15,
			color: 'error',
			factors: ['ログイン頻度低下', '問い合わせ増加', '利用率低下']
		},
		{
			level: '中リスク',
			count: 567,
			percentage: 28,
			color: 'warning',
			factors: ['機能利用停滞', 'NPS低下']
		},
		{
			level: '低リスク',
			count: 1243,
			percentage: 57,
			color: 'success',
			factors: ['安定利用']
		}
	];

	const churnReasons = [
		{ reason: '価格・コスト', percentage: 32 },
		{ reason: '機能不足', percentage: 28 },
		{ reason: 'サポート品質', percentage: 18 },
		{ reason: '競合への移行', percentage: 15 },
		{ reason: 'その他', percentage: 7 }
	];

	return Promise.resolve({
		riskSegments,
		churnReasons
	});
}

/**
 * 顧客健全性データを取得
 */
export function getCustomerHealth(segment = 'all', dateRange = '30days') {
	const healthData = mockCustomers.map((customer) => ({
		...customer,
		signals: {
			usage: customer.health_score > 80 ? 'high' : customer.health_score > 60 ? 'medium' : 'low',
			engagement:
				customer.health_score > 75 ? 'high' : customer.health_score > 50 ? 'medium' : 'low',
			support:
				customer.churn_risk_score < 30 ? 'low' : customer.churn_risk_score < 60 ? 'medium' : 'high',
			payment: 'good'
		},
		trend: customer.health_score > 80 ? 'up' : customer.health_score < 50 ? 'down' : 'stable'
	}));

	return Promise.resolve(healthData);
}

/**
 * サポートチケットデータを取得
 */
export function getSupportTickets(segment = 'all', dateRange = '30days', showDetails = false) {
	const tickets = mockSupportTickets.map((ticket) => {
		const customer = mockCustomers.find((c) => c.customer_id === ticket.customer_id);
		return {
			...ticket,
			customer: customer ? customer.company_name : '不明な顧客'
		};
	});

	const stats = {
		total: 156,
		open: 23,
		in_progress: 18,
		resolved: 89,
		escalated: 4,
		average_resolution_time: 4.2,
		satisfaction_average: 4.3
	};

	return Promise.resolve({
		tickets,
		stats
	});
}

/**
 * 収益・維持率データを取得
 */
export function getRevenueRetention(segment = 'all', dateRange = '30days') {
	const cohortData = [
		{ month: '2024-01', retention_rate: 100, revenue_retention: 100, customers: 1250 },
		{ month: '2024-02', retention_rate: 96.2, revenue_retention: 103.4, customers: 1203 },
		{ month: '2024-03', retention_rate: 93.8, revenue_retention: 108.7, customers: 1173 },
		{ month: '2024-04', retention_rate: 91.5, revenue_retention: 112.3, customers: 1144 },
		{ month: '2024-05', retention_rate: 89.7, revenue_retention: 115.8, customers: 1121 },
		{ month: '2024-06', retention_rate: 88.2, revenue_retention: 118.9, customers: 1103 }
	];

	return Promise.resolve({
		revenueData: mockRevenueData,
		cohortData
	});
}

/**
 * エンゲージメントデータを取得
 */
export function getEngagementData(segment = 'all', dateRange = '30days') {
	const heatmapData = [
		{
			feature: 'ダッシュボード',
			daily_users: 1250,
			weekly_users: 2100,
			engagement_score: 85,
			trend: 'up'
		},
		{
			feature: 'レポート機能',
			daily_users: 890,
			weekly_users: 1650,
			engagement_score: 72,
			trend: 'stable'
		},
		{
			feature: 'データエクスポート',
			daily_users: 340,
			weekly_users: 980,
			engagement_score: 58,
			trend: 'up'
		},
		{
			feature: 'チーム管理',
			daily_users: 560,
			weekly_users: 1200,
			engagement_score: 67,
			trend: 'down'
		},
		{
			feature: 'API機能',
			daily_users: 180,
			weekly_users: 420,
			engagement_score: 45,
			trend: 'stable'
		},
		{
			feature: 'モバイルアプリ',
			daily_users: 720,
			weekly_users: 1350,
			engagement_score: 78,
			trend: 'up'
		}
	];

	const timeOfDayData = Array.from({ length: 24 }, (_, i) => ({
		hour: i.toString().padStart(2, '0'),
		usage: Math.round(Math.random() * 100)
	}));

	const weeklyPattern = [
		{ day: '月', morning: 85, afternoon: 92, evening: 45 },
		{ day: '火', morning: 88, afternoon: 95, evening: 48 },
		{ day: '水', morning: 90, afternoon: 96, evening: 52 },
		{ day: '木', morning: 87, afternoon: 93, evening: 50 },
		{ day: '金', morning: 89, afternoon: 89, evening: 55 },
		{ day: '土', morning: 35, afternoon: 42, evening: 38 },
		{ day: '日', morning: 28, afternoon: 35, evening: 32 }
	];

	const userSegmentEngagement = [
		{ segment: 'パワーユーザー', percentage: 15, engagement: 95, color: 'success' },
		{ segment: 'アクティブユーザー', percentage: 35, engagement: 78, color: 'info' },
		{ segment: '通常ユーザー', percentage: 40, engagement: 52, color: 'warning' },
		{ segment: '非アクティブユーザー', percentage: 10, engagement: 25, color: 'error' }
	];

	return Promise.resolve({
		heatmapData,
		timeOfDayData,
		weeklyPattern,
		userSegmentEngagement
	});
}

/**
 * 顧客健全性スコアを更新
 */
export function updateCustomerHealthScore(customerId, newScore, reason = '') {
	const customerIndex = mockCustomers.findIndex((c) => c.customer_id === customerId);

	if (customerIndex === -1) {
		return Promise.reject(new Error('Customer not found'));
	}

	mockCustomers[customerIndex] = {
		...mockCustomers[customerIndex],
		health_score: newScore,
		updated_at: new Date().toISOString()
	};

	return Promise.resolve({
		success: true,
		customer: mockCustomers[customerIndex],
		message: `Health score updated to ${newScore}`
	});
}

/**
 * サポートチケットのステータスを更新
 */
export function updateTicketStatus(ticketId, newStatus, assigneeId = null) {
	const ticketIndex = mockSupportTickets.findIndex((t) => t.ticket_id === ticketId);

	if (ticketIndex === -1) {
		return Promise.reject(new Error('Ticket not found'));
	}

	mockSupportTickets[ticketIndex] = {
		...mockSupportTickets[ticketIndex],
		status: newStatus,
		...(assigneeId && { assignee_id: assigneeId }),
		updated_at: new Date().toISOString()
	};

	return Promise.resolve({
		success: true,
		ticket: mockSupportTickets[ticketIndex],
		message: `Ticket status updated to ${newStatus}`
	});
}

/**
 * 満足度調査を作成
 */
export function createSatisfactionSurvey(surveyData) {
	const newSurvey = {
		survey_id: `survey_${Date.now()}`,
		...surveyData,
		created_at: new Date().toISOString()
	};

	mockSatisfactionData.push(newSurvey);

	return Promise.resolve({
		success: true,
		survey: newSurvey,
		message: 'Survey created successfully'
	});
}
