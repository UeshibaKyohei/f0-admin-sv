<script lang="ts">
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';

	let { children } = $props();
	let isSidebarOpen = $state(false);
	
	// サイドバーの開閉
	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}
</script>

<div class="drawer lg:drawer-open">
	<input id="drawer-toggle" type="checkbox" class="drawer-toggle" bind:checked={isSidebarOpen} />

	<!-- メインコンテンツ -->
	<div class="drawer-content flex flex-col min-h-screen">
		<!-- ヘッダー -->
		<header class="navbar bg-base-100/95 border-b border-base-200/30 h-14 px-3 sticky top-0 z-30 backdrop-blur-sm">
			<div class="flex-none lg:hidden">
				<label for="drawer-toggle" class="btn btn-sm btn-square btn-ghost" aria-label="メニューを開く">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="inline-block w-4 h-4 stroke-current"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</label>
			</div>
			<div class="flex-1">
				<span class="text-base font-medium">管理画面</span>
			</div>
			<div class="flex-none flex items-center gap-3">
				<div class="hidden md:flex items-center gap-1">
					<button class="btn btn-sm btn-ghost btn-circle" aria-label="通知を表示">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
						</svg>
					</button>
					<div class="badge badge-sm badge-primary">3</div>
				</div>

				<div class="dropdown dropdown-end">
					<div role="button" class="btn btn-ghost btn-sm btn-circle avatar avatar-placeholder" aria-label="ユーザーメニューを開く">
						<div class="w-8 h-8 rounded-full bg-primary text-primary-content grid place-items-center">
							<span class="text-sm">管</span>
						</div>
					</div>
					<ul
						class="mt-2 z-10 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-lg w-48"
					>
						<li><a href="/profile">プロフィール</a></li>
						<li><a href="/settings">設定</a></li>
						<li class="mt-1 border-t border-base-200/50 pt-1"><a href="/logout" class="text-error">ログアウト</a></li>
					</ul>
				</div>
			</div>
		</header>

		<!-- メインコンテンツエリア -->
		<main class="flex-grow p-4 md:p-6 bg-base-200/30">
			<div class="max-w-7xl mx-auto">
				{@render children()}
			</div>
		</main>

		<!-- フッター -->
		<footer class="footer footer-center p-4 bg-base-100 text-base-content border-t border-base-200/30">
			<div class="flex flex-col md:flex-row justify-between w-full">
				<div class="text-xs text-base-content/70">
					© 2025 F0 Admin. All rights reserved.
				</div>
				<div class="flex gap-4 md:ml-6">
					<a href="/terms" class="link link-hover text-xs">利用規約</a>
					<a href="/privacy" class="link link-hover text-xs">プライバシーポリシー</a>
				</div>
			</div>
		</footer>
	</div>

	<!-- サイドバー -->
	<div class="drawer-side z-10">
		<label for="drawer-toggle" aria-label="close sidebar" class="drawer-overlay"></label>
		<Sidebar />
	</div>
</div>