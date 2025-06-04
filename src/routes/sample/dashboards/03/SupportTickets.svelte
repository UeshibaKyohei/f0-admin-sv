<script>
	let { segment = 'all', dateRange = '30days', showDetails = false } = $props();

	let tickets = $state([
		{
			id: 'ticket_001',
			title: 'ログイン機能が正常に動作しない',
			customer: '株式会社テックソリューション',
			priority: 'high',
			status: 'open',
			assignee: '佐藤 花子',
			created_at: '2024-12-20T09:30:00Z',
			updated_at: '2024-12-20T14:15:00Z',
			category: 'technical',
			satisfaction_rating: null
		},
		{
			id: 'ticket_002',
			title: '料金プランの変更について',
			customer: 'イノベーション株式会社',
			priority: 'medium',
			status: 'in_progress',
			assignee: '田中 太郎',
			created_at: '2024-12-19T16:45:00Z',
			updated_at: '2024-12-20T10:30:00Z',
			category: 'billing',
			satisfaction_rating: null
		},
		{
			id: 'ticket_003',
			title: '新機能のチュートリアルリクエスト',
			customer: 'グローバル株式会社',
			priority: 'low',
			status: 'resolved',
			assignee: '山田 次郎',
			created_at: '2024-12-18T11:20:00Z',
			updated_at: '2024-12-19T15:45:00Z',
			category: 'feature_request',
			satisfaction_rating: 5
		},
		{
			id: 'ticket_004',
			title: 'データエクスポートエラー',
			customer: 'デジタル株式会社',
			priority: 'high',
			status: 'escalated',
			assignee: '鈴木 美咲',
			created_at: '2024-12-20T08:15:00Z',
			updated_at: '2024-12-20T13:20:00Z',
			category: 'technical',
			satisfaction_rating: null
		}
	]);

	let ticketStats = $state({
		total: 156,
		open: 23,
		in_progress: 18,
		resolved: 89,
		escalated: 4,
		average_resolution_time: 4.2,
		satisfaction_average: 4.3
	});

	// セグメントや期間でフィルタリング
	$effect(() => {
		updateTicketData(segment, dateRange);
	});

	function updateTicketData(segment, dateRange) {
		// 実際のアプリケーションではAPIを呼び出す
		// ここではサンプルとして固定値を使用
	}

	function getPriorityColor(priority) {
		const colors = {
			high: 'error',
			medium: 'warning',
			low: 'info',
			critical: 'error'
		};
		return colors[priority] || 'base-300';
	}

	function getStatusColor(status) {
		const colors = {
			open: 'info',
			in_progress: 'warning',
			resolved: 'success',
			escalated: 'error',
			closed: 'base-300'
		};
		return colors[status] || 'base-300';
	}

	function getCategoryIcon(category) {
		const icons = {
			technical:
				'M9.75 17L9 20l-1-1h-2.25A2.25 2.25 0 014.5 16.75V6.5a2.25 2.25 0 012.25-2.25h10.5A2.25 2.25 0 0119.5 6.5v10.25a2.25 2.25 0 01-2.25 2.25H15l-1 1-1-3z',
			billing:
				'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
			feature_request: 'M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z',
			general:
				'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
		};
		return icons[category] || icons.general;
	}

	function getTimeAgo(dateString) {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now - date;
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffHours / 24);

		if (diffDays > 0) return `${diffDays}日前`;
		if (diffHours > 0) return `${diffHours}時間前`;
		return '1時間以内';
	}
</script>

<div class="card bg-base-100 shadow-sm">
	<div class="card-body">
		<div class="mb-6 flex items-center justify-between">
			<h3 class="text-lg font-semibold">サポートチケット</h3>
			{#if !showDetails}
				<div class="flex gap-2">
					<div class="badge badge-info badge-sm">{ticketStats.open} 未対応</div>
					<div class="badge badge-warning badge-sm">{ticketStats.in_progress} 対応中</div>
				</div>
			{/if}
		</div>

		{#if !showDetails}
			<!-- 簡易表示：統計サマリー -->
			<div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
				<div class="stat bg-base-200/50 rounded-lg p-3">
					<div class="stat-value text-primary text-2xl">{ticketStats.total}</div>
					<div class="stat-title text-xs">総チケット数</div>
				</div>
				<div class="stat bg-base-200/50 rounded-lg p-3">
					<div class="stat-value text-warning text-2xl">
						{ticketStats.open + ticketStats.in_progress}
					</div>
					<div class="stat-title text-xs">対応待ち</div>
				</div>
				<div class="stat bg-base-200/50 rounded-lg p-3">
					<div class="stat-value text-success text-2xl">{ticketStats.satisfaction_average}</div>
					<div class="stat-title text-xs">満足度平均</div>
				</div>
				<div class="stat bg-base-200/50 rounded-lg p-3">
					<div class="stat-value text-info text-2xl">{ticketStats.average_resolution_time}h</div>
					<div class="stat-title text-xs">平均解決時間</div>
				</div>
			</div>

			<!-- 最新のチケット -->
			<div class="space-y-3">
				<h4 class="text-base-content/70 text-sm font-medium">最新のチケット</h4>
				{#each tickets.slice(0, 3) as ticket}
					<div
						class="bg-base-200/30 hover:bg-base-200/50 flex items-center gap-3 rounded-lg p-3 transition-colors"
					>
						<div
							class="h-10 w-10 rounded-lg bg-{getPriorityColor(
								ticket.priority
							)}/10 text-{getPriorityColor(ticket.priority)} flex items-center justify-center"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="h-5 w-5"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d={getCategoryIcon(ticket.category)}
								/>
							</svg>
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-medium">{ticket.title}</p>
							<p class="text-base-content/60 text-xs">{ticket.customer}</p>
						</div>
						<div class="text-right">
							<div class="badge badge-{getStatusColor(ticket.status)} badge-sm">
								{ticket.status}
							</div>
							<p class="text-base-content/60 mt-1 text-xs">{getTimeAgo(ticket.updated_at)}</p>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<!-- 詳細表示：全チケットリスト -->
			<div class="overflow-x-auto">
				<table class="table-sm table">
					<thead>
						<tr>
							<th>チケット</th>
							<th>顧客</th>
							<th>優先度</th>
							<th>ステータス</th>
							<th>担当者</th>
							<th>作成日時</th>
							<th>満足度</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each tickets as ticket}
							<tr class="hover">
								<td>
									<div class="flex items-center gap-3">
										<div
											class="h-8 w-8 rounded bg-{getPriorityColor(
												ticket.priority
											)}/10 text-{getPriorityColor(
												ticket.priority
											)} flex items-center justify-center"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
												class="h-4 w-4"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d={getCategoryIcon(ticket.category)}
												/>
											</svg>
										</div>
										<div>
											<div class="text-sm font-medium">{ticket.title}</div>
											<div class="text-base-content/60 text-xs">{ticket.id}</div>
										</div>
									</div>
								</td>
								<td>
									<div class="text-sm">{ticket.customer}</div>
								</td>
								<td>
									<div class="badge badge-{getPriorityColor(ticket.priority)} badge-sm">
										{ticket.priority}
									</div>
								</td>
								<td>
									<div class="badge badge-{getStatusColor(ticket.status)} badge-sm">
										{ticket.status}
									</div>
								</td>
								<td>
									<div class="text-sm">{ticket.assignee}</div>
								</td>
								<td>
									<div class="text-sm">{getTimeAgo(ticket.created_at)}</div>
								</td>
								<td>
									{#if ticket.satisfaction_rating}
										<div class="rating rating-xs">
											{#each Array(5) as _, i}
												<input
													type="radio"
													class="mask mask-star-2 bg-warning"
													disabled
													checked={i < ticket.satisfaction_rating}
												/>
											{/each}
										</div>
									{:else}
										<span class="text-base-content/40 text-xs">未評価</span>
									{/if}
								</td>
								<td>
									<button class="btn btn-ghost btn-xs">詳細</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- ページネーション -->
			<div class="mt-6 flex justify-center">
				<div class="join">
					<button class="join-item btn btn-sm">«</button>
					<button class="join-item btn btn-sm btn-active">1</button>
					<button class="join-item btn btn-sm">2</button>
					<button class="join-item btn btn-sm">3</button>
					<button class="join-item btn btn-sm">»</button>
				</div>
			</div>
		{/if}
	</div>
</div>
