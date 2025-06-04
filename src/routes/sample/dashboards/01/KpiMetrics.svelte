<script>
	import { onMount } from 'svelte';
	import { dataService } from './services/dataService.js';
	import { config } from './config.js';

	let { period = 'monthly' } = $props();
	let metrics = $state([]);
	let loading = $state(true);
	let error = $state(null);

	// データの取得
	async function loadMetrics() {
		try {
			loading = true;
			error = null;
			const data = await dataService.getKpiMetrics(period);

			// データを表示用にフォーマット
			metrics = data.map((metric) => ({
				...metric,
				displayValue: formatValue(metric.value, metric.unit),
				displayChange: `${metric.change_percentage > 0 ? '+' : ''}${metric.change_percentage.toFixed(1)}%`
			}));
		} catch (err) {
			error = err.message;
			console.error('Failed to load KPI metrics:', err);
		} finally {
			loading = false;
		}
	}

	// 値のフォーマット
	function formatValue(value, unit) {
		if (unit === 'M') {
			return `¥${value.toFixed(1)}M`;
		} else if (unit === '%') {
			return `${value.toFixed(1)}%`;
		} else {
			return value.toLocaleString();
		}
	}

	// 初回ロードと定期更新
	onMount(() => {
		loadMetrics();

		// 定期的にデータを更新
		const interval = setInterval(loadMetrics, config.refreshInterval.kpiMetrics);

		return () => clearInterval(interval);
	});

	// periodが変更されたらデータを再取得
	$effect(() => {
		loadMetrics();
	});

	function getSparklinePath(data) {
		const width = 80;
		const height = 32;
		const max = Math.max(...data);
		const min = Math.min(...data);
		const range = max - min;

		const points = data.map((value, index) => {
			const x = (index / (data.length - 1)) * width;
			const y = height - ((value - min) / range) * height;
			return `${x},${y}`;
		});

		return `M ${points.join(' L ')}`;
	}
</script>

{#if loading}
	<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
		{#each Array(4) as _}
			<div class="bg-base-100 border-base-300 rounded-lg border p-4">
				<div class="animate-pulse">
					<div class="bg-base-300 mb-3 h-4 w-3/4 rounded"></div>
					<div class="bg-base-300 mb-2 h-8 w-1/2 rounded"></div>
					<div class="bg-base-300 h-8 rounded"></div>
				</div>
			</div>
		{/each}
	</div>
{:else if error}
	<div class="alert alert-error">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6 shrink-0 stroke-current"
			fill="none"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
		<span>データの取得に失敗しました: {error}</span>
	</div>
{:else}
	<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
		{#each metrics as metric}
			<div
				class="bg-base-100 border-base-300 rounded-lg border p-4 transition-shadow hover:shadow-md"
			>
				<div class="mb-2 flex items-start justify-between">
					<span class="text-base-content/60 text-sm">{metric.label}</span>
					<span
						class="rounded-full px-2 py-0.5 text-xs {metric.trend === 'up'
							? 'bg-success/20 text-success'
							: 'bg-error/20 text-error'}"
					>
						{metric.displayChange}
					</span>
				</div>
				<div class="mb-2 text-2xl font-bold">{metric.displayValue}</div>
				<svg class="h-8 w-full" viewBox="0 0 80 32" preserveAspectRatio="none">
					<path
						d={getSparklinePath(metric.sparkline)}
						fill="none"
						stroke={metric.trend === 'up' ? 'rgb(34 197 94)' : 'rgb(239 68 68)'}
						stroke-width="2"
					/>
					<path
						d={getSparklinePath(metric.sparkline) + ` L 80,32 L 0,32 Z`}
						fill={metric.trend === 'up' ? 'rgba(34 197 94 / 0.1)' : 'rgba(239 68 68 / 0.1)'}
					/>
				</svg>
			</div>
		{/each}
	</div>
{/if}
