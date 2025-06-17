// 本実装用のAPIサービス
// 実際のバックエンドAPIとの通信を行う
// config.USE_LOCAL_STORAGE = false 時に使用される

import type { DataService } from './dataService';
import type { Task, Campaign, Client, User } from '../types';
import { config } from '../config.js';

/**
 * RESTful APIエンドポイント定義
 * 本実装時にバックエンドのAPIエンドポイントに合わせて変更
 */
const API_ENDPOINTS = {
  // タスク関連
  TASKS: '/api/v1/tasks',
  TASK_BY_ID: (id: string) => `/api/v1/tasks/${id}`,
  TASK_ASSIGNEES: (id: string) => `/api/v1/tasks/${id}/assignees`,
  TASK_COMMENTS: (id: string) => `/api/v1/tasks/${id}/comments`,
  TASK_ATTACHMENTS: (id: string) => `/api/v1/tasks/${id}/attachments`,
  
  // キャンペーン関連
  CAMPAIGNS: '/api/v1/campaigns',
  CAMPAIGN_BY_ID: (id: string) => `/api/v1/campaigns/${id}`,
  
  // クライアント関連
  CLIENTS: '/api/v1/clients',
  CLIENT_BY_ID: (id: string) => `/api/v1/clients/${id}`,
  
  // ユーザー関連
  USERS: '/api/v1/users',
  USER_BY_ID: (id: string) => `/api/v1/users/${id}`,
  CURRENT_USER: '/api/v1/auth/me',
  
  // ゲーミフィケーション関連（実装時に追加）
  USER_BADGES: (id: string) => `/api/v1/users/${id}/badges`,
  LEADERBOARD: '/api/v1/gamification/leaderboard',
  ACHIEVEMENTS: '/api/v1/gamification/achievements'
};

/**
 * HTTP クライアントのヘルパー関数
 * 認証ヘッダーやエラーハンドリングを含む
 */
class ApiClient {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor() {
    // 本実装時にはprocess.env.API_BASE_URLなどから取得
    this.baseURL = config.API_BASE_URL || 'http://localhost:8000';
    this.headers = {
      'Content-Type': 'application/json',
      // 認証トークンがある場合
      'Authorization': `Bearer ${this.getAuthToken()}`
    };
  }

  private getAuthToken(): string {
    // 本実装時にはlocalStorageやcookieからJWTトークンを取得
    return localStorage.getItem('auth_token') || '';
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API Error: ${response.status} ${response.statusText}. ${
          errorData.message || ''
        }`
      );
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint: string): Promise<void> {
    await this.request(endpoint, { method: 'DELETE' });
  }
}

/**
 * 本実装用APIサービスクラス
 * DataServiceインターフェースを実装
 */
export class ProductionApiService implements DataService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient();
  }

  // タスク関連操作
  async getTasks(): Promise<Task[]> {
    // APIコール例: GET /api/v1/tasks?include=assignees,tags,comments
    return this.client.get<Task[]>(`${API_ENDPOINTS.TASKS}?include=assignees,tags,comments`);
  }

  async getTask(id: string): Promise<Task | null> {
    try {
      return await this.client.get<Task>(API_ENDPOINTS.TASK_BY_ID(id));
    } catch (error) {
      // 404の場合はnullを返す
      if (error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    // APIコール例: POST /api/v1/tasks
    return this.client.post<Task>(API_ENDPOINTS.TASKS, taskData);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    // APIコール例: PATCH /api/v1/tasks/{id}
    return this.client.patch<Task>(API_ENDPOINTS.TASK_BY_ID(id), updates);
  }

  async deleteTask(id: string): Promise<void> {
    // APIコール例: DELETE /api/v1/tasks/{id}
    await this.client.delete(API_ENDPOINTS.TASK_BY_ID(id));
  }

  async setTasks(tasks: Task[]): Promise<void> {
    // バッチ更新API（実装されている場合）
    // APIコール例: PUT /api/v1/tasks/batch
    await this.client.put('/api/v1/tasks/batch', { tasks });
  }

  // キャンペーン関連操作
  async getCampaigns(): Promise<Campaign[]> {
    return this.client.get<Campaign[]>(API_ENDPOINTS.CAMPAIGNS);
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    try {
      return await this.client.get<Campaign>(API_ENDPOINTS.CAMPAIGN_BY_ID(id));
    } catch (error) {
      if (error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // クライアント関連操作
  async getClients(): Promise<Client[]> {
    return this.client.get<Client[]>(API_ENDPOINTS.CLIENTS);
  }

  async getClient(id: string): Promise<Client | null> {
    try {
      return await this.client.get<Client>(API_ENDPOINTS.CLIENT_BY_ID(id));
    } catch (error) {
      if (error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // ユーザー関連操作
  async getUsers(): Promise<User[]> {
    return this.client.get<User[]>(API_ENDPOINTS.USERS);
  }

  async getUser(id: string): Promise<User | null> {
    try {
      return await this.client.get<User>(API_ENDPOINTS.USER_BY_ID(id));
    } catch (error) {
      if (error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    return this.client.patch<User>(API_ENDPOINTS.USER_BY_ID(id), updates);
  }

  async getCurrentUser(): Promise<User> {
    return this.client.get<User>(API_ENDPOINTS.CURRENT_USER);
  }
}

// ゲーミフィケーション関連のAPI呼び出し（実装時に追加）
export class GamificationApiService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient();
  }

  async getUserBadges(userId: string): Promise<any[]> {
    return this.client.get(API_ENDPOINTS.USER_BADGES(userId));
  }

  async getLeaderboard(period: string = 'weekly'): Promise<any[]> {
    return this.client.get(`${API_ENDPOINTS.LEADERBOARD}?period=${period}`);
  }

  async getAvailableAchievements(userId: string): Promise<any[]> {
    return this.client.get(`${API_ENDPOINTS.ACHIEVEMENTS}?user_id=${userId}&available=true`);
  }

  async claimAchievement(userId: string, achievementId: string): Promise<any> {
    return this.client.post(`${API_ENDPOINTS.ACHIEVEMENTS}/claim`, {
      user_id: userId,
      achievement_id: achievementId
    });
  }
}