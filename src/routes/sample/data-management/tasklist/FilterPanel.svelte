<script>
  import { filterOptions, campaigns, users, allTags } from './stores/taskStore';
  import { STATUS_CONFIG, PRIORITY_CONFIG, DEPARTMENTS } from './types';
  
  // フィルターのリセット
  function resetFilters() {
    filterOptions.set({
      status: [],
      priority: [],
      assignees: [],
      tags: [],
      campaigns: [],
      dateRange: {
        start: null,
        end: null
      }
    });
  }
  
  // 配列フィルターの切り替え
  function toggleArrayFilter(filterKey, value) {
    filterOptions.update(options => {
      const current = options[filterKey];
      const index = current.indexOf(value);
      
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(value);
      }
      
      return { ...options, [filterKey]: [...current] };
    });
  }
</script>

<div class="card bg-base-100 shadow-sm mb-4">
  <div class="card-body">
    <div class="flex items-center justify-between mb-4">
      <h3 class="card-title text-lg">フィルター</h3>
      <button class="btn btn-sm btn-ghost" onclick={resetFilters}>
        リセット
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <!-- ステータス -->
      <div>
        <label class="label">
          <span class="label-text">ステータス</span>
        </label>
        <div class="space-y-2">
          {#each Object.entries(STATUS_CONFIG) as [value, config]}
            <label class="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                class="checkbox checkbox-sm"
                checked={$filterOptions.status.includes(value)}
                onchange={() => toggleArrayFilter('status', value)}
              />
              <span class="label-text">{config.label}</span>
            </label>
          {/each}
        </div>
      </div>

      <!-- 優先度 -->
      <div>
        <label class="label">
          <span class="label-text">優先度</span>
        </label>
        <div class="space-y-2">
          {#each Object.entries(PRIORITY_CONFIG) as [value, config]}
            <label class="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                class="checkbox checkbox-sm"
                checked={$filterOptions.priority.includes(value)}
                onchange={() => toggleArrayFilter('priority', value)}
              />
              <span class="label-text">{config.label}</span>
            </label>
          {/each}
        </div>
      </div>

      <!-- 担当者 -->
      <div>
        <label class="label">
          <span class="label-text">担当者</span>
        </label>
        <div class="space-y-2 max-h-40 overflow-y-auto">
          {#each $users as user}
            <label class="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                class="checkbox checkbox-sm"
                checked={$filterOptions.assignees.includes(user.id)}
                onchange={() => toggleArrayFilter('assignees', user.id)}
              />
              <span class="label-text text-sm">{user.name}</span>
            </label>
          {/each}
        </div>
      </div>

      <!-- キャンペーン -->
      <div>
        <label class="label">
          <span class="label-text">キャンペーン</span>
        </label>
        <div class="space-y-2">
          {#each $campaigns as campaign}
            <label class="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                class="checkbox checkbox-sm"
                checked={$filterOptions.campaigns.includes(campaign.id)}
                onchange={() => toggleArrayFilter('campaigns', campaign.id)}
              />
              <span class="label-text text-sm truncate">{campaign.name}</span>
            </label>
          {/each}
        </div>
      </div>

      <!-- タグ -->
      <div>
        <label class="label">
          <span class="label-text">タグ</span>
        </label>
        <div class="space-y-2 max-h-40 overflow-y-auto">
          {#each $allTags as tag}
            <label class="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                class="checkbox checkbox-sm"
                checked={$filterOptions.tags.includes(tag)}
                onchange={() => toggleArrayFilter('tags', tag)}
              />
              <span class="label-text text-sm">{tag}</span>
            </label>
          {/each}
        </div>
      </div>

      <!-- 期限 -->
      <div>
        <label class="label">
          <span class="label-text">期限</span>
        </label>
        <div class="space-y-2">
          <input
            type="date"
            class="input input-sm input-bordered w-full"
            placeholder="開始日"
            value={$filterOptions.dateRange.start || ''}
            onchange={(e) => filterOptions.update(o => ({
              ...o,
              dateRange: { ...o.dateRange, start: e.target.value || null }
            }))}
          />
          <input
            type="date"
            class="input input-sm input-bordered w-full"
            placeholder="終了日"
            value={$filterOptions.dateRange.end || ''}
            onchange={(e) => filterOptions.update(o => ({
              ...o,
              dateRange: { ...o.dateRange, end: e.target.value || null }
            }))}
          />
        </div>
      </div>
    </div>
  </div>
</div>