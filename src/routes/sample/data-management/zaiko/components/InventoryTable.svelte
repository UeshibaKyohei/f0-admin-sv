<script lang="ts">
  import type { InventoryItem, Category } from '../types';
  import { INVENTORY_STATUS_LABELS, INVENTORY_STATUS_COLORS } from '../constants';
  
  let { 
    items = [] as InventoryItem[],
    categories = [] as Category[],
    onEdit = (item: InventoryItem) => {},
    onDelete = (item: InventoryItem) => {},
    onMove = (item: InventoryItem) => {},
    isLoading = false
  } = $props();
  
  function getCategoryName(categoryId: string): string {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '-';
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }
</script>

<div class="overflow-x-auto">
  <table class="table table-sm">
    <thead>
      <tr>
        <th>SKU</th>
        <th>商品名</th>
        <th>カテゴリ</th>
        <th>数量</th>
        <th>倉庫</th>
        <th>場所</th>
        <th>ステータス</th>
        <th>RFID/シリアル</th>
        <th>最終更新</th>
        <th class="text-center">操作</th>
      </tr>
    </thead>
    <tbody>
      {#if isLoading}
        <tr>
          <td colspan="9" class="text-center py-8">
            <span class="loading loading-spinner loading-md"></span>
          </td>
        </tr>
      {:else if items.length === 0}
        <tr>
          <td colspan="9" class="text-center py-8 text-base-content/60">
            在庫データがありません
          </td>
        </tr>
      {:else}
        {#each items as item}
          <tr class="hover">
            <td class="font-mono text-xs">{item.product?.sku || '-'}</td>
            <td>
              <div class="font-medium">{item.product?.name || '-'}</div>
              {#if item.product?.manufacturer}
                <div class="text-xs text-base-content/60">{item.product.manufacturer} {item.product.model || ''}</div>
              {/if}
              {#if item.lotNumber || item.batchNumber}
                <div class="text-xs text-base-content/60">
                  {item.lotNumber ? `LOT: ${item.lotNumber}` : ''}
                  {item.batchNumber ? `BATCH: ${item.batchNumber}` : ''}
                </div>
              {/if}
            </td>
            <td class="text-sm">
              {#if item.product}
                <span class="badge badge-ghost badge-sm">{getCategoryName(item.product.categoryId)}</span>
              {:else}
                -
              {/if}
            </td>
            <td>
              <span class="font-semibold">{item.quantity}</span>
              <span class="text-xs text-base-content/60">{item.unit}</span>
              {#if item.product && item.quantity < item.product.minStockLevel}
                <span class="badge badge-warning badge-xs ml-1">低在庫</span>
              {/if}
            </td>
            <td class="text-sm">{item.warehouse?.name || item.warehouseId}</td>
            <td class="text-sm font-mono">{item.location}</td>
            <td>
              <span class="badge badge-{INVENTORY_STATUS_COLORS[item.status]} badge-sm">
                {INVENTORY_STATUS_LABELS[item.status]}
              </span>
            </td>
            <td>
              <div class="flex flex-col gap-1">
                {#if item.rfidTag}
                  <div class="tooltip" data-tip={item.rfidTag}>
                    <span class="badge badge-outline badge-xs">RFID</span>
                  </div>
                {/if}
                {#if item.serialNumber}
                  <div class="tooltip" data-tip={item.serialNumber}>
                    <span class="badge badge-outline badge-xs">S/N</span>
                  </div>
                {/if}
                {#if !item.rfidTag && !item.serialNumber}
                  <span class="text-base-content/30">-</span>
                {/if}
              </div>
            </td>
            <td class="text-xs text-base-content/60">
              {formatDate(item.updatedAt || item.createdAt || new Date())}
              {#if item.expiryDate}
                <div class="text-warning">
                  期限: {new Date(item.expiryDate).toLocaleDateString('ja-JP')}
                </div>
              {/if}
            </td>
            <td>
              <div class="flex gap-1 justify-center">
                <button 
                  class="btn btn-ghost btn-xs"
                  onclick={() => onEdit(item)}
                  title="編集"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button 
                  class="btn btn-ghost btn-xs"
                  onclick={() => onMove(item)}
                  title="移動"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                  </svg>
                </button>
                <button 
                  class="btn btn-ghost btn-xs text-error"
                  onclick={() => onDelete(item)}
                  title="削除"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>