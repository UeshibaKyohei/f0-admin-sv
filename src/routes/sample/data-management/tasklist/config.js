// タスク管理システムの設定
// 本実装時はすべてのFEATURE_*フラグをfalseに設定することで、
// 実際のAPI通信とRDBから取得したデータに切り替わります

export const config = {
  // モック機能制御フラグ
  FEATURE_MOCK_DATA: true,           // モックデータを使用するか
  FEATURE_GAMIFICATION: true,        // ゲーミフィケーション機能を表示するか
  FEATURE_AI_SUGGESTIONS: true,      // AI提案機能を表示するか（未実装）
  FEATURE_DEMO_MODE: true,           // デモ用機能を表示するか
  
  // デバッグ機能制御フラグ
  DEBUG_DRAG_DROP: false,           // ドラッグ&ドロップのデバッグ情報を表示
  DEBUG_API_CALLS: false,           // API呼び出しをコンソールに表示
  
  // 実装関連フラグ
  USE_LOCAL_STORAGE: true,          // LocalStorageを使用するか（false時はAPI）
  API_BASE_URL: 'http://localhost:8000', // 本実装時のAPIベースURL
  API_TIMEOUT: 10000,               // APIタイムアウト（ms）
  
  // UI設定
  SHOW_DEV_TOOLS: true,             // 開発者ツールを表示するか
  DEFAULT_ITEMS_PER_PAGE: 10,       // デフォルトのページサイズ
  
  // カンバンボード設定
  MAX_TASKS_PER_COLUMN: 50,         // 1カラムの最大タスク数
  
  // ゲーミフィケーション設定（本実装時はDBから取得）
  POINTS_PER_TASK_COMPLETION: 10,   // タスク完了時のベースポイント
  BONUS_MULTIPLIER_URGENT: 1.5,     // 緊急度によるボーナス
  ACHIEVEMENT_CHECK_INTERVAL: 5000, // アチーブメント確認間隔（ms）
  
  // 業界・組織設定（本実装時はDBから取得）
  INDUSTRY_TYPE: 'marketing_agency', // marketing_agency, software_dev, consulting, etc
  ORGANIZATION_NAME: 'サンプル組織',
  
  // 部門設定（業界タイプに応じて切り替え）
  DEPARTMENTS: {
    marketing_agency: {
      account: { name: 'アカウント管理', color: 'primary' },
      creative: { name: 'クリエイティブ', color: 'secondary' },
      digital: { name: 'デジタルマーケティング', color: 'accent' },
      strategy: { name: 'ストラテジー', color: 'info' },
      production: { name: 'プロダクション', color: 'warning' }
    },
    software_dev: {
      frontend: { name: 'フロントエンド', color: 'primary' },
      backend: { name: 'バックエンド', color: 'secondary' },
      devops: { name: 'DevOps', color: 'accent' },
      qa: { name: 'QA', color: 'info' },
      pm: { name: 'プロダクトマネジメント', color: 'warning' }
    },
    consulting: {
      strategy: { name: '戦略コンサルティング', color: 'primary' },
      operations: { name: 'オペレーション', color: 'secondary' },
      finance: { name: '財務', color: 'accent' },
      hr: { name: '人事', color: 'info' },
      it: { name: 'IT', color: 'warning' }
    }
  }
};

// 設定の更新関数（実際の運用では外部から設定を読み込む）
export function updateConfig(newConfig) {
  Object.assign(config, newConfig);
}

// 本実装モードへの切り替え（すべてのモック機能を無効化）
export function enableProductionMode() {
  updateConfig({
    FEATURE_MOCK_DATA: false,
    FEATURE_GAMIFICATION: false,    // 実装状況に応じて調整
    FEATURE_AI_SUGGESTIONS: false, // 実装状況に応じて調整
    FEATURE_DEMO_MODE: false,
    USE_LOCAL_STORAGE: false,
    SHOW_DEV_TOOLS: false,
    DEBUG_DRAG_DROP: false,
    DEBUG_API_CALLS: false,
  });
}

// ヘルパー関数
export function getCurrentDepartments() {
  return config.DEPARTMENTS[config.INDUSTRY_TYPE] || config.DEPARTMENTS.marketing_agency;
}

export function getDepartmentDisplayName() {
  const industryLabels = {
    marketing_agency: 'マーケティングエージェンシー版',
    software_dev: 'ソフトウェア開発版',
    consulting: 'コンサルティング版'
  };
  return industryLabels[config.INDUSTRY_TYPE] || 'カスタム版';
}