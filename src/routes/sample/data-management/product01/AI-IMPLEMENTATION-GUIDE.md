# ECサイト商品管理システム - 実装ガイド＆コードサンプル

## 1. コアコンポーネントの実装例

### 1.1 ストア実装パターン

#### 基本的なCRUDストア
```javascript
// stores/itemStore.js
import { writable, derived } from 'svelte/store';
import { apiClient } from '../api/client.js';

function createProductStore() {
  const { subscribe, set, update } = writable([]);
  
  return {
    subscribe,
    
    // 非同期初期化パターン
    async initialize() {
      try {
        const { data } = await apiClient.products.list();
        set(data);
      } catch (error) {
        console.error('Failed to initialize products:', error);
        set([]); // エラー時は空配列
      }
    },
    
    // 楽観的更新パターン
    async add(product) {
      // 一時的なIDで即座にUIを更新
      const tempProduct = { ...product, id: `temp-${Date.now()}` };
      update(products => [...products, tempProduct]);
      
      try {
        const newProduct = await apiClient.products.create(product);
        // 実際のIDで置き換え
        update(products => 
          products.map(p => p.id === tempProduct.id ? newProduct : p)
        );
        return newProduct;
      } catch (error) {
        // エラー時はロールバック
        update(products => products.filter(p => p.id !== tempProduct.id));
        throw error;
      }
    }
  };
}
```

#### 派生ストアの活用
```javascript
// 複雑な計算を効率化
export const productsByCategory = derived(
  [products, categories],
  ([$products, $categories]) => {
    const grouped = {};
    
    $categories.forEach(category => {
      grouped[category.id] = {
        category,
        products: $products.filter(p => p.categoryId === category.id),
        count: 0,
        totalValue: 0
      };
    });
    
    // 統計情報を計算
    Object.values(grouped).forEach(group => {
      group.count = group.products.length;
      group.totalValue = group.products.reduce(
        (sum, p) => sum + (p.price * p.stock), 0
      );
    });
    
    return grouped;
  }
);
```

### 1.2 リアクティブフォームの実装

#### 動的バリデーション付きフォーム
```svelte
<script>
  import { CONFIG, VALIDATION } from './config.js';
  
  let formData = $state({
    name: '',
    price: 0,
    stock: 0
  });
  
  // リアクティブなエラー状態
  const errors = $derived.by(() => {
    const errs = {};
    
    // 商品名の検証
    if (formData.name.length < VALIDATION.PRODUCT.NAME_MIN_LENGTH) {
      errs.name = '商品名は必須です';
    } else if (formData.name.length > VALIDATION.PRODUCT.NAME_MAX_LENGTH) {
      errs.name = `商品名は${VALIDATION.PRODUCT.NAME_MAX_LENGTH}文字以内で入力してください`;
    }
    
    // 価格の検証
    if (formData.price < VALIDATION.PRODUCT.PRICE_MIN) {
      errs.price = '価格は0以上である必要があります';
    } else if (formData.price > VALIDATION.PRODUCT.PRICE_MAX) {
      errs.price = `価格は${VALIDATION.PRODUCT.PRICE_MAX}以下である必要があります`;
    }
    
    return errs;
  });
  
  // フォーム全体の有効性
  const isValid = $derived(Object.keys(errors).length === 0);
  
  // デバウンス付き入力ハンドラー
  let debounceTimer;
  function handleInput(field, value) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      formData[field] = value;
    }, 300);
  }
</script>

<form>
  <div class="form-control">
    <label class="label">
      <span class="label-text">商品名</span>
    </label>
    <input
      type="text"
      bind:value={formData.name}
      class="input input-bordered"
      class:input-error={errors.name}
    />
    {#if errors.name}
      <label class="label">
        <span class="label-text-alt text-error">{errors.name}</span>
      </label>
    {/if}
  </div>
  
  <button 
    type="submit" 
    class="btn btn-primary"
    disabled={!isValid}
  >
    保存
  </button>
</form>
```

### 1.3 高度なフィルタリングシステム

#### 複合フィルターの実装
```javascript
// utils/filtering.js
export function createFilterSystem() {
  // フィルター関数のマップ
  const filterFunctions = {
    search: (items, value) => {
      if (!value) return items;
      const searchLower = value.toLowerCase();
      return items.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      );
    },
    
    priceRange: (items, { min, max }) => {
      return items.filter(item => {
        if (min !== null && item.price < min) return false;
        if (max !== null && item.price > max) return false;
        return true;
      });
    },
    
    tags: (items, selectedTags) => {
      if (!selectedTags.length) return items;
      return items.filter(item =>
        selectedTags.some(tagId => item.tags?.includes(tagId))
      );
    },
    
    // カスタムフィルター関数を追加可能
    custom: (items, customFn) => {
      return customFn ? items.filter(customFn) : items;
    }
  };
  
  // フィルターチェーンの実行
  return function applyFilters(items, filters) {
    let result = [...items];
    
    Object.entries(filters).forEach(([key, value]) => {
      if (filterFunctions[key] && value !== null && value !== undefined) {
        result = filterFunctions[key](result, value);
      }
    });
    
    return result;
  };
}
```

### 1.4 ドラッグ＆ドロップの実装

#### 画像並び替え機能
```svelte
<script>
  let draggedItem = null;
  let draggedOverItem = null;
  
  function handleDragStart(event, item) {
    draggedItem = item;
    event.dataTransfer.effectAllowed = 'move';
  }
  
  function handleDragOver(event, item) {
    event.preventDefault();
    draggedOverItem = item;
  }
  
  function handleDrop(event) {
    event.preventDefault();
    
    if (draggedItem && draggedOverItem && draggedItem.id !== draggedOverItem.id) {
      const draggedIndex = formData.images.findIndex(img => img.id === draggedItem.id);
      const draggedOverIndex = formData.images.findIndex(img => img.id === draggedOverItem.id);
      
      // 配列の要素を入れ替え
      const newImages = [...formData.images];
      [newImages[draggedIndex], newImages[draggedOverIndex]] = 
        [newImages[draggedOverIndex], newImages[draggedIndex]];
      
      // sortOrderを更新
      newImages.forEach((img, index) => {
        img.sortOrder = index + 1;
      });
      
      formData.images = newImages;
    }
    
    draggedItem = null;
    draggedOverItem = null;
  }
</script>

<div class="grid grid-cols-4 gap-4">
  {#each formData.images as image}
    <div
      draggable="true"
      ondragstart={(e) => handleDragStart(e, image)}
      ondragover={(e) => handleDragOver(e, image)}
      ondrop={handleDrop}
      class="cursor-move border-2 border-transparent hover:border-primary transition-colors"
      class:border-primary={draggedOverItem?.id === image.id}
    >
      <img src={image.url} alt={image.alt} class="w-full h-32 object-cover" />
    </div>
  {/each}
</div>
```

## 2. パフォーマンス最適化テクニック

### 2.1 仮想スクロールの実装

```svelte
<script>
  import VirtualList from '@sveltejs/svelte-virtual-list';
  
  let items = $products;
  let itemHeight = 80; // 各アイテムの高さ
  
  // ビューポート内のアイテムのみレンダリング
  function ItemComponent({ item }) {
    return (
      <div class="flex items-center p-4 border-b">
        <img src={item.images[0]?.url} class="w-16 h-16 object-cover" />
        <div class="ml-4">
          <h3 class="font-semibold">{item.name}</h3>
          <p class="text-sm text-gray-600">¥{item.price.toLocaleString()}</p>
        </div>
      </div>
    );
  }
</script>

<div class="h-[600px] overflow-auto">
  <VirtualList 
    items={items} 
    itemHeight={itemHeight}
    let:item
  >
    <ItemComponent {item} />
  </VirtualList>
</div>
```

### 2.2 画像の遅延読み込み

```svelte
<script>
  import { onMount } from 'svelte';
  
  let imageElement;
  let isLoaded = $state(false);
  let isInView = $state(false);
  
  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            isInView = true;
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (imageElement) {
      observer.observe(imageElement);
    }
    
    return () => observer.disconnect();
  });
</script>

<div bind:this={imageElement} class="relative">
  {#if !isLoaded}
    <div class="skeleton w-full h-48"></div>
  {/if}
  
  {#if isInView}
    <img
      src={product.images[0]?.url}
      alt={product.images[0]?.alt}
      onload={() => isLoaded = true}
      class="w-full h-48 object-cover"
      class:opacity-0={!isLoaded}
      class:opacity-100={isLoaded}
      style="transition: opacity 0.3s"
    />
  {/if}
</div>
```

### 2.3 デバウンス検索の実装

```javascript
// utils/debounce.js
export function createDebouncer(delay = 300) {
  let timeoutId;
  
  return function debounce(callback) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
}

// 使用例
<script>
  import { createDebouncer } from './utils/debounce.js';
  
  const searchDebouncer = createDebouncer(500);
  let searchTerm = $state('');
  
  $effect(() => {
    searchDebouncer(() => {
      updateFilter('search', searchTerm);
    });
  });
</script>
```

## 3. エラーハンドリングとユーザーフィードバック

### 3.1 統一的なエラーハンドリング

```javascript
// stores/notificationStore.js
import { writable } from 'svelte/store';

function createNotificationStore() {
  const { subscribe, update } = writable([]);
  
  return {
    subscribe,
    
    show(message, type = 'info', duration = 5000) {
      const id = Date.now();
      const notification = { id, message, type };
      
      update(notifications => [...notifications, notification]);
      
      if (duration > 0) {
        setTimeout(() => this.dismiss(id), duration);
      }
      
      return id;
    },
    
    dismiss(id) {
      update(notifications => 
        notifications.filter(n => n.id !== id)
      );
    },
    
    // 便利なヘルパーメソッド
    success(message) {
      return this.show(message, 'success');
    },
    
    error(message) {
      return this.show(message, 'error', 0); // エラーは自動で消えない
    },
    
    warning(message) {
      return this.show(message, 'warning');
    }
  };
}

export const notifications = createNotificationStore();
```

### 3.2 グローバルエラーハンドラー

```javascript
// api/errorHandler.js
import { notifications } from '../stores/notificationStore.js';

export function handleApiError(error, context = '') {
  console.error(`API Error ${context}:`, error);
  
  // エラーの種類に応じた処理
  if (error.response) {
    // サーバーエラー
    switch (error.response.status) {
      case 400:
        notifications.error('入力内容に誤りがあります');
        break;
      case 401:
        notifications.error('認証が必要です');
        // ログイン画面へリダイレクト
        break;
      case 403:
        notifications.error('この操作を実行する権限がありません');
        break;
      case 404:
        notifications.error('データが見つかりませんでした');
        break;
      case 500:
        notifications.error('サーバーエラーが発生しました');
        break;
      default:
        notifications.error('予期しないエラーが発生しました');
    }
  } else if (error.request) {
    // ネットワークエラー
    notifications.error('ネットワークエラーが発生しました');
  } else {
    // その他のエラー
    notifications.error(error.message || '予期しないエラーが発生しました');
  }
}
```

## 4. 実装時の注意点とベストプラクティス

### 4.1 メモリリークの防止

```svelte
<script>
  import { onDestroy } from 'svelte';
  
  // ストアのサブスクリプション管理
  const unsubscribers = [];
  
  // 手動サブスクリプション時は必ずクリーンアップ
  unsubscribers.push(
    products.subscribe(value => {
      // 処理
    })
  );
  
  // タイマーのクリーンアップ
  let intervalId = setInterval(() => {
    // 定期的な処理
  }, 1000);
  
  onDestroy(() => {
    // すべてのサブスクリプションを解除
    unsubscribers.forEach(unsub => unsub());
    
    // タイマーをクリア
    clearInterval(intervalId);
  });
</script>
```

### 4.2 アクセシビリティの実装

```svelte
<!-- キーボードナビゲーション対応 -->
<div
  role="button"
  tabindex="0"
  onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  onclick={handleClick}
  class="cursor-pointer"
>
  クリック可能な要素
</div>

<!-- ARIA属性の適切な使用 -->
<div
  role="status"
  aria-live="polite"
  aria-label="読み込み中"
>
  {#if isLoading}
    <span class="loading loading-spinner"></span>
    <span class="sr-only">データを読み込んでいます...</span>
  {/if}
</div>

<!-- フォームのアクセシビリティ -->
<form>
  <div class="form-control">
    <label for="product-name" class="label">
      <span class="label-text">
        商品名 <span aria-label="必須項目">*</span>
      </span>
    </label>
    <input
      id="product-name"
      type="text"
      required
      aria-required="true"
      aria-invalid={!!errors.name}
      aria-describedby={errors.name ? 'name-error' : undefined}
      class="input input-bordered"
    />
    {#if errors.name}
      <span id="name-error" class="text-error text-sm" role="alert">
        {errors.name}
      </span>
    {/if}
  </div>
</form>
```

### 4.3 テスト可能なコードの書き方

```javascript
// 依存性注入パターン
export function createProductService(apiClient) {
  return {
    async fetchProducts(filters) {
      // テスト時にモックを注入可能
      const response = await apiClient.products.list(filters);
      return response.data;
    },
    
    async createProduct(data) {
      // ビジネスロジックを分離
      const validatedData = this.validateProductData(data);
      return await apiClient.products.create(validatedData);
    },
    
    // 純粋関数として実装（テストしやすい）
    validateProductData(data) {
      const errors = [];
      
      if (!data.name || data.name.trim() === '') {
        errors.push('商品名は必須です');
      }
      
      if (data.price < 0) {
        errors.push('価格は0以上である必要があります');
      }
      
      if (errors.length > 0) {
        throw new ValidationError(errors);
      }
      
      return {
        ...data,
        name: data.name.trim(),
        updatedAt: new Date().toISOString()
      };
    }
  };
}
```

## 5. 本番環境への移行ガイド

### 5.1 環境変数の設定

```javascript
// .env.production
VITE_API_BASE_URL=https://api.example.com/v1
VITE_UPLOAD_MAX_SIZE=10485760
VITE_ENABLE_ANALYTICS=true

// vite.config.js
export default defineConfig({
  plugins: [sveltekit()],
  define: {
    'import.meta.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString()),
  }
});
```

### 5.2 ビルド最適化

```javascript
// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    // チャンク分割の最適化
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['svelte', '@sveltejs/kit'],
          'ui': ['tailwindcss', 'daisyui'],
        }
      }
    },
    // ビルドサイズの最適化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

### 5.3 セキュリティ対策

```javascript
// hooks.server.js
export async function handle({ event, resolve }) {
  // CSRFトークンの検証
  if (event.request.method !== 'GET') {
    const token = event.request.headers.get('X-CSRF-Token');
    if (!validateCsrfToken(token)) {
      return new Response('Invalid CSRF token', { status: 403 });
    }
  }
  
  // セキュリティヘッダーの追加
  const response = await resolve(event);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}
```

## まとめ

このガイドは、ECサイト商品管理システムの実装において重要なパターンとテクニックを網羅しています。AI駆動開発においては、これらのコードサンプルを参考に、プロジェクトの要件に応じてカスタマイズしてください。

重要なのは：
1. **一貫性のあるコーディングスタイル**を維持する
2. **再利用可能なコンポーネント**を設計する
3. **パフォーマンス**を常に意識する
4. **エラーハンドリング**を適切に実装する
5. **テスト可能な構造**を保つ

これらの原則に従うことで、保守性が高く、拡張可能なアプリケーションを構築できます。