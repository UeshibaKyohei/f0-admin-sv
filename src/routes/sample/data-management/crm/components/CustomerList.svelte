<script>
	import { customerStore, dealStore, activityStore, crmActions } from '../stores/crmStore.js';
	import { toast } from '$lib/stores/toastStore.js';
	import { CRM_CONFIG } from '../config/settings.js';
	import CustomerLifecycle from './CustomerLifecycle.svelte';
	import ActivityTimeline from './ActivityTimeline.svelte';
	import ActivityRecorder from './ActivityRecorder.svelte';
	
	let searchQuery = $state('');
	let filterStatus = $state('all');
	let sortBy = $state('revenue');
	let selectedCustomer = $state(null);
	let showCustomerModal = $state(false);
	let activeTab = $state('overview');
	let showActivityRecorder = $state(false);
	let showSupportModal = $state(false);
	let supportTicket = $state({
		title: '',
		priority: 'medium',
		category: 'technical',
		description: ''
	});
	
	// 親コンポーネントへのコールバック関数を受け取る
	let { onSwitchToDeals } = $props();
	
	// フィルタリングとソート
	const filteredCustomers = $derived.by(() => {
		let customers = [...$customerStore];
		
		// 検索フィルター
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			customers = customers.filter(customer => 
				customer.companyName.toLowerCase().includes(query) ||
				customer.contactName.toLowerCase().includes(query)
			);
		}
		
		// ステータスフィルター
		if (filterStatus !== 'all') {
			customers = customers.filter(customer => customer.status === filterStatus);
		}
		
		// ソート（B2B営業版）
		customers.sort((a, b) => {
			switch(sortBy) {
				case 'revenue':
					return (b.contractValue || 0) - (a.contractValue || 0);
				case 'lastDeal':
					return new Date(b.lastDealDate || b.contractStartDate) - new Date(a.lastDealDate || a.contractStartDate);
				case 'relationship':
					const statusA = getRelationshipStatus(a);
					const statusB = getRelationshipStatus(b);
					return statusA.label.localeCompare(statusB.label, 'ja');
				default:
					return a.companyName.localeCompare(b.companyName, 'ja');
			}
		});
		
		return customers;
	});
	
	// 統計情報（B2B営業版）
	const stats = $derived.by(() => {
		const active = $customerStore.filter(c => c.status === 'active');
		const totalRevenue = active.reduce((sum, c) => sum + (c.contractValue || 0), 0);
		const avgDealSize = active.length > 0 ? totalRevenue / active.length : 0;
		
		// 過去90日以内に取引のあった顧客
		const recentlyActive = active.filter(c => {
			const lastDealDate = new Date(c.lastDealDate || c.contractStartDate);
			const daysSinceLastDeal = Math.floor((new Date() - lastDealDate) / (1000 * 60 * 60 * 24));
			return daysSinceLastDeal <= 90;
		}).length;
		
		// アップセル・クロスセルの機会（大口顧客）
		const upsellOpportunities = active.filter(c => 
			(c.contractValue || 0) >= CRM_CONFIG.THRESHOLDS.upsellMinValue
		).length;
		
		return {
			totalCustomers: active.length,
			totalRevenue,
			avgDealSize: Math.round(avgDealSize),
			recentlyActive,
			upsellOpportunities
		};
	});
	
	// 取引関係の評価（B2B営業版）—設定ファイルの闾値を使用
	function getRelationshipStatus(customer) {
		const daysSinceLastDeal = Math.floor(
			(new Date() - new Date(customer.lastDealDate || customer.contractStartDate)) / (1000 * 60 * 60 * 24)
		);
		
		const thresholds = CRM_CONFIG.BUSINESS_CONFIG.relationshipThresholds;
		const labels = CRM_CONFIG.LABELS.relationship;
		
		if (daysSinceLastDeal <= thresholds.active) return { color: 'text-success', label: labels.active };
		if (daysSinceLastDeal <= thresholds.normal) return { color: 'text-info', label: labels.normal };
		if (daysSinceLastDeal <= thresholds.warning) return { color: 'text-warning', label: labels.warning };
		return { color: 'text-error', label: labels.dormant };
	}
	
	// 最終取引からの日数
	function getDaysSinceLastDeal(date) {
		return Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
	}
	
	// 金額のフォーマット
	function formatCurrency(amount) {
		return new Intl.NumberFormat('ja-JP', {
			style: 'currency',
			currency: 'JPY',
			minimumFractionDigits: 0
		}).format(amount);
	}
	
	function showDetail(customer) {
		selectedCustomer = customer;
		showCustomerModal = true;
	}
	
	// 更新商談を開始
	function startRenewalDeal() {
		if (!selectedCustomer) return;
		
		// 新しい商談を作成
		const renewalDeal = {
			id: Date.now().toString(),
			companyName: selectedCustomer.companyName,
			contactName: selectedCustomer.contactName,
			contactEmail: selectedCustomer.contactEmail || '',
			contactPhone: '',
			customerId: selectedCustomer.id,
			stage: 'needs_analysis',
			status: 'open',
			value: selectedCustomer.contractValue, // 既存契約金額を基準
			probability: CRM_CONFIG.BUSINESS_CONFIG.renewalProbability, // 更新商談の初期確度
			expectedCloseDate: selectedCustomer.contractEndDate, // 契約終了日に合わせる
			assignedTo: selectedCustomer.accountManager,
			dealType: 'renewal', // 更新商談であることを示す
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			nextAction: '契約更新の意向確認と条件提示'
		};
		
		// 商談を追加
		dealStore.update(deals => [...deals, renewalDeal]);
		
		// アクティビティを記録
		crmActions.recordActivity({
			type: 'note',
			customerId: selectedCustomer.id,
			dealId: renewalDeal.id,
			contactName: selectedCustomer.contactName,
			companyName: selectedCustomer.companyName,
			description: CRM_CONFIG.MOCK_MODE ? '契約更新商談を開始しました' : '契約更新プロセスを開始',
		});
		
		// 成功メッセージ
		toast.success(CRM_CONFIG.MOCK_MODE ? '更新商談を作成しました！' : '商談を作成しました');
		
		// モーダルを閉じて商談管理タブに切り替え
		showCustomerModal = false;
		if (onSwitchToDeals) {
			onSwitchToDeals();
		}
	}
	
	// サポートチケット作成
	function createSupportTicket() {
		if (!selectedCustomer) return;
		
		// サポートチケットデータを顧客情報で初期化
		supportTicket = {
			title: `${selectedCustomer.companyName}様からのお問い合わせ`,
			priority: 'medium',
			category: 'technical',
			description: `顧客: ${selectedCustomer.companyName}\n担当者: ${selectedCustomer.contactName}\n契約プラン: プレミアム\n\n【お問い合わせ内容】\n`
		};
		
		showSupportModal = true;
	}
	
	// サポートチケット送信
	function submitSupportTicket() {
		// 実際のシステムではAPIに送信
		// ここではアクティビティとして記録
		crmActions.recordActivity({
			type: 'support',
			customerId: selectedCustomer.id,
			contactName: selectedCustomer.contactName,
			companyName: selectedCustomer.companyName,
			description: `サポートチケット作成: ${supportTicket.title}\n優先度: ${supportTicket.priority}\nカテゴリ: ${supportTicket.category}\n\n${supportTicket.description}`,
		});
		
		toast.success('サポートチケットを作成しました');
		
		showSupportModal = false;
		supportTicket = {
			title: '',
			priority: 'medium',
			category: 'technical',
			description: ''
		};
	}
	
	// 活動記録
	function recordActivity() {
		showActivityRecorder = true;
	}
</script>

<div class="space-y-6 w-full max-w-full overflow-hidden">
	<!-- 統計カード（B2B営業版） -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<div class="stat bg-base-200 rounded-lg">
			<div class="stat-title">{CRM_CONFIG.LABELS.stats.totalCustomers.replace('顧客数', 'アクティブ顧客')}</div>
			<div class="stat-value">{stats.totalCustomers}</div>
			<div class="stat-desc">社</div>
		</div>
		<div class="stat bg-base-200 rounded-lg">
			<div class="stat-title">{CRM_CONFIG.LABELS.stats.totalRevenue}</div>
			<div class="stat-value text-lg">{formatCurrency(stats.totalRevenue)}</div>
			<div class="stat-desc">累計売上</div>
		</div>
		<div class="stat bg-base-200 rounded-lg">
			<div class="stat-title">{CRM_CONFIG.LABELS.stats.avgDealSize}</div>
			<div class="stat-value">{formatCurrency(stats.avgDealSize)}</div>
			<div class="stat-desc">/ 件</div>
		</div>
		<div class="stat bg-base-200 rounded-lg">
			<div class="stat-title">{CRM_CONFIG.LABELS.stats.upsellOpportunities}</div>
			<div class="stat-value text-success">{stats.upsellOpportunities}</div>
			<div class="stat-desc">大口顧客</div>
		</div>
	</div>
	
	<!-- フィルターバー -->
	<div class="flex flex-wrap gap-4 items-center">
		<div class="form-control flex-1 min-w-0">
			<input 
				type="text" 
				placeholder="会社名、担当者名で検索..." 
				class="input input-bordered w-full"
				bind:value={searchQuery}
			/>
		</div>
		
		<select class="select select-bordered" bind:value={filterStatus}>
			<option value="all">全てのステータス</option>
			<option value="active">アクティブ</option>
			<option value="churned">解約済み</option>
			<option value="pending">保留中</option>
		</select>
		
		<select class="select select-bordered" bind:value={sortBy}>
			<option value="revenue">契約金額順</option>
			<option value="lastDeal">最終取引日順</option>
			<option value="relationship">取引関係順</option>
			<option value="name">会社名順</option>
		</select>
	</div>
	
	<!-- 顧客一覧 -->
	<div class="overflow-x-auto">
		<table class="table table-zebra w-full">
			<thead>
				<tr>
					<th>会社名</th>
					<th>担当者</th>
					<th>契約金額</th>
					<th>取引関係</th>
					<th>最終取引日</th>
					<th>案件数</th>
					<th>担当営業</th>
					<th>アクション</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredCustomers as customer}
					{@const relationship = getRelationshipStatus(customer)}
					<tr class="hover">
						<td>
							<div>
								<div class="font-bold">{customer.companyName}</div>
								<div class="text-sm opacity-50">{customer.industry}</div>
							</div>
						</td>
						<td>{customer.contactName}</td>
						<td class="font-bold">{formatCurrency(customer.contractValue || 0)}</td>
						<td>
							<div class="flex items-center gap-2">
								<span class="badge badge-sm {relationship.color === 'text-success' ? 'badge-success' : 
									relationship.color === 'text-info' ? 'badge-info' : 
									relationship.color === 'text-warning' ? 'badge-warning' : 'badge-error'}">
									{relationship.label}
								</span>
							</div>
						</td>
						<td>
							<div class="text-sm">
								{new Date(customer.lastDealDate || customer.contractStartDate).toLocaleDateString('ja-JP')}
								<div class="text-xs opacity-50">
									({getDaysSinceLastDeal(customer.lastDealDate || customer.contractStartDate)}日前)
								</div>
							</div>
						</td>
						<td>
							<div class="text-center">
								<span class="badge badge-neutral">{customer.totalDeals || 1}</span>
								<div class="text-xs opacity-50">件</div>
							</div>
						</td>
						<td>{customer.accountManager}</td>
						<td>
							<button 
								class="btn btn-ghost btn-xs"
								onclick={() => showDetail(customer)}
							>
								{CRM_CONFIG.LABELS.actions.showDetail}
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<!-- 顧客詳細モーダル -->
{#if selectedCustomer}
<input type="checkbox" id="customer-modal" class="modal-toggle" bind:checked={showCustomerModal} />
<div class="modal">
	<div class="modal-box w-11/12 max-w-5xl">
		<h3 class="font-bold text-lg mb-4">{selectedCustomer.companyName}</h3>
		
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- 基本情報 -->
			<div class="space-y-4">
				<div class="card bg-base-200">
					<div class="card-body">
						<h4 class="card-title text-sm">取引情報</h4>
						<dl class="space-y-2">
							<div>
								<dt class="text-sm opacity-70">累計契約金額</dt>
								<dd class="font-bold text-lg">{formatCurrency(selectedCustomer.contractValue || 0)}</dd>
							</div>
							<div>
								<dt class="text-sm opacity-70">総案件数</dt>
								<dd>{selectedCustomer.totalDeals || 1}件</dd>
							</div>
							<div>
								<dt class="text-sm opacity-70">最終取引日</dt>
								<dd>
									{new Date(selectedCustomer.lastDealDate || selectedCustomer.contractStartDate).toLocaleDateString('ja-JP')}
									({getDaysSinceLastDeal(selectedCustomer.lastDealDate || selectedCustomer.contractStartDate)}日前)
								</dd>
							</div>
							<div>
								<dt class="text-sm opacity-70">初回契約日</dt>
								<dd>
									{new Date(selectedCustomer.contractStartDate).toLocaleDateString('ja-JP')}
								</dd>
							</div>
						</dl>
					</div>
				</div>
				
				<!-- 担当者情報 -->
				<div class="card bg-base-200">
					<div class="card-body">
						<h4 class="card-title text-sm">担当者</h4>
						<p>{selectedCustomer.contactName}</p>
						<p class="text-sm opacity-70">{selectedCustomer.contactEmail}</p>
						<div class="divider"></div>
						<p class="text-sm">担当CS: {selectedCustomer.accountManager}</p>
					</div>
				</div>
			</div>
			
			<!-- 取引関係評価 -->
			<div class="card bg-base-200">
				<div class="card-body">
					<h4 class="card-title text-sm">取引関係評価</h4>
					{#if selectedCustomer}
						{@const relationship = getRelationshipStatus(selectedCustomer)}
						<div class="flex justify-center mb-4">
							<div class="radial-progress {relationship.color === 'text-success' ? 'text-success' : 
								relationship.color === 'text-info' ? 'text-info' : 
								relationship.color === 'text-warning' ? 'text-warning' : 'text-error'}" 
								 style="--value:{relationship.label === '活発' ? 100 : relationship.label === '通常' ? 75 : relationship.label === '要注意' ? 50 : 25}; --size:8rem;">
								<div>
									<div class="text-lg font-bold">{relationship.label}</div>
								</div>
							</div>
						</div>
						<div class="space-y-2">
							<div>
								<div class="flex justify-between text-sm">
									<span>取引頻度</span>
									<span>{relationship.label === '活発' ? '高' : relationship.label === '通常' ? '中' : '低'}</span>
								</div>
								<progress class="progress progress-primary" 
									value={relationship.label === '活発' ? 90 : relationship.label === '通常' ? 60 : relationship.label === '要注意' ? 30 : 10} 
									max="100"></progress>
							</div>
							<div>
								<div class="flex justify-between text-sm">
									<span>案件規模</span>
									<span>{(selectedCustomer.contractValue || 0) >= 1000000 ? '大' : (selectedCustomer.contractValue || 0) >= 500000 ? '中' : '小'}</span>
								</div>
								<progress class="progress progress-primary" 
									value={(selectedCustomer.contractValue || 0) >= 1000000 ? 85 : (selectedCustomer.contractValue || 0) >= 500000 ? 60 : 35} 
									max="100"></progress>
							</div>
							<div>
								<div class="flex justify-between text-sm">
									<span>継続期間</span>
									<span>{Math.floor((new Date() - new Date(selectedCustomer.contractStartDate)) / (1000 * 60 * 60 * 24 * 365))}年</span>
								</div>
								<progress class="progress progress-primary" 
									value={Math.min(Math.floor((new Date() - new Date(selectedCustomer.contractStartDate)) / (1000 * 60 * 60 * 24 * 365)) * 20, 100)} 
									max="100"></progress>
							</div>
						</div>
					{/if}
				</div>
			</div>
			
			<!-- アクションプラン -->
			<div class="space-y-4">
				<div class="card bg-base-200">
					<div class="card-body">
						<h4 class="card-title text-sm">推奨アクション</h4>
						{#if selectedCustomer}
							{@const daysSinceLastDeal = getDaysSinceLastDeal(selectedCustomer.lastDealDate || selectedCustomer.contractStartDate)}
							<div class="space-y-2">
							{#if daysSinceLastDeal > 180}
								<div class="alert alert-error">
									<svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
									</svg>
									<span class="text-sm">休眠顧客：再アプローチが必要です</span>
								</div>
								<button 
									class="btn btn-primary btn-sm w-full"
									onclick={startRenewalDeal}
								>
									再活性化商談を開始
								</button>
							{:else if daysSinceLastDeal > 90}
								<div class="alert alert-warning">
									<svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
									</svg>
									<span class="text-sm">要注意：フォローアップが必要です</span>
								</div>
								<button 
									class="btn btn-secondary btn-sm w-full"
									onclick={startRenewalDeal}
								>
									フォローアップ商談を開始
								</button>
							{:else}
								<div class="alert alert-success">
									<svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
									</svg>
									<span class="text-sm">良好：アップセル機会を検討</span>
								</div>
								<button 
									class="btn btn-success btn-sm w-full"
									onclick={startRenewalDeal}
								>
									アップセル商談を開始
								</button>
							{/if}
							</div>
						{/if}
					</div>
				</div>
				
				<div class="card bg-base-200">
					<div class="card-body">
						<h4 class="card-title text-sm">取引概要</h4>
						<div class="text-sm space-y-1">
							<p>業界: {selectedCustomer.industry || '情報・通信業'}</p>
							<p>従業員規模: {selectedCustomer.employeeCount || '50-100名'}</p>
							<p>年商: {formatCurrency((selectedCustomer.contractValue || 0) * 10)}</p>
							<p>決裁者: {selectedCustomer.decisionMaker || selectedCustomer.contactName}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		
		<div class="modal-action">
			<button 
				class="btn btn-primary"
				onclick={createSupportTicket}
			>
				{CRM_CONFIG.LABELS.actions.createSupport}
			</button>
			<button 
				class="btn btn-outline"
				onclick={recordActivity}
			>
				{CRM_CONFIG.LABELS.actions.recordActivity}
			</button>
			<button class="btn" onclick={() => showCustomerModal = false}>閉じる</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={() => showCustomerModal = false}>close</button>
	</form>
</div>
{/if}

<!-- サポートチケット作成モーダル -->
<input type="checkbox" id="support-modal" class="modal-toggle" bind:checked={showSupportModal} />
<div class="modal">
	<div class="modal-box w-11/12 max-w-2xl">
		<h3 class="font-bold text-lg mb-4">サポートチケット作成</h3>
		
		<div class="space-y-4">
			<!-- タイトル -->
			<div class="form-control">
				<label class="label">
					<span class="label-text">件名</span>
				</label>
				<input 
					type="text" 
					class="input input-bordered"
					bind:value={supportTicket.title}
					placeholder="お問い合わせの件名を入力してください"
				/>
			</div>
			
			<!-- 優先度 -->
			<div class="form-control">
				<label class="label">
					<span class="label-text">優先度</span>
				</label>
				<select class="select select-bordered" bind:value={supportTicket.priority}>
					<option value="low">低</option>
					<option value="medium">中</option>
					<option value="high">高</option>
					<option value="urgent">緊急</option>
				</select>
			</div>
			
			<!-- カテゴリ -->
			<div class="form-control">
				<label class="label">
					<span class="label-text">カテゴリ</span>
				</label>
				<select class="select select-bordered" bind:value={supportTicket.category}>
					<option value="technical">技術的問題</option>
					<option value="billing">請求・支払い</option>
					<option value="feature">機能要望</option>
					<option value="training">使い方・研修</option>
					<option value="bug">バグ報告</option>
					<option value="other">その他</option>
				</select>
			</div>
			
			<!-- 詳細 -->
			<div class="form-control">
				<label class="label">
					<span class="label-text">詳細内容</span>
				</label>
				<textarea 
					class="textarea textarea-bordered h-32"
					bind:value={supportTicket.description}
					placeholder="詳細な内容をご記入ください"
				></textarea>
			</div>
		</div>
		
		<div class="modal-action">
			<button 
				class="btn btn-primary"
				onclick={submitSupportTicket}
				disabled={!supportTicket.title.trim() || !supportTicket.description.trim()}
			>
				チケットを作成
			</button>
			<button class="btn" onclick={() => showSupportModal = false}>キャンセル</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={() => showSupportModal = false}>close</button>
	</form>
</div>

<!-- 活動記録モーダル -->
{#if showActivityRecorder && selectedCustomer}
	<ActivityRecorder
		customerId={selectedCustomer.id}
		companyName={selectedCustomer.companyName}
		contactName={selectedCustomer.contactName}
		onClose={() => showActivityRecorder = false}
	/>
{/if}