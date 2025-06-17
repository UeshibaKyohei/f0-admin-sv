// リソース管理ストア
import { writable, derived } from 'svelte/store';
import type { Doctor, Department, Room, Equipment } from '../types';
import { doctors as mockDoctors, departments as mockDepartments, rooms as mockRooms, equipment as mockEquipment } from '../api/mockData';

function createResourceStore() {
  const doctors = writable<Doctor[]>(mockDoctors);
  const departments = writable<Department[]>(mockDepartments);
  const rooms = writable<Room[]>(mockRooms);
  const equipment = writable<Equipment[]>(mockEquipment);

  // アクティブな医師のみ
  const activeDoctors = derived(doctors, $doctors => 
    $doctors.filter(doctor => doctor.isActive)
  );

  // アクティブな診察室のみ
  const activeRooms = derived(rooms, $rooms => 
    $rooms.filter(room => room.isActive)
  );

  // アクティブな機器のみ
  const activeEquipment = derived(equipment, $equipment => 
    $equipment.filter(eq => eq.isActive)
  );

  // 診療科別の医師
  const doctorsByDepartment = derived(
    [doctors, departments],
    ([$doctors, $departments]) => {
      const result: Record<string, Doctor[]> = {};
      $departments.forEach(dept => {
        result[dept.id] = $doctors.filter(doc => 
          doc.departmentIds.includes(dept.id) && doc.isActive
        );
      });
      return result;
    }
  );

  // 診察室タイプ別のグループ
  const roomsByType = derived(rooms, $rooms => {
    const result: Record<string, Room[]> = {
      consultation: [],
      examination: [],
      treatment: []
    };
    $rooms.forEach(room => {
      if (room.isActive) {
        result[room.type].push(room);
      }
    });
    return result;
  });

  // リソースの利用可能性チェック
  function checkResourceAvailability(
    resourceType: 'doctor' | 'room' | 'equipment',
    resourceId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string
  ): boolean {
    // TODO: 実際の予約データと照合して利用可能性をチェック
    return true;
  }

  // 医師のスケジュール取得
  function getDoctorSchedule(doctorId: string, date: Date) {
    const doctor = mockDoctors.find(d => d.id === doctorId);
    if (!doctor) return null;

    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()] as keyof typeof doctor.schedule.regularHours;
    const regularSchedule = doctor.schedule.regularHours[dayOfWeek];
    
    // 特別スケジュールのチェック
    const dateStr = date.toISOString().split('T')[0];
    const specialSchedule = doctor.schedule.specialSchedules.find(s => s.date === dateStr);
    
    // 休暇のチェック
    const isOnVacation = doctor.schedule.vacations.some(v => 
      dateStr >= v.startDate && dateStr <= v.endDate
    );

    if (isOnVacation) return null;
    if (specialSchedule) return specialSchedule.timeSlots;
    return regularSchedule || null;
  }

  return {
    doctors,
    departments,
    rooms,
    equipment,
    activeDoctors,
    activeRooms,
    activeEquipment,
    doctorsByDepartment,
    roomsByType,
    checkResourceAvailability,
    getDoctorSchedule
  };
}

export const resourceStore = createResourceStore();