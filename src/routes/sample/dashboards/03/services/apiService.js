/**
 * 本番環境用APIサービス
 *
 * @description
 * 実際のRDBからデータを取得するためのAPIサービス。
 * 各関数は、config.jsで定義されたAPI_ENDPOINTSを使用して
 * 対応するバックエンドAPIを呼び出します。
 *
 * 本ファイルは本番環境での実装テンプレートとして機能し、
 * 実際の開発時にはここに具体的なAPI実装を追加してください。
 */

import { config } from '../config.js';

/**
 * API呼び出しのベース設定
 */
const DEFAULT_HEADERS = {
	'Content-Type': 'application/json',
	Accept: 'application/json'
};

/**
 * APIリクエストヘルパー
 * 認証、エラーハンドリング、ログなどの共通処理
 */
async function apiRequest(url, options = {}) {
	const config = {
		headers: { ...DEFAULT_HEADERS, ...options.headers },
		...options
	};

	// 認証ヘッダーの追加（JWTトークンなど）
	const authToken = getAuthToken();
	if (authToken) {
		config.headers.Authorization = `Bearer ${authToken}`;
	}

	try {
		const response = await fetch(url, config);

		// レスポンスのログ記録（開発環境のみ）
		if (process.env.NODE_ENV === 'development') {
			console.log(`API Request: ${options.method || 'GET'} ${url}`, {
				status: response.status,
				headers: Object.fromEntries(response.headers.entries())
			});
		}

		if (!response.ok) {
			throw new Error(`API Error: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error('API Request failed:', error);
		throw error;
	}
}

/**
 * 認証トークンを取得
 * 実際の実装では localStorage, cookies, またはセッションから取得
 */
function getAuthToken() {
	// TODO: 実際の認証システムに合わせて実装
	if (typeof window !== 'undefined') {
		return localStorage.getItem('auth_token');
	}
	return null;
}

/**
 * 顧客メトリクスを取得
 *
 * SQL例:
 * SELECT
 *   COUNT(*) as total_customers,
 *   AVG(health_score) as avg_health_score,
 *   SUM(monthly_revenue) as total_revenue
 * FROM customers
 * WHERE segment = ? AND created_at >= ?
 */
export async function getCustomerMetrics(segment = 'all', dateRange = '30days') {
	const params = new URLSearchParams({ segment, dateRange });
	const url = `${config.API_ENDPOINTS.METRICS}?${params}`;

	const data = await apiRequest(url);

	// データ変換処理（RDBの生データをUI用に整形）
	return transformMetricsData(data);
}

/**
 * 満足度トレンドデータを取得
 *
 * SQL例:
 * SELECT
 *   DATE(survey_date) as date,
 *   AVG(nps_score) as avg_nps,
 *   AVG(csat_score) as avg_csat,
 *   COUNT(*) as response_count
 * FROM customer_satisfaction cs
 * JOIN customers c ON cs.customer_id = c.id
 * WHERE c.segment = ? AND survey_date >= ?
 * GROUP BY DATE(survey_date)
 * ORDER BY date
 */
export async function getSatisfactionTrends(
	segment = 'all',
	dateRange = '30days',
	metricType = 'nps'
) {
	const params = new URLSearchParams({ segment, dateRange, metricType });
	const url = `${config.API_ENDPOINTS.SATISFACTION}?${params}`;

	return await apiRequest(url);
}

/**
 * チャーン分析データを取得
 *
 * SQL例:
 * SELECT
 *   c.segment,
 *   COUNT(CASE WHEN c.status = 'churned' THEN 1 END) as churned_count,
 *   COUNT(*) as total_count,
 *   AVG(rr.churn_risk_score) as avg_risk_score
 * FROM customers c
 * LEFT JOIN revenue_retention rr ON c.id = rr.customer_id
 * WHERE c.subscription_start >= ?
 * GROUP BY c.segment
 */
export async function getChurnAnalysis(segment = 'all', dateRange = '30days') {
	const params = new URLSearchParams({ segment, dateRange });
	const url = `${config.API_ENDPOINTS.CHURN_ANALYSIS}?${params}`;

	return await apiRequest(url);
}

/**
 * 顧客健全性データを取得
 *
 * SQL例:
 * SELECT
 *   c.id,
 *   c.company_name,
 *   c.health_score,
 *   c.segment,
 *   ce.engagement_score,
 *   ce.last_login
 * FROM customers c
 * LEFT JOIN customer_engagement ce ON c.id = ce.customer_id
 * WHERE c.segment = ? AND c.health_score IS NOT NULL
 * ORDER BY c.health_score DESC
 */
export async function getCustomerHealth(segment = 'all', dateRange = '30days') {
	const params = new URLSearchParams({ segment, dateRange });
	const url = `${config.API_ENDPOINTS.CUSTOMER_HEALTH}?${params}`;

	return await apiRequest(url);
}

/**
 * サポートチケットデータを取得
 *
 * SQL例:
 * SELECT
 *   st.*,
 *   c.company_name,
 *   c.segment,
 *   TIMESTAMPDIFF(HOUR, st.created_at, COALESCE(st.resolved_at, NOW())) as resolution_hours
 * FROM support_tickets st
 * JOIN customers c ON st.customer_id = c.id
 * WHERE c.segment = ? AND st.created_at >= ?
 * ORDER BY st.created_at DESC
 */
export async function getSupportTickets(
	segment = 'all',
	dateRange = '30days',
	showDetails = false
) {
	const params = new URLSearchParams({
		segment,
		dateRange,
		showDetails: showDetails.toString()
	});
	const url = `${config.API_ENDPOINTS.SUPPORT_TICKETS}?${params}`;

	return await apiRequest(url);
}

/**
 * 収益・維持率データを取得
 *
 * SQL例:
 * SELECT
 *   DATE_FORMAT(period_start, '%Y-%m') as month,
 *   SUM(mrr) as total_mrr,
 *   AVG(ltv) as avg_ltv,
 *   COUNT(CASE WHEN retention_status = 'retained' THEN 1 END) / COUNT(*) * 100 as retention_rate
 * FROM revenue_retention rr
 * JOIN customers c ON rr.customer_id = c.id
 * WHERE c.segment = ? AND period_start >= ?
 * GROUP BY month
 * ORDER BY month
 */
export async function getRevenueRetention(segment = 'all', dateRange = '30days') {
	const params = new URLSearchParams({ segment, dateRange });
	const url = `${config.API_ENDPOINTS.REVENUE_RETENTION}?${params}`;

	return await apiRequest(url);
}

/**
 * エンゲージメントデータを取得
 *
 * SQL例:
 * SELECT
 *   ce.feature_category,
 *   AVG(ce.engagement_score) as avg_engagement,
 *   COUNT(DISTINCT ce.customer_id) as active_users,
 *   SUM(ce.feature_usage_count) as total_usage
 * FROM customer_engagement ce
 * JOIN customers c ON ce.customer_id = c.id
 * WHERE c.segment = ? AND ce.recorded_at >= ?
 * GROUP BY ce.feature_category
 * ORDER BY avg_engagement DESC
 */
export async function getEngagementData(segment = 'all', dateRange = '30days') {
	const params = new URLSearchParams({ segment, dateRange });
	const url = `${config.API_ENDPOINTS.ENGAGEMENT}?${params}`;

	return await apiRequest(url);
}

/**
 * 顧客健全性スコアを更新
 *
 * SQL例:
 * UPDATE customers
 * SET
 *   health_score = ?,
 *   updated_at = NOW()
 * WHERE id = ?
 */
export async function updateCustomerHealthScore(customerId, newScore, reason = '') {
	const url = `${config.API_ENDPOINTS.CUSTOMER_HEALTH}/${customerId}`;

	return await apiRequest(url, {
		method: 'PATCH',
		body: JSON.stringify({
			health_score: newScore,
			update_reason: reason,
			updated_at: new Date().toISOString()
		})
	});
}

/**
 * サポートチケットのステータスを更新
 *
 * SQL例:
 * UPDATE support_tickets
 * SET
 *   status = ?,
 *   assignee_id = ?,
 *   updated_at = NOW(),
 *   resolved_at = CASE WHEN ? = 'resolved' THEN NOW() ELSE resolved_at END
 * WHERE id = ?
 */
export async function updateTicketStatus(ticketId, newStatus, assigneeId = null) {
	const url = `${config.API_ENDPOINTS.SUPPORT_TICKETS}/${ticketId}`;

	const updateData = {
		status: newStatus,
		updated_at: new Date().toISOString()
	};

	if (assigneeId) {
		updateData.assignee_id = assigneeId;
	}

	if (newStatus === 'resolved' || newStatus === 'closed') {
		updateData.resolved_at = new Date().toISOString();
	}

	return await apiRequest(url, {
		method: 'PATCH',
		body: JSON.stringify(updateData)
	});
}

/**
 * 満足度調査を作成
 *
 * SQL例:
 * INSERT INTO customer_satisfaction (
 *   customer_id, nps_score, csat_score, ces_score,
 *   survey_date, feedback_text, created_at
 * ) VALUES (?, ?, ?, ?, ?, ?, NOW())
 */
export async function createSatisfactionSurvey(surveyData) {
	const url = config.API_ENDPOINTS.SATISFACTION;

	return await apiRequest(url, {
		method: 'POST',
		body: JSON.stringify({
			...surveyData,
			created_at: new Date().toISOString()
		})
	});
}

// ===================================
// データ変換ヘルパー関数
// ===================================

/**
 * RDBメトリクスデータをUI用に変換
 */
function transformMetricsData(rawData) {
	// 実際のRDBスキーマに合わせてデータ変換
	return {
		totalCustomers: rawData.total_customers || 0,
		avgHealthScore: rawData.avg_health_score || 0,
		totalRevenue: rawData.total_revenue || 0,
		churnRate: rawData.churn_rate || 0
		// その他の必要な変換処理
	};
}

/**
 * エラーハンドリング用のカスタムエラークラス
 */
export class ApiError extends Error {
	constructor(message, status = null, data = null) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.data = data;
	}
}

/**
 * バッチ処理用のユーティリティ
 * 複数のAPIを並行呼び出しする際に使用
 */
export async function batchApiRequests(requests) {
	try {
		const results = await Promise.allSettled(requests);

		const successful = [];
		const failed = [];

		results.forEach((result, index) => {
			if (result.status === 'fulfilled') {
				successful.push({ index, data: result.value });
			} else {
				failed.push({ index, error: result.reason });
			}
		});

		return { successful, failed };
	} catch (error) {
		throw new ApiError('Batch request failed', null, error);
	}
}
