<script>
	import { onMount } from 'svelte';

	let { segment = 'all', dateRange = '30days' } = $props();

	// ベースとなるリスクセグメントデータ
	const baseRiskSegments = [
		{
			level: '高リスク',
			baseCount: 234,
			percentage: 15,
			color: 'error',
			factors: ['ログイン頻度低下', '問い合わせ増加', '利用率低下']
		},
		{
			level: '中リスク',
			baseCount: 567,
			percentage: 28,
			color: 'warning',
			factors: ['機能利用停滞', 'NPS低下']
		},
		{
			level: '低リスク',
			baseCount: 1243,
			percentage: 57,
			color: 'success',
			factors: ['安定利用']
		}
	];

	let recentChurnReasons = $state([
		{ reason: '価格・コスト', percentage: 32 },
		{ reason: '機能不足', percentage: 28 },
		{ reason: 'サポート品質', percentage: 18 },
		{ reason: '競合への移行', percentage: 15 },
		{ reason: 'その他', percentage: 7 }
	]);

	// 計算されたリスクセグメント（派生値）
	const riskSegments = $derived.by(() => {
		const segmentMultiplier = {
			all: 1,
			enterprise: 0.6,
			business: 1.2,
			starter: 1.5
		}[segment];

		return baseRiskSegments.map((risk) => ({
			...risk,
			count: Math.round(risk.baseCount * segmentMultiplier)
		}));
	});

	function getTotalAtRisk() {
		return riskSegments.filter((s) => s.level !== '低リスク').reduce((sum, s) => sum + s.count, 0);
	}
</script>

<div class="card bg-base-100 h-full shadow-sm">
	<div class="card-body">
		<h3 class="mb-4 text-lg font-semibold">解約リスク分析</h3>

		<!-- 総リスク顧客数 -->
		<div class="alert alert-warning mb-4">
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
					d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
				/>
			</svg>
			<div>
				<p class="font-semibold">要注意顧客: {getTotalAtRisk()}社</p>
				<p class="text-sm">早急な対応が必要です</p>
			</div>
		</div>

		<!-- リスクセグメント -->
		<div class="mb-6 space-y-3">
			{#each riskSegments as segment}
				<div>
					<div class="mb-1 flex items-center justify-between">
						<span class="text-sm font-medium">{segment.level}</span>
						<span class="text-base-content/60 text-sm">{segment.count}社</span>
					</div>
					<div class="bg-base-200 h-2 w-full rounded-full">
						<div
							class="bg-{segment.color} h-2 rounded-full transition-all duration-500"
							style="width: {segment.percentage}%"
						></div>
					</div>
					<div class="text-base-content/60 mt-1 text-xs">
						{segment.factors.join('、')}
					</div>
				</div>
			{/each}
		</div>

		<!-- 解約理由 -->
		<div>
			<h4 class="mb-2 text-sm font-medium">主な解約理由</h4>
			<div class="space-y-2">
				{#each recentChurnReasons as reason}
					<div class="flex items-center justify-between">
						<span class="text-xs">{reason.reason}</span>
						<div class="flex items-center gap-2">
							<div class="bg-base-200 h-1.5 w-20 rounded-full">
								<div
									class="bg-primary h-1.5 rounded-full"
									style="width: {reason.percentage}%"
								></div>
							</div>
							<span class="text-base-content/60 w-10 text-right text-xs">{reason.percentage}%</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- アクションボタン -->
		<div class="mt-6">
			<button class="btn btn-primary btn-block btn-sm"> リスク顧客リストを見る </button>
		</div>
	</div>
</div>
