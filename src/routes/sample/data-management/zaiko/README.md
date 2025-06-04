# 在庫管理システム - AI駆動開発用ドキュメント

中小企業向けの在庫管理システムのフルスタックサンプル実装です。本ドキュメントは、AIによる流用・カスタマイズを前提として詳細な実装情報を提供します。

## 🎯 概要と想定シナリオ

### 対象企業
- **規模**: 従業員10-500名の中小企業
- **業種**: 製造業、卸売業、小売業、物流業
- **課題**: 
  - Excelベースの在庫管理からの脱却
  - 複数拠点での在庫把握の困難
  - 在庫の過不足による機会損失・保管コスト
  - RFID・バーコード等の新技術活用ニーズ

### 想定環境
- **社内倉庫**: 本社・工場内の在庫保管エリア
- **外部倉庫**: 3PL業者の倉庫
- **BPOセンター**: 業務委託先の物流センター
- **詳細エリア管理**: フロア・列・棚単位での位置特定

## 📋 機能詳細

### 基本機能
| 機能 | 詳細 | 実装ファイル | API対応 |
|------|------|-------------|---------|
| **在庫登録** | 商品マスター連携での在庫追加 | `InventoryModal.svelte` | `inventoryApi.createInventoryItem` |
| **在庫編集** | 数量・位置・ステータス等の更新 | `InventoryModal.svelte` | `inventoryApi.updateInventoryItem` |
| **在庫削除** | 論理削除による在庫除去 | `InventoryTable.svelte` | `inventoryApi.deleteInventoryItem` |
| **在庫検索** | 複数条件による絞り込み検索 | `InventoryFilters.svelte` | クライアントサイド |
| **在庫移動** | 倉庫・エリア間の移動管理 | `MovementModal.svelte` | `inventoryApi.moveInventory` |
| **履歴管理** | 全操作の監査ログ | `InventoryHistory.svelte` | `historyApi.getHistory` |

### 高度な機能
| 機能 | 詳細 | 実装ファイル | 実装ポイント |
|------|------|-------------|-------------|
| **エリアマップ** | 倉庫内の視覚的な位置管理 | `WarehouseAreaMap.svelte` | グリッドレイアウト、色分け表示 |
| **RFID管理** | RFIDタグの登録・スキャン・一括更新 | `RFIDManager.svelte` | デバイス連携想定 |
| **カメラビュー** | 監視カメラと連携した在庫確認 | `WarehouseCameraView.svelte` | IP Camera API想定 |
| **アラート設定** | 低在庫・期限切れ等の自動通知 | `AlertManager.svelte` | しきい値ベース |
| **バッチ・ロット管理** | 製造単位での品質トレース | `types.ts` | 型定義レベル |

## 🗄️ RDB設計

### テーブル構成（PostgreSQL想定）

#### 1. 商品マスタ関連
```sql
-- カテゴリマスタ（階層構造対応）
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES categories(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- タグマスタ
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(20) DEFAULT 'primary',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 商品マスタ
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    jan_code VARCHAR(13),
    category_id UUID NOT NULL REFERENCES categories(id),
    description TEXT,
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    unit VARCHAR(20) DEFAULT 'piece',
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    reorder_point INTEGER DEFAULT 0,
    reorder_quantity INTEGER DEFAULT 0,
    lead_time_days INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 商品タグ中間テーブル
CREATE TABLE product_tags (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);

-- 商品属性
CREATE TABLE product_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    value VARCHAR(255) NOT NULL,
    unit VARCHAR(20),
    sort_order INTEGER DEFAULT 0
);
```

#### 2. 倉庫・エリア管理
```sql
-- 倉庫マスタ
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    capacity INTEGER DEFAULT 0,
    current_usage INTEGER DEFAULT 0,
    type VARCHAR(20) CHECK (type IN ('internal', 'external', 'bpo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 倉庫エリア
CREATE TABLE warehouse_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    capacity INTEGER DEFAULT 0,
    current_usage INTEGER DEFAULT 0,
    floor INTEGER NOT NULL,
    row VARCHAR(10) NOT NULL,
    column INTEGER NOT NULL,
    UNIQUE(warehouse_id, code),
    UNIQUE(warehouse_id, floor, row, column)
);
```

#### 3. 在庫管理
```sql
-- 在庫アイテム
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    unit VARCHAR(20) NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    area_id UUID NOT NULL REFERENCES warehouse_areas(id),
    location TEXT, -- 詳細位置情報
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'damaged', 'in_transit')),
    rfid_tag VARCHAR(255) UNIQUE,
    serial_number VARCHAR(255) UNIQUE,
    batch_number VARCHAR(255),
    lot_number VARCHAR(255),
    manufacturing_date DATE,
    expiry_date DATE,
    cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 在庫移動
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES inventory_items(id),
    from_warehouse_id UUID REFERENCES warehouses(id),
    from_area_id UUID REFERENCES warehouse_areas(id),
    to_warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    to_area_id UUID NOT NULL REFERENCES warehouse_areas(id),
    quantity INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    requested_by VARCHAR(255),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 在庫履歴
CREATE TABLE inventory_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES inventory_items(id),
    action VARCHAR(20) NOT NULL CHECK (action IN ('created', 'updated', 'moved', 'deleted', 'adjusted')),
    previous_value JSONB,
    new_value JSONB,
    reason TEXT,
    performed_by VARCHAR(255),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 在庫アラート
CREATE TABLE inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('low_stock', 'expiry_warning', 'overstock', 'missing_item')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    product_id UUID REFERENCES products(id),
    warehouse_id UUID REFERENCES warehouses(id),
    threshold_value DECIMAL(10,2),
    current_value DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    triggered_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE
);
```

### インデックス設計
```sql
-- パフォーマンス最適化用インデックス
CREATE INDEX idx_inventory_items_product_warehouse ON inventory_items(product_id, warehouse_id);
CREATE INDEX idx_inventory_items_warehouse_area ON inventory_items(warehouse_id, area_id);
CREATE INDEX idx_inventory_items_status ON inventory_items(status);
CREATE INDEX idx_inventory_items_rfid ON inventory_items(rfid_tag) WHERE rfid_tag IS NOT NULL;
CREATE INDEX idx_inventory_items_expiry ON inventory_items(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_inventory_history_item_performed ON inventory_history(item_id, performed_at DESC);
CREATE INDEX idx_inventory_alerts_active ON inventory_alerts(is_active, priority, created_at);
```

## 🏗️ アーキテクチャ

### ファイル構成
```
zaiko/
├── README.md                    # 本ドキュメント
├── +page.svelte                 # メイン画面（基本機能）
├── advanced/
│   └── +page.svelte            # 高度な機能画面
├── types.ts                     # TypeScript型定義（RDB設計反映）
├── constants.ts                 # 定数・設定（DEMO_MODE含む）
├── inventoryStore.svelte.ts     # Svelte 5ルーンベース状態管理
├── api/
│   ├── apiClient.ts            # API通信クライアント（Mock/Real切り替え）
│   ├── demoDataV2.ts           # デモデータ生成
│   └── masterData.ts           # 商品マスタデータ
└── components/
    ├── DashboardCard.svelte     # ダッシュボード統計カード
    ├── WarehouseSelector.svelte # 倉庫選択UI
    ├── WarehouseAreaMap.svelte  # 倉庫エリア視覚化
    ├── WarehouseCameraView.svelte # カメラビューUI
    ├── InventoryTable.svelte    # 在庫一覧テーブル
    ├── InventoryModal.svelte    # 在庫登録・編集
    ├── InventoryFilters.svelte  # 検索・フィルタ
    ├── InventoryHistory.svelte  # 履歴表示
    ├── MovementModal.svelte     # 在庫移動
    ├── RFIDManager.svelte       # RFID管理
    └── AlertManager.svelte      # アラート管理
```

### 技術スタック詳細

#### フロントエンド
- **Svelte 5.16+**: 最新ルーン構文（$state, $derived, $effect）
- **SvelteKit 2.16+**: ファイルベースルーティング、SSR/SPA
- **TypeScript 5.0+**: 厳密な型チェック、IDE支援
- **DaisyUI 5.0.37+**: 自動化されたDarkMode、新コンポーネント
- **Tailwind CSS 4.1.7+**: 最新機能、パフォーマンス向上

#### バックエンド想定
- **PostgreSQL 15+**: JSONB、UUID、時系列データ最適化
- **Node.js + Express**: RESTful API、認証・認可
- **Redis**: セッション管理、キャッシュ
- **S3**: ファイルストレージ（画像、CSV等）

### 状態管理パターン

#### Svelte 5ルーン使用例
```typescript
// ✅ 正しいリアクティブ更新
inventoryItems = [...inventoryItems, newItem];

// ❌ 間違い（参照が変わらないため更新されない）
inventoryItems.push(newItem);

// ✅ 正しいオブジェクト更新
selectedWarehouse = { ...selectedWarehouse, currentUsage: newUsage };

// ❌ 間違い（ミューテーション）
selectedWarehouse.currentUsage = newUsage;
```

#### APIクライアントパターン
```typescript
// Mock/Real API切り替え
export const inventoryApi = {
  async getInventoryItems(warehouseId?: string) {
    if (DEMO_MODE) {
      // モックデータ返却
      await simulateDelay();
      return { success: true, data: mockData };
    }
    
    // 実際のAPI呼び出し
    return httpClient<InventoryItem[]>('/api/v1/inventory');
  }
};
```

## 🎨 UI/UXパターン

### DaisyUI v5対応
```svelte
<!-- ✅ 正しいタブ実装 -->
<div role="tablist" class="tabs tabs-lifted">
  <a role="tab" class="tab {activeTab === 'area-map' ? 'tab-active' : ''}" 
     href="#area-map">エリアマップ</a>
</div>

<!-- ✅ 正しいモーダル制御 -->
<dialog class="modal" class:modal-open={showModal}>
  <div class="modal-box">
    <!-- content -->
  </div>
</dialog>
```

### レスポンシブデザインパターン
```svelte
<!-- モバイルファースト -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- カード表示 -->
</div>

<!-- タブレット向け最適化 -->
<div class="overflow-x-auto">
  <table class="table table-sm md:table-md">
    <!-- テーブル内容 -->
  </table>
</div>
```

## 🔧 カスタマイズガイド

### 1. 商品カテゴリの拡張

**ファイル**: `api/masterData.ts`
```typescript
// 階層構造カテゴリの追加
export const DEMO_CATEGORIES: Category[] = [
  // 親カテゴリ
  { id: 'cat-electronics', name: '電子機器', code: 'ELEC', parentId: undefined },
  // 子カテゴリ
  { id: 'cat-smartphones', name: 'スマートフォン', code: 'PHONE', parentId: 'cat-electronics' },
];
```

### 2. 倉庫レイアウトのカスタマイズ

**ファイル**: `api/demoDataV2.ts`
```typescript
// エリア生成ロジックの変更
function generateWarehouseAreas(warehouseId: string, floors: number = 3): WarehouseArea[] {
  const rows = ['A', 'B', 'C', 'D', 'E']; // 行数を調整
  const columnsPerRow = 6; // 列数を調整
  
  // グリッドサイズの動的計算
  for (let floor = 1; floor <= floors; floor++) {
    // カスタムレイアウトロジック
  }
}
```

### 3. アラート条件の追加

**ファイル**: `constants.ts`
```typescript
// 新しいアラート類型
export const ALERT_TYPES = {
  LOW_STOCK: 'low_stock',
  EXPIRY_WARNING: 'expiry_warning',
  TEMPERATURE_ALERT: 'temperature_alert', // 追加
  HUMIDITY_ALERT: 'humidity_alert',       // 追加
} as const;

// しきい値設定
export const ALERT_THRESHOLDS = {
  LOW_STOCK_PERCENTAGE: 20,
  EXPIRY_WARNING_DAYS: 30,
  TEMPERATURE_MAX: 25,     // 追加
  HUMIDITY_MAX: 60,        // 追加
};
```

### 4. RFID連携の実装

**ファイル**: `components/RFIDManager.svelte`
```typescript
// 実際のRFIDリーダー連携
async function connectRfidReader() {
  if (DEMO_MODE) {
    // シミュレーション
    return simulateRfidScan();
  }
  
  // 実際のハードウェア連携
  const reader = await navigator.serial.requestPort();
  // リーダー設定・イベントリスナー設定
}
```

## 🚀 実装Tips

### 1. パフォーマンス最適化

#### 大量データ対応
```typescript
// 仮想スクロール（大量アイテム表示時）
import { createVirtualizer } from '@tanstack/virtual-core';

// ページネーション
const ITEMS_PER_PAGE = 50;
const paginatedItems = $derived(
  filteredItems.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)
);
```

#### 検索最適化
```typescript
// デバウンス検索
import { debounce } from 'lodash-es';

const debouncedSearch = debounce((query: string) => {
  performSearch(query);
}, 300);
```

### 2. エラーハンドリング

```typescript
// 統一的なエラー処理
try {
  const result = await inventoryApi.updateInventoryItem(id, updates);
  if (!result.success) {
    throw new Error(result.error);
  }
} catch (error) {
  // ユーザー向けエラー表示
  showErrorToast(error.message);
  // ログ記録
  console.error('Inventory update failed:', error);
}
```

### 3. リアルタイム更新

```typescript
// WebSocket連携想定
if (!DEMO_MODE) {
  const ws = new WebSocket('ws://localhost:8080/inventory');
  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    // リアルタイム在庫更新
    updateInventoryFromWebSocket(update);
  };
}
```

### 4. バックアップ・復元

```typescript
// データエクスポート
function exportInventoryData() {
  const data = {
    warehouses: $warehouses,
    inventoryItems: $inventoryItems,
    products: $products,
    timestamp: new Date().toISOString()
  };
  
  downloadJSON(data, `inventory-backup-${Date.now()}.json`);
}
```

## 📱 モバイル対応

### 1. PWA設定
```typescript
// service-worker.js想定
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/inventory')) {
    // オフライン時のキャッシュ戦略
  }
});
```

### 2. モバイルUX最適化
```svelte
<!-- タッチ操作対応 -->
<div class="touch-manipulation">
  <!-- スワイプジェスチャー対応 -->
</div>

<!-- QRコードスキャン対応 -->
{#if hasCameraPermission}
  <button on:click={startQRScan} class="btn btn-primary">
    QRコードスキャン
  </button>
{/if}
```

## 🔐 セキュリティ考慮事項

### 1. 認証・認可
```typescript
// JWT認証想定
const API_HEADERS = {
  'Authorization': `Bearer ${getAccessToken()}`,
  'Content-Type': 'application/json'
};

// 権限ベースアクセス制御
const hasPermission = (action: string, resource: string) => {
  return userPermissions.includes(`${action}:${resource}`);
};
```

### 2. データ暗号化
```sql
-- 機密データの暗号化
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- RFIDタグの暗号化
INSERT INTO inventory_items (rfid_tag) 
VALUES (pgp_sym_encrypt('RFID123456', 'encryption_key'));
```

## 🧪 テスト戦略

### 1. 単体テスト
```typescript
// vitest + @testing-library/svelte
import { render, screen } from '@testing-library/svelte';
import InventoryTable from './InventoryTable.svelte';

test('在庫テーブルの表示', () => {
  render(InventoryTable, { items: mockInventoryItems });
  expect(screen.getByText('商品名')).toBeInTheDocument();
});
```

### 2. E2Eテスト
```typescript
// Playwright
test('在庫登録フロー', async ({ page }) => {
  await page.goto('/sample/zaiko');
  await page.click('[data-testid="add-inventory-btn"]');
  await page.fill('[data-testid="quantity-input"]', '10');
  await page.click('[data-testid="save-btn"]');
  
  await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
});
```

## 📊 監視・分析

### 1. メトリクス収集
```typescript
// 使用状況トラッキング
function trackInventoryAction(action: string, metadata: object) {
  if (!DEMO_MODE) {
    analytics.track('inventory_action', {
      action,
      warehouse_id: metadata.warehouseId,
      timestamp: Date.now()
    });
  }
}
```

### 2. エラー監視
```typescript
// Sentry想定
import * as Sentry from '@sentry/browser';

Sentry.captureException(error, {
  tags: {
    component: 'InventoryStore',
    action: 'updateInventoryItem'
  }
});
```

## 🔄 Mock→DB移行ガイド

### データマッピング対応表

#### 1. InventoryItem型 ⇔ inventory_itemsテーブル
| Mock Property | DB Column | 型変換 | 備考 |
|---------------|-----------|--------|------|
| `id` | `id` | UUID | 変換不要 |
| `productId` | `product_id` | UUID | スネークケース変換 |
| `warehouseId` | `warehouse_id` | UUID | スネークケース変換 |
| `areaId` | `area_id` | UUID | スネークケース変換 |
| `quantity` | `quantity` | INTEGER | 変換不要 |
| `rfidTag` | `rfid_tag` | VARCHAR | スネークケース変換 |
| `serialNumber` | `serial_number` | VARCHAR | スネークケース変換 |
| `batchNumber` | `batch_number` | VARCHAR | スネークケース変換 |
| `lotNumber` | `lot_number` | VARCHAR | スネークケース変換 |
| `manufacturingDate` | `manufacturing_date` | DATE | ISO文字列→DATE変換 |
| `expiryDate` | `expiry_date` | DATE | ISO文字列→DATE変換 |
| `createdAt` | `created_at` | TIMESTAMP | ISO文字列→TIMESTAMP変換 |
| `updatedAt` | `updated_at` | TIMESTAMP | ISO文字列→TIMESTAMP変換 |

#### 2. Product型 ⇔ productsテーブル
| Mock Property | DB Column | 型変換 | 備考 |
|---------------|-----------|--------|------|
| `id` | `id` | UUID | 変換不要 |
| `name` | `name` | VARCHAR | 変換不要 |
| `sku` | `sku` | VARCHAR | 変換不要 |
| `janCode` | `jan_code` | VARCHAR | スネークケース変換 |
| `categoryId` | `category_id` | UUID | スネークケース変換 |
| `minStockLevel` | `min_stock_level` | INTEGER | スネークケース変換 |
| `maxStockLevel` | `max_stock_level` | INTEGER | スネークケース変換 |
| `reorderPoint` | `reorder_point` | INTEGER | スネークケース変換 |
| `reorderQuantity` | `reorder_quantity` | INTEGER | スネークケース変換 |
| `leadTimeDays` | `lead_time_days` | INTEGER | スネークケース変換 |
| `isActive` | `is_active` | BOOLEAN | スネークケース変換 |
| `createdAt` | `created_at` | TIMESTAMP | ISO文字列→TIMESTAMP変換 |
| `updatedAt` | `updated_at` | TIMESTAMP | ISO文字列→TIMESTAMP変換 |

#### 3. Warehouse型 ⇔ warehousesテーブル
| Mock Property | DB Column | 型変換 | 備考 |
|---------------|-----------|--------|------|
| `id` | `id` | UUID | 変換不要 |
| `name` | `name` | VARCHAR | 変換不要 |
| `location` | `location` | TEXT | 変換不要 |
| `capacity` | `capacity` | INTEGER | 変換不要 |
| `currentUsage` | `current_usage` | INTEGER | スネークケース変換 |
| `type` | `type` | VARCHAR | ENUM制約対応 |
| `areas` | N/A | JOIN | warehouse_areasテーブルとJOIN |

#### 4. WarehouseArea型 ⇔ warehouse_areasテーブル
| Mock Property | DB Column | 型変換 | 備考 |
|---------------|-----------|--------|------|
| `id` | `id` | UUID | 変換不要 |
| `warehouseId` | `warehouse_id` | UUID | スネークケース変換 |
| `name` | `name` | VARCHAR | 変換不要 |
| `code` | `code` | VARCHAR | 変換不要 |
| `capacity` | `capacity` | INTEGER | 変換不要 |
| `currentUsage` | `current_usage` | INTEGER | スネークケース変換 |
| `location.floor` | `floor` | INTEGER | ネストオブジェクト→フラット化 |
| `location.row` | `row` | VARCHAR | ネストオブジェクト→フラット化 |
| `location.column` | `column` | INTEGER | ネストオブジェクト→フラット化 |

### JOIN関係の実装

#### 在庫アイテム取得（関連データ含む）
```sql
-- Mock: inventoryStore.filteredItems での表示内容を再現
SELECT 
  i.id,
  i.product_id,
  i.quantity,
  i.unit,
  i.warehouse_id,
  i.area_id,
  i.location,
  i.status,
  i.rfid_tag,
  i.serial_number,
  i.batch_number,
  i.lot_number,
  i.manufacturing_date,
  i.expiry_date,
  i.cost,
  i.created_at,
  i.updated_at,
  -- 商品マスタ情報（JOIN）
  p.name as product_name,
  p.sku as product_sku,
  p.min_stock_level,
  p.reorder_point,
  -- 倉庫情報（JOIN）
  w.name as warehouse_name,
  w.type as warehouse_type,
  -- エリア情報（JOIN）
  a.name as area_name,
  a.code as area_code,
  a.floor,
  a.row,
  a.column,
  -- カテゴリ情報（JOIN）
  c.name as category_name,
  c.code as category_code
FROM inventory_items i
LEFT JOIN products p ON i.product_id = p.id
LEFT JOIN warehouses w ON i.warehouse_id = w.id
LEFT JOIN warehouse_areas a ON i.area_id = a.id
LEFT JOIN categories c ON p.category_id = c.id
WHERE i.warehouse_id = $1 -- パラメータ化クエリ
ORDER BY i.created_at DESC;
```

#### ダッシュボード統計取得
```sql
-- Mock: dashboardStats を再現
WITH warehouse_stats AS (
  SELECT 
    w.id,
    w.name,
    w.capacity,
    COUNT(i.id) as current_usage,
    ROUND((COUNT(i.id)::DECIMAL / w.capacity) * 100, 2) as utilization_rate
  FROM warehouses w
  LEFT JOIN inventory_items i ON w.id = i.warehouse_id
  GROUP BY w.id, w.name, w.capacity
),
low_stock_items AS (
  SELECT COUNT(*) as count
  FROM inventory_items i
  JOIN products p ON i.product_id = p.id
  WHERE i.quantity < p.min_stock_level
),
expiring_items AS (
  SELECT COUNT(*) as count
  FROM inventory_items i
  WHERE i.expiry_date IS NOT NULL 
    AND i.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
)
SELECT 
  (SELECT COUNT(*) FROM inventory_items) as total_items,
  (SELECT COUNT(*) FROM warehouses) as total_warehouses,
  (SELECT SUM(i.cost * i.quantity) FROM inventory_items i) as total_value,
  (SELECT count FROM low_stock_items) as low_stock_items,
  (SELECT count FROM expiring_items) as expiring_items,
  (SELECT COUNT(*) FROM inventory_alerts WHERE is_active = true) as active_alerts,
  json_agg(ws.*) as warehouse_utilization
FROM warehouse_stats ws;
```

### API移行パターン

#### Mock→DB APIクライアント変更例
```typescript
// 移行前（Mock）
export const inventoryApi = {
  async getInventoryItems(warehouseId?: string) {
    if (DEMO_MODE) {
      await simulateDelay();
      const demoData = generateInitialDemoData();
      return { success: true, data: demoData.inventoryItems };
    }
    // ...
  }
};

// 移行後（DB）
export const inventoryApi = {
  async getInventoryItems(warehouseId?: string) {
    const params = new URLSearchParams();
    if (warehouseId) params.append('warehouse_id', warehouseId);
    
    const response = await fetch(`/api/v1/inventory?${params}`, {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // DB結果をMock形式に変換
    const inventoryItems = data.map(row => ({
      id: row.id,
      productId: row.product_id,  // ← スネークケース変換
      warehouseId: row.warehouse_id,
      areaId: row.area_id,
      // ... 他のフィールド変換
      product: {
        id: row.product_id,
        name: row.product_name,
        sku: row.product_sku,
        minStockLevel: row.min_stock_level,
        // ...
      },
      warehouse: {
        id: row.warehouse_id,
        name: row.warehouse_name,
        type: row.warehouse_type,
        // ...
      }
    }));
    
    return { success: true, data: inventoryItems };
  }
};
```

### ケースネーミング変換ユーティリティ

```typescript
// utils/caseConverter.ts
export function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  
  return obj;
}

export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_[a-z]/g, match => match[1].toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  
  return obj;
}

// 使用例
const dbRow = { product_id: 'uuid', warehouse_id: 'uuid2' };
const mockData = toCamelCase(dbRow); // { productId: 'uuid', warehouseId: 'uuid2' }
```

### 既存システムからの移行
```sql
-- Excelからのデータ移行
COPY products(name, sku, category_id) 
FROM '/path/to/products.csv' 
DELIMITER ',' CSV HEADER;

-- データ整合性チェック
SELECT 
  p.sku,
  COUNT(i.id) as inventory_count
FROM products p
LEFT JOIN inventory_items i ON p.id = i.product_id
GROUP BY p.sku
HAVING COUNT(i.id) = 0;
```

## 📚 参考資料

### 公式ドキュメント
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/runes)
- [SvelteKit](https://svelte.dev/docs/kit)
- [DaisyUI v5](https://daisyui.com/docs/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

### 業界標準・規格
- [GS1標準](https://www.gs1.org/): バーコード・RFID規格
- [ISO 9001](https://www.iso.org/iso-9001-quality-management.html): 品質管理
- [GDPR](https://gdpr.eu/): データ保護規則

---

## ⚡ クイックスタート

```bash
# 1. プロジェクトクローン後
cd src/routes/sample/zaiko

# 2. デモモード確認
# constants.ts で DEMO_MODE = true を確認

# 3. 開発サーバー起動
pnpm run dev

# 4. ブラウザアクセス
open http://localhost:5173/sample/zaiko
```

本ドキュメントは、AIによる効率的な開発を支援するため、実装の詳細から運用まで包括的にカバーしています。不明点があれば、各セクションの詳細実装をファイル単位で確認してください。