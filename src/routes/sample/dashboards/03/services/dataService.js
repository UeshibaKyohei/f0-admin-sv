/**
 * カスタマーサクセスダッシュボード データサービス
 *
 * @description
 * このファイルはダッシュボードで使用するデータを提供する抽象化レイヤーです。
 * config.USE_MOCK_DATA の設定に応じて、モックデータまたは実際のAPIを呼び出します。
 */

import { config } from '../config.js';
import * as mockDataService from './mockDataService.js';
import * as apiService from './apiService.js';

/**
 * 顧客メトリクスを取得
 *
 * 対応するDB: customers テーブル + 集計処理
 * @param {string} segment - 顧客セグメント
 * @param {string} dateRange - 期間
 * @returns {Promise<Object>} 顧客メトリクス
 */
export async function getCustomerMetrics(segment = 'all', dateRange = '30days') {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getCustomerMetrics(segment, dateRange);
	}

	// 本番実装: API呼び出し
	return apiService.getCustomerMetrics(segment, dateRange);
}

/**
 * 満足度トレンドデータを取得
 *
 * 対応するDB: satisfaction_surveys テーブル
 * @param {string} segment - 顧客セグメント
 * @param {string} dateRange - 期間
 * @param {string} metricType - メトリクスタイプ (nps, csat, ces)
 * @returns {Promise<Object>} 満足度データ
 */
export async function getSatisfactionTrends(
	segment = 'all',
	dateRange = '30days',
	metricType = 'nps'
) {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getSatisfactionTrends(segment, dateRange, metricType);
	}

	// 本番実装: API呼び出し
	return apiService.getSatisfactionTrends(segment, dateRange, metricType);
}

/**
 * チャーン分析データを取得
 *
 * 対応するDB: customers + churn_predictions テーブル
 * @param {string} segment - 顧客セグメント
 * @param {string} dateRange - 期間
 * @returns {Promise<Object>} チャーン分析データ
 */
export async function getChurnAnalysis(segment = 'all', dateRange = '30days') {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getChurnAnalysis(segment, dateRange);
	}

	// 本番実装: API呼び出し
	return apiService.getChurnAnalysis(segment, dateRange);
}

/**
 * 顧客健全性データを取得
 *
 * 対応するDB: customer_health_scores テーブル
 * @param {string} segment - 顧客セグメント
 * @param {string} dateRange - 期間
 * @returns {Promise<Array>} 顧客健全性データ
 */
export async function getCustomerHealth(segment = 'all', dateRange = '30days') {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getCustomerHealth(segment, dateRange);
	}

	// 本番実装: API呼び出し
	return apiService.getCustomerHealth(segment, dateRange);
}

/**
 * サポートチケットデータを取得
 *
 * 対応するDB: support_tickets テーブル
 * @param {string} segment - 顧客セグメント
 * @param {string} dateRange - 期間
 * @param {boolean} showDetails - 詳細表示フラグ
 * @returns {Promise<Object>} サポートチケットデータ
 */
export async function getSupportTickets(
	segment = 'all',
	dateRange = '30days',
	showDetails = false
) {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getSupportTickets(segment, dateRange, showDetails);
	}

	// 本番実装: API呼び出し
	return apiService.getSupportTickets(segment, dateRange, showDetails);
}

/**
 * 収益・維持率データを取得
 *
 * 対応するDB: revenue_data + customer_subscriptions テーブル
 * @param {string} segment - 顧客セグメント
 * @param {string} dateRange - 期間
 * @returns {Promise<Object>} 収益・維持率データ
 */
export async function getRevenueRetention(segment = 'all', dateRange = '30days') {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getRevenueRetention(segment, dateRange);
	}

	// 本番実装: API呼び出し
	return apiService.getRevenueRetention(segment, dateRange);
}

/**
 * エンゲージメントデータを取得
 *
 * 対応するDB: user_activity_logs + feature_usage テーブル
 * @param {string} segment - 顧客セグメント
 * @param {string} dateRange - 期間
 * @returns {Promise<Object>} エンゲージメントデータ
 */
export async function getEngagementData(segment = 'all', dateRange = '30days') {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getEngagementData(segment, dateRange);
	}

	// 本番実装: API呼び出し
	return apiService.getEngagementData(segment, dateRange);
}

/**
 * 顧客の健全性スコアを更新
 *
 * 対応するDB: customer_health_scores テーブル UPDATE
 * @param {string} customerId - 顧客ID
 * @param {number} newScore - 新しいスコア
 * @param {string} reason - 更新理由
 * @returns {Promise<Object>} 更新結果
 */
export async function updateCustomerHealthScore(customerId, newScore, reason = '') {
	if (config.USE_MOCK_DATA) {
		return mockDataService.updateCustomerHealthScore(customerId, newScore, reason);
	}

	// 本番実装: API呼び出し
	return apiService.updateCustomerHealthScore(customerId, newScore, reason);
}

/**
 * サポートチケットのステータスを更新
 *
 * 対応するDB: support_tickets テーブル UPDATE
 * @param {string} ticketId - チケットID
 * @param {string} newStatus - 新しいステータス
 * @param {string} assigneeId - 担当者ID
 * @returns {Promise<Object>} 更新結果
 */
export async function updateTicketStatus(ticketId, newStatus, assigneeId = null) {
	if (config.USE_MOCK_DATA) {
		return mockDataService.updateTicketStatus(ticketId, newStatus, assigneeId);
	}

	// 本番実装: API呼び出し
	return apiService.updateTicketStatus(ticketId, newStatus, assigneeId);
}

/**
 * 満足度調査を作成
 *
 * 対応するDB: satisfaction_surveys テーブル INSERT
 * @param {Object} surveyData - 調査データ
 * @returns {Promise<Object>} 作成結果
 */
export async function createSatisfactionSurvey(surveyData) {
	if (config.USE_MOCK_DATA) {
		return mockDataService.createSatisfactionSurvey(surveyData);
	}

	// 本番実装: API呼び出し
	return apiService.createSatisfactionSurvey(surveyData);
}
