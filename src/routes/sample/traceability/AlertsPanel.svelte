<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  
  let { alerts = [], onAlertClick = () => {}, onAlertEdit = () => {} } = $props();
  
  let showResolved = $state(false);
  let sortBy = $state('timestamp');
  let filterSeverity = $state('all');
  
  // 統計情報の計算
  const alertStats = $derived({
    total: alerts.length,
    resolved: alerts.filter(a => a.resolved).length,
    unresolved: alerts.filter(a => !a.resolved).length,
    unresolvedBySeverity: {
      critical: alerts.filter(a => a.severity === 'critical' && !a.resolved).length,
      warning: alerts.filter(a => a.severity === 'warning' && !a.resolved).length,
      info: alerts.filter(a => a.severity === 'info' && !a.resolved).length
    }
  });
  
  // フィルタリングとソート
  const processedAlerts = $derived((() => {
    let filtered = alerts;
    
    // 解決済みフィルタ
    if (!showResolved) {
      filtered = filtered.filter(a => !a.resolved);
    }
    
    // 重要度フィルタ
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(a => a.severity === filterSeverity);
    }
    
    // ソート
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'timestamp':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'severity':
          const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        default:
          return 0;
      }
    });
  })());
  
  // アラートアイコン取得
  function getAlertIcon(type: string) {
    switch (type) {
      case 'temperature':
        return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>`;
      case 'dimension':
        return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>`;
      case 'pressure':
        return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`;
      default:
        return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>`;
    }
  }
  
  // 時間フォーマット
  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) {
      return '1分前';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}時間前`;
    } else {
      return date.toLocaleDateString('ja-JP');
    }
  }
  
  // アラートタイプの日本語表記
  const alertTypeLabels: Record<string, string> = {
    temperature: '温度異常',
    dimension: '寸法誤差',
    pressure: '圧力異常',
    vibration: '振動異常',
    manual: '手動検査',
    quality: '品質異常',
    equipment: '設備異常',
    material: '材料異常',
    process: 'プロセス異常',
    other: 'その他'
  };
</script>

<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <div class="flex justify-between items-center mb-4">
      <h3 class="card-title">
        アラート・異常検知
        {#if alertStats.unresolved > 0}
          <span class="badge badge-error ml-2">
            {alertStats.unresolved}
          </span>
        {/if}
      </h3>
      
      <div class="flex gap-2">
        <select class="select select-sm select-bordered" bind:value={filterSeverity}>
          <option value="all">すべて</option>
          <option value="critical">重大</option>
          <option value="warning">警告</option>
          <option value="info">情報</option>
        </select>
        
        <select class="select select-sm select-bordered" bind:value={sortBy}>
          <option value="timestamp">発生時刻順</option>
          <option value="severity">重要度順</option>
        </select>
        
        <label class="label cursor-pointer gap-2">
          <input 
            type="checkbox" 
            class="toggle toggle-sm"
            bind:checked={showResolved}
          />
          <span class="label-text">解決済みを表示</span>
        </label>
      </div>
    </div>
    
    {#if processedAlerts.length === 0}
      <div class="text-center py-8 opacity-50">
        <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p>現在、アラートはありません</p>
      </div>
    {:else}
      <div class="space-y-3 max-h-96 overflow-y-auto">
        {#each processedAlerts as alert (alert.id)}
          <div 
            class="alert cursor-pointer transition-all duration-200 relative"
            class:alert-error={alert.severity === 'critical' && !alert.resolved}
            class:alert-warning={alert.severity === 'warning' && !alert.resolved}
            class:alert-info={alert.severity === 'info' || alert.resolved}
            onclick={() => onAlertClick(alert)}
            animate:flip={{ duration: 300 }}
            transition:slide={{ duration: 200 }}
          >
            <div class="flex-1">
              <div class="flex items-start gap-3">
                <div>{@html getAlertIcon(alert.type)}</div>
                
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h4 class="font-semibold">
                      {alertTypeLabels[alert.type] || alert.type}
                    </h4>
                    <span class="badge badge-xs"
                          class:badge-error={alert.severity === 'critical'}
                          class:badge-warning={alert.severity === 'warning'}
                          class:badge-info={alert.severity === 'info'}>
                      {alert.severity === 'critical' ? '重大' : 
                       alert.severity === 'warning' ? '警告' : '情報'}
                    </span>
                    {#if alert.resolved}
                      <span class="badge badge-success badge-xs">解決済み</span>
                    {/if}
                    {#if alert.isManual}
                      <span class="badge badge-neutral badge-xs">手動登録</span>
                    {/if}
                  </div>
                  
                  <p class="text-sm opacity-90">{alert.description}</p>
                  
                  <div class="flex gap-4 mt-2 text-xs opacity-70">
                    <span>発生: {formatTime(alert.timestamp)}</span>
                    {#if alert.value !== null && alert.value !== undefined}
                      <span>測定値: {alert.value}{alert.unit || ''} 
                        {#if alert.threshold !== null && alert.threshold !== undefined}
                          (閾値: {alert.threshold}{alert.unit || ''})
                        {/if}
                      </span>
                    {/if}
                    {#if alert.registeredBy}
                      <span>登録者: {alert.registeredBy}</span>
                    {/if}
                  </div>
                  
                  {#if alert.resolved}
                    <div class="mt-2 p-2 bg-base-200 rounded text-sm">
                      <p class="font-semibold text-base-content">対応内容:</p>
                      <p class="text-base-content">{alert.action}</p>
                      <p class="text-xs mt-1 text-base-content/70">
                        対応者: {alert.resolvedBy} | 解決時刻: {formatTime(alert.resolvedAt)}
                      </p>
                    </div>
                  {/if}
                </div>
                
                <div class="flex flex-col items-end gap-2">
                  {#if !alert.resolved}
                    <div class="badge badge-error badge-outline animate-pulse">
                      要対応
                    </div>
                  {/if}
                </div>
              </div>
            </div>
            
            {#if !alert.resolved}
              <button 
                class="btn btn-sm btn-circle btn-warning absolute bottom-2 right-2"
                onclick={(e) => { e.stopPropagation(); onAlertEdit(alert); }}
                title="編集"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
    
    <!-- サマリー統計 -->
    {#if alerts.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <!-- 概要統計 -->
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">総アラート数</div>
            <div class="stat-value text-lg">{alertStats.total}</div>
            <div class="stat-desc">
              解決済み: {alertStats.resolved} / 未解決: {alertStats.unresolved}
            </div>
          </div>
        </div>
        
        <!-- 重大度別統計 -->
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">重大度別（未解決）</div>
            <div class="space-y-1">
              <div class="flex justify-between items-center">
                <span class="text-error font-semibold">重大</span>
                <span class="badge badge-error">{alertStats.unresolvedBySeverity.critical}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-warning font-semibold">警告</span>
                <span class="badge badge-warning">{alertStats.unresolvedBySeverity.warning}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-info font-semibold">情報</span>
                <span class="badge badge-info">{alertStats.unresolvedBySeverity.info}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>