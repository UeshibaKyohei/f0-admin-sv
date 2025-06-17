<script lang="ts">
  import type { Booking } from '../../types';
  import { bookingStore } from '../../stores/bookingStore';
  import { resourceStore } from '../../stores/resourceStore';
  
  let { selectedDate = new Date() } = $props();
  
  const { filteredBookings } = bookingStore;
  const { departments } = resourceStore;
  
  // 月の最初と最後の日を計算
  const monthRange = $derived.by(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // カレンダー表示用に週の開始（月曜日）に合わせる
    const calendarStart = new Date(firstDay);
    const startDay = firstDay.getDay();
    calendarStart.setDate(firstDay.getDate() - (startDay === 0 ? 6 : startDay - 1));
    
    const calendarEnd = new Date(lastDay);
    const endDay = lastDay.getDay();
    if (endDay !== 0) {
      calendarEnd.setDate(lastDay.getDate() + (7 - endDay));
    }
    
    return { firstDay, lastDay, calendarStart, calendarEnd };
  });
  
  // カレンダーの日付配列を生成
  const calendarDays = $derived.by(() => {
    const days = [];
    const current = new Date(monthRange.calendarStart);
    
    while (current <= monthRange.calendarEnd) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  });
  
  // 日付ごとの予約を整理
  const bookingsByDate = $derived.by(() => {
    const result: Record<string, Booking[]> = {};
    
    $filteredBookings.forEach(booking => {
      const dateStr = booking.startTime.split('T')[0];
      if (!result[dateStr]) {
        result[dateStr] = [];
      }
      result[dateStr].push(booking);
    });
    
    return result;
  });
  
  // 日付ごとの統計を計算
  function getDayStats(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    const dayBookings = bookingsByDate[dateStr] || [];
    
    const stats = {
      total: dayBookings.length,
      byDepartment: {} as Record<string, number>,
      byStatus: {
        booked: 0,
        completed: 0,
        cancelled: 0,
        noShow: 0
      }
    };
    
    dayBookings.forEach(booking => {
      // 診療科別
      if (!stats.byDepartment[booking.departmentId]) {
        stats.byDepartment[booking.departmentId] = 0;
      }
      stats.byDepartment[booking.departmentId]++;
      
      // ステータス別
      if (booking.status === 'booked' || booking.status === 'checked-in' || booking.status === 'in-progress') {
        stats.byStatus.booked++;
      } else if (booking.status === 'completed') {
        stats.byStatus.completed++;
      } else if (booking.status === 'cancelled') {
        stats.byStatus.cancelled++;
      } else if (booking.status === 'no-show') {
        stats.byStatus.noShow++;
      }
    });
    
    return stats;
  }
  
  // 今日かどうか判定
  function isToday(date: Date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
  
  // 選択月かどうか判定
  function isCurrentMonth(date: Date) {
    return date.getMonth() === selectedDate.getMonth();
  }
  
  // 日付をクリック
  function handleDateClick(date: Date) {
    bookingStore.selectedDate.set(date);
    bookingStore.viewMode.set('day');
  }
</script>

<div class="month-view">
  <!-- 月ヘッダー -->
  <div class="mb-4">
    <h3 class="text-lg font-semibold">
      {selectedDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
    </h3>
  </div>
  
  <!-- カレンダーグリッド -->
  <div class="grid grid-cols-7 gap-0 border-l border-t">
    <!-- 曜日ヘッダー -->
    {#each ['月', '火', '水', '木', '金', '土', '日'] as day, index}
      <div class="p-2 text-center font-semibold border-r border-b bg-base-200 {index === 5 ? 'text-info' : ''} {index === 6 ? 'text-error' : ''}">
        {day}
      </div>
    {/each}
    
    <!-- 日付セル -->
    {#each calendarDays as date, index}
      {@const stats = getDayStats(date)}
      {@const isMonth = isCurrentMonth(date)}
      {@const today = isToday(date)}
      <div 
        class="border-r border-b min-h-[100px] p-2 cursor-pointer hover:bg-base-200 transition-colors
               {!isMonth ? 'bg-base-100/50' : ''} 
               {today ? 'bg-primary/10' : ''}"
        role="button"
        tabindex="0"
        onclick={() => handleDateClick(date)}
      >
        <div class="flex justify-between items-start mb-1">
          <div class="font-medium {!isMonth ? 'text-base-content/50' : ''} {today ? 'text-primary font-bold' : ''}">
            {date.getDate()}
          </div>
          {#if stats.total > 0}
            <div class="badge badge-sm">{stats.total}</div>
          {/if}
        </div>
        
        {#if stats.total > 0 && isMonth}
          <!-- 診療科別の予約数 -->
          <div class="space-y-1 mb-2">
            {#each Object.entries(stats.byDepartment) as [deptId, count]}
              {@const dept = $departments.find(d => d.id === deptId)}
              {#if dept}
                <div class="flex items-center gap-1">
                  <div 
                    class="w-2 h-2 rounded-full" 
                    style="background-color: {dept.color}"
                  ></div>
                  <span class="text-xs">{dept.name.substring(0, 2)}: {count}</span>
                </div>
              {/if}
            {/each}
          </div>
          
          <!-- ステータスバー -->
          {#if stats.total > 0}
            <div class="flex gap-0.5 h-2">
              {#if stats.byStatus.completed > 0}
                <div 
                  class="bg-success rounded-l"
                  style="width: {(stats.byStatus.completed / stats.total) * 100}%"
                  title="完了: {stats.byStatus.completed}件"
                ></div>
              {/if}
              {#if stats.byStatus.booked > 0}
                <div 
                  class="bg-primary"
                  style="width: {(stats.byStatus.booked / stats.total) * 100}%"
                  title="予約済: {stats.byStatus.booked}件"
                ></div>
              {/if}
              {#if stats.byStatus.cancelled > 0}
                <div 
                  class="bg-base-300"
                  style="width: {(stats.byStatus.cancelled / stats.total) * 100}%"
                  title="キャンセル: {stats.byStatus.cancelled}件"
                ></div>
              {/if}
              {#if stats.byStatus.noShow > 0}
                <div 
                  class="bg-error rounded-r"
                  style="width: {(stats.byStatus.noShow / stats.total) * 100}%"
                  title="無断キャンセル: {stats.byStatus.noShow}件"
                ></div>
              {/if}
            </div>
          {/if}
        {/if}
      </div>
    {/each}
  </div>
  
  <!-- 凡例 -->
  <div class="mt-4 flex flex-wrap gap-4 text-sm">
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 bg-success rounded"></div>
      <span>完了</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 bg-primary rounded"></div>
      <span>予約済</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 bg-base-300 rounded"></div>
      <span>キャンセル</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 bg-error rounded"></div>
      <span>無断キャンセル</span>
    </div>
    <div class="divider divider-horizontal"></div>
    {#each $departments as dept}
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded" style="background-color: {dept.color}"></div>
        <span>{dept.name}</span>
      </div>
    {/each}
  </div>
</div>