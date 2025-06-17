<script>
	import { activityStore } from '../stores/crmStore.js';
	
	let { onShowAll = () => {} } = $props();
	
	// 最新の活動を時系列で取得（本日分を優先）
	const recentActivities = $derived.by(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		
		// 活動を日付でソート（新しい順）
		const sorted = [...$activityStore].sort((a, b) => 
			new Date(b.date) - new Date(a.date)
		);
		
		// 本日の活動を優先して表示
		const todayActivities = sorted.filter(activity => {
			const actDate = new Date(activity.date);
			actDate.setHours(0, 0, 0, 0);
			return actDate.getTime() === today.getTime();
		});
		
		const otherActivities = sorted.filter(activity => {
			const actDate = new Date(activity.date);
			actDate.setHours(0, 0, 0, 0);
			return actDate.getTime() !== today.getTime();
		});
		
		// 本日の活動を優先し、全体で8件まで表示
		return [...todayActivities, ...otherActivities].slice(0, 8);
	});
	
	// アクティビティタイプのアイコンと色を取得
	function getActivityStyle(type) {
		switch(type) {
			case 'email':
				return { 
					icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
					color: 'text-info',
					label: 'メール'
				};
			case 'phone':
				return { 
					icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
					color: 'text-success',
					label: '電話'
				};
			case 'meeting':
				return { 
					icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
					color: 'text-warning',
					label: '面談'
				};
			case 'note':
				return { 
					icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
					color: 'text-base-content',
					label: 'メモ'
				};
			case 'task':
				return { 
					icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
					color: 'text-primary',
					label: 'タスク'
				};
			default:
				return { 
					icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
					color: 'text-base-content',
					label: '活動'
				};
		}
	}
	
	// 時間を相対的な形式で表示
	function formatRelativeTime(date) {
		const now = new Date();
		const activityDate = new Date(date);
		const diffMs = now - activityDate;
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);
		
		if (diffMins < 60) return `${diffMins}分前`;
		if (diffHours < 24) return `${diffHours}時間前`;
		if (diffDays < 7) return `${diffDays}日前`;
		return activityDate.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
	}
</script>

<div class="space-y-2">
	{#each recentActivities as activity}
		{@const style = getActivityStyle(activity.type)}
		{@const isToday = new Date(activity.date).toDateString() === new Date().toDateString()}
		<div class="flex gap-3 p-2 hover:bg-base-200 rounded transition-colors">
			<div class={`mt-1 ${style.color}`}>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={style.icon}></path>
				</svg>
			</div>
			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-2">
					<p class="text-sm">
						<span class="font-semibold">{activity.contactName}</span>
						<span class="opacity-70"> - {activity.description}</span>
					</p>
					{#if isToday}
						<div class="badge badge-xs badge-accent">NEW</div>
					{/if}
				</div>
				<p class="text-xs opacity-50">
					<span class="badge badge-xs badge-ghost">{style.label}</span>
					<span class="ml-1">{activity.companyName} · {formatRelativeTime(activity.date)}</span>
				</p>
			</div>
		</div>
	{/each}
	
	{#if recentActivities.length === 0}
		<div class="text-center py-4 opacity-50">
			<p class="text-sm">本日の活動はまだありません</p>
		</div>
	{/if}
	
	<div class="text-center pt-2">
		<button 
			class="btn btn-ghost btn-sm"
			onclick={onShowAll}
		>
			すべての活動を表示
			<svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
			</svg>
		</button>
	</div>
</div>