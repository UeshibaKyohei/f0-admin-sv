import { writable } from 'svelte/store';

// トースト通知の型定義
// id: ユニークID
// type: 通知タイプ（success, error, warning, info）
// message: 表示メッセージ
// duration: 表示時間（ミリ秒）0の場合は自動で消えない
// position: 表示位置
export const toastPositions = {
	top: 'toast-top',
	'top-start': 'toast-top toast-start',
	'top-center': 'toast-top toast-center',
	'top-end': 'toast-top toast-end',
	middle: 'toast-middle',
	'middle-start': 'toast-middle toast-start',
	'middle-center': 'toast-middle toast-center',
	'middle-end': 'toast-middle toast-end',
	bottom: 'toast-bottom',
	'bottom-start': 'toast-bottom toast-start',
	'bottom-center': 'toast-bottom toast-center',
	'bottom-end': 'toast-bottom toast-end'
};

// トーストストアの作成
function createToastStore() {
	const { subscribe, update } = writable([]);
	
	// タイムアウトIDを管理
	const timeouts = new Map();
	
	// トーストを表示
	function show(message, options = {}) {
		const id = Date.now().toString();
		const toast = {
			id,
			message,
			type: options.type || 'info',
			duration: options.duration !== undefined ? options.duration : 3000,
			position: options.position || 'top-end'
		};
		
		update(toasts => [...toasts, toast]);
		
		// 自動消去の設定
		if (toast.duration > 0) {
			const timeoutId = setTimeout(() => {
				dismiss(id);
			}, toast.duration);
			timeouts.set(id, timeoutId);
		}
		
		return id;
	}
	
	// トーストを削除
	function dismiss(id) {
		update(toasts => toasts.filter(t => t.id !== id));
		
		// タイムアウトをクリア
		if (timeouts.has(id)) {
			clearTimeout(timeouts.get(id));
			timeouts.delete(id);
		}
	}
	
	// すべてのトーストをクリア
	function clear() {
		// すべてのタイムアウトをクリア
		timeouts.forEach(timeoutId => clearTimeout(timeoutId));
		timeouts.clear();
		
		update(() => []);
	}
	
	// 便利メソッド
	const success = (message, options = {}) => show(message, { ...options, type: 'success' });
	const error = (message, options = {}) => show(message, { ...options, type: 'error' });
	const warning = (message, options = {}) => show(message, { ...options, type: 'warning' });
	const info = (message, options = {}) => show(message, { ...options, type: 'info' });
	
	return {
		subscribe,
		show,
		dismiss,
		clear,
		success,
		error,
		warning,
		info
	};
}

export const toast = createToastStore();