import { writable } from 'svelte/store';

// UI状態管理
export const selectedTask = writable<string | null>(null);
export const isTaskModalOpen = writable(false);
export const isFilterPanelOpen = writable(false);
export const draggedTaskId = writable<string | null>(null);

// トースト通知
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const toasts = writable<Toast[]>([]);

export function showToast(message: string, type: Toast['type'] = 'info', duration = 3000) {
  const id = `toast-${Date.now()}`;
  const toast: Toast = { id, message, type, duration };
  
  toasts.update(items => [...items, toast]);
  
  if (duration > 0) {
    setTimeout(() => {
      toasts.update(items => items.filter(t => t.id !== id));
    }, duration);
  }
}

// ローディング状態
export const isLoading = writable(false);

// ドラッグ&ドロップ状態
export const dropTargetStatus = writable<string | null>(null);