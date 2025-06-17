<script lang="ts">
	import { theme, setTheme, getCurrentThemeInfo } from '$lib/stores/theme.js';
	import NotificationDropdown from '$lib/components/NotificationDropdown.svelte';

	let { showCommandPalette = $bindable(false) } = $props();

	let themeInfo = $derived(getCurrentThemeInfo());
	let currentTheme = $derived($theme);
	let searchQuery = $state('');

	const themes = [
		{ value: 'light', label: 'ライト', icon: '☀️' },
		{ value: 'dark', label: 'ダーク', icon: '🌙' },
		{ value: 'cupcake', label: 'カップケーキ', icon: '🧁' },
		{ value: 'synthwave', label: 'シンセウェーブ', icon: '🌃' }
	];
</script>

<header class="h-16 bg-base-100 border-b border-base-200 px-4 flex items-center">
	<!-- 検索バー (左側) -->
	<div class="flex-1 max-w-2xl">
		<div class="relative">
			<input
				type="text"
				placeholder="検索... (⌘K)"
				bind:value={searchQuery}
				class="input input-sm input-bordered w-full pl-10 pr-4"
				onclick={() => (showCommandPalette = true)}
				readonly
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

	<!-- スペーサー (中央を埋める) -->
	<div class="flex-1"></div>

	<!-- 右側要素グループ -->
	<div class="flex items-center gap-4">
		<!-- クイックアクション -->
		<div class="flex items-center gap-2">
			<!-- テーマ切替 -->
			<div class="dropdown dropdown-end">
				<button class="btn btn-ghost btn-xs btn-square" aria-label="テーマ変更">
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
					</svg>
				</button>
				<ul class="dropdown-content mt-2 menu menu-sm bg-base-100 rounded-lg shadow-xl border border-base-200 p-1 w-48">
					{#each themes as themeOption}
						<li>
							<button
								onclick={() => setTheme(themeOption.value)}
								class:active={currentTheme === themeOption.value}
							>
								<span>{themeOption.icon}</span>
								<span>{themeOption.label}</span>
							</button>
						</li>
					{/each}
				</ul>
			</div>

			<!-- 通知 -->
			<NotificationDropdown />

			<!-- ヘルプ -->
			<button class="btn btn-ghost btn-xs btn-square" aria-label="ヘルプ">
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</button>
		</div>

		<div class="divider divider-horizontal mx-0"></div>

		<!-- ユーザー情報 -->
		<div class="flex items-center gap-3">
			<div class="text-right hidden sm:block">
				<div class="text-sm font-medium leading-none">管理者</div>
				<div class="text-xs text-base-content/60">admin@example.com</div>
			</div>
			<div class="dropdown dropdown-end">
				<div class="avatar avatar-placeholder">
					<button class="w-8 h-8 rounded-full bg-primary text-primary-content btn btn-ghost btn-xs p-0">
						<span class="text-sm">管</span>
					</button>
				</div>
				<ul class="dropdown-content mt-2 menu menu-sm bg-base-100 rounded-lg shadow-xl border border-base-200 w-56 p-2">
					<li class="menu-title">
						<div class="flex items-center gap-3 py-2">
							<div class="avatar avatar-placeholder">
								<div class="w-10 h-10 rounded-full bg-primary text-primary-content">
									<span>管</span>
								</div>
							</div>
							<div>
								<div class="font-medium">管理者</div>
								<div class="text-xs text-base-content/60">admin@example.com</div>
							</div>
						</div>
					</li>
					<li class="divider my-1"></li>
					<li><a href="/profile">プロフィール設定</a></li>
					<li><a href="/account">アカウント管理</a></li>
					<li><a href="/billing">請求・支払い</a></li>
					<li class="divider my-1"></li>
					<li><a href="/help">ヘルプセンター</a></li>
					<li><a href="/logout" class="text-error">ログアウト</a></li>
				</ul>
			</div>
		</div>
	</div>
</header>