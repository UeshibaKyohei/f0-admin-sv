<script lang="ts">
  import { bookingStore } from '../stores/bookingStore';
  import { resourceStore } from '../stores/resourceStore';
  import type { Booking, Doctor, Department } from '../types';
  import { CONFIG } from '../config';
  
  const { bookings, patients } = bookingStore;
  const { departments, activeDoctors } = resourceStore;
  
  // ログインユーザー
  const currentPatient = CONFIG.isMockMode 
    ? $patients.find(p => p.id === CONFIG.demoUsers.patient.id)! // モックモード: デモユーザー
    : null; // 本実装モード: 認証システムから取得
  
  // 本実装モード時は認証チェックが必要
  if (!CONFIG.isMockMode && !currentPatient) {
    // TODO: 認証画面へリダイレクト
    console.error('Authentication required');
  }
  
  // 画面の状態
  let activeTab = $state<'new' | 'list' | 'history'>('new');
  let selectedDepartment = $state<string>('');
  let selectedDoctor = $state<string>('');
  let selectedDate = $state<string>(new Date().toISOString().split('T')[0]);
  let showConfirmModal = $state(false);
  let selectedSlot = $state<{time: string, doctor: Doctor} | null>(null);
  
  // 患者の予約一覧
  const myBookings = $derived.by(() => {
    return $bookings
      .filter(b => b.patientId === currentPatient.id)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  });
  
  // 今後の予約
  const upcomingBookings = $derived.by(() => {
    const now = new Date().toISOString();
    return myBookings.filter(b => b.startTime > now && b.status !== 'cancelled');
  });
  
  // 過去の予約
  const pastBookings = $derived.by(() => {
    const now = new Date().toISOString();
    return myBookings.filter(b => b.startTime <= now || b.status === 'cancelled');
  });
  
  // 選択された診療科の医師
  const filteredDoctors = $derived.by(() => {
    if (!selectedDepartment) return [];
    return $activeDoctors.filter(doc => 
      doc.departmentIds.includes(selectedDepartment)
    );
  });
  
  // 利用可能な時間枠を取得
  const availableSlots = $derived.by(() => {
    if (!selectedDate || !selectedDoctor) return [];
    
    const doctor = $activeDoctors.find(d => d.id === selectedDoctor);
    if (!doctor) return [];
    
    const dayOfWeek = new Date(selectedDate).getDay();
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
    const schedule = doctor.schedule.regularHours[dayName as keyof typeof doctor.schedule.regularHours];
    
    if (!schedule) return [];
    
    // 既存の予約を取得
    const existingBookings = $bookings.filter(b => 
      b.doctorId === selectedDoctor && 
      b.startTime.startsWith(selectedDate) &&
      b.status !== 'cancelled'
    );
    
    // 時間枠を生成
    const slots: Array<{time: string, available: boolean}> = [];
    
    schedule.forEach(slot => {
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);
      const slotMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
      const numberOfSlots = Math.floor(slotMinutes / doctor.averageConsultationTime);
      
      for (let i = 0; i < numberOfSlots; i++) {
        const slotStart = (startHour * 60 + startMin) + (i * doctor.averageConsultationTime);
        const hour = Math.floor(slotStart / 60);
        const minute = slotStart % 60;
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // この時間が予約済みかチェック
        const isBooked = existingBookings.some(b => {
          const bookingTime = new Date(b.startTime).toTimeString().substring(0, 5);
          return bookingTime === timeStr;
        });
        
        slots.push({ time: timeStr, available: !isBooked });
      }
    });
    
    return slots;
  });
  
  // 予約確定
  function confirmBooking() {
    if (!selectedSlot) return;
    
    const booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> = {
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      doctorId: selectedSlot.doctor.id,
      doctorName: selectedSlot.doctor.name,
      departmentId: selectedDepartment,
      departmentName: $departments.find(d => d.id === selectedDepartment)?.name || '',
      startTime: new Date(`${selectedDate}T${selectedSlot.time}`).toISOString(),
      endTime: new Date(new Date(`${selectedDate}T${selectedSlot.time}`).getTime() + selectedSlot.doctor.averageConsultationTime * 60000).toISOString(),
      type: 'follow-up',
      status: 'booked',
      isRecurring: false
    };
    
    bookingStore.addBooking(booking);
    showConfirmModal = false;
    selectedSlot = null;
    activeTab = 'list';
  }
  
  // 予約キャンセル
  function cancelBooking(bookingId: string) {
    if (confirm('予約をキャンセルしてもよろしいですか？')) {
      bookingStore.updateBookingStatus(bookingId, 'cancelled');
    }
  }
  
  // 日付の最小値（今日）
  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 60日後まで
</script>

<div class="min-h-screen bg-base-200">
  <!-- ヘッダー -->
  <div class="navbar bg-base-100 shadow-sm">
    <div class="flex-1">
      <a href="/sample/data-management/yoyaku-clinic" class="btn btn-ghost text-xl">
        さくら総合クリニック
      </a>
    </div>
    <div class="flex-none gap-2">
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <div class="avatar placeholder">
              <div class="bg-success text-success-content rounded-full w-10">
                <span>{currentPatient.name.charAt(0)}</span>
              </div>
            </div>
          </div>
        </div>
        <ul tabindex="0" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
          <li class="menu-title">{currentPatient.name}様</li>
          <li><a>プロフィール</a></li>
          <li><a>診療履歴</a></li>
          <li><a href="/sample/data-management/yoyaku-clinic">ログアウト</a></li>
        </ul>
      </div>
    </div>
  </div>
  
  <div class="container mx-auto p-4 max-w-6xl">
    <!-- タブ -->
    <div class="tabs tabs-boxed mb-6">
      <button 
        class="tab {activeTab === 'new' ? 'tab-active' : ''}"
        onclick={() => activeTab = 'new'}
      >
        新規予約
      </button>
      <button 
        class="tab {activeTab === 'list' ? 'tab-active' : ''}"
        onclick={() => activeTab = 'list'}
      >
        予約確認
        {#if upcomingBookings.length > 0}
          <span class="badge badge-sm badge-primary ml-2">{upcomingBookings.length}</span>
        {/if}
      </button>
      <button 
        class="tab {activeTab === 'history' ? 'tab-active' : ''}"
        onclick={() => activeTab = 'history'}
      >
        受診履歴
      </button>
    </div>
    
    {#if activeTab === 'new'}
      <!-- 新規予約 -->
      <div class="bg-base-100 rounded-lg shadow-sm p-6">
        <h2 class="text-2xl font-bold mb-6">診療予約</h2>
        
        <div class="grid md:grid-cols-2 gap-6">
          <!-- 予約フォーム -->
          <div class="space-y-4">
            <!-- 診療科選択 -->
            <div>
              <label class="label">
                <span class="label-text">診療科を選択</span>
              </label>
              <select 
                class="select select-bordered w-full"
                bind:value={selectedDepartment}
              >
                <option value="">選択してください</option>
                {#each $departments as dept}
                  <option value={dept.id}>{dept.name}</option>
                {/each}
              </select>
            </div>
            
            <!-- 医師選択 -->
            {#if selectedDepartment}
              <div>
                <label class="label">
                  <span class="label-text">担当医師</span>
                </label>
                <select 
                  class="select select-bordered w-full"
                  bind:value={selectedDoctor}
                >
                  <option value="">選択してください</option>
                  {#each filteredDoctors as doctor}
                    <option value={doctor.id}>{doctor.name}</option>
                  {/each}
                </select>
              </div>
            {/if}
            
            <!-- 日付選択 -->
            {#if selectedDoctor}
              <div>
                <label class="label">
                  <span class="label-text">予約日</span>
                </label>
                <input 
                  type="date" 
                  class="input input-bordered w-full"
                  bind:value={selectedDate}
                  min={minDate}
                  max={maxDate}
                />
              </div>
            {/if}
          </div>
          
          <!-- 時間選択 -->
          <div>
            {#if availableSlots.length > 0}
              <h3 class="text-lg font-semibold mb-4">予約可能時間</h3>
              <div class="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                {#each availableSlots as slot}
                  <button
                    class="btn btn-sm {slot.available ? 'btn-outline btn-primary' : 'btn-disabled'}"
                    onclick={() => {
                      if (slot.available) {
                        selectedSlot = { time: slot.time, doctor: $activeDoctors.find(d => d.id === selectedDoctor)! };
                        showConfirmModal = true;
                      }
                    }}
                    disabled={!slot.available}
                  >
                    {slot.time}
                  </button>
                {/each}
              </div>
            {:else if selectedDate && selectedDoctor}
              <div class="alert">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>この日は予約可能な時間がありません</span>
              </div>
            {/if}
          </div>
        </div>
      </div>
    {:else if activeTab === 'list'}
      <!-- 予約一覧 -->
      <div class="bg-base-100 rounded-lg shadow-sm p-6">
        <h2 class="text-2xl font-bold mb-6">予約一覧</h2>
        
        {#if upcomingBookings.length === 0}
          <div class="text-center py-8 text-base-content/50">
            予約はありません
          </div>
        {:else}
          <div class="space-y-4">
            {#each upcomingBookings as booking}
              <div class="card bg-base-200">
                <div class="card-body">
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="text-lg font-semibold">
                        {new Date(booking.startTime).toLocaleDateString('ja-JP', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          weekday: 'long'
                        })}
                      </h3>
                      <p class="text-2xl font-bold text-primary mt-1">
                        {new Date(booking.startTime).toLocaleTimeString('ja-JP', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      <div class="mt-2 space-y-1 text-sm">
                        <p><span class="font-medium">診療科:</span> {booking.departmentName}</p>
                        <p><span class="font-medium">担当医:</span> {booking.doctorName}</p>
                        {#if booking.roomName}
                          <p><span class="font-medium">診察室:</span> {booking.roomName}</p>
                        {/if}
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="badge badge-primary mb-2">{booking.status === 'booked' ? '予約確定' : '受付済'}</div>
                      {#if new Date(booking.startTime).getTime() > Date.now() + 24 * 60 * 60 * 1000}
                        <button 
                          class="btn btn-sm btn-error btn-outline"
                          onclick={() => cancelBooking(booking.id)}
                        >
                          キャンセル
                        </button>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {:else if activeTab === 'history'}
      <!-- 受診履歴 -->
      <div class="bg-base-100 rounded-lg shadow-sm p-6">
        <h2 class="text-2xl font-bold mb-6">受診履歴</h2>
        
        {#if pastBookings.length === 0}
          <div class="text-center py-8 text-base-content/50">
            受診履歴はありません
          </div>
        {:else}
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>受診日</th>
                  <th>診療科</th>
                  <th>担当医</th>
                  <th>主訴</th>
                  <th>状態</th>
                </tr>
              </thead>
              <tbody>
                {#each pastBookings as booking}
                  <tr>
                    <td>
                      {new Date(booking.startTime).toLocaleDateString('ja-JP')}
                    </td>
                    <td>{booking.departmentName}</td>
                    <td>{booking.doctorName}</td>
                    <td>{booking.chiefComplaint || '-'}</td>
                    <td>
                      {#if booking.status === 'completed'}
                        <span class="badge badge-success">受診済</span>
                      {:else if booking.status === 'cancelled'}
                        <span class="badge badge-error">キャンセル</span>
                      {:else if booking.status === 'no-show'}
                        <span class="badge badge-warning">未受診</span>
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<!-- 予約確認モーダル -->
<dialog class="modal" class:modal-open={showConfirmModal}>
  <div class="modal-box">
    <h3 class="font-bold text-lg mb-4">予約内容の確認</h3>
    
    {#if selectedSlot}
      <div class="space-y-3">
        <div class="flex justify-between">
          <span class="font-medium">予約日時:</span>
          <span>
            {new Date(selectedDate).toLocaleDateString('ja-JP')} {selectedSlot.time}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium">診療科:</span>
          <span>{$departments.find(d => d.id === selectedDepartment)?.name}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium">担当医:</span>
          <span>{selectedSlot.doctor.name}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium">診察時間:</span>
          <span>約{selectedSlot.doctor.averageConsultationTime}分</span>
        </div>
      </div>
      
      <div class="alert alert-info mt-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span class="text-sm">予約時間の10分前までにお越しください</span>
      </div>
    {/if}
    
    <div class="modal-action">
      <button class="btn" onclick={() => showConfirmModal = false}>
        キャンセル
      </button>
      <button class="btn btn-primary" onclick={confirmBooking}>
        予約を確定
      </button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop" onclick={() => showConfirmModal = false}>
    <button>close</button>
  </form>
</dialog>