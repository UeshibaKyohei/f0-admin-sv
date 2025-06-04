<script>
	let { period = 'monthly' } = $props();

	const financialData = $derived.by(() => {
		const baseData = [
			{ category: '売上高', icon: '💰', color: 'primary' },
			{ category: '売上原価', icon: '📦', color: 'warning' },
			{ category: '販管費', icon: '💼', color: 'info' },
			{ category: '営業利益', icon: '📈', color: 'success' },
			{ category: '経常利益', icon: '💎', color: 'success' }
		];

		if (period === 'daily') {
			return baseData.map((item, i) => ({
				...item,
				actual: [42.5, 25.5, 8.5, 8.5, 8.2][i],
				budget: [40.0, 24.0, 9.0, 7.0, 6.8][i],
				variance: [6.3, 6.3, -5.6, 21.4, 20.6][i]
			}));
		} else if (period === 'monthly') {
			return baseData.map((item, i) => ({
				...item,
				actual: [125.0, 75.0, 25.0, 25.0, 24.0][i],
				budget: [118.0, 70.8, 26.0, 21.2, 20.0][i],
				variance: [5.9, 5.9, -3.8, 17.9, 20.0][i]
			}));
		} else {
			return baseData.map((item, i) => ({
				...item,
				actual: [365.0, 219.0, 73.0, 73.0, 70.0][i],
				budget: [350.0, 210.0, 77.0, 63.0, 60.0][i],
				variance: [4.3, 4.3, -5.2, 15.9, 16.7][i]
			}));
		}
	});

	function getVarianceColor(variance) {
		// 売上原価と販管費は低い方が良いので、マイナスが success
		if (variance < -5) return 'text-success';
		if (variance < 0) return 'text-success';
		if (variance > 5) return 'text-error';
		return 'text-warning';
	}

	function getVarianceColorForRevenue(variance) {
		if (variance > 10) return 'text-success';
		if (variance > 0) return 'text-info';
		if (variance > -5) return 'text-warning';
		return 'text-error';
	}
</script>

<div class="bg-base-100 border-base-300 rounded-lg border">
	<div class="border-base-200 border-b p-4 pb-3">
		<div class="flex items-center justify-between">
			<h3 class="text-base font-semibold">財務サマリー</h3>
			<span class="text-base-content/60 text-xs"> 単位: 千万円 </span>
		</div>
	</div>

	<div class="overflow-x-auto">
		<table class="table-sm table">
			<thead>
				<tr class="border-base-200 border-b">
					<th class="text-xs font-medium">項目</th>
					<th class="text-right text-xs font-medium">実績</th>
					<th class="text-right text-xs font-medium">予算</th>
					<th class="text-right text-xs font-medium">差異</th>
					<th class="text-center text-xs font-medium">進捗</th>
				</tr>
			</thead>
			<tbody>
				{#each financialData as item}
					<tr class="hover:bg-base-200/30">
						<td class="py-2">
							<div class="flex items-center gap-2">
								<span class="text-base">{item.icon}</span>
								<span class="text-sm font-medium">{item.category}</span>
							</div>
						</td>
						<td class="text-right font-mono text-sm font-semibold">
							¥{item.actual.toFixed(1)}
						</td>
						<td class="text-base-content/60 text-right font-mono text-sm">
							¥{item.budget.toFixed(1)}
						</td>
						<td class="text-right">
							<span
								class="text-sm font-semibold {item.category.includes('売上高') ||
								item.category.includes('利益')
									? getVarianceColorForRevenue(item.variance)
									: getVarianceColor(item.variance)}"
							>
								{item.variance > 0 ? '+' : ''}{item.variance.toFixed(1)}%
							</span>
						</td>
						<td class="text-center">
							<div class="mx-auto w-16">
								<progress
									class="progress progress-{item.color} h-1.5"
									value={Math.min((item.actual / item.budget) * 100, 100)}
									max="100"
								></progress>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
