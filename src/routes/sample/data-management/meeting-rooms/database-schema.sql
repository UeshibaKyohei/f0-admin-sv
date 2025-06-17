-- 会議室予約システム データベース設計
-- 
-- 想定RDBMS: PostgreSQL 14以上
-- 文字エンコーディング: UTF-8
-- タイムゾーン: Asia/Tokyo

-- ========================================
-- ユーザーマスタ
-- ========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(20) UNIQUE NOT NULL,   -- 社員ID
    name VARCHAR(100) NOT NULL,                -- 氏名
    email VARCHAR(255) UNIQUE NOT NULL,        -- メールアドレス
    department VARCHAR(100) NOT NULL,          -- 部署名
    role VARCHAR(20) NOT NULL,                 -- admin/manager/user/guest
    phone_number VARCHAR(20),                  -- 電話番号
    slack_user_id VARCHAR(50),                 -- Slack連携用ID
    is_active BOOLEAN DEFAULT TRUE,            -- 有効フラグ
    last_login_at TIMESTAMP WITH TIME ZONE,    -- 最終ログイン日時
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'user', 'guest'))
);

-- ========================================
-- 建物・フロアマスタ
-- ========================================
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,                -- 建物名
    code VARCHAR(10) UNIQUE NOT NULL,          -- 建物コード
    address TEXT,                              -- 住所
    floors INTEGER DEFAULT 1,                  -- 総階数
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 設備マスタ
-- ========================================
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,                -- 設備名
    type VARCHAR(50) NOT NULL,                 -- projector/whiteboard/tv/videoconf等
    description TEXT,                          -- 説明
    icon VARCHAR(50),                          -- アイコン名
    operating_instructions TEXT,               -- 操作説明
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT equipment_type_check CHECK (type IN ('projector', 'whiteboard', 'tv', 'videoconf', 'sound', 'wifi', 'phone', 'coffee'))
);

-- ========================================
-- 会議室マスタ
-- ========================================
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,                -- 会議室名
    code VARCHAR(20) UNIQUE NOT NULL,          -- 会議室コード（例：A1-01）
    type VARCHAR(50) NOT NULL,                 -- meeting/conference/training/phone-booth
    building_id UUID REFERENCES buildings(id), -- 建物ID
    floor INTEGER NOT NULL,                    -- 階数
    capacity INTEGER NOT NULL,                 -- 収容人数
    area DECIMAL(8,2),                         -- 面積（㎡）
    description TEXT,                          -- 説明
    image_url TEXT,                           -- 画像URL
    color VARCHAR(7) DEFAULT '#3b82f6',       -- カレンダー表示色
    hourly_rate DECIMAL(10,2),                -- 時間単価（外部利用時）
    
    -- 位置情報（フロアマップ用）
    map_position_x INTEGER,                   -- X座標
    map_position_y INTEGER,                   -- Y座標
    
    -- アクセス制御
    require_approval BOOLEAN DEFAULT FALSE,   -- 承認必須フラグ
    allowed_departments TEXT[],               -- 利用可能部署（配列）
    allowed_roles TEXT[],                     -- 利用可能権限（配列）
    
    -- ステータス
    is_active BOOLEAN DEFAULT TRUE,           -- 利用可能フラグ
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT rooms_type_check CHECK (type IN ('meeting', 'conference', 'training', 'phone-booth', 'lounge')),
    CONSTRAINT rooms_capacity_check CHECK (capacity > 0),
    CONSTRAINT rooms_floor_check CHECK (floor >= 0)
);

-- ========================================
-- 会議室設備関連
-- ========================================
CREATE TABLE room_equipment (
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,               -- 設備数量
    installation_date DATE,                   -- 設置日
    maintenance_schedule DATE,                -- 次回メンテナンス予定
    PRIMARY KEY (room_id, equipment_id)
);

-- ========================================
-- 予約テーブル
-- ========================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(30) UNIQUE NOT NULL, -- 予約番号
    user_id UUID REFERENCES users(id),         -- 予約者ID
    room_id UUID REFERENCES rooms(id),         -- 会議室ID
    
    -- 予約日時
    start_time TIMESTAMP WITH TIME ZONE NOT NULL, -- 開始時刻
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,   -- 終了時刻
    
    -- 予約情報
    type VARCHAR(20) NOT NULL,                  -- meeting/presentation/training/interview/other
    status VARCHAR(20) NOT NULL,                -- confirmed/pending/cancelled/completed/no-show
    title VARCHAR(200) NOT NULL,                -- 会議タイトル
    description TEXT,                           -- 会議内容・目的
    attendee_count INTEGER DEFAULT 1,           -- 参加予定人数
    
    -- 外部参加者
    external_attendees JSONB,                   -- 外部参加者情報（JSON配列）
    
    -- ケータリング・サービス
    catering_required BOOLEAN DEFAULT FALSE,    -- ケータリング要否
    catering_details TEXT,                      -- ケータリング詳細
    
    -- 承認フロー
    approval_required BOOLEAN DEFAULT FALSE,    -- 承認必須フラグ
    approved_by UUID REFERENCES users(id),     -- 承認者ID
    approved_at TIMESTAMP WITH TIME ZONE,      -- 承認日時
    approval_notes TEXT,                        -- 承認時メモ
    
    -- 料金情報（外部利用時）
    total_cost DECIMAL(10,2),                   -- 総費用
    payment_status VARCHAR(20),                 -- pending/paid/cancelled
    
    -- 繰り返し予約
    is_recurring BOOLEAN DEFAULT FALSE,         -- 繰り返しフラグ
    recurring_pattern JSONB,                    -- 繰り返しパターン（JSON）
    recurring_group_id UUID,                    -- 繰り返しグループID
    
    -- 通知設定
    reminder_settings JSONB,                    -- リマインダー設定（JSON）
    
    -- チェックイン情報
    checked_in_at TIMESTAMP WITH TIME ZONE,     -- チェックイン時刻
    checked_out_at TIMESTAMP WITH TIME ZONE,    -- チェックアウト時刻
    actual_start_time TIMESTAMP WITH TIME ZONE, -- 実際の開始時刻
    actual_end_time TIMESTAMP WITH TIME ZONE,   -- 実際の終了時刻
    
    -- メタ情報
    created_by UUID REFERENCES users(id),       -- 作成者
    updated_by UUID REFERENCES users(id),       -- 更新者
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT bookings_type_check CHECK (type IN ('meeting', 'presentation', 'training', 'interview', 'other')),
    CONSTRAINT bookings_status_check CHECK (status IN ('confirmed', 'pending', 'cancelled', 'completed', 'no-show')),
    CONSTRAINT bookings_time_check CHECK (start_time < end_time),
    CONSTRAINT bookings_attendee_check CHECK (attendee_count > 0),
    CONSTRAINT bookings_payment_status_check CHECK (payment_status IN ('pending', 'paid', 'cancelled'))
);

-- ========================================
-- 予約参加者
-- ========================================
CREATE TABLE booking_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),         -- 参加者ID（NULL可：外部参加者）
    name VARCHAR(100) NOT NULL,                -- 参加者名
    email VARCHAR(255) NOT NULL,               -- メールアドレス
    department VARCHAR(100),                   -- 部署
    role VARCHAR(20),                          -- organizer/presenter/attendee
    response_status VARCHAR(20) DEFAULT 'pending', -- pending/accepted/declined
    response_at TIMESTAMP WITH TIME ZONE,      -- 回答日時
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT attendee_role_check CHECK (role IN ('organizer', 'presenter', 'attendee')),
    CONSTRAINT attendee_response_check CHECK (response_status IN ('pending', 'accepted', 'declined'))
);

-- ========================================
-- 予約設備使用
-- ========================================
CREATE TABLE booking_equipment (
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,                -- 使用数量
    setup_instructions TEXT,                   -- セットアップ指示
    PRIMARY KEY (booking_id, equipment_id)
);

-- ========================================
-- 会議室利用制限
-- ========================================
CREATE TABLE room_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    restriction_date DATE NOT NULL,            -- 制限日
    start_time TIME,                           -- 制限開始時刻（NULL=全日）
    end_time TIME,                             -- 制限終了時刻
    reason VARCHAR(200) NOT NULL,              -- 制限理由
    restriction_type VARCHAR(50) NOT NULL,     -- maintenance/event/cleaning/other
    created_by UUID REFERENCES users(id),      -- 作成者
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT restriction_type_check CHECK (restriction_type IN ('maintenance', 'event', 'cleaning', 'other')),
    CONSTRAINT restriction_time_check CHECK (start_time IS NULL OR end_time IS NULL OR start_time < end_time)
);

-- ========================================
-- 利用統計（集計テーブル）
-- ========================================
CREATE TABLE usage_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,                        -- 対象日
    room_id UUID REFERENCES rooms(id),         -- 会議室ID（NULL=全体統計）
    department VARCHAR(100),                   -- 部署（NULL=全部署統計）
    
    -- 統計データ
    total_bookings INTEGER DEFAULT 0,          -- 総予約数
    completed_bookings INTEGER DEFAULT 0,      -- 完了予約数
    cancelled_bookings INTEGER DEFAULT 0,      -- キャンセル予約数
    no_show_bookings INTEGER DEFAULT 0,        -- 無断キャンセル予約数
    total_hours DECIMAL(8,2) DEFAULT 0,        -- 総利用時間
    utilization_rate DECIMAL(5,2) DEFAULT 0,   -- 利用率（%）
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(date, room_id, department)
);

-- ========================================
-- システム設定
-- ========================================
CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,              -- 設定キー
    value TEXT NOT NULL,                       -- 設定値（JSON形式可）
    description TEXT,                          -- 説明
    updated_by UUID REFERENCES users(id),      -- 更新者
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 通知ログ
-- ========================================
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),   -- 関連予約ID
    user_id UUID REFERENCES users(id),         -- 通知対象ユーザー
    type VARCHAR(50) NOT NULL,                 -- email/slack/sms/push
    event VARCHAR(50) NOT NULL,                -- reminder/booking_confirmed/booking_cancelled等
    content TEXT,                              -- 通知内容
    sent_at TIMESTAMP WITH TIME ZONE,          -- 送信日時
    status VARCHAR(20) DEFAULT 'pending',      -- pending/sent/failed
    error_message TEXT,                        -- エラーメッセージ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT notification_type_check CHECK (type IN ('email', 'slack', 'sms', 'push')),
    CONSTRAINT notification_status_check CHECK (status IN ('pending', 'sent', 'failed'))
);

-- ========================================
-- インデックス
-- ========================================
CREATE INDEX idx_bookings_date ON bookings(DATE(start_time));
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_room ON bookings(room_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_bookings_end_time ON bookings(end_time);
CREATE INDEX idx_bookings_recurring ON bookings(recurring_group_id) WHERE recurring_group_id IS NOT NULL;
CREATE INDEX idx_rooms_building_floor ON rooms(building_id, floor);
CREATE INDEX idx_rooms_capacity ON rooms(capacity);
CREATE INDEX idx_rooms_type ON rooms(type);
CREATE INDEX idx_usage_statistics_date ON usage_statistics(date);
CREATE INDEX idx_notification_logs_user_event ON notification_logs(user_id, event);

-- ========================================
-- 全文検索インデックス（PostgreSQL）
-- ========================================
CREATE INDEX idx_bookings_fts ON bookings USING gin(to_tsvector('japanese', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_rooms_fts ON rooms USING gin(to_tsvector('japanese', name || ' ' || COALESCE(description, '')));

-- ========================================
-- トリガー関数：更新日時自動更新
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルに更新日時トリガーを設定
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 予約番号自動生成関数
-- ========================================
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_number IS NULL THEN
        NEW.booking_number := 'BK' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(EXTRACT(EPOCH FROM NOW())::bigint % 10000, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_booking_number_trigger BEFORE INSERT ON bookings FOR EACH ROW EXECUTE FUNCTION generate_booking_number();

-- ========================================
-- 利用統計自動更新関数
-- ========================================
CREATE OR REPLACE FUNCTION update_usage_statistics()
RETURNS TRIGGER AS $$
DECLARE
    booking_date DATE;
    duration_hours DECIMAL(8,2);
BEGIN
    -- 新規作成または完了ステータス変更時のみ処理
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'completed') THEN
        booking_date := DATE(NEW.start_time);
        duration_hours := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600.0;
        
        -- 会議室別統計更新
        INSERT INTO usage_statistics (date, room_id, total_bookings, completed_bookings, total_hours)
        VALUES (booking_date, NEW.room_id, 1, CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END, duration_hours)
        ON CONFLICT (date, room_id, department) DO UPDATE SET
            total_bookings = usage_statistics.total_bookings + 1,
            completed_bookings = usage_statistics.completed_bookings + CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
            total_hours = usage_statistics.total_hours + duration_hours;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usage_statistics_trigger AFTER INSERT OR UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_usage_statistics();

-- ========================================
-- 初期データ投入
-- ========================================

-- システム設定の初期データ
INSERT INTO system_settings (key, value, description) VALUES
('business_hours_start', '08:00', '営業開始時刻'),
('business_hours_end', '22:00', '営業終了時刻'),
('slot_duration_minutes', '30', '予約時間単位（分）'),
('max_advance_booking_days', '30', '最大予約可能日数'),
('cancellation_deadline_hours', '1', 'キャンセル期限（時間前）'),
('email_notifications_enabled', 'true', 'メール通知有効フラグ'),
('slack_webhook_url', '', 'Slack通知用Webhook URL');

-- 建物の初期データ
INSERT INTO buildings (name, code, address, floors) VALUES
('本社ビル', 'HQ', '東京都渋谷区○○1-2-3', 5),
('別館', 'ANNEX', '東京都渋谷区○○1-2-4', 3);

-- 設備の初期データ
INSERT INTO equipment (name, type, description, icon) VALUES
('プロジェクター', 'projector', 'HD対応プロジェクター', 'projector'),
('ホワイトボード', 'whiteboard', '大型ホワイトボード', 'whiteboard'),
('大型TV', 'tv', '65インチ4K TV', 'tv'),
('ビデオ会議システム', 'videoconf', 'Zoom Rooms対応', 'videoconf'),
('音響システム', 'sound', 'マイク・スピーカー', 'sound'),
('Wi-Fi', 'wifi', '高速無線LAN', 'wifi'),
('電話機', 'phone', '会議用電話機', 'phone'),
('コーヒーマシン', 'coffee', 'エスプレッソマシン', 'coffee');

-- ========================================
-- パフォーマンス最適化
-- ========================================

-- パーティショニング設定（大規模運用時）
-- 月単位でパーティショニング
-- CREATE TABLE bookings_2024_01 PARTITION OF bookings
--   FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- 古いデータのアーカイブ設定
-- CREATE TABLE bookings_archive (LIKE bookings INCLUDING ALL);

-- 統計情報の更新
ANALYZE;