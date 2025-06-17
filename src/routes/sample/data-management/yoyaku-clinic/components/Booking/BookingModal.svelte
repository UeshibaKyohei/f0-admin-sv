<script lang="ts">
  import type { Booking, Patient, Doctor, Department, Room } from '../../types';
  import { bookingStore } from '../../stores/bookingStore';
  import { resourceStore } from '../../stores/resourceStore';
  
  let { open = $bindable(false), booking = null, onSave = () => {} }: {
    open: boolean;
    booking?: Booking | null;
    onSave?: (booking: Partial<Booking>) => void;
  } = $props();
  
  const { patients, addBooking, updateBooking } = bookingStore;
  const { activeDoctors, departments, activeRooms } = resourceStore;
  
  // フォームデータ
  let formData = $state({
    patientId: '',
    patientName: '',
    doctorId: '',
    departmentId: '',
    roomId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    duration: 30,
    type: 'follow-up' as Booking['type'],
    chiefComplaint: '',
    notes: '',
    isNewPatient: false,
    newPatient: {
      name: '',
      kana: '',
      birthDate: '',
      gender: 'male' as Patient['gender'],
      phone: '',
      email: ''
    }
  });
  
  // 編集モードの場合、既存データを設定
  $effect(() => {
    if (booking && open) {
      const start = new Date(booking.startTime);
      const end = new Date(booking.endTime);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60);
      
      formData = {
        patientId: booking.patientId,
        patientName: booking.patientName,
        doctorId: booking.doctorId,
        departmentId: booking.departmentId,
        roomId: booking.roomId || '',
        date: start.toISOString().split('T')[0],
        startTime: start.toTimeString().substring(0, 5),
        duration,
        type: booking.type,
        chiefComplaint: booking.chiefComplaint || '',
        notes: booking.notes || '',
        isNewPatient: false,
        newPatient: {
          name: '',
          kana: '',
          birthDate: '',
          gender: 'male',
          phone: '',
          email: ''
        }
      };
    }
  });
  
  // 診療科が変更されたら医師をフィルター
  const filteredDoctors = $derived.by(() => {
    if (!formData.departmentId) return $activeDoctors;
    return $activeDoctors.filter(doc => 
      doc.departmentIds.includes(formData.departmentId)
    );
  });
  
  // 患者検索
  const searchResults = $derived.by(() => {
    if (!formData.patientName || formData.patientName.length < 2) return [];
    const searchLower = formData.patientName.toLowerCase();
    return $patients.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.kana.toLowerCase().includes(searchLower)
    ).slice(0, 5);
  });
  
  // 患者選択
  function selectPatient(patient: Patient) {
    formData.patientId = patient.id;
    formData.patientName = patient.name;
  }
  
  // 保存処理
  function handleSave() {
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60 * 1000);
    
    const bookingData: Partial<Booking> = {
      patientId: formData.isNewPatient ? `new-${Date.now()}` : formData.patientId,
      patientName: formData.isNewPatient ? formData.newPatient.name : formData.patientName,
      doctorId: formData.doctorId,
      doctorName: $activeDoctors.find(d => d.id === formData.doctorId)?.name || '',
      departmentId: formData.departmentId,
      departmentName: $departments.find(d => d.id === formData.departmentId)?.name || '',
      roomId: formData.roomId,
      roomName: $activeRooms.find(r => r.id === formData.roomId)?.name,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      type: formData.type,
      status: 'booked',
      chiefComplaint: formData.chiefComplaint,
      notes: formData.notes,
      isRecurring: false
    };
    
    if (booking) {
      updateBooking(booking.id, bookingData);
    } else {
      addBooking(bookingData as Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>);
    }
    
    onSave(bookingData);
    handleClose();
  }
  
  // モーダルを閉じる
  function handleClose() {
    open = false;
    // フォームをリセット
    formData = {
      patientId: '',
      patientName: '',
      doctorId: '',
      departmentId: '',
      roomId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      duration: 30,
      type: 'follow-up',
      chiefComplaint: '',
      notes: '',
      isNewPatient: false,
      newPatient: {
        name: '',
        kana: '',
        birthDate: '',
        gender: 'male',
        phone: '',
        email: ''
      }
    };
  }
</script>

<dialog class="modal" class:modal-open={open}>
  <div class="modal-box max-w-2xl">
    <h3 class="font-bold text-lg mb-4">
      {booking ? '予約編集' : '新規予約'}
    </h3>
    
    <form onsubmit={(e) => { e.preventDefault(); handleSave(); }}>
      <div class="grid grid-cols-2 gap-4">
        <!-- 患者選択 -->
        <div class="col-span-2">
          <div class="tabs tabs-boxed mb-4">
            <button
              type="button"
              class="tab {!formData.isNewPatient ? 'tab-active' : ''}"
              onclick={() => formData.isNewPatient = false}
            >
              既存患者
            </button>
            <button
              type="button"
              class="tab {formData.isNewPatient ? 'tab-active' : ''}"
              onclick={() => formData.isNewPatient = true}
            >
              新規患者
            </button>
          </div>
          
          {#if !formData.isNewPatient}
            <div class="relative">
              <label class="label">
                <span class="label-text">患者名</span>
              </label>
              <input
                type="text"
                class="input input-bordered w-full"
                bind:value={formData.patientName}
                placeholder="患者名を入力"
                required
              />
              
              {#if searchResults.length > 0}
                <div class="absolute z-10 w-full mt-1 bg-base-100 border rounded-lg shadow-lg">
                  {#each searchResults as patient}
                    <button
                      type="button"
                      class="w-full p-2 text-left hover:bg-base-200"
                      onclick={() => selectPatient(patient)}
                    >
                      <div class="font-medium">{patient.name} ({patient.kana})</div>
                      <div class="text-sm text-base-content/70">
                        {patient.birthDate} / {patient.phone}
                      </div>
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          {:else}
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">
                  <span class="label-text">氏名</span>
                </label>
                <input
                  type="text"
                  class="input input-bordered w-full"
                  bind:value={formData.newPatient.name}
                  required
                />
              </div>
              <div>
                <label class="label">
                  <span class="label-text">カナ</span>
                </label>
                <input
                  type="text"
                  class="input input-bordered w-full"
                  bind:value={formData.newPatient.kana}
                  required
                />
              </div>
              <div>
                <label class="label">
                  <span class="label-text">生年月日</span>
                </label>
                <input
                  type="date"
                  class="input input-bordered w-full"
                  bind:value={formData.newPatient.birthDate}
                  required
                />
              </div>
              <div>
                <label class="label">
                  <span class="label-text">性別</span>
                </label>
                <select 
                  class="select select-bordered w-full"
                  bind:value={formData.newPatient.gender}
                >
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                </select>
              </div>
              <div>
                <label class="label">
                  <span class="label-text">電話番号</span>
                </label>
                <input
                  type="tel"
                  class="input input-bordered w-full"
                  bind:value={formData.newPatient.phone}
                  required
                />
              </div>
              <div>
                <label class="label">
                  <span class="label-text">メールアドレス</span>
                </label>
                <input
                  type="email"
                  class="input input-bordered w-full"
                  bind:value={formData.newPatient.email}
                />
              </div>
            </div>
          {/if}
        </div>
        
        <!-- 診療科 -->
        <div>
          <label class="label">
            <span class="label-text">診療科</span>
          </label>
          <select 
            class="select select-bordered w-full"
            bind:value={formData.departmentId}
            required
          >
            <option value="">選択してください</option>
            {#each $departments as dept}
              <option value={dept.id}>{dept.name}</option>
            {/each}
          </select>
        </div>
        
        <!-- 医師 -->
        <div>
          <label class="label">
            <span class="label-text">担当医師</span>
          </label>
          <select 
            class="select select-bordered w-full"
            bind:value={formData.doctorId}
            required
          >
            <option value="">選択してください</option>
            {#each filteredDoctors as doctor}
              <option value={doctor.id}>{doctor.name}</option>
            {/each}
          </select>
        </div>
        
        <!-- 日付 -->
        <div>
          <label class="label">
            <span class="label-text">予約日</span>
          </label>
          <input
            type="date"
            class="input input-bordered w-full"
            bind:value={formData.date}
            required
          />
        </div>
        
        <!-- 時間 -->
        <div>
          <label class="label">
            <span class="label-text">開始時間</span>
          </label>
          <input
            type="time"
            class="input input-bordered w-full"
            bind:value={formData.startTime}
            required
          />
        </div>
        
        <!-- 診察時間 -->
        <div>
          <label class="label">
            <span class="label-text">診察時間（分）</span>
          </label>
          <select 
            class="select select-bordered w-full"
            bind:value={formData.duration}
          >
            <option value={15}>15分</option>
            <option value={30}>30分</option>
            <option value={45}>45分</option>
            <option value={60}>60分</option>
          </select>
        </div>
        
        <!-- 予約タイプ -->
        <div>
          <label class="label">
            <span class="label-text">予約タイプ</span>
          </label>
          <select 
            class="select select-bordered w-full"
            bind:value={formData.type}
          >
            <option value="first-visit">初診</option>
            <option value="follow-up">再診</option>
            <option value="checkup">検診</option>
            <option value="emergency">緊急</option>
          </select>
        </div>
        
        <!-- 診察室 -->
        <div>
          <label class="label">
            <span class="label-text">診察室（任意）</span>
          </label>
          <select 
            class="select select-bordered w-full"
            bind:value={formData.roomId}
          >
            <option value="">自動割り当て</option>
            {#each $activeRooms as room}
              <option value={room.id}>{room.name}</option>
            {/each}
          </select>
        </div>
        
        <!-- 主訴 -->
        <div class="col-span-2">
          <label class="label">
            <span class="label-text">主訴</span>
          </label>
          <input
            type="text"
            class="input input-bordered w-full"
            bind:value={formData.chiefComplaint}
            placeholder="頭痛、発熱など"
          />
        </div>
        
        <!-- 備考 -->
        <div class="col-span-2">
          <label class="label">
            <span class="label-text">備考</span>
          </label>
          <textarea
            class="textarea textarea-bordered w-full"
            bind:value={formData.notes}
            rows="2"
            placeholder="特記事項があれば入力"
          ></textarea>
        </div>
      </div>
      
      <div class="modal-action">
        <button type="button" class="btn" onclick={handleClose}>
          キャンセル
        </button>
        <button type="submit" class="btn btn-primary">
          {booking ? '更新' : '予約作成'}
        </button>
      </div>
    </form>
  </div>
  <form method="dialog" class="modal-backdrop" onclick={handleClose}>
    <button>close</button>
  </form>
</dialog>