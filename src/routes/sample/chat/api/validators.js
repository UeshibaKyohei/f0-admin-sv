/**
 * Validators for Customer Support Chat System
 * 
 * データバリデーション用のユーティリティ関数群
 */

import { createValidationError } from './errorHandler.js';

/**
 * 必須フィールドのバリデーション
 * @param {Object} data - 検証対象のデータ
 * @param {Array<string>} requiredFields - 必須フィールド名の配列
 * @throws {Error} バリデーションエラー
 */
export function validateRequired(data, requiredFields) {
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      throw createValidationError(field, `${field}は必須項目です`);
    }
  }
}

/**
 * メッセージ内容のバリデーション
 * @param {string} message - メッセージ内容
 * @throws {Error} バリデーションエラー
 */
export function validateMessage(message) {
  if (!message || typeof message !== 'string') {
    throw createValidationError('message', 'メッセージを入力してください');
  }
  
  const trimmed = message.trim();
  if (!trimmed) {
    throw createValidationError('message', 'メッセージを入力してください');
  }
  
  if (trimmed.length > 5000) {
    throw createValidationError('message', 'メッセージは5000文字以内で入力してください');
  }
  
  return trimmed;
}

/**
 * 問い合わせカテゴリーのバリデーション
 * @param {string} category - カテゴリー
 * @param {Array<string>} validCategories - 有効なカテゴリーの配列
 * @throws {Error} バリデーションエラー
 */
export function validateCategory(category, validCategories) {
  if (!validCategories.includes(category)) {
    throw createValidationError('category', '無効なカテゴリーが指定されました');
  }
}

/**
 * 優先度のバリデーション
 * @param {string} priority - 優先度
 * @param {Array<string>} validPriorities - 有効な優先度の配列
 * @throws {Error} バリデーションエラー
 */
export function validatePriority(priority, validPriorities) {
  if (!validPriorities.includes(priority)) {
    throw createValidationError('priority', '無効な優先度が指定されました');
  }
}

/**
 * オペレーターステータスのバリデーション
 * @param {string} status - ステータス
 * @param {string} currentStatus - 現在のステータス
 * @throws {Error} バリデーションエラー
 */
export function validateOperatorStatus(status, currentStatus) {
  const validStatuses = ['available', 'busy', 'break', 'offline'];
  
  if (!validStatuses.includes(status)) {
    throw createValidationError('status', '無効なステータスが指定されました');
  }
  
  // ステータス遷移のルール
  const invalidTransitions = {
    'offline': ['busy'], // オフラインから対応中への直接遷移は不可
    'busy': ['offline']  // 対応中からオフラインへの直接遷移は不可（チャットを終了してから）
  };
  
  if (invalidTransitions[currentStatus]?.includes(status)) {
    throw createValidationError(
      'status', 
      `${currentStatus}から${status}への変更はできません`
    );
  }
}

/**
 * チャット終了時のバリデーション
 * @param {Object} resolutionData - 終了データ
 * @throws {Error} バリデーションエラー
 */
export function validateChatResolution(resolutionData) {
  validateRequired(resolutionData, ['resolution', 'summary']);
  
  const validResolutions = ['resolved', 'escalated', 'unresolved'];
  if (!validResolutions.includes(resolutionData.resolution)) {
    throw createValidationError('resolution', '無効な解決ステータスが指定されました');
  }
  
  const summary = resolutionData.summary.trim();
  if (summary.length < 10) {
    throw createValidationError('summary', '対応内容の要約は10文字以上で入力してください');
  }
  
  if (summary.length > 1000) {
    throw createValidationError('summary', '対応内容の要約は1000文字以内で入力してください');
  }
}

/**
 * 顧客データのバリデーション
 * @param {Object} customerData - 顧客データ
 * @throws {Error} バリデーションエラー
 */
export function validateCustomerData(customerData) {
  validateRequired(customerData, ['id', 'name']);
  
  // メールアドレスの形式チェック（オプショナル）
  if (customerData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.email)) {
      throw createValidationError('email', '有効なメールアドレスを入力してください');
    }
  }
  
  // 電話番号の形式チェック（オプショナル）
  if (customerData.phone) {
    const phoneRegex = /^[\d-+()]+$/;
    if (!phoneRegex.test(customerData.phone)) {
      throw createValidationError('phone', '有効な電話番号を入力してください');
    }
  }
}

/**
 * テンプレート変数の置換
 * @param {string} template - テンプレート文字列
 * @param {Object} variables - 変数のマップ
 * @returns {string} 置換後の文字列
 */
export function replaceTemplateVariables(template, variables) {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value || '');
  }
  
  // 未置換のプレースホルダーをチェック
  const unreplaced = result.match(/\{[^}]+\}/g);
  if (unreplaced) {
    console.warn('Unreplaced template variables:', unreplaced);
  }
  
  return result;
}

/**
 * XSS対策用のHTMLエスケープ
 * @param {string} str - エスケープする文字列
 * @returns {string} エスケープ後の文字列
 */
export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * 日時の妥当性チェック
 * @param {string} dateString - ISO形式の日時文字列
 * @returns {boolean} 妥当な日時かどうか
 */
export function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}