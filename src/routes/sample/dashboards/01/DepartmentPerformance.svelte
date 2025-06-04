<script>
	let departments = $state([
		{ name: '営業部', performance: 92, target: 85, trend: 'up' },
		{ name: '開発部', performance: 78, target: 80, trend: 'down' },
		{ name: 'マーケティング', performance: 85, target: 75, trend: 'up' },
		{ name: 'カスタマーサポート', performance: 95, target: 90, trend: 'up' },
		{ name: '管理部', performance: 88, target: 85, trend: 'stable' }
	]);

	function getPerformanceColor(performance, target) {
		if (performance >= target + 5) return 'text-success';
		if (performance >= target) return 'text-info';
		if (performance >= target - 5) return 'text-warning';
		return 'text-error';
	}

	function getProgressColor(performance, target) {
		if (performance >= target + 5) return 'progress-success';
		if (performance >= target) return 'progress-info';
		if (performance >= target - 5) return 'progress-warning';
		return 'progress-error';
	}

	function getTrendIcon(trend) {
		if (trend === 'up') return '↗';
		if (trend === 'down') return '↘';
		return '→';
	}
</script>

<div class="bg-base-100 border-base-300 h-full rounded-lg border">
	<div class="border-base-200 border-b p-4 pb-3">
		<h3 class="text-base font-semibold">部門別パフォーマンス</h3>
	</div>

	<div class="space-y-3 p-4">
		{#each departments as dept}
			<div class="space-y-1">
				<div class="flex items-center justify-between text-sm">
					<span class="font-medium">{dept.name}</span>
					<div class="flex items-center gap-2">
						<span class="{getPerformanceColor(dept.performance, dept.target)} font-semibold">
							{dept.performance}%
						</span>
						<span class="text-base-content/40 text-xs">
							{getTrendIcon(dept.trend)}
						</span>
					</div>
				</div>
				<div class="relative">
					<progress
						class="progress {getProgressColor(dept.performance, dept.target)} h-2"
						value={dept.performance}
						max="100"
					></progress>
					<div
						class="bg-base-content/40 absolute top-0 h-2 w-0.5"
						style="left: {dept.target}%"
					></div>
				</div>
				<div class="text-base-content/50 flex justify-between text-xs">
					<span>目標: {dept.target}%</span>
					<span
						>{dept.performance >= dept.target
							? '達成'
							: `あと${dept.target - dept.performance}%`}</span
					>
				</div>
			</div>
		{/each}
	</div>
</div>
