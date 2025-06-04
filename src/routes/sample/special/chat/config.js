/**
 * チャット機能専用の設定ファイル
 *
 * このファイルはチャット機能のみの設定を管理します。
 * 他の機能には影響しません。
 */

// チャット機能のモックモード設定
// true: モックデータを使用（開発/デモ用）
// false: 実際のAPI通信を行う（本番用）
export const USE_CHAT_MOCK = true;

// デモデータ生成設定（モックモードのみ有効）
export const DEMO_CONFIG = {
	// 初期問い合わせ数
	initialInquiryCount: 3,

	// 自動生成の間隔（ミリ秒）
	autoGenerateInterval: 10000,

	// 自動生成の確率（0-1）
	autoGenerateProbability: 0.3,

	// 新規問い合わせボタンの表示
	showNewInquiryButton: true
};

// API設定（本番モード用）
export const API_CONFIG = {
	baseUrl: '/api/chat',
	timeout: 30000
};
