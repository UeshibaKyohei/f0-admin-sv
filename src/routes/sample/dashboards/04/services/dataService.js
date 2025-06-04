/**
 * 在庫・物流管理ダッシュボード データサービス
 *
 * @description
 * 在庫管理、配送追跡、倉庫運営に関するデータを提供する統一インターフェース。
 * モックデータと本番APIの切り替えを透過的に行います。
 */

import { config } from '../config.js';
import * as mockDataService from './mockDataService.js';

/**
 * 倉庫データを取得
 *
 * 対応するDB: warehouses テーブル
 * @returns {Promise<Object>} 倉庫データとサマリー
 */
export async function getWarehouses() {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getWarehouses();
	}

	// 本番実装: API呼び出し
	const response = await fetch(config.API_ENDPOINTS.WAREHOUSES);
	if (!response.ok) throw new Error('Failed to fetch warehouses');
	return response.json();
}

/**
 * 在庫データを取得
 *
 * 対応するDB: inventory + products テーブル JOIN
 * @param {number|null} warehouseId - 倉庫ID（nullの場合は全倉庫）
 * @param {string} category - 商品カテゴリフィルタ
 * @returns {Promise<Object>} 在庫データとアラート情報
 */
export async function getInventoryData(warehouseId = null, category = 'all') {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getInventoryData(warehouseId, category);
	}

	// 本番実装: API呼び出し
	const params = new URLSearchParams();
	if (warehouseId) params.append('warehouseId', warehouseId);
	if (category !== 'all') params.append('category', category);

	const response = await fetch(`${config.API_ENDPOINTS.INVENTORY}?${params}`);
	if (!response.ok) throw new Error('Failed to fetch inventory data');
	return response.json();
}

/**
 * 配送データを取得
 *
 * 対応するDB: deliveries + vehicles + warehouses テーブル JOIN
 * @param {string} status - 配送ステータスフィルタ
 * @param {string} timeRange - 時間範囲フィルタ
 * @returns {Promise<Object>} 配送データとサマリー
 */
export async function getDeliveryData(status = 'all', timeRange = '24h') {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getDeliveryData(status, timeRange);
	}

	// 本番実装: API呼び出し
	const params = new URLSearchParams({ status, timeRange });
	const response = await fetch(`${config.API_ENDPOINTS.DELIVERIES}?${params}`);
	if (!response.ok) throw new Error('Failed to fetch delivery data');
	return response.json();
}

/**
 * 車両データを取得
 *
 * 対応するDB: vehicles テーブル + リアルタイム位置情報
 * @returns {Promise<Object>} 車両データとフリート状況
 */
export async function getVehicleData() {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getVehicleData();
	}

	// 本番実装: API呼び出し
	const response = await fetch(config.API_ENDPOINTS.VEHICLES);
	if (!response.ok) throw new Error('Failed to fetch vehicle data');
	return response.json();
}

/**
 * 在庫移動履歴を取得
 *
 * 対応するDB: inventory_movements テーブル
 * @param {number} days - 取得日数
 * @returns {Promise<Object>} 在庫移動履歴とサマリー
 */
export async function getInventoryMovements(days = 7) {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getInventoryMovements(days);
	}

	// 本番実装: API呼び出し
	const params = new URLSearchParams({ days: days.toString() });
	const response = await fetch(`${config.API_ENDPOINTS.MOVEMENTS}?${params}`);
	if (!response.ok) throw new Error('Failed to fetch inventory movements');
	return response.json();
}

/**
 * アラートデータを取得
 *
 * 対応するDB: alerts テーブル + ビジネスルールベースの動的アラート
 * @param {string} priority - 優先度フィルタ
 * @param {boolean} acknowledged - 確認済みフィルタ
 * @returns {Promise<Array>} アラート一覧
 */
export async function getAlerts(priority = 'all', acknowledged = null) {
	if (config.USE_MOCK_DATA) {
		const alerts = await mockDataService.getAlerts();
		let filtered = alerts;

		if (priority !== 'all') {
			filtered = filtered.filter((alert) => alert.priority === priority);
		}

		if (acknowledged !== null) {
			filtered = filtered.filter((alert) => alert.acknowledged === acknowledged);
		}

		return filtered;
	}

	// 本番実装: API呼び出し
	const params = new URLSearchParams();
	if (priority !== 'all') params.append('priority', priority);
	if (acknowledged !== null) params.append('acknowledged', acknowledged.toString());

	const response = await fetch(`${config.API_ENDPOINTS.ANALYTICS}/alerts?${params}`);
	if (!response.ok) throw new Error('Failed to fetch alerts');
	return response.json();
}

/**
 * 予測分析データを取得
 *
 * 対応するDB: 履歴データの機械学習分析結果
 * @param {string} type - 予測タイプ（demand, routes, inventory）
 * @param {string} timeframe - 予測期間
 * @returns {Promise<Object>} 予測データと推奨アクション
 */
export async function getPredictionData(type = 'demand', timeframe = '30days') {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getPredictionData(type, timeframe);
	}

	// 本番実装: API呼び出し
	const params = new URLSearchParams({ type, timeframe });
	const response = await fetch(`${config.API_ENDPOINTS.PREDICTIONS}?${params}`);
	if (!response.ok) throw new Error('Failed to fetch prediction data');
	return response.json();
}

/**
 * ダッシュボード分析データを取得
 *
 * 対応するDB: 複数テーブルの集計処理
 * @param {string} timeRange - 分析期間
 * @returns {Promise<Object>} KPI指標とトレンドデータ
 */
export async function getAnalyticsData(timeRange = '7days') {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getAnalyticsData(timeRange);
	}

	// 本番実装: API呼び出し
	const params = new URLSearchParams({ timeRange });
	const response = await fetch(`${config.API_ENDPOINTS.ANALYTICS}?${params}`);
	if (!response.ok) throw new Error('Failed to fetch analytics data');
	return response.json();
}

/**
 * リアルタイム更新の購読開始
 *
 * WebSocket または Server-Sent Events を使用
 * @param {Function} callback - 更新データを受信するコールバック関数
 * @returns {Function} 購読を停止する関数
 */
export function subscribeToRealTimeUpdates(callback) {
	if (config.USE_MOCK_DATA) {
		return mockDataService.subscribeToRealTimeUpdates(callback);
	}

	// 本番実装: WebSocket接続
	const ws = new WebSocket('/ws/logistics-updates');

	ws.onmessage = (event) => {
		try {
			const data = JSON.parse(event.data);
			callback(data);
		} catch (error) {
			console.error('Failed to parse WebSocket message:', error);
		}
	};

	ws.onerror = (error) => {
		console.error('WebSocket error:', error);
	};

	// 購読停止関数を返す
	return () => {
		if (ws.readyState === WebSocket.OPEN) {
			ws.close();
		}
	};
}

/**
 * 在庫レベルを更新
 *
 * 対応するDB: inventory テーブル UPDATE
 * @param {number} inventoryId - 在庫ID
 * @param {number} newStock - 新しい在庫数
 * @param {string} reason - 更新理由
 * @returns {Promise<Object>} 更新結果
 */
export async function updateInventoryLevel(inventoryId, newStock, reason = '') {
	if (config.USE_MOCK_DATA) {
		// モックでは成功応答を返す
		return Promise.resolve({
			success: true,
			inventoryId,
			newStock,
			updatedAt: new Date().toISOString()
		});
	}

	// 本番実装: API呼び出し
	const response = await fetch(`${config.API_ENDPOINTS.INVENTORY}/${inventoryId}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			current_stock: newStock,
			update_reason: reason,
			updated_at: new Date().toISOString()
		})
	});

	if (!response.ok) throw new Error('Failed to update inventory level');
	return response.json();
}

/**
 * 配送ステータスを更新
 *
 * 対応するDB: deliveries テーブル UPDATE
 * @param {number} deliveryId - 配送ID
 * @param {string} newStatus - 新しいステータス
 * @param {Object} location - 現在位置（オプション）
 * @returns {Promise<Object>} 更新結果
 */
export async function updateDeliveryStatus(deliveryId, newStatus, location = null) {
	if (config.USE_MOCK_DATA) {
		// モックでは成功応答を返す
		return Promise.resolve({
			success: true,
			deliveryId,
			newStatus,
			location,
			updatedAt: new Date().toISOString()
		});
	}

	// 本番実装: API呼び出し
	const updateData = {
		status: newStatus,
		updated_at: new Date().toISOString()
	};

	if (location) {
		updateData.current_lat = location.lat;
		updateData.current_lng = location.lng;
	}

	if (newStatus === 'delivered') {
		updateData.actual_arrival = new Date().toISOString();
	}

	const response = await fetch(`${config.API_ENDPOINTS.DELIVERIES}/${deliveryId}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(updateData)
	});

	if (!response.ok) throw new Error('Failed to update delivery status');
	return response.json();
}

/**
 * アラートを確認済みに更新
 *
 * 対応するDB: alerts テーブル UPDATE
 * @param {number} alertId - アラートID
 * @param {string} acknowledgedBy - 確認者
 * @returns {Promise<Object>} 更新結果
 */
export async function acknowledgeAlert(alertId, acknowledgedBy = 'user') {
	if (config.USE_MOCK_DATA) {
		// モックでは成功応答を返す
		return Promise.resolve({
			success: true,
			alertId,
			acknowledgedBy,
			acknowledgedAt: new Date().toISOString()
		});
	}

	// 本番実装: API呼び出し
	const response = await fetch(`${config.API_ENDPOINTS.ANALYTICS}/alerts/${alertId}/acknowledge`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			acknowledged_by: acknowledgedBy,
			acknowledged_at: new Date().toISOString()
		})
	});

	if (!response.ok) throw new Error('Failed to acknowledge alert');
	return response.json();
}

/**
 * 配送ルートを最適化
 *
 * ルート最適化アルゴリズムによる配送経路の改善提案
 * @param {Array} deliveryIds - 最適化対象の配送ID配列
 * @param {Object} options - 最適化オプション
 * @returns {Promise<Object>} 最適化結果
 */
export async function optimizeDeliveryRoutes(deliveryIds, options = {}) {
	if (config.USE_MOCK_DATA) {
		// モックでは最適化結果を返す
		return Promise.resolve({
			originalDistance: 120.5,
			optimizedDistance: 89.3,
			timeSaved: 45, // minutes
			fuelSaved: 12.8, // liters
			co2Reduced: 28.4, // kg
			optimizedRoute: deliveryIds.map((id, index) => ({
				deliveryId: id,
				order: index + 1,
				estimatedTime: `+${(index + 1) * 15}min`
			}))
		});
	}

	// 本番実装: 最適化API呼び出し
	const response = await fetch(`${config.API_ENDPOINTS.ANALYTICS}/optimize-routes`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			delivery_ids: deliveryIds,
			options
		})
	});

	if (!response.ok) throw new Error('Failed to optimize delivery routes');
	return response.json();
}
