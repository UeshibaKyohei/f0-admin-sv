// 会議室予約システム - 型定義
// 
// 注意: この型定義はRDBスキーマ（database-schema.sql）と対応しています。
// 本実装時はORMやクエリビルダーから生成される型を使用することを推奨します。

// 基本的な型（DBの制約と一致）
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show';
export type BookingType = 'meeting' | 'presentation' | 'training' | 'interview' | 'other';
export type RoomType = 'meeting' | 'conference' | 'training' | 'phone-booth' | 'lounge';
export type EquipmentType = 'projector' | 'whiteboard' | 'tv' | 'videoconf' | 'sound' | 'wifi' | 'phone' | 'coffee';
export type UserRole = 'admin' | 'manager' | 'user' | 'guest';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

/**
 * ユーザー情報
 * DBテーブル: users
 */
export interface User {
  id: string;                    // UUID, PRIMARY KEY
  employeeId?: string;           // employee_id: 社員ID（本実装時は必須）
  name: string;                  // name: 氏名
  email: string;                 // email: メールアドレス
  department: string;            // department: 部署名
  role: UserRole;                // role: ユーザー権限
  isActive: boolean;             // is_active: 有効フラグ
  phoneNumber?: string;          // phone_number: 電話番号
  slackUserId?: string;          // slack_user_id: Slack連携用ID
  // 以下、計算値・拡張フィールド
  lastLoginAt?: string;          // 最終ログイン日時
  totalBookings?: number;        // 総予約回数
  // メタ情報
  createdAt?: string;            // created_at: 作成日時
  updatedAt?: string;            // updated_at: 更新日時
}

/**
 * 会議室情報
 * DBテーブル: rooms
 */
export interface Room {
  id: string;                    // UUID, PRIMARY KEY
  name: string;                  // name: 会議室名
  code: string;                  // code: 会議室コード（例：A1-01）
  type: RoomType;                // type: 会議室タイプ
  floor: number;                 // floor: 階数
  building?: string;             // building: 棟名
  capacity: number;              // capacity: 収容人数
  area?: number;                 // area: 面積（㎡）
  hourlyRate?: number;           // hourly_rate: 時間単価（外部利用時）
  description?: string;          // description: 説明
  imageUrl?: string;             // image_url: 画像URL
  color: string;                 // color: カレンダー表示色
  isActive: boolean;             // is_active: 利用可能フラグ
  // 設備情報（room_equipment経由で取得）
  equipment: string[];           // equipment IDs配列
  features?: string[];           // 特徴・設備の説明
  // 位置情報
  mapPosition?: {                // 地図上の位置（フロアマップ用）
    x: number;
    y: number;
  };
  // 利用制限
  accessControl?: {              // アクセス制御設定
    requireApproval: boolean;    // 承認必須フラグ
    allowedDepartments?: string[]; // 利用可能部署
    allowedRoles?: UserRole[];   // 利用可能権限
  };
  // メタ情報
  createdAt?: string;            // created_at: 作成日時
  updatedAt?: string;            // updated_at: 更新日時
}

/**
 * 設備情報
 * DBテーブル: equipment
 */
export interface Equipment {
  id: string;                    // UUID, PRIMARY KEY
  name: string;                  // name: 設備名
  type: EquipmentType;           // type: 設備タイプ
  description?: string;          // description: 説明
  icon?: string;                 // icon: アイコン名
  isActive: boolean;             // is_active: 利用可能フラグ
  // 本実装時の拡張フィールド
  maintenanceSchedule?: string[]; // メンテナンススケジュール
  operatingInstructions?: string; // 操作説明
}

/**
 * 予約情報
 * DBテーブル: bookings
 */
export interface Booking {
  id: string;                    // UUID, PRIMARY KEY
  bookingNumber?: string;        // booking_number: 予約番号（本実装時は必須）
  userId: string;                // user_id: 予約者ID (FK)
  userName: string;              // JOINで取得: users.name
  userEmail: string;             // JOINで取得: users.email
  userDepartment: string;        // JOINで取得: users.department
  roomId: string;                // room_id: 会議室ID (FK)
  roomName: string;              // JOINで取得: rooms.name
  roomCode: string;              // JOINで取得: rooms.code
  startTime: string;             // start_time: 開始時刻 (ISO 8601, TIMESTAMP WITH TIME ZONE)
  endTime: string;               // end_time: 終了時刻 (ISO 8601, TIMESTAMP WITH TIME ZONE)
  type: BookingType;             // type: 予約タイプ
  status: BookingStatus;         // status: ステータス
  title: string;                 // title: 会議タイトル
  description?: string;          // description: 会議内容・目的
  attendeeCount: number;         // attendee_count: 参加予定人数
  // 参加者情報
  attendees?: Attendee[];        // 参加者リスト（別テーブルまたはJSON）
  externalAttendees?: string[];  // 外部参加者（メールアドレス等）
  // 設備・サービス
  requiredEquipment?: string[];  // booking_equipment経由で取得
  cateringRequired?: boolean;    // catering_required: ケータリング要否
  cateringDetails?: string;      // catering_details: ケータリング詳細
  // 承認フロー
  approvalRequired: boolean;     // approval_required: 承認必須フラグ
  approvedBy?: string;           // approved_by: 承認者ID
  approvedAt?: string;           // approved_at: 承認日時
  approvalNotes?: string;        // approval_notes: 承認時メモ
  // 料金情報（外部利用時）
  totalCost?: number;            // total_cost: 総費用
  paymentStatus?: 'pending' | 'paid' | 'cancelled'; // payment_status: 支払い状況
  // 繰り返し予約
  isRecurring: boolean;          // is_recurring: 繰り返しフラグ
  recurringPattern?: RecurringPattern; // recurring_pattern: 繰り返しパターン
  recurringGroupId?: string;     // recurring_group_id: 繰り返しグループID
  // 通知設定
  reminderSettings?: ReminderSettings; // リマインダー設定
  // チェックイン情報
  checkedInAt?: string;          // checked_in_at: チェックイン時刻
  checkedOutAt?: string;         // checked_out_at: チェックアウト時刻
  actualStartTime?: string;      // actual_start_time: 実際の開始時刻
  actualEndTime?: string;        // actual_end_time: 実際の終了時刻
  // メタ情報
  createdAt: string;             // created_at: 作成日時
  updatedAt: string;             // updated_at: 更新日時
  createdBy?: string;            // created_by: 作成者ID
  updatedBy?: string;            // updated_by: 更新者ID
  // UI表示用計算値
  duration?: number;             // 予約時間（分）
  isToday?: boolean;             // 今日の予約かどうか
  timeUntilStart?: number;       // 開始まであと何分
}

/**
 * 参加者情報
 */
export interface Attendee {
  userId: string;                // user_id: ユーザーID
  name: string;                  // 参加者名
  email: string;                 // メールアドレス
  department?: string;           // 部署
  role?: 'organizer' | 'presenter' | 'attendee'; // 役割
  responseStatus?: 'pending' | 'accepted' | 'declined'; // 出席回答
  responseAt?: string;           // 回答日時
}

/**
 * 繰り返し予約パターン
 */
export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;              // 間隔（毎N日/週/月）
  daysOfWeek?: DayOfWeek[];      // 曜日指定（週次の場合）
  dayOfMonth?: number;           // 日付指定（月次の場合）
  endDate?: string;              // 終了日
  occurrences?: number;          // 回数制限
}

/**
 * リマインダー設定
 */
export interface ReminderSettings {
  email15min?: boolean;          // 15分前メール通知
  email1hour?: boolean;          // 1時間前メール通知
  email1day?: boolean;           // 1日前メール通知
  slackNotification?: boolean;   // Slack通知
  smsNotification?: boolean;     // SMS通知
}

/**
 * フィルター条件
 */
export interface BookingFilter {
  startDate?: string;            // 開始日
  endDate?: string;              // 終了日
  roomIds?: string[];            // 会議室ID配列
  userIds?: string[];            // ユーザーID配列
  departments?: string[];        // 部署配列
  statuses?: BookingStatus[];    // ステータス配列
  types?: BookingType[];         // タイプ配列
  searchText?: string;           // テキスト検索
  capacityMin?: number;          // 最小収容人数
  capacityMax?: number;          // 最大収容人数
  requiredEquipment?: string[];  // 必要設備
  floor?: number;                // 階数
  building?: string;             // 棟名
}

/**
 * 利用統計データ
 */
export interface UsageStats {
  date: string;                  // 対象日
  totalBookings: number;         // 総予約数
  completedBookings: number;     // 完了予約数
  cancelledBookings: number;     // キャンセル予約数
  noShowBookings: number;        // 無断キャンセル予約数
  utilizationRate: number;       // 利用率（%）
  averageBookingDuration: number; // 平均予約時間（分）
  peakHours: string[];           // ピーク時間帯
  // 部署別統計
  departmentStats: {
    [department: string]: {
      bookings: number;
      duration: number;           // 総利用時間（分）
      utilizationRate: number;    // 部署別利用率
    };
  };
  // 会議室別統計
  roomStats: {
    [roomId: string]: {
      bookings: number;
      utilizationRate: number;
      averageDuration: number;
    };
  };
}

/**
 * 混雑予測データ
 */
export interface CrowdPrediction {
  date: string;                  // 予測対象日
  hourlyPredictions: {
    hour: number;                // 時間（0-23）
    occupancyRate: number;       // 占有率（0-1）
    availableRooms: number;      // 利用可能会議室数
    confidence: number;          // 予測信頼度（0-1）
  }[];
  peakHours: number[];           // 混雑予想時間
  recommendations: string[];     // 推奨事項
  alternativeSlots?: {           // 代替時間帯提案
    startTime: string;
    endTime: string;
    availableRooms: string[];
  }[];
}

/**
 * 会議室稼働分析データ
 */
export interface RoomAnalytics {
  roomId: string;
  roomName: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalHours: number;            // 総利用可能時間
  bookedHours: number;           // 予約済み時間
  utilizationRate: number;       // 稼働率
  averageBookingDuration: number; // 平均予約時間
  totalBookings: number;         // 総予約数
  departmentUsage: {             // 部署別利用状況
    department: string;
    hours: number;
    percentage: number;
  }[];
  popularTimeSlots: {            // 人気時間帯
    hour: number;
    bookingCount: number;
  }[];
  revenue?: number;              // 売上（外部利用時）
}