import { initializeSupport } from './supportStore.js';

/**
 * +page.js - ページロード時の初期化
 * SvelteKitのload関数を使用して、ページ表示前にデータを準備
 */
export async function load() {
	// ストアの初期化（API経由でデータ取得）
	await initializeSupport();

	return {
		// 必要に応じて初期データを返す
	};
}
