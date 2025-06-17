# 予約スケジュール管理システム - 医療クリニック版

## 概要
中規模医療クリニック向けの予約管理システム。病院スタッフ側と患者側の両方のインターフェースを提供し、効率的な予約管理と患者サービスを実現。

## ターゲット事業
- **事業規模**: 総合診療クリニック（内科・小児科・整形外科）
- **医師数**: 5-10名
- **診察室**: 6室
- **1日の患者数**: 100-150名
- **スタッフ**: 受付3名、看護師10名

## 主要機能

### 1. 予約管理
- カレンダービュー（月/週/日/リソース別）
- ドラッグ&ドロップでの予約変更
- 予約ステータス管理（予約済/来院済/キャンセル/無断キャンセル）
- 繰り返し予約（定期通院）
- キャンセル待ちリスト自動管理

### 2. リソース管理
- 医師スケジュール（診療時間、休診日、担当診療科）
- 診察室割り当て
- 特殊検査機器（レントゲン、エコー、内視鏡）の予約
- リソース競合の自動検出

### 3. AI機能
- 混雑予測と予約枠の自動調整
- ノーショー（無断キャンセル）予測
- 待ち時間の予測と最適化
- 緊急枠の自動確保

### 4. 運営支援
- リアルタイムダッシュボード
- 医師別・診療科別の稼働率分析
- 患者フロー分析
- スタッフ間申し送り機能

## 技術仕様

### ディレクトリ構成
```
yoyaku-clinic/
├── +page.svelte              # ロール選択画面
├── CLAUDE.md                 # 実装概要（このファイル）
├── README.md                 # ユーザー向けドキュメント
├── admin/                    # 管理者側（病院スタッフ用）
│   └── +page.svelte         # 管理画面メインページ
├── patient/                  # 患者側（一般利用者用）
│   └── +page.svelte         # 患者用予約画面
├── components/
│   ├── Calendar/             # カレンダー関連
│   │   ├── CalendarView.svelte
│   │   ├── DayView.svelte
│   │   ├── WeekView.svelte
│   │   └── MonthView.svelte
│   ├── Booking/              # 予約関連
│   │   ├── BookingModal.svelte
│   │   ├── BookingList.svelte
│   │   └── BookingDetail.svelte
│   ├── Resource/             # リソース管理
│   │   ├── DoctorSchedule.svelte
│   │   ├── RoomManager.svelte
│   │   └── EquipmentManager.svelte
│   ├── Dashboard/            # ダッシュボード
│   │   ├── ClinicDashboard.svelte
│   │   ├── WaitingTimeChart.svelte
│   │   └── OccupancyRate.svelte
│   └── AI/                   # AI機能
│       ├── CrowdPrediction.svelte
│       └── OptimizationPanel.svelte
├── stores/
│   ├── bookingStore.ts       # 予約データ管理
│   ├── resourceStore.ts      # リソースデータ管理
│   └── aiStore.ts           # AI分析データ管理
├── api/
│   ├── mockData.ts          # デモデータ
│   └── apiClient.ts         # APIクライアント（モック）
├── types/
│   └── index.ts             # 型定義
└── docs/
    ├── user-guide.md        # ユーザーガイド
    └── api-spec.md          # API仕様書
```

### データ構造

#### 予約（Booking）
```typescript
interface Booking {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  roomId?: string;
  equipmentIds?: string[];
  departmentId: string;
  startTime: Date;
  endTime: Date;
  type: 'first-visit' | 'follow-up' | 'emergency';
  status: 'booked' | 'checked-in' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
}
```

#### 医師（Doctor）
```typescript
interface Doctor {
  id: string;
  name: string;
  departmentIds: string[];
  specialties: string[];
  schedule: DoctorSchedule;
  averageConsultationTime: number; // 分
  color: string; // カレンダー表示用
}
```

#### リソース（Room/Equipment）
```typescript
interface Room {
  id: string;
  name: string;
  type: 'consultation' | 'examination' | 'treatment';
  equipment: string[];
  isAvailable: boolean;
}

interface Equipment {
  id: string;
  name: string;
  type: 'xray' | 'ultrasound' | 'endoscope' | 'other';
  roomId?: string;
  maintenanceSchedule?: Schedule[];
}
```

### UI/UXデザイン方針
- DaisyUI v5のテーマシステムを活用
- カラーコーディング（診療科目別）
- レスポンシブデザイン（タブレット操作を重視）
- ドラッグ&ドロップ操作
- リアルタイム更新（複数スタッフの同時操作）
- アクセシビリティ配慮

### 業種固有の機能

#### 管理者側（病院スタッフ用）
- 全予約の管理・編集権限
- リソース（医師・診察室・機器）のスケジュール管理
- 統計分析とレポート機能
- AI予測による最適化提案
- 患者情報の管理
- 緊急対応モード

#### 患者側（一般利用者用）
- オンライン予約（24時間対応）
- リアルタイム空き状況確認
- 予約変更・キャンセル（24時間前まで）
- 受診履歴の確認
- 待ち時間の目安表示
- リマインダー通知（実装予定）