// 工場トレーサビリティシステム 型定義
// 実際のRDBテーブル構造を反映した型定義

/**
 * バッチ（製造ロット）
 * テーブル: batches
 * 製造単位の基本情報を管理
 */
export interface Batch {
  id: string;                    // バッチID (PK)
  productId: string;             // 製品ID (FK: products.id)
  productName: string;           // 製品名（非正規化 for performance）
  quantity: number;              // 製造数量
  unit: string;                  // 単位（個、kg、L等）
  customer: string;              // 顧客名
  orderNumber: string;           // 注文番号
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'; // ステータス
  priority: 'high' | 'normal' | 'low'; // 優先度
  plannedStartDate: string;      // 予定開始日時
  plannedEndDate: string;        // 予定終了日時
  actualStartDate?: string;      // 実績開始日時
  actualEndDate?: string;        // 実績終了日時
  createdAt: string;             // 作成日時
  updatedAt: string;             // 更新日時
}

/**
 * 工程マスタ
 * テーブル: process_steps
 * 製品ごとの標準工程を定義
 */
export interface ProcessStep {
  id: string;                    // 工程ID (PK)
  productId: string;             // 製品ID (FK: products.id)
  sequence: number;              // 工程順序
  name: string;                  // 工程名
  department: string;            // 担当部門
  equipmentId?: string;          // 使用設備ID (FK: equipment.id)
  duration: number;              // 標準作業時間（分）
  description?: string;          // 工程説明
  qualityCheckPoints?: string[]; // 品質チェックポイント
  createdAt: string;             // 作成日時
  updatedAt: string;             // 更新日時
}

/**
 * バッチ工程進捗
 * テーブル: batch_progress
 * バッチごとの各工程の進捗状況
 */
export interface BatchProgress {
  id: string;                    // 進捗ID (PK)
  batchId: string;               // バッチID (FK: batches.id)
  stepId: string;                // 工程ID (FK: process_steps.id)
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'; // ステータス
  progress: number;              // 進捗率（0-100）
  operator?: string;             // 作業者名
  operatorId?: string;           // 作業者ID (FK: users.id)
  equipmentId?: string;          // 使用設備ID (FK: equipment.id)
  startTime?: string;            // 開始時刻
  endTime?: string;              // 終了時刻
  notes?: string;                // 備考
  createdAt: string;             // 作成日時
  updatedAt: string;             // 更新日時
}

/**
 * 異常・アラート
 * テーブル: alerts
 * 製造過程で発生した異常やアラートを記録
 */
export interface Alert {
  id: string;                    // アラートID (PK)
  batchId: string;               // バッチID (FK: batches.id)
  stepId?: string;               // 工程ID (FK: process_steps.id)
  type: 'temperature' | 'dimension' | 'pressure' | 'vibration' | 'manual' | 'quality' | 'equipment' | 'material' | 'process' | 'other';
  severity: 'critical' | 'warning' | 'info'; // 重要度
  description: string;           // 説明
  value?: number;                // 測定値
  unit?: string;                 // 単位
  threshold?: number;            // 閾値
  resolved: boolean;             // 解決済みフラグ
  action?: string;               // 対応内容
  resolvedBy?: string;           // 解決者名
  resolvedById?: string;         // 解決者ID (FK: users.id)
  resolvedAt?: string;           // 解決日時
  isManual: boolean;             // 手動登録フラグ
  registeredBy?: string;         // 登録者名
  registeredById?: string;       // 登録者ID (FK: users.id)
  timestamp: string;             // 発生日時
  updatedAt?: string;            // 更新日時
  updatedBy?: string;            // 更新者名
  updatedById?: string;          // 更新者ID (FK: users.id)
  createdAt: string;             // 作成日時
}

/**
 * 作業ログ
 * テーブル: work_logs
 * 各種作業の履歴を記録
 */
export interface WorkLog {
  id: string;                    // ログID (PK)
  batchId: string;               // バッチID (FK: batches.id)
  stepId?: string;               // 工程ID (FK: process_steps.id)
  timestamp: string;             // 記録日時
  type: 'start' | 'end' | 'pause' | 'resume' | 'quality_check' | 'issue' | 'comment' | 'update';
  operator: string;              // 作業者名
  operatorId: string;            // 作業者ID (FK: users.id)
  content: string;               // 内容
  metadata?: Record<string, any>; // メタデータ（JSON）
  createdAt: string;             // 作成日時
}

/**
 * バッチ進捗サマリ（ビューまたは集計データ）
 * ビュー: v_batch_progress_summary
 */
export interface BatchProgressSummary {
  batchId: string;
  progress: BatchProgress[];
  completedSteps: number;
  totalSteps: number;
  progressPercentage: number;
  currentStep?: string;
  estimatedCompletionTime?: string;
}

/**
 * API レスポンス型
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    timestamp: string;
    version: string;
  };
}

/**
 * ページネーション
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}