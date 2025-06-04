<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	let { segment = 'all', dateRange = '30days' } = $props();

	let chartCanvas;
	let chart;
	let selectedMetric = $state('nps'); // nps, csat, ces

	const metricOptions = [
		{ id: 'nps', name: 'NPS スコア' },
		{ id: 'csat', name: 'CSAT スコア' },
		{ id: 'ces', name: 'CES スコア' }
	];

	onMount(() => {
		createChart();

		return () => {
			if (chart) {
				chart.destroy();
			}
		};
	});

	// メトリックやセグメントが変わったらチャートを更新
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
				labels: generateLabels(dateRange),
				datasets: [
					{
						label: 'スコア',
						data: generateData(selectedMetric, segment, dateRange),
						borderColor: 'rgb(99, 102, 241)',
						backgroundColor: 'rgba(99, 102, 241, 0.1)',
						tension: 0.4,
						fill: true
					},
					{
						label: '業界平均',
						data: generateBenchmarkData(selectedMetric, dateRange),
						borderColor: 'rgb(156, 163, 175)',
						backgroundColor: 'transparent',
						borderDash: [5, 5],
						tension: 0.4,
						fill: false
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: true,
						position: 'top',
						align: 'end'
					},
					tooltip: {
						mode: 'index',
						intersect: false,
						callbacks: {
							label: function (context) {
								let label = context.dataset.label || '';
								if (label) {
									label += ': ';
								}
								if (selectedMetric === 'csat') {
									label += context.parsed.y + '%';
								} else {
									label += context.parsed.y;
								}
								return label;
							}
						}
					}
				},
				scales: {
					y: {
						beginAtZero: false,
						max: selectedMetric === 'csat' ? 100 : selectedMetric === 'nps' ? 100 : 10,
						grid: {
							display: true,
							color: 'rgba(0, 0, 0, 0.05)'
						}
					},
					x: {
						grid: {
							display: false
						}
					}
				}
			}
		});
	}

	function generateLabels(range) {
		const labelCounts = {
			'7days': 7,
			'30days': 30,
			'90days': 12,
			'1year': 12
		};

		const count = labelCounts[range] || 30;
		const labels = [];

		if (range === '7days') {
			for (let i = 6; i >= 0; i--) {
				const date = new Date();
				date.setDate(date.getDate() - i);
				labels.push(date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }));
			}
		} else if (range === '30days') {
			for (let i = 29; i >= 0; i -= 5) {
				const date = new Date();
				date.setDate(date.getDate() - i);
				labels.push(date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }));
			}
		} else if (range === '90days') {
			for (let i = 11; i >= 0; i--) {
				const date = new Date();
				date.setDate(date.getDate() - i * 7);
				labels.push(`W${12 - i}`);
			}
		} else {
			for (let i = 11; i >= 0; i--) {
				const date = new Date();
				date.setMonth(date.getMonth() - i);
				labels.push(date.toLocaleDateString('ja-JP', { month: 'short' }));
			}
		}

		return labels;
	}

	function generateData(metric, segment, range) {
		const baseValues = {
			nps: { all: 72, enterprise: 85, business: 70, starter: 65 },
			csat: { all: 88, enterprise: 92, business: 87, starter: 84 },
			ces: { all: 6.2, enterprise: 5.5, business: 6.5, starter: 7.0 }
		};

		const base = baseValues[metric][segment];
		const count = generateLabels(range).length;
		const data = [];

		for (let i = 0; i < count; i++) {
			const variation = (Math.random() - 0.5) * 10;
			const trend = (i / count) * 5; // 上昇トレンド
			data.push(Math.round((base + variation + trend) * 10) / 10);
		}

		return data;
	}

	function generateBenchmarkData(metric, range) {
		const benchmarks = {
			nps: 65,
			csat: 80,
			ces: 6.8
		};

		const base = benchmarks[metric];
		const count = generateLabels(range).length;
		return Array(count).fill(base);
	}

	function updateChartData(metric, segment, range) {
		chart.data.labels = generateLabels(range);
		chart.data.datasets[0].data = generateData(metric, segment, range);
		chart.data.datasets[1].data = generateBenchmarkData(metric, range);

		// Y軸の最大値を更新
		chart.options.scales.y.max = metric === 'csat' ? 100 : metric === 'nps' ? 100 : 10;

		chart.update();
	}
</script>

<div class="card bg-base-100 shadow-sm">
	<div class="card-body">
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-lg font-semibold">満足度トレンド</h3>
			<select class="select select-sm select-bordered" bind:value={selectedMetric}>
				{#each metricOptions as option}
					<option value={option.id}>{option.name}</option>
				{/each}
			</select>
		</div>

		<!-- サマリー統計 -->
		<div class="mb-6 grid grid-cols-3 gap-4">
			<div>
				<p class="text-base-content/60 text-xs">現在値</p>
				<p class="text-xl font-bold">
					{#if selectedMetric === 'nps'}
						72
					{:else if selectedMetric === 'csat'}
						88%
					{:else}
						6.2
					{/if}
				</p>
			</div>
			<div>
				<p class="text-base-content/60 text-xs">前期比</p>
				<p class="text-success text-xl font-bold">+5.2%</p>
			</div>
			<div>
				<p class="text-base-content/60 text-xs">業界平均差</p>
				<p class="text-primary text-xl font-bold">+7pt</p>
			</div>
		</div>

		<div class="h-80">
			<canvas bind:this={chartCanvas}></canvas>
		</div>

		<!-- 凡例説明 -->
		<div class="text-base-content/60 mt-4 text-xs">
			<p>
				{#if selectedMetric === 'nps'}
					NPS (Net Promoter Score): -100 から +100 の範囲。50以上が優良。
				{:else if selectedMetric === 'csat'}
					CSAT (Customer Satisfaction): 顧客満足度。85%以上が目標。
				{:else}
					CES (Customer Effort Score): 顧客努力指標。低いほど良い（1-7のスケール）。
				{/if}
			</p>
		</div>
	</div>
</div>
