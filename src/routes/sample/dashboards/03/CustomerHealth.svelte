<script>
	import { onMount } from 'svelte';

	let { segment = 'all', dateRange = '30days' } = $props();

	let customers = $state([
		{
			id: 1,
			name: '株式会社サンプル',
			segment: 'enterprise',
			healthScore: 92,
			trend: 'up',
			revenue: '¥5.2M/月',
			lastActivity: '2時間前',
			signals: {
				usage: 'high',
				engagement: 'high',
				support: 'low',
				payment: 'good'
			}
		},
		{
			id: 2,
			name: 'テック株式会社',
			segment: 'enterprise',
			healthScore: 78,
			trend: 'stable',
			revenue: '¥3.8M/月',
			lastActivity: '1日前',
			signals: {
				usage: 'medium',
				engagement: 'high',
				support: 'medium',
				payment: 'good'
			}
		},
		{
			id: 3,
			name: '株式会社イノベーション',
			segment: 'business',
			healthScore: 45,
			trend: 'down',
			revenue: '¥1.2M/月',
			lastActivity: '5日前',
			signals: {
				usage: 'low',
				engagement: 'low',
				support: 'high',
				payment: 'warning'
			}
		},
		{
			id: 4,
			name: 'デジタル株式会社',
			segment: 'business',
			healthScore: 88,
			trend: 'up',
			revenue: '¥2.1M/月',
			lastActivity: '3時間前',
			signals: {
				usage: 'high',
				engagement: 'medium',
				support: 'low',
				payment: 'good'
			}
		},
		{
			id: 5,
			name: 'スタートアップA社',
			segment: 'starter',
			healthScore: 65,
			trend: 'stable',
			revenue: '¥0.5M/月',
			lastActivity: '12時間前',
			signals: {
				usage: 'medium',
				engagement: 'medium',
				support: 'medium',
				payment: 'good'
			}
		}
	]);

	let sortBy = $state('healthScore');
	let filterByHealth = $state('all'); // all, good, warning, critical

	// フィルタリングされた顧客リスト
	const filteredCustomers = $derived.by(() => {
		let filtered = [...customers];

		// セグメントフィルタ
		if (segment !== 'all') {
			filtered = filtered.filter((c) => c.segment === segment);
		}

		// 健全性フィルタ
		if (filterByHealth !== 'all') {
			filtered = filtered.filter((c) => {
				if (filterByHealth === 'good') return c.healthScore >= 80;
				if (filterByHealth === 'warning') return c.healthScore >= 50 && c.healthScore < 80;
				if (filterByHealth === 'critical') return c.healthScore < 50;
				return true;
			});
		}

		// ソート
		filtered.sort((a, b) => {
			if (sortBy === 'healthScore') return b.healthScore - a.healthScore;
			if (sortBy === 'revenue') return parseFloat(b.revenue) - parseFloat(a.revenue);
			if (sortBy === 'name') return a.name.localeCompare(b.name);
			return 0;
		});

		return filtered;
	});

	function getHealthColor(score) {
		if (score >= 80) return 'success';
		if (score >= 50) return 'warning';
		return 'error';
	}

	function getHealthLabel(score) {
		if (score >= 80) return '健全';
		if (score >= 50) return '要注意';
		return '危険';
	}

	function getSignalColor(level) {
		const colors = {
			high: 'success',
			medium: 'warning',
			low: 'error',
			good: 'success',
			warning: 'warning'
		};
		return colors[level] || 'base-300';
	}

	function getSignalIcon(type) {
		const icons = {
			usage:
				'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
			engagement:
				'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z',
			support:
				'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155',
			payment:
				'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z'
		};
		return icons[type];
	}
</script>

<div class="card bg-base-100 shadow-sm">
	<div class="card-body">
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-lg font-semibold">顧客健全性スコア</h3>
			<div class="flex gap-2">
				<select class="select select-sm select-bordered" bind:value={filterByHealth}>
					<option value="all">全て表示</option>
					<option value="good">健全のみ</option>
					<option value="warning">要注意のみ</option>
					<option value="critical">危険のみ</option>
				</select>
				<select class="select select-sm select-bordered" bind:value={sortBy}>
					<option value="healthScore">スコア順</option>
					<option value="revenue">収益順</option>
					<option value="name">名前順</option>
				</select>
			</div>
		</div>

		<div class="overflow-x-auto">
			<table class="table-sm table">
				<thead>
					<tr>
						<th>顧客名</th>
						<th>健全性スコア</th>
						<th>シグナル</th>
						<th>月間収益</th>
						<th>最終活動</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each filteredCustomers as customer}
						<tr class="hover">
							<td>
								<div>
									<div class="font-medium">{customer.name}</div>
									<div class="text-base-content/60 text-xs capitalize">{customer.segment}</div>
								</div>
							</td>
							<td>
								<div class="flex items-center gap-2">
									<div
										class="radial-progress text-{getHealthColor(customer.healthScore)} text-xs"
										style="--value:{customer.healthScore}; --size:2.5rem; --thickness:3px;"
									>
										{customer.healthScore}
									</div>
									<div>
										<div class="badge badge-{getHealthColor(customer.healthScore)} badge-sm">
											{getHealthLabel(customer.healthScore)}
										</div>
										<div class="mt-1 flex items-center gap-1">
											{#if customer.trend === 'up'}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													stroke-width="2"
													stroke="currentColor"
													class="text-success h-3 w-3"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
													/>
												</svg>
											{:else if customer.trend === 'down'}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													stroke-width="2"
													stroke="currentColor"
													class="text-error h-3 w-3"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
													/>
												</svg>
											{:else}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													stroke-width="2"
													stroke="currentColor"
													class="text-warning h-3 w-3"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
													/>
												</svg>
											{/if}
											<span class="text-xs"
												>{customer.trend === 'up'
													? '改善中'
													: customer.trend === 'down'
														? '悪化中'
														: '横ばい'}</span
											>
										</div>
									</div>
								</div>
							</td>
							<td>
								<div class="flex gap-1">
									{#each Object.entries(customer.signals) as [type, level]}
										<div class="tooltip" data-tip={type}>
											<div
												class="h-8 w-8 rounded bg-{getSignalColor(level)}/10 text-{getSignalColor(
													level
												)} flex items-center justify-center"
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
														d={getSignalIcon(type)}
													/>
												</svg>
											</div>
										</div>
									{/each}
								</div>
							</td>
							<td>
								<div class="font-medium">{customer.revenue}</div>
							</td>
							<td>
								<div class="text-base-content/60 text-sm">{customer.lastActivity}</div>
							</td>
							<td>
								<button class="btn btn-ghost btn-xs">詳細</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
