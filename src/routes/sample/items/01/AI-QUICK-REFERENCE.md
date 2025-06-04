# ECサイト商品管理システム - AI開発クイックリファレンス

## 🎯 このシステムを30秒で理解する

**何を作ったか**: ECサイトの商品マスターデータを管理するCRUDシステム  
**対象規模**: 小〜中規模ECサイト（商品数1,000〜10,000点）  
**技術**: Svelte 5 + SvelteKit + DaisyUI 5 + TypeScript  
**データ**: モックモード（LocalStorage）/ 本番モード（REST API）切り替え可能

## 🏗️ アーキテクチャ概要

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   UI層      │ ──▶ │  ストア層    │ ──▶ │   API層     │
│ (Svelte)    │     │ (Stores)    │     │ (Client)    │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                         ┌─────┴─────┐
                                         ▼           ▼
                                    ┌─────────┐ ┌─────────┐
                                    │ MockAPI │ │ REST API│
                                    └─────────┘ └─────────┘
```

## 📁 重要ファイル一覧

| ファイル | 役割 | 変更頻度 |
|---------|------|----------|
| `config.js` | 設定管理（モード切替、定数） | 低 |
| `api/client.js` | API通信の抽象化層 | 低 |
| `stores/itemStore.js` | 商品データの状態管理 | 中 |
| `ItemDetail.svelte` | 商品編集フォーム | 高 |
| `database-schema.sql` | DB設計書 | 低 |

## 🔧 カスタマイズ頻出パターン

### 1. 新しいフィールドを追加したい
```bash
1. types.ts に型定義追加
2. database-schema.sql にカラム追加
3. ItemDetail.svelte にフォーム追加
4. mockData.js にサンプルデータ追加
```

### 2. 新しいフィルター条件を追加したい
```bash
1. config.js のDEFAULTS.FILTERSに追加
2. mockApi.js のapplyFiltersAndPaginationに処理追加
3. ItemFilters.svelte にUI追加
```

### 3. API エンドポイントを追加したい
```bash
1. api/client.js に新メソッド追加
2. api/mockApi.js にモック実装追加
3. ストアから呼び出し
```

## 💡 実装のコツ

### DO ✅
- ストア更新時は必ず新しいオブジェクトを返す（イミュータブル）
- 設定値は`config.js`に集約
- エラーは`try-catch`で統一的に処理
- 派生ストア（`derived`）で重い計算を効率化

### DON'T ❌
- `$:`リアクティブ構文を使わない（Svelte 5では`$derived`）
- ストア内で直接配列を変更しない（`push`、`splice`など）
- ハードコードされた値を埋め込まない
- 同期的なAPIコールを書かない

## 🚀 開発開始手順

```bash
# 1. 依存関係インストール
pnpm install

# 2. 開発サーバー起動
pnpm run dev

# 3. アクセス
http://localhost:5173/sample/items/01
```

## 🔄 モック→本番移行チェックリスト

- [ ] `config.js`の`IS_MOCK_MODE`を`false`に
- [ ] 環境変数`VITE_API_BASE_URL`を設定
- [ ] `api/client.js`の本番API実装部分をアンコメント
- [ ] 認証ヘッダーの追加
- [ ] エラーハンドリングの調整

## 📊 パフォーマンス目安

| 項目 | 推奨値 | 現在の実装 |
|-----|--------|-----------|
| 初期表示 | < 1秒 | ✅ 対応済 |
| 検索レスポンス | < 300ms | ✅ デバウンス対応 |
| 最大商品数（快適） | 1,000件 | ⚠️ 要仮想スクロール |
| 最大商品数（動作） | 10,000件 | ⚠️ 要最適化 |

## 🔗 関連ドキュメント

- **詳細設計**: [README.md](./README.md)
- **実装ガイド**: [AI-IMPLEMENTATION-GUIDE.md](./AI-IMPLEMENTATION-GUIDE.md)  
- **DB設計**: [database-schema.sql](./database-schema.sql)
- **プロジェクト全体**: [/CLAUDE.md](/CLAUDE.md)

---

💬 **AI向けヒント**: このシステムをベースに新機能を実装する場合は、まず`config.js`で機能フラグを定義し、モックAPIから実装を始めることを推奨します。