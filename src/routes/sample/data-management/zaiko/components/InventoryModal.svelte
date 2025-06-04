<script lang="ts">
  import type { InventoryItem, Product, Warehouse, WarehouseArea } from '../types';
  import { INVENTORY_STATUS, INVENTORY_STATUS_LABELS } from '../constants';
  
  let { 
    show = false,
    item = null as InventoryItem | null,
    products = [] as Product[],
    warehouses = [] as Warehouse[],
    onSave = (data: Partial<InventoryItem>) => {},
    onClose = () => {}
  } = $props();
  
  // フォームの状態
  let formData = $state({
    productId: '',
    quantity: 1,
    unit: '',
    warehouseId: '',
    areaId: '',
    location: '',
    status: 'available' as InventoryItem['status'],
    rfidTag: '',
    serialNumber: '',
    batchNumber: '',
    lotNumber: '',
    manufacturingDate: '',
    expiryDate: '',
    cost: 0,
    notes: ''
  });
  
  let selectedProduct = $state<Product | null>(null);
  let selectedWarehouse = $state<Warehouse | null>(null);
  let availableAreas = $state<WarehouseArea[]>([]);
  
  // アイテムが変更されたときにフォームを初期化
  $effect(() => {
    if (item) {
      formData = {
        productId: item.productId,
        quantity: item.quantity,
        unit: item.unit,
        warehouseId: item.warehouseId,
        areaId: item.areaId,
        location: item.location,
        status: item.status,
        rfidTag: item.rfidTag || '',
        serialNumber: item.serialNumber || '',
        batchNumber: item.batchNumber || '',
        lotNumber: item.lotNumber || '',
        manufacturingDate: item.manufacturingDate ? new Date(item.manufacturingDate).toISOString().split('T')[0] : '',
        expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
        cost: item.cost || 0,
        notes: item.notes || ''
      };
    } else {
      // 新規登録の場合はリセット
      formData = {
        productId: '',
        quantity: 1,
        unit: '',
        warehouseId: '',
        areaId: '',
        location: '',
        status: 'available',
        rfidTag: '',
        serialNumber: '',
        batchNumber: '',
        lotNumber: '',
        manufacturingDate: '',
        expiryDate: '',
        cost: 0,
        notes: ''
      };
    }
  });
  
  // 商品選択時の処理
  $effect(() => {
    selectedProduct = products.find(p => p.id === formData.productId) || null;
    if (selectedProduct) {
      formData.unit = selectedProduct.unit;
    }
  });
  
  // 倉庫選択時の処理
  $effect(() => {
    selectedWarehouse = warehouses.find(w => w.id === formData.warehouseId) || null;
    if (selectedWarehouse) {
      availableAreas = selectedWarehouse.areas;
    } else {
      availableAreas = [];
      formData.areaId = '';
    }
  });
  
  function handleSubmit() {
    const data: Partial<InventoryItem> = {
      productId: formData.productId,
      quantity: formData.quantity,
      unit: formData.unit,
      warehouseId: formData.warehouseId,
      areaId: formData.areaId,
      location: formData.location,
      status: formData.status,
      rfidTag: formData.rfidTag || undefined,
      serialNumber: formData.serialNumber || undefined,
      batchNumber: formData.batchNumber || undefined,
      lotNumber: formData.lotNumber || undefined,
      manufacturingDate: formData.manufacturingDate ? new Date(formData.manufacturingDate) : undefined,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
      cost: formData.cost || undefined,
      notes: formData.notes || undefined
    };
    
    onSave(data);
  }
  
  function handleCancel() {
    onClose();
  }
</script>

<!-- モーダル -->
<dialog class="modal" class:modal-open={show}>
  <div class="modal-box w-11/12 max-w-3xl">
    <h3 class="font-bold text-lg mb-4">
      {item ? '在庫編集' : '新規在庫登録'}
    </h3>
    
    <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 商品選択 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">商品 <span class="text-error">*</span></span>
          </label>
          <select 
            class="select select-bordered" 
            bind:value={formData.productId}
            required
            disabled={!!item}
          >
            <option value="">商品を選択してください</option>
            {#each products as product}
              <option value={product.id}>
                {product.name} ({product.sku})
              </option>
            {/each}
          </select>
        </div>
        
        <!-- 数量 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">数量 <span class="text-error">*</span></span>
          </label>
          <div class="join">
            <input 
              type="number" 
              class="input input-bordered join-item flex-1" 
              bind:value={formData.quantity}
              min="1"
              required
            />
            <span class="join-item btn btn-disabled">
              {formData.unit || '個'}
            </span>
          </div>
        </div>
        
        <!-- 倉庫選択 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">倉庫 <span class="text-error">*</span></span>
          </label>
          <select 
            class="select select-bordered" 
            bind:value={formData.warehouseId}
            required
          >
            <option value="">倉庫を選択してください</option>
            {#each warehouses as warehouse}
              <option value={warehouse.id}>
                {warehouse.name} (使用率: {Math.round((warehouse.currentUsage / warehouse.capacity) * 100)}%)
              </option>
            {/each}
          </select>
        </div>
        
        <!-- エリア選択 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">エリア <span class="text-error">*</span></span>
          </label>
          <select 
            class="select select-bordered" 
            bind:value={formData.areaId}
            required
            disabled={!formData.warehouseId}
          >
            <option value="">エリアを選択してください</option>
            {#each availableAreas as area}
              <option value={area.id}>
                {area.name} ({area.code})
              </option>
            {/each}
          </select>
        </div>
        
        <!-- 詳細位置 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">詳細位置 <span class="text-error">*</span></span>
          </label>
          <input 
            type="text" 
            class="input input-bordered" 
            bind:value={formData.location}
            placeholder="例: 棚A-3"
            required
          />
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
            {#each Object.entries(INVENTORY_STATUS) as [key, value]}
              <option value={value}>{INVENTORY_STATUS_LABELS[value]}</option>
            {/each}
          </select>
        </div>
        
        <!-- RFIDタグ -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">RFIDタグ</span>
          </label>
          <input 
            type="text" 
            class="input input-bordered" 
            bind:value={formData.rfidTag}
            placeholder="RFID-xxxx-xxxx"
          />
        </div>
        
        <!-- シリアル番号 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">シリアル番号</span>
          </label>
          <input 
            type="text" 
            class="input input-bordered" 
            bind:value={formData.serialNumber}
            placeholder="SN-xxxxxxxxx"
          />
        </div>
        
        <!-- バッチ番号 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">バッチ番号</span>
          </label>
          <input 
            type="text" 
            class="input input-bordered" 
            bind:value={formData.batchNumber}
            placeholder="BATCH-xxxxx"
          />
        </div>
        
        <!-- ロット番号 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">ロット番号</span>
          </label>
          <input 
            type="text" 
            class="input input-bordered" 
            bind:value={formData.lotNumber}
            placeholder="LOT-xxxx-xxx"
          />
        </div>
        
        <!-- 製造日 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">製造日</span>
          </label>
          <input 
            type="date" 
            class="input input-bordered" 
            bind:value={formData.manufacturingDate}
          />
        </div>
        
        <!-- 有効期限 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">有効期限</span>
          </label>
          <input 
            type="date" 
            class="input input-bordered" 
            bind:value={formData.expiryDate}
          />
        </div>
        
        <!-- 原価 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">原価（円）</span>
          </label>
          <input 
            type="number" 
            class="input input-bordered" 
            bind:value={formData.cost}
            min="0"
            step="0.01"
          />
        </div>
      </div>
      
      <!-- 備考 -->
      <div class="form-control mt-4">
        <label class="label">
          <span class="label-text">備考</span>
        </label>
        <textarea 
          class="textarea textarea-bordered" 
          bind:value={formData.notes}
          rows="3"
          placeholder="特記事項があれば入力してください"
        ></textarea>
      </div>
      
      <!-- 商品情報の表示 -->
      {#if selectedProduct}
        <div class="alert alert-info mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h4 class="font-bold">商品情報</h4>
            <div class="text-sm">
              <div>メーカー: {selectedProduct.manufacturer || '-'}</div>
              <div>最小在庫: {selectedProduct.minStockLevel} {selectedProduct.unit}</div>
              <div>発注点: {selectedProduct.reorderPoint} {selectedProduct.unit}</div>
            </div>
          </div>
        </div>
      {/if}
      
      <!-- アクションボタン -->
      <div class="modal-action">
        <button type="button" class="btn" onclick={handleCancel}>
          キャンセル
        </button>
        <button type="submit" class="btn btn-primary">
          {item ? '更新' : '登録'}
        </button>
      </div>
    </form>
  </div>
  
  <!-- 背景クリックで閉じる -->
  <form method="dialog" class="modal-backdrop">
    <button onclick={handleCancel}>close</button>
  </form>
</dialog>