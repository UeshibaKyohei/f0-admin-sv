import { writable } from 'svelte/store';

/**
 * デバッグモードの設定を管理するストア
 */
export const debugSettings = writable({
	autoGenerate: false,
	autoReply: false,
	showStats: true
});
