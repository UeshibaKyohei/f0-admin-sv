# 予約スケジュール管理システム - 医療クリニック版

**AI駆動開発対応**：このREADMEはAIが参照し、システムの理解・改修・拡張を行うために最適化されています。

中規模医療クリニック向けの高機能予約管理システムです。病院スタッフと患者の両方が使える統合システムで、効率的な予約管理と優れた患者体験を提供します。

## 🎯 クイックスタート（AI開発者向け）

### デモモードでの動作確認
```bash
# 開発サーバー起動
pnpm run dev

# ブラウザでアクセス
# http://localhost:5173/sample/data-management/yoyaku-clinic
```

### 本実装への移行フラグ
```typescript
// config.ts
export const CONFIG = {
  isMockMode: false, // true: デモモード, false: 本番モード
  // ...
};
```

## 概要

### システムの目的
- **業務効率化**: 予約管理の自動化により、受付業務の負担を軽減
- **患者満足度向上**: オンライン予約と待ち時間の可視化で患者体験を改善
- **リソース最適化**: AI分析により医師・診察室の稼働率を最大化
- **データ駆動経営**: 統計分析による経営判断のサポート

### 想定規模
- 総合診療クリニック（内科・小児科・整形外科）
- 医師数: 5-10名
- 診察室: 6室
- 1日の患者数: 100-150名

## システム構成

```
yoyaku-clinic/
├── +page.svelte              # ロール選択画面（エントリーポイント）
├── admin/                    # 管理者側インターフェース
│   └── +page.svelte         # 管理画面メインページ
├── patient/                  # 患者側インターフェース
│   └── +page.svelte         # 患者用予約画面
├── components/              # UIコンポーネント
│   ├── Calendar/           # カレンダー関連
│   │   ├── MonthView.svelte    # 月表示
│   │   ├── WeekView.svelte     # 週表示
│   │   └── DayView.svelte      # 日表示
│   ├── Booking/            # 予約管理
│   │   ├── BookingModal.svelte # 予約作成/編集
│   │   └── BookingList.svelte  # 予約一覧
│   ├── Resource/           # リソース管理
│   │   ├── DoctorSchedule.svelte # 医師スケジュール
│   │   └── RoomManager.svelte    # 診察室管理
│   ├── Dashboard/          # 統計ダッシュボード
│   │   └── ClinicDashboard.svelte
│   └── AI/                # AI機能
│       └── CrowdPrediction.svelte
├── stores/                 # 状態管理
│   ├── bookingStore.ts     # 予約データ管理
│   └── resourceStore.ts    # リソースデータ管理
├── api/                    # API通信層
│   ├── apiClient.ts        # APIクライアント
│   └── mockData.ts         # モックデータ生成
├── types/                  # TypeScript型定義
│   └── index.ts            # 全体の型定義
├── config.ts               # 設定ファイル
└── database-schema.sql     # DB設計書
```

## 主要機能詳細

### 1. 予約管理機能

#### 1.1 カレンダービュー

**月表示（MonthView）**
- 用途: 月間の予約概要把握
- 表示内容: 各日の予約数、混雑度のヒートマップ
- 操作: 日付クリックで日表示へ遷移

**週表示（WeekView）**
- 用途: 週間のリソース稼働状況把握
- 表示内容: 医師×日付のマトリックス、予約充足率
- 特徴: 混雑度を色分け表示（緑→黄→赤）

**日表示（DayView）**
- 用途: 当日のオペレーション管理
- 表示内容: タイムライン形式の予約一覧
- 機能: リアルタイムステータス更新、待機時間表示

#### 1.2 予約操作

```typescript
// 予約作成
await bookingStore.addBooking({
  patientId: 'patient-123',
  doctorId: 'doctor-456',
  departmentId: 'dept-789',
  startTime: '2024-01-15T10:00:00Z',
  endTime: '2024-01-15T10:30:00Z',
  type: 'follow-up',
  chiefComplaint: '定期検診'
});

// ステータス更新
bookingStore.updateBookingStatus('booking-001', 'checked-in');
```

### 2. リソース管理機能

#### 2.1 医師管理

**データ構造**
```typescript
interface Doctor {
  id: string;
  name: string;
  departmentIds: string[];       // 複数診療科対応
  specialties: string[];         // 専門分野
  schedule: {
    regularHours: {              // 通常スケジュール
      monday?: TimeSlot[];
      // ... 各曜日
    };
    exceptions: DateException[]; // 休暇・特別スケジュール
  };
  averageConsultationTime: number; // 平均診察時間（分）
}
```

#### 2.2 診察室管理

**機能**
- 階層別管理（1F、2F、3F）
- タイプ別分類（診察室、処置室、検査室）
- 設備情報の紐付け
- リアルタイム稼働状況表示

### 3. AI最適化機能

#### 3.1 混雑予測

**アルゴリズム概要**
```typescript
// 過去データから混雑パターンを学習
const prediction = predictCongestion({
  dayOfWeek: 'monday',
  timeSlot: '14:00-14:30',
  department: 'internal-medicine',
  historicalData: last90DaysBookings
});
// 結果: { expectedPatients: 12, confidence: 0.85 }
```

#### 3.2 スタッフ配置最適化

- 時間帯別の必要スタッフ数算出
- 医師の専門性とのマッチング
- 休憩時間の最適配分

## データベース設計

### 主要テーブル

```sql
-- 予約テーブル（中核）
CREATE TABLE bookings (
    id UUID PRIMARY KEY,
    booking_number VARCHAR(30) UNIQUE,  -- 予約番号
    patient_id UUID,                    -- 患者ID
    doctor_id UUID,                     -- 医師ID
    department_id UUID,                 -- 診療科ID
    room_id UUID,                       -- 診察室ID
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20),                 -- booked/checked-in/in-progress等
    type VARCHAR(20),                   -- first-visit/follow-up/emergency
    chief_complaint TEXT,               -- 主訴
    notes TEXT,                         -- 備考
    -- 以下、実装時に重要なフィールド
    checked_in_at TIMESTAMP,            -- 受付時刻（待ち時間計算用）
    consultation_started_at TIMESTAMP,   -- 診察開始時刻
    consultation_ended_at TIMESTAMP,     -- 診察終了時刻
);
```

### リレーション設計のポイント

1. **多対多の関係**
   - 医師 ←→ 診療科: `doctor_departments`テーブルで管理
   - 予約 ←→ 医療機器: `booking_equipment`テーブルで管理

2. **時系列データの扱い**
   - 予約履歴は削除せず、statusで管理
   - 統計分析のため過去データも保持

3. **パフォーマンス考慮**
   - 頻繁に検索される項目（日付、医師、ステータス）にインデックス
   - 大量データ対応のためのパーティショニング検討

## 実装のポイント

### モックモードと本番モード

```typescript
// config.ts
export const CONFIG = {
  isMockMode: true, // 開発時: true, 本番: false
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 30000,
  },
};

// 使用例
if (CONFIG.isMockMode) {
  // モックデータを返す
  return generateMockBookings();
} else {
  // 実APIを呼び出す
  return await fetch(`${CONFIG.api.baseUrl}/bookings`);
}
```

### API通信パターン

すべてのAPI通信は`apiClient`に集約：

```typescript
// 良い例: 集約されたAPI呼び出し
const bookings = await apiClient.getBookings({ date: '2024-01-15' });

// 悪い例: 直接fetchを使用
const response = await fetch('/api/bookings'); // ❌ 使わない
```

### 状態管理のベストプラクティス

```typescript
// ストアの更新は必ずイミュータブルに
bookingStore.update(bookings => {
  return [...bookings, newBooking]; // ✅ 新しい配列
  // bookings.push(newBooking); return bookings; ❌ 破壊的変更
});
```

## カスタマイズガイド

### 新しい診療科の追加

1. **モックモード**
   ```typescript
   // api/mockData.ts
   export const departments = [
     // ... 既存の診療科
     {
       id: 'dept-new',
       code: 'NEW',
       name: '新診療科',
       color: '#FF6B6B',
       icon: 'medical-icon'
     }
   ];
   ```

2. **本番モード**
   ```sql
   INSERT INTO departments (code, name, color, icon)
   VALUES ('NEW', '新診療科', '#FF6B6B', 'medical-icon');
   ```

### 予約ルールのカスタマイズ

```typescript
// config.ts
export const CONFIG = {
  booking: {
    maxAdvanceBookingDays: 90,    // 何日先まで予約可能か
    minAdvanceBookingHours: 1,     // 最低何時間前までに予約
    defaultConsultationMinutes: 30, // デフォルト診察時間
    maxBookingsPerDay: 5,          // 1人1日の最大予約数
  }
};
```

### UI/UXのカスタマイズ

```html
<!-- テーマの変更 -->
<div data-theme="cupcake"> <!-- light, dark, cupcake等 -->
  <!-- アプリケーション -->
</div>

<!-- カラースキームのカスタマイズ -->
<style>
  :root {
    --primary: #4F46E5;    /* プライマリカラー */
    --secondary: #EC4899;  /* セカンダリカラー */
  }
</style>
```

## 本番環境への移行

### 1. 環境設定

```bash
# .env.production
VITE_API_BASE_URL=https://api.clinic.example.com
VITE_AUTH_PROVIDER=auth0
VITE_ENABLE_ANALYTICS=true
```

### 2. データベースセットアップ

```bash
# PostgreSQLデータベース作成
createdb clinic_booking

# スキーマ適用
psql clinic_booking < database-schema.sql

# 初期データ投入
psql clinic_booking < initial-data.sql
```

### 3. 認証システムの統合

```typescript
// api/auth.ts
export async function authenticate(token: string): Promise<User> {
  // JWTトークンの検証
  const payload = await verifyToken(token);
  return getUserFromPayload(payload);
}
```

### 4. リアルタイム通信の実装

```typescript
// WebSocketまたはSSEでリアルタイム更新
const eventSource = new EventSource('/api/bookings/stream');
eventSource.onmessage = (event) => {
  const booking = JSON.parse(event.data);
  bookingStore.updateBooking(booking.id, booking);
};
```

## パフォーマンス最適化

### 1. データ取得の最適化

```typescript
// 必要なデータのみ取得
const bookings = await apiClient.getBookings({
  date: selectedDate,
  fields: ['id', 'patientName', 'startTime', 'status'], // 必要項目のみ
  limit: 50
});
```

### 2. レンダリング最適化

```svelte
<!-- 仮想スクロール使用 -->
{#if bookings.length > 100}
  <VirtualList items={bookings} itemHeight={60} />
{:else}
  <!-- 通常表示 -->
{/if}
```

### 3. キャッシュ戦略

```typescript
// SWRパターンでキャッシュ
const cachedData = cache.get(key);
if (cachedData) {
  // キャッシュを即座に返す
  return cachedData;
}
// バックグラウンドで更新
fetchAndUpdate(key);
```

## トラブルシューティング

### よくある問題と解決方法

1. **予約が表示されない**
   - フィルター設定を確認
   - 日付範囲が正しいか確認
   - ストアの更新が正しく行われているか確認

2. **リアルタイム更新が動作しない**
   - WebSocket接続を確認
   - 認証トークンの有効期限を確認
   - ネットワークのファイアウォール設定を確認

3. **パフォーマンスが遅い**
   - 大量データの場合は仮想スクロールを使用
   - 不要なリレンダリングを防ぐ
   - APIレスポンスのページネーション実装

## 開発者向けTips

### Svelte 5の注意点

```svelte
<!-- $stateを使用 -->
<script>
  let count = $state(0); // ✅ Svelte 5
  // let count = 0; ❌ リアクティブでない
</script>

<!-- $derivedで派生値 -->
<script>
  const doubled = $derived(count * 2); // ✅
  // $: doubled = count * 2; ❌ 古い構文
</script>
```

### TypeScriptの活用

```typescript
// 型安全なストア更新
function updateBooking<K extends keyof Booking>(
  id: string,
  field: K,
  value: Booking[K]
) {
  // 型安全な更新
}

// ユーティリティ型の活用
type BookingFormData = Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>;
```

### デバッグ方法

```typescript
// 開発時のみログ出力
if (import.meta.env.DEV) {
  console.log('Booking data:', booking);
}

// ストアの状態を監視
bookingStore.subscribe(bookings => {
  console.log('Bookings updated:', bookings.length);
});
```

## 今後の拡張計画

1. **機能拡張**
   - 電子カルテシステムとの連携
   - 決済システムの統合
   - モバイルアプリ対応

2. **AI機能の強化**
   - 患者の来院パターン学習
   - 症状からの診療時間予測
   - キャンセル予測と対策

3. **分析機能の充実**
   - 経営ダッシュボード
   - 患者満足度分析
   - 医療の質指標（QI）測定

---

## 🤖 AI駆動開発のための重要情報

### コードベースの特徴（AI理解用）

**アーキテクチャパターン**:
- Repository Pattern (api層)
- Store Pattern (状態管理)
- Factory Pattern (サービス切り替え)
- Component-Based Architecture

**モード切り替えの実装**:
```typescript
// すべての機能でCONFIG.isMockModeによる分岐
if (CONFIG.isMockMode) {
  // モック動作
} else {
  // 本番動作
}
```

**型安全性の確保**:
- 全ての型定義はtypes/index.tsに集約
- RDBスキーマとの対応をコメントで明記
- API通信はインターフェースで抽象化

### よくあるAI開発タスクと実装ポイント

| タスク | 実装場所 | 注意点 |
|--------|----------|--------|
| 新機能追加 | components/ | 既存パターンを踏襲 |
| API追加 | api/apiClient.ts | インターフェース更新も必要 |
| 業務ルール変更 | config.ts | フラグで切り替え可能に |
| DB設計変更 | database-schema.sql + types/ | 型定義も同期更新 |
| UI改修 | components/ | DaisyUI v5準拠 |

### リファクタリング済みの改良点

1. **モック機能のフラグ化**: 全てのデモ機能がCONFIG.isMockModeで制御
2. **ハードコードの排除**: 設定値は全てconfig.tsに集約
3. **RDB対応**: 型定義にDBスキーマとの対応関係を明記
4. **通信処理の抽象化**: DIパターンでテスト・モック・本番を切り替え可能

### 実装時の必須チェック項目

- [ ] Svelte 5のrunes構文を使用（$state, $derived, $effect）
- [ ] DaisyUI v5のクラス名を使用
- [ ] CONFIG.isMockModeによる条件分岐
- [ ] 型定義とRDBスキーマの整合性
- [ ] API通信はgetApiService()経由
- [ ] ストア更新は必ずイミュータブル

### トラブルシューティング（AI開発者向け）

**よくあるエラーと解決方法**:
```typescript
// ❌ 古いSvelte構文
$: count = someValue;

// ✅ Svelte 5 runes
const count = $derived(someValue);

// ❌ 破壊的な配列更新
items.push(newItem);

// ✅ イミュータブル更新
items = [...items, newItem];

// ❌ 直接API呼び出し
await fetch('/api/bookings');

// ✅ ファクトリー経由
const api = getApiService();
await api.getBookings();
```

### 拡張のためのパターン

**新しいページの追加**:
```
1. /new-feature/+page.svelte 作成
2. 必要なコンポーネントを components/NewFeature/ に配置
3. 新しいストアが必要なら stores/ に追加
4. API通信が必要なら apiClient.ts に追加
```

**新しいAI機能の追加**:
```
1. components/AI/ にコンポーネント作成
2. モック時の動作を mockData.ts に追加
3. 本実装時のAPI設計を apiService.interface.ts に追加
```

---

## 📋 チェックリスト（AI実装時）

### 基本実装
- [ ] デモモードでの動作確認
- [ ] 型定義の整合性確認  
- [ ] モック/本番モードの切り替えテスト
- [ ] レスポンシブデザインの確認

### 本実装移行
- [ ] isMockMode: false で動作確認
- [ ] API実装の完成
- [ ] 認証システムとの統合
- [ ] データベース接続の確認
- [ ] エラーハンドリングの実装

### 運用準備
- [ ] パフォーマンステスト
- [ ] セキュリティ監査
- [ ] ログ出力の設定
- [ ] 監視システムとの連携

---

**最終更新**: 2024年6月（AI駆動開発対応）  
**バージョン**: 2.0.0 (リファクタリング完了)  
**対応技術**: Svelte 5.16+, SvelteKit 2.16+, DaisyUI 5.0.37+