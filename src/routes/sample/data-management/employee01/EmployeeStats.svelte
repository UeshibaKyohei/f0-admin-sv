<script>
  import { 
    statistics, 
    departmentList, 
    positionList, 
    skillList,
    departmentEmployeeCounts,
    departmentTree 
  } from './stores/employeeStore.js';
  import { STATUS, CONFIG } from './config.js';
  import { resetMockData } from './api/apiService.js';
  import { forceResetEmployeeData } from './stores/employeeStore.js';

  // 開閉状態の管理
  let openSections = {
    basic: true,      // 基本統計は初期表示
    contract: false,  // 雇用形態分布
    department: false, // 部署別社員数
    position: false,   // 役職別分布
    skill: false,      // 人気スキル
    organization: false, // 組織構造
    quickAction: false,   // クイックアクション
    mockData: false       // モックデータ管理（モック時のみ）
  };

  // セクション開閉の切り替え
  function toggleSection(section) {
    openSections[section] = !openSections[section];
  }

  // 統計データの整形
  $: departmentStats = $departmentList.map(dept => ({
    ...dept,
    employeeCount: $departmentEmployeeCounts.get(dept.id) || 0
  })).filter(dept => dept.employeeCount > 0);

  $: positionStats = $positionList.map(pos => ({
    ...pos,
    employeeCount: $statistics?.positionCounts[pos.id] || 0
  })).filter(pos => pos.employeeCount > 0);

  $: skillStats = $skillList.map(skill => ({
    ...skill,
    employeeCount: $statistics?.skillCounts[skill.id] || 0
  })).filter(skill => skill.employeeCount > 0)
    .sort((a, b) => b.employeeCount - a.employeeCount);

  // 雇用形態統計
  $: contractTypeStats = Object.values(STATUS.CONTRACT_TYPE).map(type => ({
    ...type,
    count: $statistics?.contractTypeCounts[type.value] || 0
  })).filter(type => type.count > 0);

  // トップ部署・役職・スキル（上位5つ）
  $: topDepartments = departmentStats.sort((a, b) => b.employeeCount - a.employeeCount).slice(0, 5);
  $: topPositions = positionStats.sort((a, b) => b.employeeCount - a.employeeCount).slice(0, 5);
  $: topSkills = skillStats.slice(0, 5);

  // パーセンテージ計算
  function getPercentage(count, total) {
    if (!total || total === 0) return 0;
    return Math.round((count / total) * 100);
  }

  // 数値フォーマット
  function formatNumber(num) {
    return new Intl.NumberFormat('ja-JP').format(num);
  }

  // 離職率の評価
  function getTurnoverRateStatus(rate) {
    if (rate < 5) return { class: 'text-success', label: '良好' };
    if (rate < 10) return { class: 'text-warning', label: '注意' };
    return { class: 'text-error', label: '高リスク' };
  }

  // モックデータリセット
  async function handleResetMockData() {
    if (confirm('すべてのモックデータをリセットしますか？\nこの操作は取り消せません。')) {
      try {
        await resetMockData();
        await forceResetEmployeeData();
        window.location.reload();
      } catch (error) {
        console.error('データリセットエラー:', error);
        alert('データリセットに失敗しました。');
      }
    }
  }
</script>

<div class="h-full flex flex-col">
  <!-- 統計エリア（独立スクロール） -->
  <div class="flex-1 overflow-y-auto pr-2 space-y-3">
    <!-- 基本統計 -->
    <div class="card bg-base-100 shadow-sm border border-base-300">
      <div class="card-body p-4">
        <button 
          class="flex items-center justify-between w-full text-left hover:bg-base-50 rounded-lg p-2 -m-2 transition-colors"
          onclick={() => toggleSection('basic')}
        >
          <h3 class="text-base font-semibold text-base-content">基本統計</h3>
          <svg class="w-4 h-4 transition-transform {openSections.basic ? 'rotate-180' : ''}" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
        
        {#if openSections.basic}
          <div class="mt-3 space-y-3">
            {#if $statistics}
              <!-- 社員数統計 -->
              <div class="bg-base-50 rounded-lg p-3">
                <div class="text-xs text-base-content/60 uppercase tracking-wide mb-1">総社員数</div>
                <div class="text-2xl font-bold text-primary">{formatNumber($statistics.totalEmployees)}</div>
                <div class="text-xs text-base-content/70 mt-1">
                  在籍中: {formatNumber($statistics.activeEmployees)}人
                  ({getPercentage($statistics.activeEmployees, $statistics.totalEmployees)}%)
                </div>
              </div>

              <!-- 年齢統計 -->
              <div class="bg-base-50 rounded-lg p-3">
                <div class="text-xs text-base-content/60 uppercase tracking-wide mb-1">平均年齢</div>
                <div class="text-2xl font-bold text-secondary">{$statistics.averageAge}<span class="text-sm font-normal">歳</span></div>
              </div>

              <!-- 勤続年数統計 -->
              <div class="bg-base-50 rounded-lg p-3">
                <div class="text-xs text-base-content/60 uppercase tracking-wide mb-1">平均勤続年数</div>
                <div class="text-2xl font-bold text-accent">{$statistics.averageTenure}<span class="text-sm font-normal">年</span></div>
              </div>

              <!-- 離職率 -->
              <div class="bg-base-50 rounded-lg p-3">
                <div class="text-xs text-base-content/60 uppercase tracking-wide mb-1">離職率</div>
                <div class="text-2xl font-bold {getTurnoverRateStatus($statistics.turnoverRate).class}">
                  {$statistics.turnoverRate}%
                </div>
                <div class="text-xs {getTurnoverRateStatus($statistics.turnoverRate).class} mt-1">
                  {getTurnoverRateStatus($statistics.turnoverRate).label}
                </div>
              </div>
            {:else}
              <div class="flex justify-center py-8">
                <div class="loading loading-spinner loading-sm"></div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- 雇用形態分布 -->
    <div class="card bg-base-100 shadow-sm border border-base-300">
      <div class="card-body p-4">
        <button 
          class="flex items-center justify-between w-full text-left hover:bg-base-50 rounded-lg p-2 -m-2 transition-colors"
          onclick={() => toggleSection('contract')}
        >
          <h3 class="text-base font-semibold text-base-content">雇用形態分布</h3>
          <svg class="w-4 h-4 transition-transform {openSections.contract ? 'rotate-180' : ''}" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
        
        {#if openSections.contract}
          <div class="mt-3 space-y-3">
            {#each contractTypeStats as contractType}
              <div class="flex items-center justify-between py-2">
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 rounded-full {contractType.color.replace('badge-', 'bg-')}"></div>
                  <span class="text-sm font-medium">{contractType.label}</span>
                </div>
                <div class="text-right">
                  <div class="text-sm font-semibold">{contractType.count}人</div>
                  <div class="text-xs text-base-content/60">
                    {getPercentage(contractType.count, $statistics?.totalEmployees)}%
                  </div>
                </div>
              </div>
              <div class="w-full bg-base-200 rounded-full h-1.5 mb-2">
                <div 
                  class="bg-primary h-1.5 rounded-full transition-all duration-500"
                  style="width: {getPercentage(contractType.count, $statistics?.totalEmployees)}%"
                ></div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- 部署別社員数（トップ5） -->
    <div class="card bg-base-100 shadow-sm border border-base-300">
      <div class="card-body p-4">
        <button 
          class="flex items-center justify-between w-full text-left hover:bg-base-50 rounded-lg p-2 -m-2 transition-colors"
          onclick={() => toggleSection('department')}
        >
          <h3 class="text-base font-semibold text-base-content">部署別社員数</h3>
          <svg class="w-4 h-4 transition-transform {openSections.department ? 'rotate-180' : ''}" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
        
        {#if openSections.department}
          <div class="mt-3 space-y-3">
            {#each topDepartments as department}
              <div class="flex items-center justify-between py-2">
                <div>
                  <div class="text-sm font-medium">{department.name}</div>
                  <div class="text-xs text-base-content/60">{department.code}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-semibold">{department.employeeCount}人</div>
                  <div class="text-xs text-base-content/60">
                    {getPercentage(department.employeeCount, $statistics?.activeEmployees)}%
                  </div>
                </div>
              </div>
              <div class="w-full bg-base-200 rounded-full h-1.5 mb-2">
                <div 
                  class="bg-secondary h-1.5 rounded-full transition-all duration-500"
                  style="width: {getPercentage(department.employeeCount, $statistics?.activeEmployees)}%"
                ></div>
              </div>
            {/each}
            
            {#if departmentStats.length > 5}
              <div class="text-center mt-3">
                <button class="btn btn-ghost btn-xs text-xs">
                  他{departmentStats.length - 5}部署を表示
                </button>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- 役職別分布（トップ5） -->
    <div class="card bg-base-100 shadow-sm border border-base-300">
      <div class="card-body p-4">
        <button 
          class="flex items-center justify-between w-full text-left hover:bg-base-50 rounded-lg p-2 -m-2 transition-colors"
          onclick={() => toggleSection('position')}
        >
          <h3 class="text-base font-semibold text-base-content">役職別分布</h3>
          <svg class="w-4 h-4 transition-transform {openSections.position ? 'rotate-180' : ''}" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
        
        {#if openSections.position}
          <div class="mt-3 space-y-3">
            {#each topPositions as position}
              <div class="flex items-center justify-between py-2">
                <div>
                  <div class="text-sm font-medium">{position.name}</div>
                  <div class="text-xs text-base-content/60">
                    Level {position.level}
                    {#if position.isManagement}
                      <span class="inline-block w-1.5 h-1.5 bg-warning rounded-full ml-2"></span>
                    {/if}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-semibold">{position.employeeCount}人</div>
                  <div class="text-xs text-base-content/60">
                    {getPercentage(position.employeeCount, $statistics?.activeEmployees)}%
                  </div>
                </div>
              </div>
              <div class="w-full bg-base-200 rounded-full h-1.5 mb-2">
                <div 
                  class="bg-accent h-1.5 rounded-full transition-all duration-500"
                  style="width: {getPercentage(position.employeeCount, $statistics?.activeEmployees)}%"
                ></div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- 人気スキル（トップ5） -->
    <div class="card bg-base-100 shadow-sm border border-base-300">
      <div class="card-body p-4">
        <button 
          class="flex items-center justify-between w-full text-left hover:bg-base-50 rounded-lg p-2 -m-2 transition-colors"
          onclick={() => toggleSection('skill')}
        >
          <h3 class="text-base font-semibold text-base-content">人気スキル</h3>
          <svg class="w-4 h-4 transition-transform {openSections.skill ? 'rotate-180' : ''}" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
        
        {#if openSections.skill}
          <div class="mt-3 space-y-3">
            {#each topSkills as skill}
              <div class="flex items-center justify-between py-2">
                <div>
                  <div class="text-sm font-medium">{skill.name}</div>
                  <div class="text-xs text-base-content/60">{skill.category}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-semibold">{skill.employeeCount}人</div>
                  <div class="text-xs text-base-content/60">
                    {getPercentage(skill.employeeCount, $statistics?.activeEmployees)}%
                  </div>
                </div>
              </div>
              <div class="w-full bg-base-200 rounded-full h-1.5 mb-2">
                <div 
                  class="bg-info h-1.5 rounded-full transition-all duration-500"
                  style="width: {getPercentage(skill.employeeCount, $statistics?.activeEmployees)}%"
                ></div>
              </div>
            {/each}
            
            {#if skillStats.length > 5}
              <div class="text-center mt-3">
                <button class="btn btn-ghost btn-xs text-xs">
                  他{skillStats.length - 5}スキルを表示
                </button>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- 組織構造概要 -->
    <div class="card bg-base-100 shadow-sm border border-base-300">
      <div class="card-body p-4">
        <button 
          class="flex items-center justify-between w-full text-left hover:bg-base-50 rounded-lg p-2 -m-2 transition-colors"
          onclick={() => toggleSection('organization')}
        >
          <h3 class="text-base font-semibold text-base-content">組織構造</h3>
          <svg class="w-4 h-4 transition-transform {openSections.organization ? 'rotate-180' : ''}" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
        
        {#if openSections.organization}
          <div class="mt-3 space-y-2">
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-base-50 rounded-lg p-3 text-center">
                <div class="text-lg font-bold text-primary">{$departmentList.length}</div>
                <div class="text-xs text-base-content/60">部署数</div>
              </div>
              <div class="bg-base-50 rounded-lg p-3 text-center">
                <div class="text-lg font-bold text-secondary">{$positionList.length}</div>
                <div class="text-xs text-base-content/60">役職数</div>
              </div>
              <div class="bg-base-50 rounded-lg p-3 text-center">
                <div class="text-lg font-bold text-accent">{$skillList.length}</div>
                <div class="text-xs text-base-content/60">スキル数</div>
              </div>
              <div class="bg-base-50 rounded-lg p-3 text-center">
                <div class="text-lg font-bold text-info">{Math.max(...$departmentList.map(d => d.level))}</div>
                <div class="text-xs text-base-content/60">最大階層</div>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- クイックアクション -->
    <div class="card bg-base-100 shadow-sm border border-base-300">
      <div class="card-body p-4">
        <button 
          class="flex items-center justify-between w-full text-left hover:bg-base-50 rounded-lg p-2 -m-2 transition-colors"
          onclick={() => toggleSection('quickAction')}
        >
          <h3 class="text-base font-semibold text-base-content">クイックアクション</h3>
          <svg class="w-4 h-4 transition-transform {openSections.quickAction ? 'rotate-180' : ''}" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
        
        {#if openSections.quickAction}
          <div class="mt-3 space-y-2">
            <button class="btn btn-ghost btn-sm w-full justify-start text-xs">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 11-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
              </svg>
              CSVエクスポート
            </button>
            
            <button class="btn btn-ghost btn-sm w-full justify-start text-xs">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v11H4V4zm1 2a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm0 3a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd"></path>
              </svg>
              統計レポート
            </button>
            
            <button class="btn btn-ghost btn-sm w-full justify-start text-xs">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 002 2h4a2 2 0 002-2V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2.5 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM8 10.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM12.5 7a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM16 8.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clip-rule="evenodd"></path>
              </svg>
              組織図表示
            </button>
          </div>
        {/if}
      </div>
    </div>

    <!-- モックデータ管理（モックモード時のみ表示） -->
    {#if CONFIG.IS_MOCK_MODE && CONFIG.UI.SHOW_MOCK_CONTROLS}
      <div class="card bg-base-100 shadow-sm border border-warning">
        <div class="card-body p-4">
          <button 
            class="flex items-center justify-between w-full text-left hover:bg-base-50 rounded-lg p-2 -m-2 transition-colors"
            onclick={() => toggleSection('mockData')}
          >
            <h3 class="text-base font-semibold text-warning">モックデータ管理</h3>
            <svg class="w-4 h-4 transition-transform {openSections.mockData ? 'rotate-180' : ''}" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
          
          {#if openSections.mockData}
            <div class="mt-3 space-y-2">
              <div class="alert alert-warning py-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-xs">開発用機能です</span>
              </div>
              
              <button 
                class="btn btn-warning btn-sm w-full"
                onclick={handleResetMockData}
              >
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"></path>
                </svg>
                データをリセット
              </button>
              
              <div class="text-xs text-base-content/60 mt-2">
                ※ すべてのデータが初期状態に戻ります
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  /* スクロールバーのスタイリング */
  .overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--bc) / 0.2) transparent;
  }
  
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: hsl(var(--bc) / 0.2);
    border-radius: 3px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--bc) / 0.3);
  }
  
  /* カードホバー効果を無効化 */
  .card {
    transition: none;
  }
  
  /* よりミニマルなデザイン */
  .badge {
    font-weight: 500;
  }
</style>