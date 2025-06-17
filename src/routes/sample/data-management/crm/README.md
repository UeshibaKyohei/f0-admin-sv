# CRM営業管理システム - AI駆動開発ドキュメント

## 📋 システム概要

従来型B2B営業企業向けの包括的なCRMシステム。リード獲得から顧客関係維持まで、一回性の契約を重視した営業プロセス全体をサポートします。

### 🎯 ターゲット企業
- **業種**: 製造業、商社、システムインテグレーター
- **規模**: 従業員100-500名
- **営業チーム**: 20-50名
- **ビジネスモデル**: プロジェクト型・一回性契約

### 🚀 主要機能
- リード管理（スコアリング、ソース管理）
- 商談プロセス管理（カンバン/リスト表示）
- 顧客ライフサイクル管理
- 活動履歴統合管理
- 分析・レポート機能
- AI推奨機能（モック実装済み）

---

## 🏗️ 技術仕様

### フレームワーク・ライブラリ
- **Svelte 5.16+** (runes構文対応)
- **SvelteKit 2.16+**
- **DaisyUI 5.0.37+**
- **Tailwind CSS 4.1.7+**

### 設定管理
モック/本番切り替えは `src/routes/sample/data-management/crm/config/settings.js` で一元管理

```javascript
export const CRM_CONFIG = {
  MOCK_MODE: true,                    // 本番移行時は false に変更
  DEMO_FEATURES: {
    showToastDemo: true,              // デモ機能の表示制御
    showMockData: true,
    showSampleActions: true
  },
  // ... その他設定
};
```

---

## 📊 データベース設計 (RDB対応)

### 主要テーブル構造

#### 1. companies (企業マスター)
```sql
CREATE TABLE companies (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  employee_count INT,
  annual_revenue BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_industry (industry),
  INDEX idx_created_at (created_at)
);
```

#### 2. contacts (担当者マスター)
```sql
CREATE TABLE contacts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  position VARCHAR(100),
  is_decision_maker BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_company_id (company_id),
  INDEX idx_email (email)
);
```

#### 3. leads (リード)
```sql
CREATE TABLE leads (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NOT NULL,
  contact_id BIGINT NOT NULL,
  source ENUM('web', 'exhibition', 'referral', 'cold_call', 'other') NOT NULL,
  status ENUM('new', 'qualified', 'converted', 'lost') DEFAULT 'new',
  score INT DEFAULT 0,
  assigned_to BIGINT,
  qualified_at TIMESTAMP NULL,
  converted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_source (source)
);
```

#### 4. deals (商談)
```sql
CREATE TABLE deals (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NOT NULL,
  contact_id BIGINT NOT NULL,
  lead_id BIGINT NULL,
  title VARCHAR(255) NOT NULL,
  stage ENUM('qualification', 'needs_analysis', 'proposal', 'negotiation', 'closed') DEFAULT 'qualification',
  status ENUM('open', 'closed_won', 'closed_lost') DEFAULT 'open',
  value BIGINT NOT NULL DEFAULT 0,
  probability INT DEFAULT 20,
  expected_close_date DATE,
  actual_close_date DATE,
  assigned_to BIGINT,
  deal_type ENUM('new', 'renewal', 'upsell', 'cross-sell') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_stage (stage),
  INDEX idx_status (status),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_expected_close_date (expected_close_date)
);
```

#### 5. activities (活動履歴)
```sql
CREATE TABLE activities (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  deal_id BIGINT NULL,
  company_id BIGINT NOT NULL,
  contact_id BIGINT NULL,
  type ENUM('call', 'email', 'meeting', 'note', 'proposal', 'contract', 'support') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  performed_by BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
  FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_deal_id (deal_id),
  INDEX idx_company_id (company_id),
  INDEX idx_type (type),
  INDEX idx_scheduled_at (scheduled_at),
  INDEX idx_performed_by (performed_by)
);
```

#### 6. users (営業担当者)
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role ENUM('admin', 'manager', 'sales') DEFAULT 'sales',
  team_id BIGINT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role (role),
  INDEX idx_team_id (team_id)
);
```

### 📈 パフォーマンス考慮事項

1. **インデックス戦略**
   - 検索頻度の高いカラムにインデックス設定
   - 複合インデックスでクエリ最適化

2. **パーティショニング**
   - activitiesテーブルは月別パーティション推奨
   - 大量データ対応

3. **キャッシュ戦略**
   - ダッシュボード統計はRedisキャッシュ
   - リアルタイム性不要なデータは定期更新

4. **ページネーション設計**
   - 活動履歴は初期10件表示、以降は「さらに読み込む」ボタン
   - カーソルベースペジネーション推奨（大量データ対応）
   - 無限スクロールとページネーションのハイブリッド実装

---

## 🔗 API設計

### エンドポイント一覧

#### リード管理
```
GET    /api/leads                    # リード一覧取得
GET    /api/leads/:id                # リード詳細取得
POST   /api/leads                    # リード作成
PUT    /api/leads/:id                # リード更新
DELETE /api/leads/:id                # リード削除
PUT    /api/leads/:id/qualify        # リード資格化
PUT    /api/leads/:id/convert        # リード→商談変換
```

#### 商談管理
```
GET    /api/deals                    # 商談一覧取得
GET    /api/deals/:id                # 商談詳細取得
POST   /api/deals                    # 商談作成
PUT    /api/deals/:id                # 商談更新
DELETE /api/deals/:id                # 商談削除
PUT    /api/deals/:id/stage          # ステージ変更
PUT    /api/deals/:id/close          # 商談クローズ
```

#### 顧客管理
```
GET    /api/customers                # 顧客一覧取得
GET    /api/customers/:id            # 顧客詳細取得
PUT    /api/customers/:id            # 顧客情報更新
GET    /api/customers/:id/deals      # 顧客の商談履歴
GET    /api/customers/:id/activities # 顧客の活動履歴
```

#### 活動履歴
```
GET    /api/activities               # 活動履歴取得（ページネーション対応）
  ?page=1&limit=10&type=meeting&company_id=123
POST   /api/activities               # 活動記録
PUT    /api/activities/:id           # 活動更新
DELETE /api/activities/:id           # 活動削除
```

#### 分析・レポート
```
GET    /api/analytics/dashboard      # ダッシュボード統計
GET    /api/analytics/forecast       # 売上予測
GET    /api/analytics/funnel         # ファネル分析
GET    /api/analytics/performance    # 営業成績分析
```

### 📋 レスポンス形式

#### 成功レスポンス
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0"
  }
}
```

#### エラーレスポンス
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "バリデーションエラーが発生しました",
    "details": [
      {
        "field": "email",
        "message": "有効なメールアドレスを入力してください"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

---

## 🔧 本番環境移行チェックリスト

### 1. 設定変更
- [ ] `CRM_CONFIG.MOCK_MODE` を `false` に変更
- [ ] `CRM_CONFIG.DATA_SOURCE.apiBaseUrl` を本番APIに変更
- [ ] 環境変数での設定管理に移行
- [ ] デモ機能の無効化確認

### 2. データベース
- [ ] 本番RDBスキーマ作成
- [ ] インデックス設定
- [ ] 初期データ投入
- [ ] バックアップ体制構築

### 3. API実装
- [ ] 認証・認可機能実装
- [ ] レート制限設定
- [ ] ログ出力設定
- [ ] エラーハンドリング強化

### 4. セキュリティ
- [ ] SQL インジェクション対策
- [ ] XSS 対策確認
- [ ] CSRF トークン実装
- [ ] 機密情報のマスキング

### 5. パフォーマンス
- [ ] データベースクエリ最適化
- [ ] キャッシュ戦略実装
- [ ] 画像最適化
- [ ] CDN設定

### 6. 運用
- [ ] ヘルスチェックエンドポイント
- [ ] メトリクス収集設定
- [ ] アラート設定
- [ ] デプロイメント自動化

---

## 💡 AI開発効率化Tips

### 1. 設定ドリブン開発
```javascript
// 新機能追加時の手順
// 1. config/settings.js に設定を追加
DEMO_FEATURES: {
  showNewFeature: true  // 新機能の表示制御
}

// 2. コンポーネントで設定を参照
{#if CRM_CONFIG.DEMO_FEATURES.showNewFeature}
  <NewFeatureComponent />
{/if}
```

### 2. モックファースト開発
```javascript
// APIクライアントを使用してモック→本番の移行を簡単に
const result = await dealAPI.createDeal(dealData);
// MOCK_MODEの状態に関わらず同じコードで動作
```

### 3. 型安全性の向上
```javascript
// types.js で型定義を一元管理
/**
 * @typedef {Object} Deal
 * @property {string} id
 * @property {string} companyName
 * @property {number} value
 * @property {'qualification'|'needs_analysis'|'proposal'|'negotiation'|'closed'} stage
 */
```

### 4. コンポーネント再利用性
```javascript
// 共通コンポーネントの活用
<StatusBadge 
  status={deal.status} 
  config={CRM_CONFIG.BUSINESS_CONFIG.dealStages} 
/>
```

### 5. デバッグ効率化
```javascript
// 開発モードでのデバッグ情報表示
{#if CRM_CONFIG.MOCK_MODE && CRM_CONFIG.DEMO_FEATURES.showDebugInfo}
  <DebugPanel data={componentState} />
{/if}
```

---

## 📚 よくある質問

### Q: 新しいステージを追加したい
A: `config/settings.js` の `BUSINESS_CONFIG.dealStages` に追加するだけで全体に反映されます。

### Q: カスタム項目を追加したい
A: 
1. データ構造に項目追加
2. 対応するAPI変更
3. UIコンポーネント修正
4. バリデーション追加

### Q: 多言語対応したい
A: `LABELS` 設定を言語別オブジェクトに変更し、言語切り替え機能を実装してください。

### Q: 権限管理を強化したい
A: ユーザーの `role` フィールドを活用し、各機能にアクセス制御を追加してください。

---

## 🎯 今後の拡張計画

### Phase 1: 基本機能拡張
- [ ] ファイル添付機能
- [ ] メール連携
- [ ] カレンダー連携
- [ ] 通知機能

### Phase 2: AI機能強化
- [ ] 商談成功予測モデル
- [ ] 最適な次回アクション提案
- [ ] 自動レポート生成
- [ ] チャットボット導入

### Phase 3: 統合機能
- [ ] 外部CRM連携
- [ ] MA（マーケティングオートメーション）連携
- [ ] 会計システム連携
- [ ] SFA機能拡張

---

## 📞 サポート

技術的な質問や機能要望については、プロジェクトの Issue を作成してください。

---

*このドキュメントは AI駆動開発をサポートするために作成されています。コードの変更に合わせて定期的に更新してください。*