<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	let { expanded = $bindable(false) } = $props();

	interface MenuItem {
		type: 'link' | 'submenu' | 'divider';
		text: string;
		path?: string;
		icon: string;
		children?: MenuItem[];
		badge?: string;
		badgeType?: 'error' | 'warning' | 'success' | 'info';
	}

	interface MenuSection {
		title: string;
		items: MenuItem[];
	}

	// 元のサイドバーのメニューデータを使用
	const menuData: MenuSection[] = [
		{
			title: 'ダッシュボード',
			items: [
				{
					type: 'link',
					text: 'ダッシュボード',
					path: '/',
					icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
				}
			]
		},
		{
			title: 'サンプルページ',
			items: [
				{
					type: 'link',
					text: '開発用Playground',
					path: '/sample/free01',
					icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
				},
				{
					type: 'submenu',
					text: 'ダッシュボードサンプル',
					path: '/sample/dashboards',
					icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
					children: [
						{
							type: 'link',
							text: '経営管理',
							path: '/sample/dashboards/01',
							icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z'
						},
						{
							type: 'link',
							text: 'プロジェクト管理',
							path: '/sample/dashboards/02',
							icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z'
						}
					]
				}
			]
		},
		{
			title: '設定',
			items: [
				{
					type: 'link',
					text: '設定',
					path: '/settings',
					icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
				}
			]
		}
	];

	let currentPath = $state('');
	let hoveredItem = $state<string | null>(null);
	let clickedItem = $state<string | null>(null);
	let expandedItems: Record<string, boolean> = $state({});

	$effect(() => {
		if (browser) {
			currentPath = $page.url.pathname;
			// 現在のパスに基づいてサブメニューを自動展開
			menuData.forEach(section => {
				section.items.forEach(item => {
					if (item.type === 'submenu' && item.path && currentPath.startsWith(item.path)) {
						expandedItems[item.path] = true;
					}
				});
			});
		}
	});

	function isActive(path: string): boolean {
		return currentPath === path;
	}

	function isParentActive(path: string): boolean {
		return currentPath.startsWith(path + '/');
	}

	function toggleSubmenu(path: string) {
		expandedItems[path] = !expandedItems[path];
	}

	function handleCompactSubmenuClick(path: string) {
		console.log('Submenu clicked:', path);
		if (clickedItem === path) {
			clickedItem = null;
		} else {
			clickedItem = path;
		}
	}
</script>

<nav
	class="bg-base-100 border-r border-base-200 transition-all duration-300 flex flex-col h-screen overflow-hidden"
	class:w-16={!expanded}
	class:w-64={expanded}
	on:mouseleave={() => {
		hoveredItem = null;
		if (!expanded) clickedItem = null;
	}}
>
	<!-- ロゴ (固定) -->
	<div class="h-16 flex items-center justify-center border-b border-base-200 flex-shrink-0">
		{#if expanded}
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
					<span class="text-primary-content font-bold">F0</span>
				</div>
				<span class="font-bold">Admin</span>
			</div>
		{:else}
			<div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
				<span class="text-primary-content font-bold text-lg">F0</span>
			</div>
		{/if}
	</div>

	<!-- ナビゲーションアイテム (スクロール可能) -->
	<div class="flex-1 overflow-y-auto overflow-x-hidden">
		<div class="p-2">
			{#each menuData as section}
				{#if expanded}
					<div class="mb-4">
						<h3 class="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2 px-3">
							{section.title}
						</h3>
						<ul class="space-y-1">
							{#each section.items as item}
								{#if item.type === 'divider'}
									<li class="divider my-2"></li>
								{:else if item.type === 'link' && item.path}
									<li class="relative">
										<a
											href={item.path}
											class="nav-item"
											class:active={isActive(item.path)}
											on:mouseenter={() => (hoveredItem = item.path)}
										>
											<svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
											</svg>
											<span class="flex-1 truncate">{item.text}</span>
											{#if item.badge}
												<span class="badge badge-sm" class:badge-error={item.badgeType === 'error'} class:badge-warning={item.badgeType === 'warning'} class:badge-success={item.badgeType === 'success'} class:badge-info={item.badgeType === 'info'}>
													{item.badge}
												</span>
											{/if}
										</a>
									</li>
								{:else if item.type === 'submenu' && item.path}
									<li>
										<button
											on:click={() => toggleSubmenu(item.path)}
											class="nav-item w-full justify-between"
											class:active={isParentActive(item.path)}
										>
											<div class="flex items-center gap-3 flex-1 min-w-0">
												<svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
												</svg>
												<span class="truncate">{item.text}</span>
											</div>
											<svg
												class="w-4 h-4 transition-transform flex-shrink-0"
												class:rotate-180={expandedItems[item.path]}
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
											</svg>
										</button>
										{#if expandedItems[item.path] && item.children}
											<ul class="ml-8 mt-1 space-y-1">
												{#each item.children as child}
													<li>
														<a
															href={child.path}
															class="nav-item text-sm pl-8"
															class:active={child.path && isActive(child.path)}
														>
															<span class="truncate">{child.text}</span>
														</a>
													</li>
												{/each}
											</ul>
										{/if}
									</li>
								{/if}
							{/each}
						</ul>
					</div>
				{:else}
					<!-- コンパクトモード -->
					{#each section.items as item}
						{#if item.type === 'link' && item.path}
							<div class="relative mb-1">
								<a
									href={item.path}
									class="nav-item justify-center"
									class:active={isActive(item.path)}
									on:mouseenter={() => (hoveredItem = item.path)}
								>
									<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
									</svg>
									{#if item.badge}
										<span class="absolute -top-1 -right-1 badge badge-xs" class:badge-error={item.badgeType === 'error'} class:badge-warning={item.badgeType === 'warning'} class:badge-success={item.badgeType === 'success'} class:badge-info={item.badgeType === 'info'}>
											{item.badge}
										</span>
									{/if}
								</a>

								<!-- ツールチップ -->
								{#if hoveredItem === item.path}
									<div class="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50">
										<div class="bg-base-100 text-base-content px-3 py-2 rounded-lg shadow-lg border border-base-200 whitespace-nowrap">
											<div class="font-medium">{item.text}</div>
										</div>
									</div>
								{/if}
							</div>
						{:else if item.type === 'submenu' && item.path}
							<div class="relative mb-1">
								<button
									class="nav-item justify-center w-full"
									class:active={isParentActive(item.path)}
									on:mouseenter={() => (hoveredItem = item.path)}
									on:click={() => handleCompactSubmenuClick(item.path)}
								>
									<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
									</svg>
								</button>

								<!-- ツールチップ with サブメニュー -->
								{#if hoveredItem === item.path || clickedItem === item.path}
									<div class="absolute left-full ml-2 top-0 z-50">
										<div class="bg-base-100 text-base-content px-3 py-2 rounded-lg shadow-lg border border-base-200">
											<div class="font-medium mb-2">{item.text}</div>
											{#if item.children}
												<div class="space-y-1 border-t border-base-200 pt-2">
													{#each item.children as child}
														<a
															href={child.path}
															class="block px-2 py-1 text-sm rounded hover:bg-base-200 transition-colors"
															class:text-primary={child.path && isActive(child.path)}
															on:click={() => (clickedItem = null)}
														>
															{child.text}
														</a>
													{/each}
												</div>
											{/if}
										</div>
									</div>
								{/if}
							</div>
						{/if}
					{/each}
				{/if}
			{/each}
		</div>
	</div>

	<!-- 展開トグル (固定) -->
	<div class="border-t border-base-200 p-2 flex-shrink-0">
		<button
			on:click={() => (expanded = !expanded)}
			class="nav-item w-full justify-center group"
			aria-label="メニュー展開切替"
		>
			{#if expanded}
				<svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
				</svg>
				<span class="flex-1 text-left">メニューを閉じる</span>
			{:else}
				<svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
				</svg>
			{/if}
		</button>
	</div>
</nav>

<style>
	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem;
		border-radius: 0.5rem;
		color: oklch(var(--bc) / 0.7);
		transition: all 0.15s ease;
		position: relative;
	}

	.nav-item:hover {
		background-color: oklch(var(--b2) / 0.5);
		color: oklch(var(--bc));
	}

	.nav-item.active {
		background-color: oklch(var(--p) / 0.1);
		color: oklch(var(--p));
		font-weight: 500;
	}

	.nav-item.active::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 3px;
		height: 70%;
		background-color: oklch(var(--p));
		border-radius: 0 3px 3px 0;
	}
</style>