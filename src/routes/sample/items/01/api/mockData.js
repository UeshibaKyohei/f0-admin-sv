// モックデータ生成

// カテゴリーデータ
export const categories = [
  // ルートカテゴリー
  { id: 'cat-1', name: '電子機器', description: 'スマートフォン、PC、家電など', parentId: null, path: 'electronics', level: 0, sortOrder: 1 },
  { id: 'cat-2', name: 'ファッション', description: '衣類、靴、アクセサリーなど', parentId: null, path: 'fashion', level: 0, sortOrder: 2 },
  { id: 'cat-3', name: '書籍', description: '本、雑誌、電子書籍など', parentId: null, path: 'books', level: 0, sortOrder: 3 },
  { id: 'cat-4', name: '食品・飲料', description: '食料品、飲み物、お菓子など', parentId: null, path: 'food', level: 0, sortOrder: 4 },
  
  // サブカテゴリー（電子機器）
  { id: 'cat-11', name: 'スマートフォン', description: 'iPhone、Androidなど', parentId: 'cat-1', path: 'electronics/smartphones', level: 1, sortOrder: 1 },
  { id: 'cat-12', name: 'ノートPC', description: 'MacBook、Windows PCなど', parentId: 'cat-1', path: 'electronics/laptops', level: 1, sortOrder: 2 },
  { id: 'cat-13', name: 'タブレット', description: 'iPad、Androidタブレットなど', parentId: 'cat-1', path: 'electronics/tablets', level: 1, sortOrder: 3 },
  { id: 'cat-14', name: 'オーディオ', description: 'ヘッドホン、スピーカーなど', parentId: 'cat-1', path: 'electronics/audio', level: 1, sortOrder: 4 },
  
  // サブカテゴリー（ファッション）
  { id: 'cat-21', name: 'メンズウェア', description: '男性用衣類', parentId: 'cat-2', path: 'fashion/mens', level: 1, sortOrder: 1 },
  { id: 'cat-22', name: 'レディースウェア', description: '女性用衣類', parentId: 'cat-2', path: 'fashion/womens', level: 1, sortOrder: 2 },
  { id: 'cat-23', name: '靴', description: 'スニーカー、ブーツなど', parentId: 'cat-2', path: 'fashion/shoes', level: 1, sortOrder: 3 },
  { id: 'cat-24', name: 'アクセサリー', description: '時計、ジュエリーなど', parentId: 'cat-2', path: 'fashion/accessories', level: 1, sortOrder: 4 },
];

// タグデータ
export const tags = [
  { id: 'tag-1', name: '新商品', color: 'badge-primary' },
  { id: 'tag-2', name: 'セール', color: 'badge-secondary' },
  { id: 'tag-3', name: '人気商品', color: 'badge-accent' },
  { id: 'tag-4', name: '限定品', color: 'badge-warning' },
  { id: 'tag-5', name: 'エコ商品', color: 'badge-success' },
  { id: 'tag-6', name: 'プレミアム', color: 'badge-info' },
  { id: 'tag-7', name: '在庫わずか', color: 'badge-error' },
  { id: 'tag-8', name: 'おすすめ', color: 'badge-ghost' },
];

// 商品画像URL生成
function generateImageUrl(productName, index) {
  // Picsum Photosを使用した固定画像URL
  const imageMap = {
    'ProPhone 15 Pro Max': [
      'https://picsum.photos/id/160/400/400', // スマートフォン風
      'https://picsum.photos/id/96/400/400'    // テクノロジー風
    ],
    'Galaxy Ultra 24': [
      'https://picsum.photos/id/160/400/400',  // スマートフォン風
    ],
    'MacBook Pro 16インチ M3 Max': [
      'https://picsum.photos/id/0/400/400',    // ラップトップ
      'https://picsum.photos/id/2/400/400'     // デスク風景
    ],
    'ThinkPad X1 Carbon Gen 11': [
      'https://picsum.photos/id/180/400/400',  // ラップトップ風
    ],
    'iPad Pro 12.9インチ': [
      'https://picsum.photos/id/6/400/400',    // デスク上のデバイス
    ],
    'AirPods Pro 第2世代': [
      'https://picsum.photos/id/201/400/400',  // テクノロジー製品
    ],
    'Sony WH-1000XM5': [
      'https://picsum.photos/id/39/400/400',   // ヘッドホン風
    ],
    'オーガニックコットンTシャツ': [
      'https://picsum.photos/id/292/400/400',  // ファッション
    ],
    'ストレッチデニムジーンズ': [
      'https://picsum.photos/id/292/400/400',  // ファッション
    ],
    'エアマックス 2024': [
      'https://picsum.photos/id/164/400/400',  // スニーカー風
      'https://picsum.photos/id/103/400/400'   // 靴
    ],
    'スマートウォッチ Pro 8': [
      'https://picsum.photos/id/201/400/400',  // ウォッチ風
    ],
    'プログラミング実践ガイド 2024年版': [
      'https://picsum.photos/id/24/400/400',   // 本
    ],
    'オーガニックコーヒー豆 1kg': [
      'https://picsum.photos/id/225/400/400',  // コーヒー
    ],
    '旧型スマートフォン X': [
      'https://picsum.photos/id/160/400/400',  // スマートフォン風
    ]
  };
  
  const images = imageMap[productName];
  if (images && images[index - 1]) {
    return images[index - 1];
  }
  
  // デフォルト画像
  return `https://picsum.photos/id/${100 + index}/400/400`;
}

// 商品データ生成
export function generateProducts() {
  const products = [
    // スマートフォン
    {
      id: 'prod-1',
      name: 'ProPhone 15 Pro Max',
      description: '最新の高性能スマートフォン。5G対応、トリプルカメラ搭載。',
      price: 189800,
      categoryId: 'cat-11',
      tags: ['tag-1', 'tag-3', 'tag-6'],
      images: [
        { id: 'img-1-1', url: generateImageUrl('スマートフォン', 1), alt: 'ProPhone 15 Pro Max 正面', isPrimary: true, sortOrder: 1 },
        { id: 'img-1-2', url: generateImageUrl('スマートフォン', 2), alt: 'ProPhone 15 Pro Max 背面', isPrimary: false, sortOrder: 2 },
      ],
      stock: 45,
      stockStatus: 'in_stock',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-02-01')
    },
    {
      id: 'prod-2',
      name: 'Galaxy Ultra 24',
      description: 'Androidフラッグシップモデル。Sペン付属、8K動画撮影対応。',
      price: 154800,
      categoryId: 'cat-11',
      tags: ['tag-1', 'tag-8'],
      images: [
        { id: 'img-2-1', url: generateImageUrl('スマートフォン', 3), alt: 'Galaxy Ultra 24', isPrimary: true, sortOrder: 1 },
      ],
      stock: 12,
      stockStatus: 'low_stock',
      status: 'active',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    },
    
    // ノートPC
    {
      id: 'prod-3',
      name: 'MacBook Pro 16インチ M3 Max',
      description: 'プロフェッショナル向け高性能ノートPC。M3 Maxチップ搭載。',
      price: 398800,
      categoryId: 'cat-12',
      tags: ['tag-3', 'tag-6'],
      images: [
        { id: 'img-3-1', url: generateImageUrl('ノートPC', 1), alt: 'MacBook Pro 16インチ', isPrimary: true, sortOrder: 1 },
        { id: 'img-3-2', url: generateImageUrl('ノートPC', 2), alt: 'MacBook Pro キーボード', isPrimary: false, sortOrder: 2 },
      ],
      stock: 8,
      stockStatus: 'low_stock',
      status: 'active',
      createdAt: new Date('2023-11-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'prod-4',
      name: 'ThinkPad X1 Carbon Gen 11',
      description: 'ビジネス向け軽量ノートPC。14インチ、重量約1.12kg。',
      price: 298000,
      categoryId: 'cat-12',
      tags: ['tag-8'],
      images: [
        { id: 'img-4-1', url: generateImageUrl('ノートPC', 3), alt: 'ThinkPad X1 Carbon', isPrimary: true, sortOrder: 1 },
      ],
      stock: 25,
      stockStatus: 'in_stock',
      status: 'active',
      createdAt: new Date('2023-08-15'),
      updatedAt: new Date('2023-12-01')
    },
    
    // タブレット
    {
      id: 'prod-5',
      name: 'iPad Pro 12.9インチ',
      description: 'M2チップ搭載のプロ向けタブレット。Apple Pencil対応。',
      price: 172800,
      categoryId: 'cat-13',
      tags: ['tag-3', 'tag-6'],
      images: [
        { id: 'img-5-1', url: generateImageUrl('タブレット', 1), alt: 'iPad Pro 12.9インチ', isPrimary: true, sortOrder: 1 },
      ],
      stock: 0,
      stockStatus: 'out_of_stock',
      status: 'active',
      createdAt: new Date('2023-10-24'),
      updatedAt: new Date('2024-01-30')
    },
    
    // オーディオ
    {
      id: 'prod-6',
      name: 'AirPods Pro 第2世代',
      description: 'アクティブノイズキャンセリング搭載ワイヤレスイヤホン。',
      price: 39800,
      categoryId: 'cat-14',
      tags: ['tag-3', 'tag-8'],
      images: [
        { id: 'img-6-1', url: generateImageUrl('ヘッドホン', 1), alt: 'AirPods Pro', isPrimary: true, sortOrder: 1 },
      ],
      stock: 120,
      stockStatus: 'in_stock',
      status: 'active',
      createdAt: new Date('2023-09-12'),
      updatedAt: new Date('2023-09-12')
    },
    {
      id: 'prod-7',
      name: 'Sony WH-1000XM5',
      description: '業界最高クラスのノイズキャンセリングヘッドホン。',
      price: 49800,
      categoryId: 'cat-14',
      tags: ['tag-2', 'tag-3'],
      images: [
        { id: 'img-7-1', url: generateImageUrl('ヘッドホン', 2), alt: 'Sony WH-1000XM5', isPrimary: true, sortOrder: 1 },
      ],
      stock: 5,
      stockStatus: 'low_stock',
      status: 'active',
      createdAt: new Date('2023-05-15'),
      updatedAt: new Date('2024-02-01')
    },
    
    // ファッション
    {
      id: 'prod-8',
      name: 'オーガニックコットンTシャツ',
      description: '環境に優しいオーガニックコットン100%使用。',
      price: 3980,
      categoryId: 'cat-21',
      tags: ['tag-5', 'tag-8'],
      images: [
        { id: 'img-8-1', url: generateImageUrl('Tシャツ', 1), alt: 'オーガニックコットンTシャツ', isPrimary: true, sortOrder: 1 },
      ],
      stock: 200,
      stockStatus: 'in_stock',
      status: 'active',
      createdAt: new Date('2023-03-01'),
      updatedAt: new Date('2023-03-01')
    },
    {
      id: 'prod-9',
      name: 'ストレッチデニムジーンズ',
      description: '快適な履き心地のストレッチデニム。スリムフィット。',
      price: 12800,
      categoryId: 'cat-21',
      tags: ['tag-2'],
      images: [
        { id: 'img-9-1', url: generateImageUrl('ジーンズ', 1), alt: 'ストレッチデニムジーンズ', isPrimary: true, sortOrder: 1 },
      ],
      stock: 80,
      stockStatus: 'in_stock',
      status: 'active',
      createdAt: new Date('2023-04-10'),
      updatedAt: new Date('2024-01-20')
    },
    
    // 靴
    {
      id: 'prod-10',
      name: 'エアマックス 2024',
      description: '最新のエアクッション技術を搭載したスニーカー。',
      price: 19800,
      categoryId: 'cat-23',
      tags: ['tag-1', 'tag-3'],
      images: [
        { id: 'img-10-1', url: generateImageUrl('スニーカー', 1), alt: 'エアマックス 2024', isPrimary: true, sortOrder: 1 },
        { id: 'img-10-2', url: generateImageUrl('スニーカー', 2), alt: 'エアマックス 2024 側面', isPrimary: false, sortOrder: 2 },
      ],
      stock: 3,
      stockStatus: 'low_stock',
      status: 'active',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-02-01')
    },
    
    // アクセサリー
    {
      id: 'prod-11',
      name: 'スマートウォッチ Pro 8',
      description: '健康管理機能充実のスマートウォッチ。GPS、心拍計搭載。',
      price: 64800,
      categoryId: 'cat-24',
      tags: ['tag-1', 'tag-3', 'tag-6'],
      images: [
        { id: 'img-11-1', url: generateImageUrl('腕時計', 1), alt: 'スマートウォッチ Pro 8', isPrimary: true, sortOrder: 1 },
      ],
      stock: 0,
      stockStatus: 'out_of_stock',
      status: 'active',
      createdAt: new Date('2023-09-20'),
      updatedAt: new Date('2024-01-25')
    },
    
    // 書籍
    {
      id: 'prod-12',
      name: 'プログラミング実践ガイド 2024年版',
      description: '最新のWeb開発技術を網羅した実践的なガイドブック。',
      price: 3800,
      categoryId: 'cat-3',
      tags: ['tag-1', 'tag-8'],
      images: [
        { id: 'img-12-1', url: generateImageUrl('小説', 1), alt: 'プログラミング実践ガイド', isPrimary: true, sortOrder: 1 },
      ],
      stock: 150,
      stockStatus: 'in_stock',
      status: 'active',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10')
    },
    
    // 食品・飲料
    {
      id: 'prod-13',
      name: 'オーガニックコーヒー豆 1kg',
      description: 'フェアトレード認証取得のオーガニックコーヒー豆。',
      price: 4980,
      categoryId: 'cat-4',
      tags: ['tag-5', 'tag-8'],
      images: [
        { id: 'img-13-1', url: generateImageUrl('コーヒー', 1), alt: 'オーガニックコーヒー豆', isPrimary: true, sortOrder: 1 },
      ],
      stock: 60,
      stockStatus: 'in_stock',
      status: 'active',
      createdAt: new Date('2023-11-01'),
      updatedAt: new Date('2023-11-01')
    },
    
    // 販売終了商品
    {
      id: 'prod-14',
      name: '旧型スマートフォン X',
      description: '旧モデルのスマートフォン。在庫限り。',
      price: 49800,
      categoryId: 'cat-11',
      tags: ['tag-2', 'tag-7'],
      images: [
        { id: 'img-14-1', url: generateImageUrl('スマートフォン', 4), alt: '旧型スマートフォン X', isPrimary: true, sortOrder: 1 },
      ],
      stock: 2,
      stockStatus: 'low_stock',
      status: 'discontinued',
      createdAt: new Date('2022-06-01'),
      updatedAt: new Date('2023-12-31')
    },
  ];
  
  return products;
}

// 価格履歴データ生成
export function generatePriceHistory(productId) {
  const product = generateProducts().find(p => p.id === productId);
  if (!product) return [];
  
  const history = [];
  const currentPrice = product.price;
  const dates = [
    new Date('2023-01-01'),
    new Date('2023-06-01'),
    new Date('2023-10-01'),
    new Date('2024-01-01'),
  ];
  
  dates.forEach((date, index) => {
    const variation = Math.random() * 0.2 - 0.1; // -10% to +10%
    const price = Math.round(currentPrice * (1 + variation * (dates.length - index) / dates.length));
    history.push({
      id: `price-${productId}-${index}`,
      productId,
      price,
      changedAt: date,
      changedBy: 'システム管理者'
    });
  });
  
  // 現在の価格を追加
  history.push({
    id: `price-${productId}-current`,
    productId,
    price: currentPrice,
    changedAt: product.updatedAt,
    changedBy: 'システム管理者'
  });
  
  return history.sort((a, b) => b.changedAt - a.changedAt);
}

// 在庫履歴データ生成
export function generateStockHistory(productId) {
  const types = ['addition', 'removal', 'adjustment'];
  const reasons = {
    addition: ['入荷', '返品受付', '在庫調整'],
    removal: ['販売', '破損', '期限切れ'],
    adjustment: ['棚卸し', '誤差修正', 'システム調整']
  };
  
  const history = [];
  const numberOfEntries = Math.floor(Math.random() * 5) + 3;
  
  for (let i = 0; i < numberOfEntries; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const reasonList = reasons[type];
    const reason = reasonList[Math.floor(Math.random() * reasonList.length)];
    const quantity = Math.floor(Math.random() * 50) + 1;
    
    history.push({
      id: `stock-${productId}-${i}`,
      productId,
      quantity: type === 'removal' ? -quantity : quantity,
      type,
      reason,
      changedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 過去30日間のランダムな日付
      changedBy: `スタッフ${Math.floor(Math.random() * 5) + 1}`
    });
  }
  
  return history.sort((a, b) => b.changedAt - a.changedAt);
}