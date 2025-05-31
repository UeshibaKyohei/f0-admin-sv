<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { statusDefinitions } from './mockData.js';
  
  let { processSteps = [], progress = [], onStepClick = () => {} } = $props();
  
  let timelineElement = $state();
  let hoveredStep = $state(null);
  let animationTrigger = $state(0);
  
  // SVG設定
  const svgHeight = 100;
  const circleRadius = 40;
  const circleY = 50;
  const stepWidth = 120;
  const totalWidth = $derived(processSteps.length * stepWidth);
  
  // DaisyUIテーマカラー（デフォルト値）
  let primaryColor = $state('hsl(262 80% 50%)');  // DaisyUI default primary
  let successColor = $state('hsl(158 64% 52%)');  // DaisyUI default success
  let baseColor300 = $state('hsl(215 20% 84%)'); // DaisyUI default base-300
  let baseColor200 = $state('hsl(215 27% 91%)'); // DaisyUI default base-200
  
  // 各ステップの状態と進捗を取得
  function getStepData(stepId: string) {
    const progressData = progress.find(p => p.stepId === stepId);
    const step = processSteps.find(s => s.id === stepId);
    return { ...step, ...progressData };
  }
  
  // ステップ間の接続線の状態を取得
  function getConnectionStatus(currentIndex: number) {
    if (currentIndex >= processSteps.length - 1) return 'pending';
    
    const currentStep = getStepData(processSteps[currentIndex].id);
    const nextStep = getStepData(processSteps[currentIndex + 1].id);
    
    if (currentStep.status === 'completed' && nextStep.status !== 'pending') {
      return 'completed';
    } else if (currentStep.status === 'in_progress' || 
               (currentStep.status === 'completed' && nextStep.status === 'pending')) {
      return 'active';
    }
    return 'pending';
  }
  
  // 円の中心X座標を計算
  function getCircleX(index: number) {
    return stepWidth / 2 + (index * stepWidth);
  }
  
  // 進捗更新イベントのリスナー
  onMount(() => {
    const handleProgressUpdate = () => {
      animationTrigger = Date.now();
    };
    
    window.addEventListener('progress-update', handleProgressUpdate);
    return () => window.removeEventListener('progress-update', handleProgressUpdate);
  });
  
  // 時間のフォーマット
  function formatTime(timeString: string | null) {
    if (!timeString) return '--:--';
    const date = new Date(timeString);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
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
</script>

<div class="card bg-base-100 shadow-xl w-full">
  <div class="card-body">
    <h3 class="text-lg font-semibold mb-4">工程タイムライン</h3>
    
    <div class="overflow-x-auto" bind:this={timelineElement}>
      <div class="px-8 py-4">
        
        <!-- SVGタイムライン -->
        {#if primaryColor && successColor && baseColor300 && baseColor200}
          <svg width={totalWidth} height={svgHeight} class="overflow-visible">
            <!-- 接続線を描画 -->
            {#each processSteps.slice(0, -1) as _, index}
              {@const status = getConnectionStatus(index)}
              {@const x1 = getCircleX(index)}
              {@const x2 = getCircleX(index + 1)}
              
              <line 
                x1={x1} 
                y1={circleY} 
                x2={x2} 
                y2={circleY} 
                stroke={status === 'completed' ? successColor : status === 'active' ? primaryColor : baseColor300}
                stroke-width="4"
                class="transition-all duration-500"
              >
                {#if status === 'active'}
                  <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
                {/if}
              </line>
            {/each}
          
          <!-- 円を描画 -->
          {#each processSteps as step, index}
            {@const stepData = getStepData(step.id)}
            {@const cx = getCircleX(index)}
            
            <g 
              class="cursor-pointer" 
              onclick={() => onStepClick(stepData)}
              onmouseenter={() => hoveredStep = step.id}
              onmouseleave={() => hoveredStep = null}
            >
              <!-- ホバー領域用の透明な円 -->
              <circle 
                cx={cx} 
                cy={circleY} 
                r={circleRadius + 10} 
                fill="transparent"
              />
              
              <!-- 外側の円（ボーダー） -->
              <circle 
                cx={cx} 
                cy={circleY} 
                r={circleRadius + 4} 
                fill={stepData.status === 'completed' ? successColor : 
                      stepData.status === 'in_progress' ? primaryColor : 
                      baseColor300}
                class="transition-all duration-300"
                class:drop-shadow-lg={hoveredStep === step.id}
              />
              
              <!-- 内側の円 -->
              <circle 
                cx={cx} 
                cy={circleY} 
                r={circleRadius} 
                fill={stepData.status === 'completed' ? successColor : 
                      stepData.status === 'in_progress' ? primaryColor : 
                      baseColor200}
                class="transition-all duration-300"
              />
              
              <!-- アイコンまたはテキスト -->
              {#if stepData.status === 'completed'}
                <!-- チェックマーク -->
                <path 
                  d="M -15 0 L -5 10 L 15 -10" 
                  transform="translate({cx}, {circleY})"
                  fill="none" 
                  stroke="white" 
                  stroke-width="4" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                />
              {:else if stepData.status === 'in_progress'}
                <!-- 進捗テキスト -->
                <text 
                  x={cx} 
                  y={circleY} 
                  text-anchor="middle" 
                  dominant-baseline="middle" 
                  fill="white" 
                  font-size="14" 
                  font-weight="bold"
                >
                  {stepData.progress || 0}%
                </text>
              {:else}
                <!-- ステップ番号 -->
                <text 
                  x={cx} 
                  y={circleY} 
                  text-anchor="middle" 
                  dominant-baseline="middle" 
                  fill="#999" 
                  font-size="20" 
                  font-weight="bold"
                >
                  {index + 1}
                </text>
              {/if}
              
              {#if stepData.status === 'in_progress'}
                <!-- パルスアニメーション -->
                <circle 
                  cx={cx} 
                  cy={circleY} 
                  r={circleRadius + 8} 
                  fill="none" 
                  stroke={primaryColor}
                  stroke-width="2" 
                  opacity="0.3"
                >
                  <animate attributeName="r" values="{circleRadius + 8};{circleRadius + 20};{circleRadius + 8}" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
              {/if}
            </g>
          {/each}
          </svg>
        {/if}
        
        <!-- ステップ情報（SVGの下に配置） -->
        <div class="flex" style="width: {totalWidth}px;">
          {#each processSteps as step, index}
            {@const stepData = getStepData(step.id)}
            
            <div class="text-center" style="width: {stepWidth}px;">
              <h4 class="font-semibold text-sm mt-4">{step.name}</h4>
              <p class="text-xs opacity-70 mt-1">{step.department}</p>
              
              <div class="mt-2">
                {#if stepData.startTime}
                  <p class="text-xs">
                    {formatTime(stepData.startTime)}
                    {#if stepData.endTime}
                      <br />〜 {formatTime(stepData.endTime)}
                    {/if}
                  </p>
                {:else}
                  <p class="text-xs opacity-50">未開始</p>
                {/if}
              </div>
            </div>
          {/each}
        </div>
        
        <!-- ホバー時の詳細情報 -->
        <div class="relative">
          {#each processSteps as step, index}
            {@const stepData = getStepData(step.id)}
            {@const cx = getCircleX(index)}
            
            {#if hoveredStep === step.id}
              <div 
                class="absolute bg-base-100 rounded-lg shadow-xl p-4 z-50 min-w-[200px] pointer-events-none"
                style="left: {cx - 100}px; top: -80px;"
                transition:fade={{ duration: 200 }}
              >
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="font-semibold">標準時間:</span>
                    <span>{step.duration}分</span>
                  </div>
                  {#if stepData.startTime}
                    <div class="flex justify-between">
                      <span class="font-semibold">実績時間:</span>
                      <span>{getElapsedTime(stepData.startTime, stepData.endTime)}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="font-semibold">作業者:</span>
                      <span>{stepData.operator || '-'}</span>
                    </div>
                  {/if}
                  <div class="flex justify-between">
                    <span class="font-semibold">ステータス:</span>
                    <span class="badge badge-sm" 
                          class:badge-success={stepData.status === 'completed'}
                          class:badge-primary={stepData.status === 'in_progress'}
                          class:badge-neutral={stepData.status === 'pending'}>
                      {statusDefinitions[stepData.status as keyof typeof statusDefinitions]?.label || stepData.status}
                    </span>
                  </div>
                </div>
              </div>
            {/if}
          {/each}
        </div>
        
        <!-- 全体の進捗バー -->
        <div class="mt-12">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-semibold">全体進捗</span>
            <span class="text-sm">
              {progress.filter(p => p.status === 'completed').length} / {processSteps.length} 工程完了
            </span>
          </div>
          <div class="w-full bg-base-300 rounded-full h-4 overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-primary to-success transition-all duration-1000 ease-out flex items-center justify-end pr-2"
              style="width: {(progress.filter(p => p.status === 'completed').length / processSteps.length) * 100}%"
            >
              {#if progress.filter(p => p.status === 'completed').length > 0}
                <span class="text-xs text-white font-semibold">
                  {Math.round((progress.filter(p => p.status === 'completed').length / processSteps.length) * 100)}%
                </span>
              {/if}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</div>

<style>
  /* SVG要素のスタイル */
  svg {
    display: block;
  }
  
  /* ドロップシャドウ効果 */
  .drop-shadow-lg {
    filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1));
  }
</style>