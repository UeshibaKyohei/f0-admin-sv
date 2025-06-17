/**
 * APIサービスインターフェース
 * 
 * 本実装時の改修ポイント:
 * 1. このインターフェースを実装する本番用クラスを作成
 * 2. DIコンテナやファクトリーパターンでインスタンスを切り替え
 * 3. テスト時はモックサービスを注入可能
 */

import type { 
  Booking, 
  Patient, 
  Doctor, 
  Room, 
  Department,
  Equipment,
  WaitingList,
  DailyStats,
  CrowdPrediction 
} from '../types';

export interface IApiService {
  // 予約関連
  getBookings(params?: BookingQueryParams): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking>;
  createBooking(booking: CreateBookingDto): Promise<Booking>;
  updateBooking(id: string, updates: UpdateBookingDto): Promise<Booking>;
  deleteBooking(id: string): Promise<void>;
  
  // 患者関連
  getPatients(params?: PatientQueryParams): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient>;
  createPatient(patient: CreatePatientDto): Promise<Patient>;
  updatePatient(id: string, updates: UpdatePatientDto): Promise<Patient>;
  
  // 医師関連
  getDoctors(params?: DoctorQueryParams): Promise<Doctor[]>;
  getDoctor(id: string): Promise<Doctor>;
  updateDoctorSchedule(id: string, schedule: any): Promise<void>;
  
  // リソース関連
  getRooms(params?: RoomQueryParams): Promise<Room[]>;
  getEquipment(params?: EquipmentQueryParams): Promise<Equipment[]>;
  getDepartments(): Promise<Department[]>;
  
  // 空き時間検索
  getAvailableSlots(params: AvailabilityParams): Promise<TimeSlot[]>;
  
  // キャンセル待ち
  getWaitingList(params?: WaitingListParams): Promise<WaitingList[]>;
  addToWaitingList(entry: CreateWaitingListDto): Promise<WaitingList>;
  removeFromWaitingList(id: string): Promise<void>;
  
  // 統計・分析
  getDailyStats(date: string): Promise<DailyStats>;
  getCrowdPrediction(date: string): Promise<CrowdPrediction>;
}

// クエリパラメータ型定義
export interface BookingQueryParams {
  startDate?: string;
  endDate?: string;
  date?: string;
  doctorId?: string;
  patientId?: string;
  departmentId?: string;
  roomId?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PatientQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface DoctorQueryParams {
  departmentId?: string;
  active?: boolean;
  date?: string;
}

export interface RoomQueryParams {
  type?: string;
  floor?: number;
  available?: boolean;
  date?: string;
  timeSlot?: string;
}

export interface EquipmentQueryParams {
  type?: string;
  roomId?: string;
  available?: boolean;
}

export interface AvailabilityParams {
  doctorId: string;
  date: string;
  duration?: number;
  departmentId?: string;
  equipmentIds?: string[];
}

export interface WaitingListParams {
  patientId?: string;
  departmentId?: string;
  status?: string;
}

// DTOs (Data Transfer Objects)
export type CreateBookingDto = Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'bookingNumber' | 'patientName' | 'doctorName' | 'departmentName' | 'roomName'>;
export type UpdateBookingDto = Partial<CreateBookingDto>;

export type CreatePatientDto = Omit<Patient, 'id' | 'patientNumber' | 'lastVisitDate' | 'noShowCount' | 'tags'>;
export type UpdatePatientDto = Partial<CreatePatientDto>;

export type CreateWaitingListDto = Omit<WaitingList, 'id' | 'createdAt' | 'notifiedAt' | 'status'>;

export interface TimeSlot {
  time: string;
  available: boolean;
  doctorId?: string;
  roomId?: string;
}

// レスポンス型
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}