import { writable, derived, get } from 'svelte/store';
import { operatorAPI, inquiryAPI, chatAPI, customerAPI, mockWebSocket } from './api/mockService.js';

/**
 * Customer Support Chat System - Store Management
 *
 * このファイルは、カスタマーサポートチャットシステムの状態管理を行います。
 * すべてのデータはAPIを通じて取得・更新されます。
 *
 * データベース構造については ./api/database-schema.sql を参照してください。
 */

// =====================================
// Core Stores
// =====================================

/**
 * システム全体の統計情報
 * リアルタイムダッシュボードで使用
 */
export const systemStatus = writable({
	totalOperators: 0,
	availableOperators: 0,
	totalInquiries: 0,
	waitingInquiries: 0,
	avgResponseTime: 0
});

/**
 * オペレーター一覧
 * データベース: operators テーブル + operator_skills テーブル
 */
export const operators = writable([]);

/**
 * 現在ログイン中のオペレーター
 * セッションまたはJWTトークンから取得
 */
export const currentOperator = writable(null);

/**
 * 問い合わせキュー
 * データベース: inquiries テーブル（status = 'waiting'）
 */
export const inquiryQueue = writable([]);

/**
 * アクティブなチャット一覧
 * データベース: chat_sessions テーブル（status = 'active'）
 */
export const activeChats = writable([]);

/**
 * 顧客情報キャッシュ
 * データベース: customers テーブル
 */
export const customers = writable({});

/**
 * チャットメッセージ
 * データベース: messages テーブル
 * キー: chatId, 値: メッセージ配列
 */
export const messages = writable({});

/**
 * チャット履歴（アーカイブ）
 * データベース: chat_sessions テーブル（end_time IS NOT NULL）
 */
export const archivedChats = writable({});

/**
 * 現在選択中のチャットID
 */
export const selectedChatId = writable(null);

/**
 * 返信テンプレート
 * データベース: response_templates テーブル
 */
export const responseTemplates = writable([]);

/**
 * 通知キュー（割り当て、エスカレーションなど）
 */
export const notifications = writable([]);

/**
 * 承認待ちのチャット
 */
export const pendingAssignments = writable({});

// =====================================
// Derived Stores
// =====================================

/**
 * 待機中の問い合わせ（未割り当て）
 */
export const waitingInquiries = derived(inquiryQueue, ($inquiryQueue) =>
	$inquiryQueue.filter((inq) => inq.status === 'waiting' && !inq.assignedTo)
);

/**
 * オペレーター別の負荷状況
 * リアルタイムで各オペレーターの対応状況を計算
 */
export const operatorLoad = derived([operators, activeChats], ([$operators, $activeChats]) => {
	return $operators.map((op) => {
		const currentChats = $activeChats.filter((chat) => chat.assignedTo === op.id);
		const currentChatCount = currentChats.length;
		const load = (currentChatCount / op.maxConcurrent) * 100;

		return {
			...op,
			currentChats,
			currentChatCount,
			load: Math.min(load, 100),
			canTakeMore:
				currentChatCount < op.maxConcurrent && (op.status === 'available' || op.status === 'busy')
		};
	});
});

// =====================================
// Enums and Constants
// =====================================

/**
 * 問い合わせカテゴリー定義
 */
export const inquiryCategories = {
	shipping: { label: '配送', icon: '📦' },
	return: { label: '返品', icon: '↩️' },
	product: { label: '商品', icon: '📱' },
	technical: { label: '技術', icon: '🔧' },
	billing: { label: '請求', icon: '💳' },
	other: { label: 'その他', icon: '💬' }
};

/**
 * 優先度定義（SLA時間を含む）
 */
export const priorities = {
	urgent: { label: '緊急', color: 'badge-error', sla: 5 },
	high: { label: '高', color: 'badge-warning', sla: 15 },
	normal: { label: '中', color: 'badge-primary', sla: 30 },
	low: { label: '低', color: 'badge-ghost', sla: 60 }
};

/**
 * チャットステータス定義
 */
export const chatStatuses = {
	active: { label: '対応中', color: 'badge-success' },
	hold: { label: '保留', color: 'badge-info' },
	resolved: { label: '解決済み', color: 'badge-neutral' },
	escalated: { label: 'エスカレーション', color: 'badge-error' }
};

// =====================================
// API Integration Functions
// =====================================

/**
 * 初期データの読み込み
 */
export async function initializeStores() {
	try {
		// 全オペレーター一覧を取得
		const operatorsResult = await operatorAPI.getAll();
		if (operatorsResult.success) {
			operators.set(operatorsResult.data);
		}

		// 現在のオペレーター情報を取得
		const operatorResult = await operatorAPI.getCurrentOperator();
		if (operatorResult.success) {
			currentOperator.set(operatorResult.data);
		}

		// アクティブなチャットを取得
		const chatsResult = await chatAPI.getActive();
		if (chatsResult.success) {
			activeChats.set(chatsResult.data);
		}

		// 待機中の問い合わせを取得
		await refreshInquiryQueue();

		// WebSocketまたはポーリングでリアルタイム更新を開始
		startRealtimeUpdates();
	} catch (error) {
		console.error('Failed to initialize stores:', error);
	}
}

/**
 * 問い合わせキューの更新
 */
export async function refreshInquiryQueue() {
	const result = await inquiryAPI.getWaiting();
	if (result.success) {
		inquiryQueue.set(result.data);
	}
}

/**
 * 新規問い合わせの追加
 */
export async function addInquiry(customerData, message, category = 'other') {
	try {
		const inquiryData = {
			customerId: customerData.id,
			customerName: customerData.name,
			customerTier: customerData.tier,
			subject: `${inquiryCategories[category].label}に関する問い合わせ`,
			initialMessage: message,
			category,
			priority: determinePriority(customerData),
			slaDeadline: calculateSLA(determinePriority(customerData))
		};

		const result = await inquiryAPI.create(inquiryData);
		if (result.success) {
			// ローカルストアに追加
			inquiryQueue.update((queue) => [...queue, result.data]);

			// 顧客情報をキャッシュ
			customers.update((cust) => ({
				...cust,
				[customerData.id]: customerData
			}));
		}

		return result;
	} catch (error) {
		console.error('Failed to add inquiry:', error);
		throw error;
	}
}

/**
 * 問い合わせをオペレーターに割り当て依頼
 */
export async function requestAssignInquiry(inquiryId, operatorId, requestedBy = null) {
	try {
		// 容量チェック
		const capacity = getCurrentOperatorCapacity(operatorId);
		if (!capacity.canTakeMore) {
			throw new Error(`対応可能な上限（${capacity.max}件）に達しています`);
		}

		// 削除前にinquiryを取得
		const inquiry = get(inquiryQueue).find((inq) => inq.id === inquiryId);
		if (!inquiry) throw new Error('問い合わせが見つかりません');

		// 承認待ちリストに追加
		pendingAssignments.update((pending) => ({
			...pending,
			[inquiryId]: {
				inquiry,
				targetOperatorId: operatorId,
				requestedBy: requestedBy || get(currentOperator)?.id,
				requestedAt: new Date().toISOString(),
				type: 'assignment'
			}
		}));

		// 通知を送信
		addNotification({
			id: `notify-assign-${inquiryId}`,
			type: 'assignment',
			operatorId,
			title: '新しい問い合わせの割り当て',
			message: `${inquiry.customerName}からの${inquiryCategories[inquiry.category]?.label || inquiry.category}に関する問い合わせ`,
			inquiryId,
			priority: inquiry.priority
		});

		return { success: true, pending: true };
	} catch (error) {
		console.error('Failed to request assignment:', error);
		throw error;
	}
}

/**
 * 割り当てを承認
 */
export async function acceptAssignment(inquiryId) {
	try {
		const pending = get(pendingAssignments)[inquiryId];
		if (!pending) throw new Error('承認待ちの割り当てが見つかりません');

		const result = await inquiryAPI.assign(inquiryId, pending.targetOperatorId);
		if (result.success) {
			// ローカルストアを更新
			inquiryQueue.update((queue) => queue.filter((inq) => inq.id !== inquiryId));

			activeChats.update((chats) => [...chats, result.data]);

			// 初期メッセージをセット
			if (pending.inquiry?.initialMessage) {
				messages.update((msgs) => ({
					...msgs,
					[inquiryId]: [
						{
							id: `msg-init-${inquiryId}`,
							chatId: inquiryId,
							type: 'customer',
							content: pending.inquiry.initialMessage,
							timestamp: pending.inquiry.createdAt
						}
					]
				}));
			}

			// 承認待ちから削除
			pendingAssignments.update((pending) => {
				const newPending = { ...pending };
				delete newPending[inquiryId];
				return newPending;
			});

			// 通知を削除
			removeNotification(`notify-assign-${inquiryId}`);

			// 自動で選択
			selectedChatId.set(inquiryId);
		}

		return result;
	} catch (error) {
		console.error('Failed to accept assignment:', error);
		throw error;
	}
}

/**
 * 割り当てを拒否
 */
export async function rejectAssignment(inquiryId, reason = '') {
	try {
		const pending = get(pendingAssignments)[inquiryId];
		if (!pending) throw new Error('承認待ちの割り当てが見つかりません');

		// 承認待ちから削除
		pendingAssignments.update((pending) => {
			const newPending = { ...pending };
			delete newPending[inquiryId];
			return newPending;
		});

		// 通知を削除
		removeNotification(`notify-assign-${inquiryId}`);

		// 依頼元に拒否を通知（デモ用）
		if (pending.requestedBy) {
			addNotification({
				id: `notify-reject-${inquiryId}`,
				type: 'info',
				operatorId: pending.requestedBy,
				title: '割り当てが拒否されました',
				message: `${get(operators).find((op) => op.id === pending.targetOperatorId)?.name}が割り当てを拒否しました${reason ? ': ' + reason : ''}`,
				inquiryId
			});
		}

		return { success: true };
	} catch (error) {
		console.error('Failed to reject assignment:', error);
		throw error;
	}
}

/**
 * メッセージの送信
 */
export async function sendMessage(chatId, content, type = 'agent') {
	try {
		const messageData = {
			type, // 'sender'から'type'に戻す
			content,
			isTemplate: false,
			agentId: type === 'agent' ? get(currentOperator)?.id : null
		};

		const result = await chatAPI.sendMessage(chatId, messageData);
		if (result.success) {
			// ローカルストアに追加
			messages.update((msgs) => {
				const newMsgs = { ...msgs };
				if (!newMsgs[chatId]) {
					newMsgs[chatId] = [];
				}
				newMsgs[chatId] = [...newMsgs[chatId], result.data];
				return newMsgs;
			});
		}

		return result;
	} catch (error) {
		console.error('Failed to send message:', error);
		throw error;
	}
}

/**
 * チャットの終了
 */
export async function resolveChat(chatId, resolution, summary) {
	try {
		const resolutionData = {
			resolution,
			summary
		};

		const result = await chatAPI.resolve(chatId, resolutionData);
		if (result.success) {
			// アーカイブに追加する前にチャット情報を取得
			const chat = get(activeChats).find((c) => c.id === chatId);
			if (chat) {
				archivedChats.update((archives) => {
					const newArchives = { ...archives };
					if (!newArchives[chat.customerId]) {
						newArchives[chat.customerId] = [];
					}
					newArchives[chat.customerId] = [
						...newArchives[chat.customerId],
						{
							...result.data,
							messages: get(messages)[chatId] || []
						}
					];
					return newArchives;
				});
			}

			// アクティブチャットから削除
			activeChats.update((chats) => chats.filter((chat) => chat.id !== chatId));

			// メッセージをクリア
			messages.update((msgs) => {
				const newMsgs = { ...msgs };
				delete newMsgs[chatId];
				return newMsgs;
			});

			// 選択をクリア
			if (get(selectedChatId) === chatId) {
				selectedChatId.set(null);
			}
		}

		return result;
	} catch (error) {
		console.error('Failed to resolve chat:', error);
		throw error;
	}
}

/**
 * オペレーターステータスの更新
 */
export async function updateOperatorStatus(operatorId, status) {
	try {
		const result = await operatorAPI.updateStatus(operatorId, status);
		if (result.success) {
			// ローカルストアを更新
			operators.update((ops) => ops.map((op) => (op.id === operatorId ? { ...op, status } : op)));

			// 現在のオペレーターの場合は別途更新
			const current = get(currentOperator);
			if (current?.id === operatorId) {
				currentOperator.update((op) => ({ ...op, status }));
			}
		}

		return result;
	} catch (error) {
		console.error('Failed to update operator status:', error);
		throw error;
	}
}

// =====================================
// Helper Functions
// =====================================

/**
 * 優先度の自動判定
 */
function determinePriority(customerData) {
	if (customerData.tier === 'ゴールド' || customerData.isVIP) {
		return 'high';
	}
	if (customerData.previousComplaints > 2) {
		return 'high';
	}
	return 'normal';
}

/**
 * SLA期限の計算
 */
function calculateSLA(priority) {
	const slaMinutes = priorities[priority].sla;
	const deadline = new Date();
	deadline.setMinutes(deadline.getMinutes() + slaMinutes);
	return deadline.toISOString();
}

/**
 * オペレーターの現在の対応可能数を取得
 */
export function getCurrentOperatorCapacity(operatorId = null) {
	const opId = operatorId || get(currentOperator)?.id;
	if (!opId) return null;

	const operator = get(operators).find((op) => op.id === opId);
	if (!operator) return null;

	const activeCount = get(activeChats).filter((chat) => chat.assignedTo === opId).length;

	return {
		current: activeCount,
		max: operator.maxConcurrent,
		canTakeMore:
			activeCount < operator.maxConcurrent &&
			(operator.status === 'available' || operator.status === 'busy')
	};
}

/**
 * リアルタイム更新の開始
 */
function startRealtimeUpdates() {
	// モック環境では新規問い合わせをシミュレート
	mockWebSocket.simulateNewInquiry((inquiry) => {
		inquiryQueue.update((queue) => [...queue, inquiry]);
	});

	// 本番環境ではWebSocketやServer-Sent Eventsを使用
	// 例: const ws = new WebSocket('wss://api.example.com/support');
}

/**
 * チャットのステータスを更新
 * @param {string} chatId
 * @param {string} status
 */
export async function updateChatStatus(chatId, status) {
	try {
		// TODO: API呼び出しを実装
		activeChats.update((chats) =>
			chats.map((chat) => (chat.id === chatId ? { ...chat, status } : chat))
		);
	} catch (error) {
		console.error('Failed to update chat status:', error);
		throw error;
	}
}

/**
 * チャットの優先度を更新
 * @param {string} chatId
 * @param {string} priority
 */
export async function updateChatPriority(chatId, priority) {
	try {
		// TODO: API呼び出しを実装
		activeChats.update((chats) =>
			chats.map((chat) => (chat.id === chatId ? { ...chat, priority } : chat))
		);
	} catch (error) {
		console.error('Failed to update chat priority:', error);
		throw error;
	}
}

/**
 * チャットのエスカレーション依頼
 * @param {string} chatId
 * @param {string} targetOperatorId
 * @param {string} reason
 */
export async function requestEscalateChat(chatId, targetOperatorId, reason) {
	try {
		// 容量チェック
		const capacity = getCurrentOperatorCapacity(targetOperatorId);
		if (!capacity.canTakeMore) {
			throw new Error(`エスカレーション先が対応可能な上限（${capacity.max}件）に達しています`);
		}

		const chat = get(activeChats).find((c) => c.id === chatId);
		if (!chat) throw new Error('Chat not found');

		const currentMessages = get(messages)[chatId] || [];

		// 承認待ちリストに追加
		pendingAssignments.update((pending) => ({
			...pending,
			[chatId]: {
				chat,
				messages: currentMessages,
				targetOperatorId,
				requestedBy: get(currentOperator)?.id,
				requestedAt: new Date().toISOString(),
				type: 'escalation',
				reason
			}
		}));

		// 通知を送信
		addNotification({
			id: `notify-escalate-${chatId}`,
			type: 'escalation',
			operatorId: targetOperatorId,
			title: 'エスカレーション依頼',
			message: `${chat.customerName}のチャット\n理由: ${reason}`,
			chatId,
			priority: 'high'
		});

		return { success: true, pending: true };
	} catch (error) {
		console.error('Failed to request escalation:', error);
		throw error;
	}
}

/**
 * エスカレーションを承認
 */
export async function acceptEscalation(chatId) {
	try {
		const pending = get(pendingAssignments)[chatId];
		if (!pending || pending.type !== 'escalation')
			throw new Error('承認待ちのエスカレーションが見つかりません');

		// システムメッセージを追加
		await sendMessage(
			chatId,
			`チャットがエスカレーションされました。\n理由: ${pending.reason}\n新しい担当者: ${get(operators).find((op) => op.id === pending.targetOperatorId)?.name}`,
			'system'
		);

		// チャットの担当者を変更
		activeChats.update((chats) =>
			chats.map((c) =>
				c.id === chatId ? { ...c, assignedTo: pending.targetOperatorId, status: 'active' } : c
			)
		);

		// メッセージ履歴を保持（すでに存在しているはず）

		// 承認待ちから削除
		pendingAssignments.update((pending) => {
			const newPending = { ...pending };
			delete newPending[chatId];
			return newPending;
		});

		// 通知を削除
		removeNotification(`notify-escalate-${chatId}`);

		// 自動で選択
		selectedChatId.set(chatId);

		return { success: true };
	} catch (error) {
		console.error('Failed to accept escalation:', error);
		throw error;
	}
}

/**
 * エスカレーションを拒否
 */
export async function rejectEscalation(chatId, rejectReason = '') {
	try {
		const pending = get(pendingAssignments)[chatId];
		if (!pending || pending.type !== 'escalation')
			throw new Error('承認待ちのエスカレーションが見つかりません');

		// 承認待ちから削除
		pendingAssignments.update((pending) => {
			const newPending = { ...pending };
			delete newPending[chatId];
			return newPending;
		});

		// 通知を削除
		removeNotification(`notify-escalate-${chatId}`);

		// 依頼元に拒否を通知
		if (pending.requestedBy) {
			addNotification({
				id: `notify-reject-escalate-${chatId}`,
				type: 'warning',
				operatorId: pending.requestedBy,
				title: 'エスカレーションが拒否されました',
				message: `${get(operators).find((op) => op.id === pending.targetOperatorId)?.name}がエスカレーションを拒否しました${rejectReason ? ': ' + rejectReason : ''}`,
				chatId
			});
		}

		return { success: true };
	} catch (error) {
		console.error('Failed to reject escalation:', error);
		throw error;
	}
}

// 互換性のために旧関数名もエクスポート
export const escalateChat = requestEscalateChat;

/**
 * 自分自身に問い合わせを割り当て（通知なしで即座に実行）
 */
export async function assignToSelf(inquiryId) {
	try {
		const operatorId = get(currentOperator)?.id;
		if (!operatorId) throw new Error('オペレーターが設定されていません');

		// 容量チェック
		const capacity = getCurrentOperatorCapacity(operatorId);
		if (!capacity.canTakeMore) {
			throw new Error(`対応可能な上限（${capacity.max}件）に達しています`);
		}

		// 削除前にinquiryを取得
		const inquiry = get(inquiryQueue).find((inq) => inq.id === inquiryId);
		if (!inquiry) throw new Error('問い合わせが見つかりません');

		// 直接APIを呼び出して割り当て（通知や承認フローをスキップ）
		const result = await inquiryAPI.assign(inquiryId, operatorId);
		if (result.success) {
			// ローカルストアを更新
			inquiryQueue.update((queue) => queue.filter((inq) => inq.id !== inquiryId));

			activeChats.update((chats) => [...chats, result.data]);

			// 初期メッセージをセット
			if (inquiry?.initialMessage) {
				messages.update((msgs) => ({
					...msgs,
					[inquiryId]: [
						{
							id: `msg-init-${inquiryId}`,
							chatId: inquiryId,
							type: 'customer',
							content: inquiry.initialMessage,
							timestamp: inquiry.createdAt
						}
					]
				}));
			}

			// 自動で選択
			selectedChatId.set(inquiryId);
		}

		return result;
	} catch (error) {
		console.error('Failed to assign to self:', error);
		throw error;
	}
}

/**
 * 通知を追加
 */
export function addNotification(notification) {
	notifications.update((n) => [
		...n,
		{
			...notification,
			id: notification.id || `notify-${Date.now()}`,
			createdAt: new Date().toISOString(),
			read: false
		}
	]);
}

/**
 * 通知を削除
 */
export function removeNotification(notificationId) {
	notifications.update((n) => n.filter((notif) => notif.id !== notificationId));
}

/**
 * 通知を既読にする
 */
export function markNotificationRead(notificationId) {
	notifications.update((n) =>
		n.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif))
	);
}

/**
 * ストアの初期化（アプリケーション起動時に呼び出し）
 */
export function initializeSupport() {
	initializeStores();
}

// デフォルトのテンプレート返信
responseTemplates.set([
	{
		id: 'template-1',
		category: 'greeting',
		title: '初回挨拶',
		content:
			'お問い合わせありがとうございます。カスタマーサポートの{agent_name}です。\nお困りの内容について詳しくお聞かせください。',
		placeholders: ['agent_name']
	},
	{
		id: 'template-2',
		category: 'closing',
		title: '対応完了',
		content:
			'お問い合わせいただきありがとうございました。\n他にご不明な点がございましたら、お気軽にお問い合わせください。',
		placeholders: []
	},
	{
		id: 'template-3',
		category: 'shipping',
		title: '配送状況確認',
		content: '配送状況を確認いたしますので、ご注文番号をお教えいただけますでしょうか。',
		placeholders: []
	},
	{
		id: 'template-4',
		category: 'return',
		title: '返品手続き',
		content: '返品をご希望とのことで承知いたしました。\n商品の状態と返品理由をお聞かせください。',
		placeholders: []
	}
]);
