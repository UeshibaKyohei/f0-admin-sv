<script lang="ts">
  import { fade } from 'svelte/transition';
  import { statusDefinitions } from './mockData.js';
  
  let { data = null, workLogs = [], onClose = () => {}, onAddComment = () => {}, onResolveAlert = () => {} }: { data: any, workLogs: any[], onClose: () => void, onAddComment: (comment: any) => void, onResolveAlert: (alertId: string, resolution: string) => void } = $props();
  
  let activeTab = $state('info');
  let newComment = $state('');
  let resolutionText = $state('');
  let localWorkLogs = $state([...workLogs]);
  
  // データに関連するログを取得
  const relatedLogs = $derived(
    !data ? [] : localWorkLogs.filter(log => 
      (data.batchId && log.batchId === data.batchId) ||
      (data.stepId && log.stepId === data.stepId)
    )
  );
  
  // workLogsが更新されたら反映
  $effect(() => {
    localWorkLogs = [...workLogs];
  });
  
  // データタイプを判定
  const dataType = $derived(
    !data ? null :
    data.severity ? 'alert' :
    (data.stepId || data.department) ? 'step' :
    data.productName ? 'batch' : 'unknown'
  );
  
  // モーダルタイトル
  const modalTitle = $derived(
    dataType === 'alert' ? 'アラート詳細' :
    dataType === 'step' ? '工程詳細' :
    dataType === 'batch' ? 'バッチ詳細' : '詳細情報'
  );
  
  // コメント追加
  function addComment() {
    if (!newComment.trim()) return;
    
    const comment = {
      id: `LOG-${Date.now()}`,
      batchId: data?.batchId,
      stepId: data?.stepId || data?.id,
      timestamp: new Date().toISOString(),
      type: 'comment',
      operator: '現在のユーザー',
      content: newComment
    };
    
    localWorkLogs = [...localWorkLogs, comment];
    onAddComment(comment);
    newComment = '';
  }
  
  // アラート解決
  function resolveAlert() {
    if (!resolutionText.trim() || dataType !== 'alert' || data?.resolved) return;
    
    onResolveAlert(data.id, resolutionText);
    resolutionText = '';
  }
  
  // 時間フォーマット
  function formatDateTime(timestamp: string | null) {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('ja-JP');
  }
</script>

{#if data}
  <dialog class="modal modal-open" transition:fade={{ duration: 200 }}>
    <div class="modal-box max-w-4xl">
      <h3 class="font-bold text-lg mb-4">{modalTitle}</h3>
      
      <!-- タブ -->
      <div class="tabs tabs-boxed mb-4">
        <button 
          class="tab"
          class:tab-active={activeTab === 'info'}
          onclick={() => activeTab = 'info'}
        >
          基本情報
        </button>
        <button 
          class="tab"
          class:tab-active={activeTab === 'history'}
          onclick={() => activeTab = 'history'}
        >
          履歴
        </button>
        <button 
          class="tab"
          class:tab-active={activeTab === 'comments'}
          onclick={() => activeTab = 'comments'}
        >
          コメント ({relatedLogs.filter(l => l.type === 'comment').length})
        </button>
        {#if dataType === 'alert'}
          <button 
            class="tab"
            class:tab-active={activeTab === 'analysis'}
            onclick={() => activeTab = 'analysis'}
          >
            分析
          </button>
        {/if}
      </div>
      
      <!-- タブコンテンツ -->
      <div class="min-h-[400px]">
        {#if activeTab === 'info'}
          <div class="space-y-4">
            {#if dataType === 'alert'}
              <!-- アラート情報 -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="label">
                    <span class="label-text">アラートID</span>
                  </label>
                  <input type="text" value={data.id} class="input input-bordered w-full" readonly />
                </div>
                <div>
                  <label class="label">
                    <span class="label-text">重要度</span>
                  </label>
                  <div class="flex items-center gap-2">
                    <span class="badge"
                          class:badge-error={data.severity === 'critical'}
                          class:badge-warning={data.severity === 'warning'}
                          class:badge-info={data.severity === 'info'}>
                      {data.severity === 'critical' ? '重大' : 
                       data.severity === 'warning' ? '警告' : '情報'}
                    </span>
                    {#if data.resolved}
                      <span class="badge badge-success">解決済み</span>
                    {:else}
                      <span class="badge badge-error badge-outline">未解決</span>
                    {/if}
                  </div>
                </div>
                <div>
                  <label class="label">
                    <span class="label-text">発生時刻</span>
                  </label>
                  <input type="text" value={formatDateTime(data.timestamp)} class="input input-bordered w-full" readonly />
                </div>
                <div>
                  <label class="label">
                    <span class="label-text">アラートタイプ</span>
                  </label>
                  <input type="text" value={data.type} class="input input-bordered w-full" readonly />
                </div>
                <div class="col-span-2">
                  <label class="label">
                    <span class="label-text">説明</span>
                  </label>
                  <textarea value={data.description} class="textarea textarea-bordered w-full" rows="2" readonly></textarea>
                </div>
                <div>
                  <label class="label">
                    <span class="label-text">測定値</span>
                  </label>
                  <div class="input input-bordered flex items-center">
                    <span class="font-semibold text-error">{data.value}</span>
                    <span class="ml-1">{data.unit}</span>
                  </div>
                </div>
                <div>
                  <label class="label">
                    <span class="label-text">閾値</span>
                  </label>
                  <div class="input input-bordered flex items-center">
                    <span>{data.threshold}</span>
                    <span class="ml-1">{data.unit}</span>
                  </div>
                </div>
                {#if data.resolved}
                  <div class="col-span-2">
                    <label class="label">
                      <span class="label-text">対応内容</span>
                    </label>
                    <textarea value={data.action} class="textarea textarea-bordered w-full" rows="3" readonly></textarea>
                  </div>
                  <div>
                    <label class="label">
                      <span class="label-text">対応者</span>
                    </label>
                    <input type="text" value={data.resolvedBy} class="input input-bordered w-full" readonly />
                  </div>
                  <div>
                    <label class="label">
                      <span class="label-text">解決時刻</span>
                    </label>
                    <input type="text" value={formatDateTime(data.resolvedAt)} class="input input-bordered w-full" readonly />
                  </div>
                {:else}
                  <!-- 未解決の場合の解決フォーム -->
                  <div class="col-span-2">
                    <div class="divider">アラート解決</div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">対応内容</span>
                      </label>
                      <textarea 
                        class="textarea textarea-bordered w-full" 
                        placeholder="対応内容を入力してください..."
                        rows="3"
                        bind:value={resolutionText}
                      ></textarea>
                    </div>
                    <button 
                      class="btn btn-primary mt-4"
                      onclick={resolveAlert}
                      disabled={!resolutionText.trim()}
                    >
                      アラートを解決済みにする
                    </button>
                  </div>
                {/if}
              </div>
              
            {:else if dataType === 'step'}
              <!-- 工程情報 -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="label">
                    <span class="label-text">工程名</span>
                  </label>
                  <input type="text" value={data.name} class="input input-bordered w-full" readonly />
                </div>
                <div>
                  <label class="label">
                    <span class="label-text">担当部署</span>
                  </label>
                  <input type="text" value={data.department} class="input input-bordered w-full" readonly />
                </div>
                <div>
                  <label class="label">
                    <span class="label-text">標準作業時間</span>
                  </label>
                  <input type="text" value="{data.duration}分" class="input input-bordered w-full" readonly />
                </div>
                <div>
                  <label class="label">
                    <span class="label-text">ステータス</span>
                  </label>
                  <div class="flex items-center">
                    <span class="badge"
                          class:badge-success={data.status === 'completed'}
                          class:badge-primary={data.status === 'in_progress'}
                          class:badge-neutral={data.status === 'pending'}>
                      {statusDefinitions[data.status as keyof typeof statusDefinitions]?.label || data.status}
                    </span>
                  </div>
                </div>
                {#if data.startTime}
                  <div>
                    <label class="label">
                      <span class="label-text">開始時刻</span>
                    </label>
                    <input type="text" value={formatDateTime(data.startTime)} class="input input-bordered w-full" readonly />
                  </div>
                  <div>
                    <label class="label">
                      <span class="label-text">終了時刻</span>
                    </label>
                    <input type="text" value={formatDateTime(data.endTime)} class="input input-bordered w-full" readonly />
                  </div>
                  <div>
                    <label class="label">
                      <span class="label-text">作業者</span>
                    </label>
                    <input type="text" value={data.operator || '-'} class="input input-bordered w-full" readonly />
                  </div>
                  <div>
                    <label class="label">
                      <span class="label-text">進捗</span>
                    </label>
                    <div class="flex items-center gap-2">
                      <progress 
                        class="progress progress-primary flex-1" 
                        value={data.progress || (data.status === 'completed' ? 100 : 0)} 
                        max="100"
                      ></progress>
                      <span>{data.progress || (data.status === 'completed' ? 100 : 0)}%</span>
                    </div>
                  </div>
                {/if}
              </div>
            {/if}
          </div>
          
        {:else if activeTab === 'history'}
          <div class="space-y-3">
            {#if relatedLogs.length === 0}
              <div class="text-center py-8 opacity-50">
                <p>履歴情報はありません</p>
              </div>
            {:else}
              {#each relatedLogs as log}
                <div class="chat" class:chat-start={log.type === 'system'} class:chat-end={log.type !== 'system'}>
                  <div class="chat-image avatar">
                    <div class="w-10 h-10 rounded-full bg-base-300">
                      <div class="flex items-center justify-center w-full h-full">
                        {#if log.type === 'comment'}
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                          </svg>
                        {:else if log.type === 'issue'}
                          <svg class="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                          </svg>
                        {:else}
                          <svg class="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        {/if}
                      </div>
                    </div>
                  </div>
                  <div class="chat-header">
                    {log.operator}
                    <time class="text-xs opacity-50 ml-2">{formatDateTime(log.timestamp)}</time>
                  </div>
                  <div class="chat-bubble"
                       class:chat-bubble-error={log.type === 'issue'}
                       class:chat-bubble-success={log.type === 'quality'}>
                    {log.content}
                  </div>
                </div>
              {/each}
            {/if}
          </div>
          
        {:else if activeTab === 'comments'}
          <div class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">新しいコメントを追加</span>
              </label>
              <div class="flex gap-2">
                <textarea 
                  class="textarea textarea-bordered flex-1" 
                  placeholder="コメントを入力してください..."
                  rows="3"
                  bind:value={newComment}
                ></textarea>
                <button 
                  class="btn btn-primary"
                  onclick={addComment}
                  disabled={!newComment.trim()}
                >
                  送信
                </button>
              </div>
            </div>
            
            <div class="divider">コメント履歴</div>
            
            <div class="space-y-3 max-h-80 overflow-y-auto">
              {#each relatedLogs.filter(l => l.type === 'comment') as comment}
                <div class="card bg-base-200">
                  <div class="card-body p-4">
                    <div class="flex justify-between items-start">
                      <div>
                        <p class="font-semibold">{comment.operator}</p>
                        <p class="text-sm opacity-70">{formatDateTime(comment.timestamp)}</p>
                      </div>
                    </div>
                    <p class="mt-2">{comment.content}</p>
                  </div>
                </div>
              {:else}
                <div class="text-center py-4 opacity-50">
                  <p>まだコメントがありません</p>
                </div>
              {/each}
            </div>
          </div>
          
        {:else if activeTab === 'analysis' && dataType === 'alert'}
          <div class="space-y-4">
            <div class="stats shadow w-full">
              <div class="stat">
                <div class="stat-title">超過率</div>
                <div class="stat-value text-error">
                  {Math.round((data.value / data.threshold - 1) * 100)}%
                </div>
                <div class="stat-desc">閾値からの超過</div>
              </div>
              
              <div class="stat">
                <div class="stat-title">継続時間</div>
                <div class="stat-value">
                  {data.resolved ? 
                    Math.round((new Date(data.resolvedAt).getTime() - new Date(data.timestamp).getTime()) / 60000) : 
                    Math.round((new Date().getTime() - new Date(data.timestamp).getTime()) / 60000)}分
                </div>
                <div class="stat-desc">
                  {data.resolved ? '解決までの時間' : '発生からの経過時間'}
                </div>
              </div>
            </div>
            
            <!-- 簡易的なグラフ表示 -->
            <div class="card bg-base-200">
              <div class="card-body">
                <h4 class="card-title text-sm">推移グラフ（仮）</h4>
                <div class="h-40 flex items-end gap-2">
                  {#each Array(10) as _, i}
                    <div 
                      class="flex-1 bg-primary rounded-t"
                      style="height: {Math.random() * 100}%"
                    ></div>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>
      
      <div class="modal-action">
        <button class="btn" onclick={onClose}>閉じる</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button onclick={onClose}>close</button>
    </form>
  </dialog>
{/if}