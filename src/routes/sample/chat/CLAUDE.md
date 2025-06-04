# カスタマーサポートチャットシステム実装ガイド

## 概要

DaisyUI v5とSvelteKit v2を使用した企業向けカスタマーサポートチャットシステムのサンプル実装です。
コールセンターや顧客対応部門での使用を想定した、実用的なUIを提供します。

## 主な機能

### 1. マルチチャット対応

- タブ形式で複数の顧客との同時対応
- チャットごとの経過時間表示
- 未読メッセージカウント
- 優先度とステータス管理

### 2. 顧客情報パネル

- 顧客プロフィール表示
- 購入履歴サマリー
- 過去の問い合わせ履歴
- 会員ランク表示

### 3. 効率的な返信機能

- テンプレート返信
- クイックアクション
- ステータス・優先度の動的変更
- キーボードショートカット（Enter送信）

### 4. リアルタイム統計

- 対応中/待機中の件数
- 本日の対応数
- ヘッダーに常時表示

## 現在のファイル構成（2025年5月更新）

```
/chat/
├── +page.svelte           # メインページ - ルーティングとレイアウト管理
├── CLAUDE.md              # 開発ドキュメント
├── ChatTabs.svelte        # チャットタブ管理 - 複数チャットの切り替えUI
├── CustomerInfo.svelte    # 顧客情報サイドパネル - 顧客詳細と履歴表示
├── InquiryQueue.svelte    # 問い合わせキュー画面 - 待機中の問い合わせ一覧と詳細
├── OperatorDashboard.svelte # オペレーター統計（現在は未使用だが今後の拡張用）
├── SupportChat.svelte     # メインチャット画面 - メッセージ表示と送信
└── supportStore.js        # 状態管理 - 全てのストアと関数を集約
```

### 各ファイルの詳細な役割

#### `+page.svelte`

- **役割**: アプリケーションのメインエントリーポイント
- **機能**:
  - ビューモード切り替え（ダッシュボード/キュー）
  - ヘッダーナビゲーション
  - 統計情報の表示
  - デモ用の問い合わせ生成機能
  - レスポンシブレイアウトの管理

#### `ChatTabs.svelte`

- **役割**: アクティブなチャットのタブ表示と管理
- **機能**:
  - 複数チャットのタブ切り替え
  - チャット終了モーダル
  - 未読カウント表示
  - 経過時間の表示

#### `CustomerInfo.svelte`

- **役割**: 選択中のチャットの顧客詳細情報表示
- **機能**:
  - 顧客プロフィール（会員ランク、登録日等）
  - 購入履歴サマリー
  - 過去の問い合わせ履歴
  - 顧客メモ

#### `InquiryQueue.svelte`

- **役割**: 待機中の問い合わせの管理画面
- **機能**:
  - 問い合わせ一覧（ソート・フィルター機能付き）
  - 問い合わせ詳細表示
  - オペレーターへの割り当て
  - 容量管理（同時対応数の制限）
  - SLA期限の表示

#### `SupportChat.svelte`

- **役割**: チャットの本体部分
- **機能**:
  - メッセージの表示（顧客/オペレーター/システム）
  - メッセージ送信（Ctrl/Cmd+Enter）
  - テンプレート返信
  - ステータス・優先度変更
  - エスカレーション機能
  - 過去履歴の表示切り替え

#### `supportStore.js`

- **役割**: アプリケーション全体の状態管理
- **主要なストア**:
  - `operators`: オペレーター情報
  - `currentOperator`: 現在のオペレーター
  - `inquiryQueue`: 問い合わせキュー
  - `activeChats`: アクティブなチャット
  - `messages`: チャットメッセージ
  - `selectedChatId`: 選択中のチャットID
  - `customers`: 顧客情報
  - `archivedChats`: アーカイブされたチャット
- **派生ストア**:
  - `waitingInquiries`: 待機中の問い合わせ
  - `operatorLoad`: オペレーター別の負荷状況
- **主要な関数**:
  - `addInquiry`: 新規問い合わせ追加
  - `assignInquiry`: 問い合わせの割り当て
  - `sendMessage`: メッセージ送信
  - `resolveChat`: チャット終了
  - `escalateChat`: エスカレーション

#### `OperatorDashboard.svelte`

- **役割**: オペレーターの統計ダッシュボード（現在は最小限の実装）
- **今後の拡張予定**:
  - 詳細な統計情報
  - パフォーマンス指標
  - チーム全体の状況把握

### 削除されたファイル（2025年5月）

以下のファイルは初期実装から残っていた未使用ファイルのため削除：

- `ChatWindow.svelte` - SupportChat.svelteに統合
- `MessageInput.svelte` - SupportChat.svelteに統合
- `MessageList.svelte` - SupportChat.svelteに統合
- `UserProfile.svelte` - CustomerInfo.svelteに置き換え
- `QuickActions.svelte` - 未使用
- `chatStore.js` - supportStore.jsに統合
- `mockData.js` - +page.svelteに統合
- `old_ChatSidebar.svelte.bak` - バックアップファイル

## UI/UXの特徴

### レイアウトの改善

- **シングルカラムデザイン**: 管理画面内でのスペース効率を最大化
- **タブ形式**: 画面切り替えなしで複数対応が可能
- **固定ヘッダー**: 統計情報を常に確認可能

### 操作性の向上

- **ワンクリックアクション**: ステータス変更、優先度設定
- **テンプレート返信**: よくある質問への迅速な対応
- **顧客情報の即座確認**: サイドパネルで常時表示

### レスポンシブ対応

- デスクトップ: フル機能表示
- タブレット: 最適化されたレイアウト
- モバイル: フローティングアクションボタン

## 実装の特徴

### カスタマーサポートに特化した機能

```javascript
// ステータス管理
export const chatStatuses = {
	active: { label: '対応中', color: 'badge-success' },
	waiting: { label: '待機中', color: 'badge-warning' },
	hold: { label: '保留', color: 'badge-info' },
	resolved: { label: '解決済み', color: 'badge-neutral' }
};

// 優先度管理
export const priorities = {
	high: { label: '高', color: 'badge-error' },
	normal: { label: '中', color: 'badge-primary' },
	low: { label: '低', color: 'badge-ghost' }
};
```

### テンプレート返信の実装

```javascript
export const responseTemplates = writable([
	{
		id: 'template-1',
		category: 'greeting',
		title: '初回挨拶',
		content: 'お問い合わせありがとうございます。カスタマーサポートの{agent_name}です。'
	}
	// ... その他のテンプレート
]);
```

## 実装のカスタマイズポイント

### CRMシステムとの連携

```javascript
// 顧客情報の取得
async function fetchCustomerInfo(customerId) {
	const response = await fetch(`/api/customers/${customerId}`);
	const data = await response.json();

	customers.update((cust) => {
		cust[customerId] = data;
		return cust;
	});
}
```

### リアルタイム通信の統合

```javascript
// WebSocket統合例
import { io } from 'socket.io-client';

const socket = io('/support');

socket.on('new-inquiry', (inquiry) => {
	activeChats.update((chats) => [...chats, inquiry]);

	// 通知音を再生
	new Audio('/notification.mp3').play();
});

socket.on('customer-message', (message) => {
	messages.update((msgs) => {
		if (!msgs[message.chatId]) msgs[message.chatId] = [];
		msgs[message.chatId].push(message);
		return msgs;
	});
});
```

### 自動化機能の追加

```javascript
// FAQボットとの連携
async function suggestFAQResponse(customerMessage) {
	const response = await fetch('/api/faq/suggest', {
		method: 'POST',
		body: JSON.stringify({ message: customerMessage })
	});

	const suggestions = await response.json();
	// サジェストされた回答をUIに表示
}

// 感情分析
async function analyzeSentiment(chatId) {
	const messages = messages.get()[chatId];
	const response = await fetch('/api/sentiment/analyze', {
		method: 'POST',
		body: JSON.stringify({ messages })
	});

	const sentiment = await response.json();
	// ネガティブな感情の場合、優先度を上げる
	if (sentiment.score < -0.5) {
		updateChatPriority(chatId, 'high');
	}
}
```

## パフォーマンス最適化

### 1. チャットの仮想化

```javascript
// 大量のチャット履歴に対応
import VirtualList from '@tanstack/svelte-virtual';

// タブが100件を超える場合の仮想化
{#if $activeChats.length > 100}
  <VirtualList items={$activeChats} />
{:else}
  <!-- 通常の表示 -->
{/if}
```

### 2. メッセージの遅延読み込み

```javascript
// 古いメッセージの遅延読み込み
async function loadOlderMessages(chatId, before) {
	const older = await fetch(`/api/messages/${chatId}?before=${before}`);
	const data = await older.json();

	messages.update((msgs) => {
		msgs[chatId] = [...data, ...msgs[chatId]];
		return msgs;
	});
}
```

## セキュリティ考慮事項

### 1. 顧客情報の保護

- PII（個人識別情報）のマスキング
- アクセス権限の管理
- 監査ログの記録

### 2. エージェント認証

```javascript
// エージェントの認証状態確認
export async function verifyAgent() {
	const response = await fetch('/api/auth/verify');
	if (!response.ok) {
		window.location.href = '/login';
	}
	return response.json();
}
```

## デプロイメント推奨事項

### 1. 監視とアラート

- 平均応答時間の監視
- 未対応チャット数のアラート
- エージェントのアクティビティ追跡

### 2. スケーラビリティ

- Redis/Memcachedでのセッション管理
- メッセージキューの使用
- 負荷分散の実装

## まとめ

このカスタマーサポートチャットシステムは、実際の業務で使用できる品質を目指して設計されています。
CRMシステムとの連携、自動化機能の追加、リアルタイム通信の統合により、より効率的な顧客対応が可能になります。

---

## 開発時の重要な学びとTips（2025年5月）

## 2025年6月の更新内容

### 修正されたバグ

1. **チャット履歴の保存**

   - `resolveChat`関数でアーカイブへの保存が正しく動作するよう修正
   - `endTime`/`endDate`プロパティの不整合を解決
   - 個人履歴タブで`assignedTo`フィールドを正しく参照

2. **通知のちらつき問題**
   - 自分への割り当て専用関数`assignToSelf`を追加
   - 通知・承認フローをスキップして即座に割り当て

### 新機能

#### 1. 通知システム

- **NotificationPanel.svelte**: リアルタイム通知表示
- 割り当て/エスカレーションの承認/拒否機能
- 未読バッジ表示

#### 2. テスト・デバッグパネル

- **TestPanel.svelte**: 開発/デモ用の統合テストツール
- オペレーター切り替え機能
- デバッグモード設定（自動生成・自動返信のON/OFF）
- 問い合わせ生成ボタンを統合
- ギアアイコンから調整アイコンに変更（テスト用であることを明示）

#### 3. 割り当て・エスカレーションフローの改善

```javascript
// 新しい関数
- requestAssignInquiry: 割り当て依頼（通知送信）
- acceptAssignment: 割り当て承認
- rejectAssignment: 割り当て拒否
- assignToSelf: 自分への即座割り当て（通知なし）
- requestEscalateChat: エスカレーション依頼
- acceptEscalation: エスカレーション承認
- rejectEscalation: エスカレーション拒否
```

#### 4. データの明確な分離

- 仮想顧客名に「様」を付けてオペレーター名と区別
- debugStore.jsでデバッグ設定を一元管理

### アーキテクチャの改善

#### 新しいストア

- `notifications`: 通知キュー
- `pendingAssignments`: 承認待ちの割り当て/エスカレーション
- `debugSettings`: デバッグモード設定

#### コンポーネント構成

```
/chat/
├── +page.svelte           # メインページ
├── NotificationPanel.svelte  # 通知パネル（新規）
├── TestPanel.svelte         # テストパネル（新規）
├── api/
│   ├── debugStore.js       # デバッグ設定管理（新規）
│   └── demoDataGenerator.js # 顧客名を「様」付きに変更
└── ...（既存ファイル）
```

### 使い方

1. **テストパネル**

   - 画面右下の黄色い調整アイコンをクリック
   - 「問い合わせ自動生成」と「顧客自動返信」をON/OFF可能
   - 新規問い合わせボタンもこちらに統合

2. **通知パネル**

   - ヘッダーのベルアイコンをクリック
   - 割り当てやエスカレーションの承認/拒否が可能

3. **オペレーター切り替え**
   - テストパネル内で現在のオペレーターを変更可能
   - 複数オペレーターの動作をシミュレート

### 注意事項

- テスト機能は`USE_CHAT_MOCK = true`の時のみ有効
- 自動生成・自動返信はデフォルトでOFF
- 通知はオペレーターごとにフィルタリング
