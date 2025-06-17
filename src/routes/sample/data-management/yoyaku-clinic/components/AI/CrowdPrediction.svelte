<script lang="ts">
  import { generateCrowdPrediction } from '../../api/mockData';
  import { bookingStore } from '../../stores/bookingStore';
  
  const { selectedDate } = bookingStore;
  
  // 予測データ
  const prediction = $derived.by(() => {
    const dateStr = $selectedDate.toISOString().split('T')[0];
    return generateCrowdPrediction(dateStr);
  });
  
  // 最大値を計算（グラフ表示用）
  const maxPatients = $derived(
    Math.max(...prediction.hourlyPredictions.map(p => p.expectedPatients), 1)
  );
  
  // 現在時刻
  let currentHour = new Date().getHours();
</script>

<div class="crowd-prediction">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- 時間別混雑予測 -->
    <div class="bg-base-100 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-4">時間別混雑予測</h3>
      <div class="space-y-2">
        {#each prediction.hourlyPredictions as hourData}
          {@const isPeak = prediction.peakHours.includes(hourData.hour)}
          {@const isCurrent = hourData.hour === currentHour}
          <div class="flex items-center gap-3">
            <div class="text-sm w-16 font-medium {isCurrent ? 'text-primary' : ''}">
              {hourData.hour}:00
            </div>
            <div class="flex-1">
              <div class="w-full bg-base-200 rounded-full h-6 relative">
                <div 
                  class="h-6 rounded-full transition-all {isPeak ? 'bg-warning' : 'bg-primary'}"
                  style="width: {(hourData.expectedPatients / maxPatients) * 100}%"
                >
                  <span class="absolute right-2 top-0 h-full flex items-center text-xs text-primary-content">
                    {hourData.expectedPatients}名
                  </span>
                </div>
                {#if isCurrent}
                  <div class="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-error rounded-full animate-pulse"></div>
                {/if}
              </div>
            </div>
            <div class="text-xs text-base-content/70 w-20 text-right">
              信頼度: {(hourData.confidence * 100).toFixed(0)}%
            </div>
          </div>
        {/each}
      </div>
      
      <div class="mt-4 flex gap-4 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-primary rounded"></div>
          <span>通常</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-warning rounded"></div>
          <span>混雑</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-error rounded-full animate-pulse"></div>
          <span>現在</span>
        </div>
      </div>
    </div>
    
    <!-- 推奨スタッフ配置 -->
    <div class="bg-base-100 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-4">推奨スタッフ配置</h3>
      <div class="space-y-3">
        {#each prediction.hourlyPredictions.filter(h => h.hour >= 9 && h.hour <= 17) as hourData}
          {@const isPeak = prediction.peakHours.includes(hourData.hour)}
          <div class="flex items-center justify-between p-3 rounded-lg {isPeak ? 'bg-warning/20' : 'bg-base-200'}">
            <div>
              <div class="font-medium">{hourData.hour}:00 - {hourData.hour + 1}:00</div>
              <div class="text-sm text-base-content/70">
                予想患者数: {hourData.expectedPatients}名
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold">{hourData.recommendedStaff}</div>
              <div class="text-xs text-base-content/70">推奨人数</div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
  
  <!-- AI推奨事項 -->
  <div class="mt-6 bg-base-100 rounded-lg p-6">
    <h3 class="text-lg font-semibold mb-4">AI推奨事項</h3>
    <div class="space-y-3">
      {#each prediction.recommendations as recommendation, index}
        <div class="flex gap-3">
          <div class="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-content text-sm font-bold">
            {index + 1}
          </div>
          <div class="flex-1 pt-1">
            <p class="text-sm">{recommendation}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
  
  <!-- 最適化提案 -->
  <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-info/20 rounded-lg p-4">
      <h4 class="font-medium mb-2">予約枠の最適化</h4>
      <p class="text-sm text-base-content/70">
        ピーク時間帯の予約枠を制限し、空いている時間帯への誘導を推奨します。
      </p>
      <button class="btn btn-sm btn-info mt-3">
        設定を調整
      </button>
    </div>
    
    <div class="bg-success/20 rounded-lg p-4">
      <h4 class="font-medium mb-2">待ち時間短縮</h4>
      <p class="text-sm text-base-content/70">
        診察時間の長い患者を特定し、事前準備を強化することで効率化できます。
      </p>
      <button class="btn btn-sm btn-success mt-3">
        詳細を見る
      </button>
    </div>
    
    <div class="bg-warning/20 rounded-lg p-4">
      <h4 class="font-medium mb-2">キャンセル率改善</h4>
      <p class="text-sm text-base-content/70">
        リマインダー送信のタイミングを最適化し、無断キャンセルを削減できます。
      </p>
      <button class="btn btn-sm btn-warning mt-3">
        設定する
      </button>
    </div>
  </div>
</div>