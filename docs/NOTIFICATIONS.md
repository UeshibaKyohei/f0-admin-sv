# 通知システム仕様書

## 概要

F0 Admin SV の統合通知システムは、アプリケーション全体で発生する各種アラート・通知を一元管理し、ユーザーに適切なタイミングで情報を提供するシステムです。

## 基本設計思想

### 1. 統合性
- 全モジュールからの通知を一箇所で管理
- 統一されたインターフェースで通知を配信
- 複数の通知チャネル（デスクトップ、音声、メール）をサポート

### 2. 柔軟性
- モジュール別、優先度別の細かい設定が可能
- フィルタリングによる表示制御
- 拡張可能なメタデータ構造

### 3. ユーザビリティ
- 直感的な通知の分類と表示
- ワンクリックでの関連ページへの遷移
- 既読/未読管理

## データ構造

### 通知（Notification）

```typescript
interface Notification {
  id: string;                    // 一意識別子
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  title: string;                 // 通知タイトル
  message: string;               // 通知メッセージ
  sourceModule: string;          // 発生元モジュール
  sourceId?: string;             // 発生元の具体的なID
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;               // 既読フラグ
  createdAt: Date;               // 作成日時
  readAt?: Date;                 // 既読日時
  actionUrl?: string;            // アクション先URL
  actionLabel?: string;          // アクションボタンラベル
  data?: Record<string, any>;    // 追加メタデータ
}
```

### 通知設定（NotificationSettings）

```typescript
interface NotificationSettings {
  enableDesktopNotifications: boolean;     // デスクトップ通知有効化
  enableSoundNotifications: boolean;       // 音声通知有効化
  enableEmailNotifications: boolean;       // メール通知有効化
  priorities: {                            // 優先度別設定
    [key in Notification['priority']]: {
      desktop: boolean;
      sound: boolean;
      email: boolean;
    };
  };
  modules: {                               // モジュール別設定
    [module: string]: {
      enabled: boolean;
      desktop: boolean;
      sound: boolean;
      email: boolean;
    };
  };
}
```

## データベース設計

### notifications テーブル

```sql
CREATE TABLE notifications (
  id VARCHAR(255) PRIMARY KEY,
  type ENUM('info', 'success', 'warning', 'error', 'system') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  source_module VARCHAR(100) NOT NULL,
  source_id VARCHAR(255),
  priority ENUM('low', 'medium', 'high', 'critical') NOT NULL,
  user_id VARCHAR(255) NOT NULL,           -- 通知対象ユーザー
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  action_url VARCHAR(500),
  action_label VARCHAR(100),
  data JSON,                               -- 追加メタデータ
  expires_at TIMESTAMP NULL,               -- 通知の有効期限
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_module_priority (source_module, priority),
  INDEX idx_unread (user_id, is_read, created_at)
);
```

### notification_settings テーブル

```sql
CREATE TABLE notification_settings (
  user_id VARCHAR(255) PRIMARY KEY,
  enable_desktop BOOLEAN DEFAULT TRUE,
  enable_sound BOOLEAN DEFAULT TRUE,
  enable_email BOOLEAN DEFAULT FALSE,
  settings JSON,                           -- 詳細設定（priorities、modulesなど）
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### notification_channels テーブル（配信ログ）

```sql
CREATE TABLE notification_channels (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  notification_id VARCHAR(255) NOT NULL,
  channel_type ENUM('desktop', 'sound', 'email', 'push') NOT NULL,
  status ENUM('pending', 'sent', 'failed') NOT NULL,
  sent_at TIMESTAMP NULL,
  error_message TEXT NULL,
  metadata JSON,
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  INDEX idx_notification_channel (notification_id, channel_type)
);
```

## API 設計

### REST API エンドポイント

#### 通知取得
```
GET /api/notifications
Query Parameters:
  - page: number (デフォルト: 1)
  - limit: number (デフォルト: 20, 最大: 100)
  - type: string[] (フィルター: タイプ)
  - priority: string[] (フィルター: 優先度)
  - module: string[] (フィルター: モジュール)
  - is_read: boolean (フィルター: 既読状態)
  - since: ISO 8601 string (指定日時以降)
```

#### 通知既読
```
PATCH /api/notifications/:id/read
```

#### 一括既読
```
PATCH /api/notifications/read-all
```

#### 通知削除
```
DELETE /api/notifications/:id
```

#### 通知作成（システム内部用）
```
POST /api/notifications
Body: {
  type: string,
  title: string,
  message: string,
  sourceModule: string,
  sourceId?: string,
  priority: string,
  actionUrl?: string,
  actionLabel?: string,
  data?: object,
  userIds: string[] // 通知対象ユーザー
}
```

### WebSocket イベント

リアルタイム通知配信用

```typescript
// 新しい通知
socket.emit('notification:new', notification);

// 通知更新（既読など）
socket.emit('notification:updated', { id, changes });

// 通知削除
socket.emit('notification:deleted', { id });
```

## モジュール統合方法

### 1. 通知の送信

各モジュールから通知を送信する際の推奨パターン：

```typescript
import { notificationActions } from '$lib/stores/notifications';

// 例：在庫不足警告
const sendInventoryAlert = (item: InventoryItem) => {
  notificationActions.add({
    type: 'warning',
    title: '在庫不足警告',
    message: `${item.name} の在庫が${item.threshold}個を下回りました`,
    sourceModule: 'inventory',
    sourceId: item.id,
    priority: 'high',
    isRead: false,
    actionUrl: `/inventory/items/${item.id}`,
    actionLabel: '在庫確認',
    data: {
      itemName: item.name,
      currentStock: item.stock,
      threshold: item.threshold
    }
  });
};
```

### 2. モジュール別通知タイプ

#### 在庫管理（inventory）
- `warning`: 在庫不足、期限切れ間近
- `error`: 在庫データエラー
- `info`: 入庫完了、出庫完了

#### 売上管理（sales）
- `success`: 新規注文、売上目標達成
- `warning`: 売上低下、返品発生
- `error`: 決済エラー

#### ユーザー管理（user-management）
- `info`: 新規登録、プロフィール更新
- `warning`: 不審なアクティビティ
- `error`: 認証エラー

#### システム（system）
- `system`: メンテナンス予告、システム更新
- `error`: システムエラー、サービス停止
- `success`: メンテナンス完了

#### セキュリティ（security）
- `warning`: 不正ログイン試行、権限変更
- `error`: セキュリティ違反検知
- `critical`: 重大なセキュリティインシデント

## フロントエンド実装

### 通知表示コンポーネント

```svelte
<!-- NotificationDropdown.svelte -->
<script>
  import { unreadCount, filteredNotifications, notificationActions } from '$lib/stores/notifications';
  
  // 通知アイコンのバッジ表示
  $: badgeCount = $unreadCount;
</script>

<div class="dropdown dropdown-end">
  <button class="btn btn-ghost btn-square indicator">
    {#if badgeCount > 0}
      <span class="indicator-item badge badge-error badge-xs">{badgeCount}</span>
    {/if}
    <BellIcon />
  </button>
  
  <div class="dropdown-content">
    <!-- 通知リスト -->
  </div>
</div>
```

### 通知設定画面

ユーザーが通知設定をカスタマイズできる設定画面

## パフォーマンス考慮事項

### 1. データ保持期間
- 通知データは90日後に自動削除
- アーカイブ機能で重要な通知を長期保存

### 2. 配信制御
- 同種の通知は一定時間内に重複配信しない
- 重要度に応じた配信頻度制限

### 3. インデックス最適化
- ユーザー別、日付別のインデックス
- 未読通知の高速検索

## セキュリティ

### 1. 権限制御
- ユーザーは自分の通知のみアクセス可能
- 管理者は全ユーザーの通知状況を確認可能

### 2. データ保護
- 通知内容の暗号化（機密情報含む場合）
- 個人情報の適切なマスキング

## 運用・監視

### 1. メトリクス
- 通知送信数（モジュール別、タイプ別）
- 既読率
- アクション実行率

### 2. アラート
- 通知配信失敗率の監視
- 異常な通知量の検知

## 拡張計画

### Phase 2
- プッシュ通知対応
- Slack/Teams連携
- 通知テンプレート機能

### Phase 3
- AI による通知優先度自動調整
- 通知内容の自動翻訳
- 高度な配信スケジューリング