/**
 * 会議室予約システム 会議室管理ストア
 * 
 * Svelte 5 runesベースの状態管理
 * 会議室一覧、空き状況、利用統計などを管理
 */

import { writable, derived } from 'svelte/store';
import { getMeetingRoomApiService } from '../api/apiServiceFactory';
import type { 
  Room, 
  Equipment, 
  TimeSlot, 
  RoomQueryParams,
  RoomSearchParams,
  RoomAvailability,
  UsageStats,
  RoomAnalytics,
  AvailabilityParams
} from '../types';
import { CONFIG } from '../config';

// ========================================
// 基本ストア定義
// ========================================

export const rooms = writable<Room[]>([]);
export const equipment = writable<Equipment[]>([]);
export const selectedRoom = writable<Room | null>(null);
export const roomAvailability = writable<TimeSlot[]>([]);
export const usageStats = writable<UsageStats | null>(null);
export const roomAnalytics = writable<RoomAnalytics | null>(null);

// フィルター・検索条件
export const roomFilters = writable<RoomQueryParams>({
  buildingId: undefined,
  floor: undefined,
  type: undefined,
  minCapacity: undefined,
  maxCapacity: undefined,
  equipment: [],
  available: undefined,
});

// 検索パラメータ
export const searchParams = writable<RoomSearchParams | null>(null);

// UI状態
export const isLoading = writable<boolean>(false);
export const error = writable<string | null>(null);
export const selectedDate = writable<string>(new Date().toISOString().split('T')[0]);
export const viewMode = writable<'list' | 'grid' | 'map'>('grid');

// ========================================
// 派生ストア（Derived Stores）
// ========================================

/**
 * 建物別の会議室グルーピング
 */
export const roomsByBuilding = derived(
  [rooms],
  ([$rooms]) => {
    const grouped: Record<string, Room[]> = {};
    
    $rooms.forEach(room => {
      const building = room.building || '未分類';
      if (!grouped[building]) {
        grouped[building] = [];
      }
      grouped[building].push(room);
    });
    
    // 各建物内でフロア順に並び替え
    Object.keys(grouped).forEach(building => {
      grouped[building].sort((a, b) => {
        if (a.floor !== b.floor) {
          return a.floor - b.floor;
        }
        return a.name.localeCompare(b.name);
      });
    });
    
    return grouped;
  }
);

/**
 * フロア別の会議室グルーピング
 */
export const roomsByFloor = derived(
  [rooms],
  ([$rooms]) => {
    const grouped: Record<number, Room[]> = {};
    
    $rooms.forEach(room => {
      if (!grouped[room.floor]) {
        grouped[room.floor] = [];
      }
      grouped[room.floor].push(room);
    });
    
    // 各フロア内で名前順に並び替え
    Object.keys(grouped).forEach(floor => {
      grouped[floor].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return grouped;
  }
);

/**
 * タイプ別の会議室グルーピング
 */
export const roomsByType = derived(
  [rooms],
  ([$rooms]) => {
    const grouped: Record<string, Room[]> = {};
    
    $rooms.forEach(room => {
      if (!grouped[room.type]) {
        grouped[room.type] = [];
      }
      grouped[room.type].push(room);
    });
    
    // 各タイプ内で収容人数順に並び替え
    Object.keys(grouped).forEach(type => {
      grouped[type].sort((a, b) => b.capacity - a.capacity);
    });
    
    return grouped;
  }
);

/**
 * 利用可能な会議室（現在時刻基準）
 */
export const availableRooms = derived(
  [rooms, selectedDate],
  ([$rooms, $selectedDate]) => {
    // TODO: 実際の空き状況チェックロジックを実装
    // 現在はシンプルにアクティブな会議室を返す
    return $rooms.filter(room => room.isActive);
  }
);

/**
 * 設備別フィルター用データ
 */
export const equipmentOptions = derived(
  [equipment],
  ([$equipment]) => {
    return $equipment.map(eq => ({
      value: eq.id,
      label: eq.name,
      icon: eq.icon,
      type: eq.type,
    }));
  }
);

/**
 * 収容人数の範囲情報
 */
export const capacityRange = derived(
  [rooms],
  ([$rooms]) => {
    if ($rooms.length === 0) return { min: 1, max: 50 };
    
    const capacities = $rooms.map(room => room.capacity);
    return {
      min: Math.min(...capacities),
      max: Math.max(...capacities),
    };
  }
);

/**
 * 建物・フロア情報
 */
export const buildingFloorInfo = derived(
  [rooms],
  ([$rooms]) => {
    const buildings = new Set($rooms.map(room => room.building).filter(Boolean));
    const floors = new Set($rooms.map(room => room.floor));
    
    return {
      buildings: Array.from(buildings).sort(),
      floors: Array.from(floors).sort((a, b) => a - b),
    };
  }
);

/**
 * 会議室タイプ別カウント
 */
export const roomTypeStats = derived(
  [rooms],
  ([$rooms]) => {
    const stats: Record<string, number> = {};
    
    $rooms.forEach(room => {
      stats[room.type] = (stats[room.type] || 0) + 1;
    });
    
    return Object.entries(stats)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }
);

// ========================================
// アクション関数
// ========================================

/**
 * 会議室一覧を取得
 */
export async function loadRooms(params?: RoomQueryParams): Promise<void> {
  const apiService = getMeetingRoomApiService();
  
  try {
    isLoading.set(true);
    error.set(null);
    
    const fetchedRooms = await apiService.getRooms(params);
    rooms.set(fetchedRooms);
    
    if (params) {
      roomFilters.set(params);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '会議室データの読み込みに失敗しました';
    error.set(errorMessage);
    console.error('会議室読み込みエラー:', err);
  } finally {
    isLoading.set(false);
  }
}

/**
 * 会議室詳細を取得
 */
export async function loadRoom(id: string): Promise<void> {
  const apiService = getMeetingRoomApiService();
  
  try {
    isLoading.set(true);
    error.set(null);
    
    const room = await apiService.getRoom(id);
    selectedRoom.set(room);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '会議室詳細の読み込みに失敗しました';
    error.set(errorMessage);
    console.error('会議室詳細読み込みエラー:', err);
  } finally {
    isLoading.set(false);
  }
}

/**
 * 設備一覧を取得
 */
export async function loadEquipment(): Promise<void> {
  const apiService = getMeetingRoomApiService();
  
  try {
    const fetchedEquipment = await apiService.getEquipment();
    equipment.set(fetchedEquipment);
  } catch (err) {
    console.error('設備読み込みエラー:', err);
    // 設備はサイレントに失敗させる
  }
}

/**
 * 会議室の空き状況を取得
 */
export async function loadRoomAvailability(roomId: string, date: string): Promise<void> {
  const apiService = getMeetingRoomApiService();
  
  try {
    isLoading.set(true);
    error.set(null);
    
    const availability = await apiService.getRoomAvailability(roomId, date);
    roomAvailability.set(availability);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '空き状況の読み込みに失敗しました';
    error.set(errorMessage);
    console.error('空き状況読み込みエラー:', err);
  } finally {
    isLoading.set(false);
  }
}

/**
 * 利用可能な会議室を検索
 */
export async function searchAvailableRooms(params: RoomSearchParams): Promise<RoomAvailability[]> {
  const apiService = getMeetingRoomApiService();
  
  try {
    isLoading.set(true);
    error.set(null);
    
    const availableRooms = await apiService.searchAvailableRooms(params);
    searchParams.set(params);
    
    return availableRooms;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '会議室検索に失敗しました';
    error.set(errorMessage);
    console.error('会議室検索エラー:', err);
    return [];
  } finally {
    isLoading.set(false);
  }
}

/**
 * 利用可能時間枠を取得
 */
export async function getAvailableTimeSlots(params: AvailabilityParams): Promise<TimeSlot[]> {
  const apiService = getMeetingRoomApiService();
  
  try {
    const timeSlots = await apiService.getAvailableTimeSlots(params);
    return timeSlots;
  } catch (err) {
    console.error('時間枠取得エラー:', err);
    return [];
  }
}

/**
 * 利用統計を取得
 */
export async function loadUsageStats(
  startDate: string, 
  endDate: string, 
  roomId?: string
): Promise<void> {
  const apiService = getMeetingRoomApiService();
  
  try {
    isLoading.set(true);
    error.set(null);
    
    const stats = await apiService.getUsageStats({
      startDate,
      endDate,
      roomId
    });
    
    usageStats.set(stats);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '利用統計の読み込みに失敗しました';
    error.set(errorMessage);
    console.error('利用統計読み込みエラー:', err);
  } finally {
    isLoading.set(false);
  }
}

/**
 * 会議室分析データを取得
 */
export async function loadRoomAnalytics(
  roomId: string,
  startDate: string,
  endDate: string
): Promise<void> {
  const apiService = getMeetingRoomApiService();
  
  try {
    isLoading.set(true);
    error.set(null);
    
    const analytics = await apiService.getRoomAnalytics({
      roomId,
      startDate,
      endDate
    });
    
    roomAnalytics.set(analytics);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '分析データの読み込みに失敗しました';
    error.set(errorMessage);
    console.error('分析データ読み込みエラー:', err);
  } finally {
    isLoading.set(false);
  }
}

/**
 * 会議室を作成
 */
export async function createRoom(roomData: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<Room | null> {
  const apiService = getMeetingRoomApiService();
  
  try {
    isLoading.set(true);
    error.set(null);
    
    const newRoom = await apiService.createRoom(roomData);
    
    // 会議室一覧を更新
    rooms.update(currentRooms => [...currentRooms, newRoom]);
    
    return newRoom;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '会議室の作成に失敗しました';
    error.set(errorMessage);
    console.error('会議室作成エラー:', err);
    return null;
  } finally {
    isLoading.set(false);
  }
}

/**
 * 会議室を更新
 */
export async function updateRoom(id: string, roomData: Partial<Room>): Promise<Room | null> {
  const apiService = getMeetingRoomApiService();
  
  try {
    isLoading.set(true);
    error.set(null);
    
    const updatedRoom = await apiService.updateRoom(id, roomData);
    
    // 会議室一覧を更新
    rooms.update(currentRooms => 
      currentRooms.map(room => 
        room.id === id ? updatedRoom : room
      )
    );
    
    // 選択中の会議室も更新
    selectedRoom.update(current => 
      current?.id === id ? updatedRoom : current
    );
    
    return updatedRoom;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '会議室の更新に失敗しました';
    error.set(errorMessage);
    console.error('会議室更新エラー:', err);
    return null;
  } finally {
    isLoading.set(false);
  }
}

/**
 * 会議室を削除
 */
export async function deleteRoom(id: string): Promise<boolean> {
  const apiService = getMeetingRoomApiService();
  
  try {
    isLoading.set(true);
    error.set(null);
    
    await apiService.deleteRoom(id);
    
    // 会議室一覧から削除
    rooms.update(currentRooms => 
      currentRooms.filter(room => room.id !== id)
    );
    
    // 選択中の会議室をクリア（削除された場合）
    selectedRoom.update(current => 
      current?.id === id ? null : current
    );
    
    return true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '会議室の削除に失敗しました';
    error.set(errorMessage);
    console.error('会議室削除エラー:', err);
    return false;
  } finally {
    isLoading.set(false);
  }
}

// ========================================
// 会議室検索・フィルタリング
// ========================================

/**
 * フィルター条件で会議室を絞り込み
 */
export function filterRooms(filters: RoomQueryParams): void {
  roomFilters.set(filters);
  loadRooms(filters);
}

/**
 * 設備で会議室を絞り込み
 */
export function filterByEquipment(equipmentIds: string[]): void {
  roomFilters.update(current => ({
    ...current,
    equipment: equipmentIds
  }));
  
  let currentFilters: RoomQueryParams = {};
  roomFilters.subscribe(value => currentFilters = value)();
  loadRooms(currentFilters);
}

/**
 * 収容人数で会議室を絞り込み
 */
export function filterByCapacity(minCapacity?: number, maxCapacity?: number): void {
  roomFilters.update(current => ({
    ...current,
    minCapacity,
    maxCapacity
  }));
  
  let currentFilters: RoomQueryParams = {};
  roomFilters.subscribe(value => currentFilters = value)();
  loadRooms(currentFilters);
}

/**
 * フロアで会議室を絞り込み
 */
export function filterByFloor(floor?: number): void {
  roomFilters.update(current => ({
    ...current,
    floor
  }));
  
  let currentFilters: RoomQueryParams = {};
  roomFilters.subscribe(value => currentFilters = value)();
  loadRooms(currentFilters);
}

/**
 * 会議室タイプで絞り込み
 */
export function filterByType(type?: string): void {
  roomFilters.update(current => ({
    ...current,
    type
  }));
  
  let currentFilters: RoomQueryParams = {};
  roomFilters.subscribe(value => currentFilters = value)();
  loadRooms(currentFilters);
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
 * 選択中の会議室をクリア
 */
export function clearSelectedRoom(): void {
  selectedRoom.set(null);
  roomAvailability.set([]);
}

/**
 * フィルターをリセット
 */
export function resetFilters(): void {
  roomFilters.set({
    buildingId: undefined,
    floor: undefined,
    type: undefined,
    minCapacity: undefined,
    maxCapacity: undefined,
    equipment: [],
    available: undefined,
  });
  loadRooms();
}

/**
 * 検索パラメータをクリア
 */
export function clearSearchParams(): void {
  searchParams.set(null);
}

/**
 * 表示モードを変更
 */
export function setViewMode(mode: 'list' | 'grid' | 'map'): void {
  viewMode.set(mode);
}

/**
 * 対象日を変更
 */
export function setSelectedDate(date: string): void {
  selectedDate.set(date);
  
  // 選択中の会議室がある場合は空き状況を再取得
  let currentRoom: Room | null = null;
  selectedRoom.subscribe(value => currentRoom = value)();
  
  if (currentRoom) {
    loadRoomAvailability(currentRoom.id, date);
  }
}

/**
 * 会議室が利用可能かチェック
 */
export function isRoomAvailable(
  roomId: string, 
  startTime: string, 
  endTime: string
): boolean {
  let availability: TimeSlot[] = [];
  roomAvailability.subscribe(value => availability = value)();
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  // 30分単位での空き状況をチェック
  for (let current = new Date(start); current < end; current.setMinutes(current.getMinutes() + 30)) {
    const timeStr = current.toTimeString().slice(0, 5);
    const slot = availability.find(slot => slot.time === timeStr);
    
    if (!slot || !slot.available) {
      return false;
    }
  }
  
  return true;
}

/**
 * 会議室の収容人数が十分かチェック
 */
export function hasEnoughCapacity(roomId: string, requiredCapacity: number): boolean {
  let currentRooms: Room[] = [];
  rooms.subscribe(value => currentRooms = value)();
  
  const room = currentRooms.find(r => r.id === roomId);
  return room ? room.capacity >= requiredCapacity : false;
}

/**
 * 会議室が必要な設備を持っているかチェック
 */
export function hasRequiredEquipment(roomId: string, requiredEquipmentIds: string[]): boolean {
  let currentRooms: Room[] = [];
  rooms.subscribe(value => currentRooms = value)();
  
  const room = currentRooms.find(r => r.id === roomId);
  if (!room) return false;
  
  return requiredEquipmentIds.every(equipmentId => 
    room.equipment.includes(equipmentId)
  );
}

/**
 * 会議室の営業時間内かチェック
 */
export function isWithinBusinessHours(startTime: string, endTime: string): boolean {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const businessStart = parseInt(CONFIG.business.hours.start.split(':')[0]);
  const businessEnd = parseInt(CONFIG.business.hours.end.split(':')[0]);
  
  const startHour = start.getHours();
  const endHour = end.getHours();
  
  return startHour >= businessStart && endHour <= businessEnd;
}

// ========================================
// 初期化
// ========================================

/**
 * ストアの初期化
 */
export function initializeRoomStore(): void {
  loadRooms();
  loadEquipment();
}