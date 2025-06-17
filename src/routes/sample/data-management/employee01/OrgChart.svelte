<script>
  import { 
    employees, 
    departmentTree, 
    departmentMap, 
    positionMap,
    employeeSkillMap,
    statistics 
  } from './stores/employeeStore.js';
  import { 
    expandedDepartments, 
    toggleDepartment,
    openEmployeeModal 
  } from './stores/uiStore.js';
  import { DEPARTMENT_IDS } from './config.js';
  import MatrixView from './MatrixView.svelte';

  let showOnlyActiveEmployees = true;
  let selectedDepartmentId = null;
  let viewMode = 'hierarchy'; // 'hierarchy' | 'departments' | 'matrix'

  // アクティブな社員のみフィルタ
  $: activeEmployees = showOnlyActiveEmployees 
    ? $employees.filter(emp => emp.status === 'active')
    : $employees;

  // 部署ごとの社員グループ
  $: employeesByDepartment = activeEmployees.reduce((acc, emp) => {
    if (!acc[emp.departmentId]) {
      acc[emp.departmentId] = [];
    }
    acc[emp.departmentId].push(emp);
    return acc;
  }, {});

  // 部署の社員を役職レベル順にソート
  function sortEmployeesByPosition(employees) {
    return employees.sort((a, b) => {
      const posA = $positionMap.get(a.positionId);
      const posB = $positionMap.get(b.positionId);
      
      if (posA && posB) {
        if (posA.level !== posB.level) {
          return posB.level - posA.level;
        }
        if (posA.isManagement !== posB.isManagement) {
          return posB.isManagement ? 1 : -1;
        }
      }
      
      return a.lastName.localeCompare(b.lastName);
    });
  }

  // 部署の管理者を取得
  function getDepartmentHead(departmentId) {
    const deptEmployees = employeesByDepartment[departmentId] || [];
    const sorted = sortEmployeesByPosition(deptEmployees);
    return sorted[0];
  }

  // 部署の総社員数（サブ部署含む）
  function getDepartmentTotalCount(department) {
    let total = employeesByDepartment[department.id]?.length || 0;
    if (department.children) {
      department.children.forEach(child => {
        total += getDepartmentTotalCount(child);
      });
    }
    return total;
  }

  // 選択された部署のメンバー表示
  function handleDepartmentSelect(deptId) {
    selectedDepartmentId = selectedDepartmentId === deptId ? null : deptId;
  }

  // 部署カード内でのメンバー表示
  function showDepartmentMembers(deptId, event) {
    event.stopPropagation();
    selectedDepartmentId = selectedDepartmentId === deptId ? null : deptId;
  }
</script>

<!-- メインコンテナ（親と同じカード形式） -->
<div class="card bg-base-100 shadow">
  <div class="card-body">
    <!-- ツールバー -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div class="flex items-center gap-4">
        <h3 class="text-xl font-semibold">組織構造</h3>
        <div class="text-sm text-base-content/60">
          全{activeEmployees.length}名
        </div>
      </div>
      
      <div class="flex flex-wrap items-center gap-2">
        <!-- 表示切り替え -->
        <div class="btn-group">
          <button 
            class="btn btn-sm {viewMode === 'hierarchy' ? 'btn-active' : ''}"
            onclick={() => viewMode = 'hierarchy'}
          >
            階層
          </button>
          <button 
            class="btn btn-sm {viewMode === 'departments' ? 'btn-active' : ''}"
            onclick={() => viewMode = 'departments'}
          >
            部署
          </button>
          <button 
            class="btn btn-sm {viewMode === 'matrix' ? 'btn-active' : ''}"
            onclick={() => viewMode = 'matrix'}
          >
            マトリックス
          </button>
        </div>

        <!-- フィルター -->
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" class="toggle toggle-sm" bind:checked={showOnlyActiveEmployees} />
          <span>在籍者のみ</span>
        </label>
      </div>
    </div>

    <!-- コンテンツエリア -->
    <div class="space-y-6">
      {#if viewMode === 'hierarchy'}
        <!-- 階層ビュー -->
        <!-- 経営陣 -->
        {#if $departmentTree.find(d => d.id === DEPARTMENT_IDS.EXECUTIVE)}
          {@const executiveDept = $departmentTree.find(d => d.id === DEPARTMENT_IDS.EXECUTIVE)}
          {@const executives = sortEmployeesByPosition(employeesByDepartment[executiveDept.id] || [])}
          
          <div class="bg-gradient-to-r from-primary to-primary-focus text-primary-content rounded-lg p-4">
            <h4 class="font-semibold mb-3">経営陣</h4>
            <div class="flex flex-wrap gap-3">
              {#each executives as exec}
                <button 
                  class="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  onclick={() => openEmployeeModal('view', exec)}
                >
                  <div class="avatar avatar-placeholder">
                    <div class="bg-white/20 text-primary-content w-8 h-8 rounded-full">
                      <span class="text-xs">{exec.lastName?.charAt(0)}{exec.firstName?.charAt(0)}</span>
                    </div>
                  </div>
                  <div class="text-left">
                    <div class="text-sm font-medium">{exec.lastName} {exec.firstName}</div>
                    <div class="text-xs opacity-80">{$positionMap.get(exec.positionId)?.name}</div>
                  </div>
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <!-- 本部一覧 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {#each $departmentTree.filter(d => d.level === 1 && d.id !== DEPARTMENT_IDS.EXECUTIVE) as dept}
            {@const head = getDepartmentHead(dept.id)}
            {@const totalCount = getDepartmentTotalCount(dept)}
            {@const directCount = employeesByDepartment[dept.id]?.length || 0}
            
            <div class="border border-base-300 rounded-lg p-4 hover:border-primary transition-colors">
              <!-- 部署ヘッダー -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <h4 class="font-semibold">{dept.name}</h4>
                  <div class="text-sm text-base-content/60">
                    総員 {totalCount}名 (直属 {directCount}名)
                  </div>
                </div>
                <div class="dropdown dropdown-end">
                  <button class="btn btn-ghost btn-xs" aria-label="メニュー">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    </svg>
                  </button>
                  <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><button onclick={() => handleDepartmentSelect(dept.id)}>メンバー一覧</button></li>
                    <li><button onclick={() => openEmployeeModal('create', { departmentId: dept.id })}>社員追加</button></li>
                  </ul>
                </div>
              </div>

              <!-- 部門長 -->
              {#if head}
                <button 
                  class="flex items-center gap-2 w-full p-2 bg-base-200 rounded-lg mb-3 hover:bg-base-300 transition-colors"
                  onclick={() => openEmployeeModal('view', head)}
                >
                  <div class="avatar avatar-placeholder">
                    <div class="bg-primary text-primary-content w-8 h-8 rounded-full">
                      <span class="text-xs">{head.lastName?.charAt(0)}{head.firstName?.charAt(0)}</span>
                    </div>
                  </div>
                  <div class="text-left flex-1">
                    <div class="text-sm font-medium">{head.lastName} {head.firstName}</div>
                    <div class="text-xs text-base-content/60">{$positionMap.get(head.positionId)?.name}</div>
                  </div>
                </button>
              {:else}
                <div class="p-2 bg-base-200 rounded-lg mb-3 text-center text-sm text-base-content/40">
                  部門長未定
                </div>
              {/if}

              <!-- 下位部署 -->
              {#if dept.children.length > 0}
                <div class="space-y-1">
                  <button 
                    class="flex items-center justify-between w-full text-sm text-base-content/70 hover:text-base-content"
                    onclick={() => toggleDepartment(dept.id)}
                  >
                    <span>下位部署 ({dept.children.length})</span>
                    <svg class="w-4 h-4 transition-transform" class:rotate-180={$expandedDepartments.has(dept.id)}
                         fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </button>
                  
                  {#if $expandedDepartments.has(dept.id)}
                    <div class="pl-2 space-y-1">
                      {#each dept.children as subDept}
                        {@const subCount = employeesByDepartment[subDept.id]?.length || 0}
                        <button 
                          class="w-full text-left p-2 rounded text-sm hover:bg-base-200 transition-colors flex items-center justify-between"
                          onclick={(e) => showDepartmentMembers(subDept.id, e)}
                        >
                          <span>{subDept.name}</span>
                          <span class="badge badge-sm badge-ghost">{subCount}</span>
                        </button>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/if}

              <!-- アクションボタン -->
              <button 
                class="btn btn-sm btn-block mt-3"
                onclick={() => handleDepartmentSelect(dept.id)}
              >
                メンバー詳細
              </button>
            </div>
          {/each}
        </div>

      {:else if viewMode === 'departments'}
        <!-- 部署リストビュー -->
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>部署名</th>
                <th>レベル</th>
                <th>管理者</th>
                <th>人数</th>
                <th>予算</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {#each [...$departmentMap.values()].sort((a, b) => a.level - b.level || a.sortOrder - b.sortOrder) as dept}
                {@const head = getDepartmentHead(dept.id)}
                {@const count = employeesByDepartment[dept.id]?.length || 0}
                <tr>
                  <td>
                    <div style="padding-left: {(dept.level - 1) * 20}px">
                      {dept.name}
                    </div>
                  </td>
                  <td>{dept.level}</td>
                  <td>
                    {#if head}
                      <button 
                        class="link link-primary"
                        onclick={() => openEmployeeModal('view', head)}
                      >
                        {head.lastName} {head.firstName}
                      </button>
                    {:else}
                      <span class="text-base-content/40">-</span>
                    {/if}
                  </td>
                  <td>{count}</td>
                  <td>¥{new Intl.NumberFormat('ja-JP').format(dept.budget)}</td>
                  <td>
                    <button 
                      class="btn btn-ghost btn-xs"
                      onclick={() => handleDepartmentSelect(dept.id)}
                    >
                      詳細
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

      {:else if viewMode === 'matrix'}
        <!-- マトリックスビュー -->
        <MatrixView 
          {activeEmployees}
          {employeesByDepartment}
          departmentTree={$departmentTree}
          departmentMap={$departmentMap}
          positionMap={$positionMap}
          employeeSkillMap={$employeeSkillMap}
          onopenEmployee={(e) => openEmployeeModal('view', e.detail)}
        />
      {/if}

      <!-- 選択部署の詳細パネル -->
      {#if selectedDepartmentId}
        {@const dept = $departmentMap.get(selectedDepartmentId)}
        {@const members = sortEmployeesByPosition(employeesByDepartment[selectedDepartmentId] || [])}
        
        <div class="border-t pt-6">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-semibold">{dept?.name} のメンバー</h4>
            <button 
              class="btn btn-ghost btn-sm"
              onclick={() => selectedDepartmentId = null}
              aria-label="閉じる"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {#each members as member}
              <button 
                class="flex items-center gap-3 p-3 rounded-lg border border-base-300 hover:border-primary hover:bg-base-50 transition-all text-left"
                onclick={() => openEmployeeModal('view', member)}
              >
                <div class="avatar avatar-placeholder">
                  <div class="bg-neutral text-neutral-content w-10 h-10 rounded-full">
                    <span class="text-sm">{member.lastName?.charAt(0)}{member.firstName?.charAt(0)}</span>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm">{member.lastName} {member.firstName}</div>
                  <div class="text-xs text-base-content/60">{$positionMap.get(member.positionId)?.name}</div>
                  <div class="flex gap-1 mt-1">
                    {#each ($employeeSkillMap.get(member.id) || []).slice(0, 2) as skill}
                      <span class="badge badge-xs">{skill.skill.name}</span>
                    {/each}
                    {#if ($employeeSkillMap.get(member.id) || []).length > 2}
                      <span class="badge badge-xs badge-ghost">+{($employeeSkillMap.get(member.id) || []).length - 2}</span>
                    {/if}
                  </div>
                </div>
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  /* 必要最小限のトランジション */
  .transition-colors {
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  }
  
  .transition-transform {
    transition: transform 0.2s ease;
  }
  
  .transition-all {
    transition: all 0.15s ease;
  }
  
  /* 矢印の回転 */
  .rotate-180 {
    transform: rotate(180deg);
  }
</style>