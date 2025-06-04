<script>
  import { 
    filters, 
    departmentList, 
    positionList, 
    skillList,
    updateFilter,
    resetFilters 
  } from './stores/employeeStore.js';
  import { 
    isFilterPanelOpen, 
    toggleFilterPanel,
    addNotification 
  } from './stores/uiStore.js';
  import { STATUS, WORK_LOCATIONS, SKILL_CATEGORIES } from './config.js';

  // フィルター状態のローカル管理
  let localFilters = { ...$filters };
  let activeFilterCount = 0;

  // リアクティブにフィルター数を計算
  $: {
    activeFilterCount = 0;
    if (localFilters.search?.trim()) activeFilterCount++;
    if (localFilters.departmentId) activeFilterCount++;
    if (localFilters.positionId) activeFilterCount++;
    if (localFilters.skills?.length > 0) activeFilterCount++;
    if (localFilters.contractType?.length > 0) activeFilterCount++;
    if (localFilters.status?.length > 0) activeFilterCount++;
    if (localFilters.hireYearRange?.start || localFilters.hireYearRange?.end) activeFilterCount++;
    if (localFilters.ageRange?.min || localFilters.ageRange?.max) activeFilterCount++;
    if (localFilters.workLocation) activeFilterCount++;
  }

  // フィルターの適用
  function applyFilters() {
    Object.keys(localFilters).forEach(key => {
      updateFilter(key, localFilters[key]);
    });
    addNotification('フィルターを適用しました', 'info', 2000);
  }

  // フィルターのリセット
  function handleResetFilters() {
    localFilters = {
      search: '',
      departmentId: null,
      positionId: null,
      skills: [],
      contractType: [],
      status: [],
      hireYearRange: { start: null, end: null },
      ageRange: { min: null, max: null },
      workLocation: null,
      sortBy: 'employeeNumber',
      sortOrder: 'asc'
    };
    resetFilters();
    addNotification('フィルターをリセットしました', 'info', 2000);
  }

  // スキル選択の切り替え
  function toggleSkill(skillId) {
    if (localFilters.skills.includes(skillId)) {
      localFilters.skills = localFilters.skills.filter(id => id !== skillId);
    } else {
      localFilters.skills = [...localFilters.skills, skillId];
    }
  }

  // 雇用形態選択の切り替え
  function toggleContractType(type) {
    if (localFilters.contractType.includes(type)) {
      localFilters.contractType = localFilters.contractType.filter(t => t !== type);
    } else {
      localFilters.contractType = [...localFilters.contractType, type];
    }
  }

  // ステータス選択の切り替え
  function toggleStatus(status) {
    if (localFilters.status.includes(status)) {
      localFilters.status = localFilters.status.filter(s => s !== status);
    } else {
      localFilters.status = [...localFilters.status, status];
    }
  }

  // スキルをカテゴリ別にグループ化
  $: skillsByCategory = $skillList.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {});

  // 年度リスト生成（過去10年）
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - i);

  // 即座に適用するフィルター（検索、並び順）
  $: {
    if (localFilters.search !== $filters.search) {
      updateFilter('search', localFilters.search);
    }
    if (localFilters.sortBy !== $filters.sortBy) {
      updateFilter('sortBy', localFilters.sortBy);
    }
    if (localFilters.sortOrder !== $filters.sortOrder) {
      updateFilter('sortOrder', localFilters.sortOrder);
    }
  }
</script>

<!-- 検索バー（常に表示） -->
<div class="flex flex-col sm:flex-row gap-4 mb-4">
  <!-- メイン検索 -->
  <div class="flex-1">
    <div class="form-control">
      <div class="input-group">
        <input 
          type="text" 
          placeholder="名前、社員番号、メールアドレスで検索..." 
          class="input input-bordered flex-1"
          bind:value={localFilters.search}
        />
        <button class="btn btn-square">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- 並び順 -->
  <div class="flex gap-2 items-center">
    <select class="select select-bordered" bind:value={localFilters.sortBy}>
      <option value="employeeNumber">社員番号順</option>
      <option value="name">名前順</option>
      <option value="hireDate">入社日順</option>
      <option value="department">部署順</option>
      <option value="position">役職順</option>
    </select>
    
    <button 
      class="btn btn-outline btn-square"
      on:click={() => {
        localFilters.sortOrder = localFilters.sortOrder === 'asc' ? 'desc' : 'asc';
        updateFilter('sortOrder', localFilters.sortOrder);
      }}
      title={localFilters.sortOrder === 'asc' ? '昇順' : '降順'}
    >
      {#if localFilters.sortOrder === 'asc'}
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H4a1 1 0 01-1-1z"></path>
        </svg>
      {:else}
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h4a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path>
        </svg>
      {/if}
    </button>
  </div>

  <!-- 詳細フィルター切り替え -->
  <div class="flex items-center">
    <button 
      class="btn btn-outline {$isFilterPanelOpen ? 'btn-active' : ''}"
      on:click={toggleFilterPanel}
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
      </svg>
      詳細フィルター
      {#if activeFilterCount > 0}
        <div class="badge badge-primary badge-sm">{activeFilterCount}</div>
      {/if}
    </button>
  </div>
</div>

<!-- 詳細フィルターパネル -->
{#if $isFilterPanelOpen}
  <div class="card bg-base-100 shadow-md mb-6">
    <div class="card-body">
      <h3 class="card-title text-lg mb-4">詳細フィルター</h3>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <!-- 部署フィルター -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">部署</span>
          </label>
          <select class="select select-bordered" bind:value={localFilters.departmentId}>
            <option value={null}>すべての部署</option>
            {#each $departmentList as department}
              <option value={department.id}>
                {'　'.repeat(department.level)}{department.name}
              </option>
            {/each}
          </select>
        </div>

        <!-- 役職フィルター -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">役職</span>
          </label>
          <select class="select select-bordered" bind:value={localFilters.positionId}>
            <option value={null}>すべての役職</option>
            {#each $positionList.sort((a, b) => b.level - a.level) as position}
              <option value={position.id}>{position.name}</option>
            {/each}
          </select>
        </div>

        <!-- 勤務地フィルター -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">勤務地</span>
          </label>
          <select class="select select-bordered" bind:value={localFilters.workLocation}>
            <option value={null}>すべての勤務地</option>
            {#each WORK_LOCATIONS as location}
              <option value={location}>{location}</option>
            {/each}
          </select>
        </div>

        <!-- 雇用形態フィルター -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">雇用形態</span>
          </label>
          <div class="flex flex-wrap gap-2">
            {#each Object.values(STATUS.CONTRACT_TYPE) as contractType}
              <label class="label cursor-pointer">
                <input 
                  type="checkbox" 
                  class="checkbox checkbox-sm"
                  checked={localFilters.contractType.includes(contractType.value)}
                  on:change={() => toggleContractType(contractType.value)}
                />
                <span class="label-text ml-2">{contractType.label}</span>
              </label>
            {/each}
          </div>
        </div>

        <!-- 在籍状況フィルター -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">在籍状況</span>
          </label>
          <div class="flex flex-wrap gap-2">
            {#each Object.values(STATUS.EMPLOYEE) as status}
              <label class="label cursor-pointer">
                <input 
                  type="checkbox" 
                  class="checkbox checkbox-sm"
                  checked={localFilters.status.includes(status.value)}
                  on:change={() => toggleStatus(status.value)}
                />
                <span class="label-text ml-2">{status.label}</span>
              </label>
            {/each}
          </div>
        </div>

        <!-- 入社年範囲 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">入社年</span>
          </label>
          <div class="flex gap-2 items-center">
            <select class="select select-bordered select-sm flex-1" bind:value={localFilters.hireYearRange.start}>
              <option value={null}>開始年</option>
              {#each yearOptions as year}
                <option value={year}>{year}年</option>
              {/each}
            </select>
            <span class="text-base-content/70">〜</span>
            <select class="select select-bordered select-sm flex-1" bind:value={localFilters.hireYearRange.end}>
              <option value={null}>終了年</option>
              {#each yearOptions as year}
                <option value={year}>{year}年</option>
              {/each}
            </select>
          </div>
        </div>

        <!-- 年齢範囲 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">年齢</span>
          </label>
          <div class="flex gap-2 items-center">
            <input 
              type="number" 
              placeholder="最小"
              class="input input-bordered input-sm flex-1"
              min="16" 
              max="100"
              bind:value={localFilters.ageRange.min}
            />
            <span class="text-base-content/70">〜</span>
            <input 
              type="number" 
              placeholder="最大"
              class="input input-bordered input-sm flex-1"
              min="16" 
              max="100"
              bind:value={localFilters.ageRange.max}
            />
          </div>
        </div>
      </div>

      <!-- スキルフィルター -->
      <div class="form-control mt-6">
        <label class="label">
          <span class="label-text font-semibold">スキル</span>
          <span class="label-text-alt">
            {localFilters.skills.length > 0 ? `${localFilters.skills.length}個選択中` : ''}
          </span>
        </label>
        
        <div class="space-y-4">
          {#each Object.entries(skillsByCategory) as [category, skills]}
            <div>
              <h4 class="font-medium text-sm text-base-content/80 mb-2">{category}</h4>
              <div class="flex flex-wrap gap-2">
                {#each skills as skill}
                  <label class="label cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-xs"
                      checked={localFilters.skills.includes(skill.id)}
                      on:change={() => toggleSkill(skill.id)}
                    />
                    <span class="label-text ml-2 text-sm">{skill.name}</span>
                  </label>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- アクションボタン -->
      <div class="card-actions justify-end mt-6 pt-4 border-t border-base-300">
        <button class="btn btn-ghost" on:click={handleResetFilters}>
          リセット
        </button>
        <button class="btn btn-primary" on:click={applyFilters}>
          フィルターを適用
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- 適用中のフィルター表示 -->
{#if activeFilterCount > 0}
  <div class="flex flex-wrap gap-2 mb-4">
    <span class="text-sm text-base-content/70">適用中のフィルター:</span>
    
    {#if $filters.search?.trim()}
      <div class="badge badge-outline gap-2">
        検索: {$filters.search}
        <button class="btn btn-ghost btn-xs" on:click={() => updateFilter('search', '')}>×</button>
      </div>
    {/if}
    
    {#if $filters.departmentId}
      <div class="badge badge-outline gap-2">
        部署: {$departmentList.find(d => d.id === $filters.departmentId)?.name}
        <button class="btn btn-ghost btn-xs" on:click={() => updateFilter('departmentId', null)}>×</button>
      </div>
    {/if}
    
    {#if $filters.positionId}
      <div class="badge badge-outline gap-2">
        役職: {$positionList.find(p => p.id === $filters.positionId)?.name}
        <button class="btn btn-ghost btn-xs" on:click={() => updateFilter('positionId', null)}>×</button>
      </div>
    {/if}
    
    {#if $filters.skills?.length > 0}
      <div class="badge badge-outline gap-2">
        スキル: {$filters.skills.length}個
        <button class="btn btn-ghost btn-xs" on:click={() => updateFilter('skills', [])}>×</button>
      </div>
    {/if}
    
    {#if $filters.contractType?.length > 0}
      <div class="badge badge-outline gap-2">
        雇用形態: {$filters.contractType.length}個
        <button class="btn btn-ghost btn-xs" on:click={() => updateFilter('contractType', [])}>×</button>
      </div>
    {/if}
    
    {#if $filters.status?.length > 0}
      <div class="badge badge-outline gap-2">
        在籍状況: {$filters.status.length}個
        <button class="btn btn-ghost btn-xs" on:click={() => updateFilter('status', [])}>×</button>
      </div>
    {/if}
    
    {#if $filters.workLocation}
      <div class="badge badge-outline gap-2">
        勤務地: {$filters.workLocation}
        <button class="btn btn-ghost btn-xs" on:click={() => updateFilter('workLocation', null)}>×</button>
      </div>
    {/if}
    
    {#if $filters.hireYearRange?.start || $filters.hireYearRange?.end}
      <div class="badge badge-outline gap-2">
        入社年: {$filters.hireYearRange.start || ''}〜{$filters.hireYearRange.end || ''}
        <button class="btn btn-ghost btn-xs" on:click={() => updateFilter('hireYearRange', { start: null, end: null })}>×</button>
      </div>
    {/if}
    
    {#if $filters.ageRange?.min || $filters.ageRange?.max}
      <div class="badge badge-outline gap-2">
        年齢: {$filters.ageRange.min || ''}〜{$filters.ageRange.max || ''}歳
        <button class="btn btn-ghost btn-xs" on:click={() => updateFilter('ageRange', { min: null, max: null })}>×</button>
      </div>
    {/if}
    
    <button class="btn btn-ghost btn-xs" on:click={resetFilters}>
      すべてクリア
    </button>
  </div>
{/if}

<style>
  .card {
    transition: all 0.3s ease;
  }
  
  .checkbox:checked {
    border-color: hsl(var(--p));
    background-color: hsl(var(--p));
  }
  
  .badge {
    transition: all 0.2s ease;
  }
  
  .badge:hover {
    transform: scale(1.05);
  }
</style>