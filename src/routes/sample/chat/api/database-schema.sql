-- Customer Support Chat System Database Schema
-- このファイルは想定されるデータベース構造を示しています
-- 実際の実装では、使用するDBMS（PostgreSQL, MySQL等）に合わせて調整してください

-- =====================================
-- 1. オペレーター（サポート担当者）
-- =====================================
CREATE TABLE operators (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    department VARCHAR(100),
    role VARCHAR(50), -- 'senior', 'regular', 'supervisor'
    max_concurrent_chats INT DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- オペレーターのスキル
CREATE TABLE operator_skills (
    operator_id VARCHAR(50),
    skill_name VARCHAR(100),
    PRIMARY KEY (operator_id, skill_name),
    FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE
);

-- オペレーターのステータス履歴
CREATE TABLE operator_status_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    operator_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'available', 'busy', 'break', 'offline'
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (operator_id) REFERENCES operators(id)
);

-- =====================================
-- 2. 顧客情報
-- =====================================
CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    tier VARCHAR(20), -- 'ゴールド', 'シルバー', 'ブロンズ'
    is_vip BOOLEAN DEFAULT false,
    total_purchase_amount DECIMAL(12, 2) DEFAULT 0,
    registered_date TIMESTAMP,
    last_purchase_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================
-- 3. 問い合わせ
-- =====================================
CREATE TABLE inquiries (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    initial_message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'shipping', 'return', 'product', 'technical', 'billing', 'other'
    priority VARCHAR(20) DEFAULT 'normal', -- 'urgent', 'high', 'normal', 'low'
    status VARCHAR(20) DEFAULT 'waiting', -- 'waiting', 'assigned', 'resolved', 'cancelled'
    sla_deadline TIMESTAMP NOT NULL,
    locked_by VARCHAR(50), -- オペレーターが確認中の場合のロック
    locked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (locked_by) REFERENCES operators(id)
);

-- =====================================
-- 4. チャットセッション
-- =====================================
CREATE TABLE chat_sessions (
    id VARCHAR(50) PRIMARY KEY,
    inquiry_id VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    operator_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'hold', 'resolved', 'escalated'
    priority VARCHAR(20) DEFAULT 'normal',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    first_response_time TIMESTAMP,
    resolution VARCHAR(20), -- 'resolved', 'escalated', 'unresolved'
    resolution_summary TEXT,
    satisfaction_score INT, -- 1-5
    tags JSON, -- ['返品', '配送遅延', etc.]
    FOREIGN KEY (inquiry_id) REFERENCES inquiries(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (operator_id) REFERENCES operators(id)
);

-- =====================================
-- 5. メッセージ
-- =====================================
CREATE TABLE messages (
    id VARCHAR(50) PRIMARY KEY,
    chat_session_id VARCHAR(50) NOT NULL,
    sender_type VARCHAR(20) NOT NULL, -- 'customer', 'agent', 'system'
    sender_id VARCHAR(50),
    content TEXT NOT NULL,
    attachments JSON, -- [{url, type, name}]
    is_template BOOLEAN DEFAULT false,
    template_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_session_id) REFERENCES chat_sessions(id)
);

-- =====================================
-- 6. テンプレート返信
-- =====================================
CREATE TABLE response_templates (
    id VARCHAR(50) PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    placeholders JSON, -- ['agent_name', 'customer_name', etc.]
    usage_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES operators(id)
);

-- =====================================
-- 7. パフォーマンス統計（日次集計）
-- =====================================
CREATE TABLE daily_operator_stats (
    operator_id VARCHAR(50),
    stat_date DATE,
    total_chats INT DEFAULT 0,
    total_messages INT DEFAULT 0,
    avg_response_time_seconds INT,
    avg_resolution_time_minutes INT,
    resolved_count INT DEFAULT 0,
    escalated_count INT DEFAULT 0,
    satisfaction_avg DECIMAL(3, 2),
    PRIMARY KEY (operator_id, stat_date),
    FOREIGN KEY (operator_id) REFERENCES operators(id)
);

-- =====================================
-- インデックス
-- =====================================
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created ON inquiries(created_at);
CREATE INDEX idx_chat_sessions_operator ON chat_sessions(operator_id, status);
CREATE INDEX idx_chat_sessions_customer ON chat_sessions(customer_id);
CREATE INDEX idx_messages_chat ON messages(chat_session_id, created_at);
CREATE INDEX idx_operator_status_logs ON operator_status_logs(operator_id, changed_at);

-- =====================================
-- ビュー例
-- =====================================
-- アクティブなオペレーターの現在の負荷
CREATE VIEW operator_current_load AS
SELECT 
    o.id,
    o.name,
    o.max_concurrent_chats,
    COUNT(cs.id) as current_chats,
    (COUNT(cs.id) * 100.0 / o.max_concurrent_chats) as load_percentage,
    osl.status as current_status
FROM operators o
LEFT JOIN chat_sessions cs ON o.id = cs.operator_id AND cs.status = 'active'
LEFT JOIN (
    SELECT operator_id, status 
    FROM operator_status_logs 
    WHERE (operator_id, changed_at) IN (
        SELECT operator_id, MAX(changed_at) 
        FROM operator_status_logs 
        GROUP BY operator_id
    )
) osl ON o.id = osl.operator_id
WHERE o.is_active = true
GROUP BY o.id, o.name, o.max_concurrent_chats, osl.status;