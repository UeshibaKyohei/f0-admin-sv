// デモデータ
import type { Task, Campaign, Client, User, Badge } from './types';

// クライアントデータ
export const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'スポーツブランドA社',
    industry: 'アパレル・スポーツ',
    contactPerson: '山田太郎',
    email: 'yamada@sportsbrand-a.com',
    phone: '03-1234-5678'
  },
  {
    id: 'client-2',
    name: 'コスメティックB社',
    industry: '化粧品・美容',
    contactPerson: '佐藤花子',
    email: 'sato@cosmetic-b.com',
    phone: '03-2345-6789'
  },
  {
    id: 'client-3',
    name: 'フードデリバリーC社',
    industry: '飲食・デリバリー',
    contactPerson: '鈴木一郎',
    email: 'suzuki@delivery-c.com',
    phone: '03-3456-7890'
  }
];

// キャンペーンデータ
export const mockCampaigns: Campaign[] = [
  {
    id: 'campaign-1',
    name: '夏季スポーツキャンペーン2024',
    clientId: 'client-1',
    clientName: 'スポーツブランドA社',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    budget: 15000000,
    status: 'active',
    goals: ['認知度向上20%', '売上前年比130%', 'SNSフォロワー10万人増'],
    color: 'primary'
  },
  {
    id: 'campaign-2',
    name: '新商品ローンチPR',
    clientId: 'client-2',
    clientName: 'コスメティックB社',
    startDate: '2024-04-15',
    endDate: '2024-06-30',
    budget: 8000000,
    status: 'active',
    goals: ['新商品認知度50%', 'サンプリング10万個', 'インフルエンサー投稿100件'],
    color: 'secondary'
  },
  {
    id: 'campaign-3',
    name: '周年記念キャンペーン',
    clientId: 'client-3',
    clientName: 'フードデリバリーC社',
    startDate: '2024-05-01',
    endDate: '2024-05-31',
    budget: 5000000,
    status: 'active',
    goals: ['新規ユーザー獲得3万人', 'アプリDL数5万件', 'リピート率向上15%'],
    color: 'accent'
  }
];

// ユーザーデータ
export const mockUsers: User[] = [
  // アカウント管理チーム
  {
    id: 'user-1',
    name: '田中美咲',
    email: 'tanaka@agency.com',
    department: 'account',
    role: 'アカウントディレクター',
    avatar: 'TM',
    level: 15,
    totalPoints: 4250,
    badges: [
      { id: 'badge-1', name: 'スピードマスター', description: '期限前倒し10回達成', icon: '⚡', rarity: 'rare', earnedAt: '2024-03-15' },
      { id: 'badge-2', name: 'チームプレイヤー', description: '他部門支援20回', icon: '🤝', rarity: 'common', earnedAt: '2024-02-20' }
    ],
    currentStreak: 5,
    weeklyPoints: 320
  },
  {
    id: 'user-2',
    name: '伊藤健太',
    email: 'ito@agency.com',
    department: 'account',
    role: 'アカウントマネージャー',
    avatar: 'IK',
    level: 12,
    totalPoints: 3180,
    badges: [],
    currentStreak: 3,
    weeklyPoints: 180
  },
  // クリエイティブチーム
  {
    id: 'user-3',
    name: '渡辺さくら',
    email: 'watanabe@agency.com',
    department: 'creative',
    role: 'アートディレクター',
    avatar: 'WS',
    level: 18,
    totalPoints: 5420,
    badges: [
      { id: 'badge-3', name: 'クリエイティブジーニアス', description: 'クライアント高評価30回', icon: '🎨', rarity: 'epic', earnedAt: '2024-04-01' }
    ],
    currentStreak: 12,
    weeklyPoints: 450
  },
  {
    id: 'user-4',
    name: '山本翔太',
    email: 'yamamoto@agency.com',
    department: 'creative',
    role: 'デザイナー',
    avatar: 'YS',
    level: 8,
    totalPoints: 2100,
    badges: [],
    currentStreak: 2,
    weeklyPoints: 150
  },
  {
    id: 'user-5',
    name: '小林あやか',
    email: 'kobayashi@agency.com',
    department: 'creative',
    role: 'コピーライター',
    avatar: 'KA',
    level: 10,
    totalPoints: 2850,
    badges: [],
    currentStreak: 7,
    weeklyPoints: 280
  },
  // デジタルマーケティングチーム
  {
    id: 'user-6',
    name: '高橋勇気',
    email: 'takahashi@agency.com',
    department: 'digital',
    role: 'デジタルマーケティングマネージャー',
    avatar: 'TY',
    level: 14,
    totalPoints: 3920,
    badges: [
      { id: 'badge-4', name: 'データドリブン', description: 'KPI改善提案50回', icon: '📊', rarity: 'rare', earnedAt: '2024-03-28' }
    ],
    currentStreak: 9,
    weeklyPoints: 380
  },
  {
    id: 'user-7',
    name: '松本結衣',
    email: 'matsumoto@agency.com',
    department: 'digital',
    role: '広告運用スペシャリスト',
    avatar: 'MY',
    level: 11,
    totalPoints: 3050,
    badges: [],
    currentStreak: 4,
    weeklyPoints: 220
  },
  // ストラテジーチーム
  {
    id: 'user-8',
    name: '中村大輔',
    email: 'nakamura@agency.com',
    department: 'strategy',
    role: 'ストラテジックプランナー',
    avatar: 'ND',
    level: 16,
    totalPoints: 4580,
    badges: [
      { id: 'badge-5', name: 'インサイトハンター', description: '画期的な戦略提案10回', icon: '🎯', rarity: 'epic', earnedAt: '2024-04-10' }
    ],
    currentStreak: 15,
    weeklyPoints: 420
  },
  // プロダクションチーム
  {
    id: 'user-9',
    name: '斉藤麻衣',
    email: 'saito@agency.com',
    department: 'production',
    role: 'プロダクションマネージャー',
    avatar: 'SM',
    level: 13,
    totalPoints: 3650,
    badges: [
      { id: 'badge-6', name: 'タイムキーパー', description: 'スケジュール厳守率95%以上', icon: '⏰', rarity: 'rare', earnedAt: '2024-02-15' }
    ],
    currentStreak: 8,
    weeklyPoints: 340
  }
];

// タスクデータ
export const mockTasks: Task[] = [
  // スポーツブランドA社のタスク
  {
    id: 'task-1',
    title: '夏季キャンペーンメインビジュアル制作',
    description: '海とスポーツをテーマにしたメインビジュアルの制作。モデル撮影含む。',
    status: 'in_progress',
    priority: 'high',
    assignees: ['user-3', 'user-4'],
    dueDate: '2024-05-20',
    estimatedHours: 40,
    actualHours: 28,
    tags: ['デザイン', '撮影', 'メインビジュアル'],
    clientId: 'client-1',
    campaignId: 'campaign-1',
    dependencies: [],
    attachments: [],
    comments: [
      {
        id: 'comment-1',
        userId: 'user-1',
        content: 'モデルの候補リストを共有しました。確認をお願いします。',
        createdAt: '2024-05-10T10:30:00',
        mentions: ['user-3']
      }
    ],
    aiSuggestions: [
      {
        id: 'ai-1',
        type: 'clarification',
        content: '撮影場所は決定していますか？屋内スタジオか屋外ロケーションかで準備が変わります。',
        confidence: 0.9,
        applied: false
      }
    ],
    points: 15,
    createdAt: '2024-05-01T09:00:00',
    updatedAt: '2024-05-10T10:30:00'
  },
  {
    id: 'task-2',
    title: 'SNS広告クリエイティブ制作（Instagram/TikTok）',
    description: '若年層向けの動画広告制作。15秒と30秒の2パターン。',
    status: 'todo',
    priority: 'high',
    assignees: ['user-4', 'user-5'],
    dueDate: '2024-05-25',
    estimatedHours: 24,
    actualHours: 0,
    tags: ['動画', 'SNS', 'クリエイティブ'],
    clientId: 'client-1',
    campaignId: 'campaign-1',
    dependencies: ['task-1'],
    attachments: [],
    comments: [],
    points: 15,
    createdAt: '2024-05-05T11:00:00',
    updatedAt: '2024-05-05T11:00:00'
  },
  {
    id: 'task-3',
    title: 'インフルエンサーリスト作成',
    description: 'スポーツ・フィットネス系インフルエンサー50名のリストアップと交渉準備',
    status: 'done',
    priority: 'medium',
    assignees: ['user-6', 'user-7'],
    dueDate: '2024-05-10',
    estimatedHours: 16,
    actualHours: 14,
    tags: ['インフルエンサー', 'リサーチ'],
    clientId: 'client-1',
    campaignId: 'campaign-1',
    dependencies: [],
    attachments: [
      {
        id: 'attach-1',
        name: 'インフルエンサーリスト_v2.xlsx',
        url: '/files/influencer-list.xlsx',
        type: 'application/vnd.ms-excel',
        size: 245760,
        uploadedBy: 'user-6',
        uploadedAt: '2024-05-09T16:00:00'
      }
    ],
    comments: [],
    points: 10,
    createdAt: '2024-05-01T14:00:00',
    updatedAt: '2024-05-09T16:00:00'
  },
  // コスメティックB社のタスク
  {
    id: 'task-4',
    title: '新商品PR戦略プレゼン資料作成',
    description: 'クライアント向けのPR戦略提案資料。ターゲット分析とメディアプラン含む。',
    status: 'review',
    priority: 'urgent',
    assignees: ['user-8', 'user-1'],
    dueDate: '2024-05-13',
    estimatedHours: 20,
    actualHours: 22,
    tags: ['戦略', 'プレゼン', 'PR'],
    clientId: 'client-2',
    campaignId: 'campaign-2',
    dependencies: [],
    attachments: [],
    comments: [
      {
        id: 'comment-2',
        userId: 'user-8',
        content: '初稿が完成しました。レビューをお願いします。特にメディアプランのセクションについてフィードバックをいただければ幸いです。',
        createdAt: '2024-05-11T18:00:00',
        mentions: ['user-1']
      }
    ],
    points: 20,
    createdAt: '2024-05-06T10:00:00',
    updatedAt: '2024-05-11T18:00:00'
  },
  {
    id: 'task-5',
    title: 'サンプリングイベント企画書作成',
    description: '都内主要駅でのサンプリング実施計画。スタッフ手配と許可申請含む。',
    status: 'in_progress',
    priority: 'high',
    assignees: ['user-9', 'user-2'],
    dueDate: '2024-05-18',
    estimatedHours: 12,
    actualHours: 6,
    tags: ['イベント', '企画', 'サンプリング'],
    clientId: 'client-2',
    campaignId: 'campaign-2',
    dependencies: [],
    attachments: [],
    comments: [],
    aiSuggestions: [
      {
        id: 'ai-2',
        type: 'risk',
        content: '梅雨時期のため、雨天時の代替案を準備することをお勧めします。',
        confidence: 0.85,
        applied: false
      }
    ],
    points: 15,
    createdAt: '2024-05-08T13:00:00',
    updatedAt: '2024-05-12T09:00:00'
  },
  // フードデリバリーC社のタスク
  {
    id: 'task-6',
    title: '周年記念LPデザイン制作',
    description: '5周年記念の特設ランディングページ。レスポンシブ対応必須。',
    status: 'in_progress',
    priority: 'high',
    assignees: ['user-3', 'user-4'],
    dueDate: '2024-05-15',
    estimatedHours: 32,
    actualHours: 20,
    tags: ['Web', 'デザイン', 'LP'],
    clientId: 'client-3',
    campaignId: 'campaign-3',
    dependencies: [],
    attachments: [],
    comments: [],
    points: 15,
    createdAt: '2024-05-03T10:00:00',
    updatedAt: '2024-05-11T15:00:00'
  },
  {
    id: 'task-7',
    title: 'アプリ内プッシュ通知文言作成',
    description: 'キャンペーン期間中の段階的なプッシュ通知シナリオ作成（全10パターン）',
    status: 'todo',
    priority: 'medium',
    assignees: ['user-5'],
    dueDate: '2024-05-14',
    estimatedHours: 8,
    actualHours: 0,
    tags: ['コピー', 'アプリ', '通知'],
    clientId: 'client-3',
    campaignId: 'campaign-3',
    dependencies: [],
    attachments: [],
    comments: [],
    points: 10,
    createdAt: '2024-05-10T11:00:00',
    updatedAt: '2024-05-10T11:00:00'
  },
  {
    id: 'task-8',
    title: 'Google/Facebook広告運用開始',
    description: '周年記念キャンペーンの広告配信設定と初期運用',
    status: 'todo',
    priority: 'urgent',
    assignees: ['user-6', 'user-7'],
    dueDate: '2024-05-13',
    estimatedHours: 16,
    actualHours: 0,
    tags: ['広告運用', 'デジタル'],
    clientId: 'client-3',
    campaignId: 'campaign-3',
    dependencies: ['task-6'],
    attachments: [],
    comments: [],
    aiSuggestions: [
      {
        id: 'ai-3',
        type: 'estimation',
        content: '類似キャンペーンの実績から、初期設定に8時間、A/Bテスト設定に4時間、レポート設定に4時間が妥当です。',
        confidence: 0.88,
        applied: true
      }
    ],
    points: 20,
    createdAt: '2024-05-10T14:00:00',
    updatedAt: '2024-05-10T14:00:00'
  },
  // バックログタスク
  {
    id: 'task-9',
    title: '競合他社分析レポート作成',
    description: '主要競合5社の最新キャンペーン分析',
    status: 'backlog',
    priority: 'low',
    assignees: ['user-8'],
    dueDate: '2024-06-01',
    estimatedHours: 20,
    actualHours: 0,
    tags: ['分析', 'レポート'],
    clientId: 'client-1',
    campaignId: 'campaign-1',
    dependencies: [],
    attachments: [],
    comments: [],
    points: 5,
    createdAt: '2024-05-01T16:00:00',
    updatedAt: '2024-05-01T16:00:00'
  },
  {
    id: 'task-10',
    title: 'ブログコンテンツ執筆（美容トレンド）',
    description: '2024年夏の美容トレンドについての記事執筆（2000文字）',
    status: 'backlog',
    priority: 'low',
    assignees: [],
    dueDate: '2024-05-30',
    estimatedHours: 6,
    actualHours: 0,
    tags: ['コンテンツ', 'ブログ'],
    clientId: 'client-2',
    campaignId: 'campaign-2',
    dependencies: [],
    attachments: [],
    comments: [],
    points: 5,
    createdAt: '2024-05-05T13:00:00',
    updatedAt: '2024-05-05T13:00:00'
  }
];

// 初期データ生成関数
export function generateInitialData() {
  // 現在の日付を基準に動的にタスクの日付を調整
  const today = new Date();
  const adjustedTasks = mockTasks.map(task => {
    const dueDate = new Date(task.dueDate);
    const daysDiff = Math.floor((dueDate.getTime() - new Date('2024-05-12').getTime()) / (1000 * 60 * 60 * 24));
    const adjustedDueDate = new Date(today);
    adjustedDueDate.setDate(today.getDate() + daysDiff);
    
    return {
      ...task,
      dueDate: adjustedDueDate.toISOString().split('T')[0]
    };
  });

  return {
    tasks: adjustedTasks,
    campaigns: mockCampaigns,
    clients: mockClients,
    users: mockUsers
  };
}