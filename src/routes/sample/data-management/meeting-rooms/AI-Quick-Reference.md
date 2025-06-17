# AI開発用クイックリファレンス

## 📋 目次
1. [型定義の場所と命名規則](#型定義の場所と命名規則)
2. [よく使うコードパターン](#よく使うコードパターン)
3. [ストア操作の基本](#ストア操作の基本)
4. [API呼び出しパターン](#api呼び出しパターン)
5. [UI実装パターン](#ui実装パターン)
6. [エラーハンドリング](#エラーハンドリング)

## 型定義の場所と命名規則

### 主要な型定義ファイル
```
types/index.ts          # メインの型定義
api/apiService.interface.ts  # API関連の型
```

### 命名規則
- **Entity型**: `User`, `Room`, `Booking` (単数形)
- **DTO型**: `CreateBookingDto`, `UpdateRoomDto` (動詞+Entity+Dto)
- **Query型**: `BookingQueryParams`, `RoomSearchParams` (Entity+Query/Search+Params)
- **Response型**: `RoomAvailability`, `TimeSlot` (機能名+必要に応じてSuffix)

## よく使うコードパターン

### 1. 新しいエンティティの追加
```typescript
// 1. types/index.ts に型を追加
export interface Facility {
  id: string;
  name: string;
  buildingId: string;
  amenities: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 2. APIインターフェースに追加
export interface IMeetingRoomApiService {
  // 既存のメソッド...
  getFacilities(params?: FacilityQueryParams): Promise<Facility[]>;
  createFacility(data: CreateFacilityDto): Promise<Facility>;
}

// 3. モックデータを追加
export const mockFacilities: Facility[] = [
  {
    id: 'fac1',
    name: 'カフェテリア',
    buildingId: 'building1',
    amenities: ['wifi', 'power-outlet', 'vending-machine'],
    isActive: true
  }
];
```

### 2. 新しいストアの作成
```typescript
// stores/facilityStore.ts
import { writable, derived } from 'svelte/store';
import { getMeetingRoomApiService } from '../api/apiServiceFactory';

// 基本ストア
export const facilities = writable<Facility[]>([]);
export const isLoading = writable(false);
export const error = writable<string | null>(null);

// 派生ストア
export const activeFacilities = derived(
  facilities,
  $facilities => $facilities.filter(f => f.isActive)
);

// アクション
export async function loadFacilities() {
  isLoading.set(true);
  error.set(null);
  
  try {
    const api = getMeetingRoomApiService();
    const data = await api.getFacilities();
    facilities.set(data);
  } catch (err) {
    error.set(err.message);
  } finally {
    isLoading.set(false);
  }
}
```

### 3. リアクティブな絞り込み
```typescript
// フィルター条件ストア
export const filters = writable({
  building: '',
  minCapacity: 0,
  requiredAmenities: []
});

// フィルター適用済みデータ
export const filteredFacilities = derived(
  [facilities, filters],
  ([$facilities, $filters]) => {
    return $facilities.filter(facility => {
      if ($filters.building && facility.buildingId !== $filters.building) {
        return false;
      }
      
      if ($filters.requiredAmenities.length > 0) {
        const hasAll = $filters.requiredAmenities.every(
          amenity => facility.amenities.includes(amenity)
        );
        if (!hasAll) return false;
      }
      
      return true;
    });
  }
);
```

## ストア操作の基本

### イミュータブルな更新（重要！）
```typescript
// ❌ 間違い - UIが更新されない
facilities.update(items => {
  items.push(newFacility); // 同じ配列を変更
  return items;
});

// ✅ 正しい - 新しい配列を返す
facilities.update(items => [...items, newFacility]);

// オブジェクトの更新
facilities.update(items => 
  items.map(item => 
    item.id === targetId 
      ? { ...item, ...updates } // 新しいオブジェクト
      : item
  )
);

// 削除
facilities.update(items => 
  items.filter(item => item.id !== targetId)
);
```

### 複雑な状態更新
```typescript
// ネストしたデータの更新
export const bookingsByRoom = writable<Record<string, Booking[]>>({});

// 特定の部屋の予約を追加
bookingsByRoom.update(all => ({
  ...all, // 新しいオブジェクト
  [roomId]: [...(all[roomId] || []), newBooking] // 新しい配列
}));
```

## API呼び出しパターン

### 基本的なCRUD操作
```typescript
// CREATE
async function createItem(data: CreateItemDto) {
  isLoading.set(true);
  error.set(null);
  
  try {
    const api = getMeetingRoomApiService();
    const newItem = await api.createItem(data);
    
    // ストアに追加
    items.update(list => [...list, newItem]);
    
    // 成功通知（オプション）
    showNotification('作成しました', 'success');
    
    return newItem;
  } catch (err) {
    error.set(err.message);
    showNotification('作成に失敗しました', 'error');
    return null;
  } finally {
    isLoading.set(false);
  }
}

// READ with filters
async function searchItems(filters: ItemFilters) {
  isLoading.set(true);
  
  try {
    const api = getMeetingRoomApiService();
    const results = await api.searchItems(filters);
    searchResults.set(results);
  } catch (err) {
    error.set(err.message);
  } finally {
    isLoading.set(false);
  }
}

// UPDATE
async function updateItem(id: string, updates: UpdateItemDto) {
  try {
    const api = getMeetingRoomApiService();
    const updated = await api.updateItem(id, updates);
    
    // ストアを更新
    items.update(list =>
      list.map(item => item.id === id ? updated : item)
    );
    
    return updated;
  } catch (err) {
    error.set(err.message);
    return null;
  }
}

// DELETE
async function deleteItem(id: string) {
  if (!confirm('削除しますか？')) return;
  
  try {
    const api = getMeetingRoomApiService();
    await api.deleteItem(id);
    
    // ストアから削除
    items.update(list => list.filter(item => item.id !== id));
    
    showNotification('削除しました', 'success');
  } catch (err) {
    error.set(err.message);
  }
}
```

### バッチ操作
```typescript
// 複数アイテムの一括処理
async function batchUpdate(ids: string[], updates: Partial<Item>) {
  isLoading.set(true);
  const results = { success: [], failed: [] };
  
  // 並列処理
  const promises = ids.map(async (id) => {
    try {
      const updated = await updateItem(id, updates);
      results.success.push(updated);
    } catch (err) {
      results.failed.push({ id, error: err.message });
    }
  });
  
  await Promise.all(promises);
  isLoading.set(false);
  
  return results;
}
```

## UI実装パターン

### フォーム処理
```svelte
<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  // フォームデータ
  let formData = $state({
    name: '',
    capacity: 10,
    amenities: []
  });
  
  // バリデーション
  const errors = $derived.by(() => {
    const errs = {};
    if (!formData.name) errs.name = '名前は必須です';
    if (formData.capacity < 1) errs.capacity = '1名以上を入力してください';
    return errs;
  });
  
  const isValid = $derived(Object.keys(errors).length === 0);
  
  // 送信処理
  async function handleSubmit() {
    if (!isValid) return;
    
    const result = await createFacility(formData);
    if (result) {
      dispatch('created', { facility: result });
      resetForm();
    }
  }
  
  function resetForm() {
    formData = {
      name: '',
      capacity: 10,
      amenities: []
    };
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <div class="form-control">
    <label class="label">
      <span class="label-text">施設名</span>
    </label>
    <input 
      type="text" 
      bind:value={formData.name}
      class="input input-bordered {errors.name ? 'input-error' : ''}"
    >
    {#if errors.name}
      <label class="label">
        <span class="label-text-alt text-error">{errors.name}</span>
      </label>
    {/if}
  </div>
  
  <button 
    type="submit" 
    class="btn btn-primary"
    disabled={!isValid || $isLoading}
  >
    {#if $isLoading}
      <span class="loading loading-spinner"></span>
    {/if}
    作成
  </button>
</form>
```

### リスト表示とフィルタリング
```svelte
<script>
  import { facilities, filters, filteredFacilities } from './stores/facilityStore';
  
  // ソート設定
  let sortBy = $state('name');
  let sortOrder = $state('asc');
  
  // ソート済みデータ
  const sortedFacilities = $derived.by(() => {
    const sorted = [...$filteredFacilities].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return sorted;
  });
  
  // ページング
  let currentPage = $state(1);
  let itemsPerPage = $state(10);
  
  const paginatedData = $derived.by(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedFacilities.slice(start, start + itemsPerPage);
  });
  
  const totalPages = $derived(
    Math.ceil(sortedFacilities.length / itemsPerPage)
  );
</script>

<!-- フィルターUI -->
<div class="filters">
  <select bind:value={$filters.building}>
    <option value="">全ての建物</option>
    {#each buildings as building}
      <option value={building.id}>{building.name}</option>
    {/each}
  </select>
</div>

<!-- データテーブル -->
<table class="table">
  <thead>
    <tr>
      <th>
        <button on:click={() => toggleSort('name')}>
          名前 {#if sortBy === 'name'}{sortOrder === 'asc' ? '▲' : '▼'}{/if}
        </button>
      </th>
    </tr>
  </thead>
  <tbody>
    {#each paginatedData as facility}
      <tr>
        <td>{facility.name}</td>
      </tr>
    {/each}
  </tbody>
</table>

<!-- ページネーション -->
<div class="join">
  {#each Array(totalPages) as _, i}
    <button 
      class="join-item btn {currentPage === i + 1 ? 'btn-active' : ''}"
      on:click={() => currentPage = i + 1}
    >
      {i + 1}
    </button>
  {/each}
</div>
```

### モーダル/ダイアログ
```svelte
<script>
  export let isOpen = false;
  export let title = '';
  
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  function close() {
    dispatch('close');
  }
</script>

<dialog class="modal" class:modal-open={isOpen}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">{title}</h3>
    
    <slot />
    
    <div class="modal-action">
      <button class="btn" on:click={close}>閉じる</button>
      <slot name="actions" />
    </div>
  </div>
  
  <form method="dialog" class="modal-backdrop">
    <button on:click={close}>close</button>
  </form>
</dialog>
```

## エラーハンドリング

### グローバルエラーハンドラー
```typescript
// stores/errorStore.ts
export const globalError = writable<{
  message: string;
  type: 'error' | 'warning' | 'info';
  dismissible: boolean;
} | null>(null);

export function showError(message: string, type = 'error', dismissible = true) {
  globalError.set({ message, type, dismissible });
  
  if (dismissible) {
    setTimeout(() => globalError.set(null), 5000);
  }
}

// APIエラーの統一処理
export async function apiCall<T>(
  fn: () => Promise<T>,
  errorMessage = 'エラーが発生しました'
): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    if (err.code === 'NETWORK_ERROR') {
      showError('ネットワークエラーです。接続を確認してください。');
    } else if (err.code === 'UNAUTHORIZED') {
      showError('認証エラーです。再度ログインしてください。');
      // リダイレクト処理など
    } else {
      showError(err.message || errorMessage);
    }
    return null;
  }
}

// 使用例
const result = await apiCall(
  () => api.createBooking(data),
  '予約の作成に失敗しました'
);
```

### フォームバリデーション
```typescript
// バリデーションルール
export const validators = {
  required: (value: any) => !!value || '必須項目です',
  
  email: (value: string) => 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'メールアドレスが無効です',
  
  minLength: (min: number) => (value: string) =>
    value.length >= min || `${min}文字以上入力してください`,
  
  maxLength: (max: number) => (value: string) =>
    value.length <= max || `${max}文字以下で入力してください`,
  
  between: (min: number, max: number) => (value: number) =>
    (value >= min && value <= max) || `${min}〜${max}の範囲で入力してください`,
  
  futureDate: (value: string) => {
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today || '過去の日付は選択できません';
  }
};

// フォームバリデーションフック
export function useFormValidation(rules: Record<string, Function[]>) {
  const errors = writable<Record<string, string>>({});
  
  function validate(field: string, value: any) {
    const fieldRules = rules[field] || [];
    
    for (const rule of fieldRules) {
      const result = rule(value);
      if (result !== true) {
        errors.update(e => ({ ...e, [field]: result }));
        return false;
      }
    }
    
    errors.update(e => {
      const newErrors = { ...e };
      delete newErrors[field];
      return newErrors;
    });
    
    return true;
  }
  
  function validateAll(data: Record<string, any>) {
    let isValid = true;
    
    for (const [field, value] of Object.entries(data)) {
      if (!validate(field, value)) {
        isValid = false;
      }
    }
    
    return isValid;
  }
  
  return { errors, validate, validateAll };
}
```

## デバッグ用ユーティリティ

```typescript
// デバッグモードの切り替え
export const DEBUG = import.meta.env.DEV;

// デバッグログ
export function debugLog(label: string, data: any) {
  if (DEBUG) {
    console.log(`[${label}]`, data);
  }
}

// ストアの変更を監視
export function watchStore(store: any, name: string) {
  if (DEBUG) {
    store.subscribe(value => {
      console.log(`[Store: ${name}]`, value);
    });
  }
}

// パフォーマンス計測
export function measurePerformance(label: string, fn: Function) {
  if (DEBUG) {
    console.time(label);
    const result = fn();
    console.timeEnd(label);
    return result;
  }
  return fn();
}
```

---

このクイックリファレンスは、AI駆動開発時に素早く参照できるよう、よく使うパターンをまとめています。
新しい機能を実装する際は、これらのパターンを基に拡張してください。