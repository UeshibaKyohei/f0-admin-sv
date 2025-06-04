<script>
	import { onMount } from 'svelte';
	import { getProjectMetrics } from './services/dataService.js';
	import { config } from './config.js';

	let { projectId = 'all' } = $props();
	let overview = $state(null);
	let loading = $state(true);
	let error = $state(null);

	async function loadOverview() {
		try {
			loading = true;
			error = null;
			overview = await getProjectMetrics(projectId);
		} catch (err) {
			error = err.message;
			console.error('Failed to load project overview:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadOverview();
		const interval = setInterval(loadOverview, config.REFRESH_INTERVALS.PROJECT_STATUS);
		return () => clearInterval(interval);
	});

	$effect(() => {
		loadOverview();
	});

	function getStatusColor(status) {
		if (status === 'completed') return 'text-success';
		if (status === 'overdue') return 'text-error';
		if (status === 'in_progress') return 'text-info';
		return 'text-base-content/60';
	}
</script>

{#if loading}
	<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
		{#each Array(8) as _}
			<div class="bg-base-100 border-base-300 rounded-lg border p-4">
				<div class="animate-pulse">
					<div class="bg-base-300 mb-3 h-4 w-3/4 rounded"></div>
					<div class="bg-base-300 h-8 w-1/2 rounded"></div>
				</div>
			</div>
		{/each}
	</div>
{:else if error}
	<div class="alert alert-error">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6 shrink-0 stroke-current"
			fill="none"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
		<span>データの取得に失敗しました: {error}</span>
	</div>
{:else if overview}
	<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
		<!-- プロジェクト数 -->
		<div
			class="bg-base-100 border-base-300 rounded-lg border p-4 transition-shadow hover:shadow-md"
		>
			<div class="mb-2 flex items-center justify-between">
				<span class="text-base-content/60 text-sm">プロジェクト数</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="text-primary h-5 w-5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
					/>
				</svg>
			</div>
			<div class="text-2xl font-bold">{overview.totalProjects}</div>
			<div class="text-base-content/60 text-xs">
				アクティブ: {overview.activeProjects}
			</div>
		</div>

		<!-- タスク総数 -->
		<div
			class="bg-base-100 border-base-300 rounded-lg border p-4 transition-shadow hover:shadow-md"
		>
			<div class="mb-2 flex items-center justify-between">
				<span class="text-base-content/60 text-sm">タスク総数</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="text-info h-5 w-5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</div>
			<div class="text-2xl font-bold">{overview.totalTasks}</div>
			<div class="text-base-content/60 text-xs">
				完了: {overview.completedTasks}
			</div>
		</div>

		<!-- 進行中タスク -->
		<div
			class="bg-base-100 border-base-300 rounded-lg border p-4 transition-shadow hover:shadow-md"
		>
			<div class="mb-2 flex items-center justify-between">
				<span class="text-base-content/60 text-sm">進行中</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="text-warning h-5 w-5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
					/>
				</svg>
			</div>
			<div class="text-2xl font-bold">{overview.inProgressTasks}</div>
			<div class="text-error text-xs">
				遅延: {overview.overdueTasks}
			</div>
		</div>

		<!-- チームメンバー -->
		<div
			class="bg-base-100 border-base-300 rounded-lg border p-4 transition-shadow hover:shadow-md"
		>
			<div class="mb-2 flex items-center justify-between">
				<span class="text-base-content/60 text-sm">メンバー</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="text-success h-5 w-5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
					/>
				</svg>
			</div>
			<div class="text-2xl font-bold">{overview.totalMembers}</div>
			<div class="text-base-content/60 text-xs">稼働中</div>
		</div>

		<!-- 完了率 -->
		<div
			class="bg-base-100 border-base-300 rounded-lg border p-4 transition-shadow hover:shadow-md"
		>
			<div class="mb-2 flex items-center justify-between">
				<span class="text-base-content/60 text-sm">完了率</span>
				<div
					class="radial-progress text-primary text-xs"
					style="--value:{(overview.completedTasks / overview.totalTasks) * 100}; --size:2rem;"
				>
					{Math.round((overview.completedTasks / overview.totalTasks) * 100)}%
				</div>
			</div>
			<progress
				class="progress progress-primary"
				value={overview.completedTasks}
				max={overview.totalTasks}
			></progress>
			<div class="text-base-content/60 mt-1 text-xs">
				{overview.completedTasks} / {overview.totalTasks} タスク
			</div>
		</div>

		<!-- 平均進捗 -->
		<div
			class="bg-base-100 border-base-300 rounded-lg border p-4 transition-shadow hover:shadow-md"
		>
			<div class="mb-2 flex items-center justify-between">
				<span class="text-base-content/60 text-sm">平均進捗</span>
				<span class="text-info text-lg font-bold">{overview.averageProgress}%</span>
			</div>
			<progress class="progress progress-info" value={overview.averageProgress} max="100"
			></progress>
		</div>

		<!-- 今週の完了 -->
		<div
			class="bg-base-100 border-base-300 rounded-lg border p-4 transition-shadow hover:shadow-md"
		>
			<div class="mb-2 flex items-center justify-between">
				<span class="text-base-content/60 text-sm">今週の完了</span>
				<span class="badge badge-success badge-sm">+12</span>
			</div>
			<div class="text-2xl font-bold">23</div>
			<div class="text-base-content/60 text-xs">タスク</div>
		</div>

		<!-- リスク項目 -->
		<div
			class="bg-base-100 border-base-300 rounded-lg border p-4 transition-shadow hover:shadow-md"
		>
			<div class="mb-2 flex items-center justify-between">
				<span class="text-base-content/60 text-sm">リスク項目</span>
				<span class="badge badge-error badge-sm">{overview.overdueTasks}</span>
			</div>
			<div class="space-y-1 text-xs">
				<div class="text-error">遅延: {overview.overdueTasks}件</div>
				<div class="text-warning">要注意: 3件</div>
			</div>
		</div>
	</div>
{/if}
