<!--
  会議室予約システム 予約カレンダーコンポーネント
  
  機能概要:
  - 月表示・週表示・日表示の切り替え
  - 予約の視覚的表示とドラッグ&ドロップ
  - 空き時間の表示
  - 新規予約作成へのクイックアクセス
  - 混雑予測の表示
-->

<script>
  import { onMount } from 'svelte';
  import { 
    bookings, 
    todayBookings,
    loadBookings,
    loadCrowdPrediction,
    crowdPrediction,
    isLoading,
    error
  } from './stores/bookingStore';
  import { 
    rooms, 
    selectedDate,
    setSelectedDate,
    loadRooms
  } from './stores/roomStore';

  // カレンダー表示モード
  let viewMode = $state('week'); // 'month' | 'week' | 'day'
  let currentDate = $state(new Date());
  let showNewBookingModal = $state(false);
  let selectedTimeSlot = $state(null);

  // 月初期化
  onMount(() => {
    loadRooms();
    loadBookings();
    updateSelectedDate();
  });

  // 選択日付を更新
  function updateSelectedDate() {
    const dateStr = currentDate.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    loadCrowdPrediction(dateStr);
  }

  // 日付ナビゲーション
  function goToPrevious() {
    switch (viewMode) {
      case 'month':
        currentDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'week':
        currentDate.setDate(currentDate.getDate() - 7);
        break;
      case 'day':
        currentDate.setDate(currentDate.getDate() - 1);
        break;
    }
    currentDate = new Date(currentDate);
    updateSelectedDate();
  }

  function goToNext() {
    switch (viewMode) {
      case 'month':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'week':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'day':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
    }
    currentDate = new Date(currentDate);
    updateSelectedDate();
  }

  function goToToday() {
    currentDate = new Date();
    updateSelectedDate();
  }

  // 日付フォーマット
  function formatDate(date, format = 'full') {
    switch (format) {
      case 'month':
        return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
      case 'day':
        return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
      case 'weekday':
        return date.toLocaleDateString('ja-JP', { weekday: 'short' });
      case 'time':
        return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
      default:
        return date.toLocaleDateString('ja-JP');
    }
  }

  // 週の日付を取得
  function getWeekDays(date) {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }

  // 月のカレンダーデータを取得
  function getMonthCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const weeks = [];
    let currentWeek = [];
    
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      
      currentWeek.push(day);
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    return weeks;
  }

  // 営業時間の時間スロットを生成
  function getTimeSlots() {
    const slots = [];
    for (let hour = 8; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }
    return slots;
  }

  // 特定の日の予約を取得
  function getBookingsForDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    return $bookings.filter(booking => 
      booking.startTime.startsWith(dateStr) && booking.status !== 'cancelled'
    );
  }

  // 特定の時間スロットの予約を取得
  function getBookingsForTimeSlot(date, timeSlot, roomId = null) {
    const dateStr = date.toISOString().split('T')[0];
    const slotTime = new Date(`${dateStr}T${timeSlot}:00`);
    const slotEndTime = new Date(slotTime.getTime() + 30 * 60 * 1000);
    
    return $bookings.filter(booking => {
      if (booking.status === 'cancelled') return false;
      if (roomId && booking.roomId !== roomId) return false;
      
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      
      return slotTime < bookingEnd && slotEndTime > bookingStart;
    });
  }

  // 予約の表示色を取得
  function getBookingColor(booking) {
    switch (booking.status) {
      case 'confirmed': return 'bg-success text-success-content';
      case 'pending': return 'bg-warning text-warning-content';
      case 'completed': return 'bg-info text-info-content';
      default: return 'bg-base-300 text-base-content';
    }
  }

  // 新規予約モーダルを開く
  function openNewBookingModal(date, timeSlot = null, roomId = null) {
    selectedTimeSlot = { date, timeSlot, roomId };
    showNewBookingModal = true;
  }

  // 混雑度の表示クラス
  function getCrowdLevelClass(occupancyRate) {
    if (occupancyRate >= 0.8) return 'bg-error text-error-content';
    if (occupancyRate >= 0.6) return 'bg-warning text-warning-content';
    if (occupancyRate >= 0.3) return 'bg-info text-info-content';
    return 'bg-success text-success-content';
  }

  // リアクティブ変数（$derived使用）
  const weekDays = $derived(getWeekDays(currentDate));
  const monthCalendar = $derived(getMonthCalendar(currentDate));
  const timeSlots = $derived(getTimeSlots());
  
  // 今日かどうかチェックする関数
  function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
</script>

<div class="calendar-container bg-base-100">
  <!-- カレンダーヘッダー -->
  <div class="calendar-header bg-base-200 p-4 rounded-t-box">
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
      <!-- 日付ナビゲーション -->
      <div class="flex items-center gap-2">
        <button class="btn btn-circle btn-sm" on:click={goToPrevious}>
          ❮
        </button>
        <h2 class="text-xl font-bold min-w-48 text-center">
          {#if viewMode === 'month'}
            {formatDate(currentDate, 'month')}
          {:else if viewMode === 'week'}
            {formatDate(weekDays[0], 'day')} - {formatDate(weekDays[6], 'day')}
          {:else}
            {formatDate(currentDate, 'full')}
          {/if}
        </h2>
        <button class="btn btn-circle btn-sm" on:click={goToNext}>
          ❯
        </button>
        <button class="btn btn-sm btn-outline ml-2" on:click={goToToday}>
          今日
        </button>
      </div>

      <!-- 表示モード切り替え -->
      <div class="flex gap-1">
        <button 
          class="btn btn-sm {viewMode === 'month' ? 'btn-primary' : 'btn-outline'}"
          on:click={() => viewMode = 'month'}
        >
          月
        </button>
        <button 
          class="btn btn-sm {viewMode === 'week' ? 'btn-primary' : 'btn-outline'}"
          on:click={() => viewMode = 'week'}
        >
          週
        </button>
        <button 
          class="btn btn-sm {viewMode === 'day' ? 'btn-primary' : 'btn-outline'}"
          on:click={() => viewMode = 'day'}
        >
          日
        </button>
      </div>
    </div>
  </div>

  <!-- カレンダー本体 -->
  <div class="calendar-body">
    {#if viewMode === 'month'}
      <!-- 月表示 -->
      <div class="month-view">
        <!-- 曜日ヘッダー -->
        <div class="weekday-header grid grid-cols-7 bg-base-300">
          {#each ['日', '月', '火', '水', '木', '金', '土'] as weekday, i}
            <div class="p-2 text-center font-semibold {i === 0 ? 'text-error' : i === 6 ? 'text-info' : ''}">
              {weekday}
            </div>
          {/each}
        </div>

        <!-- 日付グリッド -->
        <div class="date-grid">
          {#each monthCalendar as week}
            <div class="grid grid-cols-7">
              {#each week as day, i}
                {@const dayBookings = getBookingsForDate(day)}
                {@const isCurrentMonth = day.getMonth() === currentDate.getMonth()}
                <div 
                  class="day-cell min-h-40 p-2 border border-base-300 cursor-pointer hover:bg-base-200
                         {isCurrentMonth ? '' : 'text-base-content/40 bg-base-100/50'}
                         {isToday(day) ? 'bg-primary/10 border-primary' : ''}
                         {i === 0 ? 'text-error' : i === 6 ? 'text-info' : ''}"
                  on:click={() => openNewBookingModal(day)}
                >
                  <div class="font-semibold text-sm mb-1">
                    {day.getDate()}
                  </div>
                  
                  <!-- 予約一覧（最大3件表示） -->
                  <div class="space-y-1">
                    {#each dayBookings.slice(0, 3) as booking}
                      <div class="text-xs p-1 rounded {getBookingColor(booking)} truncate">
                        {formatDate(new Date(booking.startTime), 'time')} {booking.title}
                      </div>
                    {/each}
                    {#if dayBookings.length > 3}
                      <div class="text-xs text-base-content/60">
                        +{dayBookings.length - 3} 件
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          {/each}
        </div>
      </div>

    {:else if viewMode === 'week'}
      <!-- 週表示 -->
      <div class="week-view">
        <!-- 曜日ヘッダー -->
        <div class="grid grid-cols-8 bg-base-300">
          <div class="p-2"></div> <!-- 時間列用の空白 -->
          {#each weekDays as day, i}
            <div class="p-2 text-center {isToday(day) ? 'bg-primary text-primary-content' : ''}">
              <div class="font-semibold">{formatDate(day, 'weekday')}</div>
              <div class="text-sm">{day.getDate()}</div>
            </div>
          {/each}
        </div>

        <!-- 時間スロットグリッド -->
        <div class="time-grid max-h-screen overflow-y-auto">
          {#each timeSlots as timeSlot}
            <div class="grid grid-cols-8 border-b border-base-300">
              <!-- 時間ラベル -->
              <div class="time-label p-2 bg-base-200 text-sm font-mono">
                {timeSlot}
              </div>

              <!-- 各日のセル -->
              {#each weekDays as day}
                {@const slotBookings = getBookingsForTimeSlot(day, timeSlot)}
                <div 
                  class="time-slot-cell min-h-16 p-1 border-r border-base-300 cursor-pointer hover:bg-base-200
                         {isToday(day) ? 'bg-primary/5' : ''}"
                  on:click={() => openNewBookingModal(day, timeSlot)}
                >
                  {#each slotBookings as booking}
                    <div class="text-xs p-1 rounded mb-1 {getBookingColor(booking)} truncate">
                      {booking.title}
                    </div>
                  {/each}
                </div>
              {/each}
            </div>
          {/each}
        </div>
      </div>

    {:else}
      <!-- 日表示 -->
      <div class="day-view">
        <div class="flex gap-4 p-4">
          <!-- 時間スロット -->
          <div class="time-slots flex-1">
            <h3 class="font-semibold mb-4 flex items-center gap-2">
              <span class="text-2xl">📅</span>
              {formatDate(currentDate, 'full')}の予約
            </h3>

            <div class="space-y-2 max-h-96 overflow-y-auto">
              {#each timeSlots as timeSlot}
                {@const slotBookings = getBookingsForTimeSlot(currentDate, timeSlot)}
                <div 
                  class="flex items-center gap-4 p-3 rounded-lg border hover:bg-base-200 cursor-pointer
                         {slotBookings.length > 0 ? 'border-warning' : 'border-base-300'}"
                  on:click={() => openNewBookingModal(currentDate, timeSlot)}
                >
                  <div class="text-sm font-mono w-16">
                    {timeSlot}
                  </div>
                  
                  <div class="flex-1">
                    {#if slotBookings.length === 0}
                      <span class="text-base-content/60 text-sm">空き時間</span>
                    {:else}
                      <div class="space-y-1">
                        {#each slotBookings as booking}
                          <div class="flex items-center gap-2">
                            <span class="badge badge-sm {getBookingColor(booking).replace('bg-', 'badge-').replace(' text-success-content', '').replace(' text-warning-content', '').replace(' text-info-content', '').replace(' text-base-content', '')}">
                              {booking.roomName}
                            </span>
                            <span class="text-sm">{booking.title}</span>
                          </div>
                        {/each}
                      </div>
                    {/if}
                  </div>

                  <button class="btn btn-circle btn-xs btn-outline">
                    ➕
                  </button>
                </div>
              {/each}
            </div>
          </div>

          <!-- サイドパネル -->
          <div class="sidebar w-80 space-y-4">
            <!-- 混雑予測 -->
            {#if $crowdPrediction}
              <div class="card bg-base-200">
                <div class="card-body p-4">
                  <h4 class="card-title text-sm flex items-center gap-2">
                    <span>📊</span>
                    混雑予測
                  </h4>
                  
                  <div class="space-y-2">
                    {#each $crowdPrediction.hourlyPredictions.slice(0, 6) as prediction}
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-mono">
                          {prediction.hour}:00
                        </span>
                        <div class="flex items-center gap-2">
                          <div class="w-16 h-2 bg-base-300 rounded-full overflow-hidden">
                            <div 
                              class="h-full {getCrowdLevelClass(prediction.occupancyRate).split(' ')[0]}"
                              style="width: {prediction.occupancyRate * 100}%"
                            ></div>
                          </div>
                          <span class="text-xs w-12">
                            {Math.round(prediction.occupancyRate * 100)}%
                          </span>
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>
            {/if}

            <!-- 今日の予約サマリー -->
            <div class="card bg-base-200">
              <div class="card-body p-4">
                <h4 class="card-title text-sm flex items-center gap-2">
                  <span>📋</span>
                  今日の予約
                </h4>
                
                <div class="space-y-2">
                  {#each $todayBookings.slice(0, 5) as booking}
                    <div class="flex items-center justify-between text-sm">
                      <div>
                        <div class="font-semibold">{booking.title}</div>
                        <div class="text-xs text-base-content/60">
                          {booking.roomName}
                        </div>
                      </div>
                      <div class="text-xs text-right">
                        <div>{formatDate(new Date(booking.startTime), 'time')}</div>
                        <span class="badge badge-xs {getBookingColor(booking).replace('bg-', 'badge-').replace(' text-success-content', '').replace(' text-warning-content', '').replace(' text-info-content', '').replace(' text-base-content', '')}">
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>

            <!-- 会議室一覧 -->
            <div class="card bg-base-200">
              <div class="card-body p-4">
                <h4 class="card-title text-sm flex items-center gap-2">
                  <span>🏢</span>
                  会議室
                </h4>
                
                <div class="space-y-2 max-h-40 overflow-y-auto">
                  {#each $rooms.slice(0, 6) as room}
                    <div class="flex items-center justify-between text-sm">
                      <div>
                        <div class="font-semibold">{room.name}</div>
                        <div class="text-xs text-base-content/60">
                          {room.capacity}名 • {room.floor}F
                        </div>
                      </div>
                      <span class="badge badge-xs {room.isActive ? 'badge-success' : 'badge-error'}">
                        {room.isActive ? '利用可' : '利用不可'}
                      </span>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- 新規予約モーダル（プレースホルダー） -->
{#if showNewBookingModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg">新規予約作成</h3>
      <p class="py-4">
        {#if selectedTimeSlot}
          日時: {formatDate(selectedTimeSlot.date)} {selectedTimeSlot.timeSlot || '終日'}
        {/if}
      </p>
      <div class="modal-action">
        <button class="btn" on:click={() => showNewBookingModal = false}>キャンセル</button>
        <button class="btn btn-primary">作成</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .calendar-container {
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }

  .day-cell {
    transition: all 0.2s ease;
  }

  .day-cell:hover {
    transform: translateY(-1px);
  }

  .time-slot-cell {
    transition: background-color 0.2s ease;
  }

  .time-label {
    writing-mode: horizontal-tb;
    position: sticky;
    left: 0;
    z-index: 10;
  }

  .weekday-header {
    position: sticky;
    top: 0;
    z-index: 20;
  }

  .badge {
    font-size: 0.625rem;
  }
</style>