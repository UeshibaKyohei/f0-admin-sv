# 経営管理ダッシュボード - AI駆動開発ガイド

## 概要

企業の経営層向けに設計された包括的なダッシュボード。リアルタイムKPI監視、売上分析、部門別パフォーマンス追跡、財務状況の可視化を提供します。

### 主要機能

1. **KPIメトリクス表示**

   - 売上高、利益率、顧客数、顧客単価の主要4指標
   - スパークラインによるトレンド表示
   - 前期比較による変化率表示
   - リアルタイム更新（設定可能な間隔）

2. **売上・利益分析**

   - 期間別（日次/月次/四半期）の売上推移
   - 実績・目標・前年同期の比較表示
   - インタラクティブな棒グラフ・折れ線グラフ

3. **アクティビティフィード**

   - 重要イベントのリアルタイム通知
   - 優先度別の色分け表示
   - 自動更新とスクロール可能なリスト

4. **部門別パフォーマンス**

   - 各部門の目標達成率表示
   - プログレスバーによる視覚化
   - トレンドインジケーター

5. **財務サマリー**
   - P/L主要項目の実績vs予算比較
   - 差異分析と進捗表示
   - 期間別の表示切り替え

## データベース設計

### テーブル構造

```sql
-- KPIメトリクステーブル
CREATE TABLE kpi_metrics (
    metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type VARCHAR(50) NOT NULL, -- revenue, profit_rate, customers, unit_price
    value DECIMAL(15,2) NOT NULL,
    unit VARCHAR(10), -- M, %, null
    change_percentage DECIMAL(5,2),
    trend VARCHAR(10) CHECK (trend IN ('up', 'down', 'stable')),
    period VARCHAR(20) NOT NULL, -- daily, monthly, quarterly
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 売上データテーブル
CREATE TABLE revenue_data (
    revenue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    revenue_amount DECIMAL(15,2) NOT NULL,
    profit_amount DECIMAL(15,2) NOT NULL,
    target_amount DECIMAL(15,2),
    period_type VARCHAR(20) NOT NULL,
    fiscal_year INTEGER NOT NULL,
    fiscal_month INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- アクティビティログテーブル
CREATE TABLE activity_logs (
    activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_type VARCHAR(50) NOT NULL, -- achievement, alert, info, system
    title VARCHAR(200) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL, -- success, warning, error, info
    icon VARCHAR(10), -- 絵文字を格納
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(user_id)
);

-- 部門パフォーマンステーブル
CREATE TABLE department_performance (
    department_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_name VARCHAR(100) NOT NULL,
    performance_score INTEGER CHECK (performance_score >= 0 AND performance_score <= 100),
    target_score INTEGER CHECK (target_score >= 0 AND target_score <= 100),
    trend VARCHAR(10) CHECK (trend IN ('up', 'down', 'stable')),
    evaluated_at DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 財務サマリーテーブル
CREATE TABLE financial_summary (
    summary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL, -- revenue, cost_of_sales, sg_a, operating_profit, ordinary_profit
    actual_amount DECIMAL(15,2) NOT NULL,
    budget_amount DECIMAL(15,2) NOT NULL,
    variance_percentage DECIMAL(5,2),
    period VARCHAR(20) NOT NULL,
    fiscal_year INTEGER NOT NULL,
    fiscal_month INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_kpi_metrics_period ON kpi_metrics(period, created_at DESC);
CREATE INDEX idx_revenue_data_date ON revenue_data(date, period_type);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX idx_financial_summary_period ON financial_summary(fiscal_year, fiscal_month, period);
```

### データの関連性

- **KPIメトリクス** → UIの上部カードに表示
- **売上データ** → 売上分析グラフで使用
- **アクティビティログ** → 右側のフィードに表示
- **部門パフォーマンス** → 部門別パフォーマンスセクションで使用
- **財務サマリー** → 財務概要テーブルで表示

## アーキテクチャ設計

### レイヤー構造

```
src/routes/sample/dashboards/01/
├── +page.svelte              # メインページ（レイアウト管理）
├── config.js                 # 設定ファイル（モックフラグ等）
├── services/
│   ├── dataService.js        # データ取得の抽象化層
│   └── mockDataService.js    # モックデータ生成
└── components/
    ├── KpiMetrics.svelte     # KPIカード表示
    ├── RevenueAnalysis.svelte # 売上グラフ
    ├── ActivityFeed.svelte   # アクティビティ一覧
    ├── DepartmentPerformance.svelte # 部門パフォーマンス
    └── FinancialOverview.svelte    # 財務サマリー
```

### データフロー

1. **設定による分岐**

   ```javascript
   // config.js
   export const config = {
     useMockData: true, // 本番ではfalse
     apiBaseUrl: '/api/v1',
     refreshInterval: { ... }
   };
   ```

2. **データサービス層**

   ```javascript
   // モックと本番APIを切り替え
   if (config.useMockData) {
   	return mockDataService.getKpiMetrics(period);
   } else {
   	return fetch(`${apiBaseUrl}/kpi/metrics?period=${period}`);
   }
   ```

3. **コンポーネントでの利用**
   ```javascript
   onMount(async () => {
   	const data = await dataService.getKpiMetrics(period);
   	metrics = formatMetrics(data);
   });
   ```

## カスタマイズガイド

### 1. 新しいKPI指標の追加

```javascript
// mockDataService.js に追加
{
  metric_id: '5',
  metric_type: 'conversion_rate',
  label: 'コンバージョン率',
  value: 3.2,
  unit: '%',
  change_percentage: 0.5,
  trend: 'up',
  sparkline: this._generateSparkline(10)
}

// KpiMetrics.svelte のグリッドを調整
<div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
```

### 2. グラフの種類変更

```javascript
// RevenueAnalysis.svelte
chart = new Chart(ctx, {
	type: 'line' // 'bar', 'pie', 'doughnut' 等に変更可能
	// ...
});
```

### 3. 更新間隔の調整

```javascript
// config.js
refreshInterval: {
  kpiMetrics: 10000,    // 10秒に変更
  activityFeed: 5000,   // 5秒に変更
}
```

### 4. API接続の実装

```javascript
// dataService.js の本番実装部分
async getKpiMetrics(period) {
  if (config.useMockData) {
    return mockDataService.getKpiMetrics(period);
  }

  // 本番API実装
  const response = await fetch(`${config.apiBaseUrl}/kpi/metrics`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    params: { period }
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return await response.json();
}
```

## 実装のベストプラクティス

### 1. エラーハンドリング

```javascript
// 各コンポーネントで実装
let loading = $state(true);
let error = $state(null);

try {
	const data = await dataService.getData();
	// 処理
} catch (err) {
	error = err.message;
	// フォールバック表示
} finally {
	loading = false;
}
```

### 2. パフォーマンス最適化

- **データの差分更新**: 全体を再描画せず、変更部分のみ更新
- **仮想スクロール**: アクティビティフィードで大量データ対応
- **遅延読み込み**: Chart.jsを動的インポート
- **メモ化**: $derived.byで計算結果をキャッシュ

### 3. レスポンシブデザイン

```css
/* モバイル対応のブレークポイント */
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

/* グリッドの調整例 */
grid-cols-1 md:grid-cols-2 lg:grid-cols-4
```

### 4. アクセシビリティ

- すべてのインタラクティブ要素に適切なaria-label
- キーボードナビゲーション対応
- スクリーンリーダー対応のステータス通知
- 十分なカラーコントラスト比

## トラブルシューティング

### よくある問題

1. **データが更新されない**

   - リアクティビティの確認（参照の変更が必要）
   - $effectの依存関係を確認

2. **グラフが表示されない**

   - Chart.jsのインポート確認
   - canvas要素のバインディング確認
   - データフォーマットの検証

3. **パフォーマンス低下**
   - 更新間隔の調整
   - 不要な再レンダリングの防止
   - データ量の制限

## 技術スタック詳細

- **Svelte 5.16+**: 最新のrunes構文使用
- **SvelteKit 2.16+**: ファイルベースルーティング
- **DaisyUI 5.0.37+**: UIコンポーネントライブラリ
- **Chart.js 4.4.9**: グラフ描画ライブラリ
- **Tailwind CSS 4.1.7**: ユーティリティファーストCSS

## まとめ

このダッシュボードは実際のプロダクション環境での使用を想定し、以下の特徴を持ちます：

1. **拡張性**: 新機能の追加が容易
2. **保守性**: 明確なレイヤー分離
3. **テスタビリティ**: モックデータでの開発・テスト
4. **パフォーマンス**: 最適化されたレンダリング
5. **アクセシビリティ**: WCAG 2.1 AA準拠

実装時は本ドキュメントを参照し、プロジェクトの要件に応じてカスタマイズしてください。
