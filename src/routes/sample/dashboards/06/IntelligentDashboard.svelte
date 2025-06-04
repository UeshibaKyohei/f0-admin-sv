<script>
	import { onMount } from 'svelte';
	import { config, uiConfig } from './config.js';

	let { systemStatus = {}, aiInsights = [], aiSuggestions = [] } = $props();

	// ダッシュボードの状態
	let selectedPeriod = $state('today');
	let selectedMetric = $state('all');
	let showAllInsights = $state(false);

	// アニメーションの状態
	let animatedValues = $state({
		revenue: 0,
		efficiency: 0,
		satisfaction: 0,
		automation: 0
	});

	// KPIメトリクス（デモ用）
	let kpiMetrics = $state({
		revenue: { value: 15234000, change: 12.5, target: 16000000 },
		efficiency: { value: 87.3, change: 5.2, target: 90 },
		satisfaction: { value: 4.6, change: 0.3, target: 4.5 },
		automation: { value: 72, change: 8.1, target: 80 }
	});

	// トレンドデータ（デモ用）
	let trendData = $state([
		{ time: '00:00', revenue: 1200000, users: 3200, efficiency: 82 },
		{ time: '04:00', revenue: 980000, users: 2100, efficiency: 78 },
		{ time: '08:00', revenue: 2100000, users: 5400, efficiency: 85 },
		{ time: '12:00', revenue: 3200000, users: 8900, efficiency: 89 },
		{ time: '16:00', revenue: 2800000, users: 7600, efficiency: 86 },
		{ time: '20:00', revenue: 2400000, users: 6200, efficiency: 84 },
		{ time: '24:00', revenue: 1800000, users: 4100, efficiency: 80 }
	]);

	onMount(() => {
		animateValues();
	});

	function animateValues() {
		// KPI値をアニメーション
		const duration = 1000;
		const steps = 60;
		const interval = duration / steps;

		let currentStep = 0;
		const timer = setInterval(() => {
			currentStep++;
			const progress = currentStep / steps;

			animatedValues = {
				revenue: Math.floor(kpiMetrics.revenue.value * progress),
				efficiency: Number((kpiMetrics.efficiency.value * progress).toFixed(1)),
				satisfaction: Number((kpiMetrics.satisfaction.value * progress).toFixed(1)),
				automation: Math.floor(kpiMetrics.automation.value * progress)
			};

			if (currentStep >= steps) {
				clearInterval(timer);
			}
		}, interval);
	}

	function getSystemStatusColor(status) {
		return status === 'connected'
			? 'text-success'
			: status === 'warning'
				? 'text-warning'
				: 'text-error';
	}

	function getChangeIcon(change) {
		return change > 0 ? '↑' : change < 0 ? '↓' : '→';
	}

	function getChangeColor(change) {
		return change > 0 ? 'text-success' : change < 0 ? 'text-error' : 'opacity-70';
	}

	function getInsightIcon(category) {
		const icons = {
			OPERATIONAL: '⚙️',
			FINANCIAL: '💰',
			CUSTOMER: '😊',
			EMPLOYEE: '👨‍💼',
			STRATEGIC: '🎯'
		};
		return icons[category] || '💡';
	}

	function getInsightPriorityColor(priority) {
		return priority === 1 ? 'border-error' : priority === 2 ? 'border-warning' : 'border-info';
	}

	// 表示するインサイトを制限
	const displayedInsights = $derived(showAllInsights ? aiInsights : aiInsights.slice(0, 3));

	// グラフの最大値を計算
	const maxRevenue = $derived(Math.max(...trendData.map((d) => d.revenue)));
</script>

<div class="space-y-6">
	<!-- KPIカード -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
		<!-- 収益 -->
		<div class="card bg-base-200 shadow-xl">
			<div class="card-body">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm opacity-70">総収益</p>
						<p class="text-3xl font-bold">
							¥{animatedValues.revenue.toLocaleString()}
						</p>
						<div class="mt-2 flex items-center gap-2">
							<span class="{getChangeColor(kpiMetrics.revenue.change)} text-sm font-medium">
								{getChangeIcon(kpiMetrics.revenue.change)}
								{Math.abs(kpiMetrics.revenue.change)}%
							</span>
							<span class="text-xs opacity-70">前日比</span>
						</div>
					</div>
					<div
						class="radial-progress text-primary"
						style="--value:{(animatedValues.revenue / kpiMetrics.revenue.target) *
							100}; --size:4rem; --thickness:4px;"
					>
						<span class="text-xs"
							>{Math.round((animatedValues.revenue / kpiMetrics.revenue.target) * 100)}%</span
						>
					</div>
				</div>
				<progress
					class="progress progress-primary mt-4 w-full"
					value={animatedValues.revenue}
					max={kpiMetrics.revenue.target}
				></progress>
				<p class="mt-1 text-xs opacity-70">目標: ¥{kpiMetrics.revenue.target.toLocaleString()}</p>
			</div>
		</div>

		<!-- 効率性 -->
		<div class="card bg-base-200 shadow-xl">
			<div class="card-body">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm opacity-70">運用効率</p>
						<p class="text-3xl font-bold">
							{animatedValues.efficiency}%
						</p>
						<div class="mt-2 flex items-center gap-2">
							<span class="{getChangeColor(kpiMetrics.efficiency.change)} text-sm font-medium">
								{getChangeIcon(kpiMetrics.efficiency.change)}
								{Math.abs(kpiMetrics.efficiency.change)}%
							</span>
							<span class="text-xs opacity-70">前週比</span>
						</div>
					</div>
					<div
						class="radial-progress text-success"
						style="--value:{animatedValues.efficiency}; --size:4rem; --thickness:4px;"
					>
						<span class="text-xs">{animatedValues.efficiency}%</span>
					</div>
				</div>
				<div class="mt-4 space-y-1">
					<div class="flex justify-between text-xs">
						<span class="opacity-70">CPU使用率</span>
						<span>42%</span>
					</div>
					<div class="flex justify-between text-xs">
						<span class="opacity-70">応答時間</span>
						<span>124ms</span>
					</div>
				</div>
			</div>
		</div>

		<!-- 顧客満足度 -->
		<div class="card bg-base-200 shadow-xl">
			<div class="card-body">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm opacity-70">顧客満足度</p>
						<p class="text-3xl font-bold">
							{animatedValues.satisfaction}/5.0
						</p>
						<div class="mt-2 flex items-center gap-2">
							<span class="{getChangeColor(kpiMetrics.satisfaction.change)} text-sm font-medium">
								{getChangeIcon(kpiMetrics.satisfaction.change)}
								{Math.abs(kpiMetrics.satisfaction.change)}
							</span>
							<span class="text-xs opacity-70">前月比</span>
						</div>
					</div>
					<div class="flex flex-col items-center">
						<div class="rating rating-sm">
							{#each Array(5) as _, i}
								<input
									type="radio"
									name="rating-1"
									class="mask mask-star-2 bg-orange-400"
									checked={i < Math.round(animatedValues.satisfaction)}
									disabled
								/>
							{/each}
						</div>
						<span class="mt-1 text-xs opacity-70">12,456 レビュー</span>
					</div>
				</div>
				<div class="mt-4">
					<div class="mb-1 text-xs opacity-70">感情分析</div>
					<div class="flex gap-2">
						<span class="badge badge-sm badge-success">😊 78%</span>
						<span class="badge badge-sm badge-warning">😐 18%</span>
						<span class="badge badge-sm badge-error">😞 4%</span>
					</div>
				</div>
			</div>
		</div>

		<!-- 自動化率 -->
		<div class="card bg-base-200 shadow-xl">
			<div class="card-body">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm opacity-70">自動化率</p>
						<p class="text-3xl font-bold">
							{animatedValues.automation}%
						</p>
						<div class="mt-2 flex items-center gap-2">
							<span class="{getChangeColor(kpiMetrics.automation.change)} text-sm font-medium">
								{getChangeIcon(kpiMetrics.automation.change)}
								{Math.abs(kpiMetrics.automation.change)}%
							</span>
							<span class="text-xs opacity-70">前四半期比</span>
						</div>
					</div>
					<div class="flex flex-col items-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="text-accent h-12 w-12"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 3.95-.236.478-.497 1.01-.787 1.524m-1.038 1.175L7.961 19.21a2.652 2.652 0 01-3.712-3.712l5.753-5.754"
							/>
						</svg>
						<div class="mt-2 text-xs opacity-70">
							<span class="text-accent font-bold">324</span> プロセス自動化
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- システム統合ステータスとトレンドグラフ -->
	<div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
		<!-- システム統合ステータス -->
		<div class="card bg-base-200 shadow-xl">
			<div class="card-body">
				<h3 class="card-title mb-4">システム統合ステータス</h3>
				<div class="space-y-3">
					{#each Object.entries(systemStatus) as [key, system]}
						<div class="bg-base-300 flex items-center justify-between rounded-lg p-3">
							<div class="flex items-center gap-3">
								<span class="text-2xl">{system.icon}</span>
								<div>
									<p class="font-medium">{system.name}</p>
									<p class="text-xs opacity-70">{key.toUpperCase()}</p>
								</div>
							</div>
							<div class="flex items-center gap-2">
								<div class="text-right">
									<p class="text-xs opacity-70">レイテンシ</p>
									<p
										class="text-sm font-medium {system.latency > 100
											? 'text-warning'
											: 'text-success'}"
									>
										{system.latency}ms
									</p>
								</div>
								<div
									class="h-2 w-2 rounded-full {getSystemStatusColor(system.status)} animate-pulse"
								></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- リアルタイムトレンド -->
		<div class="card bg-base-200 shadow-xl xl:col-span-2">
			<div class="card-body">
				<div class="mb-4 flex items-center justify-between">
					<h3 class="card-title">リアルタイムトレンド</h3>
					<select class="select select-sm bg-base-300">
						<option value="today">本日</option>
						<option value="week">今週</option>
						<option value="month">今月</option>
					</select>
				</div>

				<!-- 簡易グラフ -->
				<div class="relative h-64">
					<svg class="h-full w-full">
						<!-- グリッド線 -->
						{#each Array(5) as _, i}
							<line
								x1="0"
								y1={i * 64}
								x2="100%"
								y2={i * 64}
								stroke="rgba(156, 163, 175, 0.1)"
								stroke-width="1"
							/>
						{/each}

						<!-- 収益トレンドライン -->
						<polyline
							fill="none"
							stroke="url(#gradient)"
							stroke-width="2"
							points={trendData
								.map(
									(d, i) =>
										`${i * (100 / (trendData.length - 1))}%,${256 - (d.revenue / maxRevenue) * 256}`
								)
								.join(' ')}
						/>

						<!-- グラデーション定義 -->
						<defs>
							<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
								<stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
								<stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
							</linearGradient>
						</defs>
					</svg>

					<!-- 軸ラベル -->
					<div class="absolute right-0 bottom-0 left-0 flex justify-between text-xs opacity-70">
						{#each trendData as data}
							<span>{data.time}</span>
						{/each}
					</div>
				</div>

				<!-- 凡例 -->
				<div class="mt-4 flex gap-6 text-sm">
					<div class="flex items-center gap-2">
						<div class="from-primary to-secondary h-3 w-3 rounded bg-gradient-to-r"></div>
						<span class="opacity-70">収益</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="bg-info h-3 w-3 rounded"></div>
						<span class="opacity-70">ユーザー数</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="bg-success h-3 w-3 rounded"></div>
						<span class="opacity-70">効率性</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- AIインサイトとサジェスション -->
	<div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
		<!-- AIインサイト -->
		<div class="card bg-base-200 shadow-xl">
			<div class="card-body">
				<div class="mb-4 flex items-center justify-between">
					<h3 class="card-title">
						<span class="mr-2">🧠</span>
						AIインサイト
					</h3>
					{#if aiInsights.length > 3}
						<button
							class="btn btn-xs btn-ghost"
							onclick={() => (showAllInsights = !showAllInsights)}
						>
							{showAllInsights ? '閉じる' : `他 ${aiInsights.length - 3} 件`}
						</button>
					{/if}
				</div>

				<div class="space-y-3">
					{#each displayedInsights as insight}
						<div class="alert border-l-4 p-3 {getInsightPriorityColor(insight.priority)}">
							<div class="flex items-start gap-3">
								<span class="text-2xl">{getInsightIcon(insight.category)}</span>
								<div class="flex-1">
									<p class="text-sm font-medium">{insight.title}</p>
									<p class="mt-1 text-xs opacity-70">{insight.description}</p>
									{#if insight.actionable}
										<button class="btn btn-xs btn-primary mt-2"> アクションを実行 </button>
									{/if}
								</div>
							</div>
						</div>
					{/each}

					{#if aiInsights.length === 0}
						<p class="py-8 text-center opacity-70">現在、新しいインサイトはありません</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- AI提案アクション -->
		<div class="card bg-base-200 shadow-xl">
			<div class="card-body">
				<h3 class="card-title mb-4">
					<span class="mr-2">💡</span>
					推奨アクション
				</h3>

				<div class="space-y-3">
					{#each aiSuggestions as suggestion}
						<div
							class="bg-base-300 hover:bg-base-100 cursor-pointer rounded-lg p-4 transition-colors"
						>
							<div class="mb-2 flex items-center justify-between">
								<span
									class="badge badge-sm {suggestion.impact === 'high'
										? 'badge-error'
										: suggestion.impact === 'medium'
											? 'badge-warning'
											: 'badge-info'}"
								>
									{suggestion.impact === 'high'
										? '高'
										: suggestion.impact === 'medium'
											? '中'
											: '低'}インパクト
								</span>
								<span class="text-xs opacity-70">
									推定効果: {suggestion.estimatedValue}
								</span>
							</div>
							<p class="mb-1 text-sm font-medium">{suggestion.title}</p>
							<p class="text-xs opacity-70">{suggestion.description}</p>
							<div class="mt-3 flex gap-2">
								<button class="btn btn-xs btn-primary">実行</button>
								<button class="btn btn-xs btn-ghost">詳細</button>
							</div>
						</div>
					{/each}

					{#if aiSuggestions.length === 0}
						<div class="py-8 text-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="mx-auto mb-2 h-12 w-12 opacity-50"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
								/>
							</svg>
							<p class="opacity-70">AIが最適化提案を生成中...</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
