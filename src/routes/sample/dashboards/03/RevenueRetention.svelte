<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	let { segment = 'all', dateRange = '30days' } = $props();

	let chartCanvas;
	let chart;
	let selectedMetric = $state('revenue'); // revenue, retention, churn

	let revenueData = $state({
		monthly_recurring_revenue: 45200000,
		annual_recurring_revenue: 542400000,
		revenue_growth_rate: 12.3,
		customer_lifetime_value: 3800000,
		average_revenue_per_user: 89000,
		retention_rate: 94.2,
		churn_rate: 5.8,
		expansion_revenue: 8600000
	});

	let cohortData = $state([
		{ month: '2024-01', retention_rate: 100, revenue_retention: 100, customers: 1250 },
		{ month: '2024-02', retention_rate: 96.2, revenue_retention: 103.4, customers: 1203 },
		{ month: '2024-03', retention_rate: 93.8, revenue_retention: 108.7, customers: 1173 },
		{ month: '2024-04', retention_rate: 91.5, revenue_retention: 112.3, customers: 1144 },
		{ month: '2024-05', retention_rate: 89.7, revenue_retention: 115.8, customers: 1121 },
		{ month: '2024-06', retention_rate: 88.2, revenue_retention: 118.9, customers: 1103 }
	]);

	const metricOptions = [
		{ id: 'revenue', name: '売上推移', icon: 'currency' },
		{ id: 'retention', name: '顧客維持率', icon: 'users' },
		{ id: 'churn', name: '解約率', icon: 'trend-down' }
	];

	onMount(() => {
		createChart();

		return () => {
			if (chart) {
				chart.destroy();
			}
		};
	});

	$effect(() => {
		if (chart) {
			updateChartData(selectedMetric, segment, dateRange);
		}
	});

	function createChart() {
		const ctx = chartCanvas.getContext('2d');

		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: generateLabels(),
				datasets: getDatasets(selectedMetric)
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: 'index',
					intersect: false
				},
				plugins: {
					legend: {
						display: true,
						position: 'top',
						align: 'end'
					},
					tooltip: {
						mode: 'index',
						intersect: false,
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						borderColor: 'rgba(99, 102, 241, 1)',
						borderWidth: 1,
						callbacks: {
							label: function (context) {
								let label = context.dataset.label || '';
								if (label) label += ': ';

								if (selectedMetric === 'revenue') {
									label += '¥' + (context.parsed.y / 1000000).toFixed(1) + 'M';
								} else if (selectedMetric === 'retention' || selectedMetric === 'churn') {
									label += context.parsed.y.toFixed(1) + '%';
								}
								return label;
							}
						}
					}
				},
				scales: {
					x: {
						display: true,
						grid: {
							display: false
						}
					},
					y: {
						display: true,
						beginAtZero: selectedMetric === 'churn',
						grid: {
							color: 'rgba(0, 0, 0, 0.05)'
						},
						ticks: {
							callback: function (value) {
								if (selectedMetric === 'revenue') {
									return '¥' + value / 1000000 + 'M';
								} else if (selectedMetric === 'retention' || selectedMetric === 'churn') {
									return value + '%';
								}
								return value;
							}
						}
					}
				}
			}
		});
	}

	function generateLabels() {
		const labels = [];
		for (let i = 11; i >= 0; i--) {
			const date = new Date();
			date.setMonth(date.getMonth() - i);
			labels.push(date.toLocaleDateString('ja-JP', { month: 'short' }));
		}
		return labels;
	}

	function getDatasets(metric) {
		const baseData = [42.1, 43.8, 41.9, 44.2, 46.1, 43.7, 45.8, 47.2, 44.9, 46.7, 48.3, 45.2];

		switch (metric) {
			case 'revenue':
				return [
					{
						label: 'MRR（月間経常収益）',
						data: baseData.map((v) => v * 1000000),
						borderColor: 'rgb(99, 102, 241)',
						backgroundColor: 'rgba(99, 102, 241, 0.1)',
						tension: 0.4,
						fill: true
					},
					{
						label: '拡張収益',
						data: baseData.map((v) => v * 0.2 * 1000000),
						borderColor: 'rgb(34, 197, 94)',
						backgroundColor: 'rgba(34, 197, 94, 0.1)',
						tension: 0.4,
						fill: true
					}
				];

			case 'retention':
				return [
					{
						label: '顧客維持率',
						data: [95.2, 94.8, 96.1, 93.7, 94.9, 95.8, 94.3, 96.2, 94.7, 95.1, 94.5, 94.2],
						borderColor: 'rgb(34, 197, 94)',
						backgroundColor: 'rgba(34, 197, 94, 0.1)',
						tension: 0.4,
						fill: true
					},
					{
						label: '売上維持率',
						data: [
							102.1, 105.3, 98.7, 103.8, 106.2, 104.1, 107.8, 105.9, 103.4, 108.2, 106.7, 104.5
						],
						borderColor: 'rgb(99, 102, 241)',
						backgroundColor: 'rgba(99, 102, 241, 0.1)',
						tension: 0.4,
						fill: false
					}
				];

			case 'churn':
				return [
					{
						label: '顧客解約率',
						data: [4.8, 5.2, 3.9, 6.3, 5.1, 4.2, 5.7, 3.8, 5.3, 4.9, 5.5, 5.8],
						borderColor: 'rgb(239, 68, 68)',
						backgroundColor: 'rgba(239, 68, 68, 0.1)',
						tension: 0.4,
						fill: true
					},
					{
						label: '売上解約率',
						data: [3.2, 4.1, 2.8, 4.9, 3.7, 3.1, 4.3, 2.9, 3.8, 3.5, 4.2, 3.9],
						borderColor: 'rgb(249, 115, 22)',
						backgroundColor: 'rgba(249, 115, 22, 0.1)',
						tension: 0.4,
						fill: false
					}
				];

			default:
				return [];
		}
	}

	function updateChartData(metric, segment, dateRange) {
		chart.data.datasets = getDatasets(metric);
		chart.options.scales.y.beginAtZero = metric === 'churn';
		chart.update();
	}

	function formatCurrency(value) {
		return '¥' + (value / 1000000).toFixed(1) + 'M';
	}

	function getIconPath(iconType) {
		const icons = {
			currency:
				'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
			users:
				'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
			'trend-down':
				'M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.511l-5.511-3.182'
		};
		return icons[iconType] || icons.currency;
	}
</script>

<div class="card bg-base-100 shadow-sm">
	<div class="card-body">
		<div class="mb-6 flex items-center justify-between">
			<h3 class="text-lg font-semibold">収益・維持率分析</h3>
			<div class="flex gap-2">
				{#each metricOptions as option}
					<button
						class="btn btn-sm"
						class:btn-primary={selectedMetric === option.id}
						class:btn-ghost={selectedMetric !== option.id}
						onclick={() => (selectedMetric = option.id)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-4 w-4"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d={getIconPath(option.icon)} />
						</svg>
						{option.name}
					</button>
				{/each}
			</div>
		</div>

		<!-- KPI カード -->
		<div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
			<div
				class="stat from-primary/10 to-primary/5 border-primary/20 rounded-lg border bg-gradient-to-br"
			>
				<div class="stat-figure text-primary">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-8 w-8"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
						/>
					</svg>
				</div>
				<div class="stat-title text-xs">月間経常収益</div>
				<div class="stat-value text-primary text-lg">
					{formatCurrency(revenueData.monthly_recurring_revenue)}
				</div>
				<div class="stat-desc text-success">+{revenueData.revenue_growth_rate}% 成長</div>
			</div>

			<div
				class="stat from-success/10 to-success/5 border-success/20 rounded-lg border bg-gradient-to-br"
			>
				<div class="stat-figure text-success">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-8 w-8"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
						/>
					</svg>
				</div>
				<div class="stat-title text-xs">顧客維持率</div>
				<div class="stat-value text-success text-lg">{revenueData.retention_rate}%</div>
				<div class="stat-desc text-success">業界平均+7.2%</div>
			</div>

			<div class="stat from-info/10 to-info/5 border-info/20 rounded-lg border bg-gradient-to-br">
				<div class="stat-figure text-info">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-8 w-8"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
						/>
					</svg>
				</div>
				<div class="stat-title text-xs">顧客LTV</div>
				<div class="stat-value text-info text-lg">
					{formatCurrency(revenueData.customer_lifetime_value)}
				</div>
				<div class="stat-desc">
					ARPU: {formatCurrency((revenueData.average_revenue_per_user / 1000000) * 12)}/年
				</div>
			</div>

			<div
				class="stat from-warning/10 to-warning/5 border-warning/20 rounded-lg border bg-gradient-to-br"
			>
				<div class="stat-figure text-warning">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-8 w-8"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.511l-5.511-3.182"
						/>
					</svg>
				</div>
				<div class="stat-title text-xs">解約率</div>
				<div class="stat-value text-warning text-lg">{revenueData.churn_rate}%</div>
				<div class="stat-desc text-error">目標値: 5.0%</div>
			</div>
		</div>

		<!-- チャート -->
		<div class="mb-6 h-80">
			<canvas bind:this={chartCanvas}></canvas>
		</div>

		<!-- コホート分析 -->
		<div class="mt-6">
			<h4 class="mb-4 font-medium">コホート分析（直近6ヶ月）</h4>
			<div class="overflow-x-auto">
				<table class="table-sm table">
					<thead>
						<tr>
							<th>月</th>
							<th>顧客数</th>
							<th>顧客維持率</th>
							<th>売上維持率</th>
							<th>ステータス</th>
						</tr>
					</thead>
					<tbody>
						{#each cohortData as cohort}
							<tr class="hover">
								<td class="font-medium">{cohort.month}</td>
								<td>{cohort.customers.toLocaleString()}社</td>
								<td>
									<div class="flex items-center gap-2">
										<div class="bg-base-200 h-1.5 w-12 rounded-full">
											<div
												class="bg-success h-1.5 rounded-full transition-all duration-500"
												style="width: {cohort.retention_rate}%"
											></div>
										</div>
										<span class="text-sm font-medium">{cohort.retention_rate}%</span>
									</div>
								</td>
								<td>
									<div class="flex items-center gap-2">
										<div class="bg-base-200 h-1.5 w-12 rounded-full">
											<div
												class="bg-primary h-1.5 rounded-full transition-all duration-500"
												style="width: {Math.min(cohort.revenue_retention, 120)}%"
											></div>
										</div>
										<span class="text-sm font-medium">{cohort.revenue_retention}%</span>
									</div>
								</td>
								<td>
									{#if cohort.revenue_retention > 100}
										<div class="badge badge-success badge-sm">拡張</div>
									{:else if cohort.retention_rate > 90}
										<div class="badge badge-info badge-sm">健全</div>
									{:else}
										<div class="badge badge-warning badge-sm">注意</div>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
