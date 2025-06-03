<script lang="ts">
  import { onMount } from 'svelte';
  import { inventoryStore } from './inventoryStore.svelte';
  import { generateInitialDemoData } from './api/demoDataV2';
  import type { InventoryItem, Warehouse, InventoryFilter, InventoryMovement } from './types';
  
  import DashboardCard from './components/DashboardCard.svelte';
  import WarehouseSelector from './components/WarehouseSelector.svelte';
  import InventoryTable from './components/InventoryTable.svelte';
  import InventoryModal from './components/InventoryModal.svelte';
  import InventoryFilters from './components/InventoryFilters.svelte';
  import MovementModal from './components/MovementModal.svelte';
  
  let selectedWarehouseId = $state('');
  let searchKeyword = $state('');
  let showAddModal = $state(false);
  let showMoveModal = $state(false);
  let editingItem = $state<InventoryItem | null>(null);
  let movingItem = $state<InventoryItem | null>(null);
  
  // 初期化
  onMount(() => {
    const demoData = generateInitialDemoData();
    inventoryStore.initializeWithDemoData(demoData);
    
    // 最初の倉庫を選択
    if (demoData.warehouses.length > 0) {
      selectedWarehouseId = demoData.warehouses[0].id;
    }
  });
  
  // 検索とフィルタリング
  $effect(() => {
    inventoryStore.setFilter({
      keyword: searchKeyword,
      warehouseId: selectedWarehouseId
    });
  });
  
  // ハンドラー
  function handleEdit(item: InventoryItem) {
    editingItem = item;
    showAddModal = true;
  }
  
  function handleDelete(item: InventoryItem) {
    const product = item.product || inventoryStore.products.find(p => p.id === item.productId);
    const productName = product?.name || 'Unknown';
    if (confirm(`「${productName}」を削除してもよろしいですか？`)) {
      inventoryStore.deleteInventoryItem(item.id);
    }
  }
  
  function handleMove(item: InventoryItem) {
    movingItem = item;
    showMoveModal = true;
  }
  
  function handleAddNew() {
    editingItem = null;
    showAddModal = true;
  }
  
  async function handleSave(data: Partial<InventoryItem>) {
    try {
      if (editingItem) {
        await inventoryStore.updateInventoryItem(editingItem.id, data);
      } else {
        await inventoryStore.addInventoryItem(data as Omit<InventoryItem, 'id' | 'lastUpdated'>);
      }
      showAddModal = false;
      editingItem = null;
    } catch (error) {
      console.error('Failed to save inventory item:', error);
    }
  }
  
  function handleFilterChange(filter: InventoryFilter) {
    inventoryStore.setFilter(filter);
  }
  
  async function handleMovement(movement: Omit<InventoryMovement, 'id' | 'requestedAt'>) {
    try {
      await inventoryStore.moveInventory(movement);
      showMoveModal = false;
      movingItem = null;
    } catch (error) {
      console.error('Failed to move inventory:', error);
    }
  }
  
  // アイコンSVGパス
  const icons = {
    box: '<path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>',
    warehouse: '<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>',
    alert: '<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>',
    truck: '<path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>'
  };
</script>

<div class="container mx-auto p-4">
  <!-- ヘッダー -->
  <div class="mb-6">
    <div class="flex justify-between items-start">
      <div>
        <h1 class="text-2xl font-bold">在庫管理システム</h1>
        <p class="text-base-content/60 mt-1">倉庫在庫の管理・追跡・分析</p>
      </div>
      <div class="flex gap-2">
        <a href="/sample/zaiko/advanced" class="btn btn-outline btn-sm">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          高度な機能
        </a>
      </div>
    </div>
  </div>
  
  <!-- ダッシュボード -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <DashboardCard
      title="総在庫数"
      value={inventoryStore.dashboardStats.totalItems.toLocaleString()}
      subtitle="全倉庫合計"
      color="primary"
      icon={icons.box}
      trend={5}
    />
    <DashboardCard
      title="倉庫数"
      value={inventoryStore.dashboardStats.totalWarehouses.toString()}
      subtitle="稼働中"
      color="secondary"
      icon={icons.warehouse}
    />
    <DashboardCard
      title="在庫不足"
      value={inventoryStore.dashboardStats.lowStockItems.toString()}
      subtitle="要補充"
      color="warning"
      icon={icons.alert}
      trend={-12}
    />
    <DashboardCard
      title="本日の移動"
      value={inventoryStore.dashboardStats.recentMovements.length.toString()}
      subtitle="処理済み"
      color="info"
      icon={icons.truck}
    />
  </div>
  
  <!-- 倉庫選択 -->
  <div class="mb-6">
    <h2 class="text-lg font-semibold mb-4">倉庫選択</h2>
    <WarehouseSelector
      warehouses={inventoryStore.warehouses}
      selectedWarehouseId={selectedWarehouseId}
      onSelect={(id) => selectedWarehouseId = id}
    />
  </div>
  
  <!-- 在庫管理セクション -->
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <!-- ツールバー -->
      <div class="flex flex-col lg:flex-row gap-4 mb-4">
        <div class="flex-1">
          <label class="input input-bordered flex items-center gap-2">
            <svg class="h-4 w-4 opacity-70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input
              type="search"
              placeholder="商品名、SKU、カテゴリ、タグ、RFIDで検索..."
              class="grow"
              bind:value={searchKeyword}
            />
            <kbd class="kbd kbd-sm">⌘</kbd>
            <kbd class="kbd kbd-sm">K</kbd>
          </label>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-primary" onclick={handleAddNew}>
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            新規登録
          </button>
          <button class="btn btn-outline">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
            </svg>
            エクスポート
          </button>
        </div>
      </div>
      
      <!-- 在庫テーブル -->
      <InventoryTable
        items={inventoryStore.filteredItems}
        categories={inventoryStore.categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMove={handleMove}
        isLoading={inventoryStore.isLoading}
      />
      
      <!-- ページネーション -->
      <div class="flex justify-center mt-4">
        <div class="join">
          <button class="join-item btn btn-sm">«</button>
          <button class="join-item btn btn-sm btn-active">1</button>
          <button class="join-item btn btn-sm">2</button>
          <button class="join-item btn btn-sm">3</button>
          <button class="join-item btn btn-sm">»</button>
        </div>
      </div>
      
      <!-- フィルター -->
      <InventoryFilters
        categories={inventoryStore.categories}
        tags={inventoryStore.tags}
        warehouses={inventoryStore.warehouses}
        currentFilter={inventoryStore.currentFilter}
        onFilterChange={handleFilterChange}
      />
    </div>
  </div>
</div>

<!-- 追加・編集モーダル -->
<InventoryModal
  show={showAddModal}
  item={editingItem}
  products={inventoryStore.products}
  warehouses={inventoryStore.warehouses}
  onSave={handleSave}
  onClose={() => {
    showAddModal = false;
    editingItem = null;
  }}
/>

<!-- 移動モーダル -->
<MovementModal
  show={showMoveModal}
  item={movingItem}
  warehouses={inventoryStore.warehouses}
  onMove={handleMovement}
  onClose={() => {
    showMoveModal = false;
    movingItem = null;
  }}
/>