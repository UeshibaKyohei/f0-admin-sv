<script>
	let { segment = 'all', dateRange = '30days' } = $props();

	let heatmapData = $state([
		{
			feature: 'ダッシュボード',
			daily_users: 1250,
			weekly_users: 2100,
			engagement_score: 85,
			trend: 'up'
		},
		{
			feature: 'レポート機能',
			daily_users: 890,
			weekly_users: 1650,
			engagement_score: 72,
			trend: 'stable'
		},
		{
			feature: 'データエクスポート',
			daily_users: 340,
			weekly_users: 980,
			engagement_score: 58,
			trend: 'up'
		},
		{
			feature: 'チーム管理',
			daily_users: 560,
			weekly_users: 1200,
			engagement_score: 67,
			trend: 'down'
		},
		{
			feature: 'API機能',
			daily_users: 180,
			weekly_users: 420,
			engagement_score: 45,
			trend: 'stable'
		},
		{
			feature: 'モバイルアプリ',
			daily_users: 720,
			weekly_users: 1350,
			engagement_score: 78,
			trend: 'up'
		},
		{
			feature: 'カスタム設定',
			daily_users: 290,
			weekly_users: 680,
			engagement_score: 52,
			trend: 'down'
		},
		{
			feature: 'サポートチャット',
			daily_users: 120,
			weekly_users: 380,
			engagement_score: 89,
			trend: 'up'
		}
	]);

	let timeOfDayData = $state([
		{ hour: '00', usage: 12 },
		{ hour: '01', usage: 8 },
		{ hour: '02', usage: 5 },
		{ hour: '03', usage: 3 },
		{ hour: '04', usage: 4 },
		{ hour: '05', usage: 8 },
		{ hour: '06', usage: 15 },
		{ hour: '07', usage: 25 },
		{ hour: '08', usage: 45 },
		{ hour: '09', usage: 78 },
		{ hour: '10', usage: 89 },
		{ hour: '11', usage: 92 },
		{ hour: '12', usage: 65 },
		{ hour: '13', usage: 85 },
		{ hour: '14', usage: 95 },
		{ hour: '15', usage: 88 },
		{ hour: '16', usage: 82 },
		{ hour: '17', usage: 75 },
		{ hour: '18', usage: 45 },
		{ hour: '19', usage: 35 },
		{ hour: '20', usage: 28 },
		{ hour: '21', usage: 22 },
		{ hour: '22', usage: 18 },
		{ hour: '23', usage: 15 }
	]);

	let weeklyPattern = $state([
		{ day: '月', morning: 85, afternoon: 92, evening: 45 },
		{ day: '火', morning: 88, afternoon: 95, evening: 48 },
		{ day: '水', morning: 90, afternoon: 96, evening: 52 },
		{ day: '木', morning: 87, afternoon: 93, evening: 50 },
		{ day: '金', morning: 89, afternoon: 89, evening: 55 },
		{ day: '土', morning: 35, afternoon: 42, evening: 38 },
		{ day: '日', morning: 28, afternoon: 35, evening: 32 }
	]);

	let userSegmentEngagement = $state([
		{ segment: 'パワーユーザー', percentage: 15, engagement: 95, color: 'success' },
		{ segment: 'アクティブユーザー', percentage: 35, engagement: 78, color: 'info' },
		{ segment: '通常ユーザー', percentage: 40, engagement: 52, color: 'warning' },
		{ segment: '非アクティブユーザー', percentage: 10, engagement: 25, color: 'error' }
	]);

	// セグメントや期間でデータを更新
	$effect(() => {
		updateEngagementData(segment, dateRange);
	});

	function updateEngagementData(segment, dateRange) {
		// 実際のアプリケーションではAPIを呼び出す
		// ここではデモ用に固定値を使用
	}

	function getEngagementColor(score) {
		if (score >= 80) return 'success';
		if (score >= 60) return 'info';
		if (score >= 40) return 'warning';
		return 'error';
	}

	function getEngagementLevel(score) {
		if (score >= 80) return '高';
		if (score >= 60) return '中';
		if (score >= 40) return '低';
		return '極低';
	}

	function getTrendIcon(trend) {
		const icons = {
			up: 'M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18',
			down: 'M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3',
			stable: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5'
		};
		return icons[trend];
	}

	function getUsageIntensity(value, max = 100) {
		const intensity = value / max;
		if (intensity >= 0.8) return 'bg-success text-success-content';
		if (intensity >= 0.6) return 'bg-info text-info-content';
		if (intensity >= 0.4) return 'bg-warning text-warning-content';
		if (intensity >= 0.2) return 'bg-error/50 text-error-content';
		return 'bg-base-300 text-base-content';
	}
</script>

<div class="card bg-base-100 shadow-sm">
	<div class="card-body">
		<div class="mb-6 flex items-center justify-between">
			<h3 class="text-lg font-semibold">エンゲージメント分析</h3>
			<div class="flex items-center gap-2">
				<div class="badge badge-sm bg-success/20 text-success">高エンゲージメント</div>
				<div class="badge badge-sm bg-warning/20 text-warning">要改善</div>
			</div>
		</div>

		<!-- 機能別エンゲージメント -->
		<div class="mb-8">
			<h4 class="mb-4 font-medium">機能別エンゲージメント</h4>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				{#each heatmapData as feature}
					<div class="card bg-base-200/30 border-base-300/50 border">
						<div class="card-body p-4">
							<div class="mb-3 flex items-start justify-between">
								<div>
									<h5 class="text-sm font-medium">{feature.feature}</h5>
									<div class="mt-1 flex items-center gap-2">
										<div
											class="badge badge-{getEngagementColor(feature.engagement_score)} badge-sm"
										>
											{feature.engagement_score}pt
										</div>
										<div class="text-base-content/60 text-xs">
											エンゲージメント: {getEngagementLevel(feature.engagement_score)}
										</div>
									</div>
								</div>
								<div class="flex items-center gap-1">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="2"
										stroke="currentColor"
										class="h-4 w-4"
										class:text-success={feature.trend === 'up'}
										class:text-error={feature.trend === 'down'}
										class:text-warning={feature.trend === 'stable'}
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d={getTrendIcon(feature.trend)}
										/>
									</svg>
								</div>
							</div>

							<div class="space-y-2">
								<div class="flex justify-between text-xs">
									<span>日次アクティブユーザー</span>
									<span class="font-medium">{feature.daily_users.toLocaleString()}</span>
								</div>
								<div class="bg-base-300 h-1.5 w-full rounded-full">
									<div
										class="bg-{getEngagementColor(
											feature.engagement_score
										)} h-1.5 rounded-full transition-all duration-500"
										style="width: {(feature.daily_users / 1500) * 100}%"
									></div>
								</div>

								<div class="flex justify-between text-xs">
									<span>週次アクティブユーザー</span>
									<span class="font-medium">{feature.weekly_users.toLocaleString()}</span>
								</div>
								<div class="bg-base-300 h-1.5 w-full rounded-full">
									<div
										class="bg-{getEngagementColor(
											feature.engagement_score
										)}/70 h-1.5 rounded-full transition-all duration-500"
										style="width: {(feature.weekly_users / 2500) * 100}%"
									></div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- 時間別ヒートマップ -->
		<div class="mb-8">
			<h4 class="mb-4 font-medium">時間別利用パターン</h4>
			<div class="bg-base-200/30 rounded-lg p-4">
				<div class="mb-2 grid grid-cols-12 gap-1">
					{#each timeOfDayData as hour}
						<div
							class="flex aspect-square cursor-pointer items-center justify-center rounded text-xs font-medium transition-all duration-200 hover:scale-110 {getUsageIntensity(
								hour.usage
							)}"
							title="{hour.hour}時: {hour.usage}%の利用率"
						>
							{hour.hour}
						</div>
					{/each}
				</div>
				<div class="text-base-content/60 flex justify-between text-xs">
					<span>0時</span>
					<span>6時</span>
					<span>12時</span>
					<span>18時</span>
					<span>23時</span>
				</div>
			</div>
		</div>

		<!-- 曜日別パターン -->
		<div class="mb-8">
			<h4 class="mb-4 font-medium">曜日別利用パターン</h4>
			<div class="overflow-x-auto">
				<table class="table-sm table">
					<thead>
						<tr>
							<th>曜日</th>
							<th>朝（8-12時）</th>
							<th>昼（12-17時）</th>
							<th>夜（17-22時）</th>
							<th>総合評価</th>
						</tr>
					</thead>
					<tbody>
						{#each weeklyPattern as day}
							{@const avgScore = Math.round((day.morning + day.afternoon + day.evening) / 3)}
							<tr class="hover">
								<td class="font-medium">{day.day}曜日</td>
								<td>
									<div class="flex items-center gap-2">
										<div class="bg-base-300 h-2 w-16 rounded-full">
											<div
												class="h-2 {getUsageIntensity(
													day.morning
												)} rounded-full transition-all duration-500"
												style="width: {day.morning}%"
											></div>
										</div>
										<span class="text-xs">{day.morning}%</span>
									</div>
								</td>
								<td>
									<div class="flex items-center gap-2">
										<div class="bg-base-300 h-2 w-16 rounded-full">
											<div
												class="h-2 {getUsageIntensity(
													day.afternoon
												)} rounded-full transition-all duration-500"
												style="width: {day.afternoon}%"
											></div>
										</div>
										<span class="text-xs">{day.afternoon}%</span>
									</div>
								</td>
								<td>
									<div class="flex items-center gap-2">
										<div class="bg-base-300 h-2 w-16 rounded-full">
											<div
												class="h-2 {getUsageIntensity(
													day.evening
												)} rounded-full transition-all duration-500"
												style="width: {day.evening}%"
											></div>
										</div>
										<span class="text-xs">{day.evening}%</span>
									</div>
								</td>
								<td>
									<div class="badge badge-{getEngagementColor(avgScore)} badge-sm">
										{avgScore}%
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- ユーザーセグメント別エンゲージメント -->
		<div>
			<h4 class="mb-4 font-medium">ユーザーセグメント別エンゲージメント</h4>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				{#each userSegmentEngagement as userSegment}
					<div
						class="stat bg-gradient-to-br from-{userSegment.color}/10 to-{userSegment.color}/5 rounded-lg border border-{userSegment.color}/20"
					>
						<div class="stat-figure">
							<div
								class="radial-progress text-{userSegment.color} text-sm"
								style="--value:{userSegment.engagement}; --size:3rem; --thickness:4px;"
							>
								{userSegment.engagement}%
							</div>
						</div>
						<div class="stat-title text-xs">{userSegment.segment}</div>
						<div class="stat-value text-lg text-{userSegment.color}">{userSegment.percentage}%</div>
						<div class="stat-desc">全ユーザーの{userSegment.percentage}%</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- エンゲージメント改善提案 -->
		<div class="bg-info/10 border-info/20 mt-8 rounded-lg border p-4">
			<h4 class="text-info mb-2 font-medium">📈 エンゲージメント改善提案</h4>
			<ul class="text-base-content/80 space-y-1 text-sm">
				<li>• API機能の利用率が低いため、チュートリアルやドキュメントの改善を検討</li>
				<li>• 土日の利用率向上のため、モバイルアプリの機能強化を推奨</li>
				<li>• カスタム設定機能の認知度向上のため、UI上での案内を強化</li>
				<li>• 非アクティブユーザー向けのリエンゲージメント施策を実施</li>
			</ul>
		</div>
	</div>
</div>
