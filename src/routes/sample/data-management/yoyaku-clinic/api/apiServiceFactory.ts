/**
 * APIサービスファクトリー
 * 
 * 設定に基づいてAPIサービスの実装を切り替える
 * DIパターンの実装により、テスト時やモックモード時の切り替えが容易
 */

import { CONFIG } from '../config';
import { ApiClient } from './apiClient';
import type { IApiService } from './apiService.interface';

/**
 * 本実装時の拡張ポイント:
 * 1. 本番用APIサービスクラスを作成
 * 2. テスト用モックサービスを追加
 * 3. 環境別の認証方式に対応
 */

let apiServiceInstance: IApiService | null = null;

/**
 * APIサービスのシングルトンインスタンスを取得
 */
export function getApiService(): IApiService {
  if (!apiServiceInstance) {
    apiServiceInstance = createApiService();
  }
  return apiServiceInstance;
}

/**
 * APIサービスのインスタンスを作成
 * 設定に基づいて適切な実装を選択
 */
function createApiService(): IApiService {
  if (CONFIG.isMockMode) {
    // モックモード: 既存のApiClientを使用
    return new ApiClient();
  } else {
    // 本番モード: 同じApiClientだが、内部でfetchを使用
    // 本実装時は、ここで本番用のクラスを返す
    return new ApiClient();
  }
}

/**
 * APIサービスの強制再作成
 * テスト時やコンフィグ変更時に使用
 */
export function resetApiService(): void {
  apiServiceInstance = null;
}

/**
 * カスタムAPIサービスを設定
 * テスト時やモック時に手動でサービスを設定する場合に使用
 */
export function setApiService(service: IApiService): void {
  apiServiceInstance = service;
}

/**
 * 本実装時の使用例:
 * 
 * // 通常の使用
 * const apiService = getApiService();
 * const bookings = await apiService.getBookings();
 * 
 * // テスト時
 * const mockService = new MockApiService();
 * setApiService(mockService);
 * 
 * // コンフィグ変更後
 * CONFIG.isMockMode = false;
 * resetApiService(); // 新しい設定で再作成
 */