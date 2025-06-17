// CRM API インターフェース設計 (Task4対応)
// モック実装と本番API実装の共通インターフェース

import { CRM_CONFIG } from '../config/settings.js';

/**
 * API通信の基底クラス
 * MOCK_MODEによってモックデータまたは実際のAPI呼び出しを切り替え
 */
class APIClient {
	constructor(baseUrl = CRM_CONFIG.DATA_SOURCE.apiBaseUrl) {
		this.baseUrl = baseUrl;
		this.isMockMode = CRM_CONFIG.MOCK_MODE;
	}

	/**
	 * HTTP リクエストを実行（本番環境用）
	 */
	async request(endpoint, options = {}) {
		if (this.isMockMode) {
			// モードの場合はモックレスポンスを返す
			return this.getMockResponse(endpoint, options);
		}

		const url = `${this.baseUrl}${endpoint}`;
		const config = {
			headers: {
				'Content-Type': 'application/json',
				...options.headers
			},
			...options
		};

		const response = await fetch(url, config);
		
		if (!response.ok) {
			throw new Error(`API Error: ${response.status} ${response.statusText}`);
		}

		return response.json();
	}

	/**
	 * モックレスポンスを生成
	 */
	getMockResponse(endpoint, options) {
		// 実際の実装ではここでモックデータを返す
		// 現在は既存のストアデータを活用
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({ success: true, data: [], mock: true });
			}, CRM_CONFIG.MOCK_MODE ? 300 : 0); // モック時は少し遅延を入れてリアルさを演出
		});
	}
}

/**
 * リード管理API
 */
export class LeadAPI extends APIClient {
	/**
	 * リード一覧を取得
	 * @param {Object} params - クエリパラメータ
	 * @param {string} params.status - ステータス (new, qualified, converted, lost)
	 * @param {string} params.assigned_to - 担当営業ID
	 * @param {number} params.limit - 取得件数
	 * @param {number} params.offset - オフセット
	 */
	async getLeads(params = {}) {
		const query = new URLSearchParams(params).toString();
		return this.request(`/leads?${query}`);
	}

	/**
	 * リードを作成
	 */
	async createLead(leadData) {
		return this.request('/leads', {
			method: 'POST',
			body: JSON.stringify(leadData)
		});
	}

	/**
	 * リードを更新
	 */
	async updateLead(leadId, leadData) {
		return this.request(`/leads/${leadId}`, {
			method: 'PUT',
			body: JSON.stringify(leadData)
		});
	}

	/**
	 * リードを削除
	 */
	async deleteLead(leadId) {
		return this.request(`/leads/${leadId}`, {
			method: 'DELETE'
		});
	}
}

/**
 * 商談管理API
 */
export class DealAPI extends APIClient {
	/**
	 * 商談一覧を取得
	 */
	async getDeals(params = {}) {
		const query = new URLSearchParams(params).toString();
		return this.request(`/deals?${query}`);
	}

	/**
	 * 商談を作成
	 */
	async createDeal(dealData) {
		return this.request('/deals', {
			method: 'POST',
			body: JSON.stringify(dealData)
		});
	}

	/**
	 * 商談のステージを更新
	 */
	async updateDealStage(dealId, stage, additionalData = {}) {
		return this.request(`/deals/${dealId}/stage`, {
			method: 'PUT',
			body: JSON.stringify({ stage, ...additionalData })
		});
	}

	/**
	 * 商談を更新
	 */
	async updateDeal(dealId, dealData) {
		return this.request(`/deals/${dealId}`, {
			method: 'PUT',
			body: JSON.stringify(dealData)
		});
	}

	/**
	 * 商談を削除
	 */
	async deleteDeal(dealId) {
		return this.request(`/deals/${dealId}`, {
			method: 'DELETE'
		});
	}
}

/**
 * 顧客管理API
 */
export class CustomerAPI extends APIClient {
	/**
	 * 顧客一覧を取得
	 */
	async getCustomers(params = {}) {
		const query = new URLSearchParams(params).toString();
		return this.request(`/customers?${query}`);
	}

	/**
	 * 顧客詳細を取得
	 */
	async getCustomer(customerId) {
		return this.request(`/customers/${customerId}`);
	}

	/**
	 * 顧客を更新
	 */
	async updateCustomer(customerId, customerData) {
		return this.request(`/customers/${customerId}`, {
			method: 'PUT',
			body: JSON.stringify(customerData)
		});
	}
}

/**
 * 活動履歴API
 */
export class ActivityAPI extends APIClient {
	/**
	 * 活動履歴を取得
	 */
	async getActivities(params = {}) {
		const query = new URLSearchParams(params).toString();
		return this.request(`/activities?${query}`);
	}

	/**
	 * 活動を記録
	 */
	async createActivity(activityData) {
		return this.request('/activities', {
			method: 'POST',
			body: JSON.stringify(activityData)
		});
	}

	/**
	 * 活動を更新
	 */
	async updateActivity(activityId, activityData) {
		return this.request(`/activities/${activityId}`, {
			method: 'PUT',
			body: JSON.stringify(activityData)
		});
	}

	/**
	 * 活動を削除
	 */
	async deleteActivity(activityId) {
		return this.request(`/activities/${activityId}`, {
			method: 'DELETE'
		});
	}
}

/**
 * 分析・レポートAPI
 */
export class AnalyticsAPI extends APIClient {
	/**
	 * ダッシュボード統計を取得
	 */
	async getDashboardStats() {
		return this.request('/analytics/dashboard');
	}

	/**
	 * 売上予測を取得
	 */
	async getSalesForecast(params = {}) {
		const query = new URLSearchParams(params).toString();
		return this.request(`/analytics/forecast?${query}`);
	}

	/**
	 * ファネル分析データを取得
	 */
	async getFunnelAnalysis() {
		return this.request('/analytics/funnel');
	}

	/**
	 * 営業担当者別パフォーマンスを取得
	 */
	async getPerformanceByUser(params = {}) {
		const query = new URLSearchParams(params).toString();
		return this.request(`/analytics/performance?${query}`);
	}
}

// APIクライアントのインスタンスをエクスポート
export const leadAPI = new LeadAPI();
export const dealAPI = new DealAPI();
export const customerAPI = new CustomerAPI();
export const activityAPI = new ActivityAPI();
export const analyticsAPI = new AnalyticsAPI();

/**
 * 使用例:
 * 
 * // リード取得
 * const leads = await leadAPI.getLeads({ status: 'new', limit: 20 });
 * 
 * // 商談作成
 * const newDeal = await dealAPI.createDeal({
 *   company_id: 123,
 *   title: '新規商談',
 *   stage: 'qualification',
 *   value: 1000000
 * });
 * 
 * // 活動記録
 * await activityAPI.createActivity({
 *   deal_id: 456,
 *   type: 'meeting',
 *   title: '商談ミーティング',
 *   description: '...'
 * });
 */