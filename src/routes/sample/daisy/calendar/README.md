# Svelte + DaisyUI カレンダーコンポーネント実装ガイド

このガイドは、SvelteKitプロジェクトでDaisyUI v5のカレンダー機能を実装する際の完全なリファレンスです。

## 📋 前提条件

- **SvelteKit**: 最新バージョン
- **DaisyUI**: v5.0.37以降
- **Tailwind CSS**: v4以降
- **Svelte**: v5.16以降（Runes構文対応）

### **File Structure**

```
/calendar/
├── +page.svelte              # Main layout with navigation
├── BasicImplementations.svelte       # Basic calendar implementations
├── DateRangeImplementations.svelte       # Date range implementations
├── PositionAdjustment.svelte    # Position adjustment examples
├── FormIntegrations.svelte       # Form integrations
├── CustomizationExamples.svelte    # Customization examples
├── MultipleSelectionExamples.svelte       # Multiple selection examples
├── PracticaluseCase.svelte       # Practical use case examples
├── README.md                  # This file
```

## 🚨 重要な注意事項

### 1. SSR（サーバーサイドレンダリング）対応

Pikadayはブラウザのみで動作するライブラリのため、SSR環境では特別な対処が必要です。

```javascript
// ❌ 間違い - SSRでエラーになる
import Pikaday from 'pikaday';

// ✅ 正解 - onMount内で動的インポート
import { onMount } from 'svelte';

onMount(async () => {
	const Pikaday = (await import('pikaday')).default;
	// Pikadayの初期化
});
```

### 2. CSSの読み込みについて

**DaisyUI v5はPikadayとCallyのスタイルを公式にサポートしています。追加のCSSファイルの読み込みは不要です。**

```javascript
// ❌ 不要 - Pikaday.cssは読み込まない
@import 'pikaday/css/pikaday.css';

// ✅ DaisyUIが自動的にスタイリングを提供
```

### 3. Tailwind CSS v4での@apply制限

Tailwind CSS v4では、`@apply`はTailwind標準のユーティリティクラスのみで使用可能です。

```css
/* ❌ エラー - DaisyUIのカスタムクラスは@applyで使えない */
.my-class {
	@apply bg-base-100 text-base-content;
}

/* ✅ 正解 - CSS変数を直接使用 */
.my-class {
	background-color: oklch(var(--b1));
	color: oklch(var(--bc));
}
```

### 4. scriptタグのエスケープ

Svelteコンポーネント内の文字列でscriptタグを使用する場合は、必ずエスケープが必要です。

```javascript
// ❌ エラー - 終了タグと誤認識される
const code = `<script>...</script>`;

// ✅ 正解 - エスケープする
const code = `<script>...</\script>`;
```

### 5. Svelte 5のイベントハンドリング構文

Svelte 5では、イベントハンドラーの記述方法が大きく変更されました。

```svelte
<!-- ❌ 古い構文（Svelte 4） -->
<button on:click={handleClick}>クリック</button>
<input on:change={handleChange} />

<!-- ✅ 新しい構文（Svelte 5） -->
<button onclick={handleClick}>クリック</button>
<input onchange={handleChange} />
```

### 6. Props構文の変更

Svelte 5では、コンポーネントのprops受け取り方法が変更されました。

```svelte
<!-- ❌ 古い構文（Svelte 4） -->
<script>
  export let propName;
  export let anotherProp = 'default';
</script>

<!-- ✅ 新しい構文（Svelte 5） -->
<script>
  let { propName, anotherProp = 'default' } = $props();
</script>
```

## 🗓️ サポートされているカレンダーライブラリ

DaisyUI v5は以下の3つのカレンダーライブラリを公式サポート：

1. **Pikaday** - 軽量なJavaScriptデートピッカー
2. **Cally** - Web Componentベースのカレンダー
3. **React Day Picker** - React専用（SvelteKitでは使用不可）

## 📦 セットアップ

### Pikadayのセットアップ

```bash
npm install pikaday
```

**注意**: Pikadayの`format`オプションはmoment.js専用です。moment.jsは2020年9月にメンテナンスモードとなり、新規プロジェクトでの使用は非推奨となっています。

### Callyのセットアップ

app.htmlの`<head>`タグ内に追加：

```html
<script type="module" src="https://unpkg.com/cally"></script>
```

または npm でインストール：

```bash
npm install cally
```

## 💻 実装例

### Pikaday基本実装（Svelte 5対応）

```svelte
<script>
	import { onMount } from 'svelte';

	let dateInput;
	let selectedDate = $state('');

	onMount(async () => {
		const Pikaday = (await import('pikaday')).default;

		const picker = new Pikaday({
			field: dateInput,
			container: dateInput.parentElement, // 位置ずれ防止
			onSelect: function () {
				// toString()メソッドでYYYY-MM-DD形式を取得（推奨）
				selectedDate = this.toString('YYYY-MM-DD');
			}
		});

		return () => picker.destroy();
	});
</script>

<div class="form-control">
	<label class="label">
		<span class="label-text">日付を選択</span>
	</label>
	<input
		type="text"
		class="input pika-single"
		placeholder="クリックして日付を選択"
		bind:this={dateInput}
		readonly
	/>
</div>
```

### 日付範囲選択の実装（相互連動）

```svelte
<script>
	import { onMount } from 'svelte';

	let startDate = $state('');
	let endDate = $state('');
	let startPicker, endPicker;
	let startInput, endInput;

	onMount(async () => {
		const Pikaday = (await import('pikaday')).default;

		startPicker = new Pikaday({
			field: startInput,
			container: startInput.parentElement,
			onSelect: function () {
				startDate = this.toString('YYYY-MM-DD');
				// 終了日の最小日付を設定
				if (endPicker) {
					endPicker.setMinDate(this.getDate());
				}
			}
		});

		endPicker = new Pikaday({
			field: endInput,
			container: endInput.parentElement,
			onSelect: function () {
				endDate = this.toString('YYYY-MM-DD');
			}
		});

		return () => {
			startPicker?.destroy();
			endPicker?.destroy();
		};
	});
</script>

<div class="flex gap-4">
	<div class="form-control">
		<label class="label">
			<span class="label-text">開始日</span>
		</label>
		<input type="text" class="input pika-single" bind:this={startInput} readonly />
	</div>

	<div class="form-control">
		<label class="label">
			<span class="label-text">終了日</span>
		</label>
		<input type="text" class="input pika-single" bind:this={endInput} readonly />
	</div>
</div>
```

### 日付フォーマットの実装方法

```javascript
// 推奨：toString()メソッドを使用
const picker = new Pikaday({
	field: input,
	onSelect: function () {
		const dateStr = this.toString('YYYY-MM-DD'); // "2024-01-15"
	}
});

// その他の利用可能なメソッド
picker.getDate(); // Dateオブジェクトを取得
picker.toString('YYYY/MM/DD'); // 任意のフォーマットで文字列化
picker.setDate(new Date()); // 日付を設定
picker.clear(); // 選択をクリア

// カスタムフォーマット関数
const picker = new Pikaday({
	field: input,
	toString(date, format) {
		// YYYY-MM-DD形式で返す
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}
});

// 注意：formatオプションについて
// formatオプションはmoment.js専用のため、moment.jsなしでは機能しません
// format: 'YYYY-MM-DD' // これはmoment.jsが必要
```

### Cally Popover実装（Svelte 5対応版）

```svelte
<script>
	let callyBtn;

	function handleCallyChange(event) {
		if (callyBtn && event.target.value) {
			callyBtn.innerText = event.target.value;
		}
	}
</script>

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
	<calendar-date class="cally p-4" onchange={handleCallyChange}>
		<svg slot="previous" class="size-4 fill-current" viewBox="0 0 24 24">
			<path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
		</svg>
		<svg slot="next" class="size-4 fill-current" viewBox="0 0 24 24">
			<path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
		</svg>
		<calendar-month></calendar-month>
	</calendar-date>
</div>
```

## 🎯 高度な実装パターン

### 週末・祝日のハイライト表示

**重要な発見**: Pikadayの日付セルは`td`要素ではなく`button`要素として生成されます。これを踏まえた実装が必要です。

```javascript
// Pikadayの構造を理解する
// カレンダーの各日付は以下の様な構造になっている
// <button class="pika-button pika-day" data-pika-year="2025" data-pika-month="0" data-pika-day="1">1</button>

const picker = new Pikaday({
	field: input,
	onDraw: function () {
		// button要素を正しく取得
		const buttons = container.querySelectorAll('.pika-single button.pika-button');

		buttons.forEach((btn) => {
			const year = Number(btn.getAttribute('data-pika-year'));
			const month = Number(btn.getAttribute('data-pika-month'));
			const day = Number(btn.getAttribute('data-pika-day'));

			if (year && !isNaN(month) && day) {
				const date = new Date(year, month, day);

				// 祝日判定
				if (isHoliday(date)) {
					btn.classList.add('is-holiday');
				}

				// 週末判定
				const dayOfWeek = date.getDay();
				if (dayOfWeek === 0) {
					btn.classList.add('is-sunday');
				} else if (dayOfWeek === 6) {
					btn.classList.add('is-saturday');
				}
			}
		});
	}
});
```

スタイリングも`button`要素に対して行います：

```css
/* スコープ付きスタイル - :global()を使用 */
:global(.holiday-calendar .pika-single button.is-holiday) {
	background-color: #ffe4e1;
	color: #d00;
	font-weight: bold;
}

:global(.holiday-calendar .pika-single button.is-sunday) {
	color: #dc2626;
}

:global(.holiday-calendar .pika-single button.is-saturday) {
	color: #2563eb;
}
```

### 日本語化（ローカライゼーション）

```javascript
const pikadayI18n = {
	previousMonth: '前月',
	nextMonth: '翌月',
	months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
	weekdays: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
	weekdaysShort: ['日', '月', '火', '水', '木', '金', '土']
};

const picker = new Pikaday({
	field: dateInput,
	i18n: pikadayI18n,
	firstDay: 0 // 日曜始まり
});
```

### 表示位置の調整

Pikadayは`position`オプションで柔軟な表示位置制御が可能です：

```javascript
const picker = new Pikaday({
	field: dateInput,

	// 基本の4方向
	position: 'bottom left', // 入力欄の左下（デフォルト）
	position: 'bottom right', // 入力欄の右下
	position: 'top left', // 入力欄の左上
	position: 'top right', // 入力欄の右上

	// 自動調整オプション
	reposition: true, // 画面端で自動的に位置を調整（デフォルト: true）
	reposition: false // 常に指定した位置に固定
});
```

**重要なポイント：**

- `reposition: true`（デフォルト）の場合、画面端では自動的に表示位置が調整される
- `container`オプションと組み合わせる場合、親要素に`position: relative`が必要
- スクロール可能な要素内で使用する場合は、`container`オプションの使用を推奨

### DaisyUIのクラス使用

```html
<!-- inputにpika-singleクラスを追加 -->
<input class="input pika-single" />

<!-- Callyにはcallyクラスを追加 -->
<calendar-date class="cally"></calendar-date>
```

## 📝 フォーム統合の実装パターン

### 1. 基本的なフォーム送信との統合

```svelte
<script>
	import { onMount } from 'svelte';

	let formData = $state({ name: '', date: '', comments: '' });
	let dateInput;

	onMount(async () => {
		const Pikaday = (await import('pikaday')).default;

		const picker = new Pikaday({
			field: dateInput,
			container: dateInput.parentElement,
			onSelect: function () {
				formData.date = this.toString('YYYY-MM-DD');
			}
		});

		return () => picker.destroy();
	});

	function handleSubmit(e) {
		e.preventDefault();
		// フォーム送信処理
		console.log('送信データ:', formData);
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<div class="form-control">
		<label class="label">
			<span class="label-text">お名前</span>
		</label>
		<input type="text" class="input input-bordered" bind:value={formData.name} required />
	</div>

	<div class="form-control">
		<label class="label">
			<span class="label-text">日付を選択</span>
		</label>
		<input
			type="text"
			class="input input-bordered pika-single"
			bind:this={dateInput}
			value={formData.date}
			placeholder="クリックして日付を選択"
			required
			readonly
		/>
	</div>

	<button type="submit" class="btn btn-primary">送信</button>
</form>
```

### 2. バリデーション付きフォーム

```svelte
<script>
	let validationForm = $state({
		eventDate: '',
		eventTitle: '',
		errors: {}
	});

	onMount(async () => {
		const Pikaday = (await import('pikaday')).default;

		const picker = new Pikaday({
			field: dateInput,
			container: dateInput.parentElement,
			minDate: new Date(), // 今日以降のみ選択可能
			onSelect: function () {
				validationForm.eventDate = this.toString('YYYY-MM-DD');
				validateEventDate();
			}
		});

		return () => picker.destroy();
	});

	function validateEventDate() {
		const selectedDate = new Date(validationForm.eventDate);
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (selectedDate < today) {
			validationForm.errors.eventDate = '過去の日付は選択できません';
		} else {
			delete validationForm.errors.eventDate;
		}
	}

	function validateForm() {
		validationForm.errors = {};

		if (!validationForm.eventTitle.trim()) {
			validationForm.errors.eventTitle = 'イベント名は必須です';
		}

		if (!validationForm.eventDate) {
			validationForm.errors.eventDate = '日付を選択してください';
		} else {
			validateEventDate();
		}

		return Object.keys(validationForm.errors).length === 0;
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<div class="form-control">
		<label class="label">
			<span class="label-text">イベント名</span>
			<span class="label-text-alt text-error">必須</span>
		</label>
		<input
			type="text"
			class="input input-bordered {validationForm.errors.eventTitle ? 'input-error' : ''}"
			bind:value={validationForm.eventTitle}
			onblur={validateForm}
		/>
		{#if validationForm.errors.eventTitle}
			<label class="label">
				<span class="label-text-alt text-error">{validationForm.errors.eventTitle}</span>
			</label>
		{/if}
	</div>

	<div class="form-control">
		<label class="label">
			<span class="label-text">イベント日</span>
			<span class="label-text-alt text-error">必須</span>
		</label>
		<input
			type="text"
			class="input input-bordered pika-single {validationForm.errors.eventDate
				? 'input-error'
				: ''}"
			bind:this={dateInput}
			value={validationForm.eventDate}
			placeholder="今日以降の日付を選択"
			readonly
		/>
		{#if validationForm.errors.eventDate}
			<label class="label">
				<span class="label-text-alt text-error">{validationForm.errors.eventDate}</span>
			</label>
		{/if}
	</div>

	<button type="submit" class="btn btn-primary">登録</button>
</form>
```

### 3. 日付範囲の動的バリデーション

```svelte
<script>
	let rangeForm = $state({
		startDate: '',
		endDate: '',
		errors: {}
	});
	let startDateInput, endDateInput;
	let startPicker, endPicker;

	onMount(async () => {
		const Pikaday = (await import('pikaday')).default;

		startPicker = new Pikaday({
			field: startDateInput,
			container: startDateInput.parentElement,
			minDate: new Date(),
			onSelect: function () {
				rangeForm.startDate = this.toString('YYYY-MM-DD');

				// 終了日ピッカーの最小日付を更新
				if (endPicker) {
					const nextDay = new Date(this.getDate());
					nextDay.setDate(nextDay.getDate() + 1);
					endPicker.setMinDate(nextDay);

					// 終了日が開始日より前の場合、クリア
					if (rangeForm.endDate && new Date(rangeForm.endDate) <= this.getDate()) {
						rangeForm.endDate = '';
						endPicker.setDate(null);
					}
				}
				validateDates();
			}
		});

		endPicker = new Pikaday({
			field: endDateInput,
			container: endDateInput.parentElement,
			minDate: new Date(),
			onSelect: function () {
				rangeForm.endDate = this.toString('YYYY-MM-DD');
				validateDates();
			}
		});

		return () => {
			startPicker?.destroy();
			endPicker?.destroy();
		};
	});

	function validateDates() {
		rangeForm.errors = {};

		if (rangeForm.startDate && rangeForm.endDate) {
			const start = new Date(rangeForm.startDate);
			const end = new Date(rangeForm.endDate);
			const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

			if (diffDays > 30) {
				rangeForm.errors.dateRange = '期間は30日以内で設定してください';
			} else if (diffDays < 0) {
				rangeForm.errors.dateRange = '終了日は開始日より後を選択してください';
			}
		}
	}
</script>
```

### 4. フォームリセット機能

```svelte
<script>
	let resetForm = $state({
		appointmentDate: '',
		appointmentTime: '10:00',
		reason: ''
	});
	let dateInput;
	let resetPicker;

	onMount(async () => {
		const Pikaday = (await import('pikaday')).default;

		resetPicker = new Pikaday({
			field: dateInput,
			container: dateInput.parentElement,
			onSelect: function () {
				resetForm.appointmentDate = this.toString('YYYY-MM-DD');
			}
		});

		return () => resetPicker.destroy();
	});

	function handleReset() {
		// フォームデータをリセット
		resetForm = {
			appointmentDate: '',
			appointmentTime: '10:00',
			reason: ''
		};

		// Pikadayのインスタンスもリセット
		if (resetPicker) {
			resetPicker.setDate(null);
		}
	}

	function handleSubmit(e) {
		e.preventDefault();
		alert('予約が完了しました！');
		handleReset(); // 送信後に自動リセット
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<!-- フォームフィールド -->

	<div class="flex gap-2">
		<button type="submit" class="btn btn-primary">予約する</button>
		<button type="button" class="btn btn-ghost" onclick={handleReset}> リセット </button>
	</div>
</form>
```

## 🎯 フォーム統合のベストプラクティス

### バリデーション設計

1. **リアルタイムバリデーション**

   - `onblur`イベントでのフィールド単位の検証
   - `onSelect`での日付選択時の即座のフィードバック
   - 動的なエラーメッセージの表示/非表示

2. **視覚的フィードバック**

   - `input-error`クラスでエラー状態を明示
   - `alert`コンポーネントでエラーサマリーを表示
   - 送信ボタンの`disabled`状態管理

3. **エラーメッセージの管理**

   ```javascript
   let errors = $state({});

   // エラーの追加
   errors.fieldName = 'エラーメッセージ';

   // エラーのクリア
   delete errors.fieldName;

   // 全エラーのクリア
   errors = {};
   ```

### ユーザビリティの向上

1. **入力制限とガイダンス**

   - `readonly`属性で直接入力を防止
   - `placeholder`で入力内容を明示
   - 必須項目には`required`属性と視覚的な表示

2. **日付の制約設定**

   ```javascript
   const picker = new Pikaday({
   	minDate: new Date(), // 今日以降
   	maxDate: maxDate, // 最大日付
   	yearRange: [1900, 2024], // 年の選択範囲
   	disableDayFn: function (date) {
   		// 特定の日付を無効化
   		return date.getDay() === 0; // 日曜日を無効化
   	}
   });
   ```

3. **連動する日付フィールド**
   - 開始日選択時に終了日の最小値を自動設定
   - 不正な選択の自動クリア
   - 期間制限の実装

### 状態管理とメモリ管理

1. **Svelte 5の$stateを活用**

   ```javascript
   let formData = $state({
   	date: '',
   	errors: {}
   });
   ```

2. **Pikadayインスタンスの管理**

   ```javascript
   let picker;

   onMount(async () => {
     const Pikaday = (await import('pikaday')).default;
     picker = new Pikaday({...});

     // クリーンアップ
     return () => picker.destroy();
   });
   ```

3. **フォームリセットの実装**
   - フォームデータのリセット
   - Pikadayインスタンスの同期
   - 適切なデフォルト値への復帰

## 📌 高度な日付範囲選択パターン

### 1. 期間制限付き選択

```javascript
// 3ヶ月先まで、最大30日間の制限
const today = new Date();
const maxDate = new Date();
maxDate.setMonth(maxDate.getMonth() + 3);

startPicker = new Pikaday({
	field: startInput,
	minDate: today,
	maxDate: maxDate,
	onSelect: function () {
		startDate = this.toString('YYYY-MM-DD');
		if (endPicker) {
			endPicker.setMinDate(this.getDate());
			// 最大30日間の制限
			const max30Days = new Date(this.getDate());
			max30Days.setDate(max30Days.getDate() + 30);
			endPicker.setMaxDate(max30Days > maxDate ? maxDate : max30Days);
		}
	}
});
```

### 2. チェックイン・チェックアウト（自動連動）

```javascript
checkInPicker = new Pikaday({
	field: checkInInput,
	minDate: today,
	onSelect: function () {
		checkInDate = this.toString('YYYY-MM-DD');
		if (checkOutPicker) {
			// チェックアウトは最短で翌日から
			const minCheckOut = new Date(this.getDate());
			minCheckOut.setDate(minCheckOut.getDate() + 1);
			checkOutPicker.setMinDate(minCheckOut);

			// チェックアウト日が無効になった場合、自動で翌日に設定
			if (!checkOutDate || new Date(checkOutDate) <= this.getDate()) {
				checkOutPicker.setDate(minCheckOut);
				checkOutDate = checkOutPicker.toString('YYYY-MM-DD');
			}
		}
	}
});
```

## 💡 実装時の重要な発見とTips

### Pikadayの内部構造理解

1. **日付セルはbutton要素**

   - Pikadayは日付を`<button class="pika-button">`として生成
   - `td`要素ではないため、セレクタに注意が必要
   - data属性: `data-pika-year`, `data-pika-month`, `data-pika-day`

2. **onDrawイベントの活用**

   - カレンダーの描画後に呼ばれるコールバック
   - DOM操作やクラスの追加に最適
   - 月の切り替え時にも再実行される

3. **スタイリングの注意点**
   - DaisyUIのスタイルとの競合を避けるため`:global()`を使用
   - 優先度の確保には`!important`が必要な場合がある
   - コンポーネントスコープで制限する場合は親要素のクラスを活用

### 実装サンプルの参照

より詳細な実装例やコード全体は、同ディレクトリ内の以下のファイルを参照してください：

- `BasicImplementations.svelte` - 基本的な実装例
- `PositionAdjustment.svelte` - 位置調整のサンプル
- `FormIntegrations.svelte` - フォーム統合パターン
- `DateRangeSelections.svelte` - 日付範囲選択の実装
- `CustomizationExamples.svelte` - カスタマイズ例（週末・祝日ハイライト含む）

## ⚠️ よくある間違いと解決策

### 1. カレンダーが表示されない

**原因**: Pikadayがサーバーサイドで実行されている
**解決**: `onMount`内で動的インポートを使用

### 2. スタイルが崩れる

**原因**: Pikaday.cssを読み込んでいる
**解決**: CSSファイルの読み込みを削除（DaisyUIが自動でスタイル提供）

### 3. カレンダーの位置がずれる

**原因**: 親要素との相対位置が正しく設定されていない
**解決**: `container: dateInput.parentElement`オプションを追加

### 4. Svelteでイベントハンドラーエラー

**原因**: Svelte 4の古い構文（`on:change`）を使用している
**解決**: Svelte 5の新しい構文（`onchange`）を使用

### 5. formatオプションが機能しない

**原因**: formatオプションはmoment.js専用で、moment.jsがインストールされていない
**解決**:

- `toString('YYYY-MM-DD')`メソッドを使用（推奨）
- moment.jsは2020年9月に非推奨となったため、新規インストールは避ける

### 6. Propsが正しく受け取れない

**原因**: Svelte 4の`export let`構文を使用している
**解決**: Svelte 5の`$props()`構文を使用

### 7. フォームバリデーションが機能しない

**原因**: エラー状態の管理が不適切
**解決**:

- `$state`でエラーオブジェクトを管理
- 適切なタイミングでエラーをクリア
- 視覚的なフィードバックを提供

### 8. 週末・祝日のハイライトが効かない

**原因**: tdセレクタを使用している、または正しくクラスが適用されていない
**解決**:

- `button.pika-button`セレクタを使用
- `:global()`でスコープ外のスタイルを適用
- カスタムクラス（`is-holiday`, `is-sunday`, `is-saturday`）を使用

## 🎨 カスタマイズ

### 日本語化

```javascript
const pikadayI18n = {
	previousMonth: '前月',
	nextMonth: '翌月',
	months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
	weekdays: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
	weekdaysShort: ['日', '月', '火', '水', '木', '金', '土']
};

const picker = new Pikaday({
	field: dateInput,
	i18n: pikadayI18n,
	firstDay: 0 // 日曜始まり
});
```

### 表示位置の調整

Pikadayは`position`オプションで柔軟な表示位置制御が可能です：

```javascript
const picker = new Pikaday({
	field: dateInput,

	// 基本の4方向
	position: 'bottom left', // 入力欄の左下（デフォルト）
	position: 'bottom right', // 入力欄の右下
	position: 'top left', // 入力欄の左上
	position: 'top right', // 入力欄の右上

	// 自動調整オプション
	reposition: true, // 画面端で自動的に位置を調整（デフォルト: true）
	reposition: false // 常に指定した位置に固定
});
```

**重要なポイント：**

- `reposition: true`（デフォルト）の場合、画面端では自動的に表示位置が調整される
- `container`オプションと組み合わせる場合、親要素に`position: relative`が必要
- スクロール可能な要素内で使用する場合は、`container`オプションの使用を推奨

### DaisyUIのクラス使用

```html
<!-- inputにpika-singleクラスを追加 -->
<input class="input pika-single" />

<!-- Callyにはcallyクラスを追加 -->
<calendar-date class="cally"></calendar-date>
```

## 📝 ベストプラクティス

1. **動的インポートを使用**: SSR対応のため必須
2. **CSSファイルは読み込まない**: DaisyUIのスタイルで十分
3. **クリーンアップを忘れない**: `return () => picker.destroy()`
4. **Svelte 5の構文を守る**:
   - Props: `let { } = $props()`
   - State: `let variable = $state()`
   - Derived: `let computed = $derived()`
   - イベント: `onclick`、`onchange`（`on:`プレフィックスなし）
5. **位置調整にはcontainerオプション**: z-indexでの解決は避ける
6. **inputにはreadonly属性を追加**: ユーザーの直接入力を防ぐ
7. **日付の相互連動**: 開始日選択時に終了日の最小値を自動設定
8. **フォームバリデーション**: リアルタイムと送信前の両方で実装
9. **エラーフィードバック**: 視覚的かつ明確なエラー表示
10. **メモリ管理**: Pikadayインスタンスの適切な破棄
11. **button要素を対象にスタイリング**: Pikadayの内部構造を理解して実装
12. **カスタムクラスの活用**: `is-holiday`、`is-sunday`、`is-saturday`など

## 🚀 Svelte 5への移行チェックリスト

- [ ] `export let` → `let { } = $props()`
- [ ] `on:click` → `onclick`
- [ ] `on:change` → `onchange`
- [ ] リアクティブ変数に`$state()`を使用
- [ ] 計算値に`$derived()`を使用
- [ ] `$:` → `$effect()`または`$derived()`

## 🎯 実用的なユースケースの実装例

本格的なUI/UXを考慮した実装例を5つ用意しています。これらは実際のプロジェクトでそのまま使用できるレベルの完成度を目指しています。

### 1. 予約システム用カレンダー

レストランや施設の予約システムで使用できる実装例です。

**主な機能：**

- 満席・残りわずかの日付を視覚的に表示
- 時間枠ごとの空き状況をリアルタイム表示
- ステップ表示による予約フローの可視化
- 人数・滞在時間の選択機能
- 特別な要望の入力欄

**実装のポイント：**

```javascript
// 満席・空き状況の視覚化
onDraw: function() {
  buttons.forEach(btn => {
    if (bookedDates.includes(dateStr)) {
      btn.classList.add('is-booked');
      btn.setAttribute('title', '満席');
    }
  });
}

// 時間枠ごとの空き状況管理
const availableSlots = $derived(() => {
  // 各時間帯の残り枠数を計算
});
```

### 2. イベント登録フォーム

企業の研修やセミナーなどのイベント管理に適した実装例です。

**主な機能：**

- 開始日・終了日の相互連動
- イベント期間の自動計算と表示（日数・週数・月数）
- 繰り返しイベントの設定機能
- 時間・場所・最大参加人数の管理
- 下書き保存機能

**実装のポイント：**

```javascript
// 期間の自動計算
const eventDuration = $derived(() => {
	const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
	if (days === 1) return '1日間';
	if (days <= 7) return `${days}日間`;
	// ...
});
```

### 3. タスク管理の期限設定

プロジェクト管理ツールで使用できるタスク登録機能です。

**主な機能：**

- 営業日のみ選択可能（土日・祝日を除外）
- 作業時間から推奨期限日を自動計算
- 優先度による色分け表示
- リマインダー設定
- 担当者アサイン機能

**実装のポイント：**

```javascript
// 営業日計算と推奨期限日
function addBusinessDays(date, days) {
	// 土日と祝日を除外して営業日を計算
}

const suggestedDueDate = $derived(() => {
	const days = Math.ceil(hours / 8);
	const buffer = Math.ceil(days * 0.2); // 20%のバッファ
	return addBusinessDays(new Date(), days + buffer);
});
```

### 4. 誕生日選択（年齢制限付き）

会員登録やサービス利用資格の確認で使用できる実装例です。

**主な機能：**

- 年齢の自動計算とリアルタイム表示
- 最低年齢制限のチェック（13歳以上）
- 利用資格の判定と視覚的フィードバック
- 利用規約への同意チェック
- エラー/成功状態の明確な表示

**実装のポイント：**

```javascript
// 年齢計算と資格チェック
function calculateAge(birthday) {
	// 正確な年齢計算（誕生日考慮）
}

const isEligible = $derived(() => {
	return age >= MIN_AGE && age <= MAX_AGE;
});
```

### 5. 休暇申請システム

企業の勤怠管理システムで使用できる休暇申請機能です。

**主な機能：**

- 休暇残日数の表示（stats表示）
- 複数の休暇タイプ（有給・病気・特別・無給）
- 申請日数の営業日計算
- 残日数チェックとアラート表示
- 業務引き継ぎ・緊急連絡先の管理

**実装のポイント：**

```javascript
// 休暇タイプごとの管理
const leaveTypes = {
	paid: { name: '有給休暇', color: 'primary', max: 20 },
	sick: { name: '病気休暇', color: 'warning', max: 10 }
	// ...
};

// 申請可能日数のチェック
const hasEnoughDays = $derived(() => {
	if (leaveData.leaveType === 'unpaid') return true;
	return requestedDays <= maxDays - usedDays;
});
```

### 実装サンプルの参照

詳細な実装コードは以下のファイルを参照してください：

- `PracticalUseCases.svelte` - 5つの実用的なユースケースの完全な実装

### UI/UX設計のベストプラクティス

1. **プログレッシブディスクロージャー**

   - 必要な情報のみを段階的に表示
   - ステップインジケーターで進捗を可視化
   - 条件に応じた動的な表示切り替え

2. **視覚的フィードバック**

   - 色による状態表示（エラー：赤、成功：緑、警告：黄）
   - アイコンを使った直感的な情報伝達
   - リアルタイムバリデーション

3. **スマートデフォルト**

   - 推奨値の自動計算と表示
   - よく使われる選択肢を初期値に設定
   - 過去の入力履歴から予測（実装例では省略）

4. **エラープリベンション**
   - 無効な選択肢の非活性化
   - 入力制限による間違いの防止
   - 明確なエラーメッセージ

## 🔗 参考リンク

- [DaisyUI Calendar Documentation](https://daisyui.com/components/calendar/)
- [Pikaday GitHub](https://github.com/Pikaday/Pikaday)
- [Cally Documentation](https://wicky.nillia.ms/cally/)
- [Svelte 5 Migration Guide](https://svelte.dev/docs/v5-migration-guide)

## 📌 このガイドの更新履歴

- 2025年5月: 実用的なユースケースの実装例を追加
  - 予約システム、イベント登録、タスク管理、誕生日選択、休暇申請の5つの本格的な実装
  - UI/UX設計のベストプラクティス
  - 営業日計算、年齢制限、在庫管理などの実用的な機能
- 2025年5月: AI駆動開発での実装時の発見を追加
  - Pikadayの内部構造（button要素）についての詳細
  - 週末・祝日ハイライトの正しい実装方法
  - スタイリングにおける`:global()`の使用方法
  - 実装サンプルファイルへの参照を追加
- 2025年5月: フォーム統合パターンを大幅に追加
  - バリデーション付きフォームの実装例
  - 日付範囲の動的バリデーション
  - フォームリセット機能
  - 年齢制限付き誕生日入力
  - エラーハンドリングのベストプラクティス
- 2025年5月: Svelte v5の新しいイベントハンドリング構文を追記
- 2025年5月: Props構文の変更（`export let` → `$props()`）を追記
- 2025年5月: 日付範囲選択の高度な実装パターンを追加
- 2025年5月: Svelte v5 Runes構文に対応
- Tailwind CSS v4の@apply制限を追記
- DaisyUI v5の公式サポートについて明記
- SSR対応の詳細な実装方法を追加
