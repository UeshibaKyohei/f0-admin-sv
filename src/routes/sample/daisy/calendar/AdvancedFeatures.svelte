<script>
  import { onMount } from 'svelte';
  import { HighlightSvelte } from 'svelte-highlight';
  import 'svelte-highlight/styles/dark.css';
  
  let { copyToClipboard, copySuccess } = $props();
  
  // 時刻選択も含むピッカー
  let dateTimeInput;
  let selectedDateTime = $state('');
  let selectedHour = $state(9);
  let selectedMinute = $state(0);
  let dateTimePicker;
  
  // 複数日付の選択
  let multiDateInput;
  let selectedDates = $state([]);
  let multiPicker;
  
  // インライン表示のカレンダー
  let inlineContainer;
  let inlineDate = $state('');
  
  // モーダル内でのカレンダー使用
  let modalDateInput;
  let modalDate = $state('');
  let modalPicker;
  
  // ミニカレンダー（コンパクト版）
  let miniCalendarContainer;
  let miniSelectedDate = $state('');
  
  // ドロワー内カレンダー
  let drawerDateInput;
  let drawerDate = $state('');
  let drawerPicker;
  
  // タイムゾーン対応カレンダー
  let tzDateInput;
  let tzDate = $state('');
  let selectedTimezone = $state('Asia/Tokyo');
  let tzPicker;
  
  const timezones = [
    { value: 'Asia/Tokyo', label: '東京 (JST)' },
    { value: 'America/New_York', label: 'ニューヨーク (EST)' },
    { value: 'Europe/London', label: 'ロンドン (GMT)' },
    { value: 'Australia/Sydney', label: 'シドニー (AEDT)' }
  ];
  
  // 繰り返し設定付きカレンダー
  let recurringDateInput;
  let recurringDate = $state('');
  let recurrenceType = $state('none');
  let recurrenceEnd = $state('');
  let recurringPicker;
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    // 時刻選択ピッカーの初期化
    dateTimePicker = new Pikaday({
      field: dateTimeInput,
      container: dateTimeInput.parentElement,
      onSelect: function() {
        const date = this.toString('YYYY-MM-DD');
        const time = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
        selectedDateTime = `${date} ${time}`;
      }
    });
    
    // 複数日付選択の実装
    multiPicker = new Pikaday({
      field: multiDateInput,
      container: multiDateInput.parentElement,
      bound: false,
      onSelect: function(date) {
        const dateStr = this.toString('YYYY-MM-DD');
        if (!selectedDates.includes(dateStr)) {
          selectedDates = [...selectedDates, dateStr];
        } else {
          selectedDates = selectedDates.filter(d => d !== dateStr);
        }
        updateMultiDateDisplay();
      },
      onDraw: function() {
        // 選択された日付をハイライト
        const buttons = this._o.container.querySelectorAll('.pika-single button.pika-button');
        buttons.forEach(btn => {
          const year = Number(btn.getAttribute('data-pika-year'));
          const month = Number(btn.getAttribute('data-pika-month'));
          const day = Number(btn.getAttribute('data-pika-day'));
          
          if (year && !isNaN(month) && day) {
            const date = new Date(year, month, day);
            const dateStr = formatDate(date);
            if (selectedDates.includes(dateStr)) {
              btn.classList.add('is-multi-selected');
            }
          }
        });
      }
    });
    
    // インラインカレンダーの実装
    const inlinePicker = new Pikaday({
      bound: false,
      container: inlineContainer,
      onSelect: function() {
        inlineDate = this.toString('YYYY-MM-DD');
      }
    });
    
    // ミニカレンダーの実装
    const miniPicker = new Pikaday({
      bound: false,
      container: miniCalendarContainer,
      showDaysInNextAndPreviousMonths: false,
      numberOfMonths: 1,
      onSelect: function() {
        miniSelectedDate = this.toString('YYYY-MM-DD');
      }
    });
    
    // タイムゾーンピッカーの初期化
    tzPicker = new Pikaday({
      field: tzDateInput,
      container: tzDateInput.parentElement,
      onSelect: function() {
        const localDate = this.getDate();
        tzDate = formatDateWithTimezone(localDate, selectedTimezone);
      }
    });
    
    // 繰り返しピッカーの初期化
    recurringPicker = new Pikaday({
      field: recurringDateInput,
      container: recurringDateInput.parentElement,
      onSelect: function() {
        recurringDate = this.toString('YYYY-MM-DD');
      }
    });
    
    return () => {
      dateTimePicker?.destroy();
      multiPicker?.destroy();
      inlinePicker?.destroy();
      miniPicker?.destroy();
      modalPicker?.destroy();
      drawerPicker?.destroy();
      tzPicker?.destroy();
      recurringPicker?.destroy();
    };
  });
  
  // 時刻変更時の処理
  $effect(() => {
    if (dateTimePicker && dateTimePicker.getDate()) {
      const date = dateTimePicker.toString('YYYY-MM-DD');
      const time = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
      selectedDateTime = `${date} ${time}`;
    }
  });
  
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  function updateMultiDateDisplay() {
    if (selectedDates.length === 0) {
      multiDateInput.value = '日付を選択してください';
    } else if (selectedDates.length === 1) {
      multiDateInput.value = selectedDates[0];
    } else {
      multiDateInput.value = `${selectedDates.length}日選択中`;
    }
  }
  
  function clearMultiSelection() {
    selectedDates = [];
    updateMultiDateDisplay();
    if (multiPicker) {
      multiPicker.draw();
    }
  }
  
  async function initModalPicker() {
    if (modalPicker) return;
    
    const Pikaday = (await import('pikaday')).default;
    modalPicker = new Pikaday({
      field: modalDateInput,
      container: modalDateInput.parentElement,
      onSelect: function() {
        modalDate = this.toString('YYYY-MM-DD');
      }
    });
  }
  
  async function initDrawerPicker() {
    if (drawerPicker) return;
    
    const Pikaday = (await import('pikaday')).default;
    drawerPicker = new Pikaday({
      field: drawerDateInput,
      container: drawerDateInput.parentElement,
      onSelect: function() {
        drawerDate = this.toString('YYYY-MM-DD');
      }
    });
  }
  
  function formatDateWithTimezone(date, timezone) {
    return new Intl.DateTimeFormat('ja-JP', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  }
  
  function generateRecurrenceSummary() {
    if (!recurringDate || recurrenceType === 'none') return '';
    
    const summaries = {
      daily: '毎日',
      weekly: '毎週',
      monthly: '毎月',
      yearly: '毎年'
    };
    
    return `${summaries[recurrenceType]}、${recurringDate}から${recurrenceEnd ? recurrenceEnd + 'まで' : ''}`;
  }
  
  const recurrenceSummary = $derived(generateRecurrenceSummary());
  
  // サンプルコード
  const dateTimeCode = `<script>
  import { onMount } from 'svelte';
  
  let dateTimeInput;
  let selectedDateTime = $state('');
  let selectedHour = $state(9);
  let selectedMinute = $state(0);
  let dateTimePicker;
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    dateTimePicker = new Pikaday({
      field: dateTimeInput,
      container: dateTimeInput.parentElement,
      onSelect: function() {
        const date = this.toString('YYYY-MM-DD');
        const time = \`\${String(selectedHour).padStart(2, '0')}:\${String(selectedMinute).padStart(2, '0')}\`;
        selectedDateTime = \`\${date} \${time}\`;
      }
    });
    
    return () => dateTimePicker.destroy();
  });
  
  // 時刻変更時の処理
  $effect(() => {
    if (dateTimePicker && dateTimePicker.getDate()) {
      const date = dateTimePicker.toString('YYYY-MM-DD');
      const time = \`\${String(selectedHour).padStart(2, '0')}:\${String(selectedMinute).padStart(2, '0')}\`;
      selectedDateTime = \`\${date} \${time}\`;
    }
  });
<\/script>

<div class="form-control">
  <label class="label">
    <span class="label-text">日時を選択</span>
  </label>
  <div class="flex gap-2">
    <input 
      type="text" 
      class="input input-bordered pika-single flex-1"
      bind:this={dateTimeInput}
      placeholder="日付を選択"
      readonly
    />
    <select 
      class="select select-bordered w-24"
      bind:value={selectedHour}
    >
      {#each Array(24) as _, i}
        <option value={i}>{String(i).padStart(2, '0')}時</option>
      {/each}
    </select>
    <select 
      class="select select-bordered w-24"
      bind:value={selectedMinute}
    >
      {#each [0, 15, 30, 45] as minute}
        <option value={minute}>{String(minute).padStart(2, '0')}分</option>
      {/each}
    </select>
  </div>
  {#if selectedDateTime}
    <label class="label">
      <span class="label-text-alt">選択された日時: {selectedDateTime}</span>
    </label>
  {/if}
</div>`;

  const multiDateCode = `<script>
  import { onMount } from 'svelte';
  
  let multiDateInput;
  let selectedDates = $state([]);
  let multiPicker;
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    multiPicker = new Pikaday({
      field: multiDateInput,
      container: multiDateInput.parentElement,
      bound: false,
      onSelect: function(date) {
        const dateStr = this.toString('YYYY-MM-DD');
        if (!selectedDates.includes(dateStr)) {
          selectedDates = [...selectedDates, dateStr];
        } else {
          selectedDates = selectedDates.filter(d => d !== dateStr);
        }
        updateMultiDateDisplay();
      },
      onDraw: function() {
        // 選択された日付をハイライト
        const buttons = this._o.container.querySelectorAll('.pika-single button.pika-button');
        buttons.forEach(btn => {
          const year = Number(btn.getAttribute('data-pika-year'));
          const month = Number(btn.getAttribute('data-pika-month'));
          const day = Number(btn.getAttribute('data-pika-day'));
          
          if (year && !isNaN(month) && day) {
            const date = new Date(year, month, day);
            const dateStr = formatDate(date);
            if (selectedDates.includes(dateStr)) {
              btn.classList.add('is-multi-selected');
            }
          }
        });
      }
    });
    
    return () => multiPicker?.destroy();
  });
  
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return \`\${year}-\${month}-\${day}\`;
  }
  
  function updateMultiDateDisplay() {
    if (selectedDates.length === 0) {
      multiDateInput.value = '日付を選択してください';
    } else if (selectedDates.length === 1) {
      multiDateInput.value = selectedDates[0];
    } else {
      multiDateInput.value = \`\${selectedDates.length}日選択中\`;
    }
  }
<\/script>

<style>
  :global(.is-multi-selected) {
    background-color: oklch(var(--p)) !important;
    color: oklch(var(--pc)) !important;
  }
</style>`;

  const inlineCode = `<script>
  import { onMount } from 'svelte';
  
  let inlineContainer;
  let inlineDate = $state('');
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    const inlinePicker = new Pikaday({
      bound: false,
      container: inlineContainer,
      onSelect: function() {
        inlineDate = this.toString('YYYY-MM-DD');
      }
    });
    
    return () => inlinePicker.destroy();
  });
<\/script>

<div class="card bg-base-200">
  <div class="card-body">
    <h3 class="card-title">インラインカレンダー</h3>
    <div bind:this={inlineContainer}></div>
    {#if inlineDate}
      <div class="mt-4">
        <p class="text-sm">選択された日付: <span class="font-bold">{inlineDate}</span></p>
      </div>
    {/if}
  </div>
</div>`;

  const modalCode = `<script>
  import { onMount } from 'svelte';
  
  let modalDateInput;
  let modalDate = $state('');
  let modalPicker;
  
  async function initModalPicker() {
    if (modalPicker) return;
    
    const Pikaday = (await import('pikaday')).default;
    modalPicker = new Pikaday({
      field: modalDateInput,
      container: modalDateInput.parentElement,
      onSelect: function() {
        modalDate = this.toString('YYYY-MM-DD');
      }
    });
  }
<\/script>

<!-- モーダルトリガーボタン -->
<button class="btn btn-primary" onclick={async () => {
  document.getElementById('date_modal').showModal();
  await initModalPicker();
}}>
  日付選択モーダルを開く
</button>

<!-- モーダル -->
<dialog id="date_modal" class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg mb-4">日付を選択してください</h3>
    
    <div class="form-control">
      <label class="label">
        <span class="label-text">予約日</span>
      </label>
      <input 
        type="text" 
        class="input input-bordered pika-single"
        bind:this={modalDateInput}
        value={modalDate}
        placeholder="クリックして日付を選択"
        readonly
      />
    </div>
    
    {#if modalDate}
      <div class="alert alert-success mt-4">
        <span>選択された日付: {modalDate}</span>
      </div>
    {/if}
    
    <div class="modal-action">
      <form method="dialog">
        <button class="btn btn-ghost">キャンセル</button>
        <button class="btn btn-primary" disabled={!modalDate}>確定</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>`;

  const timezoneCode = `<script>
  import { onMount } from 'svelte';
  
  let tzDateInput;
  let tzDate = $state('');
  let selectedTimezone = $state('Asia/Tokyo');
  let tzPicker;
  
  const timezones = [
    { value: 'Asia/Tokyo', label: '東京 (JST)' },
    { value: 'America/New_York', label: 'ニューヨーク (EST)' },
    { value: 'Europe/London', label: 'ロンドン (GMT)' },
    { value: 'Australia/Sydney', label: 'シドニー (AEDT)' }
  ];
  
  function formatDateWithTimezone(date, timezone) {
    return new Intl.DateTimeFormat('ja-JP', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  }
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    tzPicker = new Pikaday({
      field: tzDateInput,
      container: tzDateInput.parentElement,
      onSelect: function() {
        const localDate = this.getDate();
        tzDate = formatDateWithTimezone(localDate, selectedTimezone);
      }
    });
    
    return () => tzPicker.destroy();
  });
<\/script>

<div class="form-control">
  <label class="label">
    <span class="label-text">タイムゾーン</span>
  </label>
  <select class="select select-bordered mb-4" bind:value={selectedTimezone}>
    {#each timezones as tz}
      <option value={tz.value}>{tz.label}</option>
    {/each}
  </select>
  
  <label class="label">
    <span class="label-text">日付を選択</span>
  </label>
  <input 
    type="text" 
    class="input input-bordered pika-single"
    bind:this={tzDateInput}
    placeholder="クリックして日付を選択"
    readonly
  />
  
  {#if tzDate}
    <div class="mt-4 p-4 bg-base-200 rounded-lg">
      <p class="text-sm font-semibold">選択された日時（{selectedTimezone}）:</p>
      <p class="text-lg">{tzDate}</p>
    </div>
  {/if}
</div>`;

  const recurringCode = `<script>
  import { onMount } from 'svelte';
  
  let recurringDateInput;
  let recurringDate = $state('');
  let recurrenceType = $state('none');
  let recurrenceEnd = $state('');
  let recurringPicker;
  
  function generateRecurrenceSummary() {
    if (!recurringDate || recurrenceType === 'none') return '';
    
    const summaries = {
      daily: '毎日',
      weekly: '毎週',
      monthly: '毎月',
      yearly: '毎年'
    };
    
    return \`\${summaries[recurrenceType]}、\${recurringDate}から\${recurrenceEnd ? recurrenceEnd + 'まで' : ''}\`;
  }
  
  const recurrenceSummary = $derived(generateRecurrenceSummary());
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    recurringPicker = new Pikaday({
      field: recurringDateInput,
      container: recurringDateInput.parentElement,
      onSelect: function() {
        recurringDate = this.toString('YYYY-MM-DD');
      }
    });
    
    return () => recurringPicker.destroy();
  });
<\/script>

<div class="form-control">
  <label class="label">
    <span class="label-text">開始日</span>
  </label>
  <input 
    type="text" 
    class="input input-bordered pika-single"
    bind:this={recurringDateInput}
    value={recurringDate}
    placeholder="開始日を選択"
    readonly
  />
  
  <label class="label mt-4">
    <span class="label-text">繰り返し設定</span>
  </label>
  <select class="select select-bordered" bind:value={recurrenceType}>
    <option value="none">なし</option>
    <option value="daily">毎日</option>
    <option value="weekly">毎週</option>
    <option value="monthly">毎月</option>
    <option value="yearly">毎年</option>
  </select>
  
  {#if recurrenceType !== 'none'}
    <label class="label mt-4">
      <span class="label-text">終了日（任意）</span>
    </label>
    <input 
      type="date" 
      class="input input-bordered"
      bind:value={recurrenceEnd}
      min={recurringDate}
    />
  {/if}
  
  {#if recurrenceSummary}
    <div class="alert alert-info mt-4">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>{recurrenceSummary}</span>
    </div>
  {/if}
</div>`;
</script>

<div class="space-y-8">
  <!-- イントロダクション -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title text-2xl">⚡ 高度な機能</h2>
      <p class="text-base-content/70">
        実際の開発でよく必要となる、より高度なカレンダー機能の実装例です。
        時刻選択、複数日付選択、インライン表示、モーダル統合など、実用的な機能を網羅しています。
      </p>
    </div>
  </div>

  <!-- 1. 時刻選択も含むピッカー -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-xl font-bold">時刻選択も含むピッカー</h3>
          <p class="text-sm text-base-content/70 mt-1">
            日付選択と時刻選択を組み合わせた実装例
          </p>
        </div>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(dateTimeCode, 'datetime')}
        >
          {#if copySuccess['datetime']}
            <span class="text-success">✓ コピーしました</span>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            コピー
          {/if}
        </button>
      </div>

      <!-- デモ -->
      <div class="bg-base-200 p-6 rounded-lg mb-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">日時を選択</span>
          </label>
          <div class="flex gap-2">
            <input 
              type="text" 
              class="input input-bordered pika-single flex-1"
              bind:this={dateTimeInput}
              placeholder="日付を選択"
              readonly
            />
            <select 
              class="select select-bordered w-24"
              bind:value={selectedHour}
            >
              {#each Array(24) as _, i}
                <option value={i}>{String(i).padStart(2, '0')}時</option>
              {/each}
            </select>
            <select 
              class="select select-bordered w-24"
              bind:value={selectedMinute}
            >
              {#each [0, 15, 30, 45] as minute}
                <option value={minute}>{String(minute).padStart(2, '0')}分</option>
              {/each}
            </select>
          </div>
          {#if selectedDateTime}
            <label class="label">
              <span class="label-text-alt">選択された日時: {selectedDateTime}</span>
            </label>
          {/if}
        </div>
      </div>

      <!-- コード表示 -->
      <div class="collapse collapse-arrow bg-base-200">
        <input type="checkbox" />
        <div class="collapse-title font-medium">
          コードを表示
        </div>
        <div class="collapse-content">
          <HighlightSvelte code={dateTimeCode} />
        </div>
      </div>
    </div>
  </div>

  <!-- 2. 複数日付の選択 -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-xl font-bold">複数日付の選択</h3>
          <p class="text-sm text-base-content/70 mt-1">
            複数の日付を選択・管理できる実装例
          </p>
        </div>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(multiDateCode, 'multidate')}
        >
          {#if copySuccess['multidate']}
            <span class="text-success">✓ コピーしました</span>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            コピー
          {/if}
        </button>
      </div>

      <!-- デモ -->
      <div class="bg-base-200 p-6 rounded-lg mb-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">複数の日付を選択（クリックで選択/解除）</span>
          </label>
          <div class="flex gap-2">
            <input 
              type="text" 
              class="input input-bordered pika-single flex-1"
              bind:this={multiDateInput}
              value="日付を選択してください"
              readonly
            />
            <button 
              class="btn btn-ghost btn-sm"
              onclick={clearMultiSelection}
              disabled={selectedDates.length === 0}
            >
              クリア
            </button>
          </div>
          
          {#if selectedDates.length > 0}
            <div class="mt-4">
              <p class="text-sm font-semibold mb-2">選択された日付:</p>
              <div class="flex flex-wrap gap-2">
                {#each selectedDates as date}
                  <div class="badge badge-primary badge-lg">{date}</div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- コード表示 -->
      <div class="collapse collapse-arrow bg-base-200">
        <input type="checkbox" />
        <div class="collapse-title font-medium">
          コードを表示
        </div>
        <div class="collapse-content">
          <HighlightSvelte code={multiDateCode} />
        </div>
      </div>
    </div>
  </div>

  <!-- 3. インライン表示のカレンダー -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-xl font-bold">インライン表示のカレンダー</h3>
          <p class="text-sm text-base-content/70 mt-1">
            常に表示されるカレンダーの実装例
          </p>
        </div>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(inlineCode, 'inline')}
        >
          {#if copySuccess['inline']}
            <span class="text-success">✓ コピーしました</span>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            コピー
          {/if}
        </button>
      </div>

      <!-- デモ -->
      <div class="grid lg:grid-cols-2 gap-6">
        <div class="card bg-base-200">
          <div class="card-body">
            <h3 class="card-title">インラインカレンダー</h3>
            <div bind:this={inlineContainer}></div>
            {#if inlineDate}
              <div class="mt-4">
                <p class="text-sm">選択された日付: <span class="font-bold">{inlineDate}</span></p>
              </div>
            {/if}
          </div>
        </div>
        
        <div class="card bg-base-200">
          <div class="card-body">
            <h3 class="card-title">ミニカレンダー</h3>
            <div bind:this={miniCalendarContainer} class="mini-calendar"></div>
            {#if miniSelectedDate}
              <div class="mt-4">
                <p class="text-sm">選択: <span class="font-bold">{miniSelectedDate}</span></p>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- コード表示 -->
      <div class="collapse collapse-arrow bg-base-200 mt-4">
        <input type="checkbox" />
        <div class="collapse-title font-medium">
          コードを表示
        </div>
        <div class="collapse-content">
          <HighlightSvelte code={inlineCode} />
        </div>
      </div>
    </div>
  </div>

  <!-- 4. モーダル内でのカレンダー使用 -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-xl font-bold">モーダル内でのカレンダー使用</h3>
          <p class="text-sm text-base-content/70 mt-1">
            モーダルダイアログ内でカレンダーを使用する実装例
          </p>
        </div>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(modalCode, 'modal')}
        >
          {#if copySuccess['modal']}
            <span class="text-success">✓ コピーしました</span>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            コピー
          {/if}
        </button>
      </div>

      <!-- デモ -->
      <div class="bg-base-200 p-6 rounded-lg mb-4">
        <div class="flex gap-4">
          <!-- モーダルトリガー -->
          <button class="btn btn-primary" onclick={async () => {
            document.getElementById('date_modal').showModal();
            await initModalPicker();
          }}>
            日付選択モーダルを開く
          </button>
          
          <!-- ドロワートリガー -->
          <label for="date-drawer" class="btn btn-secondary" onclick={initDrawerPicker}>
            日付選択ドロワーを開く
          </label>
        </div>
        
        {#if modalDate}
          <div class="mt-4">
            <p class="text-sm">モーダルで選択: <span class="font-bold">{modalDate}</span></p>
          </div>
        {/if}
        
        {#if drawerDate}
          <div class="mt-2">
            <p class="text-sm">ドロワーで選択: <span class="font-bold">{drawerDate}</span></p>
          </div>
        {/if}
      </div>

      <!-- モーダル -->
      <dialog id="date_modal" class="modal">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">日付を選択してください</h3>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">予約日</span>
            </label>
            <input 
              type="text" 
              class="input input-bordered pika-single"
              bind:this={modalDateInput}
              value={modalDate}
              placeholder="クリックして日付を選択"
              readonly
            />
          </div>
          
          {#if modalDate}
            <div class="alert alert-success mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>選択された日付: {modalDate}</span>
            </div>
          {/if}
          
          <div class="modal-action">
            <form method="dialog">
              <button class="btn btn-ghost">キャンセル</button>
              <button class="btn btn-primary" disabled={!modalDate}>確定</button>
            </form>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <!-- ドロワー -->
      <div class="drawer drawer-end">
        <input id="date-drawer" type="checkbox" class="drawer-toggle" />
        <div class="drawer-side z-50">
          <label for="date-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
          <div class="bg-base-100 w-80 min-h-full p-6">
            <h3 class="font-bold text-lg mb-4">日付を選択</h3>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">希望日</span>
              </label>
              <input 
                type="text" 
                class="input input-bordered pika-single"
                bind:this={drawerDateInput}
                value={drawerDate}
                placeholder="クリックして日付を選択"
                readonly
              />
            </div>
            
            {#if drawerDate}
              <div class="alert alert-info mt-4">
                <span>選択: {drawerDate}</span>
              </div>
            {/if}
            
            <div class="mt-6">
              <label for="date-drawer" class="btn btn-primary btn-block">
                確定
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- コード表示 -->
      <div class="collapse collapse-arrow bg-base-200">
        <input type="checkbox" />
        <div class="collapse-title font-medium">
          コードを表示
        </div>
        <div class="collapse-content">
          <HighlightSvelte code={modalCode} />
        </div>
      </div>
    </div>
  </div>

  <!-- 5. タイムゾーン対応カレンダー -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-xl font-bold">タイムゾーン対応カレンダー</h3>
          <p class="text-sm text-base-content/70 mt-1">
            複数のタイムゾーンに対応したカレンダーの実装例
          </p>
        </div>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(timezoneCode, 'timezone')}
        >
          {#if copySuccess['timezone']}
            <span class="text-success">✓ コピーしました</span>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            コピー
          {/if}
        </button>
      </div>

      <!-- デモ -->
      <div class="bg-base-200 p-6 rounded-lg mb-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">タイムゾーン</span>
          </label>
          <select class="select select-bordered mb-4" bind:value={selectedTimezone}>
            {#each timezones as tz}
              <option value={tz.value}>{tz.label}</option>
            {/each}
          </select>
          
          <label class="label">
            <span class="label-text">日付を選択</span>
          </label>
          <input 
            type="text" 
            class="input input-bordered pika-single"
            bind:this={tzDateInput}
            placeholder="クリックして日付を選択"
            readonly
          />
          
          {#if tzDate}
            <div class="mt-4 p-4 bg-base-100 rounded-lg">
              <p class="text-sm font-semibold">選択された日時（{selectedTimezone}）:</p>
              <p class="text-lg">{tzDate}</p>
            </div>
          {/if}
        </div>
      </div>

      <!-- コード表示 -->
      <div class="collapse collapse-arrow bg-base-200">
        <input type="checkbox" />
        <div class="collapse-title font-medium">
          コードを表示
        </div>
        <div class="collapse-content">
          <HighlightSvelte code={timezoneCode} />
        </div>
      </div>
    </div>
  </div>

  <!-- 6. 繰り返し設定付きカレンダー -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-xl font-bold">繰り返し設定付きカレンダー</h3>
          <p class="text-sm text-base-content/70 mt-1">
            定期的なイベントの設定に対応したカレンダーの実装例
          </p>
        </div>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(recurringCode, 'recurring')}
        >
          {#if copySuccess['recurring']}
            <span class="text-success">✓ コピーしました</span>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            コピー
          {/if}
        </button>
      </div>

      <!-- デモ -->
      <div class="bg-base-200 p-6 rounded-lg mb-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">開始日</span>
          </label>
          <input 
            type="text" 
            class="input input-bordered pika-single"
            bind:this={recurringDateInput}
            value={recurringDate}
            placeholder="開始日を選択"
            readonly
          />
          
          <label class="label mt-4">
            <span class="label-text">繰り返し設定</span>
          </label>
          <select class="select select-bordered" bind:value={recurrenceType}>
            <option value="none">なし</option>
            <option value="daily">毎日</option>
            <option value="weekly">毎週</option>
            <option value="monthly">毎月</option>
            <option value="yearly">毎年</option>
          </select>
          
          {#if recurrenceType !== 'none'}
            <label class="label mt-4">
              <span class="label-text">終了日（任意）</span>
            </label>
            <input 
              type="date" 
              class="input input-bordered"
              bind:value={recurrenceEnd}
              min={recurringDate}
            />
          {/if}
          
          {#if recurrenceSummary}
            <div class="alert alert-info mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{recurrenceSummary}</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- コード表示 -->
      <div class="collapse collapse-arrow bg-base-200">
        <input type="checkbox" />
        <div class="collapse-title font-medium">
          コードを表示
        </div>
        <div class="collapse-content">
          <HighlightSvelte code={recurringCode} />
        </div>
      </div>
    </div>
  </div>

  <!-- Tips -->
  <div class="card bg-primary/10 border-2 border-primary/20">
    <div class="card-body">
      <h3 class="font-bold text-primary flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        実装のポイント
      </h3>
      <ul class="list-disc list-inside space-y-2 text-sm">
        <li>モーダルやドロワー内で使用する場合は、初期化タイミングに注意（表示時に初期化）</li>
        <li>複数日付選択では、選択状態を配列で管理し、onDrawで視覚的フィードバックを提供</li>
        <li>タイムゾーン対応では、Intl.DateTimeFormatを活用して正確な変換を実現</li>
        <li>インラインカレンダーでは、bound: falseオプションを使用して独立表示</li>
        <li>繰り返し設定では、UIを分かりやすくするために要約表示を追加</li>
      </ul>
    </div>
  </div>
</div>

<style>
  :global(.is-multi-selected) {
    background-color: oklch(var(--p)) !important;
    color: oklch(var(--pc)) !important;
  }
  
  :global(.mini-calendar .pika-single) {
    font-size: 0.875rem;
  }
  
  :global(.mini-calendar .pika-single th),
  :global(.mini-calendar .pika-single td) {
    width: 2rem;
    height: 2rem;
  }
  
  :global(.mini-calendar .pika-single abbr) {
    font-size: 0.75rem;
  }
</style>