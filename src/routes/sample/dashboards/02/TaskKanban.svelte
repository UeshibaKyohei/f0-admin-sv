<script>
	import { onMount } from 'svelte';
	import { getKanbanTasks, updateTaskStatus } from './services/dataService.js';
	import { config } from './config.js';

	let { projectId = 'all' } = $props();
	let kanbanData = $state({});
	let loading = $state(true);
	let error = $state(null);
	let draggedTask = $state(null);
	let draggedOverColumn = $state(null);

	// かんばんカラム
	const columns = config.KANBAN_COLUMNS;

	async function loadTasks() {
		try {
			loading = true;
			error = null;
			kanbanData = await getKanbanTasks(projectId);
		} catch (err) {
			error = err.message;
			console.error('Failed to load tasks:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadTasks();
		const interval = setInterval(loadTasks, config.REFRESH_INTERVALS.TASKS);
		return () => clearInterval(interval);
	});

	$effect(() => {
		loadTasks();
	});

	// カラムごとのタスク取得
	function getTasksByStatus(status) {
		return kanbanData[status] || [];
	}

	// ドラッグ&ドロップハンドラー
	function handleDragStart(e, task) {
		draggedTask = task;
		e.dataTransfer.effectAllowed = 'move';
	}

	function handleDragOver(e, columnId) {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		draggedOverColumn = columnId;
	}

	function handleDragLeave() {
		draggedOverColumn = null;
	}

	async function handleDrop(e, newStatus) {
		e.preventDefault();
		if (draggedTask && draggedTask.status !== newStatus) {
			// タスクのステータスを更新
			try {
				await updateTaskStatus(draggedTask.task_id, newStatus);
				// ローカルステートを更新 - 古いステータスから削除し、新しいステータスに追加
				const updatedTask = { ...draggedTask, status: newStatus };
				const newKanbanData = { ...kanbanData };

				// 古いステータスから削除
				newKanbanData[draggedTask.status] = newKanbanData[draggedTask.status].filter(
					(task) => task.task_id !== draggedTask.task_id
				);

				// 新しいステータスに追加
				if (!newKanbanData[newStatus]) newKanbanData[newStatus] = [];
				newKanbanData[newStatus].push(updatedTask);

				kanbanData = newKanbanData;
			} catch (err) {
				console.error('Failed to update task status:', err);
			}
		}
		draggedTask = null;
		draggedOverColumn = null;
	}

	function getPriorityColor(priority) {
		const colors = {
			high: 'badge-error',
			medium: 'badge-warning',
			low: 'badge-info'
		};
		return colors[priority] || 'badge-ghost';
	}
</script>

<div class="bg-base-100 border-base-300 rounded-lg border">
	<div class="border-base-200 border-b p-4 pb-3">
		<div class="flex items-center justify-between">
			<h3 class="text-base font-semibold">タスクボード</h3>
			<button class="btn btn-primary btn-sm gap-2">
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
				タスク追加
			</button>
		</div>
	</div>

	{#if loading}
		<div class="p-4">
			<div class="grid grid-cols-4 gap-4">
				{#each Array(4) as _}
					<div class="animate-pulse">
						<div class="bg-base-300 mb-4 h-8 rounded"></div>
						<div class="space-y-2">
							{#each Array(3) as _}
								<div class="bg-base-300 h-24 rounded"></div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if error}
		<div class="text-error p-4">{error}</div>
	{:else}
		<div class="overflow-x-auto p-4">
			<div class="grid min-w-[800px] grid-cols-4 gap-4">
				{#each columns as column}
					<div
						class="bg-base-200/30 min-h-[500px] rounded-lg p-3 transition-colors"
						class:bg-base-200={draggedOverColumn === column.id}
						ondragover={(e) => handleDragOver(e, column.id)}
						ondragleave={handleDragLeave}
						ondrop={(e) => handleDrop(e, column.id)}
					>
						<!-- カラムヘッダー -->
						<div class="mb-3 flex items-center justify-between">
							<h4 class="text-sm font-semibold">{column.name}</h4>
							<span class="badge badge-sm">{getTasksByStatus(column.id).length}</span>
						</div>

						<!-- タスクカード -->
						<div class="space-y-2">
							{#each getTasksByStatus(column.id) as task}
								<div
									class="card bg-base-100 cursor-move shadow-sm transition-shadow hover:shadow-md"
									draggable="true"
									ondragstart={(e) => handleDragStart(e, task)}
								>
									<div class="card-body p-3">
										<div class="flex items-start justify-between gap-2">
											<h5 class="line-clamp-2 text-sm font-medium">{task.task_name}</h5>
											<span class="badge badge-xs {getPriorityColor(task.priority)}">
												{task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
											</span>
										</div>

										<div class="mt-2 space-y-1">
											<div class="text-base-content/60 flex items-center gap-2 text-xs">
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
														d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
													/>
												</svg>
												<span>{task.assignee}</span>
											</div>

											<div class="text-base-content/60 flex items-center gap-2 text-xs">
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
														d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
													/>
												</svg>
												<span
													>{new Date(task.due_date).toLocaleDateString('ja-JP', {
														month: 'short',
														day: 'numeric'
													})}</span
												>
											</div>
										</div>

										{#if task.progress > 0}
											<div class="mt-2">
												<progress
													class="progress progress-primary h-1"
													value={task.progress}
													max="100"
												></progress>
											</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
