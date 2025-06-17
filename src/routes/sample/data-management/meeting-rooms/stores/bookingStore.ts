/**
 * 会議室予約システム 予約管理ストア
 * 
 * Svelte 5 runesベースの状態管理
 * 医療システムのパターンを継承しつつ、会議室予約に特化した機能を追加
 */

import { writable, derived } from 'svelte/store';
import { getMeetingRoomApiService } from '../api/apiServiceFactory';
import type { 
  Booking, 
  User, 
  BookingQueryParams, 
  CreateBookingDto, 
  UpdateBookingDto,
  TimeSlot,
  CrowdPrediction
} from '../types';
import { CONFIG } from '../config';

// ========================================
// 基本ストア定義
// ========================================

export const bookings = writable<Booking[]>([]);
export const selectedBooking = writable<Booking | null>(null);
export const currentUser = writable<User | null>(null);
export const crowdPrediction = writable<CrowdPrediction | null>(null);

// フィルター・検索条件
export const bookingFilters = writable<BookingQueryParams>({
  startDate: new Date().toISOString().split('T')[0],
  endDate: (() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  })(),
  statuses: ['confirmed', 'pending'],
});

// UI状態
export const isLoading = writable<boolean>(false);
export const error = writable<string | null>(null);
export const successMessage = writable<string | null>(null);

// ========================================
// 派生ストア（Derived Stores）
// ========================================

/**
 * 今日の予約一覧
 */
export const todayBookings = derived(
  [bookings],
  ([$bookings]) => {
    const today = new Date().toISOString().split('T')[0];
    return $bookings.filter(booking => 
      booking.startTime.startsWith(today) && 
      booking.status !== 'cancelled'
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }
);

/**
 * 今後の予約（今日以降）
 */
export const upcomingBookings = derived(
  [bookings],
  ([$bookings]) => {
    const now = new Date();
    return $bookings.filter(booking => 
      new Date(booking.startTime) >= now && 
      booking.status !== 'cancelled'
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }
);

/**
 * 自分の予約一覧
 */
export const myBookings = derived(
  [bookings, currentUser],
  ([$bookings, $currentUser]) => {
    if (!$currentUser) return [];
    return $bookings.filter(booking => booking.userId === $currentUser.id);
  }
);

/**
 * 承認待ち予約（管理者・マネージャー用）
 */
export const pendingApprovals = derived(
  [bookings, currentUser],
  ([$bookings, $currentUser]) => {
    if (!$currentUser || !['admin', 'manager'].includes($currentUser.role)) {
      return [];
    }
    return $bookings.filter(booking => booking.status === 'pending');
  }
);

/**
 * 統計情報
 */
export const bookingStats = derived(
  [bookings],
  ([$bookings]) => {
    const total = $bookings.length;
    const confirmed = $bookings.filter(b => b.status === 'confirmed').length;
    const pending = $bookings.filter(b => b.status === 'pending').length;
    const cancelled = $bookings.filter(b => b.status === 'cancelled').length;
    const completed = $bookings.filter(b => b.status === 'completed').length;

    return {
      total,
      confirmed,
      pending,
      cancelled,
      completed,
      confirmationRate: total > 0 ? Math.round((confirmed / total) * 100) : 0,
      cancellationRate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
    };
  }
);

/**
 * 部署別統計
 */
export const departmentStats = derived(
  [bookings],
  ([$bookings]) => {
    const stats: Record<string, { count: number; hours: number }> = {};
    
    $bookings.forEach(booking => {
      if (!stats[booking.userDepartment]) {
        stats[booking.userDepartment] = { count: 0, hours: 0 };
      }
      stats[booking.userDepartment].count++;
      stats[booking.userDepartment].hours += booking.duration || 0;
    });

    return Object.entries(stats)
      .map(([department, data]) => ({
        department,
        bookingCount: data.count,
        totalHours: Math.round(data.hours / 60 * 10) / 10, // 分→時間変換
      }))
      .sort((a, b) => b.bookingCount - a.bookingCount);
  }
);

// ========================================
// アクション関数
// ========================================

/**
 * 予約一覧を取得
 */
export async function loadBookings(params?: BookingQueryParams): Promise<void> {
  const apiService = getMeetingRoomApiService();
  
  try {
    isLoading.set(true);
    error.set(null);
    
    const fetchedBookings = await apiService.getBookings(params);
    bookings.set(fetchedBookings);
    
    if (params) {
      bookingFilters.set(params);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '予約データの読み込みに失敗しました';
    error.set(errorMessage);
    console.error('予約読み込みエラー:', err);
  } finally {
    isLoading.set(false);
  }
}

/**
 * 予約詳細を取得
 */
export async function loadBooking(id: string): Promise<void> {
  const apiService = getMeetingRoomApiService();
  
  try {
    isLoading.set(true);
    error.set(null);
    
    const booking = await apiService.getBooking(id);
    selectedBooking.set(booking);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '予約詳細の読み込みに失敗しました';
    error.set(errorMessage);
    console.error('予約詳細読み込みエラー:', err);
  } finally {
    isLoading.set(false);
  }
}

/**
 * 新規予約作成
 */
export async function createBooking(bookingData: CreateBookingDto): Promise<Booking | null> {
  const apiService = getMeetingRoomApiService();
  
  try {
    isLoading.set(true);
    error.set(null);
    successMessage.set(null);
    
    const newBooking = await apiService.createBooking(bookingData);
    
    // 既存のリストに追加（イミュータブルな更新）
    bookings.update(currentBookings => [...currentBookings, newBooking]);
    
    successMessage.set('予約を作成しました');
    return newBooking;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '予約の作成に失敗しました';
    error.set(errorMessage);
    console.error('予約作成エラー:', err);
    return null;
  } finally {
    isLoading.set(false);
  }
}

/**
 * 予約更新
 */
export async function updateBooking(id: string, updates: UpdateBookingDto): Promise<boolean> {
  const apiService = getMeetingRoomApiService();
  
  try {
    isLoading.set(true);
    error.set(null);
    successMessage.set(null);
    
    const updatedBooking = await apiService.updateBooking(id, updates);
    
    // 既存のリストを更新（イミュータブルな更新）
    bookings.update(currentBookings => 
      currentBookings.map(booking => 
        booking.id === id ? updatedBooking : booking
      )
    );
    
    // 選択中の予約も更新
    selectedBooking.update(current => 
      current?.id === id ? updatedBooking : current
    );
    
    successMessage.set('予約を更新しました');
    return true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '予約の更新に失敗しました';
    error.set(errorMessage);
    console.error('予約更新エラー:', err);
    return false;
  } finally {
    isLoading.set(false);
  }
}

/**
 * 予約削除
 */
export async function deleteBooking(id: string): Promise<boolean> {
  const apiService = getMeetingRoomApiService();
  
  try {
    isLoading.set(true);
    error.set(null);
    successMessage.set(null);
    
    await apiService.deleteBooking(id);
    
    // リストから削除（イミュータブルな更新）
    bookings.update(currentBookings => 
      currentBookings.filter(booking => booking.id !== id)
    );
    
    // 選択中の予約もクリア
    selectedBooking.update(current => 
      current?.id === id ? null : current
    );
    
    successMessage.set('予約を削除しました');
    return true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '予約の削除に失敗しました';
    error.set(errorMessage);
    console.error('予約削除エラー:', err);
    return false;
  } finally {
    isLoading.set(false);
  }
}

/**
 * チェックイン
 */
export async function checkInBooking(id: string): Promise<boolean> {
  const apiService = getMeetingRoomApiService();
  
  try {
    isLoading.set(true);
    error.set(null);
    successMessage.set(null);
    
    const updatedBooking = await apiService.checkInBooking(id);
    
    // 既存のリストを更新
    bookings.update(currentBookings => 
      currentBookings.map(booking => 
        booking.id === id ? updatedBooking : booking
      )
    );
    
    successMessage.set('チェックインしました');
    return true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'チェックインに失敗しました';
    error.set(errorMessage);
    console.error('チェックインエラー:', err);
    return false;
  } finally {
    isLoading.set(false);
  }
}

/**
 * チェックアウト
 */
export async function checkOutBooking(id: string): Promise<boolean> {
  const apiService = getMeetingRoomApiService();
  
  try {
    isLoading.set(true);
    error.set(null);
    successMessage.set(null);
    
    const updatedBooking = await apiService.checkOutBooking(id);
    
    // 既存のリストを更新
    bookings.update(currentBookings => 
      currentBookings.map(booking => 
        booking.id === id ? updatedBooking : booking
      )
    );
    
    successMessage.set('チェックアウトしました');
    return true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'チェックアウトに失敗しました';
    error.set(errorMessage);
    console.error('チェックアウトエラー:', err);
    return false;
  } finally {
    isLoading.set(false);
  }
}

/**
 * 予約承認
 */
export async function approveBooking(id: string, notes?: string): Promise<boolean> {
  const apiService = getMeetingRoomApiService();
  
  try {
    isLoading.set(true);
    error.set(null);
    successMessage.set(null);
    
    const updatedBooking = await apiService.approveBooking(id, notes);
    
    // 既存のリストを更新
    bookings.update(currentBookings => 
      currentBookings.map(booking => 
        booking.id === id ? updatedBooking : booking
      )
    );
    
    successMessage.set('予約を承認しました');
    return true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '予約の承認に失敗しました';
    error.set(errorMessage);
    console.error('予約承認エラー:', err);
    return false;
  } finally {
    isLoading.set(false);
  }
}

/**
 * 予約却下
 */
export async function rejectBooking(id: string, reason: string): Promise<boolean> {
  const apiService = getMeetingRoomApiService();
  
  try {
    isLoading.set(true);
    error.set(null);
    successMessage.set(null);
    
    const updatedBooking = await apiService.rejectBooking(id, reason);
    
    // 既存のリストを更新
    bookings.update(currentBookings => 
      currentBookings.map(booking => 
        booking.id === id ? updatedBooking : booking
      )
    );
    
    successMessage.set('予約を却下しました');
    return true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '予約の却下に失敗しました';
    error.set(errorMessage);
    console.error('予約却下エラー:', err);
    return false;
  } finally {
    isLoading.set(false);
  }
}

/**
 * 現在のユーザー情報を取得
 */
export async function loadCurrentUser(): Promise<void> {
  const apiService = getMeetingRoomApiService();
  
  try {
    const user = await apiService.getCurrentUser();
    currentUser.set(user);
  } catch (err) {
    console.error('ユーザー情報読み込みエラー:', err);
    // エラーはサイレントに処理（認証エラーの可能性）
  }
}

/**
 * 混雑予測データを取得
 */
export async function loadCrowdPrediction(date: string): Promise<void> {
  const apiService = getMeetingRoomApiService();
  
  try {
    const prediction = await apiService.getCrowdPrediction(date);
    crowdPrediction.set(prediction);
  } catch (err) {
    console.error('混雑予測読み込みエラー:', err);
    crowdPrediction.set(null);
  }
}

/**
 * リマインダー送信
 */
export async function sendReminder(bookingId: string, type: 'email' | 'slack'): Promise<boolean> {
  const apiService = getMeetingRoomApiService();
  
  try {
    isLoading.set(true);
    error.set(null);
    successMessage.set(null);
    
    await apiService.sendReminder(bookingId, type);
    
    successMessage.set('リマインダーを送信しました');
    return true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'リマインダーの送信に失敗しました';
    error.set(errorMessage);
    console.error('リマインダー送信エラー:', err);
    return false;
  } finally {
    isLoading.set(false);
  }
}

// ========================================
// ユーティリティ関数
// ========================================

/**
 * エラーメッセージをクリア
 */
export function clearError(): void {
  error.set(null);
}

/**
 * 成功メッセージをクリア
 */
export function clearSuccessMessage(): void {
  successMessage.set(null);
}

/**
 * 選択中の予約をクリア
 */
export function clearSelectedBooking(): void {
  selectedBooking.set(null);
}

/**
 * フィルターをリセット
 */
export function resetFilters(): void {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  bookingFilters.set({
    startDate: today,
    endDate: nextWeek.toISOString().split('T')[0],
    statuses: ['confirmed', 'pending'],
  });
}

/**
 * 予約時間の重複チェック
 */
export function checkTimeConflict(
  startTime: string, 
  endTime: string, 
  roomId: string, 
  excludeBookingId?: string
): Booking[] {
  let currentBookings: Booking[] = [];
  bookings.subscribe(value => currentBookings = value)();
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  return currentBookings.filter(booking => {
    if (booking.id === excludeBookingId) return false;
    if (booking.roomId !== roomId) return false;
    if (booking.status === 'cancelled') return false;
    
    const bookingStart = new Date(booking.startTime);
    const bookingEnd = new Date(booking.endTime);
    
    return start < bookingEnd && end > bookingStart;
  });
}

/**
 * 予約可能かチェック
 */
export function canBook(
  startTime: string, 
  endTime: string, 
  roomId: string, 
  userId?: string
): { canBook: boolean; reason?: string } {
  const conflicts = checkTimeConflict(startTime, endTime, roomId);
  
  if (conflicts.length > 0) {
    return { 
      canBook: false, 
      reason: '指定時間帯に他の予約があります' 
    };
  }
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();
  
  // 過去の時間はNG
  if (start <= now) {
    return { 
      canBook: false, 
      reason: '過去の時間は予約できません' 
    };
  }
  
  // 営業時間外チェック
  const startHour = start.getHours();
  const endHour = end.getHours();
  const businessStart = parseInt(CONFIG.business.hours.start.split(':')[0]);
  const businessEnd = parseInt(CONFIG.business.hours.end.split(':')[0]);
  
  if (startHour < businessStart || endHour > businessEnd) {
    return { 
      canBook: false, 
      reason: `営業時間外です（${CONFIG.business.hours.start}-${CONFIG.business.hours.end}）` 
    };
  }
  
  // 最大予約可能日数チェック
  const maxDays = CONFIG.business.maxAdvanceBookingDays;
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxDays);
  
  if (start > maxDate) {
    return { 
      canBook: false, 
      reason: `${maxDays}日先までしか予約できません` 
    };
  }
  
  return { canBook: true };
}

// ========================================
// 初期化
// ========================================

/**
 * ストアの初期化
 */
export function initializeBookingStore(): void {
  loadCurrentUser();
  loadBookings();
  
  // 今日の混雑予測を取得
  const today = new Date().toISOString().split('T')[0];
  loadCrowdPrediction(today);
}

// ========================================
// 重複予約チェック機能
// ========================================

/**
 * 時間の重複をチェック
 */
function checkTimeOverlap(
  start1: string | Date, 
  end1: string | Date, 
  start2: string | Date, 
  end2: string | Date
): boolean {
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);
  
  return s1 < e2 && s2 < e1;
}

/**
 * 重複予約をチェック
 */
export function checkBookingConflict(
  startTime: string,
  endTime: string,
  roomId: string,
  excludeBookingId?: string
): Booking[] {
  let currentBookings: Booking[] = [];
  bookings.subscribe(value => currentBookings = value)();
  
  return currentBookings.filter(booking => {
    // 自分自身は除外
    if (excludeBookingId && booking.id === excludeBookingId) return false;
    
    // キャンセル済みは除外
    if (booking.status === 'cancelled') return false;
    
    // 異なる会議室は除外
    if (booking.roomId !== roomId) return false;
    
    // 時間の重複をチェック
    return checkTimeOverlap(startTime, endTime, booking.startTime, booking.endTime);
  });
}

/**
 * 予約が可能かチェック
 */
export function canBookRoom(
  startTime: string,
  endTime: string,
  roomId: string,
  excludeBookingId?: string
): { canBook: boolean; reason?: string; conflicts: Booking[] } {
  // 重複予約をチェック
  const conflicts = checkBookingConflict(startTime, endTime, roomId, excludeBookingId);
  
  if (conflicts.length > 0) {
    return {
      canBook: false,
      reason: `この時間帯には既に${conflicts.length}件の予約があります`,
      conflicts
    };
  }
  
  // 過去の時間チェック
  const now = new Date();
  const bookingStart = new Date(startTime);
  
  if (bookingStart <= now) {
    return {
      canBook: false,
      reason: '過去の時間には予約できません',
      conflicts: []
    };
  }
  
  // 営業時間チェック
  const hour = bookingStart.getHours();
  const endHour = new Date(endTime).getHours();
  if (hour < 8 || endHour > 22) {
    return {
      canBook: false,
      reason: '営業時間外です（8:00-22:00）',
      conflicts: []
    };
  }
  
  return {
    canBook: true,
    conflicts: []
  };
}