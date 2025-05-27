<script>
  import { onMount } from 'svelte';
  import { HighlightSvelte } from 'svelte-highlight';
  import 'svelte-highlight/styles/dark.css';
  
  let { copyToClipboard, copySuccess } = $props();
  
  // 1. 予約システム用カレンダー
  let reservationData = $state({
    date: '',
    time: '',
    duration: '60',
    guestCount: '2',
    specialRequest: ''
  });
  let reservationInput;
  let reservationContainer;
  
  // 予約可能な時間帯
  const availableTimeSlots = {
    '2025-01-15': ['10:00', '11:00', '14:00', '15:00', '16:00'],
    '2025-01-16': ['10:00', '11:00', '13:00', '14:00', '15:00'],
    '2025-01-17': ['11:00', '14:00', '15:00', '16:00', '17:00'],
    // デフォルト時間帯
    default: ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']
  };
  
  // 2. イベント登録フォーム
  let eventData = $state({
    eventName: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    location: '',
    maxParticipants: '50',
    isRecurring: false,
    recurringType: 'weekly',
    recurringEnd: ''
  });
  let eventStartInput, eventEndInput;
  let eventContainer;
  
  // 3. タスク管理の期限設定
  let taskData = $state({
    taskName: '',
    dueDate: '',
    priority: 'medium',
    reminder: '1day',
    assignee: '',
    estimatedHours: '2',
    dependencies: []
  });
  let taskDueDateInput;
  let taskContainer;
  
  // 営業日計算用の祝日データ
  const holidays = [
    '2025-01-01', '2025-01-13', '2025-02-11', '2025-02-23', '2025-02-24',
    '2025-03-20', '2025-04-29', '2025-05-03', '2025-05-04', '2025-05-05',
    '2025-05-06', '2025-07-21', '2025-08-11', '2025-09-15', '2025-09-23',
    '2025-10-13', '2025-11-03', '2025-11-23', '2025-11-24'
  ];
  
  // 4. 誕生日選択（年齢制限付き）
  let birthdayData = $state({
    birthday: '',
    age: null,
    isEligible: false,
    consentGiven: false
  });
  let birthdayInput;
  
  // 5. 休暇申請システム
  let leaveData = $state({
    leaveType: 'paid',
    startDate: '',
    endDate: '',
    reason: '',
    emergencyContact: '',
    handoverTo: '',
    remainingDays: 20,
    usedDays: 0
  });
  let leaveStartInput, leaveEndInput;
  let leaveContainer;
  
  // 実績のある予約済み日付（デモ用）
  const bookedDates = [
    '2025-01-10', '2025-01-11', '2025-01-12',
    '2025-01-20', '2025-01-21', '2025-01-22'
  ];
  
  // 利用可能なスロット数を計算
  const availableSlots = $derived(() => {
    if (!reservationData.date) return {};
    const dateStr = reservationData.date;
    const slots = availableTimeSlots[dateStr] || availableTimeSlots.default;
    
    // 実際の予約システムではDBから取得
    const bookedSlots = {
      '2025-01-15': { '10:00': 2, '11:00': 1 },
      '2025-01-16': { '14:00': 3 }
    };
    
    const result = {};
    slots.forEach(time => {
      const booked = bookedSlots[dateStr]?.[time] || 0;
      result[time] = Math.max(0, 5 - booked); // 各時間帯の最大予約数は5
    });
    
    return result;
  });
  
  // 営業日数を計算
  const calculateBusinessDays = $derived(() => {
    if (!leaveData.startDate || !leaveData.endDate) return 0;
    
    const start = new Date(leaveData.startDate);
    const end = new Date(leaveData.endDate);
    let count = 0;
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const dateStr = d.toISOString().split('T')[0];
      
      // 土日と祝日を除外
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(dateStr)) {
        count++;
      }
    }
    
    return count;
  });
  
  // 年齢計算
  function calculateAge(birthday) {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  
  // サンプルコード
  const reservationSystemCode = `<script>
  import { onMount } from 'svelte';
  
  let reservationData = $state({
    date: '',
    time: '',
    duration: '60',
    guestCount: '2',
    specialRequest: ''
  });
  
  // 予約可能な時間帯（実際はAPIから取得）
  const availableTimeSlots = {
    '2025-01-15': ['10:00', '11:00', '14:00', '15:00', '16:00'],
    '2025-01-16': ['10:00', '11:00', '13:00', '14:00', '15:00'],
    default: ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']
  };
  
  const bookedDates = ['2025-01-10', '2025-01-11', '2025-01-12'];
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    const picker = new Pikaday({
      field: reservationInput,
      container: reservationContainer,
      minDate: new Date(),
      maxDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      disableDayFn: function(date) {
        // 満席の日付を無効化
        const dateStr = date.toISOString().split('T')[0];
        return bookedDates.includes(dateStr);
      },
      onDraw: function() {
        // カレンダーにカスタムスタイルを適用
        const buttons = reservationContainer.querySelectorAll('.pika-single button.pika-button');
        
        buttons.forEach(btn => {
          const year = Number(btn.getAttribute('data-pika-year'));
          const month = Number(btn.getAttribute('data-pika-month'));
          const day = Number(btn.getAttribute('data-pika-day'));
          
          if (year && !isNaN(month) && day) {
            const dateStr = \`\${year}-\${String(month + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
            
            // 満席の日付にスタイル適用
            if (bookedDates.includes(dateStr)) {
              btn.classList.add('is-booked');
              btn.setAttribute('title', '満席');
            }
            
            // 空きが少ない日付（実際はAPIから取得）
            const limitedDates = ['2025-01-13', '2025-01-14'];
            if (limitedDates.includes(dateStr)) {
              btn.classList.add('is-limited');
              btn.setAttribute('title', '残りわずか');
            }
          }
        });
      },
      onSelect: function() {
        const date = this.getDate();
        const dateStr = date.toISOString().split('T')[0];
        reservationData.date = dateStr;
        reservationData.time = ''; // 時間をリセット
      }
    });
    
    return () => picker.destroy();
  });
  
  function handleReservation() {
    // バリデーション
    if (!reservationData.date || !reservationData.time) {
      alert('日付と時間を選択してください');
      return;
    }
    
    // 予約処理（実際はAPIに送信）
    console.log('予約データ:', reservationData);
    alert('予約が完了しました！');
  }
<\/script>

<div class="max-w-2xl mx-auto">
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title mb-4">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        レストラン予約
      </h2>
      
      <!-- 予約ステップ表示 -->
      <ul class="steps steps-horizontal w-full mb-6">
        <li class="step {reservationData.date ? 'step-primary' : ''}">日付選択</li>
        <li class="step {reservationData.time ? 'step-primary' : ''}">時間選択</li>
        <li class="step">詳細入力</li>
      </ul>
      
      <div class="grid md:grid-cols-2 gap-6">
        <!-- カレンダー -->
        <div>
          <label class="label">
            <span class="label-text font-semibold">ご来店日</span>
            <span class="label-text-alt">2ヶ月先まで予約可能</span>
          </label>
          <div bind:this={reservationContainer} class="reservation-calendar">
            <input 
              type="text" 
              class="input input-bordered w-full pika-single"
              bind:this={reservationInput}
              value={reservationData.date}
              placeholder="日付を選択してください"
              readonly
            />
          </div>
          
          <!-- カレンダーの凡例 -->
          <div class="mt-3 flex gap-4 text-sm">
            <span class="flex items-center gap-1">
              <span class="w-3 h-3 rounded bg-error"></span>
              満席
            </span>
            <span class="flex items-center gap-1">
              <span class="w-3 h-3 rounded bg-warning"></span>
              残りわずか
            </span>
          </div>
        </div>
        
        <!-- 時間と詳細 -->
        <div class="space-y-4">
          {#if reservationData.date}
            <div>
              <label class="label">
                <span class="label-text font-semibold">ご来店時間</span>
              </label>
              <div class="grid grid-cols-3 gap-2">
                {#each Object.entries(availableSlots()) as [time, slots]}
                  <button 
                    class="btn btn-sm {reservationData.time === time ? 'btn-primary' : 'btn-outline'} 
                           {slots === 0 ? 'btn-disabled' : ''}"
                    onclick={() => reservationData.time = time}
                    disabled={slots === 0}
                  >
                    {time}
                    {#if slots > 0 && slots <= 2}
                      <span class="badge badge-warning badge-xs">残{slots}</span>
                    {/if}
                  </button>
                {/each}
              </div>
            </div>
          {/if}
          
          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">人数</span>
              </label>
              <select class="select select-bordered" bind:value={reservationData.guestCount}>
                {#each Array(8) as _, i}
                  <option value={i + 1}>{i + 1}名</option>
                {/each}
              </select>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">滞在時間</span>
              </label>
              <select class="select select-bordered" bind:value={reservationData.duration}>
                <option value="60">1時間</option>
                <option value="90">1.5時間</option>
                <option value="120">2時間</option>
                <option value="180">3時間</option>
              </select>
            </div>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">特別なご要望</span>
              <span class="label-text-alt">任意</span>
            </label>
            <textarea 
              class="textarea textarea-bordered"
              placeholder="アレルギー、記念日、座席のご希望など"
              bind:value={reservationData.specialRequest}
            ></textarea>
          </div>
        </div>
      </div>
      
      <div class="card-actions justify-end mt-6">
        <button 
          class="btn btn-primary"
          onclick={handleReservation}
          disabled={!reservationData.date || !reservationData.time}
        >
          予約を確定する
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  /* 予約カレンダーのカスタムスタイル */
  :global(.reservation-calendar .pika-single button.is-booked) {
    background-color: oklch(var(--er)) !important;
    color: oklch(var(--erc)) !important;
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  :global(.reservation-calendar .pika-single button.is-limited) {
    background-color: oklch(var(--wa)) !important;
    color: oklch(var(--wac)) !important;
  }
</style>`;

  const eventRegistrationCode = `<script>
  import { onMount } from 'svelte';
  
  let eventData = $state({
    eventName: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    location: '',
    maxParticipants: '50',
    isRecurring: false,
    recurringType: 'weekly',
    recurringEnd: ''
  });
  
  let eventStartInput, eventEndInput;
  let startPicker, endPicker;
  
  // 期間の自動計算
  const eventDuration = $derived(() => {
    if (!eventData.startDate || !eventData.endDate) return '';
    
    const start = new Date(eventData.startDate);
    const end = new Date(eventData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    if (days === 1) return '1日間';
    if (days <= 7) return \`\${days}日間\`;
    if (days <= 30) return \`約\${Math.ceil(days / 7)}週間\`;
    return \`約\${Math.ceil(days / 30)}ヶ月\`;
  });
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    const pikadayI18n = {
      previousMonth: '前月',
      nextMonth: '翌月',
      months: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
      weekdays: ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],
      weekdaysShort: ['日','月','火','水','木','金','土']
    };
    
    startPicker = new Pikaday({
      field: eventStartInput,
      container: eventStartInput.parentElement,
      i18n: pikadayI18n,
      minDate: new Date(),
      onSelect: function() {
        eventData.startDate = this.toString('YYYY-MM-DD');
        
        // 終了日の最小値を更新
        if (endPicker) {
          endPicker.setMinDate(this.getDate());
          
          // 終了日が開始日より前の場合、開始日と同じに設定
          if (!eventData.endDate || new Date(eventData.endDate) < this.getDate()) {
            endPicker.setDate(this.getDate());
            eventData.endDate = eventData.startDate;
          }
        }
      }
    });
    
    endPicker = new Pikaday({
      field: eventEndInput,
      container: eventEndInput.parentElement,
      i18n: pikadayI18n,
      minDate: new Date(),
      onSelect: function() {
        eventData.endDate = this.toString('YYYY-MM-DD');
      }
    });
    
    return () => {
      startPicker?.destroy();
      endPicker?.destroy();
    };
  });
<\/script>

<div class="max-w-3xl mx-auto">
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title mb-6">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        イベント登録
      </h2>
      
      <!-- 基本情報 -->
      <div class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">イベント名</span>
            <span class="label-text-alt text-error">必須</span>
          </label>
          <input 
            type="text" 
            class="input input-bordered"
            placeholder="例：2025年度 新入社員研修"
            bind:value={eventData.eventName}
          />
        </div>
        
        <!-- 日程 -->
        <div class="divider">日程</div>
        
        <div class="grid md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">開始日</span>
            </label>
            <input 
              type="text" 
              class="input input-bordered pika-single"
              bind:this={eventStartInput}
              value={eventData.startDate}
              placeholder="開始日を選択"
              readonly
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">終了日</span>
            </label>
            <input 
              type="text" 
              class="input input-bordered pika-single"
              bind:this={eventEndInput}
              value={eventData.endDate}
              placeholder="終了日を選択"
              readonly
            />
          </div>
        </div>
        
        {#if eventDuration}
          <div class="alert alert-info">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>イベント期間：{eventDuration}</span>
          </div>
        {/if}
        
        <!-- 繰り返し設定 -->
        <div class="form-control">
          <label class="label cursor-pointer justify-start gap-4">
            <input 
              type="checkbox" 
              class="checkbox checkbox-primary"
              bind:checked={eventData.isRecurring}
            />
            <span class="label-text">繰り返しイベントとして設定</span>
          </label>
        </div>
        
        {#if eventData.isRecurring}
          <div class="pl-10 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <select class="select select-bordered" bind:value={eventData.recurringType}>
                <option value="daily">毎日</option>
                <option value="weekly">毎週</option>
                <option value="monthly">毎月</option>
              </select>
              
              <input 
                type="date" 
                class="input input-bordered"
                bind:value={eventData.recurringEnd}
                placeholder="繰り返し終了日"
              />
            </div>
          </div>
        {/if}
        
        <!-- 詳細設定 -->
        <div class="divider">詳細設定</div>
        
        <div class="grid md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">開始時刻</span>
            </label>
            <input 
              type="time" 
              class="input input-bordered"
              bind:value={eventData.startTime}
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">終了時刻</span>
            </label>
            <input 
              type="time" 
              class="input input-bordered"
              bind:value={eventData.endTime}
            />
          </div>
        </div>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text">場所</span>
          </label>
          <input 
            type="text" 
            class="input input-bordered"
            placeholder="例：本社3F 大会議室"
            bind:value={eventData.location}
          />
        </div>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text">最大参加人数</span>
          </label>
          <input 
            type="number" 
            class="input input-bordered"
            bind:value={eventData.maxParticipants}
          />
        </div>
      </div>
      
      <div class="card-actions justify-end mt-6">
        <button class="btn btn-ghost">下書き保存</button>
        <button class="btn btn-primary">イベントを登録</button>
      </div>
    </div>
  </div>
</div>`;

  const taskManagementCode = `<script>
  import { onMount } from 'svelte';
  
  let taskData = $state({
    taskName: '',
    dueDate: '',
    priority: 'medium',
    reminder: '1day',
    assignee: '',
    estimatedHours: '2'
  });
  
  // 営業日計算
  function addBusinessDays(date, days) {
    const result = new Date(date);
    let count = 0;
    
    while (count < days) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      const dateStr = result.toISOString().split('T')[0];
      
      // 土日と祝日を除外
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(dateStr)) {
        count++;
      }
    }
    
    return result;
  }
  
  // 推奨期限日の計算
  const suggestedDueDate = $derived(() => {
    const hours = parseInt(taskData.estimatedHours) || 0;
    const days = Math.ceil(hours / 8); // 1日8時間として計算
    const buffer = days <= 1 ? 1 : Math.ceil(days * 0.2); // 20%のバッファ
    
    return addBusinessDays(new Date(), days + buffer);
  });
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    const picker = new Pikaday({
      field: taskDueDateInput,
      container: taskContainer,
      minDate: new Date(),
      disableDayFn: function(date) {
        // 週末を無効化（営業日のみ選択可能）
        return date.getDay() === 0 || date.getDay() === 6;
      },
      onDraw: function() {
        // 推奨期限日をハイライト
        const buttons = taskContainer.querySelectorAll('.pika-single button.pika-button');
        const suggestedStr = suggestedDueDate.toISOString().split('T')[0];
        
        buttons.forEach(btn => {
          const year = Number(btn.getAttribute('data-pika-year'));
          const month = Number(btn.getAttribute('data-pika-month'));
          const day = Number(btn.getAttribute('data-pika-day'));
          
          if (year && !isNaN(month) && day) {
            const dateStr = \`\${year}-\${String(month + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
            
            if (dateStr === suggestedStr) {
              btn.classList.add('is-suggested');
              btn.setAttribute('title', '推奨期限日');
            }
          }
        });
      },
      onSelect: function() {
        taskData.dueDate = this.toString('YYYY-MM-DD');
      }
    });
    
    return () => picker.destroy();
  });
<\/script>

<div class="max-w-2xl mx-auto">
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title mb-4">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        タスク登録
      </h2>
      
      <div class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">タスク名</span>
          </label>
          <input 
            type="text" 
            class="input input-bordered"
            placeholder="例：プロジェクト計画書の作成"
            bind:value={taskData.taskName}
          />
        </div>
        
        <div class="grid md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">優先度</span>
            </label>
            <select class="select select-bordered" bind:value={taskData.priority}>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="urgent">緊急</option>
            </select>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">予想作業時間</span>
            </label>
            <div class="input-group">
              <input 
                type="number" 
                class="input input-bordered flex-1"
                bind:value={taskData.estimatedHours}
                min="0.5"
                step="0.5"
              />
              <span class="bg-base-300 px-4 flex items-center">時間</span>
            </div>
          </div>
        </div>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text">期限日（営業日）</span>
            <span class="label-text-alt">
              推奨：{suggestedDueDate.toLocaleDateString('ja-JP')}
            </span>
          </label>
          <div bind:this={taskContainer} class="task-calendar">
            <input 
              type="text" 
              class="input input-bordered pika-single"
              bind:this={taskDueDateInput}
              value={taskData.dueDate}
              placeholder="期限日を選択"
              readonly
            />
          </div>
        </div>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text">リマインダー</span>
          </label>
          <select class="select select-bordered" bind:value={taskData.reminder}>
            <option value="none">なし</option>
            <option value="1day">1日前</option>
            <option value="3days">3日前</option>
            <option value="1week">1週間前</option>
          </select>
        </div>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text">担当者</span>
          </label>
          <input 
            type="text" 
            class="input input-bordered"
            placeholder="担当者名またはメールアドレス"
            bind:value={taskData.assignee}
          />
        </div>
      </div>
      
      <div class="card-actions justify-end mt-6">
        <button class="btn btn-ghost">キャンセル</button>
        <button class="btn btn-primary">タスクを作成</button>
      </div>
    </div>
  </div>
</div>

<style>
  /* 推奨期限日のハイライト */
  :global(.task-calendar .pika-single button.is-suggested) {
    background-color: oklch(var(--su)) !important;
    color: oklch(var(--suc)) !important;
    font-weight: bold;
  }
</style>`;

  const birthdaySelectionCode = `<script>
  import { onMount } from 'svelte';
  
  let birthdayData = $state({
    birthday: '',
    age: null,
    isEligible: false,
    consentGiven: false
  });
  
  const MIN_AGE = 13; // 最低年齢
  const MAX_AGE = 120; // 最高年齢
  
  // 年齢と資格の確認
  function checkEligibility() {
    if (!birthdayData.birthday) {
      birthdayData.age = null;
      birthdayData.isEligible = false;
      return;
    }
    
    const age = calculateAge(birthdayData.birthday);
    birthdayData.age = age;
    birthdayData.isEligible = age >= MIN_AGE && age <= MAX_AGE;
  }
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    const picker = new Pikaday({
      field: birthdayInput,
      container: birthdayInput.parentElement,
      yearRange: [1900, new Date().getFullYear()],
      maxDate: new Date(),
      defaultDate: new Date(new Date().getFullYear() - 20, 0, 1),
      showYearDropdown: true,
      i18n: {
        previousMonth: '前月',
        nextMonth: '翌月',
        months: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
        weekdays: ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],
        weekdaysShort: ['日','月','火','水','木','金','土']
      },
      onSelect: function() {
        birthdayData.birthday = this.toString('YYYY-MM-DD');
        checkEligibility();
      }
    });
    
    return () => picker.destroy();
  });
<\/script>

<div class="max-w-md mx-auto">
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title mb-4">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
        </svg>
        生年月日の確認
      </h2>
      
      <div class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">生年月日</span>
          </label>
          <input 
            type="text" 
            class="input input-bordered pika-single"
            bind:this={birthdayInput}
            value={birthdayData.birthday}
            placeholder="生年月日を選択"
            readonly
          />
        </div>
        
        {#if birthdayData.age !== null}
          <div class="alert {birthdayData.isEligible ? 'alert-success' : 'alert-error'}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {#if birthdayData.isEligible}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              {:else}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              {/if}
            </svg>
            <div>
              <div class="font-bold">年齢：{birthdayData.age}歳</div>
              <div class="text-sm">
                {#if birthdayData.isEligible}
                  サービスをご利用いただけます
                {:else if birthdayData.age < MIN_AGE}
                  申し訳ございません。{MIN_AGE}歳以上の方のみご利用いただけます
                {:else}
                  入力された生年月日をご確認ください
                {/if}
              </div>
            </div>
          </div>
        {/if}
        
        {#if birthdayData.isEligible}
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">利用規約に同意します</span>
              <input 
                type="checkbox" 
                class="checkbox checkbox-primary"
                bind:checked={birthdayData.consentGiven}
              />
            </label>
          </div>
        {/if}
      </div>
      
      <div class="card-actions justify-end mt-6">
        <button 
          class="btn btn-primary"
          disabled={!birthdayData.isEligible || !birthdayData.consentGiven}
        >
          次へ進む
        </button>
      </div>
    </div>
  </div>
</div>`;

  const leaveRequestCode = `<script>
  import { onMount } from 'svelte';
  
  let leaveData = $state({
    leaveType: 'paid',
    startDate: '',
    endDate: '',
    reason: '',
    emergencyContact: '',
    handoverTo: '',
    remainingDays: 20,
    usedDays: 0
  });
  
  // 休暇タイプの詳細情報
  const leaveTypes = {
    paid: { name: '有給休暇', color: 'primary', max: 20 },
    sick: { name: '病気休暇', color: 'warning', max: 10 },
    special: { name: '特別休暇', color: 'info', max: 5 },
    unpaid: { name: '無給休暇', color: 'neutral', max: null }
  };
  
  // 申請日数の計算
  const requestedDays = $derived(calculateBusinessDays());
  
  // 残日数のチェック
  const hasEnoughDays = $derived(() => {
    if (leaveData.leaveType === 'unpaid') return true;
    const maxDays = leaveTypes[leaveData.leaveType].max;
    return requestedDays <= (maxDays - leaveData.usedDays);
  });
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    const pikadayI18n = {
      previousMonth: '前月',
      nextMonth: '翌月',
      months: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
      weekdays: ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],
      weekdaysShort: ['日','月','火','水','木','金','土']
    };
    
    const startPicker = new Pikaday({
      field: leaveStartInput,
      container: leaveContainer,
      i18n: pikadayI18n,
      minDate: new Date(),
      disableDayFn: function(date) {
        // 週末を無効化
        return date.getDay() === 0 || date.getDay() === 6;
      },
      onSelect: function() {
        leaveData.startDate = this.toString('YYYY-MM-DD');
        
        if (endPicker) {
          endPicker.setMinDate(this.getDate());
          
          if (!leaveData.endDate || new Date(leaveData.endDate) < this.getDate()) {
            endPicker.setDate(this.getDate());
            leaveData.endDate = leaveData.startDate;
          }
        }
      }
    });
    
    const endPicker = new Pikaday({
      field: leaveEndInput,
      container: leaveContainer,
      i18n: pikadayI18n,
      minDate: new Date(),
      disableDayFn: function(date) {
        return date.getDay() === 0 || date.getDay() === 6;
      },
      onSelect: function() {
        leaveData.endDate = this.toString('YYYY-MM-DD');
      }
    });
    
    return () => {
      startPicker?.destroy();
      endPicker?.destroy();
    };
  });
<\/script>

<div class="max-w-3xl mx-auto">
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title mb-6">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        休暇申請
      </h2>
      
      <!-- 休暇残日数 -->
      <div class="stats shadow mb-6">
        <div class="stat">
          <div class="stat-figure text-primary">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="stat-title">有給休暇残日数</div>
          <div class="stat-value text-primary">{leaveData.remainingDays - leaveData.usedDays}日</div>
          <div class="stat-desc">今年度：使用済み {leaveData.usedDays}日 / 付与 {leaveData.remainingDays}日</div>
        </div>
      </div>
      
      <div class="space-y-4">
        <!-- 休暇タイプ -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">休暇タイプ</span>
          </label>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            {#each Object.entries(leaveTypes) as [type, info]}
              <button 
                class="btn btn-sm {leaveData.leaveType === type ? \`btn-\${info.color}\` : 'btn-outline'}"
                onclick={() => leaveData.leaveType = type}
              >
                {info.name}
              </button>
            {/each}
          </div>
        </div>
        
        <!-- 期間選択 -->
        <div bind:this={leaveContainer}>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">開始日</span>
              </label>
              <input 
                type="text" 
                class="input input-bordered pika-single"
                bind:this={leaveStartInput}
                value={leaveData.startDate}
                placeholder="開始日を選択"
                readonly
              />
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">終了日</span>
              </label>
              <input 
                type="text" 
                class="input input-bordered pika-single"
                bind:this={leaveEndInput}
                value={leaveData.endDate}
                placeholder="終了日を選択"
                readonly
              />
            </div>
          </div>
        </div>
        
        {#if requestedDays > 0}
          <div class="alert {hasEnoughDays ? 'alert-info' : 'alert-error'}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div>申請日数：{requestedDays}営業日</div>
              {#if !hasEnoughDays}
                <div class="text-sm">残日数が不足しています</div>
              {/if}
            </div>
          </div>
        {/if}
        
        <!-- 理由 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">申請理由</span>
          </label>
          <textarea 
            class="textarea textarea-bordered"
            placeholder="休暇の理由を入力してください"
            bind:value={leaveData.reason}
            rows="3"
          ></textarea>
        </div>
        
        <!-- 引き継ぎ -->
        <div class="grid md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">業務引き継ぎ先</span>
            </label>
            <input 
              type="text" 
              class="input input-bordered"
              placeholder="引き継ぎ担当者"
              bind:value={leaveData.handoverTo}
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">緊急連絡先</span>
            </label>
            <input 
              type="tel" 
              class="input input-bordered"
              placeholder="090-0000-0000"
              bind:value={leaveData.emergencyContact}
            />
          </div>
        </div>
      </div>
      
      <div class="card-actions justify-between mt-6">
        <button class="btn btn-ghost">下書き保存</button>
        <div class="flex gap-2">
          <button class="btn btn-outline">キャンセル</button>
          <button 
            class="btn btn-primary"
            disabled={!leaveData.startDate || !leaveData.endDate || !hasEnoughDays}
          >
            申請する
          </button>
        </div>
      </div>
    </div>
  </div>
</div>`;
  
  // 初期化
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    // 日本語化設定
    const pikadayI18n = {
      previousMonth: '前月',
      nextMonth: '翌月',
      months: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
      weekdays: ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],
      weekdaysShort: ['日','月','火','水','木','金','土']
    };
    
    // 1. 予約システム
    const reservationPicker = new Pikaday({
      field: reservationInput,
      container: reservationContainer,
      i18n: pikadayI18n,
      minDate: new Date(),
      maxDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      disableDayFn: function(date) {
        const dateStr = date.toISOString().split('T')[0];
        return bookedDates.includes(dateStr);
      },
      onDraw: function() {
        const buttons = reservationContainer.querySelectorAll('.pika-single button.pika-button');
        
        buttons.forEach(btn => {
          const year = Number(btn.getAttribute('data-pika-year'));
          const month = Number(btn.getAttribute('data-pika-month'));
          const day = Number(btn.getAttribute('data-pika-day'));
          
          if (year && !isNaN(month) && day) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            if (bookedDates.includes(dateStr)) {
              btn.classList.add('is-booked');
              btn.setAttribute('title', '満席');
            }
            
            const limitedDates = ['2025-01-13', '2025-01-14'];
            if (limitedDates.includes(dateStr)) {
              btn.classList.add('is-limited');
              btn.setAttribute('title', '残りわずか');
            }
          }
        });
      },
      onSelect: function() {
        const date = this.getDate();
        const dateStr = date.toISOString().split('T')[0];
        reservationData.date = dateStr;
        reservationData.time = '';
      }
    });
    
    // 2. イベント登録
    let eventStartPicker, eventEndPicker;
    
    eventStartPicker = new Pikaday({
      field: eventStartInput,
      container: eventContainer,
      i18n: pikadayI18n,
      minDate: new Date(),
      onSelect: function() {
        eventData.startDate = this.toString('YYYY-MM-DD');
        
        if (eventEndPicker) {
          eventEndPicker.setMinDate(this.getDate());
          
          if (!eventData.endDate || new Date(eventData.endDate) < this.getDate()) {
            eventEndPicker.setDate(this.getDate());
            eventData.endDate = eventData.startDate;
          }
        }
      }
    });
    
    eventEndPicker = new Pikaday({
      field: eventEndInput,
      container: eventContainer,
      i18n: pikadayI18n,
      minDate: new Date(),
      onSelect: function() {
        eventData.endDate = this.toString('YYYY-MM-DD');
      }
    });
    
    // 3. タスク管理
    const taskPicker = new Pikaday({
      field: taskDueDateInput,
      container: taskContainer,
      i18n: pikadayI18n,
      minDate: new Date(),
      disableDayFn: function(date) {
        return date.getDay() === 0 || date.getDay() === 6;
      },
      onDraw: function() {
        const buttons = taskContainer.querySelectorAll('.pika-single button.pika-button');
        const suggestedStr = suggestedDueDate().toISOString().split('T')[0];
        
        buttons.forEach(btn => {
          const year = Number(btn.getAttribute('data-pika-year'));
          const month = Number(btn.getAttribute('data-pika-month'));
          const day = Number(btn.getAttribute('data-pika-day'));
          
          if (year && !isNaN(month) && day) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            if (dateStr === suggestedStr) {
              btn.classList.add('is-suggested');
              btn.setAttribute('title', '推奨期限日');
            }
          }
        });
      },
      onSelect: function() {
        taskData.dueDate = this.toString('YYYY-MM-DD');
      }
    });
    
    // 4. 誕生日選択
    const birthdayPicker = new Pikaday({
      field: birthdayInput,
      i18n: pikadayI18n,
      yearRange: [1900, new Date().getFullYear()],
      maxDate: new Date(),
      defaultDate: new Date(new Date().getFullYear() - 20, 0, 1),
      showYearDropdown: true,
      onSelect: function() {
        birthdayData.birthday = this.toString('YYYY-MM-DD');
        checkEligibility();
      }
    });
    
    // 5. 休暇申請
    let leaveStartPicker, leaveEndPicker;
    
    leaveStartPicker = new Pikaday({
      field: leaveStartInput,
      container: leaveContainer,
      i18n: pikadayI18n,
      minDate: new Date(),
      disableDayFn: function(date) {
        return date.getDay() === 0 || date.getDay() === 6;
      },
      onSelect: function() {
        leaveData.startDate = this.toString('YYYY-MM-DD');
        
        if (leaveEndPicker) {
          leaveEndPicker.setMinDate(this.getDate());
          
          if (!leaveData.endDate || new Date(leaveData.endDate) < this.getDate()) {
            leaveEndPicker.setDate(this.getDate());
            leaveData.endDate = leaveData.startDate;
          }
        }
      }
    });
    
    leaveEndPicker = new Pikaday({
      field: leaveEndInput,
      container: leaveContainer,
      i18n: pikadayI18n,
      minDate: new Date(),
      disableDayFn: function(date) {
        return date.getDay() === 0 || date.getDay() === 6;
      },
      onSelect: function() {
        leaveData.endDate = this.toString('YYYY-MM-DD');
      }
    });
    
    return () => {
      reservationPicker?.destroy();
      eventStartPicker?.destroy();
      eventEndPicker?.destroy();
      taskPicker?.destroy();
      birthdayPicker?.destroy();
      leaveStartPicker?.destroy();
      leaveEndPicker?.destroy();
    };
  });
  
  // ヘルパー関数
  function addBusinessDays(date, days) {
    const result = new Date(date);
    let count = 0;
    
    while (count < days) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      const dateStr = result.toISOString().split('T')[0];
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(dateStr)) {
        count++;
      }
    }
    
    return result;
  }
  
  function suggestedDueDate() {
    const hours = parseInt(taskData.estimatedHours) || 0;
    const days = Math.ceil(hours / 8);
    const buffer = days <= 1 ? 1 : Math.ceil(days * 0.2);
    
    return addBusinessDays(new Date(), days + buffer);
  }
  
  function checkEligibility() {
    if (!birthdayData.birthday) {
      birthdayData.age = null;
      birthdayData.isEligible = false;
      return;
    }
    
    const age = calculateAge(birthdayData.birthday);
    birthdayData.age = age;
    birthdayData.isEligible = age >= 13 && age <= 120;
  }
  
  // イベントハンドラー
  function handleReservation() {
    if (!reservationData.date || !reservationData.time) {
      alert('日付と時間を選択してください');
      return;
    }
    
    console.log('予約データ:', reservationData);
    alert('予約が完了しました！');
  }
</script>

<div class="space-y-8">
  <!-- セクションタイトル -->
  <div class="text-center">
    <h2 class="text-3xl font-bold text-primary mb-2">実用的なユースケース</h2>
    <p class="text-base-content/70">そのまま使える本格的なカレンダー実装例</p>
  </div>

  <!-- 1. 予約システム用カレンダー -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <h3 class="card-title">1. 予約システム用カレンダー</h3>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(reservationSystemCode, 'reservation-system')}
        >
          {copySuccess['reservation-system'] ? '✓ コピー済み' : 'コピー'}
        </button>
      </div>
      
      <div class="space-y-4">
        <div class="max-w-2xl mx-auto">
          <div class="card bg-base-100 border border-base-300">
            <div class="card-body">
              <h2 class="card-title mb-4">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                レストラン予約
              </h2>
              
              <!-- 予約ステップ表示 -->
              <ul class="steps steps-horizontal w-full mb-6">
                <li class="step {reservationData.date ? 'step-primary' : ''}">日付選択</li>
                <li class="step {reservationData.time ? 'step-primary' : ''}">時間選択</li>
                <li class="step">詳細入力</li>
              </ul>
              
              <div class="grid md:grid-cols-2 gap-6">
                <!-- カレンダー -->
                <div>
                  <label class="label">
                    <span class="label-text font-semibold">ご来店日</span>
                    <span class="label-text-alt">2ヶ月先まで予約可能</span>
                  </label>
                  <div bind:this={reservationContainer} class="reservation-calendar">
                    <input 
                      type="text" 
                      class="input input-bordered w-full pika-single"
                      bind:this={reservationInput}
                      value={reservationData.date}
                      placeholder="日付を選択してください"
                      readonly
                    />
                  </div>
                  
                  <!-- カレンダーの凡例 -->
                  <div class="mt-3 flex gap-4 text-sm">
                    <span class="flex items-center gap-1">
                      <span class="w-3 h-3 rounded bg-error"></span>
                      満席
                    </span>
                    <span class="flex items-center gap-1">
                      <span class="w-3 h-3 rounded bg-warning"></span>
                      残りわずか
                    </span>
                  </div>
                </div>
                
                <!-- 時間と詳細 -->
                <div class="space-y-4">
                  {#if reservationData.date}
                    <div>
                      <label class="label">
                        <span class="label-text font-semibold">ご来店時間</span>
                      </label>
                      <div class="grid grid-cols-3 gap-2">
                        {#each Object.entries(availableSlots()) as [time, slots]}
                          <button 
                            class="btn btn-sm {reservationData.time === time ? 'btn-primary' : 'btn-outline'} 
                                   {slots === 0 ? 'btn-disabled' : ''}"
                            onclick={() => reservationData.time = time}
                            disabled={slots === 0}
                          >
                            {time}
                            {#if slots > 0 && slots <= 2}
                              <span class="badge badge-warning badge-xs">残{slots}</span>
                            {/if}
                          </button>
                        {/each}
                      </div>
                    </div>
                  {/if}
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">人数</span>
                      </label>
                      <select class="select select-bordered" bind:value={reservationData.guestCount}>
                        {#each Array(8) as _, i}
                          <option value={i + 1}>{i + 1}名</option>
                        {/each}
                      </select>
                    </div>
                    
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">滞在時間</span>
                      </label>
                      <select class="select select-bordered" bind:value={reservationData.duration}>
                        <option value="60">1時間</option>
                        <option value="90">1.5時間</option>
                        <option value="120">2時間</option>
                        <option value="180">3時間</option>
                      </select>
                    </div>
                  </div>
                  
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">特別なご要望</span>
                      <span class="label-text-alt">任意</span>
                    </label>
                    <textarea 
                      class="textarea textarea-bordered"
                      placeholder="アレルギー、記念日、座席のご希望など"
                      bind:value={reservationData.specialRequest}
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <div class="card-actions justify-end mt-6">
                <button 
                  class="btn btn-primary"
                  onclick={handleReservation}
                  disabled={!reservationData.date || !reservationData.time}
                >
                  予約を確定する
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- コード表示切り替え -->
        <div class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div class="collapse-title font-medium">
            コードを表示
          </div>
          <div class="collapse-content">
            <HighlightSvelte code={reservationSystemCode} />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 2. イベント登録フォーム -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <h3 class="card-title">2. イベント登録フォーム</h3>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(eventRegistrationCode, 'event-registration')}
        >
          {copySuccess['event-registration'] ? '✓ コピー済み' : 'コピー'}
        </button>
      </div>
      
      <div class="space-y-4">
        <div class="max-w-3xl mx-auto">
          <div class="card bg-base-100 border border-base-300">
            <div class="card-body">
              <h2 class="card-title mb-6">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                イベント登録
              </h2>
              
              <!-- 基本情報 -->
              <div class="space-y-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-semibold">イベント名</span>
                    <span class="label-text-alt text-error">必須</span>
                  </label>
                  <input 
                    type="text" 
                    class="input input-bordered"
                    placeholder="例：2025年度 新入社員研修"
                    bind:value={eventData.eventName}
                  />
                </div>
                
                <!-- 日程 -->
                <div class="divider">日程</div>
                
                <div bind:this={eventContainer}>
                  <div class="grid md:grid-cols-2 gap-4">
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">開始日</span>
                      </label>
                      <input 
                        type="text" 
                        class="input input-bordered pika-single"
                        bind:this={eventStartInput}
                        value={eventData.startDate}
                        placeholder="開始日を選択"
                        readonly
                      />
                    </div>
                    
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">終了日</span>
                      </label>
                      <input 
                        type="text" 
                        class="input input-bordered pika-single"
                        bind:this={eventEndInput}
                        value={eventData.endDate}
                        placeholder="終了日を選択"
                        readonly
                      />
                    </div>
                  </div>
                </div>
                
                {#if eventData.startDate && eventData.endDate}
                  {@const start = new Date(eventData.startDate)}
                  {@const end = new Date(eventData.endDate)}
                  {@const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1}
                  <div class="alert alert-info">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>イベント期間：{days === 1 ? '1日間' : days <= 7 ? `${days}日間` : days <= 30 ? `約${Math.ceil(days / 7)}週間` : `約${Math.ceil(days / 30)}ヶ月`}</span>
                  </div>
                {/if}
                
                <!-- 繰り返し設定 -->
                <div class="form-control">
                  <label class="label cursor-pointer justify-start gap-4">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-primary"
                      bind:checked={eventData.isRecurring}
                    />
                    <span class="label-text">繰り返しイベントとして設定</span>
                  </label>
                </div>
                
                {#if eventData.isRecurring}
                  <div class="pl-10 space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                      <select class="select select-bordered" bind:value={eventData.recurringType}>
                        <option value="daily">毎日</option>
                        <option value="weekly">毎週</option>
                        <option value="monthly">毎月</option>
                      </select>
                      
                      <input 
                        type="date" 
                        class="input input-bordered"
                        bind:value={eventData.recurringEnd}
                        placeholder="繰り返し終了日"
                      />
                    </div>
                  </div>
                {/if}
                
                <!-- 詳細設定 -->
                <div class="divider">詳細設定</div>
                
                <div class="grid md:grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">開始時刻</span>
                    </label>
                    <input 
                      type="time" 
                      class="input input-bordered"
                      bind:value={eventData.startTime}
                    />
                  </div>
                  
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">終了時刻</span>
                    </label>
                    <input 
                      type="time" 
                      class="input input-bordered"
                      bind:value={eventData.endTime}
                    />
                  </div>
                </div>
                
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">場所</span>
                  </label>
                  <input 
                    type="text" 
                    class="input input-bordered"
                    placeholder="例：本社3F 大会議室"
                    bind:value={eventData.location}
                  />
                </div>
                
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">最大参加人数</span>
                  </label>
                  <input 
                    type="number" 
                    class="input input-bordered"
                    bind:value={eventData.maxParticipants}
                  />
                </div>
              </div>
              
              <div class="card-actions justify-end mt-6">
                <button class="btn btn-ghost">下書き保存</button>
                <button class="btn btn-primary">イベントを登録</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- コード表示切り替え -->
        <div class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div class="collapse-title font-medium">
            コードを表示
          </div>
          <div class="collapse-content">
            <HighlightSvelte code={eventRegistrationCode} />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 3. タスク管理の期限設定 -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <h3 class="card-title">3. タスク管理の期限設定</h3>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(taskManagementCode, 'task-management')}
        >
          {copySuccess['task-management'] ? '✓ コピー済み' : 'コピー'}
        </button>
      </div>
      
      <div class="space-y-4">
        <div class="max-w-2xl mx-auto">
          <div class="card bg-base-100 border border-base-300">
            <div class="card-body">
              <h2 class="card-title mb-4">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                タスク登録
              </h2>
              
              <div class="space-y-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-semibold">タスク名</span>
                  </label>
                  <input 
                    type="text" 
                    class="input input-bordered"
                    placeholder="例：プロジェクト計画書の作成"
                    bind:value={taskData.taskName}
                  />
                </div>
                
                <div class="grid md:grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">優先度</span>
                    </label>
                    <select class="select select-bordered" bind:value={taskData.priority}>
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                      <option value="urgent">緊急</option>
                    </select>
                  </div>
                  
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">予想作業時間</span>
                    </label>
                    <div class="input-group">
                      <input 
                        type="number" 
                        class="input input-bordered flex-1"
                        bind:value={taskData.estimatedHours}
                        min="0.5"
                        step="0.5"
                      />
                      <span class="bg-base-300 px-4 flex items-center">時間</span>
                    </div>
                  </div>
                </div>
                
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">期限日（営業日）</span>
                    <span class="label-text-alt">
                      推奨：{suggestedDueDate().toLocaleDateString('ja-JP')}
                    </span>
                  </label>
                  <div bind:this={taskContainer} class="task-calendar">
                    <input 
                      type="text" 
                      class="input input-bordered pika-single"
                      bind:this={taskDueDateInput}
                      value={taskData.dueDate}
                      placeholder="期限日を選択"
                      readonly
                    />
                  </div>
                </div>
                
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">リマインダー</span>
                  </label>
                  <select class="select select-bordered" bind:value={taskData.reminder}>
                    <option value="none">なし</option>
                    <option value="1day">1日前</option>
                    <option value="3days">3日前</option>
                    <option value="1week">1週間前</option>
                  </select>
                </div>
                
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">担当者</span>
                  </label>
                  <input 
                    type="text" 
                    class="input input-bordered"
                    placeholder="担当者名またはメールアドレス"
                    bind:value={taskData.assignee}
                  />
                </div>
              </div>
              
              <div class="card-actions justify-end mt-6">
                <button class="btn btn-ghost">キャンセル</button>
                <button class="btn btn-primary">タスクを作成</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- コード表示切り替え -->
        <div class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div class="collapse-title font-medium">
            コードを表示
          </div>
          <div class="collapse-content">
            <HighlightSvelte code={taskManagementCode} />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 4. 誕生日選択（年齢制限付き） -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <h3 class="card-title">4. 誕生日選択（年齢制限付き）</h3>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(birthdaySelectionCode, 'birthday-selection')}
        >
          {copySuccess['birthday-selection'] ? '✓ コピー済み' : 'コピー'}
        </button>
      </div>
      
      <div class="space-y-4">
        <div class="max-w-md mx-auto">
          <div class="card bg-base-100 border border-base-300">
            <div class="card-body">
              <h2 class="card-title mb-4">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                </svg>
                生年月日の確認
              </h2>
              
              <div class="space-y-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-semibold">生年月日</span>
                  </label>
                  <input 
                    type="text" 
                    class="input input-bordered pika-single"
                    bind:this={birthdayInput}
                    value={birthdayData.birthday}
                    placeholder="生年月日を選択"
                    readonly
                  />
                </div>
                
                {#if birthdayData.age !== null}
                  <div class="alert {birthdayData.isEligible ? 'alert-success' : 'alert-error'}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {#if birthdayData.isEligible}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      {:else}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      {/if}
                    </svg>
                    <div>
                      <div class="font-bold">年齢：{birthdayData.age}歳</div>
                      <div class="text-sm">
                        {#if birthdayData.isEligible}
                          サービスをご利用いただけます
                        {:else if birthdayData.age < 13}
                          申し訳ございません。13歳以上の方のみご利用いただけます
                        {:else}
                          入力された生年月日をご確認ください
                        {/if}
                      </div>
                    </div>
                  </div>
                {/if}
                
                {#if birthdayData.isEligible}
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">利用規約に同意します</span>
                      <input 
                        type="checkbox" 
                        class="checkbox checkbox-primary"
                        bind:checked={birthdayData.consentGiven}
                      />
                    </label>
                  </div>
                {/if}
              </div>
              
              <div class="card-actions justify-end mt-6">
                <button 
                  class="btn btn-primary"
                  disabled={!birthdayData.isEligible || !birthdayData.consentGiven}
                >
                  次へ進む
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- コード表示切り替え -->
        <div class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div class="collapse-title font-medium">
            コードを表示
          </div>
          <div class="collapse-content">
            <HighlightSvelte code={birthdaySelectionCode} />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 5. 休暇申請システム -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <h3 class="card-title">5. 休暇申請システム</h3>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(leaveRequestCode, 'leave-request')}
        >
          {copySuccess['leave-request'] ? '✓ コピー済み' : 'コピー'}
        </button>
      </div>
      
      <div class="space-y-4">
        <div class="max-w-3xl mx-auto">
          <div class="card bg-base-100 border border-base-300">
            <div class="card-body">
              <h2 class="card-title mb-6">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                休暇申請
              </h2>
              
              <!-- 休暇残日数 -->
              <div class="stats shadow mb-6">
                <div class="stat">
                  <div class="stat-figure text-primary">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="stat-title">有給休暇残日数</div>
                  <div class="stat-value text-primary">{leaveData.remainingDays - leaveData.usedDays}日</div>
                  <div class="stat-desc">今年度：使用済み {leaveData.usedDays}日 / 付与 {leaveData.remainingDays}日</div>
                </div>
              </div>
              
              <div class="space-y-4">
                <!-- 休暇タイプ -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-semibold">休暇タイプ</span>
                  </label>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button 
                      class="btn btn-sm {leaveData.leaveType === 'paid' ? 'btn-primary' : 'btn-outline'}"
                      onclick={() => leaveData.leaveType = 'paid'}
                    >
                      有給休暇
                    </button>
                    <button 
                      class="btn btn-sm {leaveData.leaveType === 'sick' ? 'btn-warning' : 'btn-outline'}"
                      onclick={() => leaveData.leaveType = 'sick'}
                    >
                      病気休暇
                    </button>
                    <button 
                      class="btn btn-sm {leaveData.leaveType === 'special' ? 'btn-info' : 'btn-outline'}"
                      onclick={() => leaveData.leaveType = 'special'}
                    >
                      特別休暇
                    </button>
                    <button 
                      class="btn btn-sm {leaveData.leaveType === 'unpaid' ? 'btn-neutral' : 'btn-outline'}"
                      onclick={() => leaveData.leaveType = 'unpaid'}
                    >
                      無給休暇
                    </button>
                  </div>
                </div>
                
                <!-- 期間選択 -->
                <div bind:this={leaveContainer}>
                  <div class="grid md:grid-cols-2 gap-4">
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">開始日</span>
                      </label>
                      <input 
                        type="text" 
                        class="input input-bordered pika-single"
                        bind:this={leaveStartInput}
                        value={leaveData.startDate}
                        placeholder="開始日を選択"
                        readonly
                      />
                    </div>
                    
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">終了日</span>
                      </label>
                      <input 
                        type="text" 
                        class="input input-bordered pika-single"
                        bind:this={leaveEndInput}
                        value={leaveData.endDate}
                        placeholder="終了日を選択"
                        readonly
                      />
                    </div>
                  </div>
                </div>
                
                {#if calculateBusinessDays > 0}
                  {@const hasEnoughDays = leaveData.leaveType === 'unpaid' || calculateBusinessDays <= (20 - leaveData.usedDays)}
                  <div class="alert {hasEnoughDays ? 'alert-info' : 'alert-error'}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div>申請日数：{calculateBusinessDays}営業日</div>
                      {#if !hasEnoughDays}
                        <div class="text-sm">残日数が不足しています</div>
                      {/if}
                    </div>
                  </div>
                {/if}
                
                <!-- 理由 -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">申請理由</span>
                  </label>
                  <textarea 
                    class="textarea textarea-bordered"
                    placeholder="休暇の理由を入力してください"
                    bind:value={leaveData.reason}
                    rows="3"
                  ></textarea>
                </div>
                
                <!-- 引き継ぎ -->
                <div class="grid md:grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">業務引き継ぎ先</span>
                    </label>
                    <input 
                      type="text" 
                      class="input input-bordered"
                      placeholder="引き継ぎ担当者"
                      bind:value={leaveData.handoverTo}
                    />
                  </div>
                  
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">緊急連絡先</span>
                    </label>
                    <input 
                      type="tel" 
                      class="input input-bordered"
                      placeholder="090-0000-0000"
                      bind:value={leaveData.emergencyContact}
                    />
                  </div>
                </div>
              </div>
              
              <div class="card-actions justify-between mt-6">
                <button class="btn btn-ghost">下書き保存</button>
                <div class="flex gap-2">
                  <button class="btn btn-outline">キャンセル</button>
                  <button 
                    class="btn btn-primary"
                    disabled={!leaveData.startDate || !leaveData.endDate || (leaveData.leaveType !== 'unpaid' && calculateBusinessDays > (20 - leaveData.usedDays))}
                  >
                    申請する
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- コード表示切り替え -->
        <div class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div class="collapse-title font-medium">
            コードを表示
          </div>
          <div class="collapse-content">
            <HighlightSvelte code={leaveRequestCode} />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Tips -->
  <div class="card bg-primary/10 border-2 border-primary/20">
    <div class="card-body">
      <h3 class="card-title text-primary mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        実装のポイント
      </h3>
      
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-bold mb-2">UI/UXの工夫</h4>
          <ul class="text-sm space-y-1">
            <li>• ステップ表示で進捗を可視化</li>
            <li>• 条件に応じた動的な表示切り替え</li>
            <li>• リアルタイムバリデーション</li>
            <li>• 視覚的なフィードバック（色・アイコン）</li>
            <li>• 推奨値の自動計算と表示</li>
          </ul>
        </div>
        
        <div>
          <h4 class="font-bold mb-2">実用的な機能</h4>
          <ul class="text-sm space-y-1">
            <li>• 営業日計算（土日・祝日を除外）</li>
            <li>• 日付の相互連動と制約</li>
            <li>• 在庫・残数管理の統合</li>
            <li>• 年齢制限チェック</li>
            <li>• 下書き保存・自動保存機能</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* 予約カレンダーのカスタムスタイル */
  :global(.reservation-calendar .pika-single button.is-booked) {
    background-color: oklch(var(--er)) !important;
    color: oklch(var(--erc)) !important;
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  :global(.reservation-calendar .pika-single button.is-limited) {
    background-color: oklch(var(--wa)) !important;
    color: oklch(var(--wac)) !important;
  }
  
  /* 推奨期限日のハイライト */
  :global(.task-calendar .pika-single button.is-suggested) {
    background-color: oklch(var(--su)) !important;
    color: oklch(var(--suc)) !important;
    font-weight: bold;
  }
</style>