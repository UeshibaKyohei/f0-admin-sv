<script>
	import { onMount } from 'svelte';
	import { config } from './config.js';

	let { onWorkflowComplete = () => {} } = $props();

	// ワークフローの状態
	let workflows = $state([]);
	let selectedWorkflow = $state(null);
	let isCreatingNew = $state(false);
	let executionHistory = $state([]);

	// フィルターと表示設定
	let filterStatus = $state('all');
	let sortBy = $state('lastRun');

	// 実行中のワークフロー
	let runningWorkflows = $state(new Set());

	// ワークフロービルダーの状態
	let newWorkflow = $state({
		name: '',
		description: '',
		trigger: { type: 'TIME_BASED', config: {} },
		steps: [],
		enabled: true
	});

	// アクションテンプレート
	const actionTemplates = [
		{ id: 'notification', name: '通知を送信', icon: '📧', category: 'communication' },
		{ id: 'api_call', name: 'API呼び出し', icon: '🔌', category: 'integration' },
		{ id: 'script', name: 'スクリプト実行', icon: '📜', category: 'execution' },
		{ id: 'report', name: 'レポート生成', icon: '📊', category: 'reporting' },
		{ id: 'approval', name: '承認リクエスト', icon: '✅', category: 'workflow' },
		{ id: 'condition', name: '条件分岐', icon: '🔀', category: 'logic' },
		{ id: 'wait', name: '待機', icon: '⏳', category: 'timing' },
		{ id: 'data_transform', name: 'データ変換', icon: '🔄', category: 'data' }
	];

	onMount(() => {
		loadWorkflows();
		loadExecutionHistory();
	});

	function loadWorkflows() {
		// デモ用のワークフローデータ
		workflows = [
			{
				id: 1,
				name: '売上レポート自動生成',
				description: '毎日午前9時に前日の売上レポートを生成し、経営陣に送信',
				trigger: {
					type: 'TIME_BASED',
					config: { schedule: '0 9 * * *', timezone: 'Asia/Tokyo' }
				},
				steps: [
					{ id: 1, action: 'api_call', name: '売上データ取得', config: { endpoint: '/api/sales' } },
					{
						id: 2,
						action: 'data_transform',
						name: 'データ集計',
						config: { operation: 'aggregate' }
					},
					{ id: 3, action: 'report', name: 'レポート生成', config: { template: 'daily_sales' } },
					{
						id: 4,
						action: 'notification',
						name: 'メール送信',
						config: { recipients: ['executives'] }
					}
				],
				lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
				nextRun: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
				status: 'active',
				successRate: 98.5,
				averageDuration: 125,
				totalRuns: 365
			},
			{
				id: 2,
				name: '異常検知時の自動対応',
				description: 'システム異常を検知したら自動的にスケーリングと通知を実行',
				trigger: {
					type: 'EVENT_BASED',
					config: { event: 'anomaly_detected', severity: 'critical' }
				},
				steps: [
					{
						id: 1,
						action: 'condition',
						name: '重要度チェック',
						config: { condition: 'severity > high' }
					},
					{
						id: 2,
						action: 'script',
						name: 'オートスケーリング',
						config: { script: 'scale_resources.js' }
					},
					{ id: 3, action: 'notification', name: 'Slack通知', config: { channel: '#alerts' } },
					{ id: 4, action: 'wait', name: '5分待機', config: { duration: 300 } },
					{ id: 5, action: 'api_call', name: '状態確認', config: { endpoint: '/api/health' } }
				],
				lastRun: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
				nextRun: null,
				status: 'active',
				successRate: 92.3,
				averageDuration: 87,
				totalRuns: 156
			},
			{
				id: 3,
				name: '月次請求書処理',
				description: '月初に請求書を自動生成し、承認後に顧客へ送信',
				trigger: {
					type: 'TIME_BASED',
					config: { schedule: '0 0 1 * *', timezone: 'Asia/Tokyo' }
				},
				steps: [
					{
						id: 1,
						action: 'api_call',
						name: '請求データ収集',
						config: { endpoint: '/api/billing' }
					},
					{ id: 2, action: 'report', name: '請求書生成', config: { template: 'invoice' } },
					{
						id: 3,
						action: 'approval',
						name: '承認依頼',
						config: { approvers: ['finance_manager'] }
					},
					{ id: 4, action: 'notification', name: '顧客送信', config: { type: 'email' } }
				],
				lastRun: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
				nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
				status: 'active',
				successRate: 100,
				averageDuration: 320,
				totalRuns: 24
			}
		];
	}

	function loadExecutionHistory() {
		// デモ用の実行履歴
		executionHistory = [
			{
				id: 1,
				workflowId: 1,
				workflowName: '売上レポート自動生成',
				startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
				endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 125000).toISOString(),
				status: 'success',
				duration: 125,
				stepsCompleted: 4,
				totalSteps: 4
			},
			{
				id: 2,
				workflowId: 2,
				workflowName: '異常検知時の自動対応',
				startTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
				endTime: new Date(Date.now() - 5 * 60 * 60 * 1000 + 87000).toISOString(),
				status: 'success',
				duration: 87,
				stepsCompleted: 5,
				totalSteps: 5
			},
			{
				id: 3,
				workflowId: 1,
				workflowName: '売上レポート自動生成',
				startTime: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
				endTime: new Date(Date.now() - 26 * 60 * 60 * 1000 + 180000).toISOString(),
				status: 'failed',
				duration: 180,
				stepsCompleted: 2,
				totalSteps: 4,
				error: 'API接続エラー'
			}
		];
	}

	async function executeWorkflow(workflow) {
		runningWorkflows.add(workflow.id);

		// 実行のシミュレーション
		const steps = workflow.steps.length;
		for (let i = 0; i < steps; i++) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			// ステップの進行状況を更新
		}

		runningWorkflows.delete(workflow.id);

		// 実行履歴に追加
		const execution = {
			id: Date.now(),
			workflowId: workflow.id,
			workflowName: workflow.name,
			startTime: new Date().toISOString(),
			endTime: new Date().toISOString(),
			status: 'success',
			duration: steps * 1000,
			stepsCompleted: steps,
			totalSteps: steps
		};

		executionHistory = [execution, ...executionHistory];
		onWorkflowComplete(workflow);
	}

	function getTriggerIcon(type) {
		const icons = {
			TIME_BASED: '⏰',
			EVENT_BASED: '⚡',
			THRESHOLD_BASED: '📊',
			AI_SUGGESTED: '🤖'
		};
		return icons[type] || '❓';
	}

	function getStatusColor(status) {
		return status === 'active'
			? 'text-success'
			: status === 'paused'
				? 'text-warning'
				: status === 'error'
					? 'text-error'
					: 'opacity-70';
	}

	function getExecutionStatusBadge(status) {
		return status === 'success'
			? 'badge-success'
			: status === 'failed'
				? 'badge-error'
				: status === 'running'
					? 'badge-warning'
					: 'badge-ghost';
	}

	function addStep() {
		newWorkflow.steps = [
			...newWorkflow.steps,
			{
				id: Date.now(),
				action: '',
				name: '',
				config: {}
			}
		];
	}

	function removeStep(stepId) {
		newWorkflow.steps = newWorkflow.steps.filter((s) => s.id !== stepId);
	}

	// フィルタリング
	const filteredWorkflows = $derived(() => {
		return workflows
			.filter((w) => {
				if (filterStatus !== 'all' && w.status !== filterStatus) {
					return false;
				}
				return true;
			})
			.sort((a, b) => {
				if (sortBy === 'lastRun') {
					return new Date(b.lastRun || 0) - new Date(a.lastRun || 0);
				}
				if (sortBy === 'name') {
					return a.name.localeCompare(b.name);
				}
				return 0;
			});
	});
</script>

<div class="space-y-6">
	<!-- ヘッダー -->
	<div class="flex items-center justify-between">
		<div>
			<h2 class="mb-2 text-2xl font-bold">自動化ワークフロー</h2>
			<p class="opacity-70">ビジネスプロセスの自動化とオーケストレーション</p>
		</div>

		<button class="btn btn-primary gap-2" onclick={() => (isCreatingNew = true)}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="h-5 w-5"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
			</svg>
			新規ワークフロー
		</button>
	</div>

	<!-- フィルターとソート -->
	<div class="flex gap-4">
		<select class="select select-sm bg-base-300" bind:value={filterStatus}>
			<option value="all">すべてのステータス</option>
			<option value="active">アクティブ</option>
			<option value="paused">一時停止</option>
			<option value="error">エラー</option>
		</select>

		<select class="select select-sm bg-base-300" bind:value={sortBy}>
			<option value="lastRun">最終実行順</option>
			<option value="name">名前順</option>
		</select>
	</div>

	<!-- ワークフローリスト -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
		{#each filteredWorkflows() as workflow}
			<div class="card bg-base-200 hover:border-primary shadow-xl transition-colors">
				<div class="card-body">
					<!-- ヘッダー -->
					<div class="mb-3 flex items-start justify-between">
						<div class="flex items-center gap-2">
							<span class="text-2xl">{getTriggerIcon(workflow.trigger.type)}</span>
							<div>
								<h3 class="font-bold">{workflow.name}</h3>
								<p class="text-xs opacity-70">{workflow.description}</p>
							</div>
						</div>
						<div class="dropdown dropdown-end">
							<div tabindex="0" role="button" class="btn btn-ghost btn-xs">
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
										d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
									/>
								</svg>
							</div>
							<ul
								tabindex="0"
								class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
							>
								<li><a>編集</a></li>
								<li><a>複製</a></li>
								<li><a>無効化</a></li>
								<li><a class="text-error">削除</a></li>
							</ul>
						</div>
					</div>

					<!-- ステータス -->
					<div class="mb-3 flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="h-2 w-2 rounded-full {getStatusColor(workflow.status)} animate-pulse"
							></span>
							<span class="text-sm {getStatusColor(workflow.status)}">
								{workflow.status === 'active'
									? 'アクティブ'
									: workflow.status === 'paused'
										? '一時停止'
										: 'エラー'}
							</span>
						</div>
						<div class="text-xs opacity-70">
							{workflow.steps.length} ステップ
						</div>
					</div>

					<!-- 統計 -->
					<div class="mb-3 grid grid-cols-3 gap-2 text-center">
						<div>
							<p class="text-xs opacity-70">成功率</p>
							<p class="text-sm font-bold">{workflow.successRate}%</p>
						</div>
						<div>
							<p class="text-xs opacity-70">平均時間</p>
							<p class="text-sm font-bold">{workflow.averageDuration}s</p>
						</div>
						<div>
							<p class="text-xs opacity-70">実行回数</p>
							<p class="text-sm font-bold">{workflow.totalRuns}</p>
						</div>
					</div>

					<!-- タイミング情報 -->
					<div class="mb-3 space-y-1 text-xs">
						{#if workflow.lastRun}
							<div class="flex justify-between">
								<span class="opacity-70">最終実行:</span>
								<span>
									{new Date(workflow.lastRun).toLocaleString('ja-JP')}
								</span>
							</div>
						{/if}
						{#if workflow.nextRun}
							<div class="flex justify-between">
								<span class="opacity-70">次回実行:</span>
								<span class="text-info">
									{new Date(workflow.nextRun).toLocaleString('ja-JP')}
								</span>
							</div>
						{/if}
					</div>

					<!-- アクション -->
					<div class="card-actions justify-end">
						{#if runningWorkflows.has(workflow.id)}
							<button class="btn btn-sm btn-disabled">
								<span class="loading loading-spinner loading-xs"></span>
								実行中...
							</button>
						{:else}
							<button class="btn btn-sm btn-primary" onclick={() => executeWorkflow(workflow)}>
								今すぐ実行
							</button>
						{/if}
						<button class="btn btn-sm btn-ghost" onclick={() => (selectedWorkflow = workflow)}>
							詳細
						</button>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- 実行履歴 -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h3 class="card-title mb-4">実行履歴</h3>

			<div class="overflow-x-auto">
				<table class="table">
					<thead>
						<tr>
							<th>ワークフロー</th>
							<th>開始時刻</th>
							<th>実行時間</th>
							<th>進捗</th>
							<th>ステータス</th>
							<th>詳細</th>
						</tr>
					</thead>
					<tbody>
						{#each executionHistory.slice(0, 5) as execution}
							<tr>
								<td class="font-medium">{execution.workflowName}</td>
								<td class="text-sm">
									{new Date(execution.startTime).toLocaleString('ja-JP')}
								</td>
								<td class="text-sm">{execution.duration / 1000}秒</td>
								<td>
									<div class="flex items-center gap-2">
										<progress
											class="progress progress-sm w-20"
											value={execution.stepsCompleted}
											max={execution.totalSteps}
										></progress>
										<span class="text-xs">{execution.stepsCompleted}/{execution.totalSteps}</span>
									</div>
								</td>
								<td>
									<span class="badge badge-sm {getExecutionStatusBadge(execution.status)}">
										{execution.status === 'success'
											? '成功'
											: execution.status === 'failed'
												? '失敗'
												: '実行中'}
									</span>
								</td>
								<td>
									{#if execution.error}
										<span class="text-error text-xs">{execution.error}</span>
									{:else}
										<button class="btn btn-xs btn-ghost">ログ</button>
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

<!-- ワークフロー作成モーダル -->
{#if isCreatingNew}
	<div class="modal modal-open">
		<div class="modal-box max-w-3xl">
			<h3 class="mb-4 text-lg font-bold">新規ワークフロー作成</h3>

			<div class="space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text">ワークフロー名</span>
					</label>
					<input
						type="text"
						class="input input-bordered"
						bind:value={newWorkflow.name}
						placeholder="例: 日次レポート自動生成"
					/>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">説明</span>
					</label>
					<textarea
						class="textarea textarea-bordered"
						bind:value={newWorkflow.description}
						placeholder="ワークフローの目的と概要"
					></textarea>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">トリガータイプ</span>
					</label>
					<select class="select select-bordered">
						<option value="TIME_BASED">時間ベース</option>
						<option value="EVENT_BASED">イベントベース</option>
						<option value="THRESHOLD_BASED">閾値ベース</option>
						<option value="AI_SUGGESTED">AI提案</option>
					</select>
				</div>

				<div class="divider">ステップ</div>

				<div class="space-y-2">
					{#each newWorkflow.steps as step, index}
						<div class="bg-base-200 flex items-center gap-2 rounded-lg p-3">
							<span class="opacity-70">#{index + 1}</span>
							<select class="select select-sm flex-1">
								<option value="">アクションを選択</option>
								{#each actionTemplates as template}
									<option value={template.id}>{template.icon} {template.name}</option>
								{/each}
							</select>
							<button class="btn btn-sm btn-ghost" onclick={() => removeStep(step.id)}> ✕ </button>
						</div>
					{/each}

					<button class="btn btn-sm btn-outline btn-primary w-full" onclick={addStep}>
						+ ステップを追加
					</button>
				</div>
			</div>

			<div class="modal-action">
				<button class="btn btn-ghost" onclick={() => (isCreatingNew = false)}> キャンセル </button>
				<button class="btn btn-primary"> 作成 </button>
			</div>
		</div>
	</div>
{/if}
