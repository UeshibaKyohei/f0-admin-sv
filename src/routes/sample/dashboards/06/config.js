/**
 * AI統合型統合管理ダッシュボード設定
 *
 * @description
 * AIを活用した次世代の統合管理システム。自然言語処理、予測分析、
 * 自動化ワークフロー、異常検知を統合し、インテリジェントな意思決定支援を提供します。
 *
 * RDB設計想定:
 * - systems: システム統合情報テーブル (id, name, type, status, endpoint, config)
 * - metrics: パフォーマンスメトリクステーブル (id, timestamp, metric_type, value, system_id)
 * - insights: AIインサイトテーブル (id, category, title, description, priority, confidence, created_at)
 * - anomalies: 異常検知テーブル (id, type, severity, metric_id, detected_at, resolved_at, algorithm)
 * - workflows: 自動化ワークフローテーブル (id, name, trigger_type, steps, status, metrics)
 * - executions: ワークフロー実行履歴テーブル (id, workflow_id, start_time, end_time, status, logs)
 * - predictions: 予測データテーブル (id, type, horizon, prediction, confidence, created_at)
 * - notifications: 通知テーブル (id, type, message, recipient, sent_at, read_at)
 */

export const config = {
	// ===========================================
	// 環境設定（AI駆動開発対応）
	// ===========================================
	USE_MOCK_MODE: true, // モックデータモード（開発・デモ用）
	ENABLE_DEBUG_FEATURES: true, // デバッグ機能有効化
	SHOW_TEST_PANELS: true, // テストパネル表示
	ENABLE_DEMO_DATA: true, // デモデータ生成

	// 後方互換性
	get USE_MOCK_DATA() {
		return this.USE_MOCK_MODE;
	},

	// API エンドポイント（本番環境用）
	API_ENDPOINTS: {
		AI_ASSISTANT: '/api/v1/ai/assistant',
		AI_PREDICTIONS: '/api/v1/ai/predictions',
		AI_ANOMALIES: '/api/v1/ai/anomalies',
		AI_INSIGHTS: '/api/v1/ai/insights',
		AUTOMATION: '/api/v1/automation/workflows',
		INTEGRATION: '/api/v1/integration/status',
		METRICS: '/api/v1/metrics/realtime',
		REPORTS: '/api/v1/reports/executive'
	},

	// リフレッシュ間隔（ミリ秒）
	REFRESH_INTERVALS: {
		REAL_TIME_METRICS: 5000, // 5秒（リアルタイムメトリクス）
		ANOMALY_DETECTION: 10000, // 10秒（異常検知）
		AI_INSIGHTS: 30000, // 30秒（AIインサイト）
		SYSTEM_STATUS: 15000, // 15秒（システム状態）
		PREDICTIVE_ANALYTICS: 60000 // 1分（予測分析）
	},

	// AI アシスタント設定
	AI_ASSISTANT: {
		MODEL: 'gpt-4-turbo',
		MAX_CONTEXT_LENGTH: 8000,
		TEMPERATURE: 0.7,
		LANGUAGES: ['ja', 'en', 'zh', 'ko'],
		CAPABILITIES: [
			'natural_language_query',
			'voice_commands',
			'report_generation',
			'decision_support',
			'process_automation'
		],
		RESPONSE_TIME_TARGET: 1500, // ミリ秒
		PERSONALITY: {
			name: 'ARIA',
			avatar: '🤖',
			greeting: 'こんにちは！AIアシスタントのARIAです。どのようなお手伝いをしましょうか？'
		}
	},

	// 異常検知設定
	ANOMALY_DETECTION: {
		SENSITIVITY_LEVELS: {
			LOW: { threshold: 3.0, description: '重大な異常のみ' },
			MEDIUM: { threshold: 2.0, description: '標準的な感度' },
			HIGH: { threshold: 1.5, description: '軽微な異常も検出' }
		},
		ALGORITHMS: ['isolation_forest', 'lstm_autoencoder', 'prophet', 'gaussian_mixture'],
		DETECTION_WINDOW: 300000, // 5分
		HISTORICAL_COMPARISON: 7, // 日数
		AUTO_REMEDIATION: true
	},

	// 予測分析設定
	PREDICTIVE_ANALYTICS: {
		FORECAST_HORIZONS: {
			SHORT_TERM: { days: 7, accuracy: 0.92 },
			MEDIUM_TERM: { days: 30, accuracy: 0.85 },
			LONG_TERM: { days: 90, accuracy: 0.75 }
		},
		MODELS: {
			TIME_SERIES: ['ARIMA', 'Prophet', 'LSTM'],
			CLASSIFICATION: ['RandomForest', 'XGBoost', 'NeuralNet'],
			CLUSTERING: ['K-Means', 'DBSCAN', 'Hierarchical']
		},
		CONFIDENCE_THRESHOLD: 0.8,
		UPDATE_FREQUENCY: 'hourly'
	},

	// 自動化ワークフロー設定
	AUTOMATION: {
		TRIGGER_TYPES: {
			TIME_BASED: { icon: '⏰', color: 'primary' },
			EVENT_BASED: { icon: '⚡', color: 'warning' },
			THRESHOLD_BASED: { icon: '📊', color: 'error' },
			AI_SUGGESTED: { icon: '🤖', color: 'secondary' }
		},
		ACTION_TYPES: [
			'send_notification',
			'execute_script',
			'call_api',
			'generate_report',
			'escalate_issue',
			'adjust_parameters'
		],
		MAX_WORKFLOW_STEPS: 10,
		EXECUTION_TIMEOUT: 300000, // 5分
		RETRY_POLICY: {
			max_attempts: 3,
			backoff_multiplier: 2,
			initial_delay: 1000
		}
	},

	// ===========================================
	// システム統合設定（RDB: systems テーブル）
	// ===========================================
	INTEGRATED_SYSTEMS: {
		ERP: {
			id: 'sys_erp_001',
			name: 'SAP S/4HANA',
			type: 'ERP',
			status: 'connected',
			endpoint: 'https://api.sap.example.com/v1',
			baseline_latency: 45,
			icon: '🏢',
			config: {
				timeout: 30000,
				retry_count: 3,
				health_check_interval: 60000
			}
		},
		CRM: {
			id: 'sys_crm_001',
			name: 'Salesforce',
			type: 'CRM',
			status: 'connected',
			endpoint: 'https://api.salesforce.com/v1',
			baseline_latency: 120,
			icon: '👥',
			config: {
				timeout: 45000,
				retry_count: 3,
				health_check_interval: 90000
			}
		},
		HRM: {
			id: 'sys_hrm_001',
			name: 'Workday',
			type: 'HRM',
			status: 'connected',
			endpoint: 'https://api.workday.com/v1',
			baseline_latency: 85,
			icon: '👔',
			config: {
				timeout: 30000,
				retry_count: 2,
				health_check_interval: 120000
			}
		},
		SCM: {
			id: 'sys_scm_001',
			name: 'Oracle SCM',
			type: 'SCM',
			status: 'connected',
			endpoint: 'https://api.oracle-scm.com/v1',
			baseline_latency: 95,
			icon: '📦',
			config: {
				timeout: 60000,
				retry_count: 3,
				health_check_interval: 90000
			}
		},
		BI: {
			id: 'sys_bi_001',
			name: 'Tableau',
			type: 'BI',
			status: 'connected',
			endpoint: 'https://api.tableau.com/v1',
			baseline_latency: 150,
			icon: '📊',
			config: {
				timeout: 120000,
				retry_count: 2,
				health_check_interval: 300000
			}
		},
		IoT: {
			id: 'sys_iot_001',
			name: 'AWS IoT',
			type: 'IoT',
			status: 'connected',
			endpoint: 'https://iot.amazonaws.com/v1',
			baseline_latency: 25,
			icon: '🌐',
			config: {
				timeout: 15000,
				retry_count: 5,
				health_check_interval: 30000
			}
		}
	},

	// ===========================================
	// インサイト生成設定（RDB: insights テーブル）
	// ===========================================
	INSIGHTS: {
		CATEGORIES: {
			OPERATIONAL: {
				id: 'cat_ops_001',
				icon: '⚙️',
				priority: 2,
				color: '#14b8a6',
				description: '運用効率とプロセス最適化に関するインサイト'
			},
			FINANCIAL: {
				id: 'cat_fin_001',
				icon: '💰',
				priority: 1,
				color: '#10b981',
				description: '財務パフォーマンスと収益性に関するインサイト'
			},
			CUSTOMER: {
				id: 'cat_cus_001',
				icon: '😊',
				priority: 1,
				color: '#8b5cf6',
				description: '顧客満足度と体験向上に関するインサイト'
			},
			EMPLOYEE: {
				id: 'cat_emp_001',
				icon: '👨‍💼',
				priority: 3,
				color: '#3b82f6',
				description: '従業員満足度と生産性に関するインサイト'
			},
			STRATEGIC: {
				id: 'cat_str_001',
				icon: '🎯',
				priority: 1,
				color: '#f59e0b',
				description: '戦略的意思決定と将来計画に関するインサイト'
			}
		},
		MIN_CONFIDENCE: 0.75,
		MAX_INSIGHTS_PER_CATEGORY: 5,
		INSIGHT_EXPIRY: 86400000, // 24時間
		AUTO_ACTIONS: true,
		CONFIDENCE_THRESHOLDS: {
			HIGH: 0.9, // 高信頼度
			MEDIUM: 0.75, // 中信頼度
			LOW: 0.6 // 低信頼度
		}
	},

	// レポート生成設定
	REPORT_GENERATION: {
		FORMATS: ['PDF', 'Excel', 'PowerPoint', 'Interactive'],
		TEMPLATES: {
			EXECUTIVE_SUMMARY: { pages: 3, charts: 5 },
			DETAILED_ANALYSIS: { pages: 15, charts: 20 },
			WEEKLY_UPDATE: { pages: 5, charts: 8 },
			CUSTOM: { pages: null, charts: null }
		},
		SCHEDULED_REPORTS: [
			{ type: 'daily', time: '09:00', recipients: ['executives'] },
			{ type: 'weekly', day: 'monday', time: '08:00', recipients: ['managers'] },
			{ type: 'monthly', date: 1, time: '10:00', recipients: ['stakeholders'] }
		]
	},

	// セキュリティ・コンプライアンス設定
	SECURITY: {
		ENCRYPTION: 'AES-256-GCM',
		TOKEN_EXPIRY: 3600000, // 1時間
		MFA_REQUIRED: true,
		AUDIT_LOG: true,
		DATA_RETENTION_DAYS: 90,
		GDPR_COMPLIANT: true,
		SOC2_COMPLIANT: true
	}
};

/**
 * フィーチャーフラグ
 * AI統合管理システムの機能制御（AI駆動開発対応）
 */
export const featureFlags = {
	// ===========================================
	// AI機能（本番環境対応）
	// ===========================================
	ENABLE_AI_ASSISTANT: {
		enabled: true,
		mockModeOnly: false,
		description: 'AI アシスタント機能',
		dependencies: ['NLP_SERVICE', 'CHAT_SERVICE']
	},
	ENABLE_VOICE_COMMANDS: {
		enabled: true,
		mockModeOnly: false,
		description: '音声コマンド認識',
		dependencies: ['SPEECH_API', 'AI_ASSISTANT']
	},
	ENABLE_PREDICTIVE_ANALYTICS: {
		enabled: true,
		mockModeOnly: false,
		description: '予測分析とフォーキャスト',
		dependencies: ['ML_SERVICE', 'DATA_PIPELINE']
	},
	ENABLE_ANOMALY_DETECTION: {
		enabled: true,
		mockModeOnly: false,
		description: '異常検知システム',
		dependencies: ['METRICS_COLLECTOR', 'ML_SERVICE']
	},
	ENABLE_AUTO_INSIGHTS: {
		enabled: true,
		mockModeOnly: false,
		description: '自動インサイト生成',
		dependencies: ['AI_SERVICE', 'DATA_ANALYSIS']
	},

	// ===========================================
	// 自動化機能（プロダクション対応）
	// ===========================================
	ENABLE_WORKFLOW_AUTOMATION: {
		enabled: true,
		mockModeOnly: false,
		description: 'ワークフロー自動化',
		dependencies: ['WORKFLOW_ENGINE', 'TASK_SCHEDULER']
	},
	ENABLE_AUTO_REMEDIATION: {
		enabled: false,
		mockModeOnly: false,
		description: '自動修復機能（慎重に有効化）',
		dependencies: ['MONITORING_SERVICE', 'AUTOMATION_SERVICE'],
		warnings: ['本番環境では慎重に有効化してください']
	},
	ENABLE_SMART_SCHEDULING: {
		enabled: true,
		mockModeOnly: false,
		description: 'インテリジェントなスケジューリング',
		dependencies: ['AI_SERVICE', 'CALENDAR_SERVICE']
	},

	// ===========================================
	// システム統合機能
	// ===========================================
	ENABLE_REAL_TIME_SYNC: {
		enabled: true,
		mockModeOnly: false,
		description: 'リアルタイムデータ同期',
		dependencies: ['MESSAGE_QUEUE', 'SYNC_SERVICE']
	},
	ENABLE_CROSS_SYSTEM_ANALYTICS: {
		enabled: true,
		mockModeOnly: false,
		description: 'クロスシステム分析',
		dependencies: ['DATA_WAREHOUSE', 'ANALYTICS_ENGINE']
	},
	ENABLE_UNIFIED_SEARCH: {
		enabled: true,
		mockModeOnly: false,
		description: '統合検索機能',
		dependencies: ['SEARCH_ENGINE', 'INDEX_SERVICE']
	},

	// ===========================================
	// 実験的機能（将来実装予定）
	// ===========================================
	ENABLE_AR_VISUALIZATION: {
		enabled: false,
		mockModeOnly: false,
		description: 'AR可視化（実験的）',
		dependencies: ['AR_SERVICE', 'WEBXR_API'],
		experimental: true
	},
	ENABLE_QUANTUM_OPTIMIZATION: {
		enabled: false,
		mockModeOnly: false,
		description: '量子最適化アルゴリズム（実験的）',
		dependencies: ['QUANTUM_SERVICE'],
		experimental: true
	},
	ENABLE_BLOCKCHAIN_AUDIT: {
		enabled: false,
		mockModeOnly: false,
		description: 'ブロックチェーン監査ログ（実験的）',
		dependencies: ['BLOCKCHAIN_SERVICE'],
		experimental: true
	},

	// ===========================================
	// デモ・開発機能（モックモード専用）
	// ===========================================
	SHOW_DEMO_INSIGHTS: {
		enabled: config.USE_MOCK_MODE,
		mockModeOnly: true,
		description: 'デモ用インサイト表示'
	},
	SHOW_SIMULATED_ANOMALIES: {
		enabled: config.USE_MOCK_MODE,
		mockModeOnly: true,
		description: 'シミュレートされた異常表示'
	},
	ENABLE_AI_DEMO_MODE: {
		enabled: config.USE_MOCK_MODE,
		mockModeOnly: true,
		description: 'AIデモモード（応答時間シミュレート）'
	},
	SHOW_DEBUG_PANELS: {
		enabled: config.ENABLE_DEBUG_FEATURES,
		mockModeOnly: true,
		description: 'デバッグパネル表示'
	},
	ENABLE_TEST_DATA_GENERATOR: {
		enabled: config.ENABLE_DEMO_DATA,
		mockModeOnly: true,
		description: 'テストデータ生成機能'
	}
};

/**
 * フィーチャーフラグヘルパー関数（AI駆動開発対応）
 */
export const isFeatureEnabled = (flagName) => {
	const flag = featureFlags[flagName];
	if (!flag) {
		console.warn(`Unknown feature flag: ${flagName}`);
		return false;
	}

	// モックモード専用機能の場合
	if (flag.mockModeOnly && !config.USE_MOCK_MODE) {
		return false;
	}

	// 依存関係チェック（本番環境では実際のサービス状態を確認）
	if (flag.dependencies && !config.USE_MOCK_MODE) {
		// TODO: 本番環境では実際の依存サービスの状態を確認
		console.debug(`Feature ${flagName} requires:`, flag.dependencies);
	}

	// 実験的機能の警告
	if (flag.experimental && flag.enabled) {
		console.warn(`Experimental feature enabled: ${flagName} - ${flag.description}`);
	}

	// 警告メッセージの表示
	if (flag.warnings && flag.enabled) {
		flag.warnings.forEach((warning) => console.warn(`${flagName}: ${warning}`));
	}

	return flag.enabled;
};

/**
 * フィーチャーフラグの依存関係を取得
 */
export const getFeatureDependencies = (flagName) => {
	const flag = featureFlags[flagName];
	return flag?.dependencies || [];
};

/**
 * すべての有効なフィーチャーフラグを取得
 */
export const getEnabledFeatures = () => {
	return Object.entries(featureFlags)
		.filter(([name]) => isFeatureEnabled(name))
		.map(([name, flag]) => ({ name, ...flag }));
};

/**
 * 環境設定の検証
 */
export const validateEnvironmentConfig = () => {
	const errors = [];
	const warnings = [];

	// モックモード設定の検証
	if (config.USE_MOCK_MODE) {
		warnings.push('Running in mock mode - some features may be simulated');
	}

	// システム統合設定の検証
	Object.entries(config.INTEGRATED_SYSTEMS).forEach(([key, system]) => {
		if (!system.id || !system.name || !system.type) {
			errors.push(`Incomplete configuration for system: ${key}`);
		}
		if (!config.USE_MOCK_MODE && !system.endpoint) {
			errors.push(`Missing endpoint for system: ${key}`);
		}
	});

	// フィーチャーフラグの一貫性チェック
	Object.entries(featureFlags).forEach(([name, flag]) => {
		if (flag.enabled && flag.dependencies) {
			flag.dependencies.forEach((dep) => {
				if (!config.USE_MOCK_MODE) {
					warnings.push(`Feature ${name} depends on service: ${dep}`);
				}
			});
		}
	});

	return { errors, warnings };
};

/**
 * UI設定
 * AI統合管理ダッシュボードのUI設定
 */
export const uiConfig = {
	// カラーパレット（AI/未来的テーマ）
	COLORS: {
		AI_PRIMARY: '#8b5cf6', // AI機能：パープル
		AI_SECONDARY: '#3b82f6', // AI補助：ブルー
		SUCCESS: '#10b981', // 成功：グリーン
		WARNING: '#f59e0b', // 警告：アンバー
		ERROR: '#ef4444', // エラー：レッド
		ANOMALY: '#ec4899', // 異常：ピンク
		PREDICTION: '#6366f1', // 予測：インディゴ
		AUTOMATION: '#14b8a6' // 自動化：ティール
	},

	// グラデーションテーマ
	GRADIENTS: {
		AI_ASSISTANT: 'from-purple-500 via-pink-500 to-red-500',
		ANALYTICS: 'from-blue-500 via-indigo-500 to-purple-500',
		AUTOMATION: 'from-teal-500 via-cyan-500 to-blue-500',
		INSIGHTS: 'from-amber-500 via-orange-500 to-red-500'
	},

	// アニメーション設定
	ANIMATIONS: {
		AI_THINKING: {
			DURATION: 1500,
			TYPE: 'pulse',
			ITERATION: 3
		},
		INSIGHT_APPEAR: {
			DURATION: 600,
			EASING: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
		},
		ANOMALY_ALERT: {
			DURATION: 800,
			TYPE: 'shake',
			INTENSITY: 'medium'
		}
	},

	// チャート設定
	CHART_CONFIG: {
		THEME: 'dark',
		ANIMATIONS: true,
		INTERACTIVE: true,
		REAL_TIME_UPDATE: true,
		DEFAULT_COLORS: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
	},

	// レスポンシブ設定
	RESPONSIVE: {
		MOBILE_BREAKPOINT: 768,
		TABLET_BREAKPOINT: 1024,
		DESKTOP_BREAKPOINT: 1280,
		WIDE_BREAKPOINT: 1536
	}
};

/**
 * AIモデル設定
 * 各種AI機能のモデルパラメータ
 */
export const aiModelConfig = {
	// 自然言語処理
	NLP: {
		MODEL: 'multilingual-e5-large',
		MAX_TOKENS: 2048,
		SUPPORTED_LANGUAGES: ['ja', 'en', 'zh', 'ko', 'es', 'fr'],
		INTENT_THRESHOLD: 0.85,
		ENTITY_RECOGNITION: true
	},

	// 異常検知モデル
	ANOMALY: {
		MODELS: {
			TIME_SERIES: 'lstm-autoencoder-v2',
			MULTIVARIATE: 'isolation-forest-enhanced',
			PATTERN: 'dbscan-adaptive'
		},
		ENSEMBLE_VOTING: true,
		ONLINE_LEARNING: true
	},

	// 予測モデル
	PREDICTION: {
		SHORT_TERM: 'prophet-tuned',
		LONG_TERM: 'transformer-timeseries',
		CONFIDENCE_INTERVALS: [0.8, 0.95],
		FEATURE_IMPORTANCE: true
	},

	// 最適化モデル
	OPTIMIZATION: {
		ALGORITHM: 'genetic-algorithm-v3',
		OBJECTIVES: ['cost', 'efficiency', 'quality'],
		CONSTRAINTS_HANDLING: 'penalty-method',
		POPULATION_SIZE: 100
	}
};

// ===========================================
// UI デフォルト設定
// ===========================================

/**
 * コンポーネントのデフォルト値とハードコード値を設定から管理
 */
export const defaultValues = {
	// 異常検知コンポーネント
	ANOMALY_DETECTION: {
		DEFAULT_TIME_RANGE: '24h',
		DEFAULT_SENSITIVITY: 'MEDIUM',
		DEFAULT_CATEGORY: 'all',
		BASELINE_SCORE: 0.5,
		TIMELINE_HOURS: 24,
		TIMELINE_INTERVAL: 2, // 2時間間隔
		DEMO_ANOMALIES: {
			CRITICAL_THRESHOLD: 2.0,
			WARNING_THRESHOLD: 1.5,
			MAX_DEMO_ANOMALIES: 8
		}
	},

	// ワークフロー自動化コンポーネント
	AUTOMATION_WORKFLOW: {
		DEFAULT_FILTER_STATUS: 'all',
		DEFAULT_SORT_BY: 'lastRun',
		MAX_WORKFLOW_STEPS: 10,
		DEFAULT_SUCCESS_RATE: 95.0,
		DEFAULT_DURATION_SECONDS: 120,
		ACTION_TEMPLATES: [
			{ id: 'notification', name: '通知を送信', icon: '📧', category: 'communication' },
			{ id: 'api_call', name: 'API呼び出し', icon: '🔌', category: 'integration' },
			{ id: 'script', name: 'スクリプト実行', icon: '📜', category: 'execution' },
			{ id: 'report', name: 'レポート生成', icon: '📊', category: 'reporting' },
			{ id: 'approval', name: '承認リクエスト', icon: '✅', category: 'workflow' },
			{ id: 'condition', name: '条件分岐', icon: '🔀', category: 'logic' },
			{ id: 'wait', name: '待機', icon: '⏳', category: 'timing' },
			{ id: 'data_transform', name: 'データ変換', icon: '🔄', category: 'data' }
		]
	},

	// AIアシスタントコンポーネント
	AI_ASSISTANT: {
		DEFAULT_MODE: 'chat',
		RESPONSE_TYPING_SPEED: 50, // ミリ秒/文字
		MAX_CONVERSATION_LENGTH: 100,
		SUGGESTION_COUNT: 3,
		WELCOME_DELAY: 1000 // ミリ秒
	},

	// インテリジェントダッシュボードコンポーネント
	INTELLIGENT_DASHBOARD: {
		DEFAULT_VIEW: 'overview',
		WIDGET_REFRESH_INTERVAL: 30000, // 30秒
		MAX_INSIGHTS_DISPLAY: 5,
		CHART_ANIMATION_DURATION: 750,
		KPI_DECIMAL_PLACES: 1
	},

	// パフォーマンス閾値
	PERFORMANCE_THRESHOLDS: {
		CPU: {
			WARNING: 75,
			CRITICAL: 90
		},
		MEMORY: {
			WARNING: 80,
			CRITICAL: 95
		},
		RESPONSE_TIME: {
			WARNING: 500, // ミリ秒
			CRITICAL: 1000
		},
		ERROR_RATE: {
			WARNING: 2, // パーセント
			CRITICAL: 5
		}
	},

	// 時間範囲オプション
	TIME_RANGE_OPTIONS: [
		{ value: '1h', label: '過去1時間', hours: 1 },
		{ value: '6h', label: '過去6時間', hours: 6 },
		{ value: '24h', label: '過去24時間', hours: 24 },
		{ value: '7d', label: '過去7日', hours: 168 },
		{ value: '30d', label: '過去30日', hours: 720 }
	],

	// 表示言語設定
	LOCALIZATION: {
		DEFAULT_LOCALE: 'ja-JP',
		SUPPORTED_LOCALES: ['ja-JP', 'en-US'],
		DATE_FORMAT: 'YYYY-MM-DD HH:mm:ss',
		TIMEZONE: 'Asia/Tokyo'
	},

	// データ表示設定
	DATA_DISPLAY: {
		MAX_TABLE_ROWS: 50,
		PAGINATION_SIZE: 10,
		DECIMAL_PRECISION: 2,
		LARGE_NUMBER_FORMAT: 'compact', // 'compact' | 'full'
		CURRENCY_SYMBOL: '¥'
	}
};
