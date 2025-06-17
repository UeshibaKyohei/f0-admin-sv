<script lang="ts">
	import '../../../app.css';
	import Sidebar from './Sidebar.svelte';
	import Header from './Header.svelte';
	import { browser } from '$app/environment';

	let { children } = $props();
	let isSidebarOpen = $state(true);
	let isMobile = $state(false);

	// モバイル判定
	$effect(() => {
		if (browser) {
			const checkMobile = () => {
				isMobile = window.innerWidth < 1024;
				if (isMobile) {
					isSidebarOpen = false;
				}
			};
			checkMobile();
			window.addEventListener('resize', checkMobile);
			return () => window.removeEventListener('resize', checkMobile);
		}
	});

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}
</script>

<div class="min-h-screen bg-base-200/30">
	<!-- フローティングサイドバー -->
	<aside
		class="fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out"
		class:translate-x-0={isSidebarOpen}
		class:-translate-x-full={!isSidebarOpen}
	>
		<Sidebar {isMobile} onClose={() => (isSidebarOpen = false)} />
	</aside>

	<!-- オーバーレイ -->
	{#if isMobile && isSidebarOpen}
		<div
			class="fixed inset-0 bg-black/50 z-30 lg:hidden"
			onclick={() => (isSidebarOpen = false)}
			role="button"
			tabindex="0"
			onkeypress={(e) => e.key === 'Enter' && (isSidebarOpen = false)}
		></div>
	{/if}

	<!-- メインコンテンツ -->
	<div
		class="transition-all duration-300 min-h-screen flex flex-col"
		class:lg:ml-64={isSidebarOpen}
		class:lg:ml-0={!isSidebarOpen}
	>
		<!-- ヘッダー -->
		<Header {toggleSidebar} {isSidebarOpen} />

		<!-- コンテンツエリア -->
		<main class="flex-1 p-4 lg:p-8">
			<div class="max-w-[1600px] mx-auto">
				{@render children()}
			</div>
		</main>
	</div>
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}

	:global(::-webkit-scrollbar) {
		width: 8px;
		height: 8px;
	}

	:global(::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(::-webkit-scrollbar-thumb) {
		background: oklch(var(--bc) / 0.1);
		border-radius: 4px;
	}

	:global(::-webkit-scrollbar-thumb:hover) {
		background: oklch(var(--bc) / 0.2);
	}
</style>