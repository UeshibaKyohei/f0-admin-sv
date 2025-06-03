<script lang="ts">
  import type { Category, Tag, Warehouse, InventoryFilter } from '../types';
  import { INVENTORY_STATUS_LABELS } from '../constants';
  
  let { 
    categories = [] as Category[],
    tags = [] as Tag[],
    warehouses = [] as Warehouse[],
    currentFilter = {} as InventoryFilter,
    onFilterChange = (filter: InventoryFilter) => {}
  } = $props();
  
  let localFilter = $state<InventoryFilter>({
    ...currentFilter
  });
  
  let showFilters = $state(false);
  let activeFilterCount = $state(0);
  
  // アクティブなフィルター数を計算
  $effect(() => {
    let count = 0;
    if (localFilter.warehouseId) count++;
    if (localFilter.areaId) count++;
    if (localFilter.status) count++;
    if (localFilter.rfidTag) count++;
    if (localFilter.dateFrom) count++;
    if (localFilter.dateTo) count++;
    activeFilterCount = count;
  });
  
  function applyFilters() {
    onFilterChange(localFilter);
    showFilters = false;
  }
  
  function resetFilters() {
    localFilter = {
      keyword: currentFilter.keyword // キーワードは保持
    };
    onFilterChange(localFilter);
  }
  
  function getTopLevelCategories() {
    return categories.filter(cat => !cat.parentId);
  }
</script>

<div class="mb-4">
  <!-- フィルターボタン -->
  <button 
    class="btn btn-outline btn-sm"
    onclick={() => showFilters = !showFilters}
  >
    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
    </svg>
    フィルター
    {#if activeFilterCount > 0}
      <span class="badge badge-primary badge-sm ml-2">{activeFilterCount}</span>
    {/if}
  </button>
  
  {#if activeFilterCount > 0}
    <button 
      class="btn btn-ghost btn-sm ml-2"
      onclick={resetFilters}
    >
      フィルターをクリア
    </button>
  {/if}
</div>

<!-- フィルターパネル -->
{#if showFilters}
  <div class="card bg-base-100 shadow-sm mb-4">
    <div class="card-body">
      <h3 class="card-title text-base mb-4">詳細フィルター</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 倉庫フィルター -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">倉庫</span>
          </label>
          <select 
            class="select select-bordered select-sm" 
            bind:value={localFilter.warehouseId}
          >
            <option value="">すべての倉庫</option>
            {#each warehouses as warehouse}
              <option value={warehouse.id}>{warehouse.name}</option>
            {/each}
          </select>
        </div>
        
        <!-- ステータスフィルター -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">ステータス</span>
          </label>
          <select 
            class="select select-bordered select-sm" 
            bind:value={localFilter.status}
          >
            <option value="">すべてのステータス</option>
            {#each Object.entries(INVENTORY_STATUS_LABELS) as [value, label]}
              <option value={value}>{label}</option>
            {/each}
          </select>
        </div>
        
        <!-- RFIDタグフィルター -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">RFIDタグ</span>
          </label>
          <select 
            class="select select-bordered select-sm" 
            bind:value={localFilter.rfidTag}
          >
            <option value="">すべて</option>
            <option value="has">RFIDタグあり</option>
            <option value="none">RFIDタグなし</option>
          </select>
        </div>
        
        <!-- 更新日（開始） -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">更新日（開始）</span>
          </label>
          <input 
            type="date" 
            class="input input-bordered input-sm"
            bind:value={localFilter.dateFrom}
          />
        </div>
        
        <!-- 更新日（終了） -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">更新日（終了）</span>
          </label>
          <input 
            type="date" 
            class="input input-bordered input-sm"
            bind:value={localFilter.dateTo}
          />
        </div>
      </div>
      
      <!-- タグフィルター -->
      <div class="form-control mt-4">
        <label class="label">
          <span class="label-text">タグで絞り込み</span>
        </label>
        <div class="flex flex-wrap gap-2">
          {#each tags as tag}
            <label class="cursor-pointer">
              <input 
                type="checkbox" 
                class="checkbox checkbox-xs mr-1"
                checked={false}
              />
              <span class={`badge ${tag.color} badge-sm`}>{tag.name}</span>
            </label>
          {/each}
        </div>
      </div>
      
      <!-- アクションボタン -->
      <div class="flex justify-end gap-2 mt-4">
        <button 
          class="btn btn-ghost btn-sm"
          onclick={() => showFilters = false}
        >
          キャンセル
        </button>
        <button 
          class="btn btn-primary btn-sm"
          onclick={applyFilters}
        >
          フィルターを適用
        </button>
      </div>
    </div>
  </div>
{/if}