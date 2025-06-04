# カスタマーサクセスダッシュボード - 開発ガイド

## 概要

このダッシュボードは、企業のカスタマーサクセス部門向けに設計された包括的な顧客管理・分析システムです。顧客満足度、エンゲージメント、サポート状況、収益性など、カスタマーサクセスに必要な全ての情報を統合的に可視化します。

## 🎯 主要機能

### コアメトリクス

- **顧客満足度指標**: NPS、CSAT、CESの追跡と分析
- **顧客健全性スコア**: AIベースの健全性評価
- **チャーン分析**: 解約リスクの予測と対策
- **収益・維持率**: LTV、MRR、顧客維持率の管理

### インタラクティブ機能

- **リアルタイム更新**: 自動データ更新とアラート
- **セグメント分析**: 顧客セグメント別の詳細分析
- **期間フィルタ**: 柔軟な時系列分析
- **エクスポート機能**: レポート生成とデータ出力

### 管理機能

- **サポートチケット管理**: チケット状況の一元管理
- **エンゲージメント追跡**: 機能使用状況のヒートマップ
- **アラート・通知**: 重要指標の変動通知

## 🏗️ アーキテクチャ設計

### データフロー

```
[フロントエンド UI]
        ↓
[データサービス層] ← 統一インターフェース
      ↙       ↘
[モックサービス] [本番APIサービス]
        ↓            ↓
[静的データ]    [RDBクエリ]
```

### コンポーネント構成

```
src/routes/sample/dashboards/03/
├── +page.svelte              # メインダッシュボード
├── config.js                 # 設定・フィーチャーフラグ
├── services/
│   ├── dataService.js        # データ抽象化レイヤー
│   ├── mockDataService.js    # モックデータ提供
│   └── apiService.js         # 本番API通信
└── components/
    ├── CustomerMetrics.svelte    # 顧客メトリクス表示
    ├── SatisfactionTrends.svelte # 満足度推移グラフ
    ├── ChurnAnalysis.svelte      # チャーン分析
    ├── CustomerHealth.svelte     # 顧客健全性表示
    ├── SupportTickets.svelte     # サポートチケット管理
    ├── RevenueRetention.svelte   # 収益・維持率分析
    └── EngagementHeatmap.svelte  # エンゲージメント可視化
```

## 📊 データベース設計

### テーブル定義

#### customers (顧客マスター)

```sql
CREATE TABLE customers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_name VARCHAR(255) NOT NULL,
  segment ENUM('enterprise', 'business', 'starter') NOT NULL,
  subscription_start DATE NOT NULL,
  subscription_plan VARCHAR(100),
  monthly_revenue DECIMAL(10,2),
  health_score TINYINT UNSIGNED CHECK (health_score <= 100),
  status ENUM('active', 'churned', 'at_risk') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_segment (segment),
  INDEX idx_health_score (health_score),
  INDEX idx_subscription_start (subscription_start)
);
```

#### customer_satisfaction (顧客満足度)

```sql
CREATE TABLE customer_satisfaction (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  nps_score TINYINT CHECK (nps_score BETWEEN -100 AND 100),
  csat_score TINYINT CHECK (csat_score BETWEEN 0 AND 100),
  ces_score DECIMAL(3,1) CHECK (ces_score BETWEEN 1.0 AND 7.0),
  survey_date DATE NOT NULL,
  feedback_text TEXT,
  survey_type ENUM('nps', 'csat', 'ces', 'combined') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_customer_survey (customer_id, survey_date),
  INDEX idx_survey_date (survey_date)
);
```

#### support_tickets (サポートチケット)

```sql
CREATE TABLE support_tickets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  priority ENUM('low', 'medium', 'high', 'critical') NOT NULL,
  status ENUM('open', 'in_progress', 'resolved', 'closed', 'escalated') NOT NULL,
  category ENUM('technical', 'billing', 'feature_request', 'general') NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  assignee_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  sla_target_hours TINYINT UNSIGNED,

  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_customer_tickets (customer_id, created_at),
  INDEX idx_status_priority (status, priority),
  INDEX idx_sla_tracking (created_at, resolved_at, sla_target_hours)
);
```

#### customer_engagement (エンゲージメントログ)

```sql
CREATE TABLE customer_engagement (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  feature_category VARCHAR(100) NOT NULL,
  engagement_score TINYINT UNSIGNED CHECK (engagement_score <= 100),
  last_login TIMESTAMP,
  feature_usage_count INT UNSIGNED DEFAULT 0,
  session_duration_minutes INT UNSIGNED DEFAULT 0,
  recorded_at DATE NOT NULL,

  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  UNIQUE KEY uk_customer_feature_date (customer_id, feature_category, recorded_at),
  INDEX idx_engagement_date (recorded_at, engagement_score)
);
```

#### revenue_retention (収益・維持率)

```sql
CREATE TABLE revenue_retention (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  mrr DECIMAL(10,2) NOT NULL COMMENT 'Monthly Recurring Revenue',
  churn_risk_score TINYINT UNSIGNED CHECK (churn_risk_score <= 100),
  ltv DECIMAL(12,2) COMMENT 'Life Time Value',
  retention_status ENUM('retained', 'churned', 'at_risk') NOT NULL,
  expansion_revenue DECIMAL(10,2) DEFAULT 0,

  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_customer_period (customer_id, period_start),
  INDEX idx_retention_metrics (period_start, retention_status, mrr)
);
```

### パフォーマンス最適化

#### 推奨インデックス戦略

```sql
-- 複合インデックス（頻繁なクエリパターン用）
CREATE INDEX idx_customers_segment_health ON customers(segment, health_score, subscription_start);
CREATE INDEX idx_satisfaction_customer_date ON customer_satisfaction(customer_id, survey_date, nps_score);
CREATE INDEX idx_tickets_customer_status ON support_tickets(customer_id, status, priority, created_at);

-- 集計クエリ用インデックス
CREATE INDEX idx_engagement_analytics ON customer_engagement(recorded_at, feature_category, engagement_score);
CREATE INDEX idx_revenue_analytics ON revenue_retention(period_start, retention_status, mrr);
```

#### キャッシュ戦略

- **Redis**: リアルタイムメトリクスのキャッシュ（1-5分更新）
- **CDN**: 静的レポートファイルの配信
- **アプリケーションレベル**: セグメント別集計結果の一時保存

## ⚙️ 設定・カスタマイズ

### フィーチャーフラグ

```javascript
// config.js - フィーチャーフラグの設定例
export const featureFlags = {
	// モック専用機能（本番では自動的に無効化）
	SHOW_EXPORT_BUTTON: { enabled: true, mockModeOnly: true },
	SHOW_DEMO_ALERTS: { enabled: true, mockModeOnly: true },
	SHOW_SAMPLE_DATA_BANNER: { enabled: true, mockModeOnly: true },

	// 本番・モック共通機能
	SHOW_ADVANCED_ANALYTICS: { enabled: true, mockModeOnly: false },
	ENABLE_REAL_TIME_UPDATES: { enabled: false, mockModeOnly: false },

	// 将来実装予定
	ENABLE_PREDICTIVE_ANALYTICS: { enabled: false, mockModeOnly: false }
};

// ヘルパー関数での使用
if (isFeatureEnabled('SHOW_EXPORT_BUTTON')) {
	// エクスポート機能を表示
}
```

### 閾値・目標値の調整

```javascript
// config.js - ビジネス要件に応じてカスタマイズ
export const config = {
	// 顧客健全性の判定基準
	HEALTH_SCORE_THRESHOLDS: {
		EXCELLENT: 90, // 優良顧客
		GOOD: 75, // 健全
		AT_RISK: 50, // 要注意
		CRITICAL: 30 // 危険
	},

	// 満足度の目標値
	SATISFACTION_CONFIG: {
		TARGET_NPS: 70, // NPS目標値
		TARGET_CSAT: 85, // CSAT目標値
		TARGET_CES: 3.0 // CES目標値
	},

	// SLA設定
	SUPPORT_TICKET_CONFIG: {
		SLA_TARGETS: {
			critical: 2, // 2時間以内
			high: 8, // 8時間以内
			medium: 24, // 24時間以内
			low: 72 // 72時間以内
		}
	}
};
```

### API エンドポイントの設定

```javascript
// config.js - 本番環境のAPI設定
export const config = {
	API_ENDPOINTS: {
		CUSTOMERS: '/api/v1/customers',
		SATISFACTION: '/api/v1/satisfaction',
		CHURN_ANALYSIS: '/api/v1/analytics/churn',
		CUSTOMER_HEALTH: '/api/v1/customers/health',
		SUPPORT_TICKETS: '/api/v1/support/tickets',
		REVENUE_RETENTION: '/api/v1/analytics/revenue',
		ENGAGEMENT: '/api/v1/engagement',
		METRICS: '/api/v1/metrics/customer'
	}
};
```

## 🚀 実装ガイド

### モック開発からプロダクション移行

#### Step 1: 開発環境セットアップ

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動（モックモード）
pnpm run dev
```

#### Step 2: API実装

```javascript
// services/apiService.js に実際のAPI呼び出しを実装

export async function getCustomerMetrics(segment, dateRange) {
	// 実際のSQL実行例
	const query = `
    SELECT 
      COUNT(*) as total_customers,
      AVG(health_score) as avg_health_score,
      SUM(monthly_revenue) as total_revenue
    FROM customers 
    WHERE segment = ? AND subscription_start >= ?
  `;

	const result = await db.query(query, [segment, getDateFilter(dateRange)]);
	return transformMetricsData(result);
}
```

#### Step 3: 本番環境切り替え

```javascript
// config.js
export const config = {
	USE_MOCK_DATA: false, // 本番環境ではfalseに設定
	API_ENDPOINTS: {
		// 本番APIエンドポイントを設定
	}
};
```

### コンポーネントカスタマイズ

#### メトリクス追加

```javascript
// CustomerMetrics.svelte - 新しいメトリクスの追加
const baseMetrics = [
	// 既存メトリクス...
	{
		title: '新しい指標',
		baseValue: '100',
		change: '+5%',
		trend: 'up',
		icon: 'custom',
		color: 'info'
	}
];
```

#### 新しいビューモードの追加

```javascript
// +page.svelte - ビューモード拡張
let viewModes = ['overview', 'analytics', 'support', 'engagement', 'custom'];

// 新しいビューのコンテンツ
{#if viewMode === 'custom'}
  <CustomAnalysisComponent {segment} {dateRange} />
{/if}
```

### リアルタイム更新の実装

```javascript
// WebSocket接続例
import { io } from 'socket.io-client';

const socket = io('/customer-success');

socket.on('metrics-update', (data) => {
	// リアルタイムでメトリクスを更新
	updateDashboardMetrics(data);
});

socket.on('alert', (alert) => {
	// 重要なアラートを表示
	showAlert(alert);
});
```

## 📈 パフォーマンス最適化

### フロントエンド最適化

#### 1. レイジーローディング

```javascript
// 重いコンポーネントの遅延読み込み
const LazyEngagementHeatmap = lazy(() => import('./EngagementHeatmap.svelte'));
```

#### 2. データキャッシュ

```javascript
// Svelteストアでのキャッシュ実装
import { writable, derived } from 'svelte/store';

const metricsCache = writable(new Map());
const cachedMetrics = derived(metricsCache, ($cache) => $cache.get(`${segment}-${dateRange}`));
```

#### 3. 仮想化

```javascript
// 大量データの仮想スクロール実装
import { FixedSizeList as VirtualList } from 'svelte-window';

// 1000件以上のチケット表示時
{#if tickets.length > 1000}
  <VirtualList items={tickets} itemHeight={60}>
    <TicketRow slot="item" let:item={ticket} />
  </VirtualList>
{/if}
```

### バックエンド最適化

#### 1. クエリ最適化

```sql
-- 効率的な集計クエリ
SELECT
  c.segment,
  COUNT(*) as total_customers,
  AVG(c.health_score) as avg_health,
  SUM(rr.mrr) as total_revenue
FROM customers c
LEFT JOIN revenue_retention rr ON c.id = rr.customer_id
  AND rr.period_start = LAST_DAY(CURDATE()) + INTERVAL 1 DAY - INTERVAL 1 MONTH
WHERE c.subscription_start >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
GROUP BY c.segment;
```

#### 2. 並列処理

```javascript
// 複数データソースの並列取得
export async function getDashboardData(segment, dateRange) {
	const [metrics, satisfaction, churn, health] = await Promise.all([
		getCustomerMetrics(segment, dateRange),
		getSatisfactionTrends(segment, dateRange),
		getChurnAnalysis(segment, dateRange),
		getCustomerHealth(segment, dateRange)
	]);

	return { metrics, satisfaction, churn, health };
}
```

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. データ表示が更新されない

**原因**: Svelte 5のリアクティビティは参照の変更を検知

```javascript
// ❌ 間違い
data.push(newItem);

// ✅ 正しい
data = [...data, newItem];
```

#### 2. フィーチャーフラグが効かない

**原因**: 設定の読み込みタイミング

```javascript
// ❌ 直接参照
{#if featureFlags.SHOW_EXPORT_BUTTON}

// ✅ ヘルパー関数使用
{#if isFeatureEnabled('SHOW_EXPORT_BUTTON')}
```

#### 3. パフォーマンス低下

**対策**:

- `$derived`の適切な使用
- 重い計算処理の`$derived.by()`への移行
- 不要な再計算の防止

#### 4. API接続エラー

**デバッグ手順**:

1. `config.USE_MOCK_DATA`の設定確認
2. APIエンドポイントのURL検証
3. ネットワークタブでのレスポンス確認
4. CORS設定の確認

### ログとモニタリング

```javascript
// services/apiService.js - ログ実装例
const logger = {
	api: (method, url, response) => {
		console.log(`[API] ${method} ${url}`, {
			status: response.status,
			timestamp: new Date().toISOString()
		});
	},
	error: (error, context) => {
		console.error(`[ERROR] ${context}`, error);
		// 本番環境では外部ログサービスに送信
	}
};
```

## 🎨 UI/UXカスタマイズ

### DaisyUI v5対応

#### テーマカスタマイズ

```javascript
// tailwind.config.js
module.exports = {
	daisyui: {
		themes: [
			{
				'customer-success': {
					primary: '#3b82f6',
					secondary: '#8b5cf6',
					success: '#22c55e',
					warning: '#f59e0b',
					error: '#ef4444'
				}
			}
		]
	}
};
```

#### レスポンシブデザイン

```html
<!-- モバイル最適化の例 -->
<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
	<!-- カード要素 -->
</div>

<!-- タブレット・デスクトップでの表示切り替え -->
<div class="hidden lg:block">
	<!-- デスクトップ用詳細表示 -->
</div>
<div class="lg:hidden">
	<!-- モバイル用簡略表示 -->
</div>
```

### アクセシビリティ

```html
<!-- 適切なARIAラベル -->
<button
	class="btn btn-primary"
	aria-label="顧客データをエクスポート"
	aria-describedby="export-description"
>
	エクスポート
</button>
<div id="export-description" class="sr-only">
	現在のフィルタ条件でデータをCSV形式でダウンロードします
</div>

<!-- キーボードナビゲーション -->
<div role="tablist" aria-label="ダッシュボードビュー切り替え">
	<button
		role="tab"
		aria-selected="{viewMode"
		=""
		=""
		="overview"
		}
		tabindex="{viewMode"
		=""
		=""
		="overview"
		?
		0
		:
		-1}
	>
		概要
	</button>
</div>
```

## 📚 追加リソース

### 関連ドキュメント

- [SvelteKit 2.x ドキュメント](https://kit.svelte.dev/)
- [Svelte 5 Runes ガイド](https://svelte.dev/docs/svelte/what-are-runes)
- [DaisyUI v5 コンポーネント](https://daisyui.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)

### 参考実装

- `src/routes/sample/dashboards/02/` - プロジェクト管理ダッシュボード
- `src/routes/sample/chat/` - リアルタイム通信の実装例
- `src/lib/components/` - 再利用可能コンポーネント

### コミュニティ

- GitHub Issues: バグ報告・機能要望
- Discussion: 実装に関する質問・提案

---

## 🤖 AI開発者向けガイド

### コード生成のベストプラクティス

#### 1. プロンプト例

```
このカスタマーサクセスダッシュボードに新しい機能を追加してください：

要件：
- 顧客の行動予測機能
- 機械学習による解約リスク予測
- Svelte 5のrunes構文使用
- DaisyUI v5コンポーネント使用
- モック/本番データ切り替え対応

参考実装：src/routes/sample/dashboards/03/
```

#### 2. 段階的実装

- **段階1**: モックデータでのUI実装
- **段階2**: データサービス層の追加
- **段階3**: 本番API連携
- **段階4**: パフォーマンス最適化

#### 3. 検証ポイント

- フィーチャーフラグの適切な使用
- Svelte 5構文の正確性
- DaisyUI v5互換性
- レスポンシブデザイン

このガイドを参考に、効率的で保守性の高いカスタマーサクセスダッシュボードを構築してください。
