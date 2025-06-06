<script>
	import {
		operators,
		operatorLoad,
		waitingInquiries,
		activeChats,
		inquiryQueue,
		systemStatus
	} from './supportStore.js';

	// リアルタイム統計
	const stats = $derived({
		totalWaiting: $waitingInquiries.length,
		totalActive: $activeChats.length,
		avgWaitTime: calculateAvgWaitTime($waitingInquiries),
		operatorsAvailable: $operators.filter((op) => op.status === 'available').length,
		operatorsBusy: $operators.filter((op) => op.status === 'busy').length,
		slaAtRisk: $waitingInquiries.filter((inq) => isAtRisk(inq.slaDeadline)).length
	});

	// 平均待機時間を計算
	function calculateAvgWaitTime(inquiries) {
		if (inquiries.length === 0) return 0;

		const now = new Date();
		const totalWait = inquiries.reduce((sum, inq) => {
			return sum + (now - new Date(inq.createdAt));
		}, 0);

		return Math.floor(totalWait / inquiries.length / 1000 / 60); // 分単位
	}

	// SLAリスク判定
	function isAtRisk(deadline) {
		const now = new Date();
		const sla = new Date(deadline);
		const remainingMinutes = (sla - now) / 1000 / 60;
		return remainingMinutes < 5;
	}

	// オペレーターのパフォーマンスランキング
	const operatorRanking = $derived(
		[...$operators].sort((a, b) => b.todayHandled - a.todayHandled).slice(0, 5)
	);
</script>

<div class="bg-base-100 border-base-300 border-b p-4">
	<!-- リアルタイム統計 -->
	<div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
		<div class="stat bg-base-200 rounded-lg p-3">
			<div class="stat-title text-xs">待機中</div>
			<div class="stat-value text-warning text-2xl">{stats.totalWaiting}</div>
			<div class="stat-desc text-xs">平均待機 {stats.avgWaitTime}分</div>
		</div>

		<div class="stat bg-base-200 rounded-lg p-3">
			<div class="stat-title text-xs">対応中</div>
			<div class="stat-value text-success text-2xl">{stats.totalActive}</div>
		</div>

		<div class="stat bg-base-200 rounded-lg p-3">
			<div class="stat-title text-xs">SLAリスク</div>
			<div class="stat-value text-error text-2xl">{stats.slaAtRisk}</div>
			<div class="stat-desc text-xs">5分以内</div>
		</div>

		<div class="stat bg-base-200 rounded-lg p-3">
			<div class="stat-title text-xs">対応可能</div>
			<div class="stat-value text-2xl">{stats.operatorsAvailable}</div>
			<div class="stat-desc text-xs">オペレーター</div>
		</div>

		<div class="stat bg-base-200 rounded-lg p-3">
			<div class="stat-title text-xs">対応中</div>
			<div class="stat-value text-2xl">{stats.operatorsBusy}</div>
			<div class="stat-desc text-xs">オペレーター</div>
		</div>

		<div class="stat bg-base-200 rounded-lg p-3">
			<div class="stat-title text-xs">本日対応</div>
			<div class="stat-value text-2xl">
				{$operators.reduce((sum, op) => sum + op.todayHandled, 0)}
			</div>
			<div class="stat-desc text-xs">件</div>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
		<!-- オペレーター状況 -->
		<div class="card bg-base-200">
			<div class="card-body p-4">
				<h3 class="card-title mb-3 text-base">オペレーター状況</h3>
				<div class="space-y-2">
					{#each $operatorLoad as op}
						<div class="flex items-center gap-3">
							{#if op.avatar}
								<div class="avatar">
									<div class="w-8 rounded-full">
										<img src={op.avatar} alt={op.name} />
									</div>
								</div>
							{:else}
								<div class="avatar avatar-placeholder">
									<div class="bg-neutral text-neutral-content w-8 rounded-full">
										<span class="text-sm">{op.name.charAt(0)}</span>
									</div>
								</div>
							{/if}

							<div class="flex-1">
								<div class="mb-1 flex items-center justify-between">
									<span class="text-sm font-medium">{op.name}</span>
									<div class="flex items-center gap-2">
										<span
											class={`badge badge-xs ${
												op.status === 'available'
													? 'badge-success'
													: op.status === 'busy'
														? 'badge-warning'
														: op.status === 'break'
															? 'badge-info'
															: 'badge-ghost'
											}`}
										>
											{op.status}
										</span>
										<span class="text-base-content/70 text-xs">
											{op.currentChats.length}/{op.maxConcurrent}
										</span>
									</div>
								</div>

								<div class="bg-base-300 h-2 w-full rounded-full">
									<div
										class={`h-2 rounded-full transition-all ${
											op.load >= 80 ? 'bg-error' : op.load >= 60 ? 'bg-warning' : 'bg-success'
										}`}
										style={`width: ${op.load}%`}
									/>
								</div>
							</div>

							<div class="text-base-content/70 text-xs">
								本日: {op.todayHandled}件
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- パフォーマンスランキング -->
		<div class="card bg-base-200">
			<div class="card-body p-4">
				<h3 class="card-title mb-3 text-base">本日のパフォーマンス TOP5</h3>
				<div class="space-y-2">
					{#each operatorRanking as op, index}
						<div class="flex items-center gap-3">
							<div class="w-6 text-lg font-bold">
								{#if index === 0}
									🥇
								{:else if index === 1}
									🥈
								{:else if index === 2}
									🥉
								{:else}
									{index + 1}
								{/if}
							</div>

							{#if op.avatar}
								<div class="avatar">
									<div class="w-8 rounded-full">
										<img src={op.avatar} alt={op.name} />
									</div>
								</div>
							{:else}
								<div class="avatar avatar-placeholder">
									<div class="bg-neutral text-neutral-content w-8 rounded-full">
										<span class="text-sm">{op.name.charAt(0)}</span>
									</div>
								</div>
							{/if}

							<div class="flex-1">
								<div class="font-medium">{op.name}</div>
							</div>

							<div class="text-right">
								<div class="font-bold">{op.todayHandled}件</div>
								<div class="text-base-content/70 text-xs">対応完了</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
