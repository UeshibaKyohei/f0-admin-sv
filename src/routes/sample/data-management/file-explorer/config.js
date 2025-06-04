/**
 * ファイル管理システムの設定
 */

// 環境変数から設定を読み込み
export const config = {
  // モックモードフラグ（本番環境ではfalseに設定）
  isMockMode: import.meta.env.VITE_FILE_EXPLORER_MOCK_MODE !== 'false',
  
  // APIエンドポイント
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  
  // ストレージ設定
  storage: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxTotalSize: 10 * 1024 * 1024 * 1024, // 10GB
    allowedFileTypes: '*', // '*' で全て許可、配列で指定も可能
  },
  
  // UI設定
  ui: {
    defaultViewMode: 'grid', // 'grid' or 'list'
    defaultSortBy: 'name', // 'name', 'date', 'size'
    itemsPerPage: 50,
    enableDragAndDrop: true,
    enableMultiSelect: true,
    enablePreview: true,
  },
  
  // 機能フラグ
  features: {
    enableUpload: true,
    enableDownload: true,
    enableDelete: true,
    enableRename: true,
    enableCreateFolder: true,
    enableMove: true,
    enableShare: true,
    enableStarred: true,
    enableSearch: true,
  }
};

// 開発環境用のログ
if (import.meta.env.DEV) {
  console.log('File Explorer Config:', config);
}