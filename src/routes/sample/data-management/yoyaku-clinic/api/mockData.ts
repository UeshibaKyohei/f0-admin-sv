// モックデータ生成
import type {
  Patient,
  Doctor,
  Department,
  Room,
  Equipment,
  Booking,
  DoctorSchedule,
  BookingStatus,
  BookingType,
  WaitingList,
  RecurringBooking,
  DailyStats,
  CrowdPrediction
} from '../types';

// 診療科マスタ
export const departments: Department[] = [
  { id: 'dept1', name: '内科', type: 'internal', color: '#3B82F6', defaultConsultationTime: 15 },
  { id: 'dept2', name: '小児科', type: 'pediatrics', color: '#10B981', defaultConsultationTime: 20 },
  { id: 'dept3', name: '整形外科', type: 'orthopedics', color: '#F59E0B', defaultConsultationTime: 25, requiredEquipment: ['xray'] }
];

// 医師マスタ
export const doctors: Doctor[] = [
  {
    id: 'doc1',
    name: '山田 太郎',
    kana: 'ヤマダ タロウ',
    departmentIds: ['dept1'],
    specialties: ['総合内科', '糖尿病'],
    schedule: {
      regularHours: {
        monday: [{ startTime: '09:00', endTime: '12:00' }, { startTime: '14:00', endTime: '17:00' }],
        tuesday: [{ startTime: '09:00', endTime: '12:00' }, { startTime: '14:00', endTime: '17:00' }],
        wednesday: [{ startTime: '09:00', endTime: '12:00' }],
        thursday: [{ startTime: '09:00', endTime: '12:00' }, { startTime: '14:00', endTime: '17:00' }],
        friday: [{ startTime: '09:00', endTime: '12:00' }, { startTime: '14:00', endTime: '17:00' }]
      },
      vacations: [],
      specialSchedules: []
    },
    averageConsultationTime: 15,
    color: '#3B82F6',
    maxPatientsPerDay: 40,
    isActive: true
  },
  {
    id: 'doc2',
    name: '佐藤 花子',
    kana: 'サトウ ハナコ',
    departmentIds: ['dept2'],
    specialties: ['小児科', 'アレルギー'],
    schedule: {
      regularHours: {
        monday: [{ startTime: '09:00', endTime: '12:00' }, { startTime: '14:00', endTime: '17:00' }],
        tuesday: [{ startTime: '09:00', endTime: '12:00' }, { startTime: '14:00', endTime: '17:00' }],
        thursday: [{ startTime: '09:00', endTime: '12:00' }, { startTime: '14:00', endTime: '17:00' }],
        friday: [{ startTime: '09:00', endTime: '12:00' }, { startTime: '14:00', endTime: '17:00' }],
        saturday: [{ startTime: '09:00', endTime: '12:00' }]
      },
      vacations: [],
      specialSchedules: []
    },
    averageConsultationTime: 20,
    color: '#10B981',
    maxPatientsPerDay: 35,
    isActive: true
  },
  {
    id: 'doc3',
    name: '鈴木 一郎',
    kana: 'スズキ イチロウ',
    departmentIds: ['dept3'],
    specialties: ['整形外科', 'スポーツ医学'],
    schedule: {
      regularHours: {
        monday: [{ startTime: '09:00', endTime: '12:00' }, { startTime: '14:00', endTime: '17:00' }],
        wednesday: [{ startTime: '09:00', endTime: '12:00' }, { startTime: '14:00', endTime: '17:00' }],
        thursday: [{ startTime: '09:00', endTime: '12:00' }],
        friday: [{ startTime: '09:00', endTime: '12:00' }, { startTime: '14:00', endTime: '17:00' }]
      },
      vacations: [
        { startDate: '2025-01-15', endDate: '2025-01-17', reason: '学会参加' }
      ],
      specialSchedules: []
    },
    averageConsultationTime: 25,
    color: '#F59E0B',
    maxPatientsPerDay: 30,
    isActive: true
  },
  {
    id: 'doc4',
    name: '高橋 美咲',
    kana: 'タカハシ ミサキ',
    departmentIds: ['dept1', 'dept2'],
    specialties: ['内科', '小児科'],
    schedule: {
      regularHours: {
        tuesday: [{ startTime: '09:00', endTime: '12:00' }, { startTime: '14:00', endTime: '17:00' }],
        wednesday: [{ startTime: '09:00', endTime: '12:00' }, { startTime: '14:00', endTime: '17:00' }],
        thursday: [{ startTime: '09:00', endTime: '12:00' }, { startTime: '14:00', endTime: '17:00' }],
        saturday: [{ startTime: '09:00', endTime: '12:00' }]
      },
      vacations: [],
      specialSchedules: []
    },
    averageConsultationTime: 18,
    color: '#8B5CF6',
    maxPatientsPerDay: 35,
    isActive: true
  }
];

// 診察室マスタ
export const rooms: Room[] = [
  { id: 'room1', name: '診察室1', floor: 1, type: 'consultation', equipment: [], capacity: 3, isActive: true },
  { id: 'room2', name: '診察室2', floor: 1, type: 'consultation', equipment: [], capacity: 3, isActive: true },
  { id: 'room3', name: '診察室3', floor: 1, type: 'consultation', equipment: ['ecg'], capacity: 3, isActive: true },
  { id: 'room4', name: '処置室1', floor: 1, type: 'treatment', equipment: ['blood-test'], capacity: 4, isActive: true },
  { id: 'room5', name: '検査室1', floor: 2, type: 'examination', equipment: ['ultrasound'], capacity: 2, isActive: true },
  { id: 'room6', name: '検査室2', floor: 2, type: 'examination', equipment: ['xray'], capacity: 2, isActive: true }
];

// 医療機器マスタ
export const equipment: Equipment[] = [
  { id: 'eq1', name: 'レントゲン装置', type: 'xray', roomId: 'room6', isPortable: false, maintenanceSchedule: [], isActive: true },
  { id: 'eq2', name: '超音波診断装置', type: 'ultrasound', roomId: 'room5', isPortable: true, maintenanceSchedule: [], isActive: true },
  { id: 'eq3', name: '心電図', type: 'ecg', roomId: 'room3', isPortable: true, maintenanceSchedule: [], isActive: true },
  { id: 'eq4', name: '採血セット', type: 'blood-test', roomId: 'room4', isPortable: true, maintenanceSchedule: [], isActive: true }
];

// 患者マスタ（サンプル）
export const patients: Patient[] = [
  {
    id: 'pat1',
    name: '田中 太郎',
    kana: 'タナカ タロウ',
    birthDate: '1960-05-15',
    gender: 'male',
    phone: '090-1234-5678',
    email: 'tanaka@example.com',
    insuranceNumber: '12345678',
    lastVisitDate: '2024-12-20',
    noShowCount: 0,
    tags: ['定期通院']
  },
  {
    id: 'pat2',
    name: '伊藤 花子',
    kana: 'イトウ ハナコ',
    birthDate: '1985-08-22',
    gender: 'female',
    phone: '080-2345-6789',
    insuranceNumber: '23456789',
    lastVisitDate: '2024-12-15',
    noShowCount: 1,
    tags: []
  },
  {
    id: 'pat3',
    name: '渡辺 次郎',
    kana: 'ワタナベ ジロウ',
    birthDate: '2015-03-10',
    gender: 'male',
    phone: '090-3456-7890',
    insuranceNumber: '34567890',
    lastVisitDate: '2024-11-30',
    noShowCount: 0,
    tags: ['小児']
  },
  {
    id: 'pat4',
    name: '小林 美咲',
    kana: 'コバヤシ ミサキ',
    birthDate: '1992-11-08',
    gender: 'female',
    phone: '080-4567-8901',
    email: 'kobayashi@example.com',
    insuranceNumber: '45678901',
    noShowCount: 2,
    tags: ['要注意']
  },
  {
    id: 'pat5',
    name: '松田 健一',
    kana: 'マツダ ケンイチ',
    birthDate: '1975-06-25',
    gender: 'male',
    phone: '090-5678-9012',
    insuranceNumber: '56789012',
    lastVisitDate: '2025-01-03',
    noShowCount: 0,
    tags: ['VIP']
  }
];

// 予約データ生成関数
export function generateBookings(): Booking[] {
  const bookings: Booking[] = [];
  const today = new Date();
  const statuses: BookingStatus[] = ['booked', 'checked-in', 'in-progress', 'completed', 'cancelled', 'no-show'];
  const types: BookingType[] = ['first-visit', 'follow-up', 'checkup'];
  
  // 過去1週間から未来2週間までの予約を生成
  for (let dayOffset = -7; dayOffset <= 14; dayOffset++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayOffset);
    
    // 休診日（日曜）はスキップ
    if (targetDate.getDay() === 0) continue;
    
    // 各医師の予約を生成
    doctors.forEach(doctor => {
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][targetDate.getDay()] as keyof DoctorSchedule['regularHours'];
      const daySchedule = doctor.schedule.regularHours[dayName];
      
      if (!daySchedule) return;
      
      daySchedule.forEach(slot => {
        const [startHour, startMin] = slot.startTime.split(':').map(Number);
        const [endHour, endMin] = slot.endTime.split(':').map(Number);
        const slotDuration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
        const numberOfBookings = Math.floor(slotDuration / doctor.averageConsultationTime);
        
        for (let i = 0; i < numberOfBookings; i++) {
          // 予約率は70-90%
          if (Math.random() > 0.8) continue;
          
          const bookingStartMin = startHour * 60 + startMin + (i * doctor.averageConsultationTime);
          const bookingStartTime = new Date(targetDate);
          bookingStartTime.setHours(Math.floor(bookingStartMin / 60), bookingStartMin % 60, 0, 0);
          
          const bookingEndTime = new Date(bookingStartTime);
          bookingEndTime.setMinutes(bookingEndTime.getMinutes() + doctor.averageConsultationTime);
          
          const patient = patients[Math.floor(Math.random() * patients.length)];
          const department = departments.find(d => doctor.departmentIds.includes(d.id))!;
          
          let status: BookingStatus = 'booked';
          if (dayOffset < -1) {
            status = Math.random() < 0.1 ? 'no-show' : Math.random() < 0.15 ? 'cancelled' : 'completed';
          } else if (dayOffset === -1 || dayOffset === 0) {
            const randomStatus = Math.random();
            if (randomStatus < 0.05) status = 'no-show';
            else if (randomStatus < 0.1) status = 'cancelled';
            else if (randomStatus < 0.4) status = 'booked';
            else if (randomStatus < 0.6) status = 'checked-in';
            else if (randomStatus < 0.8) status = 'in-progress';
            else status = 'completed';
          }
          
          bookings.push({
            id: `booking-${bookings.length + 1}`,
            patientId: patient.id,
            patientName: patient.name,
            doctorId: doctor.id,
            doctorName: doctor.name,
            roomId: rooms[Math.floor(Math.random() * 3)].id,
            roomName: rooms[Math.floor(Math.random() * 3)].name,
            departmentId: department.id,
            departmentName: department.name,
            startTime: bookingStartTime.toISOString(),
            endTime: bookingEndTime.toISOString(),
            type: types[Math.floor(Math.random() * types.length)],
            status,
            chiefComplaint: ['頭痛', '腹痛', '発熱', '咳', '定期検診', 'めまい', '腰痛'][Math.floor(Math.random() * 7)],
            notes: Math.random() < 0.3 ? '血液検査あり' : undefined,
            isRecurring: Math.random() < 0.2,
            waitingNumber: status === 'checked-in' ? Math.floor(Math.random() * 5) + 1 : undefined,
            createdAt: new Date(bookingStartTime.getTime() - (Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
            updatedAt: bookingStartTime.toISOString()
          });
        }
      });
    });
  }
  
  return bookings.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

// キャンセル待ちリスト
export const waitingList: WaitingList[] = [
  {
    id: 'wait1',
    patientId: 'pat6',
    patientName: '中村 洋子',
    preferredDoctorIds: ['doc1'],
    departmentId: 'dept1',
    preferredDates: ['2025-01-10', '2025-01-11', '2025-01-12'],
    flexibility: 'high',
    notes: '午前中希望',
    createdAt: '2025-01-05T10:00:00Z',
    status: 'waiting'
  },
  {
    id: 'wait2',
    patientId: 'pat7',
    patientName: '藤井 誠',
    preferredDoctorIds: ['doc3'],
    departmentId: 'dept3',
    preferredDates: ['2025-01-08', '2025-01-09'],
    flexibility: 'medium',
    createdAt: '2025-01-04T14:00:00Z',
    status: 'waiting'
  }
];

// 統計データ生成
export function generateDailyStats(date: string): DailyStats {
  const bookings = generateBookings().filter(b => b.startTime.startsWith(date));
  const completed = bookings.filter(b => b.status === 'completed').length;
  const cancelled = bookings.filter(b => b.status === 'cancelled').length;
  const noShow = bookings.filter(b => b.status === 'no-show').length;
  
  const departmentStats: DailyStats['departmentStats'] = {};
  departments.forEach(dept => {
    const deptBookings = bookings.filter(b => b.departmentId === dept.id);
    departmentStats[dept.id] = {
      bookings: deptBookings.length,
      revenue: deptBookings.length * (3000 + Math.random() * 5000) // 仮の診療報酬
    };
  });
  
  return {
    date,
    totalBookings: bookings.length,
    completedBookings: completed,
    cancelledBookings: cancelled,
    noShowBookings: noShow,
    averageWaitingTime: 15 + Math.random() * 30,
    occupancyRate: (bookings.length / 120) * 100, // 仮の最大予約数120
    departmentStats
  };
}

// AI予測データ生成
export function generateCrowdPrediction(date: string): CrowdPrediction {
  const hourlyPredictions = [];
  const peakHours = [];
  
  for (let hour = 9; hour <= 17; hour++) {
    const expectedPatients = hour < 12 ? 10 + Math.random() * 15 : 8 + Math.random() * 12;
    const confidence = 0.7 + Math.random() * 0.25;
    
    hourlyPredictions.push({
      hour,
      expectedPatients: Math.round(expectedPatients),
      confidence,
      recommendedStaff: Math.ceil(expectedPatients / 5)
    });
    
    if (expectedPatients > 18) {
      peakHours.push(hour);
    }
  }
  
  const recommendations = [
    '10:00-11:00は混雑が予想されます。スタッフを1名増員することを推奨します。',
    '14:00以降は比較的空いています。急ぎでない患者様にはこの時間帯をお勧めください。',
    '金曜日は無断キャンセル率が高い傾向があります。リマインダー送信を強化してください。'
  ];
  
  return {
    date,
    hourlyPredictions,
    peakHours,
    recommendations
  };
}