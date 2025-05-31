// API通信層
// モックモードと本番モードを切り替え可能な設計

import type { 
  Batch, 
  ProcessStep, 
  BatchProgress, 
  Alert, 
  WorkLog, 
  BatchProgressSummary,
  ApiResponse,
  PaginationParams,
  PaginatedResponse 
} from '../types';
import * as mockApi from './mock';

// 環境設定
const API_CONFIG = {
  useMock: true, // 本番では false に設定
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
};

/**
 * APIクライアントのインターフェース
 * モックと本番で同じインターフェースを実装
 */
interface ApiClient {
  // バッチ関連
  getBatches(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Batch>>>;
  getBatch(id: string): Promise<ApiResponse<Batch>>;
  updateBatch(id: string, data: Partial<Batch>): Promise<ApiResponse<Batch>>;
  
  // 工程関連
  getProcessSteps(productId: string): Promise<ApiResponse<ProcessStep[]>>;
  
  // 進捗関連
  getBatchProgress(batchId: string): Promise<ApiResponse<BatchProgressSummary>>;
  updateProgress(batchId: string, stepId: string, data: Partial<BatchProgress>): Promise<ApiResponse<BatchProgress>>;
  
  // アラート関連
  getAlerts(batchId: string): Promise<ApiResponse<Alert[]>>;
  createAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<ApiResponse<Alert>>;
  updateAlert(id: string, data: Partial<Alert>): Promise<ApiResponse<Alert>>;
  resolveAlert(id: string, resolution: { action: string; resolvedBy: string; resolvedById: string }): Promise<ApiResponse<Alert>>;
  
  // ログ関連
  getWorkLogs(batchId: string, stepId?: string): Promise<ApiResponse<WorkLog[]>>;
  createWorkLog(log: Omit<WorkLog, 'id' | 'createdAt'>): Promise<ApiResponse<WorkLog>>;
}

/**
 * 本番用APIクライアント実装
 */
class ProductionApiClient implements ApiClient {
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_CONFIG.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // 認証ヘッダーなど必要に応じて追加
          // 'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(API_CONFIG.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async getBatches(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Batch>>> {
    const queryParams = params ? new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder }),
    }).toString() : '';
    
    return this.request<PaginatedResponse<Batch>>('GET', `/batches?${queryParams}`);
  }

  async getBatch(id: string): Promise<ApiResponse<Batch>> {
    return this.request<Batch>('GET', `/batches/${id}`);
  }

  async updateBatch(id: string, data: Partial<Batch>): Promise<ApiResponse<Batch>> {
    return this.request<Batch>('PATCH', `/batches/${id}`, data);
  }

  async getProcessSteps(productId: string): Promise<ApiResponse<ProcessStep[]>> {
    return this.request<ProcessStep[]>('GET', `/products/${productId}/process-steps`);
  }

  async getBatchProgress(batchId: string): Promise<ApiResponse<BatchProgressSummary>> {
    return this.request<BatchProgressSummary>('GET', `/batches/${batchId}/progress`);
  }

  async updateProgress(batchId: string, stepId: string, data: Partial<BatchProgress>): Promise<ApiResponse<BatchProgress>> {
    return this.request<BatchProgress>('PATCH', `/batches/${batchId}/progress/${stepId}`, data);
  }

  async getAlerts(batchId: string): Promise<ApiResponse<Alert[]>> {
    return this.request<Alert[]>('GET', `/batches/${batchId}/alerts`);
  }

  async createAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<ApiResponse<Alert>> {
    return this.request<Alert>('POST', `/alerts`, alert);
  }

  async updateAlert(id: string, data: Partial<Alert>): Promise<ApiResponse<Alert>> {
    return this.request<Alert>('PATCH', `/alerts/${id}`, data);
  }

  async resolveAlert(id: string, resolution: { action: string; resolvedBy: string; resolvedById: string }): Promise<ApiResponse<Alert>> {
    return this.request<Alert>('POST', `/alerts/${id}/resolve`, resolution);
  }

  async getWorkLogs(batchId: string, stepId?: string): Promise<ApiResponse<WorkLog[]>> {
    const endpoint = stepId 
      ? `/batches/${batchId}/steps/${stepId}/logs`
      : `/batches/${batchId}/logs`;
    return this.request<WorkLog[]>('GET', endpoint);
  }

  async createWorkLog(log: Omit<WorkLog, 'id' | 'createdAt'>): Promise<ApiResponse<WorkLog>> {
    return this.request<WorkLog>('POST', `/work-logs`, log);
  }
}

// APIクライアントのエクスポート
export const apiClient: ApiClient = API_CONFIG.useMock 
  ? mockApi.createMockApiClient()
  : new ProductionApiClient();

// リアルタイムイベント用のWebSocket接続（本番環境用）
export function createWebSocketConnection(batchId: string) {
  if (API_CONFIG.useMock) {
    // モックの場合はダミーのイベントエミッターを返す
    return {
      on: (event: string, callback: Function) => {},
      off: (event: string, callback: Function) => {},
      close: () => {},
    };
  }

  // 本番環境ではWebSocket接続を作成
  const ws = new WebSocket(`${API_CONFIG.baseUrl.replace('http', 'ws')}/ws/batches/${batchId}`);
  
  return {
    on: (event: string, callback: Function) => {
      ws.addEventListener('message', (e) => {
        const data = JSON.parse(e.data);
        if (data.event === event) {
          callback(data.payload);
        }
      });
    },
    off: (event: string, callback: Function) => {
      // WebSocket event listener removal logic
    },
    close: () => ws.close(),
  };
}