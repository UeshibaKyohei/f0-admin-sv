<script>
	import { onMount } from 'svelte';

	let { segment = 'all', dateRange = '30days' } = $props();

	// ベースとなるメトリクスデータ
	const baseMetrics = [
		{
			title: '総顧客数',
			baseValue: '12,543',
			change: '+5.2%',
			trend: 'up',
			icon: 'users',
			color: 'primary'
		},
		{
			title: 'NPS スコア',
			baseValue: '72',
			change: '+3pt',
			trend: 'up',
			icon: 'star',
			color: 'success'
		},
		{
			title: 'CSAT スコア',
			baseValue: '88%',
			change: '+2.1%',
			trend: 'up',
			icon: 'heart',
			color: 'secondary'
		},
		{
			title: '平均解約率',
			baseValue: '2.3%',
			change: '-0.5%',
			trend: 'down',
			icon: 'logout',
			color: 'warning'
		},
		{
			title: '月間収益',
			baseValue: '¥45.2M',
			change: '+12.3%',
			trend: 'up',
			icon: 'currency',
			color: 'info'
		},
		{
			title: '平均 LTV',
			baseValue: '¥3.8M',
			change: '+8.7%',
			trend: 'up',
			icon: 'chart',
			color: 'accent'
		}
	];

	// 計算されたメトリクス（派生値）
	const metrics = $derived.by(() => {
		const segmentMultiplier = {
			all: 1,
			enterprise: 0.2,
			business: 0.5,
			starter: 0.3
		}[segment];

		const rangeMultiplier = {
			'7days': 0.2,
			'30days': 1,
			'90days': 3,
			'1year': 12
		}[dateRange];

		return baseMetrics.map((metric) => ({
			...metric,
			value: adjustValue(metric.baseValue, segmentMultiplier, rangeMultiplier)
		}));
	});

	function adjustValue(baseValue, segMult, rangeMult) {
		// 簡易的な値の調整（実際はAPIから取得）
		if (baseValue.includes('¥')) {
			const num = parseFloat(baseValue.replace(/[¥,M]/g, ''));
			return `¥${(num * segMult * rangeMult).toFixed(1)}M`;
		} else if (baseValue.includes('%')) {
			return baseValue; // パーセンテージはそのまま
		} else if (baseValue.includes(',')) {
			const num = parseInt(baseValue.replace(/,/g, ''));
			return (num * segMult).toLocaleString();
		}
		return baseValue;
	}

	function getIcon(type) {
		const icons = {
			users:
				'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
			star: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
			heart:
				'M21 8.5c0-2.485-2.015-4.5-4.5-4.5a4.5 4.5 0 00-4.5 2.572A4.5 4.5 0 007.5 4C5.015 4 3 6.015 3 8.5c0 .663.144 1.293.402 1.858L12 21l8.598-10.642A4.48 4.48 0 0021 8.5z',
			logout:
				'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75',
			currency:
				'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
			chart:
				'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z'
		};
		return icons[type] || icons.users;
	}
</script>

<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
	{#each metrics as metric}
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body p-4">
				<div class="flex items-start justify-between">
					<div class="flex-1">
						<p class="text-base-content/60 mb-1 text-xs">{metric.title}</p>
						<p class="text-2xl font-bold">{metric.value}</p>
						<div class="mt-2 flex items-center gap-1">
							{#if metric.trend === 'up'}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="2"
									stroke="currentColor"
									class="text-success h-4 w-4"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
									/>
								</svg>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="2"
									stroke="currentColor"
									class="text-error h-4 w-4"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
									/>
								</svg>
							{/if}
							<span
								class="text-xs font-medium"
								class:text-success={metric.trend === 'up'}
								class:text-error={metric.trend === 'down'}
							>
								{metric.change}
							</span>
						</div>
					</div>
					<div
						class="h-10 w-10 rounded-lg bg-{metric.color}/10 text-{metric.color} flex items-center justify-center"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-6 w-6"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d={getIcon(metric.icon)} />
						</svg>
					</div>
				</div>
			</div>
		</div>
	{/each}
</div>
