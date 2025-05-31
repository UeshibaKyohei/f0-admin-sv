<script lang="ts">
  import { fade } from 'svelte/transition';
  
  let { show = false, batchId = '', stepId = '', onClose = () => {}, onRegister = () => {} }: { 
    show: boolean, 
    batchId: string, 
    stepId: string,
    onClose: () => void, 
    onRegister: (alert: any) => void 
  } = $props();
  
  let alertType = $state('manual');
  let severity = $state('warning');
  let description = $state('');
  let value = $state('');
  let unit = $state('');
  let threshold = $state('');
  
  // アラートタイプの選択肢
  const alertTypes = [
    { value: 'manual', label: '手動検査' },
    { value: 'quality', label: '品質異常' },
    { value: 'equipment', label: '設備異常' },
    { value: 'material', label: '材料異常' },
    { value: 'process', label: 'プロセス異常' },
    { value: 'other', label: 'その他' }
  ];
  
  function handleRegister() {
    if (!description.trim()) return;
    
    const alert = {
      id: `ANOM-${Date.now()}`,
      batchId,
      stepId,
      timestamp: new Date().toISOString(),
      type: alertType,
      severity,
      description: description.trim(),
      value: value || null,
      threshold: threshold || null,
      unit: unit || null,
      resolved: false,
      resolvedBy: null,
      resolvedAt: null,
      action: null,
      registeredBy: '現在のユーザー',
      isManual: true
    };
    
    onRegister(alert);
    resetForm();
    onClose();
  }
  
  function resetForm() {
    alertType = 'manual';
    severity = 'warning';
    description = '';
    value = '';
    unit = '';
    threshold = '';
  }
</script>

{#if show}
  <dialog class="modal modal-open" transition:fade={{ duration: 200 }}>
    <div class="modal-box max-w-2xl">
      <h3 class="font-bold text-lg mb-4">アラート登録</h3>
      
      <form onsubmit={(e) => {
        e.preventDefault();
        handleRegister();
      }}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- アラートタイプ -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">アラートタイプ</span>
            </label>
            <select class="select select-bordered w-full" bind:value={alertType}>
              {#each alertTypes as type}
                <option value={type.value}>{type.label}</option>
              {/each}
            </select>
          </div>
          
          <!-- 重要度 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">重要度</span>
            </label>
            <select class="select select-bordered w-full" bind:value={severity}>
              <option value="critical">重大</option>
              <option value="warning">警告</option>
              <option value="info">情報</option>
            </select>
          </div>
          
          <!-- 説明 -->
          <div class="form-control col-span-full">
            <label class="label">
              <span class="label-text">異常内容の説明 <span class="text-error">*</span></span>
            </label>
            <textarea 
              class="textarea textarea-bordered w-full" 
              placeholder="発見した異常の詳細を記入してください..."
              rows="3"
              bind:value={description}
              required
            ></textarea>
          </div>
          
          <!-- 測定値（オプション） -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">測定値（任意）</span>
            </label>
            <input 
              type="text" 
              class="input input-bordered w-full" 
              placeholder="例: 105"
              bind:value={value}
            />
          </div>
          
          <!-- 単位（オプション） -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">単位（任意）</span>
            </label>
            <input 
              type="text" 
              class="input input-bordered w-full" 
              placeholder="例: ℃, mm, %"
              bind:value={unit}
            />
          </div>
          
          <!-- 閾値（オプション） -->
          <div class="form-control col-span-full">
            <label class="label">
              <span class="label-text">基準値・閾値（任意）</span>
            </label>
            <input 
              type="text" 
              class="input input-bordered w-full" 
              placeholder="例: 100"
              bind:value={threshold}
            />
          </div>
        </div>
        
        <!-- 登録情報 -->
        <div class="alert alert-info mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p class="text-sm">バッチID: {batchId}</p>
            {#if stepId}
              <p class="text-sm">工程ID: {stepId}</p>
            {/if}
            <p class="text-sm">登録者: 現在のユーザー</p>
          </div>
        </div>
        
        <div class="modal-action">
          <button type="button" class="btn" onclick={onClose}>キャンセル</button>
          <button 
            type="submit" 
            class="btn btn-primary"
            disabled={!description.trim()}
          >
            アラートを登録
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button onclick={onClose}>close</button>
    </form>
  </dialog>
{/if}