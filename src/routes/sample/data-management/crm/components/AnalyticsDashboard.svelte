<script>
	import { leadStore, dealStore, customerStore, dealStats } from '../stores/crmStore.js';
	
	// 売上予測の計算
	const salesForecast = $derived.by(() => {
		const openDeals = $dealStore.filter(d => d.status === 'open');
		const forecast = {};
		
		// 今後3ヶ月の予測
		for (let i = 0; i < 3; i++) {
			const month = new Date();
			month.setMonth(month.getMonth() + i);
			const monthKey = month.toISOString().slice(0, 7);
			
			forecast[monthKey] = openDeals
				.filter(deal => {
					const closeDate = new Date(deal.expectedCloseDate);
					return closeDate.toISOString().slice(0, 7) === monthKey;
				})
				.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);
		}
		
		return forecast;
	});
	
	// ファネル分析
	const funnelData = $derived.by(() => {
		const totalLeads = $leadStore.length;
		const qualifiedLeads = $leadStore.filter(l => l.status === 'qualified').length;
		const openDeals = $dealStore.filter(d => d.status === 'open').length;
		const wonDeals = $dealStore.filter(d => d.status === 'closed_won').length;
		
		return [
			{ stage: '全リード', count: totalLeads, percentage: 100 },
			{ stage: '適格リード', count: qualifiedLeads, percentage: totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0 },
			{ stage: '商談', count: openDeals + wonDeals, percentage: totalLeads > 0 ? ((openDeals + wonDeals) / totalLeads) * 100 : 0 },
			{ stage: '成約', count: wonDeals, percentage: totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0 }
		];
	});
	
	// リードソース別分析
	const leadSourceAnalysis = $derived.by(() => {
		const sourceData = {};
		
		$leadStore.forEach(lead => {
			if (!sourceData[lead.source]) {
				sourceData[lead.source] = {
					leads: 0,
					qualified: 0,
					deals: 0,
					won: 0,
					revenue: 0
				};
			}
			sourceData[lead.source].leads++;
			
			if (lead.status === 'qualified') {
				sourceData[lead.source].qualified++;
			}
		});
		
		// 商談データとの結合
		$dealStore.forEach(deal => {
			const lead = $leadStore.find(l => l.id === deal.leadId);
			if (lead && sourceData[lead.source]) {
				sourceData[lead.source].deals++;
				if (deal.status === 'closed_won') {
					sourceData[lead.source].won++;
					sourceData[lead.source].revenue += deal.value;
				}
			}
		});
		
		return Object.entries(sourceData).map(([source, data]) => ({
			source,
			...data,
			conversionRate: data.leads > 0 ? (data.won / data.leads) * 100 : 0,
			roi: data.revenue // 実際はコストを引いてROIを計算
		}));
	});
	
	// 営業担当別パフォーマンス
	const salesPerformance = $derived.by(() => {
		const performance = {};
		
		$dealStore.forEach(deal => {
			if (!performance[deal.assignedTo]) {
				performance[deal.assignedTo] = {
					deals: 0,
					won: 0,
					lost: 0,
					revenue: 0,
					pipeline: 0
				};
			}
			
			performance[deal.assignedTo].deals++;
			
			if (deal.status === 'closed_won') {
				performance[deal.assignedTo].won++;
				performance[deal.assignedTo].revenue += deal.value;
			} else if (deal.status === 'closed_lost') {
				performance[deal.assignedTo].lost++;
			} else {
				performance[deal.assignedTo].pipeline += deal.value;
			}
		});
		
		return Object.entries(performance).map(([name, data]) => ({
			name,
			...data,
			winRate: data.deals > 0 ? (data.won / (data.won + data.lost)) * 100 : 0
		}));
	});
	
	function formatCurrency(amount) {
		return new Intl.NumberFormat('ja-JP', {
			style: 'currency',
			currency: 'JPY',
			minimumFractionDigits: 0
		}).format(amount);
	}
</script>

<div class="space-y-6">
	<!-- 売上予測 -->
	<div class="card bg-base-200">
		<div class="card-body">
			<h3 class="card-title">売上予測（確度加重）</h3>
			<div class="grid grid-cols-3 gap-4">
				{#each Object.entries(salesForecast) as [month, amount]}
					<div class="stat bg-base-100 rounded-lg">
						<div class="stat-title">{new Date(month + '-01').toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}</div>
						<div class="stat-value text-lg">{formatCurrency(amount)}</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
	
	<!-- ファネル分析 -->
	<div class="card bg-base-200">
		<div class="card-body">
			<h3 class="card-title">営業ファネル</h3>
			<div class="space-y-4">
				{#each funnelData as stage, i}
					<div>
						<div class="flex justify-between items-center mb-1">
							<span class="text-sm font-medium">{stage.stage}</span>
							<span class="text-sm">{stage.count}件 ({stage.percentage.toFixed(1)}%)</span>
						</div>
						<div class="relative">
							<div class="w-full bg-base-300 rounded-full h-8">
								<div 
									class="bg-primary rounded-full h-8 flex items-center justify-end pr-4 transition-all duration-500"
									style="width: {stage.percentage}%"
								>
									{#if stage.percentage > 20}
										<span class="text-primary-content text-sm font-semibold">
											{stage.count}
										</span>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
	
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- リードソース分析 -->
		<div class="card bg-base-200">
			<div class="card-body">
				<h3 class="card-title">リードソース別パフォーマンス</h3>
				<div class="overflow-x-auto">
					<table class="table table-sm">
						<thead>
							<tr>
								<th>ソース</th>
								<th>リード</th>
								<th>成約</th>
								<th>転換率</th>
								<th>収益</th>
							</tr>
						</thead>
						<tbody>
							{#each leadSourceAnalysis.sort((a, b) => b.revenue - a.revenue) as source}
								<tr>
									<td class="font-medium">{source.source}</td>
									<td>{source.leads}</td>
									<td>{source.won}</td>
									<td>
										<div class="badge" class:badge-success={source.conversionRate > 5}>
											{source.conversionRate.toFixed(1)}%
										</div>
									</td>
									<td class="font-semibold">{formatCurrency(source.revenue)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
		
		<!-- 営業担当別パフォーマンス -->
		<div class="card bg-base-200">
			<div class="card-body">
				<h3 class="card-title">営業担当別実績</h3>
				<div class="overflow-x-auto">
					<table class="table table-sm">
						<thead>
							<tr>
								<th>担当者</th>
								<th>商談数</th>
								<th>成約率</th>
								<th>収益</th>
								<th>パイプライン</th>
							</tr>
						</thead>
						<tbody>
							{#each salesPerformance.sort((a, b) => b.revenue - a.revenue) as person}
								<tr>
									<td class="font-medium">{person.name}</td>
									<td>{person.deals}</td>
									<td>
										<div class="badge" class:badge-success={person.winRate > 30}>
											{person.winRate.toFixed(0)}%
										</div>
									</td>
									<td class="font-semibold">{formatCurrency(person.revenue)}</td>
									<td>{formatCurrency(person.pipeline)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
	
	<!-- AI インサイト -->
	<div class="card bg-info/10 border-2 border-info">
		<div class="card-body">
			<h3 class="card-title">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
				</svg>
				AIインサイト
			</h3>
			<div class="space-y-3">
				<div class="flex gap-3">
					<div class="badge badge-warning">注意</div>
					<p>展示会経由のリードの成約率が他のソースと比べて15%高くなっています。展示会への投資を増やすことを検討してください。</p>
				</div>
				<div class="flex gap-3">
					<div class="badge badge-success">機会</div>
					<p>営業担当1の成約率が平均より20%高いです。ベストプラクティスをチーム内で共有することで全体の成績向上が期待できます。</p>
				</div>
				<div class="flex gap-3">
					<div class="badge badge-error">リスク</div>
					<p>今月の商談パイプラインが先月比で30%減少しています。リード獲得活動の強化が必要です。</p>
				</div>
			</div>
		</div>
	</div>
</div>