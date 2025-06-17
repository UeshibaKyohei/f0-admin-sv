// LocalStorageを使用したデータサービスの実装
// 将来的にAPIに切り替える際は、apiService.tsを作成してDataServiceインターフェースを実装する

import type { DataService } from './dataService';
import type { Task, Campaign, Client, User } from '../types';
import { generateInitialData } from '../mockData';
import { config } from '../config.js';

const STORAGE_KEYS = {
  TASKS: 'tasklist_tasks',
  CAMPAIGNS: 'tasklist_campaigns',
  CLIENTS: 'tasklist_clients',
  USERS: 'tasklist_users',
  CURRENT_USER: 'tasklist_current_user'
};

export class LocalStorageService implements DataService {
  private isClient = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

  constructor() {
    // ブラウザ環境でのみ初期化
    if (this.isClient && config.USE_LOCAL_STORAGE) {
      this.initializeData();
    }
  }

  private initializeData() {
    if (!this.isClient || !config.USE_LOCAL_STORAGE) return;
    
    // モックデータ機能が有効な場合のみ初期データを生成
    if (config.FEATURE_MOCK_DATA && !localStorage.getItem(STORAGE_KEYS.TASKS)) {
      const initialData = generateInitialData();
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(initialData.tasks));
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(initialData.campaigns));
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(initialData.clients));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialData.users));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(initialData.users[0]));
    }
  }

  // タスク操作
  async getTasks(): Promise<Task[]> {
    if (!this.isClient) return [];
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  }

  async getTask(id: string): Promise<Task | null> {
    const tasks = await this.getTasks();
    return tasks.find(t => t.id === id) || null;
  }

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const tasks = await this.getTasks();
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    if (this.isClient) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }
    
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const tasks = await this.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    const updatedTask = {
      ...tasks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    tasks[index] = updatedTask;
    if (this.isClient) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }
    
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = await this.getTasks();
    const filteredTasks = tasks.filter(t => t.id !== id);
    if (this.isClient) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filteredTasks));
    }
  }

  async setTasks(tasks: Task[]): Promise<void> {
    if (this.isClient) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }
  }

  // キャンペーン操作
  async getCampaigns(): Promise<Campaign[]> {
    if (!this.isClient) return [];
    const data = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
    return data ? JSON.parse(data) : [];
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    const campaigns = await this.getCampaigns();
    return campaigns.find(c => c.id === id) || null;
  }

  // クライアント操作
  async getClients(): Promise<Client[]> {
    if (!this.isClient) return [];
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return data ? JSON.parse(data) : [];
  }

  async getClient(id: string): Promise<Client | null> {
    const clients = await this.getClients();
    return clients.find(c => c.id === id) || null;
  }

  // ユーザー操作
  async getUsers(): Promise<User[]> {
    if (!this.isClient) return [];
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  async getUser(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === id);
    
    if (index === -1) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = {
      ...users[index],
      ...updates
    };
    
    users[index] = updatedUser;
    if (this.isClient) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      // 現在のユーザーの場合は、CURRENT_USERも更新
      const currentUser = await this.getCurrentUser();
      if (currentUser.id === id) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
      }
    }
    
    return updatedUser;
  }

  async getCurrentUser(): Promise<User> {
    if (!this.isClient) {
      const users = await this.getUsers();
      return users[0] || generateInitialData().users[0];
    }
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) {
      // デフォルトユーザーを返す
      const users = await this.getUsers();
      return users[0];
    }
    return JSON.parse(data);
  }

  // データのリセット（デバッグ用）
  async resetData(): Promise<void> {
    if (!this.isClient) return;
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.initializeData();
  }
}

// シングルトンインスタンス
export const dataService = new LocalStorageService();