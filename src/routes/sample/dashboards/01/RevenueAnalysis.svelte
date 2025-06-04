<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	let { period = 'monthly' } = $props();
	let chartCanvas;
	let chart;

	const chartData = $derived.by(() => {
		if (period === 'daily') {
			return {
				labels: ['月', '火', '水', '木', '金', '土', '日'],
				revenue: [4.2, 4.8, 4.5, 5.1, 5.5, 6.2, 6.8],
				profit: [1.2, 1.4, 1.3, 1.5, 1.6, 1.8, 2.0],
				target: [4.5, 4.5, 4.5, 5.0, 5.0, 6.0, 6.0]
			};
		} else if (period === 'monthly') {
			return {
				labels: [
					'1月',
					'2月',
					'3月',
					'4月',
					'5月',
					'6月',
					'7月',
					'8月',
					'9月',
					'10月',
					'11月',
					'12月'
				],
				revenue: [8.5, 9.2, 8.8, 9.5, 10.2, 11.0, 11.5, 12.0, 11.8, 12.5, 13.0, 13.5],
				profit: [2.1, 2.3, 2.2, 2.4, 2.6, 2.8, 2.9, 3.1, 3.0, 3.2, 3.3, 3.5],
				target: [9.0, 9.0, 9.0, 9.5, 9.5, 10.0, 11.0, 11.0, 12.0, 12.0, 12.5, 13.0]
			};
		} else {
			return {
				labels: ['Q1', 'Q2', 'Q3', 'Q4'],
				revenue: [26.5, 30.7, 35.3, 39.0],
				profit: [6.6, 7.8, 9.0, 10.0],
				target: [27.0, 29.0, 34.0, 38.0]
			};
		}
	});

	onMount(() => {
		const ctx = chartCanvas.getContext('2d');

		chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: chartData.labels,
				datasets: [
					{
						label: '売上高',
						data: chartData.revenue,
						backgroundColor: 'rgba(99, 102, 241, 0.8)',
						borderRadius: 4,
						barPercentage: 0.6
					},
					{
						label: '利益',
						data: chartData.profit,
						backgroundColor: 'rgba(34, 197, 94, 0.8)',
						borderRadius: 4,
						barPercentage: 0.6
					},
					{
						label: '目標',
						data: chartData.target,
						type: 'line',
						borderColor: 'rgba(239, 68, 68, 0.8)',
						borderWidth: 2,
						borderDash: [5, 5],
						fill: false,
						tension: 0.2,
						pointRadius: 0,
						pointHoverRadius: 4
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: 'index',
					intersect: false
				},
				layout: {
					padding: 0
				},
				plugins: {
					legend: {
						display: true,
						position: 'top',
						align: 'end',
						labels: {
							boxWidth: 12,
							padding: 12,
							usePointStyle: true,
							font: {
								size: 11
							}
						}
					},
					tooltip: {
						backgroundColor: 'rgba(0, 0, 0, 0.9)',
						padding: 8,
						cornerRadius: 4,
						titleFont: {
							size: 12
						},
						bodyFont: {
							size: 11
						},
						callbacks: {
							label: function (context) {
								return context.dataset.label + ': ¥' + context.parsed.y.toFixed(1) + 'M';
							}
						}
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						grid: {
							display: true,
							drawBorder: false,
							color: 'rgba(0, 0, 0, 0.05)'
						},
						ticks: {
							padding: 8,
							font: {
								size: 11
							},
							callback: function (value) {
								return '¥' + value + 'M';
							}
						}
					},
					x: {
						grid: {
							display: false,
							drawBorder: false
						},
						ticks: {
							padding: 4,
							font: {
								size: 11
							}
						}
					}
				}
			}
		});

		$effect(() => {
			if (chart) {
				chart.data.labels = chartData.labels;
				chart.data.datasets[0].data = chartData.revenue;
				chart.data.datasets[1].data = chartData.profit;
				chart.data.datasets[2].data = chartData.target;
				chart.update();
			}
		});

		return () => {
			if (chart) {
				chart.destroy();
			}
		};
	});
</script>

<div class="bg-base-100 border-base-300 rounded-lg border">
	<div class="p-4 pb-2">
		<div class="mb-1 flex items-center justify-between">
			<h3 class="text-base font-semibold">売上・利益推移</h3>
			<button class="btn btn-ghost btn-xs">
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
						d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
					/>
				</svg>
			</button>
		</div>
	</div>
	<div class="px-4 pb-4" style="height: 280px;">
		<canvas bind:this={chartCanvas}></canvas>
	</div>
</div>
