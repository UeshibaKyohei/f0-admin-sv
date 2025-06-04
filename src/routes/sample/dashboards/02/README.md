# プロジェクト管理ダッシュボード

## 概要

このダッシュボードは、プロジェクトマネージャーやチームリーダーがプロジェクトの進捗状況、チームの稼働状況、タスクの管理を一元的に行うためのツールです。複数のビューモード（概要、タイムライン、かんばん）を提供し、効率的なプロジェクト管理を支援します。

## 機能一覧

### 主要機能

1. **プロジェクト概要ビュー**

   - プロジェクト統計カード（進行中/完了/遅延プロジェクト数）
   - チーム稼働状況の可視化
   - マイルストーン進捗追跡

2. **タイムラインビュー**

   - ガントチャート風のタスク表示
   - 依存関係の可視化
   - 進捗状況のリアルタイム更新

3. **かんばんビュー**
   - ドラッグ&ドロップによるタスク移動
   - ステータス別タスク管理
   - 視覚的な作業フロー

### 詳細機能

#### プロジェクト選択

- 全プロジェクト表示
- 個別プロジェクト絞り込み
- リアルタイムフィルタリング

#### データエクスポート

- CSV/PDF形式でのデータ出力
- カスタマイズ可能なレポート生成
- モックモードでは機能を無効化

#### レスポンシブデザイン

- モバイル対応UI
- タブレット最適化
- デスクトップフル機能

## アーキテクチャ

### ファイル構成

```
02/
├── +page.svelte              # メインページ
├── config.js                 # 設定ファイル
├── services/
│   ├── dataService.js        # データ抽象化レイヤー（名前付きエクスポート）
│   └── mockDataService.js    # モックデータサービス（名前付きエクスポート）
├── ProjectOverview.svelte    # プロジェクト概要コンポーネント
├── GanttTimeline.svelte      # ガントチャートコンポーネント
├── TeamWorkload.svelte       # チーム稼働状況コンポーネント
├── TaskKanban.svelte         # かんばんボードコンポーネント
├── MilestoneTracker.svelte   # マイルストーン追跡コンポーネント
└── README.md                 # このファイル
```

### データフロー

1. メインページ（+page.svelte）がデータサービスを呼び出し
2. dataService.js が config.USE_MOCK_DATA に基づいて処理を分岐
3. モックモードでは mockDataService.js からデータを取得（名前付きインポート）
4. 本番モードでは実際のAPIエンドポイントを呼び出し
5. 取得したデータを各コンポーネントに props として渡す

### データマッピングレイヤー

mockDataService.js では、データベーススキーマとコンポーネントの期待する形式の間でデータ変換を実行：

#### チームワークロードデータ変換

```javascript
// データベーススキーマ → コンポーネント期待形式
{
  user_name: "田中 太郎"                    → name: "田中 太郎"
  current_workload_percentage: 85          → allocated: 85
  assigned_tasks_count: 3                  → tasks: 3
}
```

#### プロジェクトメトリクス追加データ

```javascript
// 修正後に追加されたフィールド
{
  overdueTasks: number,      // 遅延タスク数
  totalMembers: number,      // 総メンバー数
  averageProgress: number    // 平均進捗率
}
```

#### かんばんデータ構造

```javascript
// 配列形式から オブジェクト形式に変更
// 変更前: tasks = [...]
// 変更後: kanbanData = { todo: [...], in_progress: [...], review: [...], done: [...] }
```

## データベース設計

### 主要テーブル

#### projects テーブル

```sql
CREATE TABLE projects (
    project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name VARCHAR(200) NOT NULL,
    description TEXT,
    status project_status NOT NULL DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    owner_id UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE project_status AS ENUM (
    'planning', 'active', 'on_hold', 'completed', 'cancelled'
);
```

#### tasks テーブル

```sql
CREATE TABLE tasks (
    task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    task_name VARCHAR(200) NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'todo',
    priority task_priority NOT NULL DEFAULT 'medium',
    assignee_id UUID REFERENCES users(user_id),
    start_date DATE,
    due_date DATE,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2) DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');
```

#### team_members テーブル

```sql
CREATE TABLE team_members (
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    role team_role NOT NULL,
    hourly_rate DECIMAL(8,2),
    capacity_hours_per_week INTEGER DEFAULT 40,
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (project_id, user_id)
);

CREATE TYPE team_role AS ENUM (
    'project_manager', 'developer', 'designer', 'tester', 'analyst'
);
```

## API仕様

### エンドポイント一覧

- `GET /api/projects` - プロジェクト一覧取得
- `GET /api/projects/metrics` - 全プロジェクトメトリクス
- `GET /api/projects/{projectId}/metrics` - 個別プロジェクトメトリクス
- `GET /api/team-members/workload?projectId={projectId}` - チーム稼働状況
- `GET /api/milestones?projectId={projectId}` - マイルストーン一覧
- `GET /api/gantt-data?projectId={projectId}&viewMode={viewMode}` - ガントデータ
- `GET /api/tasks/kanban?projectId={projectId}` - かんばん用タスク取得
- `PATCH /api/tasks/{taskId}/status` - タスクステータス更新

### データサービス関数

#### 名前付きエクスポート関数

すべてのデータサービス関数は名前付きエクスポートを使用：

```javascript
// dataService.js - 抽象化レイヤー
export async function getProjects(params = {})
export async function getProjectMetrics(projectId = 'all')
export async function getTeamWorkload(projectId = 'all')
export async function getMilestones(projectId = 'all')
export async function getGanttData(projectId = 'all', viewMode = 'month')
export async function getKanbanTasks(projectId = 'all')
export async function updateTaskStatus(taskId, newStatus, newPosition = null)

// mockDataService.js - モックデータ提供
export function getProjects(params = {})
export function getProjectMetrics(projectId = 'all')
export function getTeamWorkload(projectId = 'all')
// ... その他の関数
```

## カスタマイズガイド

### 1. モック/本番モードの切り替え

**config.js**

```javascript
export const config = {
	USE_MOCK_DATA: true, // 本番環境では false に設定

	API_ENDPOINTS: {
		PROJECTS: '/api/projects',
		TASKS: '/api/tasks',
		TEAM_MEMBERS: '/api/team-members',
		MILESTONES: '/api/milestones',
		GANTT_DATA: '/api/gantt-data'
	},

	REFRESH_INTERVALS: {
		PROJECT_STATUS: 30000, // 30秒
		TEAM_WORKLOAD: 60000, // 1分
		MILESTONES: 60000, // 1分
		TASKS: 30000 // 30秒
	},

	KANBAN_COLUMNS: [
		{ id: 'todo', name: '未着手', color: 'base-300' },
		{ id: 'in_progress', name: '進行中', color: 'info' },
		{ id: 'review', name: 'レビュー', color: 'warning' },
		{ id: 'done', name: '完了', color: 'success' }
	]
};
```

### 2. 新しいビューモードの追加

1. `+page.svelte` の viewMode に新しい値を追加
2. 対応するコンポーネントを作成
3. データサービスに必要なAPIを追加

### 3. カスタムメトリクスの追加

**ProjectOverview.svelte** をカスタマイズして新しい統計を表示：

- `getProjectMetrics` 関数が返すデータに新しい項目を追加
- mockDataService.js の計算ロジックを更新

### 4. かんばんカラムのカスタマイズ

**config.js** の `config.KANBAN_COLUMNS` を編集してカラムを追加・変更：

```javascript
KANBAN_COLUMNS: [
	{ id: 'todo', name: '未着手', color: 'base-300' },
	{ id: 'in_progress', name: '進行中', color: 'info' },
	{ id: 'review', name: 'レビュー', color: 'warning' },
	{ id: 'done', name: '完了', color: 'success' }
];
```

## 実装のポイント

### Svelte 5 runes の活用

```javascript
// リアクティブな状態管理
let selectedProject = $state('all');
let viewMode = $state('overview');

// 派生値の計算
const filteredTasks = $derived(
	tasks.filter((task) => selectedProject === 'all' || task.project_id === selectedProject)
);
```

### 名前付きインポートの使用

```javascript
// ✅ 正しい実装
import { getProjects, getProjectMetrics, getTeamWorkload } from './services/dataService.js';
import * as mockDataService from './mockDataService.js';

// ❌ 使用しない（デフォルトエクスポートではない）
import dataService from './services/dataService.js';
```

### データマッピングの実装

```javascript
// mockDataService.js - チームワークロードデータの変換
export function getTeamWorkload(projectId = 'all') {
	const workloadData = members.map((member) => {
		return {
			...member,
			name: member.user_name, // user_name → name への変換
			allocated: member.current_workload_percentage, // current_workload_percentage → allocated への変換
			tasks: assignedTasks.length,
			workload_status:
				member.current_workload_percentage >= 100
					? 'overload'
					: member.current_workload_percentage >= 80
						? 'high'
						: 'normal'
		};
	});
	return Promise.resolve(workloadData);
}
```

### 設定値の参照

```javascript
// ✅ 正しい実装
const interval = setInterval(loadOverview, config.REFRESH_INTERVALS.PROJECT_STATUS);

// ❌ 古い実装（更新前）
const interval = setInterval(loadOverview, config.refreshInterval.projectStatus);
```

### DaisyUI v5 コンポーネントの使用

- グリッドレイアウト: `grid grid-cols-12 gap-4`
- カード: `card bg-base-100 shadow-sm`
- ボタングループ: `btn-group btn-group-sm`
- アバター: `avatar placeholder`、`bg-neutral text-neutral-content rounded-full`

### エラーハンドリング

```javascript
try {
	const data = await getProjects();
	projects = data;
} catch (error) {
	console.error('Failed to load projects:', error);
	error = error.message; // UI表示用
}
```

## パフォーマンス最適化

1. **データキャッシュ**: 頻繁にアクセスするデータのキャッシュ
2. **遅延ローディング**: 大きなコンポーネントの遅延読み込み
3. **デバウンス処理**: 高頻度の更新処理の最適化
4. **仮想化**: 大量データの効率的な表示

## トラブルシューティング

### よくある問題と解決方法

1. **インポートエラー: "does not provide an export named"**

   ```javascript
   // ❌ 原因: デフォルトインポートを使用
   import dataService from './services/dataService.js';

   // ✅ 解決: 名前付きインポートを使用
   import { getProjects, getProjectMetrics } from './services/dataService.js';
   ```

2. **"Cannot read properties of undefined (reading 'slice')"**

   ```javascript
   // ❌ 原因: データマッピングの不備
   user_name プロパティが name として変換されていない

   // ✅ 解決: mockDataService.js でデータマッピングを実装
   name: member.user_name,  // user_name → name への変換
   ```

3. **設定値が undefined エラー**

   ```javascript
   // ❌ 原因: 古い設定パスの使用
   config.refreshInterval.projectStatus;

   // ✅ 解決: 正しい設定パスを使用
   config.REFRESH_INTERVALS.PROJECT_STATUS;
   ```

4. **データが表示されない**

   - ネットワークタブでAPIレスポンスを確認
   - config.USE_MOCK_DATA の設定を確認
   - コンソールでエラーログを確認

5. **ドラッグ&ドロップが動作しない**

   - ブラウザのHTML5 Drag API対応を確認
   - イベントハンドラーの設定を確認
   - かんばんデータの構造を確認（オブジェクト形式か配列形式か）

6. **レスポンシブデザインの問題**
   - Tailwind CSS のブレークポイントを確認
   - DaisyUI のグリッドシステムの使用方法を確認

## 今後の拡張

- リアルタイム通知機能
- 高度なレポート機能
- AI による進捗予測
- モバイルアプリ対応

---

このREADMEは、AI駆動開発において本ダッシュボードを理解・拡張するための包括的なガイドです。
