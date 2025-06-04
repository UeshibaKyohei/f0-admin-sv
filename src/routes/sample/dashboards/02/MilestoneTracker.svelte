<script>
	import { onMount } from 'svelte';
	import { getMilestones } from './services/dataService.js';
	import { config } from './config.js';

	let { projectId = 'all' } = $props();
	let milestones = $state([]);
	let loading = $state(true);
	let error = $state(null);

	async function loadMilestones() {
		try {
			loading = true;
			error = null;
			milestones = await getMilestones(projectId);
		} catch (err) {
			error = err.message;
			console.error('Failed to load milestones:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadMilestones();
		const interval = setInterval(loadMilestones, config.REFRESH_INTERVALS.MILESTONES);
		return () => clearInterval(interval);
	});

	$effect(() => {
		loadMilestones();
	});

	function getStatusIcon(status) {
		if (status === 'achieved') return '✅';
		if (status === 'delayed') return '⚠️';
		return '🎯';
	}

	function getStatusColor(status) {
		if (status === 'achieved') return 'text-success';
		if (status === 'delayed') return 'text-error';
		return 'text-warning';
	}

	function getDaysRemaining(dueDate) {
		const today = new Date();
		const due = new Date(dueDate);
		const diff = due - today;
		const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

		if (days < 0) return `${Math.abs(days)}日超過`;
		if (days === 0) return '本日';
		return `残り${days}日`;
	}

	function getProgressColor(rate) {
		if (rate >= 80) return 'progress-success';
		if (rate >= 50) return 'progress-warning';
		return 'progress-error';
	}
</script>

<div class="bg-base-100 border-base-300 flex h-full flex-col rounded-lg border">
	<div class="border-base-200 border-b p-4 pb-3">
		<div class="flex items-center justify-between">
			<h3 class="text-base font-semibold">マイルストーン</h3>
			<button class="btn btn-ghost btn-xs">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-4 w-4"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
				</svg>
			</button>
		</div>
	</div>

	<div class="flex-1 overflow-y-auto p-4">
		{#if loading}
			<div class="space-y-3">
				{#each Array(4) as _}
					<div class="animate-pulse">
						<div class="bg-base-300 mb-2 h-4 w-3/4 rounded"></div>
						<div class="bg-base-300 h-2 rounded"></div>
					</div>
				{/each}
			</div>
		{:else if error}
			<div class="text-error text-sm">{error}</div>
		{:else}
			<div class="space-y-4">
				{#each milestones as milestone}
					<div
						class="border-base-200 hover:border-base-300 rounded-lg border p-3 transition-colors"
					>
						<div class="mb-2 flex items-start justify-between">
							<div class="flex flex-1 items-start gap-2">
								<span class="mt-0.5 text-lg">{getStatusIcon(milestone.status)}</span>
								<div class="flex-1">
									<h4 class="text-sm font-medium">{milestone.name}</h4>
									<div class="mt-1 flex items-center gap-3">
										<span class="text-base-content/60 text-xs">
											{new Date(milestone.due_date).toLocaleDateString('ja-JP')}
										</span>
										<span
											class="text-xs font-medium {milestone.status === 'delayed'
												? 'text-error'
												: 'text-base-content/60'}"
										>
											{getDaysRemaining(milestone.due_date)}
										</span>
									</div>
								</div>
							</div>
							<div class="text-right">
								<div class="text-sm font-bold {getStatusColor(milestone.status)}">
									{milestone.completion_rate}%
								</div>
							</div>
						</div>

						<div class="space-y-1">
							<progress
								class="progress {getProgressColor(milestone.completion_rate)} h-1.5"
								value={milestone.completion_rate}
								max="100"
							></progress>

							{#if milestone.status === 'delayed'}
								<div class="text-error flex items-center gap-1 text-xs">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="h-3 w-3"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
										/>
									</svg>
									スケジュール遅延中
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<!-- サマリー -->
			<div class="border-base-200 mt-4 border-t pt-4">
				<div class="text-base-content/60 flex justify-between text-xs">
					<span>達成: {milestones.filter((m) => m.status === 'achieved').length}</span>
					<span>進行中: {milestones.filter((m) => m.status === 'pending').length}</span>
					<span>遅延: {milestones.filter((m) => m.status === 'delayed').length}</span>
				</div>
			</div>
		{/if}
	</div>
</div>
