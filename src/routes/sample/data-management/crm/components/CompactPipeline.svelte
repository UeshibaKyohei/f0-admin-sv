<script>
	import { dealStore, dealStats } from '../stores/crmStore.js';
	
	let { onDealClick = () => {}, onShowPipeline = () => {} } = $props();
	
	// ステージの定義
	const stages = [
		{ id: 'qualification', name: '検証', color: 'bg-info', percentage: 20 },
		{ id: 'needs_analysis', name: 'ニーズ分析', color: 'bg-warning', percentage: 40 },
		{ id: 'proposal', name: '提案', color: 'bg-secondary', percentage: 60 },
		{ id: 'negotiation', name: '交渉', color: 'bg-primary', percentage: 80 },
		{ id: 'closed', name: 'クローズ', color: 'bg-success', percentage: 100 }
	];
	
	// ステージごとの統計を計算
	const stageStats = $derived.by(() => {
		return stages.map(stage => {
			const deals = $dealStore.filter(d => d.stage === stage.id && d.status === 'open');
			const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
			return {
				...stage,
				count: deals.length,
				value: totalValue
			};
		});
	});
	
	// 金額のフォーマット（短縮形式）
	function formatCurrencyShort(amount) {
		if (amount >= 1000000) {
			return `¥${(amount / 1000000).toFixed(1)}M`;
		} else if (amount >= 1000) {
			return `¥${(amount / 1000).toFixed(0)}K`;
		}
		return `¥${amount}`;
	}
</script>

<div class="space-y-4">
	<!-- パイプライン進捗バー -->
	<div class="relative">
		<div class="flex items-center justify-between mb-2">
			{#each stageStats as stage}
				<div class="text-center flex-1">
					<div class="text-xs font-semibold">{stage.count}</div>
					<div class="text-xs opacity-70">{formatCurrencyShort(stage.value)}</div>
				</div>
			{/each}
		</div>
		
		<div class="relative h-8 bg-base-200 rounded-full overflow-hidden">
			<div class="absolute inset-0 flex">
				{#each stageStats as stage, i}
					<div 
						class={`flex-1 ${stage.color} opacity-80 flex items-center justify-center text-white text-xs font-semibold relative`}
						style="flex-basis: {100 / stages.length}%"
					>
						{#if i < stages.length - 1}
							<div class="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-base-200 z-10"></div>
						{/if}
						{stage.name}
					</div>
				{/each}
			</div>
		</div>
	</div>
	
	<!-- 重要商談リスト -->
	<div class="space-y-2">
		<h4 class="text-sm font-semibold opacity-70">重要商談（金額上位）</h4>
		{#each $dealStore
			.filter(d => d.status === 'open')
			.sort((a, b) => b.value - a.value)
			.slice(0, 3) as deal}
			<div 
				class="flex items-center justify-between p-2 bg-base-100 rounded hover:bg-base-200 transition-colors cursor-pointer"
				onclick={() => onDealClick(deal)}
			>
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2">
						<span class="text-sm font-semibold truncate">{deal.companyName}</span>
						<div class="badge badge-xs">{deal.probability}%</div>
					</div>
					<div class="flex items-center gap-2 text-xs opacity-70">
						<span>{stages.find(s => s.id === deal.stage)?.name}</span>
						<span>·</span>
						<span>{formatCurrencyShort(deal.value)}</span>
					</div>
				</div>
				<svg class="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
				</svg>
			</div>
		{/each}
	</div>
	
	<!-- サマリー統計 -->
	<div class="grid grid-cols-3 gap-2 text-center">
		<div class="bg-base-100 rounded p-2">
			<div class="text-xs opacity-70">合計金額</div>
			<div class="text-sm font-bold">{formatCurrencyShort($dealStats.totalValue)}</div>
		</div>
		<div class="bg-base-100 rounded p-2">
			<div class="text-xs opacity-70">平均単価</div>
			<div class="text-sm font-bold">{formatCurrencyShort($dealStats.avgDealSize)}</div>
		</div>
		<div class="bg-base-100 rounded p-2">
			<div class="text-xs opacity-70">成約率</div>
			<div class="text-sm font-bold">{$dealStats.winRate.toFixed(0)}%</div>
		</div>
	</div>
	
	<div class="text-center">
		<button 
			class="btn btn-ghost btn-sm"
			onclick={onShowPipeline}
		>
			パイプライン詳細
			<svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
			</svg>
		</button>
	</div>
</div>