// タスク管理システムの型定義
// RDBスキーマ想定のコメント付き

/*
 * RDB設計想定：
 * 
 * tasks テーブル (主テーブル)
 * - id: varchar(50) PRIMARY KEY
 * - title: varchar(255) NOT NULL
 * - description: text
 * - status: enum('backlog', 'todo', 'in_progress', 'review', 'done') NOT NULL
 * - priority: enum('urgent', 'high', 'medium', 'low') NOT NULL
 * - due_date: datetime NOT NULL
 * - estimated_hours: decimal(5,2) DEFAULT 0
 * - actual_hours: decimal(5,2) DEFAULT 0
 * - client_id: varchar(50) NOT NULL FOREIGN KEY references clients(id)
 * - campaign_id: varchar(50) NOT NULL FOREIGN KEY references campaigns(id)
 * - points: int DEFAULT 0
 * - created_at: datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
 * - updated_at: datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * - sort_order: int DEFAULT 0 -- カンバンボード用の並び順
 * 
 * task_assignees テーブル (多対多関係)
 * - task_id: varchar(50) FOREIGN KEY references tasks(id) ON DELETE CASCADE
 * - user_id: varchar(50) FOREIGN KEY references users(id) ON DELETE CASCADE
 * - assigned_at: datetime DEFAULT CURRENT_TIMESTAMP
 * - PRIMARY KEY(task_id, user_id)
 * 
 * task_tags テーブル (多対多関係)
 * - task_id: varchar(50) FOREIGN KEY references tasks(id) ON DELETE CASCADE
 * - tag_name: varchar(100) NOT NULL
 * - PRIMARY KEY(task_id, tag_name)
 * 
 * task_dependencies テーブル (多対多関係)
 * - task_id: varchar(50) FOREIGN KEY references tasks(id) ON DELETE CASCADE
 * - depends_on_task_id: varchar(50) FOREIGN KEY references tasks(id) ON DELETE CASCADE
 * - PRIMARY KEY(task_id, depends_on_task_id)
 * 
 * task_attachments テーブル
 * - id: varchar(50) PRIMARY KEY
 * - task_id: varchar(50) FOREIGN KEY references tasks(id) ON DELETE CASCADE
 * - file_name: varchar(255) NOT NULL
 * - file_url: varchar(500) NOT NULL
 * - file_size: bigint
 * - mime_type: varchar(100)
 * - uploaded_at: datetime DEFAULT CURRENT_TIMESTAMP
 * - uploaded_by: varchar(50) FOREIGN KEY references users(id)
 * 
 * task_comments テーブル
 * - id: varchar(50) PRIMARY KEY
 * - task_id: varchar(50) FOREIGN KEY references tasks(id) ON DELETE CASCADE
 * - user_id: varchar(50) FOREIGN KEY references users(id)
 * - content: text NOT NULL
 * - created_at: datetime DEFAULT CURRENT_TIMESTAMP
 */

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignees: string[]; // User IDs
  dueDate: string; // ISO 8601 format
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  clientId: string;
  campaignId: string;
  dependencies: string[]; // Task IDs
  attachments: Attachment[];
  comments: Comment[];
  aiSuggestions?: AISuggestion[];
  points: number;
  createdAt: string;
  updatedAt: string;
}

/*
 * campaigns テーブル
 * - id: varchar(50) PRIMARY KEY
 * - name: varchar(255) NOT NULL
 * - client_id: varchar(50) NOT NULL FOREIGN KEY references clients(id)
 * - start_date: date NOT NULL
 * - end_date: date NOT NULL
 * - budget: decimal(12,2) DEFAULT 0
 * - status: enum('planning', 'active', 'completed', 'archived') NOT NULL
 * - color: varchar(7) DEFAULT '#000000' -- HEXカラーコード
 * - created_at: datetime DEFAULT CURRENT_TIMESTAMP
 * - updated_at: datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * 
 * campaign_goals テーブル (1対多関係)
 * - id: varchar(50) PRIMARY KEY
 * - campaign_id: varchar(50) FOREIGN KEY references campaigns(id) ON DELETE CASCADE
 * - goal_text: varchar(500) NOT NULL
 * - order_index: int DEFAULT 0
 */

export interface Campaign {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'planning' | 'active' | 'completed' | 'archived';
  goals: string[];
  color: string; // For visual distinction
}

/*
 * clients テーブル
 * - id: varchar(50) PRIMARY KEY
 * - name: varchar(255) NOT NULL
 * - industry: varchar(100)
 * - contact_person: varchar(255) NOT NULL
 * - email: varchar(255) NOT NULL
 * - phone: varchar(50)
 * - address: text
 * - created_at: datetime DEFAULT CURRENT_TIMESTAMP
 * - updated_at: datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * - is_active: boolean DEFAULT TRUE
 */

export interface Client {
  id: string;
  name: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone: string;
}

/*
 * users テーブル
 * - id: varchar(50) PRIMARY KEY
 * - name: varchar(255) NOT NULL
 * - email: varchar(255) UNIQUE NOT NULL
 * - password_hash: varchar(255) -- 本実装時に追加
 * - department: varchar(100) NOT NULL
 * - role: varchar(100) NOT NULL
 * - avatar: varchar(10) DEFAULT '?' -- 表示用文字（イニシャルなど）
 * - avatar_url: varchar(500) -- 本実装時にプロフィール画像URL
 * - level: int DEFAULT 1
 * - total_points: int DEFAULT 0
 * - weekly_points: int DEFAULT 0
 * - current_streak: int DEFAULT 0
 * - max_streak: int DEFAULT 0
 * - is_active: boolean DEFAULT TRUE
 * - created_at: datetime DEFAULT CURRENT_TIMESTAMP
 * - updated_at: datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * 
 * user_badges テーブル (多対多関係)
 * - user_id: varchar(50) FOREIGN KEY references users(id) ON DELETE CASCADE
 * - badge_id: varchar(50) NOT NULL
 * - earned_at: datetime DEFAULT CURRENT_TIMESTAMP
 * - PRIMARY KEY(user_id, badge_id)
 * 
 * badges テーブル (マスターデータ)
 * - id: varchar(50) PRIMARY KEY
 * - name: varchar(255) NOT NULL
 * - description: varchar(500)
 * - icon: varchar(10) DEFAULT '🏆'
 * - rarity: enum('common', 'rare', 'epic', 'legendary') DEFAULT 'common'
 * - points_required: int DEFAULT 0
 * - is_active: boolean DEFAULT TRUE
 */

export interface User {
  id: string;
  name: string;
  email: string;
  department: 'account' | 'creative' | 'digital' | 'strategy' | 'production';
  role: string;
  avatar: string; // Initials or image URL
  level: number;
  totalPoints: number;
  badges: Badge[];
  currentStreak: number;
  weeklyPoints: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  mentions: string[]; // User IDs
}

export interface AISuggestion {
  id: string;
  type: 'clarification' | 'estimation' | 'dependency' | 'risk';
  content: string;
  confidence: number; // 0-1
  applied: boolean;
}

export interface FilterOptions {
  status: Task['status'][];
  priority: Task['priority'][];
  assignees: string[];
  tags: string[];
  campaigns: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

export interface ViewSettings {
  view: 'kanban' | 'list' | 'calendar' | 'gantt';
  groupBy: 'status' | 'assignee' | 'priority' | 'campaign';
  sortBy: 'dueDate' | 'priority' | 'created' | 'updated' | 'manual';
  sortOrder: 'asc' | 'desc';
  showCompleted: boolean;
}

// ゲーミフィケーション関連
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  condition: {
    type: 'tasks_completed' | 'streak' | 'collaboration' | 'speed' | 'quality';
    value: number;
  };
}

export interface Leaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  entries: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  userId: string;
  rank: number;
  points: number;
  change: number; // Position change from previous period
}

// 部門の定義（config.jsから動的に取得するためのヘルパー）
// 実際の部門設定は config.js の getCurrentDepartments() から取得
import { getCurrentDepartments } from './config.js';

export const DEPARTMENTS = getCurrentDepartments();

// 部門タイプの定義（TypeScript用）
export type DepartmentType = keyof typeof DEPARTMENTS;

// 優先度の定義
export const PRIORITY_CONFIG = {
  urgent: { label: '緊急', color: 'error', points: 20 },
  high: { label: '高', color: 'warning', points: 15 },
  medium: { label: '中', color: 'info', points: 10 },
  low: { label: '低', color: 'neutral', points: 5 }
} as const;

// ステータスの定義
export const STATUS_CONFIG = {
  backlog: { label: 'バックログ', color: 'neutral' },
  todo: { label: '未着手', color: 'info' },
  in_progress: { label: '進行中', color: 'warning' },
  review: { label: 'レビュー', color: 'secondary' },
  done: { label: '完了', color: 'success' }
} as const;