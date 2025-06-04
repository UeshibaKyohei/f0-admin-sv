<script>
  import { 
    employees, 
    skillList, 
    employeeSkillMap,
    departmentMap,
    positionMap,
    updateEmployeeSkills
  } from './stores/employeeStore.js';
  import { openEmployeeModal } from './stores/uiStore.js';
  import { DEPARTMENT_IDS, SKILL_IDS, DEPARTMENT_REQUIRED_SKILLS } from './config.js';

  let selectedSkillCategory = 'all';
  let searchQuery = '';
  let viewMode = 'overview'; // 'overview' | 'detail' | 'gap'
  let selectedSkill = null;
  let showOnlyActiveEmployees = true;

  // アクティブな社員のみフィルタ
  $: activeEmployees = showOnlyActiveEmployees 
    ? $employees.filter(emp => emp.status === 'active')
    : $employees;

  // スキルカテゴリー一覧
  $: skillCategories = ['all', ...new Set($skillList.map(s => s.category))];

  // フィルタされたスキル
  $: filteredSkills = $skillList.filter(skill => {
    const matchesCategory = selectedSkillCategory === 'all' || skill.category === selectedSkillCategory;
    const matchesSearch = !searchQuery || 
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // スキル統計データ
  $: skillStats = filteredSkills.map(skill => {
    const employeesWithSkill = activeEmployees.filter(emp => {
      const empSkills = $employeeSkillMap.get(emp.id) || [];
      return empSkills.some(es => es.skillId === skill.id);
    });

    const levelCounts = { beginner: 0, intermediate: 0, advanced: 0, expert: 0 };
    const departmentCounts = new Map();

    employeesWithSkill.forEach(emp => {
      const empSkill = ($employeeSkillMap.get(emp.id) || []).find(es => es.skillId === skill.id);
      if (empSkill?.level) levelCounts[empSkill.level]++;

      const dept = $departmentMap.get(emp.departmentId);
      if (dept) {
        departmentCounts.set(dept.id, (departmentCounts.get(dept.id) || 0) + 1);
      }
    });

    const avgExperience = employeesWithSkill.length > 0
      ? Math.round(employeesWithSkill.reduce((sum, emp) => {
          const empSkill = ($employeeSkillMap.get(emp.id) || []).find(es => es.skillId === skill.id);
          const years = empSkill?.certifiedDate 
            ? (Date.now() - new Date(empSkill.certifiedDate).getTime()) / (365 * 24 * 60 * 60 * 1000)
            : 0;
          return sum + years;
        }, 0) / employeesWithSkill.length * 10) / 10
      : 0;

    return {
      skill,
      count: employeesWithSkill.length,
      percentage: Math.round((employeesWithSkill.length / activeEmployees.length) * 100),
      employees: employeesWithSkill,
      levelCounts,
      departmentCounts,
      avgExperience
    };
  }).sort((a, b) => b.count - a.count);

  // スキルギャップ分析
  $: skillGaps = analyzeSkillGaps();

  function analyzeSkillGaps() {
    const gaps = [];
    
    // 部署ごとの必要スキルと実際のスキルを比較
    Object.entries(DEPARTMENT_REQUIRED_SKILLS).forEach(([deptId, requiredSkills]) => {
      const dept = $departmentMap.get(deptId);
      if (!dept) return;

      const deptEmployees = activeEmployees.filter(emp => emp.departmentId === deptId);
      
      requiredSkills.forEach(skillId => {
        const skill = $skillList.find(s => s.id === skillId);
        if (!skill) return;

        const employeesWithSkill = deptEmployees.filter(emp => {
          const empSkills = $employeeSkillMap.get(emp.id) || [];
          return empSkills.some(es => es.skillId === skillId);
        });

        const coverage = deptEmployees.length > 0 
          ? (employeesWithSkill.length / deptEmployees.length) * 100
          : 0;

        if (coverage < 70) { // 70%未満をギャップとして認識
          gaps.push({
            department: dept,
            skill: skill,
            required: deptEmployees.length,
            actual: employeesWithSkill.length,
            coverage: Math.round(coverage),
            gap: deptEmployees.length - employeesWithSkill.length
          });
        }
      });
    });

    return gaps.sort((a, b) => a.coverage - b.coverage);
  }

  // スキル詳細の選択
  function selectSkill(skillData) {
    selectedSkill = skillData;
    viewMode = 'detail';
  }

  // レベルの色
  function getLevelColor(level) {
    switch (level) {
      case 'expert': return 'badge-error';
      case 'advanced': return 'badge-warning';
      case 'intermediate': return 'badge-info';
      case 'beginner': return 'badge-success';
      default: return 'badge-ghost';
    }
  }

  // レベルの日本語表記
  function getLevelLabel(level) {
    switch (level) {
      case 'expert': return 'エキスパート';
      case 'advanced': return '上級';
      case 'intermediate': return '中級';
      case 'beginner': return '初級';
      default: return '未設定';
    }
  }
</script>

<div class="card bg-base-100 shadow">
  <div class="card-body">
    <!-- ヘッダー -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h3 class="text-xl font-semibold">スキル管理</h3>
      
      <div class="flex flex-wrap items-center gap-2">
        <!-- ビュー切り替え -->
        <div class="btn-group">
          <button 
            class="btn btn-sm {viewMode === 'overview' ? 'btn-active' : ''}"
            on:click={() => viewMode = 'overview'}
          >
            概要
          </button>
          <button 
            class="btn btn-sm {viewMode === 'gap' ? 'btn-active' : ''}"
            on:click={() => viewMode = 'gap'}
          >
            ギャップ分析
          </button>
        </div>

        <!-- フィルター -->
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" class="toggle toggle-sm" bind:checked={showOnlyActiveEmployees} />
          <span>在籍者のみ</span>
        </label>
      </div>
    </div>

    <!-- 検索・フィルター -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <div class="form-control flex-1">
        <input 
          type="text" 
          placeholder="スキルを検索..." 
          class="input input-bordered input-sm"
          bind:value={searchQuery}
        />
      </div>
      <select 
        class="select select-bordered select-sm"
        bind:value={selectedSkillCategory}
      >
        <option value="all">すべてのカテゴリー</option>
        {#each skillCategories.filter(c => c !== 'all') as category}
          <option value={category}>{category}</option>
        {/each}
      </select>
    </div>

    <!-- コンテンツ -->
    {#if viewMode === 'overview'}
      <!-- スキル概要 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {#each skillStats as stat}
          <div 
            class="border border-base-300 rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
            on:click={() => selectSkill(stat)}
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <h4 class="font-semibold">{stat.skill.name}</h4>
                <div class="text-sm text-base-content/60">{stat.skill.category}</div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-primary">{stat.count}</div>
                <div class="text-xs text-base-content/60">{stat.percentage}%</div>
              </div>
            </div>

            <!-- スキルレベル分布 -->
            <div class="mb-3">
              <div class="text-xs text-base-content/60 mb-1">レベル分布</div>
              <div class="flex gap-1">
                {#each Object.entries(stat.levelCounts) as [level, count]}
                  {#if count > 0}
                    <div class="flex-1 bg-base-200 rounded-full h-2 overflow-hidden">
                      <div 
                        class="h-full {getLevelColor(level).replace('badge-', 'bg-')}"
                        style="width: {(count / stat.count) * 100}%"
                      ></div>
                    </div>
                  {/if}
                {/each}
              </div>
              <div class="flex gap-2 mt-1">
                {#each Object.entries(stat.levelCounts) as [level, count]}
                  {#if count > 0}
                    <span class="badge badge-xs {getLevelColor(level)}">
                      {getLevelLabel(level).charAt(0)} {count}
                    </span>
                  {/if}
                {/each}
              </div>
            </div>

            <!-- 部署分布（上位3部署） -->
            <div>
              <div class="text-xs text-base-content/60 mb-1">主要部署</div>
              <div class="flex flex-wrap gap-1">
                {#each Array.from(stat.departmentCounts.entries())
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3) as [deptId, count]}
                  <span class="badge badge-xs">
                    {$departmentMap.get(deptId)?.name} ({count})
                  </span>
                {/each}
              </div>
            </div>

            {#if stat.avgExperience > 0}
              <div class="text-xs text-base-content/60 mt-2">
                平均経験年数: {stat.avgExperience}年
              </div>
            {/if}
          </div>
        {/each}
      </div>

    {:else if viewMode === 'gap'}
      <!-- スキルギャップ分析 -->
      <div class="space-y-4">
        <div class="alert alert-info">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
          <span>部署の必要スキルに対してカバー率が70%未満のスキルを表示しています</span>
        </div>

        {#if skillGaps.length === 0}
          <div class="text-center py-12">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-success/20 rounded-full mb-4">
              <svg class="w-8 h-8 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <h4 class="text-lg font-semibold mb-2">スキルギャップなし</h4>
            <p class="text-base-content/60">すべての部署で必要なスキルが十分にカバーされています</p>
          </div>
        {:else}
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>部署</th>
                  <th>必要スキル</th>
                  <th>必要人数</th>
                  <th>保有人数</th>
                  <th>カバー率</th>
                  <th>ギャップ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {#each skillGaps as gap}
                  <tr>
                    <td>{gap.department.name}</td>
                    <td>
                      <div class="flex items-center gap-2">
                        <span>{gap.skill.name}</span>
                        <span class="badge badge-xs">{gap.skill.category}</span>
                      </div>
                    </td>
                    <td>{gap.required}</td>
                    <td>{gap.actual}</td>
                    <td>
                      <div class="flex items-center gap-2">
                        <progress 
                          class="progress progress-warning w-20" 
                          value={gap.coverage} 
                          max="100"
                        ></progress>
                        <span class="text-sm">{gap.coverage}%</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-error">-{gap.gap}</span>
                    </td>
                    <td>
                      <button 
                        class="btn btn-ghost btn-xs"
                        on:click={() => {
                          selectedSkill = skillStats.find(s => s.skill.id === gap.skill.id);
                          viewMode = 'detail';
                        }}
                      >
                        詳細
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    {/if}

    <!-- スキル詳細モーダル -->
    {#if selectedSkill && viewMode === 'detail'}
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" on:click={() => viewMode = 'overview'}>
        <div class="bg-black/50 absolute inset-0"></div>
        <div class="card bg-base-100 w-full max-w-4xl max-h-[90vh] overflow-auto relative z-10" on:click|stopPropagation>
          <div class="card-body">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-xl font-semibold">{selectedSkill.skill.name}</h3>
                <p class="text-base-content/60">{selectedSkill.skill.description}</p>
              </div>
              <button 
                class="btn btn-ghost btn-sm"
                on:click={() => viewMode = 'overview'}
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </div>

            <!-- 統計情報 -->
            <div class="stats stats-vertical lg:stats-horizontal shadow mb-6">
              <div class="stat">
                <div class="stat-title">保有者数</div>
                <div class="stat-value text-primary">{selectedSkill.count}</div>
                <div class="stat-desc">{selectedSkill.percentage}% の社員</div>
              </div>
              <div class="stat">
                <div class="stat-title">平均経験年数</div>
                <div class="stat-value text-secondary">{selectedSkill.avgExperience}</div>
                <div class="stat-desc">年</div>
              </div>
              <div class="stat">
                <div class="stat-title">最多レベル</div>
                <div class="stat-value text-accent">
                  {getLevelLabel(
                    Object.entries(selectedSkill.levelCounts)
                      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'intermediate'
                  )}
                </div>
              </div>
            </div>

            <!-- レベル別社員リスト -->
            <div class="space-y-4">
              {#each ['expert', 'advanced', 'intermediate', 'beginner'] as level}
                {@const levelEmployees = selectedSkill.employees.filter(emp => {
                  const empSkill = ($employeeSkillMap.get(emp.id) || []).find(es => es.skillId === selectedSkill.skill.id);
                  return empSkill?.level === level;
                })}
                {#if levelEmployees.length > 0}
                  <div>
                    <h4 class="font-semibold mb-2 flex items-center gap-2">
                      <span class="badge {getLevelColor(level)}">{getLevelLabel(level)}</span>
                      <span class="text-sm text-base-content/60">({levelEmployees.length}名)</span>
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {#each levelEmployees as employee}
                        <button 
                          class="flex items-center gap-3 p-3 rounded-lg border border-base-300 hover:border-primary hover:bg-base-50 transition-all text-left"
                          on:click={() => openEmployeeModal('view', employee)}
                        >
                          <div class="avatar avatar-placeholder">
                            <div class="bg-neutral text-neutral-content w-10 h-10 rounded-full">
                              <span class="text-sm">{employee.lastName?.charAt(0)}{employee.firstName?.charAt(0)}</span>
                            </div>
                          </div>
                          <div class="flex-1">
                            <div class="font-medium">{employee.lastName} {employee.firstName}</div>
                            <div class="text-sm text-base-content/60">
                              {$departmentMap.get(employee.departmentId)?.name} / 
                              {$positionMap.get(employee.positionId)?.name}
                            </div>
                          </div>
                        </button>
                      {/each}
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>