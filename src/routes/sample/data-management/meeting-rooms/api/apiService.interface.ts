/**
 * 会議室予約システム APIサービスインターフェース
 * 
 * 本実装時の改修ポイント:
 * 1. このインターフェースを実装する本番用クラスを作成
 * 2. DIコンテナやファクトリーパターンでインスタンスを切り替え
 * 3. テスト時はモックサービスを注入可能
 */

import type { 
  Booking, 
  Room, 
  User,
  Equipment,
  UsageStats,
  CrowdPrediction,
  RoomAnalytics,
  BookingFilter
} from '../types';

export interface IMeetingRoomApiService {
  // 予約関連
  getBookings(params?: BookingQueryParams): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking>;
  createBooking(booking: CreateBookingDto): Promise<Booking>;
  updateBooking(id: string, updates: UpdateBookingDto): Promise<Booking>;
  deleteBooking(id: string): Promise<void>;
  checkInBooking(id: string): Promise<Booking>;
  checkOutBooking(id: string): Promise<Booking>;
  
  // 会議室関連
  getRooms(params?: RoomQueryParams): Promise<Room[]>;
  getRoom(id: string): Promise<Room>;
  createRoom(roomData: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<Room>;
  updateRoom(id: string, updates: UpdateRoomDto): Promise<Room>;
  deleteRoom(id: string): Promise<void>;
  getRoomAvailability(roomId: string, date: string): Promise<TimeSlot[]>;
  
  // ユーザー関連
  getUsers(params?: UserQueryParams): Promise<User[]>;
  getUser(id: string): Promise<User>;
  getCurrentUser(): Promise<User>;
  updateUserProfile(id: string, updates: UpdateUserDto): Promise<User>;
  
  // 設備関連
  getEquipment(params?: EquipmentQueryParams): Promise<Equipment[]>;
  
  // 空き時間検索
  searchAvailableRooms(params: RoomSearchParams): Promise<RoomAvailability[]>;
  getAvailableTimeSlots(params: AvailabilityParams): Promise<TimeSlot[]>;
  
  // 統計・分析
  getUsageStats(params: UsageStatsParams): Promise<UsageStats>;
  getCrowdPrediction(date: string): Promise<CrowdPrediction>;
  getRoomAnalytics(params: RoomAnalyticsParams): Promise<RoomAnalytics>;
  
  // 承認フロー
  getBookingApprovals(params?: ApprovalQueryParams): Promise<Booking[]>;
  approveBooking(id: string, notes?: string): Promise<Booking>;
  rejectBooking(id: string, reason: string): Promise<Booking>;
  
  // 通知関連
  sendReminder(bookingId: string, type: 'email' | 'slack'): Promise<void>;
  updateNotificationSettings(userId: string, settings: NotificationSettings): Promise<void>;
}

// クエリパラメータ型定義
export interface BookingQueryParams {
  startDate?: string;
  endDate?: string;
  roomIds?: string[];
  userIds?: string[];
  departments?: string[];
  statuses?: string[];
  types?: string[];
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

export interface RoomQueryParams {
  buildingId?: string;
  floor?: number;
  type?: string;
  minCapacity?: number;
  maxCapacity?: number;
  equipment?: string[];
  available?: boolean;
  date?: string;
  timeSlot?: string;
}

export interface UserQueryParams {
  department?: string;
  role?: string;
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface EquipmentQueryParams {
  type?: string;
  roomId?: string;
  available?: boolean;
}

export interface RoomSearchParams {
  startTime: string;
  endTime: string;
  attendeeCount: number;
  requiredEquipment?: string[];
  preferredFloor?: number;
  buildingId?: string;
  excludeRoomIds?: string[];
}

export interface AvailabilityParams {
  roomIds?: string[];
  date: string;
  duration?: number;
  excludeBookingId?: string;
}

export interface UsageStatsParams {
  startDate: string;
  endDate: string;
  roomId?: string;
  department?: string;
  granularity?: 'daily' | 'weekly' | 'monthly';
}

export interface RoomAnalyticsParams {
  roomId: string;
  startDate: string;
  endDate: string;
}

export interface ApprovalQueryParams {
  status?: 'pending' | 'approved' | 'rejected';
  requesterId?: string;
  page?: number;
  limit?: number;
}

// DTOs (Data Transfer Objects)
export type CreateBookingDto = Omit<Booking, 
  'id' | 'bookingNumber' | 'userName' | 'userEmail' | 'userDepartment' | 
  'roomName' | 'roomCode' | 'createdAt' | 'updatedAt' | 'duration' | 
  'isToday' | 'timeUntilStart'
>;

export type UpdateBookingDto = Partial<Pick<Booking,
  'startTime' | 'endTime' | 'title' | 'description' | 'attendeeCount' |
  'type' | 'status' | 'requiredEquipment' | 'cateringRequired' |
  'cateringDetails' | 'reminderSettings'
>>;

export type UpdateRoomDto = Partial<Pick<Room,
  'name' | 'capacity' | 'description' | 'equipment' | 'color' |
  'isActive' | 'accessControl'
>>;

export type UpdateUserDto = Partial<Pick<User,
  'name' | 'email' | 'department' | 'phoneNumber'
>>;

// レスポンス型
export interface TimeSlot {
  time: string;
  available: boolean;
  conflictBookings?: Booking[];
  suggestedEndTime?: string;
}

export interface RoomAvailability {
  room: Room;
  availableSlots: TimeSlot[];
  nextAvailableSlot?: TimeSlot;
  conflictCount: number;
}

export interface NotificationSettings {
  email15min: boolean;
  email1hour: boolean;
  email1day: boolean;
  slackNotification: boolean;
  smsNotification: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
  links?: {
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
}

// 予約競合チェック用
export interface ConflictCheck {
  hasConflict: boolean;
  conflicts: Booking[];
  suggestions: {
    alternativeRooms: Room[];
    alternativeTimeSlots: TimeSlot[];
  };
}

// バルク操作用
export interface BulkOperation<T> {
  success: T[];
  errors: {
    item: T;
    error: ApiError;
  }[];
}

// 会議室利用レポート用
export interface RoomUtilizationReport {
  period: {
    startDate: string;
    endDate: string;
  };
  overview: {
    totalRooms: number;
    totalBookings: number;
    averageUtilization: number;
    totalRevenue?: number;
  };
  roomBreakdown: {
    roomId: string;
    roomName: string;
    utilizationRate: number;
    bookingCount: number;
    revenue?: number;
  }[];
  departmentBreakdown: {
    department: string;
    bookingCount: number;
    totalHours: number;
    utilizationPercentage: number;
  }[];
  trends: {
    date: string;
    utilizationRate: number;
    bookingCount: number;
  }[];
}