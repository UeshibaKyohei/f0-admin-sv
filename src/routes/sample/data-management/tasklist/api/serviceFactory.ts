// データサービスファクトリ
// 設定に基づいて適切なサービス実装を選択

import type { DataService } from './dataService';
import { config } from '../config.js';
import { LocalStorageService } from './localStorageService';
import { ProductionApiService } from './apiService';

/**
 * データサービスファクトリ
 * config.USE_LOCAL_STORAGE の設定に基づいて適切なサービスを返す
 * 
 * 使用例:
 * - モック/開発時: LocalStorageService (USE_LOCAL_STORAGE = true)
 * - 本実装時: ProductionApiService (USE_LOCAL_STORAGE = false)
 */
class DataServiceFactory {
  private static instance: DataService | null = null;

  /**
   * シングルトンパターンでデータサービスインスタンスを取得
   * 設定変更時は再初期化が必要
   */
  static getDataService(): DataService {
    if (this.instance === null) {
      this.instance = this.createService();
    }
    return this.instance;
  }

  /**
   * データサービスインスタンスを再作成
   * 設定変更後に呼び出す
   */
  static resetService(): void {
    this.instance = null;
  }

  /**
   * 設定に基づいて適切なサービスを作成
   */
  private static createService(): DataService {
    if (config.USE_LOCAL_STORAGE) {
      console.log('🗄️ LocalStorageService を使用します（モック/開発モード）');
      return new LocalStorageService();
    } else {
      console.log('🌐 ProductionApiService を使用します（本実装モード）');
      return new ProductionApiService();
    }
  }

  /**
   * デバッグ用：現在使用中のサービスタイプを取得
   */
  static getCurrentServiceType(): string {
    return config.USE_LOCAL_STORAGE ? 'LocalStorage' : 'ProductionAPI';
  }

  /**
   * 設定を変更してサービスを切り替え
   * @param useLocalStorage LocalStorageを使用するかどうか
   */
  static switchService(useLocalStorage: boolean): void {
    config.USE_LOCAL_STORAGE = useLocalStorage;
    this.resetService();
    
    console.log(`🔄 データサービスを切り替えました: ${this.getCurrentServiceType()}`);
  }
}

/**
 * デフォルトエクスポート: ファクトリから取得したサービスインスタンス
 * 他のモジュールではこれをインポートして使用
 * 
 * 使用例:
 * import { dataService } from './api/serviceFactory';
 * const tasks = await dataService.getTasks();
 */
export const dataService = DataServiceFactory.getDataService();

/**
 * ファクトリクラスもエクスポート（設定変更用）
 */
export { DataServiceFactory };

/**
 * 本実装切り替え用のヘルパー関数
 * この関数を呼び出すことで一括して本実装モードに切り替える
 */
export function enableProductionMode(): void {
  // config.js の enableProductionMode も呼び出す
  const { enableProductionMode: configEnableProductionMode } = require('../config.js');
  configEnableProductionMode();
  
  // データサービスも本実装用に切り替え
  DataServiceFactory.switchService(false);
  
  console.log('🚀 本実装モードが有効化されました');
}

/**
 * 開発モード切り替え用のヘルパー関数
 */
export function enableDevelopmentMode(): void {
  config.FEATURE_MOCK_DATA = true;
  config.FEATURE_DEMO_MODE = true;
  config.USE_LOCAL_STORAGE = true;
  
  DataServiceFactory.switchService(true);
  
  console.log('🛠️ 開発モードが有効化されました');
}

/**
 * サービス接続テスト用の関数
 * 本実装時の接続確認に使用
 */
export async function testServiceConnection(): Promise<boolean> {
  try {
    const service = DataServiceFactory.getDataService();
    
    // 軽量なテスト呼び出し（ユーザー情報取得など）
    await service.getCurrentUser();
    
    console.log('✅ データサービス接続テスト成功');
    return true;
  } catch (error) {
    console.error('❌ データサービス接続テスト失敗:', error);
    return false;
  }
}