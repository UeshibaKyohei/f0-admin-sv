<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	let { isMobile = false, onClose = () => {} } = $props();

	interface MenuItem {
		type: 'link' | 'submenu';
		text: string;
		path?: string;
		icon: string;
		children?: MenuItem[];
	}

	interface MenuSection {
		title: string;
		items: MenuItem[];
	}

	const menuData: MenuSection[] = [
		{
			title: 'メイン',
			items: [
				{
					type: 'link',
					text: 'ダッシュボード',
					path: '/',
					icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
				},
				{
					type: 'link',
					text: '分析',
					path: '/analytics',
					icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
				}
			]
		},
		{
			title: 'サンプル',
			items: [
				{
					type: 'submenu',
					text: 'ダッシュボード',
					path: '/sample/dashboards',
					icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
					children: [
						{ type: 'link', text: '経営管理', path: '/sample/dashboards/01', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
						{ type: 'link', text: 'プロジェクト', path: '/sample/dashboards/02', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' }
					]
				}
			]
		}
	];

	let expanded: Record<string, boolean> = $state({});
	let currentPath = $state('');

	$effect(() => {
		if (browser) {
			currentPath = $page.url.pathname;
		}
	});

	function toggleSubmenu(path: string) {
		expanded[path] = !expanded[path];
	}

	function isActive(path: string): boolean {
		return currentPath === path;
	}

	function isParentActive(path: string): boolean {
		return currentPath.startsWith(path + '/');
	}
</script>

<div class="w-64 h-full bg-base-100/95 backdrop-blur-xl shadow-2xl flex flex-col">
	<!-- ロゴエリア -->
	<div class="p-6 border-b border-base-200/50">
		<div class="flex items-center gap-3">
			<div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
				<span class="text-primary-content font-bold text-lg">F0</span>
			</div>
			<div>
				<h1 class="font-bold text-lg">F0 Admin</h1>
				<p class="text-xs text-base-content/60">ミニマリスト版</p>
			</div>
		</div>
	</div>

	<!-- メニュー -->
	<nav class="flex-1 overflow-y-auto p-4">
		{#each menuData as section}
			<div class="mb-6">
				<h3 class="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2 px-3">
					{section.title}
				</h3>
				<ul class="space-y-1">
					{#each section.items as item}
						<li>
							{#if item.type === 'link' && item.path}
								<a
									href={item.path}
									class="menu-item"
									class:active={isActive(item.path)}
									onclick={isMobile ? onClose : undefined}
								>
									<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
									</svg>
									<span>{item.text}</span>
								</a>
							{:else if item.type === 'submenu' && item.path}
								<button
									onclick={() => toggleSubmenu(item.path)}
									class="menu-item w-full justify-between"
									class:active={isParentActive(item.path)}
								>
									<div class="flex items-center gap-3">
										<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
										</svg>
										<span>{item.text}</span>
									</div>
									<svg
										class="w-4 h-4 transition-transform"
										class:rotate-180={expanded[item.path]}
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
									</svg>
								</button>
								{#if expanded[item.path] && item.children}
									<ul class="ml-12 mt-1 space-y-1">
										{#each item.children as child}
											<li>
												<a
													href={child.path}
													class="menu-item text-sm"
													class:active={child.path && isActive(child.path)}
													onclick={isMobile ? onClose : undefined}
												>
													<span>{child.text}</span>
												</a>
											</li>
										{/each}
									</ul>
								{/if}
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</nav>

	<!-- フッター -->
	<div class="p-4 border-t border-base-200/50">
		<button class="w-full btn btn-ghost btn-sm justify-start gap-3">
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span>ヘルプ＆サポート</span>
		</button>
	</div>
</div>

<style>
	.menu-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 0.75rem;
		border-radius: 0.5rem;
		color: oklch(var(--bc) / 0.7);
		transition: all 0.2s ease;
		font-size: 0.875rem;
	}

	.menu-item:hover {
		background-color: oklch(var(--b2) / 0.5);
		color: oklch(var(--bc));
		transform: translateX(2px);
	}

	.menu-item.active {
		background-color: oklch(var(--p) / 0.1);
		color: oklch(var(--p));
		font-weight: 500;
		box-shadow: inset 3px 0 0 0 oklch(var(--p));
	}
</style>