<script lang="ts">
  import type { InventoryItem, Warehouse, WarehouseArea, InventoryMovement } from '../types';
  import { MOVEMENT_STATUS, MOVEMENT_STATUS_LABELS } from '../constants';
  
  let { 
    show = false,
    item = null as InventoryItem | null,
    warehouses = [] as Warehouse[],
    onMove = (movement: Omit<InventoryMovement, 'id' | 'requestedAt'>) => {},
    onClose = () => {}
  } = $props();
  
  // フォームの状態
  let formData = $state({
    toWarehouseId: '',
    toAreaId: '',
    quantity: 1,
    reason: '',
    status: 'pending' as InventoryMovement['status'],
    requestedBy: 'デモユーザー'
  });
  
  let targetWarehouse = $state<Warehouse | null>(null);
  let targetAreas = $state<WarehouseArea[]>([]);
  let maxQuantity = $state(1);
  
  // アイテムが変更されたときの処理
  $effect(() => {
    if (item) {
      maxQuantity = item.quantity;
      formData.quantity = Math.min(item.quantity, formData.quantity);
      
      // 現在と同じ倉庫は選択できないようにする
      if (formData.toWarehouseId === item.warehouseId) {
        formData.toWarehouseId = '';
        formData.toAreaId = '';
      }
    }
  });
  
  // 移動先倉庫選択時の処理
  $effect(() => {
    targetWarehouse = warehouses.find(w => w.id === formData.toWarehouseId) || null;
    if (targetWarehouse) {
      targetAreas = targetWarehouse.areas;
    } else {
      targetAreas = [];
      formData.toAreaId = '';
    }
  });
  
  function handleSubmit() {
    if (!item) return;
    
    const movement: Omit<InventoryMovement, 'id' | 'requestedAt'> = {
      itemId: item.id,
      fromWarehouseId: item.warehouseId,
      fromAreaId: item.areaId,
      toWarehouseId: formData.toWarehouseId,
      toAreaId: formData.toAreaId,
      quantity: formData.quantity,
      reason: formData.reason,
      status: formData.status,
      requestedBy: formData.requestedBy
    };
    
    onMove(movement);
  }
  
  function handleCancel() {
    onClose();
  }
  
  function getAvailableWarehouses() {
    if (!item) return warehouses;
    return warehouses.filter(w => w.id !== item.warehouseId);
  }
</script>

<!-- モーダル -->
<dialog class="modal" class:modal-open={show}>
  <div class="modal-box w-11/12 max-w-2xl">
    <h3 class="font-bold text-lg mb-4">在庫移動</h3>
    
    {#if item}
      <!-- 現在の在庫情報 -->
      <div class="alert alert-info mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="flex-1">
          <h4 class="font-bold">移動元情報</h4>
          <div class="text-sm mt-1">
            <div>商品: {item.product?.name || '-'} ({item.product?.sku || '-'})</div>
            <div>現在位置: {item.warehouse?.name || '-'} / {item.area?.name || '-'} / {item.location}</div>
            <div>在庫数: {item.quantity} {item.unit}</div>
            {#if item.rfidTag}
              <div>RFID: {item.rfidTag}</div>
            {/if}
          </div>
        </div>
      </div>
      
      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 移動先倉庫 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">移動先倉庫 <span class="text-error">*</span></span>
            </label>
            <select 
              class="select select-bordered" 
              bind:value={formData.toWarehouseId}
              required
            >
              <option value="">倉庫を選択してください</option>
              {#each getAvailableWarehouses() as warehouse}
                <option value={warehouse.id}>
                  {warehouse.name} (空き: {warehouse.capacity - warehouse.currentUsage}個)
                </option>
              {/each}
            </select>
          </div>
          
          <!-- 移動先エリア -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">移動先エリア <span class="text-error">*</span></span>
            </label>
            <select 
              class="select select-bordered" 
              bind:value={formData.toAreaId}
              required
              disabled={!formData.toWarehouseId}
            >
              <option value="">エリアを選択してください</option>
              {#each targetAreas as area}
                <option value={area.id}>
                  {area.name} ({area.code}) - 空き: {area.capacity - area.currentUsage}個
                </option>
              {/each}
            </select>
          </div>
          
          <!-- 移動数量 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">移動数量 <span class="text-error">*</span></span>
            </label>
            <div class="join">
              <input 
                type="number" 
                class="input input-bordered join-item flex-1" 
                bind:value={formData.quantity}
                min="1"
                max={maxQuantity}
                required
              />
              <span class="join-item btn btn-disabled">
                {item.unit} / 最大 {maxQuantity}
              </span>
            </div>
            {#if formData.quantity < item.quantity}
              <label class="label">
                <span class="label-text-alt text-warning">
                  部分移動: {item.quantity - formData.quantity} {item.unit}が元の場所に残ります
                </span>
              </label>
            {/if}
          </div>
          
          <!-- ステータス -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">ステータス</span>
            </label>
            <select 
              class="select select-bordered" 
              bind:value={formData.status}
            >
              {#each Object.entries(MOVEMENT_STATUS) as [key, value]}
                <option value={value}>{MOVEMENT_STATUS_LABELS[value]}</option>
              {/each}
            </select>
          </div>
        </div>
        
        <!-- 移動理由 -->
        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text">移動理由 <span class="text-error">*</span></span>
          </label>
          <textarea 
            class="textarea textarea-bordered" 
            bind:value={formData.reason}
            rows="3"
            placeholder="移動の理由を入力してください"
            required
          ></textarea>
        </div>
        
        <!-- 移動先情報のプレビュー -->
        {#if targetWarehouse && formData.toAreaId}
          <div class="alert mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h4 class="font-bold">移動先確認</h4>
              <p class="text-sm">
                {targetWarehouse.name} / {targetAreas.find(a => a.id === formData.toAreaId)?.name}
              </p>
            </div>
          </div>
        {/if}
        
        <!-- アクションボタン -->
        <div class="modal-action">
          <button type="button" class="btn" onclick={handleCancel}>
            キャンセル
          </button>
          <button type="submit" class="btn btn-primary">
            移動を実行
          </button>
        </div>
      </form>
    {:else}
      <p>在庫アイテムが選択されていません。</p>
      <div class="modal-action">
        <button class="btn" onclick={handleCancel}>閉じる</button>
      </div>
    {/if}
  </div>
  
  <!-- 背景クリックで閉じる -->
  <form method="dialog" class="modal-backdrop">
    <button onclick={handleCancel}>close</button>
  </form>
</dialog>