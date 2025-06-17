// 予約管理システムの設定ファイル
export const CONFIG = {
  // 開発・デモモードフラグ
  // true: モックデータとデモ機能を使用
  // false: 実際のAPIとデータベースを使用
  isMockMode: true,

  // システム情報
  system: {
    // クリニック名（本実装時は環境変数またはDBから取得）
    clinicName: 'さくら総合クリニック',
    // ロケール設定
    locale: 'ja-JP',
    // タイムゾーン
    timezone: 'Asia/Tokyo',
    // 通貨設定
    currency: 'JPY',
  },

  // デモユーザー設定（モックモード時のみ使用）
  demoUsers: {
    // 管理者側のデモユーザー
    admin: {
      id: 'admin1',
      name: '受付スタッフ',
      role: 'receptionist',
    },
    // 患者側のデモユーザー
    patient: {
      id: 'pat1',
      name: '田中太郎',
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
    closeTime: '20:00',
    slotDuration: 15, // 分単位
    // 休診日（0:日曜, 6:土曜）
    closedDays: [0], // 日曜休診
    // 土曜日の特別営業時間
    saturdayHours: {
      openTime: '08:00',
      closeTime: '13:00',
    },
  },

  // 予約設定
  booking: {
    maxAdvanceBookingDays: 90, // 最大90日先まで予約可能
    minAdvanceBookingHours: 1, // 最低1時間前までに予約
    defaultConsultationMinutes: 30, // デフォルト診察時間
    // 予約タイプごとの標準診察時間
    consultationDuration: {
      'first-visit': 45,    // 初診
      'follow-up': 30,      // 再診
      'emergency': 20,      // 緊急
      'checkup': 60,        // 健診
    },
  },

  // UI設定
  ui: {
    itemsPerPage: 20,
    maxWaitingListSize: 10,
    refreshInterval: 60000, // 1分ごとに更新
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
  },
};

// 環境変数からの設定オーバーライド
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mock') === 'false') {
    CONFIG.isMockMode = false;
  }
}