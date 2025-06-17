<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import Sidebar from './Sidebar.svelte';
	import {
		theme,
		availableThemes,
		themeColors,
		setTheme,
		getThemeDisplayName,
		getCurrentThemeInfo
	} from '$lib/stores/theme.js';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let { children } = $props();
	let isSidebarOpen = $state(false);

	// Svelte 5の$derivedを使用してリアクティブな値を定義
	let themeInfo = $derived(getCurrentThemeInfo());
	let currentTheme = $derived($theme);

	// テーマスイッチャーの表示状態
	let themeDropdownOpen = $state(false);
	let themeDropdownElement: HTMLElement | undefined;

	// 簡易テーマスイッチャー（ヘッダー用）
	const quickThemes = ['light', 'dark', 'cupcake', 'synthwave', 'cyberpunk', 'forest'];

	// サイドバーの開閉
	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	function setQuickTheme(themeName: string) {
		setTheme(themeName);
		themeDropdownOpen = false;
	}

	// アウトサイドクリックでドロップダウンを閉じる
	function handleOutsideClick(event: MouseEvent) {
		if (themeDropdownElement && !themeDropdownElement.contains(event.target as Node)) {
			themeDropdownOpen = false;
		}
	}

	onMount(() => {
		if (browser) {
			// テーマが正しく適用されているかチェック
			const currentThemeValue = document.documentElement.getAttribute('data-theme');
			console.log('Current theme applied:', currentThemeValue);

			// アウトサイドクリック監視
			document.addEventListener('click', handleOutsideClick);
			return () => {
				document.removeEventListener('click', handleOutsideClick);
			};
		}
	});
</script>

<svelte:head>
	<meta name="theme-color" content={themeInfo.colors.primary} />
</svelte:head>

<div class="drawer lg:drawer-open">
	<input id="drawer-toggle" type="checkbox" class="drawer-toggle" bind:checked={isSidebarOpen} />

	<!-- メインコンテンツ -->
	<div class="drawer-content flex min-h-screen flex-col">
		<!-- ヘッダー -->
		<header
			class="navbar bg-base-100/95 border-base-200/30 sticky top-0 z-30 h-14 border-b px-3 backdrop-blur-sm"
		>
			<div class="flex-none lg:hidden">
				<label
					for="drawer-toggle"
					class="btn btn-sm btn-square btn-ghost"
					aria-label="メニューを開く"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="inline-block h-4 w-4 stroke-current"
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
			<div class="flex flex-none items-center gap-3">
				<!-- テーマスイッチャー -->
				<div class="dropdown dropdown-end" bind:this={themeDropdownElement}>
					<div
						role="button"
						tabindex="0"
						class="btn btn-ghost btn-sm gap-1"
						class:bg-base-300={themeDropdownOpen}
						onclick={() => (themeDropdownOpen = !themeDropdownOpen)}
						onkeydown={(e) => e.key === 'Enter' && (themeDropdownOpen = !themeDropdownOpen)}
						aria-label="テーマを変更"
					>
						<!-- 現在のテーマカラー表示 -->
						<div class="flex gap-0.5">
							{#each Object.values(themeInfo.colors).slice(0, 3) as color}
								<div
									class="border-base-content/30 h-2 w-2 rounded-full border"
									style="background: {color}"
								></div>
							{/each}
						</div>

						<span class="hidden text-xs sm:inline">{themeInfo.displayName}</span>

						<!-- ドロップダウン矢印 -->
						<svg
							class="h-3 w-3 fill-current transition-transform"
							class:rotate-180={themeDropdownOpen}
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
						>
							<path d="M7 10l5 5 5-5z" />
						</svg>
					</div>

					<!-- ドロップダウンメニュー -->
					{#if themeDropdownOpen}
						<div
							class="dropdown-content bg-base-200 rounded-box border-base-300 z-[1] mt-2 w-64 border p-3 shadow-2xl"
						>
							<div class="text-base-content/70 mb-3 text-sm font-medium">クイックテーマ選択</div>

							<!-- クイックテーマボタン -->
							<div class="mb-3 grid grid-cols-2 gap-2">
								{#each quickThemes as themeName}
									<button
										class="btn btn-xs h-auto min-h-[2rem] justify-start gap-1 p-2"
										class:btn-primary={currentTheme === themeName}
										class:btn-ghost={currentTheme !== themeName}
										onclick={() => setQuickTheme(themeName)}
									>
										<!-- テーマカラー -->
										<div class="flex gap-0.5">
											{#each Object.values(themeColors[themeName] || themeColors.light).slice(0, 2) as color}
												<div
													class="h-1.5 w-1.5 rounded-full border border-white/30"
													style="background: {color}"
												></div>
											{/each}
										</div>
										<span class="text-xs">{getThemeDisplayName(themeName)}</span>
									</button>
								{/each}
							</div>

							<!-- 詳細設定へのリンク -->
							<div class="divider my-2"></div>
							<a
								href="/theme-settings"
								class="btn btn-outline btn-xs w-full"
								onclick={() => (themeDropdownOpen = false)}
							>
								🎨 詳細なテーマ設定
							</a>
						</div>
					{/if}
				</div>

				<div class="hidden items-center gap-1 md:flex">
					<button class="btn btn-sm btn-ghost btn-circle" aria-label="通知を表示">
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
								d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
							/>
						</svg>
					</button>
					<div class="badge badge-sm badge-primary">3</div>
				</div>

				<div class="dropdown dropdown-end">
					<div
						role="button"
						class="btn btn-ghost btn-sm btn-circle avatar avatar-placeholder"
						aria-label="ユーザーメニューを開く"
					>
						<div
							class="bg-primary text-primary-content grid h-8 w-8 place-items-center rounded-full"
						>
							<span class="text-sm">管</span>
						</div>
					</div>
					<ul
						class="menu menu-sm dropdown-content bg-base-100 z-10 mt-2 w-48 rounded-lg p-2 shadow"
					>
						<li><a href="/profile">プロフィール</a></li>
						<li><a href="/settings">設定</a></li>
						<li><a href="/theme-settings">🎨 テーマ設定</a></li>
						<li class="border-base-200/50 mt-1 border-t pt-1">
							<a href="/logout" class="text-error">ログアウト</a>
						</li>
					</ul>
				</div>
			</div>
		</header>

		<!-- メインコンテンツエリア -->

		<main class="flex-grow p-2 md:p-3 bg-base-200/30">
			<div class="max-w-full mx-auto">
				{@render children()}
			</div>
		</main>

		<!-- フッター -->
		<footer
			class="footer footer-center bg-base-100 text-base-content border-base-200/30 border-t p-4"
		>
			<div class="flex w-full flex-col justify-between md:flex-row">
				<div class="text-base-content/70 text-xs">
					© 2025 F0 Admin. All rights reserved. - {themeInfo.displayName}テーマ
				</div>
				<div class="flex gap-4 md:ml-6">
					<a href="/terms" class="link link-hover text-xs">利用規約</a>
					<a href="/privacy" class="link link-hover text-xs">プライバシーポリシー</a>
					<a href="/theme-settings" class="link link-hover text-xs">テーマ設定</a>
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

<!-- グローバルスタイル -->
<style>
	:global(html) {
		scroll-behavior: smooth;
	}

	/* スクロールバーのスタイリング */
	:global(html) {
		scrollbar-width: thin;
		scrollbar-color: oklch(var(--bc) / 0.2) transparent;
	}

	:global(::-webkit-scrollbar) {
		width: 6px;
	}

	:global(::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(::-webkit-scrollbar-thumb) {
		background: oklch(var(--bc) / 0.2);
		border-radius: 3px;
	}

	:global(::-webkit-scrollbar-thumb:hover) {
		background: oklch(var(--bc) / 0.3);
	}
</style>