<script lang="ts">
  import type { Warehouse } from '../types';
  import { WAREHOUSE_TYPE_LABELS } from '../constants';
  
  let { 
    warehouses = [] as Warehouse[],
    selectedWarehouseId = '',
    onSelect = (warehouseId: string) => {}
  } = $props();

  function getUtilizationColor(rate: number): string {
    if (rate >= 90) return 'error';
    if (rate >= 70) return 'warning';
    return 'success';
  }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {#each warehouses as warehouse}
    {@const utilizationRate = Math.round((warehouse.currentUsage / warehouse.capacity) * 100)}
    <button
      class="card bg-base-100 text-left transition-all hover:shadow-md {selectedWarehouseId === warehouse.id ? 'ring-2 ring-primary shadow-md' : 'shadow-sm'}"
      onclick={() => onSelect(warehouse.id)}
    >
      <div class="card-body p-4">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-semibold">{warehouse.name}</h3>
            <p class="text-xs text-base-content/60 mt-1">
              {WAREHOUSE_TYPE_LABELS[warehouse.type]}
            </p>
          </div>
          {#if selectedWarehouseId === warehouse.id}
            <span class="badge badge-primary badge-sm">選択中</span>
          {/if}
        </div>
        
        <div class="mt-3">
          <div class="flex justify-between items-center text-sm mb-1">
            <span class="text-base-content/70">使用率</span>
            <span class="font-medium text-{getUtilizationColor(utilizationRate)}">
              {utilizationRate}%
            </span>
          </div>
          <progress 
            class="progress progress-{getUtilizationColor(utilizationRate)} h-2" 
            value={utilizationRate} 
            max="100"
          ></progress>
          <p class="text-xs text-base-content/60 mt-1">
            {warehouse.currentUsage.toLocaleString()} / {warehouse.capacity.toLocaleString()} 個
          </p>
        </div>
        
        <div class="mt-3">
          <p class="text-xs text-base-content/60 line-clamp-2">
            <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            {warehouse.location}
          </p>
        </div>
      </div>
    </button>
  {/each}
</div>