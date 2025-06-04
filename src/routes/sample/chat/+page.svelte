<script>
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import InquiryQueue from './InquiryQueue.svelte';
	import OperatorDashboard from './OperatorDashboard.svelte';
	import ChatTabs from './ChatTabs.svelte';
	import SupportChat from './SupportChat.svelte';
	import CustomerInfo from './CustomerInfo.svelte';
	import ChatHistory from './ChatHistory.svelte';
	import NotificationPanel from './NotificationPanel.svelte';
	import TestPanel from './TestPanel.svelte';
	import {
		currentOperator,
		operators,
		systemStatus,
		selectedChatId,
		waitingInquiries,
		activeChats,
		operatorLoad,
		updateOperatorStatus
	} from './supportStore.js';
	import {
		generateRandomInquiry,
		generateInitialDemoData,
		startRandomInquiryGeneration,
		isDemoMode
	} from './api/demoDataGenerator.js';
	import { DEMO_CONFIG } from './config.js';
	import { debugSettings } from './api/debugStore.js';

	let viewMode = $state('dashboard'); // 'dashboard', 'queue', or 'history'
	let showCustomerInfo = $state(true);
	let innerWidth = $state(0);

	// ビューモード切り替え関数
	function setViewMode(mode) {
		console.log('setViewMode called with:', mode);
		viewMode = mode;
		console.log('viewMode after set:', viewMode);
	}

	// オペレーターステータス更新のハンドラー
	async function handleStatusUpdate(status) {
		const operatorId = $currentOperator?.id;
		if (!operatorId) return;

		try {
			await updateOperatorStatus(operatorId, status);
		} catch (error) {
			console.error('Failed to update operator status:', error);
		}
	}

	onMount(() => {
		// デモモードの場合のみ初期デモデータを生成
		if (isDemoMode()) {
			// 初期デモデータを生成（デバッグ設定に関係なく最初のみ）
			generateInitialDemoData(DEMO_CONFIG.initialInquiryCount);
		}
	});
</script>

<svelte:window bind:innerWidth />

<div class="bg-base-200 -m-4 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden md:-m-6">
	<!-- ヘッダー -->
	<header class="bg-base-100 border-base-300 flex-shrink-0 border-b px-4 py-2">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<h1 class="text-lg font-bold">カスタマーサポート</h1>

				<!-- ビュー切り替え -->
				<div class="tabs tabs-boxed tabs-xs">
					<button
						class={`tab ${viewMode === 'dashboard' ? 'tab-active' : ''}`}
						onclick={() => setViewMode('dashboard')}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-1 h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
							/>
						</svg>
						ダッシュボード
					</button>
					<button
						class={`tab ${viewMode === 'queue' ? 'tab-active' : ''}`}
						onclick={() => setViewMode('queue')}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-1 h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
							/>
						</svg>
						待機キュー
					</button>
					<button
						class={`tab ${viewMode === 'history' ? 'tab-active' : ''}`}
						onclick={() => setViewMode('history')}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-1 h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						履歴
					</button>
				</div>
			</div>

			<div class="flex items-center gap-3">
				{#if $currentOperator}
					<!-- ステータス変更 -->
					<div class="dropdown dropdown-end">
						<label tabindex="0" class="btn btn-ghost btn-sm gap-2">
							<div
								class={`h-2 w-2 rounded-full ${
									$currentOperator.status === 'available'
										? 'bg-success'
										: $currentOperator.status === 'busy'
											? 'bg-warning'
											: $currentOperator.status === 'break'
												? 'bg-info'
												: 'bg-base-300'
								}`}
							></div>
							<span class="text-sm">
								{$currentOperator.status === 'available'
									? '対応可能'
									: $currentOperator.status === 'busy'
										? '対応中'
										: $currentOperator.status === 'break'
											? '休憩中'
											: 'オフライン'}
							</span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-3 w-3"
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
						</label>
						<ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box w-40 p-2 shadow">
							<li><a onclick={() => handleStatusUpdate('available')}>対応可能</a></li>
							<li><a onclick={() => handleStatusUpdate('break')}>休憩中</a></li>
							<li><a onclick={() => handleStatusUpdate('offline')}>オフライン</a></li>
						</ul>
					</div>

					<div class="divider divider-horizontal mx-1"></div>

					<!-- オペレーター情報 -->
					<div class="flex items-center gap-2">
						<div class="text-right">
							<div class="text-sm font-medium">{$currentOperator.name}</div>
							<div class="text-base-content/60 text-xs">
								本日: {$currentOperator.todayHandled}件
							</div>
						</div>
						{#if $currentOperator.avatar}
							<div class="avatar">
								<div class="w-9 rounded-full">
									<img src={$currentOperator.avatar} alt={$currentOperator.name} />
								</div>
							</div>
						{:else}
							<div class="avatar avatar-placeholder">
								<div class="bg-neutral text-neutral-content w-9 rounded-full">
									<span>{$currentOperator.name.charAt(0)}</span>
								</div>
							</div>
						{/if}
					</div>
				{/if}

				<!-- 通知パネル -->
				<div class="relative">
					<NotificationPanel />
				</div>
			</div>
		</div>
	</header>

	<!-- メインコンテンツ -->
	<main class="flex flex-1 overflow-hidden">
		{#if viewMode === 'queue'}
			<InquiryQueue onAssignComplete={() => setViewMode('dashboard')} />
		{:else if viewMode === 'history'}
			<ChatHistory />
		{:else}
			<!-- ダッシュボードビュー -->
			<div class="flex h-full w-full flex-col">
				<!-- 統計サマリー（コンパクト版） -->
				<div class="bg-base-100 border-base-300 flex-shrink-0 border-b px-4 py-3">
					<div class="flex items-center gap-6 overflow-x-auto overflow-y-hidden">
						<div class="flex items-center gap-2 whitespace-nowrap">
							<div class="text-base-content/60 text-xs">待機中</div>
							<div class="text-warning text-lg font-bold">{$waitingInquiries.length}</div>
						</div>
						<div class="flex items-center gap-2 whitespace-nowrap">
							<div class="text-base-content/60 text-xs">対応中</div>
							<div class="text-success text-lg font-bold">{$activeChats.length}</div>
						</div>
						<div class="flex items-center gap-2 whitespace-nowrap">
							<div class="text-base-content/60 text-xs">本日対応</div>
							<div class="text-lg font-bold">
								{$operators.reduce((sum, op) => sum + op.todayHandled, 0)}
							</div>
						</div>
						<div class="flex items-center gap-2 whitespace-nowrap">
							<div class="text-base-content/60 text-xs">平均応答</div>
							<div class="text-lg font-bold">{$systemStatus.avgResponseTime}分</div>
						</div>

						<!-- オペレーター負荷状況（インライン） -->
						<div class="flex flex-1 items-center justify-end gap-3">
							{#each $operatorLoad.slice(0, 5) as op}
								<div
									class="tooltip tooltip-bottom"
									data-tip="{op.name}: {op.currentChats.length}/{op.maxConcurrent}件"
								>
									{#if op.avatar}
										<div class="avatar">
											<div
												class="ring-offset-base-100 w-8 rounded-full ring-2 ring-offset-1 {op.load >=
												80
													? 'ring-error'
													: op.load >= 60
														? 'ring-warning'
														: 'ring-success'}"
											>
												<img src={op.avatar} alt={op.name} />
											</div>
										</div>
									{:else}
										<div class="avatar avatar-placeholder">
											<div
												class="bg-neutral text-neutral-content ring-offset-base-100 w-8 rounded-full ring-2 ring-offset-1 {op.load >=
												80
													? 'ring-error'
													: op.load >= 60
														? 'ring-warning'
														: 'ring-success'}"
											>
												<span class="text-xs">{op.name.charAt(0)}</span>
											</div>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- チャットセクション -->
				<div class="flex flex-1 flex-col overflow-hidden">
					<!-- チャットタブ -->
					<ChatTabs />

					<!-- チャットコンテンツエリア -->
					<div class="flex flex-1 overflow-hidden">
						{#if $selectedChatId}
							<!-- チャットエリア -->
							<div class="flex flex-1 overflow-hidden">
								<div class="relative flex-1">
									<SupportChat />

									<!-- 顧客情報パネルトグルボタン -->
									{#if innerWidth >= 1024}
										<button
											class="bg-base-100 border-base-300 hover:bg-base-200 absolute top-1/2 right-0 z-10 -translate-y-1/2 rounded-r-lg border border-l-0 p-2 transition-colors"
											onclick={() => (showCustomerInfo = !showCustomerInfo)}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-4 w-4"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												{#if showCustomerInfo}
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M9 5l7 7-7 7"
													/>
												{:else}
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M15 19l-7-7 7-7"
													/>
												{/if}
											</svg>
										</button>
									{/if}
								</div>

								<!-- 顧客情報パネル -->
								{#if innerWidth >= 1024 && showCustomerInfo}
									<CustomerInfo />
								{/if}
							</div>
						{:else}
							<!-- 初期状態メッセージ -->
							<div class="bg-base-100 flex flex-1 items-center justify-center">
								<div class="text-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="text-base-content/20 mx-auto mb-4 h-16 w-16"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
										/>
									</svg>
									<h2 class="mb-2 text-xl font-bold">チャットを選択してください</h2>
									<p class="text-base-content/60">
										対応中のチャットタブを選択するか、<br />
										待機キューから新しい問い合わせを選択してください
									</p>
									<button class="btn btn-primary btn-sm mt-4" onclick={() => setViewMode('queue')}>
										待機キューを表示
									</button>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>

<!-- テストパネル（デモ時のみ） -->
{#if isDemoMode()}
	<TestPanel />
{/if}
