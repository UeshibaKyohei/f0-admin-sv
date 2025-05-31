<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fade, slide } from 'svelte/transition';
  import { statusDefinitions } from './mockData.js';
  
  let { processSteps = [], progress = [], onStepClick = () => {}, onAlertRegister = () => {} } = $props();
  
  let expandedSteps = $state<Record<string, boolean>>({});
  
  // 各ステップの状態と進捗を取得
  function getStepData(stepId: string) {
    const progressData = progress.find(p => p.stepId === stepId);
    const step = processSteps.find(s => s.id === stepId);
    return { ...step, ...progressData };
  }
  
  // ステップの展開/折りたたみ
  function toggleStep(stepId: string) {
    expandedSteps[stepId] = !expandedSteps[stepId];
  }
  
  // 時間のフォーマット
  function formatDateTime(timeString: string | null) {
    if (!timeString) return '未開始';
    const date = new Date(timeString);
    return date.toLocaleString('ja-JP', { 
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // 経過時間の計算
  function getElapsedTime(startTime: string | null, endTime: string | null) {
    if (!startTime) return '';
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000 / 60); // 分単位
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`;
  }
  
  // 時間差の計算（標準時間との比較）
  function getTimeDifference(standardMinutes: number, startTime: string | null, endTime: string | null) {
    if (!startTime) return null;
    const actualMinutes = Math.floor((new Date(endTime || new Date()).getTime() - new Date(startTime).getTime()) / 1000 / 60);
    const diff = actualMinutes - standardMinutes;
    const absDiff = Math.abs(diff);
    const hours = Math.floor(absDiff / 60);
    const minutes = absDiff % 60;
    const timeStr = hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`;
    
    return {
      isOver: diff > 0,
      timeStr,
      percentage: Math.round((actualMinutes / standardMinutes) * 100)
    };
  }
</script>

<div class="card bg-base-100 shadow-xl p-6">
  <h3 class="text-lg font-semibold mb-4">工程ステップ詳細</h3>
  
  <div class="space-y-2">
    {#each processSteps as step, index (step.id)}
      {@const stepData = getStepData(step.id)}
      {@const timeDiff = getTimeDifference(step.duration, stepData.startTime, stepData.endTime)}
      
      <div class="flex gap-4" animate:flip={{ duration: 300 }}>
        <!-- ステップインジケーター -->
        <div class="flex flex-col items-center">
          <div 
            class="w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300"
            class:bg-success={stepData.status === 'completed'}
            class:bg-primary={stepData.status === 'in_progress'}
            class:bg-base-300={stepData.status === 'pending'}
            class:text-white={stepData.status === 'completed' || stepData.status === 'in_progress'}
          >
            {#if stepData.status === 'completed'}
              ✓
            {:else if stepData.status === 'in_progress'}
              ▶
            {:else}
              {index + 1}
            {/if}
          </div>
          {#if index < processSteps.length - 1}
            <div 
              class="w-0.5 flex-1 mt-1 transition-all duration-300"
              class:bg-success={stepData.status === 'completed'}
              class:bg-primary={stepData.status === 'in_progress'}
              class:bg-base-300={stepData.status === 'pending'}
              class:min-h-[2rem]={!expandedSteps[step.id]}
              class:min-h-[10rem]={expandedSteps[step.id]}
            ></div>
          {/if}
        </div>
        
        <!-- ステップコンテンツ -->
        <div class="flex-1">
          <!-- ステップヘッダー -->
          <div 
            class="collapse collapse-arrow bg-base-200 mb-2"
            class:bg-success={stepData.status === 'completed'}
            class:bg-primary={stepData.status === 'in_progress'}
            class:text-base-content={stepData.status === 'pending'}
            class:text-white={stepData.status !== 'pending'}
          >
            <input 
              type="checkbox" 
              checked={expandedSteps[step.id]}
              onchange={() => toggleStep(step.id)}
            />
            
            <div class="collapse-title">
              <div class="flex justify-between items-center">
                <div>
                  <h4 class="font-bold text-lg">{step.name}</h4>
                  <p class="text-sm opacity-80">{step.department}</p>
                </div>
                <div class="text-right">
                  {#if stepData.status === 'completed'}
                    <div class="badge badge-success gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      完了
                    </div>
                  {:else if stepData.status === 'in_progress'}
                    <div class="badge badge-primary gap-2">
                      <span class="loading loading-spinner loading-xs"></span>
                      進行中 {stepData.progress || 0}%
                    </div>
                  {:else}
                    <div class="badge badge-neutral">待機中</div>
                  {/if}
                </div>
              </div>
              
              {#if stepData.startTime}
                <div class="flex gap-4 mt-2 text-sm">
                  <span>開始: {formatDateTime(stepData.startTime)}</span>
                  {#if stepData.endTime}
                    <span>完了: {formatDateTime(stepData.endTime)}</span>
                  {/if}
                  <span class="font-semibold">
                    実績: {getElapsedTime(stepData.startTime, stepData.endTime)}
                  </span>
                </div>
              {/if}
            </div>
            
            <div class="collapse-content">
              <div class="grid grid-cols-2 gap-4 pt-4">
                <!-- 左側: 基本情報 -->
                <div class="space-y-3">
                  <div>
                    <div class="text-sm opacity-70">標準作業時間</div>
                    <p class="font-semibold">{step.duration}分</p>
                  </div>
                  
                  {#if stepData.operator}
                    <div>
                      <div class="text-sm opacity-70">作業者</div>
                      <p class="font-semibold">{stepData.operator}</p>
                    </div>
                  {/if}
                  
                  {#if timeDiff}
                    <div>
                      <div class="text-sm opacity-70">時間効率</div>
                      <div class="flex items-center gap-2">
                        <progress 
                          class="progress w-24"
                          class:progress-success={timeDiff.percentage <= 100}
                          class:progress-warning={timeDiff.percentage > 100 && timeDiff.percentage <= 120}
                          class:progress-error={timeDiff.percentage > 120}
                          value={timeDiff.percentage} 
                          max="100"
                        ></progress>
                        <span class="text-sm font-semibold">{timeDiff.percentage}%</span>
                      </div>
                      {#if timeDiff.isOver}
                        <p class="text-sm text-error mt-1">
                          標準時間を{timeDiff.timeStr}超過
                        </p>
                      {:else}
                        <p class="text-sm text-success mt-1">
                          標準時間より{timeDiff.timeStr}短縮
                        </p>
                      {/if}
                    </div>
                  {/if}
                </div>
                
                <!-- 右側: 詳細アクション -->
                <div class="space-y-3">
                  {#if stepData.status === 'in_progress'}
                    <div>
                      <div class="text-sm opacity-70">進捗状況</div>
                      <div class="mt-2">
                        <progress 
                          class="progress progress-primary w-full" 
                          value={stepData.progress || 0} 
                          max="100"
                        ></progress>
                        <p class="text-sm mt-1">
                          現在 {stepData.progress || 0}% 完了
                        </p>
                      </div>
                    </div>
                  {/if}
                  
                  <div class="flex gap-2">
                    <button 
                      class="btn btn-sm btn-outline flex-1"
                      onclick={() => onStepClick(stepData)}
                    >
                      詳細を表示
                    </button>
                    <button 
                      class="btn btn-sm btn-warning"
                      onclick={() => onAlertRegister(step.id)}
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {#if stepData.status === 'in_progress'}
                <div class="alert alert-info mt-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>この工程は現在進行中です。リアルタイムで進捗が更新されます。</span>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
  
  <!-- サマリー統計 -->
  <div class="stats shadow w-full mt-6">
    <div class="stat">
      <div class="stat-figure text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <div class="stat-title">完了工程</div>
      <div class="stat-value text-primary">
        {progress.filter(p => p.status === 'completed').length}
      </div>
      <div class="stat-desc">全{processSteps.length}工程中</div>
    </div>
    
    <div class="stat">
      <div class="stat-figure text-secondary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <div class="stat-title">総作業時間</div>
      <div class="stat-value text-secondary">
        {(() => {
          const totalMinutes = progress
            .filter(p => p.startTime)
            .reduce((acc, p) => {
              const start = new Date(p.startTime);
              const end = p.endTime ? new Date(p.endTime) : new Date();
              return acc + Math.floor((end.getTime() - start.getTime()) / 1000 / 60);
            }, 0);
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          return `${hours}h ${minutes}m`;
        })()}
      </div>
      <div class="stat-desc">
        標準: {Math.floor(processSteps.reduce((acc, s) => acc + s.duration, 0) / 60)}h {processSteps.reduce((acc, s) => acc + s.duration, 0) % 60}m
      </div>
    </div>
    
    <div class="stat">
      <div class="stat-figure text-accent">
        <div class="radial-progress text-accent" style="--value:{Math.round((progress.filter(p => p.status === 'completed').length / processSteps.length) * 100)};">
          {Math.round((progress.filter(p => p.status === 'completed').length / processSteps.length) * 100)}%
        </div>
      </div>
      <div class="stat-title">進捗率</div>
      <div class="stat-value text-accent">
        {Math.round((progress.filter(p => p.status === 'completed').length / processSteps.length) * 100)}%
      </div>
      <div class="stat-desc">
        {progress.filter(p => p.status === 'in_progress').length > 0 ? '作業進行中' : ''}
      </div>
    </div>
  </div>
</div>