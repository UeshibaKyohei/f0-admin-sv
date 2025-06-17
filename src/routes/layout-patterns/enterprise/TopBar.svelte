<script lang="ts">
	import { theme, setTheme, getCurrentThemeInfo } from '$lib/stores/theme.js';

	let { activeModule, setActiveModule } = $props();

	let themeInfo = $derived(getCurrentThemeInfo());
	let currentTheme = $derived($theme);
	let notificationOpen = $state(false);

	const modules = [
		{ id: 'dashboard', name: 'ダッシュボード', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z' },
		{ id: 'sales', name: '営業管理', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
		{ id: 'inventory', name: '在庫管理', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
		{ id: 'hr', name: '人事管理', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
		{ id: 'finance', name: '財務管理', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' }
	];

	const notifications = [
		{ id: 1, type: 'info', message: '新規受注が3件あります', time: '5分前' },
		{ id: 2, type: 'warning', message: '在庫切れ警告: 商品A-123', time: '15分前' },
		{ id: 3, type: 'success', message: '月次レポートが完成しました', time: '1時間前' }
	];
</script>

<header class="bg-base-100 border-b border-base-300 shadow-sm">
	<!-- 上段: ロゴとユーティリティ -->
	<div class="flex items-center justify-between h-12 px-4 border-b border-base-200">
		<div class="flex items-center gap-4">
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 bg-primary rounded flex items-center justify-center">
					<span class="text-primary-content font-bold">F0</span>
				</div>
				<span class="font-bold text-lg">F0 Enterprise</span>
			</div>
			<div class="divider divider-horizontal mx-0"></div>
			<span class="text-sm text-base-content/60">統合管理システム v2.0</span>
		</div>

		<div class="flex items-center gap-4">
			<!-- 環境インジケーター -->
			<div class="badge badge-success gap-1">
				<span class="w-2 h-2 bg-success rounded-full animate-pulse"></span>
				本番環境
			</div>

			<!-- 通知 -->
			<div class="dropdown dropdown-end">
				<button
					class="btn btn-ghost btn-sm btn-square relative"
					onclick={() => (notificationOpen = !notificationOpen)}
				>
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
					</svg>
					<span class="badge badge-error badge-xs absolute -top-1 -right-1">{notifications.length}</span>
				</button>
				{#if notificationOpen}
					<div class="dropdown-content mt-2 w-80 bg-base-100 rounded-lg shadow-xl border border-base-200 overflow-hidden">
						<div class="p-3 bg-base-200/50 font-medium">通知</div>
						<ul class="max-h-96 overflow-y-auto">
							{#each notifications as notification}
								<li class="border-t border-base-200">
									<button class="w-full p-3 hover:bg-base-200/30 text-left transition-colors">
										<div class="flex items-start gap-3">
											<div class="badge badge-sm" class:badge-info={notification.type === 'info'} class:badge-warning={notification.type === 'warning'} class:badge-success={notification.type === 'success'}>
												{notification.type === 'info' ? 'i' : notification.type === 'warning' ? '!' : '✓'}
											</div>
											<div class="flex-1">
												<p class="text-sm">{notification.message}</p>
												<p class="text-xs text-base-content/60 mt-1">{notification.time}</p>
											</div>
										</div>
									</button>
								</li>
							{/each}
						</ul>
						<div class="p-2 border-t border-base-200">
							<a href="/notifications" class="btn btn-ghost btn-sm btn-block">すべて表示</a>
						</div>
					</div>
				{/if}
			</div>

			<!-- ユーザー情報 -->
			<div class="flex items-center gap-2">
				<div class="text-right hidden lg:block">
					<div class="text-sm font-medium">山田 太郎</div>
					<div class="text-xs text-base-content/60">システム管理者</div>
				</div>
				<div class="dropdown dropdown-end">
					<button class="btn btn-ghost btn-sm btn-circle avatar avatar-placeholder">
						<div class="w-8 h-8 rounded-full bg-primary text-primary-content">
							<span>山</span>
						</div>
					</button>
					<ul class="dropdown-content mt-2 w-48 menu menu-sm bg-base-100 rounded-lg shadow-xl border border-base-200">
						<li><a href="/profile">プロフィール</a></li>
						<li><a href="/settings">設定</a></li>
						<li class="divider my-1"></li>
						<li><a href="/logout" class="text-error">ログアウト</a></li>
					</ul>
				</div>
			</div>
		</div>
	</div>

	<!-- 下段: モジュール切替タブ -->
	<div class="flex items-center h-12 px-4 overflow-x-auto">
		<div class="flex gap-1">
			{#each modules as module}
				<button
					onclick={() => setActiveModule(module.id)}
					class="px-4 py-2 rounded-t-lg flex items-center gap-2 transition-all whitespace-nowrap {activeModule === module.id ? 'bg-base-200 font-medium text-base-content' : 'text-base-content/60 hover:text-base-content hover:bg-base-200/50'}"
				>
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={module.icon} />
					</svg>
					<span>{module.name}</span>
				</button>
			{/each}
		</div>
		<div class="ml-auto">
			<button class="btn btn-ghost btn-sm">
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
				</svg>
				カスタマイズ
			</button>
		</div>
	</div>
</header>