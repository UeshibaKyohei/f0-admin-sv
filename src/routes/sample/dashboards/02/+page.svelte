<script>
	import { onMount } from 'svelte';
	import ProjectOverview from './ProjectOverview.svelte';
	import GanttTimeline from './GanttTimeline.svelte';
	import TeamWorkload from './TeamWorkload.svelte';
	import TaskKanban from './TaskKanban.svelte';
	import MilestoneTracker from './MilestoneTracker.svelte';
	import { config, featureFlags } from './config.js';
	import { getProjects } from './services/dataService.js';

	let selectedProject = $state('all');
	let viewMode = $state('overview'); // overview, timeline, kanban
	let currentDate = $state(new Date().toLocaleDateString('ja-JP'));
	let isExporting = $state(false);
	let projects = $state([]);

	onMount(async () => {
		// プロジェクト一覧を取得
		try {
			const projectList = await getProjects();
			projects = [
				{ id: 'all', name: '全プロジェクト' },
				...projectList.map((p) => ({ id: p.project_id, name: p.project_name }))
			];
		} catch (error) {
			console.error('Failed to load projects:', error);
			// フォールバック用のデータ
			projects = [
				{ id: 'all', name: '全プロジェクト' },
				{ id: 'proj_1', name: 'Webサイトリニューアル' },
				{ id: 'proj_2', name: 'モバイルアプリ開発' },
				{ id: 'proj_3', name: 'データ基盤構築' }
			];
		}

		// 日時更新の設定
		const interval = setInterval(() => {
			currentDate = new Date().toLocaleDateString('ja-JP');
		}, config.REFRESH_INTERVALS.PROJECT_STATUS);

		return () => clearInterval(interval);
	});

	async function exportData() {
		if (!featureFlags.SHOW_EXPORT_BUTTON) return;

		isExporting = true;
		await new Promise((resolve) => setTimeout(resolve, 1500));

		if (config.USE_MOCK_DATA) {
			alert('プロジェクトデータのエクスポート機能を実装予定');
		} else {
			// 本番環境では実際のエクスポート処理を実行
			// API呼び出しやファイルダウンロード処理
		}

		isExporting = false;
	}
</script>

<div class="bg-base-100 min-h-screen">
	<!-- タイトル -->
	<div class="bg-base-100 px-4 pt-4 lg:px-6">
		<h1 class="text-2xl font-bold">プロジェクト管理</h1>
	</div>

	<!-- ヘッダー -->
	<div class="bg-base-100 border-base-300 mt-2 border-b">
		<div class="px-4 py-3 lg:px-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<select class="select select-sm select-bordered" bind:value={selectedProject}>
						{#each projects as project}
							<option value={project.id}>{project.name}</option>
						{/each}
					</select>
				</div>

				<div class="flex items-center gap-4">
					<!-- ビュー切り替え -->
					<div class="btn-group btn-group-sm">
						<button
							class="btn"
							class:btn-active={viewMode === 'overview'}
							onclick={() => (viewMode = 'overview')}
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
									d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
								/>
							</svg>
							概要
						</button>
						<button
							class="btn"
							class:btn-active={viewMode === 'timeline'}
							onclick={() => (viewMode = 'timeline')}
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
									d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
								/>
							</svg>
							タイムライン
						</button>
						<button
							class="btn"
							class:btn-active={viewMode === 'kanban'}
							onclick={() => (viewMode = 'kanban')}
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
									d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z"
								/>
							</svg>
							かんばん
						</button>
					</div>

					<!-- 更新日時 -->
					<div class="text-base-content/60 text-sm">
						{currentDate}
					</div>

					<!-- エクスポート -->
					{#if featureFlags.SHOW_EXPORT_BUTTON}
						<button class="btn btn-sm btn-ghost gap-2" onclick={exportData} disabled={isExporting}>
							{#if isExporting}
								<span class="loading loading-spinner loading-xs"></span>
							{:else}
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
										d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
									/>
								</svg>
							{/if}
							エクスポート
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- メインコンテンツ -->
	<div class="bg-base-200 px-4 py-4 lg:px-6">
		{#if viewMode === 'overview'}
			<div class="grid grid-cols-12 gap-4">
				<!-- プロジェクト概要 -->
				<div class="col-span-12">
					<ProjectOverview projectId={selectedProject} />
				</div>

				<!-- チーム稼働状況とマイルストーン -->
				<div class="col-span-12 lg:col-span-7">
					<TeamWorkload projectId={selectedProject} />
				</div>
				<div class="col-span-12 lg:col-span-5">
					<MilestoneTracker projectId={selectedProject} />
				</div>
			</div>
		{:else if viewMode === 'timeline'}
			<GanttTimeline projectId={selectedProject} />
		{:else if viewMode === 'kanban'}
			<TaskKanban projectId={selectedProject} />
		{/if}
	</div>
</div>
