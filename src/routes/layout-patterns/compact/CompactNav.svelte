<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	let { expanded = $bindable(false) } = $props();

	interface NavItem {
		id: string;
		label: string;
		icon: string;
		path?: string;
		children?: { label: string; path: string }[];
		badge?: number;
	}

	const navItems: NavItem[] = [
		{
			id: 'home',
			label: 'ホーム',
			icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
			path: '/'
		},
		{
			id: 'analytics',
			label: '分析',
			icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
			path: '/analytics'
		},
		{
			id: 'customers',
			label: '顧客',
			icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
			path: '/customers',
			badge: 3
		},
		{
			id: 'inventory',
			label: '在庫',
			icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
			path: '/inventory'
		},
		{
			id: 'reports',
			label: 'レポート',
			icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
			path: '/reports'
		},
		{
			id: 'settings',
			label: '設定',
			icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
			path: '/settings'
		}
	];

	let currentPath = $state('');
	let hoveredItem = $state<string | null>(null);

	$effect(() => {
		if (browser) {
			currentPath = $page.url.pathname;
		}
	});

	function isActive(path: string): boolean {
		return currentPath === path;
	}
</script>

<nav
	class="bg-base-100 border-r border-base-200 transition-all duration-300 flex flex-col"
	class:w-16={!expanded}
	class:w-56={expanded}
	onmouseleave={() => (hoveredItem = null)}
>
	<!-- ロゴ -->
	<div class="h-16 flex items-center justify-center border-b border-base-200">
		{#if expanded}
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
					<span class="text-primary-content font-bold">F0</span>
				</div>
				<span class="font-bold">Compact</span>
			</div>
		{:else}
			<div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
				<span class="text-primary-content font-bold text-lg">F0</span>
			</div>
		{/if}
	</div>

	<!-- ナビゲーションアイテム -->
	<div class="flex-1 p-2 space-y-1">
		{#each navItems as item}
			<div class="relative">
				<a
					href={item.path}
					class="nav-item"
					class:active={item.path && isActive(item.path)}
					onmouseenter={() => (hoveredItem = item.id)}
				>
					<svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
					</svg>
					{#if expanded}
						<span class="flex-1">{item.label}</span>
						{#if item.badge}
							<span class="badge badge-primary badge-sm">{item.badge}</span>
						{/if}
					{:else if item.badge}
						<span class="absolute -top-1 -right-1 badge badge-primary badge-xs">{item.badge}</span>
					{/if}
				</a>

				<!-- ツールチップ -->
				{#if !expanded && hoveredItem === item.id}
					<div class="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50">
						<div class="bg-base-100 text-base-content px-3 py-2 rounded-lg shadow-lg border border-base-200 whitespace-nowrap">
							<div class="font-medium">{item.label}</div>
							{#if item.children}
								<div class="mt-2 space-y-1">
									{#each item.children as child}
										<a href={child.path} class="block text-sm text-base-content/70 hover:text-base-content">
											{child.label}
										</a>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- 展開トグル -->
	<div class="p-2 border-t border-base-200">
		<button
			onclick={() => (expanded = !expanded)}
			class="nav-item w-full justify-center"
			aria-label="メニュー展開切替"
		>
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				{#if expanded}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
				{:else}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
				{/if}
			</svg>
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