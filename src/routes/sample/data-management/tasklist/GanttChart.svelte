<script>
  import { filteredTasks, campaigns } from './stores/taskStore';
  import { PRIORITY_CONFIG } from './types';
  
  // 現在の日付を基準に表示期間を設定
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 表示期間（前後1ヶ月）
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 30);
  
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 60);
  
  // 日付の配列を生成
  const dates = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  
  // 月の境界を取得
  const monthBoundaries = [];
  let currentMonth = -1;
  dates.forEach((date, index) => {
    if (date.getMonth() !== currentMonth) {
      currentMonth = date.getMonth();
      monthBoundaries.push({ date, index });
    }
  });
  
  // タスクの位置を計算
  function calculateTaskPosition(task) {
    const taskStart = new Date(task.createdAt);
    const taskEnd = new Date(task.dueDate);
    
    // タスク開始位置
    const startDiff = Math.max(0, (taskStart - startDate) / (1000 * 60 * 60 * 24));
    const startPos = Math.max(0, startDiff);
    
    // タスク終了位置
    const endDiff = (taskEnd - startDate) / (1000 * 60 * 60 * 24);
    const endPos = Math.min(dates.length, endDiff);
    
    // タスクの長さ
    const length = Math.max(1, endPos - startPos);
    
    return { startPos, length, isOverdue: taskEnd < today && task.status !== 'done' };
  }
  
  // タスクをキャンペーンでグループ化
  $: tasksByCampaign = $filteredTasks.reduce((acc, task) => {
    const campaignId = task.campaignId || 'no-campaign';
    if (!acc[campaignId]) {
      acc[campaignId] = [];
    }
    acc[campaignId].push(task);
    return acc;
  }, {});
  
  // 依存関係のあるタスクを取得
  function getDependentTask(taskId) {
    return $filteredTasks.find(t => t.id === taskId);
  }
</script>

<div class="bg-base-100 rounded-lg shadow-sm p-4 overflow-auto">
  <!-- ヘッダー -->
  <div class="sticky left-0 z-20 bg-base-100">
    <div class="flex">
      <!-- タスク名列のヘッダー -->
      <div class="w-64 pr-4 border-r border-base-300">
        <div class="h-20 flex items-end pb-2">
          <span class="font-semibold text-sm">タスク / キャンペーン</span>
        </div>
      </div>
      
      <!-- カレンダーヘッダー -->
      <div class="flex-1 relative">
        <!-- 月表示 -->
        <div class="h-8 flex">
          {#each monthBoundaries as boundary, i}
            {@const nextBoundary = monthBoundaries[i + 1]}
            {@const width = nextBoundary ? (nextBoundary.index - boundary.index) * 30 : (dates.length - boundary.index) * 30}
            <div 
              class="border-l border-base-300 px-2 text-sm font-semibold"
              style="width: {width}px"
            >
              {boundary.date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
            </div>
          {/each}
        </div>
        
        <!-- 日付表示 -->
        <div class="h-12 flex">
          {#each dates as date}
            {@const isToday = date.toDateString() === today.toDateString()}
            {@const isWeekend = date.getDay() === 0 || date.getDay() === 6}
            <div 
              class="w-[30px] border-l border-base-300 text-center pt-1
                     {isToday ? 'bg-primary text-primary-content' : ''}
                     {isWeekend ? 'bg-base-200' : ''}"
            >
              <div class="text-xs">{date.getDate()}</div>
              <div class="text-xs opacity-60">
                {['日', '月', '火', '水', '木', '金', '土'][date.getDay()]}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
  
  <!-- タスク行 -->
  <div class="relative">
    {#each Object.entries(tasksByCampaign) as [campaignId, tasks]}
      {@const campaign = $campaigns.find(c => c.id === campaignId)}
      
      <!-- キャンペーン行 -->
      {#if campaign}
        {@const campaignStart = Math.max(0, (new Date(campaign.startDate) - startDate) / (1000 * 60 * 60 * 24))}
        {@const campaignEnd = Math.min(dates.length, (new Date(campaign.endDate) - startDate) / (1000 * 60 * 60 * 24))}
        <div class="flex items-center h-8 bg-base-200 border-t border-base-300">
          <div class="w-64 pr-4 font-medium text-sm flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-{campaign.color}"></span>
            <span class="truncate">{campaign.name}</span>
          </div>
          <div class="flex-1 relative h-full">
            <!-- キャンペーン期間の背景 -->
            <div 
              class="absolute h-full bg-{campaign.color} opacity-10"
              style="left: {campaignStart * 30}px; width: {(campaignEnd - campaignStart) * 30}px"
            ></div>
          </div>
        </div>
      {/if}
      
      <!-- タスク行 -->
      {#each tasks as task}
        {@const position = calculateTaskPosition(task)}
        <div class="flex items-center h-10 border-t border-base-300 hover:bg-base-200/50">
          <!-- タスク名 -->
          <div class="w-64 pr-4 flex items-center gap-2">
            <span class="badge badge-{PRIORITY_CONFIG[task.priority].color} badge-xs"></span>
            <span class="text-sm truncate">{task.title}</span>
          </div>
          
          <!-- ガントバー -->
          <div class="flex-1 relative h-full flex items-center">
            <!-- グリッド線 -->
            {#each dates as _, i}
              <div class="absolute h-full w-[30px] border-l border-base-300 opacity-30" style="left: {i * 30}px"></div>
            {/each}
            
            <!-- 依存関係の線 -->
            {#if task.dependencies.length > 0}
              {#each task.dependencies as depId}
                {@const depTask = getDependentTask(depId)}
                {#if depTask}
                  {@const depPos = calculateTaskPosition(depTask)}
                  <svg 
                    class="absolute pointer-events-none" 
                    style="left: {(depPos.startPos + depPos.length) * 30}px; width: {(position.startPos - depPos.startPos - depPos.length) * 30}px; height: 100%"
                  >
                    <path 
                      d="M 0 20 L {(position.startPos - depPos.startPos - depPos.length) * 30} 20" 
                      stroke="currentColor" 
                      stroke-width="1" 
                      stroke-dasharray="2,2" 
                      opacity="0.3"
                      fill="none"
                    />
                  </svg>
                {/if}
              {/each}
            {/if}
            
            <!-- タスクバー -->
            <div 
              class="absolute h-6 rounded flex items-center px-2 cursor-pointer shadow-sm
                     {position.isOverdue ? 'bg-error text-error-content' : 
                      task.status === 'done' ? 'bg-success text-success-content' :
                      task.status === 'in_progress' ? 'bg-warning text-warning-content' :
                      'bg-primary text-primary-content'}"
              style="left: {position.startPos * 30}px; width: {position.length * 30}px"
            >
              <span class="text-xs font-medium truncate">{task.assignees.length}人</span>
            </div>
            
            <!-- 進捗バー -->
            {#if task.estimatedHours > 0 && task.actualHours > 0}
              {@const progress = Math.min(100, (task.actualHours / task.estimatedHours) * 100)}
              <div 
                class="absolute h-1 bg-base-300 rounded-full bottom-1"
                style="left: {position.startPos * 30 + 4}px; width: {position.length * 30 - 8}px"
              >
                <div 
                  class="h-full bg-base-content rounded-full"
                  style="width: {progress}%"
                ></div>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    {/each}
  </div>
  
  <!-- 凡例 -->
  <div class="mt-4 pt-4 border-t border-base-300 flex items-center gap-4 text-sm">
    <span class="font-medium">凡例:</span>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 bg-primary rounded"></div>
      <span>未着手</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 bg-warning rounded"></div>
      <span>進行中</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 bg-success rounded"></div>
      <span>完了</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 bg-error rounded"></div>
      <span>期限超過</span>
    </div>
    <div class="flex items-center gap-2">
      <svg class="w-4 h-4"><path d="M 0 2 L 16 2" stroke="currentColor" stroke-dasharray="2,2" /></svg>
      <span>依存関係</span>
    </div>
  </div>
</div>