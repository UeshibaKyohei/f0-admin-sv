<script>
	import { onMount } from 'svelte';
	import { getTeamWorkload } from './services/dataService.js';
	import { config } from './config.js';

	let { projectId = 'all' } = $props();
	let teamMembers = $state([]);
	let loading = $state(true);
	let error = $state(null);

	async function loadTeamWorkload() {
		try {
			loading = true;
			error = null;
			teamMembers = await getTeamWorkload(projectId);
		} catch (err) {
			error = err.message;
			console.error('Failed to load team workload:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadTeamWorkload();
		const interval = setInterval(loadTeamWorkload, config.REFRESH_INTERVALS.TEAM_WORKLOAD);
		return () => clearInterval(interval);
	});

	$effect(() => {
		loadTeamWorkload();
	});

	function getWorkloadColor(allocated) {
		if (allocated >= 90) return 'bg-error';
		if (allocated >= 70) return 'bg-warning';
		if (allocated >= 50) return 'bg-success';
		return 'bg-info';
	}

	function getWorkloadStatus(allocated) {
		if (allocated >= 90) return '高負荷';
		if (allocated >= 70) return '適正';
		if (allocated >= 50) return '通常';
		return '余裕あり';
	}
</script>

<div class="bg-base-100 border-base-300 rounded-lg border">
	<div class="border-base-200 border-b p-4 pb-3">
		<div class="flex items-center justify-between">
			<h3 class="text-base font-semibold">チーム稼働状況</h3>
			<button class="btn btn-ghost btn-xs">
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
						d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
					/>
				</svg>
			</button>
		</div>
	</div>

	<div class="p-4">
		{#if loading}
			<div class="space-y-3">
				{#each Array(5) as _}
					<div class="animate-pulse">
						<div class="mb-2 flex items-center justify-between">
							<div class="bg-base-300 h-4 w-1/3 rounded"></div>
							<div class="bg-base-300 h-4 w-1/4 rounded"></div>
						</div>
						<div class="bg-base-300 h-2 rounded"></div>
					</div>
				{/each}
			</div>
		{:else if error}
			<div class="text-error text-sm">{error}</div>
		{:else}
			<div class="space-y-4">
				{#each teamMembers as member}
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="avatar placeholder">
									<div class="bg-neutral text-neutral-content w-8 rounded-full">
										<span class="text-xs">{member.name.slice(0, 2)}</span>
									</div>
								</div>
								<div>
									<div class="text-sm font-medium">{member.name}</div>
									<div class="text-base-content/60 text-xs">{member.role}</div>
								</div>
							</div>
							<div class="text-right">
								<div class="text-sm font-semibold">{member.allocated}%</div>
								<div class="text-base-content/60 text-xs">{member.tasks}タスク</div>
							</div>
						</div>

						<div class="relative">
							<div class="bg-base-200 h-2 w-full rounded-full">
								<div
									class="h-2 rounded-full transition-all duration-300 {getWorkloadColor(
										member.allocated
									)}"
									style="width: {Math.min(member.allocated, 100)}%"
								></div>
							</div>
							{#if member.allocated > 100}
								<div class="absolute -top-1 -right-1">
									<span class="badge badge-error badge-xs">超過</span>
								</div>
							{/if}
						</div>

						<div class="text-base-content/60 flex justify-between text-xs">
							<span>{getWorkloadStatus(member.allocated)}</span>
							<span>稼働率上限: {member.capacity}%</span>
						</div>
					</div>
				{/each}
			</div>

			<!-- サマリー -->
			<div class="border-base-200 mt-6 border-t pt-4">
				<div class="grid grid-cols-3 gap-4 text-center">
					<div>
						<div class="text-base-content/60 text-xs">チーム平均</div>
						<div class="text-lg font-bold">82%</div>
					</div>
					<div>
						<div class="text-base-content/60 text-xs">高負荷</div>
						<div class="text-error text-lg font-bold">
							{teamMembers.filter((m) => m.allocated >= 90).length}名
						</div>
					</div>
					<div>
						<div class="text-base-content/60 text-xs">余裕あり</div>
						<div class="text-success text-lg font-bold">
							{teamMembers.filter((m) => m.allocated < 50).length}名
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
