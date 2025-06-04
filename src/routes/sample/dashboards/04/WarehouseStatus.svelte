<script>
	import { onMount } from 'svelte';
	import { config } from './config.js';
	import * as dataService from './services/dataService.js';

	let { refreshInterval = 30000 } = $props();

	let warehouseData = $state([]);
	let isLoading = $state(true);
	let selectedWarehouse = $state(null);
	let autoRefreshEnabled = $state(true);
	let lastUpdated = $state(new Date().toISOString());

	onMount(async () => {
		await loadWarehouseData();

		if (autoRefreshEnabled) {
			startAutoRefresh();
		}
	});

	async function loadWarehouseData() {
		isLoading = true;
		try {
			const data = await dataService.getWarehouses();
			warehouseData = data.warehouses.map((warehouse) => ({
				...warehouse,
				utilizationColor: getUtilizationColor(warehouse.currentUtilization),
				statusIcon: getStatusIcon(warehouse.status),
				alerts: generateWarehouseAlerts(warehouse)
			}));
			lastUpdated = new Date().toISOString();
		} catch (error) {
			console.error('Failed to load warehouse data:', error);
		} finally {
			isLoading = false;
		}
	}

	function startAutoRefresh() {
		const interval = setInterval(async () => {
			if (autoRefreshEnabled) {
				await loadWarehouseData();
			}
		}, refreshInterval);

		return () => clearInterval(interval);
	}

	function getUtilizationColor(utilization) {
		if (utilization >= config.WAREHOUSE_CAPACITY.CRITICAL) {
			return 'error';
		} else if (utilization >= config.WAREHOUSE_CAPACITY.WARNING) {
			return 'warning';
		} else if (utilization >= config.WAREHOUSE_CAPACITY.GOOD) {
			return 'info';
		} else {
			return 'success';
		}
	}

	function getUtilizationLevel(utilization) {
		if (utilization >= config.WAREHOUSE_CAPACITY.CRITICAL) {
			return '満杯';
		} else if (utilization >= config.WAREHOUSE_CAPACITY.WARNING) {
			return '要注意';
		} else if (utilization >= config.WAREHOUSE_CAPACITY.GOOD) {
			return '適正';
		} else {
			return '余裕';
		}
	}

	function getStatusIcon(status) {
		switch (status) {
			case 'active':
				return '✅';
			case 'maintenance':
				return '🔧';
			case 'closed':
				return '🚫';
			default:
				return '❓';
		}
	}

	function getStatusColor(status) {
		switch (status) {
			case 'active':
				return 'success';
			case 'maintenance':
				return 'warning';
			case 'closed':
				return 'error';
			default:
				return 'neutral';
		}
	}

	function generateWarehouseAlerts(warehouse) {
		const alerts = [];

		if (warehouse.currentUtilization >= config.WAREHOUSE_CAPACITY.CRITICAL) {
			alerts.push({
				type: 'critical',
				message: '倉庫容量が満杯に近づいています'
			});
		} else if (warehouse.currentUtilization >= config.WAREHOUSE_CAPACITY.WARNING) {
			alerts.push({
				type: 'warning',
				message: '倉庫容量が高水準です'
			});
		}

		if (warehouse.status === 'maintenance') {
			alerts.push({
				type: 'info',
				message: 'メンテナンス中です'
			});
		}

		return alerts;
	}

	function calculateAvailableSpace(warehouse) {
		return warehouse.capacity - (warehouse.capacity * warehouse.currentUtilization) / 100;
	}

	function formatCapacity(capacity) {
		if (capacity >= 1000000) {
			return `${(capacity / 1000000).toFixed(1)}M`;
		} else if (capacity >= 1000) {
			return `${(capacity / 1000).toFixed(1)}K`;
		}
		return capacity.toString();
	}

	function handleWarehouseSelect(warehouse) {
		selectedWarehouse = selectedWarehouse?.id === warehouse.id ? null : warehouse;
	}

	function getProgressBarClasses(utilization) {
		const color = getUtilizationColor(utilization);
		return `progress progress-${color}`;
	}
</script>

<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
	<!-- ヘッダー -->
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h3 class="flex items-center gap-2 text-lg font-semibold text-slate-900">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
				>
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
							d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18m2.25-18v18M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.75m-3.75 3.75h.75m-3.75 3.75h.75m-3.75 3.75h.75m-3.75 3.75h.75"
						/>
					</svg>
				</div>
				倉庫使用状況
			</h3>
			<p class="mt-1 text-sm text-slate-600">容量管理とアラート監視</p>
		</div>

		<div class="flex items-center gap-3">
			<!-- 自動更新トグル -->
			<label class="label cursor-pointer gap-2">
				<span class="label-text text-sm">自動更新</span>
				<input
					type="checkbox"
					class="toggle toggle-primary toggle-sm"
					bind:checked={autoRefreshEnabled}
				/>
			</label>

			<!-- 手動更新ボタン -->
			<button class="btn btn-outline btn-sm" onclick={loadWarehouseData} disabled={isLoading}>
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
			</button>
		</div>
	</div>

	{#if isLoading}
		<!-- ローディング状態 -->
		<div class="flex h-64 items-center justify-center">
			<div class="text-center">
				<span class="loading loading-spinner loading-lg text-primary"></span>
				<p class="mt-2 text-sm text-slate-600">倉庫データを読み込み中...</p>
			</div>
		</div>
	{:else if warehouseData.length === 0}
		<!-- データなし状態 -->
		<div class="flex h-64 items-center justify-center">
			<div class="text-center text-slate-500">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="mx-auto mb-4 h-12 w-12 opacity-50"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18m2.25-18v18M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.75m-3.75 3.75h.75m-3.75 3.75h.75m-3.75 3.75h.75m-3.75 3.75h.75"
					/>
				</svg>
				<p class="font-medium">倉庫データがありません</p>
				<p class="mt-1 text-sm">データの取得に失敗しました</p>
			</div>
		</div>
	{:else}
		<!-- 倉庫一覧 -->
		<div class="space-y-4">
			<!-- 全体サマリー -->
			<div class="grid grid-cols-1 gap-4 rounded-lg bg-slate-50 p-4 md:grid-cols-4">
				<div class="text-center">
					<div class="text-2xl font-bold text-slate-900">{warehouseData.length}</div>
					<div class="text-sm text-slate-600">総倉庫数</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-green-600">
						{warehouseData.filter((w) => w.status === 'active').length}
					</div>
					<div class="text-sm text-slate-600">稼働中</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-slate-900">
						{(
							warehouseData.reduce((sum, w) => sum + w.currentUtilization, 0) /
								warehouseData.length || 0
						).toFixed(1)}%
					</div>
					<div class="text-sm text-slate-600">平均使用率</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-orange-600">
						{warehouseData.filter((w) =>
							w.alerts.some((a) => a.type === 'critical' || a.type === 'warning')
						).length}
					</div>
					<div class="text-sm text-slate-600">要注意倉庫</div>
				</div>
			</div>

			<!-- 倉庫カード一覧 -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				{#each warehouseData.slice(0, 6) as warehouse}
					<div
						class="cursor-pointer rounded-lg border border-slate-200 p-4 transition-all duration-200 hover:shadow-md {selectedWarehouse?.id ===
						warehouse.id
							? 'bg-blue-50 ring-2 ring-blue-500'
							: 'hover:bg-slate-50'}"
						onclick={() => handleWarehouseSelect(warehouse)}
					>
						<!-- 倉庫ヘッダー -->
						<div class="mb-3 flex items-center justify-between">
							<div class="flex items-center gap-2">
								<span class="text-lg">{warehouse.statusIcon}</span>
								<h4 class="font-semibold text-slate-900">{warehouse.name}</h4>
							</div>
							<div class="flex items-center gap-2">
								<div class="badge badge-{getStatusColor(warehouse.status)} badge-sm">
									{warehouse.status}
								</div>
								{#if warehouse.alerts.length > 0}
									<div class="badge badge-error badge-sm">{warehouse.alerts.length}</div>
								{/if}
							</div>
						</div>

						<!-- 使用率プログレスバー -->
						<div class="mb-3">
							<div class="mb-1 flex items-center justify-between">
								<span class="text-sm text-slate-600">使用率</span>
								<div class="flex items-center gap-2">
									<span class="text-sm font-medium text-slate-900"
										>{warehouse.currentUtilization.toFixed(1)}%</span
									>
									<span
										class="rounded-full px-2 py-1 text-xs bg-{warehouse.utilizationColor}/10 text-{warehouse.utilizationColor}"
									>
										{getUtilizationLevel(warehouse.currentUtilization)}
									</span>
								</div>
							</div>
							<progress
								class={getProgressBarClasses(warehouse.currentUtilization)}
								value={warehouse.currentUtilization}
								max="100"
							></progress>
						</div>

						<!-- 倉庫詳細情報 -->
						<div class="grid grid-cols-2 gap-4 text-sm">
							<div>
								<div class="text-slate-600">総容量</div>
								<div class="font-medium">{formatCapacity(warehouse.capacity)}</div>
							</div>
							<div>
								<div class="text-slate-600">利用可能</div>
								<div class="font-medium">{formatCapacity(calculateAvailableSpace(warehouse))}</div>
							</div>
							<div>
								<div class="text-slate-600">責任者</div>
								<div class="font-medium">{warehouse.manager}</div>
							</div>
							<div>
								<div class="text-slate-600">月間処理量</div>
								<div class="font-medium">{warehouse.monthlyThroughput?.toLocaleString()}</div>
							</div>
						</div>

						<!-- アラート表示 -->
						{#if warehouse.alerts.length > 0}
							<div class="mt-3 space-y-1">
								{#each warehouse.alerts as alert}
									<div
										class="alert alert-{alert.type === 'critical'
											? 'error'
											: alert.type === 'warning'
												? 'warning'
												: 'info'} alert-sm"
									>
										<span class="text-xs">{alert.message}</span>
									</div>
								{/each}
							</div>
						{/if}

						<!-- カテゴリ表示 -->
						{#if warehouse.categories}
							<div class="mt-3">
								<div class="mb-1 text-xs text-slate-600">取扱カテゴリ</div>
								<div class="flex flex-wrap gap-1">
									{#each warehouse.categories as category}
										<span class="badge badge-outline badge-xs">
											{config.PRODUCT_CATEGORIES[category]?.icon || '📦'}
											{category}
										</span>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<!-- 追加倉庫表示ボタン -->
			{#if warehouseData.length > 6}
				<div class="mt-4 text-center">
					<div class="rounded-lg bg-slate-100 p-3">
						<div class="mb-2 text-sm text-slate-600">
							他に <span class="font-bold text-slate-900">{warehouseData.length - 6}箇所</span> の倉庫があります
						</div>
						<button class="btn btn-outline btn-primary btn-sm">
							すべての倉庫を表示 ({warehouseData.length}箇所)
						</button>
					</div>
				</div>
			{/if}

			<!-- 選択された倉庫の詳細情報 -->
			{#if selectedWarehouse}
				<div class="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
					<h4 class="mb-4 font-semibold text-blue-900">詳細情報: {selectedWarehouse.name}</h4>

					<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						<!-- 基本情報 -->
						<div>
							<h5 class="mb-2 font-medium text-blue-800">基本情報</h5>
							<div class="space-y-2 text-sm">
								<div><span class="text-blue-700">住所:</span> {selectedWarehouse.address}</div>
								<div>
									<span class="text-blue-700">座標:</span>
									{selectedWarehouse.location.lat.toFixed(4)}, {selectedWarehouse.location.lng.toFixed(
										4
									)}
								</div>
								<div><span class="text-blue-700">ステータス:</span> {selectedWarehouse.status}</div>
								<div><span class="text-blue-700">責任者:</span> {selectedWarehouse.manager}</div>
							</div>
						</div>

						<!-- 容量情報 -->
						<div>
							<h5 class="mb-2 font-medium text-blue-800">容量情報</h5>
							<div class="space-y-2 text-sm">
								<div>
									<span class="text-blue-700">総容量:</span>
									{selectedWarehouse.capacity.toLocaleString()}
								</div>
								<div>
									<span class="text-blue-700">使用中:</span>
									{((selectedWarehouse.capacity * selectedWarehouse.currentUtilization) / 100)
										.toFixed(0)
										.toLocaleString()}
								</div>
								<div>
									<span class="text-blue-700">利用可能:</span>
									{calculateAvailableSpace(selectedWarehouse).toFixed(0).toLocaleString()}
								</div>
								<div>
									<span class="text-blue-700">使用率:</span>
									{selectedWarehouse.currentUtilization.toFixed(2)}%
								</div>
							</div>
						</div>

						<!-- 運用情報 -->
						<div>
							<h5 class="mb-2 font-medium text-blue-800">運用情報</h5>
							<div class="space-y-2 text-sm">
								<div>
									<span class="text-blue-700">月間処理量:</span>
									{selectedWarehouse.monthlyThroughput?.toLocaleString()}
								</div>
								<div>
									<span class="text-blue-700">最終更新:</span>
									{new Date(selectedWarehouse.lastUpdated).toLocaleString('ja-JP')}
								</div>
								<div>
									<span class="text-blue-700">アラート数:</span>
									{selectedWarehouse.alerts.length}
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- 最終更新時刻 -->
			<div class="mt-4 text-center text-xs text-slate-500">
				最終更新: {new Date(lastUpdated).toLocaleString('ja-JP')}
			</div>
		</div>
	{/if}
</div>
