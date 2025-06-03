<script lang="ts">
  import type { Warehouse, WarehouseArea, InventoryItem } from '../types';
  
  let { 
    warehouse = null as Warehouse | null,
    selectedArea = null as WarehouseArea | null,
    inventoryItems = [] as InventoryItem[],
    onItemLocate = (item: InventoryItem) => {}
  } = $props();
  
  // カメラビューの状態
  let selectedCamera = $state('camera-1');
  let isLiveView = $state(false);
  let showHeatmap = $state(false);
  let selectedItem = $state<InventoryItem | null>(null);
  
  // デモ用のカメラフィード
  const cameraFeeds = [
    { id: 'camera-1', name: '北側通路', floor: 1, status: 'online' },
    { id: 'camera-2', name: '南側通路', floor: 1, status: 'online' },
    { id: 'camera-3', name: '中央エリア', floor: 2, status: 'offline' },
    { id: 'camera-4', name: '搬入口', floor: 1, status: 'online' }
  ];
  
  // エリア内のアイテム
  const areaItems = $derived.by(() => {
    if (!selectedArea) return [];
    return inventoryItems.filter(item => item.areaId === selectedArea.id);
  });
  
  // ヒートマップデータ（デモ用）
  function getHeatmapIntensity(x: number, y: number): number {
    // 実際の実装では、在庫の密度や移動頻度から計算
    return Math.random() * 100;
  }
  
  // アイテムの位置を視覚化（デモ用）
  function getItemPosition(item: InventoryItem): { x: number, y: number } {
    // 実際の実装では、RFIDの位置情報から計算
    const hash = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      x: (hash % 80) + 10,
      y: ((hash * 7) % 70) + 15
    };
  }
  
  // カメラ切り替え
  function switchCamera(cameraId: string) {
    selectedCamera = cameraId;
    // 実際の実装では、カメラフィードを切り替え
  }
  
  // アイテムを探す
  function locateItem(item: InventoryItem) {
    selectedItem = item;
    onItemLocate(item);
    
    // デモ用：2秒後に位置表示をクリア
    setTimeout(() => {
      selectedItem = null;
    }, 3000);
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <!-- カメラビュー -->
  <div class="lg:col-span-2 space-y-4">
    <!-- カメラ選択 -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body p-4">
        <div class="flex justify-between items-center">
          <h3 class="font-semibold">カメラビュー</h3>
          <div class="flex gap-2">
            <button 
              class="btn btn-sm {isLiveView ? 'btn-primary' : 'btn-outline'}"
              onclick={() => isLiveView = !isLiveView}
            >
              {isLiveView ? 'ライブ' : '静止画'}
            </button>
            <button 
              class="btn btn-sm {showHeatmap ? 'btn-primary' : 'btn-outline'}"
              onclick={() => showHeatmap = !showHeatmap}
            >
              ヒートマップ
            </button>
          </div>
        </div>
        
        <!-- カメラ切り替えタブ -->
        <div class="tabs tabs-boxed mt-4">
          {#each cameraFeeds as camera}
            <button 
              class="tab {selectedCamera === camera.id ? 'tab-active' : ''} {camera.status === 'offline' ? 'opacity-50' : ''}"
              onclick={() => switchCamera(camera.id)}
              disabled={camera.status === 'offline'}
            >
              {camera.name}
              {#if camera.status === 'offline'}
                <span class="badge badge-error badge-xs ml-1">オフライン</span>
              {/if}
            </button>
          {/each}
        </div>
        
        <!-- カメラビューエリア -->
        <div class="relative mt-4 bg-base-200 rounded-lg overflow-hidden" style="padding-bottom: 56.25%;">
          <div class="absolute inset-0">
            {#if isLiveView}
              <!-- ライブビューのシミュレーション -->
              <div class="w-full h-full bg-gradient-to-br from-base-300 to-base-100 flex items-center justify-center">
                <div class="text-center">
                  <svg class="w-16 h-16 mx-auto mb-2 text-base-content/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  <p class="text-base-content/50">カメラフィード: {cameraFeeds.find(c => c.id === selectedCamera)?.name}</p>
                  {#if isLiveView}
                    <span class="badge badge-error badge-sm mt-2">● LIVE</span>
                  {/if}
                </div>
              </div>
            {:else}
              <!-- 静止画ビュー with オーバーレイ -->
              <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <!-- 背景 -->
                <rect width="100" height="100" fill="#f3f4f6"/>
                
                <!-- 棚のグリッド（デモ用） -->
                {#each [20, 40, 60, 80] as x}
                  {#each [30, 50, 70] as y}
                    <rect x={x-5} y={y-3} width="10" height="6" fill="#e5e7eb" stroke="#d1d5db"/>
                  {/each}
                {/each}
                
                <!-- ヒートマップ -->
                {#if showHeatmap}
                  {#each Array(10) as _, i}
                    {#each Array(10) as _, j}
                      {@const intensity = getHeatmapIntensity(i, j)}
                      <rect 
                        x={i * 10} 
                        y={j * 10} 
                        width="10" 
                        height="10" 
                        fill={`rgba(255, ${255 - intensity * 2}, 0, ${intensity / 200})`}
                      />
                    {/each}
                  {/each}
                {/if}
                
                <!-- アイテムの位置表示 -->
                {#each areaItems as item}
                  {@const pos = getItemPosition(item)}
                  <g class="cursor-pointer" onclick={() => locateItem(item)}>
                    <circle 
                      cx={pos.x} 
                      cy={pos.y} 
                      r="2" 
                      fill={selectedItem?.id === item.id ? '#ef4444' : '#3b82f6'}
                      class="animate-pulse"
                    />
                    {#if selectedItem?.id === item.id}
                      <text x={pos.x} y={pos.y - 5} text-anchor="middle" font-size="3" fill="#ef4444">
                        {item.product?.sku}
                      </text>
                    {/if}
                  </g>
                {/each}
              </svg>
            {/if}
            
            <!-- カメラコントロール -->
            <div class="absolute bottom-4 right-4 flex gap-2">
              <button class="btn btn-circle btn-sm btn-ghost bg-base-100/80">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
              <button class="btn btn-circle btn-sm btn-ghost bg-base-100/80">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </button>
              <button class="btn btn-circle btn-sm btn-ghost bg-base-100/80">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- カメラ情報 -->
        <div class="text-sm text-base-content/60 mt-2">
          {#if warehouse && selectedArea}
            表示エリア: {warehouse.name} / {selectedArea.name}
          {:else}
            エリアを選択してください
          {/if}
        </div>
      </div>
    </div>
    
    <!-- AI検出情報 -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body p-4">
        <h4 class="font-semibold text-sm mb-2">AI検出情報</h4>
        <div class="space-y-2">
          <div class="alert alert-info py-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-sm">エリア内に{areaItems.length}個のアイテムを検出</span>
          </div>
          {#if selectedItem}
            <div class="alert alert-success py-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="text-sm">
                {selectedItem.product?.name} を位置特定中...
              </span>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
  
  <!-- アイテムリスト -->
  <div class="space-y-4">
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body p-4">
        <h4 class="font-semibold text-sm mb-2">エリア内アイテム</h4>
        
        {#if areaItems.length === 0}
          <p class="text-sm text-base-content/60 text-center py-4">
            このエリアにアイテムはありません
          </p>
        {:else}
          <div class="space-y-2 max-h-96 overflow-y-auto">
            {#each areaItems as item}
              <button
                class="w-full text-left p-3 rounded-lg border transition-colors hover:bg-base-200 {selectedItem?.id === item.id ? 'border-primary bg-primary/10' : 'border-base-300'}"
                onclick={() => locateItem(item)}
              >
                <div class="font-medium text-sm">{item.product?.name || '-'}</div>
                <div class="text-xs text-base-content/60">
                  SKU: {item.product?.sku || '-'}
                </div>
                <div class="text-xs text-base-content/60">
                  位置: {item.location}
                </div>
                <div class="flex items-center gap-2 mt-1">
                  {#if item.rfidTag}
                    <span class="badge badge-primary badge-xs">RFID</span>
                  {/if}
                  <span class="text-xs">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
    
    <!-- カメラ設定 -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body p-4">
        <h4 class="font-semibold text-sm mb-2">検出設定</h4>
        <div class="space-y-3">
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text text-sm">動体検知</span>
              <input type="checkbox" class="toggle toggle-primary toggle-sm" checked />
            </label>
          </div>
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text text-sm">異常検知アラート</span>
              <input type="checkbox" class="toggle toggle-primary toggle-sm" checked />
            </label>
          </div>
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text text-sm">在庫カウント</span>
              <input type="checkbox" class="toggle toggle-primary toggle-sm" checked />
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>