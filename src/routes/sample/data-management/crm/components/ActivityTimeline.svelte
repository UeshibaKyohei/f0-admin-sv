<script>
	import { activityStore, leadStore, dealStore, customerStore, crmActions } from '../stores/crmStore.js';
	import { activityAPI } from '../api/interfaces.js';
	import { CRM_CONFIG } from '../config/settings.js';
	import ActivityRecorder from './ActivityRecorder.svelte';
	import { onMount } from 'svelte';
	
	let { limit = null, entityId = null, entityType = null } = $props();
	
	let filterType = $state('all');
	let showActivityRecorder = $state(false);
	let selectedEntity = $state(null);
	
	// ページネーション状態
	let currentPage = $state(1);
	let totalPages = $state(1);
	let totalItems = $state(0);
	let isLoading = $state(false);
	let hasNextPage = $state(false);
	let activities = $state([]);
	
	// ページネーション設定
	const ITEMS_PER_PAGE = CRM_CONFIG.UI_CONFIG.activitiesPerPage; // 活動履歴の1ページあたり表示件数
	
	// 活動タイプの定義
	const activityTypes = {
		phone: { label: '電話', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', color: 'text-success' },
		email: { label: 'メール', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'text-info' },
		meeting: { label: '会議', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-warning' },
		note: { label: 'メモ', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'text-base-content' },
		task: { label: 'タスク', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', color: 'text-primary' },
		email_opened: { label: '開封', icon: 'M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76', color: 'text-base-content opacity-50' },
		email_clicked: { label: 'クリック', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', color: 'text-base-content opacity-50' },
		web_visit: { label: 'Web訪問', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9', color: 'text-base-content opacity-50' },
		document_download: { label: 'DL', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'text-warning' }
	};
	
	// フィルタリングされた活動（ページネーション対応）
	const filteredActivities = $derived.by(() => {
		if (limit) {
			// limit指定の場合は従来通りストアから取得（コンパクト表示用）
			let storeActivities = [...$activityStore];
			
			// エンティティ指定がある場合はフィルタリング
			if (entityId && entityType) {
				storeActivities = storeActivities.filter(a => a[entityType + 'Id'] === entityId);
			}
			
			if (filterType !== 'all') {
				storeActivities = storeActivities.filter(a => a.type === filterType);
			}
			
			// 日付でソート（新しい順）
			storeActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
			return storeActivities.slice(0, limit);
		}
		
		// ページネーション対応の場合は専用の配列を使用
		return activities;
	});
	
	// 初期読み込み
	onMount(() => {
		if (!limit) {
			// フルページ表示の場合のみページネーション機能を使用
			loadActivities(1, true);
		}
	});
	
	// フィルタータイプ変更時の処理
	function handleFilterChange(newFilterType) {
		filterType = newFilterType;
		if (!limit) {
			currentPage = 1;
			activities = [];
			loadActivities(1, true);
		}
	}
	
	/**
	 * 活動履歴を読み込む
	 * @param {number} page - ページ番号
	 * @param {boolean} reset - 既存データをリセットするか
	 */
	async function loadActivities(page = 1, reset = false) {
		if (isLoading) return;
		
		try {
			isLoading = true;
			
			const params = {
				page,
				limit: ITEMS_PER_PAGE,
				type: filterType !== 'all' ? filterType : undefined,
				[entityType + '_id']: entityId || undefined
			};
			
			// 不要なプロパティを削除
			Object.keys(params).forEach(key => {
				if (params[key] === undefined) {
					delete params[key];
				}
			});
			
			let result;
			if (CRM_CONFIG.MOCK_MODE) {
				// モックモード：既存ストアデータを使用してページネーション模擬
				result = getMockActivitiesPage(params);
			} else {
				// 本番モード：API経由でデータ取得
				result = await activityAPI.getActivities(params);
			}
			
			if (reset) {
				activities = result.data.items;
			} else {
				activities = [...activities, ...result.data.items];
			}
			
			currentPage = page;
			totalPages = result.data.pagination.totalPages;
			totalItems = result.data.pagination.total;
			hasNextPage = page < totalPages;
			
		} catch (error) {
			console.error('活動履歴の読み込みに失敗しました:', error);
		} finally {
			isLoading = false;
		}
	}
	
	/**
	 * モックモードでのページネーション模擬
	 */
	function getMockActivitiesPage(params) {
		let mockData = [...$activityStore];
		
		// フィルタリング
		if (params.type) {
			mockData = mockData.filter(a => a.type === params.type);
		}
		if (params.customer_id) {
			mockData = mockData.filter(a => a.customerId === params.customer_id);
		}
		if (params.deal_id) {
			mockData = mockData.filter(a => a.dealId === params.deal_id);
		}
		if (params.lead_id) {
			mockData = mockData.filter(a => a.leadId === params.lead_id);
		}
		
		// 日付でソート（新しい順）
		mockData.sort((a, b) => new Date(b.date) - new Date(a.date));
		
		// ページネーション
		const total = mockData.length;
		const totalPages = Math.ceil(total / params.limit);
		const offset = (params.page - 1) * params.limit;
		const items = mockData.slice(offset, offset + params.limit);
		
		return {
			success: true,
			data: {
				items,
				pagination: {
					total,
					page: params.page,
					limit: params.limit,
					totalPages
				}
			}
		};
	}
	
	/**
	 * 次のページを読み込む
	 */
	function loadNextPage() {
		if (hasNextPage && !isLoading) {
			loadActivities(currentPage + 1, false);
		}
	}
	
	/**
	 * フィルタをリセットして再読み込み
	 */
	function resetAndReload() {
		filterType = 'all';
		currentPage = 1;
		activities = [];
		loadActivities(1, true);
	}
	
	// 現在のエンティティを取得
	function getCurrentEntity() {
		if (!entityId || !entityType) return null;
		
		switch (entityType) {
			case 'lead':
				return $leadStore.find(l => l.id === entityId);
			case 'deal':
				return $dealStore.find(d => d.id === entityId);
			case 'customer':
				return $customerStore.find(c => c.id === entityId);
			default:
				return null;
		}
	}
	
	// 活動記録ボタンをクリック
	function openActivityRecorder() {
		selectedEntity = getCurrentEntity() || {
			id: 'general',
			name: '一般活動',
			companyName: '関連なし'
		};
		showActivityRecorder = true;
	}
	
	// 相対時間の表示
	function getRelativeTime(date) {
		const now = new Date();
		const actDate = new Date(date);
		const diff = now - actDate;
		
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);
		
		if (minutes < 60) return `${minutes}分前`;
		if (hours < 24) return `${hours}時間前`;
		if (days < 7) return `${days}日前`;
		
		return actDate.toLocaleDateString('ja-JP');
	}
	
	// タスクの完了切り替え
	function toggleTaskComplete(activity) {
		crmActions.addActivity({
			...activity,
			status: activity.status === 'completed' ? 'pending' : 'completed',
			completedAt: activity.status === 'completed' ? null : new Date().toISOString()
		});
		
		// モックモードでローカルデータも更新
		if (CRM_CONFIG.MOCK_MODE && !limit) {
			const index = activities.findIndex(a => a.id === activity.id);
			if (index !== -1) {
				activities[index] = {
					...activity,
					status: activity.status === 'completed' ? 'pending' : 'completed',
					completedAt: activity.status === 'completed' ? null : new Date().toISOString()
				};
			}
		}
	}
</script>

<div class="space-y-4">
	{#if !limit}
		<!-- フィルターバー -->
		<div class="flex justify-between items-center">
			<div class="flex gap-2 flex-wrap">
				<button 
					class="btn btn-sm"
					class:btn-active={filterType === 'all'}
					onclick={() => handleFilterChange('all')}
					disabled={isLoading}
				>
					すべて
				</button>
				{#each Object.entries(activityTypes) as [type, config]}
					{#if ['phone', 'email', 'meeting', 'note', 'task'].includes(type)}
						<button 
							class="btn btn-sm"
							class:btn-active={filterType === type}
							onclick={() => handleFilterChange(type)}
							disabled={isLoading}
						>
							{config.label}
						</button>
					{/if}
				{/each}
			</div>
			
			<div class="flex items-center gap-2">
				<!-- ページ情報 -->
				{#if totalItems > 0}
					<div class="text-sm opacity-70">
						{activities.length} / {totalItems} 件
					</div>
				{/if}
				
				<button 
					class="btn btn-primary btn-sm gap-2"
					onclick={openActivityRecorder}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
					</svg>
					活動を記録
				</button>
			</div>
		</div>
	{/if}
	
	<!-- タイムライン -->
	<div class="space-y-3">
		{#each filteredActivities as activity, i}
			<div class="flex gap-3">
				<!-- タイムラインライン -->
				<div class="flex flex-col items-center">
					<div class={`mt-1 ${activityTypes[activity.type]?.color || 'text-base-content'}`}>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={activityTypes[activity.type]?.icon || activityTypes.note.icon}></path>
						</svg>
					</div>
					{#if i < filteredActivities.length - 1}
						<div class="w-0.5 h-full bg-base-300 mt-2"></div>
					{/if}
				</div>
				
				<!-- 活動内容 -->
				<div class="flex-1 pb-4">
					<div class="bg-base-200 rounded-lg p-3">
						<div class="flex justify-between items-start">
							<div class="flex-1">
								<div class="flex items-center gap-2">
									<span class="font-semibold text-sm">
										{activity.contactName || activity.companyName || '一般'}
									</span>
									{#if activity.companyName && activity.contactName}
										<span class="text-xs opacity-70">({activity.companyName})</span>
									{/if}
								</div>
								<p class="text-sm mt-1">{activity.description}</p>
								
								{#if activity.outcome}
									<div class="badge badge-sm badge-outline mt-2">{activity.outcome}</div>
								{/if}
								
								{#if activity.nextAction}
									<div class="mt-2 p-2 bg-base-100 rounded text-xs">
										<div class="flex items-center gap-1">
											<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
											</svg>
											次のアクション: {activity.nextAction}
											{#if activity.nextActionDate}
												<span class="opacity-50">({new Date(activity.nextActionDate).toLocaleDateString('ja-JP')})</span>
											{/if}
										</div>
									</div>
								{/if}
								
								{#if activity.type === 'task'}
									<div class="form-control mt-2">
										<label class="label cursor-pointer justify-start gap-2">
											<input 
												type="checkbox" 
												class="checkbox checkbox-sm"
												checked={activity.status === 'completed'}
												onchange={() => toggleTaskComplete(activity)}
											/>
											<span class="label-text text-sm" class:line-through={activity.status === 'completed'}>
												タスク完了
											</span>
										</label>
									</div>
								{/if}
							</div>
							<div class="text-xs opacity-50 ml-2 whitespace-nowrap">
								{getRelativeTime(activity.date)}
							</div>
						</div>
					</div>
				</div>
			</div>
		{/each}
		
		<!-- ローディング表示 -->
		{#if isLoading && activities.length === 0}
			<div class="text-center py-8">
				<div class="loading loading-spinner loading-md mb-2"></div>
				<p class="text-sm opacity-70">活動履歴を読み込んでいます...</p>
			</div>
		{:else if filteredActivities.length === 0 && !isLoading}
			<div class="text-center py-8 opacity-50">
				<svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
				<p>活動履歴がありません</p>
				{#if filterType !== 'all' || entityId}
					<button 
						class="btn btn-sm btn-outline mt-2"
						onclick={resetAndReload}
					>
						フィルタをリセット
					</button>
				{/if}
			</div>
		{/if}
		
		<!-- ページネーションコントロール（limit指定がないフルページ表示のみ） -->
		{#if !limit && hasNextPage}
			<div class="text-center pt-4">
				<button 
					class="btn btn-outline btn-sm gap-2"
					onclick={loadNextPage}
					disabled={isLoading}
				>
					{#if isLoading}
						<div class="loading loading-spinner loading-xs"></div>
						読み込み中...
					{:else}
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
						</svg>
						さらに読み込む ({currentPage + 1}/{totalPages})
					{/if}
				</button>
			</div>
		{:else if !limit && !hasNextPage && activities.length > 0}
			<div class="text-center pt-4 text-sm opacity-50">
				すべての活動履歴を表示しました
			</div>
		{/if}
	</div>
</div>

<!-- 活動記録モーダル -->
{#if showActivityRecorder && selectedEntity}
<input type="checkbox" id="activity-recorder-modal" class="modal-toggle" bind:checked={showActivityRecorder} />
<div class="modal">
	<div class="modal-box max-w-2xl">
		<h3 class="font-bold text-lg mb-4">活動を記録</h3>
		
		<ActivityRecorder 
			entity={selectedEntity}
			entityType={entityType || 'general'}
			onClose={() => showActivityRecorder = false}
			onSave={() => {
				// 保存後にデータを再読み込み
				if (!limit) {
					resetAndReload();
				}
				showActivityRecorder = false;
			}}
		/>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={() => showActivityRecorder = false}>close</button>
	</form>
</div>
{/if}