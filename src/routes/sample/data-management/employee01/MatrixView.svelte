<script>
  import { createEventDispatcher } from 'svelte';
  import { skillList } from './stores/employeeStore.js';

  export let activeEmployees = [];
  export let employeesByDepartment = {};
  export let departmentTree = [];
  export let departmentMap = new Map();
  export let positionMap = new Map();
  export let employeeSkillMap = new Map();

  const dispatch = createEventDispatcher();

  let matrixType = 'dept-skill'; // 'dept-skill' | 'dept-position' | 'skill-position'
  let showNumbers = true;
  let showNames = false;
  let selectedCell = null;

  // 部署リスト（階層順）
  $: departments = departmentTree
    .filter(d => d.id !== 'dept-executive')
    .flatMap(dept => [dept, ...flattenDepartments(dept.children)])
    .filter(d => (employeesByDepartment[d.id]?.length || 0) > 0);

  // 部署を階層的にフラット化
  function flattenDepartments(depts) {
    return depts.reduce((acc, dept) => {
      acc.push(dept);
      if (dept.children) {
        acc.push(...flattenDepartments(dept.children));
      }
      return acc;
    }, []);
  }

  // アクティブなスキルリスト
  $: activeSkills = [...$skillList].filter(skill => {
    return activeEmployees.some(emp => {
      const empSkills = employeeSkillMap.get(emp.id) || [];
      return empSkills.some(es => es.skillId === skill.id);
    });
  });

  // アクティブな役職リスト
  $: activePositions = [...positionMap.values()]
    .filter(pos => activeEmployees.some(emp => emp.positionId === pos.id))
    .sort((a, b) => b.level - a.level);

  // マトリックスデータの生成
  $: matrixData = generateMatrixData(matrixType);

  function generateMatrixData(type) {
    switch (type) {
      case 'dept-skill':
        return generateDeptSkillMatrix();
      case 'dept-position':
        return generateDeptPositionMatrix();
      case 'skill-position':
        return generateSkillPositionMatrix();
      default:
        return { rows: [], cols: [], data: {} };
    }
  }

  // 部署×スキルマトリックス
  function generateDeptSkillMatrix() {
    const data = {};
    const rows = departments;
    const cols = activeSkills;

    rows.forEach(dept => {
      cols.forEach(skill => {
        const employees = (employeesByDepartment[dept.id] || []).filter(emp => {
          const empSkills = employeeSkillMap.get(emp.id) || [];
          return empSkills.some(es => es.skillId === skill.id);
        });
        
        const key = `${dept.id}-${skill.id}`;
        data[key] = {
          count: employees.length,
          employees: employees,
          percentage: employeesByDepartment[dept.id]?.length 
            ? Math.round((employees.length / employeesByDepartment[dept.id].length) * 100)
            : 0
        };
      });
    });

    return { rows, cols, data };
  }

  // 部署×役職マトリックス
  function generateDeptPositionMatrix() {
    const data = {};
    const rows = departments;
    const cols = activePositions;

    rows.forEach(dept => {
      cols.forEach(position => {
        const employees = (employeesByDepartment[dept.id] || [])
          .filter(emp => emp.positionId === position.id);
        
        const key = `${dept.id}-${position.id}`;
        data[key] = {
          count: employees.length,
          employees: employees,
          percentage: employeesByDepartment[dept.id]?.length 
            ? Math.round((employees.length / employeesByDepartment[dept.id].length) * 100)
            : 0
        };
      });
    });

    return { rows, cols, data };
  }

  // スキル×役職マトリックス
  function generateSkillPositionMatrix() {
    const data = {};
    const rows = activeSkills;
    const cols = activePositions;

    rows.forEach(skill => {
      cols.forEach(position => {
        const employees = activeEmployees.filter(emp => {
          if (emp.positionId !== position.id) return false;
          const empSkills = employeeSkillMap.get(emp.id) || [];
          return empSkills.some(es => es.skillId === skill.id);
        });
        
        const key = `${skill.id}-${position.id}`;
        data[key] = {
          count: employees.length,
          employees: employees,
          percentage: 0 // スキル×役職では%計算が複雑なので省略
        };
      });
    });

    return { rows, cols, data };
  }

  // セルのスタイルを決定
  function getCellStyle(count, percentage) {
    if (count === 0) return '';
    
    if (percentage > 0) {
      if (percentage >= 80) return 'bg-success text-success-content';
      if (percentage >= 60) return 'bg-primary text-primary-content';
      if (percentage >= 40) return 'bg-info text-info-content';
      if (percentage >= 20) return 'bg-warning text-warning-content';
      return 'bg-base-300';
    } else {
      if (count >= 10) return 'bg-primary text-primary-content';
      if (count >= 5) return 'bg-info text-info-content';
      if (count >= 3) return 'bg-warning text-warning-content';
      return 'bg-base-300';
    }
  }

  // セルクリック時の処理
  function handleCellClick(rowId, colId, cellData) {
    if (cellData.count === 0) return;
    
    selectedCell = {
      rowId,
      colId,
      data: cellData,
      rowName: matrixType.startsWith('skill') 
        ? activeSkills.find(s => s.id === rowId)?.name
        : departmentMap.get(rowId)?.name,
      colName: matrixType.endsWith('skill')
        ? activeSkills.find(s => s.id === colId)?.name
        : matrixType.endsWith('position')
        ? positionMap.get(colId)?.name
        : ''
    };
  }

  // 行/列のハイライト
  let hoveredRow = null;
  let hoveredCol = null;
</script>

<div class="space-y-4">
  <!-- コントロール -->
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div class="flex items-center gap-2">
      <select class="select select-sm select-bordered" bind:value={matrixType}>
        <option value="dept-skill">部署 × スキル</option>
        <option value="dept-position">部署 × 役職</option>
        <option value="skill-position">スキル × 役職</option>
      </select>
    </div>

    <div class="flex items-center gap-4">
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" class="checkbox checkbox-sm" bind:checked={showNumbers} />
        <span>人数表示</span>
      </label>
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" class="checkbox checkbox-sm" bind:checked={showNames} />
        <span>氏名表示</span>
      </label>
    </div>
  </div>

  <!-- マトリックステーブル -->
  <div class="overflow-auto max-h-[600px] border border-base-300 rounded-lg">
    <table class="table table-xs table-pin-rows table-pin-cols">
      <thead>
        <tr>
          <th class="bg-base-200 z-20"></th>
          {#each matrixData.cols as col}
            <th 
              class="bg-base-200 text-center whitespace-nowrap cursor-pointer hover:bg-base-300 transition-colors z-10"
              class:bg-base-300={hoveredCol === col.id}
              onmouseenter={() => hoveredCol = col.id}
              onmouseleave={() => hoveredCol = null}
            >
              <div class="writing-mode-vertical">
                {col.name}
              </div>
            </th>
          {/each}
          <th class="bg-base-200 z-10">計</th>
        </tr>
      </thead>
      <tbody>
        {#each matrixData.rows as row}
          {@const rowTotal = matrixData.cols.reduce((sum, col) => 
            sum + (matrixData.data[`${row.id}-${col.id}`]?.count || 0), 0
          )}
          <tr>
            <th 
              class="bg-base-200 whitespace-nowrap cursor-pointer hover:bg-base-300 transition-colors z-10"
              class:bg-base-300={hoveredRow === row.id}
              onmouseenter={() => hoveredRow = row.id}
              onmouseleave={() => hoveredRow = null}
            >
              <div class="flex items-center gap-2">
                {#if row.level}
                  <span class="text-base-content/40" style="margin-left: {(row.level - 1) * 12}px">
                    {'└'.repeat(row.level - 1)}
                  </span>
                {/if}
                <span>{row.name}</span>
              </div>
            </th>
            {#each matrixData.cols as col}
              {@const cellData = matrixData.data[`${row.id}-${col.id}`] || { count: 0, employees: [], percentage: 0 }}
              <td 
                class="text-center cursor-pointer border border-base-200 hover:border-primary transition-all {getCellStyle(cellData.count, cellData.percentage)}"
                class:bg-base-100={hoveredRow === row.id || hoveredCol === col.id}
                class:ring-2={selectedCell?.rowId === row.id && selectedCell?.colId === col.id}
                class:ring-primary={selectedCell?.rowId === row.id && selectedCell?.colId === col.id}
                onclick={() => handleCellClick(row.id, col.id, cellData)}
              >
                {#if cellData.count > 0}
                  {#if showNumbers}
                    <div class="font-semibold">{cellData.count}</div>
                    {#if cellData.percentage > 0}
                      <div class="text-xs opacity-70">{cellData.percentage}%</div>
                    {/if}
                  {/if}
                  {#if showNames && cellData.count <= 3}
                    <div class="text-xs">
                      {#each cellData.employees.slice(0, 2) as emp}
                        <div class="truncate">{emp.lastName}</div>
                      {/each}
                      {#if cellData.count > 2}
                        <div>...</div>
                      {/if}
                    </div>
                  {/if}
                {:else}
                  <span class="text-base-content/20">-</span>
                {/if}
              </td>
            {/each}
            <td class="bg-base-200 text-center font-semibold">
              {rowTotal}
            </td>
          </tr>
        {/each}
        <!-- 列合計 -->
        <tr>
          <th class="bg-base-200 z-10">計</th>
          {#each matrixData.cols as col}
            {@const colTotal = matrixData.rows.reduce((sum, row) => 
              sum + (matrixData.data[`${row.id}-${col.id}`]?.count || 0), 0
            )}
            <td class="bg-base-200 text-center font-semibold">
              {colTotal}
            </td>
          {/each}
          <td class="bg-base-300 text-center font-bold">
            {activeEmployees.length}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 選択セルの詳細 -->
  {#if selectedCell && selectedCell.data.count > 0}
    <div class="card bg-base-100 border border-primary">
      <div class="card-body">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-semibold">
            {selectedCell.rowName} × {selectedCell.colName}
            <span class="badge badge-primary ml-2">{selectedCell.data.count}名</span>
          </h4>
          <button 
            class="btn btn-ghost btn-sm"
            onclick={() => selectedCell = null}
            aria-label="閉じる"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {#each selectedCell.data.employees as employee}
            <button 
              class="flex items-center gap-3 p-3 rounded-lg border border-base-300 hover:border-primary hover:bg-base-50 transition-all text-left"
              onclick={() => dispatch('openEmployee', employee)}
            >
              <div class="avatar avatar-placeholder">
                <div class="bg-neutral text-neutral-content w-10 h-10 rounded-full">
                  <span class="text-sm">{employee.lastName?.charAt(0)}{employee.firstName?.charAt(0)}</span>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-sm">{employee.lastName} {employee.firstName}</div>
                <div class="text-xs text-base-content/60">
                  {positionMap.get(employee.positionId)?.name}
                </div>
                <div class="text-xs text-base-content/60">
                  {departmentMap.get(employee.departmentId)?.name}
                </div>
              </div>
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- 凡例 -->
  <div class="flex items-center gap-4 text-sm">
    <span class="text-base-content/60">密度:</span>
    <div class="flex items-center gap-2">
      <div class="badge badge-success">80%+</div>
      <div class="badge badge-primary">60-79%</div>
      <div class="badge badge-info">40-59%</div>
      <div class="badge badge-warning">20-39%</div>
      <div class="badge">1-19%</div>
    </div>
  </div>
</div>

<style>
  .writing-mode-vertical {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    max-height: 120px;
  }

  /* スティッキーヘッダー/カラム用 */
  .table-pin-rows thead tr th {
    position: sticky;
    top: 0;
  }

  .table-pin-cols tbody th,
  .table-pin-cols thead tr th:first-child {
    position: sticky;
    left: 0;
  }

  /* セルホバー時のハイライト */
  td.bg-base-100 {
    background-color: var(--fallback-b1, oklch(var(--b1))) !important;
    opacity: 0.8;
  }
</style>