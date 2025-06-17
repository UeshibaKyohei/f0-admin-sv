<script lang="ts">
	import '../../../app.css';
	import Sidebar from './Sidebar.svelte';
	import TopBar from './TopBar.svelte';
	import StatusBar from './StatusBar.svelte';
	import { browser } from '$app/environment';

	let { children } = $props();
	let isSidebarCollapsed = $state(false);
	let activeModule = $state('dashboard');

	// サイドバーの折りたたみ状態を保存
	$effect(() => {
		if (browser) {
			const saved = localStorage.getItem('sidebar-collapsed');
			if (saved) {
				isSidebarCollapsed = saved === 'true';
			}
		}
	});

	function toggleSidebar() {
		isSidebarCollapsed = !isSidebarCollapsed;
		if (browser) {
			localStorage.setItem('sidebar-collapsed', String(isSidebarCollapsed));
		}
	}

	function setActiveModule(module: string) {
		activeModule = module;
	}
</script>

<div class="min-h-screen bg-base-200 flex flex-col">
	<!-- トップバー -->
	<TopBar {activeModule} {setActiveModule} />

	<div class="flex flex-1">
		<!-- サイドバー -->
		<Sidebar {isSidebarCollapsed} {toggleSidebar} {activeModule} />

		<!-- メインコンテンツ -->
		<div class="flex-1 flex flex-col">
			<!-- コンテンツエリア -->
			<main class="flex-1 p-6 overflow-auto">
				<div class="max-w-[1920px] mx-auto">
					{@render children()}
				</div>
			</main>

			<!-- ステータスバー -->
			<StatusBar />
		</div>
	</div>
</div>

<style>
	:global(html) {
		font-size: 14px;
	}

	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', sans-serif;
	}

	:global(::-webkit-scrollbar) {
		width: 10px;
		height: 10px;
	}

	:global(::-webkit-scrollbar-track) {
		background: oklch(var(--b2));
	}

	:global(::-webkit-scrollbar-thumb) {
		background: oklch(var(--bc) / 0.3);
		border-radius: 5px;
	}

	:global(::-webkit-scrollbar-thumb:hover) {
		background: oklch(var(--bc) / 0.5);
	}
</style>