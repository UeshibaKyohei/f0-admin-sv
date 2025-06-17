import { writable, derived, get } from 'svelte/store';
import type { Task, Campaign, Client, User, FilterOptions, ViewSettings } from '../types';
import { dataService } from '../api/serviceFactory';
import { showToast, isLoading } from './uiStore';

// ストアの初期化フラグ
let isInitialized = false;

// タスクストア
export const tasks = writable<Task[]>([]);

// キャンペーンストア
export const campaigns = writable<Campaign[]>([]);

// クライアントストア
export const clients = writable<Client[]>([]);

// ユーザーストア
export const users = writable<User[]>([]);

// 現在のユーザー
export const currentUser = writable<User | null>(null);

// フィルター設定
export const filterOptions = writable<FilterOptions>({
  status: [],
  priority: [],
  assignees: [],
  tags: [],
  campaigns: [],
  dateRange: {
    start: null,
    end: null
  }
});

// ビュー設定
export const viewSettings = writable<ViewSettings>({
  view: 'kanban',
  groupBy: 'status',
  sortBy: 'manual', // カンバンビューでは手動ソートをデフォルトに
  sortOrder: 'asc',
  showCompleted: true
});

// データの初期化
export async function initializeStores() {
  if (isInitialized) return;
  
  isLoading.set(true);
  try {
    // データの読み込み
    const [loadedTasks, loadedCampaigns, loadedClients, loadedUsers, loadedCurrentUser] = await Promise.all([
      dataService.getTasks(),
      dataService.getCampaigns(),
      dataService.getClients(),
      dataService.getUsers(),
      dataService.getCurrentUser()
    ]);
    
    // ストアに設定
    tasks.set(loadedTasks);
    campaigns.set(loadedCampaigns);
    clients.set(loadedClients);
    users.set(loadedUsers);
    currentUser.set(loadedCurrentUser);
    
    isInitialized = true;
  } catch (error) {
    showToast('データの読み込みに失敗しました', 'error');
    console.error('Failed to initialize stores:', error);
  } finally {
    isLoading.set(false);
  }
}

// フィルタリングされたタスク
export const filteredTasks = derived(
  [tasks, filterOptions, viewSettings],
  ([$tasks, $filterOptions, $viewSettings]) => {
    let filtered = [...$tasks];

    // ステータスフィルター
    if ($filterOptions.status.length > 0) {
      filtered = filtered.filter(task => $filterOptions.status.includes(task.status));
    }

    // 優先度フィルター
    if ($filterOptions.priority.length > 0) {
      filtered = filtered.filter(task => $filterOptions.priority.includes(task.priority));
    }

    // 担当者フィルター
    if ($filterOptions.assignees.length > 0) {
      filtered = filtered.filter(task => 
        task.assignees.some(assignee => $filterOptions.assignees.includes(assignee))
      );
    }

    // タグフィルター
    if ($filterOptions.tags.length > 0) {
      filtered = filtered.filter(task =>
        task.tags.some(tag => $filterOptions.tags.includes(tag))
      );
    }

    // キャンペーンフィルター
    if ($filterOptions.campaigns.length > 0) {
      filtered = filtered.filter(task => $filterOptions.campaigns.includes(task.campaignId));
    }

    // 日付範囲フィルター
    if ($filterOptions.dateRange.start || $filterOptions.dateRange.end) {
      filtered = filtered.filter(task => {
        const dueDate = new Date(task.dueDate);
        if ($filterOptions.dateRange.start && dueDate < new Date($filterOptions.dateRange.start)) {
          return false;
        }
        if ($filterOptions.dateRange.end && dueDate > new Date($filterOptions.dateRange.end)) {
          return false;
        }
        return true;
      });
    }

    // 完了タスクの表示/非表示
    if (!$viewSettings.showCompleted) {
      filtered = filtered.filter(task => task.status !== 'done');
    }

    // ソート（手動ソートの場合はスキップ）
    if ($viewSettings.sortBy !== 'manual') {
      filtered.sort((a, b) => {
        let compareValue = 0;
        
        switch ($viewSettings.sortBy) {
          case 'priority':
            const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
            compareValue = priorityOrder[a.priority] - priorityOrder[b.priority];
            break;
          case 'dueDate':
            compareValue = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            break;
          case 'created':
            compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'updated':
            compareValue = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            break;
        }

        return $viewSettings.sortOrder === 'asc' ? compareValue : -compareValue;
      });
    }

    return filtered;
  }
);

// タスクをステータス別にグループ化
export const tasksByStatus = derived(filteredTasks, ($filteredTasks) => {
  const grouped: Record<Task['status'], Task[]> = {
    backlog: [],
    todo: [],
    in_progress: [],
    review: [],
    done: []
  };

  $filteredTasks.forEach(task => {
    grouped[task.status].push(task);
  });

  return grouped;
});

// タスク操作関数
export async function createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
  isLoading.set(true);
  try {
    const newTask = await dataService.createTask(taskData);
    tasks.update(items => [...items, newTask]);
    showToast('タスクを作成しました', 'success');
    return newTask;
  } catch (error) {
    showToast('タスクの作成に失敗しました', 'error');
    throw error;
  } finally {
    isLoading.set(false);
  }
}

export async function updateTask(id: string, updates: Partial<Task>) {
  try {
    const updatedTask = await dataService.updateTask(id, updates);
    tasks.update(items => {
      return items.map(task => task.id === id ? updatedTask : task);
    });
    
    // ポイント付与のチェック（タスク完了時）
    if (updates.status === 'done') {
      const task = get(tasks).find(t => t.id === id);
      if (task) {
        const user = get(currentUser);
        if (user && task.assignees.includes(user.id)) {
          const updatedUser = await dataService.updateUser(user.id, {
            totalPoints: user.totalPoints + task.points,
            weeklyPoints: user.weeklyPoints + task.points
          });
          currentUser.set(updatedUser);
          users.update(items => items.map(u => u.id === user.id ? updatedUser : u));
        }
      }
    }
  } catch (error) {
    showToast('タスクの更新に失敗しました', 'error');
    throw error;
  }
}

export async function deleteTask(id: string) {
  isLoading.set(true);
  try {
    await dataService.deleteTask(id);
    tasks.update(items => items.filter(task => task.id !== id));
  } catch (error) {
    showToast('タスクの削除に失敗しました', 'error');
    throw error;
  } finally {
    isLoading.set(false);
  }
}

export async function moveTask(taskId: string, newStatus: Task['status'], targetIndex?: number) {
  // ステータスを更新
  await updateTask(taskId, { status: newStatus });
  
  // targetIndexが指定されている場合は、その位置に移動
  if (targetIndex !== undefined) {
    tasks.update(items => {
      const newItems = [...items];
      
      // 移動したタスクのインデックスを取得
      const movedTaskIndex = newItems.findIndex(t => t.id === taskId);
      if (movedTaskIndex === -1) return items;
      
      // 移動したタスクを取得
      const movedTask = newItems[movedTaskIndex];
      
      // 一旦削除
      newItems.splice(movedTaskIndex, 1);
      
      // 新しいステータスのタスクのインデックスリストを作成
      const statusTaskIndices: number[] = [];
      newItems.forEach((task, index) => {
        if (task.status === newStatus) {
          statusTaskIndices.push(index);
        }
      });
      
      // ターゲット位置を計算
      let insertIndex: number;
      if (targetIndex >= statusTaskIndices.length) {
        // リストの最後に追加
        if (statusTaskIndices.length > 0) {
          insertIndex = statusTaskIndices[statusTaskIndices.length - 1] + 1;
        } else {
          // 最初のタスクの場合
          insertIndex = newItems.findIndex(t => t.status === newStatus);
          if (insertIndex === -1) insertIndex = newItems.length;
        }
      } else if (targetIndex === 0) {
        // リストの最初に追加
        if (statusTaskIndices.length > 0) {
          insertIndex = statusTaskIndices[0];
        } else {
          insertIndex = 0;
        }
      } else {
        // 中間に挿入
        insertIndex = statusTaskIndices[targetIndex];
      }
      
      // タスクを新しい位置に挿入
      newItems.splice(insertIndex, 0, movedTask);
      
      return newItems;
    });
    
    // LocalStorageに保存
    const updatedTasks = get(tasks);
    dataService.setTasks(updatedTasks);
  }
}

// 同じステータス内でのタスクの並び替え
export async function reorderTasksInStatus(status: Task['status'], taskId: string, targetIndex: number) {
  tasks.update(items => {
    // 現在のタスクリストをコピー
    const newItems = [...items];
    
    // 移動するタスクのインデックスを取得
    const sourceIndex = newItems.findIndex(t => t.id === taskId);
    if (sourceIndex === -1) return items;
    
    // 移動するタスクを取得
    const taskToMove = newItems[sourceIndex];
    
    // 同じステータスのタスクのインデックスリストを作成
    const statusTaskIndices: number[] = [];
    newItems.forEach((task, index) => {
      if (task.status === status) {
        statusTaskIndices.push(index);
      }
    });
    
    // ソースタスクを削除
    newItems.splice(sourceIndex, 1);
    
    // 削除後のインデックスリストを再計算
    const updatedStatusIndices: number[] = [];
    newItems.forEach((task, index) => {
      if (task.status === status) {
        updatedStatusIndices.push(index);
      }
    });
    
    // ターゲット位置を計算
    let insertIndex: number;
    if (targetIndex >= updatedStatusIndices.length) {
      // リストの最後に追加
      if (updatedStatusIndices.length > 0) {
        insertIndex = updatedStatusIndices[updatedStatusIndices.length - 1] + 1;
      } else {
        insertIndex = newItems.length;
      }
    } else if (targetIndex === 0) {
      // リストの最初に追加
      if (updatedStatusIndices.length > 0) {
        insertIndex = updatedStatusIndices[0];
      } else {
        insertIndex = 0;
      }
    } else {
      // 中間に挿入
      insertIndex = updatedStatusIndices[targetIndex];
    }
    
    // タスクを新しい位置に挿入
    newItems.splice(insertIndex, 0, taskToMove);
    
    return newItems;
  });
  
  // LocalStorageに保存（非同期）
  const updatedTasks = get(tasks);
  dataService.setTasks(updatedTasks);
}

// タグの取得
export const allTags = derived(tasks, ($tasks) => {
  const tagSet = new Set<string>();
  $tasks.forEach(task => {
    task.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
});

// 統計情報
export const taskStats = derived([tasks, currentUser], ([$tasks, $currentUser]) => {
  if (!$currentUser) {
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      overdue: 0,
      dueToday: 0
    };
  }
  
  const userTasks = $tasks.filter(task => task.assignees.includes($currentUser.id));
  
  return {
    total: userTasks.length,
    completed: userTasks.filter(t => t.status === 'done').length,
    inProgress: userTasks.filter(t => t.status === 'in_progress').length,
    overdue: userTasks.filter(t => 
      t.status !== 'done' && new Date(t.dueDate) < new Date()
    ).length,
    dueToday: userTasks.filter(t => {
      const today = new Date();
      const dueDate = new Date(t.dueDate);
      return t.status !== 'done' && 
        dueDate.toDateString() === today.toDateString();
    }).length
  };
});