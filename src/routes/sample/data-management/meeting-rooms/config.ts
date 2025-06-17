// 会議室予約システムの設定ファイル
export const CONFIG = {
  // 開発・デモモードフラグ
  // true: モックデータとデモ機能を使用
  // false: 実際のAPIとデータベースを使用
  isMockMode: true,

  // システム情報
  system: {
    // 会社名（本実装時は環境変数またはDBから取得）
    companyName: import.meta.env.VITE_COMPANY_NAME || 'テックイノベーション株式会社',
    // ロケール設定
    locale: 'ja-JP',
    // タイムゾーン
    timezone: 'Asia/Tokyo',
    // 通貨設定（料金表示用）
    currency: 'JPY',
  },

  // デモユーザー設定（モックモード時のみ使用）
  demoUsers: {
    // 管理者
    admin: {
      id: 'admin1',
      name: '総務部 田中',
      email: 'admin@company.com',
      role: 'admin',
      department: '総務部',
    },
    // 一般ユーザー
    user: {
      id: 'user1',
      name: '開発部 佐藤',
      email: 'sato@company.com',
      role: 'user',
      department: '開発部',
    },
  },

  // API設定
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 30000, // 30秒
  },

  // 営業時間設定
  businessHours: {
    openTime: '08:00',
    closeTime: '22:00',
    slotDuration: 30, // 分単位（30分刻み）
    // 休業日（0:日曜, 6:土曜）
    closedDays: [0, 6], // 土日休業
    // 特別営業時間（例：平日は9-18, 土曜は9-13）
    specialHours: {
      6: { openTime: '09:00', closeTime: '13:00' }, // 土曜日
    },
  },

  // 予約設定
  booking: {
    maxAdvanceBookingDays: 30, // 最大30日先まで予約可能
    minAdvanceBookingHours: 0.5, // 最低30分前までに予約
    maxBookingDurationHours: 8, // 最大8時間まで予約可能
    // 予約タイプごとの標準時間
    defaultDuration: {
      'meeting': 60,        // 会議: 1時間
      'presentation': 120,  // プレゼンテーション: 2時間
      'training': 240,      // 研修: 4時間
      'interview': 60,      // 面接: 1時間
      'other': 60,          // その他: 1時間
    },
    // 連続予約制限
    maxContinuousHours: 4, // 連続4時間まで
    // キャンセル制限
    cancellationDeadlineHours: 1, // 1時間前までキャンセル可能
  },

  // 会議室設定
  rooms: {
    // 収容人数による分類
    capacityCategories: {
      small: { min: 1, max: 6, label: '小会議室' },
      medium: { min: 7, max: 12, label: '中会議室' },
      large: { min: 13, max: 20, label: '大会議室' },
      xlarge: { min: 21, max: 50, label: '大型会議室' },
    },
    // 設備アイコンマッピング
    equipmentIcons: {
      'projector': '📽️',
      'whiteboard': '📋',
      'tv': '📺',
      'videoconf': '📹',
      'sound': '🎤',
      'wifi': '📶',
      'phone': '☎️',
      'coffee': '☕',
    },
  },

  // UI設定
  ui: {
    itemsPerPage: 20,
    refreshInterval: 30000, // 30秒ごとに更新
    // 日付フォーマット
    dateFormat: {
      short: { year: 'numeric', month: '2-digit', day: '2-digit' },
      long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' },
      time: { hour: '2-digit', minute: '2-digit' },
      datetime: { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        weekday: 'short'
      },
    },
    // カラースキーム
    colors: {
      // 予約ステータス別色
      booking: {
        confirmed: '#10b981',    // green-500
        pending: '#f59e0b',      // amber-500
        cancelled: '#ef4444',    // red-500
        completed: '#6b7280',    // gray-500
      },
      // 会議室タイプ別色
      roomType: {
        meeting: '#3b82f6',      // blue-500
        presentation: '#8b5cf6',  // violet-500
        training: '#06b6d4',     // cyan-500
        interview: '#84cc16',    // lime-500
      },
    },
  },

  // 通知設定
  notifications: {
    // リマインダー設定
    reminders: {
      before15min: true,  // 15分前通知
      before1hour: true,  // 1時間前通知
      before1day: false,  // 1日前通知
    },
    // 通知方法
    methods: {
      email: true,
      push: false,
      slack: false, // 本実装時にSlack連携
    },
  },

  // 分析・レポート設定
  analytics: {
    // 利用率計算の基準
    utilizationBasis: 'business_hours', // business_hours | all_hours
    // レポート期間
    reportPeriods: {
      daily: true,
      weekly: true,
      monthly: true,
      quarterly: false,
    },
  },
};

// 環境変数からの設定オーバーライド
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mock') === 'false') {
    CONFIG.isMockMode = false;
  }
  // デモ用：会社名の動的変更
  const companyName = urlParams.get('company');
  if (companyName) {
    CONFIG.system.companyName = decodeURIComponent(companyName);
  }
}