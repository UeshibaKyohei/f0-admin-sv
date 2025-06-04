/**
 * AI統合型統合管理ダッシュボード モックデータサービス
 *
 * @description
 * AI駆動の統合管理システムのモックデータを提供。
 * 自然言語処理、異常検知、予測分析、自動化ワークフローのシミュレーション。
 *
 * RDBテーブル構造に対応したモックデータ生成:
 *
 * -- システム統合情報テーブル
 * CREATE TABLE systems (
 *   id VARCHAR(50) PRIMARY KEY,
 *   name VARCHAR(100) NOT NULL,
 *   type VARCHAR(50) NOT NULL,
 *   status VARCHAR(20) NOT NULL,
 *   endpoint VARCHAR(255),
 *   baseline_latency INT,
 *   icon VARCHAR(10),
 *   config JSON,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * );
 *
 * -- パフォーマンスメトリクステーブル
 * CREATE TABLE metrics (
 *   id BIGINT AUTO_INCREMENT PRIMARY KEY,
 *   system_id VARCHAR(50),
 *   metric_type VARCHAR(50) NOT NULL,
 *   value DECIMAL(10,2) NOT NULL,
 *   timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   INDEX idx_system_metric (system_id, metric_type),
 *   INDEX idx_timestamp (timestamp),
 *   FOREIGN KEY (system_id) REFERENCES systems(id)
 * );
 *
 * -- AIインサイトテーブル
 * CREATE TABLE insights (
 *   id BIGINT AUTO_INCREMENT PRIMARY KEY,
 *   category_id VARCHAR(50) NOT NULL,
 *   title VARCHAR(200) NOT NULL,
 *   description TEXT,
 *   priority INT NOT NULL,
 *   confidence DECIMAL(3,2) NOT NULL,
 *   actionable BOOLEAN DEFAULT false,
 *   impact TEXT,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   expires_at TIMESTAMP,
 *   INDEX idx_category (category_id),
 *   INDEX idx_priority (priority),
 *   INDEX idx_created (created_at)
 * );
 *
 * -- 異常検知テーブル
 * CREATE TABLE anomalies (
 *   id BIGINT AUTO_INCREMENT PRIMARY KEY,
 *   type VARCHAR(50) NOT NULL,
 *   severity VARCHAR(20) NOT NULL,
 *   metric_id BIGINT,
 *   score DECIMAL(3,2) NOT NULL,
 *   current_value DECIMAL(10,2),
 *   expected_value DECIMAL(10,2),
 *   deviation VARCHAR(20),
 *   detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   resolved_at TIMESTAMP NULL,
 *   algorithm VARCHAR(50),
 *   confidence DECIMAL(3,2),
 *   description TEXT,
 *   recommendation TEXT,
 *   INDEX idx_severity (severity),
 *   INDEX idx_detected (detected_at),
 *   FOREIGN KEY (metric_id) REFERENCES metrics(id)
 * );
 *
 * -- ワークフローテーブル
 * CREATE TABLE workflows (
 *   id BIGINT AUTO_INCREMENT PRIMARY KEY,
 *   name VARCHAR(200) NOT NULL,
 *   description TEXT,
 *   trigger_type VARCHAR(50) NOT NULL,
 *   trigger_config JSON,
 *   steps JSON NOT NULL,
 *   status VARCHAR(20) DEFAULT 'active',
 *   success_rate DECIMAL(5,2),
 *   avg_duration INT,
 *   total_runs INT DEFAULT 0,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 *   INDEX idx_status (status),
 *   INDEX idx_trigger_type (trigger_type)
 * );
 */

import { config } from '../config.js';

// ===========================================
// RDB対応のモックデータ生成器
// ===========================================

/**
 * 現在時刻から指定時間前のランダムなタイムスタンプを生成
 */
function getRandomTimestamp(maxHoursAgo = 24) {
	const now = Date.now();
	const randomOffset = Math.random() * maxHoursAgo * 60 * 60 * 1000;
	return new Date(now - randomOffset).toISOString();
}

/**
 * 指定範囲の整数を生成
 */
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 指定範囲の小数を生成
 */
function getRandomFloat(min, max, decimals = 2) {
	return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

/**
 * 配列からランダムに要素を選択
 */
function getRandomFromArray(array) {
	return array[Math.floor(Math.random() * array.length)];
}

// ===========================================
// システム統合ステータス（RDB: systems テーブル対応）
// ===========================================

/**
 * システム統合ステータスを取得
 * @returns {Promise<Object>} RDB systems テーブル構造に対応したデータ
 */
export function getSystemStatus() {
	const baseDate = new Date();
	const systems = {};

	// config.jsから基本設定を取得してRDB形式で拡張
	Object.entries(config.INTEGRATED_SYSTEMS).forEach(([key, systemConfig]) => {
		// リアルタイムメトリクスの生成
		const currentLatency = systemConfig.baseline_latency + getRandomInt(-10, 30);
		const statusOptions = ['connected', 'warning', 'disconnected'];
		const statusWeights = [0.85, 0.12, 0.03]; // 85% connected, 12% warning, 3% disconnected

		let status = 'connected';
		const rand = Math.random();
		if (rand < statusWeights[2]) status = 'disconnected';
		else if (rand < statusWeights[1] + statusWeights[2]) status = 'warning';

		systems[key] = {
			// RDBプライマリキー
			id: systemConfig.id,

			// 基本情報
			name: systemConfig.name,
			type: systemConfig.type,
			status: status,
			endpoint: systemConfig.endpoint,
			baseline_latency: systemConfig.baseline_latency,
			icon: systemConfig.icon,
			config: systemConfig.config,

			// リアルタイム情報
			current_latency: currentLatency,
			last_sync: getRandomTimestamp(1), // 1時間以内
			data_volume: getRandomInt(100, 5000),
			health_score:
				status === 'connected'
					? getRandomFloat(85, 100)
					: status === 'warning'
						? getRandomFloat(60, 84)
						: getRandomFloat(0, 59),

			// RDBタイムスタンプ
			created_at: getRandomTimestamp(30 * 24), // 30日前
			updated_at: getRandomTimestamp(0.1), // 6分以内

			// 拡張メトリクス
			metrics: {
				uptime_percentage: getRandomFloat(95, 99.9, 1),
				error_rate: getRandomFloat(0, 5, 2),
				throughput: getRandomInt(50, 1000),
				active_connections: getRandomInt(10, 500)
			},

			// ヘルスチェック情報
			health_checks: {
				last_check: getRandomTimestamp(0.05), // 3分以内
				next_check: new Date(Date.now() + systemConfig.config.health_check_interval).toISOString(),
				check_interval: systemConfig.config.health_check_interval,
				consecutive_failures: status === 'connected' ? 0 : getRandomInt(1, 3)
			}
		};
	});

	return Promise.resolve(systems);
}

// ===========================================
// パフォーマンスメトリクス（RDB: metrics テーブル対応）
// ===========================================

/**
 * パフォーマンスメトリクスを取得
 * @returns {Promise<Object>} RDB metrics テーブル構造に対応したデータ
 */
export function getPerformanceMetrics() {
	const timestamp = new Date().toISOString();
	const timeVariation = Date.now() / 10000; // 時間による変動

	// リアルタイムメトリクスの生成（周期的変動を含む）
	const metrics = {
		// 基本メトリクス
		cpu: Math.max(0, Math.min(100, 40 + Math.random() * 40 + Math.sin(timeVariation) * 10)),
		memory: Math.max(0, Math.min(100, 50 + Math.random() * 30 + Math.cos(timeVariation * 0.8) * 5)),
		network: Math.max(0, 10 + Math.random() * 50 + Math.sin(timeVariation * 0.5) * 20),
		responseTime: Math.floor(
			Math.max(10, 50 + Math.random() * 200 + Math.sin(timeVariation * 1.5) * 50)
		),

		// 拡張メトリクス（RDB想定）
		disk_usage: getRandomFloat(30, 85),
		disk_io: getRandomFloat(100, 2000),
		active_sessions: getRandomInt(50, 500),
		queue_length: getRandomInt(0, 50),
		error_count: getRandomInt(0, 10),

		// メタデータ
		timestamp,
		collection_interval: 5000, // 5秒間隔
		source: 'mock_generator',

		// システム別詳細メトリクス
		system_metrics: {}
	};

	// 各システムの個別メトリクス生成
	Object.keys(config.INTEGRATED_SYSTEMS).forEach((systemKey) => {
		const systemConfig = config.INTEGRATED_SYSTEMS[systemKey];
		metrics.system_metrics[systemKey] = {
			system_id: systemConfig.id,
			cpu: getRandomFloat(20, 90),
			memory: getRandomFloat(30, 80),
			latency: systemConfig.baseline_latency + getRandomInt(-5, 20),
			throughput: getRandomInt(100, 1000),
			error_rate: getRandomFloat(0, 2),
			timestamp,

			// RDB metrics テーブル構造
			metrics_records: [
				{
					id: Date.now() + Math.random(), // モック用ID
					system_id: systemConfig.id,
					metric_type: 'cpu_usage',
					value: getRandomFloat(20, 90),
					timestamp
				},
				{
					id: Date.now() + Math.random() + 1,
					system_id: systemConfig.id,
					metric_type: 'memory_usage',
					value: getRandomFloat(30, 80),
					timestamp
				},
				{
					id: Date.now() + Math.random() + 2,
					system_id: systemConfig.id,
					metric_type: 'response_time',
					value: systemConfig.baseline_latency + getRandomInt(-5, 20),
					timestamp
				}
			]
		};
	});

	return Promise.resolve(metrics);
}

// ===========================================
// AIインサイト（RDB: insights テーブル対応）
// ===========================================

/**
 * AIインサイトを取得
 * @returns {Promise<Object>} RDB insights テーブル構造に対応したデータ
 */
export function getAIInsights() {
	// config.jsからカテゴリ設定を取得
	const categories = config.INSIGHTS.CATEGORIES;

	const insightTemplates = [
		{
			category_id: categories.OPERATIONAL.id,
			category: 'OPERATIONAL',
			title: '配送効率の改善機会',
			description:
				'過去7日間の配送データ分析により、午後2-4時の配送を午前中にシフトすることで、効率を15%向上できる可能性があります。',
			priority: categories.OPERATIONAL.priority,
			confidence: 0.89,
			actionable: true,
			impact: '月間150万円のコスト削減',
			algorithm: 'pattern_analysis_v2',
			data_sources: ['logistics_db', 'traffic_api', 'weather_data']
		},
		{
			category_id: categories.FINANCIAL.id,
			category: 'FINANCIAL',
			title: '売上予測の上方修正',
			description:
				'現在のトレンドと市場分析に基づき、Q4の売上予測を8%上方修正することを推奨します。',
			priority: categories.FINANCIAL.priority,
			confidence: 0.92,
			actionable: true,
			impact: '売上目標達成確率が85%に向上',
			algorithm: 'financial_trend_analysis_v3',
			data_sources: ['financial_db', 'market_data', 'sales_forecast']
		},
		{
			category_id: categories.CUSTOMER.id,
			category: 'CUSTOMER',
			title: '顧客離脱リスクの検出',
			description:
				'3つの主要顧客アカウントで活動低下パターンを検出。プロアクティブな対応を推奨します。',
			priority: categories.CUSTOMER.priority,
			confidence: 0.87,
			actionable: true,
			impact: '年間2000万円の収益保護',
			algorithm: 'churn_prediction_model_v2',
			data_sources: ['customer_db', 'usage_analytics', 'support_tickets']
		},
		{
			category_id: categories.EMPLOYEE.id,
			category: 'EMPLOYEE',
			title: '人員配置の最適化提案',
			description: 'スキルマッチング分析により、チーム間の人員再配置で生産性を12%向上できます。',
			priority: categories.EMPLOYEE.priority,
			confidence: 0.78,
			actionable: true,
			impact: '月間作業時間を320時間削減',
			algorithm: 'workforce_optimization_v1',
			data_sources: ['hr_db', 'project_data', 'skill_matrix']
		},
		{
			category_id: categories.STRATEGIC.id,
			category: 'STRATEGIC',
			title: '新市場参入の機会',
			description: '競合分析とトレンド予測により、関西地域での新サービス展開の最適タイミングです。',
			priority: categories.STRATEGIC.priority,
			confidence: 0.84,
			actionable: true,
			impact: '新規売上3億円の可能性',
			algorithm: 'market_opportunity_analyzer_v2',
			data_sources: ['market_research', 'competitor_analysis', 'geographic_data']
		}
	];

	const suggestions = [
		{
			title: '在庫最適化の自動実行',
			description: 'AIが検出した在庫パターンに基づき、自動発注システムを有効化することを推奨',
			impact: 'high',
			estimatedValue: '月間500万円のコスト削減',
			requiredAction: 'システム設定の変更',
			risk: 'low'
		},
		{
			title: 'ワークフロー統合の実施',
			description: '重複している承認プロセスを統合し、処理時間を60%短縮',
			impact: 'medium',
			estimatedValue: '週40時間の作業時間削減',
			requiredAction: 'プロセス再設計',
			risk: 'medium'
		},
		{
			title: 'リアルタイム監視の強化',
			description: '異常検知感度を高め、インシデント対応時間を平均30分短縮',
			impact: 'high',
			estimatedValue: 'ダウンタイム50%削減',
			requiredAction: 'アラート設定の調整',
			risk: 'low'
		}
	];

	// ランダムに3-5個のインサイトを選択
	const selectedInsights = [];
	const count = 3 + Math.floor(Math.random() * 3);
	const usedIndices = new Set();

	while (selectedInsights.length < count && usedIndices.size < insightTemplates.length) {
		const index = Math.floor(Math.random() * insightTemplates.length);
		if (!usedIndices.has(index)) {
			usedIndices.add(index);
			selectedInsights.push({
				...insightTemplates[index],
				id: Date.now() + selectedInsights.length,
				created_at: new Date(Date.now() - Math.random() * 3600000).toISOString(),
				expires_at: new Date(Date.now() + config.INSIGHTS.INSIGHT_EXPIRY).toISOString()
			});
		}
	}

	return Promise.resolve({
		insights: selectedInsights,
		suggestions: suggestions.slice(0, 2 + Math.floor(Math.random() * 2))
	});
}

/**
 * AIウェルカムメッセージを取得
 */
export function getAIWelcomeMessage() {
	const messages = [
		'おはようございます！本日も素晴らしい一日になりそうです。現在、すべてのシステムが正常に稼働しています。',
		'お疲れ様です！本日のKPIは順調に推移しています。何かお手伝いできることはありますか？',
		'こんにちは！3つの重要なインサイトを検出しました。詳細をご確認ください。'
	];

	return Promise.resolve({
		message: config.AI_ASSISTANT.PERSONALITY.greeting,
		additionalInfo: messages[Math.floor(Math.random() * messages.length)]
	});
}

/**
 * AIレスポンスを生成
 */
export async function getAIResponse(query) {
	// 応答時間のシミュレーション
	await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

	const queryLower = query.toLowerCase();

	// クエリに基づいた応答を生成
	if (queryLower.includes('売上') || queryLower.includes('収益')) {
		return {
			message:
				'現在の売上は前年同期比で12.5%増加しており、目標達成率は94%です。特に関東地域での成長が顕著で、新規顧客獲得数も予想を上回っています。詳細な分析レポートをご覧になりますか？',
			action: { type: 'show_report', target: 'sales' },
			insight: {
				category: 'FINANCIAL',
				title: '売上成長の要因分析',
				description: '新規顧客獲得とリピート率向上が主な成長要因です',
				priority: 2
			}
		};
	}

	if (queryLower.includes('異常') || queryLower.includes('問題')) {
		return {
			message:
				'過去24時間で3件の軽微な異常を検出しましたが、すべて自動的に解決されています。現在、システム全体の健全性スコアは98.5%で、非常に良好な状態です。',
			action: { type: 'show_anomalies' }
		};
	}

	if (queryLower.includes('最適化') || queryLower.includes('改善')) {
		return {
			message:
				'現在のシステム分析に基づき、3つの最適化提案があります：1) 在庫管理の自動化により月間500万円のコスト削減、2) 配送ルートの最適化により効率15%向上、3) 承認プロセスの簡素化により処理時間60%短縮。実行しますか？',
			action: { type: 'optimization_suggestions' },
			suggestions: ['在庫管理自動化', '配送ルート最適化', '承認プロセス簡素化']
		};
	}

	if (queryLower.includes('レポート') || queryLower.includes('報告')) {
		return {
			message:
				'どのようなレポートをご希望ですか？本日の経営サマリー、週次パフォーマンスレポート、月次財務報告書などをすぐに生成できます。',
			action: { type: 'report_options' }
		};
	}

	if (queryLower.includes('予測') || queryLower.includes('将来')) {
		return {
			message:
				'機械学習モデルによる今後30日間の予測：売上は8%増加見込み、在庫回転率は現状維持、顧客満足度は0.2ポイント向上の見込みです。より詳細な予測分析をご覧になりますか？',
			action: { type: 'show_predictions' }
		};
	}

	// デフォルトレスポンス
	return {
		message:
			'ご質問ありがとうございます。現在のデータを分析中です。より具体的な情報をお教えいただければ、詳細な分析結果をご提供できます。',
		suggestions: ['本日のサマリー', 'システム状態確認', '最適化提案を見る']
	};
}

// ===========================================
// 異常検知（RDB: anomalies テーブル対応）
// ===========================================

/**
 * 異常検知データを取得
 * @returns {Promise<Object>} RDB anomalies テーブル構造に対応したデータ
 */
export function getAnomalies() {
	const anomalyTypes = config.ANOMALY_DETECTION.ALGORITHMS.map((algo, index) => [
		{
			type: 'TRAFFIC_SPIKE',
			metric_name: 'API呼び出し数',
			severity: 'critical',
			algorithm: algo,
			typical_range: [100, 500],
			threshold_multiplier: 3.0
		},
		{
			type: 'RESPONSE_TIME',
			metric_name: '平均応答時間',
			severity: 'warning',
			algorithm: algo,
			typical_range: [50, 200],
			threshold_multiplier: 2.5
		},
		{
			type: 'ERROR_RATE',
			metric_name: 'エラー率',
			severity: 'warning',
			algorithm: algo,
			typical_range: [0, 5],
			threshold_multiplier: 2.0
		},
		{
			type: 'MEMORY_USAGE',
			metric_name: 'メモリ使用率',
			severity: 'info',
			algorithm: algo,
			typical_range: [30, 80],
			threshold_multiplier: 1.5
		},
		{
			type: 'CPU_USAGE',
			metric_name: 'CPU使用率',
			severity: 'info',
			algorithm: algo,
			typical_range: [20, 70],
			threshold_multiplier: 1.8
		},
		{
			type: 'DISK_SPACE',
			metric_name: 'ディスク使用率',
			severity: 'warning',
			algorithm: algo,
			typical_range: [20, 85],
			threshold_multiplier: 1.3
		}
	]).flat();

	const allAnomalies = [];
	const criticalAnomalies = [];

	// ランダムに異常を生成（RDBテーブル構造）
	anomalyTypes.forEach((template, index) => {
		if (Math.random() > 0.6) {
			// 40%の確率で異常を生成
			const expectedValue = getRandomFloat(template.typical_range[0], template.typical_range[1]);
			const currentValue = expectedValue * (template.threshold_multiplier + Math.random() * 0.5);
			const deviation = (((currentValue - expectedValue) / expectedValue) * 100).toFixed(1);

			// モックメトリクスID生成（実際のDBでは外部キー）
			const mockMetricId = Date.now() + index;

			const anomaly = {
				// RDB anomalies テーブル構造
				id: Date.now() + index + Math.random(),
				type: template.type,
				severity: template.severity,
				metric_id: mockMetricId,
				score: getRandomFloat(config.ANOMALY_DETECTION.SENSITIVITY_LEVELS.HIGH.threshold, 4.0),
				current_value: parseFloat(currentValue.toFixed(2)),
				expected_value: parseFloat(expectedValue.toFixed(2)),
				deviation: deviation > 0 ? `+${deviation}%` : `${deviation}%`,
				detected_at: getRandomTimestamp(2), // 2時間以内
				resolved_at: null, // 未解決
				algorithm: template.algorithm,
				confidence: getRandomFloat(0.75, 0.98),
				description: `${template.metric_name}が通常値(${expectedValue.toFixed(1)})を大幅に超過: ${currentValue.toFixed(1)}`,
				recommendation: generateRecommendation(template.type, template.severity),

				// 拡張情報
				metric_name: template.metric_name,
				detection_window: config.ANOMALY_DETECTION.DETECTION_WINDOW,
				historical_comparison_days: config.ANOMALY_DETECTION.HISTORICAL_COMPARISON,
				auto_remediation_available: config.ANOMALY_DETECTION.AUTO_REMEDIATION,

				// 関連システム情報
				affected_systems: getAffectedSystems(template.type),
				estimated_impact: getEstimatedImpact(template.severity),

				// 検知詳細
				detection_metadata: {
					model_version: `${template.algorithm}_v2.1`,
					training_data_period: '90_days',
					last_model_update: getRandomTimestamp(7 * 24), // 7日以内
					sensitivity_level: 'medium'
				}
			};

			allAnomalies.push(anomaly);
			if (anomaly.severity === 'critical') {
				criticalAnomalies.push(anomaly);
			}
		}
	});

	// RDB集計データ
	const summary = {
		total: allAnomalies.length,
		critical: allAnomalies.filter((a) => a.severity === 'critical').length,
		warning: allAnomalies.filter((a) => a.severity === 'warning').length,
		info: allAnomalies.filter((a) => a.severity === 'info').length,

		// 拡張統計
		avg_confidence:
			allAnomalies.length > 0
				? (allAnomalies.reduce((sum, a) => sum + a.confidence, 0) / allAnomalies.length).toFixed(2)
				: 0,
		detection_rate_24h: allAnomalies.filter(
			(a) => new Date(a.detected_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
		).length,
		auto_resolved_count: allAnomalies.filter((a) => a.resolved_at !== null).length,

		// アルゴリズム別統計
		by_algorithm: config.ANOMALY_DETECTION.ALGORITHMS.reduce((acc, algo) => {
			acc[algo] = allAnomalies.filter((a) => a.algorithm === algo).length;
			return acc;
		}, {})
	};

	return Promise.resolve({
		anomalies: allAnomalies,
		critical: criticalAnomalies,
		summary,

		// メタデータ
		detection_config: {
			algorithms_enabled: config.ANOMALY_DETECTION.ALGORITHMS,
			sensitivity: config.ANOMALY_DETECTION.SENSITIVITY_LEVELS.MEDIUM,
			auto_remediation: config.ANOMALY_DETECTION.AUTO_REMEDIATION,
			detection_window_ms: config.ANOMALY_DETECTION.DETECTION_WINDOW
		},
		last_updated: new Date().toISOString()
	});
}

/**
 * 推奨アクションを生成
 */
function generateRecommendation(type, severity) {
	const recommendations = {
		TRAFFIC_SPIKE: {
			critical: 'オートスケーリングを即座に実行し、追加リソースを割り当ててください',
			warning: 'トラフィック監視を強化し、必要に応じてスケーリングの準備をしてください',
			info: 'トラフィックパターンを分析し、今後の計画に反映してください'
		},
		RESPONSE_TIME: {
			critical: 'サービス停止の可能性があります。緊急対応チームに連絡してください',
			warning: 'パフォーマンス調査を実施し、ボトルネックを特定してください',
			info: 'レスポンス時間の傾向を監視し、最適化を検討してください'
		},
		ERROR_RATE: {
			critical: 'サービス品質に重大な影響があります。即座に根本原因を調査してください',
			warning: 'エラーログを確認し、問題の範囲を特定してください',
			info: 'エラーパターンを分析し、予防的措置を検討してください'
		},
		MEMORY_USAGE: {
			critical: 'メモリ不足によるシステム停止のリスクがあります。緊急対応が必要です',
			warning: 'メモリ使用量を監視し、必要に応じてメモリを増設してください',
			info: 'メモリ使用パターンを分析し、最適化の機会を探してください'
		},
		CPU_USAGE: {
			critical: 'CPU使用率が危険レベルです。負荷分散または追加リソースが必要です',
			warning: 'CPU使用率を監視し、高負荷の原因を調査してください',
			info: 'CPU使用傾向を分析し、リソース計画を見直してください'
		},
		DISK_SPACE: {
			critical: 'ディスク容量が不足しています。緊急でクリーンアップまたは拡張が必要です',
			warning: 'ディスク使用量を確認し、不要ファイルの削除を検討してください',
			info: 'ディスク使用傾向を監視し、容量計画を更新してください'
		}
	};

	return recommendations[type]?.[severity] || '状況を監視し、適切なアクションを検討してください';
}

/**
 * 影響を受けるシステムを取得
 */
function getAffectedSystems(anomalyType) {
	const systemMappings = {
		TRAFFIC_SPIKE: ['sys_erp_001', 'sys_crm_001'],
		RESPONSE_TIME: ['sys_bi_001', 'sys_scm_001'],
		ERROR_RATE: ['sys_iot_001', 'sys_erp_001'],
		MEMORY_USAGE: ['sys_crm_001', 'sys_hrm_001'],
		CPU_USAGE: ['sys_scm_001', 'sys_bi_001'],
		DISK_SPACE: ['sys_iot_001', 'sys_hrm_001']
	};

	const systems = systemMappings[anomalyType] || [];
	return systems.slice(0, 1 + Math.floor(Math.random() * 2)); // 1-2個のシステムを返す
}

/**
 * 推定影響度を取得
 */
function getEstimatedImpact(severity) {
	const impacts = {
		critical: {
			users_affected: getRandomInt(1000, 5000),
			revenue_impact: getRandomInt(100000, 500000),
			sla_breach_risk: 'high',
			estimated_downtime: getRandomInt(15, 60) + ' minutes'
		},
		warning: {
			users_affected: getRandomInt(100, 1000),
			revenue_impact: getRandomInt(10000, 100000),
			sla_breach_risk: 'medium',
			estimated_downtime: getRandomInt(5, 15) + ' minutes'
		},
		info: {
			users_affected: getRandomInt(10, 100),
			revenue_impact: getRandomInt(1000, 10000),
			sla_breach_risk: 'low',
			estimated_downtime: getRandomInt(1, 5) + ' minutes'
		}
	};

	return impacts[severity] || impacts.info;
}

// ===========================================
// ワークフロー自動化（RDB: workflows テーブル対応）
// ===========================================

/**
 * ワークフローデータを取得
 * @returns {Promise<Array>} RDB workflows テーブル構造に対応したデータ
 */
export function getWorkflows() {
	const workflowTemplates = [
		{
			name: '売上レポート自動生成',
			description: '毎日午前9時に前日の売上レポートを生成し、経営陣に送信',
			trigger_type: 'TIME_BASED',
			trigger_config: {
				schedule: '0 9 * * *',
				timezone: 'Asia/Tokyo',
				enabled: true,
				next_execution: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString()
			},
			steps: [
				{
					step_id: 1,
					action_type: 'call_api',
					name: '売上データ取得',
					config: {
						endpoint: '/api/v1/sales/daily',
						method: 'GET',
						timeout: 30000
					},
					expected_duration: 15000,
					retry_policy: { max_attempts: 3, backoff: 2000 }
				},
				{
					step_id: 2,
					action_type: 'data_transform',
					name: 'データ集計・分析',
					config: {
						aggregation_rules: ['sum_by_region', 'group_by_product'],
						format: 'executive_summary'
					},
					expected_duration: 45000,
					dependencies: [1]
				},
				{
					step_id: 3,
					action_type: 'generate_report',
					name: 'レポート生成',
					config: {
						template: 'daily_sales_executive',
						format: 'pdf',
						charts: ['revenue_trend', 'top_products', 'regional_breakdown']
					},
					expected_duration: 60000,
					dependencies: [2]
				},
				{
					step_id: 4,
					action_type: 'send_notification',
					name: 'メール送信',
					config: {
						recipients: ['ceo@company.com', 'cfo@company.com'],
						template: 'daily_report_email',
						attachments: ['report_pdf']
					},
					expected_duration: 5000,
					dependencies: [3]
				}
			],
			category: 'reporting',
			priority: 2,
			estimated_duration: 125000
		},
		{
			name: '異常検知時の自動対応',
			description: 'システム異常を検知したら自動的にスケーリングと通知を実行',
			trigger_type: 'EVENT_BASED',
			trigger_config: {
				event_type: 'anomaly_detected',
				conditions: {
					severity: ['critical', 'warning'],
					systems: ['all'],
					confidence_threshold: 0.8
				},
				debounce_period: 300000 // 5分間の重複実行防止
			},
			steps: [
				{
					step_id: 1,
					action_type: 'condition',
					name: '重要度チェック',
					config: {
						conditions: [
							{ field: 'severity', operator: 'in', values: ['critical'] },
							{ field: 'confidence', operator: '>=', value: 0.85 }
						]
					},
					expected_duration: 1000
				},
				{
					step_id: 2,
					action_type: 'execute_script',
					name: 'オートスケーリング実行',
					config: {
						script_type: 'kubernetes_scale',
						scale_up_factor: 1.5,
						max_replicas: 20,
						target_cpu_threshold: 70
					},
					expected_duration: 30000,
					dependencies: [1],
					conditions: [{ step_id: 1, result: 'success' }]
				},
				{
					step_id: 3,
					action_type: 'send_notification',
					name: 'Slack緊急通知',
					config: {
						channel: '#ops-emergency',
						mention: ['@oncall-engineer', '@team-lead'],
						template: 'anomaly_alert',
						include_details: true
					},
					expected_duration: 3000,
					dependencies: []
				},
				{
					step_id: 4,
					action_type: 'wait',
					name: '状況安定化待機',
					config: {
						duration: 300000,
						monitoring: true,
						abort_conditions: [{ metric: 'cpu_usage', threshold: 90, comparison: '>' }]
					},
					expected_duration: 300000,
					dependencies: [2]
				},
				{
					step_id: 5,
					action_type: 'call_api',
					name: 'システム状態検証',
					config: {
						endpoint: '/api/v1/system/health',
						validation_rules: [
							{ metric: 'overall_health', expected: 'healthy' },
							{ metric: 'anomaly_score', threshold: 1.5, comparison: '<' }
						]
					},
					expected_duration: 10000,
					dependencies: [4]
				}
			],
			category: 'incident_response',
			priority: 1,
			estimated_duration: 344000
		},
		{
			name: '在庫レベル最適化',
			description: 'AI予測に基づいて在庫レベルを自動調整し、最適な発注を実行',
			trigger_type: 'AI_SUGGESTED',
			trigger_config: {
				ai_model: 'inventory_optimization_v2',
				trigger_conditions: {
					stock_prediction_confidence: 0.9,
					demand_forecast_accuracy: 0.85,
					seasonality_factor: true
				},
				schedule_backup: '0 6 * * 1' // 毎週月曜日6時のバックアップ実行
			},
			steps: [
				{
					step_id: 1,
					action_type: 'call_api',
					name: 'AI予測データ取得',
					config: {
						endpoint: '/api/v1/ai/inventory-predictions',
						include_confidence: true,
						forecast_horizon: 30
					},
					expected_duration: 20000
				},
				{
					step_id: 2,
					action_type: 'data_transform',
					name: '発注量計算',
					config: {
						algorithm: 'safety_stock_optimization',
						constraints: ['budget_limit', 'storage_capacity'],
						optimization_target: 'cost_efficiency'
					},
					expected_duration: 35000,
					dependencies: [1]
				},
				{
					step_id: 3,
					action_type: 'call_api',
					name: '自動発注実行',
					config: {
						endpoint: '/api/v1/procurement/auto-order',
						approval_required: true,
						approval_threshold: 100000
					},
					expected_duration: 15000,
					dependencies: [2]
				}
			],
			category: 'optimization',
			priority: 3,
			estimated_duration: 70000
		}
	];

	// RDBテーブル構造に合わせてワークフローを生成
	const workflows = workflowTemplates.map((template, index) => {
		const lastRunTime = getRandomTimestamp(getRandomInt(2, 48)); // 2-48時間前
		const totalRuns = getRandomInt(50, 500);
		const successfulRuns = Math.floor(totalRuns * (0.85 + Math.random() * 0.13)); // 85-98%の成功率

		return {
			// RDB workflows テーブル構造
			id: Date.now() + index,
			name: template.name,
			description: template.description,
			trigger_type: template.trigger_type,
			trigger_config: template.trigger_config,
			steps: template.steps,
			status: getRandomFromArray(['active', 'active', 'active', 'paused']), // 75%がactive
			success_rate: parseFloat(((successfulRuns / totalRuns) * 100).toFixed(1)),
			avg_duration: template.estimated_duration + getRandomInt(-20000, 40000), // ±20-40秒の変動
			total_runs: totalRuns,
			created_at: getRandomTimestamp(30 * 24), // 30日前
			updated_at: getRandomTimestamp(1), // 1時間以内

			// 拡張情報
			category: template.category,
			priority: template.priority,
			last_run: {
				execution_id: Date.now() + index + 1000,
				start_time: lastRunTime,
				end_time: new Date(
					new Date(lastRunTime).getTime() + template.estimated_duration
				).toISOString(),
				status: getRandomFromArray(['success', 'success', 'success', 'failed']), // 75%成功
				duration: template.estimated_duration + getRandomInt(-10000, 20000),
				steps_completed: template.steps.length,
				total_steps: template.steps.length
			},
			next_run:
				template.trigger_type === 'TIME_BASED' ? template.trigger_config.next_execution : null,

			// パフォーマンス統計
			performance_stats: {
				avg_step_duration: Math.floor(template.estimated_duration / template.steps.length),
				failure_rate_by_step: template.steps.map((step) => ({
					step_id: step.step_id,
					failure_rate: getRandomFloat(0, 5)
				})),
				resource_usage: {
					cpu_avg: getRandomFloat(10, 40),
					memory_avg: getRandomFloat(50, 200),
					network_io: getRandomFloat(100, 1000)
				}
			},

			// 自動化設定
			automation_config: {
				auto_retry: true,
				max_retries: config.AUTOMATION.RETRY_POLICY.max_attempts,
				timeout: config.AUTOMATION.EXECUTION_TIMEOUT,
				notification_on_failure: true,
				rollback_on_failure: template.trigger_type === 'EVENT_BASED'
			}
		};
	});

	return Promise.resolve(workflows);
}

/**
 * ワークフロー実行履歴を取得（RDB: executions テーブル対応）
 * @param {number} workflowId - 特定のワークフローの履歴を取得（省略時は全履歴）
 * @param {number} limit - 取得件数制限（デフォルト: 50）
 * @returns {Promise<Object>} RDB executions テーブル構造に対応したデータ
 */
export function getExecutionHistory(workflowId = null, limit = 50) {
	// 過去30日間の実行履歴を生成
	const executionHistory = [];
	const workflowNames = {
		1: '売上レポート自動生成',
		2: '異常検知時の自動対応',
		3: '在庫レベル最適化'
	};

	// 各ワークフローの実行履歴を生成
	Object.keys(workflowNames).forEach((wfId) => {
		const workflowIdNum = parseInt(wfId);
		if (workflowId && workflowIdNum !== workflowId) return;

		// 過去30日間で10-30回の実行履歴を生成
		const executionCount = getRandomInt(10, 30);

		for (let i = 0; i < executionCount; i++) {
			const startTime = getRandomTimestamp(30 * 24); // 30日以内
			const isSuccess = Math.random() > 0.15; // 85%成功率
			const estimatedDuration = workflowIdNum === 1 ? 125000 : workflowIdNum === 2 ? 344000 : 70000;
			const actualDuration = estimatedDuration + getRandomInt(-30000, 60000);
			const endTime = new Date(new Date(startTime).getTime() + actualDuration).toISOString();

			const execution = {
				// RDB executions テーブル構造
				id: Date.now() + i + workflowIdNum * 1000,
				workflow_id: workflowIdNum,
				workflow_name: workflowNames[workflowIdNum],
				start_time: startTime,
				end_time: endTime,
				status: isSuccess ? 'success' : getRandomFromArray(['failed', 'timeout', 'cancelled']),
				duration: actualDuration,
				steps_completed: isSuccess
					? workflowIdNum === 1
						? 4
						: workflowIdNum === 2
							? 5
							: 3
					: getRandomInt(1, workflowIdNum === 1 ? 3 : workflowIdNum === 2 ? 4 : 2),
				total_steps: workflowIdNum === 1 ? 4 : workflowIdNum === 2 ? 5 : 3,

				// 実行詳細
				execution_context: {
					trigger_source:
						workflowIdNum === 1
							? 'scheduler'
							: workflowIdNum === 2
								? 'anomaly_detector'
								: 'ai_optimizer',
					environment: 'production',
					executor: 'automation-engine-v2',
					resource_allocation: {
						cpu_cores: getRandomFloat(0.5, 4.0, 1),
						memory_mb: getRandomInt(256, 2048),
						execution_node: `worker-${getRandomInt(1, 10)}`
					}
				},

				// エラー情報（失敗時）
				error_info: !isSuccess
					? {
							error_code: getRandomFromArray([
								'TIMEOUT',
								'API_ERROR',
								'VALIDATION_FAILED',
								'RESOURCE_UNAVAILABLE'
							]),
							error_message: '実行中にエラーが発生しました',
							failed_step_id: getRandomInt(
								1,
								workflowIdNum === 1 ? 4 : workflowIdNum === 2 ? 5 : 3
							),
							retry_count: getRandomInt(0, 3),
							stack_trace: 'Stack trace would be here in real implementation'
						}
					: null,

				// パフォーマンス情報
				performance_metrics: {
					cpu_usage_avg: getRandomFloat(10, 80),
					memory_usage_peak: getRandomInt(100, 1500),
					network_io_bytes: getRandomInt(1000, 50000),
					disk_io_operations: getRandomInt(10, 500)
				},

				// ステップ詳細
				step_details: generateStepDetails(workflowIdNum, isSuccess),

				// ログ情報
				logs: [
					{ timestamp: startTime, level: 'INFO', message: 'ワークフロー実行開始' },
					{
						timestamp: new Date(new Date(startTime).getTime() + 5000).toISOString(),
						level: 'INFO',
						message: 'ステップ1開始'
					},
					...(!isSuccess
						? [
								{
									timestamp: new Date(
										new Date(startTime).getTime() + actualDuration - 1000
									).toISOString(),
									level: 'ERROR',
									message: '実行失敗'
								}
							]
						: []),
					{
						timestamp: endTime,
						level: 'INFO',
						message: `ワークフロー実行${isSuccess ? '完了' : '失敗'}`
					}
				],

				created_at: startTime,
				updated_at: endTime
			};

			executionHistory.push(execution);
		}
	});

	// 日時降順でソート
	executionHistory.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

	// 制限数まで切り取り
	const limitedHistory = executionHistory.slice(0, limit);

	// 統計情報の計算
	const statistics = {
		total_executions: executionHistory.length,
		success_rate: (
			(executionHistory.filter((e) => e.status === 'success').length / executionHistory.length) *
			100
		).toFixed(1),
		avg_duration: Math.floor(
			executionHistory.reduce((sum, e) => sum + e.duration, 0) / executionHistory.length
		),
		executions_last_24h: executionHistory.filter(
			(e) => new Date(e.start_time) > new Date(Date.now() - 24 * 60 * 60 * 1000)
		).length,
		executions_last_7d: executionHistory.filter(
			(e) => new Date(e.start_time) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
		).length,

		// ステータス別統計
		by_status: {
			success: executionHistory.filter((e) => e.status === 'success').length,
			failed: executionHistory.filter((e) => e.status === 'failed').length,
			timeout: executionHistory.filter((e) => e.status === 'timeout').length,
			cancelled: executionHistory.filter((e) => e.status === 'cancelled').length
		},

		// ワークフロー別統計
		by_workflow: Object.keys(workflowNames).reduce((acc, wfId) => {
			const wfExecutions = executionHistory.filter((e) => e.workflow_id === parseInt(wfId));
			acc[wfId] = {
				name: workflowNames[wfId],
				total: wfExecutions.length,
				success_rate:
					wfExecutions.length > 0
						? (
								(wfExecutions.filter((e) => e.status === 'success').length / wfExecutions.length) *
								100
							).toFixed(1)
						: 0
			};
			return acc;
		}, {})
	};

	return Promise.resolve({
		executions: limitedHistory,
		statistics,
		pagination: {
			total: executionHistory.length,
			limit: limit,
			returned: limitedHistory.length
		},
		last_updated: new Date().toISOString()
	});
}

/**
 * ステップ詳細を生成
 */
function generateStepDetails(workflowId, isSuccess) {
	const stepTemplates = {
		1: [
			// 売上レポート自動生成
			{ name: '売上データ取得', expected_duration: 15000 },
			{ name: 'データ集計・分析', expected_duration: 45000 },
			{ name: 'レポート生成', expected_duration: 60000 },
			{ name: 'メール送信', expected_duration: 5000 }
		],
		2: [
			// 異常検知時の自動対応
			{ name: '重要度チェック', expected_duration: 1000 },
			{ name: 'オートスケーリング実行', expected_duration: 30000 },
			{ name: 'Slack緊急通知', expected_duration: 3000 },
			{ name: '状況安定化待機', expected_duration: 300000 },
			{ name: 'システム状態検証', expected_duration: 10000 }
		],
		3: [
			// 在庫レベル最適化
			{ name: 'AI予測データ取得', expected_duration: 20000 },
			{ name: '発注量計算', expected_duration: 35000 },
			{ name: '自動発注実行', expected_duration: 15000 }
		]
	};

	const steps = stepTemplates[workflowId] || [];
	let cumulativeTime = 0;

	return steps.map((step, index) => {
		const startTime = cumulativeTime;
		const actualDuration = step.expected_duration + getRandomInt(-5000, 10000);
		const endTime = startTime + actualDuration;
		cumulativeTime = endTime;

		const stepSuccess = isSuccess
			? index < steps.length - 1 || Math.random() > 0.05
			: index < getRandomInt(1, steps.length - 1);

		return {
			step_id: index + 1,
			name: step.name,
			status: stepSuccess ? 'success' : getRandomFromArray(['failed', 'timeout']),
			start_offset: startTime,
			end_offset: endTime,
			duration: actualDuration,
			output: stepSuccess
				? { result: 'success', data: 'Step completed successfully' }
				: { error: 'Step execution failed', details: 'Error details would be here' }
		};
	});
}

// ===========================================
// 予測分析（RDB: predictions テーブル対応）
// ===========================================

/**
 * 予測データを取得
 * @param {string} type - 予測タイプ（'all', 'revenue', 'traffic', 'efficiency', 'satisfaction'）
 * @param {number} horizon - 予測期間（日数、デフォルト: 30）
 * @returns {Promise<Object>} RDB predictions テーブル構造に対応したデータ
 */
export function getPredictions(type = 'all', horizon = 30) {
	// 予測期間に応じた設定
	const horizonConfig =
		horizon <= 7
			? config.PREDICTIVE_ANALYTICS.FORECAST_HORIZONS.SHORT_TERM
			: horizon <= 30
				? config.PREDICTIVE_ANALYTICS.FORECAST_HORIZONS.MEDIUM_TERM
				: config.PREDICTIVE_ANALYTICS.FORECAST_HORIZONS.LONG_TERM;

	const predictionTemplates = {
		revenue: {
			metric_name: '売上収益',
			metric_unit: 'JPY',
			current_value: 15234000,
			prediction_models: ['ARIMA', 'Prophet', 'LSTM'],
			seasonal_factors: true,
			external_factors: ['季節要因', '新商品投入', '市場成長', '競合動向']
		},
		traffic: {
			metric_name: 'ウェブトラフィック',
			metric_unit: 'sessions',
			current_value: 125000,
			prediction_models: ['Prophet', 'LSTM'],
			seasonal_factors: true,
			external_factors: ['マーケティング効果', '口コミ拡散', 'SEO施策', 'コンテンツ更新']
		},
		efficiency: {
			metric_name: '運用効率',
			metric_unit: 'percentage',
			current_value: 87.3,
			prediction_models: ['RandomForest', 'XGBoost'],
			seasonal_factors: false,
			external_factors: ['自動化推進', 'プロセス改善', '人員配置最適化', 'システム升级']
		},
		satisfaction: {
			metric_name: '顧客満足度',
			metric_unit: 'score',
			current_value: 4.6,
			prediction_models: ['NeuralNet', 'Prophet'],
			seasonal_factors: false,
			external_factors: ['サービス品質向上', 'レスポンス改善', 'UI/UX改善', 'サポート強化']
		},
		costs: {
			metric_name: '運用コスト',
			metric_unit: 'JPY',
			current_value: 8500000,
			prediction_models: ['ARIMA', 'LSTM'],
			seasonal_factors: true,
			external_factors: ['リソース使用量', 'インフレ率', 'エネルギーコスト', '人件費変動']
		},
		inventory: {
			metric_name: '在庫回転率',
			metric_unit: 'turns_per_month',
			current_value: 6.2,
			prediction_models: ['Prophet', 'XGBoost'],
			seasonal_factors: true,
			external_factors: ['需要予測', '供給状況', '季節変動', 'プロモーション効果']
		}
	};

	// RDB predictions テーブル構造でデータを生成
	const generatePrediction = (predictionType, template) => {
		const variationFactor = 1 + (Math.random() - 0.5) * 0.3; // ±15%の変動
		const trendFactor = 1 + (Math.random() - 0.3) * 0.2; // 上昇傾向を優先
		const predictedValue = template.current_value * variationFactor * trendFactor;

		// トレンド判定
		const changePercent =
			((predictedValue - template.current_value) / template.current_value) * 100;
		const trend = changePercent > 5 ? 'increasing' : changePercent < -5 ? 'decreasing' : 'stable';

		return {
			// RDB predictions テーブル構造
			id: Date.now() + Math.random(),
			type: predictionType,
			horizon_days: horizon,
			metric_name: template.metric_name,
			metric_unit: template.metric_unit,
			current_value: template.current_value,
			predicted_value: parseFloat(predictedValue.toFixed(2)),
			confidence: Math.min(horizonConfig.accuracy + (Math.random() - 0.5) * 0.1, 0.98),
			created_at: new Date().toISOString(),

			// 予測詳細
			prediction_details: {
				trend: trend,
				change_percent: parseFloat(changePercent.toFixed(2)),
				change_absolute: parseFloat((predictedValue - template.current_value).toFixed(2)),
				volatility: getRandomFloat(0.05, 0.25),

				// 信頼区間
				confidence_intervals: {
					lower_80: parseFloat((predictedValue * 0.85).toFixed(2)),
					upper_80: parseFloat((predictedValue * 1.15).toFixed(2)),
					lower_95: parseFloat((predictedValue * 0.78).toFixed(2)),
					upper_95: parseFloat((predictedValue * 1.22).toFixed(2))
				},

				// 時系列データポイント（簡化版）
				time_series: generateTimeSeriesPoints(template.current_value, predictedValue, horizon),

				// 影響要因
				influencing_factors: template.external_factors.map((factor) => ({
					factor: factor,
					impact_score: getRandomFloat(-0.3, 0.3),
					confidence: getRandomFloat(0.7, 0.95)
				}))
			},

			// モデル情報
			model_metadata: {
				primary_model: getRandomFromArray(template.prediction_models),
				ensemble_models: template.prediction_models,
				model_version: 'v2.1',
				training_data_period: '2_years',
				last_retrained: getRandomTimestamp(7 * 24), // 7日以内
				feature_count: getRandomInt(15, 50),
				cross_validation_score: getRandomFloat(0.8, 0.95)
			},

			// アラートとリスク
			alerts: generatePredictionAlerts(predictionType, changePercent, trend),
			risks: generatePredictionRisks(predictionType, trend, horizonConfig.accuracy)
		};
	};

	// 時系列データポイントを生成
	function generateTimeSeriesPoints(currentValue, predictedValue, days) {
		const points = [];
		const stepValue = (predictedValue - currentValue) / days;

		for (let i = 0; i <= days; i += Math.ceil(days / 10)) {
			// 最大10ポイント
			const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
			const value = currentValue + stepValue * i + (Math.random() - 0.5) * currentValue * 0.1;

			points.push({
				date: date.toISOString().split('T')[0],
				value: parseFloat(value.toFixed(2)),
				confidence: Math.max(0.6, horizonConfig.accuracy - (i / days) * 0.2)
			});
		}

		return points;
	}

	// 予測アラートを生成
	function generatePredictionAlerts(type, changePercent, trend) {
		const alerts = [];

		if (Math.abs(changePercent) > 20) {
			alerts.push({
				level: 'warning',
				message: `${changePercent > 0 ? '大幅な増加' : '大幅な減少'}が予測されます（${Math.abs(changePercent).toFixed(1)}%）`,
				action_required: true
			});
		}

		if (type === 'costs' && trend === 'increasing') {
			alerts.push({
				level: 'info',
				message: 'コスト増加が予測されます。予算計画の見直しを検討してください',
				action_required: false
			});
		}

		return alerts;
	}

	// 予測リスクを生成
	function generatePredictionRisks(type, trend, confidence) {
		const risks = [];

		if (confidence < 0.8) {
			risks.push({
				type: 'model_uncertainty',
				level: 'medium',
				description: '予測の信頼度が低下しています。追加データが必要な可能性があります'
			});
		}

		if (type === 'revenue' && trend === 'decreasing') {
			risks.push({
				type: 'business_impact',
				level: 'high',
				description: '売上減少により、事業目標達成が困難になる可能性があります'
			});
		}

		return risks;
	}

	// 予測データを生成
	const predictions = {};

	if (type === 'all') {
		// 全ての予測タイプを生成
		Object.keys(predictionTemplates).forEach((predType) => {
			predictions[predType] = generatePrediction(predType, predictionTemplates[predType]);
		});
	} else if (predictionTemplates[type]) {
		// 指定されたタイプのみ
		predictions[type] = generatePrediction(type, predictionTemplates[type]);
	}

	// メタデータを追加
	const result = {
		predictions,
		metadata: {
			horizon_days: horizon,
			horizon_config: horizonConfig,
			generated_at: new Date().toISOString(),
			model_ensemble: config.PREDICTIVE_ANALYTICS.MODELS,
			update_frequency: config.PREDICTIVE_ANALYTICS.UPDATE_FREQUENCY,
			confidence_threshold: config.PREDICTIVE_ANALYTICS.CONFIDENCE_THRESHOLD
		},
		summary: {
			total_predictions: Object.keys(predictions).length,
			avg_confidence:
				Object.values(predictions).length > 0
					? (
							Object.values(predictions).reduce((sum, p) => sum + p.confidence, 0) /
							Object.values(predictions).length
						).toFixed(2)
					: 0,
			high_confidence_count: Object.values(predictions).filter((p) => p.confidence > 0.9).length,
			alerts_count: Object.values(predictions).reduce((sum, p) => sum + p.alerts.length, 0)
		}
	};

	return Promise.resolve(result);
}

// ===========================================
// レポート生成（RDB: reports テーブル対応）
// ===========================================

/**
 * レポートを生成
 * @param {string} type - レポートタイプ
 * @param {string} format - 出力形式（pdf, excel, powerpoint, interactive）
 * @param {Object} options - 生成オプション
 * @returns {Promise<Object>} RDB reports テーブル構造に対応したデータ
 */
export async function generateReport(type, format = 'pdf', options = {}) {
	// レポート生成のシミュレーション（RDB想定）
	const processingTime = getRandomInt(1500, 4000);
	await new Promise((resolve) => setTimeout(resolve, processingTime));

	const reportTemplates = {
		executive_summary: {
			name: '経営サマリーレポート',
			category: 'executive',
			pages: config.REPORT_GENERATION.TEMPLATES.EXECUTIVE_SUMMARY.pages,
			charts: config.REPORT_GENERATION.TEMPLATES.EXECUTIVE_SUMMARY.charts,
			sections: ['売上概要', 'KPI実績', 'リスク分析', '戦略提案'],
			data_sources: ['sales_db', 'analytics_db', 'financial_db']
		},
		detailed_analysis: {
			name: '詳細分析レポート',
			category: 'analytical',
			pages: config.REPORT_GENERATION.TEMPLATES.DETAILED_ANALYSIS.pages,
			charts: config.REPORT_GENERATION.TEMPLATES.DETAILED_ANALYSIS.charts,
			sections: ['市場分析', '競合比較', '財務分析', '運用効率', '予測モデル'],
			data_sources: ['market_data', 'competitor_db', 'financial_db', 'operations_db']
		},
		operational: {
			name: '運用レポート',
			category: 'operations',
			pages: 8,
			charts: 12,
			sections: ['システム状態', 'パフォーマンス', '異常検知', '自動化状況'],
			data_sources: ['monitoring_db', 'metrics_db', 'automation_db']
		},
		predictive: {
			name: '予測分析レポート',
			category: 'forecasting',
			pages: 10,
			charts: 15,
			sections: ['予測モデル', '信頼区間', 'シナリオ分析', 'リスク評価'],
			data_sources: ['prediction_models', 'historical_data', 'external_data']
		}
	};

	const template = reportTemplates[type] || reportTemplates.operational;
	const reportId = Date.now() + Math.random();

	// RDB reports テーブル構造
	const report = {
		// 基本情報
		id: reportId,
		type: type,
		name: template.name,
		format: format,
		category: template.category,
		status: 'completed',

		// 生成情報
		generated_at: new Date().toISOString(),
		generated_by: 'ai_report_generator',
		generation_time_ms: processingTime,
		template_version: 'v2.1',

		// コンテンツ情報
		content_metadata: {
			total_pages: template.pages + getRandomInt(-1, 2),
			total_charts: template.charts + getRandomInt(-2, 3),
			total_tables: getRandomInt(5, 15),
			word_count: getRandomInt(2000, 8000),
			sections: template.sections,
			languages: ['ja'],
			includes_ai_insights: true,
			includes_predictions: type === 'predictive' || type === 'detailed_analysis'
		},

		// ファイル情報
		file_info: {
			size_bytes: getRandomInt(100000, 2000000), // 100KB - 2MB
			size_formatted: `${getRandomFloat(0.1, 2.0, 1)}MB`,
			file_path: `/reports/${type}_${reportId}.${format}`,
			download_url: `/api/v1/reports/${reportId}/download`,
			preview_url: `/api/v1/reports/${reportId}/preview`,
			expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30日後
		},

		// データソース情報
		data_sources: {
			primary_sources: template.data_sources,
			data_range: {
				start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
				end_date: new Date().toISOString().split('T')[0],
				total_records: getRandomInt(10000, 100000)
			},
			refresh_status: 'up_to_date',
			last_data_update: getRandomTimestamp(1)
		},

		// 品質情報
		quality_metrics: {
			data_completeness: getRandomFloat(0.95, 1.0),
			data_accuracy_score: getRandomFloat(0.92, 0.99),
			report_confidence: getRandomFloat(0.85, 0.95),
			validation_passed: true,
			issues_detected: getRandomInt(0, 2)
		},

		// アクセス情報
		access_info: {
			permissions: ['view', 'download', 'share'],
			shared_with: options.recipients || [],
			view_count: 0,
			download_count: 0,
			last_accessed: null
		},

		// カスタマイゼーション
		customization: {
			custom_filters: options.filters || {},
			custom_sections: options.sections || [],
			branding: options.branding || 'default',
			theme: options.theme || 'corporate'
		}
	};

	return Promise.resolve(report);
}

// ===========================================
// 自動化アクション実行（RDB: automation_executions テーブル対応）
// ===========================================

/**
 * 自動化アクションを実行
 * @param {string} actionType - アクションタイプ
 * @param {Object} params - 実行パラメータ
 * @returns {Promise<Object>} RDB automation_executions テーブル構造に対応したデータ
 */
export async function executeAutomation(actionType, params = {}) {
	// アクション実行のシミュレーション
	const startTime = new Date().toISOString();
	const executionTime = 1000 + Math.random() * 3000;
	await new Promise((resolve) => setTimeout(resolve, executionTime));
	const endTime = new Date().toISOString();

	const executionId = Date.now() + Math.random();
	const isSuccess = Math.random() > 0.08; // 92%成功率

	// アクションタイプ別の結果生成
	const actionResults = {
		send_notification: {
			action_specific: {
				recipients_count: (params.recipients || ['default@example.com']).length,
				delivery_method: params.method || 'email',
				message_id: `msg_${Date.now()}`,
				delivery_status: isSuccess ? 'delivered' : 'failed'
			}
		},
		execute_script: {
			action_specific: {
				script_name: params.script || 'auto_scaling.sh',
				exit_code: isSuccess ? 0 : getRandomInt(1, 5),
				stdout_lines: isSuccess ? getRandomInt(5, 20) : 0,
				stderr_lines: isSuccess ? 0 : getRandomInt(1, 10)
			}
		},
		call_api: {
			action_specific: {
				endpoint: params.endpoint || '/api/v1/system/status',
				method: params.method || 'GET',
				status_code: isSuccess ? 200 : getRandomFromArray([400, 401, 403, 500, 503]),
				response_size: isSuccess ? getRandomInt(100, 5000) : 0,
				retry_count: isSuccess ? 0 : getRandomInt(1, 3)
			}
		},
		generate_report: {
			action_specific: {
				report_type: params.type || 'automated',
				report_format: params.format || 'pdf',
				report_id: isSuccess ? `rpt_${Date.now()}` : null,
				file_size: isSuccess ? getRandomInt(100000, 2000000) : 0
			}
		},
		adjust_parameters: {
			action_specific: {
				parameter_name: params.parameter || 'scaling_threshold',
				old_value: params.oldValue || 70,
				new_value: params.newValue || 80,
				validation_passed: isSuccess
			}
		},
		escalate_issue: {
			action_specific: {
				escalation_level: params.level || 'level_2',
				assigned_to: params.assignee || 'ops_manager',
				ticket_id: isSuccess ? `inc_${Date.now()}` : null,
				notification_sent: isSuccess
			}
		}
	};

	// RDB automation_executions テーブル構造
	const execution = {
		// 基本実行情報
		id: executionId,
		action_type: actionType,
		status: isSuccess ? 'success' : getRandomFromArray(['failed', 'timeout', 'error']),
		start_time: startTime,
		end_time: endTime,
		duration_ms: Math.floor(executionTime),

		// 実行コンテキスト
		execution_context: {
			trigger_source: params.triggerSource || 'manual',
			workflow_id: params.workflowId || null,
			step_id: params.stepId || null,
			environment: 'production',
			executor_version: 'automation-engine-v2.1',
			execution_node: `worker-${getRandomInt(1, 10)}`
		},

		// パラメータ情報
		input_parameters: {
			provided_params: params,
			validated_params: params,
			default_params_used: Object.keys(params).length === 0,
			parameter_count: Object.keys(params).length
		},

		// 実行結果
		execution_result: {
			success: isSuccess,
			result_code: isSuccess
				? 'SUCCESS'
				: getRandomFromArray(['TIMEOUT', 'API_ERROR', 'VALIDATION_FAILED', 'SYSTEM_ERROR']),
			message: isSuccess
				? 'アクションが正常に実行されました'
				: 'アクション実行中にエラーが発生しました',
			output_data: isSuccess ? { status: 'completed' } : null,
			error_details: !isSuccess
				? {
						error_message: 'Execution failed due to system constraints',
						error_code: 'SYS_001',
						retry_possible: true
					}
				: null
		},

		// アクション固有の結果
		...actionResults[actionType],

		// リソース使用量
		resource_usage: {
			cpu_time_ms: getRandomInt(10, 1000),
			memory_peak_mb: getRandomInt(10, 200),
			network_io_bytes: getRandomInt(1000, 50000),
			disk_io_operations: getRandomInt(0, 100)
		},

		// ログ情報
		logs: [
			{ timestamp: startTime, level: 'INFO', message: `${actionType} execution started` },
			{
				timestamp: new Date(new Date(startTime).getTime() + executionTime / 2).toISOString(),
				level: 'INFO',
				message: 'Processing...'
			},
			{
				timestamp: endTime,
				level: isSuccess ? 'INFO' : 'ERROR',
				message: `${actionType} execution ${isSuccess ? 'completed successfully' : 'failed'}`
			}
		],

		// メタデータ
		metadata: {
			retry_count: !isSuccess && params.autoRetry ? getRandomInt(1, 3) : 0,
			max_retries: config.AUTOMATION.RETRY_POLICY.max_attempts,
			timeout_ms: config.AUTOMATION.EXECUTION_TIMEOUT,
			priority: params.priority || 'normal',
			tags: params.tags || []
		},

		created_at: startTime,
		updated_at: endTime
	};

	return Promise.resolve(execution);
}
