# AI統合管理ダッシュボード (Dashboard 06)

## 概要

Dashboard 06は、AI技術を活用した統合管理システムのリファレンス実装です。自然言語処理、異常検知、予測分析、自動化ワークフローなど、現代的な企業管理システムに必要な機能を包括的に提供します。

## 🎯 主要機能

### 1. インテリジェントダッシュボード

- **KPIメトリクス**: 収益、効率性、顧客満足度、自動化率の可視化
- **システム統合ステータス**: 複数システム（ERP、CRM、HRM、SCM、BI、IoT）の接続状態監視
- **リアルタイムトレンド**: パフォーマンスデータの時系列可視化
- **AIインサイト**: 自動生成される業務改善提案

### 2. AIアシスタント

- **自然言語チャット**: 日本語による対話型クエリ処理
- **音声認識対応**: 音声入力による操作（モック実装）
- **クイックアクション**: よく使用される質問へのワンクリックアクセス
- **コンテキスト理解**: セッション情報を考慮した応答生成

### 3. 異常検知と予測分析

- **リアルタイム異常検知**: 複数アルゴリズムによる自動検知
- **予測分析**: 機械学習による将来の異常予測
- **自動修復**: 設定に応じた自動対応機能
- **アラートタイムライン**: 異常スコアの時系列可視化

### 4. 自動化ワークフロー

- **ワークフロー管理**: 複数トリガータイプ（時間、イベント、閾値、AI提案）
- **ステップ管理**: ドラッグ&ドロップ風のワークフロービルダー（モック）
- **実行履歴**: 詳細な実行ログと統計情報
- **パフォーマンス監視**: 成功率、平均実行時間の追跡

## 🗄️ データベース設計

### 主要テーブル構造

#### 1. systems テーブル

```sql
-- システム統合管理
CREATE TABLE systems (
    id VARCHAR(20) PRIMARY KEY,           -- システムID（例: sys_erp_001）
    name VARCHAR(100) NOT NULL,           -- システム名
    type ENUM('ERP','CRM','HRM','SCM','BI','IoT') NOT NULL,
    status ENUM('connected','warning','disconnected') DEFAULT 'disconnected',
    endpoint VARCHAR(255),                -- API エンドポイント
    icon VARCHAR(10),                     -- 表示用アイコン
    baseline_latency INT DEFAULT 100,     -- 基準レイテンシ(ms)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_type (type),
    INDEX idx_status (status)
);
```

#### 2. metrics テーブル

```sql
-- パフォーマンスメトリクス
CREATE TABLE metrics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    system_id VARCHAR(20),
    metric_type ENUM('cpu_usage','memory_usage','response_time','throughput','error_rate') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (system_id) REFERENCES systems(id),
    INDEX idx_system_type_time (system_id, metric_type, timestamp),
    INDEX idx_timestamp (timestamp)
);
```

#### 3. insights テーブル

```sql
-- AIインサイト
CREATE TABLE insights (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id TINYINT NOT NULL,         -- カテゴリID（1-5）
    category ENUM('OPERATIONAL','FINANCIAL','CUSTOMER','EMPLOYEE','STRATEGIC') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority TINYINT NOT NULL,            -- 1=高, 2=中, 3=低
    confidence DECIMAL(3,2),              -- 信頼度 0.00-1.00
    actionable BOOLEAN DEFAULT FALSE,
    impact TEXT,
    algorithm VARCHAR(100),
    data_sources JSON,                    -- 使用データソース配列
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_category_priority (category, priority),
    INDEX idx_confidence (confidence),
    INDEX idx_created_at (created_at)
);
```

#### 4. anomalies テーブル

```sql
-- 異常検知データ
CREATE TABLE anomalies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    severity ENUM('critical','warning','info') NOT NULL,
    metric_id BIGINT,
    score DECIMAL(4,2) NOT NULL,
    current_value DECIMAL(15,2) NOT NULL,
    expected_value DECIMAL(15,2) NOT NULL,
    deviation VARCHAR(20),                -- 偏差率（例: +196%）
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    algorithm VARCHAR(100),
    confidence DECIMAL(3,2),
    description TEXT,
    recommendation TEXT,
    auto_remediation_available BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (metric_id) REFERENCES metrics(id),
    INDEX idx_severity_detected (severity, detected_at),
    INDEX idx_type_score (type, score),
    INDEX idx_detected_at (detected_at)
);
```

#### 5. workflows テーブル

```sql
-- ワークフロー定義
CREATE TABLE workflows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    trigger_type ENUM('TIME_BASED','EVENT_BASED','THRESHOLD_BASED','AI_SUGGESTED') NOT NULL,
    trigger_config JSON,                  -- トリガー設定
    steps JSON,                          -- ステップ定義配列
    status ENUM('active','paused','error') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_status (status),
    INDEX idx_trigger_type (trigger_type)
);
```

#### 6. workflow_executions テーブル

```sql
-- ワークフロー実行履歴
CREATE TABLE workflow_executions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workflow_id INT NOT NULL,
    status ENUM('running','success','failed','cancelled') NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    duration_ms INT,
    steps_completed INT DEFAULT 0,
    total_steps INT NOT NULL,
    error_message TEXT,
    execution_logs JSON,

    FOREIGN KEY (workflow_id) REFERENCES workflows(id),
    INDEX idx_workflow_status (workflow_id, status),
    INDEX idx_start_time (start_time)
);
```

## 🚀 導入・カスタマイズガイド

### 1. 基本設定

#### モックモードの切り替え

```javascript
// config.js
export const config = {
	USE_MOCK_MODE: true // false で本番モードに切り替え
	// ...
};
```

#### フィーチャーフラグの設定

```javascript
export const featureFlags = {
	ENABLE_AI_ASSISTANT: { enabled: true, dependencies: ['MOCK_MODE'] },
	ENABLE_ANOMALY_DETECTION: { enabled: true, dependencies: [] },
	ENABLE_AUTO_INSIGHTS: { enabled: true, dependencies: ['AI_ASSISTANT'] },
	ENABLE_WORKFLOW_AUTOMATION: { enabled: true, dependencies: [] }
};
```

### 2. API統合

#### 本番環境での API エンドポイント設定

```javascript
// config.js
export const config = {
	API_ENDPOINTS: {
		INTEGRATION: '/api/v1/systems',
		METRICS: '/api/v1/metrics',
		AI_ASSISTANT: '/api/v1/ai/chat',
		AI_INSIGHTS: '/api/v1/ai/insights',
		AI_PREDICTIONS: '/api/v1/ai/predictions',
		AI_ANOMALIES: '/api/v1/anomalies',
		AUTOMATION: '/api/v1/workflows',
		REPORTS: '/api/v1/reports'
	}
};
```

#### API 通信の実装例

```javascript
// dataService.js の関数を参考に実装
// 各関数は既にエラーハンドリングとリトライ機能を含んでいます

export async function getSystemStatus() {
	if (config.USE_MOCK_MODE) {
		return mockDataService.getSystemStatus();
	}

	// 本番実装
	return await apiCall(config.API_ENDPOINTS.INTEGRATION, {
		method: 'GET',
		timeout: config.API_TIMEOUTS.DEFAULT
	});
}
```

### 3. UI カスタマイズ

#### テーマ設定

- DaisyUI v5 のテーマシステムを使用
- カスタムカラーは使用せず、セマンティックカラーを活用
- `primary`, `secondary`, `success`, `warning`, `error`, `info` を使用

#### グラデーション設定

```javascript
// config.js
export const uiConfig = {
	GRADIENTS: {
		AI_ASSISTANT: 'from-primary to-secondary',
		ANOMALY_TIMELINE: 'from-warning to-error',
		WORKFLOW_PROGRESS: 'from-info to-success'
	}
};
```

### 4. 機能拡張のポイント

#### 新しいメトリクスの追加

1. `config.js` の `SUPPORTED_METRICS` に追加
2. `mockDataService.js` でモックデータ生成ロジックを追加
3. 対応するコンポーネントで表示ロジックを実装

#### 新しい異常検知アルゴリズムの追加

1. `config.js` の `ANOMALY_DETECTION.ALGORITHMS` に追加
2. アルゴリズム固有の設定を `ALGORITHM_CONFIGS` に追加
3. `mockDataService.js` でアルゴリズム対応のモックデータを生成

#### ワークフロータイプの拡張

1. `actionTemplates` に新しいアクションタイプを追加
2. `executeAutomation` 関数で実行ロジックを実装
3. UI コンポーネントで対応する表示を追加

## 🔧 開発のヒントとTips

### 1. Svelte 5 runes 使用時の注意点

- ストアの更新は必ず新しい参照を返す（イミュータブル更新）
- `$derived` を使用してリアクティブな派生値を作成
- 関数内では `get()` を使用してストア値を取得

### 2. DaisyUI v5 活用法

- `bg-base-100/200/300` でテーマ対応の背景色
- `stats` コンポーネントでKPI表示
- `badge` コンポーネントで状態表示
- `card` + `card-body` で統一感のあるパネル作成

### 3. パフォーマンス最適化

- 大きなデータセットは仮想スクロールを検討
- リアルタイム更新は適切な間隔（30秒〜2分）で設定
- 重い計算は Web Workers での実行を検討

### 4. エラーハンドリング

- API エラーは `dataService.js` で統一的に処理
- ユーザーへの通知は `showNotification` 関数を使用
- 重要なエラーは自動削除しない設定

### 5. テスト戦略

- モックモードでの機能テスト
- API エンドポイントの単体テスト
- UIコンポーネントの視覚的回帰テスト
- パフォーマンステスト（メトリクス更新頻度）

## 📁 関連ドキュメント

- [CLAUDE.md](./CLAUDE.md) - 開発ガイドライン詳細
- [config.js](./config.js) - 設定ファイル（詳細コメント付き）
- [services/README.md](./services/README.md) - API サービス層の詳細

## 🤖 AI駆動開発での活用

このダッシュボードは AI 駆動開発を念頭に設計されています：

1. **明確な設定分離**: 機能の有効/無効、モック/本番の切り替えが容易
2. **包括的なコメント**: RDB設計、API仕様、実装意図を詳細記載
3. **モジュラー設計**: 機能単位での独立性を保持
4. **拡張性**: 新機能追加時の影響を最小化

AIツールを使用して類似機能を開発する際は、このREADMEと設定ファイルを参考に、要件に応じてカスタマイズしてください。
