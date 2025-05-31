<script lang="ts">
  import { fade } from 'svelte/transition';
  
  let { show = false, alert = null, onClose = () => {}, onUpdate = () => {} } = $props();
  
  // フォームデータ
  let formData = $state({
    description: '',
    severity: 'warning',
    type: 'manual',
    value: null,
    unit: '',
    threshold: null
  });
  
  // アラートタイプの選択肢
  const alertTypes = [
    { value: 'temperature', label: '温度異常' },
    { value: 'dimension', label: '寸法誤差' },
    { value: 'pressure', label: '圧力異常' },
    { value: 'vibration', label: '振動異常' },
    { value: 'manual', label: '手動検査' },
    { value: 'quality', label: '品質異常' },
    { value: 'equipment', label: '設備異常' },
    { value: 'material', label: '材料異常' },
    { value: 'process', label: 'プロセス異常' },
    { value: 'other', label: 'その他' }
  ];
  
  // アラートが変更されたらフォームデータを更新
  $effect(() => {
    if (alert) {
      formData = {
        description: alert.description || '',
        severity: alert.severity || 'warning',
        type: alert.type || 'manual',
        value: alert.value || null,
        unit: alert.unit || '',
        threshold: alert.threshold || null
      };
    }
  });
  
  function handleSubmit() {
    if (!formData.description.trim()) {
      alert('説明を入力してください');
      return;
    }
    
    const updatedAlert = {
      ...alert,
      ...formData,
      updatedAt: new Date().toISOString(),
      updatedBy: '現在のユーザー'
    };
    
    onUpdate(updatedAlert);
    onClose();
  }
  
  function handleCancel() {
    onClose();
  }
</script>

{#if show}
  <div class="modal modal-open" transition:fade={{ duration: 200 }}>
    <div class="modal-box max-w-2xl">
      <h3 class="font-bold text-lg mb-4">アラート編集</h3>
      
      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div class="space-y-4">
          <!-- アラートタイプ -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">アラートタイプ</span>
            </label>
            <select 
              class="select select-bordered w-full"
              bind:value={formData.type}
              disabled={!alert?.isManual}
            >
              {#each alertTypes as type}
                <option value={type.value}>{type.label}</option>
              {/each}
            </select>
            {#if !alert?.isManual}
              <label class="label">
                <span class="label-text-alt text-warning">システム検知のアラートタイプは変更できません</span>
              </label>
            {/if}
          </div>
          
          <!-- 重要度 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">重要度</span>
            </label>
            <div class="flex gap-4">
              <label class="label cursor-pointer">
                <input 
                  type="radio" 
                  name="severity" 
                  class="radio radio-error" 
                  value="critical"
                  bind:group={formData.severity}
                />
                <span class="label-text ml-2">重大</span>
              </label>
              <label class="label cursor-pointer">
                <input 
                  type="radio" 
                  name="severity" 
                  class="radio radio-warning" 
                  value="warning"
                  bind:group={formData.severity}
                />
                <span class="label-text ml-2">警告</span>
              </label>
              <label class="label cursor-pointer">
                <input 
                  type="radio" 
                  name="severity" 
                  class="radio radio-info" 
                  value="info"
                  bind:group={formData.severity}
                />
                <span class="label-text ml-2">情報</span>
              </label>
            </div>
          </div>
          
          <!-- 説明 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">説明 <span class="text-error">*</span></span>
            </label>
            <textarea 
              class="textarea textarea-bordered w-full"
              rows="3"
              placeholder="アラートの詳細な説明を入力してください"
              bind:value={formData.description}
              required
            ></textarea>
          </div>
          
          <!-- 測定値（オプション） -->
          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">測定値</span>
              </label>
              <input 
                type="number" 
                class="input input-bordered w-full"
                placeholder="例: 85.5"
                bind:value={formData.value}
                step="0.1"
              />
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">単位</span>
              </label>
              <input 
                type="text" 
                class="input input-bordered w-full"
                placeholder="例: °C, mm, MPa"
                bind:value={formData.unit}
              />
            </div>
          </div>
          
          <!-- 閾値（オプション） -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">閾値</span>
            </label>
            <input 
              type="number" 
              class="input input-bordered w-full"
              placeholder="例: 80.0"
              bind:value={formData.threshold}
              step="0.1"
            />
          </div>
          
          {#if alert?.updatedAt}
            <div class="alert alert-info">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p class="text-sm">最終更新: {new Date(alert.updatedAt).toLocaleString('ja-JP')}</p>
                {#if alert.updatedBy}
                  <p class="text-sm">更新者: {alert.updatedBy}</p>
                {/if}
              </div>
            </div>
          {/if}
        </div>
        
        <div class="modal-action">
          <button type="button" class="btn" onclick={handleCancel}>
            キャンセル
          </button>
          <button type="submit" class="btn btn-primary">
            更新
          </button>
        </div>
      </form>
    </div>
    
    <form method="dialog" class="modal-backdrop" onclick={handleCancel}>
      <button>close</button>
    </form>
  </div>
{/if}