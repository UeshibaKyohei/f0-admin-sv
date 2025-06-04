/**
 * HR Dashboard Service Layer
 * 人事労務管理システムのデータサービス層
 *
 * このファイルはMock/Production環境の切り替えを管理し、
 * AI駆動開発において本番実装への移行を容易にします。
 */

// ==========================================
// Mock Data Generation Functions
// ==========================================

/**
 * 従業員サンプルデータ生成
 * 実際の150名規模の組織を想定したリアルなデータ
 */
export function generateMockEmployees() {
	const departments = [
		'開発部',
		'営業部',
		'マーケティング部',
		'人事部',
		'経理部',
		'法務部',
		'総務部',
		'カスタマーサポート部'
	];
	const positions = {
		開発部: [
			'エンジニアリングマネージャー',
			'テックリード',
			'シニアエンジニア',
			'エンジニア',
			'ジュニアエンジニア'
		],
		営業部: ['営業部長', '営業マネージャー', 'セールスリード', '営業スペシャリスト', '営業担当'],
		マーケティング部: [
			'マーケティングマネージャー',
			'プロダクトマーケター',
			'コンテンツマーケター',
			'デジタルマーケター'
		],
		人事部: ['人事部長', '人事マネージャー', '採用担当', '労務担当'],
		経理部: ['経理部長', '経理マネージャー', '財務担当', '経理担当'],
		法務部: ['法務部長', '法務マネージャー', '契約担当', 'コンプライアンス担当'],
		総務部: ['総務部長', '総務マネージャー', '施設管理担当', '総務担当'],
		カスタマーサポート部: ['CSマネージャー', 'CSリード', 'CSスペシャリスト', 'CS担当']
	};

	const statuses = ['出勤', '出勤', '出勤', '出勤', 'リモート', 'リモート', '休暇', '遅刻', '欠勤'];
	const employees = [];

	// 部門ごとに従業員を生成
	let id = 1;
	departments.forEach((dept) => {
		const deptPositions = positions[dept];
		const employeeCount = Math.floor(Math.random() * 10) + 15; // 15-25名/部門

		for (let i = 0; i < employeeCount; i++) {
			const joinYear = 2018 + Math.floor(Math.random() * 6);
			const joinMonth = Math.floor(Math.random() * 12) + 1;
			const joinDay = Math.floor(Math.random() * 28) + 1;

			employees.push({
				id: id++,
				employeeCode: `EMP${String(id).padStart(4, '0')}`,
				name: generateJapaneseName(),
				department: dept,
				position: deptPositions[Math.floor(Math.random() * deptPositions.length)],
				status: statuses[Math.floor(Math.random() * statuses.length)],
				joinDate: `${joinYear}-${String(joinMonth).padStart(2, '0')}-${String(joinDay).padStart(2, '0')}`,
				avatar: `https://img.daisyui.com/images/stock/photo-${1534528741775 + (id % 10)}-53994a69daeb.webp`,
				salary: 4000000 + Math.floor(Math.random() * 6000000),
				overtimeThisMonth: Math.floor(Math.random() * 50)
			});
		}
	});

	return employees.slice(0, 157); // 157名に調整
}

/**
 * 日本人の名前生成（サンプル用）
 */
function generateJapaneseName() {
	const lastNames = [
		'佐藤',
		'鈴木',
		'高橋',
		'田中',
		'伊藤',
		'渡辺',
		'山本',
		'中村',
		'小林',
		'加藤'
	];
	const firstNamesMale = [
		'太郎',
		'次郎',
		'健太',
		'雄二',
		'健司',
		'拓也',
		'翔太',
		'大輔',
		'健一',
		'修'
	];
	const firstNamesFemale = [
		'花子',
		'美咲',
		'千恵',
		'麻衣',
		'美穂',
		'恵子',
		'由美',
		'真理',
		'裕子',
		'智子'
	];

	const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
	const isMale = Math.random() > 0.5;
	const firstName = isMale
		? firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)]
		: firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];

	return `${lastName}${firstName}`;
}

/**
 * 勤怠データ取得（モック）
 * RDB想定テーブル:
 * - attendance_records: 日次勤怠記録
 * - overtime_records: 残業時間記録
 * - vacation_records: 休暇取得記録
 */
export function getMockAttendance(date) {
	return {
		today: {
			present: 125,
			absent: 3,
			late: 8,
			vacation: 12,
			remote: 28,
			total: 157
		},
		weeklyData: [
			{ day: '月', present: 142, rate: 95 },
			{ day: '火', present: 138, rate: 92 },
			{ day: '水', present: 145, rate: 97 },
			{ day: '木', present: 134, rate: 89 },
			{ day: '金', present: 139, rate: 93 }
		],
		overtime: {
			thisMonth: 42,
			limit: 45,
			yearlyTotal: 280,
			yearlyLimit: 360,
			departmentAverages: [
				{ departmentId: 1, department: '開発部', average: 38.5, risk: 'medium' },
				{ departmentId: 2, department: '営業部', average: 41.2, risk: 'high' },
				{ departmentId: 3, department: 'マーケティング部', average: 22.8, risk: 'low' },
				{ departmentId: 4, department: '人事部', average: 28.5, risk: 'low' },
				{ departmentId: 5, department: '経理部', average: 35.2, risk: 'medium' },
				{ departmentId: 6, department: '法務部', average: 19.5, risk: 'low' },
				{ departmentId: 7, department: '総務部', average: 25.8, risk: 'low' },
				{ departmentId: 8, department: 'カスタマーサポート部', average: 32.4, risk: 'medium' }
			],
			alerts: generateOvertimeAlerts()
		},
		intervals: generateIntervalViolations()
	};
}

/**
 * 残業アラート生成
 */
function generateOvertimeAlerts() {
	return [
		{
			id: 1,
			type: 'warning',
			employeeId: 1,
			employee: '田中太郎',
			message: '月間残業時間が40時間を超過',
			urgency: 'medium',
			overtimeHours: 42,
			department: '開発部'
		},
		{
			id: 2,
			type: 'danger',
			employeeId: 7,
			employee: '渡辺健司',
			message: '2ヶ月平均が80時間に接近',
			urgency: 'high',
			overtimeHours: 48,
			department: '総務部'
		},
		{
			id: 3,
			type: 'warning',
			employeeId: 2,
			employee: '佐藤花子',
			message: '営業部全体の残業時間増加傾向',
			urgency: 'medium',
			overtimeHours: 28,
			department: '営業部'
		},
		{
			id: 4,
			type: 'info',
			employeeId: 9,
			employee: '加藤雄二',
			message: '開発部プロジェクト繁忙期のため要注意',
			urgency: 'low',
			overtimeHours: 39,
			department: '開発部'
		}
	];
}

/**
 * インターバル違反データ生成
 */
function generateIntervalViolations() {
	return [
		{
			employeeId: 1,
			employee: '田中太郎',
			date: '2024-06-20',
			interval: 8,
			status: 'violation',
			department: '開発部'
		},
		{
			employeeId: 2,
			employee: '佐藤花子',
			date: '2024-06-19',
			interval: 10,
			status: 'warning',
			department: '営業部'
		},
		{
			employeeId: 3,
			employee: '鈴木次郎',
			date: '2024-06-18',
			interval: 12,
			status: 'ok',
			department: 'マーケティング部'
		}
	];
}

/**
 * 採用データ取得（モック）
 * RDB想定テーブル:
 * - job_postings: 求人情報
 * - applications: 応募情報
 * - interview_schedules: 面接スケジュール
 */
export function getMockRecruitment() {
	return {
		openPositions: [
			{
				id: 1,
				title: 'フロントエンドエンジニア',
				departmentId: 1,
				department: '開発部',
				applicants: 25,
				interviews: 8,
				offers: 2,
				salary: '500-800万円',
				priority: 'high',
				createdAt: '2024-05-01',
				deadline: '2024-07-31'
			},
			{
				id: 2,
				title: '営業マネージャー',
				departmentId: 2,
				department: '営業部',
				applicants: 15,
				interviews: 5,
				offers: 1,
				salary: '600-900万円',
				priority: 'medium',
				createdAt: '2024-05-15',
				deadline: '2024-08-15'
			},
			{
				id: 3,
				title: '人事スペシャリスト',
				departmentId: 4,
				department: '人事部',
				applicants: 12,
				interviews: 4,
				offers: 0,
				salary: '450-650万円',
				priority: 'high',
				createdAt: '2024-06-01',
				deadline: '2024-08-31'
			}
		],
		metrics: {
			totalApplications: 142,
			interviewRate: 28,
			offerRate: 12,
			acceptanceRate: 85,
			averageTimeToHire: 32,
			costPerHire: 850000
		}
	};
}

/**
 * 法務コンプライアンスデータ取得（モック）
 * RDB想定テーブル:
 * - compliance_scores: コンプライアンススコア履歴
 * - compliance_violations: 違反記録
 * - compliance_actions: 改善アクション
 */
export function getMockCompliance() {
	return {
		complianceScore: 94,
		violations: [
			{
				id: 1,
				type: '残業時間超過',
				severity: 'high',
				count: 3,
				lastOccurrence: '2024-06-15',
				trend: 'decreasing',
				departmentId: 2
			},
			{
				id: 2,
				type: 'インターバル規制違反',
				severity: 'medium',
				count: 5,
				lastOccurrence: '2024-06-10',
				trend: 'stable',
				departmentId: 1
			},
			{
				id: 3,
				type: '有給取得率不足',
				severity: 'low',
				count: 12,
				lastOccurrence: '2024-05-30',
				trend: 'increasing',
				departmentId: 2
			},
			{
				id: 4,
				type: '健康診断未受診',
				severity: 'medium',
				count: 8,
				lastOccurrence: '2024-05-20',
				trend: 'decreasing',
				departmentId: null
			}
		],
		monthlyTrend: [
			{ month: '1月', score: 91 },
			{ month: '2月', score: 89 },
			{ month: '3月', score: 92 },
			{ month: '4月', score: 95 },
			{ month: '5月', score: 94 }
		],
		applications: generateComplianceApplications()
	};
}

/**
 * コンプライアンス申請データ生成
 */
function generateComplianceApplications() {
	return [
		{
			id: 1,
			type: '36協定更新',
			count: 1,
			deadline: '2024-03-31',
			status: 'completed',
			progress: 100
		},
		{
			id: 2,
			type: '就業規則変更届',
			count: 2,
			deadline: '2024-07-31',
			status: 'processing',
			progress: 65
		},
		{
			id: 3,
			type: '労働保険年度更新',
			count: 1,
			deadline: '2024-07-10',
			status: 'processing',
			progress: 80
		},
		{
			id: 4,
			type: '健康診断実施報告',
			count: 1,
			deadline: '2024-09-30',
			status: 'pending',
			progress: 30
		},
		{
			id: 5,
			type: 'ストレスチェック実施報告',
			count: 1,
			deadline: '2024-11-30',
			status: 'pending',
			progress: 15
		}
	];
}

/**
 * 有給管理データ取得（モック）
 * RDB想定テーブル:
 * - vacation_balances: 有給残高
 * - vacation_usage: 有給使用履歴
 * - vacation_plans: 有給取得計画
 */
export function getMockVacationManagement() {
	return {
		yearlyStats: {
			totalEmployees: 157,
			compliantEmployees: 132,
			riskEmployees: 18,
			averageDaysUsed: 12.5
		},
		riskList: [
			{
				employeeId: 1,
				name: '山田太郎',
				used: 2,
				required: 5,
				remaining: 3,
				deadline: '2024-09-30',
				status: 'danger',
				department: '営業部'
			},
			{
				employeeId: 2,
				name: '鈴木一郎',
				used: 3,
				required: 5,
				remaining: 2,
				deadline: '2024-10-31',
				status: 'risk',
				department: '開発部'
			},
			{
				employeeId: 3,
				name: '佐藤美咲',
				used: 1,
				required: 5,
				remaining: 4,
				deadline: '2024-08-31',
				status: 'danger',
				department: '営業部'
			}
		],
		departmentStats: getDepartmentVacationStats()
	};
}

/**
 * 部門別有給統計データ生成
 */
function getDepartmentVacationStats() {
	return [
		{ departmentId: 4, department: '人事部', compliance: 100, used: 11.2, required: 5 },
		{ departmentId: 6, department: '法務部', compliance: 100, used: 10.8, required: 5 },
		{ departmentId: 3, department: 'マーケティング部', compliance: 94, used: 9.5, required: 5 },
		{ departmentId: 7, department: '総務部', compliance: 92, used: 9.3, required: 5 },
		{ departmentId: 1, department: '開発部', compliance: 89, used: 7.2, required: 5 },
		{ departmentId: 5, department: '経理部', compliance: 87, used: 8.1, required: 5 },
		{ departmentId: 2, department: '営業部', compliance: 82, used: 6.8, required: 5 },
		{ departmentId: 8, department: 'カスタマーサポート部', compliance: 79, used: 6.4, required: 5 }
	];
}

/**
 * 健康管理データ取得（モック）
 * RDB想定テーブル:
 * - health_checks: 健康診断記録
 * - stress_checks: ストレスチェック記録
 * - health_consultations: 産業医面談記録
 */
export function getMockHealthManagement() {
	return {
		stressCheck: {
			completed: 142,
			total: 157,
			highRisk: 8,
			needsSupport: 23,
			completionRate: 90.4
		},
		healthData: [
			{ departmentId: 1, department: '開発部', avgStress: 65, trend: 'up' },
			{ departmentId: 2, department: '営業部', avgStress: 58, trend: 'stable' },
			{ departmentId: 3, department: 'マーケティング部', avgStress: 52, trend: 'down' },
			{ departmentId: 4, department: '人事部', avgStress: 45, trend: 'down' },
			{ departmentId: 5, department: '経理部', avgStress: 52, trend: 'stable' },
			{ departmentId: 6, department: '法務部', avgStress: 48, trend: 'stable' },
			{ departmentId: 7, department: '総務部', avgStress: 46, trend: 'down' },
			{ departmentId: 8, department: 'カスタマーサポート部', avgStress: 62, trend: 'up' }
		]
	};
}

/**
 * 残業トレンドデータ生成
 */
export function getOvertimeTrendData() {
	return [
		{ month: '1月', total: 3420, average: 21.8, limit: 45 },
		{ month: '2月', total: 3680, average: 23.4, limit: 45 },
		{ month: '3月', total: 4250, average: 27.1, limit: 45 },
		{ month: '4月', total: 4580, average: 29.2, limit: 45 },
		{ month: '5月', total: 5120, average: 32.6, limit: 45 },
		{ month: '6月', total: 4890, average: 31.1, limit: 45 }
	];
}
