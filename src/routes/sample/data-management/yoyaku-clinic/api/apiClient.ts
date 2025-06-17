import { CONFIG } from '../config';
import type { Booking, Patient, Doctor, Room, Department, Equipment, WaitingList, DailyStats, CrowdPrediction } from '../types';
import * as mockData from './mockData';
import type { 
  IApiService, 
  BookingQueryParams, 
  PatientQueryParams, 
  DoctorQueryParams,
  RoomQueryParams,
  EquipmentQueryParams,
  AvailabilityParams,
  WaitingListParams,
  CreateBookingDto,
  UpdateBookingDto,
  CreatePatientDto,
  UpdatePatientDto,
  CreateWaitingListDto,
  TimeSlot 
} from './apiService.interface';

/**
 * APIクライアント実装
 * IApiServiceインターフェースを実装
 * 
 * 本実装時の改修ポイント:
 * 1. CONFIG.isMockModeがfalseの場合の実装を追加
 * 2. 各メソッドのfetch処理を実装
 * 3. エラーハンドリングの強化
 * 4. 認証トークンの付与
 * 5. レスポンスのバリデーション追加
 */
export class ApiClient implements IApiService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = CONFIG.api.baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      // 本実装時: Authorization ヘッダーを追加
      // 'Authorization': `Bearer ${getAuthToken()}`
    };
  }

  /**
   * 予約一覧取得
   * 
   * 本実装時のエンドポイント: GET /bookings
   * クエリパラメータ:
   * - date: 日付 (YYYY-MM-DD)
   * - doctorId: 医師ID
   * - departmentId: 診療科ID
   * - status: ステータス
   * - page: ページ番号
   * - limit: 件数
   */
  async getBookings(params?: {
    date?: string;
    doctorId?: string;
    departmentId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<Booking[]> {
    if (CONFIG.isMockMode) {
      // モックモード: フィルタリングを適用してデータを返す
      let bookings = mockData.generateBookings();
      
      if (params?.date) {
        bookings = bookings.filter(b => b.startTime.startsWith(params.date));
      }
      if (params?.doctorId) {
        bookings = bookings.filter(b => b.doctorId === params.doctorId);
      }
      if (params?.departmentId) {
        bookings = bookings.filter(b => b.departmentId === params.departmentId);
      }
      if (params?.status) {
        bookings = bookings.filter(b => b.status === params.status);
      }
      
      return Promise.resolve(bookings);
    }

    // 本実装モード
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/bookings?${queryParams}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 予約作成
   * 
   * 本実装時のエンドポイント: POST /bookings
   */
  async createBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    if (CONFIG.isMockMode) {
      const newBooking: Booking = {
        ...booking,
        id: `booking-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return Promise.resolve(newBooking);
    }

    const response = await fetch(`${this.baseUrl}/bookings`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(booking),
    });

    if (!response.ok) {
      throw new Error(`Failed to create booking: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 予約更新
   * 
   * 本実装時のエンドポイント: PATCH /bookings/:id
   */
  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    if (CONFIG.isMockMode) {
      // モックモード: 更新されたデータを返す
      return Promise.resolve({
        id,
        ...updates,
        updatedAt: new Date().toISOString(),
      } as Booking);
    }

    const response = await fetch(`${this.baseUrl}/bookings/${id}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update booking: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 予約削除
   * 
   * 本実装時のエンドポイント: DELETE /bookings/:id
   */
  async deleteBooking(id: string): Promise<void> {
    if (CONFIG.isMockMode) {
      return Promise.resolve();
    }

    const response = await fetch(`${this.baseUrl}/bookings/${id}`, {
      method: 'DELETE',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to delete booking: ${response.statusText}`);
    }
  }

  /**
   * 患者一覧取得
   * 
   * 本実装時のエンドポイント: GET /patients
   */
  async getPatients(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Patient[]> {
    if (CONFIG.isMockMode) {
      let patients = mockData.patients;
      
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        patients = patients.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.email.toLowerCase().includes(searchLower) ||
          p.phone.includes(params.search)
        );
      }
      
      return Promise.resolve(patients);
    }

    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/patients?${queryParams}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch patients: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 医師一覧取得
   * 
   * 本実装時のエンドポイント: GET /doctors
   */
  async getDoctors(params?: {
    departmentId?: string;
    active?: boolean;
  }): Promise<Doctor[]> {
    if (CONFIG.isMockMode) {
      let doctors = mockData.doctors;
      
      if (params?.departmentId) {
        doctors = doctors.filter(d => 
          d.departmentIds.includes(params.departmentId)
        );
      }
      
      if (params?.active !== undefined) {
        doctors = doctors.filter(d => d.isActive === params.active);
      }
      
      return Promise.resolve(doctors);
    }

    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/doctors?${queryParams}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch doctors: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 診察室一覧取得
   * 
   * 本実装時のエンドポイント: GET /rooms
   */
  async getRooms(params?: {
    type?: string;
    floor?: number;
    available?: boolean;
  }): Promise<Room[]> {
    if (CONFIG.isMockMode) {
      let rooms = mockData.rooms;
      
      if (params?.type) {
        rooms = rooms.filter(r => r.type === params.type);
      }
      
      if (params?.floor !== undefined) {
        rooms = rooms.filter(r => r.floor === params.floor);
      }
      
      if (params?.available !== undefined) {
        rooms = rooms.filter(r => r.isActive === params.available);
      }
      
      return Promise.resolve(rooms);
    }

    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/rooms?${queryParams}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch rooms: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 診療科一覧取得
   * 
   * 本実装時のエンドポイント: GET /departments
   */
  async getDepartments(): Promise<Department[]> {
    if (CONFIG.isMockMode) {
      return Promise.resolve(mockData.departments);
    }

    const response = await fetch(`${this.baseUrl}/departments`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch departments: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 利用可能な時間枠取得
   * 
   * 本実装時のエンドポイント: GET /availability
   */
  async getAvailableSlots(params: {
    doctorId: string;
    date: string;
    duration?: number;
  }): Promise<{ time: string; available: boolean }[]> {
    if (CONFIG.isMockMode) {
      // モックモード: 簡易的な空き時間を生成
      const slots = [];
      const doctor = mockData.doctors.find(d => d.id === params.doctorId);
      if (!doctor) return [];

      const dayName = new Date(params.date).toLocaleDateString('en-US', { weekday: 'lowercase' });
      const schedule = doctor.schedule.regularHours[dayName as keyof typeof doctor.schedule.regularHours];
      
      if (!schedule) return [];

      for (const slot of schedule) {
        const [startHour, startMin] = slot.startTime.split(':').map(Number);
        const [endHour, endMin] = slot.endTime.split(':').map(Number);
        
        for (let hour = startHour; hour < endHour; hour++) {
          for (let min = 0; min < 60; min += CONFIG.businessHours.slotDuration) {
            if (hour === startHour && min < startMin) continue;
            if (hour === endHour - 1 && min + CONFIG.businessHours.slotDuration > endMin) continue;
            
            const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
            slots.push({
              time,
              available: Math.random() > 0.3, // 70%の確率で空き
            });
          }
        }
      }
      
      return Promise.resolve(slots);
    }

    const queryParams = new URLSearchParams({
      doctorId: params.doctorId,
      date: params.date,
    });
    
    if (params.duration) {
      queryParams.append('duration', String(params.duration));
    }

    const response = await fetch(`${this.baseUrl}/availability?${queryParams}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch availability: ${response.statusText}`);
    }

    return response.json();
  }
}

// シングルトンインスタンス
export const apiClient = new ApiClient();