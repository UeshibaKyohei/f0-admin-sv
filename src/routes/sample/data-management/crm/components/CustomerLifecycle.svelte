<script>
	import { customerStore, activityStore, crmActions } from '../stores/crmStore.js';
	
	let { customer } = $props();
	
	// ライフサイクルステージの定義
	const lifecycleStages = [
		{ 
			id: 'onboarding', 
			name: 'オンボーディング', 
			icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
			description: '初期設定とトレーニング',
			tasks: [
				'アカウント設定完了',
				'初期トレーニング実施',
				'API連携設定',
				'運用ルール策定'
			]
		},
		{ 
			id: 'adoption', 
			name: '定着', 
			icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
			description: '利用率向上と価値実現',
			tasks: [
				'月次利用レポート確認',
				'追加機能の提案',
				'ユーザー満足度調査',
				'成功事例の共有'
			]
		},
		{ 
			id: 'expansion', 
			name: '拡大', 
			icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
			description: 'アップセル・クロスセル',
			tasks: [
				'利用状況分析',
				'拡張提案作成',
				'ROI算出',
				'決裁者へのプレゼン'
			]
		},
		{ 
			id: 'renewal', 
			name: '更新', 
			icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
			description: '契約更新と継続',
			tasks: [
				'更新90日前アラート',
				'利用価値の可視化',
				'更新条件の交渉',
				'契約書締結'
			]
		}
	];
	
	// 現在のステージを取得
	function getCurrentStage() {
		if (!customer.lifecycleStage) return 'onboarding';
		return customer.lifecycleStage;
	}
	
	// ステージの進捗を計算
	function getStageProgress(stageId) {
		// 実際の実装では、完了したタスクから計算
		const progress = {
			onboarding: 75,
			adoption: 100,
			expansion: 30,
			renewal: 0
		};
		return progress[stageId] || 0;
	}
	
	// 現在のステージ情報を取得
	const currentStageInfo = $derived(lifecycleStages.find(s => s.id === getCurrentStage()));
	
	// 健全性スコアの計算
	const healthScore = $derived.by(() => {
		let score = 50; // 基本スコア
		
		// 利用率に基づく加点
		if (customer.usageRate > 80) score += 20;
		else if (customer.usageRate > 60) score += 10;
		
		// NPS（顧客推奨度）に基づく加点
		if (customer.npsScore >= 9) score += 20;
		else if (customer.npsScore >= 7) score += 10;
		
		// 最終ログインに基づく減点
		const lastLogin = new Date(customer.lastLoginDate);
		const daysSinceLogin = (Date.now() - lastLogin) / (1000 * 60 * 60 * 24);
		if (daysSinceLogin > 30) score -= 20;
		else if (daysSinceLogin > 14) score -= 10;
		
		return Math.max(0, Math.min(100, score));
	});
	
	// スコアに応じた色とメッセージ
	function getHealthStatus(score) {
		if (score >= 80) return { color: 'text-success', label: '健全', message: '順調に利用されています' };
		if (score >= 60) return { color: 'text-warning', label: '注意', message: 'フォローアップが必要です' };
		return { color: 'text-error', label: '危険', message: '早急な対応が必要です' };
	}
	
	const healthStatus = $derived(getHealthStatus(healthScore));
</script>

<div class="space-y-6">
	<!-- ヘルススコア -->
	<div class="card bg-base-200">
		<div class="card-body">
			<h3 class="card-title">顧客健全性スコア</h3>
			
			<div class="flex items-center gap-4">
				<div class="radial-progress {healthStatus.color}" style="--value:{healthScore};" role="progressbar">
					<span class="text-2xl font-bold">{healthScore}</span>
				</div>
				
				<div class="flex-1">
					<div class="flex items-center gap-2">
						<span class="badge badge-lg {healthStatus.color === 'text-success' ? 'badge-success' : healthStatus.color === 'text-warning' ? 'badge-warning' : 'badge-error'}">
							{healthStatus.label}
						</span>
						<span class="text-sm opacity-70">{healthStatus.message}</span>
					</div>
					
					<div class="grid grid-cols-3 gap-2 mt-3">
						<div>
							<div class="text-xs opacity-70">利用率</div>
							<div class="font-semibold">{customer.usageRate || 0}%</div>
						</div>
						<div>
							<div class="text-xs opacity-70">NPS</div>
							<div class="font-semibold">{customer.npsScore || '-'}</div>
						</div>
						<div>
							<div class="text-xs opacity-70">最終ログイン</div>
							<div class="font-semibold">
								{customer.lastLoginDate ? new Date(customer.lastLoginDate).toLocaleDateString('ja-JP') : '-'}
							</div>
						</div>
					</div>
				</div>
			</div>
			
			{#if healthScore < 60}
				<div class="alert alert-warning mt-4">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
					</svg>
					<div>
						<h4 class="font-bold">チャーンリスクあり</h4>
						<p class="text-sm">早急にカスタマーサクセスマネージャーによるフォローアップが必要です</p>
					</div>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- ライフサイクルステージ -->
	<div class="card bg-base-200">
		<div class="card-body">
			<h3 class="card-title">ライフサイクルステージ</h3>
			
			<div class="flex items-center justify-between mb-4">
				{#each lifecycleStages as stage, i}
					{@const isActive = stage.id === getCurrentStage()}
					{@const progress = getStageProgress(stage.id)}
					
					<div class="flex items-center">
						<div class="relative">
							<div 
								class="w-12 h-12 rounded-full flex items-center justify-center"
								class:bg-primary={isActive}
								class:text-primary-content={isActive}
								class:bg-base-300={!isActive && progress === 0}
								class:bg-success={!isActive && progress === 100}
								class:text-success-content={!isActive && progress === 100}
							>
								<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={stage.icon}></path>
								</svg>
							</div>
							
							{#if progress > 0 && progress < 100}
								<div 
									class="absolute inset-0 rounded-full"
									style="background: conic-gradient(hsl(var(--p)) {progress}%, transparent {progress}%);"
								></div>
							{/if}
						</div>
						
						{#if i < lifecycleStages.length - 1}
							<div class="w-16 h-0.5 bg-base-300 mx-2"></div>
						{/if}
					</div>
				{/each}
			</div>
			
			<div class="grid grid-cols-4 gap-4 text-center">
				{#each lifecycleStages as stage}
					{@const isActive = stage.id === getCurrentStage()}
					<div>
						<h4 class="font-semibold text-sm" class:text-primary={isActive}>
							{stage.name}
						</h4>
						<p class="text-xs opacity-70 mt-1">{stage.description}</p>
					</div>
				{/each}
			</div>
			
			<!-- 現在のステージのタスク -->
			{#if currentStageInfo}
				<div class="mt-6">
					<h4 class="font-semibold mb-2">現在のタスク</h4>
					<div class="space-y-2">
						{#each currentStageInfo.tasks as task, i}
							<label class="flex items-center gap-2 cursor-pointer">
								<input 
									type="checkbox" 
									class="checkbox checkbox-sm"
									checked={i < 3} 
								/>
								<span class="text-sm">{task}</span>
							</label>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- 重要指標 -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<div class="card bg-base-200">
			<div class="card-body">
				<h4 class="font-semibold text-sm">契約情報</h4>
				<div class="space-y-2">
					<div class="flex justify-between">
						<span class="text-sm opacity-70">契約金額</span>
						<span class="font-semibold">¥{(customer.contractValue || 0).toLocaleString()}/年</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm opacity-70">MRR</span>
						<span class="font-semibold">¥{(customer.mrr || 0).toLocaleString()}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm opacity-70">契約終了日</span>
						<span class="font-semibold">
							{customer.contractEndDate ? new Date(customer.contractEndDate).toLocaleDateString('ja-JP') : '-'}
						</span>
					</div>
				</div>
			</div>
		</div>
		
		<div class="card bg-base-200">
			<div class="card-body">
				<h4 class="font-semibold text-sm">エンゲージメント</h4>
				<div class="space-y-2">
					<div class="flex justify-between">
						<span class="text-sm opacity-70">アクティブユーザー</span>
						<span class="font-semibold">{customer.activeUsers || 0}名</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm opacity-70">月間セッション</span>
						<span class="font-semibold">{customer.monthlySessions || 0}回</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm opacity-70">サポートチケット</span>
						<span class="font-semibold">{customer.supportTickets || 0}件</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>