# AI駆動開発 実装ガイド

## はじめに

このガイドは、HR Dashboard 05を基に本番システムを実装する際の詳細な手順と注意点をまとめたものです。AI（Claude等）が参照して効率的に開発を進められるよう、具体的なコード例と共に説明します。

## 実装手順

### Phase 1: データベース構築

#### 1.1 マイグレーションファイルの作成

```sql
-- migrations/001_create_hr_tables.sql
-- 実行順序に注意：外部キー制約があるため、依存関係を考慮

-- 1. 部門マスタ（依存なし）
CREATE TABLE departments ...

-- 2. 従業員マスタ（departmentsに依存）
CREATE TABLE employees ...

-- 3. 関連テーブル（employeesに依存）
CREATE TABLE attendance_records ...
CREATE TABLE overtime_records ...
-- 以下続く
```

#### 1.2 初期データ投入

```sql
-- seeds/001_initial_departments.sql
INSERT INTO departments (name, employee_count, budget, headcount_limit, growth_rate) VALUES
('開発部', 42, 120000000, 45, 15.0),
('営業部', 38, 95000000, 40, 8.0),
-- 以下続く
```

### Phase 2: バックエンドAPI実装

#### 2.1 API構造

```
/api
├── /hr
│   ├── /employees
│   │   ├── index.js      # GET(一覧), POST(新規)
│   │   └── [id].js       # GET(詳細), PUT(更新), DELETE(削除)
│   ├── /attendance
│   │   ├── today.js      # 本日の勤怠
│   │   └── weekly.js     # 週次データ
│   ├── /overtime
│   │   ├── monthly.js    # 月次レポート
│   │   └── alerts.js     # アラート
│   └── /compliance
│       └── score.js      # スコア計算
```

#### 2.2 従業員一覧API実装例（Node.js/Express）

```javascript
// api/hr/employees/index.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(req, res) {
	try {
		const {
			department,
			status,
			search,
			sortBy = 'name',
			sortOrder = 'asc',
			page = 1,
			limit = 20
		} = req.query;

		// フィルタ条件構築
		const where = {
			employment_status: 'active',
			...(department && { department: { name: department } }),
			...(status && { attendance: { some: { date: new Date(), status } } }),
			...(search && {
				OR: [
					{ name: { contains: search } },
					{ position: { contains: search } },
					{ employee_code: { contains: search } }
				]
			})
		};

		// データ取得
		const [employees, total] = await Promise.all([
			prisma.employee.findMany({
				where,
				include: {
					department: true,
					attendance: {
						where: { date: new Date() },
						take: 1
					},
					evaluations: {
						orderBy: { created_at: 'desc' },
						take: 1
					},
					skills: true
				},
				orderBy: { [sortBy]: sortOrder },
				skip: (page - 1) * limit,
				take: limit
			}),
			prisma.employee.count({ where })
		]);

		// レスポンス整形
		const response = {
			data: employees.map((emp) => ({
				id: emp.id,
				employeeCode: emp.employee_code,
				name: emp.name,
				department: emp.department.name,
				position: emp.position,
				status: emp.attendance[0]?.status || 'unknown',
				joinDate: emp.join_date,
				performance: emp.evaluations[0]?.performance_score || 'N/A',
				engagement: emp.evaluations[0]?.engagement_score || 0,
				skills: emp.skills.map((s) => s.skill_name)
			})),
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit)
			}
		};

		res.json(response);
	} catch (error) {
		console.error('Employee API Error:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
}
```

#### 2.3 残業アラート計算ロジック

```javascript
// services/overtimeAlertService.js
export class OvertimeAlertService {
	constructor(prisma) {
		this.prisma = prisma;
	}

	async generateAlerts() {
		const currentMonth = new Date().getMonth() + 1;
		const currentYear = new Date().getFullYear();

		// 当月の残業時間集計
		const overtimeData = await this.prisma.$queryRaw`
      SELECT 
        e.id,
        e.name,
        d.name as department,
        SUM(a.overtime_minutes) / 60 as total_hours,
        AVG(a.overtime_minutes) / 60 as avg_daily_hours
      FROM employees e
      JOIN departments d ON e.department_id = d.id
      LEFT JOIN attendance_records a ON e.id = a.employee_id
      WHERE 
        YEAR(a.date) = ${currentYear}
        AND MONTH(a.date) = ${currentMonth}
        AND e.employment_status = 'active'
      GROUP BY e.id, e.name, d.name
      HAVING total_hours > 0
    `;

		const alerts = [];

		for (const record of overtimeData) {
			// 月間40時間超過チェック
			if (record.total_hours > 40) {
				alerts.push({
					type: 'warning',
					employeeId: record.id,
					employee: record.name,
					department: record.department,
					message: `月間残業時間が${Math.round(record.total_hours)}時間を超過`,
					urgency: record.total_hours > 45 ? 'high' : 'medium',
					overtimeHours: record.total_hours
				});
			}

			// 2ヶ月平均80時間チェック
			const twoMonthAvg = await this.checkTwoMonthAverage(record.id);
			if (twoMonthAvg > 80) {
				alerts.push({
					type: 'danger',
					employeeId: record.id,
					employee: record.name,
					department: record.department,
					message: '2ヶ月平均が80時間に接近',
					urgency: 'high',
					overtimeHours: twoMonthAvg
				});
			}
		}

		return alerts;
	}

	async checkTwoMonthAverage(employeeId) {
		// 実装省略
		return 0;
	}
}
```

### Phase 3: フロントエンド実装

#### 3.1 サービス層の本番実装への切り替え

```javascript
// hr-service.js の修正
const hrService = {
	async getEmployees(filters = {}) {
		if (IS_MOCK_MODE) {
			return getMockEmployees(filters);
		}

		// 本番API呼び出し
		const params = new URLSearchParams(filters);
		const response = await fetch(`/api/hr/employees?${params}`);
		if (!response.ok) {
			throw new Error('Failed to fetch employees');
		}
		return response.json();
	}
	// 他のメソッドも同様に実装
};
```

#### 3.2 リアルタイム更新の実装（WebSocket）

```javascript
// realtimeService.js
export class RealtimeService {
	constructor() {
		this.ws = null;
		this.listeners = new Map();
	}

	connect() {
		this.ws = new WebSocket(import.meta.env.VITE_WS_URL);

		this.ws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			this.notifyListeners(data.type, data.payload);
		};
	}

	subscribe(eventType, callback) {
		if (!this.listeners.has(eventType)) {
			this.listeners.set(eventType, new Set());
		}
		this.listeners.get(eventType).add(callback);
	}

	notifyListeners(eventType, data) {
		if (this.listeners.has(eventType)) {
			this.listeners.get(eventType).forEach((callback) => callback(data));
		}
	}
}

// コンポーネントでの使用
onMount(() => {
	const realtime = new RealtimeService();
	realtime.connect();

	// 勤怠更新をリアルタイムで受信
	realtime.subscribe('attendance.update', (data) => {
		updateAttendanceData(data);
	});

	// 残業アラートをリアルタイムで受信
	realtime.subscribe('overtime.alert', (alert) => {
		showNotification(alert);
	});
});
```

### Phase 4: パフォーマンス最適化

#### 4.1 大量データの仮想スクロール

```svelte
<!-- VirtualList.svelte -->
<script>
	import { onMount } from 'svelte';

	export let items = [];
	export let itemHeight = 50;
	export let visibleItems = 20;

	let scrollContainer;
	let scrollTop = 0;
	let containerHeight = 0;

	$: totalHeight = items.length * itemHeight;
	$: startIndex = Math.floor(scrollTop / itemHeight);
	$: endIndex = Math.min(startIndex + visibleItems, items.length);
	$: visibleData = items.slice(startIndex, endIndex);
	$: offsetY = startIndex * itemHeight;

	function handleScroll() {
		scrollTop = scrollContainer.scrollTop;
	}
</script>

<div
	bind:this={scrollContainer}
	on:scroll={handleScroll}
	class="virtual-scroll-container"
	style="height: {visibleItems * itemHeight}px; overflow-y: auto;"
>
	<div style="height: {totalHeight}px; position: relative;">
		<div style="transform: translateY({offsetY}px);">
			{#each visibleData as item, i}
				<div style="height: {itemHeight}px;">
					<slot {item} index={startIndex + i} />
				</div>
			{/each}
		</div>
	</div>
</div>
```

#### 4.2 APIレスポンスのキャッシング

```javascript
// cacheService.js
class CacheService {
	constructor() {
		this.cache = new Map();
		this.ttl = 5 * 60 * 1000; // 5分
	}

	set(key, data) {
		this.cache.set(key, {
			data,
			timestamp: Date.now()
		});
	}

	get(key) {
		const cached = this.cache.get(key);
		if (!cached) return null;

		if (Date.now() - cached.timestamp > this.ttl) {
			this.cache.delete(key);
			return null;
		}

		return cached.data;
	}

	invalidate(pattern) {
		for (const key of this.cache.keys()) {
			if (key.includes(pattern)) {
				this.cache.delete(key);
			}
		}
	}
}

// 使用例
const cache = new CacheService();

async function getEmployees(filters) {
	const cacheKey = `employees:${JSON.stringify(filters)}`;
	const cached = cache.get(cacheKey);

	if (cached) {
		return cached;
	}

	const data = await hrService.getEmployees(filters);
	cache.set(cacheKey, data);
	return data;
}
```

### Phase 5: テスト実装

#### 5.1 単体テスト例

```javascript
// __tests__/overtimeAlertService.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { OvertimeAlertService } from '../services/overtimeAlertService';

describe('OvertimeAlertService', () => {
	let service;
	let mockPrisma;

	beforeEach(() => {
		mockPrisma = {
			$queryRaw: vi.fn()
		};
		service = new OvertimeAlertService(mockPrisma);
	});

	it('should generate warning alert for overtime > 40 hours', async () => {
		mockPrisma.$queryRaw.mockResolvedValue([
			{
				id: 1,
				name: '田中太郎',
				department: '開発部',
				total_hours: 42,
				avg_daily_hours: 2.1
			}
		]);

		const alerts = await service.generateAlerts();

		expect(alerts).toHaveLength(1);
		expect(alerts[0]).toMatchObject({
			type: 'warning',
			urgency: 'medium',
			overtimeHours: 42
		});
	});
});
```

#### 5.2 E2Eテスト例

```javascript
// e2e/employee-management.spec.js
import { test, expect } from '@playwright/test';

test.describe('従業員管理', () => {
	test('従業員の検索とフィルタリング', async ({ page }) => {
		await page.goto('/dashboards/05');

		// 従業員タブをクリック
		await page.click('text=従業員管理');

		// 検索
		await page.fill('input[placeholder="名前・職位で検索..."]', '田中');
		await page.waitForTimeout(500); // デバウンス待機

		// 結果確認
		const rows = await page.locator('tbody tr').count();
		expect(rows).toBeGreaterThan(0);

		// フィルタリング
		await page.selectOption('select:has-text("全部門")', '開発部');
		await page.waitForTimeout(500);

		// 部門でフィルタされたことを確認
		const deptCells = await page.locator('td:has-text("開発部")').count();
		expect(deptCells).toBe(rows);
	});
});
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. リアクティビティが動作しない

```javascript
// 問題のあるコード
employees.update((emps) => {
	emps.push(newEmployee); // 同じ参照のまま
	return emps;
});

// 解決方法
employees.update((emps) => [...emps, newEmployee]); // 新しい配列を返す
```

#### 2. 大量データでパフォーマンス低下

- 仮想スクロールの実装
- ページネーションの追加
- `$derived`によるメモ化
- Web Workerでの重い処理の実行

#### 3. 日本語の文字化け

- UTF-8エンコーディングの確認
- データベースの文字コード設定
- APIレスポンスのContent-Type確認

## デプロイメントチェックリスト

### 本番環境への移行前確認

- [ ] `IS_MOCK_MODE = false` に変更
- [ ] 環境変数の設定（API_URL, DB_CONNECTION等）
- [ ] SSL/TLS証明書の設定
- [ ] データベースのバックアップ設定
- [ ] ログ収集の設定
- [ ] 監視・アラートの設定
- [ ] レート制限の実装
- [ ] セキュリティヘッダーの設定

### パフォーマンスチューニング

- [ ] データベースインデックスの最適化
- [ ] APIレスポンスの圧縮（gzip）
- [ ] 静的アセットのCDN配信
- [ ] 画像の最適化（WebP形式）
- [ ] Service Workerによるキャッシング

## 参考リンク

- [Svelte 5 Documentation](https://svelte.dev/docs)
- [DaisyUI v5 Components](https://daisyui.com/components/)
- [労働基準法2024年問題について](https://www.mhlw.go.jp/)

---

このガイドは継続的に更新されます。
最終更新: 2025年1月6日
