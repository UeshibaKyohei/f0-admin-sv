<script>
	import { onMount, onDestroy } from 'svelte';
	import { config } from './config.js';

	let { criticalAlerts = [], onNewAnomaly = () => {} } = $props();

	// 異常検知の状態
	let selectedTimeRange = $state('24h');
	let selectedSensitivity = $state('MEDIUM');
	let selectedCategory = $state('all');
	let isScanning = $state(false);

	// 異常データ
	let anomalies = $state([]);
	let anomalyStats = $state({
		total: 0,
		critical: 0,
		warning: 0,
		info: 0
	});

	// 予測データ
	let predictions = $state([]);
	let confidenceLevel = $state(0);

	// タイムラインデータ（デモ用）
	let timelineData = $state([
		{ time: '00:00', anomalyScore: 0.2, baseline: 0.5 },
		{ time: '02:00', anomalyScore: 0.3, baseline: 0.5 },
		{ time: '04:00', anomalyScore: 0.4, baseline: 0.5 },
		{ time: '06:00', anomalyScore: 0.8, baseline: 0.5 },
		{ time: '08:00', anomalyScore: 1.5, baseline: 0.5 },
		{ time: '10:00', anomalyScore: 2.1, baseline: 0.5 },
		{ time: '12:00', anomalyScore: 1.8, baseline: 0.5 },
		{ time: '14:00', anomalyScore: 0.9, baseline: 0.5 },
		{ time: '16:00', anomalyScore: 0.6, baseline: 0.5 },
		{ time: '18:00', anomalyScore: 1.2, baseline: 0.5 },
		{ time: '20:00', anomalyScore: 0.7, baseline: 0.5 },
		{ time: '22:00', anomalyScore: 0.4, baseline: 0.5 }
	]);

	// スキャン間隔
	let scanInterval;

	onMount(() => {
		loadAnomalies();
		startContinuousScanning();
	});

	onDestroy(() => {
		stopContinuousScanning();
	});

	async function loadAnomalies() {
		// デモ用の異常データ
		anomalies = [
			{
				id: 1,
				type: 'TRAFFIC_SPIKE',
				severity: 'critical',
				score: 2.8,
				metric: 'API呼び出し数',
				currentValue: 15420,
				expectedValue: 5200,
				deviation: '+196%',
				detectedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
				algorithm: 'Isolation Forest',
				confidence: 0.92
			},
			{
				id: 2,
				type: 'RESPONSE_TIME',
				severity: 'warning',
				score: 1.8,
				metric: '平均応答時間',
				currentValue: 850,
				expectedValue: 250,
				deviation: '+240%',
				detectedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
				algorithm: 'LSTM Autoencoder',
				confidence: 0.87
			},
			{
				id: 3,
				type: 'ERROR_RATE',
				severity: 'warning',
				score: 1.5,
				metric: 'エラー率',
				currentValue: 4.2,
				expectedValue: 0.5,
				deviation: '+740%',
				detectedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
				algorithm: 'Prophet',
				confidence: 0.85
			},
			{
				id: 4,
				type: 'MEMORY_USAGE',
				severity: 'info',
				score: 1.2,
				metric: 'メモリ使用率',
				currentValue: 78,
				expectedValue: 65,
				deviation: '+20%',
				detectedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
				algorithm: 'Gaussian Mixture',
				confidence: 0.78
			}
		];

		// 統計を更新
		updateAnomalyStats();

		// 予測データを生成
		generatePredictions();
	}

	function updateAnomalyStats() {
		anomalyStats = {
			total: anomalies.length,
			critical: anomalies.filter((a) => a.severity === 'critical').length,
			warning: anomalies.filter((a) => a.severity === 'warning').length,
			info: anomalies.filter((a) => a.severity === 'info').length
		};
	}

	function generatePredictions() {
		predictions = [
			{
				metric: 'CPU使用率',
				currentTrend: 'increasing',
				predictedAnomaly: '2時間後',
				probability: 0.78,
				recommendedAction: 'オートスケーリングの準備'
			},
			{
				metric: 'ディスク容量',
				currentTrend: 'stable',
				predictedAnomaly: '7日後',
				probability: 0.65,
				recommendedAction: '不要ファイルのクリーンアップ'
			},
			{
				metric: 'ネットワークトラフィック',
				currentTrend: 'decreasing',
				predictedAnomaly: 'なし',
				probability: 0.12,
				recommendedAction: '監視継続'
			}
		];

		// 全体的な信頼度
		confidenceLevel = 85;
	}

	function startContinuousScanning() {
		if (config.ANOMALY_DETECTION.AUTO_REMEDIATION) {
			scanInterval = setInterval(() => {
				performScan();
			}, 30000); // 30秒ごと
		}
	}

	function stopContinuousScanning() {
		if (scanInterval) {
			clearInterval(scanInterval);
		}
	}

	async function performScan() {
		isScanning = true;

		// スキャンのシミュレーション
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// ランダムに新しい異常を検出（デモ用）
		if (Math.random() > 0.7) {
			const newAnomaly = {
				id: Date.now(),
				type: 'NEW_ANOMALY',
				severity: Math.random() > 0.5 ? 'warning' : 'info',
				score: Math.random() * 2 + 0.5,
				metric: 'カスタムメトリクス',
				currentValue: Math.floor(Math.random() * 1000),
				expectedValue: Math.floor(Math.random() * 500),
				deviation: `+${Math.floor(Math.random() * 200)}%`,
				detectedAt: new Date().toISOString(),
				algorithm: 'Real-time Detection',
				confidence: Math.random() * 0.3 + 0.7
			};

			anomalies = [newAnomaly, ...anomalies];
			onNewAnomaly(newAnomaly);
			updateAnomalyStats();
		}

		isScanning = false;
	}

	function getSeverityColor(severity) {
		return severity === 'critical'
			? 'text-error'
			: severity === 'warning'
				? 'text-warning'
				: 'text-info';
	}

	function getSeverityBadge(severity) {
		return severity === 'critical'
			? 'badge-error'
			: severity === 'warning'
				? 'badge-warning'
				: 'badge-info';
	}

	function getScoreColor(score) {
		if (score > 2) return 'text-error';
		if (score > 1.5) return 'text-warning';
		return 'text-info';
	}

	function getTrendIcon(trend) {
		if (trend === 'increasing') return '📈';
		if (trend === 'decreasing') return '📉';
		return '➡️';
	}

	async function handleRemediation(anomaly) {
		console.log('Remediation for:', anomaly);
		// 自動修復アクションの実行
	}

	// フィルタリング
	const filteredAnomalies = $derived(() => {
		return anomalies.filter((a) => {
			if (selectedCategory !== 'all' && a.severity !== selectedCategory) {
				return false;
			}
			return true;
		});
	});
</script>

<div class="space-y-6">
	<!-- ヘッダーとコントロール -->
	<div class="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
		<div>
			<h2 class="mb-2 text-2xl font-bold">異常検知と予測分析</h2>
			<p class="opacity-70">AIによるリアルタイム異常検知と将来予測</p>
		</div>

		<div class="flex flex-wrap gap-2">
			<!-- 時間範囲 -->
			<select class="select select-sm bg-base-300" bind:value={selectedTimeRange}>
				<option value="1h">過去1時間</option>
				<option value="24h">過去24時間</option>
				<option value="7d">過去7日間</option>
				<option value="30d">過去30日間</option>
			</select>

			<!-- 感度設定 -->
			<select class="select select-sm bg-base-300" bind:value={selectedSensitivity}>
				<option value="LOW">低感度</option>
				<option value="MEDIUM">標準感度</option>
				<option value="HIGH">高感度</option>
			</select>

			<!-- スキャンボタン -->
			<button class="btn btn-sm btn-primary gap-2" onclick={performScan} disabled={isScanning}>
				{#if isScanning}
					<span class="loading loading-spinner loading-xs"></span>
					スキャン中...
				{:else}
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
							d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
						/>
					</svg>
					今すぐスキャン
				{/if}
			</button>
		</div>
	</div>

	<!-- 統計カード -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
		<div class="stats bg-base-200 shadow-xl">
			<div class="stat">
				<div class="stat-title">総検出数</div>
				<div class="stat-value">{anomalyStats.total}</div>
				<div class="stat-desc">過去{selectedTimeRange}</div>
			</div>
		</div>

		<div class="stats bg-base-200 shadow-xl">
			<div class="stat">
				<div class="stat-title">重大</div>
				<div class="stat-value text-error">{anomalyStats.critical}</div>
				<div class="stat-desc">即座の対応が必要</div>
			</div>
		</div>

		<div class="stats bg-base-200 shadow-xl">
			<div class="stat">
				<div class="stat-title">警告</div>
				<div class="stat-value text-warning">{anomalyStats.warning}</div>
				<div class="stat-desc">監視が必要</div>
			</div>
		</div>

		<div class="stats bg-base-200 shadow-xl">
			<div class="stat">
				<div class="stat-title">信頼度</div>
				<div class="stat-value text-primary">{confidenceLevel}%</div>
				<div class="stat-desc">検出精度</div>
			</div>
		</div>
	</div>

	<!-- 異常スコアタイムライン -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h3 class="card-title mb-4">異常スコアタイムライン</h3>

			<!-- グラフエリア -->
			<div class="relative h-48">
				<svg class="h-full w-full">
					<!-- 基準線 -->
					<line
						x1="0"
						y1="75%"
						x2="100%"
						y2="75%"
						stroke="currentColor"
						stroke-width="2"
						stroke-dasharray="5,5"
						class="text-error opacity-50"
					/>

					<!-- 異常スコアライン -->
					<polyline
						fill="none"
						stroke="url(#anomalyGradient)"
						stroke-width="3"
						points={timelineData
							.map(
								(d, i) =>
									`${i * (100 / (timelineData.length - 1))}%,${192 - (d.anomalyScore / 2.5) * 192}`
							)
							.join(' ')}
					/>

					<!-- 異常ポイント -->
					{#each timelineData as data, i}
						{#if data.anomalyScore > 1.5}
							<circle
								cx={`${i * (100 / (timelineData.length - 1))}%`}
								cy={192 - (data.anomalyScore / 2.5) * 192}
								r="6"
								fill="currentColor"
								class="text-error"
								stroke="#fff"
								stroke-width="2"
							/>
						{/if}
					{/each}

					<defs>
						<linearGradient id="anomalyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
							<stop offset="50%" style="stop-color:#ef4444;stop-opacity:1" />
							<stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
						</linearGradient>
					</defs>
				</svg>

				<!-- 時間軸 -->
				<div class="absolute right-0 bottom-0 left-0 flex justify-between text-xs opacity-70">
					{#each timelineData as data}
						<span>{data.time}</span>
					{/each}
				</div>
			</div>

			<div class="mt-2 text-xs opacity-70">
				<span class="text-error">━━━</span> 異常閾値
				<span class="ml-4">スコア &gt; 1.5 で異常と判定</span>
			</div>
		</div>
	</div>

	<!-- 検出された異常 -->
	<div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
		<!-- 異常リスト -->
		<div class="card bg-base-200 shadow-xl">
			<div class="card-body">
				<div class="mb-4 flex items-center justify-between">
					<h3 class="card-title">検出された異常</h3>
					<select class="select select-xs bg-base-300" bind:value={selectedCategory}>
						<option value="all">すべて</option>
						<option value="critical">重大のみ</option>
						<option value="warning">警告のみ</option>
						<option value="info">情報のみ</option>
					</select>
				</div>

				<div class="space-y-3">
					{#each filteredAnomalies() as anomaly}
						<div class="bg-base-300 rounded-lg p-4">
							<div class="mb-2 flex items-start justify-between">
								<div class="flex items-center gap-2">
									<span class="badge {getSeverityBadge(anomaly.severity)}">
										{anomaly.severity === 'critical'
											? '重大'
											: anomaly.severity === 'warning'
												? '警告'
												: '情報'}
									</span>
									<span class="text-xs opacity-70">
										{new Date(anomaly.detectedAt).toLocaleString('ja-JP')}
									</span>
								</div>
								<span class="{getScoreColor(anomaly.score)} font-bold">
									スコア: {anomaly.score.toFixed(1)}
								</span>
							</div>

							<h4 class="mb-1 font-medium">{anomaly.metric}</h4>
							<div class="mb-2 grid grid-cols-3 gap-2 text-xs">
								<div>
									<span class="opacity-70">現在値:</span>
									<span class="ml-1">{anomaly.currentValue}</span>
								</div>
								<div>
									<span class="opacity-70">期待値:</span>
									<span class="ml-1">{anomaly.expectedValue}</span>
								</div>
								<div>
									<span class="opacity-70">偏差:</span>
									<span class="{getSeverityColor(anomaly.severity)} ml-1">{anomaly.deviation}</span>
								</div>
							</div>

							<div class="mt-3 flex items-center justify-between">
								<div class="text-xs">
									<span class="opacity-70">検出:</span>
									<span class="text-primary ml-1">{anomaly.algorithm}</span>
									<span class="ml-2 opacity-70">信頼度:</span>
									<span class="ml-1">{(anomaly.confidence * 100).toFixed(0)}%</span>
								</div>
								{#if config.ANOMALY_DETECTION.AUTO_REMEDIATION}
									<button class="btn btn-xs btn-primary" onclick={() => handleRemediation(anomaly)}>
										修復
									</button>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- 予測分析 -->
		<div class="card bg-base-200 shadow-xl">
			<div class="card-body">
				<h3 class="card-title mb-4">予測分析</h3>

				<div class="space-y-4">
					{#each predictions as prediction}
						<div class="bg-base-300 rounded-lg p-4">
							<div class="mb-2 flex items-center justify-between">
								<h4 class="font-medium">{prediction.metric}</h4>
								<span class="text-2xl">{getTrendIcon(prediction.currentTrend)}</span>
							</div>

							<div class="mb-3 grid grid-cols-2 gap-4">
								<div>
									<p class="text-xs opacity-70">予測される異常</p>
									<p
										class="text-sm font-medium {prediction.predictedAnomaly === 'なし'
											? 'text-success'
											: 'text-warning'}"
									>
										{prediction.predictedAnomaly}
									</p>
								</div>
								<div>
									<p class="text-xs opacity-70">発生確率</p>
									<div class="flex items-center gap-2">
										<progress
											class="progress progress-sm {prediction.probability > 0.7
												? 'progress-error'
												: prediction.probability > 0.4
													? 'progress-warning'
													: 'progress-success'}"
											value={prediction.probability}
											max="1"
										></progress>
										<span class="text-sm font-medium">
											{(prediction.probability * 100).toFixed(0)}%
										</span>
									</div>
								</div>
							</div>

							<div class="bg-base-100 rounded p-2">
								<p class="text-xs opacity-70">推奨アクション:</p>
								<p class="text-info text-sm">{prediction.recommendedAction}</p>
							</div>
						</div>
					{/each}
				</div>

				<!-- 使用中のアルゴリズム -->
				<div class="bg-base-300 mt-6 rounded-lg p-3">
					<p class="mb-2 text-xs opacity-70">使用中の検出アルゴリズム:</p>
					<div class="flex flex-wrap gap-2">
						{#each config.ANOMALY_DETECTION.ALGORITHMS as algorithm}
							<span class="badge badge-sm badge-outline badge-primary">
								{algorithm}
							</span>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
