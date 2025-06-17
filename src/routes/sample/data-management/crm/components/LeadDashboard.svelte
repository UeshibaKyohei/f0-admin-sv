<script>
	import { leadStore, scoredLeads, crmActions } from '../stores/crmStore.js';
	import { onMount } from 'svelte';
	import BusinessCardScanner from './BusinessCardScanner.svelte';
	import EmailComposer from './EmailComposer.svelte';
	
	let searchQuery = $state('');
	let filterSource = $state('all');
	let filterStatus = $state('all');
	let sortBy = $state('createdAt');
	let showLeadDetail = $state(false);
	let selectedLead = $state(null);
	let showEmailComposer = $state(false);
	
	// フィルタリングとソート
	const filteredLeads = $derived.by(() => {
		let leads = [...$scoredLeads];
		
		// 検索フィルター
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			leads = leads.filter(lead => 
				lead.name.toLowerCase().includes(query) ||
				lead.companyName.toLowerCase().includes(query) ||
				lead.email.toLowerCase().includes(query)
			);
		}
		
		// ソースフィルター
		if (filterSource !== 'all') {
			leads = leads.filter(lead => lead.source === filterSource);
		}
		
		// ステータスフィルター
		if (filterStatus !== 'all') {
			leads = leads.filter(lead => lead.status === filterStatus);
		}
		
		// ソート
		leads.sort((a, b) => {
			switch(sortBy) {
				case 'score':
					return b.score - a.score;
				case 'name':
					return a.name.localeCompare(b.name, 'ja');
				case 'company':
					return a.companyName.localeCompare(b.companyName, 'ja');
				default:
					return new Date(b.createdAt) - new Date(a.createdAt);
			}
		});
		
		return leads;
	});
	
	// リード詳細を表示
	function viewLeadDetail(lead) {
		selectedLead = lead;
		showLeadDetail = true;
	}
	
	// スコアに応じた色を返す
	function getScoreColor(score) {
		if (score >= 80) return 'badge-success';
		if (score >= 60) return 'badge-warning';
		if (score >= 40) return 'badge-info';
		return 'badge-ghost';
	}
	
	// ステータスに応じた色を返す
	function getStatusColor(status) {
		switch(status) {
			case 'new': return 'badge-primary';
			case 'contacted': return 'badge-info';
			case 'qualified': return 'badge-success';
			case 'unqualified': return 'badge-error';
			default: return 'badge-ghost';
		}
	}
</script>

<div class="space-y-4">
	<!-- アクションバー -->
	<div class="flex justify-between items-center mb-4">
		<h2 class="text-xl font-bold">リード管理</h2>
		<div class="flex gap-2">
			<BusinessCardScanner />
			<button class="btn btn-outline gap-2">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
				</svg>
				CSVインポート
			</button>
		</div>
	</div>
	
	<!-- フィルターバー -->
	<div class="flex flex-wrap gap-4 items-center">
		<div class="form-control flex-1 min-w-[200px]">
			<input 
				type="text" 
				placeholder="名前、会社名、メールで検索..." 
				class="input input-bordered"
				bind:value={searchQuery}
			/>
		</div>
		
		<select class="select select-bordered" bind:value={filterSource}>
			<option value="all">全てのソース</option>
			<option value="展示会">展示会</option>
			<option value="Webサイト">Webサイト</option>
			<option value="紹介">紹介</option>
			<option value="セミナー">セミナー</option>
		</select>
		
		<select class="select select-bordered" bind:value={filterStatus}>
			<option value="all">全てのステータス</option>
			<option value="new">新規</option>
			<option value="contacted">連絡済み</option>
			<option value="qualified">見込みあり</option>
			<option value="unqualified">見込みなし</option>
		</select>
		
		<select class="select select-bordered" bind:value={sortBy}>
			<option value="createdAt">登録日順</option>
			<option value="score">スコア順</option>
			<option value="name">名前順</option>
			<option value="company">会社名順</option>
		</select>
	</div>
	
	<!-- リード一覧 -->
	<div class="overflow-x-auto">
		<table class="table table-zebra">
			<thead>
				<tr>
					<th>スコア</th>
					<th>担当者</th>
					<th>会社名</th>
					<th>ソース</th>
					<th>ステータス</th>
					<th>登録日</th>
					<th>アクション</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredLeads.slice(0, 20) as lead}
					<tr class="hover">
						<td>
							<div class={`badge ${getScoreColor(lead.score)}`}>
								{lead.score}
							</div>
						</td>
						<td>
							<div>
								<div class="font-bold">{lead.name}</div>
								<div class="text-sm opacity-50">{lead.position}</div>
							</div>
						</td>
						<td>
							<div>
								<div>{lead.companyName}</div>
								<div class="text-sm opacity-50">{lead.industry}</div>
							</div>
						</td>
						<td>
							<div class="badge badge-outline">{lead.source}</div>
						</td>
						<td>
							<div class={`badge ${getStatusColor(lead.status)}`}>
								{lead.status === 'new' ? '新規' :
								 lead.status === 'contacted' ? '連絡済み' :
								 lead.status === 'qualified' ? '見込みあり' : '見込みなし'}
							</div>
						</td>
						<td>
							<div class="text-sm">
								{new Date(lead.createdAt).toLocaleDateString('ja-JP')}
							</div>
						</td>
						<td>
							<div class="flex gap-2">
								<button 
									class="btn btn-ghost btn-xs"
									onclick={() => viewLeadDetail(lead)}
								>
									詳細
								</button>
								<button class="btn btn-primary btn-xs">
									商談化
								</button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	
	<!-- ページネーション -->
	<div class="flex justify-center">
		<div class="join">
			<button class="join-item btn btn-sm">«</button>
			<button class="join-item btn btn-sm btn-active">1</button>
			<button class="join-item btn btn-sm">2</button>
			<button class="join-item btn btn-sm">3</button>
			<button class="join-item btn btn-sm">»</button>
		</div>
	</div>
</div>

<!-- リード詳細モーダル -->
{#if selectedLead}
<input type="checkbox" id="lead-detail-modal" class="modal-toggle" bind:checked={showLeadDetail} />
<div class="modal">
	<div class="modal-box max-w-3xl">
		<h3 class="font-bold text-lg mb-4">リード詳細</h3>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<h4 class="font-semibold mb-2">基本情報</h4>
				<dl class="space-y-2">
					<div>
						<dt class="text-sm opacity-70">担当者名</dt>
						<dd class="font-medium">{selectedLead.name}</dd>
					</div>
					<div>
						<dt class="text-sm opacity-70">役職</dt>
						<dd>{selectedLead.position}</dd>
					</div>
					<div>
						<dt class="text-sm opacity-70">メール</dt>
						<dd>{selectedLead.email}</dd>
					</div>
					<div>
						<dt class="text-sm opacity-70">電話番号</dt>
						<dd>{selectedLead.phone}</dd>
					</div>
				</dl>
			</div>
			
			<div>
				<h4 class="font-semibold mb-2">企業情報</h4>
				<dl class="space-y-2">
					<div>
						<dt class="text-sm opacity-70">会社名</dt>
						<dd class="font-medium">{selectedLead.companyName}</dd>
					</div>
					<div>
						<dt class="text-sm opacity-70">業界</dt>
						<dd>{selectedLead.industry}</dd>
					</div>
					<div>
						<dt class="text-sm opacity-70">企業規模</dt>
						<dd>{selectedLead.companySize}</dd>
					</div>
					<div>
						<dt class="text-sm opacity-70">リードソース</dt>
						<dd>{selectedLead.source}</dd>
					</div>
				</dl>
			</div>
		</div>
		
		<div class="divider"></div>
		
		<!-- アクションボタン -->
		<div class="flex gap-2">
			<button class="btn btn-primary">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
				</svg>
				メール送信
			</button>
			<button class="btn btn-outline">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
				</svg>
				電話
			</button>
			<button class="btn btn-outline">活動記録</button>
		</div>
		
		<div class="modal-action">
			<button class="btn" onclick={() => showLeadDetail = false}>閉じる</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={() => showLeadDetail = false}>close</button>
	</form>
</div>
{/if}