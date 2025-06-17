-- 予約管理システム データベース設計
-- 
-- 想定RDBMS: PostgreSQL 14以上
-- 文字エンコーディング: UTF-8
-- タイムゾーン: Asia/Tokyo

-- ========================================
-- 診療科マスタ
-- ========================================
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,      -- 診療科コード (例: INT, PED, ORT)
    name VARCHAR(100) NOT NULL,            -- 診療科名
    description TEXT,                      -- 説明
    color VARCHAR(7),                      -- カレンダー表示色 (#RRGGBB)
    icon VARCHAR(50),                      -- アイコン名
    display_order INTEGER DEFAULT 0,       -- 表示順
    is_active BOOLEAN DEFAULT TRUE,        -- 有効フラグ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 医師マスタ
-- ========================================
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(20) UNIQUE NOT NULL,  -- 職員コード
    name VARCHAR(100) NOT NULL,                 -- 医師名
    name_kana VARCHAR(100),                     -- 医師名カナ
    email VARCHAR(255) UNIQUE,                  -- メールアドレス
    phone VARCHAR(20),                          -- 電話番号
    license_number VARCHAR(50),                 -- 医師免許番号
    avg_consultation_minutes INTEGER DEFAULT 30, -- 平均診察時間（分）
    color VARCHAR(7),                           -- カレンダー表示色
    is_active BOOLEAN DEFAULT TRUE,             -- 在籍フラグ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 医師診療科関連
-- ========================================
CREATE TABLE doctor_departments (
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,      -- 主診療科フラグ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (doctor_id, department_id)
);

-- ========================================
-- 医師専門分野
-- ========================================
CREATE TABLE doctor_specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    specialty VARCHAR(100) NOT NULL,       -- 専門分野名
    certification VARCHAR(255),            -- 認定資格
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 診察室マスタ
-- ========================================
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number VARCHAR(20) UNIQUE NOT NULL,    -- 部屋番号
    name VARCHAR(100) NOT NULL,                 -- 部屋名
    type VARCHAR(50) NOT NULL,                  -- 部屋タイプ (consultation/examination/treatment)
    floor INTEGER NOT NULL,                     -- 階数
    capacity INTEGER DEFAULT 1,                 -- 収容人数
    is_active BOOLEAN DEFAULT TRUE,             -- 利用可能フラグ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT room_type_check CHECK (type IN ('consultation', 'examination', 'treatment'))
);

-- ========================================
-- 医療機器マスタ
-- ========================================
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,           -- 機器コード
    name VARCHAR(100) NOT NULL,                 -- 機器名
    type VARCHAR(50) NOT NULL,                  -- 機器タイプ
    model VARCHAR(100),                         -- 型番
    room_id UUID REFERENCES rooms(id),         -- 設置場所
    is_portable BOOLEAN DEFAULT FALSE,          -- 可搬フラグ
    is_active BOOLEAN DEFAULT TRUE,             -- 利用可能フラグ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 診察室設備関連
-- ========================================
CREATE TABLE room_equipment (
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    PRIMARY KEY (room_id, equipment_id)
);

-- ========================================
-- 患者マスタ
-- ========================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_number VARCHAR(20) UNIQUE NOT NULL,  -- 患者番号
    name VARCHAR(100) NOT NULL,                  -- 患者名
    name_kana VARCHAR(100),                      -- 患者名カナ
    birth_date DATE NOT NULL,                    -- 生年月日
    gender VARCHAR(10),                          -- 性別
    blood_type VARCHAR(5),                       -- 血液型
    email VARCHAR(255),                          -- メールアドレス
    phone VARCHAR(20),                           -- 電話番号
    postal_code VARCHAR(10),                     -- 郵便番号
    address TEXT,                                -- 住所
    emergency_contact VARCHAR(100),              -- 緊急連絡先名
    emergency_phone VARCHAR(20),                 -- 緊急連絡先電話
    insurance_number VARCHAR(50),                -- 保険証番号
    allergies TEXT,                              -- アレルギー情報
    medical_history TEXT,                        -- 既往歴
    notes TEXT,                                  -- 備考
    is_active BOOLEAN DEFAULT TRUE,              -- 有効フラグ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 予約テーブル
-- ========================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(30) UNIQUE NOT NULL,      -- 予約番号
    patient_id UUID REFERENCES patients(id),        -- 患者ID
    doctor_id UUID REFERENCES doctors(id),          -- 医師ID
    department_id UUID REFERENCES departments(id),   -- 診療科ID
    room_id UUID REFERENCES rooms(id),              -- 診察室ID（NULL可）
    
    -- 予約日時
    booking_date DATE NOT NULL,                      -- 予約日
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,    -- 開始時刻
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,      -- 終了時刻
    
    -- 予約情報
    type VARCHAR(20) NOT NULL,                       -- 予約タイプ (first-visit/follow-up/emergency)
    status VARCHAR(20) NOT NULL,                     -- ステータス
    chief_complaint TEXT,                            -- 主訴
    notes TEXT,                                      -- 備考
    
    -- 来院情報
    checked_in_at TIMESTAMP WITH TIME ZONE,          -- 受付時刻
    consultation_started_at TIMESTAMP WITH TIME ZONE, -- 診察開始時刻
    consultation_ended_at TIMESTAMP WITH TIME ZONE,   -- 診察終了時刻
    
    -- 繰り返し予約
    is_recurring BOOLEAN DEFAULT FALSE,              -- 繰り返しフラグ
    recurring_pattern JSONB,                         -- 繰り返しパターン
    recurring_group_id UUID,                         -- 繰り返しグループID
    
    -- メタ情報
    created_by UUID,                                 -- 作成者
    updated_by UUID,                                 -- 更新者
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT booking_type_check CHECK (type IN ('first-visit', 'follow-up', 'emergency')),
    CONSTRAINT booking_status_check CHECK (status IN ('booked', 'checked-in', 'in-progress', 'completed', 'cancelled', 'no-show'))
);

-- ========================================
-- 予約機器関連
-- ========================================
CREATE TABLE booking_equipment (
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    PRIMARY KEY (booking_id, equipment_id)
);

-- ========================================
-- キャンセル待ちリスト
-- ========================================
CREATE TABLE waiting_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    department_id UUID REFERENCES departments(id),
    doctor_id UUID REFERENCES doctors(id),        -- NULL可（医師指定なし）
    preferred_date DATE NOT NULL,                  -- 希望日
    preferred_time_from TIME,                      -- 希望時間帯（開始）
    preferred_time_to TIME,                        -- 希望時間帯（終了）
    priority INTEGER DEFAULT 0,                    -- 優先度
    status VARCHAR(20) DEFAULT 'waiting',          -- ステータス
    notes TEXT,                                    -- 備考
    notified_at TIMESTAMP WITH TIME ZONE,          -- 通知日時
    responded_at TIMESTAMP WITH TIME ZONE,         -- 応答日時
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT waiting_status_check CHECK (status IN ('waiting', 'notified', 'accepted', 'declined', 'expired'))
);

-- ========================================
-- 医師勤務スケジュール
-- ========================================
CREATE TABLE doctor_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,                  -- 曜日 (0=日曜, 6=土曜)
    start_time TIME NOT NULL,                      -- 開始時刻
    end_time TIME NOT NULL,                        -- 終了時刻
    department_id UUID REFERENCES departments(id), -- 診療科（曜日によって異なる場合）
    room_id UUID REFERENCES rooms(id),            -- 診察室（固定の場合）
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT day_of_week_check CHECK (day_of_week >= 0 AND day_of_week <= 6),
    CONSTRAINT time_check CHECK (start_time < end_time)
);

-- ========================================
-- 医師休暇・不在スケジュール
-- ========================================
CREATE TABLE doctor_absences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    absence_date DATE NOT NULL,                    -- 不在日
    start_time TIME,                               -- 部分不在の開始時刻
    end_time TIME,                                 -- 部分不在の終了時刻
    type VARCHAR(20) NOT NULL,                     -- 不在タイプ (vacation/sick/conference/other)
    reason TEXT,                                   -- 理由
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT absence_type_check CHECK (type IN ('vacation', 'sick', 'conference', 'other'))
);

-- ========================================
-- インデックス
-- ========================================
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_patient ON bookings(patient_id);
CREATE INDEX idx_bookings_doctor ON bookings(doctor_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_waiting_list_patient ON waiting_list(patient_id);
CREATE INDEX idx_waiting_list_status ON waiting_list(status);
CREATE INDEX idx_doctor_schedules_doctor ON doctor_schedules(doctor_id);
CREATE INDEX idx_doctor_absences_doctor_date ON doctor_absences(doctor_id, absence_date);

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
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_waiting_list_updated_at BEFORE UPDATE ON waiting_list FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_schedules_updated_at BEFORE UPDATE ON doctor_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();