<script>
  import WarehouseAreaMap from '../components/WarehouseAreaMap.svelte';
  import WarehouseCameraView from '../components/WarehouseCameraView.svelte';
  import RFIDManager from '../components/RFIDManager.svelte';
  import AlertManager from '../components/AlertManager.svelte';
  import InventoryHistory from '../components/InventoryHistory.svelte';

  import { onMount } from 'svelte';
  import { inventoryStore } from '../inventoryStore.svelte';
  import { generateInitialDemoData } from '../api/demoDataV2';
  
  let activeSection = 'area-map';
  let sections = [
    { id: 'area-map', name: 'エリアマップ', icon: '🗺️' },
    { id: 'camera-view', name: 'カメラビュー', icon: '📹' },
    { id: 'rfid', name: 'RFID管理', icon: '📱' },
    { id: 'alerts', name: 'アラート設定', icon: '🚨' },
    { id: 'history', name: '履歴', icon: '📊' },
  ];
  
  let selectedWarehouse = null;
  let selectedArea = null;
  let selectedItemId = null;
  
  // 倉庫選択時の処理
  function handleWarehouseSelect(warehouseId) {
    selectedWarehouse = inventoryStore.warehouses.find(w => w.id === warehouseId) || null;
    selectedArea = null;
  }
  
  // エリア選択時の処理
  function handleAreaSelect(areaId) {
    if (!selectedWarehouse) return;
    selectedArea = selectedWarehouse.areas.find(a => a.id === areaId) || null;
  }
  
  // RFIDスキャン処理
  function handleRFIDScan(rfidTag) {
    console.log('RFID Scanned:', rfidTag);
  }
  
  // RFID一括更新処理
  function handleRFIDBulkUpdate(updates) {
    updates.forEach(update => {
      inventoryStore.updateInventoryItem(update.itemId, { rfidTag: update.rfidTag });
    });
  }
  
  // アイテム位置特定処理
  function handleItemLocate(item) {
    selectedItemId = item.id;
    console.log('Locating item:', item.product?.name);
  }
  
  // アラート管理
  function handleCreateAlert(alertData) {
    console.log('Creating alert:', alertData);
  }
  
  function handleUpdateAlert(id, alertData) {
    console.log('Updating alert:', id, alertData);
  }
  
  function handleDeleteAlert(id) {
    console.log('Deleting alert:', id);
  }
  
  onMount(() => {
    // データ初期化
    const demoData = generateInitialDemoData();
    inventoryStore.initializeWithDemoData(demoData);
    
    // 最初の倉庫を選択
    if (demoData.warehouses.length > 0) {
      selectedWarehouse = demoData.warehouses[0];
    }
    
    // ハッシュ変更対応
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && sections.find(s => s.id === hash)) {
        activeSection = hash;
      }
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  });
</script>

<div class="min-h-screen bg-base-200">
  <!-- ヘッダー -->
  <div class="bg-base-100 shadow-lg sticky top-0 z-50">
    <div class="container mx-auto px-4 py-6">
      <h1 class="text-4xl font-bold text-primary">在庫管理システム - 高度な機能</h1>
      <p class="text-base-content/70 mt-2">
        RFID管理、カメラビュー、アラート設定など
      </p>
    </div>
    
    <!-- 倉庫選択 -->
    <div class="border-t border-base-300">
      <div class="container mx-auto px-4 py-4">
        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text">倉庫選択</span>
          </label>
          <select 
            class="select select-bordered"
            value={selectedWarehouse?.id || ''}
            on:change={(e) => handleWarehouseSelect(e.target.value)}
          >
            <option value="">倉庫を選択してください</option>
            {#each inventoryStore.warehouses as warehouse}
              <option value={warehouse.id}>{warehouse.name}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>
    
    <!-- ナビゲーション -->
    <div class="border-t border-base-300">
      <div class="container mx-auto px-4">
        <div class="flex overflow-x-auto py-2 gap-2 scrollbar-thin">
          {#each sections as section}
            <a 
              href="#{section.id}"
              class="btn btn-sm {activeSection === section.id ? 'btn-primary' : 'btn-ghost'} whitespace-nowrap"
              on:click={() => activeSection = section.id}
            >
              <span class="text-lg mr-1">{section.icon}</span>
              {section.name}
            </a>
          {/each}
        </div>
      </div>
    </div>
  </div>
  
  <!-- メインコンテンツ -->
  <div class="container mx-auto px-4 py-8">
    <div class="space-y-8">
      {#if activeSection === 'area-map'}
        <div class="bg-base-100 rounded-lg p-6 shadow-sm">
          <WarehouseAreaMap
            warehouse={selectedWarehouse}
            inventoryItems={inventoryStore.inventoryItems}
            selectedAreaId={selectedArea?.id || null}
            onAreaSelect={handleAreaSelect}
          />
        </div>
      {:else if activeSection === 'camera-view'}
        <div class="bg-base-100 rounded-lg p-6 shadow-sm">
          <div class="alert alert-info mb-4">
            <span>カメラビュー - 倉庫: {selectedWarehouse ? selectedWarehouse.name : '未選択'}</span>
          </div>
          <WarehouseCameraView
            warehouse={selectedWarehouse}
            selectedArea={selectedArea}
            inventoryItems={inventoryStore.inventoryItems}
            onItemLocate={handleItemLocate}
          />
        </div>
      {:else if activeSection === 'rfid'}
        <div class="bg-base-100 rounded-lg p-6 shadow-sm">
          <div class="alert alert-info mb-4">
            <span>RFID管理 - 対象アイテム数: {inventoryStore.inventoryItems.length}</span>
          </div>
          <RFIDManager
            items={inventoryStore.inventoryItems}
            onScan={handleRFIDScan}
            onBulkUpdate={handleRFIDBulkUpdate}
          />
        </div>
      {:else if activeSection === 'alerts'}
        <div class="bg-base-100 rounded-lg p-6 shadow-sm">
          <div class="alert alert-info mb-4">
            <span>アラート管理 - 商品数: {inventoryStore.products.length} | アラート数: {inventoryStore.alerts.length}</span>
          </div>
          <AlertManager
            alerts={inventoryStore.alerts}
            products={inventoryStore.products}
            warehouses={inventoryStore.warehouses}
            onCreateAlert={handleCreateAlert}
            onUpdateAlert={handleUpdateAlert}
            onDeleteAlert={handleDeleteAlert}
          />
        </div>
      {:else if activeSection === 'history'}
        <div class="bg-base-100 rounded-lg p-6 shadow-sm">
          <div class="alert alert-info mb-4">
            <span>在庫履歴 - 履歴件数: {inventoryStore.history.length}</span>
          </div>
          <h3 class="text-lg font-semibold mb-4">在庫履歴</h3>
          <InventoryHistory
            history={inventoryStore.history}
            products={inventoryStore.products}
            itemId={selectedItemId}
            limit={50}
          />
        </div>
      {/if}
    </div>
  </div>
  
  <!-- フッター -->
  <div class="mt-8 text-center pb-8">
    <a href="/sample/data-management/zaiko" class="btn btn-outline">
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
      </svg>
      基本画面に戻る
    </a>
  </div>
</div>

<style>
  /* カスタムスクロールバー */
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: oklch(var(--bc) / 0.2) transparent;
  }
  
  .scrollbar-thin::-webkit-scrollbar {
    height: 8px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: oklch(var(--bc) / 0.2);
    border-radius: 4px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background-color: oklch(var(--bc) / 0.3);
  }
</style>