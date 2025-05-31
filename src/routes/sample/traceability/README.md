# 工場向けトレーサビリティシステム

製造工程の可視化と品質管理を実現するトレーサビリティシステムのフロントエンド実装です。

## 🎯 概要

本システムは、工場の製造ラインにおける各工程の進捗状況をリアルタイムで追跡し、品質異常の早期発見と対応を支援します。SvelteKit v2 + DaisyUI v5を使用した、モダンで拡張性の高い設計となっています。

### 主な機能

- **バッチ管理**: 製造ロット単位での進捗追跡
- **工程可視化**: 横型タイムライン、縦型ステップ、ガントチャートによる多角的な表示
- **異常検知**: リアルタイムアラートと手動登録による品質管理
- **作業履歴**: 監査証跡としての詳細なログ記録
- **レスポンシブUI**: モバイル端末でも使用可能な適応的デザイン

## 📊 データベース設計

### テーブル構造

#### 1. batches（バッチマスタ）
製造ロットの基本情報を管理

```sql
CREATE TABLE batches (
  id VARCHAR(20) PRIMARY KEY,        -- バッチID (例: BATCH-2025-001)
  product_id VARCHAR(20) NOT NULL,   -- 製品ID
  product_name VARCHAR(100) NOT NULL, -- 製品名（非正規化）
  quantity INTEGER NOT NULL,         -- 製造数量
  unit VARCHAR(10) NOT NULL,         -- 単位
  customer VARCHAR(100) NOT NULL,    -- 顧客名
  order_number VARCHAR(50) NOT NULL, -- 注文番号
  status VARCHAR(20) NOT NULL,       -- ステータス
  priority VARCHAR(10) NOT NULL,     -- 優先度
  planned_start_date TIMESTAMP,      -- 予定開始日時
  planned_end_date TIMESTAMP,        -- 予定終了日時
  actual_start_date TIMESTAMP,       -- 実績開始日時
  actual_end_date TIMESTAMP,         -- 実績終了日時
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. process_steps（工程マスタ）
製品ごとの標準工程定義

```sql
CREATE TABLE process_steps (
  id VARCHAR(20) PRIMARY KEY,        -- 工程ID
  product_id VARCHAR(20) NOT NULL,   -- 製品ID
  sequence INTEGER NOT NULL,         -- 工程順序
  name VARCHAR(100) NOT NULL,        -- 工程名
  department VARCHAR(50) NOT NULL,   -- 担当部門
  equipment_id VARCHAR(20),          -- 使用設備ID
  duration INTEGER NOT NULL,         -- 標準作業時間（分）
  description TEXT,                  -- 工程説明
  quality_check_points JSON,         -- 品質チェックポイント
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. batch_progress（バッチ進捗）
リアルタイムの工程進捗管理

```sql
CREATE TABLE batch_progress (
  id VARCHAR(20) PRIMARY KEY,
  batch_id VARCHAR(20) NOT NULL,
  step_id VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  progress INTEGER DEFAULT 0,
  operator VARCHAR(50),
  operator_id VARCHAR(20),
  equipment_id VARCHAR(20),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (batch_id) REFERENCES batches(id),
  FOREIGN KEY (step_id) REFERENCES process_steps(id)
);
```

#### 4. alerts（異常・アラート）
品質異常の記録と管理

```sql
CREATE TABLE alerts (
  id VARCHAR(20) PRIMARY KEY,
  batch_id VARCHAR(20) NOT NULL,
  step_id VARCHAR(20),
  type VARCHAR(20) NOT NULL,
  severity VARCHAR(10) NOT NULL,
  description TEXT NOT NULL,
  value DECIMAL(10,2),
  unit VARCHAR(10),
  threshold DECIMAL(10,2),
  resolved BOOLEAN DEFAULT FALSE,
  action TEXT,
  resolved_by VARCHAR(50),
  resolved_by_id VARCHAR(20),
  resolved_at TIMESTAMP,
  is_manual BOOLEAN DEFAULT FALSE,
  registered_by VARCHAR(50),
  registered_by_id VARCHAR(20),
  timestamp TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  updated_by VARCHAR(50),
  updated_by_id VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (batch_id) REFERENCES batches(id),
  FOREIGN KEY (step_id) REFERENCES process_steps(id)
);
```

#### 5. work_logs（作業ログ）
全作業の監査証跡

```sql
CREATE TABLE work_logs (
  id VARCHAR(20) PRIMARY KEY,
  batch_id VARCHAR(20) NOT NULL,
  step_id VARCHAR(20),
  timestamp TIMESTAMP NOT NULL,
  type VARCHAR(20) NOT NULL,
  operator VARCHAR(50) NOT NULL,
  operator_id VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  metadata JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (batch_id) REFERENCES batches(id),
  FOREIGN KEY (step_id) REFERENCES process_steps(id)
);
```

## 🔌 API実装ガイド

### API構造

```typescript
// api/index.ts のuseMockをfalseに設定
const API_CONFIG = {
  useMock: false, // 本番環境では false
  baseUrl: process.env.API_BASE_URL || '/api',
  timeout: 30000,
};
```

### エンドポイント一覧

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/api/batches` | バッチ一覧取得 |
| GET | `/api/batches/:id` | バッチ詳細取得 |
| PATCH | `/api/batches/:id` | バッチ情報更新 |
| GET | `/api/products/:id/process-steps` | 工程定義取得 |
| GET | `/api/batches/:id/progress` | 進捗サマリ取得 |
| PATCH | `/api/batches/:id/progress/:stepId` | 進捗更新 |
| GET | `/api/batches/:id/alerts` | アラート一覧取得 |
| POST | `/api/alerts` | アラート登録 |
| PATCH | `/api/alerts/:id` | アラート更新 |
| POST | `/api/alerts/:id/resolve` | アラート解決 |
| GET | `/api/batches/:id/logs` | 作業ログ取得 |
| POST | `/api/work-logs` | ログ登録 |

### WebSocket連携

リアルタイム更新用のWebSocket接続例：

```javascript
// サーバー側実装例（Node.js + ws）
wss.on('connection', (ws, req) => {
  const batchId = req.url.match(/\/ws\/batches\/(.+)/)[1];
  
  // 進捗更新イベント
  ws.send(JSON.stringify({
    event: 'progress-update',
    payload: { batchId, stepId, progress: 75 }
  }));
  
  // アラート発生イベント
  ws.send(JSON.stringify({
    event: 'alert-created',
    payload: { batchId, alert: {...} }
  }));
});
```

## 🎨 コンポーネントカスタマイズ

### カラーテーマの変更

DaisyUIのテーマシステムを使用：

```javascript
// tailwind.config.js
module.exports = {
  daisyui: {
    themes: [
      {
        factory: {
          "primary": "#2563eb",
          "secondary": "#7c3aed",
          "accent": "#f59e0b",
          "neutral": "#374151",
          "base-100": "#ffffff",
          // カスタムカラー定義
        },
      },
    ],
  },
};
```

### コンポーネント拡張例

#### 新しい表示形式の追加

```svelte
<!-- src/routes/sample/traceability/SankeyDiagram.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  
  let { processSteps, progress } = $props();
  
  // サンキーダイアグラムの実装
</script>
```

#### カスタムアラートタイプ

```typescript
// constants.ts に追加
export const CUSTOM_ALERT_TYPES = {
  HUMIDITY: 'humidity',
  DUST: 'dust',
  NOISE: 'noise',
} as const;
```

## 🚀 本番環境への移行チェックリスト

### 1. API接続設定
- [ ] 環境変数の設定（.env）
- [ ] CORSポリシーの確認
- [ ] 認証トークンの実装
- [ ] エラーハンドリングの強化

### 2. セキュリティ
- [ ] XSS対策の確認
- [ ] CSRF対策の実装
- [ ] 入力値バリデーション
- [ ] SQLインジェクション対策

### 3. パフォーマンス
- [ ] ページネーションの実装
- [ ] 画像最適化
- [ ] キャッシュ戦略
- [ ] WebSocket再接続ロジック

### 4. 監視・ログ
- [ ] エラーログ収集
- [ ] パフォーマンス監視
- [ ] ユーザー行動分析
- [ ] アラート通知設定

## 📚 開発ヒント

### よくある実装パターン

#### 1. カスタムフィルター追加
```typescript
// 期間フィルターの例
const filteredBatches = $derived(
  batches.filter(batch => {
    const date = new Date(batch.startDate);
    return date >= startDate && date <= endDate;
  })
);
```

#### 2. リアルタイム更新の最適化
```typescript
// デバウンス処理
import { debounce } from 'lodash-es';

const updateProgress = debounce(async (data) => {
  await apiClient.updateProgress(batchId, stepId, data);
}, 500);
```

#### 3. 権限管理の実装
```typescript
// ロールベースアクセス制御
const canEditAlert = $derived(
  user.role === 'supervisor' || 
  user.role === 'quality_manager'
);
```

### トラブルシューティング

| 問題 | 原因 | 解決方法 |
|-----|------|---------|
| データが更新されない | リアクティビティの欠如 | $state, $derived の使用確認 |
| APIエラー | CORS, 認証 | ヘッダー設定の確認 |
| パフォーマンス低下 | 大量データ | 仮想スクロール実装 |
| レイアウト崩れ | CSS競合 | DaisyUIクラスの確認 |

## 🔗 関連ドキュメント

- [SvelteKit公式ドキュメント](https://kit.svelte.dev/)
- [DaisyUI v5](https://daisyui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- プロジェクト全体のCLAUDE.md

## 📝 ライセンス

本サンプルコードは社内利用を前提としています。外部公開時は適切なライセンスを設定してください。