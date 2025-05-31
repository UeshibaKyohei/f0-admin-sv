<script>
  import { onMount } from 'svelte';
  import { HighlightSvelte } from 'svelte-highlight';
  import 'svelte-highlight/styles/dark.css';
  
  let { copyToClipboard, copySuccess } = $props();
  
  // カスタマイズ例1: 日本語化
  let localizedDate = $state('');
  let localizedInput;
  
  // カスタマイズ例2: 特定の日付を無効化
  let restrictedDate = $state('');
  let restrictedInput;
  
  // カスタマイズ例3: 週末・祝日のハイライト
  let holidayDate = $state('');
  let holidayInput;
  let holidayContainer;
  
  // カスタマイズ例4: カスタムフォーマット
  let formattedDate = $state('');
  let formattedInput;
  
  // カスタマイズ例5: 複数月表示（横並び）
  let multiMonthDate = $state('');
  let multiMonthInput;
  let multiMonthContainer;
  
  // 日本の祝日データ（2025年）
  const holidays = [
    '2025-01-01', // 元日
    '2025-01-13', // 成人の日
    '2025-02-11', // 建国記念の日
    '2025-02-23', // 天皇誕生日
    '2025-02-24', // 振替休日
    '2025-03-20', // 春分の日
    '2025-04-29', // 昭和の日
    '2025-05-03', // 憲法記念日
    '2025-05-04', // みどりの日
    '2025-05-05', // こどもの日
    '2025-05-06', // 振替休日
    '2025-07-21', // 海の日
    '2025-08-11', // 山の日
    '2025-09-15', // 敬老の日
    '2025-09-23', // 秋分の日
    '2025-10-13', // スポーツの日
    '2025-11-03', // 文化の日
    '2025-11-23', // 勤労感謝の日
    '2025-11-24'  // 振替休日
  ].map(d => new Date(d));
  
  // サンプルコード
  const localizationCode = `<script>
  import { onMount } from 'svelte';
  
  let localizedDate = $state('');
  let localizedInput;
  
  // 日本語化設定
  const pikadayI18n = {
    previousMonth: '前月',
    nextMonth: '翌月',
    months: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    weekdays: ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],
    weekdaysShort: ['日','月','火','水','木','金','土']
  };
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    const picker = new Pikaday({
      field: localizedInput,
      container: localizedInput.parentElement,
      i18n: pikadayI18n,
      firstDay: 0, // 日曜始まり (1にすると月曜始まり)
      yearRange: [1900, 2100],
      showWeekNumber: true,
      onSelect: function() {
        const date = this.getDate();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        const weekday = weekdays[date.getDay()];
        
        localizedDate = \`\${year}年\${month}月\${day}日(\${weekday})\`;
      }
    });
    
    return () => picker.destroy();
  });
<\/script>

<input 
  type="text" 
  class="input input-bordered pika-single"
  bind:this={localizedInput}
  value={localizedDate}
  placeholder="日付を選択してください"
  readonly
/>`;

  const disableDatesCode = `<script>
  import { onMount } from 'svelte';
  
  let restrictedDate = $state('');
  let restrictedInput;
  
  // 日本語化設定
  const pikadayI18n = {
    previousMonth: '前月',
    nextMonth: '翌月',
    months: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    weekdays: ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],
    weekdaysShort: ['日','月','火','水','木','金','土']
  };
  
  // 会社の休業日（2025年）
  const companyHolidays = [
    '2025-08-13', '2025-08-14', '2025-08-15', // 夏季休暇
    '2025-12-29', '2025-12-30', '2025-12-31'  // 年末休暇
  ];
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    const picker = new Pikaday({
      field: restrictedInput,
      container: restrictedInput.parentElement,
      i18n: pikadayI18n,
      minDate: new Date(),
      maxDate: new Date(2025, 11, 31),
      disableDayFn: function(date) {
        // 週末を無効化
        const day = date.getDay();
        if (day === 0 || day === 6) {
          return true;
        }
        
        // 特定の日付を無効化
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayNum = String(date.getDate()).padStart(2, '0');
        const dateStr = \`\${year}-\${month}-\${dayNum}\`;
        
        return companyHolidays.includes(dateStr);
      },
      onSelect: function() {
        const date = this.getDate();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        restrictedDate = \`\${year}-\${month}-\${day}\`;
      }
    });
    
    return () => picker.destroy();
  });
<\/script>

<input 
  type="text" 
  class="input input-bordered pika-single"
  bind:this={restrictedInput}
  value={restrictedDate}
  placeholder="営業日を選択"
  readonly
/>`;

  const holidayHighlightCode = `<script>
  import { onMount } from 'svelte';
  
  let holidayDate = $state('');
  let holidayInput;
  let holidayContainer;
  
  // 日本語化設定
  const pikadayI18n = {
    previousMonth: '前月',
    nextMonth: '翌月',
    months: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    weekdays: ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],
    weekdaysShort: ['日','月','火','水','木','金','土']
  };
  
  // 祝日データ（2025年）
  const holidays = [
    '2025-01-01', // 元日
    '2025-01-13', // 成人の日
    '2025-02-11', // 建国記念の日
    '2025-02-23', // 天皇誕生日
    '2025-02-24', // 振替休日
    '2025-03-20', // 春分の日
    '2025-04-29', // 昭和の日
    '2025-05-03', // 憲法記念日
    '2025-05-04', // みどりの日
    '2025-05-05', // こどもの日
    '2025-05-06', // 振替休日
    '2025-07-21', // 海の日
    '2025-08-11', // 山の日
    '2025-09-15', // 敬老の日
    '2025-09-23', // 秋分の日
    '2025-10-13', // スポーツの日
    '2025-11-03', // 文化の日
    '2025-11-23', // 勤労感謝の日
    '2025-11-24'  // 振替休日
  ].map(d => new Date(d));
  
  const holidayNames = {
    '2025-01-01': '元日',
    '2025-01-13': '成人の日',
    '2025-02-11': '建国記念の日',
    '2025-02-23': '天皇誕生日',
    '2025-02-24': '振替休日',
    '2025-03-20': '春分の日',
    '2025-04-29': '昭和の日',
    '2025-05-03': '憲法記念日',
    '2025-05-04': 'みどりの日',
    '2025-05-05': 'こどもの日',
    '2025-05-06': '振替休日',
    '2025-07-21': '海の日',
    '2025-08-11': '山の日',
    '2025-09-15': '敬老の日',
    '2025-09-23': '秋分の日',
    '2025-10-13': 'スポーツの日',
    '2025-11-03': '文化の日',
    '2025-11-23': '勤労感謝の日',
    '2025-11-24': '振替休日'
  };
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    const picker = new Pikaday({
      field: holidayInput,
      container: holidayContainer,
      i18n: pikadayI18n,
      onDraw: function() {
        // Pikadayの日付はbuttonタグとして生成される
        const buttons = holidayContainer.querySelectorAll('.pika-single button.pika-button');
        
        buttons.forEach(btn => {
          const year = Number(btn.getAttribute('data-pika-year'));
          const month = Number(btn.getAttribute('data-pika-month'));
          const day = Number(btn.getAttribute('data-pika-day'));
          
          if (year && !isNaN(month) && day) {
            const dateStr = \`\${year}-\${String(month + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
            
            // 祝日判定
            if (holidays.some(h =>
              h.getFullYear() === year &&
              h.getMonth() === month &&
              h.getDate() === day
            )) {
              btn.classList.add('is-holiday');
              if (holidayNames[dateStr]) {
                btn.setAttribute('title', holidayNames[dateStr]);
              }
            } else {
              btn.classList.remove('is-holiday');
            }
            
            // 週末判定（0:日曜、6:土曜）
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0) {
              btn.classList.add('is-sunday');
            } else if (dayOfWeek === 6) {
              btn.classList.add('is-saturday');
            }
          }
        });
      },
      onSelect: function() {
        const date = this.getDate();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = \`\${year}-\${month}-\${day}\`;
        
        holidayDate = dateStr;
        if (holidayNames[dateStr]) {
          holidayDate += \` (\${holidayNames[dateStr]})\`;
        }
      }
    });
    
    return () => picker.destroy();
  });
<\/script>

<div bind:this={holidayContainer} class="holiday-calendar">
  <input 
    type="text" 
    class="input input-bordered pika-single"
    bind:this={holidayInput}
    value={holidayDate}
    placeholder="日付を選択"
    readonly
  />
</div>

<style>
  /* このコンポーネント内のカレンダーにのみ適用 */
  :global(.holiday-calendar .pika-single button.is-holiday) {
    background-color: #ffe4e1;
    color: #d00;
    font-weight: bold;
  }
  
  /* 土日のスタイル（このコンポーネント内のみ） */
  :global(.holiday-calendar .pika-single button.is-sunday) {
    color: #dc2626;
  }
  
  :global(.holiday-calendar .pika-single button.is-saturday) {
    color: #2563eb;
  }
</style>`;

  const customFormatCode = `<script>
  import { onMount } from 'svelte';
  
  let formattedDate = $state('');
  let formattedInput;
  
  // 日本語化設定
  const pikadayI18n = {
    previousMonth: '前月',
    nextMonth: '翌月',
    months: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    weekdays: ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],
    weekdaysShort: ['日','月','火','水','木','金','土']
  };
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    const picker = new Pikaday({
      field: formattedInput,
      container: formattedInput.parentElement,
      i18n: pikadayI18n,
      // カスタムフォーマット（日本語表記）
      toString(date, format) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        const weekday = weekdays[date.getDay()];
        return \`\${year}年\${month}月\${day}日(\${weekday})\`;
      },
      parse(dateString, format) {
        const values = dateString.match(/(\d+)/g);
        if (values && values.length >= 3) {
          return new Date(values[0], values[1] - 1, values[2]);
        }
        return new Date();
      },
      onSelect: function() {
        const date = this.getDate();
        formattedDate = this.toString(date);
      }
    });
    
    return () => picker.destroy();
  });
<\/script>

<input 
  type="text" 
  class="input input-bordered pika-single"
  bind:this={formattedInput}
  value={formattedDate}
  placeholder="日付を選択"
  readonly
/>

<!-- 他のフォーマット例 -->
<div class="mt-4 text-sm text-base-content/70">
  <p class="font-bold mb-2">よく使うフォーマット例：</p>
  <pre class="bg-base-200 p-2 rounded"><code>// YYYY-MM-DD形式
toString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return \`\${year}-\${month}-\${day}\`;
}

// スラッシュ区切り
toString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return \`\${year}/\${month}/\${day}\`;
}

// 相対日付
toString(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diff = Math.floor((date - today) / (1000 * 60 * 60 * 24));
  
  if (diff === 0) return '今日';
  if (diff === 1) return '明日';
  if (diff === -1) return '昨日';
  return \`\${diff > 0 ? diff + '日後' : Math.abs(diff) + '日前'}\`;
}</code></pre>
</div>`;

  const multiMonthCode = `<script>
  import { onMount } from 'svelte';
  
  let multiMonthDate = $state('');
  let multiMonthInput;
  
  // 日本語化設定
  const pikadayI18n = {
    previousMonth: '前月',
    nextMonth: '翌月',
    months: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    weekdays: ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],
    weekdaysShort: ['日','月','火','水','木','金','土']
  };
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    const picker = new Pikaday({
      field: multiMonthInput,
      container: multiMonthInput.parentElement,
      i18n: pikadayI18n,
      numberOfMonths: 2, // 2ヶ月分表示
      mainCalendar: 'left', // メインカレンダーの位置
      onSelect: function() {
        const date = this.getDate();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        multiMonthDate = \`\${year}-\${month}-\${day}\`;
      }
    });
    
    return () => picker.destroy();
  });
<\/script>

<input 
  type="text" 
  class="input input-bordered pika-single"
  bind:this={multiMonthInput}
  value={multiMonthDate}
  placeholder="日付を選択"
  readonly
/>

<style>
  /* 複数月を横並びに表示 */
  :global(.pika-single.pika-multi) {
    width: auto !important;
  }
  
  :global(.pika-single.pika-multi .pika-lendar) {
    float: left;
    margin: 0 1em 0 0;
  }
</style>`;
  
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
    
    // 1. 日本語化
    const localizedPicker = new Pikaday({
      field: localizedInput,
      container: localizedInput.parentElement,
      i18n: pikadayI18n,
      firstDay: 0,
      yearRange: [1900, 2100],
      showWeekNumber: false, // 週番号は非表示
      onSelect: function() {
        const date = this.getDate();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        const weekday = weekdays[date.getDay()];
        
        localizedDate = `${year}年${month}月${day}日(${weekday})`;
      }
    });
    
    // 2. 特定の日付を無効化
    const companyHolidays = [
      '2025-08-13', '2025-08-14', '2025-08-15',
      '2025-12-29', '2025-12-30', '2025-12-31'
    ];
    
    const restrictedPicker = new Pikaday({
      field: restrictedInput,
      container: restrictedInput.parentElement,
      i18n: pikadayI18n,
      minDate: new Date(),
      maxDate: new Date(2025, 11, 31),
      disableDayFn: function(date) {
        const day = date.getDay();
        if (day === 0 || day === 6) {
          return true;
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayNum = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayNum}`;
        
        return companyHolidays.includes(dateStr);
      },
      onSelect: function() {
        const date = this.getDate();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        restrictedDate = `${year}-${month}-${day}`;
      }
    });
    
    // 3. 週末・祝日のハイライト
    const holidayNames = {
      '2025-01-01': '元日',
      '2025-01-13': '成人の日',
      '2025-02-11': '建国記念の日',
      '2025-02-23': '天皇誕生日',
      '2025-02-24': '振替休日',
      '2025-03-20': '春分の日',
      '2025-04-29': '昭和の日',
      '2025-05-03': '憲法記念日',
      '2025-05-04': 'みどりの日',
      '2025-05-05': 'こどもの日',
      '2025-05-06': '振替休日',
      '2025-07-21': '海の日',
      '2025-08-11': '山の日',
      '2025-09-15': '敬老の日',
      '2025-09-23': '秋分の日',
      '2025-10-13': 'スポーツの日',
      '2025-11-03': '文化の日',
      '2025-11-23': '勤労感謝の日',
      '2025-11-24': '振替休日'
    };
    
    const holidayPicker = new Pikaday({
      field: holidayInput,
      container: holidayContainer,
      i18n: pikadayI18n,
      onDraw: function() {
        // Pikadayの日付はbuttonタグとして生成される
        const buttons = holidayContainer.querySelectorAll('.pika-single button.pika-button');
        
        buttons.forEach(btn => {
          const year = Number(btn.getAttribute('data-pika-year'));
          const month = Number(btn.getAttribute('data-pika-month'));
          const day = Number(btn.getAttribute('data-pika-day'));
          
          if (year && !isNaN(month) && day) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            // 祝日判定
            if (holidays.some(h =>
              h.getFullYear() === year &&
              h.getMonth() === month &&
              h.getDate() === day
            )) {
              btn.classList.add('is-holiday');
              if (holidayNames[dateStr]) {
                btn.setAttribute('title', holidayNames[dateStr]);
              }
            } else {
              btn.classList.remove('is-holiday');
            }
            
            // 週末判定（0:日曜、6:土曜）
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0) {
              btn.classList.add('is-sunday');
            } else if (dayOfWeek === 6) {
              btn.classList.add('is-saturday');
            }
          }
        });
      },
      onSelect: function() {
        const date = this.getDate();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        holidayDate = dateStr;
        if (holidayNames[dateStr]) {
          holidayDate += ` (${holidayNames[dateStr]})`;
        }
      }
    });
    
    // 4. カスタムフォーマット
    const formattedPicker = new Pikaday({
      field: formattedInput,
      container: formattedInput.parentElement,
      i18n: pikadayI18n,
      toString(date, format) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        const weekday = weekdays[date.getDay()];
        return `${year}年${month}月${day}日(${weekday})`;
      },
      parse(dateString, format) {
        const values = dateString.match(/(\d+)/g);
        if (values && values.length >= 3) {
          return new Date(values[0], values[1] - 1, values[2]);
        }
        return new Date();
      },
      onSelect: function() {
        const date = this.getDate();
        formattedDate = this.toString(date);
      }
    });
    
    // 5. 複数月表示
    const multiMonthContainer = document.querySelector('.multi-month-calendar');
    const multiMonthPicker = new Pikaday({
      field: multiMonthInput,
      container: multiMonthContainer,
      i18n: pikadayI18n,
      numberOfMonths: 2,
      mainCalendar: 'left',
      onSelect: function() {
        const date = this.getDate();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        multiMonthDate = `${year}-${month}-${day}`;
      }
    });
    
    return () => {
      localizedPicker?.destroy();
      restrictedPicker?.destroy();
      holidayPicker?.destroy();
      formattedPicker?.destroy();
      multiMonthPicker?.destroy();
    };
  });
</script>

<div class="space-y-8">
  <!-- セクションタイトル -->
  <div class="text-center">
    <h2 class="text-3xl font-bold text-primary mb-2">カスタマイズ例</h2>
    <p class="text-base-content/70">実用的なカレンダーカスタマイズの実装例</p>
  </div>

  <!-- 1. 日本語化（ローカライゼーション） -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <h3 class="card-title">1. 日本語化（ローカライゼーション）</h3>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(localizationCode, 'localization')}
        >
          {copySuccess['localization'] ? '✓ コピー済み' : 'コピー'}
        </button>
      </div>
      
      <div class="space-y-4">
        <div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">日本語化されたカレンダー</span>
            </label>
            <input 
              type="text" 
              class="input input-bordered pika-single"
              bind:this={localizedInput}
              value={localizedDate}
              placeholder="日付を選択してください"
              readonly
            />
          </div>
          
          <div class="stats shadow mt-4">
            <div class="stat">
              <div class="stat-title">カスタマイズ可能な項目</div>
              <div class="stat-desc">
                • 月名・曜日名の表示<br/>
                • ナビゲーションボタンのテキスト<br/>
                • 週の開始曜日（日曜/月曜）<br/>
                • 日付フォーマット<br/>
                • 週番号の表示
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
            <HighlightSvelte code={localizationCode} />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 2. 特定の日付を無効化 -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <h3 class="card-title">2. 特定の日付を無効化</h3>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(disableDatesCode, 'disable-dates')}
        >
          {copySuccess['disable-dates'] ? '✓ コピー済み' : 'コピー'}
        </button>
      </div>
      
      <div class="space-y-4">
        <div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">営業日のみ選択可能</span>
              <span class="label-text-alt">週末と会社休業日は選択不可</span>
            </label>
            <input 
              type="text" 
              class="input input-bordered pika-single"
              bind:this={restrictedInput}
              value={restrictedDate}
              placeholder="営業日を選択"
              readonly
            />
          </div>
          
          <div class="divider">無効化される日付</div>
          
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p class="font-bold mb-1">週末</p>
              <ul class="list-disc list-inside text-base-content/70">
                <li>土曜日</li>
                <li>日曜日</li>
              </ul>
            </div>
            <div>
              <p class="font-bold mb-1">会社休業日（2025年）</p>
              <ul class="list-disc list-inside text-base-content/70">
                <li>8/13-15（夏季休暇）</li>
                <li>12/29-31（年末休暇）</li>
              </ul>
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
            <HighlightSvelte code={disableDatesCode} />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 3. 週末・祝日のハイライト -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <h3 class="card-title">3. 週末・祝日のハイライト</h3>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(holidayHighlightCode, 'holiday-highlight')}
        >
          {copySuccess['holiday-highlight'] ? '✓ コピー済み' : 'コピー'}
        </button>
      </div>
      
      <div class="space-y-4">
        <div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">日本の祝日対応カレンダー（2025年）</span>
            </label>
            <div bind:this={holidayContainer} class="holiday-calendar">
              <input 
                type="text" 
                class="input input-bordered pika-single"
                bind:this={holidayInput}
                value={holidayDate}
                placeholder="日付を選択"
                readonly
              />
            </div>
          </div>
          
          <div class="alert mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6 shrink-0 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <div>
              <div class="text-xs">
                <span class="text-red-600 font-bold">■</span> 日曜日・祝日　
                <span class="text-blue-600 font-bold">■</span> 土曜日　
                <span class="inline-block px-2 bg-[#ffe4e1] text-[#d00] rounded text-xs font-bold">祝日背景</span>
              </div>
            </div>
          </div>
          
          <div class="mt-4">
            <p class="text-sm font-bold mb-2">実装のポイント：</p>
            <ul class="text-sm space-y-1 text-base-content/70">
              <li>• onDrawでbutton.pika-button要素を取得</li>
              <li>• data-pika-*属性から日付情報を読み取り</li>
              <li>• is-holiday, is-sunday, is-saturdayクラスを追加</li>
              <li>• title属性で祝日名をツールチップ表示</li>
            </ul>
          </div>
        </div>
        
        <!-- コード表示切り替え -->
        <div class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div class="collapse-title font-medium">
            コードを表示
          </div>
          <div class="collapse-content">
            <HighlightSvelte code={holidayHighlightCode} />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 4. カスタムフォーマット -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <h3 class="card-title">4. カスタムフォーマット</h3>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(customFormatCode, 'custom-format')}
        >
          {copySuccess['custom-format'] ? '✓ コピー済み' : 'コピー'}
        </button>
      </div>
      
      <div class="space-y-4">
        <div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">日本語形式の日付表示</span>
            </label>
            <input 
              type="text" 
              class="input input-bordered pika-single"
              bind:this={formattedInput}
              value={formattedDate}
              placeholder="日付を選択"
              readonly
            />
          </div>
          
          <div class="alert alert-info mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6 shrink-0 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <div class="text-xs">
              toStringメソッドをカスタマイズすることで、任意のフォーマットで日付を表示できます。
              parseメソッドも実装すれば、入力値の解析も可能です。
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
            <HighlightSvelte code={customFormatCode} />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 5. 複数月表示（横並び） -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <h3 class="card-title">5. 複数月表示（横並び）</h3>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(multiMonthCode, 'multi-month')}
        >
          {copySuccess['multi-month'] ? '✓ コピー済み' : 'コピー'}
        </button>
      </div>
      
      <div class="space-y-4">
        <div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">2ヶ月分を横並びで表示</span>
            </label>
            <div bind:this={multiMonthContainer} class="multi-month-calendar">
              <input 
                type="text" 
                class="input input-bordered pika-single"
                bind:this={multiMonthInput}
                value={multiMonthDate}
                placeholder="日付を選択"
                readonly
              />
            </div>
          </div>
          
          <div class="alert alert-warning mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span class="text-xs">
              複数月表示は画面幅に注意が必要です。
              モバイルでは1ヶ月表示に切り替えることを推奨します。
            </span>
          </div>
        </div>
        
        <!-- コード表示切り替え -->
        <div class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div class="collapse-title font-medium">
            コードを表示
          </div>
          <div class="collapse-content">
            <HighlightSvelte code={multiMonthCode} />
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
          <h4 class="font-bold mb-2">Pikadayの基本設定</h4>
          <ul class="text-sm space-y-1">
            <li>• container: 親要素を指定して位置ずれを防止</li>
            <li>• i18n: 日本語化オブジェクトで翻訳</li>
            <li>• onSelect: 選択時のコールバック</li>
            <li>• disableDayFn: 条件付き無効化</li>
            <li>• onDraw: カレンダー描画時の処理</li>
          </ul>
        </div>
        
        <div>
          <h4 class="font-bold mb-2">スタイリングのテクニック</h4>
          <ul class="text-sm space-y-1">
            <li>• :global()でPikadayのボタンクラスをスタイリング</li>
            <li>• button.is-holidayクラスで祝日をマーク</li>
            <li>• is-sunday/is-saturdayで土日を色分け</li>
            <li>• !importantで優先度を確保</li>
            <li>• .pika-lendarでカレンダー本体を操作</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* このコンポーネント内のカレンダーにのみ適用 */
  :global(.holiday-calendar .pika-single button.is-holiday) {
    background-color: #ffe4e1;
    color: #d00;
    font-weight: bold;
  }
  
  /* 土日のスタイル（このコンポーネント内のみ） */
  :global(.holiday-calendar .pika-single button.is-sunday) {
    color: #dc2626;
  }
  
  :global(.holiday-calendar .pika-single button.is-saturday) {
    color: #2563eb;
  }
  
  /* 複数月を横並びに表示（このコンポーネント内のみ） */
  :global(.multi-month-calendar .pika-single) {
    width: auto !important;
  }
  
  :global(.multi-month-calendar .pika-lendar) {
    float: left;
    margin-right: 1em;
  }
  
  :global(.multi-month-calendar .pika-lendar:last-child) {
    margin-right: 0;
  }
</style>