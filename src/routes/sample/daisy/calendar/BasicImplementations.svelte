<script>
	import { onMount } from 'svelte';
	import { HighlightSvelte } from 'svelte-highlight';
	import 'svelte-highlight/styles/dark.css';

	export let copyToClipboard;
	export let copySuccess;

	let pikadayInput1;
	let pikadayInput2;
	let pikadayValue = '';
	let callyBtnDemo;

	function handleCallyChangeDemo(event) {
		if (callyBtnDemo && event.target.value) {
			callyBtnDemo.innerText = event.target.value;
		}
	}

	// コードサンプル
	const pikadayBasicCode = `<script>
  import { onMount } from 'svelte';
  
  let dateInput;
  let selectedDate = '';
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    const picker = new Pikaday({
      field: dateInput,
      format: 'YYYY-MM-DD',
      onSelect: function() {
        selectedDate = this.toString('YYYY-MM-DD');
      }
    });
    
    return () => picker.destroy();
  });
<\/script>

<div class="form-control">
  <label class="label">
    <span class="label-text">日付を選択</span>
  </label>
  <input 
    type="text" 
    class="input pika-single"
    placeholder="クリックして日付を選択"
    bind:this={dateInput}
  />
  {#if selectedDate}
    <label class="label">
      <span class="label-text-alt">選択された日付: {selectedDate}</span>
    </label>
  {/if}
</div>

<style>
  /* Pikadayの最小限の構造スタイル（位置調整のみ） */
  :global(.pika-single) {
    position: absolute;
    margin-top: 0.25rem;
  }
  
  /* DaisyUIテーマと調和するPikadayカスタマイズ */
  :global(.pika-single.is-bound) {
    background: oklch(var(--b1));
    border: 1px solid oklch(var(--b3));
    border-radius: var(--rounded-box, 1rem);
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  }
  
  :global(.pika-table th) {
    color: oklch(var(--bc) / 0.5);
    font-weight: normal;
  }
  
  :global(.pika-button) {
    background: transparent;
    color: oklch(var(--bc));
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
    color: oklch(var(--bc) / 0.3);
    background: transparent;
  }
  
  :global(.pika-prev),
  :global(.pika-next) {
    opacity: 1;
    color: oklch(var(--bc));
  }
  
  :global(.pika-prev:hover),
  :global(.pika-next:hover) {
    opacity: 0.7;
  }
</style>`;

	const pikadayJapaneseCode = `<script>
  import { onMount } from 'svelte';
  
  let dateInput;
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    const picker = new Pikaday({
      field: dateInput,
      format: 'YYYY年MM月DD日',
      i18n: {
        previousMonth: '前月',
        nextMonth: '翌月',
        months: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
        weekdays: ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],
        weekdaysShort: ['日','月','火','水','木','金','土']
      },
      firstDay: 0
    });
    
    return () => picker.destroy();
  });
<\/script>

<input 
  type="text" 
  class="input input-primary pika-single"
  placeholder="日付を選択してください"
  bind:this={dateInput}
/>`;

	const callyBasicCode = `<!-- app.htmlのheadタグ内に追加 -->
<script type="module" src="https://unpkg.com/cally"><\/script>

<!-- Svelteコンポーネント内 -->
<div class="form-control">
  <label class="label">
    <span class="label-text">Callyカレンダー</span>
  </label>
  <calendar-date class="cally bg-base-100 border border-base-300 shadow-lg rounded-box p-4">
    <svg slot="previous" class="fill-current size-4" viewBox="0 0 24 24">
      <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
    </svg>
    <svg slot="next" class="fill-current size-4" viewBox="0 0 24 24">
      <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
    </svg>
    <calendar-month></calendar-month>
  </calendar-date>
</div>`;

	const callyPopoverCode = `<script>
  let callyBtn;
  
  function handleCallyChange(event) {
    if (callyBtn) {
      callyBtn.innerText = event.target.value;
    }
  }
<\/script>

<button 
  popovertarget="cally-popover" 
  class="btn btn-outline btn-primary"
  bind:this={callyBtn}
  style="anchor-name:--cally-anchor"
>
  日付を選択
</button>

<div 
  popover 
  id="cally-popover" 
  class="dropdown bg-base-100 rounded-box shadow-xl"
  style="position-anchor:--cally-anchor"
>
  <calendar-date 
    class="cally p-4"
    on:change={handleCallyChange}
  >
    <svg slot="previous" class="fill-current size-4" viewBox="0 0 24 24">
      <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
    </svg>
    <svg slot="next" class="fill-current size-4" viewBox="0 0 24 24">
      <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
    </svg>
    <calendar-month></calendar-month>
  </calendar-date>
</div>`;

	const momentFormatCode = `// formatオプションについて
const picker = new Pikaday({
  field: dateInput,
  format: 'YYYY-MM-DD', // 表示形式の指定（moment.jsが必要）
});

// 重要：moment.jsは2020年9月にメンテナンスモードとなり、
// 新規プロジェクトでの使用は推奨されていません。

// 現在推奨される日付フォーマット方法
const picker = new Pikaday({
  field: dateInput,
  // formatオプションはmoment.js専用のため、
  // 以下のようにtoString()を使用するのが一般的
  onSelect: function() {
    // toString()でフォーマット指定
    const dateStr = this.toString('YYYY-MM-DD');
    console.log(dateStr); // "2024-01-15"
    
    // getDate()でDateオブジェクトを取得して操作
    const date = this.getDate();
    const formatted = \`\${date.getFullYear()}-\${String(date.getMonth() + 1).padStart(2, '0')}-\${String(date.getDate()).padStart(2, '0')}\`;
  },
  
  // カスタムフォーマット関数
  toString(date, format) {
    // YYYY-MM-DD形式で返す
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return \`\${year}-\${month}-\${day}\`;
  }
});

// その他の日付操作メソッド
picker.setDate(new Date());     // 今日の日付を設定
picker.getDate();               // Dateオブジェクトを取得
picker.toString('YYYY/MM/DD');  // 任意のフォーマットで文字列化
picker.clear();                 // 選択をクリア`;

	const setupCode = `# 1. Pikadayをインストール
npm install pikaday

# 2. Callyを使用する場合はapp.htmlのheadに追加
<script type="module" src="https://unpkg.com/cally"><\/script>

# 注意事項：
# - moment.jsは2020年9月にメンテナンスモードとなりました
# - formatオプションはmoment.js専用のため、toString()の使用を推奨
# - DaisyUI v5はPikadayとCallyのスタイルを公式サポート`;

	onMount(async () => {
		const Pikaday = (await import('pikaday')).default;

		if (pikadayInput1) {
			const picker1 = new Pikaday({
				field: pikadayInput1,
				container: pikadayInput1.parentElement,
				onSelect: function () {
					// toString()でYYYY-MM-DD形式を取得
					pikadayValue = this.toString('YYYY-MM-DD');
				}
			});

			const picker2 = new Pikaday({
				field: pikadayInput2,
				format: 'YYYY年MM月DD日',
				container: pikadayInput2.parentElement,
				i18n: {
					previousMonth: '前月',
					nextMonth: '翌月',
					months: [
						'1月',
						'2月',
						'3月',
						'4月',
						'5月',
						'6月',
						'7月',
						'8月',
						'9月',
						'10月',
						'11月',
						'12月'
					],
					weekdays: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
					weekdaysShort: ['日', '月', '火', '水', '木', '金', '土']
				},
				firstDay: 0
			});

			return () => {
				picker1.destroy();
				picker2.destroy();
			};
		}
	});
</script>

<div class="space-y-8" id="basic">
	<!-- セクションヘッダー -->
	<div class="text-center">
		<h2 class="mb-4 text-3xl font-bold">📅 基本的な実装例</h2>
		<p class="text-base-content/70">
			DaisyUI v5でサポートされている3つのカレンダーライブラリの基本的な使い方
		</p>
	</div>

	<!-- セットアップ方法 -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="card-title">セットアップ方法</h3>
				<button class="btn btn-sm btn-ghost" on:click={() => copyToClipboard(setupCode, 'setup')}>
					{#if copySuccess['setup']}
						<span class="text-success">✓ コピー完了</span>
					{:else}
						📋 コピー
					{/if}
				</button>
			</div>
			<div class="alert alert-success mb-4">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="h-6 w-6 shrink-0 stroke-current"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					></path></svg
				>
				<div>
					<p class="font-bold">DaisyUI v5の公式サポート</p>
					<p class="text-sm">
						DaisyUIがPikadayとCallyのスタイルを公式にサポートしているため、追加のCSS読み込みは不要です。
					</p>
				</div>
			</div>

			<!-- コード表示切り替え -->
			<div class="collapse-arrow bg-base-200 collapse">
				<input type="checkbox" />
				<div class="collapse-title font-medium">コードを表示</div>
				<div class="collapse-content">
					<div class="mockup-code">
						<pre><code>{setupCode}</code></pre>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- moment.js と format オプション -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h3 class="card-title">formatオプションとtoString()メソッド</h3>
					<p class="text-base-content/70 mt-1 text-sm">日付フォーマットの推奨される実装方法</p>
				</div>
				<button
					class="btn btn-sm btn-ghost"
					on:click={() => copyToClipboard(momentFormatCode, 'moment-format')}
				>
					{#if copySuccess['moment-format']}
						<span class="text-success">✓ コピー完了</span>
					{:else}
						📋 コピー
					{/if}
				</button>
			</div>

			<div class="alert alert-warning mb-4">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/></svg
				>
				<div>
					<p class="font-bold">formatオプションとmoment.jsについて</p>
					<p class="text-sm">
						formatオプションはmoment.js専用です。moment.jsは2020年9月にメンテナンスモードとなり、新規使用は非推奨です。
					</p>
					<p class="mt-1 text-sm">
						現在は<code class="text-primary">toString('YYYY-MM-DD')</code
						>メソッドの使用が推奨されています。
					</p>
				</div>
			</div>

			<!-- コード表示切り替え -->
			<div class="collapse-arrow bg-base-200 collapse">
				<input type="checkbox" />
				<div class="collapse-title font-medium">コードを表示</div>
				<div class="collapse-content">
					<HighlightSvelte code={momentFormatCode} />
				</div>
			</div>
		</div>
	</div>

	<!-- Pikaday 基本実装 -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h3 class="card-title">Pikaday - 基本実装</h3>
					<p class="text-base-content/70 mt-1 text-sm">軽量で高速なデートピッカーライブラリ</p>
				</div>
				<button
					class="btn btn-sm btn-ghost"
					on:click={() => copyToClipboard(pikadayBasicCode, 'pikaday-basic')}
				>
					{#if copySuccess['pikaday-basic']}
						<span class="text-success">✓ コピー完了</span>
					{:else}
						📋 コピー
					{/if}
				</button>
			</div>

			<!-- デモ -->
			<div class="bg-base-200 mb-4 rounded-lg p-6">
				<div class="form-control relative max-w-xs">
					<label class="label">
						<span class="label-text">日付を選択</span>
					</label>
					<input
						type="text"
						class="input pika-single"
						placeholder="クリックして日付を選択"
						bind:this={pikadayInput1}
					/>
					{#if pikadayValue}
						<label class="label">
							<span class="label-text-alt text-primary">選択された日付: {pikadayValue}</span>
						</label>
					{/if}
				</div>
			</div>

			<!-- コード表示切り替え -->
			<div class="collapse-arrow bg-base-200 collapse">
				<input type="checkbox" />
				<div class="collapse-title font-medium">コードを表示</div>
				<div class="collapse-content">
					<HighlightSvelte code={pikadayBasicCode} />
				</div>
			</div>
		</div>
	</div>

	<!-- Pikaday 日本語化 -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h3 class="card-title">Pikaday - 日本語化</h3>
					<p class="text-base-content/70 mt-1 text-sm">日本語表示と日本のフォーマットに対応</p>
				</div>
				<button
					class="btn btn-sm btn-ghost"
					on:click={() => copyToClipboard(pikadayJapaneseCode, 'pikaday-ja')}
				>
					{#if copySuccess['pikaday-ja']}
						<span class="text-success">✓ コピー完了</span>
					{:else}
						📋 コピー
					{/if}
				</button>
			</div>

			<!-- デモ -->
			<div class="bg-base-200 mb-4 rounded-lg p-6">
				<div class="form-control relative max-w-xs">
					<label class="label">
						<span class="label-text">日本語カレンダー</span>
					</label>
					<input
						type="text"
						class="input input-primary pika-single"
						placeholder="日付を選択してください"
						bind:this={pikadayInput2}
					/>
				</div>
			</div>

			<!-- コード表示切り替え -->
			<div class="collapse-arrow bg-base-200 collapse">
				<input type="checkbox" />
				<div class="collapse-title font-medium">コードを表示</div>
				<div class="collapse-content">
					<HighlightSvelte code={pikadayJapaneseCode} language="svelte" />
				</div>
			</div>
		</div>
	</div>

	<!-- Cally 基本実装 -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h3 class="card-title">Cally - Web Component</h3>
					<p class="text-base-content/70 mt-1 text-sm">
						フレームワークに依存しないWeb Componentベースのカレンダー
					</p>
				</div>
				<button
					class="btn btn-sm btn-ghost"
					on:click={() => copyToClipboard(callyBasicCode, 'cally-basic')}
				>
					{#if copySuccess['cally-basic']}
						<span class="text-success">✓ コピー完了</span>
					{:else}
						📋 コピー
					{/if}
				</button>
			</div>

			<!-- デモ -->
			<div class="bg-base-200 mb-4 rounded-lg p-6">
				<div class="alert alert-warning mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/></svg
					>
					<div>
						<p class="font-bold">デモを表示するには</p>
						<p class="text-sm">app.htmlに以下を追加してください：</p>
						<p class="mt-1 font-mono text-sm">
							&lt;script type="module" src="https://unpkg.com/cally"&gt;&lt;/script&gt;
						</p>
					</div>
				</div>

				<calendar-date class="cally bg-base-100 border-base-300 rounded-box border p-4 shadow-lg">
					<svg slot="previous" class="size-4 fill-current" viewBox="0 0 24 24">
						<path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
					</svg>
					<svg slot="next" class="size-4 fill-current" viewBox="0 0 24 24">
						<path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
					</svg>
					<calendar-month></calendar-month>
				</calendar-date>
			</div>

			<!-- コード表示切り替え -->
			<div class="collapse-arrow bg-base-200 collapse">
				<input type="checkbox" />
				<div class="collapse-title font-medium">コードを表示</div>
				<div class="collapse-content">
					<HighlightSvelte code={callyBasicCode} />
				</div>
			</div>
		</div>
	</div>

	<!-- Cally Popover -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h3 class="card-title">Cally - Popover実装</h3>
					<p class="text-base-content/70 mt-1 text-sm">
						ボタンクリックでポップオーバー表示するカレンダー
					</p>
				</div>
				<button
					class="btn btn-sm btn-ghost"
					on:click={() => copyToClipboard(callyPopoverCode, 'cally-popover')}
				>
					{#if copySuccess['cally-popover']}
						<span class="text-success">✓ コピー完了</span>
					{:else}
						📋 コピー
					{/if}
				</button>
			</div>

			<!-- コード表示切り替え -->
			<div class="collapse-arrow bg-base-200 collapse">
				<input type="checkbox" />
				<div class="collapse-title font-medium">コードを表示</div>
				<div class="collapse-content">
					<HighlightSvelte code={callyPopoverCode} />
				</div>
			</div>

			<div class="alert alert-warning mt-4">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/></svg
				>
				<span
					>Popover APIは比較的新しい機能です。古いブラウザでは代替実装が必要な場合があります。</span
				>
			</div>
		</div>
	</div>
</div>
