/**
 * ファイル管理システムAPIクライアント
 * 
 * このクライアントは実際のAPI通信とモックデータの切り替えを管理します。
 * 本番環境では、各メソッドのモック部分をAPIエンドポイントへのfetch呼び出しに置き換えてください。
 */

import { config } from '../config.js';
import { mockData } from './mockData.js';

class FileApiClient {
  constructor() {
    this.baseUrl = config.apiBaseUrl;
    this.isMock = config.isMockMode;
  }

  /**
   * ファイル/フォルダ一覧を取得
   * @param {Object} params - 検索パラメータ
   * @param {string} params.path - 対象パス
   * @param {string} params.search - 検索キーワード
   * @param {string} params.sortBy - ソート項目
   * @param {number} params.page - ページ番号
   * @param {number} params.limit - 取得件数
   * @returns {Promise<{items: Array, total: number, hasMore: boolean}>}
   */
  async listFiles(params = {}) {
    if (this.isMock) {
      // モックデータを返却
      const { path = '/', search = '', sortBy = 'name', page = 1, limit = 50 } = params;
      let items = [...mockData.files];
      
      // パスでフィルタリング
      if (path !== '/') {
        items = items.filter(item => item.path.startsWith(path + '/'));
      }
      
      // 検索
      if (search) {
        items = items.filter(item => 
          item.name.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // ソート
      items.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'date':
            return new Date(b.modified) - new Date(a.modified);
          case 'size':
            return (b.size || 0) - (a.size || 0);
          default:
            return 0;
        }
      });
      
      // ページング
      const start = (page - 1) * limit;
      const paginatedItems = items.slice(start, start + limit);
      
      return {
        items: paginatedItems,
        total: items.length,
        hasMore: start + limit < items.length
      };
    }
    
    // 本番環境：実際のAPI呼び出し
    const response = await fetch(`${this.baseUrl}/files`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // クエリパラメータを追加
      // URLSearchParams を使用してパラメータを構築
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * ファイル/フォルダを作成
   * @param {Object} data - 作成データ
   * @param {string} data.name - 名前
   * @param {string} data.type - タイプ（file/folder）
   * @param {string} data.parentPath - 親フォルダパス
   * @param {File} data.file - アップロードファイル（ファイルの場合）
   * @returns {Promise<Object>} 作成されたアイテム
   */
  async createItem(data) {
    if (this.isMock) {
      // モック：新しいアイテムを生成
      const newItem = {
        id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        type: data.type,
        path: data.parentPath === '/' ? `/${data.name}` : `${data.parentPath}/${data.name}`,
        size: data.file?.size || null,
        modified: new Date().toISOString(),
        created: new Date().toISOString(),
        owner: 'current-user@example.com',
        shared: false,
        starred: false,
        permissions: 'owner',
        mimeType: data.file?.type || null
      };
      
      // モックデータに追加（実際にはメモリ上のみ）
      mockData.files.push(newItem);
      
      return newItem;
    }
    
    // 本番環境：マルチパートフォームでアップロード
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('type', data.type);
    formData.append('parentPath', data.parentPath);
    if (data.file) {
      formData.append('file', data.file);
    }
    
    const response = await fetch(`${this.baseUrl}/files`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * ファイル/フォルダを更新（リネーム、移動、スター切り替え）
   * @param {string} id - アイテムID
   * @param {Object} updates - 更新内容
   * @returns {Promise<Object>} 更新されたアイテム
   */
  async updateItem(id, updates) {
    if (this.isMock) {
      // モック：メモリ上のデータを更新
      const item = mockData.files.find(f => f.id === id);
      if (!item) {
        throw new Error('Item not found');
      }
      
      Object.assign(item, updates, {
        modified: new Date().toISOString()
      });
      
      return item;
    }
    
    // 本番環境：PATCH リクエスト
    const response = await fetch(`${this.baseUrl}/files/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * ファイル/フォルダを削除
   * @param {string[]} ids - 削除するアイテムのID配列
   * @returns {Promise<void>}
   */
  async deleteItems(ids) {
    if (this.isMock) {
      // モック：メモリ上から削除
      mockData.files = mockData.files.filter(f => !ids.includes(f.id));
      return;
    }
    
    // 本番環境：一括削除API
    const response = await fetch(`${this.baseUrl}/files/batch-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
  }

  /**
   * ファイルをダウンロード
   * @param {string} id - ファイルID
   * @returns {Promise<Blob>}
   */
  async downloadFile(id) {
    if (this.isMock) {
      // モック：ダミーデータを返却
      const file = mockData.files.find(f => f.id === id);
      if (!file) {
        throw new Error('File not found');
      }
      
      // テキストファイルのダミーデータ
      const content = `This is a mock file content for ${file.name}`;
      return new Blob([content], { type: file.mimeType || 'text/plain' });
    }
    
    // 本番環境：ファイルダウンロード
    const response = await fetch(`${this.baseUrl}/files/${id}/download`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.blob();
  }

  /**
   * フォルダをZIPとしてダウンロード
   * @param {string} id - フォルダID
   * @returns {Promise<Blob>}
   */
  async downloadFolderAsZip(id) {
    if (this.isMock) {
      // モック：ダミーZIPデータ
      const folder = mockData.files.find(f => f.id === id);
      if (!folder) {
        throw new Error('Folder not found');
      }
      
      // 実際のZIP生成にはJSZipなどのライブラリが必要
      const content = `Mock ZIP content for ${folder.name}`;
      return new Blob([content], { type: 'application/zip' });
    }
    
    // 本番環境：ZIPダウンロード
    const response = await fetch(`${this.baseUrl}/folders/${id}/download-zip`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.blob();
  }

  /**
   * ストレージ情報を取得
   * @returns {Promise<{used: number, total: number}>}
   */
  async getStorageInfo() {
    if (this.isMock) {
      // モック：ファイルサイズを集計
      const used = mockData.files.reduce((sum, file) => sum + (file.size || 0), 0);
      return {
        used,
        total: config.storage.maxTotalSize
      };
    }
    
    // 本番環境：ストレージ情報API
    const response = await fetch(`${this.baseUrl}/storage/info`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
}

// シングルトンインスタンスをエクスポート
export const fileApiClient = new FileApiClient();