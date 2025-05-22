<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	// メニュー関連の状態管理
	type MenuKeys = 'ecommerce';
	interface MenuState {
		expanded: Record<MenuKeys, boolean>;
		currentPath: string;
	}
	
	// メニュー状態を一元管理
	let menuState = $state<MenuState>({
		expanded: {
			ecommerce: false
		},
		currentPath: ''
	});
	
	// 現在のパスを監視して状態を更新
	$effect(() => {
		const path = $page.url.pathname;
		menuState.currentPath = path;
		
		// パスに基づいてサブメニューの開閉状態を自動更新
		if (path.startsWith('/ecommerce/')) {
			menuState.expanded.ecommerce = true;
		}
	});

	// サブメニューの開閉
	function toggleSubmenu(menu: MenuKeys) {
		menuState.expanded[menu] = !menuState.expanded[menu];
	}

	// メニュー項目がアクティブかどうかを判定
	function isMenuActive(path: string): boolean {
		// サーバーサイドレンダリング時はfalseを返す
		if (!browser) return false;
		
		// 完全一致の場合はアクティブ
		return menuState.currentPath === path;
	}
	
	// 親メニューがアクティブかどうかを判定
	function isParentMenuActive(path: string): boolean {
		// サーバーサイドレンダリング時はfalseを返す
		if (!browser) return false;
		
		// 親パスが完全一致の場合もアクティブ
		if (menuState.currentPath === path) return true;
		
		// 現在のパスが親パスで始まる場合はアクティブ
		return menuState.currentPath.startsWith(path + '/');
	}
</script>

<aside class="bg-gradient-to-b from-base-100 to-base-100/95 backdrop-blur-md w-72 min-h-screen flex flex-col shadow-xl">
	<!-- ロゴ部分 -->
	<div class="p-5">
		<div class="flex items-center gap-3">
			<div class="w-8 h-8 rounded-lg bg-primary grid place-items-center">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-content" viewBox="0 0 20 20" fill="currentColor">
					<path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
				</svg>
			</div>
			<div class="text-xl font-bold">F0 Admin</div>
		</div>
	</div>

	<!-- 検索ボックス -->
	<div class="px-5 pb-4">
		<div class="relative">
			<input type="text" placeholder="検索..." class="input input-sm input-bordered w-full pl-9" />
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
		</div>
	</div>

	<!-- メニュー -->
	<div class="overflow-y-auto flex-1 py-3 px-3">
		<div class="px-2 mb-1">
			<h3 class="text-xs font-semibold text-base-content/50 uppercase tracking-wider">ダッシュボード</h3>
		</div>

		<nav>
			<ul class="space-y-1 px-2">
				<li>
					<a href="/" class="sidebar-link group" class:active={isMenuActive('/')}>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
						</svg>
						<span>ダッシュボード</span>
					</a>
				</li>
			</ul>
		</nav>

		<div class="px-2 mt-6 mb-1">
			<h3 class="text-xs font-semibold text-base-content/50 uppercase tracking-wider">アプリケーション</h3>
		</div>

		<nav>
			<ul class="space-y-1 px-2">
				<li>
					<a href="/users" class="sidebar-link group" class:active={isMenuActive('/users')}>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
						</svg>
						<span>ユーザー管理</span>
					</a>
				</li>
				<li>
					<a href="/analytics" class="sidebar-link group" class:active={isMenuActive('/analytics')}>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
						</svg>
						<span>分析</span>
					</a>
				</li>
				<!-- ECサイトメニュー（サブメニュー付き） -->
				<li>
					<button 
						onclick={() => toggleSubmenu('ecommerce')} 
						class="sidebar-link group w-full text-left flex justify-between items-center {isParentMenuActive('/ecommerce') ? 'active' : ''}"
					>
						<div class="flex items-center gap-2.5">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
							</svg>
							<span>ECサイト</span>
						</div>
						<svg 
							xmlns="http://www.w3.org/2000/svg" 
							class="h-4 w-4 transition-transform duration-200 {menuState.expanded.ecommerce ? 'rotate-180' : ''}" 
							fill="none" 
							viewBox="0 0 24 24" 
							stroke="currentColor"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</button>
					{#if menuState.expanded.ecommerce}
						<ul class="mt-1 ml-4 pl-4 border-l border-base-200/50 space-y-1">
							<li>
								<a 
									href="/ecommerce/orders" 
									class="sidebar-link text-sm group {isMenuActive('/ecommerce/orders') ? 'active' : ''}"
								>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
									</svg>
									<span>注文管理</span>
								</a>
							</li>
							<li>
								<a 
									href="/ecommerce/products" 
									class="sidebar-link text-sm group {isMenuActive('/ecommerce/products') ? 'active' : ''}"
								>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
									</svg>
									<span>商品管理</span>
								</a>
							</li>
							<li>
								<a 
									href="/ecommerce/dashboard" 
									class="sidebar-link text-sm group {isMenuActive('/ecommerce/dashboard') ? 'active' : ''}"
								>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
									</svg>
									<span>ダッシュボード</span>
								</a>
							</li>
							<li>
								<a 
									href="/ecommerce/customers" 
									class="sidebar-link text-sm group {isMenuActive('/ecommerce/customers') ? 'active' : ''}"
								>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
									</svg>
									<span>顧客管理</span>
								</a>
							</li>
							<li>
								<a 
									href="/ecommerce/inventory" 
									class="sidebar-link text-sm group {isMenuActive('/ecommerce/inventory') ? 'active' : ''}"
								>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
									</svg>
									<span>在庫管理</span>
								</a>
							</li>
						</ul>
					{/if}
				</li>
			</ul>
		</nav>

		<div class="px-2 mt-6 mb-1">
			<h3 class="text-xs font-semibold text-base-content/50 uppercase tracking-wider">設定</h3>
		</div>

		<nav>
			<ul class="space-y-1 px-2">
				<li>
					<a href="/settings" class="sidebar-link group" class:active={isMenuActive('/settings')}>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
						<span>設定</span>
					</a>
				</li>
			</ul>
		</nav>
	</div>

	<!-- ユーザープロフィール -->
	<div class="p-3 mt-auto">
		<div class="flex items-center p-2 rounded-lg bg-base-200/30 gap-3">
			<div class="avatar avatar-placeholder">
				<div class="w-9 h-9 rounded-full bg-primary text-primary-content grid place-items-center">
					<span class="text-sm">管</span>
				</div>
			</div>
			<div class="flex-1 min-w-0">
				<p class="font-medium text-sm truncate">管理者</p>
				<p class="text-xs text-base-content/50 truncate">admin@example.com</p>
			</div>
			<div class="dropdown dropdown-top dropdown-end">
				<div role="button" class="btn btn-ghost btn-xs btn-circle" aria-label="ユーザーメニュー">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
					</svg>
				</div>
				<ul class="dropdown-content z-10 menu menu-sm shadow bg-base-100 rounded-box w-48 p-2">
					<li><a href="/profile">プロフィール編集</a></li>
					<li><a href="/settings">設定</a></li>
					<li class="mt-1 border-t border-base-200/50 pt-1"><a href="/logout" class="text-error">ログアウト</a></li>
				</ul>
			</div>
		</div>
	</div>
</aside>
