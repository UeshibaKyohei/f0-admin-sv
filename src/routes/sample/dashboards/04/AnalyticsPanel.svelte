<script>
	import { onMount } from 'svelte';
	import * as dataService from './services/dataService.js';
	import { config } from './config.js';

	let analyticsData = $state({});
	let predictionData = $state({});
	let isLoading = $state(true);
	let selectedTimeRange = $state('30days');
	let selectedMetric = $state('demand');

	// 分析タイプの選択肢
	const analyticsTypes = [
		{ id: 'demand', name: '需要予測', icon: '📈', description: 'AI による商品需要の予測分析' },
		{ id: 'routes', name: 'ルート最適化', icon: '🛣️', description: '配送ルートの効率化提案' },
		{ id: 'inventory', name: '在庫最適化', icon: '📦', description: '適正在庫レベルの算出' },
		{ id: 'cost', name: 'コスト分析', icon: '💰', description: '物流コストの削減案' }
	];

	const timeRangeOptions = [
		{ id: '7days', name: '7日間予測', icon: '📊' },
		{ id: '30days', name: '30日間予測', icon: '📈' },
		{ id: '90days', name: '90日間予測', icon: '📉' },
		{ id: '365days', name: '年間予測', icon: '📅' }
	];

	onMount(async () => {
		await loadAnalyticsData();
	});

	$effect(async () => {
		if (selectedMetric || selectedTimeRange) {
			await loadAnalyticsData();
		}
	});

	async function loadAnalyticsData() {
		isLoading = true;
		try {
			const [analytics, predictions] = await Promise.all([
				dataService.getAnalyticsData(selectedTimeRange),
				dataService.getPredictionData(selectedMetric, selectedTimeRange)
			]);

			analyticsData = analytics;
			predictionData = predictions;
		} catch (error) {
			console.error('Failed to load analytics data:', error);
		} finally {
			isLoading = false;
		}
	}

	function getOptimizationScore(value) {
		if (value >= 90) return { score: 'A', color: 'text-green-600', bg: 'bg-green-100' };
		if (value >= 80) return { score: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
		if (value >= 70) return { score: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
		if (value >= 60) return { score: 'D', color: 'text-orange-600', bg: 'bg-orange-100' };
		return { score: 'F', color: 'text-red-600', bg: 'bg-red-100' };
	}

	function formatCurrency(value) {
		return new Intl.NumberFormat('ja-JP', {
			style: 'currency',
			currency: 'JPY',
			minimumFractionDigits: 0
		}).format(value);
	}

	function generateChartData(type) {
		// 簡易チャートデータの生成（デモ用）
		const days = type === 'weekly' ? 7 : type === 'monthly' ? 30 : 90;
		const data = [];
		let baseValue = 100;

		for (let i = 0; i < days; i++) {
			baseValue += (Math.random() - 0.5) * 20;
			data.push({
				day: i + 1,
				value: Math.max(0, baseValue),
				label:
					type === 'weekly'
						? `${i + 1}日`
						: type === 'monthly'
							? `${i + 1}日`
							: `${Math.floor(i / 7) + 1}週`
			});
		}
		return data;
	}
</script>

<div class="space-y-6">
	<!-- ヘッダー -->
	<div class="flex items-center justify-between">
		<div>
			<h3 class="flex items-center gap-2 text-lg font-semibold text-slate-900">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-5 w-5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18.259 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L22.01 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
						/>
					</svg>
				</div>
				AI分析・予測ダッシュボード
			</h3>
			<p class="mt-1 text-sm text-slate-600">機械学習による需要予測と最適化提案</p>
		</div>

		<div class="flex items-center gap-3">
			<!-- 分析タイプ選択 -->
			<select class="select select-bordered select-sm bg-white" bind:value={selectedMetric}>
				{#each analyticsTypes as type}
					<option value={type.id}>{type.icon} {type.name}</option>
				{/each}
			</select>

			<!-- 期間選択 -->
			<select class="select select-bordered select-sm bg-white" bind:value={selectedTimeRange}>
				{#each timeRangeOptions as range}
					<option value={range.id}>{range.icon} {range.name}</option>
				{/each}
			</select>
		</div>
	</div>

	{#if isLoading}
		<!-- ローディング状態 -->
		<div class="flex h-64 items-center justify-center">
			<div class="text-center">
				<span class="loading loading-spinner loading-lg text-primary"></span>
				<p class="mt-2 text-sm text-slate-600">AI分析データを処理中...</p>
			</div>
		</div>
	{:else}
		<!-- メインコンテンツ -->
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- 予測サマリー -->
			<div class="space-y-6 lg:col-span-2">
				<!-- AI予測結果 -->
				<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<div class="mb-4 flex items-center justify-between">
						<h4 class="flex items-center gap-2 font-semibold text-slate-900">
							🤖 AI予測結果
							<span class="badge badge-success badge-sm">信頼度: 94.2%</span>
						</h4>
						<div class="text-xs text-slate-500">更新: 5分前</div>
					</div>

					{#if selectedMetric === 'demand'}
						<!-- 需要予測 -->
						<div class="space-y-4">
							<div class="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
								<div class="mb-2 text-lg font-bold text-slate-900">今後30日間の需要予測</div>
								<div class="grid grid-cols-3 gap-4 text-sm">
									<div>
										<div class="font-medium text-green-600">予想売上</div>
										<div class="text-xl font-bold">{formatCurrency(12500000)}</div>
										<div class="text-xs text-green-600">前月比 +15.2%</div>
									</div>
									<div>
										<div class="font-medium text-blue-600">ピーク需要日</div>
										<div class="text-xl font-bold">3/15 (金)</div>
										<div class="text-xs text-blue-600">給料日効果</div>
									</div>
									<div>
										<div class="font-medium text-purple-600">推奨発注</div>
										<div class="text-xl font-bold">247 SKU</div>
										<div class="text-xs text-purple-600">在庫不足回避</div>
									</div>
								</div>
							</div>

							<!-- トレンドチャート（疑似） -->
							<div class="flex h-48 items-center justify-center rounded-lg bg-slate-50 p-4">
								<div class="text-center text-slate-500">
									<div
										class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100"
									>
										📈
									</div>
									<p>需要トレンドチャート</p>
									<p class="mt-1 text-xs">リアルタイム予測グラフ</p>
								</div>
							</div>

							<!-- 商品別予測 -->
							<div>
								<h5 class="mb-3 font-medium text-slate-800">高需要予測商品 TOP 5</h5>
								<div class="space-y-2">
									{#each [{ name: 'iPhone 15 Pro', growth: '+28.5%', demand: 'HIGH', category: 'electronics' }, { name: 'ユニクロ Tシャツ', growth: '+22.1%', demand: 'HIGH', category: 'clothing' }, { name: 'コシヒカリ 5kg', growth: '+18.7%', demand: 'MEDIUM', category: 'food' }, { name: 'Nintendo Switch', growth: '+15.3%', demand: 'MEDIUM', category: 'electronics' }, { name: 'レゴ クリエイター', growth: '+12.9%', demand: 'MEDIUM', category: 'toys' }] as product, index}
										<div class="flex items-center justify-between rounded-lg bg-slate-50 p-3">
											<div class="flex items-center gap-3">
												<div
													class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 text-xs font-bold text-white"
												>
													{index + 1}
												</div>
												<div>
													<div class="font-medium text-slate-900">{product.name}</div>
													<div class="text-xs text-slate-500">
														{config.PRODUCT_CATEGORIES[product.category]?.icon}
														{product.category}
													</div>
												</div>
											</div>
											<div class="text-right">
												<div class="font-medium text-green-600">{product.growth}</div>
												<div
													class="badge badge-{product.demand === 'HIGH'
														? 'error'
														: 'warning'} badge-xs"
												>
													{product.demand}
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						</div>
					{:else if selectedMetric === 'routes'}
						<!-- ルート最適化 -->
						<div class="space-y-4">
							<div class="rounded-lg bg-gradient-to-r from-orange-50 to-red-50 p-4">
								<div class="mb-2 text-lg font-bold text-slate-900">配送ルート最適化提案</div>
								<div class="grid grid-cols-3 gap-4 text-sm">
									<div>
										<div class="font-medium text-green-600">削減可能距離</div>
										<div class="text-xl font-bold">328 km</div>
										<div class="text-xs text-green-600">週間合計</div>
									</div>
									<div>
										<div class="font-medium text-blue-600">時間短縮</div>
										<div class="text-xl font-bold">42 時間</div>
										<div class="text-xs text-blue-600">人件費削減</div>
									</div>
									<div>
										<div class="font-medium text-purple-600">燃料費削減</div>
										<div class="text-xl font-bold">{formatCurrency(185000)}</div>
										<div class="text-xs text-purple-600">月間削減額</div>
									</div>
								</div>
							</div>

							<!-- 最適化効果 -->
							<div class="grid grid-cols-2 gap-4">
								<div class="rounded-lg bg-green-50 p-4">
									<div class="mb-2 font-medium text-green-700">🌱 環境効果</div>
									<div class="space-y-1 text-sm">
										<div>CO2削減: <span class="font-bold">1.2t/月</span></div>
										<div>燃料削減: <span class="font-bold">450L/月</span></div>
									</div>
								</div>
								<div class="rounded-lg bg-blue-50 p-4">
									<div class="mb-2 font-medium text-blue-700">⚡ 効率改善</div>
									<div class="space-y-1 text-sm">
										<div>配送効率: <span class="font-bold">+15.2%</span></div>
										<div>顧客満足度: <span class="font-bold">+8.7%</span></div>
									</div>
								</div>
							</div>
						</div>
					{:else if selectedMetric === 'inventory'}
						<!-- 在庫最適化 -->
						<div class="space-y-4">
							<div class="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-4">
								<div class="mb-2 text-lg font-bold text-slate-900">在庫最適化提案</div>
								<div class="grid grid-cols-3 gap-4 text-sm">
									<div>
										<div class="font-medium text-green-600">在庫削減額</div>
										<div class="text-xl font-bold">{formatCurrency(8500000)}</div>
										<div class="text-xs text-green-600">過剰在庫解消</div>
									</div>
									<div>
										<div class="font-medium text-blue-600">回転率改善</div>
										<div class="text-xl font-bold">+22.4%</div>
										<div class="text-xs text-blue-600">資金効率向上</div>
									</div>
									<div>
										<div class="font-medium text-purple-600">欠品リスク</div>
										<div class="text-xl font-bold">-65%</div>
										<div class="text-xs text-purple-600">機会損失回避</div>
									</div>
								</div>
							</div>

							<!-- 在庫レベル提案 -->
							<div>
								<h5 class="mb-3 font-medium text-slate-800">適正在庫レベル提案</h5>
								<div class="space-y-3">
									{#each [{ category: 'electronics', current: 15000, optimal: 12500, reduction: 2500 }, { category: 'clothing', current: 8500, optimal: 10200, increase: 1700 }, { category: 'food', current: 25000, optimal: 18000, reduction: 7000 }, { category: 'furniture', current: 3200, optimal: 2800, reduction: 400 }] as item}
										<div class="flex items-center justify-between rounded-lg bg-slate-50 p-3">
											<div class="flex items-center gap-3">
												<div class="text-lg">
													{config.PRODUCT_CATEGORIES[item.category]?.icon || '📦'}
												</div>
												<div>
													<div class="font-medium text-slate-900 capitalize">{item.category}</div>
													<div class="text-xs text-slate-500">
														現在: {item.current.toLocaleString()}点
													</div>
												</div>
											</div>
											<div class="text-right">
												<div class="font-bold text-slate-900">
													{item.optimal.toLocaleString()}点
												</div>
												<div class="text-xs {item.reduction ? 'text-green-600' : 'text-blue-600'}">
													{item.reduction
														? `${item.reduction.toLocaleString()}点削減`
														: `${item.increase.toLocaleString()}点増加`}
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						</div>
					{:else}
						<!-- コスト分析 -->
						<div class="space-y-4">
							<div class="rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 p-4">
								<div class="mb-2 text-lg font-bold text-slate-900">コスト最適化提案</div>
								<div class="grid grid-cols-3 gap-4 text-sm">
									<div>
										<div class="font-medium text-green-600">総削減可能額</div>
										<div class="text-xl font-bold">{formatCurrency(3200000)}</div>
										<div class="text-xs text-green-600">月間削減額</div>
									</div>
									<div>
										<div class="font-medium text-blue-600">ROI改善</div>
										<div class="text-xl font-bold">+18.5%</div>
										<div class="text-xs text-blue-600">投資収益率</div>
									</div>
									<div>
										<div class="font-medium text-purple-600">効率化率</div>
										<div class="text-xl font-bold">94.2%</div>
										<div class="text-xs text-purple-600">最適化スコア</div>
									</div>
								</div>
							</div>

							<!-- コスト内訳 -->
							<div class="grid grid-cols-2 gap-4">
								{#each [{ name: '配送費', current: 2800000, optimized: 2350000, category: '物流' }, { name: '倉庫費', current: 1200000, optimized: 980000, category: '保管' }, { name: '人件費', current: 3500000, optimized: 3200000, category: '労務' }, { name: '燃料費', current: 850000, optimized: 680000, category: '運輸' }] as cost}
									<div class="rounded-lg border border-slate-200 bg-white p-4">
										<div class="mb-2 flex items-center justify-between">
											<div class="font-medium text-slate-900">{cost.name}</div>
											<div class="text-xs text-slate-500">{cost.category}</div>
										</div>
										<div class="space-y-1 text-sm">
											<div class="flex justify-between">
												<span class="text-slate-600">現在:</span>
												<span class="font-medium">{formatCurrency(cost.current)}</span>
											</div>
											<div class="flex justify-between">
												<span class="text-slate-600">最適化後:</span>
												<span class="font-medium text-green-600"
													>{formatCurrency(cost.optimized)}</span
												>
											</div>
											<div class="flex justify-between text-xs">
												<span class="text-green-600">削減額:</span>
												<span class="font-bold text-green-600"
													>{formatCurrency(cost.current - cost.optimized)}</span
												>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<!-- 実行可能なアクション -->
				<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<h4 class="mb-4 flex items-center gap-2 font-semibold text-slate-900">
						⚡ 今すぐ実行可能なアクション
						<span class="badge badge-warning badge-sm">優先度: HIGH</span>
					</h4>

					<div class="space-y-3">
						{#each [{ action: '在庫アラート設定の最適化', impact: '欠品率-30%', effort: '低', timeline: '即時', description: 'AI予測に基づく動的な再注文ポイントの設定' }, { action: '配送ルートの統合', impact: 'コスト-15%', effort: '中', timeline: '1週間', description: '近隣エリアの配送を統合し効率化' }, { action: '季節商品の事前発注', impact: '売上+12%', effort: '中', timeline: '2週間', description: '春夏商品の需要予測に基づく事前発注' }, { action: '倉庫レイアウトの改善', impact: '作業効率+25%', effort: '高', timeline: '1ヶ月', description: 'ピッキング効率を考慮したレイアウト変更' }] as action, index}
							<div
								class="rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
							>
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<div class="mb-2 flex items-center gap-2">
											<div
												class="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-500 text-xs font-bold text-white"
											>
												{index + 1}
											</div>
											<h5 class="font-medium text-slate-900">{action.action}</h5>
										</div>
										<p class="mb-2 text-sm text-slate-600">{action.description}</p>
										<div class="flex items-center gap-4 text-xs">
											<span class="rounded-full bg-green-100 px-2 py-1 text-green-700"
												>効果: {action.impact}</span
											>
											<span class="rounded-full bg-blue-100 px-2 py-1 text-blue-700"
												>工数: {action.effort}</span
											>
											<span class="rounded-full bg-purple-100 px-2 py-1 text-purple-700"
												>期間: {action.timeline}</span
											>
										</div>
									</div>
									<button class="btn btn-primary btn-sm ml-4">実行</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- サイドパネル -->
			<div class="space-y-6">
				<!-- 最適化スコア -->
				<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<h4 class="mb-4 flex items-center gap-2 font-semibold text-slate-900">🎯 最適化スコア</h4>

					<div class="space-y-4">
						{#each [{ name: '在庫効率', score: 87.2 }, { name: '配送効率', score: 92.1 }, { name: 'コスト効率', score: 78.5 }, { name: '予測精度', score: 94.8 }] as metric}
							{@const scoreData = getOptimizationScore(metric.score)}
							<div>
								<div class="mb-2 flex items-center justify-between">
									<span class="text-sm font-medium text-slate-700">{metric.name}</span>
									<div class="flex items-center gap-2">
										<span class="text-sm font-bold text-slate-900">{metric.score.toFixed(1)}</span>
										<div
											class="h-8 w-8 {scoreData.bg} {scoreData.color} flex items-center justify-center rounded-full text-xs font-bold"
										>
											{scoreData.score}
										</div>
									</div>
								</div>
								<div class="progress progress-primary h-2">
									<div class="progress-bar" style="width: {metric.score}%"></div>
								</div>
							</div>
						{/each}
					</div>

					<div class="mt-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-3">
						<div class="text-sm font-medium text-purple-700">総合スコア</div>
						<div class="text-2xl font-bold text-purple-900">88.2 / 100</div>
						<div class="text-xs text-purple-600">業界平均: 72.1</div>
					</div>
				</div>

				<!-- AIインサイト -->
				<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<h4 class="mb-4 flex items-center gap-2 font-semibold text-slate-900">🧠 AIインサイト</h4>

					<div class="space-y-4 text-sm">
						<div class="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-3">
							<div class="mb-1 font-medium text-blue-900">🔮 需要トレンド</div>
							<p class="text-blue-700">
								3月中旬に電子機器の需要が25%増加する予測。早期発注を推奨。
							</p>
						</div>

						<div class="rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-3">
							<div class="mb-1 font-medium text-yellow-900">⚠️ リスク警告</div>
							<p class="text-yellow-700">食品カテゴリで在庫過多。3週間以内の販促施策を検討。</p>
						</div>

						<div class="rounded-lg border-l-4 border-green-400 bg-green-50 p-3">
							<div class="mb-1 font-medium text-green-900">💡 改善提案</div>
							<p class="text-green-700">配送ルートB-7の統合により、週15%のコスト削減が可能。</p>
						</div>

						<div class="rounded-lg border-l-4 border-purple-400 bg-purple-50 p-3">
							<div class="mb-1 font-medium text-purple-900">📊 市場分析</div>
							<p class="text-purple-700">
								競合他社比で配送スピードが12%優位。さらなる差別化を検討。
							</p>
						</div>
					</div>
				</div>

				<!-- 緊急アラート -->
				<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<h4 class="mb-4 flex items-center gap-2 font-semibold text-slate-900">🚨 緊急アラート</h4>

					<div class="space-y-3">
						<div class="rounded-lg border border-red-200 bg-red-50 p-3">
							<div class="flex items-start gap-2">
								<div class="mt-2 h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
								<div class="flex-1">
									<div class="text-sm font-medium text-red-900">iPhone 15 Pro 在庫不足</div>
									<div class="mt-1 text-xs text-red-700">残り72台 - 3日で在庫切れ予測</div>
									<button class="btn btn-error btn-xs mt-2">緊急発注</button>
								</div>
							</div>
						</div>

						<div class="rounded-lg border border-orange-200 bg-orange-50 p-3">
							<div class="flex items-start gap-2">
								<div class="mt-2 h-2 w-2 rounded-full bg-orange-500"></div>
								<div class="flex-1">
									<div class="text-sm font-medium text-orange-900">配送遅延増加</div>
									<div class="mt-1 text-xs text-orange-700">今日の遅延率: 15% (通常: 5%)</div>
									<button class="btn btn-warning btn-xs mt-2">対策実行</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
