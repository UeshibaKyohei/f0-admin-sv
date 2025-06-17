# タスク管理システム - 実装ガイド

## 概要

このディレクトリには、マーケティングエージェンシー向けのタスク管理システムの実装例が含まれています。
実際の業務フローを想定し、中規模企業での利用に適したUI/UXを提供します。

## 想定事業

### マーケティングエージェンシー（従業員30-80名）

**部門構成:**
- アカウント管理チーム：クライアント対応、提案活動
- クリエイティブチーム：デザイン、コピーライティング
- デジタルマーケティングチーム：広告運用、SNS管理
- ストラテジーチーム：戦略立案、データ分析
- プロダクションチーム：制作進行管理

## 主要機能

### 1. カンバンボード
- ドラッグ&ドロップによる直感的なタスク管理
- ステータス：Backlog → To Do → In Progress → Review → Done
- タスクカードには担当者、期限、優先度、タグを表示

### 2. ガントチャート
- キャンペーン全体のタイムライン可視化
- タスク間の依存関係表示
- リソース配分の最適化

### 3. AI支援機能
- タスクの曖昧さを検出し、詳細化を提案
- 過去の類似案件から工数を自動見積もり
- 季節性やトレンドを考慮したタスク提案

### 4. ゲーミフィケーション
- ポイント制度：期限遵守、品質評価で獲得
- バッジシステム：各種アチーブメント
- チームチャレンジ：部門対抗の生産性向上

## データモデル

### Task（タスク）
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignees: string[];
  dueDate: Date;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  clientId: string;
  campaignId: string;
  dependencies: string[]; // 他のタスクID
  attachments: Attachment[];
  comments: Comment[];
  aiSuggestions: AISuggestion[];
  points: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Campaign（キャンペーン）
```typescript
interface Campaign {
  id: string;
  name: string;
  clientId: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  status: 'planning' | 'active' | 'completed' | 'archived';
  goals: string[];
  kpis: KPI[];
}
```

### User（ユーザー）
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  avatar: string;
  level: number;
  totalPoints: number;
  badges: Badge[];
  currentStreak: number;
}
```

## 実装パターン

### 01/ - 基本実装
- カンバンボードを中心としたタスク管理
- 基本的なフィルタリング・ソート機能
- シンプルなポイント制度

### 02/ - 高度な実装（将来的な拡張）
- ガントチャートビュー
- AI補完機能
- 高度なゲーミフィケーション

## UI/UXガイドライン

### デザイン原則
1. **視認性**: 情報の優先度を明確に
2. **効率性**: 最小限のクリックでタスク操作
3. **楽しさ**: ゲーミフィケーション要素で動機付け
4. **柔軟性**: 様々な働き方に対応

### カラースキーム
- DaisyUIのテーマカラーを基本とする
- 優先度に応じた色分け（urgent: error, high: warning, medium: info, low: neutral）
- 部門ごとのアクセントカラー

### レスポンシブ対応
- モバイル：タスクリスト中心のシンプルビュー
- タブレット：カンバンボードの省スペース表示
- デスクトップ：全機能フル表示

## 技術的な実装詳細

### ストア設計
- `taskStore.js`: タスクデータの管理
- `userStore.js`: ユーザー情報とゲーミフィケーションデータ
- `uiStore.js`: UI状態（フィルター、表示設定など）

### コンポーネント構成
- `TaskBoard.svelte`: カンバンボードのメインコンポーネント
- `TaskCard.svelte`: 個別タスクの表示
- `TaskModal.svelte`: タスク詳細・編集
- `AIAssistant.svelte`: AI提案機能
- `GameificationPanel.svelte`: ポイント・バッジ表示

### パフォーマンス考慮
- 仮想スクロールによる大量タスクの効率的表示
- 楽観的更新によるスムーズなUX
- デバウンスされた自動保存

## デモデータ

実際のマーケティングエージェンシーの業務を想定した、リアルなデモデータを用意：
- 3つのアクティブなキャンペーン
- 50-100個のタスク（様々なステータス）
- 15名のチームメンバー
- 過去の完了タスクによる実績データ