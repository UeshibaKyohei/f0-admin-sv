/**
 * AI統合型統合管理ダッシュボード データサービス
 *
 * @description
 * AI統合管理システムのデータを提供する統一インターフェース。
 * モックデータと本番APIの切り替えを透過的に行います。
 *
 * API設計想定:
 * - GET /api/v1/systems - システム一覧と状態取得
 * - GET /api/v1/metrics - リアルタイムメトリクス取得
 * - GET /api/v1/ai/insights - AIインサイト取得
 * - POST /api/v1/ai/chat - AI応答取得
 * - GET /api/v1/anomalies - 異常検知データ取得
 * - GET /api/v1/workflows - ワークフロー一覧取得
 * - POST /api/v1/workflows/{id}/execute - ワークフロー実行
 * - GET /api/v1/predictions - 予測データ取得
 * - POST /api/v1/reports - レポート生成
 */

import { config, isFeatureEnabled } from '../config.js';
import * as mockDataService from './mockDataService.js';

// ===========================================
// API通信の共通設定
// ===========================================
const API_CONFIG = {
	timeout: 30000,
	retries: 3,
	retryDelay: 1000,
	headers: {
		'Content-Type': 'application/json',
		'X-Client-Version': '1.0.0',
		'X-Request-Source': 'dashboard'
	}
};

// ===========================================
// 共通API呼び出し関数
// ===========================================

/**
 * 共通API呼び出し処理（リトライ機能付き）
 */
async function apiCall(url, options = {}, retryCount = 0) {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

	try {
		const response = await fetch(url, {
			...options,
			headers: { ...API_CONFIG.headers, ...options.headers },
			signal: controller.signal
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error(`API Error: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		clearTimeout(timeoutId);

		// リトライ処理
		if (retryCount < API_CONFIG.retries && !controller.signal.aborted) {
			console.warn(
				`API call failed, retrying... (${retryCount + 1}/${API_CONFIG.retries})`,
				error.message
			);
			await new Promise((resolve) => setTimeout(resolve, API_CONFIG.retryDelay * (retryCount + 1)));
			return apiCall(url, options, retryCount + 1);
		}

		throw handleApiError(error, url);
	}
}

/**
 * GET リクエスト
 */
async function apiGet(endpoint, params = {}) {
	const url = new URL(endpoint, window.location.origin);
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			url.searchParams.append(key, value.toString());
		}
	});

	return apiCall(url.toString());
}

/**
 * POST リクエスト
 */
async function apiPost(endpoint, data = {}) {
	return apiCall(endpoint, {
		method: 'POST',
		body: JSON.stringify(data)
	});
}

/**
 * PATCH リクエスト
 */
async function apiPatch(endpoint, data = {}) {
	return apiCall(endpoint, {
		method: 'PATCH',
		body: JSON.stringify(data)
	});
}

// ===========================================
// データ取得API（RDB対応）
// ===========================================

/**
 * システム統合ステータスを取得
 * @returns {Promise<Object>} 各システムの接続状態（systems テーブル対応）
 */
export async function getSystemStatus() {
	if (config.USE_MOCK_MODE) {
		return mockDataService.getSystemStatus();
	}

	try {
		return await apiGet(config.API_ENDPOINTS.INTEGRATION);
	} catch (error) {
		console.error('Failed to fetch system status:', error);
		// フォールバック: モックデータを返す
		if (isFeatureEnabled('SHOW_DEMO_INSIGHTS')) {
			return mockDataService.getSystemStatus();
		}
		throw error;
	}
}

/**
 * パフォーマンスメトリクスを取得
 * @returns {Promise<Object>} CPU、メモリ、ネットワーク、応答時間（metrics テーブル対応）
 */
export async function getPerformanceMetrics() {
	if (config.USE_MOCK_MODE) {
		return mockDataService.getPerformanceMetrics();
	}

	try {
		return await apiGet(config.API_ENDPOINTS.METRICS);
	} catch (error) {
		console.error('Failed to fetch performance metrics:', error);
		// フォールバック: デフォルト値を返す
		if (isFeatureEnabled('SHOW_DEMO_INSIGHTS')) {
			return mockDataService.getPerformanceMetrics();
		}
		return { cpu: 0, memory: 0, network: 0, responseTime: 0 };
	}
}

/**
 * AIインサイトを取得
 * @returns {Promise<Object>} インサイトと提案のリスト（insights テーブル対応）
 */
export async function getAIInsights() {
	if (config.USE_MOCK_MODE) {
		return mockDataService.getAIInsights();
	}

	if (!isFeatureEnabled('ENABLE_AUTO_INSIGHTS')) {
		return { insights: [], suggestions: [] };
	}

	try {
		return await apiGet(config.API_ENDPOINTS.AI_INSIGHTS);
	} catch (error) {
		console.error('Failed to fetch AI insights:', error);
		// フォールバック: 空の結果を返す
		return { insights: [], suggestions: [] };
	}
}

/**
 * AIウェルカムメッセージを取得
 * @returns {Promise<Object>} ウェルカムメッセージ
 */
export async function getAIWelcomeMessage() {
	if (config.USE_MOCK_MODE) {
		return mockDataService.getAIWelcomeMessage();
	}

	if (!isFeatureEnabled('ENABLE_AI_ASSISTANT')) {
		return { message: 'AI Assistant is currently disabled' };
	}

	try {
		return await apiGet(`${config.API_ENDPOINTS.AI_ASSISTANT}/welcome`);
	} catch (error) {
		console.error('Failed to fetch welcome message:', error);
		return { message: 'Welcome to the AI Integrated Dashboard' };
	}
}

/**
 * AI応答を取得
 * @param {string} query - ユーザーのクエリ
 * @returns {Promise<Object>} AI応答とアクション
 */
export async function getAIResponse(query) {
	if (config.USE_MOCK_MODE) {
		return mockDataService.getAIResponse(query);
	}

	if (!isFeatureEnabled('ENABLE_AI_ASSISTANT')) {
		return {
			message: 'AI Assistant is currently disabled',
			error: true
		};
	}

	try {
		return await apiPost(config.API_ENDPOINTS.AI_ASSISTANT, {
			query,
			context: {
				language: 'ja',
				sessionId: getSessionId(),
				timestamp: new Date().toISOString(),
				features: getEnabledFeatures().map((f) => f.name)
			}
		});
	} catch (error) {
		console.error('Failed to get AI response:', error);
		return {
			message: 'Sorry, I am currently unable to process your request. Please try again later.',
			error: true,
			fallback: true
		};
	}
}

/**
 * 異常データを取得
 * @returns {Promise<Object>} 検出された異常のリスト（anomalies テーブル対応）
 */
export async function getAnomalies() {
	if (config.USE_MOCK_MODE) {
		return mockDataService.getAnomalies();
	}

	if (!isFeatureEnabled('ENABLE_ANOMALY_DETECTION')) {
		return { all: [], critical: [], summary: { total: 0, critical: 0, warning: 0, info: 0 } };
	}

	try {
		return await apiGet(config.API_ENDPOINTS.AI_ANOMALIES);
	} catch (error) {
		console.error('Failed to fetch anomalies:', error);
		return { all: [], critical: [], summary: { total: 0, critical: 0, warning: 0, info: 0 } };
	}
}

/**
 * ワークフローデータを取得
 * @returns {Promise<Array>} ワークフローのリスト（workflows テーブル対応）
 */
export async function getWorkflows() {
	if (config.USE_MOCK_MODE) {
		return mockDataService.getWorkflows();
	}

	if (!isFeatureEnabled('ENABLE_WORKFLOW_AUTOMATION')) {
		return [];
	}

	try {
		return await apiGet(`${config.API_ENDPOINTS.AUTOMATION}/list`);
	} catch (error) {
		console.error('Failed to fetch workflows:', error);
		return [];
	}
}

/**
 * ワークフロー実行履歴を取得
 * @param {number} workflowId - ワークフローID（nullの場合は全履歴）
 * @returns {Promise<Array>} 実行履歴のリスト（executions テーブル対応）
 */
export async function getExecutionHistory(workflowId = null) {
	if (config.USE_MOCK_MODE) {
		return mockDataService.getExecutionHistory(workflowId);
	}

	if (!isFeatureEnabled('ENABLE_WORKFLOW_AUTOMATION')) {
		return [];
	}

	try {
		const params = workflowId ? { workflowId } : {};
		return await apiGet(`${config.API_ENDPOINTS.AUTOMATION}/history`, params);
	} catch (error) {
		console.error('Failed to fetch execution history:', error);
		return [];
	}
}

/**
 * 予測データを取得
 * @param {string} type - 予測タイプ（revenue, traffic, efficiency, satisfaction）
 * @param {number} horizon - 予測期間（日数）
 * @returns {Promise<Object>} 予測データ
 */
export async function getPredictions(type = 'all', horizon = 30) {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getPredictions(type, horizon);
	}

	// 本番実装
	const params = new URLSearchParams({ type, horizon: horizon.toString() });
	const response = await fetch(`${config.API_ENDPOINTS.AI_PREDICTIONS}?${params}`);
	if (!response.ok) throw new Error('Failed to fetch predictions');
	return response.json();
}

/**
 * レポートを生成
 * @param {string} type - レポートタイプ
 * @param {string} format - 出力形式（pdf, excel, powerpoint）
 * @returns {Promise<Object>} 生成されたレポート情報
 */
export async function generateReport(type, format = 'pdf') {
	if (config.USE_MOCK_DATA) {
		return mockDataService.generateReport(type, format);
	}

	// 本番実装
	const response = await fetch(config.API_ENDPOINTS.REPORTS, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ type, format })
	});

	if (!response.ok) throw new Error('Failed to generate report');
	return response.json();
}

/**
 * 自動化アクションを実行
 * @param {string} actionType - アクションタイプ
 * @param {Object} params - アクションパラメータ
 * @returns {Promise<Object>} 実行結果
 */
export async function executeAutomation(actionType, params = {}) {
	if (config.USE_MOCK_DATA) {
		return mockDataService.executeAutomation(actionType, params);
	}

	// 本番実装
	const response = await fetch(`${config.API_ENDPOINTS.AUTOMATION}/execute`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ actionType, params })
	});

	if (!response.ok) throw new Error('Failed to execute automation');
	return response.json();
}

/**
 * ワークフローを実行
 * @param {number} workflowId - ワークフローID
 * @param {Object} params - 実行パラメータ
 * @returns {Promise<Object>} 実行結果
 */
export async function executeWorkflow(workflowId, params = {}) {
	if (config.USE_MOCK_DATA) {
		// モックでは簡易的な実行シミュレーション
		await new Promise((resolve) => setTimeout(resolve, 2000));
		return {
			executionId: Date.now(),
			workflowId,
			status: 'running',
			startTime: new Date().toISOString()
		};
	}

	// 本番実装
	const response = await fetch(
		`${config.API_ENDPOINTS.AUTOMATION}/workflows/${workflowId}/execute`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(params)
		}
	);

	if (!response.ok) throw new Error('Failed to execute workflow');
	return response.json();
}

/**
 * システム設定を更新
 * @param {string} key - 設定キー
 * @param {any} value - 設定値
 * @returns {Promise<Object>} 更新結果
 */
export async function updateSystemSetting(key, value) {
	if (config.USE_MOCK_DATA) {
		// モックでは成功応答を返す
		return Promise.resolve({
			success: true,
			key,
			value,
			updatedAt: new Date().toISOString()
		});
	}

	// 本番実装
	const response = await fetch(`${config.API_ENDPOINTS.INTEGRATION}/settings`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ key, value })
	});

	if (!response.ok) throw new Error('Failed to update system setting');
	return response.json();
}

/**
 * 異常に対する修復アクションを実行
 * @param {number} anomalyId - 異常ID
 * @param {string} action - 修復アクション
 * @returns {Promise<Object>} 実行結果
 */
export async function remediateAnomaly(anomalyId, action) {
	if (config.USE_MOCK_DATA) {
		// モックでは成功応答を返す
		await new Promise((resolve) => setTimeout(resolve, 1500));
		return {
			success: true,
			anomalyId,
			action,
			result: 'Remediation completed successfully',
			timestamp: new Date().toISOString()
		};
	}

	// 本番実装
	const response = await fetch(`${config.API_ENDPOINTS.AI_ANOMALIES}/${anomalyId}/remediate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ action })
	});

	if (!response.ok) throw new Error('Failed to remediate anomaly');
	return response.json();
}

// ===========================================
// ユーティリティ関数（AI駆動開発対応）
// ===========================================

/**
 * セッションIDを取得（ブラウザセッション用）
 * @returns {string} セッションID
 */
function getSessionId() {
	let sessionId = sessionStorage.getItem('ai_session_id');
	if (!sessionId) {
		sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		sessionStorage.setItem('ai_session_id', sessionId);
	}
	return sessionId;
}

/**
 * 有効なフィーチャーフラグの取得（再エクスポート）
 */
function getEnabledFeatures() {
	// config.jsからインポートしたgetEnabledFeatures関数の呼び出し
	return Object.entries(featureFlags || {})
		.filter(([name]) => isFeatureEnabled(name))
		.map(([name, flag]) => ({ name, ...flag }));
}

/**
 * APIエラーハンドリング（詳細ログ対応）
 * @param {Error} error - エラーオブジェクト
 * @param {string} url - 失敗したURL
 * @returns {Error} 拡張エラー情報
 */
function handleApiError(error, url = '') {
	const errorInfo = {
		message: error.message || 'An unexpected error occurred',
		url,
		timestamp: new Date().toISOString(),
		userAgent: navigator.userAgent,
		sessionId: getSessionId()
	};

	// デバッグモードでは詳細情報をログ出力
	if (config.ENABLE_DEBUG_FEATURES) {
		console.group('🚨 API Error Details');
		console.error('Error:', error);
		console.table(errorInfo);
		if (error.stack) console.error('Stack trace:', error.stack);
		console.groupEnd();
	} else {
		console.error('API Error:', errorInfo.message);
	}

	// エラー情報を付加した新しいエラーを作成
	const enhancedError = new Error(errorInfo.message);
	enhancedError.details = errorInfo;
	enhancedError.originalError = error;

	return enhancedError;
}

/**
 * API呼び出し状況のロギング
 */
function logApiCall(method, url, params = {}) {
	if (config.ENABLE_DEBUG_FEATURES) {
		console.log(`📡 API ${method.toUpperCase()}: ${url}`, params);
	}
}

/**
 * レスポンス時間の測定
 */
function measureResponseTime(startTime) {
	const duration = Date.now() - startTime;
	if (config.ENABLE_DEBUG_FEATURES) {
		console.log(`⏱️ Response time: ${duration}ms`);
	}
	return duration;
}
