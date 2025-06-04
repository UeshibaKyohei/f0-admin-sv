/**
 * データベーステーブル定義
 * 
 * このファイルはRDBMSを想定したテーブル構造を定義します。
 * 実際の実装では、これらのインターフェースに基づいてORMのエンティティを作成します。
 * 
 * 想定RDBMS: PostgreSQL, MySQL, SQL Server等
 * ORM想定: TypeORM, Prisma, Sequelize等
 */

/**
 * 社員テーブル (employees)
 * 社員の基本情報を管理するマスターテーブル
 * 
 * インデックス推奨:
 * - employee_number (UNIQUE)
 * - email (UNIQUE)
 * - department_id (FK)
 * - position_id (FK)
 * - status
 * - (last_name, first_name) 複合インデックス
 */
export interface Employee {
  id: string;                    // PRIMARY KEY, UUID推奨
  employee_number: string;       // 社員番号 (UNIQUE, NOT NULL)
  first_name: string;           // 名 (NOT NULL, VARCHAR(50))
  last_name: string;            // 姓 (NOT NULL, VARCHAR(50))
  first_name_kana: string;      // 名カナ (NOT NULL, VARCHAR(50))
  last_name_kana: string;       // 姓カナ (NOT NULL, VARCHAR(50))
  email: string;                // メールアドレス (UNIQUE, NOT NULL, VARCHAR(255))
  phone_number: string;         // 電話番号 (VARCHAR(20))
  department_id: string;        // 部署ID (FK → departments.id)
  position_id: string;          // 役職ID (FK → positions.id)
  hire_date: Date;              // 入社日 (NOT NULL, DATE)
  birth_date?: Date;            // 生年月日 (DATE)
  avatar_url?: string;          // アバター画像URL (VARCHAR(500))
  status: 'active' | 'inactive' | 'retired'; // 在籍状況 (NOT NULL, ENUM or VARCHAR(20))
  contract_type: 'fulltime' | 'parttime' | 'contract' | 'intern'; // 雇用形態 (NOT NULL)
  salary?: number;              // 給与 (DECIMAL(10,2), 機密情報)
  work_location: string;        // 勤務地 (VARCHAR(100))
  address?: string;             // 住所 (TEXT, 機密情報)
  emergency_contact?: EmergencyContact; // 緊急連絡先 (JSON or 別テーブル)
  notes?: string;               // 備考 (TEXT)
  created_at: Date;             // 作成日時 (NOT NULL, TIMESTAMP)
  updated_at: Date;             // 更新日時 (NOT NULL, TIMESTAMP)
  created_by?: string;          // 作成者ID (FK → users.id)
  updated_by?: string;          // 更新者ID (FK → users.id)
}

/**
 * 緊急連絡先 (emergency_contacts)
 * 社員の緊急連絡先情報
 * 別テーブルとして正規化することも可能
 */
export interface EmergencyContact {
  name: string;                 // 氏名 (VARCHAR(100))
  relationship: string;         // 続柄 (VARCHAR(50))
  phone_number: string;         // 電話番号 (VARCHAR(20))
  email?: string;               // メールアドレス (VARCHAR(255))
}

/**
 * 部署テーブル (departments)
 * 組織の部署情報を階層構造で管理
 * 
 * インデックス推奨:
 * - code (UNIQUE)
 * - parent_id (FK)
 * - manager_id (FK)
 * - path (部署パスでの検索用)
 */
export interface Department {
  id: string;                   // PRIMARY KEY
  name: string;                 // 部署名 (NOT NULL, VARCHAR(100))
  code: string;                 // 部署コード (UNIQUE, NOT NULL, VARCHAR(10))
  description?: string;         // 説明 (TEXT)
  parent_id?: string;           // 親部署ID (FK → departments.id, NULL可)
  path: string;                 // 部署パス (例: "engineering/frontend", VARCHAR(500))
  level: number;                // 階層レベル (NOT NULL, INT)
  sort_order: number;           // 表示順 (NOT NULL, INT)
  manager_id?: string;          // 部署長ID (FK → employees.id)
  budget?: number;              // 予算 (DECIMAL(15,2))
  is_active: boolean;           // 有効フラグ (NOT NULL, DEFAULT true)
  created_at: Date;             // 作成日時
  updated_at: Date;             // 更新日時
}

/**
 * 役職テーブル (positions)
 * 役職マスター
 * 
 * インデックス推奨:
 * - code (UNIQUE)
 * - level
 */
export interface Position {
  id: string;                   // PRIMARY KEY
  name: string;                 // 役職名 (NOT NULL, VARCHAR(100))
  code: string;                 // 役職コード (UNIQUE, NOT NULL, VARCHAR(10))
  level: number;                // 職階レベル (NOT NULL, INT, 1-10)
  description?: string;         // 説明 (TEXT)
  permissions: string[];        // 権限リスト (JSON配列 or 別テーブル)
  salary_range?: {              // 給与レンジ (JSON or 別カラム)
    min: number;
    max: number;
  };
  is_management: boolean;       // 管理職フラグ (NOT NULL, DEFAULT false)
  is_active: boolean;           // 有効フラグ (NOT NULL, DEFAULT true)
  created_at: Date;             // 作成日時
  updated_at: Date;             // 更新日時
}

/**
 * スキルテーブル (skills)
 * スキルマスター
 * 
 * インデックス推奨:
 * - category
 * - name
 */
export interface Skill {
  id: string;                   // PRIMARY KEY
  name: string;                 // スキル名 (NOT NULL, VARCHAR(100))
  category: string;             // カテゴリー (NOT NULL, VARCHAR(50))
  description?: string;         // 説明 (TEXT)
  level?: string;               // デフォルトレベル (VARCHAR(20))
  color?: string;               // 表示色 (VARCHAR(50))
  is_active: boolean;           // 有効フラグ (NOT NULL, DEFAULT true)
  created_at: Date;             // 作成日時
  updated_at: Date;             // 更新日時
}

/**
 * 社員スキル関連テーブル (employee_skills)
 * 社員とスキルの多対多関係を管理
 * 
 * インデックス推奨:
 * - (employee_id, skill_id) 複合ユニーク
 * - employee_id (FK)
 * - skill_id (FK)
 */
export interface EmployeeSkill {
  id: string;                   // PRIMARY KEY
  employee_id: string;          // 社員ID (FK → employees.id, NOT NULL)
  skill_id: string;             // スキルID (FK → skills.id, NOT NULL)
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'; // スキルレベル
  certified_date?: Date;        // 認定日 (DATE)
  expiry_date?: Date;           // 有効期限 (DATE)
  notes?: string;               // 備考 (TEXT)
  created_at: Date;             // 作成日時
  updated_at: Date;             // 更新日時
  
  // リレーション
  employee?: Employee;          // belongsTo Employee
  skill?: Skill;                // belongsTo Skill
}

/**
 * 職歴テーブル (work_histories)
 * 社員の異動・昇進履歴を管理
 * 
 * インデックス推奨:
 * - employee_id (FK)
 * - start_date
 * - end_date
 */
export interface WorkHistory {
  id: string;                   // PRIMARY KEY
  employee_id: string;          // 社員ID (FK → employees.id, NOT NULL)
  department_id: string;        // 部署ID (FK → departments.id, NOT NULL)
  position_id: string;          // 役職ID (FK → positions.id, NOT NULL)
  start_date: Date;             // 開始日 (NOT NULL, DATE)
  end_date?: Date;              // 終了日 (DATE, NULLは現職)
  reason?: string;              // 異動理由 (VARCHAR(255))
  notes?: string;               // 備考 (TEXT)
  created_at: Date;             // 作成日時
  created_by?: string;          // 作成者ID (FK → users.id)
  
  // リレーション
  employee?: Employee;          // belongsTo Employee
  department?: Department;      // belongsTo Department
  position?: Position;          // belongsTo Position
}

/**
 * ユーザーテーブル (users)
 * システムユーザー（ログイン用）
 * ※社員とは別管理
 */
export interface User {
  id: string;                   // PRIMARY KEY
  username: string;             // ユーザー名 (UNIQUE, NOT NULL, VARCHAR(50))
  email: string;                // メールアドレス (UNIQUE, NOT NULL, VARCHAR(255))
  password_hash: string;        // パスワードハッシュ (NOT NULL, VARCHAR(255))
  employee_id?: string;         // 社員ID (FK → employees.id, UNIQUE)
  is_active: boolean;           // 有効フラグ (NOT NULL, DEFAULT true)
  last_login_at?: Date;         // 最終ログイン日時 (TIMESTAMP)
  created_at: Date;             // 作成日時
  updated_at: Date;             // 更新日時
}

/**
 * データベースビュー定義例
 */

/**
 * 社員詳細ビュー (v_employee_details)
 * 社員情報を部署名、役職名と結合して取得
 */
export interface EmployeeDetailView extends Employee {
  department_name: string;      // 部署名
  department_path: string;      // 部署パス
  position_name: string;        // 役職名
  position_level: number;       // 職階レベル
  manager_name?: string;        // 上司名
  skill_count: number;          // スキル数
}

/**
 * 部署統計ビュー (v_department_stats)
 * 部署ごとの社員数、平均年齢等を集計
 */
export interface DepartmentStatsView {
  department_id: string;
  department_name: string;
  department_path: string;
  employee_count: number;       // 社員数
  active_count: number;         // 在籍社員数
  average_age: number;          // 平均年齢
  average_tenure: number;       // 平均勤続年数
  total_salary: number;         // 給与総額
  budget_usage: number;         // 予算使用率
}

/**
 * トリガー定義例
 * 
 * 1. 社員更新時の職歴自動記録
 * 2. 部署パスの自動更新
 * 3. 統計情報の更新
 * 4. 監査ログの記録
 */

/**
 * ストアドプロシージャ定義例
 * 
 * 1. 組織図データ取得
 * 2. スキルギャップ分析
 * 3. 社員検索（全文検索）
 * 4. 一括データインポート
 */