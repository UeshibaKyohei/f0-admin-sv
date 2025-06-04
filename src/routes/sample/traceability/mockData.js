/**
 * 工場トレーサビリティシステム モックデータ
 *
 * データベーステーブル構造：
 *
 * 1. batches - 製造バッチ（ロット）管理
 *    - 製造単位の基本情報を管理
 *    - 顧客注文と紐付け、優先度管理
 *    - ステータス遷移: pending → in_progress → completed
 *
 * 2. process_steps - 工程マスタ
 *    - 製品ごとの標準工程定義
 *    - 部門、設備、標準時間を管理
 *    - 品質チェックポイントの定義
 *
 * 3. batch_progress - バッチ別工程進捗
 *    - リアルタイムの進捗状況
 *    - 作業者、実績時間の記録
 *    - 各工程の開始・終了時刻
 *
 * 4. alerts - 異常・アラート管理
 *    - システム検知/手動登録の異常
 *    - 重要度による分類（critical/warning/info）
 *    - 解決状況と対応履歴
 *
 * 5. work_logs - 作業ログ
 *    - 全作業の監査証跡
 *    - 開始、終了、品質チェック等のイベント記録
 *    - コメントや特記事項の保存
 */

/**
 * バッチデータ（batches テーブル）
 * 製造ロットの基本情報。実際の運用では注文管理システムと連携
 */
export const batches = [
	{
		id: 'BATCH-2025-001',
		productName: '精密部品A-100',
		quantity: 1000,
		startDate: '2025-01-29T08:00:00',
		expectedEndDate: '2025-01-30T18:00:00',
		actualEndDate: null,
		status: 'in_progress',
		priority: 'high',
		customer: '株式会社テックコーポレーション',
		orderNumber: 'ORD-2025-0142'
	},
	{
		id: 'BATCH-2025-002',
		productName: '電子基板B-200',
		quantity: 500,
		startDate: '2025-01-28T09:00:00',
		expectedEndDate: '2025-01-29T17:00:00',
		actualEndDate: '2025-01-29T16:30:00',
		status: 'completed',
		priority: 'normal',
		customer: 'エレクトロニクス株式会社',
		orderNumber: 'ORD-2025-0141'
	},
	{
		id: 'BATCH-2025-003',
		productName: '樹脂成形品C-300',
		quantity: 2000,
		startDate: '2025-01-30T07:00:00',
		expectedEndDate: '2025-01-31T20:00:00',
		actualEndDate: null,
		status: 'pending',
		priority: 'low',
		customer: 'プラスチック工業株式会社',
		orderNumber: 'ORD-2025-0143'
	}
];

/**
 * 工程マスタ（process_steps テーブル）
 * 製品ごとの標準工程を定義。実際は製品ID毎に異なる工程を持つ
 */
export const processSteps = [
	{ id: 'step1', name: '原材料受入', duration: 30, department: '資材部' },
	{ id: 'step2', name: '品質検査（受入）', duration: 45, department: '品質管理部' },
	{ id: 'step3', name: '加工準備', duration: 60, department: '製造部' },
	{ id: 'step4', name: '主要加工', duration: 180, department: '製造部' },
	{ id: 'step5', name: '仕上げ加工', duration: 120, department: '製造部' },
	{ id: 'step6', name: '品質検査（中間）', duration: 60, department: '品質管理部' },
	{ id: 'step7', name: '表面処理', duration: 90, department: '製造部' },
	{ id: 'step8', name: '最終検査', duration: 45, department: '品質管理部' },
	{ id: 'step9', name: '梱包', duration: 30, department: '出荷部' },
	{ id: 'step10', name: '出荷準備', duration: 15, department: '出荷部' }
];

/**
 * バッチ進捗データ（batch_progress テーブル）
 * 各バッチの工程別進捗状況。リアルタイムで更新される
 */
export const batchProgress = [
	{
		batchId: 'BATCH-2025-001',
		currentStep: 'step6',
		progress: [
			{
				stepId: 'step1',
				status: 'completed',
				startTime: '2025-01-29T08:00:00',
				endTime: '2025-01-29T08:30:00',
				operator: '山田太郎'
			},
			{
				stepId: 'step2',
				status: 'completed',
				startTime: '2025-01-29T08:30:00',
				endTime: '2025-01-29T09:15:00',
				operator: '鈴木花子'
			},
			{
				stepId: 'step3',
				status: 'completed',
				startTime: '2025-01-29T09:15:00',
				endTime: '2025-01-29T10:15:00',
				operator: '田中一郎'
			},
			{
				stepId: 'step4',
				status: 'completed',
				startTime: '2025-01-29T10:15:00',
				endTime: '2025-01-29T13:15:00',
				operator: '佐藤二郎'
			},
			{
				stepId: 'step5',
				status: 'completed',
				startTime: '2025-01-29T13:45:00',
				endTime: '2025-01-29T15:45:00',
				operator: '高橋三郎'
			},
			{
				stepId: 'step6',
				status: 'in_progress',
				startTime: '2025-01-29T15:45:00',
				endTime: null,
				operator: '伊藤四郎',
				progress: 65
			},
			{ stepId: 'step7', status: 'pending', startTime: null, endTime: null, operator: null },
			{ stepId: 'step8', status: 'pending', startTime: null, endTime: null, operator: null },
			{ stepId: 'step9', status: 'pending', startTime: null, endTime: null, operator: null },
			{ stepId: 'step10', status: 'pending', startTime: null, endTime: null, operator: null }
		]
	},
	{
		batchId: 'BATCH-2025-002',
		currentStep: 'completed',
		progress: [
			{
				stepId: 'step1',
				status: 'completed',
				startTime: '2025-01-28T09:00:00',
				endTime: '2025-01-28T09:30:00',
				operator: '山田太郎'
			},
			{
				stepId: 'step2',
				status: 'completed',
				startTime: '2025-01-28T09:30:00',
				endTime: '2025-01-28T10:15:00',
				operator: '鈴木花子'
			},
			{
				stepId: 'step3',
				status: 'completed',
				startTime: '2025-01-28T10:15:00',
				endTime: '2025-01-28T11:15:00',
				operator: '田中一郎'
			},
			{
				stepId: 'step4',
				status: 'completed',
				startTime: '2025-01-28T11:15:00',
				endTime: '2025-01-28T14:15:00',
				operator: '佐藤二郎'
			},
			{
				stepId: 'step5',
				status: 'completed',
				startTime: '2025-01-28T14:30:00',
				endTime: '2025-01-28T16:30:00',
				operator: '高橋三郎'
			},
			{
				stepId: 'step6',
				status: 'completed',
				startTime: '2025-01-28T16:30:00',
				endTime: '2025-01-28T17:30:00',
				operator: '伊藤四郎'
			},
			{
				stepId: 'step7',
				status: 'completed',
				startTime: '2025-01-29T08:00:00',
				endTime: '2025-01-29T09:30:00',
				operator: '渡辺五郎'
			},
			{
				stepId: 'step8',
				status: 'completed',
				startTime: '2025-01-29T09:30:00',
				endTime: '2025-01-29T10:15:00',
				operator: '小林六郎'
			},
			{
				stepId: 'step9',
				status: 'completed',
				startTime: '2025-01-29T10:15:00',
				endTime: '2025-01-29T10:45:00',
				operator: '加藤七郎'
			},
			{
				stepId: 'step10',
				status: 'completed',
				startTime: '2025-01-29T10:45:00',
				endTime: '2025-01-29T11:00:00',
				operator: '木村八郎'
			}
		]
	}
];

/**
 * 異常・アラートデータ（alerts テーブル）
 * システム検知および手動登録の異常情報。品質管理の重要データ
 */
export const anomalies = [
	{
		id: 'ANOM-001',
		batchId: 'BATCH-2025-001',
		stepId: 'step4',
		timestamp: '2025-01-29T12:30:00',
		type: 'temperature',
		severity: 'warning',
		description: '加工温度が規定値を5%超過',
		value: 105,
		threshold: 100,
		unit: '℃',
		resolved: true,
		resolvedBy: '佐藤二郎',
		resolvedAt: '2025-01-29T12:35:00',
		action: '冷却システムの調整により正常化'
	},
	{
		id: 'ANOM-002',
		batchId: 'BATCH-2025-001',
		stepId: 'step6',
		timestamp: '2025-01-29T16:00:00',
		type: 'dimension',
		severity: 'critical',
		description: '寸法誤差が許容範囲を超過',
		value: 0.15,
		threshold: 0.1,
		unit: 'mm',
		resolved: false,
		resolvedBy: null,
		resolvedAt: null,
		action: null
	}
];

/**
 * 作業ログデータ（work_logs テーブル）
 * 全作業の監査証跡。コメント、問題対応、品質チェック結果を記録
 */
export const workLogs = [
	{
		id: 'LOG-001',
		batchId: 'BATCH-2025-001',
		stepId: 'step3',
		timestamp: '2025-01-29T09:30:00',
		type: 'comment',
		operator: '田中一郎',
		content: '治具の調整完了。標準より5分短縮できました。'
	},
	{
		id: 'LOG-002',
		batchId: 'BATCH-2025-001',
		stepId: 'step4',
		timestamp: '2025-01-29T12:35:00',
		type: 'issue',
		operator: '佐藤二郎',
		content: '温度異常を検知。冷却システムを調整し正常化を確認。'
	},
	{
		id: 'LOG-003',
		batchId: 'BATCH-2025-002',
		stepId: 'step7',
		timestamp: '2025-01-29T08:45:00',
		type: 'quality',
		operator: '渡辺五郎',
		content: '表面処理の仕上がりが特に良好。客先要求を十分満たす品質。'
	}
];

/**
 * 機器データ（equipment_status ビュー）
 * IoTセンサーからのリアルタイムデータ。別システムとの連携を想定
 */
export const equipmentData = [
	{
		equipmentId: 'MACHINE-001',
		name: 'CNC加工機A',
		currentBatch: 'BATCH-2025-001',
		status: 'running',
		metrics: {
			temperature: { value: 98, unit: '℃', normal: true },
			pressure: { value: 2.1, unit: 'MPa', normal: true },
			vibration: { value: 0.05, unit: 'mm/s', normal: true },
			utilization: { value: 85, unit: '%', normal: true }
		},
		lastMaintenance: '2025-01-15T10:00:00',
		nextMaintenance: '2025-02-15T10:00:00'
	},
	{
		equipmentId: 'MACHINE-002',
		name: '検査装置B',
		currentBatch: 'BATCH-2025-001',
		status: 'running',
		metrics: {
			accuracy: { value: 99.8, unit: '%', normal: true },
			scanSpeed: { value: 120, unit: 'pcs/min', normal: true },
			errorRate: { value: 0.2, unit: '%', normal: true }
		},
		lastMaintenance: '2025-01-20T14:00:00',
		nextMaintenance: '2025-02-20T14:00:00'
	}
];

/**
 * プロセスフロー定義（process_flow_master テーブル）
 * サンキーダイアグラムや工程フロー図で使用。歩留まり分析に活用
 */
export const processFlow = {
	nodes: [
		{ id: 'raw_material', name: '原材料', type: 'input' },
		{ id: 'inspection_in', name: '受入検査', type: 'process' },
		{ id: 'processing', name: '加工工程', type: 'process' },
		{ id: 'inspection_mid', name: '中間検査', type: 'process' },
		{ id: 'surface_treatment', name: '表面処理', type: 'process' },
		{ id: 'inspection_final', name: '最終検査', type: 'process' },
		{ id: 'packaging', name: '梱包', type: 'process' },
		{ id: 'shipment', name: '出荷', type: 'output' },
		{ id: 'defect', name: '不良品', type: 'output' },
		{ id: 'rework', name: '再加工', type: 'process' }
	],
	links: [
		{ source: 'raw_material', target: 'inspection_in', value: 1000 },
		{ source: 'inspection_in', target: 'processing', value: 995 },
		{ source: 'inspection_in', target: 'defect', value: 5 },
		{ source: 'processing', target: 'inspection_mid', value: 995 },
		{ source: 'inspection_mid', target: 'surface_treatment', value: 985 },
		{ source: 'inspection_mid', target: 'rework', value: 10 },
		{ source: 'rework', target: 'inspection_mid', value: 10 },
		{ source: 'surface_treatment', target: 'inspection_final', value: 985 },
		{ source: 'inspection_final', target: 'packaging', value: 980 },
		{ source: 'inspection_final', target: 'defect', value: 5 },
		{ source: 'packaging', target: 'shipment', value: 980 }
	]
};

/**
 * ステータス定義（status_master テーブル）
 * システム全体で使用するステータスの統一定義
 */
export const statusDefinitions = {
	pending: { label: '待機中', color: 'neutral', icon: 'clock' },
	in_progress: { label: '進行中', color: 'info', icon: 'play' },
	completed: { label: '完了', color: 'success', icon: 'check' },
	warning: { label: '警告', color: 'warning', icon: 'alert-triangle' },
	error: { label: 'エラー', color: 'error', icon: 'x-circle' },
	paused: { label: '一時停止', color: 'neutral', icon: 'pause' }
};
