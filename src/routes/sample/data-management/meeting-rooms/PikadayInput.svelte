<!--
  Pikadayを使用した日付入力コンポーネント
  QuickBooking.svelteのカレンダー表示問題を解決するための専用コンポーネント
-->

<script>
  import { onMount } from 'svelte';
  
  // Props
  let { 
    value = $bindable(new Date().toISOString().split('T')[0]),
    minDate = new Date(),
    maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    placeholder = 'クリックして日付を選択',
    class: className = ''
  } = $props();
  
  // DOM要素の参照
  let inputElement;
  let pikadayInstance = null;
  
  // Pikadayの初期化
  onMount(async () => {
    // Pikadayを動的インポート
    const Pikaday = (await import('pikaday')).default;
    
    // インスタンスを作成
    pikadayInstance = new Pikaday({
      field: inputElement,
      format: 'YYYY-MM-DD',
      defaultDate: value ? new Date(value) : new Date(),
      setDefaultDate: !!value,
      i18n: {
        previousMonth: '前月',
        nextMonth: '翌月',
        months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        weekdays: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
        weekdaysShort: ['日', '月', '火', '水', '木', '金', '土']
      },
      firstDay: 0,
      minDate: minDate,
      maxDate: maxDate,
      onSelect: function() {
        // 選択された日付を親コンポーネントに反映
        value = this.toString('YYYY-MM-DD');
      }
    });
    
    // クリーンアップ関数
    return () => {
      if (pikadayInstance) {
        pikadayInstance.destroy();
        pikadayInstance = null;
      }
    };
  });
  
  // valueが外部から変更された場合の処理
  $effect(() => {
    if (pikadayInstance && value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        pikadayInstance.setDate(date);
      }
    }
  });
</script>

<input 
  type="text" 
  bind:this={inputElement}
  {value}
  {placeholder}
  class="input input-bordered pika-single {className}"
  readonly
>

<style>
  /* Pikadayの基本位置調整 */
  :global(.pika-single) {
    position: absolute !important;
    margin-top: 0.25rem;
    z-index: 9999 !important;
  }
  
  /* DaisyUIテーマとの統合 */
  :global(.pika-single.is-bound) {
    background: oklch(var(--b1));
    border: 1px solid oklch(var(--b3));
    border-radius: var(--rounded-box, 1rem);
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  }
  
  :global(.pika-title) {
    text-align: center;
    position: relative;
  }
  
  :global(.pika-label) {
    display: inline-block;
    position: relative;
    z-index: 9999;
    overflow: hidden;
    margin: 0;
    padding: 5px 3px;
    font-size: 14px;
    line-height: 20px;
    font-weight: bold;
    color: oklch(var(--bc));
    background-color: oklch(var(--b1));
  }
  
  :global(.pika-table) {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
    border: 0;
  }
  
  :global(.pika-table th) {
    color: oklch(var(--bc) / 0.5);
    font-weight: normal;
    text-align: center;
  }
  
  :global(.pika-button) {
    cursor: pointer;
    display: block;
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    outline: none;
    border: 0;
    margin: 0;
    width: 100%;
    padding: 5px;
    background: transparent;
    color: oklch(var(--bc));
    font-size: 12px;
    line-height: 15px;
    text-align: right;
    border-radius: 0.375rem;
  }
  
  :global(.pika-button:hover) {
    background: oklch(var(--b2));
    color: oklch(var(--bc));
    box-shadow: none;
  }
  
  :global(.is-today .pika-button) {
    color: oklch(var(--p));
    font-weight: bold;
    background: transparent;
  }
  
  :global(.is-selected .pika-button) {
    background: oklch(var(--p));
    color: oklch(var(--pc));
    font-weight: bold;
    box-shadow: none;
  }
  
  :global(.is-disabled .pika-button) {
    pointer-events: none;
    cursor: default;
    color: oklch(var(--bc) / 0.3);
    opacity: 0.3;
  }
  
  /* ナビゲーションボタン */
  :global(.pika-prev),
  :global(.pika-next) {
    display: block;
    cursor: pointer;
    position: relative;
    outline: none;
    border: 0;
    padding: 0;
    width: 20px;
    height: 30px;
    background-color: transparent;
    opacity: 0.5;
    color: oklch(var(--bc));
  }
  
  :global(.pika-prev:hover),
  :global(.pika-next:hover) {
    opacity: 1;
  }
  
  :global(.pika-prev) {
    float: left;
  }
  
  :global(.pika-next) {
    float: right;
  }
  
  :global(.pika-prev:after),
  :global(.pika-next:after) {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 0;
    height: 0;
    border: 5px solid transparent;
    margin: auto;
  }
  
  :global(.pika-prev:after) {
    border-right-color: oklch(var(--bc));
  }
  
  :global(.pika-next:after) {
    border-left-color: oklch(var(--bc));
  }
  
  /* レスポンシブ対応 */
  @media (max-width: 640px) {
    :global(.pika-single) {
      display: block;
      position: relative !important;
      top: auto !important;
      left: auto !important;
      margin: 8px auto;
    }
  }
</style>