/**
 * 在庫・物流管理ダッシュボード モックデータサービス
 *
 * @description
 * リアルタイム在庫追跡、配送管理、倉庫運営に関するモックデータを提供。
 * 地理的データ、時系列データ、予測データを含む包括的なサンプルデータセット。
 */

/**
 * 日本の主要都市座標データ（モック用）
 * 本番環境では locations テーブルで管理し、地域マスターとして使用
 *
 * CREATE TABLE locations (
 *   id BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   name VARCHAR(100) NOT NULL,
 *   prefecture VARCHAR(50),
 *   latitude DECIMAL(10,7) NOT NULL,
 *   longitude DECIMAL(10,7) NOT NULL,
 *   timezone VARCHAR(50) DEFAULT 'Asia/Tokyo',
 *   is_active BOOLEAN DEFAULT TRUE,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */
const JAPAN_LOCATIONS = {
	TOKYO: { id: 1, lat: 35.6762, lng: 139.6503, name: '東京', prefecture: '東京都' },
	OSAKA: { id: 2, lat: 34.6937, lng: 135.5023, name: '大阪', prefecture: '大阪府' },
	NAGOYA: { id: 3, lat: 35.1815, lng: 136.9066, name: '名古屋', prefecture: '愛知県' },
	FUKUOKA: { id: 4, lat: 33.5904, lng: 130.4017, name: '福岡', prefecture: '福岡県' },
	SENDAI: { id: 5, lat: 38.2682, lng: 140.8694, name: '仙台', prefecture: '宮城県' },
	HIROSHIMA: { id: 6, lat: 34.3853, lng: 132.4553, name: '広島', prefecture: '広島県' }
};

/**
 * 倉庫マスターデータ（モック用）
 * 本番環境では warehouses テーブルで管理
 *
 * CREATE TABLE warehouses (
 *   id BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   name VARCHAR(200) NOT NULL,
 *   code VARCHAR(50) UNIQUE NOT NULL,
 *   location_id BIGINT REFERENCES locations(id),
 *   address TEXT,
 *   capacity INTEGER NOT NULL,
 *   current_utilization DECIMAL(5,2),
 *   manager_id BIGINT REFERENCES employees(id),
 *   status ENUM('active', 'maintenance', 'closed') DEFAULT 'active',
 *   monthly_throughput INTEGER,
 *   categories JSON COMMENT '取り扱いカテゴリID配列',
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 *   INDEX idx_status (status),
 *   INDEX idx_location (location_id)
 * );
 */
const WAREHOUSES = [
	{
		id: 1,
		name: '東京中央倉庫',
		location: JAPAN_LOCATIONS.TOKYO,
		address: '東京都江東区豊洲3-1-1',
		capacity: 15000,
		currentUtilization: 78.5,
		status: 'active',
		manager: '田中太郎',
		categories: ['electronics', 'clothing', 'books'],
		monthlyThroughput: 35000,
		lastUpdated: new Date().toISOString()
	},
	{
		id: 2,
		name: '大阪西部倉庫',
		location: JAPAN_LOCATIONS.OSAKA,
		address: '大阪府大阪市住之江区南港北2-1-10',
		capacity: 12000,
		currentUtilization: 92.3,
		status: 'active',
		manager: '山田花子',
		categories: ['food', 'toys', 'furniture'],
		monthlyThroughput: 28000,
		lastUpdated: new Date().toISOString()
	},
	{
		id: 3,
		name: '名古屋物流センター',
		location: JAPAN_LOCATIONS.NAGOYA,
		address: '愛知県名古屋市港区金城ふ頭2-1',
		capacity: 18000,
		currentUtilization: 65.8,
		status: 'active',
		manager: '佐藤次郎',
		categories: ['electronics', 'furniture', 'books'],
		monthlyThroughput: 32000,
		lastUpdated: new Date().toISOString()
	},
	{
		id: 4,
		name: '福岡南部倉庫',
		location: JAPAN_LOCATIONS.FUKUOKA,
		address: '福岡県福岡市博多区東浜1-1-1',
		capacity: 9000,
		currentUtilization: 55.2,
		status: 'maintenance',
		manager: '鈴木三郎',
		categories: ['food', 'clothing'],
		monthlyThroughput: 18000,
		lastUpdated: new Date().toISOString()
	},
	{
		id: 5,
		name: '横浜港湾倉庫',
		location: { lat: 35.4437, lng: 139.638 },
		address: '神奈川県横浜市中区海岸通1-1',
		capacity: 20000,
		currentUtilization: 84.2,
		status: 'active',
		manager: '高橋一郎',
		categories: ['electronics', 'toys', 'clothing'],
		monthlyThroughput: 42000,
		lastUpdated: new Date().toISOString()
	},
	{
		id: 6,
		name: '千葉配送センター',
		location: { lat: 35.6074, lng: 140.1065 },
		address: '千葉県千葉市美浜区中瀬1-3',
		capacity: 14000,
		currentUtilization: 71.8,
		status: 'active',
		manager: '伊藤美紀',
		categories: ['food', 'books', 'furniture'],
		monthlyThroughput: 26000,
		lastUpdated: new Date().toISOString()
	},
	{
		id: 7,
		name: '仙台北部倉庫',
		location: { lat: 38.2682, lng: 140.8694 },
		address: '宮城県仙台市宮城野区港1-1-1',
		capacity: 8000,
		currentUtilization: 43.5,
		status: 'active',
		manager: '渡辺健一',
		categories: ['electronics', 'clothing'],
		monthlyThroughput: 15000,
		lastUpdated: new Date().toISOString()
	},
	{
		id: 8,
		name: '神戸貿易倉庫',
		location: { lat: 34.6901, lng: 135.1956 },
		address: '兵庫県神戸市中央区港島中町6-2-1',
		capacity: 16000,
		currentUtilization: 88.9,
		status: 'active',
		manager: '松本和子',
		categories: ['furniture', 'toys', 'books'],
		monthlyThroughput: 38000,
		lastUpdated: new Date().toISOString()
	},
	{
		id: 9,
		name: '広島西部センター',
		location: { lat: 34.3853, lng: 132.4553 },
		address: '広島県広島市西区商工センター1-1-1',
		capacity: 11000,
		currentUtilization: 62.1,
		status: 'active',
		manager: '小林正治',
		categories: ['food', 'electronics'],
		monthlyThroughput: 21000,
		lastUpdated: new Date().toISOString()
	},
	{
		id: 10,
		name: '札幌冷凍倉庫',
		location: { lat: 43.0642, lng: 141.3469 },
		address: '北海道札幌市白石区流通センター1-1-1',
		capacity: 7000,
		currentUtilization: 94.7,
		status: 'active',
		manager: '中村雪子',
		categories: ['food'],
		monthlyThroughput: 12000,
		lastUpdated: new Date().toISOString()
	}
];

/**
 * 商品マスターデータ（モック用）
 * 本番環境では products + product_categories + brands テーブルで管理
 *
 * CREATE TABLE product_categories (
 *   id BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   code VARCHAR(50) UNIQUE NOT NULL,
 *   name VARCHAR(100) NOT NULL,
 *   icon VARCHAR(10),
 *   color VARCHAR(20),
 *   turnover_type ENUM('low', 'medium', 'high', 'seasonal')
 * );
 *
 * CREATE TABLE brands (
 *   id BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   name VARCHAR(100) NOT NULL,
 *   country VARCHAR(50),
 *   is_active BOOLEAN DEFAULT TRUE
 * );
 *
 * CREATE TABLE products (
 *   id BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   sku VARCHAR(100) UNIQUE NOT NULL,
 *   name VARCHAR(300) NOT NULL,
 *   category_id BIGINT REFERENCES product_categories(id),
 *   brand_id BIGINT REFERENCES brands(id),
 *   unit_cost DECIMAL(10,2),
 *   unit_price DECIMAL(10,2),
 *   weight DECIMAL(8,3),
 *   dimensions JSON COMMENT 'width, height, depth in cm',
 *   turnover_rate DECIMAL(5,2) COMMENT '月間回転率',
 *   is_active BOOLEAN DEFAULT TRUE,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 *   INDEX idx_category (category_id),
 *   INDEX idx_brand (brand_id),
 *   INDEX idx_sku (sku)
 * );
 */
const PRODUCTS = [
	// Electronics Category - 家電・電子機器
	{
		id: 1,
		sku: 'ELEC-001',
		name: 'iPhone 15 Pro',
		category: 'electronics',
		unitCost: 89000,
		unitPrice: 159800,
		turnoverRate: 12.5,
		brand: 'Apple'
	},
	{
		id: 2,
		sku: 'ELEC-002',
		name: 'MacBook Air M3',
		category: 'electronics',
		unitCost: 98000,
		unitPrice: 164800,
		turnoverRate: 8.2,
		brand: 'Apple'
	},
	{
		id: 3,
		sku: 'ELEC-003',
		name: 'Galaxy S24 Ultra',
		category: 'electronics',
		unitCost: 82000,
		unitPrice: 149800,
		turnoverRate: 9.8,
		brand: 'Samsung'
	},
	{
		id: 4,
		sku: 'ELEC-004',
		name: 'iPad Pro 12.9"',
		category: 'electronics',
		unitCost: 75000,
		unitPrice: 129800,
		turnoverRate: 7.3,
		brand: 'Apple'
	},
	{
		id: 5,
		sku: 'ELEC-005',
		name: 'Nintendo Switch',
		category: 'electronics',
		unitCost: 22000,
		unitPrice: 32980,
		turnoverRate: 18.5,
		brand: 'Nintendo'
	},
	{
		id: 6,
		sku: 'ELEC-006',
		name: 'AirPods Pro',
		category: 'electronics',
		unitCost: 18000,
		unitPrice: 39800,
		turnoverRate: 24.1,
		brand: 'Apple'
	},
	{
		id: 7,
		sku: 'ELEC-007',
		name: 'Sony WH-1000XM5',
		category: 'electronics',
		unitCost: 25000,
		unitPrice: 49500,
		turnoverRate: 11.2,
		brand: 'Sony'
	},
	{
		id: 8,
		sku: 'ELEC-008',
		name: 'テレビ 55型 4K',
		category: 'electronics',
		unitCost: 85000,
		unitPrice: 159800,
		turnoverRate: 4.8,
		brand: 'Sony'
	},

	// Clothing Category - 衣料品
	{
		id: 20,
		sku: 'CLOTH-001',
		name: 'ユニクロ Tシャツ',
		category: 'clothing',
		unitCost: 800,
		unitPrice: 1990,
		turnoverRate: 28.3,
		brand: 'UNIQLO'
	},
	{
		id: 21,
		sku: 'CLOTH-002',
		name: 'リーバイス 501',
		category: 'clothing',
		unitCost: 6000,
		unitPrice: 12900,
		turnoverRate: 8.1,
		brand: "Levi's"
	},
	{
		id: 22,
		sku: 'CLOTH-003',
		name: 'ナイキ エアマックス',
		category: 'clothing',
		unitCost: 8500,
		unitPrice: 16500,
		turnoverRate: 12.7,
		brand: 'Nike'
	},
	{
		id: 23,
		sku: 'CLOTH-004',
		name: 'アディダス パーカー',
		category: 'clothing',
		unitCost: 4200,
		unitPrice: 8900,
		turnoverRate: 15.2,
		brand: 'adidas'
	},
	{
		id: 24,
		sku: 'CLOTH-005',
		name: 'GU ワイドパンツ',
		category: 'clothing',
		unitCost: 1200,
		unitPrice: 2990,
		turnoverRate: 22.8,
		brand: 'GU'
	},
	{
		id: 25,
		sku: 'CLOTH-006',
		name: 'H&M ワンピース',
		category: 'clothing',
		unitCost: 2200,
		unitPrice: 4990,
		turnoverRate: 18.5,
		brand: 'H&M'
	},

	// Food Category - 食品
	{
		id: 40,
		sku: 'FOOD-001',
		name: 'コシヒカリ 5kg',
		category: 'food',
		unitCost: 1800,
		unitPrice: 3280,
		turnoverRate: 45.0,
		brand: '新潟産'
	},
	{
		id: 41,
		sku: 'FOOD-002',
		name: 'サントリー天然水 2L',
		category: 'food',
		unitCost: 85,
		unitPrice: 198,
		turnoverRate: 78.5,
		brand: 'サントリー'
	},
	{
		id: 42,
		sku: 'FOOD-003',
		name: 'カップヌードル',
		category: 'food',
		unitCost: 98,
		unitPrice: 198,
		turnoverRate: 156.2,
		brand: '日清'
	},
	{
		id: 43,
		sku: 'FOOD-004',
		name: 'キットカット',
		category: 'food',
		unitCost: 180,
		unitPrice: 298,
		turnoverRate: 89.3,
		brand: 'ネスレ'
	},
	{
		id: 44,
		sku: 'FOOD-005',
		name: 'ポッキー',
		category: 'food',
		unitCost: 120,
		unitPrice: 248,
		turnoverRate: 92.1,
		brand: 'グリコ'
	},
	{
		id: 45,
		sku: 'FOOD-006',
		name: 'コカコーラ 500ml',
		category: 'food',
		unitCost: 68,
		unitPrice: 140,
		turnoverRate: 125.8,
		brand: 'コカコーラ'
	},

	// Furniture Category - 家具
	{
		id: 60,
		sku: 'FURN-001',
		name: 'IKEA デスク',
		category: 'furniture',
		unitCost: 8500,
		unitPrice: 16900,
		turnoverRate: 4.2,
		brand: 'IKEA'
	},
	{
		id: 61,
		sku: 'FURN-002',
		name: 'ニトリ オフィスチェア',
		category: 'furniture',
		unitCost: 12000,
		unitPrice: 24900,
		turnoverRate: 6.8,
		brand: 'ニトリ'
	},
	{
		id: 62,
		sku: 'FURN-003',
		name: '無印良品 本棚',
		category: 'furniture',
		unitCost: 15000,
		unitPrice: 29900,
		turnoverRate: 3.5,
		brand: '無印良品'
	},
	{
		id: 63,
		sku: 'FURN-004',
		name: 'ソファ 3人掛け',
		category: 'furniture',
		unitCost: 45000,
		unitPrice: 89800,
		turnoverRate: 2.1,
		brand: 'カリモク'
	},
	{
		id: 64,
		sku: 'FURN-005',
		name: 'ダイニングテーブル',
		category: 'furniture',
		unitCost: 28000,
		unitPrice: 59800,
		turnoverRate: 2.8,
		brand: 'ニトリ'
	},

	// Books Category - 書籍
	{
		id: 80,
		sku: 'BOOK-001',
		name: '鬼滅の刃 全巻セット',
		category: 'books',
		unitCost: 8500,
		unitPrice: 12960,
		turnoverRate: 15.8,
		brand: '集英社'
	},
	{
		id: 81,
		sku: 'BOOK-002',
		name: 'ビジネス書ベストセラー',
		category: 'books',
		unitCost: 1200,
		unitPrice: 1980,
		turnoverRate: 12.5,
		brand: 'ダイヤモンド社'
	},
	{
		id: 82,
		sku: 'BOOK-003',
		name: '料理レシピ本',
		category: 'books',
		unitCost: 980,
		unitPrice: 1680,
		turnoverRate: 8.9,
		brand: '主婦の友社'
	},
	{
		id: 83,
		sku: 'BOOK-004',
		name: '子供向け絵本',
		category: 'books',
		unitCost: 800,
		unitPrice: 1320,
		turnoverRate: 18.7,
		brand: '講談社'
	},

	// Toys Category - おもちゃ
	{
		id: 100,
		sku: 'TOY-001',
		name: 'レゴ クリエイター',
		category: 'toys',
		unitCost: 4500,
		unitPrice: 8980,
		turnoverRate: 18.5,
		brand: 'LEGO'
	},
	{
		id: 101,
		sku: 'TOY-002',
		name: 'トミカ ミニカーセット',
		category: 'toys',
		unitCost: 1200,
		unitPrice: 2480,
		turnoverRate: 32.1,
		brand: 'タカラトミー'
	},
	{
		id: 102,
		sku: 'TOY-003',
		name: 'ポケモンカード',
		category: 'toys',
		unitCost: 280,
		unitPrice: 495,
		turnoverRate: 85.6,
		brand: 'ポケモン'
	},
	{
		id: 103,
		sku: 'TOY-004',
		name: 'プラレール 基本セット',
		category: 'toys',
		unitCost: 2800,
		unitPrice: 5980,
		turnoverRate: 25.3,
		brand: 'タカラトミー'
	},
	{
		id: 104,
		sku: 'TOY-005',
		name: 'リカちゃん人形',
		category: 'toys',
		unitCost: 1500,
		unitPrice: 2980,
		turnoverRate: 22.8,
		brand: 'タカラトミー'
	}
];

/**
 * 車両マスターデータ（モック用）
 * 本番環境では vehicles + employees テーブルで管理
 *
 * CREATE TABLE employees (
 *   id BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   name VARCHAR(100) NOT NULL,
 *   employee_code VARCHAR(20) UNIQUE,
 *   department ENUM('logistics', 'warehouse', 'admin'),
 *   position VARCHAR(50),
 *   is_active BOOLEAN DEFAULT TRUE
 * );
 *
 * CREATE TABLE vehicles (
 *   id BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   license_plate VARCHAR(20) UNIQUE NOT NULL,
 *   vehicle_type ENUM('truck', 'van', 'motorcycle') NOT NULL,
 *   capacity_kg DECIMAL(8,2),
 *   capacity_m3 DECIMAL(6,2),
 *   fuel_efficiency DECIMAL(4,2) COMMENT 'km/L',
 *   driver_id BIGINT REFERENCES employees(id),
 *   current_status ENUM('available', 'in_use', 'maintenance') DEFAULT 'available',
 *   last_maintenance_date DATE,
 *   next_maintenance_date DATE,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 *   INDEX idx_status (current_status),
 *   INDEX idx_driver (driver_id)
 * );
 */
const VEHICLES = [
	{
		id: 1,
		licensePlate: '品川501あ1234',
		type: 'truck',
		capacityKg: 4000,
		capacityM3: 25,
		status: 'in_use',
		driver: '山田運送太郎'
	},
	{
		id: 2,
		licensePlate: '品川501あ5678',
		type: 'truck',
		capacityKg: 4000,
		capacityM3: 25,
		status: 'available',
		driver: '田中配送次郎'
	},
	{
		id: 3,
		licensePlate: '品川501い9012',
		type: 'van',
		capacityKg: 1500,
		capacityM3: 10,
		status: 'in_use',
		driver: '佐藤宅配花子'
	},
	{
		id: 4,
		licensePlate: '品川501う3456',
		type: 'van',
		capacityKg: 1500,
		capacityM3: 10,
		status: 'maintenance',
		driver: '鈴木物流三郎'
	},
	{
		id: 5,
		licensePlate: '品川501え7890',
		type: 'motorcycle',
		capacityKg: 50,
		capacityM3: 1,
		status: 'in_use',
		driver: '高橋急便一郎'
	}
];

/**
 * 倉庫データを取得
 *
 * 本番実装時のSQL例:
 * SELECT w.*, l.name as location_name, l.prefecture,
 *        e.name as manager_name
 * FROM warehouses w
 * LEFT JOIN locations l ON w.location_id = l.id
 * LEFT JOIN employees e ON w.manager_id = e.id
 * WHERE w.is_active = TRUE
 * ORDER BY w.name;
 */
export function getWarehouses() {
	return Promise.resolve({
		warehouses: WAREHOUSES,
		totalCapacity: WAREHOUSES.reduce((sum, w) => sum + w.capacity, 0),
		averageUtilization:
			WAREHOUSES.reduce((sum, w) => sum + w.currentUtilization, 0) / WAREHOUSES.length,
		activeWarehouses: WAREHOUSES.filter((w) => w.status === 'active').length
	});
}

/**
 * 在庫データを取得
 *
 * 本番実装時のSQL例:
 * SELECT i.*, p.name as product_name, p.sku, p.category_id,
 *        pc.name as category_name, pc.icon as category_icon,
 *        w.name as warehouse_name,
 *        CASE
 *          WHEN i.current_stock = 0 THEN 'out_of_stock'
 *          WHEN i.current_stock <= i.minimum_threshold THEN 'low'
 *          WHEN i.current_stock >= i.maximum_threshold THEN 'high'
 *          ELSE 'normal'
 *        END as stock_level
 * FROM inventory i
 * JOIN products p ON i.product_id = p.id
 * JOIN product_categories pc ON p.category_id = pc.id
 * JOIN warehouses w ON i.warehouse_id = w.id
 * WHERE (:warehouseId IS NULL OR i.warehouse_id = :warehouseId)
 *   AND (:category = 'all' OR pc.code = :category)
 *   AND p.is_active = TRUE
 * ORDER BY pc.name, p.name;
 */
export function getInventoryData(warehouseId = null, category = 'all') {
	const generateInventoryItem = (productId, warehouseId) => {
		const product = PRODUCTS.find((p) => p.id === productId);
		const warehouse = WAREHOUSES.find((w) => w.id === warehouseId);

		// 商品カテゴリと倉庫の適合性によって在庫量を調整
		const categoryMatch = warehouse?.categories?.includes(product?.category);
		const baseStock = categoryMatch
			? Math.floor(Math.random() * 2000) + 100
			: Math.floor(Math.random() * 500) + 20;

		// 商品の回転率に基づいて在庫量を調整
		const turnoverMultiplier = (product?.turnoverRate || 10) / 10;
		const adjustedStock = Math.floor(baseStock * turnoverMultiplier);

		// 低在庫・在庫切れのシミュレーション（リッチなデモ用）
		let currentStock = adjustedStock;
		if (Math.random() < 0.15) {
			// 15%の確率で低在庫
			currentStock = Math.floor(adjustedStock * 0.1);
		} else if (Math.random() < 0.05) {
			// 5%の確率で在庫切れ
			currentStock = 0;
		}

		const minThreshold = Math.floor(adjustedStock * 0.15);
		const maxThreshold = Math.floor(adjustedStock * 1.8);

		return {
			id: `${warehouseId}-${productId}`,
			warehouseId,
			productId,
			product,
			currentStock,
			reservedStock: Math.floor(currentStock * 0.08),
			minimumThreshold: minThreshold,
			maximumThreshold: maxThreshold,
			reorderPoint: minThreshold * 2,
			stockLevel:
				currentStock === 0
					? 'out_of_stock'
					: currentStock <= minThreshold
						? 'low'
						: currentStock >= maxThreshold
							? 'high'
							: 'normal',
			turnoverDays: Math.floor(30 / (product?.turnoverRate || 1)),
			lastMovement: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
			// デモ用の追加データ
			averageDailySales: Math.floor(((product?.turnoverRate || 1) * currentStock) / 30),
			daysToStockout:
				currentStock > 0
					? Math.floor(
							currentStock /
								Math.max(1, Math.floor(((product?.turnoverRate || 1) * currentStock) / 30))
						)
					: 0,
			profitMargin:
				product?.unitPrice && product?.unitCost
					? (((product.unitPrice - product.unitCost) / product.unitPrice) * 100).toFixed(1)
					: '0'
		};
	};

	const warehouses = warehouseId ? [warehouseId] : WAREHOUSES.map((w) => w.id);
	const products = category === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);

	const inventory = [];
	warehouses.forEach((wId) => {
		const warehouse = WAREHOUSES.find((w) => w.id === wId);
		products.forEach((product) => {
			// 倉庫のカテゴリに含まれる商品は90%の確率で存在、それ以外は40%
			const existProbability = warehouse?.categories?.includes(product.category) ? 0.9 : 0.4;
			if (Math.random() < existProbability) {
				inventory.push(generateInventoryItem(product.id, wId));
			}
		});
	});

	return Promise.resolve({
		inventory,
		summary: {
			totalItems: inventory.length,
			outOfStockItems: inventory.filter((item) => item.stockLevel === 'out_of_stock').length,
			lowStockItems: inventory.filter((item) => item.stockLevel === 'low').length,
			normalStockItems: inventory.filter((item) => item.stockLevel === 'normal').length,
			highStockItems: inventory.filter((item) => item.stockLevel === 'high').length,
			totalValue: inventory.reduce(
				(sum, item) => sum + item.currentStock * (item.product?.unitCost || 0),
				0
			),
			totalStockUnits: inventory.reduce((sum, item) => sum + item.currentStock, 0),
			averageTurnoverDays:
				inventory.length > 0
					? Math.floor(
							inventory.reduce((sum, item) => sum + item.turnoverDays, 0) / inventory.length
						)
					: 0
		}
	});
}

/**
 * 配送データを取得
 */
export function getDeliveryData(status = 'all', timeRange = '24h') {
	const generateDelivery = (id) => {
		const statuses = ['pending', 'in_transit', 'delivered', 'delayed'];
		const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
		const warehouse = WAREHOUSES[Math.floor(Math.random() * WAREHOUSES.length)];
		const vehicle = VEHICLES[Math.floor(Math.random() * VEHICLES.length)];

		// ランダムな配送先（日本の主要都市周辺）
		const cities = Object.values(JAPAN_LOCATIONS);
		const destination = cities[Math.floor(Math.random() * cities.length)];
		const destLat = destination.lat + (Math.random() - 0.5) * 0.1;
		const destLng = destination.lng + (Math.random() - 0.5) * 0.1;

		// 配送中の場合は中間地点
		const currentLat =
			randomStatus === 'in_transit'
				? warehouse.location.lat + (destLat - warehouse.location.lat) * Math.random()
				: warehouse.location.lat;
		const currentLng =
			randomStatus === 'in_transit'
				? warehouse.location.lng + (destLng - warehouse.location.lng) * Math.random()
				: warehouse.location.lng;

		const estimatedTime = new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000);
		const actualTime =
			randomStatus === 'delivered'
				? new Date(estimatedTime.getTime() - Math.random() * 2 * 60 * 60 * 1000)
				: null;

		return {
			id,
			orderId: `ORD-${String(id).padStart(6, '0')}`,
			warehouseId: warehouse.id,
			warehouse,
			vehicleId: vehicle.id,
			vehicle,
			status: randomStatus,
			destination: {
				lat: destLat,
				lng: destLng,
				address: `${destination.name}市内配送先`,
				customerName: `顧客${id}`
			},
			currentLocation: {
				lat: currentLat,
				lng: currentLng
			},
			estimatedArrival: estimatedTime.toISOString(),
			actualArrival: actualTime?.toISOString(),
			distance: Math.floor(Math.random() * 50) + 5,
			items: Math.floor(Math.random() * 5) + 1,
			priority: Math.random() > 0.8 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low',
			createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
		};
	};

	const deliveries = Array.from({ length: 150 }, (_, i) => generateDelivery(i + 1));

	const filtered = status === 'all' ? deliveries : deliveries.filter((d) => d.status === status);

	return Promise.resolve({
		deliveries: filtered,
		summary: {
			total: deliveries.length,
			pending: deliveries.filter((d) => d.status === 'pending').length,
			inTransit: deliveries.filter((d) => d.status === 'in_transit').length,
			delivered: deliveries.filter((d) => d.status === 'delivered').length,
			delayed: deliveries.filter((d) => d.status === 'delayed').length,
			averageDeliveryTime: 4.2, // hours
			onTimeRate: 87.5 // percentage
		}
	});
}

/**
 * 車両データを取得
 */
export function getVehicleData() {
	const enhancedVehicles = VEHICLES.map((vehicle) => ({
		...vehicle,
		currentLocation:
			vehicle.status === 'in_use'
				? {
						lat: JAPAN_LOCATIONS.TOKYO.lat + (Math.random() - 0.5) * 0.2,
						lng: JAPAN_LOCATIONS.TOKYO.lng + (Math.random() - 0.5) * 0.2
					}
				: null,
		fuelLevel: Math.floor(Math.random() * 100),
		maintenanceScore: Math.floor(Math.random() * 100),
		dailyDistance: Math.floor(Math.random() * 300) + 50,
		currentLoad: vehicle.status === 'in_use' ? Math.floor(Math.random() * 80) + 10 : 0
	}));

	return Promise.resolve({
		vehicles: enhancedVehicles,
		summary: {
			total: enhancedVehicles.length,
			available: enhancedVehicles.filter((v) => v.status === 'available').length,
			inUse: enhancedVehicles.filter((v) => v.status === 'in_use').length,
			maintenance: enhancedVehicles.filter((v) => v.status === 'maintenance').length,
			averageUtilization: 68.3,
			totalCapacityKg: enhancedVehicles.reduce((sum, v) => sum + v.capacityKg, 0)
		}
	});
}

/**
 * 在庫移動履歴を取得
 */
export function getInventoryMovements(days = 7) {
	const movements = [];
	const movementTypes = ['inbound', 'outbound', 'transfer', 'adjustment'];

	for (let i = 0; i < 200; i++) {
		const movement = {
			id: i + 1,
			warehouseId: WAREHOUSES[Math.floor(Math.random() * WAREHOUSES.length)].id,
			productId: PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)].id,
			movementType: movementTypes[Math.floor(Math.random() * movementTypes.length)],
			quantity: Math.floor(Math.random() * 100) + 1,
			referenceId: `REF-${String(i + 1).padStart(6, '0')}`,
			recordedAt: new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000).toISOString(),
			recordedBy: '物流担当者'
		};
		movements.push(movement);
	}

	return Promise.resolve({
		movements,
		summary: {
			inbound: movements.filter((m) => m.movementType === 'inbound').length,
			outbound: movements.filter((m) => m.movementType === 'outbound').length,
			transfers: movements.filter((m) => m.movementType === 'transfer').length,
			adjustments: movements.filter((m) => m.movementType === 'adjustment').length
		}
	});
}

/**
 * アラートデータを取得
 */
export function getAlerts() {
	const alerts = [
		{
			id: 1,
			type: 'INVENTORY_LOW',
			priority: 'HIGH',
			title: '低在庫アラート',
			message: 'スマートフォン（ELEC-001）の在庫が最低基準を下回りました',
			warehouseId: 1,
			productId: 1,
			timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
			acknowledged: false
		},
		{
			id: 2,
			type: 'DELIVERY_DELAYED',
			priority: 'MEDIUM',
			title: '配送遅延',
			message: '配送ID: DEL-001234 が予定時刻より2時間遅れています',
			deliveryId: 123,
			timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
			acknowledged: true
		},
		{
			id: 3,
			type: 'WAREHOUSE_FULL',
			priority: 'HIGH',
			title: '倉庫容量警告',
			message: '大阪西部倉庫の使用率が90%を超えました',
			warehouseId: 2,
			timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
			acknowledged: false
		}
	];

	return Promise.resolve(alerts);
}

/**
 * 予測分析データを取得
 */
export function getPredictionData(type = 'demand', timeframe = '30days') {
	const timeframeDays =
		timeframe === '7days' ? 7 : timeframe === '30days' ? 30 : timeframe === '90days' ? 90 : 365;

	const predictions = {
		demand: {
			forecast: Array.from({ length: timeframeDays }, (_, i) => ({
				date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
				predicted: Math.floor(Math.random() * 300) + 150,
				confidence: Math.random() * 0.25 + 0.75,
				trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down'
			})),
			summary: {
				expectedRevenue: 12500000,
				growthRate: 15.2,
				peakDay: '2025-03-15',
				recommendedOrders: 247,
				riskLevel: 'low'
			},
			topProducts: [
				{ id: 1, name: 'iPhone 15 Pro', expectedGrowth: 28.5, demandLevel: 'HIGH' },
				{ id: 20, name: 'ユニクロ Tシャツ', expectedGrowth: 22.1, demandLevel: 'HIGH' },
				{ id: 40, name: 'コシヒカリ 5kg', expectedGrowth: 18.7, demandLevel: 'MEDIUM' },
				{ id: 5, name: 'Nintendo Switch', expectedGrowth: 15.3, demandLevel: 'MEDIUM' },
				{ id: 100, name: 'レゴ クリエイター', expectedGrowth: 12.9, demandLevel: 'MEDIUM' }
			]
		},
		routes: {
			optimizations: [
				{
					routeId: 'RT-001',
					currentDistance: 285.2,
					optimizedDistance: 228.8,
					timeSaved: 2.5, // hours
					fuelSaved: 45.5, // liters
					co2Reduced: 108.2, // kg
					costSaving: 185000 // yen
				}
			],
			summary: {
				totalDistanceReduction: 328,
				totalTimeSaved: 42,
				totalFuelSaved: 450,
				totalCostSaving: 185000,
				efficiencyImprovement: 15.2,
				customerSatisfactionGain: 8.7
			}
		},
		inventory: {
			optimization: {
				totalReduction: 8500000,
				turnoverImprovement: 22.4,
				stockoutRiskReduction: 65,
				categories: [
					{ category: 'electronics', current: 15000, optimal: 12500, action: 'reduce' },
					{ category: 'clothing', current: 8500, optimal: 10200, action: 'increase' },
					{ category: 'food', current: 25000, optimal: 18000, action: 'reduce' },
					{ category: 'furniture', current: 3200, optimal: 2800, action: 'reduce' }
				]
			}
		},
		cost: {
			analysis: {
				totalSavings: 3200000,
				roiImprovement: 18.5,
				efficiencyScore: 94.2,
				breakdown: [
					{ category: '配送費', current: 2800000, optimized: 2350000 },
					{ category: '倉庫費', current: 1200000, optimized: 980000 },
					{ category: '人件費', current: 3500000, optimized: 3200000 },
					{ category: '燃料費', current: 850000, optimized: 680000 }
				]
			}
		}
	};

	return Promise.resolve(predictions[type] || predictions.demand);
}

/**
 * ダッシュボード分析データを取得
 */
export function getAnalyticsData(timeRange = '7days') {
	return Promise.resolve({
		kpis: {
			totalOrders: 1247,
			ordersChange: '+12.3%',
			deliveryRate: 94.8,
			deliveryRateChange: '+2.1%',
			averageDeliveryTime: 4.2,
			deliveryTimeChange: '-0.8h',
			inventoryTurnover: 8.7,
			turnoverChange: '+5.2%',
			warehouseUtilization: 73.2,
			utilizationChange: '+3.4%',
			fuelEfficiency: 12.8,
			efficiencyChange: '+1.2L/100km'
		},
		trends: {
			orderVolume: Array.from({ length: 7 }, (_, i) => ({
				date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
				orders: Math.floor(Math.random() * 100) + 150,
				delivered: Math.floor(Math.random() * 90) + 140
			})),
			inventoryLevels: PRODUCTS.map((product) => ({
				productId: product.id,
				productName: product.name,
				category: product.category,
				currentLevel: Math.floor(Math.random() * 100),
				optimalLevel: 70,
				trend: Math.random() > 0.5 ? 'up' : 'down'
			}))
		}
	});
}

/**
 * リアルタイム更新データ（WebSocket シミュレーション）
 */
export function subscribeToRealTimeUpdates(callback) {
	const interval = setInterval(() => {
		const updateType = Math.random();

		if (updateType < 0.3) {
			// 配送位置更新
			callback({
				type: 'DELIVERY_LOCATION_UPDATE',
				data: {
					deliveryId: Math.floor(Math.random() * 50) + 1,
					location: {
						lat: 35.6762 + (Math.random() - 0.5) * 0.2,
						lng: 139.6503 + (Math.random() - 0.5) * 0.2
					},
					timestamp: new Date().toISOString()
				}
			});
		} else if (updateType < 0.6) {
			// 在庫更新
			callback({
				type: 'INVENTORY_UPDATE',
				data: {
					warehouseId: Math.floor(Math.random() * 4) + 1,
					productId: Math.floor(Math.random() * 9) + 1,
					newStock: Math.floor(Math.random() * 1000),
					timestamp: new Date().toISOString()
				}
			});
		} else if (updateType < 0.8) {
			// 配送ステータス更新
			callback({
				type: 'DELIVERY_STATUS_UPDATE',
				data: {
					deliveryId: Math.floor(Math.random() * 50) + 1,
					newStatus: ['in_transit', 'delivered'][Math.floor(Math.random() * 2)],
					timestamp: new Date().toISOString()
				}
			});
		} else {
			// 新しいアラート
			callback({
				type: 'NEW_ALERT',
				data: {
					id: Date.now(),
					type: 'SYSTEM_UPDATE',
					priority: 'LOW',
					message: 'システム状況: 正常動作中',
					timestamp: new Date().toISOString()
				}
			});
		}
	}, 5000);

	return () => clearInterval(interval);
}
