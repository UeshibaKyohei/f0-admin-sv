// Mock data generator for products

const productNames = [
  'ワイヤレスヘッドホン', 'スマートウォッチ', 'Bluetoothスピーカー', 'USBケーブル', 
  'ノートパソコンスタンド', 'ワイヤレスマウス', 'キーボード', 'Webカメラ',
  'Tシャツ', 'ジーンズ', 'スニーカー', 'バックパック', 'キャップ', 'ジャケット',
  'コーヒー豆', 'チョコレート', 'クッキー', 'ワイン', '日本酒', 'ビール',
  'プログラミング入門書', '小説', 'ビジネス書', '料理本', '写真集', '雑誌',
  'ヨガマット', 'ダンベル', 'ランニングシューズ', 'スポーツウェア', 'プロテイン',
  'クッション', 'ランプ', '花瓶', '観葉植物', 'アロマキャンドル', '掛け時計'
];

const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Sports', 'Home'];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateSKU() {
  return 'SKU-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function generateProduct(id) {
  const name = getRandomElement(productNames);
  const category = getRandomElement(categories);
  const price = Math.floor(Math.random() * 9900) + 100;
  const stock = Math.floor(Math.random() * 100);
  const status = Math.random() > 0.2 ? 'active' : 'inactive';
  
  return {
    id,
    name: name + ' ' + (Math.floor(Math.random() * 100) + 1),
    sku: generateSKU(),
    category,
    price,
    stock,
    status,
    description: `高品質な${name}です。${category}カテゴリーの人気商品。`,
    image: `https://picsum.photos/seed/${id}/400/400`,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString()
  };
}

export function generateMockProducts(count = 100) {
  const products = [];
  for (let i = 1; i <= count; i++) {
    products.push(generateProduct(i));
  }
  return products;
}

// Generate sample data for filters
export function getFilterOptions(products) {
  const categories = new Set(['all']);
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  
  products.forEach(product => {
    categories.add(product.category);
    minPrice = Math.min(minPrice, product.price);
    maxPrice = Math.max(maxPrice, product.price);
  });
  
  return {
    categories: Array.from(categories),
    priceRange: { min: minPrice, max: maxPrice }
  };
}