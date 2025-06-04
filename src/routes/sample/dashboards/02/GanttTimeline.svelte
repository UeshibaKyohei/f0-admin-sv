<script>
	import { onMount } from 'svelte';
	import { getGanttData } from './services/dataService.js';
	import { config } from './config.js';

	let { projectId = 'all' } = $props();
	let tasks = $state([]);
	let loading = $state(true);
	let error = $state(null);
	let viewMode = $state('month');
	let currentDate = new Date();

	async function loadGanttData() {
		try {
			loading = true;
			error = null;
			const ganttData = await getGanttData(projectId, viewMode);
			tasks = ganttData.tasks || [];
		} catch (err) {
			error = err.message;
			console.error('Failed to load gantt data:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadGanttData();
	});

	$effect(() => {
		loadGanttData();
	});

	// 日付範囲の計算
	function getDateRange() {
		const start = new Date();
		start.setMonth(start.getMonth() - 1);
		const end = new Date();
		end.setMonth(end.getMonth() + 3);
		return { start, end };
	}

	// タスクバーの位置計算
	function calculateTaskPosition(task) {
		const { start, end } = getDateRange();
		const taskStart = new Date(task.start_date);
		const taskEnd = new Date(task.due_date);

		const totalDays = (end - start) / (1000 * 60 * 60 * 24);
		const startOffset = (taskStart - start) / (1000 * 60 * 60 * 24);
		const duration = (taskEnd - taskStart) / (1000 * 60 * 60 * 24);

		return {
			left: `${(startOffset / totalDays) * 100}%`,
			width: `${(duration / totalDays) * 100}%`
		};
	}

	function getStatusColor(status) {
		const colors = {
			done: 'bg-success',
			in_progress: 'bg-info',
			review: 'bg-warning',
			todo: 'bg-base-300'
		};
		return colors[status] || 'bg-base-300';
	}

	// 月ヘッダーの生成
	function getMonthHeaders() {
		const { start, end } = getDateRange();
		const months = [];
		const current = new Date(start);

		while (current <= end) {
			months.push({
				label: current.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' }),
				key: current.toISOString()
			});
			current.setMonth(current.getMonth() + 1);
		}

		return months;
	}
</script>

<div class="bg-base-100 border-base-300 rounded-lg border">
	<div class="border-base-200 border-b p-4 pb-3">
		<div class="flex items-center justify-between">
			<h3 class="text-base font-semibold">ガントチャート</h3>
			<div class="flex items-center gap-2">
				<div class="btn-group btn-group-sm">
					<button
						class="btn"
						class:btn-active={viewMode === 'day'}
						onclick={() => (viewMode = 'day')}>日</button
					>
					<button
						class="btn"
						class:btn-active={viewMode === 'week'}
						onclick={() => (viewMode = 'week')}>週</button
					>
					<button
						class="btn"
						class:btn-active={viewMode === 'month'}
						onclick={() => (viewMode = 'month')}>月</button
					>
				</div>
			</div>
		</div>
	</div>

	<div class="overflow-x-auto">
		{#if loading}
			<div class="p-4">
				<div class="animate-pulse space-y-2">
					{#each Array(5) as _}
						<div class="bg-base-300 h-10 rounded"></div>
					{/each}
				</div>
			</div>
		{:else if error}
			<div class="text-error p-4">{error}</div>
		{:else}
			<!-- ガントチャートヘッダー -->
			<div class="border-base-200 flex border-b">
				<div class="border-base-200 w-64 border-r p-2 text-sm font-semibold">タスク名</div>
				<div class="relative flex-1">
					<div class="flex">
						{#each getMonthHeaders() as month}
							<div class="border-base-200 flex-1 border-r p-2 text-center text-sm">
								{month.label}
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- ガントチャート本体 -->
			<div class="min-h-[400px]">
				{#each tasks as task, index}
					<div class="border-base-200 hover:bg-base-200/30 flex border-b transition-colors">
						<!-- タスク名 -->
						<div class="border-base-200 w-64 border-r p-3">
							<div class="flex items-center gap-2">
								<span class="badge badge-xs {getStatusColor(task.status)}"></span>
								<div>
									<div class="truncate text-sm font-medium">{task.task_name}</div>
									<div class="text-base-content/60 text-xs">{task.assignee}</div>
								</div>
							</div>
						</div>

						<!-- タスクバー -->
						<div class="relative my-2 h-12 flex-1">
							<div
								class="absolute h-8 rounded {getStatusColor(
									task.status
								)} flex items-center px-2 opacity-80 transition-opacity hover:opacity-100"
								style="{calculateTaskPosition(task).left}; width: {calculateTaskPosition(task)
									.width}"
							>
								<span class="truncate text-xs font-medium text-white">
									{task.progress}%
								</span>
							</div>

							<!-- 今日の線 -->
							{#if index === 0}
								<div class="bg-error absolute top-0 bottom-0 w-0.5 opacity-50" style="left: 25%">
									<div
										class="text-error absolute -top-4 left-1/2 -translate-x-1/2 transform text-xs whitespace-nowrap"
									>
										今日
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
