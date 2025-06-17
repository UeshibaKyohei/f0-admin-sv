// 予約データ管理ストア
import { writable, derived } from 'svelte/store';
import type { Booking, BookingFilter, Patient, WaitingList } from '../types';
import { generateBookings, patients as mockPatients, waitingList as mockWaitingList } from '../api/mockData';
import { getApiService } from '../api/apiServiceFactory';
import { CONFIG } from '../config';

// 予約データストア
function createBookingStore() {
  const bookings = writable<Booking[]>([]);
  const patients = writable<Patient[]>(mockPatients);
  const waitingList = writable<WaitingList[]>(mockWaitingList);
  const filter = writable<BookingFilter>({});
  const selectedDate = writable<Date>(new Date());
  const viewMode = writable<'month' | 'week' | 'day'>('week');

  // 初期データロード
  async function loadInitialData() {
    try {
      if (CONFIG.isMockMode) {
        // モックモード: 生成されたデータを使用
        bookings.set(generateBookings());
      } else {
        // 本番モード: APIから取得
        const apiService = getApiService();
        const [bookingData, patientData] = await Promise.all([
          apiService.getBookings(),
          apiService.getPatients()
        ]);
        bookings.set(bookingData);
        patients.set(patientData);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      // エラー時はモックデータを使用
      bookings.set(generateBookings());
    }
  }
  
  // 初期化時にデータをロード
  loadInitialData();

  // フィルタリングされた予約
  const filteredBookings = derived(
    [bookings, filter],
    ([$bookings, $filter]) => {
      return $bookings.filter(booking => {
        // 日付フィルター
        if ($filter.startDate && booking.startTime < $filter.startDate) return false;
        if ($filter.endDate && booking.startTime > $filter.endDate) return false;
        
        // 医師フィルター
        if ($filter.doctorIds?.length && !$filter.doctorIds.includes(booking.doctorId)) return false;
        
        // 診療科フィルター
        if ($filter.departmentIds?.length && !$filter.departmentIds.includes(booking.departmentId)) return false;
        
        // 診察室フィルター
        if ($filter.roomIds?.length && booking.roomId && !$filter.roomIds.includes(booking.roomId)) return false;
        
        // ステータスフィルター
        if ($filter.statuses?.length && !$filter.statuses.includes(booking.status)) return false;
        
        // タイプフィルター
        if ($filter.types?.length && !$filter.types.includes(booking.type)) return false;
        
        // テキスト検索
        if ($filter.searchText) {
          const searchLower = $filter.searchText.toLowerCase();
          return (
            booking.patientName.toLowerCase().includes(searchLower) ||
            booking.doctorName.toLowerCase().includes(searchLower) ||
            booking.chiefComplaint?.toLowerCase().includes(searchLower) ||
            booking.notes?.toLowerCase().includes(searchLower)
          );
        }
        
        return true;
      });
    }
  );

  // 選択日の予約
  const selectedDateBookings = derived(
    [filteredBookings, selectedDate],
    ([$bookings, $date]) => {
      const dateStr = $date.toISOString().split('T')[0];
      return $bookings.filter(booking => booking.startTime.startsWith(dateStr));
    }
  );

  // 予約の追加
  async function addBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const apiService = getApiService();
      const newBooking = await apiService.createBooking(booking);
      bookings.update(items => {
        return [...items, newBooking].sort((a, b) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      });
      return newBooking;
    } catch (error) {
      console.error('Failed to add booking:', error);
      throw error;
    }
  }

  // 予約の更新
  async function updateBooking(id: string, updates: Partial<Booking>) {
    try {
      const updatedBooking = await apiClient.updateBooking(id, updates);
      bookings.update(items => {
        return items.map(item => 
          item.id === id ? { ...item, ...updatedBooking } : item
        );
      });
      return updatedBooking;
    } catch (error) {
      console.error('Failed to update booking:', error);
      throw error;
    }
  }

  // 予約の削除
  async function deleteBooking(id: string) {
    try {
      await apiClient.deleteBooking(id);
      bookings.update(items => items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete booking:', error);
      throw error;
    }
  }

  // ステータスの更新
  function updateBookingStatus(id: string, status: Booking['status']) {
    updateBooking(id, { status });
  }

  // キャンセル待ちリストへの追加
  function addToWaitingList(entry: Omit<WaitingList, 'id' | 'createdAt' | 'status'>) {
    waitingList.update(items => {
      const newEntry: WaitingList = {
        ...entry,
        id: `wait-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'waiting'
      };
      return [...items, newEntry];
    });
  }
  
  // フィルターの設定
  function setFilter(newFilter: BookingFilter) {
    filter.set(newFilter);
  }

  return {
    bookings,
    patients,
    waitingList,
    filter,
    selectedDate,
    viewMode,
    filteredBookings,
    selectedDateBookings,
    addBooking,
    updateBooking,
    deleteBooking,
    updateBookingStatus,
    addToWaitingList,
    setFilter
  };
}

export const bookingStore = createBookingStore();