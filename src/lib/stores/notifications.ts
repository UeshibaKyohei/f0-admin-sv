import { writable, derived } from 'svelte/store';

// 通知の型定義
export interface Notification {
	id: string;
	type: 'info' | 'success' | 'warning' | 'error' | 'system';
	title: string;
	message: string;
	sourceModule: string; // 発生元モジュール（例: 'user-management', 'inventory', 'sales'）
	sourceId?: string; // 発生元の具体的なID（例: ユーザーID、商品ID）
	priority: 'low' | 'medium' | 'high' | 'critical';
	isRead: boolean;
	createdAt: Date;
	readAt?: Date;
	actionUrl?: string; // クリック時の遷移先URL
	actionLabel?: string; // アクションボタンのラベル
	data?: Record<string, any>; // 追加のメタデータ
}

// 通知フィルター設定
export interface NotificationFilter {
	types: Notification['type'][];
	priorities: Notification['priority'][];
	modules: string[];
	isRead?: boolean;
	dateRange?: {
		start: Date;
		end: Date;
	};
}

// 通知設定
export interface NotificationSettings {
	enableDesktopNotifications: boolean;
	enableSoundNotifications: boolean;
	enableEmailNotifications: boolean;
	priorities: {
		[key in Notification['priority']]: {
			desktop: boolean;
			sound: boolean;
			email: boolean;
		};
	};
	modules: {
		[module: string]: {
			enabled: boolean;
			desktop: boolean;
			sound: boolean;
			email: boolean;
		};
	};
}

// デモデータ
const createDemoNotifications = (): Notification[] => {
	const baseDate = new Date();
	return [
		{
			id: 'n1',
			type: 'warning',
			title: '在庫不足警告',
			message: 'iPhone 14 Pro の在庫が5個を下回りました',
			sourceModule: 'inventory',
			sourceId: 'item_123',
			priority: 'high',
			isRead: false,
			createdAt: new Date(baseDate.getTime() - 5 * 60 * 1000), // 5分前
			actionUrl: '/sample/data-management/zaiko',
			actionLabel: '在庫確認',
			data: { itemName: 'iPhone 14 Pro', currentStock: 4, threshold: 5 }
		},
		{
			id: 'n2',
			type: 'error',
			title: 'システムエラー',
			message: 'データベース接続に失敗しました',
			sourceModule: 'system',
			priority: 'critical',
			isRead: false,
			createdAt: new Date(baseDate.getTime() - 15 * 60 * 1000), // 15分前
			actionUrl: '/system/health',
			actionLabel: 'システム状態確認',
		},
		{
			id: 'n3',
			type: 'success',
			title: '新規注文',
			message: 'お客様から新しい注文が入りました（注文番号: #ORD-001）',
			sourceModule: 'sales',
			sourceId: 'order_001',
			priority: 'medium',
			isRead: false,
			createdAt: new Date(baseDate.getTime() - 30 * 60 * 1000), // 30分前
			actionUrl: '/orders/ORD-001',
			actionLabel: '注文詳細',
			data: { orderNumber: 'ORD-001', amount: 25000 }
		},
		{
			id: 'n4',
			type: 'info',
			title: '新規ユーザー登録',
			message: '田中太郎さんが新規登録されました',
			sourceModule: 'user-management',
			sourceId: 'user_456',
			priority: 'low',
			isRead: true,
			createdAt: new Date(baseDate.getTime() - 2 * 60 * 60 * 1000), // 2時間前
			readAt: new Date(baseDate.getTime() - 1 * 60 * 60 * 1000), // 1時間前に既読
			actionUrl: '/sample/data-management/employee01',
			actionLabel: 'ユーザー確認',
			data: { userName: '田中太郎', email: 'tanaka@example.com' }
		},
		{
			id: 'n5',
			type: 'warning',
			title: 'セキュリティアラート',
			message: '異常なログイン試行が検出されました',
			sourceModule: 'security',
			priority: 'high',
			isRead: false,
			createdAt: new Date(baseDate.getTime() - 4 * 60 * 60 * 1000), // 4時間前
			actionUrl: '/security/logs',
			actionLabel: 'ログ確認',
			data: { ip: '192.168.1.100', attempts: 5 }
		},
		{
			id: 'n6',
			type: 'system',
			title: 'システムメンテナンス予告',
			message: '明日2:00-4:00にシステムメンテナンスを実施します',
			sourceModule: 'system',
			priority: 'medium',
			isRead: true,
			createdAt: new Date(baseDate.getTime() - 24 * 60 * 60 * 1000), // 1日前
			readAt: new Date(baseDate.getTime() - 20 * 60 * 60 * 1000), // 20時間前に既読
			actionUrl: '/system/maintenance',
			actionLabel: '詳細確認'
		}
	];
};

// ストア
export const notifications = writable<Notification[]>(createDemoNotifications());
export const notificationFilter = writable<NotificationFilter>({
	types: ['info', 'success', 'warning', 'error', 'system'],
	priorities: ['low', 'medium', 'high', 'critical'],
	modules: [],
	isRead: undefined
});

export const notificationSettings = writable<NotificationSettings>({
	enableDesktopNotifications: true,
	enableSoundNotifications: true,
	enableEmailNotifications: false,
	priorities: {
		low: { desktop: false, sound: false, email: false },
		medium: { desktop: true, sound: false, email: false },
		high: { desktop: true, sound: true, email: true },
		critical: { desktop: true, sound: true, email: true }
	},
	modules: {
		'inventory': { enabled: true, desktop: true, sound: true, email: true },
		'system': { enabled: true, desktop: true, sound: true, email: true },
		'sales': { enabled: true, desktop: true, sound: false, email: false },
		'user-management': { enabled: true, desktop: false, sound: false, email: false },
		'security': { enabled: true, desktop: true, sound: true, email: true }
	}
});

// 派生ストア
export const unreadNotifications = derived(
	notifications,
	($notifications) => $notifications.filter(n => !n.isRead)
);

export const unreadCount = derived(
	unreadNotifications,
	($unreadNotifications) => $unreadNotifications.length
);

export const filteredNotifications = derived(
	[notifications, notificationFilter],
	([$notifications, $filter]) => {
		return $notifications.filter(notification => {
			// タイプフィルター
			if (!$filter.types.includes(notification.type)) return false;
			
			// 優先度フィルター
			if (!$filter.priorities.includes(notification.priority)) return false;
			
			// モジュールフィルター
			if ($filter.modules.length > 0 && !$filter.modules.includes(notification.sourceModule)) return false;
			
			// 既読フィルター
			if ($filter.isRead !== undefined && notification.isRead !== $filter.isRead) return false;
			
			// 日付フィルター
			if ($filter.dateRange) {
				const notificationDate = notification.createdAt;
				if (notificationDate < $filter.dateRange.start || notificationDate > $filter.dateRange.end) return false;
			}
			
			return true;
		});
	}
);

// アクション関数
export const notificationActions = {
	// 通知を既読にする
	markAsRead: (notificationId: string) => {
		notifications.update(items => 
			items.map(item => 
				item.id === notificationId 
					? { ...item, isRead: true, readAt: new Date() }
					: item
			)
		);
	},

	// 全て既読にする
	markAllAsRead: () => {
		const now = new Date();
		notifications.update(items =>
			items.map(item => 
				item.isRead ? item : { ...item, isRead: true, readAt: now }
			)
		);
	},

	// 通知を削除
	remove: (notificationId: string) => {
		notifications.update(items => 
			items.filter(item => item.id !== notificationId)
		);
	},

	// 新しい通知を追加
	add: (notification: Omit<Notification, 'id' | 'createdAt'>) => {
		const newNotification: Notification = {
			...notification,
			id: `n_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			createdAt: new Date()
		};
		
		notifications.update(items => [newNotification, ...items]);
		
		// デスクトップ通知を表示（ブラウザがサポートしている場合）
		if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
			new Notification(newNotification.title, {
				body: newNotification.message,
				icon: '/favicon.ico'
			});
		}
		
		return newNotification;
	},

	// フィルターを更新
	updateFilter: (filter: Partial<NotificationFilter>) => {
		notificationFilter.update(current => ({ ...current, ...filter }));
	},

	// 設定を更新
	updateSettings: (settings: Partial<NotificationSettings>) => {
		notificationSettings.update(current => ({ ...current, ...settings }));
	},

	// デスクトップ通知の許可を要求
	requestDesktopPermission: async () => {
		if (typeof window !== 'undefined' && 'Notification' in window) {
			const permission = await Notification.requestPermission();
			return permission === 'granted';
		}
		return false;
	}
};