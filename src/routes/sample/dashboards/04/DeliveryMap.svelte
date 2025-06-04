<script>
	import { onMount, onDestroy } from 'svelte';
	import { config, isFeatureEnabled } from './config.js';
	import * as dataService from './services/dataService.js';

	let { selectedStatus = 'all', autoRefresh = true } = $props();

	let deliveryData = $state([]);
	let warehouseData = $state([]);
	let vehicleData = $state([]);
	let isLoading = $state(true);
	let selectedDelivery = $state(null);
	let mapCenter = $state(config.MAP_CONFIG.DEFAULT_CENTER);
	let refreshInterval = null;

	// フィルタリング状態
	let statusFilter = $state(selectedStatus);
	let priorityFilter = $state('all');
	let vehicleTypeFilter = $state('all');

	// 統計データ
	let deliveryStats = $state({});

	const statusOptions = [
		{ id: 'all', name: '全ステータス', icon: '📦', color: 'primary' },
		{ id: 'pending', name: '準備中', icon: '⏳', color: 'warning' },
		{ id: 'in_transit', name: '配送中', icon: '🚛', color: 'info' },
		{ id: 'delivered', name: '配送完了', icon: '✅', color: 'success' },
		{ id: 'delayed', name: '遅延', icon: '⚠️', color: 'error' }
	];

	onMount(async () => {
		await loadData();

		if (autoRefresh && isFeatureEnabled('SHOW_REAL_TIME_TRACKING')) {
			startAutoRefresh();
		}
	});

	onDestroy(() => {
		stopAutoRefresh();
	});

	$effect(async () => {
		if (statusFilter) {
			await loadDeliveryData();
		}
	});

	async function loadData() {
		isLoading = true;
		try {
			const [deliveries, warehouses, vehicles] = await Promise.all([
				dataService.getDeliveryData(statusFilter),
				dataService.getWarehouses(),
				dataService.getVehicleData()
			]);

			deliveryData = deliveries.deliveries;
			deliveryStats = deliveries.summary;
			warehouseData = warehouses.warehouses;
			vehicleData = vehicles.vehicles;
		} catch (error) {
			console.error('Failed to load data:', error);
		} finally {
			isLoading = false;
		}
	}

	async function loadDeliveryData() {
		try {
			const data = await dataService.getDeliveryData(statusFilter);
			deliveryData = data.deliveries;
			deliveryStats = data.summary;
		} catch (error) {
			console.error('Failed to load delivery data:', error);
		}
	}

	function startAutoRefresh() {
		refreshInterval = setInterval(async () => {
			if (isFeatureEnabled('SHOW_REAL_TIME_TRACKING')) {
				await loadDeliveryData();
			}
		}, config.REFRESH_INTERVALS.DELIVERY_TRACKING);
	}

	function stopAutoRefresh() {
		if (refreshInterval) {
			clearInterval(refreshInterval);
			refreshInterval = null;
		}
	}

	function getFilteredDeliveries() {
		let filtered = deliveryData;

		if (statusFilter !== 'all') {
			filtered = filtered.filter((d) => d.status === statusFilter);
		}

		if (priorityFilter !== 'all') {
			filtered = filtered.filter((d) => d.priority === priorityFilter);
		}

		if (vehicleTypeFilter !== 'all') {
			filtered = filtered.filter((d) => d.vehicle.type === vehicleTypeFilter);
		}

		return filtered;
	}

	function getStatusColor(status) {
		const statusConfig = config.DELIVERY_STATUS[status.toUpperCase()];
		return statusConfig?.color || 'neutral';
	}

	function getStatusLabel(status) {
		const statusConfig = config.DELIVERY_STATUS[status.toUpperCase()];
		return statusConfig?.label || status;
	}

	function getVehicleIcon(type) {
		const vehicleConfig = config.VEHICLE_TYPES[type.toUpperCase()];
		return vehicleConfig?.icon || '🚛';
	}

	function calculateDistance(lat1, lng1, lat2, lng2) {
		const R = 6371; // 地球の半径 (km)
		const dLat = ((lat2 - lat1) * Math.PI) / 180;
		const dLng = ((lng2 - lng1) * Math.PI) / 180;
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos((lat1 * Math.PI) / 180) *
				Math.cos((lat2 * Math.PI) / 180) *
				Math.sin(dLng / 2) *
				Math.sin(dLng / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}

	function handleDeliverySelect(delivery) {
		selectedDelivery = delivery;
		// マップの中心を配送の現在位置に移動
		mapCenter = delivery.currentLocation;
	}

	function formatTimeRemaining(estimatedArrival) {
		const now = new Date();
		const arrival = new Date(estimatedArrival);
		const diff = arrival - now;

		if (diff < 0) {
			const overdue = Math.abs(diff);
			const hours = Math.floor(overdue / (1000 * 60 * 60));
			const minutes = Math.floor((overdue % (1000 * 60 * 60)) / (1000 * 60));
			return `${hours}h${minutes}m 遅延`;
		}

		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		return `${hours}h${minutes}m`;
	}

	function generateMapPoints() {
		const filtered = getFilteredDeliveries();
		const points = [];

		// 倉庫ポイント
		warehouseData.forEach((warehouse) => {
			points.push({
				type: 'warehouse',
				id: warehouse.id,
				name: warehouse.name,
				lat: warehouse.location.lat,
				lng: warehouse.location.lng,
				data: warehouse
			});
		});

		// 配送ポイント
		filtered.forEach((delivery) => {
			// 現在位置
			points.push({
				type: 'delivery_current',
				id: `delivery-current-${delivery.id}`,
				name: `配送${delivery.id} (現在位置)`,
				lat: delivery.currentLocation.lat,
				lng: delivery.currentLocation.lng,
				status: delivery.status,
				data: delivery
			});

			// 配送先
			points.push({
				type: 'delivery_destination',
				id: `delivery-dest-${delivery.id}`,
				name: `配送先: ${delivery.destination.customerName}`,
				lat: delivery.destination.lat,
				lng: delivery.destination.lng,
				status: delivery.status,
				data: delivery
			});
		});

		return points;
	}
</script>

<div class="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
	<!-- ヘッダー -->
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h3 class="flex items-center gap-2 text-lg font-semibold text-base-content">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-info text-info-content"
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
							d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
						/>
					</svg>
				</div>
				配送追跡マップ
			</h3>
			<p class="mt-1 text-sm text-base-content/70">リアルタイム配送状況と最適化</p>
		</div>

		<div class="flex items-center gap-3">
			<!-- ステータスフィルタ -->
			<select class="select select-bordered select-sm bg-base-100" bind:value={statusFilter}>
				{#each statusOptions as option}
					<option value={option.id}>{option.icon} {option.name}</option>
				{/each}
			</select>

			<!-- 自動更新トグル -->
			{#if isFeatureEnabled('SHOW_REAL_TIME_TRACKING')}
				<label class="label cursor-pointer gap-2">
					<span class="label-text text-sm">自動更新</span>
					<input
						type="checkbox"
						class="toggle toggle-primary toggle-sm"
						bind:checked={autoRefresh}
						onchange={(e) => (e.target.checked ? startAutoRefresh() : stopAutoRefresh())}
					/>
				</label>
			{/if}
		</div>
	</div>

	{#if isLoading}
		<!-- ローディング状態 -->
		<div class="flex h-96 items-center justify-center">
			<div class="text-center">
				<span class="loading loading-spinner loading-lg text-primary"></span>
				<p class="mt-2 text-sm text-base-content/70">配送データを読み込み中...</p>
			</div>
		</div>
	{:else}
		<!-- 統計サマリー -->
		<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
			<div class="rounded-lg bg-base-200 p-4 text-center">
				<div class="text-2xl font-bold text-base-content">{deliveryStats.total || 0}</div>
				<div class="text-sm text-base-content/70">総配送数</div>
			</div>
			<div class="rounded-lg bg-warning/20 p-4 text-center">
				<div class="text-2xl font-bold text-warning">{deliveryStats.pending || 0}</div>
				<div class="text-sm text-base-content/70">準備中</div>
			</div>
			<div class="rounded-lg bg-info/20 p-4 text-center">
				<div class="text-2xl font-bold text-info">{deliveryStats.inTransit || 0}</div>
				<div class="text-sm text-base-content/70">配送中</div>
			</div>
			<div class="rounded-lg bg-success/20 p-4 text-center">
				<div class="text-2xl font-bold text-success">{deliveryStats.delivered || 0}</div>
				<div class="text-sm text-base-content/70">配送完了</div>
			</div>
			<div class="rounded-lg bg-error/20 p-4 text-center">
				<div class="text-2xl font-bold text-error">{deliveryStats.delayed || 0}</div>
				<div class="text-sm text-base-content/70">遅延</div>
			</div>
		</div>

		<!-- メインコンテンツ: マップとリスト -->
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- 疑似マップ表示エリア -->
			<div class="lg:col-span-2">
				<div
					class="relative h-96 overflow-hidden rounded-lg bg-base-200 p-6"
				>
					<!-- マップヘッダー -->
					<div class="absolute top-4 left-4 z-10">
						<div class="rounded-lg bg-base-100 p-3 shadow-md">
							<div class="flex items-center gap-2 text-sm font-medium text-base-content/80">
								🗺️ リアルタイム配送マップ
								<div class="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
							</div>
							<div class="text-xs text-base-content/60">
								中心: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
							</div>
							<div class="mt-1 text-xs text-info">
								📊 {getFilteredDeliveries().length}件の配送を追跡中
							</div>
						</div>
					</div>

					<!-- 配送効率アラート -->
					{#if deliveryStats.delayed > 5}
						<div class="absolute top-4 right-20 z-10">
							<div class="rounded-lg border border-error/30 bg-error/20 p-2 text-xs text-base-content">
								⚠️ 遅延配送が{deliveryStats.delayed}件発生中
							</div>
						</div>
					{/if}

					<!-- マップグリッド（座標系表示） -->
					<div class="absolute inset-0 opacity-10">
						{#each Array(8) as _, i}
							<div
								class="absolute border-t border-slate-400"
								style="top: {i * 12.5}%; width: 100%;"
							></div>
							<div
								class="absolute border-l border-slate-400"
								style="left: {i * 12.5}%; height: 100%;"
							></div>
						{/each}
					</div>

					<!-- マップ上のポイント（リッチな表示） -->
					<div class="absolute inset-0 flex items-center justify-center">
						<div class="relative h-full max-h-80 w-full max-w-2xl">
							<!-- 倉庫ポイント（拡張表示） -->
							{#each warehouseData as warehouse, index}
								<div
									class="group absolute cursor-pointer"
									style="left: {20 + index * 12}%; top: {25 + (index % 3) * 25}%"
									title="{warehouse.name} - 使用率: {warehouse.currentUtilization}%"
								>
									<!-- 倉庫本体 -->
									<div
										class="relative flex h-8 w-8 items-center justify-center rounded-lg border-2 border-white bg-gradient-to-br from-green-400 to-green-600 text-sm font-bold text-white shadow-lg transition-transform hover:scale-110"
									>
										🏢
										<!-- 倉庫使用率インジケーター -->
										<div
											class="absolute -top-1 -right-1 h-3 w-3 rounded-full {warehouse.currentUtilization >
											90
												? 'bg-red-500'
												: warehouse.currentUtilization > 75
													? 'bg-yellow-500'
													: 'bg-green-500'}"
										></div>
									</div>
									<!-- 倉庫情報ポップアップ -->
									<div
										class="invisible absolute -top-16 -left-8 z-20 rounded-lg bg-neutral text-neutral-content p-2 text-xs whitespace-nowrap group-hover:visible"
									>
										<div class="font-medium">{warehouse.name}</div>
										<div>使用率: {warehouse.currentUtilization}%</div>
										<div>処理量: {warehouse.monthlyThroughput?.toLocaleString()}/月</div>
										<div
											class="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-neutral"
										></div>
									</div>
								</div>
							{/each}

							<!-- 配送ポイント（動的表示） -->
							{#each getFilteredDeliveries().slice(0, 15) as delivery, index}
								{@const posX = 15 + (index % 10) * 8}
								{@const posY = 15 + Math.floor(index / 10) * 30}

								<div
									class="group absolute cursor-pointer"
									style="left: {posX}%; top: {posY}%"
									onclick={() => handleDeliverySelect(delivery)}
								>
									<!-- 配送車両アイコン -->
									<div
										class="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-xs shadow-lg transition-all hover:z-10 hover:scale-125 {delivery.status ===
										'delayed'
											? 'animate-pulse bg-error'
											: delivery.status === 'in_transit'
												? 'bg-info'
												: delivery.status === 'delivered'
													? 'bg-success'
													: 'bg-warning'}"
									>
										{getVehicleIcon(delivery.vehicle.type)}

										<!-- 優先度インジケーター -->
										{#if delivery.priority === 'high'}
											<div class="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></div>
										{/if}
									</div>

									<!-- 配送情報ポップアップ -->
									<div
										class="invisible absolute -top-20 -left-12 z-20 rounded-lg bg-neutral text-neutral-content p-2 text-xs whitespace-nowrap group-hover:visible"
									>
										<div class="font-medium">{delivery.orderId}</div>
										<div>🚚 {delivery.vehicle.licensePlate}</div>
										<div>📍 {delivery.destination.customerName}</div>
										<div>⏱️ {formatTimeRemaining(delivery.estimatedArrival)}</div>
										<div>📦 {delivery.items}個口 / {delivery.distance}km</div>
										<div
											class="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-neutral"
										></div>
									</div>

									<!-- 配送ルート線（改良版） -->
									{#if delivery.status === 'in_transit'}
										<div
											class="absolute animate-pulse border-t-2 border-dashed border-info opacity-60"
											style="left: -10px; top: 10px; width: {20 +
												index * 3}px; transform: rotate({-45 + index * 10}deg)"
										></div>
									{/if}
								</div>
							{/each}

							<!-- 配送エリア境界線 -->
							<div
								class="absolute inset-4 rounded-lg border-2 border-dashed border-info/30 opacity-30"
							></div>

							<!-- トラフィック状況表示 -->
							<div class="absolute bottom-4 left-1/2 -translate-x-1/2 transform">
								<div
									class="flex items-center gap-2 rounded-full bg-base-100 px-3 py-1 text-xs shadow-md"
								>
									<div class="h-2 w-2 rounded-full bg-green-500"></div>
									<span>交通状況: 良好</span>
								</div>
							</div>
						</div>
					</div>

					<!-- マップコントロール（機能拡張） -->
					<div class="absolute right-4 bottom-4 z-10">
						<div class="flex flex-col gap-2">
							<button
								class="btn btn-sm tooltip tooltip-left border-base-300 bg-base-100 shadow-md hover:bg-base-200"
								data-tip="ズームイン"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-4 w-4"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
								</svg>
							</button>
							<button
								class="btn btn-sm tooltip tooltip-left border-base-300 bg-base-100 shadow-md hover:bg-base-200"
								data-tip="ズームアウト"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-4 w-4"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
								</svg>
							</button>
							<button
								class="btn btn-sm tooltip tooltip-left border-base-300 bg-base-100 shadow-md hover:bg-base-200"
								data-tip="現在位置"
							>
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
										d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
									/>
								</svg>
							</button>
							<button
								class="btn btn-sm tooltip tooltip-left border-base-300 bg-base-100 shadow-md hover:bg-base-200"
								data-tip="ルート最適化"
							>
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
										d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
							</button>
							<button
								class="btn btn-sm tooltip tooltip-left border-base-300 bg-base-100 shadow-md hover:bg-base-200"
								data-tip="全画面表示"
							>
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
										d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
									/>
								</svg>
							</button>
						</div>
					</div>

					<!-- 凡例（機能拡張） -->
					<div class="absolute bottom-4 left-4 z-10">
						<div class="rounded-lg bg-base-100 p-3 text-xs shadow-md">
							<div class="mb-2 flex items-center gap-1 font-medium text-base-content/80">
								🎯 配送状況
								<span class="text-green-500">●</span>
							</div>
							<div class="space-y-1">
								<div class="flex items-center gap-2">
									<div
										class="flex h-4 w-4 items-center justify-center rounded-lg bg-green-500 text-xs text-white"
									>
										🏢
									</div>
									<span>倉庫</span>
									<span class="text-xs text-base-content/60">({warehouseData.length})</span>
								</div>
								<div class="flex items-center gap-2">
									<div class="h-3 w-3 rounded-full bg-info"></div>
									<span>配送中</span>
									<span class="text-xs text-base-content/60">({deliveryStats.inTransit || 0})</span>
								</div>
								<div class="flex items-center gap-2">
									<div class="h-3 w-3 rounded-full bg-warning"></div>
									<span>準備中</span>
									<span class="text-xs text-base-content/60">({deliveryStats.pending || 0})</span>
								</div>
								<div class="flex items-center gap-2">
									<div class="h-3 w-3 animate-pulse rounded-full bg-error"></div>
									<span>遅延</span>
									<span class="text-xs text-error">({deliveryStats.delayed || 0})</span>
								</div>
								<div class="flex items-center gap-2">
									<div class="h-3 w-3 rounded-full bg-success"></div>
									<span>完了</span>
									<span class="text-xs text-base-content/60">({deliveryStats.delivered || 0})</span>
								</div>
							</div>
							<div class="mt-2 border-t border-base-300 pt-2">
								<div class="text-xs text-base-content/60">
									🚛 稼働車両: {vehicleData.filter((v) => v.status === 'in_use')
										.length}/{vehicleData.length}台
								</div>
							</div>
						</div>
					</div>

					<!-- パフォーマンス指標 -->
					<div class="absolute top-16 right-4 z-10">
						<div class="rounded-lg bg-base-100 p-2 text-xs shadow-md">
							<div class="font-medium text-success">配送効率</div>
							<div class="text-lg font-bold text-base-content">
								{(
									((deliveryStats.delivered || 0) / Math.max(1, deliveryStats.total || 1)) *
									100
								).toFixed(1)}%
							</div>
							<div class="text-base-content/60">成功率</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 配送リスト -->
			<div class="space-y-4">
				<h4 class="font-medium text-base-content/90">配送リスト</h4>
				<div class="max-h-80 space-y-2 overflow-y-auto">
					{#each getFilteredDeliveries().slice(0, 20) as delivery}
						<div
							class="cursor-pointer rounded-lg border border-base-300 p-3 transition-colors hover:bg-base-200 {selectedDelivery?.id ===
							delivery.id
								? 'bg-primary/10 ring-2 ring-primary'
								: ''}"
							onclick={() => handleDeliverySelect(delivery)}
						>
							<div class="mb-2 flex items-center justify-between">
								<div class="text-sm font-medium text-base-content">
									{delivery.orderId}
								</div>
								<div class="badge badge-{getStatusColor(delivery.status)} badge-sm">
									{getStatusLabel(delivery.status)}
								</div>
							</div>

							<div class="space-y-1 text-xs text-base-content/70">
								<div class="flex items-center gap-1">
									<span>{getVehicleIcon(delivery.vehicle.type)}</span>
									<span>{delivery.vehicle.licensePlate}</span>
								</div>
								<div>
									📍 {delivery.destination.customerName}
								</div>
								<div class="flex items-center justify-between">
									<span>⏱️ {formatTimeRemaining(delivery.estimatedArrival)}</span>
									<span class="font-medium">{delivery.distance}km</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- 選択された配送の詳細 -->
		{#if selectedDelivery}
			<div class="mt-6 rounded-lg border border-info/30 bg-info/10 p-4">
				<h4 class="mb-3 font-medium text-base-content">配送詳細: {selectedDelivery.orderId}</h4>
				<div class="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
					<div>
						<div class="font-medium text-base-content">車両情報</div>
						<div>
							{getVehicleIcon(selectedDelivery.vehicle.type)}
							{selectedDelivery.vehicle.licensePlate}
						</div>
						<div>運転手: {selectedDelivery.vehicle.driver}</div>
						<div>積載: {selectedDelivery.vehicle.capacityKg}kg</div>
					</div>
					<div>
						<div class="font-medium text-base-content">配送情報</div>
						<div>📍 {selectedDelivery.destination.address}</div>
						<div>🏠 {selectedDelivery.destination.customerName}</div>
						<div>📦 {selectedDelivery.items} アイテム</div>
					</div>
					<div>
						<div class="font-medium text-base-content">時間情報</div>
						<div>
							⏰ 予定: {new Date(selectedDelivery.estimatedArrival).toLocaleTimeString('ja-JP')}
						</div>
						<div>📏 距離: {selectedDelivery.distance}km</div>
						<div>⚡ 優先度: {selectedDelivery.priority}</div>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>
