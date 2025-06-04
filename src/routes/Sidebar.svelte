<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	// メニュー関連の状態管理を簡素化
	interface MenuState {
		expanded: Record<string, boolean>;
		currentPath: string;
	}

	// メニュー構造の定義
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

	// メニューデータの定義（keyプロパティを削除）
	const menuData: MenuSection[] = [
		{
			title: 'ダッシュボード',
			items: [
				{
					type: 'link',
					text: 'ダッシュボード',
					path: '/',
					icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />'
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
					icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />'
				},
				{
					type: 'submenu',
					text: 'ダッシュボードサンプル',
					path: '/sample/dashboards',
					icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />',
					children: [
						{
							type: 'link',
							text: '経営管理',
							path: '/sample/dashboards/01',
							icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />'
						},
						{
							type: 'link',
							text: 'プロジェクト管理',
							path: '/sample/dashboards/02',
							icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />'
						},
						{
							type: 'link',
							text: 'カスタマーサクセス',
							path: '/sample/dashboards/03',
							icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />'
						},
						{
							type: 'link',
							text: '在庫・物流',
							path: '/sample/dashboards/04',
							icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />'
						},
						{
							type: 'link',
							text: '人事・労務',
							path: '/sample/dashboards/05',
							icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />'
						},
						{
							type: 'link',
							text: 'AI統合管理',
							path: '/sample/dashboards/06',
							icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />'
						}
					]
				},
				{
					type: 'submenu',
					text: '汎用系データコントロール',
					path: '/sample/data-management',
					icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />',
					children: [
						{
							type: 'link',
							text: 'ファイル管理',
							path: '/sample/data-management/file-explorer',
							icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />'
						},
						{
							type: 'link',
							text: '従業員管理',
							path: '/sample/data-management/employee01',
							icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />'
						},
						{
							type: 'link',
							text: '商品管理',
							path: '/sample/data-management/product01',
							icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />'
						},
						{
							type: 'link',
							text: '在庫管理',
							path: '/sample/data-management/zaiko',
							icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />'
						},
					]
				},
				{
					type: 'submenu',
					text: '特殊系画面',
					path: '/sample/special',
					icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />',
					children: [
						{
							type: 'link',
							text: 'AIチャットUI',
							path: '/sample/special/ai-chat',
							icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16v-6a2 2 0 1 1 4 0v6M8 13h4M16 8v8" />'
						},
						{
							type: 'link',
							text: 'カスタマーサポートチャット',
							path: '/sample/special/chat',
							icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />'
						},
						{
							type: 'link',
							text: '工場トレーサビリティ',
							path: '/sample/special/traceability',
							icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />'
						},
					]
				},
				{
					type: 'submenu',
					text: 'DaisyUI Tips',
					path: '/sample/daisy',
					icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />',
					children: [
						{
							type: 'link',
							text: 'Theme',
							path: '/sample/daisy/theme',
							icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />'
						},
						{
							type: 'link',
							text: 'Form',
							path: '/sample/daisy/form',
							icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />'
						},
						{
							type: 'link',
							text: 'Calendar',
							path: '/sample/daisy/calendar',
							icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />'
						},
						{
							type: 'link',
							text: 'CRUD Table',
							path: '/sample/daisy/product',
							icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />'
						}
					]
				},
				
			]
		},
		{
			title: '設定',
			items: [
				{
					type: 'link',
					text: '設定',
					path: '/settings',
					icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />'
				}
			]
		}
	];

	// メニューからパスベースのキーを自動生成するヘルパー関数
	function getSubmenuKey(path: string): string {
		// パスから一意のキーを生成（例: "/sample/ecommerce" → "sample_ecommerce"）
		return path.replace(/^\//, '').replace(/\//g, '_');
	}

	// 初期展開状態を構築する関数
	function buildInitialExpandedState(): Record<string, boolean> {
		const expanded: Record<string, boolean> = {};

		function processItems(items: MenuItem[]) {
			items.forEach((item) => {
				if (item.type === 'submenu' && item.path) {
					expanded[getSubmenuKey(item.path)] = false;
				}
				if (item.children) {
					processItems(item.children);
				}
			});
		}

		menuData.forEach((section) => processItems(section.items));
		return expanded;
	}

	// メニュー状態を一元管理
	let menuState = $state<MenuState>({
		expanded: buildInitialExpandedState(),
		currentPath: ''
	});

	// 現在のパスを監視して状態を更新
	$effect(() => {
		const path = $page.url.pathname;
		menuState.currentPath = path;

		// パスに基づいてサブメニューの開閉状態を自動更新
		function updateExpandedState(items: MenuItem[]) {
			items.forEach((item) => {
				if (item.type === 'submenu' && item.path) {
					const key = getSubmenuKey(item.path);
					// 現在のパスがサブメニューのパス配下にある場合は展開
					if (path.startsWith(item.path + '/')) {
						menuState.expanded[key] = true;
					}
				}
				if (item.children) {
					updateExpandedState(item.children);
				}
			});
		}

		menuData.forEach((section) => updateExpandedState(section.items));
	});

	// サブメニューの開閉
	function toggleSubmenu(path: string) {
		const key = getSubmenuKey(path);
		menuState.expanded[key] = !menuState.expanded[key];
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

	// サブメニューが展開されているかチェック
	function isSubmenuExpanded(path: string): boolean {
		const key = getSubmenuKey(path);
		return menuState.expanded[key] || false;
	}
</script>

<aside
	class="from-base-100 to-base-100/95 flex min-h-screen w-72 flex-col bg-gradient-to-b shadow-xl backdrop-blur-md"
>
	<!-- ロゴ部分 -->
	<div class="p-5">
		<div class="flex items-center gap-3">
			<div class="bg-primary grid h-8 w-8 place-items-center rounded-lg">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="text-primary-content h-5 w-5"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"
					/>
				</svg>
			</div>
			<div class="text-xl font-bold">F0 Admin</div>
		</div>
	</div>

	<!-- 検索ボックス -->
	<div class="px-5 pb-4">
		<div class="relative">
			<input type="text" placeholder="検索..." class="input input-sm input-bordered w-full pl-9" />
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="text-base-content/50 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				/>
			</svg>
		</div>
	</div>

	<!-- メニュー -->
	<div class="flex-1 overflow-y-auto px-3 py-3">
		{#each menuData as section}
			<div class="px-2 {section.title !== menuData[0].title ? 'mt-6' : ''} mb-1">
				<h3 class="text-base-content/50 text-xs font-semibold tracking-wider uppercase">
					{section.title}
				</h3>
			</div>

			<nav>
				<ul class="space-y-1 px-2">
					{#each section.items as item}
						<li>
							{#if item.type === 'link' && item.path}
								<a
									href={item.path}
									class="sidebar-link group"
									class:active={isMenuActive(item.path)}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										{@html item.icon}
									</svg>
									<span>{item.text}</span>
								</a>
							{:else if item.type === 'submenu' && item.path}
								<button
									onclick={() => toggleSubmenu(item.path)}
									class="sidebar-link group flex w-full items-center justify-between text-left {isParentMenuActive(
										item.path
									)
										? 'active'
										: ''}"
								>
									<div class="flex items-center gap-3">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-5 w-5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											{@html item.icon}
										</svg>
										<span>{item.text}</span>
									</div>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4 transition-transform duration-200 {isSubmenuExpanded(item.path)
											? 'rotate-180'
											: ''}"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</button>
								{#if isSubmenuExpanded(item.path) && item.children}
									<ul class="border-base-200/50 mt-1 ml-4 space-y-1 border-l pl-4">
										{#each item.children as child}
											<li>
												<a
													href={child.path || '#'}
													class="sidebar-link group text-sm {child.path
														? isMenuActive(child.path)
															? 'active'
															: ''
														: ''}"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														class="h-4 w-4"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														{@html child.icon}
													</svg>
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
			</nav>
		{/each}
	</div>

	<!-- ユーザープロフィール -->
	<div class="mt-auto p-3">
		<div class="bg-base-200/30 flex items-center gap-3 rounded-lg p-2">
			<div class="avatar avatar-placeholder">
				<div class="bg-primary text-primary-content grid h-9 w-9 place-items-center rounded-full">
					<span class="text-sm">管</span>
				</div>
			</div>
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-medium">管理者</p>
				<p class="text-base-content/50 truncate text-xs">admin@example.com</p>
			</div>
			<div class="dropdown dropdown-top dropdown-end">
				<div role="button" class="btn btn-ghost btn-xs btn-circle" aria-label="ユーザーメニュー">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
						/>
					</svg>
				</div>
				<ul class="dropdown-content menu menu-sm bg-base-100 rounded-box z-10 w-48 p-2 shadow">
					<li><a href="/profile">プロフィール編集</a></li>
					<li><a href="/settings">設定</a></li>
					<li class="border-base-200/50 mt-1 border-t pt-1">
						<a href="/logout" class="text-error">ログアウト</a>
					</li>
				</ul>
			</div>
		</div>
	</div>
</aside>
