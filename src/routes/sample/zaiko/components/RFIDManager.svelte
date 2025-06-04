<script lang="ts">
  import type { InventoryItem } from '../types';
  
  let { 
    items = [] as InventoryItem[],
    onScan = (rfidTag: string) => {},
    onBulkUpdate = (updates: { itemId: string, rfidTag: string }[]) => {}
  } = $props();
  
  // 状態管理
  let scanMode = $state<'single' | 'bulk'>('single');
  let isScanning = $state(false);
  let scannedTags = $state<string[]>([]);
  let selectedItems = $state<Set<string>>(new Set());
  let showAssignModal = $state(false);
  let newRfidTag = $state('');
  let bulkPrefix = $state('RFID-');
  let bulkStartNumber = $state(1);
  
  // RFIDタグのあるアイテムとないアイテムを分離
  const itemsWithRfid = $derived(items.filter(item => item.rfidTag));
  const itemsWithoutRfid = $derived(items.filter(item => !item.rfidTag));
  
  // シミュレートされたRFIDスキャン
  function simulateScan() {
    isScanning = true;
    
    // 3秒後にランダムなRFIDタグを生成
    setTimeout(() => {
      const randomTag = `RFID-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      scannedTags = [...scannedTags, randomTag];
      onScan(randomTag);
      isScanning = false;
      
      // デモ用：スキャン音を再生（実際の実装では実際の音声ファイルを使用）
      playBeep();
    }, 1500);
  }
  
  // ビープ音のシミュレーション
  function playBeep() {
    // 実際の実装では Audio API を使用
    console.log('Beep! RFID scanned');
  }
  
  // 一括割り当て
  function handleBulkAssign() {
    const updates: { itemId: string, rfidTag: string }[] = [];
    let currentNumber = bulkStartNumber;
    
    selectedItems.forEach(itemId => {
      const tag = `${bulkPrefix}${String(currentNumber).padStart(8, '0')}`;
      updates.push({ itemId, rfidTag: tag });
      currentNumber++;
    });
    
    onBulkUpdate(updates);
    selectedItems.clear();
    showAssignModal = false;
  }
  
  // アイテムの選択切り替え
  function toggleItemSelection(itemId: string) {
    const newSet = new Set(selectedItems);
    if (newSet.has(itemId)) {
      newSet.delete(itemId);
    } else {
      newSet.add(itemId);
    }
    selectedItems = newSet;
  }
  
  // 全選択/全解除
  function toggleSelectAll() {
    if (selectedItems.size === itemsWithoutRfid.length) {
      selectedItems = new Set();
    } else {
      selectedItems = new Set(itemsWithoutRfid.map(item => item.id));
    }
  }
</script>

<div class="space-y-6">
  <!-- ヘッダー -->
  <div class="flex justify-between items-center">
    <h3 class="text-lg font-semibold">RFIDタグ管理</h3>
    <div class="flex gap-2">
      <div class="join">
        <button 
          class="btn btn-sm join-item {scanMode === 'single' ? 'btn-active' : ''}"
          onclick={() => scanMode = 'single'}
        >
          個別スキャン
        </button>
        <button 
          class="btn btn-sm join-item {scanMode === 'bulk' ? 'btn-active' : ''}"
          onclick={() => scanMode = 'bulk'}
        >
          一括割り当て
        </button>
      </div>
    </div>
  </div>
  
  <!-- 統計情報 -->
  <div class="stats shadow w-full">
    <div class="stat">
      <div class="stat-title">総アイテム数</div>
      <div class="stat-value text-primary">{items.length}</div>
    </div>
    <div class="stat">
      <div class="stat-title">RFIDタグ付き</div>
      <div class="stat-value text-success">{itemsWithRfid.length}</div>
      <div class="stat-desc">{Math.round((itemsWithRfid.length / items.length) * 100)}%</div>
    </div>
    <div class="stat">
      <div class="stat-title">タグなし</div>
      <div class="stat-value text-warning">{itemsWithoutRfid.length}</div>
    </div>
  </div>
  
  {#if scanMode === 'single'}
    <!-- 個別スキャンモード -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <h4 class="card-title text-base">RFIDスキャナー</h4>
        
        <!-- スキャンボタン -->
        <div class="flex flex-col items-center py-8">
          <button 
            class="btn btn-primary btn-lg {isScanning ? 'loading' : ''}"
            onclick={simulateScan}
            disabled={isScanning}
          >
            {#if !isScanning}
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
              </svg>
            {/if}
            {isScanning ? 'スキャン中...' : 'RFIDをスキャン'}
          </button>
          <p class="text-sm text-base-content/60 mt-2">
            RFIDリーダーを商品に近づけてください
          </p>
        </div>
        
        <!-- スキャン履歴 -->
        {#if scannedTags.length > 0}
          <div class="divider">スキャン履歴</div>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            {#each scannedTags.slice().reverse() as tag}
              <div class="alert alert-success py-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm">スキャン成功: {tag}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <!-- 一括割り当てモード -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="flex justify-between items-center mb-4">
          <h4 class="card-title text-base">RFIDタグ一括割り当て</h4>
          <button 
            class="btn btn-primary btn-sm"
            onclick={() => showAssignModal = true}
            disabled={selectedItems.size === 0}
          >
            選択アイテムにタグを割り当て ({selectedItems.size})
          </button>
        </div>
        
        <!-- タグなしアイテムリスト -->
        <div class="overflow-x-auto">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>
                  <label>
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-sm"
                      checked={selectedItems.size === itemsWithoutRfid.length && itemsWithoutRfid.length > 0}
                      onchange={toggleSelectAll}
                    />
                  </label>
                </th>
                <th>SKU</th>
                <th>商品名</th>
                <th>倉庫</th>
                <th>場所</th>
                <th>数量</th>
              </tr>
            </thead>
            <tbody>
              {#if itemsWithoutRfid.length === 0}
                <tr>
                  <td colspan="6" class="text-center py-4 text-base-content/60">
                    すべてのアイテムにRFIDタグが設定されています
                  </td>
                </tr>
              {:else}
                {#each itemsWithoutRfid as item}
                  <tr class="hover">
                    <td>
                      <label>
                        <input 
                          type="checkbox" 
                          class="checkbox checkbox-sm"
                          checked={selectedItems.has(item.id)}
                          onchange={() => toggleItemSelection(item.id)}
                        />
                      </label>
                    </td>
                    <td class="font-mono text-xs">{item.product?.sku || '-'}</td>
                    <td>{item.product?.name || '-'}</td>
                    <td>{item.warehouse?.name || '-'}</td>
                    <td class="text-sm">{item.location}</td>
                    <td>{item.quantity} {item.unit}</td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- 既存のRFIDタグリスト -->
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <h4 class="card-title text-base">登録済みRFIDタグ</h4>
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>RFIDタグ</th>
              <th>SKU</th>
              <th>商品名</th>
              <th>場所</th>
              <th>最終更新</th>
            </tr>
          </thead>
          <tbody>
            {#if itemsWithRfid.length === 0}
              <tr>
                <td colspan="5" class="text-center py-4 text-base-content/60">
                  RFIDタグが登録されたアイテムはありません
                </td>
              </tr>
            {:else}
              {#each itemsWithRfid as item}
                <tr class="hover">
                  <td class="font-mono text-xs">{item.rfidTag}</td>
                  <td class="font-mono text-xs">{item.product?.sku || '-'}</td>
                  <td>{item.product?.name || '-'}</td>
                  <td class="text-sm">{item.warehouse?.name} / {item.location}</td>
                  <td class="text-xs text-base-content/60">
                    {new Date(item.updatedAt || item.createdAt || new Date()).toLocaleDateString('ja-JP')}
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<!-- 一括割り当てモーダル -->
<dialog class="modal" class:modal-open={showAssignModal}>
  <div class="modal-box">
    <h3 class="font-bold text-lg mb-4">RFIDタグ一括割り当て</h3>
    
    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text">タグプレフィックス</span>
      </label>
      <input 
        type="text" 
        class="input input-bordered"
        bind:value={bulkPrefix}
      />
    </div>
    
    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text">開始番号</span>
      </label>
      <input 
        type="number" 
        class="input input-bordered"
        bind:value={bulkStartNumber}
        min="1"
      />
    </div>
    
    <div class="alert">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <div>
        <p>{selectedItems.size}個のアイテムに以下の形式でタグが割り当てられます：</p>
        <p class="font-mono text-sm mt-1">
          {bulkPrefix}{String(bulkStartNumber).padStart(8, '0')} 〜 
          {bulkPrefix}{String(bulkStartNumber + selectedItems.size - 1).padStart(8, '0')}
        </p>
      </div>
    </div>
    
    <div class="modal-action">
      <button class="btn" onclick={() => showAssignModal = false}>
        キャンセル
      </button>
      <button class="btn btn-primary" onclick={handleBulkAssign}>
        割り当て実行
      </button>
    </div>
  </div>
  
  <form method="dialog" class="modal-backdrop">
    <button onclick={() => showAssignModal = false}>close</button>
  </form>
</dialog>