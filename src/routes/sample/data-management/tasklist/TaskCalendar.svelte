<script>
  import { filteredTasks, users } from './stores/taskStore';
  import { selectedTask, isTaskModalOpen } from './stores/uiStore';
  import { PRIORITY_CONFIG } from './types';
  
  // 現在の日付
  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  
  // カレンダーの日付を生成
  function generateCalendarDays(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const weeks = [];
    let days = [];
    
    // 前月の日付を追加
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    
    // 当月の日付を追加
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i)
      });
      
      // 7日ごとに週を区切る
      if (days.length === 7) {
        weeks.push(days);
        days = [];
      }
    }
    
    // 次月の日付を追加して最後の週を埋める
    if (days.length > 0) {
      let nextMonthDay = 1;
      while (days.length < 7) {
        days.push({
          date: nextMonthDay++,
          isCurrentMonth: false,
          fullDate: new Date(year, month + 1, nextMonthDay - 1)
        });
      }
      weeks.push(days);
    }
    
    return weeks;
  }
  
  // タスクを日付でグループ化
  function getTasksForDate(date, tasks) {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  }
  
  $: calendarWeeks = generateCalendarDays(currentYear, currentMonth);
  
  // 月の移動
  function previousMonth() {
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear--;
    } else {
      currentMonth--;
    }
  }
  
  function nextMonth() {
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear++;
    } else {
      currentMonth++;
    }
  }
  
  function goToToday() {
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
  }
  
  // タスククリック
  function handleTaskClick(task) {
    selectedTask.set(task.id);
    isTaskModalOpen.set(true);
  }
  
  // タイトルを制限文字数で切り詰める
  function truncateTitle(title, maxLength = 15) {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  }
</script>

<div class="w-full bg-base-100 rounded-lg shadow-sm p-4">
  <!-- カレンダーヘッダー -->
  <div class="flex items-center justify-between mb-4">
    <div class="flex items-center gap-2">
      <button class="btn btn-ghost btn-sm btn-circle" onclick={previousMonth}>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h3 class="text-xl font-bold">
        {currentYear}年 {currentMonth + 1}月
      </h3>
      <button class="btn btn-ghost btn-sm btn-circle" onclick={nextMonth}>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
    <button class="btn btn-sm btn-ghost" onclick={goToToday}>今日</button>
  </div>
  
  <!-- カレンダーテーブル -->
  <div class="overflow-x-auto">
    <table class="table w-full table-fixed">
      <thead>
        <tr>
          {#each ['日', '月', '火', '水', '木', '金', '土'] as dayName, i}
            <th class="text-center p-2 {i === 0 ? 'text-error' : i === 6 ? 'text-info' : ''}">
              {dayName}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each calendarWeeks as week}
          <tr>
            {#each week as day}
              {@const dayTasks = getTasksForDate(day.fullDate, $filteredTasks)}
              {@const isToday = day.fullDate.toDateString() === today.toDateString()}
              {@const isWeekend = day.fullDate.getDay() === 0 || day.fullDate.getDay() === 6}
              
              <td class="p-1 align-top border border-base-300 {!day.isCurrentMonth ? 'opacity-30' : ''} w-[14.28%] max-w-[14.28%]">
                <div class="min-h-[100px] p-1 overflow-hidden">
                  <!-- 日付ヘッダー -->
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-semibold {isToday ? 'badge badge-primary badge-sm' : ''}">{day.date}</span>
                    {#if dayTasks.length > 0}
                      <span class="badge badge-xs">{dayTasks.length}</span>
                    {/if}
                  </div>
                  
                  <!-- タスクリスト -->
                  <div class="space-y-1">
                    {#each dayTasks.slice(0, 2) as task}
                      <button
                        class="w-full text-left p-1 rounded text-xs bg-base-200 hover:bg-base-300 transition-colors"
                        onclick={() => handleTaskClick(task)}
                        title={task.title}
                      >
                        <div class="flex items-center gap-1">
                          <span class="inline-block w-1 h-1 rounded-full bg-{PRIORITY_CONFIG[task.priority].color} shrink-0"></span>
                          <span class="block truncate">{truncateTitle(task.title)}</span>
                        </div>
                      </button>
                    {/each}
                    
                    {#if dayTasks.length > 2}
                      <button 
                        class="text-xs text-primary hover:underline"
                        onclick={() => {/* TODO: 日付フィルターを設定 */}}
                      >
                        +{dayTasks.length - 2}件
                      </button>
                    {/if}
                  </div>
                </div>
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  
  <!-- 凡例 -->
  <div class="mt-4 flex flex-wrap items-center gap-4 text-sm">
    <span class="font-medium">優先度:</span>
    {#each Object.entries(PRIORITY_CONFIG) as [key, config]}
      <div class="flex items-center gap-1">
        <span class="inline-block w-2 h-2 rounded-full bg-{config.color}"></span>
        <span>{config.label}</span>
      </div>
    {/each}
  </div>
</div>