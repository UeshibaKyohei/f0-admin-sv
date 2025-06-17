<script lang="ts">
	import {
		theme,
		themeColors,
		setTheme,
		getThemeDisplayName,
		getCurrentThemeInfo
	} from '$lib/stores/theme.js';

	let { toggleSidebar, isSidebarOpen = true } = $props();

	let themeInfo = $derived(getCurrentThemeInfo());
	let currentTheme = $derived($theme);
	let themeDropdownOpen = $state(false);
	let searchFocused = $state(false);

	const quickThemes = ['light', 'dark', 'cupcake', 'synthwave'];

	function setQuickTheme(themeName: string) {
		setTheme(themeName);
		themeDropdownOpen = false;
	}
</script>

<header class="sticky top-0 z-20 bg-base-100/80 backdrop-blur-md border-b border-base-200/50">
	<div class="flex items-center justify-between h-16 px-4 lg:px-8">
		<!-- 左側: メニュートグル＋検索 -->
		<div class="flex items-center gap-4 flex-1">
			<button
				onclick={toggleSidebar}
				class="btn btn-ghost btn-sm btn-circle"
				aria-label="メニュー切替"
			>
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					{#if isSidebarOpen}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
					{:else}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					{/if}
				</svg>
			</button>

			<!-- 検索バー -->
			<div class="relative max-w-md flex-1 hidden sm:block">
				<input
					type="text"
					placeholder="検索..."
					class="input input-sm input-bordered w-full pl-10 pr-4 bg-base-200/50 border-base-300/50 focus:bg-base-100 transition-all"
					class:shadow-lg={searchFocused}
					onfocus={() => (searchFocused = true)}
					onblur={() => (searchFocused = false)}
				/>
				<svg
					class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>
		</div>

		<!-- 右側: アクション -->
		<div class="flex items-center gap-2">
			<!-- テーマ切替 -->
			<div class="dropdown dropdown-end">
				<button
					class="btn btn-ghost btn-sm btn-circle"
					onclick={() => (themeDropdownOpen = !themeDropdownOpen)}
					aria-label="テーマ変更"
				>
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
					</svg>
				</button>
				{#if themeDropdownOpen}
					<div class="dropdown-content mt-2 w-48 rounded-xl bg-base-100 shadow-2xl border border-base-200/50 p-2">
						{#each quickThemes as themeName}
							<button
								class="w-full text-left px-3 py-2 rounded-lg hover:bg-base-200/50 flex items-center gap-3 transition-colors"
								class:bg-primary={currentTheme === themeName}
								class:text-primary-content={currentTheme === themeName}
								onclick={() => setQuickTheme(themeName)}
							>
								<div class="flex gap-1">
									{#each Object.values(themeColors[themeName] || themeColors.light).slice(0, 3) as color}
										<div class="w-3 h-3 rounded-full" style="background: {color}"></div>
									{/each}
								</div>
								<span class="text-sm">{getThemeDisplayName(themeName)}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- 通知 -->
			<button class="btn btn-ghost btn-sm btn-circle relative" aria-label="通知">
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
				</svg>
				<span class="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
			</button>

			<!-- ユーザーメニュー -->
			<div class="dropdown dropdown-end">
				<button class="btn btn-ghost btn-sm gap-2 pr-1" aria-label="ユーザーメニュー">
					<div class="avatar avatar-placeholder">
						<div class="w-8 h-8 rounded-full bg-primary text-primary-content">
							<span class="text-sm">管</span>
						</div>
					</div>
					<svg class="w-4 h-4 hidden lg:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>
				<ul class="dropdown-content mt-2 w-56 rounded-xl bg-base-100 shadow-2xl border border-base-200/50 p-2">
					<li class="px-3 py-2">
						<div class="font-medium">管理者</div>
						<div class="text-sm text-base-content/60">admin@example.com</div>
					</li>
					<li class="divider my-1"></li>
					<li><a href="/profile" class="menu-item">プロフィール</a></li>
					<li><a href="/settings" class="menu-item">設定</a></li>
					<li class="divider my-1"></li>
					<li><a href="/logout" class="menu-item text-error">ログアウト</a></li>
				</ul>
			</div>
		</div>
	</div>
</header>

<style>
	.menu-item {
		display: block;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		transition: background-color 0.2s;
	}
	.menu-item:hover {
		background-color: oklch(var(--b2) / 0.5);
	}
</style>