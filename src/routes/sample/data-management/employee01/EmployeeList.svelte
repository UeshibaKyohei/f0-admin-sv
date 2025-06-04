<script>
  import { 
    filteredEmployees, 
    departmentMap, 
    positionMap, 
    employeeSkillMap 
  } from './stores/employeeStore.js';
  import { 
    viewMode, 
    selectedEmployees, 
    pagination, 
    paginationInfo,
    selectEmployee,
    selectAllEmployees,
    clearSelection,
    setCurrentPage,
    setPageSize,
    updatePaginationStats,
    openEmployeeModal 
  } from './stores/uiStore.js';
  import { STATUS, CONFIG } from './config.js';
  import { onMount } from 'svelte';

  // ページネーション用の派生データ
  let paginatedEmployees = [];
  let isAllSelected = false;

  // リアクティブな更新
  $: {
    // ページネーション情報を更新
    updatePaginationStats($filteredEmployees.length);
    
    // 現在のページの社員を計算
    const startIndex = ($pagination.currentPage - 1) * $pagination.pageSize;
    const endIndex = startIndex + $pagination.pageSize;
    paginatedEmployees = $filteredEmployees.slice(startIndex, endIndex);
    
    // 全選択状態を更新
    const visibleEmployeeIds = paginatedEmployees.map(emp => emp.id);
    isAllSelected = visibleEmployeeIds.length > 0 && 
                   visibleEmployeeIds.every(id => $selectedEmployees.includes(id));
  }

  // 全選択/全解除
  function toggleSelectAll() {
    const visibleEmployeeIds = paginatedEmployees.map(emp => emp.id);
    
    if (isAllSelected) {
      // 現在のページの選択を解除
      const newSelection = $selectedEmployees.filter(id => !visibleEmployeeIds.includes(id));
      selectedEmployees.set(newSelection);
    } else {
      // 現在のページを全選択
      const newSelection = [...new Set([...$selectedEmployees, ...visibleEmployeeIds])];
      selectedEmployees.set(newSelection);
    }
  }

  // 社員の詳細表示
  function viewEmployee(employee) {
    openEmployeeModal('view', employee);
  }

  // 社員の編集
  function editEmployee(employee) {
    openEmployeeModal('edit', employee);
  }

  // ステータスバッジの取得
  function getStatusBadge(status) {
    return STATUS.EMPLOYEE[status.toUpperCase()] || STATUS.EMPLOYEE.ACTIVE;
  }

  function getContractTypeBadge(contractType) {
    return STATUS.CONTRACT_TYPE[contractType.toUpperCase()] || STATUS.CONTRACT_TYPE.FULLTIME;
  }

  // 年齢計算
  function calculateAge(birthDate) {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  // 勤続年数計算
  function calculateTenure(hireDate) {
    const today = new Date();
    const hire = new Date(hireDate);
    const years = today.getFullYear() - hire.getFullYear();
    const months = today.getMonth() - hire.getMonth();
    
    if (years < 1) {
      return `${months + (years * 12)}ヶ月`;
    } else {
      return `${years}年${months >= 0 ? months : 12 + months}ヶ月`;
    }
  }

  // 日付フォーマット
  function formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ja-JP');
  }

  // アバター表示の代替
  function getInitials(employee) {
    return `${employee.lastName.charAt(0)}${employee.firstName.charAt(0)}`;
  }
</script>

<div class="space-y-4">
  <!-- 検索結果情報 -->
  <div class="flex items-center justify-between">
    <div class="text-sm text-base-content/70">
      {#if $filteredEmployees.length > 0}
        全{$filteredEmployees.length}件中 {$paginationInfo.startItem}-{$paginationInfo.endItem}件を表示
      {:else}
        該当する社員が見つかりません
      {/if}
    </div>
    
    <!-- ページサイズ選択 -->
    <div class="flex items-center gap-2">
      <span class="text-sm text-base-content/70">表示件数:</span>
      <select class="select select-xs select-bordered" bind:value={$pagination.pageSize} on:change={(e) => setPageSize(Number(e.target.value))}>
        {#each CONFIG.PAGINATION.PAGE_SIZE_OPTIONS as size}
          <option value={size}>{size}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if $filteredEmployees.length > 0}
    <!-- リスト表示 -->
    {#if $viewMode === 'list'}
      <div class="card bg-base-100 shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr class="bg-base-200">
                <th class="w-12">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-sm"
                    checked={isAllSelected}
                    on:change={toggleSelectAll}
                  />
                </th>
                <th>社員</th>
                <th>部署</th>
                <th>役職</th>
                <th>雇用形態</th>
                <th>在籍状況</th>
                <th>入社日</th>
                <th>勤続</th>
                <th>スキル</th>
                <th class="w-20">操作</th>
              </tr>
            </thead>
            <tbody>
              {#each paginatedEmployees as employee (employee.id)}
                <tr>
                  <td>
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-sm"
                      checked={$selectedEmployees.includes(employee.id)}
                      on:change={() => selectEmployee(employee.id)}
                    />
                  </td>
                  <td>
                    <div class="flex items-center gap-3">
                      <!-- アバター -->
                      <div class="avatar avatar-placeholder">
                        <div class="w-10 h-10 rounded-full bg-primary text-primary-content">
                          {#if employee.avatar}
                            <img src={employee.avatar} alt={`${employee.lastName} ${employee.firstName}`} />
                          {:else}
                            <span class="text-xs">{getInitials(employee)}</span>
                          {/if}
                        </div>
                      </div>
                      <!-- 名前・情報 -->
                      <div>
                        <div class="font-semibold">
                          {employee.lastName} {employee.firstName}
                        </div>
                        <div class="text-xs text-base-content/70">
                          {employee.employeeNumber} • {employee.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="text-sm">
                      {$departmentMap.get(employee.departmentId)?.name || '-'}
                    </div>
                    <div class="text-xs text-base-content/70">
                      {$departmentMap.get(employee.departmentId)?.code || ''}
                    </div>
                  </td>
                  <td>
                    <div class="text-sm">
                      {$positionMap.get(employee.positionId)?.name || '-'}
                    </div>
                  </td>
                  <td>
                    <div class="badge {getContractTypeBadge(employee.contractType).color} badge-sm">
                      {getContractTypeBadge(employee.contractType).label}
                    </div>
                  </td>
                  <td>
                    <div class="badge {getStatusBadge(employee.status).color} badge-sm">
                      {getStatusBadge(employee.status).label}
                    </div>
                  </td>
                  <td>
                    <div class="text-sm">{formatDate(employee.hireDate)}</div>
                    <div class="text-xs text-base-content/70">
                      {calculateTenure(employee.hireDate)}
                    </div>
                  </td>
                  <td>
                    <div class="text-sm">
                      {calculateAge(employee.birthDate)}歳
                    </div>
                  </td>
                  <td>
                    <div class="flex flex-wrap gap-1 max-w-32">
                      {#each ($employeeSkillMap.get(employee.id) || []).slice(0, 3) as employeeSkill}
                        <div class="badge badge-ghost badge-xs" title={employeeSkill.skill.name}>
                          {employeeSkill.skill.name}
                        </div>
                      {/each}
                      {#if ($employeeSkillMap.get(employee.id) || []).length > 3}
                        <div class="badge badge-outline badge-xs">
                          +{($employeeSkillMap.get(employee.id) || []).length - 3}
                        </div>
                      {/if}
                    </div>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <button 
                        class="btn btn-ghost btn-xs"
                        on:click={() => viewEmployee(employee)}
                        title="詳細表示"
                      >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                          <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
                        </svg>
                      </button>
                      <button 
                        class="btn btn-ghost btn-xs"
                        on:click={() => editEmployee(employee)}
                        title="編集"
                      >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

    <!-- グリッド表示 -->
    {:else if $viewMode === 'grid'}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {#each paginatedEmployees as employee (employee.id)}
          <div class="card bg-base-100 shadow">
            <div class="card-body p-4">
              <!-- ヘッダー：選択チェックボックスと操作ボタン -->
              <div class="flex justify-between items-start mb-3">
                <input 
                  type="checkbox" 
                  class="checkbox checkbox-sm"
                  checked={$selectedEmployees.includes(employee.id)}
                  on:change={() => selectEmployee(employee.id)}
                />
                <div class="dropdown dropdown-end">
                  <label tabindex="0" class="btn btn-ghost btn-sm btn-circle">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                    </svg>
                  </label>
                  <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32">
                    <li><button on:click={() => viewEmployee(employee)}>詳細表示</button></li>
                    <li><button on:click={() => editEmployee(employee)}>編集</button></li>
                  </ul>
                </div>
              </div>

              <!-- プロフィール部分 -->
              <div class="text-center mb-4">
                <div class="avatar avatar-placeholder mb-2">
                  <div class="w-16 h-16 rounded-full bg-primary text-primary-content">
                    {#if employee.avatar}
                      <img src={employee.avatar} alt={`${employee.lastName} ${employee.firstName}`} />
                    {:else}
                      <span class="text-lg">{getInitials(employee)}</span>
                    {/if}
                  </div>
                </div>
                <h3 class="font-semibold text-base">
                  {employee.lastName} {employee.firstName}
                </h3>
                <p class="text-xs text-base-content/70">
                  {employee.employeeNumber}
                </p>
              </div>

              <!-- 基本情報 -->
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-base-content/70">部署:</span>
                  <span>{$departmentMap.get(employee.departmentId)?.name || '-'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-base-content/70">役職:</span>
                  <span>{$positionMap.get(employee.positionId)?.name || '-'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-base-content/70">入社:</span>
                  <span>{formatDate(employee.hireDate)}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-base-content/70">勤続:</span>
                  <span>{calculateTenure(employee.hireDate)}</span>
                </div>
              </div>

              <!-- ステータスバッジ -->
              <div class="flex gap-2 mt-3">
                <div class="badge {getStatusBadge(employee.status).color} badge-sm">
                  {getStatusBadge(employee.status).label}
                </div>
                <div class="badge {getContractTypeBadge(employee.contractType).color} badge-sm">
                  {getContractTypeBadge(employee.contractType).label}
                </div>
              </div>

              <!-- スキル（最大3つ表示） -->
              {#if $employeeSkillMap.get(employee.id)?.length > 0}
                <div class="mt-3">
                  <div class="text-xs text-base-content/70 mb-2">スキル:</div>
                  <div class="flex flex-wrap gap-1">
                    {#each ($employeeSkillMap.get(employee.id) || []).slice(0, 3) as employeeSkill}
                      <div class="badge badge-outline badge-xs">
                        {employeeSkill.skill.name}
                      </div>
                    {/each}
                    {#if ($employeeSkillMap.get(employee.id) || []).length > 3}
                      <div class="badge badge-ghost badge-xs">
                        +{($employeeSkillMap.get(employee.id) || []).length - 3}
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- ページネーション -->
    {#if $paginationInfo.showPagination}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <div class="text-sm text-base-content/70">
          全{$filteredEmployees.length}件中 {$paginationInfo.startItem}-{$paginationInfo.endItem}件を表示
        </div>
        
        <div class="join">
          <!-- 前のページ -->
          <button 
            class="join-item btn btn-sm {$paginationInfo.hasPrevious ? '' : 'btn-disabled'}"
            on:click={() => setCurrentPage($pagination.currentPage - 1)}
            disabled={!$paginationInfo.hasPrevious}
          >
            «
          </button>
          
          <!-- ページ番号 -->
          {#each $paginationInfo.pageNumbers as pageNum}
            {#if pageNum === '...'}
              <button class="join-item btn btn-sm btn-disabled">...</button>
            {:else}
              <button 
                class="join-item btn btn-sm {pageNum === $pagination.currentPage ? 'btn-active' : ''}"
                on:click={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            {/if}
          {/each}
          
          <!-- 次のページ -->
          <button 
            class="join-item btn btn-sm {$paginationInfo.hasNext ? '' : 'btn-disabled'}"
            on:click={() => setCurrentPage($pagination.currentPage + 1)}
            disabled={!$paginationInfo.hasNext}
          >
            »
          </button>
        </div>
      </div>
    {/if}

  {:else}
    <!-- 検索結果なし -->
    <div class="card bg-base-100 shadow">
      <div class="card-body text-center py-12">
        <svg class="w-16 h-16 mx-auto text-base-content/30 mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
        </svg>
        <h3 class="text-lg font-semibold mb-2">該当する社員が見つかりません</h3>
        <p class="text-base-content/70 mb-4">
          検索条件を変更して再度お試しください
        </p>
        <button class="btn btn-outline btn-sm" on:click={clearSelection}>
          フィルターをクリア
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .table th {
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .card {
    transition: all 0.2s ease;
  }
  
  .card:hover {
    transform: translateY(-2px);
  }
  
  .avatar img {
    object-fit: cover;
  }
  
  .dropdown:focus-within .dropdown-content {
    display: block;
  }
</style>