<script>
	import { onMount } from 'svelte';
	import KpiMetrics from './KpiMetrics.svelte';
	import RevenueAnalysis from './RevenueAnalysis.svelte';
	import DepartmentPerformance from './DepartmentPerformance.svelte';
	import FinancialOverview from './FinancialOverview.svelte';
	import ActivityFeed from './ActivityFeed.svelte';

	let selectedPeriod = $state('monthly');
	let currentDate = $state(new Date().toLocaleDateString('ja-JP'));
	let isExporting = $state(false);

	// リアルタイム更新のシミュレーション
	onMount(() => {
		const interval = setInterval(() => {
			currentDate = new Date().toLocaleDateString('ja-JP');
		}, 60000);

		return () => clearInterval(interval);
	});

	async function exportData() {
		isExporting = true;
		await new Promise((resolve) => setTimeout(resolve, 1500));
		alert('データエクスポート機能（CSV/PDF）を実装予定');
		isExporting = false;
	}
</script>

<div class="bg-base-100 min-h-screen">
	<!-- タイトル -->
	<div class="bg-base-100 px-4 pt-4 lg:px-6">
		<h1 class="text-2xl font-bold">経営ダッシュボード</h1>
	</div>

	<!-- コンパクトなヘッダー -->
	<div class="bg-base-100 border-base-300 border-b">
		<div class="px-4 py-3 lg:px-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-6">
					<div class="flex items-center gap-2 text-sm">
						<span class="bg-success h-2 w-2 animate-pulse rounded-full"></span>
						<span class="text-base-content/60">{currentDate} 更新</span>
					</div>
				</div>

				<div class="flex items-center gap-4">
					<!-- 期間選択 -->
					<div class="btn-group btn-group-sm">
						<button
							class="btn"
							class:btn-active={selectedPeriod === 'daily'}
							onclick={() => (selectedPeriod = 'daily')}>日</button
						>
						<button
							class="btn"
							class:btn-active={selectedPeriod === 'monthly'}
							onclick={() => (selectedPeriod = 'monthly')}>月</button
						>
						<button
							class="btn"
							class:btn-active={selectedPeriod === 'quarterly'}
							onclick={() => (selectedPeriod = 'quarterly')}>四半期</button
						>
					</div>

					<!-- エクスポート -->
					<button class="btn btn-sm btn-ghost gap-2" onclick={exportData} disabled={isExporting}>
						{#if isExporting}
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
									d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
								/>
							</svg>
						{/if}
						エクスポート
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- メインコンテンツ: 8ptグリッドシステム -->
	<div class="bg-base-200 px-4 py-4 lg:px-6">
		<div class="grid grid-cols-12 gap-4">
			<!-- 上部: KPIメトリクス (フル幅) -->
			<div class="col-span-12">
				<KpiMetrics period={selectedPeriod} />
			</div>

			<!-- 中段左: 売上分析 (8/12) -->
			<div class="col-span-12 lg:col-span-8">
				<RevenueAnalysis period={selectedPeriod} />
			</div>

			<!-- 中段右: 活動フィード (4/12) -->
			<div class="col-span-12 lg:col-span-4">
				<ActivityFeed />
			</div>

			<!-- 下段左: 部門別パフォーマンス (5/12) -->
			<div class="col-span-12 lg:col-span-5">
				<DepartmentPerformance />
			</div>

			<!-- 下段右: 財務概要 (7/12) -->
			<div class="col-span-12 lg:col-span-7">
				<FinancialOverview period={selectedPeriod} />
			</div>
		</div>
	</div>
</div>
