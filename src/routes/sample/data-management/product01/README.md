# ECサイト商品管理システム - AI駆動開発ガイド

## 1. システム概要

### 1.1 目的
このシステムは、ECサイトにおける商品マスターデータの包括的な管理を実現するCRUDアプリケーションです。小規模から中規模のECサイトを想定し、商品情報、在庫、価格、カテゴリー、リソース（画像・動画・PDF）を統合的に管理します。

### 1.2 技術スタック
- **フロントエンド**: Svelte 5 + SvelteKit 2.16+
- **UIフレームワーク**: Tailwind CSS 4 + DaisyUI 5
- **状態管理**: Svelte Stores (writable/derived)
- **データ永続化**: 
  - モックモード: LocalStorage
  - 本番モード: REST API (PostgreSQL/MySQL想定)
- **型定義**: TypeScript

### 1.3 アーキテクチャの特徴
- **モック/本番モード切り替え**: 単一の設定フラグで動作モードを切り替え可能
- **レイヤード設計**: API層、ストア層、UI層の明確な分離
- **リアクティブ設計**: Svelte 5のrunes構文を活用した効率的な状態管理
- **モバイルファースト**: レスポンシブデザインによる全デバイス対応

## 2. 主要機能詳細

### 2.1 商品管理機能

#### 基本的なCRUD操作
- **Create（作成）**: 新規商品の登録
  - 必須項目: 商品名、カテゴリー、価格
  - 任意項目: 説明、画像、タグ、初期在庫
  - 自動設定: ID、作成日時、ステータス

- **Read（読取）**: 商品情報の表示
  - グリッド/リスト表示切り替え
  - 詳細モーダルでの全情報表示
  - 履歴情報の参照

- **Update（更新）**: 商品情報の編集
  - インライン編集非対応（モーダル編集のみ）
  - 価格変更時の自動履歴記録
  - 楽観的UI更新

- **Delete（削除）**: 商品の削除
  - 単一削除と一括削除
  - ソフトデリート非対応（物理削除）

#### 高度な検索・フィルタリング
```javascript
// フィルター構造
{
  search: string,           // 商品名・説明文での全文検索
  categoryId: string,       // カテゴリーフィルター
  tags: string[],          // タグによる絞り込み（OR条件）
  stockStatus: string[],   // 在庫状態フィルター
  priceRange: {
    min: number,
    max: number
  },
  status: string[],        // 商品ステータスフィルター
  sortBy: string,          // ソート項目
  sortOrder: 'asc'|'desc'  // ソート順序
}
```

### 2.2 在庫管理機能

#### 在庫の追跡と調整
- **リアルタイム在庫表示**: 現在の在庫数と状態を常に表示
- **在庫調整機能**: 
  - 入荷、出荷、棚卸しによる調整
  - 調整理由の記録
  - 変更履歴の自動記録

#### 在庫ステータスの自動判定
```javascript
// 在庫状態の判定ロジック
stockStatus = stock === 0 ? 'out_of_stock' : 
              stock < CONFIG.INVENTORY.LOW_STOCK_THRESHOLD ? 'low_stock' : 
              'in_stock';
```

### 2.3 カテゴリー管理

#### 階層構造サポート
- 最大5階層までの入れ子構造
- パンくずリスト形式での表示
- 親カテゴリー削除時の制約（子カテゴリーが存在する場合は削除不可）

#### カテゴリーツリー表示
```javascript
// カテゴリーツリーの構築
const categoryTree = derived(categories, ($categories) => {
  // 親子関係を構築し、ツリー構造を生成
  // ソート順序に従って並び替え
});
```

### 2.4 リソース管理（画像・動画・PDF）

#### マルチメディア対応
- **対応フォーマット**:
  - 画像: JPG, PNG, GIF, WebP
  - 動画: MP4, WebM
  - ドキュメント: PDF
  
#### アップロード機能
- ドラッグ&ドロップ対応
- 複数ファイル同時アップロード
- ファイルサイズ制限（設定可能、デフォルト10MB）
- Base64エンコード（モックモード）

#### リソース管理機能
- メイン画像の設定
- ドラッグによる並び替え
- サムネイル表示
- ファイル情報（サイズ、形式）の表示

### 2.5 価格・履歴管理

#### 価格履歴の自動記録
- 価格変更時の自動記録
- 変更者と日時の記録
- 履歴の一覧表示

#### 在庫履歴の追跡
- すべての在庫変動を記録
- 変動理由と種別の記録
- 参照情報（注文ID等）の関連付け（本番環境）

## 3. データベース設計

### 3.1 主要テーブル構成

#### products（商品テーブル）
| カラム名 | 型 | 説明 | UI表示箇所 |
|---------|-----|------|------------|
| id | VARCHAR(36) | 商品ID（UUID） | 内部使用 |
| name | VARCHAR(200) | 商品名 | 商品カード、リスト |
| description | TEXT | 商品説明 | 詳細モーダル |
| price | DECIMAL(12,2) | 価格 | 商品カード、リスト |
| category_id | VARCHAR(36) | カテゴリーID | カテゴリー名として表示 |
| stock | INT | 在庫数 | 商品カード、在庫管理 |
| stock_status | VARCHAR(20) | 在庫状態 | ステータスバッジ |
| status | VARCHAR(20) | 商品ステータス | ステータスバッジ |

#### categories（カテゴリーテーブル）
| カラム名 | 型 | 説明 | 用途 |
|---------|-----|------|------|
| id | VARCHAR(36) | カテゴリーID | 主キー |
| name | VARCHAR(100) | カテゴリー名 | 表示名 |
| parent_id | VARCHAR(36) | 親カテゴリーID | 階層構造 |
| path | VARCHAR(500) | パス | URL、パンくず |
| level | INT | 階層レベル | インデント表示 |
| sort_order | INT | 表示順序 | 並び替え |

#### product_resources（商品リソーステーブル）
| カラム名 | 型 | 説明 | 用途 |
|---------|-----|------|------|
| id | VARCHAR(36) | リソースID | 主キー |
| product_id | VARCHAR(36) | 商品ID | 関連付け |
| type | VARCHAR(20) | リソースタイプ | アイコン表示 |
| url | TEXT | リソースURL | 表示・ダウンロード |
| is_primary | BOOLEAN | メインフラグ | メイン画像判定 |
| sort_order | INT | 表示順序 | 並び替え |

### 3.2 リレーション設計

```sql
-- 主要な外部キー制約
products.category_id → categories.id (多対一)
product_tags.product_id → products.id (多対多の中間テーブル)
product_tags.tag_id → tags.id (多対多の中間テーブル)
product_resources.product_id → products.id (一対多)
price_history.product_id → products.id (一対多)
stock_history.product_id → products.id (一対多)
```

### 3.3 インデックス戦略

```sql
-- パフォーマンス最適化のための主要インデックス
CREATE INDEX idx_products_search ON products(status, stock_status, category_id);
CREATE INDEX idx_products_price_range ON products(price, status);
CREATE INDEX idx_products_fulltext ON products USING gin(
  to_tsvector('japanese', name || ' ' || COALESCE(description, ''))
);
```

## 4. 実装のポイントとTips

### 4.1 Svelte 5 リアクティビティの注意点

#### イミュータブルな更新が必須
```javascript
// ❌ 間違い: 既存オブジェクトを変更
store.update(items => {
  items.push(newItem);  // UIが更新されない
  return items;
});

// ✅ 正解: 新しいオブジェクトを返す
store.update(items => [...items, newItem]);
```

#### $derived vs {@const}の使い分け
```svelte
<!-- リアクティブな値には$derived -->
<script>
const totalPrice = $derived(items.reduce((sum, item) => sum + item.price, 0));
</script>

<!-- 静的な値には{@const} -->
{#each items as item}
  {@const formattedDate = new Date(item.created).toLocaleDateString()}
  <div>{formattedDate}</div>
{/each}
```

### 4.2 API層の設計思想

#### モックと本番の切り替え
```javascript
// config.js
export const CONFIG = {
  IS_MOCK_MODE: true  // この値を変更するだけで切り替え可能
};

// api/client.js
if (CONFIG.IS_MOCK_MODE) {
  return mockApi.products.list(params);
} else {
  return this.http.get('/products', params);
}
```

#### エラーハンドリングの統一
```javascript
try {
  const result = await apiClient.products.create(data);
  // 成功処理
} catch (error) {
  // エラー処理（モック/本番共通）
  console.error('Failed to create product:', error);
  // ユーザーへの通知
}
```

### 4.3 パフォーマンス最適化

#### 派生ストアの活用
```javascript
// 重い計算は派生ストアで一度だけ実行
export const statistics = derived(
  [products, filters],
  ([$products, $filters]) => {
    // フィルタリングと統計計算
    return computeStatistics($products, $filters);
  }
);
```

#### 仮想スクロールの検討
- 商品数が1000件を超える場合は仮想スクロールの実装を推奨
- `svelte-virtual-list`等のライブラリを活用

### 4.4 セキュリティ考慮事項

#### XSS対策
- Svelteは自動的にHTMLをエスケープ
- `{@html}`使用時は必ずサニタイズ

#### CSRF対策（本番環境）
```javascript
// APIクライアントでCSRFトークンを自動付与
headers: {
  'X-CSRF-Token': getCsrfToken(),
  ...options.headers
}
```

## 5. カスタマイズガイド

### 5.1 新しい商品属性の追加

1. **型定義の更新** (`types.ts`)
```typescript
export interface Product {
  // 既存の属性...
  manufacturer?: string;  // 新規追加
  warranty?: number;      // 保証期間（月）
}
```

2. **データベーススキーマの更新**
```sql
ALTER TABLE products 
ADD COLUMN manufacturer VARCHAR(200),
ADD COLUMN warranty INT;
```

3. **UIコンポーネントの更新**
- `ItemDetail.svelte`にフォームフィールドを追加
- 表示箇所（カード、リスト）に項目を追加

### 5.2 新しいフィルター条件の追加

1. **フィルター型の更新**
```javascript
// config.js のDEFAULTS.FILTERSに追加
manufacturer: null,
warrantyRange: { min: null, max: null }
```

2. **フィルタリングロジックの追加**
```javascript
// mockApi.js のapplyFiltersAndPagination関数に追加
if (params.manufacturer) {
  filtered = filtered.filter(item => 
    item.manufacturer === params.manufacturer
  );
}
```

3. **UIの更新**
- `ItemFilters.svelte`に新しいフィルターUIを追加

### 5.3 外部サービスとの連携

#### 画像CDNの利用
```javascript
// 本番環境でCDNを使用
const uploadImage = async (file) => {
  if (CONFIG.IS_MOCK_MODE) {
    return mockApi.files.upload(file);
  }
  // CloudinaryやS3へのアップロード
  return await uploadToCDN(file);
};
```

#### バーコードスキャン機能
```javascript
// 機能フラグで制御
if (FEATURES.BARCODE_SCAN) {
  // QuaggaJSやZXingを使用したスキャン機能
  const result = await scanBarcode();
  formData.barcode = result.code;
}
```

### 5.4 多言語対応

```javascript
// i18n設定
import { locale, t } from '$lib/i18n';

// 使用例
<label>{$t('product.name')}</label>
```

## 6. トラブルシューティング

### 6.1 よくある問題と解決方法

#### 画像が表示されない
- LocalStorageの容量制限（5-10MB）に注意
- Base64エンコードは容量を約33%増加させる
- 解決策: 画像の圧縮、外部ストレージの利用

#### リアクティビティが動作しない
- ストア更新時の参照変更を確認
- `{@const}`ではなく`$derived`を使用
- 開発者ツールでストアの値を確認

#### パフォーマンスの低下
- 大量データ時はページネーションを調整
- 不要な派生ストアの再計算を避ける
- 画像の遅延読み込みを実装

### 6.2 デバッグ方法

```javascript
// ストアの値を監視
$: console.log('Products updated:', $products);

// APIリクエストのログ
if (CONFIG.DEBUG) {
  console.log('API Request:', endpoint, params);
}
```

## 7. 本番環境への移行チェックリスト

- [ ] `CONFIG.IS_MOCK_MODE`を`false`に変更
- [ ] API エンドポイントの設定
- [ ] 認証・認可の実装
- [ ] エラーハンドリングの強化
- [ ] ロギング・モニタリングの設定
- [ ] バックアップ・リストア機能
- [ ] パフォーマンスチューニング
- [ ] セキュリティ監査

## 8. 今後の拡張可能性

### 8.1 推奨される機能追加
- 商品レビュー・評価機能
- 在庫アラート機能
- 一括インポート/エクスポート
- 商品バリエーション管理（サイズ、色）
- 関連商品・レコメンド機能
- 売上分析ダッシュボード

### 8.2 技術的な改善案
- GraphQL APIへの移行
- リアルタイム同期（WebSocket）
- PWA対応
- 国際化（i18n）
- A/Bテスト機能

## 9. 関連ドキュメント

このシステムを理解し、効率的に開発を進めるために、以下のドキュメントも併せて参照してください：

### 📚 AI駆動開発向けドキュメント

- **[AI-IMPLEMENTATION-GUIDE.md](./AI-IMPLEMENTATION-GUIDE.md)**
  - 詳細な実装例とコードサンプル集
  - パフォーマンス最適化テクニック
  - エラーハンドリングのベストプラクティス
  - 本番環境への移行ガイド

- **[AI-QUICK-REFERENCE.md](./AI-QUICK-REFERENCE.md)**
  - システムの30秒概要
  - カスタマイズ頻出パターン
  - 開発のコツとチェックリスト
  - パフォーマンス目安とトラブルシューティング

### 🗄️ 技術仕様書

- **[database-schema.sql](./database-schema.sql)**
  - 完全なデータベース設計書
  - テーブル定義とリレーション
  - インデックス戦略
  - トリガーとビューの定義

- **[config.js](./config.js)**
  - システム設定の一元管理
  - 機能フラグとバリデーションルール
  - 環境別設定値

### 🏗️ プロジェクト全体

- **[/CLAUDE.md](../../../CLAUDE.md)** 
  - プロジェクト全体の技術指針
  - Svelte 5 + DaisyUI v5の実装ガイドライン
  - 共通の開発ルールとベストプラクティス

- **[../CLAUDE.md](../CLAUDE.md)**
  - ビジネスアプリケーション実装集の全体計画
  - 各システムの比較
  - 共通実装方針

### 📖 読む順序の推奨

1. **初回理解**: `AI-QUICK-REFERENCE.md` → `README.md`（このファイル）
2. **実装開始**: `config.js` → `database-schema.sql` → `AI-IMPLEMENTATION-GUIDE.md`
3. **カスタマイズ**: `AI-IMPLEMENTATION-GUIDE.md` → プロジェクト全体の`CLAUDE.md`
4. **本番移行**: `README.md`の移行チェックリスト → `AI-IMPLEMENTATION-GUIDE.md`のセキュリティ章

### 💡 ドキュメント活用のヒント

- **AI開発者向け**: `AI-QUICK-REFERENCE.md`で概要を把握してから詳細を確認
- **人間開発者向け**: `README.md`から始めて、必要に応じて他を参照
- **データベース設計者向け**: `database-schema.sql`を最初に確認
- **プロジェクトマネージャー向け**: `../CLAUDE.md`で全体像を把握