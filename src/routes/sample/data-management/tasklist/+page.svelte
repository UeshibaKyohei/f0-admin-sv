<script>
  import { onMount } from 'svelte';
  import { tasks, campaigns, users, currentUser, taskStats, viewSettings, filterOptions, initializeStores } from './stores/taskStore';
  import { isFilterPanelOpen, isTaskModalOpen, isLoading } from './stores/uiStore';
  import TaskBoard from './TaskBoard.svelte';
  import TaskStats from './TaskStats.svelte';
  import FilterPanel from './FilterPanel.svelte';
  import UserProfile from './UserProfile.svelte';
  import TaskList from './TaskList.svelte';
  import TaskCalendar from './TaskCalendar.svelte';
  import GanttChart from './GanttChart.svelte';
  import GameificationPanel from './GameificationPanel.svelte';
  import CreateTaskModal from './CreateTaskModal.svelte';
  import TaskModal from './TaskModal.svelte';
  import ToastContainer from './ToastContainer.svelte';
  import { config, getDepartmentDisplayName } from './config.js';
  
  // ビュー切り替え
  function setView(view) {
    viewSettings.update(v => ({
      ...v,
      view,
      // カンバンビューでは手動ソートを使用
      sortBy: view === 'kanban' ? 'manual' : (v.sortBy === 'manual' ? 'priority' : v.sortBy)
    }));
  }
  
  // 新規タスクモーダルの表示制御
  let isCreateTaskModalOpen = false;
  
  // ページマウント時にストアを初期化
  onMount(() => {
    initializeStores();
  });
</script>

<div class="min-h-screen bg-base-200">
  <!-- ヘッダー -->
  <div class="navbar bg-base-100 shadow-sm">
    <div class="flex-1">
      <h1 class="text-2xl font-bold">タスク管理システム</h1>
      {#if config.FEATURE_DEMO_MODE}
        <div class="ml-4 badge badge-primary">{getDepartmentDisplayName()}</div>
      {/if}
    </div>
    <div class="flex-none gap-2">
      <!-- ユーザープロファイル -->
      {#if $currentUser}
        <UserProfile user={$currentUser} />
      {/if}
    </div>
  </div>

  <!-- ローディング表示 -->
  {#if $isLoading}
    <div class="fixed inset-0 bg-base-300/50 z-50 flex items-center justify-center">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>
  {/if}

  <!-- メインコンテンツ -->
  <div class="container mx-auto p-4">
    <!-- 統計情報 -->
    <TaskStats stats={$taskStats} />

    <!-- ツールバー -->
    <div class="flex flex-wrap items-center justify-between my-4 gap-4">
      <!-- ビュー切り替え -->
      <div class="tabs tabs-boxed">
        <button 
          class="tab {$viewSettings.view === 'kanban' ? 'tab-active' : ''}"
          onclick={() => setView('kanban')}
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          カンバン
        </button>
        <button 
          class="tab {$viewSettings.view === 'list' ? 'tab-active' : ''}"
          onclick={() => setView('list')}
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          リスト
        </button>
        <button 
          class="tab {$viewSettings.view === 'calendar' ? 'tab-active' : ''}"
          onclick={() => setView('calendar')}
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          カレンダー
        </button>
        <button 
          class="tab {$viewSettings.view === 'gantt' ? 'tab-active' : ''}"
          onclick={() => setView('gantt')}
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          ガント
        </button>
      </div>

      <!-- アクションボタン -->
      <div class="flex gap-2">
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => isFilterPanelOpen.update(v => !v)}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          フィルター
          {#if Object.entries($filterOptions).some(([key, v]) => {
            if (key === 'dateRange') {
              return v.start !== null || v.end !== null;
            }
            return Array.isArray(v) ? v.length > 0 : v;
          })}
            <div class="badge badge-sm badge-primary">{Object.entries($filterOptions).filter(([key, v]) => {
              if (key === 'dateRange') {
                return v.start !== null || v.end !== null;
              }
              return Array.isArray(v) ? v.length > 0 : v;
            }).length}</div>
          {/if}
        </button>
        <button 
          class="btn btn-sm btn-primary"
          onclick={() => isCreateTaskModalOpen = true}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新規タスク
        </button>
      </div>
    </div>

    <!-- フィルターパネル -->
    {#if $isFilterPanelOpen}
      <FilterPanel />
    {/if}

    <!-- メインビュー -->
    <div class="mt-4">
      {#if $viewSettings.view === 'kanban'}
        <TaskBoard />
      {:else if $viewSettings.view === 'list'}
        <TaskList />
      {:else if $viewSettings.view === 'calendar'}
        <TaskCalendar />
      {:else if $viewSettings.view === 'gantt'}
        <GanttChart />
      {:else}
        <div class="alert alert-info">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>このビューは準備中です</span>
        </div>
      {/if}
    </div>
    
    <!-- ゲーミフィケーションパネル -->
    {#if config.FEATURE_GAMIFICATION}
      <div class="mt-6">
        <GameificationPanel />
      </div>
    {/if}
  </div>
  
  <!-- 新規タスク作成モーダル -->
  <CreateTaskModal 
    isOpen={isCreateTaskModalOpen}
    onClose={() => isCreateTaskModalOpen = false}
  />
  
  <!-- タスク詳細モーダル -->
  {#if $isTaskModalOpen}
    <TaskModal />
  {/if}
  
  <!-- トースト通知 -->
  <ToastContainer />
</div>