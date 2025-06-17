<script>
	import { scoredLeads } from '../stores/crmStore.js';
	
	let { onLeadClick = () => {}, onShowAll = () => {} } = $props();
	
	// スコアに応じた色を返す
	function getScoreColor(score) {
		if (score >= 80) return 'text-success';
		if (score >= 60) return 'text-warning';
		return 'text-base-content';
	}
	
	// 最新のリード上位5件を取得（本日登録分を優先）
	const topLeads = $derived.by(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		
		// リードを日付でソート（新しい順）
		const sorted = [...$scoredLeads].sort((a, b) => 
			new Date(b.createdAt) - new Date(a.createdAt)
		);
		
		// 本日のリードを優先して表示
		const todayLeads = sorted.filter(lead => {
			const leadDate = new Date(lead.createdAt);
			leadDate.setHours(0, 0, 0, 0);
			return leadDate.getTime() === today.getTime();
		});
		
		const otherLeads = sorted.filter(lead => {
			const leadDate = new Date(lead.createdAt);
			leadDate.setHours(0, 0, 0, 0);
			return leadDate.getTime() !== today.getTime();
		});
		
		// 本日のリードを優先し、足りない分は他の日のリードで補完
		return [...todayLeads, ...otherLeads].slice(0, 5);
	});
</script>

<div class="space-y-3">
	{#each topLeads as lead}
		{@const isToday = new Date(lead.createdAt).toDateString() === new Date().toDateString()}
		<div 
			class="flex items-center justify-between p-3 bg-base-100 rounded-lg hover:bg-base-200 transition-colors cursor-pointer"
			onclick={() => onLeadClick(lead)}
		>
			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-2">
					<h4 class="font-semibold text-sm truncate">{lead.name}</h4>
					<span class={`text-sm font-bold ${getScoreColor(lead.score)}`}>
						{lead.score}
					</span>
					{#if isToday}
						<div class="badge badge-xs badge-accent">NEW</div>
					{/if}
				</div>
				<p class="text-xs opacity-70 truncate">
					{lead.companyName} · {lead.position}
				</p>
				<p class="text-xs opacity-50">
					{new Date(lead.createdAt).toLocaleString('ja-JP', { 
						month: 'numeric', 
						day: 'numeric', 
						hour: '2-digit', 
						minute: '2-digit' 
					})}
				</p>
			</div>
			<div class="flex items-center gap-2 ml-2">
				<div class="badge badge-sm badge-outline">{lead.source}</div>
			</div>
		</div>
	{/each}
	
	<div class="text-center pt-2">
		<button 
			class="btn btn-ghost btn-sm"
			onclick={onShowAll}
		>
			すべてのリードを表示
			<svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
			</svg>
		</button>
	</div>
</div>