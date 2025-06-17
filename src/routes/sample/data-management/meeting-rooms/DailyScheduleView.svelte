<!--
  1日単位の予約状況リッチUIコンポーネント
  
  機能:
  - 1日の全体的な予約状況をビジュアルに表示
  - 会議室別タイムライン表示
  - 空き時間の視覚的表示
  - 混雑度の色分け表示
  - ドラッグ&ドロップによる予約移動（将来拡張）
-->

<script>
  import { createEventDispatcher } from 'svelte';
  import { 
    rooms, 
    availableRooms,
    equipment
  } from './stores/roomStore';
  import { 
    bookings, 
    todayBookings,
    crowdPrediction
  } from './stores/bookingStore';

  const dispatch = createEventDispatcher();

  // Props
  let { selectedDate = new Date().toISOString().split('T')[0] } = $props();

  // UI状態
  let viewMode = $state('timeline'); // 'timeline' | 'grid' | 'chart'
  let selectedRoomId = $state(null);
  let timeRange = $state({ start: 8, end: 22 }); // 8:00-22:00

  // 営業時間の時間枠を生成（30分刻み）
  function generateTimeSlots() {
    const slots = [];
    for (let hour = timeRange.start; hour <= timeRange.end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === timeRange.end && minute > 0) break;
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time: timeStr,
          hour,
          minute,
          timestamp: hour * 60 + minute
        });
      }
    }
    return slots;
  }

  // 指定日の予約を取得
  function getBookingsForDate(date) {
    return $bookings.filter(booking => 
      booking.startTime.startsWith(date) && booking.status !== 'cancelled'
    );
  }

  // 会議室の指定時間の予約を取得
  function getBookingForRoomTime(roomId, timeSlot) {
    const slotStart = new Date(`${selectedDate}T${timeSlot.time}:00`);
    const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
    
    return dayBookings.find(booking => {
      if (booking.roomId !== roomId) return false;
      
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });
  }

  // 予約の長さを計算（30分単位）
  function getBookingDuration(booking) {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    return Math.ceil((end - start) / (1000 * 60 * 30));
  }

  // 予約の開始位置を計算（タイムライン用）
  function getBookingPosition(booking) {
    const start = new Date(booking.startTime);
    const hour = start.getHours();
    const minute = start.getMinutes();
    const slotIndex = (hour - timeRange.start) * 2 + Math.floor(minute / 30);
    return slotIndex;
  }

  // 時間スロットの空き状況を判定
  function getSlotStatus(roomId, timeSlot) {
    const booking = getBookingForRoomTime(roomId, timeSlot);
    if (booking) {
      return {
        status: 'occupied',
        booking,
        class: getBookingStatusClass(booking.status)
      };
    }
    return {
      status: 'available',
      booking: null,
      class: 'bg-success/20 hover:bg-success/30'
    };
  }

  // 予約ステータスに応じたクラス
  function getBookingStatusClass(status) {
    switch (status) {
      case 'confirmed': return 'bg-primary text-primary-content';
      case 'pending': return 'bg-warning text-warning-content';
      case 'completed': return 'bg-info text-info-content';
      default: return 'bg-base-300 text-base-content';
    }
  }

  // 会議室タイプアイコン
  function getRoomTypeIcon(type) {
    switch (type) {
      case 'conference': return '🏛️';
      case 'meeting': return '💼';
      case 'training': return '📚';
      case 'phone-booth': return '📞';
      case 'presentation': return '📊';
      default: return '🏢';
    }
  }

  // 混雑度の取得
  function getCrowdLevel(hour) {
    if (!$crowdPrediction?.hourlyPredictions) return 0;
    const prediction = $crowdPrediction.hourlyPredictions.find(p => p.hour === hour);
    return prediction?.occupancyRate || 0;
  }

  // 混雑度のクラス
  function getCrowdClass(occupancyRate) {
    if (occupancyRate >= 0.8) return 'bg-error/20 border-error';
    if (occupancyRate >= 0.6) return 'bg-warning/20 border-warning';
    if (occupancyRate >= 0.3) return 'bg-info/20 border-info';
    return 'bg-success/20 border-success';
  }

  // 時間フォーマット
  function formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // 予約をクリック
  function handleBookingClick(booking) {
    dispatch('bookingSelect', { booking });
  }

  // 空き時間をクリック
  function handleSlotClick(roomId, timeSlot) {
    dispatch('newBooking', { 
      roomId, 
      date: selectedDate,
      time: timeSlot.time 
    });
  }

  // リアクティブ変数
  const timeSlots = $derived(generateTimeSlots());
  const dayBookings = $derived(getBookingsForDate(selectedDate));
  const selectedDateFormatted = $derived(
    new Date(selectedDate).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  );
</script>

<div class="daily-schedule-view bg-base-100 rounded-box p-4">
  <!-- ヘッダー -->
  <div class="header mb-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-xl font-bold flex items-center gap-2">
          <span class="text-2xl">📅</span>
          {selectedDateFormatted}
        </h2>
        <p class="text-sm text-base-content/70">
          {dayBookings.length}件の予約 • {$rooms.length}室中{$availableRooms.length}室利用可能
        </p>
      </div>

      <!-- 表示モード切り替え -->
      <div class="flex gap-1">
        <button 
          class="btn btn-sm {viewMode === 'timeline' ? 'btn-primary' : 'btn-outline'}"
          on:click={() => viewMode = 'timeline'}
        >
          タイムライン
        </button>
        <button 
          class="btn btn-sm {viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}"
          on:click={() => viewMode = 'grid'}
        >
          グリッド
        </button>
        <button 
          class="btn btn-sm {viewMode === 'chart' ? 'btn-primary' : 'btn-outline'}"
          on:click={() => viewMode = 'chart'}
        >
          チャート
        </button>
      </div>
    </div>

    <!-- 混雑度インジケータ -->
    {#if $crowdPrediction}
      <div class="mt-4 p-3 bg-base-200 rounded-lg">
        <h3 class="text-sm font-semibold mb-2 flex items-center gap-2">
          <span>📊</span>
          本日の混雑予測
        </h3>
        <div class="flex gap-1 h-3">
          {#each Array.from({length: 14}, (_, i) => i + 8) as hour}
            {@const crowdLevel = getCrowdLevel(hour)}
            <div 
              class="flex-1 rounded-sm {getCrowdClass(crowdLevel)}"
              title="{hour}:00 - 利用率 {Math.round(crowdLevel * 100)}%"
            ></div>
          {/each}
        </div>
        <div class="flex justify-between text-xs text-base-content/60 mt-1">
          <span>8:00</span>
          <span>15:00</span>
          <span>22:00</span>
        </div>
      </div>
    {/if}
  </div>

  <!-- メインコンテンツ -->
  {#if viewMode === 'timeline'}
    <!-- タイムライン表示 -->
    <div class="timeline-view">
      <div class="grid grid-cols-1 gap-4">
        {#each $rooms as room}
          <div class="room-timeline card bg-base-200">
            <div class="card-body p-4">
              <!-- 会議室ヘッダー -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">{getRoomTypeIcon(room.type)}</span>
                  <div>
                    <h3 class="font-bold">{room.name}</h3>
                    <p class="text-sm text-base-content/60">
                      {room.capacity}名 • {room.floor}F • {room.code}
                    </p>
                  </div>
                </div>
                <span class="badge {room.isActive ? 'badge-success' : 'badge-error'}">
                  {room.isActive ? '利用可能' : '利用不可'}
                </span>
              </div>

              <!-- タイムライングリッド -->
              <div class="timeline-grid grid grid-cols-28 gap-1 min-h-16">
                {#each timeSlots as timeSlot, index}
                  {@const slotStatus = getSlotStatus(room.id, timeSlot)}
                  <div 
                    class="time-slot relative cursor-pointer rounded border transition-all duration-200
                           {slotStatus.class}
                           {index % 2 === 0 ? 'border-l-2 border-base-content/20' : 'border-base-content/10'}
                           hover:scale-105 hover:z-10"
                    title="{room.name} - {timeSlot.time} {slotStatus.status === 'occupied' ? '- ' + slotStatus.booking.title : '- 空き時間'}"
                    on:click={() => {
                      if (slotStatus.status === 'occupied') {
                        handleBookingClick(slotStatus.booking);
                      } else {
                        handleSlotClick(room.id, timeSlot);
                      }
                    }}
                  >
                    <!-- 予約情報 -->
                    {#if slotStatus.status === 'occupied' && getBookingPosition(slotStatus.booking) === index}
                      <div class="absolute inset-0 flex items-center justify-center text-xs font-semibold truncate px-1"
                           style="width: {getBookingDuration(slotStatus.booking) * 100}%">
                        {slotStatus.booking.title}
                      </div>
                    {/if}

                    <!-- 時間ラベル（毎時間） -->
                    {#if timeSlot.minute === 0}
                      <div class="absolute -top-6 left-0 text-xs font-mono text-base-content/60">
                        {timeSlot.time}
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

  {:else if viewMode === 'grid'}
    <!-- グリッド表示 -->
    <div class="grid-view">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each $rooms as room}
          {@const roomBookings = dayBookings.filter(b => b.roomId === room.id)}
          <div class="room-card card bg-base-200 hover:bg-base-300 transition-colors">
            <div class="card-body p-4">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-xl">{getRoomTypeIcon(room.type)}</span>
                <div class="flex-1">
                  <h3 class="font-bold text-sm">{room.name}</h3>
                  <p class="text-xs text-base-content/60">{room.capacity}名 • {room.floor}F</p>
                </div>
                <span class="badge badge-sm {room.isActive ? 'badge-success' : 'badge-error'}">
                  {room.isActive ? '利用可' : '利用不可'}
                </span>
              </div>

              <!-- 本日の予約一覧 -->
              <div class="space-y-2 max-h-48 overflow-y-auto">
                {#if roomBookings.length === 0}
                  <div class="text-center py-4 text-base-content/60">
                    <span class="text-2xl">🎉</span>
                    <p class="text-xs mt-1">本日は空いています</p>
                  </div>
                {:else}
                  {#each roomBookings as booking}
                    <div 
                      class="booking-item p-2 rounded bg-base-100 cursor-pointer hover:bg-base-300 transition-colors"
                      on:click={() => handleBookingClick(booking)}
                    >
                      <div class="flex justify-between items-start">
                        <div class="flex-1">
                          <p class="font-semibold text-xs">{booking.title}</p>
                          <p class="text-xs text-base-content/60">
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </p>
                          <p class="text-xs text-base-content/60">
                            {booking.userName} • {booking.attendeeCount}名
                          </p>
                        </div>
                        <span class="badge badge-xs {getBookingStatusClass(booking.status).replace('bg-', 'badge-').replace(' text-primary-content', '').replace(' text-warning-content', '').replace(' text-info-content', '').replace(' text-base-content', '')}">
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  {/each}
                {/if}
              </div>

              <!-- 簡易空き状況表示 -->
              <div class="mt-3 pt-3 border-t border-base-300">
                <div class="flex justify-between text-xs">
                  <span>稼働率</span>
                  <span>{Math.round((roomBookings.length / timeSlots.length) * 100)}%</span>
                </div>
                <div class="w-full bg-base-300 rounded-full h-2 mt-1">
                  <div 
                    class="bg-primary h-2 rounded-full transition-all duration-300"
                    style="width: {(roomBookings.length / timeSlots.length) * 100}%"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

  {:else}
    <!-- チャート表示 -->
    <div class="chart-view">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 時間別利用状況 -->
        <div class="card bg-base-200">
          <div class="card-body">
            <h3 class="card-title text-base">時間別利用状況</h3>
            <div class="space-y-2">
              {#each Array.from({length: 14}, (_, i) => i + 8) as hour}
                {@const hourBookings = dayBookings.filter(b => new Date(b.startTime).getHours() === hour)}
                {@const utilization = (hourBookings.length / $rooms.length) * 100}
                <div class="flex items-center gap-3">
                  <span class="text-sm font-mono w-12">{hour}:00</span>
                  <div class="flex-1 bg-base-300 rounded-full h-3">
                    <div 
                      class="bg-gradient-to-r from-success to-warning h-3 rounded-full transition-all duration-300"
                      style="width: {utilization}%"
                    ></div>
                  </div>
                  <span class="text-xs w-12 text-right">{Math.round(utilization)}%</span>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- 会議室タイプ別統計 -->
        <div class="card bg-base-200">
          <div class="card-body">
            <h3 class="card-title text-base">会議室タイプ別利用状況</h3>
            <div class="space-y-3">
              {#each Object.entries($rooms.reduce((acc, room) => { acc[room.type] = (acc[room.type] || 0) + 1; return acc; }, {})) as [type, count]}
                {@const typeBookings = dayBookings.filter(b => $rooms.find(r => r.id === b.roomId)?.type === type)}
                {@const typeUtilization = (typeBookings.length / count) * 100}
                <div class="space-y-1">
                  <div class="flex justify-between items-center">
                    <span class="text-sm flex items-center gap-2">
                      {getRoomTypeIcon(type)}
                      {type}
                    </span>
                    <span class="text-xs">{typeBookings.length}/{count}</span>
                  </div>
                  <div class="w-full bg-base-300 rounded-full h-2">
                    <div 
                      class="bg-accent h-2 rounded-full"
                      style="width: {typeUtilization}%"
                    ></div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .timeline-grid {
    /* 28列 = 14時間 × 2（30分刻み） */
    grid-template-columns: repeat(28, minmax(0, 1fr));
  }
  
  .time-slot {
    min-height: 3rem;
    position: relative;
  }
  
  .room-timeline {
    transition: all 0.2s ease;
  }
  
  .room-timeline:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -5px rgb(0 0 0 / 0.1);
  }
  
  .booking-item {
    transition: all 0.2s ease;
  }
  
  .booking-item:hover {
    transform: scale(1.02);
  }
  
  .daily-schedule-view {
    max-width: 100%;
    overflow-x: auto;
  }
  
  /* レスポンシブ対応 */
  @media (max-width: 768px) {
    .timeline-grid {
      grid-template-columns: repeat(14, minmax(0, 1fr));
    }
  }
</style>