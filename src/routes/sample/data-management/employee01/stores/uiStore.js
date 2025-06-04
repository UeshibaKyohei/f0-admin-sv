// 社員管理システム UI状態管理ストア

import { writable, derived } from 'svelte/store';
import { CONFIG } from '../config.js';

// UI状態の基本ストア
export const viewMode = writable('list'); // 'list' | 'grid' | 'org_chart' | 'skill_matrix'
export const selectedEmployees = writable([]);
export const isModalOpen = writable(false);
export const modalMode = writable('view'); // 'view' | 'create' | 'edit'
export const currentEmployee = writable(null);

// 組織図関連の状態
export const expandedDepartments = writable(new Set());
export const orgChartZoom = writable(1.0);
export const orgChartPosition = writable({ x: 0, y: 0 });

// フィルター/検索UI状態
export const isFilterPanelOpen = writable(false);
export const activeFilterCount = writable(0);

// スキルマトリックス関連の状態
export const selectedSkillCategories = writable([]);
export const skillMatrixGroupBy = writable('department'); // 'department' | 'position' | 'none'

// アニメーション・UX関連
export const isTransitioning = writable(false);
export const lastAction = writable(null); // 最後に実行したアクション（undo/redo用）

// ページネーション状態
export const pagination = writable({
  currentPage: 1,
  pageSize: CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
  totalItems: 0,
  totalPages: 0
});

// トースト/通知状態
export const notifications = writable([]);

// CSV インポート/エクスポート状態
export const csvImportStatus = writable({
  isProcessing: false,
  progress: 0,
  errors: [],
  successCount: 0
});

// 詳細検索の状態
export const advancedSearch = writable({
  isOpen: false,
  savedQueries: [],
  currentQuery: null
});

// 派生ストア: 選択状態の統計
export const selectionStats = derived(selectedEmployees, ($selectedEmployees) => {
  return {
    count: $selectedEmployees.length,
    hasSelection: $selectedEmployees.length > 0,
    isMultipleSelected: $selectedEmployees.length > 1,
    isAllSelected: false // 実際の実装では filteredEmployees との比較が必要
  };
});

// 派生ストア: UI状態の複合情報
export const uiState = derived(
  [viewMode, isModalOpen, modalMode, isFilterPanelOpen, selectedEmployees],
  ([$viewMode, $isModalOpen, $modalMode, $isFilterPanelOpen, $selectedEmployees]) => {
    return {
      viewMode: $viewMode,
      isModalOpen: $isModalOpen,
      modalMode: $modalMode,
      isFilterPanelOpen: $isFilterPanelOpen,
      hasSelections: $selectedEmployees.length > 0,
      canEdit: $selectedEmployees.length === 1,
      canDelete: $selectedEmployees.length > 0,
      showBulkActions: $selectedEmployees.length > 1
    };
  }
);

// 派生ストア: ページネーション情報
export const paginationInfo = derived(pagination, ($pagination) => {
  const { currentPage, pageSize, totalItems, totalPages } = $pagination;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  
  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    startItem,
    endItem,
    showPagination: totalItems > pageSize,
    hasPrevious: currentPage > 1,
    hasNext: currentPage < totalPages,
    pageNumbers: generatePageNumbers(currentPage, totalPages)
  };
});

// ページ番号生成（...を含む表示用）
function generatePageNumbers(currentPage, totalPages) {
  const delta = 2; // 現在のページの前後に表示するページ数
  const pages = [];
  const start = Math.max(1, currentPage - delta);
  const end = Math.min(totalPages, currentPage + delta);
  
  if (start > 1) {
    pages.push(1);
    if (start > 2) {
      pages.push('...');
    }
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  if (end < totalPages) {
    if (end < totalPages - 1) {
      pages.push('...');
    }
    pages.push(totalPages);
  }
  
  return pages;
}

// アクション関数: 表示モード切り替え
export function setViewMode(mode) {
  viewMode.set(mode);
  // 表示モード変更時は選択をクリア
  selectedEmployees.set([]);
}

// アクション関数: 社員選択管理
export function selectEmployee(employeeId) {
  selectedEmployees.update(current => {
    if (current.includes(employeeId)) {
      return current.filter(id => id !== employeeId);
    } else {
      return [...current, employeeId];
    }
  });
}

export function selectAllEmployees(employeeIds) {
  selectedEmployees.set([...employeeIds]);
}

export function clearSelection() {
  selectedEmployees.set([]);
}

export function selectMultiple(employeeIds) {
  selectedEmployees.update(current => {
    const newSelection = new Set([...current, ...employeeIds]);
    return Array.from(newSelection);
  });
}

// アクション関数: モーダル管理
export function openEmployeeModal(mode = 'view', employee = null) {
  modalMode.set(mode);
  currentEmployee.set(employee);
  isModalOpen.set(true);
}

export function closeEmployeeModal() {
  isModalOpen.set(false);
  setTimeout(() => {
    modalMode.set('view');
    currentEmployee.set(null);
  }, 150); // アニメーション時間を考慮
}

// アクション関数: 組織図状態管理
export function toggleDepartment(departmentId) {
  expandedDepartments.update(current => {
    const newSet = new Set(current);
    if (newSet.has(departmentId)) {
      newSet.delete(departmentId);
    } else {
      newSet.add(departmentId);
    }
    return newSet;
  });
}

export function expandAllDepartments(departmentIds) {
  expandedDepartments.set(new Set(departmentIds));
}

export function collapseAllDepartments() {
  expandedDepartments.set(new Set());
}

export function setOrgChartZoom(zoom) {
  orgChartZoom.set(Math.max(0.5, Math.min(2.0, zoom)));
}

export function resetOrgChartView() {
  orgChartZoom.set(1.0);
  orgChartPosition.set({ x: 0, y: 0 });
}

// アクション関数: フィルターパネル管理
export function toggleFilterPanel() {
  isFilterPanelOpen.update(current => !current);
}

export function openFilterPanel() {
  isFilterPanelOpen.set(true);
}

export function closeFilterPanel() {
  isFilterPanelOpen.set(false);
}

// アクション関数: ページネーション
export function setCurrentPage(page) {
  pagination.update(current => ({
    ...current,
    currentPage: Math.max(1, Math.min(page, current.totalPages))
  }));
}

export function setPageSize(size) {
  pagination.update(current => ({
    ...current,
    pageSize: size,
    currentPage: 1 // ページサイズ変更時は1ページ目に戻る
  }));
}

export function updatePaginationStats(totalItems) {
  pagination.update(current => {
    const totalPages = Math.ceil(totalItems / current.pageSize);
    return {
      ...current,
      totalItems,
      totalPages,
      currentPage: Math.min(current.currentPage, totalPages || 1)
    };
  });
}

// アクション関数: 通知管理
export function addNotification(message, type = 'info', duration = 5000) {
  const notification = {
    id: Date.now(),
    message,
    type, // 'success' | 'error' | 'warning' | 'info'
    duration,
    timestamp: new Date()
  };
  
  notifications.update(current => [...current, notification]);
  
  // 自動削除
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(notification.id);
    }, duration);
  }
  
  return notification.id;
}

export function removeNotification(notificationId) {
  notifications.update(current => 
    current.filter(notification => notification.id !== notificationId)
  );
}

export function clearAllNotifications() {
  notifications.set([]);
}

// アクション関数: スキルマトリックス
export function toggleSkillCategory(category) {
  selectedSkillCategories.update(current => {
    if (current.includes(category)) {
      return current.filter(c => c !== category);
    } else {
      return [...current, category];
    }
  });
}

export function setSkillMatrixGroupBy(groupBy) {
  skillMatrixGroupBy.set(groupBy);
}

// アクション関数: CSVインポート状態
export function startCsvImport() {
  csvImportStatus.set({
    isProcessing: true,
    progress: 0,
    errors: [],
    successCount: 0
  });
}

export function updateCsvImportProgress(progress, successCount = 0, errors = []) {
  csvImportStatus.update(current => ({
    ...current,
    progress,
    successCount,
    errors
  }));
}

export function completeCsvImport(successCount, errors = []) {
  csvImportStatus.set({
    isProcessing: false,
    progress: 100,
    errors,
    successCount
  });
}

// アクション関数: 詳細検索
export function toggleAdvancedSearch() {
  advancedSearch.update(current => ({
    ...current,
    isOpen: !current.isOpen
  }));
}

export function saveSearchQuery(queryName, query) {
  advancedSearch.update(current => {
    const existingIndex = current.savedQueries.findIndex(q => q.name === queryName);
    const newQuery = { name: queryName, query, createdAt: new Date() };
    
    if (existingIndex >= 0) {
      current.savedQueries[existingIndex] = newQuery;
    } else {
      current.savedQueries.push(newQuery);
    }
    
    return {
      ...current,
      currentQuery: newQuery
    };
  });
}

export function loadSearchQuery(query) {
  advancedSearch.update(current => ({
    ...current,
    currentQuery: query
  }));
}

export function deleteSearchQuery(queryName) {
  advancedSearch.update(current => ({
    ...current,
    savedQueries: current.savedQueries.filter(q => q.name !== queryName)
  }));
}

// アクション関数: アニメーション制御
export function startTransition() {
  isTransitioning.set(true);
}

export function endTransition() {
  setTimeout(() => {
    isTransitioning.set(false);
  }, CONFIG.UI.ANIMATION_DURATION);
}

// アクション関数: 最後のアクション記録（undo/redo用）
export function recordAction(action) {
  lastAction.set({
    ...action,
    timestamp: new Date()
  });
}

// 初期化関数
export function initializeUIState() {
  // UI状態を初期値にリセット
  viewMode.set('list');
  selectedEmployees.set([]);
  isModalOpen.set(false);
  modalMode.set('view');
  currentEmployee.set(null);
  expandedDepartments.set(new Set());
  isFilterPanelOpen.set(false);
  selectedSkillCategories.set([]);
  skillMatrixGroupBy.set('department');
  
  // ページネーションを初期化
  pagination.set({
    currentPage: 1,
    pageSize: CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 0
  });
  
  // 通知をクリア
  notifications.set([]);
}

// ローカルストレージからUI設定を復元
export function restoreUISettings() {
  try {
    const savedSettings = localStorage.getItem('hr_ui_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      
      if (settings.viewMode) viewMode.set(settings.viewMode);
      if (settings.pageSize) {
        pagination.update(current => ({
          ...current,
          pageSize: settings.pageSize
        }));
      }
      if (settings.skillMatrixGroupBy) skillMatrixGroupBy.set(settings.skillMatrixGroupBy);
    }
  } catch (error) {
    console.warn('Failed to restore UI settings:', error);
  }
}

// UI設定をローカルストレージに保存
export function saveUISettings() {
  try {
    const settings = {};
    
    // 現在の値を取得して保存
    const unsubscribeViewMode = viewMode.subscribe(value => settings.viewMode = value);
    const unsubscribePagination = pagination.subscribe(value => settings.pageSize = value.pageSize);
    const unsubscribeSkillMatrix = skillMatrixGroupBy.subscribe(value => settings.skillMatrixGroupBy = value);
    
    // すぐにunsubscribe
    unsubscribeViewMode();
    unsubscribePagination();
    unsubscribeSkillMatrix();
    
    localStorage.setItem('hr_ui_settings', JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save UI settings:', error);
  }
}