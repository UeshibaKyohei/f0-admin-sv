<script lang="ts">
  import type { InventoryAlert, Product, Warehouse } from '../types';
  
  let { 
    alerts = [] as InventoryAlert[],
    products = [] as Product[],
    warehouses = [] as Warehouse[],
    onCreateAlert = (alert: Omit<InventoryAlert, 'id' | 'createdAt' | 'updatedAt'>) => {},
    onUpdateAlert = (id: string, alert: Partial<InventoryAlert>) => {},
    onDeleteAlert = (id: string) => {}
  } = $props();
  
  // 状態管理
  let showCreateModal = $state(false);
  let editingAlert = $state<InventoryAlert | null>(null);
  let selectedTab = $state<'active' | 'triggered' | 'all'>('active');
  
  // フォームデータ
  let formData = $state({
    productId: '',
    warehouseId: '',
    alertType: 'low_stock' as InventoryAlert['alertType'],
    threshold: 10,
    thresholdUnit: '個',
    isActive: true,
    notificationChannels: ['in_app'] as InventoryAlert['notificationChannels'],
    notificationEmails: ['']
  });
  
  // アラートタイプの定義
  const alertTypes = [
    { value: 'low_stock', label: '低在庫アラート', description: '在庫数が指定値を下回った場合' },
    { value: 'overstock', label: '過剰在庫アラート', description: '在庫数が指定値を上回った場合' },
    { value: 'expiry', label: '有効期限アラート', description: '有効期限が指定日数以内の場合' },
    { value: 'inspection_due', label: '検査期限アラート', description: '検査期限が指定日数以内の場合' },
    { value: 'no_movement', label: '滞留在庫アラート', description: '指定期間動きがない場合' }
  ];
  
  // 通知チャンネルの定義
  const notificationChannels = [
    { value: 'in_app', label: 'アプリ内通知' },
    { value: 'email', label: 'メール' },
    { value: 'slack', label: 'Slack' },
    { value: 'teams', label: 'Microsoft Teams' }
  ];
  
  // フィルタリングされたアラート
  const filteredAlerts = $derived.by(() => {
    let filtered = alerts;
    
    switch (selectedTab) {
      case 'active':
        filtered = alerts.filter(alert => alert.isActive);
        break;
      case 'triggered':
        filtered = alerts.filter(alert => alert.lastTriggered);
        break;
      default:
        filtered = alerts;
    }
    
    return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  });
  
  // 新規作成モード
  function handleCreate() {
    editingAlert = null;
    formData = {
      productId: '',
      warehouseId: '',
      alertType: 'low_stock',
      threshold: 10,
      thresholdUnit: '個',
      isActive: true,
      notificationChannels: ['in_app'],
      notificationEmails: ['']
    };
    showCreateModal = true;
  }
  
  // 編集モード
  function handleEdit(alert: InventoryAlert) {
    editingAlert = alert;
    formData = {
      productId: alert.productId,
      warehouseId: alert.warehouseId || '',
      alertType: alert.alertType,
      threshold: alert.threshold,
      thresholdUnit: alert.thresholdUnit || '個',
      isActive: alert.isActive,
      notificationChannels: [...alert.notificationChannels],
      notificationEmails: alert.notificationEmails ? [...alert.notificationEmails] : ['']
    };
    showCreateModal = true;
  }
  
  // 保存処理
  function handleSave() {
    const alertData = {
      productId: formData.productId,
      warehouseId: formData.warehouseId || undefined,
      alertType: formData.alertType,
      threshold: formData.threshold,
      thresholdUnit: formData.thresholdUnit,
      isActive: formData.isActive,
      notificationChannels: formData.notificationChannels,
      notificationEmails: formData.notificationEmails.filter(email => email.trim())
    };
    
    if (editingAlert) {
      onUpdateAlert(editingAlert.id, alertData);
    } else {
      onCreateAlert(alertData);
    }
    
    showCreateModal = false;
  }
  
  // アラート削除
  function handleDelete(alert: InventoryAlert) {
    if (confirm(`「${getProductName(alert.productId)}」のアラートを削除してもよろしいですか？`)) {
      onDeleteAlert(alert.id);
    }
  }
  
  // アラートの有効/無効切り替え
  function toggleAlert(alert: InventoryAlert) {
    onUpdateAlert(alert.id, { isActive: !alert.isActive });
  }
  
  // 商品名を取得
  function getProductName(productId: string): string {
    const product = products.find(p => p.id === productId);
    return product ? product.name : '不明な商品';
  }
  
  // 倉庫名を取得
  function getWarehouseName(warehouseId?: string): string {
    if (!warehouseId) return '全倉庫';
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse ? warehouse.name : '不明な倉庫';
  }
  
  // アラートアイコンを取得
  function getAlertIcon(alertType: InventoryAlert['alertType']): string {
    const icons = {
      low_stock: 'M20 12H4',
      overstock: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
      expiry: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      inspection_due: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      no_movement: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
    };
    return icons[alertType] || '';
  }
  
  // アラート色を取得
  function getAlertColor(alertType: InventoryAlert['alertType']): string {
    const colors = {
      low_stock: 'text-warning',
      overstock: 'text-error',
      expiry: 'text-info',
      inspection_due: 'text-success',
      no_movement: 'text-secondary'
    };
    return colors[alertType] || 'text-base-content';
  }
  
  // 通知チャンネルの切り替え
  function toggleNotificationChannel(channel: string) {
    const channels = [...formData.notificationChannels];
    const index = channels.indexOf(channel as any);
    
    if (index > -1) {
      channels.splice(index, 1);
    } else {
      channels.push(channel as any);
    }
    
    formData.notificationChannels = channels;
  }
  
  // メールアドレスの追加/削除
  function addEmailField() {
    formData.notificationEmails = [...formData.notificationEmails, ''];
  }
  
  function removeEmailField(index: number) {
    const emails = [...formData.notificationEmails];
    emails.splice(index, 1);
    formData.notificationEmails = emails;
  }
</script>

<div class="space-y-6">
  <!-- ヘッダー -->
  <div class="flex justify-between items-center">
    <h3 class="text-lg font-semibold">アラート管理</h3>
    <button class="btn btn-primary" onclick={handleCreate}>
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
      新規アラート作成
    </button>
  </div>
  
  <!-- 統計情報 -->
  <div class="stats shadow w-full">
    <div class="stat">
      <div class="stat-title">総アラート数</div>
      <div class="stat-value text-primary">{alerts.length}</div>
    </div>
    <div class="stat">
      <div class="stat-title">アクティブ</div>
      <div class="stat-value text-success">{alerts.filter(a => a.isActive).length}</div>
    </div>
    <div class="stat">
      <div class="stat-title">発動中</div>
      <div class="stat-value text-warning">{alerts.filter(a => a.lastTriggered).length}</div>
    </div>
  </div>
  
  <!-- タブ -->
  <div class="tabs tabs-boxed">
    <button 
      class="tab {selectedTab === 'active' ? 'tab-active' : ''}"
      onclick={() => selectedTab = 'active'}
    >
      アクティブ
    </button>
    <button 
      class="tab {selectedTab === 'triggered' ? 'tab-active' : ''}"
      onclick={() => selectedTab = 'triggered'}
    >
      発動中
    </button>
    <button 
      class="tab {selectedTab === 'all' ? 'tab-active' : ''}"
      onclick={() => selectedTab = 'all'}
    >
      すべて
    </button>
  </div>
  
  <!-- アラート一覧 -->
  <div class="space-y-3">
    {#if filteredAlerts.length === 0}
      <div class="text-center py-8 text-base-content/60">
        {selectedTab === 'active' ? 'アクティブな' : selectedTab === 'triggered' ? '発動中の' : ''}アラートはありません
      </div>
    {:else}
      {#each filteredAlerts as alert}
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-4">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <div class={`p-2 rounded-full bg-base-200 ${getAlertColor(alert.alertType)}`}>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getAlertIcon(alert.alertType)}></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-semibold">{alertTypes.find(t => t.value === alert.alertType)?.label}</h4>
                    <p class="text-sm text-base-content/70">{getProductName(alert.productId)}</p>
                  </div>
                  <div class="flex gap-2">
                    {#if alert.isActive}
                      <span class="badge badge-success badge-sm">アクティブ</span>
                    {:else}
                      <span class="badge badge-ghost badge-sm">無効</span>
                    {/if}
                    {#if alert.lastTriggered}
                      <span class="badge badge-warning badge-sm">発動中</span>
                    {/if}
                  </div>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="text-base-content/70">閾値:</span>
                    <span class="ml-2 font-medium">{alert.threshold} {alert.thresholdUnit}</span>
                  </div>
                  <div>
                    <span class="text-base-content/70">対象倉庫:</span>
                    <span class="ml-2">{getWarehouseName(alert.warehouseId)}</span>
                  </div>
                  <div>
                    <span class="text-base-content/70">通知方法:</span>
                    <span class="ml-2">{alert.notificationChannels.length}個</span>
                  </div>
                  <div>
                    <span class="text-base-content/70">最終発動:</span>
                    <span class="ml-2">
                      {alert.lastTriggered 
                        ? new Date(alert.lastTriggered).toLocaleDateString('ja-JP')
                        : '未発動'
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="flex gap-2">
                <button 
                  class="btn btn-ghost btn-sm"
                  onclick={() => toggleAlert(alert)}
                  title={alert.isActive ? '無効にする' : '有効にする'}
                >
                  {#if alert.isActive}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 18M5.636 5.636L6 6"></path>
                    </svg>
                  {:else}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.343 15.657l9.193 9.193a1 1 0 001.414 0l9.193-9.193a1 1 0 000-1.414L14.95 5.05a1 1 0 00-1.414 0L4.343 14.243a1 1 0 000 1.414z"></path>
                    </svg>
                  {/if}
                </button>
                <button 
                  class="btn btn-ghost btn-sm"
                  onclick={() => handleEdit(alert)}
                  title="編集"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button 
                  class="btn btn-ghost btn-sm text-error"
                  onclick={() => handleDelete(alert)}
                  title="削除"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<!-- アラート作成/編集モーダル -->
<dialog class="modal" class:modal-open={showCreateModal}>
  <div class="modal-box w-11/12 max-w-2xl">
    <h3 class="font-bold text-lg mb-4">
      {editingAlert ? 'アラート編集' : '新規アラート作成'}
    </h3>
    
    <form onsubmit={(e) => { e.preventDefault(); handleSave(); }}>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 商品選択 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">対象商品 <span class="text-error">*</span></span>
          </label>
          <select 
            class="select select-bordered" 
            bind:value={formData.productId}
            required
          >
            <option value="">商品を選択してください</option>
            {#each products as product}
              <option value={product.id}>
                {product.name} ({product.sku})
              </option>
            {/each}
          </select>
        </div>
        
        <!-- 倉庫選択 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">対象倉庫</span>
          </label>
          <select 
            class="select select-bordered" 
            bind:value={formData.warehouseId}
          >
            <option value="">全倉庫</option>
            {#each warehouses as warehouse}
              <option value={warehouse.id}>{warehouse.name}</option>
            {/each}
          </select>
        </div>
        
        <!-- アラートタイプ -->
        <div class="form-control md:col-span-2">
          <label class="label">
            <span class="label-text">アラートタイプ <span class="text-error">*</span></span>
          </label>
          <select 
            class="select select-bordered" 
            bind:value={formData.alertType}
            required
          >
            {#each alertTypes as type}
              <option value={type.value}>
                {type.label} - {type.description}
              </option>
            {/each}
          </select>
        </div>
        
        <!-- 閾値 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">閾値 <span class="text-error">*</span></span>
          </label>
          <div class="join">
            <input 
              type="number" 
              class="input input-bordered join-item flex-1" 
              bind:value={formData.threshold}
              min="1"
              required
            />
            <input 
              type="text" 
              class="input input-bordered join-item w-20" 
              bind:value={formData.thresholdUnit}
              placeholder="単位"
            />
          </div>
        </div>
        
        <!-- 有効/無効 -->
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">アラートを有効にする</span>
            <input 
              type="checkbox" 
              class="toggle toggle-primary"
              bind:checked={formData.isActive}
            />
          </label>
        </div>
      </div>
      
      <!-- 通知チャンネル -->
      <div class="form-control mt-4">
        <label class="label">
          <span class="label-text">通知方法</span>
        </label>
        <div class="flex flex-wrap gap-2">
          {#each notificationChannels as channel}
            <label class="cursor-pointer">
              <input 
                type="checkbox" 
                class="checkbox checkbox-primary checkbox-sm mr-2"
                checked={formData.notificationChannels.includes(channel.value as any)}
                onchange={() => toggleNotificationChannel(channel.value)}
              />
              <span class="label-text">{channel.label}</span>
            </label>
          {/each}
        </div>
      </div>
      
      <!-- メール通知設定 -->
      {#if formData.notificationChannels.includes('email')}
        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text">通知先メールアドレス</span>
            <button 
              type="button"
              class="btn btn-ghost btn-xs"
              onclick={addEmailField}
            >
              追加
            </button>
          </label>
          <div class="space-y-2">
            {#each formData.notificationEmails as email, index}
              <div class="join w-full">
                <input 
                  type="email" 
                  class="input input-bordered join-item flex-1"
                  bind:value={formData.notificationEmails[index]}
                  placeholder="email@example.com"
                />
                {#if formData.notificationEmails.length > 1}
                  <button 
                    type="button"
                    class="btn btn-outline join-item"
                    onclick={() => removeEmailField(index)}
                  >
                    削除
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}
      
      <!-- アクションボタン -->
      <div class="modal-action">
        <button type="button" class="btn" onclick={() => showCreateModal = false}>
          キャンセル
        </button>
        <button type="submit" class="btn btn-primary">
          {editingAlert ? '更新' : '作成'}
        </button>
      </div>
    </form>
  </div>
  
  <form method="dialog" class="modal-backdrop">
    <button onclick={() => showCreateModal = false}>close</button>
  </form>
</dialog>