/**
 * 相対時間を日本語で表示する関数
 */
export function formatRelativeTime(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMinutes = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffMinutes < 1) {
		return 'たった今';
	} else if (diffMinutes < 60) {
		return `${diffMinutes}分前`;
	} else if (diffHours < 24) {
		return `${diffHours}時間前`;
	} else if (diffDays < 7) {
		return `${diffDays}日前`;
	} else {
		// 1週間以上前は具体的な日付を表示
		return date.toLocaleDateString('ja-JP', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
}

/**
 * 日付を日本語フォーマットで表示
 */
export function formatDate(date: Date): string {
	return date.toLocaleDateString('ja-JP', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		weekday: 'long'
	});
}

/**
 * 時刻を含む日付を日本語フォーマットで表示
 */
export function formatDateTime(date: Date): string {
	return date.toLocaleString('ja-JP', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

/**
 * 時刻のみを表示
 */
export function formatTime(date: Date): string {
	return date.toLocaleTimeString('ja-JP', {
		hour: '2-digit',
		minute: '2-digit'
	});
}