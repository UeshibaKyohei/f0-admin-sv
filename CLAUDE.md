# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit-based admin dashboard application with modern design principles, comprehensive testing, and a component-driven development approach.

## Tech Stack

- **Framework**: SvelteKit 2.16.0 with Svelte 5.0.0
- **Styling**: Tailwind CSS 4.1.7 + DaisyUI 5.0.35
- **Language**: TypeScript 5.0.0
- **Testing**: Vitest (unit), Playwright (e2e), Storybook (component)
- **Package Manager**: pnpm (fallback to npm)

## Essential Commands

```bash
# Development
pnpm run dev              # Start dev server (port 5173)
pnpm run build            # Build for production
pnpm run preview          # Preview production build

# Testing
pnpm run test             # Run all tests (unit + e2e)
pnpm run test:unit        # Run unit tests only
pnpm run test:e2e         # Run e2e tests only

# Code Quality
pnpm run lint             # Run prettier check + eslint
pnpm run format           # Format code with prettier
pnpm run check            # Type check with svelte-check

# Storybook
pnpm run storybook        # Start Storybook dev server
pnpm run build-storybook  # Build Storybook
```

## Architecture

### Routing Structure

- File-based routing in `src/routes/`
- Layout components: `+layout.svelte`
- Page components: `+page.svelte`
- Load functions: `+page.js` or `+page.server.js`

### Component Organization

- **Reusable components**: `src/lib/components/`
- **Route-specific components**: Alongside route files
- **Storybook stories**: `src/stories/`
- **Component tests**: Co-located `.test.ts` files

### State Management

- Svelte stores in `src/lib/stores/`
- Route-specific stores alongside routes (e.g., `chatStore.js`)

### Testing Strategy

1. **Unit tests**: Vitest + Testing Library, co-located with components
2. **E2E tests**: Playwright tests in `e2e/` directory
3. **Component docs**: Storybook stories for visual testing

### Styling Approach

- Utility-first CSS with Tailwind
- DaisyUI component classes
- Global styles in `src/app.css`
- Component-specific CSS modules when needed

## Key Design Principles

The project follows 2025 admin dashboard design trends:

- **Minimalist UI**: Clean interfaces with effective whitespace
- **Mobile-first**: Responsive design for all screen sizes
- **Microinteractions**: Subtle animations for user feedback
- **AI-powered insights**: Interactive data visualization
- **Accessibility**: WCAG 2.1 AA compliance

## Development Notes

- The project uses Vite for fast HMR and builds
- TypeScript strict mode is enabled
- ESLint 9 flat config is used
- Prettier handles all formatting
- Test files should use `.test.ts` extension
- E2E tests target the preview server by default

# 回答ルール

次のバージョンに合わせた情報を提供する為にContext7のMCPを必ず使ってください。
問題やその他の情報を取得する場合はBrave SearchのMCPを利用してください。

- Svelte: v5.16以降
- SvelteKit: v2.16以降
- DaisyUI: v5.0.37以降

基本的には最新の情報で検索し、ミスを私が発見した場合は使用バージョンの方が古くなっている為上記のバージョンと現在のコードで比較する様にしてください。

Claudeは何度この指示をしても自身の知っている古いSvelte 4系、Daisy4系、Tailwind 3系を利用しようとします。これは重大なエラーを招きます。作業開始のたびに必ず最新情報を取得すること。

# 出力ルール

- コードは500行程度を最大とし、超えるものはファイル分割を行ってください。
- Svelteのファイル分割は適切なコンポーネント化を行わずとも単に一部のHTML部分を別ファイルに分離しそれを呼び出せるのでシンプルな分割を行ってください。
- 命令が多数の機能に渡る場合、またはある程度の出力サイズになる場合「私が確認出来る単位」に分割して作業を切り分けてください。例えば巨大な１つの多機能ページを作る場合、まず全体のUI、次に内部機能1、機能2,という具合に一度私への確認を依頼し作業を継続するか問う様にしてください。
- 作業をいくつかに分ける場合、ファイルを編集すると二度手間になる可能性があるので、ファイル単位で作業を区切り、続きは新しいファイルで行って元のコードから呼び出す様に工夫してください。これは絶対ではありませんが配慮してください。
- 何度かあなたに命令してもSvelteやDaisyUIのコードが古い場合があります。必ず最新版を調査してください。
- DaisyUI v5のオーソドックスな手順に従い命令がない限り独自実装をしないこと。
- styleでグローバル領域を汚さないこと。許可がない限りそのファイル内のスコープでのみ適用されたスタイルを設定すること

# 事前情報

- すでにsvlete kitによるプロジェクトは作成済みです
- いくつかのページが稼働しています。
- DaisyUIやTailwind v4はすでに利用できる状態にあります。(import済み)
- 作成は基本的にrouter直下に配置する+page.svelteとそれが呼び出す切り出されたコンポーネントを作成してもらう事になります。
- 単なるファイルを切り出したコンポーネントは汎用性ではなく単に切り出されただけのものなので+page.svelteファイルと同フォルダ内に配置する前提でimportしてください。

# 追加情報

## コードサンプル

### シンタックスハイライト

もしサンプル画面でソースコード例を示す場合すでにインストール済みのSvelteHighlightが使用できます。

```
<script>
import { HighlightSvelte } from 'svelte-highlight';
import 'svelte-highlight/styles/dark.css';

const code = "let a = 10;"
</script>

<HighlightSvelte code={code} />
```

### コードサンプルの注意点

例えば

```
let code = `
<script>

</script>
`
```

の様に書くとsvelteのコンパイラがscriptタグの終了を判定してしまいます。
必ずエスケープを行ってください。

### コードは長くなるので表示非表示を切り替えられる様にしておく

```
<!-- コード表示切り替え -->
      <div class="collapse collapse-arrow bg-base-200">
        <input type="checkbox" />
        <div class="collapse-title font-medium">
          コードを表示
        </div>
        <div class="collapse-content">
          <HighlightSvelte code={eventPeriodCode} />
        </div>
      </div>
```

## Svelte v5注意点

AIはContext7を使わずに自信満々に間違った古いコードを書きます。念の為よく間違う構文を随時追加しておきます。

### Runes構文のアップデート

```
// ❌ 古い構文
$: volumePercentage = Math.round(volumeRange);
$: temperatureLabel = temperatureRange < 18 ? 'Cold' : temperatureRange < 25 ? 'Comfortable' : 'Hot';
$: priceFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
}).format(priceRange);

// ✅ 正しいSvelte 5 runes構文
const volumePercentage = $derived(Math.round(volumeRange));
const temperatureLabel = $derived(temperatureRange < 18 ? 'Cold' : temperatureRange < 25 ? 'Comfortable' : 'Hot');
const priceFormatted = $derived(new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
}).format(priceRange));
```

Props関連

```
// 古い書き方
<script>
  export let copyToClipboard;
</script>

// 新しい書き方
<script>
  let { copyToClipboard } = $props();
</script>
```

## Svelte v5 重要な実装パターン

### 1. ストアのリアクティビティ - 最重要

Svelte 5のリアクティビティは**参照の変更**を検知します。オブジェクトや配列の中身を変更しても、参照が同じならUIは更新されません。

#### ❌ 間違った実装（UIが更新されない）

```javascript
// store.update()内での破壊的メソッドの使用
myStore.update((items) => {
	items.push(newItem); // ❌ 既存配列を変更
	return items; // ❌ 同じ参照を返す
});

// オブジェクトの直接変更
myStore.update((data) => {
	data.property = newValue; // ❌ 既存オブジェクトを変更
	return data; // ❌ 同じ参照を返す
});

// ネストしたデータの変更
messages.update((msgs) => {
	msgs[chatId].push(newMessage); // ❌ ネストした配列を直接変更
	return msgs;
});
```

#### ✅ 正しい実装（イミュータブルな更新）

```javascript
// 配列の更新
myStore.update((items) => {
	return [...items, newItem]; // ✅ 新しい配列を返す
});

// オブジェクトの更新
myStore.update((data) => {
	return { ...data, property: newValue }; // ✅ 新しいオブジェクトを返す
});

// ネストしたデータの更新
messages.update((msgs) => {
	const newMsgs = { ...msgs }; // 新しいオブジェクトを作成
	if (!newMsgs[chatId]) {
		newMsgs[chatId] = [newMessage];
	} else {
		newMsgs[chatId] = [...newMsgs[chatId], newMessage]; // 新しい配列
	}
	return newMsgs; // ✅ 新しいオブジェクトを返す
});

// 配列の一般的な操作
// 追加: [...array, newItem]
// 削除: array.filter(item => item.id !== targetId)
// 更新: array.map(item => item.id === targetId ? {...item, ...updates} : item)
```

### 2. `{@const}` vs `$derived` の使い分け

#### `{@const}` - 静的な値（リアクティブでない）

```svelte
{#if user}
	{@const fullName = `${user.firstName} ${user.lastName}`}
	<p>Welcome, {fullName}</p>
	<!-- userが変わっても更新されない -->
{/if}
```

#### `$derived` - リアクティブな派生値

```svelte
<script>
	// 単純な派生値
	const fullName = $derived(`${user.firstName} ${user.lastName}`);

	// 複雑な計算が必要な場合
	const stats = $derived.by(() => {
		const total = items.length;
		const completed = items.filter((item) => item.done).length;
		return {
			total,
			completed,
			percentage: total > 0 ? (completed / total) * 100 : 0
		};
	});
</script>
```

### 3. 関数内でのストア参照

```javascript
// ❌ 関数内では$プレフィックスは使えない
function calculateTotal() {
	const items = $myStore; // エラー: $myStore is an illegal variable name
}

// ✅ get()を使用
import { get } from 'svelte/store';

function calculateTotal() {
	const items = get(myStore); // 現在の値を取得
	return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ または関数の外で値を取得
const items = $myStore; // コンポーネントのトップレベルでは使用可能
function calculateTotal() {
	return items.reduce((sum, item) => sum + item.price, 0);
}
```

### 4. 状態管理のベストプラクティス

#### シングルソースオブトゥルース

```javascript
// ❌ 同じデータを複数箇所で管理
users: [{ id: 1, activeTaskCount: 2 }]; // ここと...
tasks: [{ userId: 1 }, { userId: 1 }]; // ここで重複

// ✅ 単一の真実の源 + 派生値
export const tasks = writable([]);
export const userStats = derived([users, tasks], ([$users, $tasks]) => {
	return $users.map((user) => ({
		...user,
		activeTaskCount: $tasks.filter((t) => t.userId === user.id).length
	}));
});
```

### 5. よくあるミスと解決方法

#### 配列/オブジェクトの更新時

- ❌ `push()`, `pop()`, `splice()`, `shift()`, `unshift()`
- ✅ `[...array]`, `filter()`, `map()`, スプレッド構文

#### リアクティビティが動かない時のチェックリスト

1. ストアの更新で新しい参照を返しているか？
2. `{@const}`を使っていないか？（`$derived`が必要では？）
3. 関数内で`$store`を使っていないか？（`get(store)`を使う）
4. ネストしたオブジェクト/配列も新しく作成しているか？

### 6. DaisyUI v5 の注意点

#### テーマの適用

```svelte
<!-- グローバルに影響しないようスコープを限定 -->
<div data-theme="light" class="min-h-screen">
	<!-- この中だけテーマが適用される -->
</div>
```

#### モーダルやドロワーの制御

```svelte
<script>
	let modalOpen = $state(false);
</script>

<!-- DaisyUI v5では input[type="checkbox"] で制御 -->
<input type="checkbox" id="my-modal" class="modal-toggle" bind:checked={modalOpen} />
<div class="modal">
	<div class="modal-box">
		<!-- content -->
	</div>
</div>
```
