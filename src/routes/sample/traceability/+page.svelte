<script lang="ts">
	import { onMount } from 'svelte';
	import {
		batches,
		batchProgress,
		processSteps,
		anomalies as mockAnomalies,
		workLogs as mockWorkLogs
	} from './mockData.js';
	import HorizontalTimeline from './HorizontalTimeline.svelte';
	import VerticalSteps from './VerticalSteps.svelte';
	import GanttChart from './GanttChart.svelte';
	import AlertsPanel from './AlertsPanel.svelte';
	import DetailModal from './DetailModal.svelte';
	import AlertRegistrationModal from './AlertRegistrationModal.svelte';
	import AlertEditModal from './AlertEditModal.svelte';

	let selectedBatch = $state(batches[0]);
	let selectedView = $state('timeline');
	let showDetailModal = $state(false);
	let modalData = $state(null);
	let searchQuery = $state('');
	let filterStatus = $state('all');
	let anomalies = $state([...mockAnomalies]);
	let workLogs = $state([...mockWorkLogs]);
	let showAlertRegistration = $state(false);
	let alertRegistrationStepId = $state('');
	let showAlertEdit = $state(false);
	let editingAlert = $state(null);

	// 選択されたバッチの進捗情報を取得
	const currentProgress = $derived(batchProgress.find((p) => p.batchId === selectedBatch?.id));

	// フィルタリングされたバッチリスト
	const filteredBatches = $derived(
		batches.filter((batch) => {
			const matchesSearch =
				batch.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
				batch.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				batch.customer.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus = filterStatus === 'all' || batch.status === filterStatus;
			return matchesSearch && matchesStatus;
		})
	);

	// 現在のアラート数
	const activeAlerts = $derived(
		anomalies.filter((a) => !a.resolved && a.batchId === selectedBatch?.id).length
	);

	function showDetail(data: any) {
		modalData = data;
		showDetailModal = true;
	}

	function handleBatchSelect(batch: any) {
		selectedBatch = batch;
	}

	// コメント追加ハンドラー
	function handleAddComment(comment: any) {
		workLogs = [...workLogs, comment];
	}

	// アラート解決ハンドラー
	function handleResolveAlert(alertId: string, resolution: string) {
		anomalies = anomalies.map((alert) => {
			if (alert.id === alertId) {
				return {
					...alert,
					resolved: true,
					resolvedBy: '現在のユーザー',
					resolvedAt: new Date().toISOString(),
					action: resolution
				};
			}
			return alert;
		});

		// 解決ログも追加
		const log = {
			id: `LOG-${Date.now()}`,
			batchId: modalData?.batchId,
			stepId: modalData?.stepId,
			timestamp: new Date().toISOString(),
			type: 'issue',
			operator: '現在のユーザー',
			content: `アラート解決: ${resolution}`
		};
		workLogs = [...workLogs, log];

		// モーダルデータも更新
		if (modalData?.id === alertId) {
			modalData = {
				...modalData,
				resolved: true,
				resolvedBy: '現在のユーザー',
				resolvedAt: new Date().toISOString(),
				action: resolution
			};
		}
	}

	// アラート登録を開く
	function openAlertRegistration(stepId = '') {
		alertRegistrationStepId = stepId;
		showAlertRegistration = true;
	}

	// アラート登録ハンドラー
	function handleRegisterAlert(alert: any) {
		anomalies = [...anomalies, alert];

		// 登録ログも追加
		const log = {
			id: `LOG-${Date.now()}`,
			batchId: alert.batchId,
			stepId: alert.stepId,
			timestamp: new Date().toISOString(),
			type: 'issue',
			operator: '現在のユーザー',
			content: `アラート登録: ${alert.description}`
		};
		workLogs = [...workLogs, log];
	}

	// アラート編集ハンドラー
	function handleEditAlert(alert: any) {
		editingAlert = alert;
		showAlertEdit = true;
	}

	// アラート更新ハンドラー
	function handleUpdateAlert(updatedAlert: any) {
		anomalies = anomalies.map((alert) => (alert.id === updatedAlert.id ? updatedAlert : alert));

		// 更新ログも追加
		const log = {
			id: `LOG-${Date.now()}`,
			batchId: updatedAlert.batchId,
			stepId: updatedAlert.stepId,
			timestamp: new Date().toISOString(),
			type: 'update',
			operator: '現在のユーザー',
			content: `アラート更新: ${updatedAlert.description}`
		};
		workLogs = [...workLogs, log];
	}

	// リアルタイム更新のシミュレーション
	onMount(() => {
		const interval = setInterval(() => {
			// 進捗の更新アニメーションをトリガー
			const event = new CustomEvent('progress-update', {
				detail: { batchId: selectedBatch?.id }
			});
			window.dispatchEvent(event);
		}, 5000);

		return () => clearInterval(interval);
	});
</script>

<div class="min-h-screen">
	<!-- タイトル -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold">工場トレーサビリティシステム</h1>
	</div>

	<div class="flex gap-4">
		<!-- サイドバー -->
		<div class="bg-base-100 w-80 rounded-lg shadow-xl">
			<div class="p-4">
				<h2 class="mb-4 text-lg font-semibold">バッチ一覧</h2>

				<!-- 検索とフィルター -->
				<div class="form-control mb-4">
					<input
						type="text"
						placeholder="バッチID、製品名、顧客名で検索"
						class="input input-bordered w-full"
						bind:value={searchQuery}
					/>
				</div>

				<div class="form-control mb-4">
					<select class="select select-bordered w-full" bind:value={filterStatus}>
						<option value="all">すべてのステータス</option>
						<option value="pending">待機中</option>
						<option value="in_progress">進行中</option>
						<option value="completed">完了</option>
					</select>
				</div>

				<!-- バッチリスト -->
				<div class="max-h-[600px] overflow-y-auto p-1">
					<div class="space-y-2">
						{#each filteredBatches as batch}
							<div
								class="card bg-base-200 cursor-pointer transition-shadow hover:shadow-md"
								class:ring-2={selectedBatch?.id === batch.id}
								class:ring-primary={selectedBatch?.id === batch.id}
								onclick={() => handleBatchSelect(batch)}
							>
								<div class="card-body p-4">
									<div class="flex items-start justify-between">
										<div>
											<h3 class="font-semibold">{batch.id}</h3>
											<p class="text-sm opacity-70">{batch.productName}</p>
											<p class="text-xs opacity-50">{batch.customer}</p>
										</div>
										<div
											class="badge"
											class:badge-success={batch.status === 'completed'}
											class:badge-info={batch.status === 'in_progress'}
											class:badge-neutral={batch.status === 'pending'}
										>
											{batch.status === 'completed'
												? '完了'
												: batch.status === 'in_progress'
													? '進行中'
													: '待機中'}
										</div>
									</div>
									<div class="mt-2 text-xs">
										<div class="flex justify-between">
											<span>数量:</span>
											<span>{batch.quantity}</span>
										</div>
										<div class="flex justify-between">
											<span>優先度:</span>
											<span
												class="badge badge-xs"
												class:badge-error={batch.priority === 'high'}
												class:badge-warning={batch.priority === 'normal'}
												class:badge-success={batch.priority === 'low'}
											>
												{batch.priority === 'high'
													? '高'
													: batch.priority === 'normal'
														? '中'
														: '低'}
											</span>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- メインコンテンツ -->
		<div class="flex-1 overflow-hidden">
			{#if selectedBatch}
				<!-- バッチ情報ヘッダー -->
				<div class="card bg-base-100 mb-6 shadow-xl">
					<div class="card-body">
						<div class="flex items-center justify-between gap-4">
							<div class="flex-1">
								<h2 class="card-title text-2xl">{selectedBatch.productName}</h2>
								<p class="text-sm opacity-70">
									バッチID: {selectedBatch.id} | 注文番号: {selectedBatch.orderNumber}
								</p>
							</div>
							<div class="flex items-center gap-4">
								<button class="btn btn-warning btn-sm" onclick={() => openAlertRegistration()}>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
										></path>
									</svg>
									アラート登録
								</button>
								<div class="stats shadow">
									<div class="stat">
										<div class="stat-title">進捗率</div>
										<div class="stat-value text-primary">
											{currentProgress
												? Math.round(
														(currentProgress.progress.filter((p) => p.status === 'completed')
															.length /
															processSteps.length) *
															100
													)
												: 0}%
										</div>
									</div>
									<div class="stat">
										<div class="stat-title">残り工程</div>
										<div class="stat-value text-secondary">
											{currentProgress
												? processSteps.length -
													currentProgress.progress.filter((p) => p.status === 'completed').length
												: processSteps.length}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- ビュー切り替えタブ -->
				<div class="tabs tabs-boxed mb-6">
					<a
						class="tab"
						class:tab-active={selectedView === 'timeline'}
						onclick={() => (selectedView = 'timeline')}
					>
						横型タイムライン
					</a>
					<a
						class="tab"
						class:tab-active={selectedView === 'steps'}
						onclick={() => (selectedView = 'steps')}
					>
						縦型ステップ
					</a>
					<a
						class="tab"
						class:tab-active={selectedView === 'gantt'}
						onclick={() => (selectedView = 'gantt')}
					>
						ガントチャート
					</a>
				</div>

				<!-- ビューコンテンツ -->
				<div class="mb-6 w-full overflow-hidden">
					{#if selectedView === 'timeline'}
						<HorizontalTimeline
							{processSteps}
							progress={currentProgress?.progress || []}
							onStepClick={showDetail}
						/>
					{:else if selectedView === 'steps'}
						<VerticalSteps
							{processSteps}
							progress={currentProgress?.progress || []}
							onStepClick={showDetail}
							onAlertRegister={openAlertRegistration}
						/>
					{:else if selectedView === 'gantt'}
						<GanttChart
							batch={selectedBatch}
							{processSteps}
							progress={currentProgress?.progress || []}
							onStepClick={showDetail}
						/>
					{/if}
				</div>

				<!-- アラートパネル -->
				<AlertsPanel
					alerts={anomalies.filter((a) => a.batchId === selectedBatch.id)}
					onAlertClick={showDetail}
					onAlertEdit={handleEditAlert}
				/>
			{:else}
				<div class="hero min-h-[calc(100vh-8rem)]">
					<div class="hero-content text-center">
						<div class="max-w-md">
							<h1 class="text-5xl font-bold">バッチを選択してください</h1>
							<p class="py-6">左側のリストからバッチを選択すると、詳細な進捗情報が表示されます。</p>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- 詳細モーダル -->
	{#if showDetailModal}
		<DetailModal
			data={modalData}
			{workLogs}
			onClose={() => (showDetailModal = false)}
			onAddComment={handleAddComment}
			onResolveAlert={handleResolveAlert}
		/>
	{/if}

	<!-- アラート登録モーダル -->
	{#if showAlertRegistration}
		<AlertRegistrationModal
			show={showAlertRegistration}
			batchId={selectedBatch?.id || ''}
			stepId={alertRegistrationStepId}
			onClose={() => (showAlertRegistration = false)}
			onRegister={handleRegisterAlert}
		/>
	{/if}

	<!-- アラート編集モーダル -->
	{#if showAlertEdit}
		<AlertEditModal
			show={showAlertEdit}
			alert={editingAlert}
			onClose={() => (showAlertEdit = false)}
			onUpdate={handleUpdateAlert}
		/>
	{/if}
</div>

<style>
	/* カスタムスクロールバー */
	:global(.overflow-y-auto::-webkit-scrollbar) {
		width: 0.5rem;
	}

	:global(.overflow-y-auto::-webkit-scrollbar-track) {
		background-color: transparent;
	}

	:global(.overflow-y-auto::-webkit-scrollbar-thumb) {
		background-color: hsl(var(--bc) / 0.2);
		border-radius: 0.25rem;
	}

	:global(.overflow-y-auto::-webkit-scrollbar-thumb:hover) {
		background-color: hsl(var(--bc) / 0.3);
	}
</style>
