/**
 * プロジェクト管理ダッシュボード データサービス
 *
 * @description
 * このファイルはダッシュボードで使用するデータを提供する抽象化レイヤーです。
 * config.USE_MOCK_DATA の設定に応じて、モックデータまたは実際のAPIを呼び出します。
 * 本番環境ではmockDataService.jsの代わりに実際のAPI通信ロジックに置き換えてください。
 */

import { config } from '../config.js';
import * as mockDataService from './mockDataService.js';

/**
 * プロジェクト一覧を取得
 *
 * 対応するDB: projects テーブル
 * @param {Object} params - 取得パラメータ
 * @param {string} params.userId - ユーザーID（権限フィルタリング用）
 * @param {string} params.status - プロジェクトステータスフィルタ
 * @returns {Promise<Array>} プロジェクト一覧
 */
export async function getProjects(params = {}) {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getProjects(params);
	}

	// 本番実装: API呼び出し
	const response = await fetch(`${config.API_ENDPOINTS.PROJECTS}?${new URLSearchParams(params)}`);
	if (!response.ok) throw new Error('Failed to fetch projects');
	return response.json();
}

/**
 * プロジェクト概要メトリクスを取得
 *
 * 対応するDB: projects テーブル (COUNT, SUM集計)
 * @param {string} projectId - プロジェクトID（'all'の場合は全プロジェクト）
 * @returns {Promise<Object>} プロジェクトメトリクス
 */
export async function getProjectMetrics(projectId = 'all') {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getProjectMetrics(projectId);
	}

	// 本番実装: API呼び出し
	const endpoint =
		projectId === 'all'
			? `${config.API_ENDPOINTS.PROJECTS}/metrics`
			: `${config.API_ENDPOINTS.PROJECTS}/${projectId}/metrics`;

	const response = await fetch(endpoint);
	if (!response.ok) throw new Error('Failed to fetch project metrics');
	return response.json();
}

/**
 * チームメンバーの稼働状況を取得
 *
 * 対応するDB: team_members + task_assignments テーブル (JOIN)
 * @param {string} projectId - プロジェクトID
 * @returns {Promise<Array>} チームメンバー稼働データ
 */
export async function getTeamWorkload(projectId = 'all') {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getTeamWorkload(projectId);
	}

	// 本番実装: API呼び出し
	const params = projectId !== 'all' ? `?projectId=${projectId}` : '';
	const response = await fetch(`${config.API_ENDPOINTS.TEAM_MEMBERS}/workload${params}`);
	if (!response.ok) throw new Error('Failed to fetch team workload');
	return response.json();
}

/**
 * マイルストーン情報を取得
 *
 * 対応するDB: milestones テーブル
 * @param {string} projectId - プロジェクトID
 * @returns {Promise<Array>} マイルストーン一覧
 */
export async function getMilestones(projectId = 'all') {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getMilestones(projectId);
	}

	// 本番実装: API呼び出し
	const params = projectId !== 'all' ? `?projectId=${projectId}` : '';
	const response = await fetch(`${config.API_ENDPOINTS.MILESTONES}${params}`);
	if (!response.ok) throw new Error('Failed to fetch milestones');
	return response.json();
}

/**
 * ガントチャート用データを取得
 *
 * 対応するDB: tasks + dependencies テーブル (JOIN)
 * @param {string} projectId - プロジェクトID
 * @param {string} viewMode - 表示モード ('month', 'quarter', 'year')
 * @returns {Promise<Object>} ガントチャートデータ
 */
export async function getGanttData(projectId = 'all', viewMode = 'month') {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getGanttData(projectId, viewMode);
	}

	// 本番実装: API呼び出し
	const params = new URLSearchParams({
		...(projectId !== 'all' && { projectId }),
		viewMode
	});

	const response = await fetch(`${config.API_ENDPOINTS.GANTT_DATA}?${params}`);
	if (!response.ok) throw new Error('Failed to fetch gantt data');
	return response.json();
}

/**
 * かんばんボード用タスクデータを取得
 *
 * 対応するDB: tasks テーブル
 * @param {string} projectId - プロジェクトID
 * @returns {Promise<Object>} かんばんタスクデータ（カラムごとにグループ化）
 */
export async function getKanbanTasks(projectId = 'all') {
	if (config.USE_MOCK_DATA) {
		return mockDataService.getKanbanTasks(projectId);
	}

	// 本番実装: API呼び出し
	const params = projectId !== 'all' ? `?projectId=${projectId}` : '';
	const response = await fetch(`${config.API_ENDPOINTS.TASKS}/kanban${params}`);
	if (!response.ok) throw new Error('Failed to fetch kanban tasks');
	return response.json();
}

/**
 * タスクのステータスを更新（ドラッグ&ドロップ対応）
 *
 * 対応するDB: tasks テーブル UPDATE
 * @param {string} taskId - タスクID
 * @param {string} newStatus - 新しいステータス
 * @param {number} newPosition - 新しい位置（カラム内での順序）
 * @returns {Promise<Object>} 更新結果
 */
export async function updateTaskStatus(taskId, newStatus, newPosition = null) {
	if (config.USE_MOCK_DATA) {
		return mockDataService.updateTaskStatus(taskId, newStatus, newPosition);
	}

	// 本番実装: API呼び出し
	const response = await fetch(`${config.API_ENDPOINTS.TASKS}/${taskId}/status`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			status: newStatus,
			...(newPosition !== null && { position: newPosition })
		})
	});

	if (!response.ok) throw new Error('Failed to update task status');
	return response.json();
}
