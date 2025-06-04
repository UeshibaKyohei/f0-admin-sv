<script>
	import { onMount } from 'svelte';
	import {
		generateMockEmployees,
		getMockAttendance,
		getMockRecruitment,
		getMockCompliance,
		getMockVacationManagement,
		getMockHealthManagement,
		getOvertimeTrendData
	} from './hr-service.js';

	// ==========================================
	// 開発/本番モード切り替えフラグ
	// ==========================================
	const IS_MOCK_MODE = true; // 本番実装時はfalseに変更

	// ==========================================
	// HR Dashboard設定
	// ==========================================
	const CONFIG = {
		companyName: 'サンプル株式会社',
		employeeScale: 157, // 従業員数規模
		fiscalYearStart: 4, // 会計年度開始月
		overtimeLimit: {
			monthly: 45, // 月間残業上限（時間）
			yearly: 360, // 年間残業上限（時間）
			alertThreshold: {
				monthly: 40, // 月間警告閾値
				yearly: 320 // 年間警告閾値
			}
		},
		vacationPolicy: {
			minimumDays: 5, // 年次有給休暇最低取得日数
			grantedDays: 20 // 年次有給休暇付与日数
		}
	};

	// ==========================================
	// API Service Layer (Mock/Production切り替え)
	// ==========================================
	const hrService = {
		// 部門データ取得
		async getDepartments() {
			if (IS_MOCK_MODE) {
				return getMockDepartments();
			}
			// 本番実装: return await fetch('/api/hr/departments').then(res => res.json());
		},

		// 従業員データ取得
		async getEmployees(filters = {}) {
			if (IS_MOCK_MODE) {
				return getMockEmployees(filters);
			}
			// 本番実装: return await fetch('/api/hr/employees', { params: filters }).then(res => res.json());
		},

		// 勤怠データ取得
		async getAttendance(date = new Date()) {
			if (IS_MOCK_MODE) {
				return getMockAttendance(date);
			}
			// 本番実装: return await fetch(`/api/hr/attendance/${date.toISOString()}`).then(res => res.json());
		},

		// 採用データ取得
		async getRecruitment() {
			if (IS_MOCK_MODE) {
				return getMockRecruitment();
			}
			// 本番実装: return await fetch('/api/hr/recruitment').then(res => res.json());
		},

		// 法務コンプライアンスデータ取得
		async getCompliance() {
			if (IS_MOCK_MODE) {
				return getMockCompliance();
			}
			// 本番実装: return await fetch('/api/hr/compliance').then(res => res.json());
		}
	};

	// ==========================================
	// State Management
	// ==========================================
	let currentView = $state('overview');
	let selectedDepartment = $state('all');
	let departments = $state([]);
	let employees = $state([]);
	let attendance = $state({});
	let recruitment = $state({});
	let legalCompliance = $state({});
	let vacationManagement = $state({});
	let healthManagement = $state({});
	let overtimeTrendData = $state([]);
	let isLoading = $state(true);

	// ==========================================
	// Mock Data Functions
	// ==========================================

	/**
	 * 部門マスタデータ取得（モック）
	 * RDB想定: departments table
	 * - id: INT PRIMARY KEY
	 * - name: VARCHAR(100) NOT NULL
	 * - employee_count: INT NOT NULL
	 * - budget: DECIMAL(12,0)
	 * - headcount_limit: INT
	 * - growth_rate: DECIMAL(5,2)
	 * - manager_employee_id: INT FOREIGN KEY
	 * - created_at: TIMESTAMP
	 * - updated_at: TIMESTAMP
	 */
	function getMockDepartments() {
		return [
			{
				id: 1,
				name: '開発部',
				employees: 42,
				budget: 120000000,
				headcount: 45,
				growth: 15,
				manager: '田中太郎'
			},
			{
				id: 2,
				name: '営業部',
				employees: 38,
				budget: 95000000,
				headcount: 40,
				growth: 8,
				manager: '佐藤花子'
			},
			{
				id: 3,
				name: 'マーケティング部',
				employees: 18,
				budget: 45000000,
				headcount: 20,
				growth: 22,
				manager: '鈴木次郎'
			},
			{
				id: 4,
				name: '人事部',
				employees: 12,
				budget: 35000000,
				headcount: 15,
				growth: 12,
				manager: '高橋美咲'
			},
			{
				id: 5,
				name: '経理部',
				employees: 15,
				budget: 28000000,
				headcount: 15,
				growth: 5,
				manager: '山田健太'
			},
			{
				id: 6,
				name: '法務部',
				employees: 8,
				budget: 22000000,
				headcount: 10,
				growth: 10,
				manager: '伊藤麻衣'
			},
			{
				id: 7,
				name: '総務部',
				employees: 10,
				budget: 18000000,
				headcount: 12,
				growth: 7,
				manager: '渡辺健司'
			},
			{
				id: 8,
				name: 'カスタマーサポート部',
				employees: 14,
				budget: 32000000,
				headcount: 16,
				growth: 18,
				manager: '中村千恵'
			}
		];
	}

	/**
	 * 従業員マスタデータ取得（モック）
	 * RDB想定: employees table
	 * - id: INT PRIMARY KEY
	 * - employee_code: VARCHAR(20) UNIQUE NOT NULL
	 * - name: VARCHAR(100) NOT NULL
	 * - department_id: INT FOREIGN KEY
	 * - position: VARCHAR(100)
	 * - employment_status: ENUM('active', 'leave', 'retired')
	 * - join_date: DATE NOT NULL
	 * - avatar_url: VARCHAR(255)
	 * - base_salary: DECIMAL(10,0)
	 * - created_at: TIMESTAMP
	 * - updated_at: TIMESTAMP
	 *
	 * 関連テーブル:
	 * - employee_attendance: 勤怠記録
	 * - employee_overtime: 残業時間記録
	 * - employee_evaluations: 評価履歴
	 * - employee_skills: スキル情報
	 */
	function getMockEmployees(filters = {}) {
		// 本番環境では以下のようなSQLクエリでデータ取得：
		// SELECT e.*, d.name as department_name, ea.status
		// FROM employees e
		// LEFT JOIN departments d ON e.department_id = d.id
		// LEFT JOIN employee_attendance ea ON e.id = ea.employee_id AND ea.date = CURRENT_DATE
		// WHERE e.employment_status = 'active'
		// ORDER BY e.id

		return generateMockEmployees();
	}

	// UI状態管理
	let showJobModal = $state(false);
	let showEmployeeModal = $state(false);
	let selectedEmployee = $state(null);
	let searchTerm = $state('');
	let sortBy = $state('name');
	let sortOrder = $state('asc');
	let showAllAlerts = $state(false);
	let dismissedAlerts = $state(new Set());

	// 新規求人フォーム
	let newJob = $state({
		title: '',
		department: '開発部',
		salary: '',
		priority: 'medium',
		description: ''
	});

	// 派生値
	const totalEmployees = $derived(employees.length || 0);
	const presentEmployees = $derived(employees.filter((e) => e.status === '出勤').length || 0);
	const attendanceRate = $derived(
		totalEmployees > 0 ? Math.round((presentEmployees / totalEmployees) * 100) : 0
	);

	const averageTenure = $derived.by(() => {
		if (!employees.length) return '0.0';
		const avgMonths =
			employees.reduce((sum, emp) => {
				const months = (new Date() - new Date(emp.joinDate)) / (1000 * 60 * 60 * 24 * 30);
				return sum + months;
			}, 0) / employees.length;
		return (avgMonths / 12).toFixed(1);
	});

	const filteredEmployees = $derived.by(() => {
		let filtered = [...employees]; // 新しい配列を作成

		// 部門フィルタ
		if (selectedDepartment !== 'all') {
			filtered = filtered.filter((emp) => emp.department === selectedDepartment);
		}

		// 検索フィルタ
		if (searchTerm) {
			filtered = filtered.filter(
				(emp) =>
					emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					emp.position.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// ソート（新しい配列を返す）
		return filtered.toSorted((a, b) => {
			let aVal, bVal;
			switch (sortBy) {
				case 'name':
					aVal = a.name;
					bVal = b.name;
					break;
				case 'department':
					aVal = a.department;
					bVal = b.department;
					break;
				case 'joinDate':
					aVal = new Date(a.joinDate);
					bVal = new Date(b.joinDate);
					break;
				default:
					return 0;
			}

			if (sortOrder === 'asc') {
				return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			} else {
				return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
			}
		});
	});

	// 2024年問題対応の派生値
	const overtimeRisk = $derived.by(() => {
		if (!attendance.overtime) return 'safe';
		const ratio = attendance.overtime.thisMonth / attendance.overtime.limit;
		if (ratio > 0.9) return 'danger';
		if (ratio > 0.8) return 'warning';
		return 'safe';
	});

	const vacationComplianceRate = $derived.by(() => {
		if (!vacationManagement.yearlyStats) return 0;
		return Math.round(
			(vacationManagement.yearlyStats.compliantEmployees /
				vacationManagement.yearlyStats.totalEmployees) *
				100
		);
	});

	const intervalViolations = $derived(
		attendance.intervals ? attendance.intervals.filter((i) => i.status === 'violation').length : 0
	);

	// より現実的なアラートデータ（100-200名規模想定）
	const allAlerts = $derived.by(() => {
		const alerts = [];

		if (attendance.overtime?.alerts) {
			alerts.push(
				...attendance.overtime.alerts
					.filter((a) => a.urgency === 'high')
					.map((a) => ({ ...a, id: a.id || `overtime-${a.employee}` }))
			);
		}

		if (vacationManagement.riskList) {
			alerts.push(
				...vacationManagement.riskList
					.filter((v) => v.status === 'danger')
					.map((v) => ({
						type: 'danger',
						employee: v.name,
						message: `有給取得義務まで${v.remaining}日必要`,
						urgency: 'high',
						id: `vacation-${v.name}`
					}))
			);
		}

		return alerts.filter((alert) => !dismissedAlerts.has(alert.id));
	});

	const urgentAlerts = $derived(allAlerts.filter((a) => a.urgency === 'high'));
	const displayAlerts = $derived(showAllAlerts ? allAlerts : urgentAlerts.slice(0, 2));

	// ユーティリティ関数
	function getStatusBadge(status) {
		switch (status) {
			case '出勤':
				return 'badge-success';
			case '休暇':
				return 'badge-info';
			case '遅刻':
				return 'badge-warning';
			case '欠勤':
				return 'badge-error';
			case 'リモート':
				return 'badge-accent';
			default:
				return 'badge-ghost';
		}
	}

	function getPriorityBadge(priority) {
		switch (priority) {
			case 'high':
				return 'badge-error';
			case 'medium':
				return 'badge-warning';
			case 'low':
				return 'badge-success';
			default:
				return 'badge-ghost';
		}
	}

	function getAlertBadge(type) {
		switch (type) {
			case 'danger':
				return 'alert-error';
			case 'warning':
				return 'alert-warning';
			case 'info':
				return 'alert-info';
			case 'success':
				return 'alert-success';
			default:
				return 'alert-info';
		}
	}

	function getRiskBadge(status) {
		switch (status) {
			case 'danger':
				return 'badge-error';
			case 'risk':
				return 'badge-warning';
			case 'safe':
				return 'badge-success';
			case 'violation':
				return 'badge-error';
			case 'warning':
				return 'badge-warning';
			case 'ok':
				return 'badge-success';
			default:
				return 'badge-ghost';
		}
	}

	function formatCurrency(amount) {
		return new Intl.NumberFormat('ja-JP', {
			style: 'currency',
			currency: 'JPY',
			minimumFractionDigits: 0
		}).format(amount);
	}

	function calculateTenure(joinDate) {
		const months = (new Date() - new Date(joinDate)) / (1000 * 60 * 60 * 24 * 30);
		const years = Math.floor(months / 12);
		const remainingMonths = Math.floor(months % 12);
		return years > 0 ? `${years}年${remainingMonths}ヶ月` : `${remainingMonths}ヶ月`;
	}

	// インタラクティブ機能
	function addNewJob() {
		if (newJob.title && newJob.salary) {
			const id = recruitment.openPositions.length + 1;
			recruitment.openPositions = [
				...recruitment.openPositions,
				{
					id,
					title: newJob.title,
					department: newJob.department,
					salary: newJob.salary,
					priority: newJob.priority,
					applicants: 0,
					interviews: 0,
					offers: 0
				}
			];

			// フォームリセット
			newJob = {
				title: '',
				department: '開発部',
				salary: '',
				priority: 'medium',
				description: ''
			};
			showJobModal = false;
		}
	}

	function openEmployeeModal(employee) {
		selectedEmployee = employee;
		showEmployeeModal = true;
	}

	function handleComplianceAction(type) {
		// 実際のアプリケーションでは適切な処理を実装
		alert(`${type}の対応を開始しました`);
	}

	function handleVacationPlan(employeeName) {
		alert(`${employeeName}の有給取得計画を作成します`);
	}

	function dismissAlert(alertId) {
		dismissedAlerts = new Set([...dismissedAlerts, alertId]);
	}

	function dismissAllAlerts() {
		dismissedAlerts = new Set(allAlerts.map((a) => a.id));
	}

	// ==========================================
	// Data Loading
	// ==========================================
	async function loadData() {
		try {
			isLoading = true;

			// Load data from service
			const [deps, emps, att, rec, comp, vac, health, trend] = await Promise.all([
				hrService.getDepartments(),
				hrService.getEmployees(),
				hrService.getAttendance(),
				hrService.getRecruitment(),
				hrService.getCompliance(),
				getMockVacationManagement(),
				getMockHealthManagement(),
				getOvertimeTrendData()
			]);

			departments = deps;
			employees = emps;
			attendance = att;
			recruitment = rec;
			legalCompliance = comp;
			vacationManagement = vac;
			healthManagement = health;
			overtimeTrendData = trend;
		} catch (error) {
			console.error('Failed to load HR data:', error);
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		loadData();
	});
</script>

<div class="bg-base-200 min-h-screen">
	{#if isLoading}
		<div class="flex min-h-screen items-center justify-center">
			<div class="text-center">
				<span class="loading loading-spinner loading-lg"></span>
				<p class="mt-4">データを読み込んでいます...</p>
			</div>
		</div>
	{:else}
		<div class="container mx-auto p-6">
			<!-- ヘッダー -->
			<div class="mb-6 flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold">人事労務管理</h1>
					<p class="mt-1 text-sm opacity-70">2024年問題対応・法令遵守統合ダッシュボード</p>
				</div>
				<div class="stats stats-horizontal bg-base-100 shadow">
					<div class="stat">
						<div class="stat-title">総従業員数</div>
						<div class="stat-value text-lg">{totalEmployees || '-'}</div>
						<div class="stat-desc">{departments.length || 0}部門構成</div>
					</div>
					<div class="stat">
						<div class="stat-title">本日出勤率</div>
						<div class="stat-value text-success text-lg">{attendanceRate || 0}%</div>
						<div class="stat-desc">
							出勤{attendance.today?.present || 0} / リモート{attendance.today?.remote || 0}
						</div>
					</div>
					<div class="stat">
						<div class="stat-title">法令遵守率</div>
						<div class="stat-value text-info text-lg">{legalCompliance.complianceScore || 0}%</div>
						<div class="stat-desc">前月比+2pt</div>
					</div>
					<div class="stat">
						<div class="stat-title">有給取得率</div>
						<div class="stat-value text-warning text-lg">{vacationComplianceRate || 0}%</div>
						<div class="stat-desc">
							リスク{vacationManagement.yearlyStats?.riskEmployees || 0}名要対応
						</div>
					</div>
				</div>
			</div>

			<!-- アラートシステム -->
			{#if displayAlerts.length > 0}
				<div class="mb-6">
					<div class="card bg-base-100 border-l-warning border-l-4 shadow-lg">
						<div class="card-body">
							<div class="mb-4 flex items-center justify-between">
								<div class="flex items-center gap-2">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="text-warning h-5 w-5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15c-.77.833.192 2.5 1.732 2.5z"
										/>
									</svg>
									<h3 class="text-lg font-semibold">要注意事項</h3>
									<div class="badge badge-warning">{allAlerts.length}件</div>
								</div>
								<div class="flex gap-2">
									{#if allAlerts.length > 2}
										<button
											class="btn btn-ghost btn-sm"
											onclick={() => (showAllAlerts = !showAllAlerts)}
										>
											{showAllAlerts ? '簡略表示' : `全て表示 (${allAlerts.length}件)`}
										</button>
									{/if}
									<button class="btn btn-ghost btn-sm" onclick={dismissAllAlerts}>
										すべて非表示
									</button>
								</div>
							</div>

							<div class="space-y-2">
								{#each displayAlerts as alert}
									<div
										class="flex items-center justify-between rounded-lg p-3 {alert.urgency ===
										'high'
											? 'bg-error/10 border-error/20 border'
											: alert.urgency === 'medium'
												? 'bg-warning/10 border-warning/20 border'
												: 'bg-info/10 border-info/20 border'}"
									>
										<div class="flex items-center gap-3">
											<div
												class="badge {alert.urgency === 'high'
													? 'badge-error'
													: alert.urgency === 'medium'
														? 'badge-warning'
														: 'badge-info'} badge-sm"
											>
												{alert.urgency === 'high'
													? '緊急'
													: alert.urgency === 'medium'
														? '警告'
														: '情報'}
											</div>
											<div>
												<span class="font-medium">{alert.employee}</span>
												<span class="ml-2 text-sm opacity-70">{alert.message}</span>
											</div>
										</div>
										<button class="btn btn-ghost btn-xs" onclick={() => dismissAlert(alert.id)}>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
												class="h-4 w-4"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- ナビゲーション -->
			<div class="tabs tabs-boxed bg-base-100 mb-6 shadow-lg">
				<button
					class="tab {currentView === 'overview' ? 'tab-active' : ''}"
					onclick={() => (currentView = 'overview')}
				>
					📊 概要
				</button>
				<button
					class="tab {currentView === 'compliance' ? 'tab-active' : ''}"
					onclick={() => (currentView = 'compliance')}
				>
					⚖️ 法令遵守
				</button>
				<button
					class="tab {currentView === 'employees' ? 'tab-active' : ''}"
					onclick={() => (currentView = 'employees')}
				>
					👥 従業員
				</button>
				<button
					class="tab {currentView === 'attendance' ? 'tab-active' : ''}"
					onclick={() => (currentView = 'attendance')}
				>
					⏰ 勤怠
				</button>
				<button
					class="tab {currentView === 'recruitment' ? 'tab-active' : ''}"
					onclick={() => (currentView = 'recruitment')}
				>
					📋 採用
				</button>
				<button
					class="tab {currentView === 'health' ? 'tab-active' : ''}"
					onclick={() => (currentView = 'health')}
				>
					🏥 健康管理
				</button>
			</div>

			{#if currentView === 'overview'}
				<!-- 概要ダッシュボード -->
				<div class="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
					<!-- 残業時間監視（2024年問題対応） -->
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h2 class="card-title">
								<div class="badge badge-error">2024年問題</div>
								残業時間監視
							</h2>
							<div class="space-y-4">
								<div class="flex items-center justify-between">
									<span>今月累計</span>
									<div class="flex items-center gap-2">
										<span class="font-bold">{attendance.overtime?.thisMonth || 0}h</span>
										<div class="badge {getRiskBadge(overtimeRisk)}">
											{attendance.overtime?.limit || 45}h上限
										</div>
									</div>
								</div>
								<progress
									class="progress progress-error"
									value={attendance.overtime?.thisMonth || 0}
									max={attendance.overtime?.limit || 45}
								></progress>

								<div class="flex items-center justify-between">
									<span>年間累計</span>
									<div class="flex items-center gap-2">
										<span class="font-bold">{attendance.overtime?.yearlyTotal || 0}h</span>
										<span class="text-sm opacity-70"
											>/ {attendance.overtime?.yearlyLimit || 360}h</span
										>
									</div>
								</div>
								<progress
									class="progress progress-warning"
									value={attendance.overtime?.yearlyTotal || 0}
									max={attendance.overtime?.yearlyLimit || 360}
								></progress>
							</div>
						</div>
					</div>

					<!-- 有給休暇取得状況 -->
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h2 class="card-title">
								<div class="badge badge-info">義務化対応</div>
								有給休暇管理
							</h2>
							<div class="stats stats-vertical">
								<div class="stat">
									<div class="stat-title">5日以上取得</div>
									<div class="stat-value text-success">{vacationComplianceRate}%</div>
									<div class="stat-desc">
										{vacationManagement.yearlyStats?.compliantEmployees || 0}/{vacationManagement
											.yearlyStats?.totalEmployees || 0}名
									</div>
								</div>
								<div class="stat">
									<div class="stat-title">取得不足リスク</div>
									<div class="stat-value text-error">
										{vacationManagement.yearlyStats?.riskEmployees || 0}名
									</div>
									<div class="stat-desc">年末までに要対応</div>
								</div>
							</div>
						</div>
					</div>

					<!-- 勤務間インターバル -->
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h2 class="card-title">
								<div class="badge badge-warning">推奨11時間</div>
								勤務間インターバル
							</h2>
							<div class="space-y-3">
								{#each attendance.intervals || [] as interval}
									<div class="flex items-center justify-between">
										<div>
											<div class="text-sm font-medium">{interval.employee}</div>
											<div class="text-xs opacity-70">
												{interval.lastEnd} → {interval.nextStart}
											</div>
										</div>
										<div class="text-right">
											<div class="font-bold">{interval.intervalHours}h</div>
											<div class="badge {getRiskBadge(interval.status)} badge-xs">
												{interval.status === 'violation'
													? '違反'
													: interval.status === 'warning'
														? '注意'
														: 'OK'}
											</div>
										</div>
									</div>
								{/each}
							</div>
							{#if intervalViolations > 0}
								<div class="alert alert-warning">
									<span>{intervalViolations}件の違反があります</span>
								</div>
							{/if}
						</div>
					</div>

					<!-- 部門別パフォーマンス - 2分割 -->
					<!-- トップ4部門ハイライト -->
					<div class="card bg-base-100 shadow-xl lg:col-span-2">
						<div class="card-body">
							<div class="mb-4 flex items-center justify-between">
								<h2 class="card-title">
									<div class="badge badge-primary">重要部門</div>
									パフォーマンスハイライト
								</h2>
								<div class="text-sm opacity-70">主要4部門</div>
							</div>

							<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
								{#each departments.slice(0, 4) as dept}
									<div class="card from-base-200 to-base-300 border bg-gradient-to-br">
										<div class="card-body p-4">
											<div class="mb-3 flex items-start justify-between">
												<h3 class="font-bold">{dept.name}</h3>
												<div
													class="badge {dept.growth > 15
														? 'badge-success'
														: dept.growth > 10
															? 'badge-warning'
															: 'badge-info'}"
												>
													+{dept.growth}%
												</div>
											</div>
											<div class="space-y-3">
												<div>
													<div class="mb-1 flex justify-between text-sm">
														<span>人員充足率</span>
														<span class="font-mono">{dept.employees}/{dept.headcount}</span>
													</div>
													<progress
														class="progress progress-primary"
														value={dept.employees}
														max={dept.headcount}
													></progress>
													<div class="mt-1 text-xs opacity-70">
														{Math.round((dept.employees / dept.headcount) * 100)}% 充足
													</div>
												</div>
												<div class="flex items-center justify-between text-sm">
													<span>月平均残業</span>
													{#each attendance.overtime.departmentAverages as overtimeDept}
														{#if overtimeDept.department === dept.name}
															<div
																class="badge {overtimeDept.risk === 'high'
																	? 'badge-error'
																	: overtimeDept.risk === 'medium'
																		? 'badge-warning'
																		: 'badge-success'} badge-sm"
															>
																{overtimeDept.average}h
															</div>
														{/if}
													{/each}
												</div>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>

					<!-- 全部門サマリー -->
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<div class="mb-4 flex items-center justify-between">
								<h2 class="card-title">
									<div class="badge badge-secondary">全組織</div>
									部門一覧
								</h2>
								<div class="text-sm opacity-70">157名 / 8部門</div>
							</div>

							<div class="space-y-3">
								{#each departments as dept}
									<div
										class="bg-base-200/50 hover:bg-base-200 flex items-center justify-between rounded-lg p-3 transition-colors"
									>
										<div class="flex-1">
											<div class="mb-1 flex items-center gap-3">
												<h3 class="text-sm font-bold">{dept.name}</h3>
												<div
													class="badge {dept.growth > 15
														? 'badge-success'
														: dept.growth > 10
															? 'badge-warning'
															: 'badge-info'} badge-xs"
												>
													+{dept.growth}%
												</div>
											</div>
											<div class="text-xs opacity-70">{dept.manager}</div>
										</div>

										<div class="flex flex-col items-end gap-1">
											<div class="font-mono text-sm">{dept.employees}名</div>
											<div class="bg-base-300 h-1 w-16 rounded-full">
												<div
													class="bg-primary h-1 rounded-full"
													style="width: {(dept.employees / dept.headcount) * 100}%"
												></div>
											</div>
										</div>
									</div>
								{/each}
							</div>

							<div class="border-base-300 mt-4 border-t pt-4">
								<div class="grid grid-cols-3 gap-4 text-center">
									<div>
										<div class="text-primary text-2xl font-bold">
											{departments.reduce((sum, d) => sum + d.employees, 0)}
										</div>
										<div class="text-xs opacity-70">総従業員</div>
									</div>
									<div>
										<div class="text-success text-2xl font-bold">
											{Math.round(
												(departments.reduce((sum, d) => sum + d.employees / d.headcount, 0) /
													departments.length) *
													100
											)}%
										</div>
										<div class="text-xs opacity-70">平均充足率</div>
									</div>
									<div>
										<div class="text-info text-2xl font-bold">
											{(departments.reduce((sum, d) => sum + d.budget, 0) / 100000000).toFixed(
												1
											)}億円
										</div>
										<div class="text-xs opacity-70">総人件費予算</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- 今日の勤怠サマリー -->
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h2 class="card-title">
								<div class="badge badge-accent">リアルタイム</div>
								本日の勤怠状況
							</h2>

							<div class="mb-4 grid grid-cols-2 gap-3">
								<div class="stat bg-success/10 rounded-lg p-3">
									<div class="stat-title text-xs">オフィス出勤</div>
									<div class="stat-value text-success text-lg">
										{attendance.today?.present || 0}
									</div>
									<div class="stat-desc text-xs">
										全体の{attendance.today
											? Math.round((attendance.today.present / totalEmployees) * 100)
											: 0}%
									</div>
								</div>

								<div class="stat bg-info/10 rounded-lg p-3">
									<div class="stat-title text-xs">リモート勤務</div>
									<div class="stat-value text-info text-lg">{attendance.today?.remote || 0}</div>
									<div class="stat-desc text-xs">
										全体の{attendance.today && totalEmployees
											? Math.round((attendance.today.remote / totalEmployees) * 100)
											: 0}%
									</div>
								</div>

								<div class="stat bg-warning/10 rounded-lg p-3">
									<div class="stat-title text-xs">遅刻</div>
									<div class="stat-value text-warning text-lg">{attendance.today?.late || 0}</div>
									<div class="stat-desc text-xs">要フォロー</div>
								</div>

								<div class="stat bg-error/10 rounded-lg p-3">
									<div class="stat-title text-xs">欠勤</div>
									<div class="stat-value text-error text-lg">{attendance.today?.absent || 0}</div>
									<div class="stat-desc text-xs">体調不良等</div>
								</div>
							</div>

							<div class="space-y-2">
								<div class="flex items-center justify-between text-xs">
									<span>有給休暇</span>
									<span class="font-bold">{attendance.today?.vacation || 0}名</span>
								</div>
								<div class="flex items-center justify-between text-xs">
									<span>総稼働率</span>
									<span class="text-primary font-bold"
										>{attendance.today && totalEmployees
											? Math.round(
													((attendance.today.present + attendance.today.remote) / totalEmployees) *
														100
												)
											: 0}%</span
									>
								</div>
							</div>
						</div>
					</div>
				</div>
			{:else if currentView === 'compliance'}
				<!-- 法令遵守管理 -->
				<div class="space-y-6">
					<!-- 法令遵守ダッシュボード -->
					<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
						<!-- 総合スコア -->
						<div
							class="card from-primary to-secondary text-primary-content bg-gradient-to-br shadow-xl"
						>
							<div class="card-body text-center">
								<h2 class="card-title justify-center text-white">法令遵守スコア</h2>
								<div class="my-4 flex justify-center">
									<div
										class="radial-progress border-4 border-white/20 text-white"
										style="--value:{legalCompliance.complianceScore ||
											0}; --size:8rem; --thickness: 8px;"
									>
										<span class="text-3xl font-bold">{legalCompliance.complianceScore || 0}%</span>
									</div>
								</div>
								<div class="text-sm opacity-90">前月比 +2pt 改善</div>
								<div class="badge badge-outline mt-2 border-white text-white">業界平均: 87%</div>
							</div>
						</div>

						<!-- 緊急対応項目 -->
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<h2 class="card-title text-error">緊急対応必要</h2>
								<div class="space-y-3">
									{#each (legalCompliance.violations || []).filter((v) => v.severity === 'high') as violation}
										<div class="alert alert-error">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												class="h-6 w-6 shrink-0 stroke-current"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15c-.77.833.192 2.5 1.732 2.5z"
												></path>
											</svg>
											<div>
												<h3 class="font-bold">{violation.type}</h3>
												<div class="text-xs">
													{violation.count}件 - {violation.trend === 'decreasing'
														? '改善中'
														: violation.trend === 'increasing'
															? '悪化中'
															: '横ばい'}
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						</div>

						<!-- 月次トレンド -->
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<h2 class="card-title">月次推移</h2>
								<div class="flex h-32 items-end justify-between p-2">
									{#each legalCompliance.monthlyTrend || [] as month}
										<div class="flex flex-col items-center">
											<div class="mb-1 text-xs">{month.score}%</div>
											<div
												class="bg-primary w-8 rounded-t"
												style="height: {(month.score / 100) * 80}px"
											></div>
											<div class="mt-1 origin-bottom-left rotate-45 text-xs">{month.month}</div>
										</div>
									{/each}
								</div>
								<div class="mt-2 text-center text-xs opacity-70">継続的な改善傾向</div>
							</div>
						</div>
					</div>

					<!-- 電子申請進捗管理 -->
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<div class="mb-6 flex items-center justify-between">
								<h2 class="card-title">電子申請進捗管理</h2>
								<div class="badge badge-info">5種類の申請を管理中</div>
							</div>

							<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
								{#each legalCompliance.applications || [] as app}
									<div class="card bg-base-200 border">
										<div class="card-body p-6">
											<div class="mb-4 flex items-start justify-between">
												<div>
													<h3 class="text-lg font-bold">{app.type}</h3>
													<p class="text-sm opacity-70">{app.count}件の申請</p>
												</div>
												<div class="text-right">
													<div
														class="badge {app.status === 'completed'
															? 'badge-success'
															: app.status === 'processing'
																? 'badge-warning'
																: 'badge-error'} mb-2"
													>
														{app.status === 'completed'
															? '完了'
															: app.status === 'processing'
																? '処理中'
																: '未処理'}
													</div>
													<div class="text-xs opacity-70">期限: {app.deadline}</div>
												</div>
											</div>

											<!-- 進捗バー -->
											<div class="mb-4">
												<div class="mb-1 flex justify-between text-sm">
													<span>進捗状況</span>
													<span class="font-bold">{app.progress}%</span>
												</div>
												<progress
													class="progress {app.progress === 100
														? 'progress-success'
														: app.progress > 50
															? 'progress-primary'
															: 'progress-warning'}"
													value={app.progress}
													max="100"
												></progress>
											</div>

											<!-- 残り日数 -->
											<div class="flex items-center justify-between">
												<span class="text-sm">期限まで</span>
												<div
													class="badge {new Date(app.deadline) <
													new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
														? 'badge-error'
														: 'badge-info'}"
												>
													{Math.ceil(
														(new Date(app.deadline) - new Date()) / (24 * 60 * 60 * 1000)
													)}日
												</div>
											</div>

											<!-- アクションボタン -->
											<div class="card-actions mt-4 justify-end">
												{#if app.status !== 'completed'}
													<button class="btn btn-primary btn-sm">進捗更新</button>
												{/if}
												<button class="btn btn-ghost btn-sm">詳細表示</button>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>

					<!-- 違反履歴とトレンド分析 -->
					<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<!-- 違反履歴詳細 -->
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<h2 class="card-title">違反履歴 & トレンド分析</h2>
								<div class="space-y-4">
									{#each legalCompliance.violations as violation}
										<div
											class="card bg-base-200 border-l-4 {violation.severity === 'high'
												? 'border-l-error'
												: violation.severity === 'medium'
													? 'border-l-warning'
													: 'border-l-info'}"
										>
											<div class="card-body p-4">
												<div class="mb-2 flex items-start justify-between">
													<h3 class="font-bold">{violation.type}</h3>
													<div
														class="badge {violation.severity === 'high'
															? 'badge-error'
															: violation.severity === 'medium'
																? 'badge-warning'
																: 'badge-info'} badge-sm"
													>
														{violation.severity === 'high'
															? '重大'
															: violation.severity === 'medium'
																? '中度'
																: '軽微'}
													</div>
												</div>

												<div class="grid grid-cols-2 gap-4 text-sm">
													<div>
														<span class="opacity-70">発生件数:</span>
														<span class="ml-1 font-bold">{violation.count}件</span>
													</div>
													<div>
														<span class="opacity-70">最終発生:</span>
														<span class="ml-1 font-mono text-xs">{violation.lastOccurrence}</span>
													</div>
												</div>

												<div class="mt-3 flex items-center gap-2">
													<span class="text-sm opacity-70">傾向:</span>
													<div
														class="badge {violation.trend === 'decreasing'
															? 'badge-success'
															: violation.trend === 'increasing'
																? 'badge-error'
																: 'badge-warning'} badge-sm"
													>
														{violation.trend === 'decreasing'
															? '↓ 改善中'
															: violation.trend === 'increasing'
																? '↑ 悪化中'
																: '→ 横ばい'}
													</div>
												</div>

												<div class="card-actions mt-3 justify-end">
													<button class="btn btn-outline btn-xs">詳細分析</button>
													<button class="btn btn-primary btn-xs">対策立案</button>
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						</div>

						<!-- 部門別コンプライアンススコア -->
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<h2 class="card-title">部門別コンプライアンススコア</h2>
								<div class="space-y-4">
									{#each departments as dept}
										{@const deptScore = Math.max(
											85,
											Math.min(98, legalCompliance.complianceScore + Math.random() * 10 - 5)
										)}
										<div class="space-y-2">
											<div class="flex items-center justify-between">
												<span class="font-medium">{dept.name}</span>
												<div class="flex items-center gap-2">
													<span class="font-bold">{Math.round(deptScore)}%</span>
													<div
														class="badge {deptScore > 95
															? 'badge-success'
															: deptScore > 90
																? 'badge-warning'
																: 'badge-error'} badge-sm"
													>
														{deptScore > 95 ? '優秀' : deptScore > 90 ? '良好' : '要改善'}
													</div>
												</div>
											</div>
											<div class="flex items-center gap-2">
												<progress
													class="progress {deptScore > 95
														? 'progress-success'
														: deptScore > 90
															? 'progress-warning'
															: 'progress-error'} flex-1"
													value={deptScore}
													max="100"
												></progress>
												<span class="w-16 text-xs opacity-70">{dept.manager}</span>
											</div>
										</div>
									{/each}
								</div>

								<div class="divider"></div>

								<div class="grid grid-cols-3 gap-4 text-center">
									<div>
										<div class="text-success text-lg font-bold">6</div>
										<div class="text-xs opacity-70">優秀部門</div>
									</div>
									<div>
										<div class="text-warning text-lg font-bold">2</div>
										<div class="text-xs opacity-70">良好部門</div>
									</div>
									<div>
										<div class="text-error text-lg font-bold">0</div>
										<div class="text-xs opacity-70">要改善部門</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- アクションアイテム管理 -->
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<div class="mb-6 flex items-center justify-between">
								<h2 class="card-title">コンプライアンスアクションアイテム</h2>
								<div class="flex gap-2">
									<button class="btn btn-primary btn-sm">新規アクション追加</button>
									<button class="btn btn-outline btn-sm">一括エクスポート</button>
								</div>
							</div>

							<div class="overflow-x-auto">
								<table class="table-zebra table">
									<thead>
										<tr>
											<th>アクション項目</th>
											<th>対象部門</th>
											<th>優先度</th>
											<th>期限</th>
											<th>進捗</th>
											<th>担当者</th>
											<th>ステータス</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>
												<div class="font-medium">有給取得促進キャンペーン</div>
												<div class="text-xs opacity-70">年5日取得義務の達成支援</div>
											</td>
											<td>営業部・CS部</td>
											<td><div class="badge badge-error badge-sm">高</div></td>
											<td>2024-12-31</td>
											<td>
												<div class="flex items-center gap-2">
													<progress class="progress progress-primary w-16" value="65" max="100"
													></progress>
													<span class="text-xs">65%</span>
												</div>
											</td>
											<td>高橋美咲</td>
											<td><div class="badge badge-warning">進行中</div></td>
										</tr>
										<tr>
											<td>
												<div class="font-medium">残業時間削減プロジェクト</div>
												<div class="text-xs opacity-70">月45時間上限の徹底</div>
											</td>
											<td>開発部・営業部</td>
											<td><div class="badge badge-warning badge-sm">中</div></td>
											<td>2024-09-30</td>
											<td>
												<div class="flex items-center gap-2">
													<progress class="progress progress-success w-16" value="85" max="100"
													></progress>
													<span class="text-xs">85%</span>
												</div>
											</td>
											<td>田中太郎</td>
											<td><div class="badge badge-success">完了間近</div></td>
										</tr>
										<tr>
											<td>
												<div class="font-medium">健康診断受診率向上</div>
												<div class="text-xs opacity-70">未受診者への個別フォロー</div>
											</td>
											<td>全部門</td>
											<td><div class="badge badge-info badge-sm">低</div></td>
											<td>2024-10-31</td>
											<td>
												<div class="flex items-center gap-2">
													<progress class="progress progress-warning w-16" value="30" max="100"
													></progress>
													<span class="text-xs">30%</span>
												</div>
											</td>
											<td>伊藤麻衣</td>
											<td><div class="badge badge-info">計画中</div></td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>

					<!-- 有給取得義務対応 -->
					<div class="card bg-base-100 shadow-xl lg:col-span-2">
						<div class="card-body">
							<h2 class="card-title">有給休暇取得義務対応</h2>
							<div class="overflow-x-auto">
								<table class="table-zebra table">
									<thead>
										<tr>
											<th>従業員名</th>
											<th>取得済み</th>
											<th>必要日数</th>
											<th>残り日数</th>
											<th>期限</th>
											<th>ステータス</th>
											<th>アクション</th>
										</tr>
									</thead>
									<tbody>
										{#each vacationManagement.riskList as employee}
											<tr>
												<td class="font-bold">{employee.name}</td>
												<td>{employee.used}日</td>
												<td>{employee.required}日</td>
												<td class="text-error font-bold">{employee.remaining}日</td>
												<td>{employee.deadline}</td>
												<td>
													<div class="badge {getRiskBadge(employee.status)}">
														{employee.status === 'danger' ? '緊急' : 'リスク'}
													</div>
												</td>
												<td>
													<button
														class="btn btn-primary btn-xs"
														onclick={() => handleVacationPlan(employee.name)}>計画作成</button
													>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			{:else if currentView === 'employees'}
				<!-- 従業員管理 -->
				<div class="space-y-6">
					<!-- 従業員分析ダッシュボード -->
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
						<!-- 総従業員数 -->
						<div class="stat from-primary/10 to-secondary/10 rounded-box bg-gradient-to-br shadow">
							<div class="stat-figure text-primary">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-8 w-8"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
									/>
								</svg>
							</div>
							<div class="stat-title">総従業員数</div>
							<div class="stat-value">{totalEmployees}</div>
							<div class="stat-desc">前月比 +3名</div>
						</div>

						<!-- 出勤率 -->
						<div class="stat from-success/10 to-info/10 rounded-box bg-gradient-to-br shadow">
							<div class="stat-figure text-success">
								<div
									class="radial-progress text-success"
									style="--value:{attendanceRate}; --size:3rem;"
									role="progressbar"
								>
									{attendanceRate}%
								</div>
							</div>
							<div class="stat-title">本日の出勤率</div>
							<div class="stat-value">{attendanceRate}%</div>
							<div class="stat-desc">{presentEmployees}名出勤中</div>
						</div>

						<!-- 平均勤続年数 -->
						<div class="stat from-warning/10 to-error/10 rounded-box bg-gradient-to-br shadow">
							<div class="stat-figure text-warning">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-8 w-8"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div class="stat-title">平均勤続年数</div>
							<div class="stat-value">{averageTenure}年</div>
							<div class="stat-desc">業界平均 3.2年</div>
						</div>

						<!-- エンゲージメントスコア -->
						<div class="stat from-accent/10 to-primary/10 rounded-box bg-gradient-to-br shadow">
							<div class="stat-figure text-accent">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-8 w-8"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
									/>
								</svg>
							</div>
							<div class="stat-title">エンゲージメント</div>
							<div class="stat-value">78%</div>
							<div class="stat-desc">前月比 +2%</div>
						</div>
					</div>

					<!-- AIパワード従業員インサイト -->
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<div class="mb-4 flex items-center justify-between">
								<h2 class="card-title">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="h-6 w-6"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
										/>
									</svg>
									AI従業員インサイト
								</h2>
								<div class="badge badge-primary">リアルタイム分析</div>
							</div>

							<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
								<!-- 離職リスク予測 -->
								<div class="alert alert-warning">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										class="h-6 w-6 shrink-0 stroke-current"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15c-.77.833.192 2.5 1.732 2.5z"
										></path>
									</svg>
									<div>
										<h3 class="font-bold">離職リスク検知</h3>
										<div class="text-xs">営業部で3名が高リスク。面談推奨。</div>
									</div>
								</div>

								<!-- パフォーマンス予測 -->
								<div class="alert alert-success">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										class="h-6 w-6 shrink-0 stroke-current"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										></path>
									</svg>
									<div>
										<h3 class="font-bold">高パフォーマー</h3>
										<div class="text-xs">開発部で5名が期待を上回る成果。</div>
									</div>
								</div>

								<!-- スキルギャップ -->
								<div class="alert alert-info">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										class="h-6 w-6 shrink-0 stroke-current"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										></path>
									</svg>
									<div>
										<h3 class="font-bold">スキルギャップ</h3>
										<div class="text-xs">AIスキルを持つ人材が不足。採用推奨。</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- 高度な検索・フィルター -->
					<div class="card bg-base-100 shadow-lg">
						<div class="card-body">
							<div class="mb-4 flex items-center justify-between">
								<h2 class="text-lg font-bold">高度な検索・フィルター</h2>
								<button class="btn btn-ghost btn-sm"> フィルターをリセット </button>
							</div>

							<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
								<!-- AI検索 -->
								<div class="form-control col-span-2">
									<label class="label">
										<span class="label-text">AI検索（自然言語対応）</span>
									</label>
									<input
										type="text"
										placeholder="例：営業部で残業が多い人"
										class="input input-bordered w-full"
										bind:value={searchTerm}
									/>
								</div>

								<!-- 部門フィルター -->
								<div class="form-control">
									<label class="label">
										<span class="label-text">部門</span>
									</label>
									<select class="select select-bordered w-full" bind:value={selectedDepartment}>
										<option value="all">全部門</option>
										{#each departments as dept}
											<option value={dept.name}>{dept.name}</option>
										{/each}
									</select>
								</div>

								<!-- ステータスフィルター -->
								<div class="form-control">
									<label class="label">
										<span class="label-text">ステータス</span>
									</label>
									<select class="select select-bordered w-full">
										<option>全て</option>
										<option>アクティブ</option>
										<option>休職中</option>
										<option>退職予定</option>
									</select>
								</div>

								<!-- パフォーマンスレベル -->
								<div class="form-control">
									<label class="label">
										<span class="label-text">パフォーマンス</span>
									</label>
									<select class="select select-bordered w-full">
										<option>全レベル</option>
										<option>優秀（A）</option>
										<option>良好（B）</option>
										<option>標準（C）</option>
										<option>要改善（D）</option>
									</select>
								</div>

								<!-- 勤続年数 -->
								<div class="form-control">
									<label class="label">
										<span class="label-text">勤続年数</span>
									</label>
									<select class="select select-bordered w-full">
										<option>全期間</option>
										<option>1年未満</option>
										<option>1-3年</option>
										<option>3-5年</option>
										<option>5年以上</option>
									</select>
								</div>

								<!-- スキル検索 -->
								<div class="form-control">
									<label class="label">
										<span class="label-text">スキル</span>
									</label>
									<input
										type="text"
										placeholder="JavaScript, Python..."
										class="input input-bordered w-full"
									/>
								</div>

								<!-- ソート順 -->
								<div class="form-control">
									<label class="label">
										<span class="label-text">並び順</span>
									</label>
									<select class="select select-bordered w-full" bind:value={sortBy}>
										<option value="name">名前順</option>
										<option value="department">部門順</option>
										<option value="joinDate">入社日順</option>
										<option value="performance">パフォーマンス順</option>
										<option value="engagement">エンゲージメント順</option>
									</select>
								</div>
							</div>

							<!-- 保存されたフィルター -->
							<div class="mt-4 flex gap-2">
								<div class="badge badge-outline cursor-pointer">高パフォーマー</div>
								<div class="badge badge-outline cursor-pointer">新入社員</div>
								<div class="badge badge-outline cursor-pointer">リーダー候補</div>
								<div class="badge badge-outline cursor-pointer">離職リスク</div>
								<button class="btn btn-xs btn-primary">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="h-3 w-3"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M12 4.5v15m7.5-7.5h-15"
										/>
									</svg>
									フィルター保存
								</button>
							</div>

							<!-- アクション行 -->
							<div class="mt-4 flex items-center justify-between">
								<div class="flex items-center gap-2">
									<div class="badge badge-primary">{filteredEmployees.length}名</div>
									<span class="text-sm opacity-70">該当する従業員</span>
								</div>
								<div class="flex gap-2">
									<button class="btn btn-primary">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											class="h-5 w-5"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M12 4.5v15m7.5-7.5h-15"
											/>
										</svg>
										新規登録
									</button>
									<div class="dropdown dropdown-end">
										<div tabindex="0" role="button" class="btn btn-outline">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
												class="h-5 w-5"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
												/>
											</svg>
											エクスポート
										</div>
										<ul
											tabindex="0"
											class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
										>
											<li><a>CSV形式</a></li>
											<li><a>Excel形式</a></li>
											<li><a>PDF形式</a></li>
										</ul>
									</div>
									<button class="btn btn-outline"> 一括操作 </button>
								</div>
							</div>
						</div>
					</div>

					<!-- 従業員リスト -->
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<div class="mb-4 flex items-center justify-between">
								<h2 class="card-title">従業員一覧</h2>
								<div class="flex gap-2">
									<button class="btn btn-ghost btn-sm">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											class="h-4 w-4"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
											/>
										</svg>
										カード表示
									</button>
									<button class="btn btn-ghost btn-sm">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											class="h-4 w-4"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
											/>
										</svg>
										リスト表示
									</button>
								</div>
							</div>

							<div class="overflow-x-auto">
								<table class="table-pin-rows table">
									<thead>
										<tr>
											<th>
												<label>
													<input type="checkbox" class="checkbox" />
												</label>
											</th>
											<th>従業員</th>
											<th>部門・職位</th>
											<th>パフォーマンス</th>
											<th>エンゲージメント</th>
											<th>勤続年数</th>
											<th>ステータス</th>
											<th>リスク</th>
											<th>アクション</th>
										</tr>
									</thead>
									<tbody>
										{#each filteredEmployees as employee, i}
											{@const performance = ['A', 'A', 'B', 'B', 'B', 'C', 'C', 'D'][i % 8]}
											{@const engagement = [85, 78, 92, 65, 73, 88, 45, 95][i % 8]}
											{@const risk = i % 7 === 0 ? 'high' : i % 5 === 0 ? 'medium' : 'low'}
											<tr class="hover">
												<th>
													<label>
														<input type="checkbox" class="checkbox" />
													</label>
												</th>
												<td>
													<div class="flex items-center gap-3">
														<div class="avatar {employee.status === '欠勤' ? 'offline' : 'online'}">
															<div class="mask mask-squircle h-12 w-12">
																<img src={employee.avatar} alt={employee.name} />
															</div>
														</div>
														<div>
															<div class="font-bold">{employee.name}</div>
															<div class="text-sm opacity-50">
																ID: {employee.id.toString().padStart(4, '0')}
															</div>
														</div>
													</div>
												</td>
												<td>
													<div class="font-medium">{employee.department}</div>
													<div class="text-sm opacity-50">{employee.position}</div>
													<div class="mt-1 flex gap-1 text-xs opacity-50">
														{#if i % 3 === 0}
															<div class="badge badge-xs badge-primary">リーダー</div>
														{/if}
														{#if i % 5 === 0}
															<div class="badge badge-xs badge-secondary">メンター</div>
														{/if}
													</div>
												</td>
												<td>
													<div class="flex items-center gap-2">
														<div
															class="badge {performance === 'A'
																? 'badge-success'
																: performance === 'B'
																	? 'badge-info'
																	: performance === 'C'
																		? 'badge-warning'
																		: 'badge-error'} badge-sm"
														>
															{performance}
														</div>
														<div class="text-xs opacity-70">
															{performance === 'A'
																? '優秀'
																: performance === 'B'
																	? '良好'
																	: performance === 'C'
																		? '標準'
																		: '要改善'}
														</div>
													</div>
													<progress
														class="progress progress-xs {performance === 'A'
															? 'progress-success'
															: performance === 'B'
																? 'progress-info'
																: performance === 'C'
																	? 'progress-warning'
																	: 'progress-error'} w-16"
														value={performance === 'A'
															? 95
															: performance === 'B'
																? 80
																: performance === 'C'
																	? 65
																	: 40}
														max="100"
													>
													</progress>
												</td>
												<td>
													<div class="flex items-center gap-2">
														<div
															class="radial-progress text-xs {engagement > 80
																? 'text-success'
																: engagement > 60
																	? 'text-warning'
																	: 'text-error'}"
															style="--value:{engagement}; --size:2.5rem;"
															role="progressbar"
														>
															{engagement}%
														</div>
														<div class="text-xs opacity-70">
															{engagement > 80 ? '高い' : engagement > 60 ? '普通' : '低い'}
														</div>
													</div>
												</td>
												<td>
													<div class="font-mono text-sm">{calculateTenure(employee.joinDate)}</div>
													<div class="text-xs opacity-50">
														{new Date(employee.joinDate).toLocaleDateString('ja-JP')}
													</div>
												</td>
												<td>
													<div class="badge {getStatusBadge(employee.status)} badge-md">
														{employee.status}
													</div>
												</td>
												<td>
													<div class="flex items-center gap-1">
														{#if risk === 'high'}
															<div class="badge badge-error badge-sm">離職リスク</div>
														{:else if risk === 'medium'}
															<div class="badge badge-warning badge-sm">要注意</div>
														{:else}
															<div class="badge badge-success badge-sm">安定</div>
														{/if}
													</div>
												</td>
												<td>
													<div class="dropdown dropdown-end">
														<div tabindex="0" role="button" class="btn btn-ghost btn-xs">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																fill="none"
																viewBox="0 0 24 24"
																stroke-width="1.5"
																stroke="currentColor"
																class="h-5 w-5"
															>
																<path
																	stroke-linecap="round"
																	stroke-linejoin="round"
																	d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
																/>
															</svg>
														</div>
														<ul
															tabindex="0"
															class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
														>
															<li>
																<a onclick={() => showEmployeeDetails(employee)}>
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		fill="none"
																		viewBox="0 0 24 24"
																		stroke-width="1.5"
																		stroke="currentColor"
																		class="h-4 w-4"
																	>
																		<path
																			stroke-linecap="round"
																			stroke-linejoin="round"
																			d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
																		/>
																		<path
																			stroke-linecap="round"
																			stroke-linejoin="round"
																			d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
																		/>
																	</svg>
																	詳細表示
																</a>
															</li>
															<li>
																<a>
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		fill="none"
																		viewBox="0 0 24 24"
																		stroke-width="1.5"
																		stroke="currentColor"
																		class="h-4 w-4"
																	>
																		<path
																			stroke-linecap="round"
																			stroke-linejoin="round"
																			d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
																		/>
																	</svg>
																	編集
																</a>
															</li>
															<li>
																<a>
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		fill="none"
																		viewBox="0 0 24 24"
																		stroke-width="1.5"
																		stroke="currentColor"
																		class="h-4 w-4"
																	>
																		<path
																			stroke-linecap="round"
																			stroke-linejoin="round"
																			d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
																		/>
																	</svg>
																	フィードバック
																</a>
															</li>
															<li>
																<a>
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		fill="none"
																		viewBox="0 0 24 24"
																		stroke-width="1.5"
																		stroke="currentColor"
																		class="h-4 w-4"
																	>
																		<path
																			stroke-linecap="round"
																			stroke-linejoin="round"
																			d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
																		/>
																	</svg>
																	勤怠履歴
																</a>
															</li>
															<div class="divider my-1"></div>
															<li>
																<a class="text-error">
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		fill="none"
																		viewBox="0 0 24 24"
																		stroke-width="1.5"
																		stroke="currentColor"
																		class="h-4 w-4"
																	>
																		<path
																			stroke-linecap="round"
																			stroke-linejoin="round"
																			d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
																		/>
																	</svg>
																	削除
																</a>
															</li>
														</ul>
													</div>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>
					</div>

					<!-- 従業員分析ダッシュボード -->
					<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<!-- チーム構成分析 -->
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<h2 class="card-title">チーム構成分析</h2>

								<!-- 部門別人数分布 -->
								<div class="mt-6 space-y-4">
									<h3 class="text-sm font-bold opacity-70">部門別人数分布</h3>
									{#each departments as dept}
										{@const deptCount = employees.filter((e) => e.department === dept.name).length}
										{@const percentage = Math.round((deptCount / totalEmployees) * 100)}
										<div class="space-y-2">
											<div class="flex items-center justify-between">
												<span class="text-sm font-medium">{dept.name}</span>
												<div class="flex items-center gap-2">
													<span class="text-sm font-bold">{deptCount}名</span>
													<span class="text-xs opacity-70">({percentage}%)</span>
												</div>
											</div>
											<progress class="progress progress-primary" value={percentage} max="100"
											></progress>
										</div>
									{/each}
								</div>

								<!-- 世代構成 -->
								<div class="divider"></div>
								<h3 class="text-sm font-bold opacity-70">世代構成</h3>
								<div class="mt-4 grid grid-cols-2 gap-4">
									<div class="stat bg-base-200 rounded-box p-4">
										<div class="stat-title text-xs">20代</div>
										<div class="stat-value text-lg">28%</div>
										<div class="stat-desc text-xs">44名</div>
									</div>
									<div class="stat bg-base-200 rounded-box p-4">
										<div class="stat-title text-xs">30代</div>
										<div class="stat-value text-lg">45%</div>
										<div class="stat-desc text-xs">71名</div>
									</div>
									<div class="stat bg-base-200 rounded-box p-4">
										<div class="stat-title text-xs">40代</div>
										<div class="stat-value text-lg">22%</div>
										<div class="stat-desc text-xs">34名</div>
									</div>
									<div class="stat bg-base-200 rounded-box p-4">
										<div class="stat-title text-xs">50代+</div>
										<div class="stat-value text-lg">5%</div>
										<div class="stat-desc text-xs">8名</div>
									</div>
								</div>
							</div>
						</div>

						<!-- スキルマトリックス -->
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<h2 class="card-title">スキルマトリックス</h2>

								<!-- トップスキル -->
								<div class="mt-6 space-y-3">
									<h3 class="text-sm font-bold opacity-70">保有スキルTOP10</h3>
									{#each [{ name: 'JavaScript', count: 89, level: 'high' }, { name: 'Python', count: 67, level: 'high' }, { name: 'React', count: 62, level: 'medium' }, { name: 'TypeScript', count: 58, level: 'medium' }, { name: 'Node.js', count: 54, level: 'medium' }, { name: 'AWS', count: 48, level: 'medium' }, { name: 'Docker', count: 42, level: 'low' }, { name: 'Kubernetes', count: 28, level: 'low' }, { name: 'AI/ML', count: 23, level: 'critical' }, { name: 'Go', count: 19, level: 'critical' }] as skill}
										<div class="flex items-center justify-between">
											<div class="flex items-center gap-2">
												<span class="text-sm font-medium">{skill.name}</span>
												{#if skill.level === 'critical'}
													<div class="badge badge-error badge-xs">不足</div>
												{/if}
											</div>
											<div class="flex items-center gap-2">
												<progress
													class="progress {skill.level === 'high'
														? 'progress-success'
														: skill.level === 'medium'
															? 'progress-warning'
															: 'progress-error'} w-24"
													value={skill.count}
													max="100"
												></progress>
												<span class="w-12 text-right font-mono text-xs">{skill.count}名</span>
											</div>
										</div>
									{/each}
								</div>

								<div class="alert alert-warning mt-6">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										class="h-6 w-6 shrink-0 stroke-current"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15c-.77.833.192 2.5 1.732 2.5z"
										></path>
									</svg>
									<div>
										<h3 class="font-bold">スキルギャップ検出</h3>
										<div class="text-xs">AI/ML、Go言語の人材が不足。採用・研修を推奨。</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- パフォーマンス&エンゲージメント相関 -->
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h2 class="card-title">パフォーマンス & エンゲージメント分析</h2>

							<div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
								<!-- パフォーマンス分布 -->
								<div>
									<h3 class="mb-4 text-sm font-bold opacity-70">パフォーマンス分布</h3>
									<div class="space-y-3">
										<div class="flex items-center justify-between">
											<div class="flex items-center gap-2">
												<div class="badge badge-success">A</div>
												<span class="text-sm">優秀</span>
											</div>
											<div class="flex items-center gap-2">
												<progress class="progress progress-success w-20" value="15" max="100"
												></progress>
												<span class="font-mono text-xs">15%</span>
											</div>
										</div>
										<div class="flex items-center justify-between">
											<div class="flex items-center gap-2">
												<div class="badge badge-info">B</div>
												<span class="text-sm">良好</span>
											</div>
											<div class="flex items-center gap-2">
												<progress class="progress progress-info w-20" value="45" max="100"
												></progress>
												<span class="font-mono text-xs">45%</span>
											</div>
										</div>
										<div class="flex items-center justify-between">
											<div class="flex items-center gap-2">
												<div class="badge badge-warning">C</div>
												<span class="text-sm">標準</span>
											</div>
											<div class="flex items-center gap-2">
												<progress class="progress progress-warning w-20" value="35" max="100"
												></progress>
												<span class="font-mono text-xs">35%</span>
											</div>
										</div>
										<div class="flex items-center justify-between">
											<div class="flex items-center gap-2">
												<div class="badge badge-error">D</div>
												<span class="text-sm">要改善</span>
											</div>
											<div class="flex items-center gap-2">
												<progress class="progress progress-error w-20" value="5" max="100"
												></progress>
												<span class="font-mono text-xs">5%</span>
											</div>
										</div>
									</div>
								</div>

								<!-- エンゲージメント状況 -->
								<div>
									<h3 class="mb-4 text-sm font-bold opacity-70">エンゲージメント状況</h3>
									<div class="flex items-center justify-center">
										<div
											class="radial-progress text-primary"
											style="--value:78; --size:8rem;"
											role="progressbar"
										>
											<div class="text-center">
												<div class="text-2xl font-bold">78%</div>
												<div class="text-xs opacity-70">全社平均</div>
											</div>
										</div>
									</div>
									<div class="mt-4 grid grid-cols-3 gap-2 text-center">
										<div>
											<div class="text-xs opacity-70">高い</div>
											<div class="text-success font-bold">42%</div>
										</div>
										<div>
											<div class="text-xs opacity-70">普通</div>
											<div class="text-warning font-bold">48%</div>
										</div>
										<div>
											<div class="text-xs opacity-70">低い</div>
											<div class="text-error font-bold">10%</div>
										</div>
									</div>
								</div>

								<!-- 相関インサイト -->
								<div>
									<h3 class="mb-4 text-sm font-bold opacity-70">AIインサイト</h3>
									<div class="space-y-3">
										<div class="alert alert-success">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												class="h-6 w-6 shrink-0 stroke-current"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
												></path>
											</svg>
											<div class="text-xs">エンゲージメント80%以上の従業員の92%がA/B評価</div>
										</div>
										<div class="alert alert-warning">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												class="h-6 w-6 shrink-0 stroke-current"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15c-.77.833.192 2.5 1.732 2.5z"
												></path>
											</svg>
											<div class="text-xs">エンゲージメント60%以下で離職リスク3倍増</div>
										</div>
										<div class="alert alert-info">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												class="h-6 w-6 shrink-0 stroke-current"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
												></path>
											</svg>
											<div class="text-xs">リモートワーク導入でエンゲージメント平均+5%</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			{:else if currentView === 'attendance'}
				<!-- 勤怠管理 -->
				<div class="space-y-6">
					<!-- 今日の勤怠サマリー -->
					<div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
						<div
							class="card from-success to-success/80 text-success-content bg-gradient-to-br shadow-xl"
						>
							<div class="card-body p-6 text-center">
								<div class="text-4xl font-bold">{attendance.today?.present || 0}</div>
								<div class="text-sm opacity-90">オフィス出勤</div>
								<div class="text-xs opacity-75">
									{attendance.today && totalEmployees
										? Math.round((attendance.today.present / totalEmployees) * 100)
										: 0}% of {totalEmployees}名
								</div>
							</div>
						</div>

						<div class="card from-info to-info/80 text-info-content bg-gradient-to-br shadow-xl">
							<div class="card-body p-6 text-center">
								<div class="text-4xl font-bold">{attendance.today?.remote || 0}</div>
								<div class="text-sm opacity-90">リモート勤務</div>
								<div class="text-xs opacity-75">
									{attendance.today && totalEmployees
										? Math.round((attendance.today.remote / totalEmployees) * 100)
										: 0}% of {totalEmployees}名
								</div>
							</div>
						</div>

						<div
							class="card from-warning to-warning/80 text-warning-content bg-gradient-to-br shadow-xl"
						>
							<div class="card-body p-6 text-center">
								<div class="text-4xl font-bold">{attendance.today?.late || 0}</div>
								<div class="text-sm opacity-90">遅刻</div>
								<div class="text-xs opacity-75">要フォロー対象</div>
							</div>
						</div>

						<div class="card from-error to-error/80 text-error-content bg-gradient-to-br shadow-xl">
							<div class="card-body p-6 text-center">
								<div class="text-4xl font-bold">{attendance.today?.absent || 0}</div>
								<div class="text-sm opacity-90">欠勤</div>
								<div class="text-xs opacity-75">体調不良等</div>
							</div>
						</div>
					</div>

					<!-- 残業時間分析 -->
					<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<!-- 月次残業時間トレンド -->
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<div class="mb-4 flex items-center justify-between">
									<h2 class="card-title">月次残業時間トレンド</h2>
									<div class="badge badge-warning">2024年問題対応</div>
								</div>

								<!-- トレンドグラフ -->
								<div class="bg-base-200 flex h-64 items-end justify-between rounded-lg p-4">
									{#each overtimeTrendData || [] as data}
										<div class="relative flex flex-col items-center">
											<!-- 上限ライン表示 -->
											<div
												class="bg-error absolute top-4 h-px w-12"
												style="top: {80 - (data.limit / 50) * 80}px"
											></div>

											<!-- 平均残業時間バー -->
											<div class="mb-1 text-xs font-bold">{data.average}h</div>
											<div
												class="w-8 rounded-t-lg transition-all duration-300 hover:w-10 {data.average >
												40
													? 'bg-error'
													: data.average > 30
														? 'bg-warning'
														: 'bg-success'}"
												style="height: {(data.average / 50) * 200}px"
											></div>
											<div class="mt-2 origin-bottom-left rotate-45 text-xs font-medium">
												{data.month}
											</div>
										</div>
									{/each}
								</div>

								<!-- 凡例 -->
								<div class="mt-4 flex items-center justify-between text-xs">
									<div class="flex items-center gap-4">
										<div class="flex items-center gap-1">
											<div class="bg-success h-3 w-3 rounded"></div>
											<span>安全圏 (30h未満)</span>
										</div>
										<div class="flex items-center gap-1">
											<div class="bg-warning h-3 w-3 rounded"></div>
											<span>注意 (30-40h)</span>
										</div>
										<div class="flex items-center gap-1">
											<div class="bg-error h-3 w-3 rounded"></div>
											<span>危険 (40h超過)</span>
										</div>
									</div>
									<div class="text-error font-bold">━ 法定上限45h</div>
								</div>

								<div class="bg-warning/10 mt-4 rounded-lg p-3">
									<div class="text-warning text-sm font-medium">📈 トレンド分析</div>
									<div class="mt-1 text-xs">5月をピークに微減傾向。開発部の案件集中が主因。</div>
								</div>
							</div>
						</div>

						<!-- 部門別残業状況 -->
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<h2 class="card-title">部門別残業状況</h2>
								<div class="mt-4 space-y-4">
									{#each attendance.overtime?.departmentAverages || [] as dept}
										<div class="space-y-2">
											<div class="flex items-center justify-between">
												<span class="font-medium">{dept.department}</span>
												<div class="flex items-center gap-2">
													<span class="font-bold">{dept.average}h</span>
													<div
														class="badge {dept.risk === 'high'
															? 'badge-error'
															: dept.risk === 'medium'
																? 'badge-warning'
																: 'badge-success'} badge-sm"
													>
														{dept.risk === 'high'
															? '高リスク'
															: dept.risk === 'medium'
																? '要注意'
																: '安全'}
													</div>
												</div>
											</div>
											<div class="flex items-center gap-2">
												<progress
													class="progress {dept.risk === 'high'
														? 'progress-error'
														: dept.risk === 'medium'
															? 'progress-warning'
															: 'progress-success'} flex-1"
													value={dept.average}
													max="45"
												></progress>
												<span class="w-12 text-xs opacity-70"
													>{Math.round((dept.average / 45) * 100)}%</span
												>
											</div>
										</div>
									{/each}
								</div>

								<div class="alert alert-info mt-4">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										class="h-6 w-6 shrink-0 stroke-current"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										></path>
									</svg>
									<div>
										<h3 class="font-bold">改善提案</h3>
										<div class="text-xs">
											営業部: 顧客対応の効率化、開発部: リソース配分の見直し
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- 週間出勤パターンと残業アラート -->
					<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<!-- 週間出勤パターン -->
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<h2 class="card-title mb-4">週間出勤パターン</h2>
								<div class="bg-base-200 rounded-lg p-4">
									<div class="flex h-40 items-end justify-between">
										{#each attendance.weeklyData || [] as day}
											<div class="flex h-full flex-col items-center justify-end">
												<div class="mb-2 text-sm font-bold">{day.rate}%</div>
												<div
													class="bg-primary hover:bg-primary-focus flex w-12 items-end justify-center rounded-t-lg transition-colors"
													style="height: {(day.rate / 100) * 120}px"
												></div>
											</div>
										{/each}
									</div>
									<div class="mt-2 flex justify-between">
										{#each attendance.weeklyData || [] as day}
											<div class="flex flex-col items-center">
												<div class="text-sm font-medium">{day.day}</div>
												<div class="text-xs opacity-70">{day.present}名</div>
											</div>
										{/each}
									</div>
								</div>
								<div class="mt-4 text-center text-xs opacity-70">
									木曜日の出勤率が低い傾向（有給取得が多い）
								</div>
							</div>
						</div>

						<!-- 残業アラート -->
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<div class="mb-4 flex items-center justify-between">
									<h2 class="card-title">残業時間アラート</h2>
									<div class="badge badge-error">{attendance.overtime?.alerts?.length || 0}件</div>
								</div>
								<div class="space-y-3">
									{#each attendance.overtime?.alerts || [] as alert}
										<div class="alert {getAlertBadge(alert.type)}">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												class="h-6 w-6 shrink-0 stroke-current"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15c-.77.833.192 2.5 1.732 2.5z"
												></path>
											</svg>
											<div class="flex-1">
												<h3 class="font-bold">{alert.employee}</h3>
												<div class="text-xs">{alert.message}</div>
											</div>
											<button
												class="btn btn-sm btn-outline"
												onclick={() => handleComplianceAction(alert.type)}>対応</button
											>
										</div>
									{/each}
								</div>
							</div>
						</div>
					</div>

					<!-- 部門別有給取得率チャート -->
					<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<!-- 有給取得率ランキング -->
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<h2 class="card-title">部門別有給取得率</h2>
								<div class="mt-6 space-y-4">
									{#each (vacationManagement.departmentStats || []).toSorted((a, b) => b.compliance - a.compliance) as dept, index}
										<div class="space-y-2">
											<div class="flex items-center justify-between">
												<div class="flex items-center gap-2">
													<div
														class="badge {index < 2
															? 'badge-success'
															: index < 4
																? 'badge-warning'
																: 'badge-error'} badge-sm"
													>
														{index + 1}位
													</div>
													<span class="font-medium">{dept.department}</span>
												</div>
												<div class="flex items-center gap-2">
													<span class="text-lg font-bold">{dept.compliance}%</span>
													<div
														class="badge {dept.compliance >= 95
															? 'badge-success'
															: dept.compliance >= 85
																? 'badge-warning'
																: 'badge-error'} badge-sm"
													>
														{dept.compliance >= 95
															? '優秀'
															: dept.compliance >= 85
																? '良好'
																: '要改善'}
													</div>
												</div>
											</div>
											<div class="flex items-center gap-2">
												<progress
													class="progress {dept.compliance >= 95
														? 'progress-success'
														: dept.compliance >= 85
															? 'progress-warning'
															: 'progress-error'} flex-1"
													value={dept.compliance}
													max="100"
												></progress>
												<span class="w-16 text-xs opacity-70">{dept.used}日取得</span>
											</div>
										</div>
									{/each}
								</div>

								<div class="alert alert-info mt-6">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										class="h-6 w-6 shrink-0 stroke-current"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										></path>
									</svg>
									<div>
										<h3 class="font-bold">取得促進が必要</h3>
										<div class="text-xs">
											営業部・カスタマーサポート部: 個別面談で取得計画を作成
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- 有給取得日数分析 -->
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<h2 class="card-title mb-4">部門別取得日数分析</h2>
								<div class="bg-base-200 rounded-lg p-4">
									<div class="flex h-48 items-end justify-between">
										{#each vacationManagement.departmentStats || [] as dept}
											<div class="flex h-full flex-col items-center justify-end">
												<div class="mb-2 text-sm font-bold">{dept.used}日</div>
												<div
													class="flex w-8 items-end justify-center rounded-t-lg transition-all hover:w-10 {dept.used >=
													9
														? 'bg-success'
														: dept.used >= 7
															? 'bg-warning'
															: 'bg-error'}"
													style="height: {(dept.used / 12) * 140}px"
												></div>
											</div>
										{/each}
									</div>
									<div class="mt-3 flex justify-between">
										{#each vacationManagement.departmentStats || [] as dept}
											<div class="flex flex-col items-center">
												<div
													class="w-12 origin-center -rotate-45 transform text-center text-xs font-medium"
												>
													{dept.department.replace('部', '')}
												</div>
												<div class="mt-4 text-xs opacity-70">{dept.compliance}%</div>
											</div>
										{/each}
									</div>
								</div>
								<div class="mt-4 flex justify-center gap-4 text-xs">
									<div class="flex items-center gap-1">
										<div class="bg-success h-3 w-3 rounded"></div>
										<span>9日以上（優秀）</span>
									</div>
									<div class="flex items-center gap-1">
										<div class="bg-warning h-3 w-3 rounded"></div>
										<span>7-9日（良好）</span>
									</div>
									<div class="flex items-center gap-1">
										<div class="bg-error h-3 w-3 rounded"></div>
										<span>7日未満（要改善）</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- 有給取得パターン分析 -->
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h2 class="card-title">有給取得パターン & 義務達成状況</h2>
							<div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
								<!-- 全社統計 -->
								<div class="stats from-primary/10 to-secondary/10 rounded-box bg-gradient-to-br">
									<div class="stat">
										<div class="stat-title">全社平均取得率</div>
										<div class="stat-value text-2xl">
											{Math.round(
												(vacationManagement.departmentStats || []).reduce((sum, d) => sum + d.compliance, 0) /
													(vacationManagement.departmentStats?.length || 1)
											)}%
										</div>
										<div class="stat-desc">
											平均 {(
												(vacationManagement.departmentStats || []).reduce((sum, d) => sum + d.used, 0) /
												(vacationManagement.departmentStats?.length || 1)
											).toFixed(1)}日取得
										</div>
									</div>
								</div>

								<!-- 義務達成状況 -->
								<div class="stats from-success/10 to-info/10 rounded-box bg-gradient-to-br">
									<div class="stat">
										<div class="stat-title">年5日義務達成</div>
										<div class="stat-value text-2xl">
											{(vacationManagement.departmentStats || []).filter((d) => d.used >= 5).length}
										</div>
										<div class="stat-desc">{vacationManagement.departmentStats?.length || 0}部門中</div>
									</div>
								</div>

								<!-- 改善必要部門 -->
								<div class="stats from-warning/10 to-error/10 rounded-box bg-gradient-to-br">
									<div class="stat">
										<div class="stat-title">改善必要部門</div>
										<div class="stat-value text-2xl">
											{(vacationManagement.departmentStats || []).filter((d) => d.compliance < 85).length}
										</div>
										<div class="stat-desc">85%未満の部門</div>
									</div>
								</div>
							</div>

							<!-- 取得パターン詳細 -->
							<div class="mt-6 overflow-x-auto">
								<table class="table-zebra table">
									<thead>
										<tr>
											<th>部門</th>
											<th>取得率</th>
											<th>取得日数</th>
											<th>必要日数</th>
											<th>残り日数</th>
											<th>評価</th>
											<th>対応状況</th>
										</tr>
									</thead>
									<tbody>
										{#each vacationManagement.departmentStats || [] as dept}
											<tr>
												<td class="font-medium">{dept.department}</td>
												<td>
													<div class="flex items-center gap-2">
														<span class="font-bold">{dept.compliance}%</span>
														<progress
															class="progress progress-sm {dept.compliance >= 95
																? 'progress-success'
																: dept.compliance >= 85
																	? 'progress-warning'
																	: 'progress-error'} w-16"
															value={dept.compliance}
															max="100"
														></progress>
													</div>
												</td>
												<td><span class="font-bold">{dept.used}</span>日</td>
												<td>{dept.required}日</td>
												<td
													class="font-bold {dept.used >= dept.required
														? 'text-success'
														: 'text-error'}"
												>
													{Math.max(0, dept.required - dept.used)}日
												</td>
												<td>
													<div
														class="badge {dept.compliance >= 95
															? 'badge-success'
															: dept.compliance >= 85
																? 'badge-warning'
																: 'badge-error'} badge-sm"
													>
														{dept.compliance >= 95
															? '優秀'
															: dept.compliance >= 85
																? '良好'
																: '要改善'}
													</div>
												</td>
												<td>
													{#if dept.compliance < 85}
														<button class="btn btn-warning btn-xs">改善計画</button>
													{:else if dept.compliance < 95}
														<button class="btn btn-info btn-xs">継続促進</button>
													{:else}
														<div class="badge badge-success badge-xs">模範部門</div>
													{/if}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			{:else if currentView === 'recruitment'}
				<!-- 採用管理 -->
				<div class="space-y-6">
					<!-- 採用ファネル可視化 -->
					<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<!-- 採用ファネルチャート -->
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<h2 class="card-title">採用ファネル分析</h2>
								<div class="mt-6 space-y-4">
									<!-- 応募段階 -->
									<div class="space-y-2">
										<div class="flex items-center justify-between">
											<span class="font-medium">応募</span>
											<div class="flex items-center gap-2">
												<span class="font-bold"
													>{recruitment.metrics?.totalApplications || 0}名</span
												>
												<span class="text-xs opacity-70">100%</span>
											</div>
										</div>
										<div class="bg-primary/20 relative h-8 w-full rounded-full">
											<div
												class="bg-primary text-primary-content flex h-8 items-center justify-center rounded-full font-bold"
												style="width: 100%"
											>
												{recruitment.metrics?.totalApplications || 0}名
											</div>
										</div>
									</div>

									<!-- 書類選考通過 -->
									<div class="space-y-2">
										<div class="flex items-center justify-between">
											<span class="font-medium">書類選考通過</span>
											<div class="flex items-center gap-2">
												<span class="font-bold"
													>{Math.round((recruitment.metrics?.totalApplications || 0) * 0.4)}名</span
												>
												<span class="text-xs opacity-70">40%</span>
											</div>
										</div>
										<div class="bg-secondary/20 relative h-8 w-full rounded-full">
											<div
												class="bg-secondary text-secondary-content flex h-8 items-center justify-center rounded-full font-bold"
												style="width: 40%"
											>
												{Math.round((recruitment.metrics?.totalApplications || 0) * 0.4)}名
											</div>
										</div>
									</div>

									<!-- 面接実施 -->
									<div class="space-y-2">
										<div class="flex items-center justify-between">
											<span class="font-medium">面接実施</span>
											<div class="flex items-center gap-2">
												<span class="font-bold"
													>{Math.round((recruitment.metrics?.totalApplications || 0) * 0.2)}名</span
												>
												<span class="text-xs opacity-70">20%</span>
											</div>
										</div>
										<div class="bg-accent/20 relative h-8 w-full rounded-full">
											<div
												class="bg-accent text-accent-content flex h-8 items-center justify-center rounded-full font-bold"
												style="width: 20%"
											>
												{Math.round((recruitment.metrics?.totalApplications || 0) * 0.2)}名
											</div>
										</div>
									</div>

									<!-- 最終選考 -->
									<div class="space-y-2">
										<div class="flex items-center justify-between">
											<span class="font-medium">最終選考</span>
											<div class="flex items-center gap-2">
												<span class="font-bold"
													>{Math.round((recruitment.metrics?.totalApplications || 0) * 0.1)}名</span
												>
												<span class="text-xs opacity-70">10%</span>
											</div>
										</div>
										<div class="bg-warning/20 relative h-8 w-full rounded-full">
											<div
												class="bg-warning text-warning-content flex h-8 items-center justify-center rounded-full font-bold"
												style="width: 10%"
											>
												{Math.round((recruitment.metrics?.totalApplications || 0) * 0.1)}名
											</div>
										</div>
									</div>

									<!-- 内定 -->
									<div class="space-y-2">
										<div class="flex items-center justify-between">
											<span class="font-medium">内定</span>
											<div class="flex items-center gap-2">
												<span class="font-bold"
													>{Math.round(
														(recruitment.metrics?.totalApplications || 0) * 0.05
													)}名</span
												>
												<span class="text-xs opacity-70">5%</span>
											</div>
										</div>
										<div class="bg-success/20 relative h-8 w-full rounded-full">
											<div
												class="bg-success text-success-content flex h-8 items-center justify-center rounded-full font-bold"
												style="width: 5%"
											>
												{Math.round((recruitment.metrics?.totalApplications || 0) * 0.05)}名
											</div>
										</div>
									</div>
								</div>

								<div class="alert alert-info mt-6">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										class="h-6 w-6 shrink-0 stroke-current"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										></path>
									</svg>
									<div>
										<h3 class="font-bold">コンバージョン率</h3>
										<div class="text-xs">書類選考: 40% | 面接: 50% | 最終: 50% | 内定: 50%</div>
									</div>
								</div>
							</div>
						</div>

						<!-- 採用KPIダッシュボード -->
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<h2 class="card-title">採用KPI</h2>
								<div class="mt-6 grid grid-cols-2 gap-4">
									<div class="stat bg-primary/10 rounded-box p-4">
										<div class="stat-title text-xs">平均採用期間</div>
										<div class="stat-value text-primary text-lg">
											{recruitment.metrics?.averageTimeToHire || 0}日
										</div>
										<div class="stat-desc text-xs">業界平均: 35日</div>
									</div>

									<div class="stat bg-success/10 rounded-box p-4">
										<div class="stat-title text-xs">内定承諾率</div>
										<div class="stat-value text-success text-lg">
											{recruitment.metrics?.acceptanceRate || 0}%
										</div>
										<div class="stat-desc text-xs">前月比 +3%</div>
									</div>

									<div class="stat bg-secondary/10 rounded-box p-4">
										<div class="stat-title text-xs">面接率</div>
										<div class="stat-value text-secondary text-lg">
											{recruitment.metrics?.interviewRate || 0}%
										</div>
										<div class="stat-desc text-xs">書類→面接</div>
									</div>

									<div class="stat bg-accent/10 rounded-box p-4">
										<div class="stat-title text-xs">内定率</div>
										<div class="stat-value text-accent text-lg">
											{recruitment.metrics?.offerRate || 0}%
										</div>
										<div class="stat-desc text-xs">面接→内定</div>
									</div>
								</div>

								<!-- 部門別採用状況 -->
								<div class="mt-6">
									<h3 class="mb-3 font-bold">部門別採用状況</h3>
									<div class="space-y-3">
										{#each recruitment.openPositions || [] as position}
											<div class="bg-base-200 flex items-center justify-between rounded-lg p-3">
												<div>
													<div class="text-sm font-medium">{position.title}</div>
													<div class="text-xs opacity-70">{position.department}</div>
												</div>
												<div class="text-right">
													<div class="text-sm font-bold">{position.applicants}名応募</div>
													<div class="text-xs opacity-70">{position.interviews}名面接中</div>
												</div>
											</div>
										{/each}
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- 採用プロセス管理 -->
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h2 class="card-title">採用プロセス ステップ管理</h2>
							<div class="steps mt-6 w-full">
								<div class="step step-primary">
									応募受付
									<div class="badge badge-primary badge-sm">
										{recruitment.metrics?.totalApplications || 0}
									</div>
								</div>
								<div class="step step-primary">
									書類選考
									<div class="badge badge-secondary badge-sm">
										{Math.round((recruitment.metrics?.totalApplications || 0) * 0.4)}
									</div>
								</div>
								<div class="step step-primary">
									面接実施
									<div class="badge badge-accent badge-sm">
										{Math.round((recruitment.metrics?.totalApplications || 0) * 0.2)}
									</div>
								</div>
								<div class="step step-primary">
									最終選考
									<div class="badge badge-warning badge-sm">
										{Math.round((recruitment.metrics?.totalApplications || 0) * 0.1)}
									</div>
								</div>
								<div class="step step-primary">
									内定・入社
									<div class="badge badge-success badge-sm">
										{Math.round((recruitment.metrics?.totalApplications || 0) * 0.05)}
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- 求人管理 -->
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<div class="mb-4 flex items-center justify-between">
								<h2 class="card-title">募集中の求人</h2>
								<button class="btn btn-primary" onclick={() => (showJobModal = true)}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="h-5 w-5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M12 4.5v15m7.5-7.5h-15"
										/>
									</svg>
									新規求人追加
								</button>
							</div>
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
								{#each recruitment.openPositions || [] as position}
									<div class="card from-base-200 to-base-300 border bg-gradient-to-br shadow-lg">
										<div class="card-body p-6">
											<div class="mb-3 flex items-start justify-between">
												<h3 class="card-title text-lg">{position.title}</h3>
												<div class="badge {getPriorityBadge(position.priority)}">
													{position.priority === 'high'
														? '緊急'
														: position.priority === 'medium'
															? '通常'
															: '低'}
												</div>
											</div>

											<div class="mb-4 space-y-2">
												<div class="text-sm opacity-70">{position.department}</div>
												<div class="badge badge-outline">{position.salary}</div>
											</div>

											<div class="mb-4 grid grid-cols-2 gap-3">
												<div class="stat bg-base-100 rounded p-2">
													<div class="stat-title text-xs">応募者</div>
													<div class="stat-value text-lg">{position.applicants}</div>
												</div>
												<div class="stat bg-base-100 rounded p-2">
													<div class="stat-title text-xs">面接中</div>
													<div class="stat-value text-lg">{position.interviews}</div>
												</div>
											</div>

											<div class="card-actions justify-end">
												<button class="btn btn-ghost btn-sm">詳細</button>
												<button class="btn btn-primary btn-sm">応募者管理</button>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{:else if currentView === 'health'}
				<!-- 健康管理 -->
				<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<!-- ストレスチェック状況 -->
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h2 class="card-title">ストレスチェック</h2>
							<div class="stats stats-vertical">
								<div class="stat">
									<div class="stat-title">実施率</div>
									<div class="stat-value text-primary">
										{healthManagement.stressCheck
											? Math.round(
													(healthManagement.stressCheck.completed /
														healthManagement.stressCheck.total) *
														100
												)
											: 0}%
									</div>
									<div class="stat-desc">
										{healthManagement.stressCheck?.completed || 0}/{healthManagement.stressCheck
											?.total || 0}名実施済み
									</div>
								</div>
								<div class="stat">
									<div class="stat-title">高ストレス者</div>
									<div class="stat-value text-error">
										{healthManagement.stressCheck?.highRisk || 0}名
									</div>
									<div class="stat-desc">要面接指導</div>
								</div>
								<div class="stat">
									<div class="stat-title">要支援者</div>
									<div class="stat-value text-warning">
										{healthManagement.stressCheck?.needsSupport || 0}名
									</div>
									<div class="stat-desc">フォロー必要</div>
								</div>
							</div>
						</div>
					</div>

					<!-- 部門別ストレス状況 -->
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h2 class="card-title">部門別ストレス状況</h2>
							<div class="space-y-4">
								{#each healthManagement.healthData || [] as dept}
									<div class="space-y-2">
										<div class="flex items-center justify-between">
											<span class="font-medium">{dept.department}</span>
											<div class="flex items-center gap-2">
												<span class="font-bold">{dept.avgStress}点</span>
												<div
													class="badge {dept.trend === 'up'
														? 'badge-error'
														: dept.trend === 'down'
															? 'badge-success'
															: 'badge-warning'}"
												>
													{dept.trend === 'up' ? '↑' : dept.trend === 'down' ? '↓' : '→'}
												</div>
											</div>
										</div>
										<progress
											class="progress {dept.avgStress > 60
												? 'progress-error'
												: dept.avgStress > 50
													? 'progress-warning'
													: 'progress-success'}"
											value={dept.avgStress}
											max="100"
										></progress>
									</div>
								{/each}
							</div>
						</div>
					</div>

					<!-- 健康診断・産業医面談 -->
					<div class="card bg-base-100 shadow-xl lg:col-span-2">
						<div class="card-body">
							<h2 class="card-title">健康管理スケジュール</h2>
							<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
								<div class="card bg-primary text-primary-content">
									<div class="card-body">
										<h3 class="card-title">定期健康診断</h3>
										<p>次回実施予定</p>
										<p class="text-2xl font-bold">2024年9月</p>
									</div>
								</div>
								<div class="card bg-secondary text-secondary-content">
									<div class="card-body">
										<h3 class="card-title">産業医面談</h3>
										<p>今月予定</p>
										<p class="text-2xl font-bold">3名</p>
									</div>
								</div>
								<div class="card bg-accent text-accent-content">
									<div class="card-body">
										<h3 class="card-title">保健指導</h3>
										<p>対象者</p>
										<p class="text-2xl font-bold">2名</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- 新規求人追加モーダル -->
			<input type="checkbox" id="job-modal" class="modal-toggle" bind:checked={showJobModal} />
			<div class="modal">
				<div class="modal-box">
					<h3 class="text-lg font-bold">新規求人追加</h3>
					<div class="space-y-4 py-4">
						<div>
							<label class="label">
								<span class="label-text">職種名</span>
							</label>
							<input
								type="text"
								placeholder="例: フロントエンドエンジニア"
								class="input input-bordered w-full"
								bind:value={newJob.title}
							/>
						</div>

						<div>
							<label class="label">
								<span class="label-text">部門</span>
							</label>
							<select class="select select-bordered w-full" bind:value={newJob.department}>
								{#each departments as dept}
									<option value={dept.name}>{dept.name}</option>
								{/each}
							</select>
						</div>

						<div>
							<label class="label">
								<span class="label-text">給与範囲</span>
							</label>
							<input
								type="text"
								placeholder="例: 500-800万円"
								class="input input-bordered w-full"
								bind:value={newJob.salary}
							/>
						</div>

						<div>
							<label class="label">
								<span class="label-text">優先度</span>
							</label>
							<select class="select select-bordered w-full" bind:value={newJob.priority}>
								<option value="high">高</option>
								<option value="medium">中</option>
								<option value="low">低</option>
							</select>
						</div>

						<div>
							<label class="label">
								<span class="label-text">職務内容</span>
							</label>
							<textarea
								class="textarea textarea-bordered w-full"
								placeholder="職務内容の詳細..."
								bind:value={newJob.description}
							></textarea>
						</div>
					</div>

					<div class="modal-action">
						<button class="btn btn-ghost" onclick={() => (showJobModal = false)}>キャンセル</button>
						<button class="btn btn-primary" onclick={addNewJob}>求人を追加</button>
					</div>
				</div>
			</div>

			<!-- 従業員詳細モーダル -->
			<input
				type="checkbox"
				id="employee-modal"
				class="modal-toggle"
				bind:checked={showEmployeeModal}
			/>
			<div class="modal">
				<div class="modal-box">
					{#if selectedEmployee}
						<h3 class="text-lg font-bold">従業員詳細情報</h3>
						<div class="py-4">
							<div class="mb-6 flex items-center gap-4">
								<div class="avatar">
									<div class="w-20 rounded-full">
										<img src={selectedEmployee.avatar} alt={selectedEmployee.name} />
									</div>
								</div>
								<div>
									<h4 class="text-xl font-bold">{selectedEmployee.name}</h4>
									<p class="text-sm opacity-70">
										ID: {selectedEmployee.id.toString().padStart(3, '0')}
									</p>
									<div class="badge {getStatusBadge(selectedEmployee.status)} mt-1">
										{selectedEmployee.status}
									</div>
								</div>
							</div>

							<div class="grid grid-cols-2 gap-4">
								<div class="space-y-2">
									<div>
										<span class="font-medium">部門:</span>
										<span class="ml-2">{selectedEmployee.department}</span>
									</div>
									<div>
										<span class="font-medium">職位:</span>
										<span class="ml-2">{selectedEmployee.position}</span>
									</div>
									<div>
										<span class="font-medium">入社日:</span>
										<span class="ml-2"
											>{new Date(selectedEmployee.joinDate).toLocaleDateString('ja-JP')}</span
										>
									</div>
								</div>
								<div class="space-y-2">
									<div>
										<span class="font-medium">勤続年数:</span>
										<span class="ml-2">{calculateTenure(selectedEmployee.joinDate)}</span>
									</div>
									<div>
										<span class="font-medium">ステータス:</span>
										<span class="ml-2">{selectedEmployee.status}</span>
									</div>
								</div>
							</div>

							<div class="divider"></div>

							<div class="grid grid-cols-3 gap-4">
								<div class="stat bg-base-200 rounded-box">
									<div class="stat-title">今月残業</div>
									<div class="stat-value text-sm">28h</div>
								</div>
								<div class="stat bg-base-200 rounded-box">
									<div class="stat-title">有給残</div>
									<div class="stat-value text-sm">12日</div>
								</div>
								<div class="stat bg-base-200 rounded-box">
									<div class="stat-title">評価</div>
									<div class="stat-value text-sm">A</div>
								</div>
							</div>
						</div>

						<div class="modal-action">
							<button class="btn btn-ghost" onclick={() => (showEmployeeModal = false)}
								>閉じる</button
							>
							<button class="btn btn-primary" onclick={() => alert('編集画面を開きます')}
								>編集</button
							>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
