<script>
	import { dealStore, dealStats, crmActions, activityStore } from '../stores/crmStore.js';
	import { toast } from '$lib/stores/toastStore.js';
	import { CRM_CONFIG } from '../config/settings.js';
	
	let { compact = false } = $props();
	
	let viewMode = $state('kanban'); // kanban or list
	let selectedDeal = $state(null);
	let showDealModal = $state(false);
	let hasChanges = $state(false); // 変更があったかどうかを追跡
	let showConfirmModal = $state(false); // 確認モーダル
	let confirmAction = $state(null); // 'won' or 'lost'
	let dealFilter = $state('active'); // active, closed_won, closed_lost, all
	
	// フィルター条件
	let filters = $state({
		stage: 'all',
		assignedTo: 'all',
		minValue: '',
		maxValue: '',
		searchQuery: ''
	});
	
	// カンバン表示の展開状態とページネーション
	let expandedStages = $state({});
	const ITEMS_PER_PAGE = CRM_CONFIG.UI_CONFIG.itemsPerPage; // 各ステージで最初に表示するアイテム数
	let displayLimits = $state({}); // 各ステージの表示限界数
	
	// 編集中の商談データ（モーダル内で編集する一時的なデータ）
	let editingDeal = $state({
		id: '',
		companyName: '',
		contactName: '',
		value: 0,
		stage: '',
		probability: 0,
		expectedCloseDate: '',
		assignedTo: '',
		nextAction: ''
	});
	
	// ステージの定義（設定ファイルから取得）
	const stages = CRM_CONFIG.BUSINESS_CONFIG.dealStages;
	
	// フィルタリングされた商談
	const filteredDeals = $derived.by(() => {
		let deals = [...$dealStore];
		
		// ステータスフィルター
		if (dealFilter === 'active') {
			deals = deals.filter(d => d.status === 'open');
		} else if (dealFilter === 'closed_won') {
			deals = deals.filter(d => d.status === 'closed_won');
		} else if (dealFilter === 'closed_lost') {
			deals = deals.filter(d => d.status === 'closed_lost');
		}
		
		// リストビュー用の追加フィルター
		if (viewMode === 'list') {
			// ステージフィルター
			if (filters.stage !== 'all') {
				deals = deals.filter(d => d.stage === filters.stage);
			}
			
			// 担当者フィルター
			if (filters.assignedTo !== 'all') {
				deals = deals.filter(d => d.assignedTo === filters.assignedTo);
			}
			
			// 金額フィルター
			if (filters.minValue) {
				deals = deals.filter(d => d.value >= Number(filters.minValue));
			}
			if (filters.maxValue) {
				deals = deals.filter(d => d.value <= Number(filters.maxValue));
			}
			
			// 検索フィルター
			if (filters.searchQuery) {
				const query = filters.searchQuery.toLowerCase();
				deals = deals.filter(d => 
					d.companyName.toLowerCase().includes(query) ||
					d.contactName.toLowerCase().includes(query)
				);
			}
		}
		
		return deals;
	});
	
	// 各ステージの表示限界数を取得
	function getDisplayLimit(stageId) {
		return displayLimits[stageId] || ITEMS_PER_PAGE;
	}
	
	// ステージの表示限界数を増やす
	function showMoreInStage(stageId) {
		const currentLimit = getDisplayLimit(stageId);
		displayLimits[stageId] = currentLimit + ITEMS_PER_PAGE;
	}
	
	// ステージごとの商談を取得（カンバン用）
	const dealsByStage = $derived.by(() => {
		const grouped = {};
		stages.forEach(stage => {
			let stageDeals = filteredDeals.filter(deal => 
				deal.stage === stage.id
			);
			
			// 重要度でソート（金額が大きい順、期日が近い順）
			stageDeals.sort((a, b) => {
				// まず金額でソート
				if (b.value !== a.value) {
					return b.value - a.value;
				}
				// 同じ金額なら期日でソート
				return new Date(a.expectedCloseDate) - new Date(b.expectedCloseDate);
			});
			
			grouped[stage.id] = stageDeals;
		});
		return grouped;
	});
	
	// 表示用に制限された商談リスト
	const displayedDealsByStage = $derived.by(() => {
		const displayed = {};
		Object.entries(dealsByStage).forEach(([stageId, deals]) => {
			const limit = getDisplayLimit(stageId);
			displayed[stageId] = deals.slice(0, limit);
		});
		return displayed;
	});
	
	// 担当者リスト
	const assignedToList = $derived.by(() => {
		const list = new Set($dealStore.map(d => d.assignedTo));
		return Array.from(list).sort();
	});
	
	// 商談の活動履歴を取得
	function getDealActivities(dealId) {
		return $activityStore
			.filter(activity => activity.dealId === dealId)
			.sort((a, b) => new Date(b.date) - new Date(a.date))
			.slice(0, 5);
	}
	
	// 商談の移動（カンバン上でのドラッグ&ドロップや、リストビューでの変更）
	function moveDeal(dealId, newStage) {
		crmActions.updateDeal(dealId, { stage: newStage });
		
		// 活動履歴に記録
		const deal = $dealStore.find(d => d.id === dealId);
		if (deal) {
			crmActions.recordActivity({
				type: 'note',
				description: `商談ステージを「${stages.find(s => s.id === newStage)?.name}」に変更`,
				contactName: deal.contactName,
				companyName: deal.companyName,
				dealId: dealId
			});
		}
	}
	
	// 金額のフォーマット
	function formatCurrency(amount) {
		return new Intl.NumberFormat('ja-JP', {
			style: 'currency',
			currency: 'JPY',
			minimumFractionDigits: 0
		}).format(amount);
	}
	
	// 詳細表示（編集用のデータをコピー）
	function showDetail(deal) {
		selectedDeal = deal;
		// 編集用のデータにコピー（元のデータを直接変更しないため）
		editingDeal = {
			id: deal.id,
			companyName: deal.companyName,
			contactName: deal.contactName,
			value: deal.value,
			stage: deal.stage,
			probability: deal.probability,
			expectedCloseDate: deal.expectedCloseDate,
			assignedTo: deal.assignedTo,
			nextAction: deal.nextAction || ''
		};
		hasChanges = false;
		showDealModal = true;
	}
	
	// 変更を検知
	function markAsChanged() {
		hasChanges = true;
	}
	
	// 商談情報の保存
	function saveDealChanges() {
		// 変更内容を保存
		crmActions.updateDeal(editingDeal.id, {
			value: editingDeal.value,
			stage: editingDeal.stage,
			probability: editingDeal.probability,
			expectedCloseDate: editingDeal.expectedCloseDate,
			nextAction: editingDeal.nextAction
		});
		
		// 活動履歴に記録
		crmActions.recordActivity({
			type: 'note',
			description: '商談情報を更新しました',
			contactName: editingDeal.contactName,
			companyName: editingDeal.companyName,
			dealId: editingDeal.id
		});
		
		// selectedDealも更新（表示を反映）
		selectedDeal = $dealStore.find(d => d.id === editingDeal.id);
		hasChanges = false;
		
		// 成功メッセージをトースト通知で表示
		toast.success('商談情報を保存しました');
	}
	
	// 成約処理
	function wonDeal() {
		showConfirmModal = true;
		confirmAction = 'won';
	}
	
	// 失注処理
	function lostDeal() {
		showConfirmModal = true;
		confirmAction = 'lost';
	}
	
	// 確認モーダルのアクション実行
	function executeConfirmAction() {
		if (confirmAction === 'won') {
			crmActions.updateDeal(editingDeal.id, {
				status: 'closed_won',
				closedDate: new Date().toISOString()
			});
			
			// 活動履歴に記録
			crmActions.recordActivity({
				type: 'note',
				description: '商談を成約しました！',
				contactName: editingDeal.contactName,
				companyName: editingDeal.companyName,
				dealId: editingDeal.id
			});
			
			toast.success('商談を成約しました！🎉');
		} else if (confirmAction === 'lost') {
			crmActions.updateDeal(editingDeal.id, {
				status: 'closed_lost',
				closedDate: new Date().toISOString()
			});
			
			// 活動履歴に記録
			crmActions.recordActivity({
				type: 'note',
				description: '商談を失注としました',
				contactName: editingDeal.contactName,
				companyName: editingDeal.companyName,
				dealId: editingDeal.id
			});
			
			toast.info('商談を失注として記録しました');
		}
		
		showDealModal = false;
		showConfirmModal = false;
		confirmAction = null;
	}
	
	// アクティビティタイプのスタイルを取得
	function getActivityStyle(type) {
		const styles = {
			email: { badge: 'badge-info', label: 'メール' },
			phone: { badge: 'badge-success', label: '電話' },
			meeting: { badge: 'badge-warning', label: '会議' },
			note: { badge: 'badge-ghost', label: 'メモ' },
			task: { badge: 'badge-primary', label: 'タスク' }
		};
		return styles[type] || { badge: 'badge-ghost', label: type };
	}
</script>

<div class="space-y-4 w-full max-w-full overflow-hidden">
	{#if !compact}
		<!-- ヘッダー -->
		<div class="space-y-4">
			<div class="flex justify-between items-center">
				<div class="flex gap-4 items-center">
					<h2 class="text-xl font-bold">商談パイプライン</h2>
					<div class="stats stats-horizontal">
						<div class="stat">
							<div class="stat-title">合計金額</div>
							<div class="stat-value text-lg">{formatCurrency($dealStats.totalValue)}</div>
						</div>
						<div class="stat">
							<div class="stat-title">成約率</div>
							<div class="stat-value text-lg">{$dealStats.winRate.toFixed(1)}%</div>
						</div>
					</div>
				</div>
				
				<div class="flex gap-2 items-center">
					<div class="btn-group">
						<button 
							class="btn btn-sm gap-2"
							class:btn-active={viewMode === 'kanban'}
							onclick={() => viewMode = 'kanban'}
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z"></path>
							</svg>
							パイプライン
						</button>
						<button 
							class="btn btn-sm gap-2"
							class:btn-active={viewMode === 'list'}
							onclick={() => viewMode = 'list'}
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
							</svg>
							詳細検索
						</button>
					</div>
					
					<!-- ビューの説明 -->
					<div class="tooltip tooltip-bottom" data-tip={viewMode === 'kanban' ? '進行中商談の可視化・ドラッグ&ドロップ管理に最適' : '全商談の詳細検索・分析・一括編集に最適'}>
						<svg class="w-4 h-4 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
					</div>
				</div>
			</div>
			
			<!-- 商談ステータス切り替えタブ -->
			<div class="flex gap-2 items-center">
				<span class="text-sm font-medium text-base-content/70">表示:</span>
				<div class="tabs tabs-boxed">
					<button 
						class="tab tab-sm"
						class:tab-active={dealFilter === 'active'}
						onclick={() => dealFilter = 'active'}
					>
						進行中
						<span class="badge badge-sm ml-1">
							{filteredDeals.filter(d => d.status === 'open').length}
						</span>
					</button>
					<button 
						class="tab tab-sm"
						class:tab-active={dealFilter === 'closed_won'}
						onclick={() => dealFilter = 'closed_won'}
					>
						成約済み
						<span class="badge badge-sm badge-success ml-1">
							{$dealStore.filter(d => d.status === 'closed_won').length}
						</span>
					</button>
					<button 
						class="tab tab-sm"
						class:tab-active={dealFilter === 'closed_lost'}
						onclick={() => dealFilter = 'closed_lost'}
					>
						失注
						<span class="badge badge-sm badge-error ml-1">
							{$dealStore.filter(d => d.status === 'closed_lost').length}
						</span>
					</button>
					<button 
						class="tab tab-sm"
						class:tab-active={dealFilter === 'all'}
						onclick={() => dealFilter = 'all'}
					>
						全て
						<span class="badge badge-sm badge-neutral ml-1">
							{$dealStore.length}
						</span>
					</button>
				</div>
			</div>
		</div>
	{/if}
	
	{#if viewMode === 'kanban'}
		<!-- カンバンビュー -->
		{#if dealFilter === 'active'}
			<!-- パイプライン用案内 -->
			<div class="alert alert-info mb-4">
				<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z"></path>
				</svg>
				<div>
					<h4 class="font-semibold">パイプライン管理</h4>
					<p class="text-sm">進行中商談のステージ別可視化。各商談カードをクリックして詳細編集、ステージ間の移動でプロセス管理が可能です。</p>
				</div>
			</div>
			<!-- 進行中商談のカンバン表示 -->
			<div class="overflow-x-auto -mx-6 px-6">
				<div class="flex gap-4 pb-4">
					{#each stages as stage}
						<div class="flex-shrink-0 w-72">
						<div class={`${stage.color} text-white p-3 rounded-t-lg`}>
							<div class="flex justify-between items-center">
								<h3 class="font-semibold">{stage.name}</h3>
								<span class="badge badge-sm badge-neutral">
									{dealsByStage[stage.id]?.length || 0}
								</span>
							</div>
							<div class="text-sm opacity-90 mt-1">
								{formatCurrency(
									dealsByStage[stage.id]?.reduce((sum, d) => sum + d.value, 0) || 0
								)}
							</div>
						</div>
						
						<div class="bg-base-200 min-h-[400px] max-h-[600px] p-2 space-y-2 rounded-b-lg overflow-y-auto">
							{#each displayedDealsByStage[stage.id] || [] as deal}
								<div 
									class="card bg-base-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
									onclick={() => showDetail(deal)}
								>
									<div class="card-body p-4">
										<h4 class="font-semibold text-sm">{deal.companyName}</h4>
										<p class="text-sm opacity-70">{deal.contactName}</p>
										<div class="flex justify-between items-center mt-2">
											<span class="text-lg font-bold">
												{formatCurrency(deal.value)}
											</span>
											<span class="badge badge-sm">
												{deal.probability}%
											</span>
										</div>
										<div class="text-xs opacity-50 mt-2">
											予定: {new Date(deal.expectedCloseDate).toLocaleDateString('ja-JP')}
										</div>
										{#if deal.nextAction}
											<div class="text-xs text-warning mt-1">
												📌 {deal.nextAction.substring(0, 20)}...
											</div>
										{/if}
									</div>
								</div>
							{/each}
							
							<!-- もっと見るボタン -->
							{#if (dealsByStage[stage.id]?.length || 0) > getDisplayLimit(stage.id)}
								<div class="text-center pt-2">
									<button 
										class="btn btn-ghost btn-sm w-full"
										onclick={() => showMoreInStage(stage.id)}
									>
										<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
										</svg>
										もっと見る ({(dealsByStage[stage.id]?.length || 0) - getDisplayLimit(stage.id)}件)
									</button>
								</div>
							{/if}
							
							<!-- 該当なしメッセージ -->
							{#if (displayedDealsByStage[stage.id]?.length || 0) === 0}
								<div class="text-center py-8 text-base-content/50">
									<svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
									</svg>
									<p class="text-xs">該当なし</p>
								</div>
							{/if}
						</div>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<!-- 成約済み・失注・全ての商談はグリッド表示 -->
			<div class="alert alert-info mb-4">
				<svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
				<span>
					{#if dealFilter === 'closed_won'}成約済み商談を表示しています。詳細な検索・分析にはリスト表示をご利用ください。
					{:else if dealFilter === 'closed_lost'}失注商談を表示しています。詳細な検索・分析にはリスト表示をご利用ください。
					{:else}全ての商談を表示しています。進行中商談のパイプライン管理は「進行中」タブをご利用ください。
					{/if}
				</span>
			</div>
			
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{#each filteredDeals as deal}
					<div 
						class="card bg-base-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow border-l-4"
						class:border-l-success={deal.status === 'closed_won'}
						class:border-l-error={deal.status === 'closed_lost'}
						class:border-l-primary={deal.status === 'open'}
						onclick={() => showDetail(deal)}
					>
						<div class="card-body p-4">
							<div class="flex justify-between items-start mb-2">
								<h4 class="font-semibold text-sm">{deal.companyName}</h4>
								{#if deal.status === 'closed_won'}
									<div class="badge badge-success badge-sm">成約</div>
								{:else if deal.status === 'closed_lost'}
									<div class="badge badge-error badge-sm">失注</div>
								{:else}
									<div class="badge badge-primary badge-sm">{stages.find(s => s.id === deal.stage)?.name}</div>
								{/if}
							</div>
							
							<p class="text-sm opacity-70 mb-2">{deal.contactName}</p>
							
							<div class="flex justify-between items-center mb-2">
								<span class="text-lg font-bold">
									{formatCurrency(deal.value)}
								</span>
								{#if deal.status === 'open'}
									<span class="badge badge-sm">
										{deal.probability}%
									</span>
								{/if}
							</div>
							
							<div class="text-xs opacity-50">
								{#if deal.closedDate}
									完了: {new Date(deal.closedDate).toLocaleDateString('ja-JP')}
								{:else}
									予定: {new Date(deal.expectedCloseDate).toLocaleDateString('ja-JP')}
								{/if}
							</div>
							
							{#if deal.status === 'open' && deal.nextAction}
								<div class="text-xs text-warning mt-2">
									📌 {deal.nextAction.substring(0, 30)}...
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
			
			{#if filteredDeals.length === 0}
				<div class="text-center py-12">
					<svg class="w-16 h-16 mx-auto text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
					</svg>
					<p class="text-lg font-medium text-base-content/70">該当する商談がありません</p>
					<p class="text-sm text-base-content/50">フィルタ条件を変更してみてください</p>
				</div>
			{/if}
		{/if}
	{:else}
		<!-- リストビュー -->
		<!-- 詳細検索用案内 -->
		<div class="alert alert-success mb-4">
			<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
			</svg>
			<div>
				<h4 class="font-semibold">詳細検索・分析</h4>
				<p class="text-sm">全ての商談データを対象とした詳細検索。複数条件でのフィルタリング、ソート、データ分析に最適です。</p>
			</div>
		</div>
		
		<!-- フィルタコントロール -->
		<div class="card bg-base-200 mb-4">
			<div class="card-body">
				<h4 class="card-title text-base mb-4">詳細フィルタ</h4>
				
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
					<!-- 検索 -->
					<div class="form-control">
						<label class="label">
							<span class="label-text">会社名・担当者検索</span>
						</label>
						<input 
							type="text" 
							placeholder="検索キーワード"
							class="input input-bordered input-sm"
							bind:value={filters.searchQuery}
						/>
					</div>
					
					<!-- ステージフィルタ -->
					<div class="form-control">
						<label class="label">
							<span class="label-text">ステージ</span>
						</label>
						<select class="select select-bordered select-sm" bind:value={filters.stage}>
							<option value="all">全てのステージ</option>
							{#each stages as stage}
								<option value={stage.id}>{stage.name}</option>
							{/each}
						</select>
					</div>
					
					<!-- 担当者フィルタ -->
					<div class="form-control">
						<label class="label">
							<span class="label-text">担当営業</span>
						</label>
						<select class="select select-bordered select-sm" bind:value={filters.assignedTo}>
							<option value="all">全ての営業</option>
							{#each assignedToList as assignee}
								<option value={assignee}>{assignee}</option>
							{/each}
						</select>
					</div>
					
					<!-- 金額範囲（最小） -->
					<div class="form-control">
						<label class="label">
							<span class="label-text">最小金額</span>
						</label>
						<input 
							type="number" 
							placeholder="0"
							class="input input-bordered input-sm"
							bind:value={filters.minValue}
						/>
					</div>
					
					<!-- 金額範囲（最大） -->
					<div class="form-control">
						<label class="label">
							<span class="label-text">最大金額</span>
						</label>
						<input 
							type="number" 
							placeholder="無制限"
							class="input input-bordered input-sm"
							bind:value={filters.maxValue}
						/>
					</div>
					
					<!-- フィルタクリア -->
					<div class="form-control">
						<label class="label">
							<span class="label-text">&nbsp;</span>
						</label>
						<button 
							class="btn btn-ghost btn-sm"
							onclick={() => {
								filters.searchQuery = '';
								filters.stage = 'all';
								filters.assignedTo = 'all';
								filters.minValue = '';
								filters.maxValue = '';
							}}
						>
							<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
							</svg>
							クリア
						</button>
					</div>
				</div>
				
				<!-- 結果サマリー -->
				<div class="flex justify-between items-center mt-4 pt-4 border-t border-base-300">
					<div class="text-sm text-base-content/70">
						{filteredDeals.length}件の商談が見つかりました
						{#if filteredDeals.length > 0}
							（合計金額: {formatCurrency(filteredDeals.reduce((sum, d) => sum + d.value, 0))}）
						{/if}
					</div>
					
					<!-- ソート -->
					<div class="form-control">
						<select 
							class="select select-bordered select-sm"
							onchange={(e) => {
								const value = e.target.value;
								// ソート処理（必要に応じて実装）
							}}
						>
							<option value="value_desc">金額（高い順）</option>
							<option value="value_asc">金額（安い順）</option>
							<option value="date_desc">更新日（新しい順）</option>
							<option value="date_asc">更新日（古い順）</option>
							<option value="probability_desc">確度（高い順）</option>
							<option value="probability_asc">確度（低い順）</option>
						</select>
					</div>
				</div>
			</div>
		</div>
		
		<div class="overflow-x-auto">
			<table class="table table-zebra">
				<thead>
					<tr>
						<th>ステータス</th>
						<th>会社名</th>
						<th>担当者</th>
						<th>ステージ</th>
						<th>金額</th>
						<th>確度</th>
						<th>日付</th>
						<th>担当営業</th>
						<th>アクション</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredDeals as deal}
						<tr class="hover">
							<!-- ステータス -->
							<td>
								{#if deal.status === 'closed_won'}
									<div class="badge badge-success badge-sm">成約</div>
								{:else if deal.status === 'closed_lost'}
									<div class="badge badge-error badge-sm">失注</div>
								{:else}
									<div class="badge badge-primary badge-sm">進行中</div>
								{/if}
							</td>
							
							<!-- 会社名 -->
							<td class="font-semibold">{deal.companyName}</td>
							
							<!-- 担当者 -->
							<td>{deal.contactName}</td>
							
							<!-- ステージ -->
							<td>
								{#if deal.status === 'open'}
									<select 
										class="select select-bordered select-xs"
										value={deal.stage}
										onchange={(e) => moveDeal(deal.id, e.target.value)}
									>
										{#each stages as stage}
											<option value={stage.id}>{stage.name}</option>
										{/each}
									</select>
								{:else}
									<span class="text-sm opacity-70">
										{stages.find(s => s.id === deal.stage)?.name || '完了'}
									</span>
								{/if}
							</td>
							
							<!-- 金額 -->
							<td class="font-bold">{formatCurrency(deal.value)}</td>
							
							<!-- 確度 -->
							<td>
								{#if deal.status === 'open'}
									<div class="badge badge-sm">{deal.probability}%</div>
								{:else if deal.status === 'closed_won'}
									<div class="badge badge-success badge-sm">100%</div>
								{:else}
									<div class="badge badge-error badge-sm">0%</div>
								{/if}
							</td>
							
							<!-- 日付 -->
							<td class="text-sm">
								{#if deal.closedDate}
									<div>
										<div class="font-medium">完了</div>
										<div class="text-xs opacity-50">
											{new Date(deal.closedDate).toLocaleDateString('ja-JP')}
										</div>
									</div>
								{:else}
									<div>
										<div class="font-medium">予定</div>
										<div class="text-xs opacity-50">
											{new Date(deal.expectedCloseDate).toLocaleDateString('ja-JP')}
										</div>
									</div>
								{/if}
							</td>
							
							<!-- 担当営業 -->
							<td class="text-sm">{deal.assignedTo}</td>
							
							<!-- アクション -->
							<td>
								<div class="flex gap-1">
									<button 
										class="btn btn-ghost btn-xs"
										onclick={() => showDetail(deal)}
									>
										詳細
									</button>
									{#if deal.status === 'open'}
										<div class="dropdown dropdown-end">
											<button class="btn btn-ghost btn-xs" tabindex="0">
												<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
												</svg>
											</button>
											<ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32">
												<li><button onclick={() => showDetail(deal)}>編集</button></li>
												<li><button onclick={() => { selectedDeal = deal; showDetail(deal); }}>活動記録</button></li>
											</ul>
										</div>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			
			<!-- データなしの場合 -->
			{#if filteredDeals.length === 0}
				<div class="text-center py-12">
					<svg class="w-16 h-16 mx-auto text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
					</svg>
					<p class="text-lg font-medium text-base-content/70">該当する商談がありません</p>
					<p class="text-sm text-base-content/50">フィルタ条件を変更してみてください</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- 商談詳細モーダル -->
{#if selectedDeal}
<input type="checkbox" id="deal-modal" class="modal-toggle" bind:checked={showDealModal} />
<div class="modal">
	<div class="modal-box w-11/12 max-w-5xl">
		<h3 class="font-bold text-lg mb-4">商談詳細</h3>
		
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2 space-y-4">
				<div class="card bg-base-200">
					<div class="card-body">
						<h4 class="card-title">{editingDeal.companyName}</h4>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label class="label">
									<span class="label-text">担当者</span>
								</label>
								<p class="font-medium">{editingDeal.contactName}</p>
							</div>
							<div>
								<label class="label">
									<span class="label-text">商談金額</span>
								</label>
								<input 
									type="number" 
									class="input input-bordered w-full"
									bind:value={editingDeal.value}
									oninput={markAsChanged}
								/>
							</div>
							<div>
								<label class="label">
									<span class="label-text">ステージ</span>
								</label>
								<select 
									class="select select-bordered w-full"
									bind:value={editingDeal.stage}
									onchange={markAsChanged}
								>
									{#each stages as stage}
										<option value={stage.id}>
											{stage.name}
										</option>
									{/each}
								</select>
							</div>
							<div>
								<label class="label">
									<span class="label-text">確度 <span class="text-primary font-bold">{editingDeal.probability}%</span></span>
								</label>
								<div class="flex items-center gap-2">
									<input 
										type="range" 
										min="0" 
										max="100" 
										bind:value={editingDeal.probability}
										oninput={markAsChanged}
										class="range range-primary" 
									/>
								</div>
							</div>
							<div>
								<label class="label">
									<span class="label-text">予定クローズ日</span>
								</label>
								<input 
									type="date" 
									class="input input-bordered w-full"
									bind:value={editingDeal.expectedCloseDate}
									onchange={markAsChanged}
								/>
							</div>
							<div>
								<label class="label">
									<span class="label-text">担当営業</span>
								</label>
								<p class="font-medium">{editingDeal.assignedTo}</p>
							</div>
						</div>
					</div>
				</div>
				
				<!-- 次のアクション -->
				<div class="card bg-base-200">
					<div class="card-body">
						<h4 class="card-title text-sm">次のアクション</h4>
						<div class="form-control">
							<textarea 
								class="textarea textarea-bordered h-32" 
								placeholder="次に行うべきアクションを記入してください。例：決裁者とのミーティング設定、追加資料の送付、他部門との調整など..."
								bind:value={editingDeal.nextAction}
								oninput={markAsChanged}
							></textarea>
						</div>
					</div>
				</div>
			</div>
			
			<div class="space-y-4">
				<!-- 活動履歴 -->
				<div class="card bg-base-200">
					<div class="card-body">
						<h4 class="card-title">活動履歴</h4>
						<div class="space-y-2 max-h-60 overflow-y-auto">
							{#each getDealActivities(selectedDeal.id) as activity}
								{@const activityStyle = getActivityStyle(activity.type)}
								<div class="flex gap-4 items-start">
									<div class={`badge ${activityStyle.badge}`}>{activityStyle.label}</div>
									<div class="flex-1">
										<p class="text-sm">{activity.description}</p>
										<p class="text-xs opacity-50">
											{new Date(activity.date).toLocaleString('ja-JP')}
										</p>
									</div>
								</div>
							{/each}
							{#if getDealActivities(selectedDeal.id).length === 0}
								<p class="text-sm opacity-50">活動履歴はまだありません</p>
							{/if}
						</div>
					</div>
				</div>
				
				<!-- AI提案 -->
				<div class="alert alert-info">
					<svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
					</svg>
					<div>
						<h4 class="font-semibold">AI提案</h4>
						{#if editingDeal.probability < 30}
							<p class="text-sm">確度が低いです。ニーズの再確認と、導入メリットの明確化が必要です。</p>
						{:else if editingDeal.probability < 60}
							<p class="text-sm">競合他社の導入事例を共有することで成約確度が15%向上する可能性があります。</p>
						{:else}
							<p class="text-sm">クロージングに向けて、決裁者との面談設定を推奨します。</p>
						{/if}
					</div>
				</div>
			</div>
		</div>
		
		<div class="modal-action">
			<button 
				class="btn btn-primary"
				onclick={saveDealChanges}
				disabled={!hasChanges}
			>
				<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
				</svg>
				保存
			</button>
			<button class="btn btn-success" onclick={wonDeal}>成約</button>
			<button class="btn btn-error" onclick={lostDeal}>失注</button>
			<button class="btn" onclick={() => showDealModal = false}>閉じる</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={() => showDealModal = false}>close</button>
	</form>
</div>
{/if}

<!-- 確認モーダル -->
<input type="checkbox" id="confirm-modal" class="modal-toggle" bind:checked={showConfirmModal} />
<div class="modal">
	<div class="modal-box">
		<h3 class="font-bold text-lg mb-4">
			{confirmAction === 'won' ? '成約確認' : '失注確認'}
		</h3>
		
		<p class="py-4">
			{#if confirmAction === 'won'}
				<span class="font-semibold">{editingDeal.companyName}</span>の商談を成約にしますか？
			{:else}
				<span class="font-semibold">{editingDeal.companyName}</span>の商談を失注にしますか？
			{/if}
		</p>
		
		<div class="modal-action">
			<button 
				class="btn"
				onclick={() => showConfirmModal = false}
			>
				キャンセル
			</button>
			<button 
				class="btn {confirmAction === 'won' ? 'btn-success' : 'btn-error'}"
				onclick={executeConfirmAction}
			>
				{confirmAction === 'won' ? '成約する' : '失注する'}
			</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={() => showConfirmModal = false}>close</button>
	</form>
</div>