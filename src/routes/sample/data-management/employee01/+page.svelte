<script>
  import { onMount } from 'svelte';
  import { 
    employees, 
    filteredEmployees, 
    statistics, 
    departmentList, 
    positionList, 
    skillList,
    initializeEmployeeData,
    isLoading,
    error 
  } from './stores/employeeStore.js';
  import { 
    viewMode, 
    selectedEmployees, 
    uiState,
    notifications,
    initializeUIState,
    addNotification,
    removeNotification 
  } from './stores/uiStore.js';
  import EmployeeList from './EmployeeList.svelte';
  import EmployeeFilters from './EmployeeFilters.svelte';
  import EmployeeStats from './EmployeeStats.svelte';
  import EmployeeModal from './EmployeeModal.svelte';
  import OrgChart from './OrgChart.svelte';
  import SkillManagement from './SkillManagement.svelte';
  import { openEmployeeModal } from './stores/uiStore.js';
  import { CONFIG } from './config.js';

  // 初期化
  onMount(async () => {
    initializeUIState();
    await initializeEmployeeData();
    
    if ($error) {
      addNotification($error, 'error');
    } else if (CONFIG.IS_MOCK_MODE) {
      addNotification('社員データを読み込みました（モックモード）', 'info', 3000);
    } else {
      addNotification('社員データを読み込みました', 'success', 3000);
    }
  });

  // 表示モード切り替え
  function handleViewModeChange(mode) {
    viewMode.set(mode);
  }

  function getViewModeLabel(mode) {
    switch (mode) {
      case 'list': return 'リスト表示';
      case 'grid': return 'グリッド表示';
      case 'org_chart': return '組織図';
      case 'skill_matrix': return 'スキルマトリックス';
      default: return 'リスト表示';
    }
  }

  // 一括操作
  function handleBulkDelete() {
    if ($selectedEmployees.length === 0) return;
    
    const message = `選択した${$selectedEmployees.length}人の社員を削除しますか？`;
    if (confirm(message)) {
      // 実際の削除処理はここで実装
      addNotification(`${$selectedEmployees.length}人の社員を削除しました`, 'success');
      selectedEmployees.set([]);
    }
  }

  function handleBulkExport() {
    if ($selectedEmployees.length === 0) return;
    
    // CSV エクスポート処理
    addNotification(`${$selectedEmployees.length}人の社員データをエクスポートしました`, 'success');
  }

  // 新規社員登録
  function handleCreateEmployee() {
    openEmployeeModal('create', null);
  }

  // ヘルパー関数
  function formatNumber(num) {
    return new Intl.NumberFormat('ja-JP').format(num);
  }
</script>

<div class="min-h-screen bg-base-200">
  <!-- ページヘッダー -->
  <div class="bg-base-100 border-b border-base-300 shadow-sm sticky top-0 z-40">
    <div class="container mx-auto px-6 py-6">
      <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <!-- タイトルエリア -->
        <div class="flex-1">
          <div class="flex items-center gap-4 mb-3">
            <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-primary-content" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM9 16h6a2 2 0 002-2v-1a3 3 0 00-3-3H6a3 3 0 00-3 3v1a2 2 0 002 2h3z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-semibold text-base-content tracking-tight">
                社員管理システム
              </h1>
              <p class="text-base-content/60 text-sm">
                組織の力を最大化する人事情報プラットフォーム
              </p>
            </div>
            {#if $isLoading}
              <div class="loading loading-spinner loading-sm text-primary ml-2"></div>
            {/if}
          </div>
        </div>

        <!-- 統計サマリー - 簡潔版 -->
        {#if $statistics}
          <div class="flex gap-6 text-sm">
            <div class="text-center">
              <div class="text-xl font-bold text-primary">{formatNumber($statistics.totalEmployees)}</div>
              <div class="text-base-content/60">総社員</div>
            </div>
            <div class="text-center">
              <div class="text-xl font-bold text-success">{formatNumber($statistics.activeEmployees)}</div>
              <div class="text-base-content/60">在籍中</div>
            </div>
            <div class="text-center">
              <div class="text-xl font-bold text-secondary">{$statistics.averageAge}<span class="text-xs">歳</span></div>
              <div class="text-base-content/60">平均年齢</div>
            </div>
            <div class="text-center">
              <div class="text-xl font-bold text-accent">{$statistics.averageTenure}<span class="text-xs">年</span></div>
              <div class="text-base-content/60">平均勤続</div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- メインコンテンツ -->
  <div class="container mx-auto px-6 py-6">
    <!-- メインコンテンツエリア -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- 統計情報サイドバー -->
      <div class="lg:col-span-1">
        <EmployeeStats />
      </div>

      <!-- 社員データエリア -->
      <div class="lg:col-span-3">
        <!-- エラー表示 -->
        {#if $error}
          <div class="alert alert-error mb-4">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <h3 class="font-bold">エラーが発生しました</h3>
              <div class="text-xs">{$error}</div>
            </div>
          </div>
        {/if}

        <!-- データコンテンツ -->
        {#if $isLoading}
          <!-- ローディング表示 -->
          <div class="card bg-base-100 shadow">
            <div class="card-body items-center text-center py-16">
              <div class="loading loading-spinner loading-lg text-primary"></div>
              <h3 class="card-title mt-4">データを読み込んでいます</h3>
              <p class="text-base-content/60">しばらくお待ちください...</p>
            </div>
          </div>
        {:else}
          <!-- タブナビゲーション（すべてのビューで表示） -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <!-- ビューモード切り替え -->
            <div class="flex items-center gap-2">
              <!-- メインビュー切り替え -->
              <div class="tabs tabs-boxed">
                <button 
                  class="tab {$viewMode === 'list' || $viewMode === 'grid' ? 'tab-active' : ''}"
                  onclick={() => handleViewModeChange('list')}
                >
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM9 16h6a2 2 0 002-2v-1a3 3 0 00-3-3H6a3 3 0 00-3 3v1a2 2 0 002 2h3z"></path>
                  </svg>
                  社員一覧
                </button>
                <button 
                  class="tab {$viewMode === 'org_chart' ? 'tab-active' : ''}"
                  onclick={() => handleViewModeChange('org_chart')}
                >
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 4a1 1 0 000 2h6a1 1 0 100-2H7zM7 8a1 1 0 000 2h6a1 1 0 100-2H7zM7 12a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                  </svg>
                  組織図
                </button>
                <button 
                  class="tab {$viewMode === 'skill_matrix' ? 'tab-active' : ''}"
                  onclick={() => handleViewModeChange('skill_matrix')}
                >
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path>
                  </svg>
                  スキル管理
                </button>
              </div>

              <!-- リスト/グリッド切り替え（社員一覧の時のみ表示） -->
              {#if $viewMode === 'list' || $viewMode === 'grid'}
                <div class="btn-group">
                  <button 
                    class="btn btn-sm {$viewMode === 'list' ? 'btn-active' : 'btn-ghost'}"
                    onclick={() => handleViewModeChange('list')}
                    aria-label="リスト表示"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                    </svg>
                  </button>
                  <button 
                    class="btn btn-sm {$viewMode === 'grid' ? 'btn-active' : 'btn-ghost'}"
                    onclick={() => handleViewModeChange('grid')}
                    aria-label="グリッド表示"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                    </svg>
                  </button>
                </div>
              {/if}
            </div>

            <!-- アクションボタン群（リスト・グリッドモードのみ） -->
            {#if $viewMode === 'list' || $viewMode === 'grid'}
              <div class="flex gap-2">
                <!-- 一括操作（選択時のみ表示） -->
                {#if $uiState.hasSelections}
                  <div class="join">
                    <button class="btn btn-error btn-sm join-item" onclick={handleBulkDelete}>
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                      削除 ({$selectedEmployees.length})
                    </button>
                    <button class="btn btn-success btn-sm join-item" onclick={handleBulkExport}>
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                      </svg>
                      エクスポート
                    </button>
                  </div>
                {/if}

                <!-- 通常操作 -->
                <button class="btn btn-primary btn-sm" onclick={handleCreateEmployee}>
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path>
                  </svg>
                  新規登録
                </button>
                
                <button class="btn btn-outline btn-sm">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 11-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  インポート
                </button>
              </div>
            {/if}
          </div>

          <!-- モード別コンテンツ表示 -->
          {#if $viewMode === 'list' || $viewMode === 'grid'}
            <!-- 検索・フィルター -->
            <div class="card bg-base-100 shadow mb-4">
              <div class="card-body py-4">
                <EmployeeFilters />
              </div>
            </div>

            <!-- 社員リスト/グリッド表示 -->
            <EmployeeList />
          {:else if $viewMode === 'org_chart'}
            <!-- 組織図表示 -->
            <OrgChart />
          {:else if $viewMode === 'skill_matrix'}
            <!-- スキル管理表示 -->
            <SkillManagement />
          {/if}
        {/if}
      </div>
    </div>
  </div>

  <!-- 通知表示 -->
  {#if $notifications.length > 0}
    <div class="toast toast-top toast-end z-50">
      {#each $notifications as notification (notification.id)}
        <div class="alert alert-{notification.type} shadow-lg">
          <span>{notification.message}</span>
          <button 
            class="btn btn-sm btn-circle btn-ghost"
            onclick={() => removeNotification(notification.id)}
          >
            ✕
          </button>
        </div>
      {/each}
    </div>
  {/if}

  <!-- 社員詳細・編集モーダル -->
  <EmployeeModal />
</div>

<style>
  /* レスポンシブ対応 */
  @media (max-width: 1280px) {
  }
  
  /* スムーズなトランジション */
  .card, .btn, .tab {
    transition: all 0.2s ease;
  }
  
  /* アニメーション */
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .alert {
    animation: slideInRight 0.3s ease-out;
  }
</style>