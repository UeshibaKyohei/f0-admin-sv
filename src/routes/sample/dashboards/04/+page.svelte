<script>
	import { onMount, onDestroy } from 'svelte';
	import { config, isFeatureEnabled } from './config.js';
	import * as dataService from './services/dataService.js';
	import InventoryHeatmap from './InventoryHeatmap.svelte';
	import DeliveryMap from './DeliveryMap.svelte';
	import WarehouseStatus from './WarehouseStatus.svelte';
	import AnalyticsPanel from './AnalyticsPanel.svelte';

	// 表示モード管理
	let viewMode = $state('overview'); // overview, inventory, logistics, analytics
	let selectedWarehouse = $state('all');
	let selectedTimeRange = $state('24h');
	let currentDate = $state(new Date().toLocaleDateString('ja-JP'));

	// データ状態管理
	let isLoading = $state(false);
	let lastUpdated = $state(new Date().toISOString());
	let realTimeSubscription = null;

	// アラートとメトリクス
	let activeAlerts = $state([]);
	let kpiMetrics = $state({});
	let isConnected = $state(true);

	// 時間範囲オプション（RDB: time_range_options テーブルまたは設定ファイルで管理推奨）
	const TIME_RANGE_OPTIONS = [
		{ id: '1h', name: '過去1時間', icon: '🕐', hours: 1 },
		{ id: '24h', name: '過去24時間', icon: '📅', hours: 24 },
		{ id: '7d', name: '過去7日間', icon: '📊', hours: 168 },
		{ id: '30d', name: '過去30日間', icon: '📈', hours: 720 }
	];

	onMount(async () => {
		await loadInitialData();
		startRealTimeUpdates();

		// 定期的なデータ更新
		const interval = setInterval(() => {
			currentDate = new Date().toLocaleDateString('ja-JP');
			if (isFeatureEnabled('SHOW_REAL_TIME_TRACKING')) {
				refreshData();
			}
		}, config.REFRESH_INTERVALS.DELIVERY_TRACKING);

		return () => {
			clearInterval(interval);
			stopRealTimeUpdates();
		};
	});

	onDestroy(() => {
		stopRealTimeUpdates();
	});

	async function loadInitialData() {
		isLoading = true;
		try {
			// 並列でデータ取得
			const [analytics, alerts] = await Promise.all([
				dataService.getAnalyticsData(selectedTimeRange),
				dataService.getAlerts()
			]);

			kpiMetrics = analytics.kpis;
			activeAlerts = alerts.filter((alert) => !alert.acknowledged);
			lastUpdated = new Date().toISOString();
		} catch (error) {
			console.error('Failed to load initial data:', error);
			showErrorAlert('データの読み込みに失敗しました');
		} finally {
			isLoading = false;
		}
	}

	async function refreshData() {
		try {
			const analytics = await dataService.getAnalyticsData(selectedTimeRange);
			kpiMetrics = analytics.kpis;
			lastUpdated = new Date().toISOString();
		} catch (error) {
			console.error('Failed to refresh data:', error);
			isConnected = false;
		}
	}

	function startRealTimeUpdates() {
		if (isFeatureEnabled('SHOW_REAL_TIME_TRACKING')) {
			realTimeSubscription = dataService.subscribeToRealTimeUpdates((update) => {
				handleRealTimeUpdate(update);
				isConnected = true;
			});
		}
	}

	function stopRealTimeUpdates() {
		if (realTimeSubscription) {
			realTimeSubscription();
			realTimeSubscription = null;
		}
	}

	function handleRealTimeUpdate(update) {
		switch (update.type) {
			case 'DELIVERY_LOCATION_UPDATE':
				console.log('Delivery location updated:', update.data);
				break;
			case 'INVENTORY_UPDATE':
				console.log('Inventory updated:', update.data);
				break;
			case 'NEW_ALERT':
				activeAlerts = [...activeAlerts, update.data];
				break;
			case 'DELIVERY_STATUS_UPDATE':
				console.log('Delivery status updated:', update.data);
				break;
		}
	}

	async function handleViewModeChange(newMode) {
		if (viewMode !== newMode) {
			viewMode = newMode;

			if (isFeatureEnabled('SHOW_DEMO_ALERTS')) {
				console.log(`View mode changed to: ${newMode}`);
			}
		}
	}

	function showErrorAlert(message) {
		activeAlerts = [
			...activeAlerts,
			{
				id: Date.now(),
				type: 'SYSTEM_ERROR',
				priority: 'HIGH',
				title: 'システムエラー',
				message,
				timestamp: new Date().toISOString(),
				acknowledged: false
			}
		];
	}

	async function acknowledgeAlert(alertId) {
		try {
			await dataService.acknowledgeAlert(alertId);
			activeAlerts = activeAlerts.filter((alert) => alert.id !== alertId);
		} catch (error) {
			console.error('Failed to acknowledge alert:', error);
		}
	}

	function formatMetricValue(value, type = 'number') {
		if (typeof value !== 'number') return value;

		switch (type) {
			case 'percentage':
				return `${value.toFixed(1)}%`;
			case 'time':
				return `${value.toFixed(1)}h`;
			case 'currency':
				return `¥${value.toLocaleString()}`;
			case 'distance':
				return `${value.toFixed(1)}km`;
			default:
				return value.toLocaleString();
		}
	}
</script>

<div class="min-h-screen bg-base-100">
	{#if isFeatureEnabled('SHOW_SAMPLE_DELIVERIES')}
		<!-- リアルタイム状況バナー -->
		<div class="bg-primary px-4 py-2 text-primary-content">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="flex items-center gap-2">
						<div class="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
						<span class="text-sm font-medium">リアルタイム監視中</span>
					</div>
					<div class="text-xs opacity-80">
						接続状況: {isConnected ? '正常' : '再接続中...'}
					</div>
				</div>
				<div class="text-xs">
					最終更新: {new Date(lastUpdated).toLocaleTimeString('ja-JP')}
				</div>
			</div>
		</div>
	{/if}

	<!-- メインヘッダー -->
	<div class="border-b border-base-300 bg-base-200 shadow-sm">
		<div class="px-4 py-4 lg:px-6">
			<div class="flex items-center justify-between">
				<!-- タイトルセクション -->
				<div class="flex items-center gap-4">
					<div
						class="rounded-xl bg-primary p-3 text-primary-content shadow-lg"
					>
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
								d="M8.25 18.75a1.5 1.5 0 01-3 0V6.75a1.5 1.5 0 013 0v12zM21 6.75a1.5 1.5 0 00-3 0v12a1.5 1.5 0 003 0V6.75z"
							/>
						</svg>
					</div>
					<div>
						<h1
							class="text-2xl font-bold text-base-content lg:text-3xl"
						>
							在庫・物流管理
						</h1>
						<p class="mt-1 text-sm text-base-content/70">リアルタイム監視と最適化システム</p>
					</div>
					{#if isLoading}
						<div class="ml-4">
							<span class="loading loading-spinner loading-md text-primary"></span>
						</div>
					{/if}
				</div>

				<!-- アクションエリア -->
				<div class="flex items-center gap-4">
					<!-- アラート表示 -->
					{#if activeAlerts.length > 0}
						<div class="dropdown dropdown-end">
							<div tabindex="0" role="button" class="btn btn-outline btn-error relative gap-2">
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
								アラート
								<span class="badge badge-error badge-sm absolute -top-2 -right-2"
									>{activeAlerts.length}</span
								>
							</div>
							<div
								tabindex="0"
								class="dropdown-content menu bg-base-100 rounded-box z-50 w-96 p-0 shadow-xl"
							>
								<div class="p-3">
									<div class="mb-3 flex items-center justify-between">
										<h3 class="font-semibold text-base-content">🚨 アクティブアラート</h3>
										<span class="text-xs text-base-content/60">{activeAlerts.length}件の未処理</span>
									</div>

									<!-- 上位5件のアラート -->
									<div class="max-h-80 space-y-2 overflow-y-auto">
										{#each activeAlerts.slice(0, 5) as alert, index}
											<div
												class="alert alert-{alert.priority === 'CRITICAL'
													? 'error'
													: alert.priority === 'HIGH'
														? 'warning'
														: 'info'} p-3"
											>
												<div class="flex w-full items-start gap-2">
													<div
														class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold"
													>
														{index + 1}
													</div>
													<div class="min-w-0 flex-1">
														<h4 class="truncate text-sm font-medium">{alert.title}</h4>
														<p class="line-clamp-2 text-xs opacity-80">{alert.message}</p>
														<div class="mt-1 text-xs opacity-60">
															{new Date(alert.timestamp).toLocaleString('ja-JP', {
																month: 'short',
																day: 'numeric',
																hour: '2-digit',
																minute: '2-digit'
															})}
														</div>
													</div>
													<button
														class="btn btn-xs btn-ghost flex-shrink-0"
														onclick={() => acknowledgeAlert(alert.id)}
														title="確認済みにする"
													>
														✓
													</button>
												</div>
											</div>
										{/each}
									</div>

									<!-- 追加アラートの通知 -->
									{#if activeAlerts.length > 5}
										<div class="mt-3 rounded-lg bg-base-200 p-2 text-center">
											<div class="text-sm text-base-content/70">
												他に <span class="font-bold text-base-content"
													>{activeAlerts.length - 5}件</span
												> のアラートがあります
											</div>
											<button class="btn btn-sm btn-outline btn-primary mt-2 w-full">
												すべてのアラートを表示
											</button>
										</div>
									{/if}

									<!-- アクション -->
									{#if activeAlerts.length > 1}
										<div class="mt-3 border-t border-base-300 pt-3">
											<button
												class="btn btn-sm btn-outline w-full"
												onclick={() => {
													activeAlerts.forEach((alert) => acknowledgeAlert(alert.id));
												}}
											>
												すべて確認済みにする
											</button>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/if}

					<!-- 時間範囲選択 -->
					<div class="flex items-center gap-2">
						<span class="hidden text-sm text-base-content/70 sm:inline">期間:</span>
						<select
							class="select select-bordered select-sm"
							bind:value={selectedTimeRange}
							onchange={refreshData}
						>
							{#each TIME_RANGE_OPTIONS as range}
								<option value={range.id}>{range.icon} {range.name}</option>
							{/each}
						</select>
					</div>

					<!-- リフレッシュボタン -->
					<button
						class="btn btn-outline btn-primary btn-sm gap-2"
						onclick={refreshData}
						disabled={isLoading}
					>
						{#if isLoading}
							<span class="loading loading-spinner loading-xs"></span>
						{:else}
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
									d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
								/>
							</svg>
						{/if}
						更新
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- ナビゲーションタブ -->
	<div class="border-b border-base-300 bg-base-200">
		<div class="px-4 lg:px-6">
			<div class="flex space-x-8">
				<button
					class="cursor-pointer border-b-2 px-2 py-4 text-sm font-medium transition-colors duration-200 {viewMode ===
					'overview'
						? 'border-primary text-primary'
						: 'border-transparent text-base-content/60 hover:text-base-content'}"
					onclick={() => handleViewModeChange('overview')}
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
						概要
					</div>
				</button>

				<button
					class="cursor-pointer border-b-2 px-2 py-4 text-sm font-medium transition-colors duration-200 {viewMode ===
					'inventory'
						? 'border-success text-success'
						: 'border-transparent text-base-content/60 hover:text-base-content'}"
					onclick={() => handleViewModeChange('inventory')}
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
								d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
							/>
						</svg>
						在庫管理
					</div>
				</button>

				<button
					class="cursor-pointer border-b-2 px-2 py-4 text-sm font-medium transition-colors duration-200 {viewMode ===
					'logistics'
						? 'border-warning text-warning'
						: 'border-transparent text-base-content/60 hover:text-base-content'}"
					onclick={() => handleViewModeChange('logistics')}
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
								d="M8.25 18.75a1.5 1.5 0 01-3 0V6.75a1.5 1.5 0 013 0v12zM21 6.75a1.5 1.5 0 00-3 0v12a1.5 1.5 0 003 0V6.75z"
							/>
						</svg>
						物流・配送
					</div>
				</button>

				<button
					class="cursor-pointer border-b-2 px-2 py-4 text-sm font-medium transition-colors duration-200 {viewMode ===
					'analytics'
						? 'border-secondary text-secondary'
						: 'border-transparent text-base-content/60 hover:text-base-content'}"
					onclick={() => handleViewModeChange('analytics')}
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
								d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
							/>
						</svg>
						分析・予測
					</div>
				</button>
			</div>
		</div>
	</div>

	<!-- メインコンテンツエリア -->
	<div class="px-4 py-6 lg:px-6">
		{#if viewMode === 'overview'}
			<!-- 概要ダッシュボード -->
			<div class="space-y-6">
				<!-- KPI メトリクス -->
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
					<div
						class="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm transition-shadow hover:shadow-md"
					>
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium text-base-content/70">総注文数</p>
								<p class="text-2xl font-bold text-base-content">
									{formatMetricValue(kpiMetrics.totalOrders)}
								</p>
								<p class="text-sm text-green-600">{kpiMetrics.ordersChange}</p>
							</div>
							<div class="rounded-lg bg-primary/20 p-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-6 w-6 text-primary"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
									/>
								</svg>
							</div>
						</div>
					</div>

					<div
						class="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm transition-shadow hover:shadow-md"
					>
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium text-base-content/70">配送成功率</p>
								<p class="text-2xl font-bold text-base-content">
									{formatMetricValue(kpiMetrics.deliveryRate, 'percentage')}
								</p>
								<p class="text-sm text-green-600">{kpiMetrics.deliveryRateChange}</p>
							</div>
							<div class="rounded-lg bg-success/20 p-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-6 w-6 text-success"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M8.25 18.75a1.5 1.5 0 01-3 0V6.75a1.5 1.5 0 013 0v12zM21 6.75a1.5 1.5 0 00-3 0v12a1.5 1.5 0 003 0V6.75z"
									/>
								</svg>
							</div>
						</div>
					</div>

					<div
						class="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm transition-shadow hover:shadow-md"
					>
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium text-base-content/70">平均配送時間</p>
								<p class="text-2xl font-bold text-base-content">
									{formatMetricValue(kpiMetrics.averageDeliveryTime, 'time')}
								</p>
								<p class="text-sm text-blue-600">{kpiMetrics.deliveryTimeChange}</p>
							</div>
							<div class="rounded-lg bg-warning/20 p-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-6 w-6 text-warning"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
						</div>
					</div>

					<div
						class="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm transition-shadow hover:shadow-md"
					>
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium text-base-content/70">在庫回転率</p>
								<p class="text-2xl font-bold text-base-content">
									{formatMetricValue(kpiMetrics.inventoryTurnover)}
								</p>
								<p class="text-sm text-green-600">{kpiMetrics.turnoverChange}</p>
							</div>
							<div class="rounded-lg bg-secondary/20 p-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-6 w-6 text-secondary"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
									/>
								</svg>
							</div>
						</div>
					</div>

					<div
						class="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm transition-shadow hover:shadow-md"
					>
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium text-base-content/70">倉庫使用率</p>
								<p class="text-2xl font-bold text-base-content">
									{formatMetricValue(kpiMetrics.warehouseUtilization, 'percentage')}
								</p>
								<p class="text-sm text-green-600">{kpiMetrics.utilizationChange}</p>
							</div>
							<div class="rounded-lg bg-accent/20 p-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-6 w-6 text-accent"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18m2.25-18v18M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.75m-3.75 3.75h.75m-3.75 3.75h.75m-3.75 3.75h.75m-3.75 3.75h.75"
									/>
								</svg>
							</div>
						</div>
					</div>

					<div
						class="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm transition-shadow hover:shadow-md"
					>
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium text-base-content/70">燃費効率</p>
								<p class="text-2xl font-bold text-base-content">
									{formatMetricValue(kpiMetrics.fuelEfficiency)}
								</p>
								<p class="text-sm text-green-600">{kpiMetrics.efficiencyChange}</p>
							</div>
							<div class="rounded-lg bg-success/20 p-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-6 w-6 text-success"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>

				<!-- 主要コンポーネント -->
				<div class="space-y-6">
					<!-- 倉庫使用状況 -->
					<WarehouseStatus />

					<!-- 在庫ヒートマップと配送マップ -->
					<div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
						<InventoryHeatmap
							warehouseId={selectedWarehouse === 'all' ? null : selectedWarehouse}
						/>
						<DeliveryMap selectedStatus="in_transit" />
					</div>
				</div>
			</div>
		{:else if viewMode === 'inventory'}
			<!-- 在庫管理ビュー -->
			<div class="space-y-6">
				<InventoryHeatmap warehouseId={selectedWarehouse === 'all' ? null : selectedWarehouse} />
			</div>
		{:else if viewMode === 'logistics'}
			<!-- 物流・配送ビュー -->
			<div class="space-y-6">
				<DeliveryMap selectedStatus="all" />
			</div>
		{:else if viewMode === 'analytics'}
			<!-- 分析・予測ビュー -->
			<AnalyticsPanel />
		{/if}
	</div>
</div>
