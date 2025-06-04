/**
 * プロジェクト管理ダッシュボード モックデータサービス
 *
 * @description
 * このファイルは開発・デモ用のモックデータを提供します。
 * 実際のRDBの構造を模倣したデータ形式で、本番環境への移行を容易にします。
 *
 * RDBテーブル設計:
 *
 * projects テーブル:
 * - project_id: UUID PRIMARY KEY
 * - project_name: VARCHAR(200) NOT NULL
 * - description: TEXT
 * - status: ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled')
 * - start_date: DATE
 * - end_date: DATE
 * - budget: DECIMAL(15,2)
 * - owner_id: UUID REFERENCES users(user_id)
 * - created_at: TIMESTAMP DEFAULT NOW()
 * - updated_at: TIMESTAMP DEFAULT NOW()
 *
 * tasks テーブル:
 * - task_id: UUID PRIMARY KEY
 * - project_id: UUID REFERENCES projects(project_id)
 * - task_name: VARCHAR(200) NOT NULL
 * - status: ENUM('todo', 'in_progress', 'review', 'done')
 * - priority: ENUM('low', 'medium', 'high', 'critical')
 * - assignee_id: UUID REFERENCES users(user_id)
 * - start_date: DATE
 * - due_date: DATE
 * - estimated_hours: DECIMAL(5,2)
 * - actual_hours: DECIMAL(5,2)
 * - progress_percentage: INTEGER DEFAULT 0
 * - position: INTEGER
 * - created_at: TIMESTAMP DEFAULT NOW()
 * - updated_at: TIMESTAMP DEFAULT NOW()
 */

// モックプロジェクトデータ
const mockProjects = [
	{
		project_id: 'proj_1',
		project_name: 'Webサイトリニューアル',
		description: 'コーポレートサイトの全面リニューアルプロジェクト',
		status: 'active',
		start_date: '2024-01-15',
		end_date: '2024-06-30',
		budget: 5000000,
		owner_id: 'user_pm1',
		created_at: '2024-01-10T09:00:00Z'
	},
	{
		project_id: 'proj_2',
		project_name: 'モバイルアプリ開発',
		description: 'iOS/Android対応のネイティブアプリ開発',
		status: 'active',
		start_date: '2024-02-01',
		end_date: '2024-08-31',
		budget: 8000000,
		owner_id: 'user_pm2',
		created_at: '2024-01-25T10:00:00Z'
	},
	{
		project_id: 'proj_3',
		project_name: 'データ基盤構築',
		description: 'データウェアハウスとBI環境の構築',
		status: 'planning',
		start_date: '2024-03-01',
		end_date: '2024-12-31',
		budget: 12000000,
		owner_id: 'user_pm1',
		created_at: '2024-02-15T11:00:00Z'
	}
];

// モックタスクデータ
const mockTasks = [
	{
		task_id: 'task_1',
		project_id: 'proj_1',
		task_name: '要件定義',
		status: 'done',
		priority: 'high',
		assignee_id: 'user_analyst1',
		start_date: '2024-01-15',
		due_date: '2024-02-15',
		estimated_hours: 80,
		actual_hours: 85,
		progress_percentage: 100,
		position: 1
	},
	{
		task_id: 'task_2',
		project_id: 'proj_1',
		task_name: 'UIデザイン',
		status: 'in_progress',
		priority: 'high',
		assignee_id: 'user_designer1',
		start_date: '2024-02-16',
		due_date: '2024-03-31',
		estimated_hours: 120,
		actual_hours: 60,
		progress_percentage: 75,
		position: 1
	},
	{
		task_id: 'task_3',
		project_id: 'proj_1',
		task_name: 'フロントエンド実装',
		status: 'todo',
		priority: 'medium',
		assignee_id: 'user_dev1',
		start_date: '2024-04-01',
		due_date: '2024-05-31',
		estimated_hours: 200,
		actual_hours: 0,
		progress_percentage: 0,
		position: 1
	},
	{
		task_id: 'task_4',
		project_id: 'proj_2',
		task_name: 'アーキテクチャ設計',
		status: 'review',
		priority: 'high',
		assignee_id: 'user_dev2',
		start_date: '2024-02-01',
		due_date: '2024-02-29',
		estimated_hours: 60,
		actual_hours: 58,
		progress_percentage: 90,
		position: 1
	}
];

// モックチームメンバーデータ
const mockTeamMembers = [
	{
		project_id: 'proj_1',
		user_id: 'user_pm1',
		user_name: '田中 太郎',
		role: 'project_manager',
		current_workload_percentage: 85
	},
	{
		project_id: 'proj_1',
		user_id: 'user_designer1',
		user_name: '佐藤 花子',
		role: 'designer',
		current_workload_percentage: 90
	},
	{
		project_id: 'proj_2',
		user_id: 'user_pm2',
		user_name: '高橋 三郎',
		role: 'project_manager',
		current_workload_percentage: 75
	}
];

// モックマイルストーンデータ
const mockMilestones = [
	{
		milestone_id: 'milestone_1',
		project_id: 'proj_1',
		milestone_name: 'デザイン完成',
		due_date: '2024-03-31',
		status: 'in_progress',
		completion_percentage: 75
	},
	{
		milestone_id: 'milestone_2',
		project_id: 'proj_2',
		milestone_name: 'MVP完成',
		due_date: '2024-06-30',
		status: 'in_progress',
		completion_percentage: 40
	}
];

/**
 * プロジェクト一覧を取得
 */
export function getProjects(params = {}) {
	let filteredProjects = [...mockProjects];

	if (params.status) {
		filteredProjects = filteredProjects.filter((p) => p.status === params.status);
	}

	return Promise.resolve(filteredProjects);
}

/**
 * プロジェクト概要メトリクスを取得
 */
export function getProjectMetrics(projectId = 'all') {
	const projects =
		projectId === 'all' ? mockProjects : mockProjects.filter((p) => p.project_id === projectId);
	const projectIds = projects.map((p) => p.project_id);
	const projectTasks = mockTasks.filter((t) => projectIds.includes(t.project_id));

	// 遅延タスクの計算（期限が過ぎているタスク）
	const today = new Date();
	const overdueTasks = projectTasks.filter((t) => {
		const dueDate = new Date(t.due_date);
		return dueDate < today && t.status !== 'done';
	}).length;

	// プロジェクトに関わるメンバー数を計算
	const assignedMemberIds = new Set(projectTasks.map((t) => t.assignee_id).filter(Boolean));
	const totalMembers = assignedMemberIds.size;

	const metrics = {
		totalProjects: projects.length,
		activeProjects: projects.filter((p) => p.status === 'active').length,
		totalTasks: projectTasks.length,
		completedTasks: projectTasks.filter((t) => t.status === 'done').length,
		inProgressTasks: projectTasks.filter((t) => t.status === 'in_progress').length,
		todoTasks: projectTasks.filter((t) => t.status === 'todo').length,
		reviewTasks: projectTasks.filter((t) => t.status === 'review').length,
		overdueTasks: overdueTasks,
		totalMembers: totalMembers,
		averageProgress:
			projectTasks.length > 0
				? Math.round(
						projectTasks.reduce((sum, t) => sum + t.progress_percentage, 0) / projectTasks.length
					)
				: 0
	};

	return Promise.resolve(metrics);
}

/**
 * チームメンバーの稼働状況を取得
 */
export function getTeamWorkload(projectId = 'all') {
	let members = [...mockTeamMembers];

	if (projectId !== 'all') {
		members = members.filter((m) => m.project_id === projectId);
	}

	const workloadData = members.map((member) => {
		const assignedTasks = mockTasks.filter((t) => t.assignee_id === member.user_id);

		return {
			...member,
			name: member.user_name, // user_name を name にマッピング
			allocated: member.current_workload_percentage, // current_workload_percentage を allocated にマッピング
			tasks: assignedTasks.length, // タスク数
			assigned_tasks_count: assignedTasks.length,
			workload_status:
				member.current_workload_percentage >= 100
					? 'overload'
					: member.current_workload_percentage >= 80
						? 'high'
						: member.current_workload_percentage >= 60
							? 'normal'
							: 'low'
		};
	});

	return Promise.resolve(workloadData);
}

/**
 * マイルストーン情報を取得
 */
export function getMilestones(projectId = 'all') {
	let milestones = [...mockMilestones];

	if (projectId !== 'all') {
		milestones = milestones.filter((m) => m.project_id === projectId);
	}

	return Promise.resolve(milestones);
}

/**
 * ガントチャート用データを取得
 */
export function getGanttData(projectId = 'all', viewMode = 'month') {
	let tasks = [...mockTasks];

	if (projectId !== 'all') {
		tasks = tasks.filter((t) => t.project_id === projectId);
	}

	const ganttTasks = tasks.map((task) => ({
		id: task.task_id,
		name: task.task_name,
		start: task.start_date,
		end: task.due_date,
		progress: task.progress_percentage,
		status: task.status
	}));

	return Promise.resolve({ tasks: ganttTasks, viewMode });
}

/**
 * かんばんボード用タスクデータを取得
 */
export function getKanbanTasks(projectId = 'all') {
	let tasks = [...mockTasks];

	if (projectId !== 'all') {
		tasks = tasks.filter((t) => t.project_id === projectId);
	}

	const kanbanData = {
		todo: tasks.filter((t) => t.status === 'todo'),
		in_progress: tasks.filter((t) => t.status === 'in_progress'),
		review: tasks.filter((t) => t.status === 'review'),
		done: tasks.filter((t) => t.status === 'done')
	};

	return Promise.resolve(kanbanData);
}

/**
 * タスクのステータスを更新
 */
export function updateTaskStatus(taskId, newStatus, newPosition = null) {
	const taskIndex = mockTasks.findIndex((t) => t.task_id === taskId);

	if (taskIndex === -1) {
		return Promise.reject(new Error('Task not found'));
	}

	mockTasks[taskIndex] = {
		...mockTasks[taskIndex],
		status: newStatus,
		...(newPosition !== null && { position: newPosition })
	};

	return Promise.resolve({
		success: true,
		task: mockTasks[taskIndex]
	});
}
