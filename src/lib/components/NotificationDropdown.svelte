<script lang="ts">
	import { unreadCount, filteredNotifications, notificationActions, type Notification } from '$lib/stores/notifications';
	import { formatRelativeTime } from '$lib/utils/dateUtils';

	let isOpen = $state(false);

	// 通知タイプ別のスタイル
	const getNotificationStyle = (type: Notification['type']) => {
		switch (type) {
			case 'error':
				return 'border-l-error bg-error/5';
			case 'warning':
				return 'border-l-warning bg-warning/5';
			case 'success':
				return 'border-l-success bg-success/5';
			case 'system':
				return 'border-l-info bg-info/5';
			default:
				return 'border-l-base-300 bg-base-50';
		}
	};

	// 通知タイプ別のアイコン
	const getNotificationIcon = (type: Notification['type']) => {
		switch (type) {
			case 'error':
				return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z';
			case 'warning':
				return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z';
			case 'success':
				return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
			case 'system':
				return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
			default:
				return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
		}
	};

	// 優先度別のバッジスタイル
	const getPriorityBadge = (priority: Notification['priority']) => {
		switch (priority) {
			case 'critical':
				return 'badge-error';
			case 'high':
				return 'badge-warning';
			case 'medium':
				return 'badge-info';
			default:
				return 'badge-ghost';
		}
	};

	const handleNotificationClick = (notification: Notification) => {
		if (!notification.isRead) {
			notificationActions.markAsRead(notification.id);
		}
		if (notification.actionUrl) {
			window.location.href = notification.actionUrl;
		}
		isOpen = false;
	};

	const handleMarkAllRead = () => {
		notificationActions.markAllAsRead();
	};

	// 表示する通知数を制限（最新20件）
	const displayNotifications = $derived($filteredNotifications.slice(0, 20));
</script>

<div class="dropdown dropdown-end">
	<button 
		class="btn btn-ghost btn-xs btn-square indicator" 
		aria-label="通知"
		onclick={() => isOpen = !isOpen}
	>
		{#if $unreadCount > 0}
			<span class="indicator-item badge badge-error badge-xs">
				{$unreadCount > 99 ? '99+' : $unreadCount}
			</span>
		{/if}
		<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
		</svg>
	</button>

	{#if isOpen}
		<div class="dropdown-content mt-2 bg-base-100 rounded-lg shadow-xl border border-base-200 w-96 max-h-96 overflow-hidden z-50">
			<!-- ヘッダー -->
			<div class="p-4 border-b border-base-200">
				<div class="flex items-center justify-between">
					<h3 class="font-semibold">通知</h3>
					{#if $unreadCount > 0}
						<button 
							class="btn btn-xs btn-ghost"
							onclick={handleMarkAllRead}
						>
							全て既読
						</button>
					{/if}
				</div>
			</div>

			<!-- 通知リスト -->
			<div class="overflow-y-auto max-h-80">
				{#if displayNotifications.length === 0}
					<div class="p-8 text-center text-base-content/60">
						<svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
						</svg>
						<p class="text-sm">通知はありません</p>
					</div>
				{:else}
					{#each displayNotifications as notification (notification.id)}
						<button
							class="w-full p-4 text-left hover:bg-base-50 transition-colors border-l-4 {getNotificationStyle(notification.type)}"
							class:opacity-60={notification.isRead}
							onclick={() => handleNotificationClick(notification)}
						>
							<div class="flex items-start gap-3">
								<!-- アイコン -->
								<div class="flex-shrink-0 mt-0.5">
									<svg 
										class="w-5 h-5" 
										class:text-error={notification.type === 'error'}
										class:text-warning={notification.type === 'warning'}
										class:text-success={notification.type === 'success'}
										class:text-info={notification.type === 'system'}
										class:text-base-content={notification.type === 'info'}
										fill="none" 
										viewBox="0 0 24 24" 
										stroke="currentColor"
									>
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getNotificationIcon(notification.type)} />
									</svg>
								</div>

								<!-- 内容 -->
								<div class="flex-1 min-w-0">
									<div class="flex items-start justify-between gap-2 mb-1">
										<h4 class="font-medium text-sm truncate">{notification.title}</h4>
										<div class="flex items-center gap-1 flex-shrink-0">
											{#if notification.priority !== 'low'}
												<span class="badge badge-xs {getPriorityBadge(notification.priority)}">
													{notification.priority}
												</span>
											{/if}
											{#if !notification.isRead}
												<div class="w-2 h-2 bg-primary rounded-full"></div>
											{/if}
										</div>
									</div>
									<p class="text-xs text-base-content/70 mb-2 line-clamp-2">{notification.message}</p>
									<div class="flex items-center justify-between">
										<span class="text-xs text-base-content/50">
											{formatRelativeTime(notification.createdAt)}
										</span>
										{#if notification.actionLabel}
											<span class="text-xs text-primary">{notification.actionLabel} →</span>
										{/if}
									</div>
								</div>
							</div>
						</button>
					{/each}
				{/if}
			</div>

			<!-- フッター -->
			{#if displayNotifications.length > 0}
				<div class="p-3 border-t border-base-200 bg-base-50">
					<button class="btn btn-xs btn-ghost w-full">
						全ての通知を表示
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- 外側クリックで閉じる -->
{#if isOpen}
	<div 
		class="fixed inset-0 z-40" 
		onclick={() => isOpen = false}
		onkeydown={(e) => e.key === 'Escape' && (isOpen = false)}
		role="button"
		tabindex="0"
	></div>
{/if}

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>