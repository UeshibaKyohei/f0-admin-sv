<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	let { isSidebarCollapsed = false, toggleSidebar, activeModule = 'dashboard' } = $props();

	interface MenuItem {
		type: 'link' | 'submenu' | 'divider';
		text?: string;
		path?: string;
		icon?: string;
		badge?: string;
		badgeType?: 'error' | 'warning' | 'success' | 'info';
		children?: MenuItem[];
	}

	// モジュールごとのメニュー定義
	const moduleMenus: Record<string, MenuItem[]> = {
		dashboard: [
			{ type: 'link', text: '概要', path: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
			{ type: 'link', text: 'KPI分析', path: '/kpi', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
			{ type: 'link', text: 'レポート', path: '/reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', badge: '3', badgeType: 'info' },
			{ type: 'divider' },
			{ type: 'link', text: '設定', path: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
		],
		sales: [
			{ type: 'link', text: '営業概要', path: '/sales', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
			{
				type: 'submenu',
				text: '顧客管理',
				icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
				children: [
					{ type: 'link', text: '顧客一覧', path: '/sales/customers' },
					{ type: 'link', text: '新規登録', path: '/sales/customers/new' },
					{ type: 'link', text: 'インポート', path: '/sales/customers/import' }
				]
			},
			{ type: 'link', text: '商談管理', path: '/sales/deals', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', badge: '12', badgeType: 'warning' },
			{ type: 'link', text: '見積・請求', path: '/sales/invoices', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
		],
		inventory: [
			{ type: 'link', text: '在庫一覧', path: '/inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
			{ type: 'link', text: '入出庫管理', path: '/inventory/movements', icon: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4' },
			{ type: 'link', text: '発注管理', path: '/inventory/orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
			{ type: 'link', text: '倉庫管理', path: '/inventory/warehouses', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
			{ type: 'divider' },
			{ type: 'link', text: '棚卸', path: '/inventory/stocktaking', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' }
		]
	};

	let expanded: Record<string, boolean> = $state({});
	let currentPath = $state('');
	let currentMenu = $derived(moduleMenus[activeModule] || moduleMenus.dashboard);

	$effect(() => {
		if (browser) {
			currentPath = $page.url.pathname;
		}
	});

	function toggleSubmenu(text: string) {
		expanded[text] = !expanded[text];
	}

	function isActive(path: string): boolean {
		return currentPath === path;
	}
</script>

<aside
	class="bg-base-100 border-r border-base-300 transition-all duration-300 flex flex-col"
	class:w-64={!isSidebarCollapsed}
	class:w-16={isSidebarCollapsed}
>
	<!-- ヘッダー -->
	<div class="h-12 flex items-center justify-between px-4 border-b border-base-200">
		{#if !isSidebarCollapsed}
			<h2 class="font-medium">ナビゲーション</h2>
		{/if}
		<button
			onclick={toggleSidebar}
			class="btn btn-ghost btn-xs btn-square"
			aria-label="サイドバー切替"
		>
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				{#if isSidebarCollapsed}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
				{:else}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
				{/if}
			</svg>
		</button>
	</div>

	<!-- メニュー -->
	<nav class="flex-1 overflow-y-auto p-2">
		<ul class="space-y-1">
			{#each currentMenu as item}
				{#if item.type === 'divider'}
					<li class="divider my-2"></li>
				{:else if item.type === 'link' && item.path}
					<li>
						<a
							href={item.path}
							class="menu-item"
							class:active={isActive(item.path)}
							title={isSidebarCollapsed ? item.text : undefined}
						>
							<svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
							</svg>
							{#if !isSidebarCollapsed}
								<span class="flex-1">{item.text}</span>
								{#if item.badge}
									<span class="badge badge-xs" class:badge-error={item.badgeType === 'error'} class:badge-warning={item.badgeType === 'warning'} class:badge-success={item.badgeType === 'success'} class:badge-info={item.badgeType === 'info'}>
										{item.badge}
									</span>
								{/if}
							{/if}
						</a>
					</li>
				{:else if item.type === 'submenu' && item.text && !isSidebarCollapsed}
					<li>
						<button
							onclick={() => toggleSubmenu(item.text)}
							class="menu-item w-full justify-between"
						>
							<div class="flex items-center gap-3">
								<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
								</svg>
								<span>{item.text}</span>
							</div>
							<svg
								class="w-4 h-4 transition-transform"
								class:rotate-180={expanded[item.text]}
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</button>
						{#if expanded[item.text] && item.children}
							<ul class="ml-8 mt-1 space-y-1">
								{#each item.children as child}
									<li>
										<a
											href={child.path}
											class="menu-item text-sm"
											class:active={child.path && isActive(child.path)}
										>
											<span>{child.text}</span>
										</a>
									</li>
								{/each}
							</ul>
						{/if}
					</li>
				{/if}
			{/each}
		</ul>
	</nav>

	<!-- クイックアクション -->
	{#if !isSidebarCollapsed}
		<div class="p-4 border-t border-base-200">
			<button class="btn btn-primary btn-sm btn-block">
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				新規作成
			</button>
		</div>
	{/if}
</aside>

<style>
	.menu-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
		color: oklch(var(--bc) / 0.8);
		transition: all 0.15s ease;
		font-size: 0.875rem;
	}

	.menu-item:hover {
		background-color: oklch(var(--b2) / 0.7);
		color: oklch(var(--bc));
	}

	.menu-item.active {
		background-color: oklch(var(--p) / 0.1);
		color: oklch(var(--p));
		font-weight: 500;
		box-shadow: inset 3px 0 0 0 oklch(var(--p));
	}
</style>