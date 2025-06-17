<script lang="ts">
  import type { Booking, Doctor } from '../../types';
  import { bookingStore } from '../../stores/bookingStore';
  import { resourceStore } from '../../stores/resourceStore';
  
  let { selectedDate = new Date() } = $props();
  
  const { filteredBookings } = bookingStore;
  const { activeDoctors, departments } = resourceStore;
  
  // 週の開始日（月曜日）を計算
  const weekStart = $derived.by(() => {
    const date = new Date(selectedDate);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  });
  
  // 週の日付配列を生成
  const weekDays = $derived.by(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push(date);
    }
    return days;
  });
  
  // 医師ごとの週間予約状況を整理
  const weeklySchedule = $derived.by(() => {
    const schedule: Record<string, Record<string, { 
      bookings: Booking[], 
      slots: { time: string, hasBooking: boolean, booking?: Booking }[] 
    }>> = {};
    
    $activeDoctors.forEach(doctor => {
      schedule[doctor.id] = {};
      
      weekDays.forEach(day => {
        const dayStr = day.toISOString().split('T')[0];
        const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][day.getDay()];
        const doctorSchedule = doctor.schedule.regularHours[dayName as keyof typeof doctor.schedule.regularHours];
        
        const dayBookings = $filteredBookings.filter(booking => 
          booking.doctorId === doctor.id && 
          booking.startTime.startsWith(dayStr)
        );
        
        const slots: { time: string, hasBooking: boolean, booking?: Booking }[] = [];
        
        if (doctorSchedule) {
          doctorSchedule.forEach(slot => {
            const [startHour, startMin] = slot.startTime.split(':').map(Number);
            const [endHour, endMin] = slot.endTime.split(':').map(Number);
            const slotDuration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
            const numberOfSlots = Math.floor(slotDuration / 30); // 30分単位
            
            for (let i = 0; i < numberOfSlots; i++) {
              const slotStart = (startHour * 60 + startMin) + (i * 30);
              const hour = Math.floor(slotStart / 60);
              const minute = slotStart % 60;
              const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
              
              const booking = dayBookings.find(b => {
                const bookingTime = new Date(b.startTime).toTimeString().substring(0, 5);
                return bookingTime === timeStr;
              });
              
              slots.push({
                time: timeStr,
                hasBooking: !!booking,
                booking
              });
            }
          });
        }
        
        schedule[doctor.id][dayStr] = { bookings: dayBookings, slots };
      });
    });
    
    return schedule;
  });
  
  // 今日かどうか判定
  function isToday(date: Date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
  
  // 予約の詳細を表示
  let selectedBooking = $state<Booking | null>(null);
  
  // 混雑度を計算（0-100%）
  function getCongestionLevel(doctor: Doctor, dayStr: string): number {
    const bookings = weeklySchedule[doctor.id]?.[dayStr]?.bookings || [];
    const slots = weeklySchedule[doctor.id]?.[dayStr]?.slots || [];
    if (slots.length === 0) return 0;
    return (bookings.length / slots.length) * 100;
  }
  
  // 混雑度に応じた色を取得
  function getCongestionColor(level: number): string {
    if (level >= 80) return 'bg-error/20 text-error';
    if (level >= 60) return 'bg-warning/20 text-warning';
    if (level >= 40) return 'bg-success/20 text-success';
    if (level > 0) return 'bg-info/20 text-info';
    return 'bg-base-200 text-base-content/50';
  }
</script>

<div class="week-view">
  <div class="overflow-x-auto">
    <table class="table table-sm">
      <thead>
        <tr>
          <th class="sticky left-0 z-10 bg-base-100">医師</th>
          {#each weekDays as day}
            <th class="text-center min-w-[120px] {isToday(day) ? 'bg-primary/10' : ''}">
              <div class="font-medium">
                {day.toLocaleDateString('ja-JP', { weekday: 'short' })}
              </div>
              <div class="text-lg {isToday(day) ? 'text-primary font-bold' : ''}">
                {day.getDate()}
              </div>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each $activeDoctors as doctor}
          <tr class="hover">
            <td class="sticky left-0 z-10 bg-base-100 font-medium">
              <div>{doctor.name}</div>
              <div class="text-xs text-base-content/70">
                {$departments.find(d => doctor.departmentIds.includes(d.id))?.name}
              </div>
            </td>
            {#each weekDays as day}
              {@const dayStr = day.toISOString().split('T')[0]}
              {@const schedule = weeklySchedule[doctor.id]?.[dayStr]}
              {@const congestionLevel = getCongestionLevel(doctor, dayStr)}
              <td class="p-2">
                {#if schedule && schedule.slots.length > 0}
                  <div class="space-y-1">
                    <!-- 予約サマリー -->
                    <div class="text-center p-2 rounded-lg {getCongestionColor(congestionLevel)}">
                      <div class="text-lg font-bold">
                        {schedule.bookings.length}/{schedule.slots.length}
                      </div>
                      <div class="text-xs">
                        予約済
                      </div>
                    </div>
                    
                    <!-- タイムスロット表示（コンパクト） -->
                    <div class="grid grid-cols-4 gap-0.5">
                      {#each schedule.slots.slice(0, 12) as slot}
                        <div 
                          class="h-2 rounded {slot.hasBooking ? 'bg-primary' : 'bg-base-300'}"
                          title="{slot.time} {slot.hasBooking ? '予約あり' : '空き'}"
                        ></div>
                      {/each}
                      {#if schedule.slots.length > 12}
                        <div class="col-span-4 text-center text-xs text-base-content/50">
                          +{schedule.slots.length - 12}
                        </div>
                      {/if}
                    </div>
                    
                    <!-- 主な予約情報 -->
                    {#if schedule.bookings.length > 0}
                      <div class="text-xs space-y-0.5 mt-2">
                        {#each schedule.bookings.slice(0, 2) as booking}
                          <div 
                            class="truncate cursor-pointer hover:text-primary"
                            role="button"
                            tabindex="0"
                            onclick={() => selectedBooking = booking}
                          >
                            {new Date(booking.startTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                            {booking.patientName}
                          </div>
                        {/each}
                        {#if schedule.bookings.length > 2}
                          <div class="text-base-content/50">
                            他{schedule.bookings.length - 2}件
                          </div>
                        {/if}
                      </div>
                    {/if}
                  </div>
                {:else}
                  <div class="text-center text-base-content/30 p-4">
                    休診
                  </div>
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  
  <!-- 凡例 -->
  <div class="mt-4 flex flex-wrap gap-4 text-sm">
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 bg-error/20 rounded"></div>
      <span>混雑（80%以上）</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 bg-warning/20 rounded"></div>
      <span>やや混雑（60-79%）</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 bg-success/20 rounded"></div>
      <span>通常（40-59%）</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 bg-info/20 rounded"></div>
      <span>空き多数（1-39%）</span>
    </div>
  </div>
</div>

<!-- 予約詳細モーダル -->
{#if selectedBooking}
  <dialog class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">予約詳細</h3>
      <div class="space-y-2">
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="text-base-content/70">患者名:</div>
          <div class="font-medium">{selectedBooking.patientName}</div>
          <div class="text-base-content/70">予約日時:</div>
          <div>{new Date(selectedBooking.startTime).toLocaleString('ja-JP')}</div>
          <div class="text-base-content/70">診療科:</div>
          <div>{selectedBooking.departmentName}</div>
          <div class="text-base-content/70">担当医:</div>
          <div>{selectedBooking.doctorName}</div>
          <div class="text-base-content/70">ステータス:</div>
          <div>
            <span class="badge badge-sm">
              {selectedBooking.status}
            </span>
          </div>
          {#if selectedBooking.chiefComplaint}
            <div class="text-base-content/70">主訴:</div>
            <div>{selectedBooking.chiefComplaint}</div>
          {/if}
        </div>
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