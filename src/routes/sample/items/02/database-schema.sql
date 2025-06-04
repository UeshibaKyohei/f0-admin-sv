/**
 * 社員管理システム データベース設計
 * 
 * このファイルは、本番環境で使用することを想定したRDBのスキーマ定義です。
 * PostgreSQL/MySQL互換の構文で記述しています。
 */

-- =====================================
-- 部署テーブル
-- =====================================
CREATE TABLE departments (
    id VARCHAR(36) PRIMARY KEY,                    -- UUID v4推奨
    name VARCHAR(100) NOT NULL,                    -- 部署名
    code VARCHAR(10) NOT NULL UNIQUE,              -- 部署コード（例: "DEV001"）
    description TEXT,                              -- 部署説明
    parent_id VARCHAR(36),                         -- 親部署ID（自己参照）
    manager_id VARCHAR(36),                        -- 部署長の社員ID
    level INT NOT NULL DEFAULT 0,                  -- 階層レベル（0がルート）
    path VARCHAR(500) NOT NULL,                    -- パス（例: "company/engineering/backend"）
    sort_order INT NOT NULL DEFAULT 0,             -- 表示順序
    budget DECIMAL(15,2),                          -- 部署予算
    is_active BOOLEAN NOT NULL DEFAULT TRUE,       -- 有効フラグ
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    
    FOREIGN KEY (parent_id) REFERENCES departments(id) ON DELETE RESTRICT,
    INDEX idx_departments_parent (parent_id),
    INDEX idx_departments_code (code),
    INDEX idx_departments_path (path),
    INDEX idx_departments_active (is_active),
    INDEX idx_departments_manager (manager_id)
);

-- =====================================
-- 役職テーブル
-- =====================================
CREATE TABLE positions (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,                    -- 役職名
    code VARCHAR(10) NOT NULL UNIQUE,              -- 役職コード
    level INT NOT NULL DEFAULT 1,                  -- 役職レベル（1-10、数字が大きいほど上位）
    description TEXT,                              -- 役職説明
    salary_min DECIMAL(12,2),                      -- 最低給与
    salary_max DECIMAL(12,2),                      -- 最高給与
    is_management BOOLEAN NOT NULL DEFAULT FALSE,  -- 管理職フラグ
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_positions_level (level),
    INDEX idx_positions_code (code),
    INDEX idx_positions_active (is_active),
    INDEX idx_positions_management (is_management)
);

-- =====================================
-- 権限マスターテーブル
-- =====================================
CREATE TABLE permissions (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,             -- 権限名
    code VARCHAR(50) NOT NULL UNIQUE,              -- 権限コード（例: "employee:read"）
    description TEXT,                              -- 権限説明
    category VARCHAR(50) NOT NULL,                 -- 権限カテゴリー
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_permissions_code (code),
    INDEX idx_permissions_category (category)
);

-- =====================================
-- 役職権限関連テーブル（多対多）
-- =====================================
CREATE TABLE position_permissions (
    position_id VARCHAR(36) NOT NULL,
    permission_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (position_id, permission_id),
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    INDEX idx_position_permissions_permission (permission_id)
);

-- =====================================
-- スキルマスターテーブル
-- =====================================
CREATE TABLE skills (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,                    -- スキル名
    category VARCHAR(50) NOT NULL,                 -- スキルカテゴリー
    description TEXT,                              -- スキル説明
    recommended_level VARCHAR(20) DEFAULT 'intermediate', -- 推奨レベル
    color VARCHAR(50) NOT NULL DEFAULT 'badge-info', -- 表示色クラス
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_skills_category (category),
    INDEX idx_skills_name (name),
    INDEX idx_skills_active (is_active)
);

-- =====================================
-- 社員テーブル
-- =====================================
CREATE TABLE employees (
    id VARCHAR(36) PRIMARY KEY,
    employee_number VARCHAR(20) NOT NULL UNIQUE,   -- 社員番号
    first_name VARCHAR(50) NOT NULL,               -- 名
    last_name VARCHAR(50) NOT NULL,                -- 姓
    first_name_kana VARCHAR(50),                   -- 名（カナ）
    last_name_kana VARCHAR(50),                    -- 姓（カナ）
    email VARCHAR(255) NOT NULL UNIQUE,            -- メールアドレス
    phone_number VARCHAR(20),                      -- 電話番号
    department_id VARCHAR(36) NOT NULL,            -- 部署ID
    position_id VARCHAR(36) NOT NULL,              -- 役職ID
    hire_date DATE NOT NULL,                       -- 入社日
    birth_date DATE,                               -- 生年月日
    avatar_url TEXT,                               -- プロフィール画像URL
    status VARCHAR(20) NOT NULL DEFAULT 'active',  -- active/inactive/retired
    contract_type VARCHAR(20) NOT NULL DEFAULT 'fulltime', -- fulltime/parttime/contract/intern
    salary DECIMAL(12,2),                          -- 基本給
    work_location VARCHAR(100) NOT NULL DEFAULT '本社', -- 勤務地
    emergency_contact_name VARCHAR(100),           -- 緊急連絡先氏名
    emergency_contact_relationship VARCHAR(50),    -- 続柄
    emergency_contact_phone VARCHAR(20),           -- 緊急連絡先電話
    emergency_contact_email VARCHAR(255),          -- 緊急連絡先メール
    emergency_contact_address TEXT,                -- 緊急連絡先住所
    notes TEXT,                                    -- 備考
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE RESTRICT,
    INDEX idx_employees_number (employee_number),
    INDEX idx_employees_email (email),
    INDEX idx_employees_department (department_id),
    INDEX idx_employees_position (position_id),
    INDEX idx_employees_status (status),
    INDEX idx_employees_contract (contract_type),
    INDEX idx_employees_hire_date (hire_date),
    INDEX idx_employees_name (last_name, first_name),
    INDEX idx_employees_name_kana (last_name_kana, first_name_kana)
);

-- 部署テーブルの外部キー制約を追加（循環参照対応）
ALTER TABLE departments 
ADD CONSTRAINT fk_departments_manager 
FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;

-- =====================================
-- 社員スキル関連テーブル（多対多）
-- =====================================
CREATE TABLE employee_skills (
    employee_id VARCHAR(36) NOT NULL,
    skill_id VARCHAR(36) NOT NULL,
    level VARCHAR(20) NOT NULL DEFAULT 'intermediate', -- beginner/intermediate/advanced/expert
    certified_date DATE,                              -- 認定日
    expiry_date DATE,                                  -- 有効期限
    notes TEXT,                                        -- 備考
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (employee_id, skill_id),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    INDEX idx_employee_skills_skill (skill_id),
    INDEX idx_employee_skills_level (level),
    INDEX idx_employee_skills_certified (certified_date),
    INDEX idx_employee_skills_expiry (expiry_date)
);

-- =====================================
-- 職歴テーブル
-- =====================================
CREATE TABLE work_history (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    department_id VARCHAR(36) NOT NULL,
    position_id VARCHAR(36) NOT NULL,
    start_date DATE NOT NULL,                         -- 開始日
    end_date DATE,                                     -- 終了日（現職の場合はNULL）
    reason VARCHAR(500),                               -- 異動理由
    notes TEXT,                                        -- 備考
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE RESTRICT,
    INDEX idx_work_history_employee (employee_id),
    INDEX idx_work_history_department (department_id),
    INDEX idx_work_history_position (position_id),
    INDEX idx_work_history_dates (start_date, end_date),
    INDEX idx_work_history_current (employee_id, end_date) -- 現職検索用
);

-- =====================================
-- 勤怠テーブル（将来の拡張用）
-- =====================================
CREATE TABLE attendance (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,                                -- 勤務日
    clock_in TIME,                                     -- 出勤時刻
    clock_out TIME,                                    -- 退勤時刻
    break_minutes INT NOT NULL DEFAULT 0,              -- 休憩時間（分）
    work_minutes INT NOT NULL DEFAULT 0,               -- 実働時間（分）
    overtime_minutes INT NOT NULL DEFAULT 0,           -- 残業時間（分）
    status VARCHAR(20) NOT NULL DEFAULT 'present',     -- present/absent/late/early_leave/holiday
    notes TEXT,                                        -- 備考
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY uk_attendance_employee_date (employee_id, date),
    INDEX idx_attendance_date (date),
    INDEX idx_attendance_status (status),
    INDEX idx_attendance_employee_month (employee_id, date)
);

-- =====================================
-- トリガー: 自動タイムスタンプ更新
-- =====================================
-- PostgreSQL版
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_skills_updated_at BEFORE UPDATE ON employee_skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- トリガー: 職歴の自動記録
-- =====================================
CREATE OR REPLACE FUNCTION record_work_history_change()
RETURNS TRIGGER AS $$
BEGIN
    -- 部署または役職が変更された場合
    IF OLD.department_id != NEW.department_id OR OLD.position_id != NEW.position_id THEN
        -- 現在の職歴を終了
        UPDATE work_history 
        SET end_date = CURRENT_DATE 
        WHERE employee_id = NEW.id AND end_date IS NULL;
        
        -- 新しい職歴を追加
        INSERT INTO work_history (
            id,
            employee_id,
            department_id,
            position_id,
            start_date,
            reason
        ) VALUES (
            gen_random_uuid(),
            NEW.id,
            NEW.department_id,
            NEW.position_id,
            CURRENT_DATE,
            '人事異動'
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER record_employee_work_history AFTER UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION record_work_history_change();

-- =====================================
-- ビュー: 組織階層ビュー
-- =====================================
CREATE OR REPLACE VIEW v_department_hierarchy AS
WITH RECURSIVE dept_tree AS (
    -- ルート部署
    SELECT 
        id,
        name,
        code,
        parent_id,
        manager_id,
        level,
        path,
        sort_order,
        is_active,
        CAST(name AS VARCHAR(1000)) as full_path,
        ARRAY[id] as path_ids
    FROM departments
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- 子部署
    SELECT 
        d.id,
        d.name,
        d.code,
        d.parent_id,
        d.manager_id,
        d.level,
        d.path,
        d.sort_order,
        d.is_active,
        CAST(dt.full_path || ' > ' || d.name AS VARCHAR(1000)) as full_path,
        dt.path_ids || d.id as path_ids
    FROM departments d
    INNER JOIN dept_tree dt ON d.parent_id = dt.id
)
SELECT * FROM dept_tree
ORDER BY level, sort_order, name;

-- =====================================
-- ビュー: 社員詳細ビュー
-- =====================================
CREATE OR REPLACE VIEW v_employee_details AS
SELECT 
    e.id,
    e.employee_number,
    e.first_name,
    e.last_name,
    e.first_name_kana,
    e.last_name_kana,
    CONCAT(e.last_name, ' ', e.first_name) as full_name,
    CONCAT(e.last_name_kana, ' ', e.first_name_kana) as full_name_kana,
    e.email,
    e.phone_number,
    e.hire_date,
    e.birth_date,
    EXTRACT(YEAR FROM AGE(COALESCE(e.birth_date, CURRENT_DATE))) as age,
    EXTRACT(YEAR FROM AGE(e.hire_date)) as tenure_years,
    e.avatar_url,
    e.status,
    e.contract_type,
    e.work_location,
    e.notes,
    -- 部署情報
    d.id as department_id,
    d.name as department_name,
    d.code as department_code,
    d.path as department_path,
    -- 役職情報
    p.id as position_id,
    p.name as position_name,
    p.code as position_code,
    p.level as position_level,
    p.is_management,
    -- 部署長フラグ
    CASE WHEN d.manager_id = e.id THEN TRUE ELSE FALSE END as is_department_manager,
    e.created_at,
    e.updated_at
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN positions p ON e.position_id = p.id;

-- =====================================
-- ビュー: 社員統計ビュー
-- =====================================
CREATE OR REPLACE VIEW v_employee_statistics AS
SELECT 
    d.id as department_id,
    d.name as department_name,
    COUNT(DISTINCT e.id) as total_employees,
    COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.id END) as active_employees,
    COUNT(DISTINCT CASE WHEN e.contract_type = 'fulltime' THEN e.id END) as fulltime_count,
    COUNT(DISTINCT CASE WHEN p.is_management = TRUE THEN e.id END) as management_count,
    AVG(EXTRACT(YEAR FROM AGE(e.hire_date))) as avg_tenure_years,
    AVG(EXTRACT(YEAR FROM AGE(COALESCE(e.birth_date, CURRENT_DATE)))) as avg_age,
    MIN(e.hire_date) as oldest_hire_date,
    MAX(e.hire_date) as newest_hire_date
FROM departments d
LEFT JOIN employees e ON d.id = e.department_id
LEFT JOIN positions p ON e.position_id = p.id
GROUP BY d.id, d.name;

-- =====================================
-- インデックス: パフォーマンス最適化
-- =====================================
-- 複合インデックス（よく使われる検索条件）
CREATE INDEX idx_employees_dept_pos_status ON employees(department_id, position_id, status);
CREATE INDEX idx_employees_hire_year ON employees(EXTRACT(YEAR FROM hire_date));

-- 全文検索用インデックス（PostgreSQL）
CREATE INDEX idx_employees_fulltext ON employees USING gin(
    to_tsvector('japanese', 
        COALESCE(last_name, '') || ' ' || 
        COALESCE(first_name, '') || ' ' || 
        COALESCE(last_name_kana, '') || ' ' || 
        COALESCE(first_name_kana, '') || ' ' ||
        COALESCE(employee_number, '')
    )
);

-- =====================================
-- 初期データ（マスターデータ）
-- =====================================
-- デフォルト権限
INSERT INTO permissions (id, name, code, description, category) VALUES
    ('perm-emp-read', '社員情報参照', 'employee:read', '社員情報を参照する権限', 'employee'),
    ('perm-emp-write', '社員情報更新', 'employee:write', '社員情報を更新する権限', 'employee'),
    ('perm-emp-delete', '社員情報削除', 'employee:delete', '社員情報を削除する権限', 'employee'),
    ('perm-dept-read', '部署情報参照', 'department:read', '部署情報を参照する権限', 'department'),
    ('perm-dept-write', '部署情報更新', 'department:write', '部署情報を更新する権限', 'department'),
    ('perm-salary-read', '給与情報参照', 'salary:read', '給与情報を参照する権限', 'salary'),
    ('perm-salary-write', '給与情報更新', 'salary:write', '給与情報を更新する権限', 'salary'),
    ('perm-reports-read', 'レポート参照', 'reports:read', 'レポートを参照する権限', 'reports'),
    ('perm-system-admin', 'システム管理', 'system:admin', 'システム全体を管理する権限', 'system');

-- デフォルトスキル
INSERT INTO skills (id, name, category, description, color) VALUES
    ('skill-js', 'JavaScript', '技術', 'JavaScript プログラミング', 'badge-warning'),
    ('skill-python', 'Python', '技術', 'Python プログラミング', 'badge-info'),
    ('skill-java', 'Java', '技術', 'Java プログラミング', 'badge-error'),
    ('skill-react', 'React', '技術', 'React フレームワーク', 'badge-primary'),
    ('skill-nodejs', 'Node.js', '技術', 'Node.js 開発', 'badge-success'),
    ('skill-sql', 'SQL', '技術', 'データベース設計・操作', 'badge-ghost'),
    ('skill-english', '英語', '言語', 'ビジネス英語', 'badge-accent'),
    ('skill-chinese', '中国語', '言語', '中国語（標準中国語）', 'badge-secondary'),
    ('skill-management', 'チーム管理', 'マネジメント', 'チームマネジメント', 'badge-warning'),
    ('skill-project-mgmt', 'プロジェクト管理', 'マネジメント', 'プロジェクトマネジメント', 'badge-info');

-- デフォルト役職
INSERT INTO positions (id, name, code, level, is_management, is_active) VALUES
    ('pos-ceo', '代表取締役', 'CEO', 10, TRUE, TRUE),
    ('pos-cto', '技術取締役', 'CTO', 9, TRUE, TRUE),
    ('pos-director', '部長', 'DIR', 8, TRUE, TRUE),
    ('pos-manager', '課長', 'MGR', 6, TRUE, TRUE),
    ('pos-leader', 'リーダー', 'LDR', 4, TRUE, TRUE),
    ('pos-senior', 'シニア', 'SR', 3, FALSE, TRUE),
    ('pos-regular', '一般社員', 'REG', 2, FALSE, TRUE),
    ('pos-junior', 'ジュニア', 'JR', 1, FALSE, TRUE);