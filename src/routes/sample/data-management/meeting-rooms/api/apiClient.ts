import { CONFIG } from '../config';
import type { 
  Booking, Room, User, Equipment, UsageStats, CrowdPrediction, RoomAnalytics
} from '../types';
import * as mockData from './mockData';
import type { 
  IMeetingRoomApiService,
  BookingQueryParams,
  RoomQueryParams,
  UserQueryParams,
  EquipmentQueryParams,
  RoomSearchParams,
  AvailabilityParams,
  UsageStatsParams,
  RoomAnalyticsParams,
  ApprovalQueryParams,
  CreateBookingDto,
  UpdateBookingDto,
  UpdateRoomDto,
  UpdateUserDto,
  TimeSlot,
  RoomAvailability,
  NotificationSettings,
  ConflictCheck
} from './apiService.interface';

/**
 * 会議室予約システム APIクライアント実装
 * IMeetingRoomApiServiceインターフェースを実装
 * 
 * 本実装時の改修ポイント:
 * 1. CONFIG.isMockModeがfalseの場合の実装を追加
 * 2. 各メソッドのfetch処理を実装
 * 3. エラーハンドリングの強化
 * 4. 認証トークンの付与
 * 5. リクエスト/レスポンスのバリデーション追加
 */
export class MeetingRoomApiClient implements IMeetingRoomApiService {
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
   * 本実装時のエンドポイント: GET /api/bookings
   */
  async getBookings(params?: BookingQueryParams): Promise<Booking[]> {
    if (CONFIG.isMockMode) {
      let bookings = mockData.generateBookings();
      
      // フィルタリング処理
      if (params?.startDate || params?.endDate) {
        bookings = bookings.filter(b => {
          const bookingDate = b.startTime.split('T')[0];
          if (params.startDate && bookingDate < params.startDate) return false;
          if (params.endDate && bookingDate > params.endDate) return false;
          return true;
        });
      }
      
      if (params?.roomIds?.length) {
        bookings = bookings.filter(b => params.roomIds!.includes(b.roomId));
      }
      
      if (params?.userIds?.length) {
        bookings = bookings.filter(b => params.userIds!.includes(b.userId));
      }
      
      if (params?.departments?.length) {
        bookings = bookings.filter(b => params.departments!.includes(b.userDepartment));
      }
      
      if (params?.statuses?.length) {
        bookings = bookings.filter(b => params.statuses!.includes(b.status));
      }
      
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        bookings = bookings.filter(b => 
          b.title.toLowerCase().includes(searchLower) ||
          b.description?.toLowerCase().includes(searchLower) ||
          b.userName.toLowerCase().includes(searchLower)
        );
      }
      
      // ページネーション
      if (params?.page && params?.limit) {
        const start = (params.page - 1) * params.limit;
        bookings = bookings.slice(start, start + params.limit);
      }
      
      return Promise.resolve(bookings);
    }

    // 本実装モード
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, String(v)));
          } else {
            queryParams.append(key, String(value));
          }
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
   * 予約詳細取得
   */
  async getBooking(id: string): Promise<Booking> {
    if (CONFIG.isMockMode) {
      const bookings = mockData.generateBookings();
      const booking = bookings.find(b => b.id === id);
      if (!booking) {
        throw new Error(`Booking not found: ${id}`);
      }
      return Promise.resolve(booking);
    }

    const response = await fetch(`${this.baseUrl}/bookings/${id}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch booking: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 予約作成
   */
  async createBooking(booking: CreateBookingDto): Promise<Booking> {
    if (CONFIG.isMockMode) {
      const newBooking: Booking = {
        ...booking,
        id: `booking-${Date.now()}`,
        bookingNumber: `BK${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        userName: mockData.users.find(u => u.id === booking.userId)?.name || 'Unknown User',
        userEmail: mockData.users.find(u => u.id === booking.userId)?.email || 'unknown@example.com',
        userDepartment: mockData.users.find(u => u.id === booking.userId)?.department || 'Unknown',
        roomName: mockData.rooms.find(r => r.id === booking.roomId)?.name || 'Unknown Room',
        roomCode: mockData.rooms.find(r => r.id === booking.roomId)?.code || 'UNKNOWN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        duration: Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60)),
        isToday: new Date(booking.startTime).toDateString() === new Date().toDateString(),
        timeUntilStart: Math.round((new Date(booking.startTime).getTime() - new Date().getTime()) / (1000 * 60))
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
   */
  async updateBooking(id: string, updates: UpdateBookingDto): Promise<Booking> {
    if (CONFIG.isMockMode) {
      const booking = await this.getBooking(id);
      return Promise.resolve({
        ...booking,
        ...updates,
        updatedAt: new Date().toISOString(),
      });
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
   * チェックイン
   */
  async checkInBooking(id: string): Promise<Booking> {
    return this.updateBooking(id, { 
      status: 'confirmed',
      checkedInAt: new Date().toISOString()
    });
  }

  /**
   * チェックアウト
   */
  async checkOutBooking(id: string): Promise<Booking> {
    return this.updateBooking(id, { 
      status: 'completed',
      checkedOutAt: new Date().toISOString(),
      actualEndTime: new Date().toISOString()
    });
  }

  /**
   * 会議室一覧取得
   */
  async getRooms(params?: RoomQueryParams): Promise<Room[]> {
    if (CONFIG.isMockMode) {
      let rooms = mockData.rooms;
      
      if (params?.floor !== undefined) {
        rooms = rooms.filter(r => r.floor === params.floor);
      }
      
      if (params?.type) {
        rooms = rooms.filter(r => r.type === params.type);
      }
      
      if (params?.minCapacity !== undefined) {
        rooms = rooms.filter(r => r.capacity >= params.minCapacity!);
      }
      
      if (params?.maxCapacity !== undefined) {
        rooms = rooms.filter(r => r.capacity <= params.maxCapacity!);
      }
      
      if (params?.equipment?.length) {
        rooms = rooms.filter(r => 
          params.equipment!.some(eq => r.equipment.includes(eq))
        );
      }
      
      return Promise.resolve(rooms);
    }

    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, String(v)));
          } else {
            queryParams.append(key, String(value));
          }
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
   * 会議室詳細取得
   */
  async getRoom(id: string): Promise<Room> {
    if (CONFIG.isMockMode) {
      const room = mockData.rooms.find(r => r.id === id);
      if (!room) {
        throw new Error(`Room not found: ${id}`);
      }
      return Promise.resolve(room);
    }

    const response = await fetch(`${this.baseUrl}/rooms/${id}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch room: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 会議室更新
   */
  async updateRoom(id: string, updates: UpdateRoomDto): Promise<Room> {
    if (CONFIG.isMockMode) {
      const room = await this.getRoom(id);
      return Promise.resolve({
        ...room,
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    }

    const response = await fetch(`${this.baseUrl}/rooms/${id}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update room: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 会議室作成
   */
  async createRoom(roomData: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<Room> {
    if (CONFIG.isMockMode) {
      const newRoom: Room = {
        ...roomData,
        id: `room-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return Promise.resolve(newRoom);
    }

    const response = await fetch(`${this.baseUrl}/rooms`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(roomData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create room: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 会議室削除
   */
  async deleteRoom(id: string): Promise<void> {
    if (CONFIG.isMockMode) {
      // モックモードでは削除処理をシミュレート
      return Promise.resolve();
    }

    const response = await fetch(`${this.baseUrl}/rooms/${id}`, {
      method: 'DELETE',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to delete room: ${response.statusText}`);
    }
  }

  /**
   * 会議室空き状況取得
   */
  async getRoomAvailability(roomId: string, date: string): Promise<TimeSlot[]> {
    if (CONFIG.isMockMode) {
      return mockData.generateTimeSlots(roomId, date);
    }

    const response = await fetch(`${this.baseUrl}/rooms/${roomId}/availability?date=${date}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch room availability: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * ユーザー一覧取得
   */
  async getUsers(params?: UserQueryParams): Promise<User[]> {
    if (CONFIG.isMockMode) {
      let users = mockData.users;
      
      if (params?.department) {
        users = users.filter(u => u.department === params.department);
      }
      
      if (params?.role) {
        users = users.filter(u => u.role === params.role);
      }
      
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        users = users.filter(u => 
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
        );
      }
      
      return Promise.resolve(users);
    }

    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/users?${queryParams}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * ユーザー詳細取得
   */
  async getUser(id: string): Promise<User> {
    if (CONFIG.isMockMode) {
      const user = mockData.users.find(u => u.id === id);
      if (!user) {
        throw new Error(`User not found: ${id}`);
      }
      return Promise.resolve(user);
    }

    const response = await fetch(`${this.baseUrl}/users/${id}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 現在のユーザー情報取得
   */
  async getCurrentUser(): Promise<User> {
    if (CONFIG.isMockMode) {
      return Promise.resolve(mockData.users[0]); // デモユーザー
    }

    const response = await fetch(`${this.baseUrl}/users/me`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch current user: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * ユーザープロフィール更新
   */
  async updateUserProfile(id: string, updates: UpdateUserDto): Promise<User> {
    if (CONFIG.isMockMode) {
      const user = await this.getUser(id);
      return Promise.resolve({
        ...user,
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    }

    const response = await fetch(`${this.baseUrl}/users/${id}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 設備一覧取得
   */
  async getEquipment(params?: EquipmentQueryParams): Promise<Equipment[]> {
    if (CONFIG.isMockMode) {
      return Promise.resolve(mockData.equipment);
    }

    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/equipment?${queryParams}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch equipment: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 利用可能会議室検索
   */
  async searchAvailableRooms(params: RoomSearchParams): Promise<RoomAvailability[]> {
    if (CONFIG.isMockMode) {
      const rooms = await this.getRooms({
        minCapacity: params.attendeeCount,
        equipment: params.requiredEquipment,
        floor: params.preferredFloor
      });
      
      return Promise.resolve(
        rooms.map(room => ({
          room,
          availableSlots: mockData.generateTimeSlots(room.id, params.startTime.split('T')[0]),
          conflictCount: Math.floor(Math.random() * 3)
        }))
      );
    }

    const response = await fetch(`${this.baseUrl}/rooms/search`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Failed to search available rooms: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 利用可能時間枠取得
   */
  async getAvailableTimeSlots(params: AvailabilityParams): Promise<TimeSlot[]> {
    if (CONFIG.isMockMode) {
      if (params.roomIds?.length) {
        return mockData.generateTimeSlots(params.roomIds[0], params.date);
      }
      return Promise.resolve([]);
    }

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, String(v)));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    const response = await fetch(`${this.baseUrl}/availability?${queryParams}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch available time slots: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 利用統計取得
   */
  async getUsageStats(params: UsageStatsParams): Promise<UsageStats> {
    if (CONFIG.isMockMode) {
      return Promise.resolve(mockData.generateUsageStats(params));
    }

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(`${this.baseUrl}/statistics/usage?${queryParams}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch usage stats: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 混雑予測取得
   */
  async getCrowdPrediction(date: string): Promise<CrowdPrediction> {
    if (CONFIG.isMockMode) {
      return Promise.resolve(mockData.generateCrowdPrediction(date));
    }

    const response = await fetch(`${this.baseUrl}/predictions/crowd?date=${date}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch crowd prediction: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 会議室分析データ取得
   */
  async getRoomAnalytics(params: RoomAnalyticsParams): Promise<RoomAnalytics> {
    if (CONFIG.isMockMode) {
      return Promise.resolve(mockData.generateRoomAnalytics(params));
    }

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(`${this.baseUrl}/analytics/rooms?${queryParams}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch room analytics: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 承認待ち予約取得
   */
  async getBookingApprovals(params?: ApprovalQueryParams): Promise<Booking[]> {
    return this.getBookings({
      ...params,
      statuses: ['pending']
    });
  }

  /**
   * 予約承認
   */
  async approveBooking(id: string, notes?: string): Promise<Booking> {
    return this.updateBooking(id, {
      status: 'confirmed',
      approvedAt: new Date().toISOString(),
      approvalNotes: notes
    });
  }

  /**
   * 予約却下
   */
  async rejectBooking(id: string, reason: string): Promise<Booking> {
    return this.updateBooking(id, {
      status: 'cancelled',
      approvalNotes: reason
    });
  }

  /**
   * リマインダー送信
   */
  async sendReminder(bookingId: string, type: 'email' | 'slack'): Promise<void> {
    if (CONFIG.isMockMode) {
      console.log(`Sending ${type} reminder for booking ${bookingId}`);
      return Promise.resolve();
    }

    const response = await fetch(`${this.baseUrl}/bookings/${bookingId}/remind`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ type }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send reminder: ${response.statusText}`);
    }
  }

  /**
   * 通知設定更新
   */
  async updateNotificationSettings(userId: string, settings: NotificationSettings): Promise<void> {
    if (CONFIG.isMockMode) {
      return Promise.resolve();
    }

    const response = await fetch(`${this.baseUrl}/users/${userId}/notifications`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`Failed to update notification settings: ${response.statusText}`);
    }
  }
}

// シングルトンインスタンス
export const meetingRoomApiClient = new MeetingRoomApiClient();