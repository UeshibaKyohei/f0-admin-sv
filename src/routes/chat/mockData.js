// ユーザーデータ生成
export const mockUsers = [
  {
    id: 'user-1',
    name: '佐藤花子',
    avatar: 'https://img.daisyui.com/images/profile/demo/2@40.webp',
    status: 'online',
    statusMessage: '会議中',
    department: '営業部',
    role: 'マネージャー'
  },
  {
    id: 'user-2',
    name: '鈴木一郎',
    avatar: 'https://img.daisyui.com/images/profile/demo/3@40.webp',
    status: 'online',
    statusMessage: '対応可能',
    department: 'サポート部',
    role: 'スペシャリスト'
  },
  {
    id: 'user-3',
    name: '田中美咲',
    avatar: 'https://img.daisyui.com/images/profile/demo/4@40.webp',
    status: 'away',
    statusMessage: '休憩中',
    department: '開発部',
    role: 'エンジニア'
  },
  {
    id: 'user-4',
    name: '高橋健太',
    avatar: 'https://img.daisyui.com/images/profile/demo/5@40.webp',
    status: 'offline',
    statusMessage: '退社しました',
    department: 'マーケティング部',
    role: 'アナリスト'
  },
  {
    id: 'user-5',
    name: '伊藤愛',
    avatar: 'https://img.daisyui.com/images/profile/demo/6@40.webp',
    status: 'online',
    statusMessage: 'リモートワーク中',
    department: '人事部',
    role: '採用担当'
  }
];

// チャットデータ生成
export const mockChats = [
  {
    id: 'chat-1',
    type: 'direct',
    name: '佐藤花子',
    avatar: 'https://img.daisyui.com/images/profile/demo/2@40.webp',
    participants: ['current-user', 'user-1'],
    lastMessage: 'プロジェクトの進捗はどうですか？',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    isPinned: true,
    status: 'online'
  },
  {
    id: 'chat-2',
    type: 'group',
    name: '営業チーム',
    avatar: null,
    participants: ['current-user', 'user-1', 'user-2', 'user-4'],
    lastMessage: '鈴木: 明日の会議の資料を共有しました',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isPinned: false
  },
  {
    id: 'chat-3',
    type: 'direct',
    name: '田中美咲',
    avatar: 'https://img.daisyui.com/images/profile/demo/4@40.webp',
    participants: ['current-user', 'user-3'],
    lastMessage: 'バグ修正完了しました！',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isPinned: false,
    status: 'away'
  },
  {
    id: 'chat-4',
    type: 'group',
    name: 'プロジェクトA',
    avatar: null,
    participants: ['current-user', 'user-1', 'user-3', 'user-5'],
    lastMessage: '伊藤: スケジュールを更新しました',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isPinned: true
  }
];

// メッセージデータ生成
export function generateMockMessages() {
  const messages = {
    'chat-1': [
      {
        id: 'msg-1',
        chatId: 'chat-1',
        senderId: 'user-1',
        content: 'おはようございます！',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        readBy: ['current-user', 'user-1'],
        reactions: []
      },
      {
        id: 'msg-2',
        chatId: 'chat-1',
        senderId: 'current-user',
        content: 'おはようございます。今日もよろしくお願いします。',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
        readBy: ['current-user', 'user-1'],
        reactions: [{ emoji: '👍', userId: 'user-1' }]
      },
      {
        id: 'msg-3',
        chatId: 'chat-1',
        senderId: 'user-1',
        content: 'プロジェクトの進捗はどうですか？',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        readBy: ['current-user', 'user-1'],
        reactions: []
      }
    ],
    'chat-2': [
      {
        id: 'msg-4',
        chatId: 'chat-2',
        senderId: 'user-2',
        content: '会議の議事録を共有します',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        readBy: ['current-user', 'user-1', 'user-2'],
        reactions: [],
        attachments: [{
          id: 'file-1',
          name: '議事録_20250527.pdf',
          size: 524288,
          type: 'application/pdf'
        }]
      },
      {
        id: 'msg-5',
        chatId: 'chat-2',
        senderId: 'user-1',
        content: 'ありがとうございます！確認します',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        readBy: ['current-user', 'user-1', 'user-2'],
        reactions: []
      },
      {
        id: 'msg-6',
        chatId: 'chat-2',
        senderId: 'user-2',
        content: '明日の会議の資料を共有しました',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        readBy: ['user-2'],
        reactions: []
      }
    ],
    'chat-3': [
      {
        id: 'msg-7',
        chatId: 'chat-3',
        senderId: 'user-3',
        content: 'バグを見つけました。修正に取り組みます。',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        readBy: ['current-user', 'user-3'],
        reactions: []
      },
      {
        id: 'msg-8',
        chatId: 'chat-3',
        senderId: 'current-user',
        content: 'よろしくお願いします。何か手伝えることがあれば言ってください。',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(),
        readBy: ['current-user', 'user-3'],
        reactions: [{ emoji: '🙏', userId: 'user-3' }]
      },
      {
        id: 'msg-9',
        chatId: 'chat-3',
        senderId: 'user-3',
        content: 'バグ修正完了しました！',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        readBy: ['current-user', 'user-3'],
        reactions: [{ emoji: '🎉', userId: 'current-user' }]
      }
    ]
  };
  
  return messages;
}

// 絵文字リスト
export const emojiList = [
  '👍', '❤️', '😂', '😊', '😮', '😢', '🎉', '🔥',
  '👏', '💯', '✅', '👀', '🤔', '🙏', '💪', '⭐'
];

// ファイルタイプアイコンマッピング
export const fileTypeIcons = {
  'application/pdf': '📄',
  'image/jpeg': '🖼️',
  'image/png': '🖼️',
  'image/gif': '🖼️',
  'video/mp4': '🎥',
  'audio/mpeg': '🎵',
  'application/zip': '📦',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'default': '📎'
};

// ステータスカラーマッピング
export const statusColors = {
  online: 'bg-success',
  away: 'bg-warning',
  offline: 'bg-base-300',
  busy: 'bg-error'
};

// タイピングアニメーション用テキスト
export const typingTexts = [
  '入力中',
  '入力中.',
  '入力中..',
  '入力中...'
];