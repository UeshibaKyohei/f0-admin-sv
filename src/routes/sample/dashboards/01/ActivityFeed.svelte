<script>
	import { onMount } from 'svelte';

	let activities = $state([
		{
			id: 1,
			type: 'achievement',
			title: '月間売上目標達成',
			description: '営業1部が110%達成',
			time: '5分前',
			icon: '🎯',
			color: 'success'
		},
		{
			id: 2,
			type: 'alert',
			title: '在庫レベル警告',
			description: '商品A: 残り20個',
			time: '12分前',
			icon: '⚠️',
			color: 'warning'
		},
		{
			id: 3,
			type: 'info',
			title: '新規大口契約',
			description: 'X社: ¥5.2M/年',
			time: '1時間前',
			icon: '📝',
			color: 'info'
		},
		{
			id: 4,
			type: 'system',
			title: 'レポート生成完了',
			description: '月次財務レポート',
			time: '2時間前',
			icon: '📊',
			color: 'base'
		},
		{
			id: 5,
			type: 'achievement',
			title: '顧客満足度向上',
			description: 'NPS: 72 → 78',
			time: '3時間前',
			icon: '⭐',
			color: 'success'
		}
	]);

	// 新しいアクティビティを追加するシミュレーション
	onMount(() => {
		const templates = [
			{
				type: 'achievement',
				title: '週間目標達成',
				description: '開発部: タスク完了率95%',
				icon: '✅',
				color: 'success'
			},
			{
				type: 'alert',
				title: '支払い遅延',
				description: 'Y社: 3日遅延',
				icon: '💰',
				color: 'error'
			},
			{
				type: 'info',
				title: '新商品リリース',
				description: 'Product-Z 販売開始',
				icon: '🚀',
				color: 'info'
			}
		];

		const interval = setInterval(() => {
			const template = templates[Math.floor(Math.random() * templates.length)];
			const newActivity = {
				...template,
				id: Date.now(),
				time: '今'
			};

			activities = [newActivity, ...activities].slice(0, 10);
		}, 45000);

		return () => clearInterval(interval);
	});

	function getColorClass(color) {
		const colors = {
			success: 'border-l-success bg-success/5',
			warning: 'border-l-warning bg-warning/5',
			error: 'border-l-error bg-error/5',
			info: 'border-l-info bg-info/5',
			base: 'border-l-base-300 bg-base-200/30'
		};
		return colors[color] || colors.base;
	}
</script>

<div class="bg-base-100 border-base-300 flex h-full flex-col rounded-lg border">
	<div class="border-base-200 border-b p-4 pb-3">
		<div class="flex items-center justify-between">
			<h3 class="text-base font-semibold">アクティビティ</h3>
			<span class="badge badge-sm badge-primary">
				<span class="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-white"></span>
				Live
			</span>
		</div>
	</div>

	<div class="flex-1 overflow-y-auto p-2" style="max-height: 320px;">
		<div class="space-y-2">
			{#each activities as activity (activity.id)}
				<div
					class="rounded-md border-l-4 {getColorClass(
						activity.color
					)} p-3 transition-shadow hover:shadow-sm"
				>
					<div class="flex items-start gap-2">
						<span class="flex-shrink-0 text-lg">{activity.icon}</span>
						<div class="min-w-0 flex-1">
							<div class="truncate text-sm font-medium">{activity.title}</div>
							<div class="text-base-content/60 truncate text-xs">{activity.description}</div>
							<div class="text-base-content/40 mt-1 text-xs">{activity.time}</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
