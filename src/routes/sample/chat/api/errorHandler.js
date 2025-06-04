/**
 * Error Handler for Customer Support Chat System
 *
 * 統一的なエラーハンドリングとユーザー通知を提供
 */

import { writable } from 'svelte/store';

/**
 * エラー通知ストア
 * UIでトーストやアラートを表示するために使用
 */
export const errorNotifications = writable([]);

/**
 * エラー種別の定義
 */
export const ErrorTypes = {
	NETWORK: 'network',
	VALIDATION: 'validation',
	PERMISSION: 'permission',
	CAPACITY: 'capacity',
	BUSINESS: 'business',
	UNKNOWN: 'unknown'
};

/**
 * エラーメッセージのマッピング
 */
const errorMessages = {
	[ErrorTypes.NETWORK]: 'ネットワークエラーが発生しました。接続を確認してください。',
	[ErrorTypes.VALIDATION]: '入力内容に誤りがあります。',
	[ErrorTypes.PERMISSION]: 'この操作を実行する権限がありません。',
	[ErrorTypes.CAPACITY]: '対応可能な上限に達しています。',
	[ErrorTypes.BUSINESS]: '業務エラーが発生しました。',
	[ErrorTypes.UNKNOWN]: '予期しないエラーが発生しました。'
};

/**
 * エラーを処理してユーザーに通知
 * @param {Error|Object} error - エラーオブジェクト
 * @param {string} context - エラーが発生したコンテキスト
 * @param {Object} options - オプション設定
 */
export function handleError(error, context = '', options = {}) {
	const { showNotification = true, logToConsole = true, duration = 5000 } = options;

	// エラーの詳細を抽出
	const errorDetail = {
		id: `error-${Date.now()}`,
		type: error.type || ErrorTypes.UNKNOWN,
		message: error.userMessage || error.message || errorMessages[ErrorTypes.UNKNOWN],
		detail: error.detail || '',
		context,
		timestamp: new Date().toISOString(),
		severity: error.severity || 'error'
	};

	// コンソールにログ出力
	if (logToConsole) {
		console.error(`[${context}]`, error, errorDetail);
	}

	// ユーザーに通知
	if (showNotification) {
		errorNotifications.update((notifications) => [...notifications, errorDetail]);

		// 一定時間後に通知を削除
		setTimeout(() => {
			errorNotifications.update((notifications) =>
				notifications.filter((n) => n.id !== errorDetail.id)
			);
		}, duration);
	}

	return errorDetail;
}

/**
 * API エラーレスポンスを処理
 * @param {Response} response - Fetch APIのレスポンス
 * @param {string} context - エラーコンテキスト
 * @throws {Error} 処理されたエラー
 */
export async function handleApiError(response, context) {
	if (response.ok) return;

	let errorData;
	try {
		errorData = await response.json();
	} catch {
		errorData = { message: response.statusText };
	}

	const error = new Error(errorData.message || 'APIエラー');
	error.type = determineErrorType(response.status);
	error.status = response.status;
	error.detail = errorData.detail;
	error.userMessage = getUserFriendlyMessage(error.type, errorData);

	throw error;
}

/**
 * HTTPステータスコードからエラータイプを判定
 */
function determineErrorType(status) {
	switch (status) {
		case 400:
			return ErrorTypes.VALIDATION;
		case 401:
		case 403:
			return ErrorTypes.PERMISSION;
		case 409:
			return ErrorTypes.BUSINESS;
		case 503:
			return ErrorTypes.CAPACITY;
		default:
			return status >= 500 ? ErrorTypes.NETWORK : ErrorTypes.UNKNOWN;
	}
}

/**
 * ユーザーフレンドリーなエラーメッセージを生成
 */
function getUserFriendlyMessage(type, errorData) {
	// APIから具体的なメッセージがある場合はそれを使用
	if (errorData.userMessage) {
		return errorData.userMessage;
	}

	// 特定のエラーコードに対するメッセージ
	if (errorData.code) {
		switch (errorData.code) {
			case 'OPERATOR_AT_CAPACITY':
				return '現在対応可能な上限に達しています。他のチャットを終了してから再度お試しください。';
			case 'INQUIRY_ALREADY_ASSIGNED':
				return 'この問い合わせは既に他のオペレーターが対応中です。';
			case 'INVALID_STATUS_TRANSITION':
				return 'このステータスへの変更はできません。';
			default:
				break;
		}
	}

	// デフォルトメッセージ
	return errorMessages[type];
}

/**
 * バリデーションエラーを生成
 * @param {string} field - フィールド名
 * @param {string} message - エラーメッセージ
 * @returns {Error}
 */
export function createValidationError(field, message) {
	const error = new Error(message);
	error.type = ErrorTypes.VALIDATION;
	error.field = field;
	error.userMessage = message;
	return error;
}

/**
 * 容量エラーを生成
 * @param {number} current - 現在の数
 * @param {number} max - 最大数
 * @returns {Error}
 */
export function createCapacityError(current, max) {
	const error = new Error(`対応可能な上限（${max}件）に達しています`);
	error.type = ErrorTypes.CAPACITY;
	error.current = current;
	error.max = max;
	error.userMessage = error.message;
	return error;
}
