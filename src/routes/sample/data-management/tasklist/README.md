# タスク管理システム - AI駆動開発リファレンス

> **重要**: このドキュメントはAI駆動開発のためのリファレンスです。AIがこのアプリケーションを理解し、流用・改良・本実装を行う際の完全なガイドです。

## 📋 目次

- [概要](#概要)
- [クイックスタート](#クイックスタート)
- [アーキテクチャ](#アーキテクチャ)
- [データベース設計](#データベース設計)
- [機能詳細](#機能詳細)
- [設定とカスタマイズ](#設定とカスタマイズ)
- [本実装への移行](#本実装への移行)
- [開発者向けTips](#開発者向けtips)
- [トラブルシューティング](#トラブルシューティング)

## 概要

### 🎯 プロジェクトの目的

このタスク管理システムは、中規模企業（30-80名）向けのプロジェクト管理ツールです。特にマーケティングエージェンシーの業務フローを想定していますが、設定により他業界にも対応可能です。

### ✨ 主な特徴

- **多業界対応**: マーケティングエージェンシー、ソフトウェア開発、コンサルティング等
- **完全なモック機能**: LocalStorageベースで動作、本実装時は簡単にAPI切り替え可能
- **ゲーミフィケーション**: ポイント制度、バッジシステム、リーダーボード
- **リアルタイム協作**: ドラッグ&ドロップによる直感的操作
- **レスポンシブ対応**: モバイル・タブレット・デスクトップ完全対応

### 🏢 想定業界と組織構成

#### マーケティングエージェンシー（デフォルト）
- アカウント管理、クリエイティブ、デジタルマーケティング、ストラテジー、プロダクション

#### ソフトウェア開発会社
- フロントエンド、バックエンド、DevOps、QA、プロダクトマネジメント

#### コンサルティング会社
- 戦略コンサルティング、オペレーション、財務、人事、IT

## クイックスタート

### 🚀 即座に体験する

```bash
# 現在のディレクトリで既に動作しています
# ブラウザで http://localhost:5173 にアクセス
```

### ⚙️ 設定の変更

```javascript
// config.js で業界を変更
export const config = {
  INDUSTRY_TYPE: 'software_dev', // 'marketing_agency', 'consulting'
  // ... その他の設定
};
```

### 🔄 本実装モードへの切り替え

```javascript
// 本実装時は以下を実行
import { enableProductionMode } from './api/serviceFactory';
enableProductionMode();
```

## アーキテクチャ

### 📁 ファイル構成

```
tasklist/
├── README.md                  # このファイル
├── config.js                  # 設定ファイル（業界、フラグ管理）
├── types.ts                   # TypeScript型定義とRDBスキーマ
├── +page.svelte               # メインページ
├── TaskBoard.svelte           # カンバンボード
├── GameificationPanel.svelte  # ゲーミフィケーション
├── api/
│   ├── dataService.ts         # データサービスインターフェース
│   ├── localStorageService.ts # LocalStorage実装（モック用）
│   ├── apiService.ts          # REST API実装（本実装用）
│   └── serviceFactory.ts     # サービス選択ファクトリ
├── stores/
│   ├── taskStore.ts           # タスクデータ管理
│   └── uiStore.ts             # UI状態管理
└── mockData.ts                # デモデータ生成
```

### 🔧 技術スタック

- **フロントエンド**: Svelte 5 + SvelteKit 2.16+
- **UI**: DaisyUI 5.0.37+ + Tailwind CSS 4.1.7+
- **状態管理**: Svelte Stores
- **型安全性**: TypeScript 5.0+
- **データ永続化**: LocalStorage（モック）/ REST API（本実装）

### 📊 データフロー

```
[UI Components] ↔ [Svelte Stores] ↔ [Service Factory] → [LocalStorage | API]
                                                          ↓
                                                      [RDB Tables]
```

## データベース設計

### 🗄️ 主要テーブル

#### tasks テーブル
```sql
CREATE TABLE tasks (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('backlog', 'todo', 'in_progress', 'review', 'done') NOT NULL,
  priority ENUM('urgent', 'high', 'medium', 'low') NOT NULL,
  due_date DATETIME NOT NULL,
  estimated_hours DECIMAL(5,2) DEFAULT 0,
  actual_hours DECIMAL(5,2) DEFAULT 0,
  client_id VARCHAR(50) NOT NULL,
  campaign_id VARCHAR(50) NOT NULL,
  points INT DEFAULT 0,
  sort_order INT DEFAULT 0, -- カンバンボード用並び順
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date),
  INDEX idx_sort_order (sort_order)
);
```

#### task_assignees テーブル（多対多）
```sql
CREATE TABLE task_assignees (
  task_id VARCHAR(50),
  user_id VARCHAR(50),
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (task_id, user_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### campaigns テーブル
```sql
CREATE TABLE campaigns (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  client_id VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(12,2) DEFAULT 0,
  status ENUM('planning', 'active', 'completed', 'archived') NOT NULL,
  color VARCHAR(7) DEFAULT '#000000',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients(id)
);
```

#### users テーブル
```sql
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- 本実装時に追加
  department VARCHAR(100) NOT NULL,
  role VARCHAR(100) NOT NULL,
  avatar VARCHAR(10) DEFAULT '?',
  avatar_url VARCHAR(500), -- 本実装時に追加
  level INT DEFAULT 1,
  total_points INT DEFAULT 0,
  weekly_points INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  max_streak INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 🔗 リレーション図

```
clients (1) ──────── (n) campaigns (1) ──────── (n) tasks
                                                    │
                                                    │ (多対多)
                                                    │
users (n) ──────────────────── (n) task_assignees ┘

users (1) ────── (n) user_badges (n) ────── (1) badges
```

### 📝 データ連動説明

| 表示要素 | 関連テーブル | 注意点 |
|---------|-------------|-------|
| カンバンボード | tasks, task_assignees, users | sort_orderで並び順管理 |
| タスクカード | tasks, campaigns, clients | clientNameは正規化で取得 |
| アサイン表示 | task_assignees, users | アバター文字はusers.avatar |
| リーダーボード | users, tasks, task_assignees | weekly_pointsで集計 |
| プロジェクト絞り込み | campaigns, tasks | campaign_idで絞り込み |

## 機能詳細

### 🎯 カンバンボード

**実装ファイル**: `TaskBoard.svelte`, `TaskCard.svelte`

**主要機能**:
- ドラッグ&ドロップによるステータス変更
- 同一ステータス内での並び替え（sort_order更新）
- リアルタイムフィルタリング
- 無限スクロール対応（大量タスク）

**技術的ポイント**:
```javascript
// 並び替え実装のコア
async function reorderTasksInStatus(status, taskId, targetIndex) {
  // tasks配列の順序を変更
  // dataService.setTasks()でバッチ更新
  // sort_orderをRDB保存時に更新
}
```

**カスタマイズポイント**:
- `STATUS_CONFIG`でステータス追加・変更
- `MAX_TASKS_PER_COLUMN`で性能調整
- ドラッグ無効化は`draggable="false"`

### 🎮 ゲーミフィケーション

**実装ファイル**: `GameificationPanel.svelte`

**主要機能**:
- ポイント制度（タスク完了時加算）
- バッジシステム（アチーブメント）
- 週間リーダーボード
- ストリーク（連続日数）管理

**ポイント計算ロジック**:
```javascript
// config.js で設定
POINTS_PER_TASK_COMPLETION: 10,  // ベースポイント
BONUS_MULTIPLIER_URGENT: 1.5,    // 緊急度ボーナス

// タスク完了時
const points = basePoints * priorityMultiplier;
await updateUser(userId, { 
  totalPoints: user.totalPoints + points,
  weeklyPoints: user.weeklyPoints + points 
});
```

**無効化方法**:
```javascript
// config.js
FEATURE_GAMIFICATION: false  // 完全に非表示
```

### 📅 カレンダービュー

**実装ファイル**: `TaskCalendar.svelte`

**主要機能**:
- 月間カレンダー表示
- 期限日別タスク表示
- タイトル長制限（15文字、省略表示）
- 優先度による色分け

**カスタマイズ例**:
```javascript
// タイトル表示文字数変更
function truncateTitle(title, maxLength = 20) {
  return title.length <= maxLength ? title : title.substring(0, maxLength) + '...';
}
```

### 🔍 フィルタリング・検索

**実装ファイル**: `FilterPanel.svelte`, `stores/taskStore.ts`

**フィルター種類**:
- ステータス（複数選択）
- 優先度（複数選択）
- 担当者（複数選択）
- タグ（複数選択）
- キャンペーン（複数選択）
- 期限日範囲

**実装のコア**:
```javascript
export const filteredTasks = derived(
  [tasks, filterOptions, viewSettings],
  ([$tasks, $filterOptions, $viewSettings]) => {
    let filtered = [...$tasks];
    
    // 各フィルター適用
    if ($filterOptions.status.length > 0) {
      filtered = filtered.filter(task => 
        $filterOptions.status.includes(task.status)
      );
    }
    
    // ソート（手動ソート時はスキップ）
    if ($viewSettings.sortBy !== 'manual') {
      // 自動ソート処理
    }
    
    return filtered;
  }
);
```

## 設定とカスタマイズ

### ⚙️ config.js 設定項目

```javascript
export const config = {
  // === モック機能制御 ===
  FEATURE_MOCK_DATA: true,           // デモデータ使用
  FEATURE_GAMIFICATION: true,        // ゲーミフィケーション表示
  FEATURE_AI_SUGGESTIONS: false,     // AI機能（未実装）
  FEATURE_DEMO_MODE: true,           // デモ用バッジ表示
  
  // === 実装切り替え ===
  USE_LOCAL_STORAGE: true,           // true: LocalStorage, false: API
  API_BASE_URL: 'http://localhost:8000',
  API_TIMEOUT: 10000,
  
  // === 業界・組織設定 ===
  INDUSTRY_TYPE: 'marketing_agency', // 'software_dev', 'consulting'
  ORGANIZATION_NAME: 'サンプル組織',
  
  // === UI設定 ===
  MAX_TASKS_PER_COLUMN: 50,          // カンバン列最大タスク数
  DEFAULT_ITEMS_PER_PAGE: 10,        // ページング
  
  // === ゲーミフィケーション ===
  POINTS_PER_TASK_COMPLETION: 10,
  BONUS_MULTIPLIER_URGENT: 1.5,
  ACHIEVEMENT_CHECK_INTERVAL: 5000,
  
  // === デバッグ ===
  DEBUG_DRAG_DROP: false,
  DEBUG_API_CALLS: false,
  SHOW_DEV_TOOLS: true
};
```

### 🎨 業界別カスタマイズ

#### 新業界追加例：製造業
```javascript
// config.js の DEPARTMENTS に追加
manufacturing: {
  design: { name: '設計部', color: 'primary' },
  production: { name: '製造部', color: 'secondary' },
  quality: { name: '品質管理', color: 'accent' },
  sales: { name: '営業部', color: 'info' },
  logistics: { name: '物流部', color: 'warning' }
}
```

#### 使用方法
```javascript
// 設定変更
config.INDUSTRY_TYPE = 'manufacturing';

// UI表示も自動更新
getDepartmentDisplayName() // → "製造業版"
```

### 🔧 コンポーネントカスタマイズ

#### タスクカードのカスタマイズ
```svelte
<!-- TaskCard.svelte -->
<script>
  import { config } from './config.js';
  
  // 業界別の表示制御
  $: showClientInfo = config.INDUSTRY_TYPE === 'marketing_agency';
  $: showProjectCode = config.INDUSTRY_TYPE === 'software_dev';
</script>

<div class="card">
  {#if showClientInfo}
    <div class="client-badge">{task.clientName}</div>
  {/if}
  
  {#if showProjectCode}
    <div class="project-code">{task.projectCode}</div>
  {/if}
</div>
```

## 本実装への移行

### 🚀 ステップバイステップ移行手順

#### Step 1: バックエンドAPI準備
```bash
# 想定API実装（例：Laravel、FastAPI、Node.js等）
POST   /api/v1/tasks              # タスク作成
GET    /api/v1/tasks              # タスク一覧
GET    /api/v1/tasks/{id}         # タスク詳細
PATCH  /api/v1/tasks/{id}         # タスク更新
DELETE /api/v1/tasks/{id}         # タスク削除
PUT    /api/v1/tasks/batch        # バッチ更新（並び替え用）

GET    /api/v1/campaigns          # キャンペーン一覧
GET    /api/v1/users              # ユーザー一覧
GET    /api/v1/auth/me            # 現在ユーザー情報
```

#### Step 2: 環境変数設定
```javascript
// .env または config
API_BASE_URL=https://api.yourdomain.com
JWT_SECRET=your-jwt-secret
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

#### Step 3: 本実装モード有効化
```javascript
// アプリ起動時または設定画面で実行
import { enableProductionMode } from './api/serviceFactory';

// 一括切り替え
enableProductionMode();
```

#### Step 4: 認証機能追加
```javascript
// apiService.ts の getAuthToken() を実装
private getAuthToken(): string {
  return localStorage.getItem('jwt_token') || '';
}

// ログイン後
localStorage.setItem('jwt_token', response.token);
DataServiceFactory.resetService(); // サービス再初期化
```

### 🔄 段階的移行パターン

#### パターン A: 全機能一括移行
```javascript
// 一度にすべてAPI化
enableProductionMode();
```

#### パターン B: 機能別段階移行
```javascript
// タスクのみAPI化
config.USE_LOCAL_STORAGE = false;
config.FEATURE_GAMIFICATION = false; // ゲーミフィケーションは後回し

// 後でゲーミフィケーションも追加
config.FEATURE_GAMIFICATION = true;
```

#### パターン C: ハイブリッド運用
```javascript
// 重要データはAPI、キャッシュはLocalStorage
class HybridDataService implements DataService {
  async getTasks() {
    // APIから取得してLocalStorageにキャッシュ
    const apiTasks = await this.apiService.getTasks();
    localStorage.setItem('tasks_cache', JSON.stringify(apiTasks));
    return apiTasks;
  }
}
```

### ⚠️ 移行時の注意点

1. **データマイグレーション**
   ```sql
   -- LocalStorageからRDBへのデータ移行スクリプト例
   INSERT INTO tasks (id, title, status, ...) 
   SELECT * FROM json_table(?, '$[*]' COLUMNS (...));
   ```

2. **認証・認可**
   ```javascript
   // JWTトークン検証ミドルウェア必須
   // ユーザー権限に応じたデータフィルタリング
   ```

3. **パフォーマンス**
   ```javascript
   // ページネーション実装
   const { data, pagination } = await dataService.getTasks({
     page: 1,
     limit: 20,
     filters: filterOptions
   });
   ```

## 開発者向けTips

### 💡 実装で学んだベストプラクティス

#### Svelte 5 リアクティビティ
```javascript
// ❌ 配列の直接変更（UIが更新されない）
tasks.update(items => {
  items.push(newTask);
  return items; // 同じ参照
});

// ✅ 新しい配列を返す
tasks.update(items => [...items, newTask]);
```

#### ドラッグ&ドロップ最適化
```javascript
// ドラッグ中の視覚フィードバック
function handleDragOver(e, status, index) {
  e.preventDefault();
  const rect = e.currentTarget.getBoundingClientRect();
  const y = e.clientY - rect.top;
  const height = rect.height;
  
  // マウス位置で挿入位置を判定
  dragOverIndex = y < height / 2 ? index : index + 1;
}
```

#### 状態管理のパターン
```javascript
// シングルソース・オブ・トゥルース
export const taskStats = derived([tasks, currentUser], ([$tasks, $currentUser]) => {
  return {
    total: $tasks.length,
    completed: $tasks.filter(t => t.status === 'done').length,
    // 派生値はリアクティブに自動更新
  };
});
```

### 🛠️ デバッグテクニック

#### 1. 設定ベースのデバッグ
```javascript
// config.js
DEBUG_DRAG_DROP: true  // ドラッグ操作をコンソールログ

// 使用箇所
if (config.DEBUG_DRAG_DROP) {
  console.log('Drag started:', taskId, 'from:', sourceStatus, 'to:', targetStatus);
}
```

#### 2. 開発者ツール
```svelte
<!-- デバッグパネル（config.SHOW_DEV_TOOLS=trueで表示） -->
{#if config.SHOW_DEV_TOOLS}
  <div class="fixed bottom-4 right-4 bg-base-100 p-4 rounded shadow">
    <h3>Debug Info</h3>
    <p>Service: {DataServiceFactory.getCurrentServiceType()}</p>
    <p>Tasks: {$tasks.length}</p>
    <button onclick={() => dataService.resetData()}>Reset Data</button>
  </div>
{/if}
```

#### 3. API呼び出しログ
```javascript
// serviceFactory.ts
if (config.DEBUG_API_CALLS) {
  console.log(`🌐 API Call: ${method} ${url}`, data);
}
```

### 🎯 パフォーマンス最適化

#### 1. 大量データ対応
```javascript
// 仮想スクロール実装例
import { VirtualList } from 'svelte-virtual-list';

// 1000件以上のタスクも高速表示
{#if $tasks.length > 100}
  <VirtualList items={$filteredTasks} let:item>
    <TaskCard task={item} />
  </VirtualList>
{:else}
  {#each $filteredTasks as task}
    <TaskCard {task} />
  {/each}
{/if}
```

#### 2. デバウンス検索
```javascript
import { debounce } from 'lodash-es';

const debouncedFilter = debounce((searchTerm) => {
  filterOptions.update(f => ({ ...f, search: searchTerm }));
}, 300);
```

#### 3. 楽観的更新
```javascript
// UI即座更新 → API呼び出し → エラー時ロールバック
async function optimisticUpdate(taskId, updates) {
  // 1. UI即座更新
  tasks.update(items => 
    items.map(t => t.id === taskId ? { ...t, ...updates } : t)
  );
  
  try {
    // 2. API更新
    await dataService.updateTask(taskId, updates);
  } catch (error) {
    // 3. エラー時ロールバック
    tasks.update(items => 
      items.map(t => t.id === taskId ? originalTask : t)
    );
    showToast('更新に失敗しました', 'error');
  }
}
```

### 🧪 テスト戦略

#### 1. サービス層テスト
```javascript
// serviceFactory.test.js
import { DataServiceFactory } from './serviceFactory';

describe('DataServiceFactory', () => {
  it('should switch between LocalStorage and API service', () => {
    DataServiceFactory.switchService(true);
    expect(DataServiceFactory.getCurrentServiceType()).toBe('LocalStorage');
    
    DataServiceFactory.switchService(false);
    expect(DataServiceFactory.getCurrentServiceType()).toBe('ProductionAPI');
  });
});
```

#### 2. コンポーネントテスト
```javascript
// TaskBoard.test.js
import { render, fireEvent } from '@testing-library/svelte';
import TaskBoard from './TaskBoard.svelte';

test('should handle drag and drop', async () => {
  const { getByTestId } = render(TaskBoard);
  
  const taskCard = getByTestId('task-card-123');
  const todoColumn = getByTestId('column-todo');
  
  await fireEvent.dragStart(taskCard);
  await fireEvent.drop(todoColumn);
  
  // アサーション
});
```

## トラブルシューティング

### ❗ よくある問題と解決方法

#### 1. ドラッグ&ドロップが動作しない
```javascript
// 原因1: イベント伝播
function handleDragOver(e) {
  e.preventDefault();     // ✅ 必須
  e.stopPropagation();    // ✅ 追加
}

// 原因2: リアクティビティ
// ❌ 配列の直接変更
items.splice(index, 1);

// ✅ 新しい配列
items = items.filter((_, i) => i !== index);
```

#### 2. SSR エラー (localStorage)
```javascript
// 原因: サーバーサイドでlocalStorage未定義
// ✅ 解決策
const isClient = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

if (isClient) {
  localStorage.setItem(key, value);
}
```

#### 3. ゲーミフィケーション表示されない
```javascript
// config.js で確認
FEATURE_GAMIFICATION: true  // ✅ true必須
FEATURE_MOCK_DATA: true     // ✅ trueでデモデータ

// ユーザーデータ確認
console.log('Current user:', $currentUser);
console.log('Has badges:', $currentUser?.badges?.length);
```

#### 4. フィルターカウントが正しくない
```javascript
// 原因: dateRangeオブジェクトが常に存在
// ✅ 修正済み（+page.svelte）
Object.entries($filterOptions).filter(([key, v]) => {
  if (key === 'dateRange') {
    return v.start !== null || v.end !== null;
  }
  return Array.isArray(v) ? v.length > 0 : v;
}).length
```

#### 5. API切り替え時の認証エラー
```javascript
// 本実装時の認証ヘッダー確認
// apiService.ts
private getAuthToken(): string {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('認証トークンがありません');
  }
  return token;
}
```

### 🔍 デバッグフロー

1. **設定確認**: `console.log(config)` で全設定を出力
2. **データ確認**: `console.log($tasks, $currentUser)` でストア状態確認
3. **サービス確認**: `DataServiceFactory.getCurrentServiceType()` でサービス種別確認
4. **ネットワーク確認**: ブラウザDevToolsのNetworkタブでAPI呼び出し確認
5. **エラーログ**: `config.DEBUG_API_CALLS = true` で詳細ログ有効化

---

## 📞 サポート・コントリビューション

このドキュメントはAI駆動開発のリファレンスです。AIが継続的に改良・拡張していくことを想定しています。

### 更新履歴
- v1.0: 初版作成（モック機能完備）
- v1.1: 本実装移行ガイド追加
- v1.2: トラブルシューティング拡充

**重要**: AIが作業する際は、必ず現在のファイルパスを確認し、相対パスでドキュメントを更新してください。