/**
 * APIクライアント
 * 
 * このファイルは、モックモードと本番モードの両方に対応した
 * 統一的なAPIインターフェースを提供します。
 * 
 * モックモード時：ローカルストレージを使用
 * 本番モード時：REST APIを使用
 */

import { CONFIG } from '../config.js';
import * as mockApi from './mockApi.js';

/**
 * HTTPクライアントのラッパー
 * 本番環境でのAPI通信を行う
 */
class HttpClient {
  constructor(baseURL = CONFIG.API.BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(fullEndpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
}

/**
 * APIクライアントのファクトリー
 * モックモードと本番モードを切り替える
 */
class ApiClient {
  constructor() {
    this.http = new HttpClient();
    this.isMockMode = CONFIG.IS_MOCK_MODE;
  }

  /**
   * 商品API
   */
  products = {
    /**
     * 商品一覧取得
     * @param {Object} params - クエリパラメータ
     * @returns {Promise<{data: Product[], total: number}>}
     */
    list: async (params = {}) => {
      if (this.isMockMode) {
        return mockApi.products.list(params);
      }
      // 本番API実装
      // return this.http.get('/products', params);
    },

    /**
     * 商品詳細取得
     * @param {string} id - 商品ID
     * @returns {Promise<Product>}
     */
    get: async (id) => {
      if (this.isMockMode) {
        return mockApi.products.get(id);
      }
      // 本番API実装
      // return this.http.get(`/products/${id}`);
    },

    /**
     * 商品作成
     * @param {Object} data - 商品データ
     * @returns {Promise<Product>}
     */
    create: async (data) => {
      if (this.isMockMode) {
        return mockApi.products.create(data);
      }
      // 本番API実装
      // return this.http.post('/products', data);
    },

    /**
     * 商品更新
     * @param {string} id - 商品ID
     * @param {Object} data - 更新データ
     * @returns {Promise<Product>}
     */
    update: async (id, data) => {
      if (this.isMockMode) {
        return mockApi.products.update(id, data);
      }
      // 本番API実装
      // return this.http.put(`/products/${id}`, data);
    },

    /**
     * 商品削除
     * @param {string} id - 商品ID
     * @returns {Promise<void>}
     */
    delete: async (id) => {
      if (this.isMockMode) {
        return mockApi.products.delete(id);
      }
      // 本番API実装
      // return this.http.delete(`/products/${id}`);
    },

    /**
     * 複数商品削除
     * @param {string[]} ids - 商品IDの配列
     * @returns {Promise<void>}
     */
    deleteMany: async (ids) => {
      if (this.isMockMode) {
        return mockApi.products.deleteMany(ids);
      }
      // 本番API実装
      // return this.http.post('/products/delete-many', { ids });
    },

    /**
     * 在庫更新
     * @param {string} id - 商品ID
     * @param {Object} adjustment - 在庫調整データ
     * @returns {Promise<Product>}
     */
    updateStock: async (id, adjustment) => {
      if (this.isMockMode) {
        return mockApi.products.updateStock(id, adjustment);
      }
      // 本番API実装
      // return this.http.post(`/products/${id}/stock`, adjustment);
    }
  };

  /**
   * カテゴリーAPI
   */
  categories = {
    /**
     * カテゴリー一覧取得
     * @returns {Promise<Category[]>}
     */
    list: async () => {
      if (this.isMockMode) {
        return mockApi.categories.list();
      }
      // 本番API実装
      // return this.http.get('/categories');
    },

    /**
     * カテゴリー作成
     * @param {Object} data - カテゴリーデータ
     * @returns {Promise<Category>}
     */
    create: async (data) => {
      if (this.isMockMode) {
        return mockApi.categories.create(data);
      }
      // 本番API実装
      // return this.http.post('/categories', data);
    },

    /**
     * カテゴリー更新
     * @param {string} id - カテゴリーID
     * @param {Object} data - 更新データ
     * @returns {Promise<Category>}
     */
    update: async (id, data) => {
      if (this.isMockMode) {
        return mockApi.categories.update(id, data);
      }
      // 本番API実装
      // return this.http.put(`/categories/${id}`, data);
    },

    /**
     * カテゴリー削除
     * @param {string} id - カテゴリーID
     * @returns {Promise<void>}
     */
    delete: async (id) => {
      if (this.isMockMode) {
        return mockApi.categories.delete(id);
      }
      // 本番API実装
      // return this.http.delete(`/categories/${id}`);
    }
  };

  /**
   * タグAPI
   */
  tags = {
    /**
     * タグ一覧取得
     * @returns {Promise<Tag[]>}
     */
    list: async () => {
      if (this.isMockMode) {
        return mockApi.tags.list();
      }
      // 本番API実装
      // return this.http.get('/tags');
    },

    /**
     * タグ作成
     * @param {Object} data - タグデータ
     * @returns {Promise<Tag>}
     */
    create: async (data) => {
      if (this.isMockMode) {
        return mockApi.tags.create(data);
      }
      // 本番API実装
      // return this.http.post('/tags', data);
    },

    /**
     * タグ更新
     * @param {string} id - タグID
     * @param {Object} data - 更新データ
     * @returns {Promise<Tag>}
     */
    update: async (id, data) => {
      if (this.isMockMode) {
        return mockApi.tags.update(id, data);
      }
      // 本番API実装
      // return this.http.put(`/tags/${id}`, data);
    },

    /**
     * タグ削除
     * @param {string} id - タグID
     * @returns {Promise<void>}
     */
    delete: async (id) => {
      if (this.isMockMode) {
        return mockApi.tags.delete(id);
      }
      // 本番API実装
      // return this.http.delete(`/tags/${id}`);
    }
  };

  /**
   * 価格履歴API
   */
  priceHistory = {
    /**
     * 価格履歴取得
     * @param {string} productId - 商品ID
     * @returns {Promise<PriceHistory[]>}
     */
    list: async (productId) => {
      if (this.isMockMode) {
        return mockApi.priceHistory.list(productId);
      }
      // 本番API実装
      // return this.http.get(`/products/${productId}/price-history`);
    }
  };

  /**
   * 在庫履歴API
   */
  stockHistory = {
    /**
     * 在庫履歴取得
     * @param {string} productId - 商品ID
     * @returns {Promise<StockHistory[]>}
     */
    list: async (productId) => {
      if (this.isMockMode) {
        return mockApi.stockHistory.list(productId);
      }
      // 本番API実装
      // return this.http.get(`/products/${productId}/stock-history`);
    }
  };

  /**
   * ファイルアップロードAPI
   */
  files = {
    /**
     * ファイルアップロード
     * @param {File} file - アップロードするファイル
     * @returns {Promise<{url: string, filename: string}>}
     */
    upload: async (file) => {
      if (this.isMockMode) {
        // モックモードではBase64変換
        return mockApi.files.upload(file);
      }
      // 本番API実装
      // const formData = new FormData();
      // formData.append('file', file);
      // return this.http.post('/files/upload', formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' }
      // });
    }
  };
}

// シングルトンインスタンスをエクスポート
export const apiClient = new ApiClient();