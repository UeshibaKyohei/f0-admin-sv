<script>
	import { onMount } from 'svelte';
	import { CRM_CONFIG } from './config/settings.js';
	import LeadDashboard from './components/LeadDashboard.svelte';
	import DealPipeline from './components/DealPipeline.svelte';
	import CustomerList from './components/CustomerList.svelte';
	import ActivityTimeline from './components/ActivityTimeline.svelte';
	import QuickActions from './components/QuickActions.svelte';
	import EmailTemplates from './components/EmailTemplates.svelte';
	import AnalyticsDashboard from './components/AnalyticsDashboard.svelte';
	import CompactLeadList from './components/CompactLeadList.svelte';
	import CompactPipeline from './components/CompactPipeline.svelte';
	import CompactActivityFeed from './components/CompactActivityFeed.svelte';
	import ToastDemo from './ToastDemo.svelte';
	import { leadStore, dealStore, customerStore, activityStore } from './stores/crmStore.js';
	
	let activeView = $state('dashboard');
	let stats = $state({
		newLeads: 0,
		activeDeals: 0,
		totalCustomers: 0,
		todayActivities: 0
	});
	let todayStats = $state({
		newLeads: 0,
		progressedDeals: CRM_CONFIG.MOCK_MODE ? 3 : 0, // デモ用の固定値またはリアルデータ
		closedDeals: CRM_CONFIG.MOCK_MODE ? 1 : 0, // デモ用の固定値またはリアルデータ
		activities: 0,
		topPerformers: [] // 本日の成果上位者
	});

	onMount(() => {
		// 統計情報の取得
		leadStore.subscribe(leads => {
			const todayLeads = leads.filter(l => {
				const created = new Date(l.createdAt);
				const today = new Date();
				return created.toDateString() === today.toDateString();
			});
			stats.newLeads = todayLeads.length;
			todayStats.newLeads = todayLeads.length;
		});

		dealStore.subscribe(deals => {
			stats.activeDeals = deals.filter(d => d.status !== 'closed_won' && d.status !== 'closed_lost').length;
		});

		customerStore.subscribe(customers => {
			stats.totalCustomers = customers.length;
		});

		activityStore.subscribe(activities => {
			const today = new Date();
			const todayActivities = activities.filter(a => {
				const actDate = new Date(a.date);
				return actDate.toDateString() === today.toDateString();
			});
			stats.todayActivities = todayActivities.length;
			todayStats.activities = todayActivities.length;
			
			// 本日の活動数で営業担当者をランキング
			const performerMap = {};
			todayActivities.forEach(activity => {
				const performer = activity.performedBy || '営業担当1';
				performerMap[performer] = (performerMap[performer] || 0) + 1;
			});
			
			todayStats.topPerformers = Object.entries(performerMap)
				.map(([name, count]) => ({ name, count }))
				.sort((a, b) => b.count - a.count)
				.slice(0, 3);
		});
	});

	// 設定に基づいてメニューアイテムを動的生成
	const menuItems = $derived.by(() => {
		const baseItems = [
			{ id: 'dashboard', label: CRM_CONFIG.LABELS.system.tabs.dashboard, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
			{ id: 'leads', label: CRM_CONFIG.LABELS.system.tabs.leads, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
			{ id: 'deals', label: CRM_CONFIG.LABELS.system.tabs.deals, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
			{ id: 'customers', label: CRM_CONFIG.LABELS.system.tabs.customers, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
			{ id: 'activities', label: CRM_CONFIG.LABELS.system.tabs.activities, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
			{ id: 'emails', label: CRM_CONFIG.LABELS.system.tabs.emails, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
			{ id: 'analytics', label: CRM_CONFIG.LABELS.system.tabs.analytics, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
		];

		// デモ機能が有効な場合のみトーストデモタブを追加
		if (CRM_CONFIG.DEMO_FEATURES.showToastDemo) {
			baseItems.push({
				id: 'toast', 
				label: CRM_CONFIG.LABELS.system.tabs.toast, 
				icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
			});
		}

		return baseItems;
	});
</script>

<div class="min-h-screen bg-base-100">
	<!-- ヘッダー -->
	<div class="bg-base-200 border-b border-base-300">
		<div class="navbar">
			<div class="flex-1">
				<h1 class="text-xl font-bold">{CRM_CONFIG.LABELS.system.title}</h1>
			</div>
			<div class="flex-none gap-2">
				<!-- 統計情報（コンパクト表示） -->
				<div class="stats stats-horizontal shadow">
					<div class="stat place-items-center px-4 py-2">
						<div class="stat-title text-xs">{CRM_CONFIG.LABELS.stats.newLeads}</div>
						<div class="stat-value text-sm text-primary">{stats.newLeads}</div>
					</div>
					<div class="stat place-items-center px-4 py-2">
						<div class="stat-title text-xs">{CRM_CONFIG.LABELS.stats.activeDeals}</div>
						<div class="stat-value text-sm text-secondary">{stats.activeDeals}</div>
					</div>
					<div class="stat place-items-center px-4 py-2">
						<div class="stat-title text-xs">{CRM_CONFIG.LABELS.stats.totalCustomers}</div>
						<div class="stat-value text-sm">{stats.totalCustomers}</div>
					</div>
				</div>
				
				<!-- クイックアクション -->
				<QuickActions />
			</div>
		</div>
		
		<!-- タブナビゲーション -->
		<div class="px-4 pb-2">
			<div class="tabs tabs-boxed bg-base-300 inline-flex">
				{#each menuItems as item}
					<button 
						class="tab gap-2"
						class:tab-active={activeView === item.id}
						onclick={() => activeView = item.id}
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon}></path>
						</svg>
						<span class="hidden sm:inline">{item.label}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- メインコンテンツ -->
	<div class="p-6">
		{#if activeView === 'dashboard'}
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<!-- 最新リード -->
				<div class="card bg-base-200">
					<div class="card-body">
						<div class="flex items-center justify-between mb-4">
							<h2 class="card-title text-base">最新リード</h2>
							<div class="badge badge-primary">{stats.newLeads} 件（本日）</div>
						</div>
						<CompactLeadList 
							onLeadClick={(lead) => {
								// リード管理タブに切り替えて、該当リードを表示
								activeView = 'leads';
								// TODO: リード詳細表示の実装が必要な場合は、selectedLeadIdなどの状態を追加
							}}
							onShowAll={() => {
								// リード管理タブに切り替え
								activeView = 'leads';
							}}
						/>
					</div>
				</div>

				<!-- 商談パイプライン -->
				<div class="card bg-base-200 lg:col-span-2">
					<div class="card-body">
						<h2 class="card-title text-base mb-4">商談パイプライン</h2>
						<CompactPipeline 
							onDealClick={(deal) => {
								// 商談管理タブに切り替え
								activeView = 'deals';
								// TODO: 商談詳細表示の実装が必要な場合は、selectedDealIdなどの状態を追加
							}}
							onShowPipeline={() => {
								// 商談管理タブに切り替え
								activeView = 'deals';
							}}
						/>
					</div>
				</div>

				<!-- 最近の活動 -->
				<div class="card bg-base-200 lg:col-span-2">
					<div class="card-body">
						<div class="flex items-center justify-between mb-4">
							<h2 class="card-title text-base">最近の活動</h2>
							<div class="badge">{stats.todayActivities} 件（本日）</div>
						</div>
						<CompactActivityFeed 
							onShowAll={() => {
								// 活動履歴タブに切り替え
								activeView = 'activities';
							}}
						/>
					</div>
				</div>

				<!-- クイック統計 -->
				<div class="card bg-base-200">
					<div class="card-body">
						<h2 class="card-title text-base mb-4">本日の成果（全社）</h2>
						<div class="space-y-4">
							<div class="flex justify-between items-center">
								<span class="text-sm opacity-70">新規リード</span>
								<span class="text-xl font-bold text-primary">{todayStats.newLeads}</span>
							</div>
							<div class="flex justify-between items-center">
								<span class="text-sm opacity-70">商談進展</span>
								<span class="text-xl font-bold text-secondary">{todayStats.progressedDeals}</span>
							</div>
							<div class="flex justify-between items-center">
								<span class="text-sm opacity-70">成約</span>
								<span class="text-xl font-bold text-success">{todayStats.closedDeals}</span>
							</div>
							<div class="divider my-2"></div>
							<div class="flex justify-between items-center">
								<span class="text-sm opacity-70">活動数合計</span>
								<span class="text-xl font-bold">{todayStats.activities}</span>
							</div>
							
							{#if todayStats.topPerformers.length > 0}
								<div class="mt-4 pt-2 border-t border-base-300">
									<p class="text-xs font-semibold opacity-70 mb-2">本日の活動数TOP</p>
									{#each todayStats.topPerformers as performer, i}
										<div class="flex justify-between items-center py-1">
											<span class="text-xs">
												<span class="font-semibold">{i + 1}.</span> {performer.name}
											</span>
											<span class="text-xs font-bold">{performer.count}件</span>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{:else if activeView === 'leads'}
			<LeadDashboard />
		{:else if activeView === 'deals'}
			<DealPipeline />
		{:else if activeView === 'customers'}
			<CustomerList 
				onSwitchToDeals={() => activeView = 'deals'}
			/>
		{:else if activeView === 'activities'}
			<ActivityTimeline />
		{:else if activeView === 'emails'}
			<EmailTemplates />
		{:else if activeView === 'analytics'}
			<AnalyticsDashboard />
		{:else if activeView === 'toast'}
			<ToastDemo />
		{/if}
	</div>
</div>