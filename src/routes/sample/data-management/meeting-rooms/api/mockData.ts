/**
 * 会議室予約システム モックデータ生成
 * 
 * リアルなビジネスシナリオを再現したデモデータを提供
 * 本実装時は実際のDBから取得されるデータに置き換え
 */

import type { 
  User, Room, Equipment, Booking, UsageStats, CrowdPrediction, 
  RoomAnalytics, TimeSlot, UsageStatsParams, RoomAnalyticsParams
} from '../types';
import { CONFIG } from '../config';

// ========================================
// ユーザーマスタデータ
// ========================================
export const users: User[] = [
  {
    id: 'user1',
    employeeId: 'EMP001',
    name: '田中 太郎',
    email: 'tanaka@company.com',
    department: '開発部',
    role: 'user',
    phoneNumber: '090-1234-5678',
    isActive: true,
    totalBookings: 45,
    lastLoginAt: '2024-06-15T09:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-15T09:00:00Z',
  },
  {
    id: 'user2',
    employeeId: 'EMP002',
    name: '佐藤 花子',
    email: 'sato@company.com',
    department: '営業部',
    role: 'manager',
    phoneNumber: '090-2345-6789',
    isActive: true,
    totalBookings: 67,
    lastLoginAt: '2024-06-15T08:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-15T08:30:00Z',
  },
  {
    id: 'user3',
    employeeId: 'EMP003',
    name: '鈴木 次郎',
    email: 'suzuki@company.com',
    department: '人事部',
    role: 'admin',
    phoneNumber: '090-3456-7890',
    isActive: true,
    totalBookings: 23,
    lastLoginAt: '2024-06-14T17:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-14T17:00:00Z',
  },
  {
    id: 'user4',
    employeeId: 'EMP004',
    name: '高橋 美咲',
    email: 'takahashi@company.com',
    department: '企画部',
    role: 'user',
    phoneNumber: '090-4567-8901',
    isActive: true,
    totalBookings: 34,
    lastLoginAt: '2024-06-15T10:15:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-15T10:15:00Z',
  },
  {
    id: 'user5',
    employeeId: 'EMP005',
    name: '山田 健司',
    email: 'yamada@company.com',
    department: '総務部',
    role: 'user',
    phoneNumber: '090-5678-9012',
    isActive: true,
    totalBookings: 12,
    lastLoginAt: '2024-06-15T11:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-15T11:00:00Z',
  },
];

// ========================================
// 設備マスタデータ
// ========================================
export const equipment: Equipment[] = [
  {
    id: 'eq1',
    name: 'プロジェクター',
    type: 'projector',
    description: 'HD対応プロジェクター',
    icon: 'projector',
    isActive: true,
    operatingInstructions: '電源ボタンを押してから約30秒で起動します。',
  },
  {
    id: 'eq2',
    name: 'ホワイトボード',
    type: 'whiteboard',
    description: '大型ホワイトボード',
    icon: 'whiteboard',
    isActive: true,
    operatingInstructions: '専用マーカーをご利用ください。',
  },
  {
    id: 'eq3',
    name: '大型TV',
    type: 'tv',
    description: '65インチ4K TV',
    icon: 'tv',
    isActive: true,
    operatingInstructions: 'HDMI接続でご利用いただけます。',
  },
  {
    id: 'eq4',
    name: 'ビデオ会議システム',
    type: 'videoconf',
    description: 'Zoom Rooms対応',
    icon: 'videoconf',
    isActive: true,
    operatingInstructions: 'タッチパネルから簡単に操作できます。',
  },
  {
    id: 'eq5',
    name: '音響システム',
    type: 'sound',
    description: 'マイク・スピーカー',
    icon: 'sound',
    isActive: true,
  },
  {
    id: 'eq6',
    name: 'Wi-Fi',
    type: 'wifi',
    description: '高速無線LAN',
    icon: 'wifi',
    isActive: true,
  },
  {
    id: 'eq7',
    name: '電話機',
    type: 'phone',
    description: '会議用電話機',
    icon: 'phone',
    isActive: true,
  },
  {
    id: 'eq8',
    name: 'コーヒーマシン',
    type: 'coffee',
    description: 'エスプレッソマシン',
    icon: 'coffee',
    isActive: true,
  },
];

// ========================================
// 会議室マスタデータ
// ========================================
export const rooms: Room[] = [
  {
    id: 'room1',
    name: 'エグゼクティブルーム',
    code: 'A5-01',
    type: 'conference',
    floor: 5,
    building: '本社ビル',
    capacity: 12,
    area: 45,
    description: '重役会議や重要な商談に適した高級会議室',
    imageUrl: '/images/rooms/executive.jpg',
    color: '#1e40af',
    hourlyRate: 5000,
    isActive: true,
    equipment: ['eq1', 'eq3', 'eq4', 'eq5', 'eq6', 'eq8'],
    features: ['革張りチェア', '調光可能', '防音設計'],
    mapPosition: { x: 100, y: 50 },
    accessControl: {
      requireApproval: true,
      allowedDepartments: ['役員', '営業部'],
      allowedRoles: ['admin', 'manager'],
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room2',
    name: 'プレゼンテーションルーム',
    code: 'A4-01',
    type: 'presentation',
    floor: 4,
    building: '本社ビル',
    capacity: 20,
    area: 60,
    description: '大型スクリーンとプロジェクターを備えたプレゼン専用室',
    imageUrl: '/images/rooms/presentation.jpg',
    color: '#7c3aed',
    isActive: true,
    equipment: ['eq1', 'eq2', 'eq4', 'eq5', 'eq6'],
    features: ['大型スクリーン', 'ステージ照明', '階段式座席'],
    mapPosition: { x: 200, y: 80 },
    accessControl: {
      requireApproval: false,
      allowedDepartments: [],
      allowedRoles: ['admin', 'manager', 'user'],
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room3',
    name: 'ミーティングルームA',
    code: 'A3-01',
    type: 'meeting',
    floor: 3,
    building: '本社ビル',
    capacity: 8,
    area: 25,
    description: '日常的な会議に最適なスタンダードルーム',
    imageUrl: '/images/rooms/meeting-a.jpg',
    color: '#059669',
    isActive: true,
    equipment: ['eq2', 'eq3', 'eq6'],
    features: ['自然光', 'カジュアル設計'],
    mapPosition: { x: 150, y: 120 },
    accessControl: {
      requireApproval: false,
      allowedDepartments: [],
      allowedRoles: ['admin', 'manager', 'user'],
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room4',
    name: 'ミーティングルームB',
    code: 'A3-02',
    type: 'meeting',
    floor: 3,
    building: '本社ビル',
    capacity: 6,
    area: 20,
    description: '少人数会議に適したコンパクトルーム',
    imageUrl: '/images/rooms/meeting-b.jpg',
    color: '#dc2626',
    isActive: true,
    equipment: ['eq2', 'eq6', 'eq7'],
    features: ['集中しやすい環境', '防音対策'],
    mapPosition: { x: 250, y: 120 },
    accessControl: {
      requireApproval: false,
      allowedDepartments: [],
      allowedRoles: ['admin', 'manager', 'user'],
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room5',
    name: '研修ルーム',
    code: 'A2-01',
    type: 'training',
    floor: 2,
    building: '本社ビル',
    capacity: 30,
    area: 80,
    description: '大人数での研修や勉強会に対応',
    imageUrl: '/images/rooms/training.jpg',
    color: '#f59e0b',
    isActive: true,
    equipment: ['eq1', 'eq2', 'eq4', 'eq5', 'eq6'],
    features: ['可動式テーブル', '大型ホワイトボード複数', '録画設備'],
    mapPosition: { x: 120, y: 200 },
    accessControl: {
      requireApproval: true,
      allowedDepartments: ['人事部', '総務部'],
      allowedRoles: ['admin', 'manager'],
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room6',
    name: 'フォンブースA',
    code: 'A1-01',
    type: 'phone-booth',
    floor: 1,
    building: '本社ビル',
    capacity: 1,
    area: 2,
    description: '個人通話用の防音ブース',
    imageUrl: '/images/rooms/phone-booth.jpg',
    color: '#6b7280',
    isActive: true,
    equipment: ['eq6', 'eq7'],
    features: ['完全防音', '換気システム'],
    mapPosition: { x: 50, y: 300 },
    accessControl: {
      requireApproval: false,
      allowedDepartments: [],
      allowedRoles: ['admin', 'manager', 'user'],
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// ========================================
// 予約データ生成関数
// ========================================
export function generateBookings(): Booking[] {
  const bookings: Booking[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // 過去1週間から未来2週間のデータを生成
  for (let day = -7; day <= 14; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    
    // 土日はスキップ
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // 1日あたり15-25個の予約を生成
    const bookingCount = Math.floor(Math.random() * 11) + 15;
    
    for (let i = 0; i < bookingCount; i++) {
      const booking = generateRandomBooking(date, i);
      if (booking) {
        bookings.push(booking);
      }
    }
  }
  
  return bookings.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

function generateRandomBooking(date: Date, index: number): Booking | null {
  const room = rooms[Math.floor(Math.random() * rooms.length)];
  const user = users[Math.floor(Math.random() * users.length)];
  
  // 営業時間内のランダムな時間を生成
  const startHour = Math.floor(Math.random() * 12) + 9; // 9-20時
  const startMinute = Math.random() > 0.5 ? 0 : 30;    // 0分または30分
  const duration = [30, 60, 90, 120][Math.floor(Math.random() * 4)]; // 30分、1時間、1.5時間、2時間
  
  const startTime = new Date(date);
  startTime.setHours(startHour, startMinute, 0, 0);
  
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + duration);
  
  // 22時を超える場合はスキップ
  if (endTime.getHours() >= 22) return null;
  
  const types: Booking['type'][] = ['meeting', 'presentation', 'training', 'interview', 'other'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const statuses: Booking['status'][] = ['confirmed', 'pending', 'completed', 'cancelled'];
  let status: Booking['status'] = 'confirmed';
  
  // 過去の予約は完了またはキャンセル
  if (startTime < new Date()) {
    status = Math.random() > 0.1 ? 'completed' : 'cancelled';
  }
  // 承認が必要な会議室は一部保留
  else if (room.accessControl?.requireApproval && Math.random() > 0.8) {
    status = 'pending';
  }
  
  const titles = [
    '週次定例ミーティング',
    'プロジェクト進捗確認',
    '新商品企画会議',
    'クライアント打ち合わせ',
    '採用面接',
    'システム設計レビュー',
    '四半期業績報告',
    '新人研修',
    'チームビルディング',
    '予算策定会議',
  ];
  
  const now = new Date();
  const timeUntilStart = Math.max(0, Math.round((startTime.getTime() - now.getTime()) / (1000 * 60)));
  
  return {
    id: `booking-${date.getTime()}-${index}`,
    bookingNumber: `BK${date.toISOString().slice(0, 10).replace(/-/g, '')}-${String(index + 1).padStart(3, '0')}`,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userDepartment: user.department,
    roomId: room.id,
    roomName: room.name,
    roomCode: room.code,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    type,
    status,
    title: titles[Math.floor(Math.random() * titles.length)],
    description: Math.random() > 0.3 ? '詳細な議題については別途共有いたします。' : undefined,
    attendeeCount: Math.floor(Math.random() * Math.min(room.capacity, 15)) + 1,
    requiredEquipment: room.equipment.filter(() => Math.random() > 0.6),
    cateringRequired: Math.random() > 0.8,
    approvalRequired: room.accessControl?.requireApproval || false,
    isRecurring: Math.random() > 0.85,
    createdAt: new Date(startTime.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    duration,
    isToday: startTime.toDateString() === new Date().toDateString(),
    timeUntilStart,
  };
}

// ========================================
// 時間枠データ生成関数
// ========================================
export function generateTimeSlots(roomId: string, date: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const bookings = generateBookings().filter(b => 
    b.roomId === roomId && b.startTime.startsWith(date) && b.status !== 'cancelled'
  );
  
  // 営業時間内の30分刻みで時間枠を生成
  for (let hour = 8; hour < 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const slotStart = new Date(`${date}T${timeStr}:00`);
      const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
      
      // 既存予約との重複チェック
      const hasConflict = bookings.some(booking => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        return slotStart < bookingEnd && slotEnd > bookingStart;
      });
      
      slots.push({
        time: timeStr,
        available: !hasConflict,
        conflictBookings: hasConflict ? bookings.filter(booking => {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          return slotStart < bookingEnd && slotEnd > bookingStart;
        }) : undefined,
      });
    }
  }
  
  return slots;
}

// ========================================
// 統計データ生成関数
// ========================================
export function generateUsageStats(params: UsageStatsParams): UsageStats {
  const startDate = new Date(params.startDate);
  const endDate = new Date(params.endDate);
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // 基本統計を生成
  const totalBookings = Math.floor(Math.random() * 50) + daysDiff * 10;
  const completedBookings = Math.floor(totalBookings * (0.8 + Math.random() * 0.15));
  const cancelledBookings = Math.floor(totalBookings * (0.05 + Math.random() * 0.1));
  const noShowBookings = Math.floor(totalBookings * (0.02 + Math.random() * 0.03));
  
  return {
    date: params.startDate,
    totalBookings,
    completedBookings,
    cancelledBookings,
    noShowBookings,
    utilizationRate: Math.round((60 + Math.random() * 30) * 100) / 100,
    averageBookingDuration: Math.round((60 + Math.random() * 60) * 100) / 100,
    peakHours: ['10:00-11:00', '14:00-15:00', '16:00-17:00'],
    departmentStats: {
      '開発部': { bookings: Math.floor(totalBookings * 0.4), duration: 1200, utilizationRate: 75.5 },
      '営業部': { bookings: Math.floor(totalBookings * 0.3), duration: 900, utilizationRate: 68.2 },
      '企画部': { bookings: Math.floor(totalBookings * 0.2), duration: 600, utilizationRate: 82.1 },
      '人事部': { bookings: Math.floor(totalBookings * 0.1), duration: 300, utilizationRate: 45.8 },
    },
    roomStats: rooms.reduce((acc, room) => {
      acc[room.id] = {
        bookings: Math.floor(Math.random() * 20) + 5,
        utilizationRate: Math.round((50 + Math.random() * 40) * 100) / 100,
        averageDuration: Math.round((60 + Math.random() * 60) * 100) / 100,
      };
      return acc;
    }, {} as UsageStats['roomStats']),
  };
}

// ========================================
// 混雑予測データ生成関数
// ========================================
export function generateCrowdPrediction(date: string): CrowdPrediction {
  const hourlyPredictions = [];
  
  for (let hour = 8; hour < 22; hour++) {
    let occupancyRate: number;
    
    // 時間帯による混雑度の変動
    if (hour < 9 || hour > 19) {
      occupancyRate = 0.1 + Math.random() * 0.2; // 早朝・夜間は低め
    } else if (hour >= 10 && hour <= 11 || hour >= 14 && hour <= 16) {
      occupancyRate = 0.7 + Math.random() * 0.25; // ピーク時間
    } else {
      occupancyRate = 0.4 + Math.random() * 0.3; // 通常時間
    }
    
    hourlyPredictions.push({
      hour,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      availableRooms: Math.floor((1 - occupancyRate) * rooms.length),
      confidence: 0.75 + Math.random() * 0.2,
    });
  }
  
  const peakHours = hourlyPredictions
    .filter(p => p.occupancyRate > 0.8)
    .map(p => p.hour);
  
  return {
    date,
    hourlyPredictions,
    peakHours,
    recommendations: [
      'ピーク時間帯（10-11時、14-16時）は早めの予約をお勧めします',
      '大型会議室の利用は午前中がお勧めです',
      '緊急会議の場合はフォンブースをご活用ください',
    ],
    alternativeSlots: [
      {
        startTime: '09:00',
        endTime: '10:00',
        availableRooms: ['room3', 'room4'],
      },
      {
        startTime: '17:00',
        endTime: '18:00',
        availableRooms: ['room1', 'room2', 'room5'],
      },
    ],
  };
}

// ========================================
// 会議室分析データ生成関数
// ========================================
export function generateRoomAnalytics(params: RoomAnalyticsParams): RoomAnalytics {
  const room = rooms.find(r => r.id === params.roomId);
  if (!room) {
    throw new Error(`Room not found: ${params.roomId}`);
  }
  
  const startDate = new Date(params.startDate);
  const endDate = new Date(params.endDate);
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const businessHoursPerDay = 14; // 8:00-22:00 = 14時間
  const totalHours = daysDiff * businessHoursPerDay;
  const bookedHours = Math.floor(totalHours * (0.5 + Math.random() * 0.3));
  
  return {
    roomId: room.id,
    roomName: room.name,
    period: {
      startDate: params.startDate,
      endDate: params.endDate,
    },
    totalHours,
    bookedHours,
    utilizationRate: Math.round((bookedHours / totalHours) * 10000) / 100,
    averageBookingDuration: 90 + Math.random() * 60,
    totalBookings: Math.floor(bookedHours / 1.5), // 平均1.5時間として計算
    departmentUsage: [
      { department: '開発部', hours: Math.floor(bookedHours * 0.4), percentage: 40 },
      { department: '営業部', hours: Math.floor(bookedHours * 0.3), percentage: 30 },
      { department: '企画部', hours: Math.floor(bookedHours * 0.2), percentage: 20 },
      { department: '人事部', hours: Math.floor(bookedHours * 0.1), percentage: 10 },
    ],
    popularTimeSlots: [
      { hour: 10, bookingCount: 15 },
      { hour: 14, bookingCount: 18 },
      { hour: 15, bookingCount: 16 },
      { hour: 16, bookingCount: 12 },
    ],
    revenue: room.hourlyRate ? bookedHours * room.hourlyRate : undefined,
  };
}