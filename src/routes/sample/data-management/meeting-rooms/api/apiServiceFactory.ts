/**
 * 会議室予約システム APIサービスファクトリー
 * 
 * 設定に基づいてAPIサービスの実装を切り替える
 * DIパターンの実装により、テスト時やモックモード時の切り替えが容易
 */

import { CONFIG } from '../config';
import { MeetingRoomApiClient } from './apiClient';
import type { IMeetingRoomApiService } from './apiService.interface';

/**
 * 本実装時の拡張ポイント:
 * 1. 本番用APIサービスクラスを作成
 * 2. テスト用モックサービスを追加
 * 3. 環境別の認証方式に対応
 * 4. キャッシュ戦略の実装
 */

let apiServiceInstance: IMeetingRoomApiService | null = null;

/**
 * APIサービスのシングルトンインスタンスを取得
 */
export function getMeetingRoomApiService(): IMeetingRoomApiService {
  if (!apiServiceInstance) {
    apiServiceInstance = createApiService();
  }
  return apiServiceInstance;
}

/**
 * APIサービスのインスタンスを作成
 * 設定に基づいて適切な実装を選択
 */
function createApiService(): IMeetingRoomApiService {
  if (CONFIG.isMockMode) {
    // モックモード: 既存のMeetingRoomApiClientを使用
    return new MeetingRoomApiClient();
  } else {
    // 本番モード: 同じMeetingRoomApiClientだが、内部でfetchを使用
    // 本実装時は、ここで本番用のクラスを返す
    // 例: return new ProductionMeetingRoomApiClient();
    return new MeetingRoomApiClient();
  }
}

/**
 * APIサービスの強制再作成
 * テスト時やコンフィグ変更時に使用
 */
export function resetMeetingRoomApiService(): void {
  apiServiceInstance = null;
}

/**
 * カスタムAPIサービスを設定
 * テスト時やモック時に手動でサービスを設定する場合に使用
 */
export function setMeetingRoomApiService(service: IMeetingRoomApiService): void {
  apiServiceInstance = service;
}

/**
 * 本実装時の使用例:
 * 
 * // 通常の使用
 * const apiService = getMeetingRoomApiService();
 * const bookings = await apiService.getBookings();
 * 
 * // テスト時
 * const mockService = new MockMeetingRoomApiService();
 * setMeetingRoomApiService(mockService);
 * 
 * // コンフィグ変更後
 * CONFIG.isMockMode = false;
 * resetMeetingRoomApiService(); // 新しい設定で再作成
 * 
 * // キャッシュ機能付きサービス（本実装時）
 * class CachedMeetingRoomApiService implements IMeetingRoomApiService {
 *   private cache = new Map();
 *   private apiClient: IMeetingRoomApiService;
 * 
 *   constructor(client: IMeetingRoomApiService) {
 *     this.apiClient = client;
 *   }
 * 
 *   async getBookings(params?: BookingQueryParams): Promise<Booking[]> {
 *     const cacheKey = JSON.stringify(params);
 *     if (this.cache.has(cacheKey)) {
 *       return this.cache.get(cacheKey);
 *     }
 * 
 *     const result = await this.apiClient.getBookings(params);
 *     this.cache.set(cacheKey, result);
 *     
 *     // 5分後にキャッシュクリア
 *     setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
 *     
 *     return result;
 *   }
 *   
 *   // 他のメソッドも同様に実装...
 * }
 */