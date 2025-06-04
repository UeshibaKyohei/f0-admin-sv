<script>
	import { onMount } from 'svelte';
	import { config } from './config.js';
	import * as dataService from './services/dataService.js';

	let { warehouseId = null, timeRange = '7d' } = $props();

	let inventoryData = $state([]);
	let isLoading = $state(true);
	let selectedCategory = $state('all');
	let selectedWarehouse = $state(warehouseId || 'all');
	let heatmapData = $state([]);
	let maxStock = $state(1000);

	// カテゴリと倉庫のオプション
	const categories = Object.keys(config.PRODUCT_CATEGORIES);
	const categoryOptions = [
		{ id: 'all', name: '全カテゴリ', icon: '📦' },
		...categories.map((cat) => ({
			id: cat,
			name: config.PRODUCT_CATEGORIES[cat].icon + ' ' + cat.charAt(0).toUpperCase() + cat.slice(1),
			color: config.PRODUCT_CATEGORIES[cat].color
		}))
	];

	onMount(async () => {
		await loadInventoryData();
	});

	// リアクティブに更新
	$effect(async () => {
		if (selectedCategory || selectedWarehouse) {
			await loadInventoryData();
		}
	});

	async function loadInventoryData() {
		isLoading = true;
		try {
			const data = await dataService.getInventoryData(
				selectedWarehouse === 'all' ? null : parseInt(selectedWarehouse),
				selectedCategory
			);

			inventoryData = data.inventory;
			processHeatmapData();
		} catch (error) {
			console.error('Failed to load inventory data:', error);
		} finally {
			isLoading = false;
		}
	}

	function processHeatmapData() {
		if (!inventoryData.length) return;

		// カテゴリ別、倉庫別にデータをグループ化
		const grouped = {};
		maxStock = 0;

		inventoryData.forEach((item) => {
			const category = item.product.category;
			const warehouse = item.warehouseId;

			if (!grouped[category]) {
				grouped[category] = {};
			}
			if (!grouped[category][warehouse]) {
				grouped[category][warehouse] = {
					totalStock: 0,
					itemCount: 0,
					lowStockCount: 0,
					stockLevel: 'normal'
				};
			}

			grouped[category][warehouse].totalStock += item.currentStock;
			grouped[category][warehouse].itemCount += 1;

			if (item.stockLevel === 'low' || item.currentStock === 0) {
				grouped[category][warehouse].lowStockCount += 1;
			}

			maxStock = Math.max(maxStock, grouped[category][warehouse].totalStock);
		});

		// ヒートマップ用データに変換
		heatmapData = [];
		Object.keys(grouped).forEach((category) => {
			Object.keys(grouped[category]).forEach((warehouse) => {
				const data = grouped[category][warehouse];
				const intensity = data.totalStock / maxStock;
				const alertLevel = data.lowStockCount / data.itemCount;

				heatmapData.push({
					category,
					warehouse: parseInt(warehouse),
					warehouseName: `倉庫${warehouse}`,
					totalStock: data.totalStock,
					itemCount: data.itemCount,
					lowStockCount: data.lowStockCount,
					intensity,
					alertLevel,
					stockLevel: alertLevel > 0.3 ? 'critical' : alertLevel > 0.1 ? 'warning' : 'normal'
				});
			});
		});
	}

	function getIntensityColor(intensity, alertLevel) {
		if (alertLevel > 0.3) {
			// 危険レベル：エラー色
			return `oklch(from var(--er) l c h / ${0.3 + intensity * 0.7})`;
		} else if (alertLevel > 0.1) {
			// 警告レベル：警告色
			return `oklch(from var(--wa) l c h / ${0.3 + intensity * 0.7})`;
		} else {
			// 正常レベル：成功色
			return `oklch(from var(--su) l c h / ${0.4 + intensity * 0.6})`;
		}
	}

	function getCategoryIcon(category) {
		return config.PRODUCT_CATEGORIES[category]?.icon || '📦';
	}

	function formatStock(stock) {
		if (stock >= 1000000) {
			return `${(stock / 1000000).toFixed(1)}M`;
		} else if (stock >= 1000) {
			return `${(stock / 1000).toFixed(1)}K`;
		}
		return stock.toString();
	}

	function handleCellClick(cell) {
		// 詳細モーダルやドリルダウンビューを表示
		console.log('Selected cell:', cell);
	}
</script>

<div class="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
	<!-- ヘッダー -->
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h3 class="flex items-center gap-2 text-lg font-semibold text-base-content">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-success text-success-content"
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
							d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
						/>
					</svg>
				</div>
				在庫ヒートマップ
			</h3>
			<p class="mt-1 text-sm text-base-content/70">カテゴリ・倉庫別の在庫レベル可視化</p>
		</div>

		<div class="flex items-center gap-3">
			<!-- カテゴリフィルタ -->
			<select class="select select-bordered select-sm" bind:value={selectedCategory}>
				{#each categoryOptions as option}
					<option value={option.id}>{option.name}</option>
				{/each}
			</select>

			<!-- リフレッシュボタン -->
			<button class="btn btn-outline btn-sm" onclick={loadInventoryData} disabled={isLoading}>
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
				<p class="mt-2 text-sm text-base-content/70">在庫データを読み込み中...</p>
			</div>
		</div>
	{:else if heatmapData.length === 0}
		<!-- データなし状態 -->
		<div class="flex h-64 items-center justify-center">
			<div class="text-center text-base-content/60">
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
						d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
					/>
				</svg>
				<p class="font-medium">在庫データがありません</p>
				<p class="mt-1 text-sm">選択した条件でのデータが見つかりませんでした</p>
			</div>
		</div>
	{:else}
		<!-- ヒートマップ表示 -->
		<div class="space-y-4">
			<!-- 拡張された凡例とサマリー -->
			<div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
				<!-- 凡例 -->
				<div class="rounded-lg bg-base-200 p-4">
					<div class="mb-3 flex items-center gap-2">
						<span class="font-medium text-base-content/80">📊 在庫レベル凡例</span>
					</div>
					<div class="grid grid-cols-2 gap-3">
						<div class="flex items-center gap-2">
							<div
								class="h-4 w-4 rounded-lg"
								style="background-color: rgba(34, 197, 94, 0.8)"
							></div>
							<div class="text-xs">
								<div class="font-medium text-base-content/80">十分</div>
								<div class="text-base-content/60">90%+ 適正在庫</div>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<div
								class="h-4 w-4 rounded-lg"
								style="background-color: rgba(59, 130, 246, 0.8)"
							></div>
							<div class="text-xs">
								<div class="font-medium text-base-content/80">良好</div>
								<div class="text-base-content/60">70-90% 標準</div>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<div
								class="h-4 w-4 rounded-lg"
								style="background-color: rgba(245, 158, 11, 0.8)"
							></div>
							<div class="text-xs">
								<div class="font-medium text-base-content/80">警告</div>
								<div class="text-base-content/60">30-70% 要注意</div>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<div
								class="h-4 w-4 rounded-lg"
								style="background-color: rgba(239, 68, 68, 0.8)"
							></div>
							<div class="text-xs">
								<div class="font-medium text-base-content/80">危険</div>
								<div class="text-base-content/60">0-30% 緊急対応</div>
							</div>
						</div>
					</div>
				</div>

				<!-- クイック分析 -->
				<div class="rounded-lg bg-base-200 p-4">
					<div class="mb-3 flex items-center gap-2">
						<span class="font-medium text-base-content/80">🎯 クイック分析</span>
					</div>
					<div class="grid grid-cols-2 gap-3 text-xs">
						<div class="text-center">
							<div class="text-lg font-bold text-green-600">
								{(
									(inventoryData.filter((item) => item.stockLevel === 'normal').length /
										Math.max(1, inventoryData.length)) *
									100
								).toFixed(0)}%
							</div>
							<div class="text-base-content/70">適正在庫率</div>
						</div>
						<div class="text-center">
							<div class="text-lg font-bold text-red-600">
								{inventoryData.filter(
									(item) => item.stockLevel === 'low' || item.currentStock === 0
								).length}
							</div>
							<div class="text-base-content/70">要対応アイテム</div>
						</div>
						<div class="text-center">
							<div class="text-lg font-bold text-blue-600">{categories.length}</div>
							<div class="text-base-content/70">取扱カテゴリ</div>
						</div>
						<div class="text-center">
							<div class="text-lg font-bold text-purple-600">{heatmapData.length}</div>
							<div class="text-base-content/70">監視ポイント</div>
						</div>
					</div>
				</div>
			</div>

			<!-- ヒートマップグリッド -->
			<div class="overflow-x-auto">
				<div class="min-w-full">
					<!-- カテゴリ別グループ表示 -->
					{#each categories as category}
						{@const categoryData = heatmapData.filter((item) => item.category === category)}
						{#if categoryData.length > 0}
							<div class="mb-6">
								<!-- カテゴリヘッダー -->
								<div class="mb-3 flex items-center gap-2">
									<span class="text-lg">{getCategoryIcon(category)}</span>
									<h4 class="font-medium text-base-content/90 capitalize">{category}</h4>
									<span class="text-xs text-base-content/60">({categoryData.length} 倉庫)</span>
								</div>

								<!-- 倉庫別ヒートマップセル（リッチ表示） -->
								<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
									{#each categoryData as cell}
										<button
											class="group relative rounded-xl border-2 border-transparent p-4 text-left shadow-sm transition-all duration-200 hover:scale-102 hover:border-base-300 hover:shadow-md"
											style="background: linear-gradient(135deg, {getIntensityColor(
												cell.intensity,
												cell.alertLevel
											)}, {getIntensityColor(cell.intensity * 0.8, cell.alertLevel)})"
											onclick={() => handleCellClick(cell)}
										>
											<!-- ヘッダー -->
											<div class="mb-2 flex items-center justify-between">
												<div class="truncate text-xs font-bold text-base-content/90">
													{cell.warehouseName}
												</div>

												<!-- ステータスインジケーター -->
												<div class="flex items-center gap-1">
													{#if cell.stockLevel === 'critical'}
														<div
															class="h-2 w-2 animate-pulse rounded-full bg-red-500"
															title="危険"
														></div>
													{:else if cell.stockLevel === 'warning'}
														<div class="h-2 w-2 rounded-full bg-yellow-500" title="警告"></div>
													{:else}
														<div class="h-2 w-2 rounded-full bg-green-500" title="正常"></div>
													{/if}
												</div>
											</div>

											<!-- メイン数値 -->
											<div class="mb-1 text-xl font-bold text-base-content">
												{formatStock(cell.totalStock)}
											</div>

											<!-- 詳細情報 -->
											<div class="grid grid-cols-2 gap-1 text-xs text-base-content/80">
												<div>
													<div class="font-medium">{cell.itemCount}</div>
													<div class="text-base-content/60">アイテム</div>
												</div>
												<div>
													<div class="font-medium">{((1 - cell.alertLevel) * 100).toFixed(0)}%</div>
													<div class="text-base-content/60">稼働率</div>
												</div>
											</div>

											<!-- 進捗バー -->
											<div class="mt-2">
												<div class="bg-opacity-50 h-1.5 w-full rounded-full bg-white">
													<div
														class="h-1.5 rounded-full transition-all duration-300 {cell.alertLevel >
														0.3
															? 'bg-red-600'
															: cell.alertLevel > 0.1
																? 'bg-yellow-500'
																: 'bg-green-500'}"
														style="width: {Math.max(5, (1 - cell.alertLevel) * 100)}%"
													></div>
												</div>
											</div>

											<!-- アラートバッジ -->
											{#if cell.lowStockCount > 0}
												<div class="absolute -top-1 -right-1">
													<span
														class="inline-flex h-6 w-6 animate-pulse items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-bold text-white shadow-md"
													>
														{cell.lowStockCount}
													</span>
												</div>
											{/if}

											<!-- 詳細ツールチップ -->
											<div
												class="invisible absolute -top-20 left-1/2 z-20 -translate-x-1/2 transform rounded-lg bg-neutral text-neutral-content p-3 text-xs whitespace-nowrap shadow-xl group-hover:visible"
											>
												<div class="space-y-1">
													<div class="font-bold">{cell.warehouseName} 詳細</div>
													<div class="border-t border-neutral-content/30 pt-1">
														<div>📦 総在庫: {cell.totalStock.toLocaleString()}点</div>
														<div>🔢 アイテム種類: {cell.itemCount}種</div>
														<div>
															⚠️ 低在庫: {cell.lowStockCount}種 ({(cell.alertLevel * 100).toFixed(
																1
															)}%)
														</div>
														<div>📈 在庫密度: {(cell.intensity * 100).toFixed(0)}%</div>
														<div>
															🎯 ステータス: {cell.stockLevel === 'critical'
																? '🔴 緊急対応'
																: cell.stockLevel === 'warning'
																	? '🟡 要注意'
																	: '🟢 正常'}
														</div>
													</div>
												</div>
												<!-- ツールチップの矢印 -->
												<div
													class="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-neutral"
												></div>
											</div>
										</button>
									{/each}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>

			<!-- サマリー統計 -->
			<div class="mt-6 grid grid-cols-1 gap-4 rounded-lg bg-base-200 p-4 md:grid-cols-4">
				<div class="text-center">
					<div class="text-2xl font-bold text-base-content">
						{inventoryData.reduce((sum, item) => sum + item.currentStock, 0).toLocaleString()}
					</div>
					<div class="text-sm text-base-content/70">総在庫数</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-orange-600">
						{inventoryData.filter((item) => item.stockLevel === 'low').length}
					</div>
					<div class="text-sm text-base-content/70">低在庫アイテム</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-red-600">
						{inventoryData.filter((item) => item.currentStock === 0).length}
					</div>
					<div class="text-sm text-base-content/70">在庫切れ</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-green-600">
						{(
							(inventoryData.filter((item) => item.stockLevel === 'normal').length /
								inventoryData.length) *
							100
						).toFixed(1)}%
					</div>
					<div class="text-sm text-base-content/70">正常在庫率</div>
				</div>
			</div>
		</div>
	{/if}
</div>
