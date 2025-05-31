// モックAPI実装
// 開発時やデモ用のモックデータを返す

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
import { 
  batches as mockBatches, 
  processSteps as mockProcessSteps, 
  batchProgress as mockBatchProgress, 
  anomalies as mockAlerts, 
  workLogs as mockWorkLogs 
} from '../mockData';

// 遅延をシミュレート
const simulateDelay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));

// 成功レスポンスを作成
function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };
}

// エラーレスポンスを作成
function errorResponse(code: string, message: string): ApiResponse<any> {
  return {
    success: false,
    error: { code, message },
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };
}

export function createMockApiClient() {
  // メモリ内のデータストア（実際のDBの代わり）
  let batches = [...mockBatches];
  let alerts = [...mockAlerts];
  let workLogs = [...mockWorkLogs];
  let batchProgress = [...mockBatchProgress];

  return {
    async getBatches(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Batch>>> {
      await simulateDelay();
      
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      
      const paginatedData = batches.slice(start, end);
      
      return successResponse({
        data: paginatedData,
        pagination: {
          page,
          limit,
          total: batches.length,
          totalPages: Math.ceil(batches.length / limit),
        },
      });
    },

    async getBatch(id: string): Promise<ApiResponse<Batch>> {
      await simulateDelay();
      
      const batch = batches.find(b => b.id === id);
      if (!batch) {
        return errorResponse('NOT_FOUND', `Batch ${id} not found`);
      }
      
      return successResponse(batch);
    },

    async updateBatch(id: string, data: Partial<Batch>): Promise<ApiResponse<Batch>> {
      await simulateDelay();
      
      const index = batches.findIndex(b => b.id === id);
      if (index === -1) {
        return errorResponse('NOT_FOUND', `Batch ${id} not found`);
      }
      
      batches[index] = { ...batches[index], ...data, updatedAt: new Date().toISOString() };
      return successResponse(batches[index]);
    },

    async getProcessSteps(productId: string): Promise<ApiResponse<ProcessStep[]>> {
      await simulateDelay();
      
      // モックでは全製品で同じ工程を返す
      return successResponse(mockProcessSteps);
    },

    async getBatchProgress(batchId: string): Promise<ApiResponse<BatchProgressSummary>> {
      await simulateDelay();
      
      const progress = batchProgress.find(p => p.batchId === batchId);
      if (!progress) {
        return errorResponse('NOT_FOUND', `Progress for batch ${batchId} not found`);
      }
      
      const completedSteps = progress.progress.filter(p => p.status === 'completed').length;
      const totalSteps = mockProcessSteps.length;
      
      return successResponse({
        batchId,
        progress: progress.progress,
        completedSteps,
        totalSteps,
        progressPercentage: Math.round((completedSteps / totalSteps) * 100),
        currentStep: progress.progress.find(p => p.status === 'in_progress')?.stepId,
      });
    },

    async updateProgress(batchId: string, stepId: string, data: Partial<BatchProgress>): Promise<ApiResponse<BatchProgress>> {
      await simulateDelay();
      
      const batchIndex = batchProgress.findIndex(p => p.batchId === batchId);
      if (batchIndex === -1) {
        return errorResponse('NOT_FOUND', `Progress for batch ${batchId} not found`);
      }
      
      const stepIndex = batchProgress[batchIndex].progress.findIndex(p => p.stepId === stepId);
      if (stepIndex === -1) {
        return errorResponse('NOT_FOUND', `Step ${stepId} not found`);
      }
      
      batchProgress[batchIndex].progress[stepIndex] = {
        ...batchProgress[batchIndex].progress[stepIndex],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      return successResponse(batchProgress[batchIndex].progress[stepIndex]);
    },

    async getAlerts(batchId: string): Promise<ApiResponse<Alert[]>> {
      await simulateDelay();
      
      const batchAlerts = alerts.filter(a => a.batchId === batchId);
      return successResponse(batchAlerts);
    },

    async createAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<ApiResponse<Alert>> {
      await simulateDelay();
      
      const newAlert: Alert = {
        ...alert,
        id: `ALERT-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      alerts.push(newAlert);
      return successResponse(newAlert);
    },

    async updateAlert(id: string, data: Partial<Alert>): Promise<ApiResponse<Alert>> {
      await simulateDelay();
      
      const index = alerts.findIndex(a => a.id === id);
      if (index === -1) {
        return errorResponse('NOT_FOUND', `Alert ${id} not found`);
      }
      
      alerts[index] = {
        ...alerts[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      return successResponse(alerts[index]);
    },

    async resolveAlert(
      id: string, 
      resolution: { action: string; resolvedBy: string; resolvedById: string }
    ): Promise<ApiResponse<Alert>> {
      await simulateDelay();
      
      const index = alerts.findIndex(a => a.id === id);
      if (index === -1) {
        return errorResponse('NOT_FOUND', `Alert ${id} not found`);
      }
      
      alerts[index] = {
        ...alerts[index],
        resolved: true,
        action: resolution.action,
        resolvedBy: resolution.resolvedBy,
        resolvedById: resolution.resolvedById,
        resolvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return successResponse(alerts[index]);
    },

    async getWorkLogs(batchId: string, stepId?: string): Promise<ApiResponse<WorkLog[]>> {
      await simulateDelay();
      
      let logs = workLogs.filter(l => l.batchId === batchId);
      if (stepId) {
        logs = logs.filter(l => l.stepId === stepId);
      }
      
      return successResponse(logs);
    },

    async createWorkLog(log: Omit<WorkLog, 'id' | 'createdAt'>): Promise<ApiResponse<WorkLog>> {
      await simulateDelay();
      
      const newLog: WorkLog = {
        ...log,
        id: `LOG-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      workLogs.push(newLog);
      return successResponse(newLog);
    },
  };
}