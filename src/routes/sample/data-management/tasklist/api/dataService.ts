// データサービスのインターフェース定義
// 将来的にAPIに切り替える際は、このインターフェースを実装した別のサービスを作成するだけ

import type { Task, Campaign, Client, User } from '../types';

export interface DataService {
  // タスク操作
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  setTasks(tasks: Task[]): Promise<void>;
  
  // キャンペーン操作
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | null>;
  
  // クライアント操作
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | null>;
  
  // ユーザー操作
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | null>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // 現在のユーザー
  getCurrentUser(): Promise<User>;
}

// エラークラス
export class DataServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DataServiceError';
  }
}