// AI Chat Configuration
export const config = {
  // 動作モード: 'mock' | 'production'
  mode: 'mock',
  
  // API設定
  api: {
    endpoint: import.meta.env.VITE_CHAT_API_ENDPOINT || '/api/chat',
    timeout: 30000,
    retryCount: 3,
    retryDelay: 1000
  },
  
  // AIモデル設定
  model: {
    default: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    streamResponse: true
  },
  
  // UI設定
  ui: {
    messagesPerPage: 50,
    maxMessageLength: 5000,
    enableFileUpload: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['image/*', '.txt', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.json', '.xml'],
    enableSuggestions: true,
    suggestionsCount: 3
  },
  
  // チャット設定
  chat: {
    autoSaveInterval: 5000, // 5秒ごとに自動保存
    maxConversations: 100,
    enableAutoTitle: true,
    enableHistory: true,
    enableExport: true,
    exportFormats: ['json', 'markdown', 'txt']
  },
  
  // モックデータ設定（開発時のみ使用）
  mock: {
    responseDelay: {
      min: 1000,
      max: 2000
    },
    streamingSpeed: {
      charDelay: 30, // 文字ごとの遅延(ms)
      punctuationDelay: 150 // 句読点での追加遅延(ms)
    },
    enableMockSuggestions: true,
    enableMockTemplates: true
  }
};

// 環境に応じた設定の取得
export function getConfig(key) {
  const keys = key.split('.');
  let value = config;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) return null;
  }
  
  return value;
}

// モックモードかどうかの判定
export function isMockMode() {
  return config.mode === 'mock';
}

// API URLの生成
export function getApiUrl(path) {
  return `${config.api.endpoint}${path}`;
}