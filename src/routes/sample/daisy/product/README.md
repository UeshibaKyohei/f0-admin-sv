# 商品管理システム実装ガイド - AI駆動開発向けナレッジベース

## 📚 概要

このドキュメントは、Svelte 5 + SvelteKit 2 + DaisyUI 5を使用した企業向け管理画面の実装ガイドです。AI駆動開発において、このコードベースを参照・流用することで、高品質なUIを効率的に実装できます。

## 📁 プロジェクト構成

```
/products/
├── +page.svelte         # メインページ - 全体の状態管理とレイアウト
├── ProductTable.svelte  # データテーブル - 無限スクロール実装
├── ProductFilters.svelte # フィルターパネル - 高度な検索・フィルター
├── ProductModal.svelte  # 作成/編集モーダル - フォーム実装
├── DeleteModal.svelte   # 削除確認モーダル - リッチな確認UI
├── mockData.js         # モックデータ生成 - テストデータ
└── README.md           # このドキュメント
```

## 🔍 各ファイルの詳細と参照ポイント

### 1. **+page.svelte** - メインページコンポーネント

#### 主な実装内容

- 全体の状態管理（products, filters, modals）
- ページネーション/無限スクロール切り替え
- CRUD操作のハンドリング
- CSVエクスポート機能

#### 参照すべきポイント

```svelte
// 🎯 Svelte 5の状態管理パターン
let products = $state([]);
let filteredProducts = $state([]);
const totalPages = $derived(Math.ceil(filteredProducts.length / itemsPerPage));

// 🎯 フィルタリングと検索の実装（73-114行目）
$effect(() => {
  let result = [...products];
  // 検索、カテゴリ、価格、在庫でのフィルタリング
  filteredProducts = result;
});

// 🎯 無限スクロールのAPI呼び出しパターン（127-140行目）
async function loadMoreFromAPI() {
  // 実際のAPI呼び出しのコメント付き実装例
  // const response = await fetch(`/api/products?page=${currentPage}&limit=20`);
}

// 🎯 CSVエクスポートの実装（216-235行目）
function exportData() {
  // 選択された商品またはフィルター結果をCSV形式で出力
}
```

### 2. **ProductTable.svelte** - テーブルコンポーネント

#### 主な実装内容

- レスポンシブなデータテーブル
- 無限スクロール（IntersectionObserver）
- 一括選択機能
- モバイル対応

#### 参照すべきポイント

```svelte
// 🎯 無限スクロールの正しい実装（31-63行目）
onMount(() => {
  if (viewMode === 'infinite' && sentinelRef) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '100px', // 早めに次のデータを読み込み
        threshold: 0.1
      }
    );
  }
});

// 🎯 DaisyUIのテーブルスタイリング（105-215行目）
<table class="table table-zebra">
  <!-- hover効果、zebraストライプ、レスポンシブ対応 -->
</table>

// 🎯 在庫状態のバッジ表示（67-75行目）
function getStockBadge(stock) {
  // 在庫数に応じた色分けバッジの実装
}
```

### 3. **ProductFilters.svelte** - フィルターコンポーネント

#### 主な実装内容

- リアルタイム検索（デバウンス付き）
- 複数条件フィルター
- 価格範囲スライダー
- 詳細フィルターの折りたたみ

#### 参照すべきポイント

```svelte
// 🎯 DaisyUI v5の検索フィールド実装（42-53行目）
<label class="input input-bordered flex items-center gap-2">
  <svg class="h-4 w-4 opacity-70"><!-- 検索アイコン --></svg>
  <input type="search" class="grow" placeholder="検索..." />
</label>

// 🎯 デバウンス検索の実装（17-23行目）
function handleSearch(value) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    searchQuery = value;
  }, 300);
}

// 🎯 価格範囲フィルターUI（134-159行目）
<input type="range" class="range range-sm" bind:value={priceRange.min} />
```

### 4. **ProductModal.svelte** - 作成/編集モーダル

#### 主な実装内容

- DaisyUI dialogを使用したモーダル
- フォームバリデーション
- ファイルアップロードUI
- レスポンシブなフォームレイアウト

#### 参照すべきポイント

```svelte
// 🎯 Svelte 5でのモーダル実装（23-29行目）
onMount(() => {
  if (modalRef) {
    modalRef.showModal(); // HTML5 dialog APIの使用
  }
});

// 🎯 DaisyUIのフォーム要素（81-209行目）
// - input with icon
// - select
// - radio button group (join)
// - file input
// - textarea with character count

// 🎯 ステータス切り替えUI（184-201行目）
<div class="join">
  <input type="radio" class="join-item btn" aria-label="販売中" />
  <input type="radio" class="join-item btn" aria-label="停止中" />
</div>
```

### 5. **DeleteModal.svelte** - 削除確認モーダル

#### 主な実装内容

- 視覚的な警告表示
- 削除対象の詳細情報
- 統計情報の表示
- 確認入力（大量削除時）

#### 参照すべきポイント

```svelte
// 🎯 リッチな確認UIの実装（43-57行目）
<div class="bg-error/10 flex h-20 w-20 items-center justify-center rounded-full">
	<svg class="text-error h-10 w-10"><!-- 警告アイコン --></svg>
</div>

// 🎯 DaisyUI Statsコンポーネントの活用（97-119行目）
<div class="stats stats-vertical lg:stats-horizontal shadow">
	<div class="stat">
		<div class="stat-title">削除商品数</div>
		<div class="stat-value text-error">{products.length}</div>
	</div>
</div>

// 🎯 条件付き確認入力（147-162行目）
{#if products.length > 5}
	<input
		type="text"
		placeholder="削除"
		oninput={(e) => (confirmButton.disabled = e.target.value !== '削除')}
	/>
{/if}
```

### 6. **mockData.js** - モックデータ生成

#### 主な実装内容

- リアルなテストデータ生成
- カテゴリ別商品生成
- ランダムな在庫・価格設定

#### 参照すべきポイント

```javascript
// 🎯 実用的なモックデータ生成（25-44行目）
function generateProduct(id) {
	return {
		id,
		name: productName + ' ' + (Math.floor(Math.random() * 100) + 1),
		sku: generateSKU(),
		category: getRandomElement(categories),
		price: Math.floor(Math.random() * 9900) + 100,
		stock: Math.floor(Math.random() * 100),
		status: Math.random() > 0.2 ? 'active' : 'inactive',
		image: `https://picsum.photos/seed/${id}/400/400`,
		createdAt: new Date(
			Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000
		).toISOString()
	};
}
```

## 🎯 学習ポイントと注意事項

### 1. **Svelte 5 Runes構文の正しい使用**

#### ❌ よくある間違い

```svelte
<!-- 間違い: Svelte 4の古い構文 -->
<script>
	export let product;
	$: doubled = count * 2;
</script>

<!-- 間違い: @constの位置 -->
<td>
	<div>
		{@const value = getValue()}
		<!-- エラー -->
	</div>
</td>
```

#### ✅ 正しい実装

```svelte
<script>
	// Props定義
	let { product = null, onSave } = $props();

	// Reactive state
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>

<!-- @constは直接の子要素として -->
{#each items as item}
	{@const value = getValue(item)}
	<td>{value}</td>
{/each}
```

### 2. **DaisyUI v5のモダンな実装パターン**

#### モーダル実装

```svelte
<script>
	import { onMount } from 'svelte';

	let modalRef = $state();

	onMount(() => {
		// dialog要素のshowModal()を使用
		modalRef?.showModal();
	});

	function closeModal() {
		modalRef?.close();
		// アニメーション完了を待つ
		setTimeout(onClose, 200);
	}
</script>

<dialog bind:this={modalRef} class="modal modal-bottom sm:modal-middle">
	<div class="modal-box">
		<!-- コンテンツ -->
	</div>

	<!-- 外側クリックで閉じる -->
	<form method="dialog" class="modal-backdrop">
		<button onclick={closeModal}>close</button>
	</form>
</dialog>
```

#### フォーム要素のモダンな実装

```svelte
<!-- 検索フィールド -->
<label class="input input-bordered flex items-center gap-2">
	<svg class="h-4 w-4 opacity-70"><!-- アイコン --></svg>
	<input type="search" class="grow" placeholder="検索..." />
</label>

<!-- ラジオボタングループ -->
<div class="join">
	<input
		type="radio"
		name="status"
		class="join-item btn"
		aria-label="アクティブ"
		checked={status === 'active'}
	/>
	<input
		type="radio"
		name="status"
		class="join-item btn"
		aria-label="非アクティブ"
		checked={status === 'inactive'}
	/>
</div>
```

### 3. **無限スクロールの実装パターン**

#### 実装のポイント

```svelte
<script>
	import { onMount, onDestroy } from 'svelte';

	let sentinelRef = $state();
	let observer;

	onMount(() => {
		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
					loadMore();
				}
			},
			{
				root: null,
				rootMargin: '100px', // 早めに読み込み開始
				threshold: 0.1
			}
		);

		if (sentinelRef) observer.observe(sentinelRef);
	});

	onDestroy(() => observer?.disconnect());

	// API呼び出しのシミュレーション
	async function loadMore() {
		isLoadingMore = true;
		try {
			// 実際のAPI呼び出し
			// const response = await fetch(`/api/products?page=${page}`);
			// const newProducts = await response.json();

			// デモ用の実装
			await new Promise((resolve) => setTimeout(resolve, 500));
			displayedItems += 20;
		} finally {
			isLoadingMore = false;
		}
	}
</script>

<!-- センチネル要素 -->
<div bind:this={sentinelRef} class="flex justify-center py-4">
	{#if isLoadingMore}
		<span class="loading loading-spinner loading-md"></span>
	{:else if hasMore}
		<span>スクロールして更に表示</span>
	{/if}
</div>
```

### 4. **リッチなUI実装のベストプラクティス**

#### 削除確認モーダル

```svelte
<!-- ネイティブalertを使わない -->
<!-- ❌ 悪い例 -->
if (confirm('削除しますか？')) { /* ... */ }

<!-- ✅ 良い例：情報豊富なモーダル -->
<dialog class="modal">
  <div class="modal-box">
    <!-- 視覚的な警告 -->
    <div class="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center">
      <svg class="h-10 w-10 text-error"><!-- 警告アイコン --></svg>
    </div>

    <!-- 統計情報 -->
    <div class="stats">
      <div class="stat">
        <div class="stat-title">削除商品数</div>
        <div class="stat-value">{products.length}</div>
      </div>
      <div class="stat">
        <div class="stat-title">在庫総額</div>
        <div class="stat-value">{formatPrice(totalValue)}</div>
      </div>
    </div>

    <!-- 削除対象のプレビュー -->
    <details class="collapse collapse-arrow">
      <summary>削除される商品一覧</summary>
      <div class="collapse-content">
        {#each products as product}
          <!-- 商品詳細 -->
        {/each}
      </div>
    </details>
  </div>
</dialog>
```

## 💡 実装のTips

### 1. **パフォーマンス最適化**

```svelte
<!-- 画像の遅延読み込み -->
<img src={product.image} alt={product.name} loading="lazy" />

<!-- デバウンス検索 -->
let debounceTimer;
function handleSearch(value) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    searchQuery = value;
  }, 300);
}

<!-- 大量データの仮想スクロール検討 -->
// 1000件以上のデータでは仮想スクロールライブラリの使用を推奨
```

### 2. **アクセシビリティ**

```svelte
<!-- ARIA属性の適切な使用 -->
<button aria-label="商品を削除" class="btn btn-ghost btn-xs">
  <svg><!-- アイコン --></svg>
</button>

<!-- キーボード操作対応 -->
<div role="button" tabindex="0"
     onclick={handleClick}
     onkeydown={(e) => e.key === 'Enter' && handleClick()}>
```

### 3. **レスポンシブデザイン**

```svelte
<!-- モーダルのレスポンシブ -->
<dialog class="modal modal-bottom sm:modal-middle">
	<!-- モバイルでは下から、デスクトップでは中央 -->
</dialog>

<!-- モバイル対応のテーブル -->
<style>
	@media (max-width: 768px) {
		/* 不要な列を非表示 */
		th:nth-child(4),
		td:nth-child(4),
		th:nth-child(7),
		td:nth-child(7) {
			display: none;
		}
	}
</style>
```

### 4. **状態管理のベストプラクティス**

```svelte
<script>
	// グローバル状態は$stateで管理
	let products = $state([]);
	let filteredProducts = $state([]);

	// 派生状態は$derivedを使用
	const totalValue = $derived(products.reduce((sum, p) => sum + p.price * p.stock, 0));

	// 副作用は$effectで処理
	$effect(() => {
		// フィルタリングロジック
		let result = [...products];
		if (searchQuery) {
			result = result.filter(/* ... */);
		}
		filteredProducts = result;
	});
</script>
```

## 🚀 実装チェックリスト

### 基本機能

- [x] CRUD操作（作成・読取・更新・削除） → `+page.svelte` 156-213行目
- [x] 一括選択・一括操作 → `ProductTable.svelte` 全選択機能
- [x] ページネーション/無限スクロール切り替え → `+page.svelte` 116-125行目
- [x] リアルタイム検索（デバウンス付き） → `ProductFilters.svelte` 17-23行目
- [x] 複数条件でのフィルタリング → `+page.svelte` 73-114行目
- [x] ソート機能（複数カラム対応） → `+page.svelte` 101-113行目
- [x] データエクスポート（CSV） → `+page.svelte` 216-235行目

### UI/UX

- [x] モーダルウィンドウ（DaisyUI dialog使用） → `ProductModal.svelte`, `DeleteModal.svelte`
- [ ] トースト通知（操作フィードバック） → 未実装（推奨: DaisyUI toast）
- [x] ローディング状態の表示 → `ProductTable.svelte` 243-245行目
- [x] 空状態の表示 → `ProductTable.svelte` 226-237行目
- [x] エラーハンドリング → `+page.svelte` 141-148行目
- [x] ツールチップ → `ProductTable.svelte` 170行目, 180行目
- [x] アニメーション効果 → `DeleteModal.svelte` fade効果

### パフォーマンス

- [x] 画像の遅延読み込み → `ProductTable.svelte` 122行目 `loading="lazy"`
- [x] 検索のデバウンス → `ProductFilters.svelte` 17-23行目
- [x] 大量データ対応（仮想スクロール） → `ProductTable.svelte` IntersectionObserver
- [x] コンポーネントの適切な分割 → 5つのコンポーネントに分離

### アクセシビリティ

- [x] ARIA属性の実装 → 各コンポーネントの`aria-label`
- [x] キーボード操作対応 → モーダルのESCキー対応
- [x] フォーカス管理 → dialog要素の自動フォーカス
- [x] スクリーンリーダー対応 → 適切なラベル付け

## 📝 よくあるエラーと解決方法

### 1. `@const`の配置エラー

```
エラー: `{@const}` must be the immediate child of `{#each}`, `{#if}`, etc.
解決: {@const}を制御フロー構文の直接の子要素として配置
```

### 2. モーダルが表示されない

```
原因: showModal()の呼び出しタイミング
解決: onMount内で呼び出し、bind:thisで参照を取得
```

### 3. 無限スクロールが動作しない

```
原因: IntersectionObserverの設定ミス
解決: sentinelRefを正しくバインド、rootMarginを設定
```

## 🎁 再利用可能なコンポーネントパターン

### 1. **データテーブル** → `ProductTable.svelte`

```svelte
// 使用例
<ProductTable
	products={paginatedProducts()}
	{selectedProducts}
	{toggleSelection}
	{editProduct}
	{deleteProduct}
	{viewMode}
	{loadMore}
/>
```

- ソート可能なヘッダー
- 一括選択機能（チェックボックス）
- レスポンシブ対応（モバイルで列を自動非表示）
- 無限スクロール/ページネーション対応

### 2. **モーダルダイアログ** → `ProductModal.svelte`

```svelte
// DaisyUI dialogの基本パターン
<dialog bind:this={modalRef} class="modal modal-bottom sm:modal-middle">
	<div class="modal-box">
		<!-- コンテンツ -->
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={closeModal}>close</button>
	</form>
</dialog>
```

### 3. **フィルターパネル** → `ProductFilters.svelte`

```svelte
// 検索フィールドのパターン
<label class="input input-bordered flex items-center gap-2">
	<svg><!-- アイコン --></svg>
	<input type="search" class="grow" />
</label>
```

### 4. **削除確認ダイアログ** → `DeleteModal.svelte`

- 削除対象の詳細表示（単一/複数）
- 統計情報（Stats コンポーネント）
- 確認入力（大量削除時）
- ローディング状態

## 🔧 コピー&ペーストで使える実装パターン

### 無限スクロールの実装

```svelte
// ProductTable.svelte 31-63行目から抜粋
let sentinelRef = $state();
let observer;

onMount(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        loadMore();
      }
    },
    { rootMargin: '100px', threshold: 0.1 }
  );

  if (sentinelRef) observer.observe(sentinelRef);
});
```

### DaisyUIモーダルの実装

```svelte
// ProductModal.svelte 23-29行目から抜粋
let modalRef = $state();

onMount(() => {
  modalRef?.showModal();
});

function closeModal() {
  modalRef?.close();
  setTimeout(onClose, 200); // アニメーション待ち
}
```

### フィルタリングロジック

```svelte
// +page.svelte 73-114行目の実装パターン
$effect(() => {
  let result = [...products];

  // 検索フィルター
  if (searchQuery) {
    result = result.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // カテゴリフィルター
  if (selectedCategory !== 'all') {
    result = result.filter(product => product.category === selectedCategory);
  }

  filteredProducts = result;
});
```

## 🔗 関連リソース

- [Svelte 5 Runes Documentation](https://svelte.dev/docs/runes)
- [DaisyUI v5 Components](https://daisyui.com/components/)
- [SvelteKit 2 Documentation](https://kit.svelte.dev/docs)

## 📌 まとめ

このコードベースは、企業向け管理画面の実装において必要な要素を網羅しています。AI駆動開発では、このガイドとコードを参照することで、以下のメリットが得られます：

1. **最新のSvelte 5構文**に準拠した実装（各ファイルの`$state`、`$derived`、`$props`の使用例を参照）
2. **DaisyUI v5**を最大限活用したリッチなUI（特に`ProductModal.svelte`と`DeleteModal.svelte`）
3. **実用的な機能**の実装パターン（`+page.svelte`のCRUD操作全般）
4. **パフォーマンスとアクセシビリティ**への配慮（`ProductTable.svelte`の実装）
5. **エラーを回避**するための知識（このガイドの「よくあるエラーと解決方法」セクション）

### 🎯 AI開発での活用方法

1. **新規機能追加時**: 類似の実装を探して参考にする
   - 例: 新しいモーダルを作る → `ProductModal.svelte`を参考
2. **バグ修正時**: よくあるエラーセクションを確認
   - 例: `@const`エラー → 配置位置を確認
3. **UI改善時**: DaisyUIコンポーネントの使用例を参照

   - 例: フォーム改善 → `ProductModal.svelte`のフォーム実装

4. **パフォーマンス改善時**: 実装済みの最適化を確認
   - 例: 大量データ対応 → `ProductTable.svelte`の無限スクロール

このナレッジを活用して、高品質な管理画面を効率的に開発してください。
