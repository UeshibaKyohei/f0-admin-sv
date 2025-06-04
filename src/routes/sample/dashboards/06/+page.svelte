<script>
	import { onMount, onDestroy } from 'svelte';
	import { config, isFeatureEnabled, uiConfig } from './config.js';
	import * as dataService from './services/dataService.js';
	import AIAssistant from './AIAssistant.svelte';
	import IntelligentDashboard from './IntelligentDashboard.svelte';
	import AnomalyDetection from './AnomalyDetection.svelte';
	import AutomationWorkflow from './AutomationWorkflow.svelte';

	// ビューの状態
	let viewMode = $state('dashboard'); // dashboard, assistant, anomalies, automation
	let isLoading = $state(false);
	let lastUpdated = $state(new Date().toISOString());

	// AI アシスタントの状態
	let isAIActive = $state(true);
	let aiInsights = $state([]);
	let aiSuggestions = $state([]);

	// システム統合の状態
	let systemStatus = $state({});
	let integrationHealth = $state(100);
	let activeConnections = $state(0);

	// パフォーマンスメトリクス
	let performanceMetrics = $state({
		cpu: 0,
		memory: 0,
		network: 0,
		responseTime: 0
	});

	// 通知とアラート
	let notifications = $state([]);
	let criticalAlerts = $state([]);
	let hasNewInsights = $state(false);

	// 更新インターバル
	let updateIntervals = [];

	onMount(async () => {
		await initializeDashboard();
		startRealTimeUpdates();

		// AIアシスタントの初期化
		if (isFeatureEnabled('ENABLE_AI_ASSISTANT')) {
			await initializeAIAssistant();
		}
	});

	onDestroy(() => {
		stopRealTimeUpdates();
	});

	async function initializeDashboard() {
		isLoading = true;
		try {
			// 初期データの取得
			const [systems, metrics, insights] = await Promise.all([
				dataService.getSystemStatus(),
				dataService.getPerformanceMetrics(),
				dataService.getAIInsights()
			]);

			systemStatus = systems;
			performanceMetrics = metrics;
			aiInsights = insights.insights;
			aiSuggestions = insights.suggestions;

			// 統合ヘルスの計算
			activeConnections = Object.values(systems).filter((s) => s.status === 'connected').length;
			integrationHealth = (activeConnections / Object.keys(systems).length) * 100;

			lastUpdated = new Date().toISOString();
		} catch (error) {
			console.error('Failed to initialize dashboard:', error);
			showNotification('ダッシュボードの初期化に失敗しました', 'error');
		} finally {
			isLoading = false;
		}
	}

	async function initializeAIAssistant() {
		try {
			const welcomeMessage = await dataService.getAIWelcomeMessage();
			showNotification(welcomeMessage.message, 'ai');
			hasNewInsights = true;
		} catch (error) {
			console.error('Failed to initialize AI assistant:', error);
		}
	}

	function startRealTimeUpdates() {
		// パフォーマンスメトリクスの更新
		const metricsInterval = setInterval(async () => {
			try {
				const metrics = await dataService.getPerformanceMetrics();
				performanceMetrics = metrics;
			} catch (error) {
				console.error('Failed to update metrics:', error);
			}
		}, config.REFRESH_INTERVALS.REAL_TIME_METRICS);
		updateIntervals.push(metricsInterval);

		// AIインサイトの更新
		if (isFeatureEnabled('ENABLE_AUTO_INSIGHTS')) {
			const insightsInterval = setInterval(async () => {
				try {
					const insights = await dataService.getAIInsights();
					if (insights.insights.length > aiInsights.length) {
						hasNewInsights = true;
						aiInsights = insights.insights;
						aiSuggestions = insights.suggestions;
					}
				} catch (error) {
					console.error('Failed to update insights:', error);
				}
			}, config.REFRESH_INTERVALS.AI_INSIGHTS);
			updateIntervals.push(insightsInterval);
		}

		// 異常検知の更新
		if (isFeatureEnabled('ENABLE_ANOMALY_DETECTION')) {
			const anomalyInterval = setInterval(async () => {
				try {
					const anomalies = await dataService.getAnomalies();
					if (anomalies.critical.length > 0) {
						criticalAlerts = anomalies.critical;
						anomalies.critical.forEach((anomaly) => {
							showNotification(`異常検知: ${anomaly.description}`, 'warning');
						});
					}
				} catch (error) {
					console.error('Failed to check anomalies:', error);
				}
			}, config.REFRESH_INTERVALS.ANOMALY_DETECTION);
			updateIntervals.push(anomalyInterval);
		}
	}

	function stopRealTimeUpdates() {
		updateIntervals.forEach((interval) => clearInterval(interval));
		updateIntervals = [];
	}

	function showNotification(message, type = 'info') {
		const notification = {
			id: Date.now(),
			message,
			type,
			timestamp: new Date().toISOString()
		};

		notifications = [notification, ...notifications].slice(0, 50);

		// 自動削除（エラーと警告以外）
		if (type !== 'error' && type !== 'warning') {
			setTimeout(() => {
				notifications = notifications.filter((n) => n.id !== notification.id);
			}, 5000);
		}
	}

	function handleViewChange(newView) {
		viewMode = newView;

		// ビュー変更時の初期化処理
		if (newView === 'anomalies' && isFeatureEnabled('ENABLE_ANOMALY_DETECTION')) {
			dataService.getAnomalies().then((data) => {
				criticalAlerts = data.critical;
			});
		}
	}

	function dismissNotification(id) {
		notifications = notifications.filter((n) => n.id !== id);
	}

	// パフォーマンスメトリクスの色を取得
	function getMetricColor(value, metric) {
		if (metric === 'cpu' || metric === 'memory') {
			if (value > 90) return 'text-error';
			if (value > 70) return 'text-warning';
			return 'text-success';
		}
		if (metric === 'responseTime') {
			if (value > 1000) return 'text-error';
			if (value > 500) return 'text-warning';
			return 'text-success';
		}
		return 'text-info';
	}

	// 派生値
	const totalNotifications = $derived(notifications.length);
	const criticalCount = $derived(
		notifications.filter((n) => n.type === 'error' || n.type === 'warning').length
	);
</script>

<div class="bg-base-100 min-h-screen">
	<!-- AI統合ダッシュボードヘッダー -->
	<div class="from-primary to-secondary bg-gradient-to-r p-px">
		<div class="bg-base-300">
			<div class="px-4 py-4 lg:px-6">
				<div class="flex items-center justify-between">
					<!-- ロゴとタイトル -->
					<div class="flex items-center gap-4">
						<div class="relative">
							<div
								class="absolute inset-0 bg-gradient-to-r {uiConfig.GRADIENTS
									.AI_ASSISTANT} opacity-50 blur-xl"
							></div>
							<div class="bg-base-200 border-primary/30 relative rounded-2xl border p-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="text-primary h-8 w-8"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
									/>
								</svg>
							</div>
						</div>
						<div>
							<h1 class="text-2xl font-bold lg:text-3xl">AI統合管理ダッシュボード</h1>
							<p class="mt-1 text-sm opacity-70">インテリジェントな統合管理とパフォーマンス分析</p>
						</div>
						{#if isLoading}
							<div class="ml-4">
								<span class="loading loading-dots loading-md text-primary"></span>
							</div>
						{/if}
					</div>

					<!-- ヘッダーアクション -->
					<div class="flex items-center gap-4">
						<!-- システムヘルス -->
						<div
							class="bg-base-200 border-base-300 hidden items-center gap-3 rounded-xl border px-4 py-2 lg:flex"
						>
							<div class="text-sm">
								<div class="opacity-70">システムヘルス</div>
								<div class="mt-1 flex items-center gap-2">
									<div
										class="radial-progress text-success text-xs"
										style="--value:{integrationHealth}; --size:2rem; --thickness:3px;"
									>
										<span class="text-[10px]">{Math.round(integrationHealth)}%</span>
									</div>
									<span class="font-medium"
										>{activeConnections}/{Object.keys(systemStatus).length} 接続</span
									>
								</div>
							</div>
						</div>

						<!-- 通知 -->
						<div class="dropdown dropdown-end">
							<div tabindex="0" role="button" class="btn btn-circle btn-sm relative">
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
										d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
									/>
								</svg>
								{#if totalNotifications > 0}
									<span class="badge badge-xs badge-error absolute -top-1 -right-1"
										>{totalNotifications}</span
									>
								{/if}
							</div>
							<div
								tabindex="0"
								class="dropdown-content bg-base-200 border-base-300 z-50 mt-3 max-h-96 w-96 overflow-y-auto rounded-2xl border shadow-2xl"
							>
								<div class="p-4">
									<h3 class="mb-3 font-semibold">通知</h3>
									{#if notifications.length === 0}
										<p class="text-sm opacity-70">新しい通知はありません</p>
									{:else}
										<div class="space-y-2">
											{#each notifications as notification}
												<div
													class="alert alert-{notification.type === 'error'
														? 'error'
														: notification.type === 'warning'
															? 'warning'
															: 'info'} p-3"
												>
													<div class="flex-1">
														<p class="text-sm">{notification.message}</p>
														<p class="mt-1 text-xs opacity-70">
															{new Date(notification.timestamp).toLocaleTimeString('ja-JP')}
														</p>
													</div>
													<button
														class="btn btn-ghost btn-xs"
														onclick={() => dismissNotification(notification.id)}
													>
														✕
													</button>
												</div>
											{/each}
										</div>
									{/if}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- パフォーマンスメトリクスバー -->
	<div class="bg-base-200 border-base-300 border-b">
		<div class="px-4 py-2 lg:px-6">
			<div class="flex items-center justify-between text-sm">
				<div class="flex items-center gap-6">
					<div class="flex items-center gap-2">
						<span class="opacity-70">CPU:</span>
						<span class="{getMetricColor(performanceMetrics.cpu, 'cpu')} font-medium">
							{performanceMetrics.cpu.toFixed(1)}%
						</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="opacity-70">メモリ:</span>
						<span class="{getMetricColor(performanceMetrics.memory, 'memory')} font-medium">
							{performanceMetrics.memory.toFixed(1)}%
						</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="opacity-70">ネットワーク:</span>
						<span class="text-info font-medium">
							{performanceMetrics.network.toFixed(1)} Mbps
						</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="opacity-70">応答時間:</span>
						<span
							class="{getMetricColor(performanceMetrics.responseTime, 'responseTime')} font-medium"
						>
							{performanceMetrics.responseTime}ms
						</span>
					</div>
				</div>
				<div class="flex items-center gap-2 opacity-70">
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
					<span>最終更新: {new Date(lastUpdated).toLocaleTimeString('ja-JP')}</span>
				</div>
			</div>
		</div>
	</div>

	<!-- ナビゲーションタブ -->
	<div class="bg-base-200 border-base-300 border-b">
		<div class="px-4 lg:px-6">
			<div class="flex space-x-8">
				<button
					class="border-b-2 px-2 py-4 text-sm font-medium transition-all duration-200 {viewMode ===
					'dashboard'
						? 'border-primary text-primary'
						: 'border-transparent opacity-70 hover:opacity-100'}"
					onclick={() => handleViewChange('dashboard')}
				>
					<div class="flex items-center gap-2">
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
								d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
							/>
						</svg>
						インテリジェントダッシュボード
						{#if hasNewInsights}
							<span class="badge badge-xs badge-secondary animate-pulse">NEW</span>
						{/if}
					</div>
				</button>

				<button
					class="border-b-2 px-2 py-4 text-sm font-medium transition-all duration-200 {viewMode ===
					'assistant'
						? 'border-primary text-primary'
						: 'border-transparent opacity-70 hover:opacity-100'}"
					onclick={() => handleViewChange('assistant')}
				>
					<div class="flex items-center gap-2">
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
								d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
							/>
						</svg>
						AIアシスタント
						{#if isAIActive}
							<div class="bg-success h-2 w-2 animate-pulse rounded-full"></div>
						{/if}
					</div>
				</button>

				<button
					class="border-b-2 px-2 py-4 text-sm font-medium transition-all duration-200 {viewMode ===
					'anomalies'
						? 'border-primary text-primary'
						: 'border-transparent opacity-70 hover:opacity-100'}"
					onclick={() => handleViewChange('anomalies')}
				>
					<div class="flex items-center gap-2">
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
								d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
							/>
						</svg>
						異常検知と予測
						{#if criticalCount > 0}
							<span class="badge badge-xs badge-error">{criticalCount}</span>
						{/if}
					</div>
				</button>

				<button
					class="border-b-2 px-2 py-4 text-sm font-medium transition-all duration-200 {viewMode ===
					'automation'
						? 'border-primary text-primary'
						: 'border-transparent opacity-70 hover:opacity-100'}"
					onclick={() => handleViewChange('automation')}
				>
					<div class="flex items-center gap-2">
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
								d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 3.95-.236.478-.497 1.01-.787 1.524m-1.038 1.175L7.961 19.21a2.652 2.652 0 01-3.712-3.712l5.753-5.754"
							/>
						</svg>
						自動化ワークフロー
					</div>
				</button>
			</div>
		</div>
	</div>

	<!-- メインコンテンツ -->
	<div class="px-4 py-6 lg:px-6">
		{#if viewMode === 'dashboard'}
			<IntelligentDashboard {systemStatus} {aiInsights} {aiSuggestions} />
		{:else if viewMode === 'assistant'}
			<AIAssistant
				{isAIActive}
				onInsight={(insight) => {
					aiInsights = [...aiInsights, insight];
					hasNewInsights = true;
				}}
			/>
		{:else if viewMode === 'anomalies'}
			<AnomalyDetection
				{criticalAlerts}
				onNewAnomaly={(anomaly) => {
					showNotification(`新しい異常を検出: ${anomaly.type}`, 'warning');
				}}
			/>
		{:else if viewMode === 'automation'}
			<AutomationWorkflow
				onWorkflowComplete={(workflow) => {
					showNotification(`ワークフロー「${workflow.name}」が完了しました`, 'success');
				}}
			/>
		{/if}
	</div>
</div>
