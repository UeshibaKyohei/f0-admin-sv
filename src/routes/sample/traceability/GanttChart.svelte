<script lang="ts">
  import { onMount } from 'svelte';
  import { statusDefinitions } from './mockData.js';
  
  let { batch = {}, processSteps = [], progress = [], onStepClick = () => {} } = $props();
  
  let chartContainer = $state();
  let currentTime = $state(new Date());
  let hoveredBar = $state(null);
  let zoomLevel = $state(1);
  let panOffset = $state(0);
  
  // チャートの時間範囲を計算
  const timeRange = $derived(() => {
    const start = new Date(batch.startDate);
    const end = new Date(batch.expectedEndDate);
    const now = new Date();
    
    // 実際の進捗も考慮
    const actualTimes = progress
      .filter(p => p.startTime)
      .map(p => ({
        start: new Date(p.startTime),
        end: p.endTime ? new Date(p.endTime) : now
      }));
    
    const minTime = new Date(Math.min(start.getTime(), ...actualTimes.map(t => t.start.getTime())));
    const maxTime = new Date(Math.max(end.getTime(), now.getTime(), ...actualTimes.map(t => t.end.getTime())));
    
    // バッファを追加
    const buffer = (maxTime.getTime() - minTime.getTime()) * 0.1;
    return {
      start: new Date(minTime.getTime() - buffer),
      end: new Date(maxTime.getTime() + buffer),
      duration: maxTime.getTime() - minTime.getTime() + buffer * 2
    };
  });
  
  // ピクセル変換関数
  function timeToPixel(time: string | Date) {
    const range = timeRange();
    const offset = (new Date(time).getTime() - range.start.getTime()) / range.duration;
    return offset * 1200 * zoomLevel + panOffset;
  }
  
  function pixelToTime(pixel: number) {
    const range = timeRange();
    const offset = (pixel - panOffset) / (1200 * zoomLevel);
    return new Date(range.start.getTime() + offset * range.duration);
  }
  
  // ガントバーのデータを計算
  function getBarData(step: any, progressData: any) {
    if (!progressData || !progressData.startTime) {
      // 未開始の場合は予定を表示
      const previousSteps = processSteps.slice(0, processSteps.indexOf(step));
      const estimatedStart = previousSteps.reduce((time, prevStep) => {
        return new Date(time.getTime() + prevStep.duration * 60 * 1000);
      }, new Date(batch.startDate));
      
      return {
        type: 'planned',
        left: timeToPixel(estimatedStart),
        width: (step.duration * 60 * 1000 / timeRange().duration) * 1200 * zoomLevel,
        color: 'bg-base-300',
        opacity: 'opacity-50'
      };
    }
    
    const startX = timeToPixel(progressData.startTime);
    const endTime = progressData.endTime || new Date();
    const endX = timeToPixel(endTime);
    
    return {
      type: 'actual',
      left: startX,
      width: endX - startX,
      color: progressData.status === 'completed' ? 'bg-success' : 'bg-primary',
      opacity: 'opacity-100',
      progress: progressData.progress
    };
  }
  
  // 現在時刻の更新
  onMount(() => {
    const interval = setInterval(() => {
      currentTime = new Date();
    }, 1000);
    
    return () => clearInterval(interval);
  });
  
  // パン・ズーム機能
  let isDragging = $state(false);
  let dragStartX = $state(0);
  let dragStartOffset = $state(0);
  
  function handleMouseDown(e: MouseEvent) {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartOffset = panOffset;
  }
  
  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    panOffset = dragStartOffset + (e.clientX - dragStartX);
  }
  
  function handleMouseUp() {
    isDragging = false;
  }
  
  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    zoomLevel = Math.max(0.5, Math.min(3, zoomLevel * delta));
  }
  
  // 時間フォーマット
  function formatTime(date: Date) {
    return date.toLocaleString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  function formatDuration(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}時間${mins}分` : `${mins}分`;
  }
</script>

<div class="card bg-base-100 shadow-xl p-6">
  <div class="flex justify-between items-center mb-4">
    <h3 class="text-lg font-semibold">ガントチャート</h3>
    <div class="flex gap-2">
      <button 
        class="btn btn-sm btn-outline"
        onclick={() => zoomLevel = Math.max(0.5, zoomLevel - 0.2)}
        aria-label="ズームアウト"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
        </svg>
      </button>
      <button 
        class="btn btn-sm btn-outline"
        onclick={() => zoomLevel = 1}
      >
        リセット
      </button>
      <button 
        class="btn btn-sm btn-outline"
        onclick={() => zoomLevel = Math.min(3, zoomLevel + 0.2)}
        aria-label="ズームイン"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
      </button>
    </div>
  </div>
  
  <!-- 凡例 -->
  <div class="flex gap-4 mb-4 text-sm">
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 bg-base-300 opacity-50 rounded"></div>
      <span>予定</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 bg-success rounded"></div>
      <span>完了</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 bg-primary rounded"></div>
      <span>進行中</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-1 h-4 bg-error"></div>
      <span>現在時刻</span>
    </div>
  </div>
  
  <div 
    class="overflow-hidden rounded-lg border border-base-300"
    bind:this={chartContainer}
    onmousedown={handleMouseDown}
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    onmouseleave={handleMouseUp}
    onwheel={handleWheel}
    role="application"
    aria-label="ガントチャート（ドラッグで移動、スクロールでズーム）"
    style="cursor: {isDragging ? 'grabbing' : 'grab'}"
  >
    <div class="relative" style="height: {processSteps.length * 60 + 100}px">
      <!-- 時間軸ヘッダー -->
      <div class="sticky top-0 z-20 bg-base-100 border-b border-base-300 h-12 flex items-center">
        <div class="w-48 px-4 font-semibold border-r border-base-300">工程名</div>
        <div class="flex-1 relative overflow-hidden">
          <div class="absolute flex" style="left: 0; width: {1200 * zoomLevel}px; transform: translateX({panOffset}px)">
            {#each Array(25) as _, i}
              {@const time = new Date(timeRange().start.getTime() + (timeRange().duration / 24) * i)}
              <div class="flex-1 text-center text-xs py-2 border-r border-base-200">
                {time.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                <br />
                {time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
              </div>
            {/each}
          </div>
        </div>
      </div>
      
      <!-- ガントチャート本体 -->
      <div class="relative">
        {#each processSteps as step, index}
          {@const progressData = progress.find(p => p.stepId === step.id)}
          {@const barData = getBarData(step, progressData)}
          
          <div class="flex h-12 border-b border-base-200 relative">
            <!-- 工程名 -->
            <div class="w-48 px-4 flex items-center border-r border-base-300 bg-base-50">
              <span class="truncate">{step.name}</span>
            </div>
            
            <!-- チャートエリア -->
            <div class="flex-1 relative overflow-hidden">
              <!-- グリッド線 -->
              <div class="absolute inset-0 flex" style="left: {panOffset}px; width: {1200 * zoomLevel}px">
                {#each Array(25) as _, i}
                  <div class="flex-1 border-r border-base-200"></div>
                {/each}
              </div>
              
              <!-- ガントバー -->
              <button
                class="absolute h-8 rounded cursor-pointer transition-all duration-200 flex items-center border-none {barData.color} {barData.opacity}"
                style="left: {barData.left}px; width: {barData.width}px; top: 8px"
                onmouseenter={() => hoveredBar = step.id}
                onmouseleave={() => hoveredBar = null}
                onclick={() => onStepClick({ ...step, ...progressData })}
                type="button"
                aria-label="{step.name} - クリックで詳細を表示"
              >
                {#if progressData?.status === 'in_progress' && progressData.progress}
                  <div 
                    class="absolute inset-0 bg-primary opacity-50 rounded"
                    style="width: {progressData.progress}%"
                  ></div>
                  <span class="relative text-xs text-white font-semibold px-2">
                    {progressData.progress}%
                  </span>
                {/if}
              </button>
              
              <!-- ホバー時の情報 -->
              {#if hoveredBar === step.id}
                <div 
                  class="absolute z-30 bg-base-100 shadow-xl rounded-lg p-3 pointer-events-none"
                  style="left: {barData.left + barData.width / 2}px; top: 50px; transform: translateX(-50%)"
                >
                  <div class="text-sm space-y-1">
                    <div class="font-semibold">{step.name}</div>
                    <div class="text-xs opacity-70">
                      {#if progressData?.startTime}
                        開始: {formatTime(new Date(progressData.startTime))}
                        {#if progressData.endTime}
                          <br />完了: {formatTime(new Date(progressData.endTime))}
                        {/if}
                      {:else}
                        予定時間: {formatDuration(step.duration)}
                      {/if}
                    </div>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        {/each}
        
        <!-- 現在時刻線 -->
        <div 
          class="absolute top-0 bottom-0 w-0.5 bg-error z-10 pointer-events-none"
          style="left: {timeToPixel(currentTime) + 192}px"
        >
          <div class="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-error text-white text-xs px-2 py-1 rounded">
            {currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- コントロールヒント -->
  <div class="text-xs text-center mt-2 opacity-50">
    ドラッグで移動、スクロールでズーム
  </div>
</div>