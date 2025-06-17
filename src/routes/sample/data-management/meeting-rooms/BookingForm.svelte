<!--
  会議室予約システム 予約作成・編集フォーム
  
  機能概要:
  - 新規予約作成と既存予約編集
  - リアルタイムバリデーション
  - 会議室空き状況チェック
  - 繰り返し予約設定
  - 設備選択と参加者管理
-->

<script>
  import { createEventDispatcher } from 'svelte';
  import { 
    createBooking, 
    updateBooking, 
    checkTimeConflict,
    canBook,
    clearError,
    isLoading,
    error,
    successMessage
  } from './stores/bookingStore';
  import { 
    rooms, 
    equipment,
    searchAvailableRooms,
    getAvailableTimeSlots
  } from './stores/roomStore';
  import { CONFIG } from './config';

  const dispatch = createEventDispatcher();

  // Props
  let { 
    booking = null,
    initialDate = null,
    initialTime = null,
    initialRoomId = null,
    isOpen = false 
  } = $props();

  // フォームデータ
  let formData = $state({
    userId: 'user1', // TODO: 現在のユーザーIDを取得
    roomId: '',
    startTime: '',
    endTime: '',
    type: 'meeting',
    title: '',
    description: '',
    attendeeCount: 1,
    requiredEquipment: [],
    cateringRequired: false,
    cateringDetails: '',
    isRecurring: false,
    recurringPattern: {
      type: 'weekly',
      interval: 1,
      endDate: '',
      daysOfWeek: []
    }
  });

  // バリデーションエラー
  let validationErrors = $state({});
  let availableRooms = $state([]);
  let timeSlots = $state([]);
  let showRoomSuggestions = $state(false);
  let showTimeConflictWarning = $state(false);
  let conflictingBookings = $state([]);

  // 初期化
  $effect(() => {
    if (isOpen) {
      initializeForm();
    }
  });

  function initializeForm() {
    if (booking) {
      // 編集モード
      formData = {
        ...booking,
        startTime: booking.startTime.slice(0, 16), // datetime-local format
        endTime: booking.endTime.slice(0, 16),
        requiredEquipment: booking.requiredEquipment || [],
        isRecurring: booking.isRecurring || false,
        recurringPattern: booking.recurringPattern || {
          type: 'weekly',
          interval: 1,
          endDate: '',
          daysOfWeek: []
        }
      };
    } else {
      // 新規作成モード
      const now = new Date();
      const defaultStart = initialDate && initialTime 
        ? new Date(`${initialDate}T${initialTime}:00`)
        : new Date(now.getTime() + 60 * 60 * 1000); // 1時間後
      
      const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000); // 1時間の会議

      formData = {
        userId: 'user1',
        roomId: initialRoomId || '',
        startTime: defaultStart.toISOString().slice(0, 16),
        endTime: defaultEnd.toISOString().slice(0, 16),
        type: 'meeting',
        title: '',
        description: '',
        attendeeCount: 1,
        requiredEquipment: [],
        cateringRequired: false,
        cateringDetails: '',
        isRecurring: false,
        recurringPattern: {
          type: 'weekly',
          interval: 1,
          endDate: '',
          daysOfWeek: []
        }
      };
    }

    clearValidationErrors();
    checkAvailability();
  }

  // バリデーション
  function validateForm() {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'タイトルは必須です';
    }

    if (!formData.roomId) {
      errors.roomId = '会議室を選択してください';
    }

    if (!formData.startTime) {
      errors.startTime = '開始時刻は必須です';
    }

    if (!formData.endTime) {
      errors.endTime = '終了時刻は必須です';
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      
      if (start >= end) {
        errors.timeRange = '終了時刻は開始時刻より後に設定してください';
      }

      if (start <= new Date()) {
        errors.startTime = '過去の時刻は指定できません';
      }

      const duration = (end - start) / (1000 * 60); // 分
      if (duration < 30) {
        errors.timeRange = '最低30分以上の予約が必要です';
      }

      if (duration > 8 * 60) { // 8時間
        errors.timeRange = '8時間を超える予約はできません';
      }
    }

    if (formData.attendeeCount < 1) {
      errors.attendeeCount = '参加者数は1名以上で入力してください';
    }

    const room = $rooms.find(r => r.id === formData.roomId);
    if (room && formData.attendeeCount > room.capacity) {
      errors.attendeeCount = `この会議室の定員は${room.capacity}名です`;
    }

    if (formData.isRecurring) {
      if (!formData.recurringPattern.endDate) {
        errors.recurringEndDate = '繰り返し終了日を設定してください';
      }
      
      if (formData.recurringPattern.type === 'weekly' && formData.recurringPattern.daysOfWeek.length === 0) {
        errors.recurringDays = '繰り返す曜日を選択してください';
      }
    }

    validationErrors = errors;
    return Object.keys(errors).length === 0;
  }

  // 空き状況チェック
  async function checkAvailability() {
    if (!formData.startTime || !formData.endTime || !formData.roomId) return;

    const conflicts = checkTimeConflict(
      formData.startTime, 
      formData.endTime, 
      formData.roomId,
      booking?.id
    );

    conflictingBookings = conflicts;
    showTimeConflictWarning = conflicts.length > 0;

    // 利用可能性チェック
    const availability = canBook(formData.startTime, formData.endTime, formData.roomId);
    if (!availability.canBook) {
      validationErrors = {
        ...validationErrors,
        availability: availability.reason
      };
    } else {
      const { availability: _, ...rest } = validationErrors;
      validationErrors = rest;
    }
  }

  // 代替会議室を検索
  async function searchAlternativeRooms() {
    if (!formData.startTime || !formData.endTime || !formData.attendeeCount) return;

    try {
      const searchParams = {
        startTime: formData.startTime,
        endTime: formData.endTime,
        attendeeCount: formData.attendeeCount,
        requiredEquipment: formData.requiredEquipment,
        excludeRoomIds: formData.roomId ? [formData.roomId] : []
      };

      const available = await searchAvailableRooms(searchParams);
      availableRooms = available;
      showRoomSuggestions = true;
    } catch (err) {
      console.error('代替会議室検索エラー:', err);
    }
  }

  // フォーム送信
  async function handleSubmit() {
    if (!validateForm()) return;

    try {
      if (booking) {
        // 更新
        const success = await updateBooking(booking.id, formData);
        if (success) {
          dispatch('updated', { booking: formData });
          closeModal();
        }
      } else {
        // 新規作成
        const newBooking = await createBooking(formData);
        if (newBooking) {
          dispatch('created', { booking: newBooking });
          closeModal();
        }
      }
    } catch (err) {
      console.error('予約保存エラー:', err);
    }
  }

  // モーダルを閉じる
  function closeModal() {
    dispatch('close');
    clearValidationErrors();
    showRoomSuggestions = false;
    showTimeConflictWarning = false;
  }

  // バリデーションエラーをクリア
  function clearValidationErrors() {
    validationErrors = {};
    clearError();
  }

  // 設備選択の切り替え
  function toggleEquipment(equipmentId) {
    if (formData.requiredEquipment.includes(equipmentId)) {
      formData.requiredEquipment = formData.requiredEquipment.filter(id => id !== equipmentId);
    } else {
      formData.requiredEquipment = [...formData.requiredEquipment, equipmentId];
    }
    checkAvailability();
  }

  // 曜日選択の切り替え
  function toggleDayOfWeek(day) {
    if (formData.recurringPattern.daysOfWeek.includes(day)) {
      formData.recurringPattern.daysOfWeek = formData.recurringPattern.daysOfWeek.filter(d => d !== day);
    } else {
      formData.recurringPattern.daysOfWeek = [...formData.recurringPattern.daysOfWeek, day];
    }
  }

  // 時間フォーマット
  function formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // リアクティブな空き状況チェック
  $effect(() => {
    if (formData.startTime && formData.endTime && formData.roomId) {
      checkAvailability();
    }
  });
</script>

{#if isOpen}
  <div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-4xl max-h-screen overflow-y-auto">
      <div class="sticky top-0 bg-base-100 pb-4 border-b border-base-300 mb-4">
        <h3 class="font-bold text-lg flex items-center gap-2">
          <span class="text-2xl">📅</span>
          {booking ? '予約編集' : '新規予約作成'}
        </h3>
        <button 
          class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4" 
          on:click={closeModal}
        >
          ✕
        </button>
      </div>

      <!-- エラー・成功メッセージ -->
      {#if $error}
        <div class="alert alert-error mb-4">
          <span>⚠️ {$error}</span>
        </div>
      {/if}

      {#if $successMessage}
        <div class="alert alert-success mb-4">
          <span>✅ {$successMessage}</span>
        </div>
      {/if}

      <!-- 競合警告 -->
      {#if showTimeConflictWarning}
        <div class="alert alert-warning mb-4">
          <div>
            <span>⚠️ この時間帯には既に他の予約があります</span>
            <div class="mt-2 space-y-1">
              {#each conflictingBookings as conflict}
                <div class="text-sm">
                  • {conflict.title} ({formatTime(conflict.startTime)} - {formatTime(conflict.endTime)})
                </div>
              {/each}
            </div>
            <button class="btn btn-sm btn-outline mt-2" on:click={searchAlternativeRooms}>
              代替会議室を検索
            </button>
          </div>
        </div>
      {/if}

      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <!-- 基本情報 -->
        <div class="card bg-base-200">
          <div class="card-body">
            <h4 class="card-title text-base">基本情報</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- タイトル -->
              <div class="form-control col-span-2">
                <label class="label">
                  <span class="label-text">タイトル <span class="text-error">*</span></span>
                </label>
                <input 
                  type="text" 
                  bind:value={formData.title}
                  class="input input-bordered {validationErrors.title ? 'input-error' : ''}"
                  placeholder="会議のタイトルを入力"
                />
                {#if validationErrors.title}
                  <label class="label">
                    <span class="label-text-alt text-error">{validationErrors.title}</span>
                  </label>
                {/if}
              </div>

              <!-- 会議室選択 -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text">会議室 <span class="text-error">*</span></span>
                </label>
                <select 
                  bind:value={formData.roomId}
                  class="select select-bordered {validationErrors.roomId ? 'select-error' : ''}"
                >
                  <option value="">会議室を選択</option>
                  {#each $rooms as room}
                    <option value={room.id}>
                      {room.name} ({room.capacity}名) - {room.floor}F
                    </option>
                  {/each}
                </select>
                {#if validationErrors.roomId}
                  <label class="label">
                    <span class="label-text-alt text-error">{validationErrors.roomId}</span>
                  </label>
                {/if}
              </div>

              <!-- 会議タイプ -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text">会議タイプ</span>
                </label>
                <select bind:value={formData.type} class="select select-bordered">
                  <option value="meeting">会議</option>
                  <option value="presentation">プレゼンテーション</option>
                  <option value="training">研修</option>
                  <option value="interview">面接</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <!-- 参加者数 -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text">参加者数 <span class="text-error">*</span></span>
                </label>
                <input 
                  type="number" 
                  bind:value={formData.attendeeCount}
                  min="1"
                  max="50"
                  class="input input-bordered {validationErrors.attendeeCount ? 'input-error' : ''}"
                />
                {#if validationErrors.attendeeCount}
                  <label class="label">
                    <span class="label-text-alt text-error">{validationErrors.attendeeCount}</span>
                  </label>
                {/if}
              </div>

              <!-- 説明 -->
              <div class="form-control col-span-2">
                <label class="label">
                  <span class="label-text">説明・議題</span>
                </label>
                <textarea 
                  bind:value={formData.description}
                  class="textarea textarea-bordered h-20"
                  placeholder="会議の詳細や議題を入力（任意）"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- 日時設定 -->
        <div class="card bg-base-200">
          <div class="card-body">
            <h4 class="card-title text-base">日時設定</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- 開始時刻 -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text">開始時刻 <span class="text-error">*</span></span>
                </label>
                <input 
                  type="datetime-local" 
                  bind:value={formData.startTime}
                  class="input input-bordered {validationErrors.startTime ? 'input-error' : ''}"
                />
                {#if validationErrors.startTime}
                  <label class="label">
                    <span class="label-text-alt text-error">{validationErrors.startTime}</span>
                  </label>
                {/if}
              </div>

              <!-- 終了時刻 -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text">終了時刻 <span class="text-error">*</span></span>
                </label>
                <input 
                  type="datetime-local" 
                  bind:value={formData.endTime}
                  class="input input-bordered {validationErrors.endTime ? 'input-error' : ''}"
                />
                {#if validationErrors.endTime}
                  <label class="label">
                    <span class="label-text-alt text-error">{validationErrors.endTime}</span>
                  </label>
                {/if}
              </div>

              {#if validationErrors.timeRange}
                <div class="col-span-2">
                  <div class="text-error text-sm">{validationErrors.timeRange}</div>
                </div>
              {/if}

              {#if validationErrors.availability}
                <div class="col-span-2">
                  <div class="text-error text-sm">{validationErrors.availability}</div>
                </div>
              {/if}
            </div>

            <!-- 繰り返し予約 -->
            <div class="form-control">
              <label class="cursor-pointer label justify-start gap-2">
                <input 
                  type="checkbox" 
                  bind:checked={formData.isRecurring}
                  class="checkbox" 
                />
                <span class="label-text">繰り返し予約</span>
              </label>
            </div>

            {#if formData.isRecurring}
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-base-100 rounded-lg">
                <!-- 繰り返しパターン -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">繰り返し</span>
                  </label>
                  <select bind:value={formData.recurringPattern.type} class="select select-bordered select-sm">
                    <option value="daily">毎日</option>
                    <option value="weekly">毎週</option>
                    <option value="monthly">毎月</option>
                  </select>
                </div>

                <!-- 間隔 -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">間隔</span>
                  </label>
                  <input 
                    type="number" 
                    bind:value={formData.recurringPattern.interval}
                    min="1"
                    max="4"
                    class="input input-bordered input-sm"
                  />
                </div>

                <!-- 終了日 -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">終了日</span>
                  </label>
                  <input 
                    type="date" 
                    bind:value={formData.recurringPattern.endDate}
                    class="input input-bordered input-sm {validationErrors.recurringEndDate ? 'input-error' : ''}"
                  />
                </div>

                <!-- 曜日選択（週次の場合） -->
                {#if formData.recurringPattern.type === 'weekly'}
                  <div class="form-control col-span-3">
                    <label class="label">
                      <span class="label-text">繰り返す曜日</span>
                    </label>
                    <div class="flex flex-wrap gap-2">
                      {#each ['月', '火', '水', '木', '金', '土', '日'] as day, index}
                        <label class="cursor-pointer label gap-2">
                          <input 
                            type="checkbox" 
                            value={index + 1}
                            on:change={() => toggleDayOfWeek(index + 1)}
                            checked={formData.recurringPattern.daysOfWeek.includes(index + 1)}
                            class="checkbox checkbox-sm" 
                          />
                          <span class="label-text text-sm">{day}</span>
                        </label>
                      {/each}
                    </div>
                    {#if validationErrors.recurringDays}
                      <label class="label">
                        <span class="label-text-alt text-error">{validationErrors.recurringDays}</span>
                      </label>
                    {/if}
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        </div>

        <!-- 設備・サービス -->
        <div class="card bg-base-200">
          <div class="card-body">
            <h4 class="card-title text-base">設備・サービス</h4>
            
            <!-- 必要設備 -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">必要な設備</span>
              </label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                {#each $equipment as eq}
                  <label class="cursor-pointer label gap-2">
                    <input 
                      type="checkbox" 
                      on:change={() => toggleEquipment(eq.id)}
                      checked={formData.requiredEquipment.includes(eq.id)}
                      class="checkbox checkbox-sm" 
                    />
                    <span class="label-text text-sm">{eq.name}</span>
                  </label>
                {/each}
              </div>
            </div>

            <!-- ケータリング -->
            <div class="form-control">
              <label class="cursor-pointer label justify-start gap-2">
                <input 
                  type="checkbox" 
                  bind:checked={formData.cateringRequired}
                  class="checkbox" 
                />
                <span class="label-text">ケータリングが必要</span>
              </label>
            </div>

            {#if formData.cateringRequired}
              <div class="form-control">
                <label class="label">
                  <span class="label-text">ケータリング詳細</span>
                </label>
                <textarea 
                  bind:value={formData.cateringDetails}
                  class="textarea textarea-bordered h-16"
                  placeholder="飲み物、軽食の内容や人数など"
                ></textarea>
              </div>
            {/if}
          </div>
        </div>

        <!-- 代替会議室提案 -->
        {#if showRoomSuggestions && availableRooms.length > 0}
          <div class="card bg-accent/10 border border-accent">
            <div class="card-body">
              <h4 class="card-title text-base text-accent">
                <span>💡</span>
                代替会議室の提案
              </h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                {#each availableRooms.slice(0, 4) as roomAvailability}
                  <div class="card bg-base-100 shadow-sm">
                    <div class="card-body p-4">
                      <h5 class="card-title text-sm">{roomAvailability.room.name}</h5>
                      <div class="text-xs space-y-1">
                        <div>定員: {roomAvailability.room.capacity}名</div>
                        <div>フロア: {roomAvailability.room.floor}F</div>
                        <div>利用可能枠: {roomAvailability.availableSlots.filter(s => s.available).length}枠</div>
                      </div>
                      <div class="card-actions justify-end">
                        <button 
                          type="button"
                          class="btn btn-xs btn-accent"
                          on:click={() => {
                            formData.roomId = roomAvailability.room.id;
                            showRoomSuggestions = false;
                          }}
                        >
                          選択
                        </button>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        <!-- 送信ボタン -->
        <div class="modal-action">
          <button type="button" class="btn" on:click={closeModal}>
            キャンセル
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            disabled={$isLoading || Object.keys(validationErrors).length > 0}
          >
            {#if $isLoading}
              <span class="loading loading-spinner loading-sm"></span>
            {/if}
            {booking ? '更新' : '予約作成'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-box {
    border-radius: 1rem;
  }

  .card {
    transition: all 0.2s ease;
  }

  .form-control {
    margin-bottom: 0.5rem;
  }

  .input-error, .select-error {
    border-color: hsl(var(--er));
  }

  .checkbox:checked {
    background-color: hsl(var(--p));
    border-color: hsl(var(--p));
  }
</style>