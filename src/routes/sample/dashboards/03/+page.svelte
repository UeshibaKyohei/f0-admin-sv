<script>
	import { onMount } from 'svelte';
	import CustomerMetrics from './CustomerMetrics.svelte';
	import SatisfactionTrends from './SatisfactionTrends.svelte';
	import ChurnAnalysis from './ChurnAnalysis.svelte';
	import CustomerHealth from './CustomerHealth.svelte';
	import SupportTickets from './SupportTickets.svelte';
	import RevenueRetention from './RevenueRetention.svelte';
	import EngagementHeatmap from './EngagementHeatmap.svelte';
	import { config, featureFlags, isFeatureEnabled } from './config.js';

	let viewMode = $state('overview'); // overview, analytics, support, engagement
	let selectedSegment = $state('all');
	let dateRange = $state('30days');
	let currentDate = $state(new Date().toLocaleDateString('ja-JP'));
	let isExporting = $state(false);
	let isLoading = $state(false);

	// 顧客セグメントリスト
	let segments = $state([
		{ id: 'all', name: '全顧客', icon: '👥' },
		{ id: 'enterprise', name: 'エンタープライズ', icon: '🏢' },
		{ id: 'business', name: 'ビジネス', icon: '🏪' },
		{ id: 'starter', name: 'スターター', icon: '🚀' }
	]);

	// 期間選択オプション
	let dateRanges = $state([
		{ id: '7days', name: '過去7日間', icon: '📅' },
		{ id: '30days', name: '過去30日間', icon: '🗓️' },
		{ id: '90days', name: '過去90日間', icon: '📊' },
		{ id: '1year', name: '過去1年間', icon: '📈' }
	]);

	onMount(() => {
		// リアルタイム更新の設定
		const interval = setInterval(() => {
			currentDate = new Date().toLocaleDateString('ja-JP');

			// 本番環境でのリアルタイム更新
			if (isFeatureEnabled('ENABLE_REAL_TIME_UPDATES')) {
				refreshDashboardData();
			}
		}, config.REFRESH_INTERVALS.CUSTOMER_METRICS);

		return () => clearInterval(interval);
	});

	async function refreshDashboardData() {
		if (isLoading) return;

		isLoading = true;
		try {
			// バックグラウンドでデータを更新
			// 実際の実装では各コンポーネントのデータを更新
			await new Promise((resolve) => setTimeout(resolve, 500));
		} catch (error) {
			console.error('Failed to refresh dashboard data:', error);
		} finally {
			isLoading = false;
		}
	}

	async function exportData() {
		if (!isFeatureEnabled('SHOW_EXPORT_BUTTON')) return;

		isExporting = true;
		await new Promise((resolve) => setTimeout(resolve, 1500));

		if (config.USE_MOCK_DATA) {
			alert('カスタマーサクセスデータのエクスポート機能を実装予定');
		} else {
			// 本番環境では実際のエクスポート処理
			const exportData = {
				segment: selectedSegment,
				dateRange: dateRange,
				timestamp: new Date().toISOString()
			};
			console.log('Exporting data:', exportData);
		}

		isExporting = false;
	}

	// ビューモード変更時のアニメーション
	function handleViewModeChange(newMode) {
		if (viewMode !== newMode) {
			viewMode = newMode;

			// デバッグ情報表示
			if (isFeatureEnabled('SHOW_DEBUG_INFO')) {
				console.log(`View mode changed to: ${newMode}`);
			}
		}
	}
</script>

<div class="bg-base-100 min-h-screen">
	{#if isFeatureEnabled('SHOW_SAMPLE_DATA_BANNER')}
		<!-- サンプルデータバナー -->
		<div class="bg-warning/10 border-warning border-l-4 px-4 py-2">
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
						d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
					/>
				</svg>
				<div>
					<span class="text-warning text-sm font-medium">デモモード</span>
					<span class="text-base-content/60 ml-2 text-xs"
						>このダッシュボードはサンプルデータを使用しています</span
					>
				</div>
			</div>
		</div>
	{/if}

	<!-- タイトル -->
	<div class="from-base-100 to-base-200/50 bg-gradient-to-r px-4 pt-6 pb-2 lg:px-6">
		<div class="flex items-center gap-3">
			<div class="from-primary/20 to-secondary/20 rounded-lg bg-gradient-to-br p-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="text-primary h-6 w-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
					/>
				</svg>
			</div>
			<div>
				<h1
					class="from-primary to-secondary bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent"
				>
					カスタマーサクセス
				</h1>
				<p class="text-base-content/60 mt-1 text-sm">顧客満足度とエンゲージメントの包括的分析</p>
			</div>
			{#if isLoading}
				<div class="ml-auto">
					<span class="loading loading-spinner loading-sm text-primary"></span>
				</div>
			{/if}
		</div>
	</div>

	<!-- ヘッダー -->
	<div class="bg-base-100 border-base-300 mt-2 border-b">
		<div class="px-4 py-3 lg:px-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<div class="flex items-center gap-2">
						<span class="text-base-content/60 hidden text-xs sm:inline">セグメント:</span>
						<select
							class="select select-sm select-bordered bg-base-100/80 backdrop-blur-sm transition-all duration-200 hover:shadow-md focus:shadow-lg"
							bind:value={selectedSegment}
						>
							{#each segments as segment}
								<option value={segment.id}>{segment.icon} {segment.name}</option>
							{/each}
						</select>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-base-content/60 hidden text-xs sm:inline">期間:</span>
						<select
							class="select select-sm select-bordered bg-base-100/80 backdrop-blur-sm transition-all duration-200 hover:shadow-md focus:shadow-lg"
							bind:value={dateRange}
						>
							{#each dateRanges as range}
								<option value={range.id}>{range.icon} {range.name}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="flex items-center gap-4">
					<!-- ビュー切り替え -->
					<div class="bg-base-200/50 rounded-lg p-1 backdrop-blur-sm">
						<div class="btn-group btn-group-sm">
							<button
								class="btn btn-ghost gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg {viewMode ===
								'overview'
									? 'btn-active from-primary/20 to-secondary/20 text-primary bg-gradient-to-r'
									: ''}"
								onclick={() => handleViewModeChange('overview')}
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
										d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
									/>
								</svg>
								<span class="hidden sm:inline">概要</span>
							</button>
							<button
								class="btn btn-ghost gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg {viewMode ===
								'analytics'
									? 'btn-active from-info/20 to-accent/20 text-info bg-gradient-to-r'
									: ''}"
								onclick={() => handleViewModeChange('analytics')}
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
										d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
									/>
								</svg>
								<span class="hidden sm:inline">分析</span>
							</button>
							<button
								class="btn btn-ghost gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg {viewMode ===
								'support'
									? 'btn-active from-warning/20 to-success/20 text-warning bg-gradient-to-r'
									: ''}"
								onclick={() => handleViewModeChange('support')}
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
										d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
									/>
								</svg>
								<span class="hidden sm:inline">サポート</span>
							</button>
							<button
								class="btn btn-ghost gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg {viewMode ===
								'engagement'
									? 'btn-active from-secondary/20 to-accent/20 text-secondary bg-gradient-to-r'
									: ''}"
								onclick={() => handleViewModeChange('engagement')}
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
										d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
									/>
								</svg>
								<span class="hidden sm:inline">エンゲージメント</span>
							</button>
						</div>
					</div>

					<!-- リフレッシュボタン -->
					<button
						class="btn btn-sm btn-ghost tooltip tooltip-bottom gap-2 transition-all duration-200 hover:scale-105"
						data-tip="データを更新"
						onclick={refreshDashboardData}
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
					</button>

					<!-- 更新日時 -->
					<div class="text-base-content/60 flex items-center gap-2 text-sm">
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
						<span class="hidden md:inline">最終更新:</span>
						<span class="font-mono">{currentDate}</span>
					</div>

					{#if isFeatureEnabled('SHOW_EXPORT_BUTTON')}
						<!-- エクスポート -->
						<button
							class="btn btn-sm btn-primary gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg"
							onclick={exportData}
							disabled={isExporting}
						>
							{#if isExporting}
								<span class="loading loading-spinner loading-xs"></span>
								<span class="hidden sm:inline">処理中...</span>
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
										d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
									/>
								</svg>
								<span class="hidden sm:inline">エクスポート</span>
							{/if}
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- メインコンテンツ -->
	<div class="from-base-200/80 to-base-300/30 min-h-screen bg-gradient-to-br px-4 py-6 lg:px-6">
		{#if viewMode === 'overview'}
			<div class="grid grid-cols-12 gap-4">
				<!-- 顧客メトリクス -->
				<div class="col-span-12">
					<CustomerMetrics segment={selectedSegment} {dateRange} />
				</div>

				<!-- 満足度トレンドとチャーン分析 -->
				<div class="col-span-12 lg:col-span-8">
					<SatisfactionTrends segment={selectedSegment} {dateRange} />
				</div>
				<div class="col-span-12 lg:col-span-4">
					<ChurnAnalysis segment={selectedSegment} {dateRange} />
				</div>

				<!-- 顧客健全性とサポートチケット -->
				<div class="col-span-12 lg:col-span-7">
					<CustomerHealth segment={selectedSegment} {dateRange} />
				</div>
				<div class="col-span-12 lg:col-span-5">
					<SupportTickets segment={selectedSegment} {dateRange} />
				</div>
			</div>
		{:else if viewMode === 'analytics'}
			<div class="grid grid-cols-12 gap-4">
				<div class="col-span-12 lg:col-span-8">
					<SatisfactionTrends segment={selectedSegment} {dateRange} />
				</div>
				<div class="col-span-12 lg:col-span-4">
					<ChurnAnalysis segment={selectedSegment} {dateRange} />
				</div>
				<div class="col-span-12">
					<RevenueRetention segment={selectedSegment} {dateRange} />
				</div>
			</div>
		{:else if viewMode === 'support'}
			<div class="grid grid-cols-12 gap-4">
				<div class="col-span-12">
					<SupportTickets segment={selectedSegment} {dateRange} showDetails={true} />
				</div>
			</div>
		{:else if viewMode === 'engagement'}
			<div class="grid grid-cols-12 gap-4">
				<div class="col-span-12">
					<EngagementHeatmap segment={selectedSegment} {dateRange} />
				</div>
				<div class="col-span-12 lg:col-span-6">
					<CustomerHealth segment={selectedSegment} {dateRange} />
				</div>
				<div class="col-span-12 lg:col-span-6">
					<RevenueRetention segment={selectedSegment} {dateRange} />
				</div>
			</div>
		{/if}
	</div>
</div>
