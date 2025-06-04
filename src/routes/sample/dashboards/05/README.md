# HR Dashboard 05 - 人事・労務管理システム

## 概要

HR Dashboard 05は、日本の労働法規（特に2024年問題）に準拠した包括的な人事労務管理システムです。150-200名規模の企業を想定し、AI駆動の分析機能と現代的なUIを備えています。

このドキュメントはAI駆動開発において、本システムを参考に実装を行うための詳細な技術仕様書です。

## 主要機能

### 1. 従業員管理（Employee Management）

- **AIパワード従業員分析**: 離職リスク予測、パフォーマンス相関分析
- **高度な検索・フィルタリング**: 自然言語対応、8つのフィルター条件
- **360度従業員プロファイル**: パフォーマンス、エンゲージメント、スキル、リスク指標
- **チーム構成分析**: 部門別人数分布、世代構成、スキルマトリックス

### 2. 勤怠管理（Attendance Management）

- **リアルタイム勤怠トラッキング**: 出勤/リモート/休暇/遅刻/欠勤
- **2024年問題対応**: 残業時間上限管理（月45時間/年360時間）
- **インターバル規制チェック**: 11時間の勤務間隔確保
- **部門別残業分析**: リスクレベル可視化

### 3. 採用管理（Recruitment Management）

- **採用ファネル分析**: 応募→書類選考→面接→内定の可視化
- **採用KPIダッシュボード**: 平均採用期間、承諾率、コスト分析
- **求人管理**: 優先度設定、進捗トラッキング

### 4. 法務コンプライアンス（Legal Compliance）

- **コンプライアンススコア**: リアルタイム評価（0-100）
- **違反検知・トレンド分析**: 自動アラート機能
- **電子申請管理**: 36協定、就業規則変更等の進捗管理
- **有給取得義務管理**: 年5日取得の個別追跡

### 5. 健康管理（Health Management）

- **ストレスチェック管理**: 部門別ストレスレベル分析
- **健康診断受診管理**: 未受診者フォローアップ
- **産業医面談記録**: 高リスク者の追跡

## データベース設計

### 主要テーブル構造

```sql
-- 部門マスタ
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    employee_count INT NOT NULL DEFAULT 0,
    budget DECIMAL(12,0),
    headcount_limit INT,
    growth_rate DECIMAL(5,2),
    manager_employee_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_employee_id) REFERENCES employees(id)
);

-- 従業員マスタ
CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_kana VARCHAR(100),
    department_id INT NOT NULL,
    position VARCHAR(100),
    employment_status ENUM('active', 'leave', 'retired') DEFAULT 'active',
    employment_type ENUM('regular', 'contract', 'part_time') DEFAULT 'regular',
    join_date DATE NOT NULL,
    leave_date DATE,
    birth_date DATE,
    gender ENUM('male', 'female', 'other'),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    base_salary DECIMAL(10,0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    INDEX idx_department (department_id),
    INDEX idx_status (employment_status),
    INDEX idx_join_date (join_date)
);

-- 勤怠記録
CREATE TABLE attendance_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'vacation', 'remote', 'holiday') NOT NULL,
    check_in_time DATETIME,
    check_out_time DATETIME,
    break_minutes INT DEFAULT 0,
    overtime_minutes INT DEFAULT 0,
    overtime_reason TEXT,
    location VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE KEY unique_employee_date (employee_id, date),
    INDEX idx_date (date),
    INDEX idx_status (status)
);

-- 残業記録（月次集計）
CREATE TABLE overtime_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    total_hours DECIMAL(5,2) NOT NULL DEFAULT 0,
    average_daily DECIMAL(4,2),
    max_daily DECIMAL(4,2),
    risk_level ENUM('low', 'medium', 'high') DEFAULT 'low',
    alert_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE KEY unique_employee_period (employee_id, year, month),
    INDEX idx_risk (risk_level),
    INDEX idx_period (year, month)
);

-- 有給休暇管理
CREATE TABLE vacation_balances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    fiscal_year INT NOT NULL,
    granted_days DECIMAL(4,1) NOT NULL,
    used_days DECIMAL(4,1) NOT NULL DEFAULT 0,
    remaining_days DECIMAL(4,1) NOT NULL,
    carried_over_days DECIMAL(4,1) DEFAULT 0,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE KEY unique_employee_year (employee_id, fiscal_year),
    INDEX idx_expiry (expiry_date)
);

-- 採用求人
CREATE TABLE job_postings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    department_id INT NOT NULL,
    job_description TEXT,
    requirements TEXT,
    salary_min DECIMAL(10,0),
    salary_max DECIMAL(10,0),
    employment_type ENUM('regular', 'contract', 'part_time'),
    headcount INT DEFAULT 1,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('draft', 'active', 'closed', 'filled') DEFAULT 'draft',
    posted_date DATE,
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    INDEX idx_status (status),
    INDEX idx_department (department_id)
);

-- 応募者管理
CREATE TABLE applications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    job_posting_id INT NOT NULL,
    applicant_name VARCHAR(100) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(20),
    resume_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    status ENUM('new', 'screening', 'interview', 'final', 'offer', 'rejected', 'withdrawn') DEFAULT 'new',
    current_stage INT DEFAULT 1,
    evaluation_score INT,
    notes TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_posting_id) REFERENCES job_postings(id),
    INDEX idx_status (status),
    INDEX idx_job (job_posting_id),
    INDEX idx_applied (applied_at)
);

-- コンプライアンススコア履歴
CREATE TABLE compliance_scores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    score_date DATE NOT NULL,
    overall_score INT NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    overtime_score INT,
    vacation_score INT,
    health_check_score INT,
    interval_score INT,
    department_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    INDEX idx_date (score_date),
    INDEX idx_department (department_id)
);

-- 従業員スキル
CREATE TABLE employee_skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    skill_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    years_of_experience DECIMAL(3,1),
    last_used_date DATE,
    certified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    INDEX idx_employee (employee_id),
    INDEX idx_skill (skill_name)
);

-- 従業員評価
CREATE TABLE employee_evaluations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    evaluation_period VARCHAR(20) NOT NULL,
    performance_score ENUM('A', 'B', 'C', 'D', 'E') NOT NULL,
    engagement_score INT CHECK (engagement_score >= 0 AND engagement_score <= 100),
    evaluator_id INT NOT NULL,
    comments TEXT,
    goals_achieved INT,
    goals_total INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (evaluator_id) REFERENCES employees(id),
    INDEX idx_employee (employee_id),
    INDEX idx_period (evaluation_period)
);
```

## API エンドポイント設計

### 従業員管理

- `GET /api/hr/employees` - 従業員一覧取得（フィルタリング対応）
- `GET /api/hr/employees/:id` - 従業員詳細取得
- `POST /api/hr/employees` - 従業員登録
- `PUT /api/hr/employees/:id` - 従業員情報更新
- `DELETE /api/hr/employees/:id` - 従業員削除（論理削除）
- `GET /api/hr/employees/:id/skills` - 従業員スキル取得
- `GET /api/hr/employees/:id/evaluations` - 評価履歴取得

### 勤怠管理

- `GET /api/hr/attendance/today` - 本日の勤怠サマリー
- `GET /api/hr/attendance/weekly` - 週次勤怠データ
- `POST /api/hr/attendance/check-in` - 出勤打刻
- `POST /api/hr/attendance/check-out` - 退勤打刻
- `GET /api/hr/overtime/monthly` - 月次残業レポート
- `GET /api/hr/overtime/alerts` - 残業アラート一覧

### 採用管理

- `GET /api/hr/recruitment/jobs` - 求人一覧
- `POST /api/hr/recruitment/jobs` - 求人登録
- `GET /api/hr/recruitment/applications` - 応募者一覧
- `PUT /api/hr/recruitment/applications/:id/status` - 応募者ステータス更新
- `GET /api/hr/recruitment/metrics` - 採用KPI取得

### コンプライアンス

- `GET /api/hr/compliance/score` - コンプライアンススコア取得
- `GET /api/hr/compliance/violations` - 違反一覧
- `GET /api/hr/compliance/applications` - 申請状況
- `POST /api/hr/compliance/actions` - 改善アクション登録

## カスタマイズのポイント

### 1. 企業規模の調整

```javascript
// CONFIG定数で企業規模を変更
const CONFIG = {
	employeeScale: 157 // ここを変更
	// ...
};
```

### 2. 労働法規制の設定

```javascript
// 残業上限や有給取得義務の設定
const CONFIG = {
	overtimeLimit: {
		monthly: 45, // 月間上限
		yearly: 360, // 年間上限
		alertThreshold: {
			monthly: 40, // アラート閾値
			yearly: 320
		}
	},
	vacationPolicy: {
		minimumDays: 5, // 最低取得日数
		grantedDays: 20 // 付与日数
	}
};
```

### 3. モックモードの切り替え

```javascript
const IS_MOCK_MODE = true; // false にすると本番APIを使用
```

### 4. UIテーマのカスタマイズ

DaisyUI v5のテーマシステムを使用。`data-theme`属性で切り替え可能。

## 実装のTips

### 1. リアクティビティの注意点

Svelte 5では参照の変更を検知するため、配列やオブジェクトの更新時は新しい参照を作成する：

```javascript
// ❌ 間違い
employees.push(newEmployee);

// ✅ 正しい
employees = [...employees, newEmployee];
```

### 2. パフォーマンス最適化

- 大量データ表示時は仮想スクロールを検討
- 派生値は`$derived`を使用してメモ化
- API呼び出しは適切にデバウンス

### 3. エラーハンドリング

```javascript
try {
	const data = await hrService.getEmployees();
	employees = data;
} catch (error) {
	console.error('従業員データ取得エラー:', error);
	// エラー通知表示
}
```

## セキュリティ考慮事項

1. **個人情報保護**

   - 従業員の個人情報は必要最小限のみ表示
   - ロールベースのアクセス制御実装
   - 監査ログの記録

2. **データ暗号化**

   - 給与情報等の機密データは暗号化して保存
   - HTTPSでの通信必須

3. **認証・認可**
   - JWT等によるセッション管理
   - APIエンドポイントの適切な保護

## 関連ドキュメント

- [AI実装ガイド](./AI-IMPLEMENTATION-GUIDE.md) - 本番実装への詳細な移行手順
- [APIサービス](./hr-service.js) - Mock/Production切り替え可能なサービス層
- [プロジェクトCLAUDE.md](/CLAUDE.md) - プロジェクト全体の設定と規約

## 技術スタック（プロジェクト共通）

- **Framework**: SvelteKit 2.16.0 with Svelte 5.0.0
- **Styling**: Tailwind CSS 4.1.7 + DaisyUI 5.0.35
- **Language**: TypeScript 5.0.0（本サンプルはJavaScript）
- **Testing**: Vitest (unit), Playwright (e2e)
- **Package Manager**: pnpm (fallback to npm)

## 開発コマンド

```bash
# 開発サーバー起動
pnpm run dev

# ビルド
pnpm run build

# テスト実行
pnpm run test:unit    # 単体テスト
pnpm run test:e2e     # E2Eテスト

# コード品質
pnpm run lint         # ESLint + Prettier
pnpm run format       # コード整形
```

## Svelte 5 重要な注意事項

### リアクティビティ

```javascript
// ❌ 避けるべき書き方
myStore.update((items) => {
	items.push(newItem); // 既存配列を変更
	return items; // 同じ参照を返す
});

// ✅ 推奨される書き方
myStore.update((items) => {
	return [...items, newItem]; // 新しい配列を返す
});
```

### $derived vs {@const}

- `$derived`: リアクティブな派生値（推奨）
- `{@const}`: 静的な値（リアクティブでない）

### ストア参照

```javascript
// コンポーネントのトップレベル
const items = $myStore; // OK

// 関数内
import { get } from 'svelte/store';
function calculateTotal() {
	const items = get(myStore); // 関数内ではget()を使用
}
```

## DaisyUI v5 使用上の注意

1. **テーマ適用**: グローバルに影響しないよう、スコープを限定
2. **コンポーネント**: 必ずDaisyUIの既存コンポーネントを優先使用
3. **カスタムCSS**: 最小限に留め、Tailwindクラスを活用

## ライセンス

このサンプルコードはMITライセンスで提供されます。

---

最終更新日: 2025年1月6日
バージョン: 1.0.0
