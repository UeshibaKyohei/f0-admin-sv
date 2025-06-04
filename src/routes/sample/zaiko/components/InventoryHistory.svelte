<script lang="ts">
  import type { InventoryHistory, Product } from '../types';
  import { INVENTORY_ACTION_LABELS } from '../constants';
  
  let { 
    history = [] as InventoryHistory[],
    products = [] as Product[],
    itemId = null as string | null,
    limit = 10
  } = $props();
  
  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(date));
  }
  
  function getActionIcon(action: InventoryHistory['action']): string {
    const icons = {
      created: 'M12 4v16m8-8H4',
      updated: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      moved: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
      deleted: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      adjusted: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'
    };
    return icons[action] || '';
  }
  
  function getActionColor(action: InventoryHistory['action']): string {
    const colors = {
      created: 'text-success',
      updated: 'text-info',
      moved: 'text-warning',
      deleted: 'text-error',
      adjusted: 'text-secondary'
    };
    return colors[action] || 'text-base-content';
  }
  
  function formatChange(entry: InventoryHistory): string {
    switch (entry.action) {
      case 'created':
        return `新規登録`;
      case 'updated':
        if (entry.previousValue && entry.newValue) {
          const changes = [];
          if (entry.previousValue.quantity !== entry.newValue.quantity) {
            changes.push(`数量: ${entry.previousValue.quantity} → ${entry.newValue.quantity}`);
          }
          if (entry.previousValue.status !== entry.newValue.status) {
            changes.push(`ステータス: ${entry.previousValue.status} → ${entry.newValue.status}`);
          }
          if (entry.previousValue.location !== entry.newValue.location) {
            changes.push(`場所: ${entry.previousValue.location} → ${entry.newValue.location}`);
          }
          return changes.join(', ') || '情報更新';
        }
        return '情報更新';
      case 'moved':
        if (entry.previousValue && entry.newValue) {
          return `移動: ${entry.previousValue.warehouseId} → ${entry.newValue.warehouseId}`;
        }
        return '在庫移動';
      case 'deleted':
        return '削除';
      case 'adjusted':
        return `数量調整: ${entry.reason}`;
      default:
        return entry.reason || '-';
    }
  }
  
  // フィルタリングされた履歴
  const filteredHistory = $derived.by(() => {
    let items = itemId 
      ? history.filter(h => h.itemId === itemId)
      : history;
    
    // 日付の新しい順にソート
    items.sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
    
    // 制限をかける
    return items.slice(0, limit);
  });
</script>

<div class="overflow-x-auto">
  {#if filteredHistory.length === 0}
    <div class="text-center py-8 text-base-content/60">
      履歴データがありません
    </div>
  {:else}
    <div class="space-y-2">
      {#each filteredHistory as entry}
        <div class="flex items-start gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors">
          <!-- アイコン -->
          <div class={`p-2 rounded-full bg-base-200 ${getActionColor(entry.action)}`}>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getActionIcon(entry.action)}></path>
            </svg>
          </div>
          
          <!-- 内容 -->
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-medium">{INVENTORY_ACTION_LABELS[entry.action]}</span>
              <span class="text-xs text-base-content/60">
                {formatDate(entry.performedAt)}
              </span>
            </div>
            <div class="text-sm text-base-content/80">
              {formatChange(entry)}
            </div>
            <div class="text-xs text-base-content/60 mt-1">
              実行者: {entry.performedBy}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>