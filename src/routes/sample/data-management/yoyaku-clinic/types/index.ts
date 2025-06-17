// 予約管理システム - 医療クリニック版 型定義
// 
// 注意: この型定義はRDBスキーマ（database-schema.sql）と対応しています。
// 本実装時はORMやクエリビルダーから生成される型を使用することを推奨します。

// 基本的な型（DBの制約と一致）
export type BookingStatus = 'booked' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
export type BookingType = 'first-visit' | 'follow-up' | 'emergency' | 'checkup';
export type DepartmentType = 'internal' | 'pediatrics' | 'orthopedics';
export type RoomType = 'consultation' | 'examination' | 'treatment';
export type EquipmentType = 'xray' | 'ultrasound' | 'endoscope' | 'ecg' | 'blood-test';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

/**
 * 患者情報
 * DBテーブル: patients
 */
export interface Patient {
  id: string;                    // UUID, PRIMARY KEY
  patientNumber?: string;        // patient_number: 患者番号（本実装時は必須）
  name: string;                  // name: 患者名
  kana: string;                  // name_kana: 患者名カナ
  birthDate: string;             // birth_date: 生年月日 (YYYY-MM-DD)
  gender: 'male' | 'female' | 'other'; // gender: 性別
  phone: string;                 // phone: 電話番号
  email?: string;                // email: メールアドレス
  insuranceNumber?: string;      // insurance_number: 保険証番号
  lastVisitDate?: string;        // 計算値: 最終来院日（bookingsテーブルから導出）
  noShowCount: number;           // 計算値: 無断キャンセル回数（bookingsテーブルから集計）
  tags?: string[];               // 拡張用: タグ情報（別テーブルで管理することを推奨）
  // 以下、DBには存在するがUIで未使用のフィールド
  // bloodType?: string;         // blood_type: 血液型
  // postalCode?: string;        // postal_code: 郵便番号
  // address?: string;           // address: 住所
  // emergencyContact?: string;  // emergency_contact: 緊急連絡先名
  // emergencyPhone?: string;    // emergency_phone: 緊急連絡先電話
  // allergies?: string;         // allergies: アレルギー情報
  // medicalHistory?: string;    // medical_history: 既往歴
  // notes?: string;             // notes: 備考
}

/**
 * 医師情報
 * DBテーブル: doctors
 * 関連テーブル: doctor_departments, doctor_specialties, doctor_schedules
 */
export interface Doctor {
  id: string;                      // UUID, PRIMARY KEY
  employeeCode?: string;           // employee_code: 職員コード（本実装時は必須）
  name: string;                    // name: 医師名
  kana: string;                    // name_kana: 医師名カナ
  departmentIds: string[];         // doctor_departments経由で取得
  specialties: string[];           // doctor_specialties.specialtyから取得
  schedule: DoctorSchedule;        // doctor_schedules, doctor_absencesから構築
  averageConsultationTime: number; // avg_consultation_minutes: 平均診察時間（分）
  color: string;                   // color: カレンダー表示用色
  maxPatientsPerDay: number;       // 拡張用: 1日の最大患者数（業務ルール）
  isActive: boolean;               // is_active: 在籍フラグ
  // 以下、DBには存在するがUIで未使用のフィールド
  // email?: string;               // email: メールアドレス
  // phone?: string;               // phone: 電話番号
  // licenseNumber?: string;       // license_number: 医師免許番号
}

// 医師のスケジュール
export interface DoctorSchedule {
  regularHours: {
    [key in DayOfWeek]?: TimeSlot[];
  };
  vacations: DateRange[];
  specialSchedules: SpecialSchedule[];
}

// 時間枠
export interface TimeSlot {
  startTime: string; // "09:00"
  endTime: string; // "12:00"
  maxBookings?: number;
}

// 日付範囲
export interface DateRange {
  startDate: string;
  endDate: string;
  reason?: string;
}

// 特別スケジュール
export interface SpecialSchedule {
  date: string;
  timeSlots: TimeSlot[];
  reason?: string;
}

// 診療科
export interface Department {
  id: string;
  name: string;
  type: DepartmentType;
  color: string;
  defaultConsultationTime: number; // 分
  requiredEquipment?: string[];
}

// 診察室
export interface Room {
  id: string;
  name: string;
  floor: number;
  type: RoomType;
  equipment: string[];
  capacity: number;
  isActive: boolean;
}

// 医療機器
export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  roomId?: string;
  isPortable: boolean;
  maintenanceSchedule: DateRange[];
  isActive: boolean;
}

/**
 * 予約情報
 * DBテーブル: bookings
 * 関連テーブル: booking_equipment
 */
export interface Booking {
  id: string;                    // UUID, PRIMARY KEY
  bookingNumber?: string;        // booking_number: 予約番号（本実装時は必須）
  patientId: string;             // patient_id: 患者ID (FK)
  patientName: string;           // JOINで取得: patients.name
  doctorId: string;              // doctor_id: 医師ID (FK)
  doctorName: string;            // JOINで取得: doctors.name
  roomId?: string;               // room_id: 診察室ID (FK, NULL可)
  roomName?: string;             // JOINで取得: rooms.name
  equipmentIds?: string[];       // booking_equipment経由で取得
  departmentId: string;          // department_id: 診療科ID (FK)
  departmentName: string;        // JOINで取得: departments.name
  startTime: string;             // start_time: 開始時刻 (ISO 8601, TIMESTAMP WITH TIME ZONE)
  endTime: string;               // end_time: 終了時刻 (ISO 8601, TIMESTAMP WITH TIME ZONE)
  type: BookingType;             // type: 予約タイプ
  status: BookingStatus;         // status: ステータス
  chiefComplaint?: string;       // chief_complaint: 主訴
  notes?: string;                // notes: 備考
  isRecurring: boolean;          // is_recurring: 繰り返しフラグ
  recurringGroupId?: string;     // recurring_group_id: 繰り返しグループID
  waitingNumber?: number;        // 計算値: 待ち番号（当日の順番）
  // 実績時間
  checkedInAt?: string;          // checked_in_at: 受付時刻
  actualStartTime?: string;      // consultation_started_at: 診察開始時刻
  actualEndTime?: string;        // consultation_ended_at: 診察終了時刻
  // メタ情報
  createdAt: string;             // created_at: 作成日時
  updatedAt: string;             // updated_at: 更新日時
  createdBy?: string;            // created_by: 作成者ID
  updatedBy?: string;            // updated_by: 更新者ID
}

// 繰り返し予約パターン
export interface RecurringPattern {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: DayOfWeek[];
  dayOfMonth?: number;
  endDate?: string;
  occurrences?: number;
}

// 繰り返し予約
export interface RecurringBooking {
  id: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  pattern: RecurringPattern;
  baseStartTime: string;
  duration: number; // 分
  bookings: string[]; // Booking IDs
}

// キャンセル待ち
export interface WaitingList {
  id: string;
  patientId: string;
  patientName: string;
  preferredDoctorIds: string[];
  departmentId: string;
  preferredDates: string[];
  flexibility: 'high' | 'medium' | 'low';
  notes?: string;
  createdAt: string;
  notifiedAt?: string;
  status: 'waiting' | 'notified' | 'booked' | 'expired';
}

// 統計データ
export interface DailyStats {
  date: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  averageWaitingTime: number; // 分
  occupancyRate: number; // パーセント
  departmentStats: {
    [departmentId: string]: {
      bookings: number;
      revenue: number;
    };
  };
}

// AI予測データ
export interface CrowdPrediction {
  date: string;
  hourlyPredictions: {
    hour: number;
    expectedPatients: number;
    confidence: number;
    recommendedStaff: number;
  }[];
  peakHours: number[];
  recommendations: string[];
}

// フィルター条件
export interface BookingFilter {
  startDate?: string;
  endDate?: string;
  doctorIds?: string[];
  departmentIds?: string[];
  roomIds?: string[];
  statuses?: BookingStatus[];
  types?: BookingType[];
  searchText?: string;
}