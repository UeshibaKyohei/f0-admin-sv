// マスターデータ（カテゴリ、タグ、商品）
import type { Category, Tag, Product, ProductAttribute } from '../types';

// カテゴリデータ
export const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'IT機器', code: 'IT', parentId: undefined, sortOrder: 1, isActive: true },
  { id: 'cat-2', name: 'オフィス家具', code: 'FUR', parentId: undefined, sortOrder: 2, isActive: true },
  { id: 'cat-3', name: '事務用品', code: 'OFF', parentId: undefined, sortOrder: 3, isActive: true },
  { id: 'cat-4', name: '電子機器', code: 'ELEC', parentId: undefined, sortOrder: 4, isActive: true },
  // サブカテゴリ
  { id: 'cat-1-1', name: 'PC・ノートPC', code: 'IT-PC', parentId: 'cat-1', sortOrder: 1, isActive: true },
  { id: 'cat-1-2', name: '周辺機器', code: 'IT-PER', parentId: 'cat-1', sortOrder: 2, isActive: true },
  { id: 'cat-1-3', name: 'ネットワーク機器', code: 'IT-NET', parentId: 'cat-1', sortOrder: 3, isActive: true },
  { id: 'cat-2-1', name: 'デスク', code: 'FUR-DSK', parentId: 'cat-2', sortOrder: 1, isActive: true },
  { id: 'cat-2-2', name: 'チェア', code: 'FUR-CHR', parentId: 'cat-2', sortOrder: 2, isActive: true },
  { id: 'cat-3-1', name: '文房具', code: 'OFF-STA', parentId: 'cat-3', sortOrder: 1, isActive: true },
  { id: 'cat-3-2', name: '用紙類', code: 'OFF-PPR', parentId: 'cat-3', sortOrder: 2, isActive: true },
];

// タグデータ
export const DEMO_TAGS: Tag[] = [
  { id: 'tag-1', name: '新商品', color: 'badge-primary', description: '直近3ヶ月以内に追加された商品' },
  { id: 'tag-2', name: '要補充', color: 'badge-warning', description: '在庫が少なくなっている商品' },
  { id: 'tag-3', name: '人気商品', color: 'badge-success', description: '出荷頻度が高い商品' },
  { id: 'tag-4', name: '要検査', color: 'badge-error', description: '定期検査が必要な商品' },
  { id: 'tag-5', name: '長期保管', color: 'badge-info', description: '6ヶ月以上動きがない商品' },
  { id: 'tag-6', name: 'エコ商品', color: 'badge-accent', description: '環境配慮型商品' },
  { id: 'tag-7', name: '高額商品', color: 'badge-secondary', description: '単価10万円以上の商品' },
  { id: 'tag-8', name: 'レンタル可', color: 'badge-neutral', description: 'レンタル対応可能な商品' },
];

// 商品マスターデータ
export function generateProducts(): Product[] {
  const now = new Date();
  const products: Product[] = [
    // IT機器 - PC・ノートPC
    {
      id: 'prod-1',
      name: 'ノートPC Dell Latitude 5520',
      sku: 'LT-DELL-5520',
      janCode: '4988888888881',
      categoryId: 'cat-1-1',
      subCategoryIds: [],
      tags: ['tag-3', 'tag-7'],
      attributes: [
        { id: 'attr-1-1', name: 'CPU', value: 'Intel Core i5-1135G7', sortOrder: 1 },
        { id: 'attr-1-2', name: 'メモリ', value: '8GB', unit: 'GB', sortOrder: 2 },
        { id: 'attr-1-3', name: 'ストレージ', value: '256', unit: 'GB SSD', sortOrder: 3 },
        { id: 'attr-1-4', name: '画面サイズ', value: '15.6', unit: 'インチ', sortOrder: 4 }
      ],
      description: 'ビジネス向けスタンダードノートPC',
      manufacturer: 'Dell',
      model: 'Latitude 5520',
      unit: '台',
      minStockLevel: 5,
      maxStockLevel: 50,
      reorderPoint: 10,
      reorderQuantity: 20,
      leadTimeDays: 7,
      isActive: true,
      createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      updatedAt: now
    },
    {
      id: 'prod-2',
      name: 'デスクトップPC HP ProDesk 400 G6',
      sku: 'DT-HP-400G6',
      janCode: '4988888888882',
      categoryId: 'cat-1-1',
      tags: ['tag-3'],
      attributes: [
        { id: 'attr-2-1', name: 'CPU', value: 'Intel Core i7-9700', sortOrder: 1 },
        { id: 'attr-2-2', name: 'メモリ', value: '16GB', unit: 'GB', sortOrder: 2 },
        { id: 'attr-2-3', name: 'ストレージ', value: '512', unit: 'GB SSD', sortOrder: 3 }
      ],
      manufacturer: 'HP',
      model: 'ProDesk 400 G6',
      unit: '台',
      minStockLevel: 3,
      reorderPoint: 5,
      reorderQuantity: 10,
      leadTimeDays: 10,
      isActive: true,
      createdAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      updatedAt: now
    },
    
    // IT機器 - 周辺機器
    {
      id: 'prod-3',
      name: 'モニター Dell 24インチ FHD',
      sku: 'MON-DELL-24FHD',
      categoryId: 'cat-1-2',
      tags: ['tag-3', 'tag-6'],
      attributes: [
        { id: 'attr-3-1', name: 'サイズ', value: '24', unit: 'インチ', sortOrder: 1 },
        { id: 'attr-3-2', name: '解像度', value: '1920×1080', unit: 'px', sortOrder: 2 },
        { id: 'attr-3-3', name: 'パネル', value: 'IPS', sortOrder: 3 },
        { id: 'attr-3-4', name: 'リフレッシュレート', value: '60', unit: 'Hz', sortOrder: 4 }
      ],
      manufacturer: 'Dell',
      model: 'P2422H',
      unit: '台',
      minStockLevel: 10,
      reorderPoint: 20,
      reorderQuantity: 30,
      leadTimeDays: 5,
      isActive: true,
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      updatedAt: now
    },
    {
      id: 'prod-4',
      name: 'キーボード ロジクール K380',
      sku: 'KB-LOG-K380',
      categoryId: 'cat-1-2',
      tags: ['tag-6'],
      attributes: [
        { id: 'attr-4-1', name: '接続方式', value: 'Bluetooth', sortOrder: 1 },
        { id: 'attr-4-2', name: 'キー配列', value: '日本語108', sortOrder: 2 },
        { id: 'attr-4-3', name: '電源', value: '単4電池×2', sortOrder: 3 }
      ],
      manufacturer: 'Logicool',
      model: 'K380',
      unit: '個',
      minStockLevel: 20,
      reorderPoint: 30,
      reorderQuantity: 50,
      leadTimeDays: 3,
      isActive: true,
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: now
    },
    
    // オフィス家具
    {
      id: 'prod-5',
      name: 'オフィスデスク 140×70cm',
      sku: 'DSK-STD-140',
      categoryId: 'cat-2-1',
      tags: ['tag-1'],
      attributes: [
        { id: 'attr-5-1', name: '幅', value: '140', unit: 'cm', sortOrder: 1 },
        { id: 'attr-5-2', name: '奥行', value: '70', unit: 'cm', sortOrder: 2 },
        { id: 'attr-5-3', name: '高さ', value: '72', unit: 'cm', sortOrder: 3 },
        { id: 'attr-5-4', name: '耐荷重', value: '80', unit: 'kg', sortOrder: 4 },
        { id: 'attr-5-5', name: '色', value: 'ホワイト', sortOrder: 5 }
      ],
      manufacturer: 'オカムラ',
      unit: '台',
      minStockLevel: 5,
      reorderPoint: 8,
      reorderQuantity: 10,
      leadTimeDays: 14,
      isActive: true,
      createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      updatedAt: now
    },
    {
      id: 'prod-6',
      name: 'エルゴノミクスチェア',
      sku: 'CHR-ERG-001',
      categoryId: 'cat-2-2',
      tags: ['tag-3', 'tag-7'],
      attributes: [
        { id: 'attr-6-1', name: '座面高', value: '42-52', unit: 'cm', sortOrder: 1 },
        { id: 'attr-6-2', name: '肘掛け', value: '3D調整可能', sortOrder: 2 },
        { id: 'attr-6-3', name: 'ランバーサポート', value: 'あり', sortOrder: 3 },
        { id: 'attr-6-4', name: '耐荷重', value: '120', unit: 'kg', sortOrder: 4 }
      ],
      manufacturer: 'ハーマンミラー',
      model: 'Aeron',
      unit: '脚',
      minStockLevel: 3,
      reorderPoint: 5,
      reorderQuantity: 8,
      leadTimeDays: 21,
      isActive: true,
      createdAt: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000),
      updatedAt: now
    },
    
    // 事務用品
    {
      id: 'prod-7',
      name: 'コピー用紙 A4 500枚',
      sku: 'PPR-A4-500',
      categoryId: 'cat-3-2',
      tags: ['tag-3', 'tag-6'],
      attributes: [
        { id: 'attr-7-1', name: 'サイズ', value: 'A4', sortOrder: 1 },
        { id: 'attr-7-2', name: '枚数', value: '500', unit: '枚', sortOrder: 2 },
        { id: 'attr-7-3', name: '坪量', value: '64', unit: 'g/m²', sortOrder: 3 },
        { id: 'attr-7-4', name: '白色度', value: '93', unit: '%', sortOrder: 4 }
      ],
      manufacturer: '富士ゼロックス',
      unit: '冊',
      minStockLevel: 100,
      reorderPoint: 200,
      reorderQuantity: 500,
      leadTimeDays: 2,
      isActive: true,
      createdAt: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      updatedAt: now
    },
    {
      id: 'prod-8',
      name: 'ボールペン 黒 0.7mm 12本入',
      sku: 'PEN-BLK-07-12',
      categoryId: 'cat-3-1',
      tags: [],
      attributes: [
        { id: 'attr-8-1', name: '色', value: '黒', sortOrder: 1 },
        { id: 'attr-8-2', name: '太さ', value: '0.7', unit: 'mm', sortOrder: 2 },
        { id: 'attr-8-3', name: '本数', value: '12', unit: '本', sortOrder: 3 }
      ],
      manufacturer: '三菱鉛筆',
      model: 'ジェットストリーム',
      unit: '箱',
      minStockLevel: 50,
      reorderPoint: 80,
      reorderQuantity: 100,
      leadTimeDays: 1,
      isActive: true,
      createdAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      updatedAt: now
    },
    
    // 電子機器
    {
      id: 'prod-9',
      name: 'プロジェクター フルHD',
      sku: 'PRJ-FHD-001',
      categoryId: 'cat-4',
      tags: ['tag-7', 'tag-8'],
      attributes: [
        { id: 'attr-9-1', name: '解像度', value: '1920×1080', unit: 'px', sortOrder: 1 },
        { id: 'attr-9-2', name: '明るさ', value: '3000', unit: 'ルーメン', sortOrder: 2 },
        { id: 'attr-9-3', name: 'コントラスト比', value: '15000:1', sortOrder: 3 },
        { id: 'attr-9-4', name: '投影距離', value: '1.5-10', unit: 'm', sortOrder: 4 }
      ],
      manufacturer: 'EPSON',
      model: 'EB-W06',
      unit: '台',
      minStockLevel: 2,
      reorderPoint: 3,
      reorderQuantity: 5,
      leadTimeDays: 7,
      isActive: true,
      createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      updatedAt: now
    },
    {
      id: 'prod-10',
      name: 'ウェブカメラ 1080p',
      sku: 'CAM-HD-1080',
      categoryId: 'cat-4',
      tags: ['tag-1', 'tag-3'],
      attributes: [
        { id: 'attr-10-1', name: '解像度', value: '1920×1080', unit: 'px', sortOrder: 1 },
        { id: 'attr-10-2', name: 'フレームレート', value: '30', unit: 'fps', sortOrder: 2 },
        { id: 'attr-10-3', name: 'マイク', value: '内蔵ステレオ', sortOrder: 3 },
        { id: 'attr-10-4', name: '視野角', value: '78', unit: '度', sortOrder: 4 }
      ],
      manufacturer: 'Logicool',
      model: 'C920n',
      unit: '個',
      minStockLevel: 10,
      reorderPoint: 15,
      reorderQuantity: 20,
      leadTimeDays: 3,
      isActive: true,
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: now
    }
  ];
  
  return products;
}

// カテゴリ階層を取得
export function getCategoryHierarchy(categoryId: string): Category[] {
  const hierarchy: Category[] = [];
  let current = DEMO_CATEGORIES.find(c => c.id === categoryId);
  
  while (current) {
    hierarchy.unshift(current);
    current = current.parentId ? DEMO_CATEGORIES.find(c => c.id === current!.parentId) : undefined;
  }
  
  return hierarchy;
}

// カテゴリの子カテゴリを取得
export function getChildCategories(parentId: string | undefined): Category[] {
  return DEMO_CATEGORIES.filter(c => c.parentId === parentId);
}