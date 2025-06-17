<script lang="ts">
  import type { Doctor, TimeSlot } from '../../types';
  import { resourceStore } from '../../stores/resourceStore';
  
  const { doctors, departments } = resourceStore;
  
  // 選択された医師
  let selectedDoctor = $state<Doctor | null>(null);
  
  // 曜日の配列
  const weekDays = [
    { key: 'monday', label: '月曜日' },
    { key: 'tuesday', label: '火曜日' },
    { key: 'wednesday', label: '水曜日' },
    { key: 'thursday', label: '木曜日' },
    { key: 'friday', label: '金曜日' },
    { key: 'saturday', label: '土曜日' },
    { key: 'sunday', label: '日曜日' }
  ];
  
  // 編集モード
  let isEditing = $state(false);
  let editingSchedule = $state<Doctor['schedule'] | null>(null);
  
  // 医師を選択
  function selectDoctor(doctor: Doctor) {
    selectedDoctor = doctor;
    isEditing = false;
    editingSchedule = null;
  }
  
  // 編集開始
  function startEdit() {
    if (!selectedDoctor) return;
    isEditing = true;
    editingSchedule = JSON.parse(JSON.stringify(selectedDoctor.schedule));
  }
  
  // タイムスロット追加
  function addTimeSlot(dayKey: string) {
    if (!editingSchedule) return;
    
    if (!editingSchedule.regularHours[dayKey as keyof typeof editingSchedule.regularHours]) {
      editingSchedule.regularHours[dayKey as keyof typeof editingSchedule.regularHours] = [];
    }
    
    editingSchedule.regularHours[dayKey as keyof typeof editingSchedule.regularHours]!.push({
      startTime: '09:00',
      endTime: '12:00'
    });
  }
  
  // タイムスロット削除
  function removeTimeSlot(dayKey: string, index: number) {
    if (!editingSchedule) return;
    editingSchedule.regularHours[dayKey as keyof typeof editingSchedule.regularHours]?.splice(index, 1);
  }
  
  // 保存
  function saveSchedule() {
    if (!selectedDoctor || !editingSchedule) return;
    
    // 実際にはAPIに保存
    selectedDoctor.schedule = editingSchedule;
    isEditing = false;
    editingSchedule = null;
  }
  
  // キャンセル
  function cancelEdit() {
    isEditing = false;
    editingSchedule = null;
  }
</script>

<div class="doctor-schedule">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- 医師リスト -->
    <div class="lg:col-span-1">
      <h3 class="text-lg font-semibold mb-4">医師一覧</h3>
      <div class="space-y-2">
        {#each $doctors as doctor}
          <button
            class="w-full text-left p-3 rounded-lg border transition-colors
                   {selectedDoctor?.id === doctor.id ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 hover:bg-base-200 border-base-300'}"
            onclick={() => selectDoctor(doctor)}
          >
            <div class="font-medium">{doctor.name}</div>
            <div class="text-sm opacity-80">
              {$departments.filter(d => doctor.departmentIds.includes(d.id)).map(d => d.name).join('・')}
            </div>
            <div class="text-xs opacity-70 mt-1">
              {doctor.isActive ? '稼働中' : '休止中'}
            </div>
          </button>
        {/each}
      </div>
    </div>
    
    <!-- スケジュール詳細 -->
    <div class="lg:col-span-2">
      {#if selectedDoctor}
        <div class="bg-base-100 rounded-lg p-6">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h3 class="text-lg font-semibold">{selectedDoctor.name} のスケジュール</h3>
              <div class="text-sm text-base-content/70 mt-1">
                平均診察時間: {selectedDoctor.averageConsultationTime}分
                / 1日最大患者数: {selectedDoctor.maxPatientsPerDay}名
              </div>
            </div>
            {#if !isEditing}
              <button class="btn btn-sm btn-primary" onclick={startEdit}>
                編集
              </button>
            {:else}
              <div class="flex gap-2">
                <button class="btn btn-sm" onclick={cancelEdit}>
                  キャンセル
                </button>
                <button class="btn btn-sm btn-primary" onclick={saveSchedule}>
                  保存
                </button>
              </div>
            {/if}
          </div>
          
          <!-- 通常スケジュール -->
          <div class="space-y-4">
            <h4 class="font-medium">通常スケジュール</h4>
            {#each weekDays as day}
              {@const schedule = isEditing ? editingSchedule?.regularHours[day.key as keyof typeof editingSchedule.regularHours] : selectedDoctor.schedule.regularHours[day.key as keyof typeof selectedDoctor.schedule.regularHours]}
              <div class="border rounded-lg p-4">
                <div class="flex justify-between items-center mb-2">
                  <h5 class="font-medium">{day.label}</h5>
                  {#if isEditing}
                    <button 
                      class="btn btn-xs btn-ghost"
                      onclick={() => addTimeSlot(day.key)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      時間追加
                    </button>
                  {/if}
                </div>
                
                {#if schedule && schedule.length > 0}
                  <div class="space-y-2">
                    {#each schedule as slot, index}
                      <div class="flex items-center gap-2">
                        {#if isEditing}
                          <input
                            type="time"
                            class="input input-sm input-bordered"
                            bind:value={slot.startTime}
                          />
                          <span>〜</span>
                          <input
                            type="time"
                            class="input input-sm input-bordered"
                            bind:value={slot.endTime}
                          />
                          <button
                            class="btn btn-sm btn-ghost btn-square"
                            onclick={() => removeTimeSlot(day.key, index)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        {:else}
                          <div class="badge badge-lg">
                            {slot.startTime} 〜 {slot.endTime}
                          </div>
                        {/if}
                      </div>
                    {/each}
                  </div>
                {:else}
                  <div class="text-sm text-base-content/50">休診</div>
                {/if}
              </div>
            {/each}
          </div>
          
          <!-- 休暇情報 -->
          {#if selectedDoctor.schedule.vacations.length > 0}
            <div class="mt-6">
              <h4 class="font-medium mb-3">休暇予定</h4>
              <div class="space-y-2">
                {#each selectedDoctor.schedule.vacations as vacation}
                  <div class="flex items-center gap-2">
                    <div class="badge badge-warning">
                      {new Date(vacation.startDate).toLocaleDateString('ja-JP')} 〜 
                      {new Date(vacation.endDate).toLocaleDateString('ja-JP')}
                    </div>
                    {#if vacation.reason}
                      <span class="text-sm">({vacation.reason})</span>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <div class="bg-base-100 rounded-lg p-6 text-center text-base-content/50">
          医師を選択してください
        </div>
      {/if}
    </div>
  </div>
</div>