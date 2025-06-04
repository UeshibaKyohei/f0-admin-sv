// 商品関連の型定義

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  tags: string[];
  images: ProductImage[];
  resources?: ProductResource[];
  stock: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductResource {
  id: string;
  type: 'image' | 'video' | 'document' | 'other';
  url: string;
  filename: string;
  alt?: string;
  isPrimary?: boolean;
  sortOrder: number;
  size?: number;
  mimeType?: string;
}

// 旧インターフェースとの互換性のため
export interface ProductImage extends ProductResource {
  type: 'image';
  alt: string;
  isPrimary: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  path: string; // e.g., "electronics/computers/laptops"
  level: number;
  sortOrder: number;
  productCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  productCount?: number;
}

export interface PriceHistory {
  id: string;
  productId: string;
  price: number;
  changedAt: Date;
  changedBy: string;
}

export interface StockHistory {
  id: string;
  productId: string;
  quantity: number;
  type: 'addition' | 'removal' | 'adjustment';
  reason: string;
  changedAt: Date;
  changedBy: string;
}

// フィルター関連の型
export interface ProductFilters {
  search: string;
  categoryId: string | null;
  tags: string[];
  stockStatus: string[];
  priceRange: {
    min: number | null;
    max: number | null;
  };
  status: string[];
  sortBy: 'name' | 'price' | 'stock' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

// UI関連の型
export interface UIState {
  viewMode: 'grid' | 'list';
  selectedProducts: string[];
  isLoading: boolean;
  error: string | null;
}