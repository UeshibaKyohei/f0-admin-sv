<!--
  実用的な予約フロー
  1. 日時選択 または 会議室選択
  2. 空き状況の表示
  3. 簡単予約作成
-->

<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { 
    rooms, 
    equipment,
    getAvailableTimeSlots,
    searchAvailableRooms 
  } from './stores/roomStore';
  import { 
    createBooking,
    checkBookingConflict,
    canBookRoom,
    isLoading,
    error
  } from './stores/bookingStore';
  import { CONFIG } from './config';

  const dispatch = createEventDispatcher();

  // UI状態
  let mode = $state('select'); // 'select' | 'datetime' | 'room' | 'confirm'
  let selectedMode = $state('datetime'); // 'datetime' | 'room'
  
  // カレンダー要素参照（通常の変数として定義）
  let datePickerDateTime;
  let datePickerRoom;
  let pikadayDateTime = null;
  let pikadayRoom = null;
  
  // 日付を日本語形式でフォーマット
  function formatDateJapanese(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${year}年${month}月${day}日(${weekday})`;
  }
  
  // 現在時刻から次の15分刻みの時間を取得
  function getNextQuarterHour() {
    const now = new Date();
    const currentMinutes = now.getMinutes();
    const currentHour = now.getHours();
    
    // 15分刻みに切り上げ
    let nextMinutes = Math.ceil(currentMinutes / 15) * 15;
    let nextHour = currentHour;
    
    if (nextMinutes >= 60) {
      nextMinutes = 0;
      nextHour += 1;
    }
    
    // 営業時間内に調整
    if (nextHour < 8) {
      nextHour = 8;
      nextMinutes = 0;
    } else if (nextHour >= 22) {
      nextHour = 8;
      nextMinutes = 0;
      // 明日にする
    }
    
    return `${nextHour.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')}`;
  }

  // 選択データ
  let selectedDate = $state(new Date().toISOString().split('T')[0]);
  let selectedDateDisplay = $state(formatDateJapanese(new Date().toISOString().split('T')[0]));
  let selectedTime = $state(getNextQuarterHour());
  let duration = $state(60); // 分
  let selectedRoom = $state(null);
  let availableSlots = $state([]);
  let availableRooms = $state([]);
  
  // 予約データ
  let bookingData = $state({
    title: '',
    attendeeCount: 1,
    description: ''
  });

  // 日時から検索
  async function searchByDateTime() {
    const startDateTime = `${selectedDate}T${selectedTime}:00`;
    const endDateTime = new Date(new Date(startDateTime).getTime() + duration * 60 * 1000).toISOString();
    
    try {
      const searchParams = {
        startTime: startDateTime,
        endTime: endDateTime,
        attendeeCount: bookingData.attendeeCount
      };
      
      const available = await searchAvailableRooms(searchParams);
      availableRooms = available;
      mode = 'room';
    } catch (err) {
      console.error('会議室検索エラー:', err);
    }
  }

  // 会議室から検索
  async function searchByRoom() {
    if (!selectedRoom) return;
    
    try {
      const slots = await getAvailableTimeSlots({
        roomIds: [selectedRoom.id],
        date: selectedDate,
        duration: duration
      });
      availableSlots = slots;
      mode = 'datetime';
    } catch (err) {
      console.error('時間枠検索エラー:', err);
    }
  }

  // 予約確定
  async function confirmBooking() {
    const startDateTime = selectedTime ? 
      `${selectedDate}T${selectedTime}:00` : 
      `${selectedDate}T10:00:00`;
    const endDateTime = new Date(new Date(startDateTime).getTime() + duration * 60 * 1000).toISOString();

    // 重複チェック
    const bookingCheck = canBookRoom(startDateTime, endDateTime, selectedRoom.id);
    if (!bookingCheck.canBook) {
      alert(`予約できません: ${bookingCheck.reason}`);
      if (bookingCheck.conflicts.length > 0) {
        console.log('競合する予約:', bookingCheck.conflicts);
      }
      return;
    }

    const booking = {
      userId: 'user1', // TODO: 現在のユーザー
      roomId: selectedRoom.id,
      startTime: startDateTime,
      endTime: endDateTime,
      type: 'meeting',
      title: bookingData.title || '会議',
      description: bookingData.description,
      attendeeCount: bookingData.attendeeCount,
      status: selectedRoom.accessControl?.requireApproval ? 'pending' : 'confirmed'
    };

    const result = await createBooking(booking);
    if (result) {
      dispatch('created', { booking: result });
      resetForm();
    }
  }

  // フォームリセット
  function resetForm() {
    mode = 'select';
    selectedRoom = null;
    availableSlots = [];
    availableRooms = [];
    bookingData = {
      title: '',
      attendeeCount: 1,
      description: ''
    };
  }

  // 15分間隔の時間オプションを生成
  function generateTimeOptions() {
    const options = [];
    for (let hour = 8; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeStr);
      }
    }
    return options;
  }

  // 時間フォーマット
  function formatTime(timeString) {
    return timeString.slice(0, 5);
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

  // Pikadayの初期化を管理
  async function initializePikaday() {
    const Pikaday = (await import('pikaday')).default;
    
    // 日本語設定
    const i18n = {
      previousMonth: '前月',
      nextMonth: '翌月',
      months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      weekdays: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
      weekdaysShort: ['日', '月', '火', '水', '木', '金', '土']
    };
    
    // 日時選択用カレンダー
    if (datePickerDateTime && !pikadayDateTime) {
      pikadayDateTime = new Pikaday({
        field: datePickerDateTime,
        i18n: i18n,
        firstDay: 0,
        minDate: new Date(),
        maxDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        onSelect: function() {
          const date = this.getDate();
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();
          const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
          const weekday = weekdays[date.getDay()];
          
          selectedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          selectedDateDisplay = `${year}年${month}月${day}日(${weekday})`;
        }
      });
    }
    
    // 会議室選択用カレンダー  
    if (datePickerRoom && !pikadayRoom) {
      pikadayRoom = new Pikaday({
        field: datePickerRoom,
        i18n: i18n,
        firstDay: 0,
        minDate: new Date(),
        maxDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        onSelect: function() {
          const date = this.getDate();
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();
          const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
          const weekday = weekdays[date.getDay()];
          
          selectedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          selectedDateDisplay = `${year}年${month}月${day}日(${weekday})`;
        }
      });
    }
  }
  
  // modeが変更されたときにPikadayを初期化
  $effect(() => {
    if (mode === 'datetime' || mode === 'room') {
      setTimeout(initializePikaday, 100);
    }
  });
  
  // クリーンアップ
  onMount(() => {
    return () => {
      if (pikadayDateTime) {
        pikadayDateTime.destroy();
      }
      if (pikadayRoom) {
        pikadayRoom.destroy();
      }
    };
  });
</script>

<div class="bg-base-100 rounded-box p-6 shadow-lg max-w-4xl mx-auto">
  {#if mode === 'select'}
    <!-- 検索方法選択 -->
    <div class="text-center space-y-6">
      <h2 class="text-xl font-bold">予約方法を選択</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 日時から選択 -->
        <div class="card bg-base-200 hover:bg-base-300 cursor-pointer transition-colors"
             on:click={() => { selectedMode = 'datetime'; mode = 'datetime'; }}>
          <div class="card-body items-center text-center">
            <span class="text-4xl">📅</span>
            <h3 class="card-title">日時から選択</h3>
            <p class="text-sm">希望の日時を選んで利用可能な会議室を探す</p>
          </div>
        </div>

        <!-- 会議室から選択 -->
        <div class="card bg-base-200 hover:bg-base-300 cursor-pointer transition-colors"
             on:click={() => { selectedMode = 'room'; mode = 'room'; }}>
          <div class="card-body items-center text-center">
            <span class="text-4xl">🏢</span>
            <h3 class="card-title">会議室から選択</h3>
            <p class="text-sm">使いたい会議室を選んで空き時間を探す</p>
          </div>
        </div>
      </div>
    </div>

  {:else if mode === 'datetime'}
    <!-- 日時選択モード -->
    <div class="space-y-4">
      <div class="flex items-center gap-2 mb-4">
        <button class="btn btn-sm btn-circle btn-outline" on:click={() => mode = 'select'}>
          ←
        </button>
        <h2 class="text-lg font-bold">
          {selectedMode === 'datetime' ? '日時を選択' : '空き時間を選択'}
        </h2>
      </div>

      {#if selectedMode === 'datetime'}
        <!-- 日時入力 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">日付</span>
            </label>
            <input 
              type="text" 
              bind:this={datePickerDateTime}
              value={selectedDateDisplay}
              class="input input-bordered pika-single"
              placeholder="クリックして日付を選択"
              readonly
            >
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">開始時間</span>
            </label>
            <select bind:value={selectedTime} class="select select-bordered">
              {#each generateTimeOptions() as timeOption}
                <option value={timeOption}>{timeOption}</option>
              {/each}
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">時間</span>
            </label>
            <select bind:value={duration} class="select select-bordered">
              <option value={30}>30分</option>
              <option value={60}>1時間</option>
              <option value={90}>1時間30分</option>
              <option value={120}>2時間</option>
              <option value={180}>3時間</option>
            </select>
          </div>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">参加者数</span>
          </label>
          <input type="number" bind:value={bookingData.attendeeCount} min="1" max="50" class="input input-bordered w-32">
        </div>

        <button class="btn btn-primary" on:click={searchByDateTime} disabled={$isLoading}>
          {#if $isLoading}
            <span class="loading loading-spinner loading-sm"></span>
          {/if}
          会議室を検索
        </button>
      {:else}
        <!-- 時間枠選択 -->
        <div class="space-y-3">
          <p class="text-sm text-base-content/70">
            {selectedRoom?.name} の空き時間（{formatDateJapanese(selectedDate)}）
          </p>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            {#each availableSlots.filter(slot => slot.available) as slot}
              <button 
                class="btn btn-outline btn-sm"
                on:click={() => {
                  selectedTime = slot.time;
                  mode = 'confirm';
                }}
              >
                {formatTime(slot.time)}
              </button>
            {/each}
          </div>

          {#if availableSlots.filter(slot => slot.available).length === 0}
            <div class="text-center py-4 text-base-content/60">
              この日は空きがありません
            </div>
          {/if}
        </div>
      {/if}
    </div>

  {:else if mode === 'room'}
    <!-- 会議室選択モード -->
    <div class="space-y-4">
      <div class="flex items-center gap-2 mb-4">
        <button class="btn btn-sm btn-circle btn-outline" on:click={() => mode = selectedMode === 'datetime' ? 'datetime' : 'select'}>
          ←
        </button>
        <h2 class="text-lg font-bold">
          {selectedMode === 'datetime' ? '利用可能な会議室' : '会議室を選択'}
        </h2>
      </div>

      {#if selectedMode === 'room'}
        <!-- 日程選択 -->
        <div class="mb-6 p-4 bg-base-300 rounded-lg">
          <h3 class="text-sm font-semibold mb-3">📅 予約希望日を選択</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <!-- 今日 -->
            <button 
              class="btn btn-sm {selectedDate === new Date().toISOString().split('T')[0] ? 'btn-primary' : 'btn-outline'}"
              on:click={() => {
                selectedDate = new Date().toISOString().split('T')[0];
                selectedDateDisplay = formatDateJapanese(selectedDate);
              }}
            >
              今日
            </button>
            <!-- 明日 -->
            <button 
              class="btn btn-sm {selectedDate === new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0] ? 'btn-primary' : 'btn-outline'}"
              on:click={() => {
                selectedDate = new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0];
                selectedDateDisplay = formatDateJapanese(selectedDate);
              }}
            >
              明日
            </button>
            <!-- 明後日 -->
            <button 
              class="btn btn-sm {selectedDate === new Date(Date.now() + 2*24*60*60*1000).toISOString().split('T')[0] ? 'btn-primary' : 'btn-outline'}"
              on:click={() => {
                selectedDate = new Date(Date.now() + 2*24*60*60*1000).toISOString().split('T')[0];
                selectedDateDisplay = formatDateJapanese(selectedDate);
              }}
            >
              明後日
            </button>
            <!-- カレンダー選択 -->
            <div class="form-control">
              <input 
                type="text" 
                bind:this={datePickerRoom}
                value={selectedDateDisplay}
                class="input input-sm input-bordered pika-single"
                placeholder="その他の日付"
                readonly
              >
            </div>
          </div>
          <div class="text-xs text-base-content/60 mt-2">
            ※ 予約可能期間: 本日〜30日後まで
          </div>
        </div>

        <!-- 会議室一覧 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {#each $rooms as room}
            <div class="card bg-base-200 hover:bg-base-300 cursor-pointer transition-colors"
                 on:click={() => {
                   selectedRoom = room;
                   searchByRoom();
                 }}>
              <div class="card-body p-4">
                <h3 class="card-title text-sm flex items-center gap-2">
                  <span>{getRoomTypeIcon(room.type)}</span>
                  {room.name}
                </h3>
                <div class="text-xs space-y-1">
                  <div>定員: {room.capacity}名 • {room.floor}F</div>
                  <div class="flex flex-wrap gap-1">
                    {#each room.equipment.slice(0, 3) as equipmentId}
                      {@const eq = $equipment.find(e => e.id === equipmentId)}
                      {#if eq}
                        <span class="badge badge-xs">{eq.name}</span>
                      {/if}
                    {/each}
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <!-- 検索結果の会議室 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each availableRooms as roomAvail}
            <div class="card bg-base-200 hover:bg-base-300 cursor-pointer transition-colors"
                 on:click={() => {
                   selectedRoom = roomAvail.room;
                   mode = 'confirm';
                 }}>
              <div class="card-body p-4">
                <h3 class="card-title text-sm flex items-center gap-2">
                  <span>{getRoomTypeIcon(roomAvail.room.type)}</span>
                  {roomAvail.room.name}
                </h3>
                <div class="text-xs space-y-1">
                  <div>定員: {roomAvail.room.capacity}名 • {roomAvail.room.floor}F</div>
                  <div class="text-success">利用可能枠: {roomAvail.availableSlots.filter(s => s.available).length}個</div>
                </div>
              </div>
            </div>
          {/each}
        </div>

        {#if availableRooms.length === 0}
          <div class="text-center py-8 text-base-content/60">
            <span class="text-4xl">🚫</span>
            <p class="mt-2">条件に合う会議室がありません</p>
            <button class="btn btn-outline btn-sm mt-2" on:click={() => mode = 'datetime'}>
              条件を変更
            </button>
          </div>
        {/if}
      {/if}
    </div>

  {:else if mode === 'confirm'}
    <!-- 予約確認 -->
    <div class="space-y-4">
      <div class="flex items-center gap-2 mb-4">
        <button class="btn btn-sm btn-circle btn-outline" on:click={() => mode = selectedMode === 'datetime' ? 'room' : 'datetime'}>
          ←
        </button>
        <h2 class="text-lg font-bold">予約内容の確認</h2>
      </div>

      <!-- 予約サマリー -->
      <div class="card bg-base-200">
        <div class="card-body p-4">
          <h3 class="font-bold flex items-center gap-2">
            <span>{getRoomTypeIcon(selectedRoom?.type)}</span>
            {selectedRoom?.name}
          </h3>
          <div class="text-sm space-y-1">
            <div>📅 {formatDateJapanese(selectedDate)} {formatTime(selectedTime)} （{duration}分間）</div>
            <div>👥 {bookingData.attendeeCount}名</div>
            <div>📍 {selectedRoom?.floor}F • 定員{selectedRoom?.capacity}名</div>
          </div>
        </div>
      </div>

      <!-- 詳細入力 -->
      <div class="space-y-3">
        <div class="form-control">
          <label class="label">
            <span class="label-text">会議タイトル</span>
          </label>
          <input type="text" bind:value={bookingData.title} 
                 placeholder="会議のタイトルを入力" 
                 class="input input-bordered">
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">説明（任意）</span>
          </label>
          <textarea bind:value={bookingData.description} 
                    placeholder="会議の内容や議題" 
                    class="textarea textarea-bordered h-20"></textarea>
        </div>
      </div>

      <!-- 注意事項 -->
      {#if selectedRoom?.accessControl?.requireApproval}
        <div class="alert alert-warning">
          <span>⚠️ この会議室は管理者の承認が必要です</span>
        </div>
      {/if}

      <!-- 予約ボタン -->
      <div class="flex gap-2">
        <button class="btn btn-outline flex-1" on:click={resetForm}>
          キャンセル
        </button>
        <button class="btn btn-primary flex-1" 
                on:click={confirmBooking} 
                disabled={$isLoading || !bookingData.title}>
          {#if $isLoading}
            <span class="loading loading-spinner loading-sm"></span>
          {/if}
          予約する
        </button>
      </div>
    </div>
  {/if}

  <!-- エラー表示 -->
  {#if $error}
    <div class="alert alert-error mt-4">
      <span>⚠️ {$error}</span>
    </div>
  {/if}
</div>

