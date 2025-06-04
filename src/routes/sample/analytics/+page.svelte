<script lang="ts">
	import StatCard from '$lib/components/StatCard.svelte';

	// 分析データ
	const overviewStats = $state([
		{ title: '総売上', value: '¥12.8M', change: '+15.2%', trend: 'up', iconType: 'chart-line' },
		{ title: '注文数', value: '3,842', change: '+7.5%', trend: 'up', iconType: 'shopping-cart' },
		{ title: '平均注文額', value: '¥3,332', change: '+6.8%', trend: 'up', iconType: '' },
		{ title: '顧客数', value: '1,234', change: '+12.3%', trend: 'up', iconType: 'users' }
	]);

	// 月間売上データ
	const monthlySales = $state({
		labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
		datasets: [
			{ name: '今年', data: [4.2, 5.1, 4.8, 6.2, 7.1, 8.4] },
			{ name: '昨年', data: [3.8, 4.2, 4.1, 5.3, 6.2, 7.1] }
		]
	});

	// 地域別売上データ
	const regionSales = $state([
		{ region: '関東', value: 4.8, percentage: 38 },
		{ region: '関西', value: 3.2, percentage: 25 },
		{ region: '中部', value: 1.9, percentage: 15 },
		{ region: '九州', value: 1.5, percentage: 12 },
		{ region: '東北', value: 0.8, percentage: 6 },
		{ region: 'その他', value: 0.6, percentage: 4 }
	]);

	// 商品カテゴリ別売上データ
	const categorySales = $state([
		{ category: '電子機器', value: 3.6, percentage: 28 },
		{ category: 'アパレル', value: 2.9, percentage: 23 },
		{ category: '家具', value: 2.2, percentage: 17 },
		{ category: '食品', value: 1.8, percentage: 14 },
		{ category: '書籍', value: 1.3, percentage: 10 },
		{ category: 'その他', value: 1.0, percentage: 8 }
	]);

	// 顧客セグメントデータ
	const customerSegments = $state([
		{ name: '新規顧客', value: 35, color: 'primary' },
		{ name: 'リピーター', value: 45, color: 'secondary' },
		{ name: 'VIP顧客', value: 20, color: 'accent' }
	]);

	// 時間帯別アクセス数
	const hourlyTraffic = $state({
		labels: ['0時', '3時', '6時', '9時', '12時', '15時', '18時', '21時'],
		data: [120, 80, 60, 180, 310, 290, 340, 230]
	});

	// デバイス別アクセス数
	const deviceTraffic = $state([
		{ device: 'モバイル', percentage: 62, color: 'primary' },
		{ device: 'デスクトップ', percentage: 28, color: 'secondary' },
		{ device: 'タブレット', percentage: 10, color: 'accent' }
	]);

	// 期間選択
	let selectedPeriod = $state('6ヶ月');
	const periods = ['7日間', '30日間', '3ヶ月', '6ヶ月', '1年間'];

	// AIインサイト（ダミーデータ）
	const aiInsights = $state([
		'先月と比較して、モバイルからのアクセスが15%増加しています。モバイル向けの最適化を検討してください。',
		'平日の15時〜18時にアクセスが集中しています。この時間帯のプロモーションが効果的です。',
		'関東地域の売上が前年同期比で23%増加しています。マーケティング施策の効果が表れています。',
		'電子機器カテゴリの平均滞在時間が他カテゴリより30%長くなっています。'
	]);

	// 日付フォーマット
	function formatCurrency(value) {
		return new Intl.NumberFormat('ja-JP', {
			style: 'currency',
			currency: 'JPY',
			maximumFractionDigits: 0
		}).format(value * 1000000);
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<h1 class="text-2xl font-medium">分析ダッシュボード</h1>
		<div class="flex items-center gap-2">
			<span class="text-base-content/70 text-sm">期間:</span>
			<select class="select select-bordered select-sm" bind:value={selectedPeriod}>
				{#each periods as period}
					<option value={period}>{period}</option>
				{/each}
			</select>
			<button class="btn btn-sm btn-outline">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mr-1 h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
					/>
				</svg>
				エクスポート
			</button>
		</div>
	</div>

	<!-- 概要統計 -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
		{#each overviewStats as stat}
			<StatCard
				title={stat.title}
				value={stat.value}
				change={stat.change}
				trend={stat.trend}
				iconType={stat.iconType}
			/>
		{/each}
	</div>

	<!-- メインチャートとAIインサイト -->
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
		<!-- 売上推移チャート -->
		<div class="card bg-base-100 shadow-sm lg:col-span-2">
			<div class="card-body">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="card-title">月間売上推移</h2>
					<div class="dropdown dropdown-end">
						<div role="button" class="btn btn-ghost btn-sm">
							<span>{selectedPeriod}</span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="ml-1 h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</div>
					</div>
				</div>
				<div class="h-64 w-full">
					<!-- チャートの代わりにダミー表示 -->
					<div class="bg-base-200 rounded-box flex h-full w-full items-center justify-center">
						<div class="text-center">
							<p class="text-base-content/60">ここに実際のチャートが表示されます</p>
							<div class="mt-2 flex justify-center gap-6">
								{#each monthlySales.datasets as dataset, i}
									<div class="flex items-center gap-2">
										<div
											class={`h-3 w-3 rounded-full ${i === 0 ? 'bg-primary' : 'bg-secondary'}`}
										></div>
										<span class="text-sm">{dataset.name}</span>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
				<div class="mt-4 grid grid-cols-6 gap-2">
					{#each monthlySales.labels as label, i}
						<div class="text-center">
							<div class="text-sm font-medium">{label}</div>
							<div class="mt-1 flex flex-col items-center gap-1">
								<span class="text-primary text-xs">{monthlySales.datasets[0].data[i]}M</span>
								<span class="text-secondary text-xs">{monthlySales.datasets[1].data[i]}M</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- AIインサイト -->
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body">
				<div class="mb-4 flex items-center gap-2">
					<h2 class="card-title">AIインサイト</h2>
					<div class="badge badge-primary">NEW</div>
				</div>
				<div class="space-y-4">
					{#each aiInsights as insight}
						<div class="flex items-start gap-3">
							<div class="bg-primary/10 text-primary shrink-0 rounded-full p-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
							</div>
							<p class="text-sm">{insight}</p>
						</div>
					{/each}
				</div>
				<div class="card-actions mt-2 justify-end">
					<button class="btn btn-ghost btn-sm">
						すべて表示
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 8l4 4m0 0l-4 4m4-4H3"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- 地域別・カテゴリ別売上 -->
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
		<!-- 地域別売上 -->
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body">
				<h2 class="card-title mb-4">地域別売上</h2>
				<div class="space-y-4">
					{#each regionSales as item}
						<div class="space-y-1">
							<div class="flex items-center justify-between">
								<span>{item.region}</span>
								<span class="font-medium">{formatCurrency(item.value)}</span>
							</div>
							<div class="bg-base-200 h-2.5 w-full rounded-full">
								<div class="bg-primary h-2.5 rounded-full" style="width: {item.percentage}%"></div>
							</div>
							<div class="text-base-content/60 text-right text-xs">{item.percentage}%</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- カテゴリ別売上 -->
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body">
				<h2 class="card-title mb-4">カテゴリ別売上</h2>
				<div class="space-y-4">
					{#each categorySales as item}
						<div class="space-y-1">
							<div class="flex items-center justify-between">
								<span>{item.category}</span>
								<span class="font-medium">{formatCurrency(item.value)}</span>
							</div>
							<div class="bg-base-200 h-2.5 w-full rounded-full">
								<div
									class="bg-secondary h-2.5 rounded-full"
									style="width: {item.percentage}%"
								></div>
							</div>
							<div class="text-base-content/60 text-right text-xs">{item.percentage}%</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- 顧客セグメントとアクセス分析 -->
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
		<!-- 顧客セグメント -->
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body">
				<h2 class="card-title">顧客セグメント</h2>
				<div class="h-48 w-full">
					<!-- 円グラフの代わりにダミー表示 -->
					<div class="bg-base-200 rounded-box flex h-full w-full items-center justify-center">
						<div class="text-center">
							<p class="text-base-content/60">ここに円グラフが表示されます</p>
						</div>
					</div>
				</div>
				<div class="mt-4 space-y-2">
					{#each customerSegments as item}
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<div
									class="h-3 w-3 rounded-full"
									class:bg-primary={item.color === 'primary'}
									class:bg-secondary={item.color === 'secondary'}
									class:bg-accent={item.color === 'accent'}
								></div>
								<span>{item.name}</span>
							</div>
							<span class="font-medium">{item.value}%</span>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- 時間帯別アクセス -->
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body">
				<h2 class="card-title">時間帯別アクセス</h2>
				<div class="h-48 w-full">
					<!-- 棒グラフの代わりにダミー表示 -->
					<div class="bg-base-200 rounded-box flex h-full w-full items-center justify-center">
						<div class="text-center">
							<p class="text-base-content/60">ここに棒グラフが表示されます</p>
						</div>
					</div>
				</div>
				<div class="mt-4 grid grid-cols-4 gap-2 text-center">
					{#each hourlyTraffic.labels as label, i}
						<div>
							<div class="text-xs">{label}</div>
							<div class="mt-1 text-xs font-medium">{hourlyTraffic.data[i]}</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- デバイス別アクセス -->
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body">
				<h2 class="card-title">デバイス別アクセス</h2>
				<div class="h-48 w-full">
					<!-- 円グラフの代わりにダミー表示 -->
					<div class="bg-base-200 rounded-box flex h-full w-full items-center justify-center">
						<div class="text-center">
							<p class="text-base-content/60">ここに円グラフが表示されます</p>
						</div>
					</div>
				</div>
				<div class="mt-4 space-y-3">
					{#each deviceTraffic as item}
						<div class="space-y-1">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<div
										class="h-3 w-3 rounded-full"
										class:bg-primary={item.color === 'primary'}
										class:bg-secondary={item.color === 'secondary'}
										class:bg-accent={item.color === 'accent'}
									></div>
									<span>{item.device}</span>
								</div>
								<span class="font-medium">{item.percentage}%</span>
							</div>
							<div class="bg-base-200 h-1.5 w-full rounded-full">
								<div
									class="h-1.5 rounded-full"
									class:bg-primary={item.color === 'primary'}
									class:bg-secondary={item.color === 'secondary'}
									class:bg-accent={item.color === 'accent'}
									style="width: {item.percentage}%"
								></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- レポート生成セクション -->
	<div class="card bg-base-100 shadow-sm">
		<div class="card-body">
			<h2 class="card-title">カスタムレポート生成</h2>
			<p class="text-base-content/70">必要なデータを選択して、カスタムレポートを生成できます。</p>

			<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
				<div class="form-control">
					<label class="label">
						<span class="label-text">レポートタイプ</span>
					</label>
					<select class="select select-bordered w-full">
						<option>売上レポート</option>
						<option>顧客分析</option>
						<option>トラフィック分析</option>
						<option>在庫レポート</option>
					</select>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">期間</span>
					</label>
					<select class="select select-bordered w-full">
						<option>今週</option>
						<option>今月</option>
						<option>前四半期</option>
						<option>前年同期</option>
						<option>カスタム期間</option>
					</select>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">フォーマット</span>
					</label>
					<select class="select select-bordered w-full">
						<option>PDF</option>
						<option>Excel</option>
						<option>CSV</option>
						<option>JSON</option>
					</select>
				</div>
			</div>

			<div class="form-control mt-4">
				<label class="label cursor-pointer justify-start gap-2">
					<input type="checkbox" class="checkbox checkbox-primary" />
					<span class="label-text">AIによる分析と推奨アクションを含める</span>
				</label>
			</div>

			<div class="card-actions mt-4 justify-end">
				<button class="btn btn-outline">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-2 h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
						/>
					</svg>
					プレビュー
				</button>
				<button class="btn btn-primary">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-2 h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
						/>
					</svg>
					レポート生成
				</button>
			</div>
		</div>
	</div>
</div>
