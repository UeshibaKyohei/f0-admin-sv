<script lang="ts">
  import type { Booking } from '../../types';
  import { bookingStore } from '../../stores/bookingStore';
  import { resourceStore } from '../../stores/resourceStore';
  
  let { selectedDate = new Date() } = $props();
  
  const { filteredBookings, updateBookingStatus } = bookingStore;
  const { activeDoctors, departments, activeRooms } = resourceStore;
  
  // 時間スロット（15分単位）
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 4) + 8;
    const minute = (i % 4) * 15;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });
  
  // 選択日の予約を取得
  const dayBookings = $derived.by(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return $filteredBookings.filter(b => b.startTime.startsWith(dateStr))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  });
  
  // タブ切り替え
  let viewTab = $state<'timeline' | 'doctors' | 'rooms'>('timeline');
  
  // 選択された予約
  let selectedBooking = $state<Booking | null>(null);
  
  // 選択された時間帯とフィルター
  let selectedTimeSlot = $state<string | null>(null);
  let filterStatus = $state<Booking['status'] | null>(null);
  
  // 予約の位置とサイズを計算（15分 = 40px）
  function getBookingPosition(booking: Booking) {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    const startMinutes = (start.getHours() - 8) * 60 + start.getMinutes();
    const duration = (end.getTime() - start.getTime()) / (1000 * 60);
    
    return {
      top: (startMinutes / 15) * 40,
      height: Math.max((duration / 15) * 40, 40), // 最小高さ40px
    };
  }
  
  // ステータスに応じた色
  const statusColors = {
    'booked': 'bg-primary text-primary-content',
    'checked-in': 'bg-warning text-warning-content',
    'in-progress': 'bg-info text-info-content',
    'completed': 'bg-success text-success-content',
    'cancelled': 'bg-base-300 text-base-content line-through opacity-50',
    'no-show': 'bg-error text-error-content opacity-50'
  };
  
  // 現在時刻のライン位置
  const currentTimePosition = $derived.by(() => {
    const now = new Date();
    if (selectedDate.toDateString() !== now.toDateString()) return null;
    
    const minutes = (now.getHours() - 8) * 60 + now.getMinutes();
    if (minutes < 0 || minutes > 12 * 60) return null;
    return (minutes / 15) * 40;
  });
  
  // リソース別の予約をグループ化
  const bookingsByResource = $derived.by(() => {
    const byDoctor: Record<string, Booking[]> = {};
    const byRoom: Record<string, Booking[]> = {};
    
    $activeDoctors.forEach(doc => {
      byDoctor[doc.id] = dayBookings.filter(b => b.doctorId === doc.id);
    });
    
    $activeRooms.forEach(room => {
      byRoom[room.id] = dayBookings.filter(b => b.roomId === room.id);
    });
    
    return { byDoctor, byRoom };
  });
  
  // 予約が重なっているかチェック（改善版）
  function checkOverlap(bookings: Booking[]): { map: Map<string, number>, maxColumns: number, timeSlotColumns: Map<string, number> } {
    const overlapMap = new Map<string, number>();
    const timeSlotColumns = new Map<string, number>(); // 各時間帯の最大カラム数
    const sorted = [...bookings].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    
    // 各時間帯での最大重なり数を計算
    let globalMaxColumns = 0;
    
    // すべての時間帯での重なりを計算
    sorted.forEach((booking) => {
      const start = new Date(booking.startTime);
      const end = new Date(booking.endTime);
      
      // この予約と重なる全ての予約を取得
      const overlappingBookings = sorted.filter(other => {
        if (other.id === booking.id) return false;
        const otherStart = new Date(other.startTime);
        const otherEnd = new Date(other.endTime);
        return otherStart < end && otherEnd > start;
      });
      
      // 使用されているカラムを追跡
      const usedColumns = new Set<number>();
      overlappingBookings.forEach(other => {
        const col = overlapMap.get(other.id);
        if (col !== undefined) usedColumns.add(col);
      });
      
      // 最小の空きカラムを見つける
      let column = 0;
      while (usedColumns.has(column)) {
        column++;
      }
      
      overlapMap.set(booking.id, column);
      
      // この時間帯の最大カラム数を更新
      const startMinutes = (start.getHours() - 8) * 60 + start.getMinutes();
      const endMinutes = (end.getHours() - 8) * 60 + end.getMinutes();
      for (let min = startMinutes; min < endMinutes; min += 15) {
        const key = Math.floor(min / 15).toString();
        const currentMax = timeSlotColumns.get(key) || 0;
        timeSlotColumns.set(key, Math.max(currentMax, column + 1));
      }
      
      globalMaxColumns = Math.max(globalMaxColumns, column + 1);
    });
    
    return { map: overlapMap, maxColumns: globalMaxColumns, timeSlotColumns };
  }
  
  // タイムライン用の重なり情報
  const timelineOverlapInfo = $derived.by(() => {
    return checkOverlap(dayBookings);
  });
  
  // ステータス更新のショートカット
  function quickUpdateStatus(booking: Booking, status: Booking['status']) {
    updateBookingStatus(booking.id, status);
    selectedBooking = null;
  }
</script>

<div class="day-view">
  <!-- ヘッダー -->
  <div class="flex justify-between items-center mb-4">
    <div>
      <h3 class="text-lg font-semibold">
        {selectedDate.toLocaleDateString('ja-JP', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        })}
      </h3>
      <div class="text-sm text-base-content/70">
        予約数: {dayBookings.length}件
      </div>
    </div>
    
    <div class="tabs tabs-boxed">
      <button 
        class="tab {viewTab === 'timeline' ? 'tab-active' : ''}"
        onclick={() => viewTab = 'timeline'}
      >
        タイムライン
      </button>
      <button 
        class="tab {viewTab === 'doctors' ? 'tab-active' : ''}"
        onclick={() => viewTab = 'doctors'}
      >
        医師別
      </button>
      <button 
        class="tab {viewTab === 'rooms' ? 'tab-active' : ''}"
        onclick={() => viewTab = 'rooms'}
      >
        診察室別
      </button>
    </div>
  </div>
  
  <!-- タイムラインビュー -->
  <div class="overflow-x-auto overflow-y-auto" style="max-height: calc(100vh - 400px);">
    {#if viewTab === 'timeline'}
      {@const timelineWidth = Math.max(800, 100 + (timelineOverlapInfo.maxColumns * 310))}
      <!-- リアルタイム進行ビュー -->
      <div class="space-y-4">
        <!-- 現在の状況サマリー -->
        <div class="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <div class="font-bold">現在時刻：{new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</div>
            <div class="text-sm">
              診察中: {dayBookings.filter(b => b.status === 'in-progress').length}件、
              待機中: {dayBookings.filter(b => b.status === 'checked-in').length}件
            </div>
          </div>
        </div>
        
        <!-- タイムライン -->
        <div class="overflow-x-auto">
          <div class="relative" style="min-height: {timeSlots.length * 40}px; min-width: {timelineWidth}px;">
          <!-- 時間軸 -->
          <div class="absolute left-0 top-0 w-20">
            {#each timeSlots as time, index}
              {#if index % 4 === 0}
                <div class="absolute text-sm text-base-content/70" style="top: {index * 40}px">
                  {time}
                </div>
              {/if}
            {/each}
          </div>
          
          <!-- グリッドライン -->
          <div class="absolute left-20 right-0 top-0">
            {#each timeSlots as _, index}
              <div 
                class="absolute w-full border-t {index % 4 === 0 ? 'border-base-300' : 'border-base-200'}"
                style="top: {index * 40}px"
              ></div>
            {/each}
          </div>
          
          <!-- 現在時刻のライン -->
          {#if currentTimePosition !== null}
            <div 
              class="absolute left-20 right-0 h-0.5 bg-error z-10"
              style="top: {currentTimePosition}px"
            >
              <div class="absolute -left-2 -top-2 w-4 h-4 bg-error rounded-full animate-pulse"></div>
              <div class="absolute left-0 -top-6 text-xs text-error font-medium">
                現在
              </div>
            </div>
          {/if}
          
          <!-- 予約ブロック -->
          <div class="absolute left-20 right-0 top-0">
            {#each dayBookings as booking}
              {@const position = getBookingPosition(booking)}
              {@const now = new Date()}
              {@const startTime = new Date(booking.startTime)}
              {@const endTime = new Date(booking.endTime)}
              {@const isDelayed = booking.status === 'checked-in' && startTime < now}
              {@const isNow = booking.status === 'in-progress'}
              {@const column = timelineOverlapInfo.map.get(booking.id) || 0}
              {@const baseWidth = 300}
              {@const leftPosition = column * (baseWidth + 10)}
              
              <div 
                class="absolute rounded-lg p-2 cursor-pointer transition-all hover:shadow-lg hover:z-20
                  {isDelayed ? 'bg-error/10 border-2 border-error' : 
                   isNow ? 'bg-warning/10 border-2 border-warning' : 
                   'bg-base-100 border border-base-300'} {statusColors[booking.status] || ''}"
                style="
                  top: {position.top}px; 
                  height: {position.height}px; 
                  left: {leftPosition + 4}px;
                  width: {baseWidth}px;
                  z-index: {5 + column};
                "
                onclick={() => selectedBooking = booking}
              >
                <div class="flex items-center justify-between h-full">
                  <div class="flex-1 min-w-0">
                    <!-- 時間とステータス -->
                    <div class="flex items-center gap-2 mb-1">
                      <div class="text-xs font-bold">
                        {startTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                        -
                        {endTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div class="badge badge-xs">
                        {booking.status === 'booked' ? '予約' :
                         booking.status === 'checked-in' ? '待機中' :
                         booking.status === 'in-progress' ? '診察中' :
                         booking.status === 'completed' ? '完了' :
                         booking.status === 'cancelled' ? 'キャンセル' : '不明'}
                      </div>
                      {#if isDelayed}
                        <div class="text-xs text-error font-bold">遅延</div>
                      {/if}
                    </div>
                    
                    <!-- 患者情報 -->
                    <div class="text-sm font-medium truncate">{booking.patientName}</div>
                    {#if position.height > 50}
                      <div class="text-xs text-base-content/70 truncate">
                        {booking.doctorName} / {booking.roomName || '診察室未定'}
                      </div>
                    {/if}
                  </div>
                  
                  <!-- アクション -->
                  {#if position.height > 40}
                    <div class="flex flex-col gap-1 ml-2">
                      {#if booking.status === 'checked-in'}
                        {@const waitTime = Math.floor((now.getTime() - new Date(booking.checkedInAt || booking.startTime).getTime()) / 1000 / 60)}
                        <div class="text-xs text-warning font-bold text-right">
                          待機{waitTime}分
                        </div>
                        <button 
                          class="btn btn-xs btn-info"
                          onclick={(e) => {
                            e.stopPropagation();
                            quickUpdateStatus(booking, 'in-progress');
                          }}
                        >
                          開始
                        </button>
                      {/if}
                      {#if booking.status === 'in-progress'}
                        <button 
                          class="btn btn-xs btn-success"
                          onclick={(e) => {
                            e.stopPropagation();
                            quickUpdateStatus(booking, 'completed');
                          }}
                        >
                          完了
                        </button>
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
          </div>
        </div>
      </div>
    {:else if viewTab === 'doctors'}
      <!-- 医師別ビュー -->
      <div>
        {#if selectedTimeSlot || filterStatus}
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              {#if selectedTimeSlot}
                <div class="badge badge-lg">時間帯: {selectedTimeSlot}</div>
              {/if}
              {#if filterStatus}
                <div class="badge badge-lg badge-warning">
                  {filterStatus === 'checked-in' ? '待機患者のみ' : filterStatus}
                </div>
              {/if}
            </div>
            <button 
              class="btn btn-sm btn-ghost"
              onclick={() => {
                selectedTimeSlot = null;
                filterStatus = null;
              }}
            >
              フィルター解除
            </button>
          </div>
        {/if}
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each $activeDoctors as doctor}
            {@const allDoctorBookings = bookingsByResource.byDoctor[doctor.id] || []}
            {@const doctorBookings = allDoctorBookings.filter(b => {
              // 時間帯フィルター
              if (selectedTimeSlot) {
                const [startTime, endTime] = selectedTimeSlot.split('-');
                const bookingTime = new Date(b.startTime).toTimeString().substring(0, 5);
                if (bookingTime < startTime || bookingTime >= endTime) return false;
              }
              // ステータスフィルター
              if (filterStatus && b.status !== filterStatus) return false;
              return true;
            })}
            <div class="card bg-base-100 shadow-sm">
              <div class="card-body p-4">
                <h4 class="card-title text-base">
                  {doctor.name}
                  <div class="badge badge-sm">{doctorBookings.length}件</div>
                </h4>
                <div class="text-xs text-base-content/70 mb-2">
                  {$departments.find(d => doctor.departmentIds.includes(d.id))?.name}
                </div>
                
                <div class="space-y-2 max-h-96 overflow-y-auto">
                  {#if doctorBookings.length === 0}
                    <div class="text-center py-4 text-base-content/50">
                      {
                        filterStatus === 'checked-in' ? '待機患者なし' :
                        selectedTimeSlot ? 'この時間帯の予約なし' :
                        '予約なし'
                      }
                    </div>
                  {:else}
                    {#each doctorBookings as booking}
                      <div 
                        class="p-2 rounded-lg cursor-pointer hover:shadow transition-all {statusColors[booking.status] || 'bg-base-200'}"
                        role="button"
                        tabindex="0"
                        onclick={() => selectedBooking = booking}
                      >
                        <div class="flex justify-between items-start">
                          <div>
                            <div class="font-medium text-sm">{booking.patientName}</div>
                            <div class="text-xs opacity-80">
                              {new Date(booking.startTime).toLocaleTimeString('ja-JP', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                              - {new Date(booking.endTime).toLocaleTimeString('ja-JP', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                            {#if booking.chiefComplaint}
                              <div class="text-xs opacity-70 mt-1">{booking.chiefComplaint}</div>
                            {/if}
                          </div>
                          <div class="flex flex-col items-end gap-1">
                            {#if booking.roomName}
                              <div class="badge badge-sm">{booking.roomName}</div>
                            {/if}
                            {#if booking.status === 'checked-in'}
                              <div class="text-xs text-warning font-semibold">
                                待機中
                              </div>
                            {/if}
                          </div>
                        </div>
                      </div>
                    {/each}
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <!-- 診察室別ビュー -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each $activeRooms as room}
          {@const roomBookings = bookingsByResource.byRoom[room.id] || []}
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body p-4">
              <h4 class="card-title text-base">
                {room.name}
                <div class="badge badge-sm">{roomBookings.length}件</div>
              </h4>
              <div class="text-xs text-base-content/70 mb-2">
                {room.floor}F / {room.type === 'consultation' ? '診察室' : room.type === 'examination' ? '検査室' : '処置室'}
              </div>
              
              <div class="space-y-2 max-h-96 overflow-y-auto">
                {#if roomBookings.length === 0}
                  <div class="text-center py-4 text-base-content/50">
                    使用予定なし
                  </div>
                {:else}
                  {#each roomBookings as booking}
                    <div 
                      class="p-2 rounded-lg cursor-pointer hover:shadow transition-all {statusColors[booking.status] || 'bg-base-200'}"
                      role="button"
                      tabindex="0"
                      onclick={() => selectedBooking = booking}
                    >
                      <div class="flex justify-between items-start">
                        <div>
                          <div class="font-medium text-sm">{booking.patientName}</div>
                          <div class="text-xs opacity-80">
                            {new Date(booking.startTime).toLocaleTimeString('ja-JP', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                            - {new Date(booking.endTime).toLocaleTimeString('ja-JP', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          <div class="text-xs opacity-70 mt-1">{booking.doctorName}</div>
                        </div>
                        <div class="badge badge-sm">{booking.departmentName}</div>
                      </div>
                    </div>
                  {/each}
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- 予約詳細モーダル -->
{#if selectedBooking}
  <dialog class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">予約詳細</h3>
      <div class="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <div class="text-base-content/70 mb-1">患者名</div>
          <div class="font-medium">{selectedBooking.patientName}</div>
        </div>
        <div>
          <div class="text-base-content/70 mb-1">ステータス</div>
          <div class="badge badge-lg {statusColors[selectedBooking.status]?.split(' ')[0]}">
            {selectedBooking.status}
          </div>
        </div>
        <div>
          <div class="text-base-content/70 mb-1">予約時間</div>
          <div>
            {new Date(selectedBooking.startTime).toLocaleTimeString('ja-JP', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
            - {new Date(selectedBooking.endTime).toLocaleTimeString('ja-JP', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
        <div>
          <div class="text-base-content/70 mb-1">診療科</div>
          <div>{selectedBooking.departmentName}</div>
        </div>
        <div>
          <div class="text-base-content/70 mb-1">担当医</div>
          <div>{selectedBooking.doctorName}</div>
        </div>
        <div>
          <div class="text-base-content/70 mb-1">診察室</div>
          <div>{selectedBooking.roomName || '未定'}</div>
        </div>
        {#if selectedBooking.chiefComplaint}
          <div class="col-span-2">
            <div class="text-base-content/70 mb-1">主訴</div>
            <div>{selectedBooking.chiefComplaint}</div>
          </div>
        {/if}
        {#if selectedBooking.notes}
          <div class="col-span-2">
            <div class="text-base-content/70 mb-1">備考</div>
            <div>{selectedBooking.notes}</div>
          </div>
        {/if}
      </div>
      
      <!-- クイックアクション -->
      <div class="divider">ステータス変更</div>
      <div class="flex flex-wrap gap-2">
        {#if selectedBooking.status === 'booked'}
          <button 
            class="btn btn-sm btn-warning"
            onclick={() => quickUpdateStatus(selectedBooking, 'checked-in')}
          >
            受付済みにする
          </button>
        {/if}
        {#if selectedBooking.status === 'checked-in'}
          <button 
            class="btn btn-sm btn-info"
            onclick={() => quickUpdateStatus(selectedBooking, 'in-progress')}
          >
            診察開始
          </button>
        {/if}
        {#if selectedBooking.status === 'in-progress'}
          <button 
            class="btn btn-sm btn-success"
            onclick={() => quickUpdateStatus(selectedBooking, 'completed')}
          >
            診察完了
          </button>
        {/if}
        {#if selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed'}
          <button 
            class="btn btn-sm btn-error"
            onclick={() => quickUpdateStatus(selectedBooking, 'cancelled')}
          >
            キャンセル
          </button>
        {/if}
      </div>
      
      <div class="modal-action">
        <button class="btn" onclick={() => selectedBooking = null}>閉じる</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" onclick={() => selectedBooking = null}>
      <button>close</button>
    </form>
  </dialog>
{/if}