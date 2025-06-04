/**
 * Mock API Service for Customer Support Chat System
 *
 * このファイルは実際のAPI通信をシミュレートするモックサービスです。
 * 本番環境では、このインターフェースに従って実際のAPI呼び出しを実装してください。
 */

import { USE_CHAT_MOCK, API_CONFIG } from '../config.js';

// モックモードの制御（チャット機能専用）
const USE_MOCK = USE_CHAT_MOCK;

// APIのベースURL
const API_BASE_URL = API_CONFIG.baseUrl;

/**
 * APIレスポンスの共通型
 * @template T
 * @typedef {Object} ApiResponse
 * @property {boolean} success - 成功/失敗フラグ
 * @property {T} [data] - レスポンスデータ
 * @property {string} [error] - エラーメッセージ
 * @property {Object} [meta] - メタ情報（ページネーションなど）
 */

/**
 * 遅延を追加するユーティリティ（モック用）
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * モックデータストレージ（実際のDBの代わり）
 */
const mockData = {
	operators: [
		{
			id: 'op-1',
			name: '田中太郎',
			email: 'tanaka@example.com',
			avatar: '',
			status: 'available',
			skills: ['返品対応', '技術サポート', '一般問い合わせ'],
			maxConcurrent: 3,
			todayHandled: 12,
			department: 'カスタマーサポート',
			role: 'senior',
			createdAt: '2024-01-01T00:00:00Z'
		},
		{
			id: 'op-2',
			name: '鈴木花子',
			email: 'suzuki@example.com',
			avatar: '',
			status: 'available',
			skills: ['返品対応', '配送問い合わせ'],
			maxConcurrent: 3,
			todayHandled: 8,
			department: 'カスタマーサポート',
			role: 'regular',
			createdAt: '2024-01-15T00:00:00Z'
		}
	],
	inquiries: [],
	chats: [],
	messages: {},
	customers: {}
};

/**
 * オペレーターAPI
 */
export const operatorAPI = {
	/**
	 * 全オペレーターを取得
	 * @returns {Promise<ApiResponse<Array>>}
	 */
	async getAll() {
		if (USE_MOCK) {
			await delay(100);
			return { success: true, data: mockData.operators };
		}

		const response = await fetch(`${API_BASE_URL}/operators`);
		return response.json();
	},

	/**
	 * オペレーターのステータスを更新
	 * @param {string} operatorId
	 * @param {string} status - available, busy, break, offline
	 * @returns {Promise<ApiResponse<Object>>}
	 */
	async updateStatus(operatorId, status) {
		if (USE_MOCK) {
			await delay(100);
			const operator = mockData.operators.find((op) => op.id === operatorId);
			if (operator) {
				operator.status = status;
				return { success: true, data: operator };
			}
			return { success: false, error: 'Operator not found' };
		}

		const response = await fetch(`${API_BASE_URL}/operators/${operatorId}/status`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status })
		});
		return response.json();
	},

	/**
	 * 現在のオペレーター（自分）の情報を取得
	 * @returns {Promise<ApiResponse<Object>>}
	 */
	async getCurrentOperator() {
		if (USE_MOCK) {
			await delay(100);
			// モックでは最初のオペレーターを返す
			return { success: true, data: mockData.operators[0] };
		}

		const response = await fetch(`${API_BASE_URL}/operators/me`);
		return response.json();
	}
};

/**
 * 問い合わせAPI
 */
export const inquiryAPI = {
	/**
	 * 新規問い合わせを作成
	 * @param {Object} inquiryData
	 * @returns {Promise<ApiResponse<Object>>}
	 */
	async create(inquiryData) {
		if (USE_MOCK) {
			await delay(200);
			const newInquiry = {
				...inquiryData,
				id: `inq-${Date.now()}`,
				createdAt: new Date().toISOString(),
				status: 'waiting'
			};
			mockData.inquiries.push(newInquiry);
			return { success: true, data: newInquiry };
		}

		const response = await fetch(`${API_BASE_URL}/inquiries`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(inquiryData)
		});
		return response.json();
	},

	/**
	 * 待機中の問い合わせを取得
	 * @param {Object} filters - フィルター条件
	 * @returns {Promise<ApiResponse<Array>>}
	 */
	async getWaiting(filters = {}) {
		if (USE_MOCK) {
			await delay(100);
			let inquiries = mockData.inquiries.filter((inq) => inq.status === 'waiting');

			// フィルター適用
			if (filters.category && filters.category !== 'all') {
				inquiries = inquiries.filter((inq) => inq.category === filters.category);
			}

			return { success: true, data: inquiries };
		}

		const params = new URLSearchParams({ status: 'waiting', ...filters });
		const response = await fetch(`${API_BASE_URL}/inquiries?${params}`);
		return response.json();
	},

	/**
	 * 問い合わせをオペレーターに割り当て
	 * @param {string} inquiryId
	 * @param {string} operatorId
	 * @returns {Promise<ApiResponse<Object>>}
	 */
	async assign(inquiryId, operatorId) {
		if (USE_MOCK) {
			await delay(200);
			const inquiry = mockData.inquiries.find((inq) => inq.id === inquiryId);
			if (inquiry) {
				inquiry.status = 'assigned';
				inquiry.assignedTo = operatorId;
				inquiry.assignedAt = new Date().toISOString();

				// チャットを作成
				const chat = {
					...inquiry,
					startTime: new Date().toISOString(),
					messages: [],
					status: 'active' // チャットステータスを明示的に設定
				};
				mockData.chats.push(chat);

				return { success: true, data: chat };
			}
			return { success: false, error: 'Inquiry not found' };
		}

		const response = await fetch(`${API_BASE_URL}/inquiries/${inquiryId}/assign`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ operatorId })
		});
		return response.json();
	}
};

/**
 * チャットAPI
 */
export const chatAPI = {
	/**
	 * アクティブなチャットを取得
	 * @param {string} [operatorId] - 特定のオペレーターのチャットのみ取得
	 * @returns {Promise<ApiResponse<Array>>}
	 */
	async getActive(operatorId = null) {
		if (USE_MOCK) {
			await delay(100);
			let chats = mockData.chats.filter((chat) => !chat.endTime);
			if (operatorId) {
				chats = chats.filter((chat) => chat.assignedTo === operatorId);
			}
			return { success: true, data: chats };
		}

		const params = operatorId ? `?operatorId=${operatorId}` : '';
		const response = await fetch(`${API_BASE_URL}/chats/active${params}`);
		return response.json();
	},

	/**
	 * メッセージを送信
	 * @param {string} chatId
	 * @param {Object} messageData
	 * @returns {Promise<ApiResponse<Object>>}
	 */
	async sendMessage(chatId, messageData) {
		if (USE_MOCK) {
			await delay(100);
			const newMessage = {
				id: `msg-${Date.now()}`,
				chatId,
				...messageData,
				timestamp: new Date().toISOString()
			};

			if (!mockData.messages[chatId]) {
				mockData.messages[chatId] = [];
			}
			mockData.messages[chatId].push(newMessage);

			return { success: true, data: newMessage };
		}

		const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(messageData)
		});
		return response.json();
	},

	/**
	 * チャットを終了
	 * @param {string} chatId
	 * @param {Object} resolutionData
	 * @returns {Promise<ApiResponse<Object>>}
	 */
	async resolve(chatId, resolutionData) {
		if (USE_MOCK) {
			await delay(200);
			const chat = mockData.chats.find((c) => c.id === chatId);
			if (chat) {
				chat.endTime = new Date().toISOString();
				chat.resolution = resolutionData.resolution;
				chat.summary = resolutionData.summary;
				return { success: true, data: chat };
			}
			return { success: false, error: 'Chat not found' };
		}

		const response = await fetch(`${API_BASE_URL}/chats/${chatId}/resolve`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(resolutionData)
		});
		return response.json();
	},

	/**
	 * チャットの履歴を取得
	 * @param {Object} filters
	 * @returns {Promise<ApiResponse<Array>>}
	 */
	async getHistory(filters = {}) {
		if (USE_MOCK) {
			await delay(100);
			let chats = mockData.chats.filter((chat) => chat.endTime);

			// フィルター適用
			if (filters.operatorId) {
				chats = chats.filter((chat) => chat.assignedTo === filters.operatorId);
			}
			if (filters.date) {
				chats = chats.filter((chat) => chat.endTime.startsWith(filters.date));
			}
			if (filters.customerId) {
				chats = chats.filter((chat) => chat.customerId === filters.customerId);
			}

			return { success: true, data: chats };
		}

		const params = new URLSearchParams(filters);
		const response = await fetch(`${API_BASE_URL}/chats/history?${params}`);
		return response.json();
	}
};

/**
 * 顧客API
 */
export const customerAPI = {
	/**
	 * 顧客情報を取得
	 * @param {string} customerId
	 * @returns {Promise<ApiResponse<Object>>}
	 */
	async get(customerId) {
		if (USE_MOCK) {
			await delay(100);
			if (mockData.customers[customerId]) {
				return { success: true, data: mockData.customers[customerId] };
			}

			// モックデータを生成
			const customer = {
				id: customerId,
				name: '顧客名',
				email: 'customer@example.com',
				phone: '090-0000-0000',
				tier: 'シルバー',
				registeredDate: '2023-01-01T00:00:00Z',
				totalPurchases: 5,
				totalAmount: 50000,
				lastPurchaseDate: '2024-12-01T00:00:00Z',
				previousInquiries: []
			};
			mockData.customers[customerId] = customer;
			return { success: true, data: customer };
		}

		const response = await fetch(`${API_BASE_URL}/customers/${customerId}`);
		return response.json();
	},

	/**
	 * 顧客の購入履歴を取得
	 * @param {string} customerId
	 * @returns {Promise<ApiResponse<Array>>}
	 */
	async getPurchaseHistory(customerId) {
		if (USE_MOCK) {
			await delay(150);
			// モックデータ
			const purchases = [
				{
					id: 'order-1',
					date: '2024-12-01T00:00:00Z',
					amount: 15000,
					items: ['商品A', '商品B'],
					status: 'delivered'
				},
				{
					id: 'order-2',
					date: '2024-11-15T00:00:00Z',
					amount: 8000,
					items: ['商品C'],
					status: 'delivered'
				}
			];
			return { success: true, data: purchases };
		}

		const response = await fetch(`${API_BASE_URL}/customers/${customerId}/purchases`);
		return response.json();
	}
};

/**
 * WebSocketイベントのシミュレーション（モック用）
 */
export const mockWebSocket = {
	// 新規問い合わせのシミュレーション
	simulateNewInquiry(callback) {
		if (!USE_MOCK) return;

		const interval = setInterval(() => {
			if (Math.random() > 0.7) {
				const customerData = {
					id: `customer-${Date.now()}`,
					name: ['田中太郎', '鈴木花子', '山田一郎'][Math.floor(Math.random() * 3)],
					tier: ['ゴールド', 'シルバー', 'ブロンズ'][Math.floor(Math.random() * 3)]
				};

				const inquiry = {
					id: `inq-${Date.now()}`,
					customerId: customerData.id,
					customerName: customerData.name,
					customerTier: customerData.tier,
					subject: '商品に関する問い合わせ',
					initialMessage: 'お問い合わせ内容...',
					category: ['shipping', 'return', 'product', 'technical'][Math.floor(Math.random() * 4)],
					priority: 'normal',
					createdAt: new Date().toISOString(),
					slaDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString()
				};

				mockData.inquiries.push(inquiry);
				callback(inquiry);
			}
		}, 10000);

		return () => clearInterval(interval);
	}
};
