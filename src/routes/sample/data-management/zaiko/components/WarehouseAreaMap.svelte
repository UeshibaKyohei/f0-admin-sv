<script lang="ts">
  import type { Warehouse, WarehouseArea, InventoryItem } from '../types';
  
  let { 
    warehouse = null as Warehouse | null,
    inventoryItems = [] as InventoryItem[],
    selectedAreaId = null as string | null,
    onAreaSelect = (areaId: string) => {}
  } = $props();
  
  // フロアごとにエリアをグループ化
  const areasByFloor = $derived.by(() => {
    if (!warehouse) return new Map();
    
    const grouped = new Map<number, WarehouseArea[]>();
    warehouse.areas.forEach(area => {
      const floor = area.location.floor;
      if (!grouped.has(floor)) {
        grouped.set(floor, []);
      }
      grouped.get(floor)!.push(area);
    });
    
    return grouped;
  });
  
  // エリアごとの在庫統計を計算
  function getAreaStats(areaId: string) {
    const items = inventoryItems.filter(item => item.areaId === areaId);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const itemTypes = new Set(items.map(item => item.productId)).size;
    
    return {
      itemCount: items.length,
      totalQuantity,
      itemTypes
    };
  }
  
  // 使用率に基づく色を取得
  function getUsageColor(usage: number, capacity: number): string {
    const rate = (usage / capacity) * 100;
    if (rate >= 90) return 'bg-error text-error-content';
    if (rate >= 70) return 'bg-warning text-warning-content';
    if (rate >= 50) return 'bg-info text-info-content';
    return 'bg-success text-success-content';
  }
  
  // 選択状態のクラスを取得
  function getSelectedClass(areaId: string): string {
    return selectedAreaId === areaId ? 'ring-2 ring-primary shadow-lg' : '';
  }
</script>

{#if warehouse}
  <div class="space-y-6">
    <!-- デバッグ情報 -->
    <div class="alert alert-info">
      <span>倉庫: {warehouse.name} | エリア数: {warehouse.areas.length} | アイテム数: {inventoryItems.length}</span>
    </div>
    
    <!-- 倉庫情報ヘッダー -->
    <div class="bg-base-200 p-4 rounded-lg">
      <h3 class="font-bold text-lg mb-2">{warehouse.name}</h3>
      <p class="text-sm text-base-content/70">{warehouse.location}</p>
      <div class="mt-2">
        <div class="flex justify-between items-center text-sm">
          <span>全体使用率</span>
          <span class="font-medium">{Math.round((warehouse.currentUsage / warehouse.capacity) * 100)}%</span>
        </div>
        <progress 
          class="progress progress-primary h-2 mt-1" 
          value={warehouse.currentUsage} 
          max={warehouse.capacity}
        ></progress>
      </div>
    </div>
    
    <!-- フロアごとのエリアマップ -->
    {#each [...areasByFloor.entries()].sort((a, b) => b[0] - a[0]) as [floor, areas]}
      <div class="border border-base-300 rounded-lg p-4">
        <h4 class="font-semibold mb-3">{floor}階</h4>
        
        <!-- エリアグリッド -->
        <div class="grid grid-cols-4 gap-2">
          {#each ['A', 'B', 'C', 'D'] as row}
            {#each [1, 2, 3, 4] as column}
              {@const area = areas.find(a => a.location.row === row && a.location.column === column)}
              {#if area}
                {@const stats = getAreaStats(area.id)}
                {@const usageRate = (area.currentUsage / area.capacity) * 100}
                <button
                  class="relative p-3 rounded-lg transition-all hover:shadow-md {getUsageColor(area.currentUsage, area.capacity)} {getSelectedClass(area.id)}"
                  onclick={() => onAreaSelect(area.id)}
                >
                  <!-- エリアコード -->
                  <div class="font-bold text-lg">{area.code}</div>
                  
                  <!-- 使用率バー -->
                  <div class="w-full bg-black/20 rounded-full h-1 mt-1">
                    <div 
                      class="bg-white/80 h-1 rounded-full transition-all"
                      style="width: {usageRate}%"
                    ></div>
                  </div>
                  
                  <!-- 統計情報 -->
                  <div class="text-xs mt-1 opacity-90">
                    {stats.itemTypes}種 / {area.currentUsage}個
                  </div>
                  
                  <!-- 選択インジケーター -->
                  {#if selectedAreaId === area.id}
                    <div class="absolute top-1 right-1">
                      <span class="badge badge-xs badge-neutral">選択中</span>
                    </div>
                  {/if}
                </button>
              {:else}
                <!-- 空のスロット -->
                <div class="p-3 rounded-lg border border-dashed border-base-300 opacity-50">
                  <div class="text-center text-xs text-base-content/50">
                    {row}-{column}
                  </div>
                </div>
              {/if}
            {/each}
          {/each}
        </div>
        
        <!-- 凡例 -->
        <div class="flex items-center gap-4 mt-4 text-xs">
          <div class="flex items-center gap-1">
            <div class="w-3 h-3 rounded bg-success"></div>
            <span>0-50%</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-3 h-3 rounded bg-info"></div>
            <span>50-70%</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-3 h-3 rounded bg-warning"></div>
            <span>70-90%</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-3 h-3 rounded bg-error"></div>
            <span>90%+</span>
          </div>
        </div>
      </div>
    {/each}
    
    <!-- 選択エリアの詳細 -->
    {#if selectedAreaId}
      {@const selectedArea = warehouse.areas.find(a => a.id === selectedAreaId)}
      {#if selectedArea}
        {@const stats = getAreaStats(selectedAreaId)}
        <div class="bg-base-100 border border-primary rounded-lg p-4">
          <h4 class="font-semibold mb-2">エリア詳細: {selectedArea.name}</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-base-content/70">コード:</span>
              <span class="ml-2 font-medium">{selectedArea.code}</span>
            </div>
            <div>
              <span class="text-base-content/70">容量:</span>
              <span class="ml-2 font-medium">{selectedArea.capacity}個</span>
            </div>
            <div>
              <span class="text-base-content/70">使用中:</span>
              <span class="ml-2 font-medium">{selectedArea.currentUsage}個</span>
            </div>
            <div>
              <span class="text-base-content/70">空き:</span>
              <span class="ml-2 font-medium">{selectedArea.capacity - selectedArea.currentUsage}個</span>
            </div>
            <div>
              <span class="text-base-content/70">アイテム種別:</span>
              <span class="ml-2 font-medium">{stats.itemTypes}種</span>
            </div>
            <div>
              <span class="text-base-content/70">総在庫数:</span>
              <span class="ml-2 font-medium">{stats.totalQuantity}個</span>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>
{:else}
  <div class="text-center py-8 text-base-content/60">
    倉庫を選択してください
  </div>
{/if}