# 会議室予約システム - AI駆動開発ガイド

## 📚 ドキュメント一覧

### 🎯 目的別ガイド
- **[AI開発ガイド](./README-AI-Development.md)** - AI駆動開発の包括的なガイド
- **[クイックリファレンス](./AI-Quick-Reference.md)** - よく使うコードパターン集
- **[移行ガイド](./Migration-Guide.md)** - モックから本番への移行手順
- **[データベース設計](./database-schema.sql)** - PostgreSQLスキーマ定義

## システム概要

企業内会議室の効率的な予約・管理を実現するWebアプリケーションです。リアルタイムな空き状況表示、混雑予測、承認フロー、統計分析など、実用的な機能を提供します。

### 主要機能
- **予約管理**: 新規作成、編集、削除、繰り返し予約
- **リアルタイム表示**: 空き状況、混雑予測、競合チェック
- **カレンダー機能**: 月/週/日表示、ドラッグ&ドロップ操作
- **承認ワークフロー**: 部署・権限別のアクセス制御
- **統計・分析**: 利用率、部署別統計、会議室別分析
- **通知機能**: メール・Slack連携

## 技術アーキテクチャ

### フロントエンド技術スタック
```typescript
// 基盤技術
SvelteKit 2.16+    // フルスタックフレームワーク
Svelte 5.0+        // リアクティブUIライブラリ（Runes構文）
TypeScript 5.0+    // 静的型付け

// UI/スタイリング
DaisyUI 5.0+       // UIコンポーネントライブラリ
TailwindCSS 4.0+   // ユーティリティファーストCSS

// 状態管理
Svelte Stores      // 集中状態管理
Derived Stores     // リアクティブな派生値
```

### データベース設計（PostgreSQL）
```sql
-- 主要テーブル
users              -- ユーザー管理
rooms              -- 会議室マスタ
equipment          -- 設備マスタ
bookings           -- 予約情報
usage_statistics   -- 利用統計（集計テーブル）
notification_logs  -- 通知履歴
```

## プロジェクト構造

```
meeting-rooms/
├── +page.svelte              # メインダッシュボード
├── BookingCalendar.svelte    # 予約カレンダー（月/週/日表示）
├── BookingForm.svelte        # 予約作成・編集フォーム
├── config.ts                 # システム設定（モック/本番切り替え）
├── types/
│   └── index.ts             # TypeScript型定義
├── stores/
│   ├── bookingStore.ts      # 予約管理ストア
│   └── roomStore.ts         # 会議室管理ストア
├── api/
│   ├── apiService.interface.ts  # APIインターフェース定義
│   ├── apiClient.ts            # API実装（モック/本番対応）
│   ├── apiServiceFactory.ts   # DIファクトリー
│   └── mockData.ts            # デモデータ生成
├── database-schema.sql       # PostgreSQLスキーマ定義
└── README.md                # 本ドキュメント
```

## AI駆動開発のポイント

### 1. 医療システムからの学習活用

```typescript
// 医療システムで確立されたパターンを会議室システムに適用
// ✅ 継承された設計パターン
- DIファクトリーパターン
- Svelte 5 Runes構文の活用
- イミュータブル状態管理
- リアルタイムバリデーション
- 包括的エラーハンドリング

// 🔄 会議室システム特化の改良
- 時間枠ベースの予約管理
- 混雑予測アルゴリズム
- 会議室設備との関連付け
- 繰り返し予約機能
```

### 2. 設定駆動アーキテクチャ

```typescript
// config.ts - 中央集約された設定管理
export const CONFIG = {
  isMockMode: true,           // モック/本番切り替え
  system: {
    companyName: '株式会社サンプル',
    locale: 'ja-JP',
    timezone: 'Asia/Tokyo'
  },
  business: {
    hours: { start: '08:00', end: '22:00' },
    maxAdvanceBookingDays: 30,
    slotDurationMinutes: 30
  },
  api: {
    baseUrl: '/api/meeting-rooms',
    timeout: 10000
  }
};
```

### 3. Svelte 5 Runes最適化パターン

```typescript
// ❌ 古いSvelte 4構文
$: volumePercentage = Math.round(volumeRange);

// ✅ Svelte 5 Runes構文
const volumePercentage = $derived(Math.round(volumeRange));

// ❌ 破壊的な配列操作
myStore.update(items => {
  items.push(newItem);  // 同じ参照を返すためUIが更新されない
  return items;
});

// ✅ イミュータブル更新
myStore.update(items => [...items, newItem]);
```

### 4. コンポーネント分離戦略

```typescript
// 医療システムでの学習を活かした適切な粒度での分離
BookingCalendar.svelte    // 複雑な表示ロジック（500行）
BookingForm.svelte        // フォーム処理とバリデーション（400行）
+page.svelte             // メインダッシュボード統合（300行）

// 各コンポーネントは独立してテスト可能
// 再利用性より保守性を優先した設計
```

## API設計とモック戦略

### インターフェース駆動開発

```typescript
// apiService.interface.ts - 契約定義
export interface IMeetingRoomApiService {
  getBookings(params?: BookingQueryParams): Promise<Booking[]>;
  createBooking(booking: CreateBookingDto): Promise<Booking>;
  // ...他のメソッド
}

// 本番実装とモック実装の切り替え
export function getMeetingRoomApiService(): IMeetingRoomApiService {
  return CONFIG.isMockMode 
    ? new MeetingRoomApiClient()     // モック実装
    : new ProductionApiClient();     // 本番実装
}
```

### リアルなモックデータ生成

```typescript
// 実際のビジネスシナリオを反映
export function generateBookings(): Booking[] {
  // 過去1週間〜未来2週間のデータ
  // 営業時間内での自然な分布
  // 部署別・会議室タイプ別の偏りを考慮
  // 競合・キャンセル・No-showの現実的な発生率
}
```

## 本番実装への移行ガイド

### Phase 1: バックエンドAPI実装

```typescript
// 1. データベースセットアップ
psql -f database-schema.sql

// 2. REST APIエンドポイント実装
GET    /api/bookings              // 予約一覧
POST   /api/bookings              // 予約作成
PUT    /api/bookings/:id          // 予約更新
DELETE /api/bookings/:id          // 予約削除
GET    /api/rooms/availability    // 空き状況

// 3. 認証・認可の実装
- JWT トークン認証
- 部署・権限別アクセス制御
- API Rate Limiting
```

### Phase 2: フロントエンド統合

```typescript
// config.ts でモードを切り替え
export const CONFIG = {
  isMockMode: false,  // 本番モードに切り替え
  api: {
    baseUrl: 'https://api.company.com/meeting-rooms',
    apiKey: process.env.API_KEY
  }
};

// 既存のコンポーネントは無変更
// APIクライアントのみ本番実装に切り替え
```

### Phase 3: 運用機能の追加

```typescript
// 追加実装推奨機能
- メール通知システム（Sendgrid/SES）
- Slack Bot統合
- QRコード生成（会議室入口用）
- モバイルアプリ対応
- 管理者ダッシュボード
- データエクスポート機能
```

## カスタマイズポイント

### 1. ビジネスルールの調整

```typescript
// config.ts で容易に変更可能
business: {
  hours: { start: '09:00', end: '18:00' },    // 営業時間
  maxAdvanceBookingDays: 14,                  // 最大予約可能日数
  slotDurationMinutes: 15,                    // 予約時間単位
  maxBookingDuration: 240,                    // 最大予約時間（分）
  cancellationDeadlineHours: 2,               // キャンセル期限
}
```

### 2. 承認フローのカスタマイズ

```typescript
// types/index.ts で権限体系を調整
export interface AccessControl {
  requireApproval: boolean;
  allowedDepartments: string[];
  allowedRoles: ('admin' | 'manager' | 'user' | 'guest')[];
  maxBookingDuration?: number;
  advanceBookingLimit?: number;
}
```

### 3. 通知システムの拡張

```typescript
// 通知テンプレートの追加
export interface NotificationTemplate {
  type: 'booking_confirmed' | 'reminder' | 'cancelled';
  channels: ('email' | 'slack' | 'sms')[];
  timing: number;  // 分前
  template: string;
}
```

## テスト戦略

### 単体テスト

```typescript
// Vitest + Testing Library
describe('BookingStore', () => {
  test('should create booking with validation', async () => {
    const booking = await createBooking(validBookingData);
    expect(booking).toBeDefined();
    expect(booking.status).toBe('confirmed');
  });
});
```

### E2Eテスト

```typescript
// Playwright
test('booking flow', async ({ page }) => {
  await page.goto('/meeting-rooms');
  await page.click('[data-testid="new-booking"]');
  await page.fill('[data-testid="title"]', 'Test Meeting');
  await page.click('[data-testid="submit"]');
  await expect(page.locator('.alert-success')).toBeVisible();
});
```

## パフォーマンス最適化

### 1. データ読み込み最適化

```typescript
// 必要最小限のデータ取得
const todayBookings = derived([bookings], ([$bookings]) => 
  $bookings.filter(booking => booking.isToday)
);

// 無限スクロール対応
export async function loadBookings(params: {
  page: number;
  limit: number;
}): Promise<Booking[]>
```

### 2. リアクティビティ最適化

```typescript
// 過度な再計算を避けるためのメモ化
const expensiveComputation = $derived.by(() => {
  if (!shouldRecalculate) return cachedResult;
  return performExpensiveCalculation($data);
});
```

## セキュリティ考慮事項

### 1. 入力検証

```typescript
// バリデーション関数
function validateBooking(data: CreateBookingDto): ValidationResult {
  // XSS対策
  data.title = sanitizeInput(data.title);
  
  // ビジネスルール検証
  if (!isWithinBusinessHours(data.startTime)) {
    return { valid: false, error: '営業時間外です' };
  }
  
  return { valid: true };
}
```

### 2. 認証・認可

```typescript
// JWT トークン検証
async function verifyUser(token: string): Promise<User | null> {
  try {
    const payload = jwt.verify(token, SECRET_KEY);
    return await getUserById(payload.userId);
  } catch {
    return null;
  }
}
```

## 監視・ログ

### アプリケーション監視

```typescript
// エラートラッキング
export function trackError(error: Error, context: any) {
  console.error('Booking System Error:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
  
  // 本番環境ではSentry等に送信
  if (!CONFIG.isMockMode) {
    Sentry.captureException(error, { extra: context });
  }
}
```

### ビジネスメトリクス

```typescript
// KPI追跡
export const businessMetrics = {
  // 利用率
  utilizationRate: $derived(
    ($bookings.filter(b => b.status === 'completed').length / $rooms.length) * 100
  ),
  
  // 人気会議室
  popularRooms: $derived(
    Object.entries(groupBy($bookings, 'roomId'))
      .sort(([,a], [,b]) => b.length - a.length)
      .slice(0, 5)
  )
};
```

## 今後の拡張計画

### 短期（1-3ヶ月）
- [ ] モバイル最適化
- [ ] プッシュ通知
- [ ] CSVエクスポート
- [ ] 管理者画面

### 中期（3-6ヶ月）
- [ ] AI予約推奨
- [ ] 音声予約（Siri/Alexa）
- [ ] 会議室IoT連携
- [ ] 多言語対応

### 長期（6ヶ月以上）
- [ ] 予測分析ダッシュボード
- [ ] 自動リソース最適化
- [ ] 他システム連携API
- [ ] ホワイトラベル対応

---

このドキュメントは会議室予約システムの包括的な開発ガイドです。医療システムでの学習を活かしつつ、実用的な企業内システムとして設計されています。モックモードでの検証から本番運用まで、段階的な移行をサポートします。