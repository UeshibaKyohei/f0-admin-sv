import { writable, derived } from 'svelte/store';
import { generateMockData } from '../api/mockData.js';

// モックデータの初期化
const mockData = generateMockData();

// リードストア
export const leadStore = writable(mockData.leads);

// 商談ストア
export const dealStore = writable(mockData.deals);

// 顧客ストア
export const customerStore = writable(mockData.customers);

// 活動履歴ストア
export const activityStore = writable(mockData.activities);

// メールテンプレートストア
export const emailTemplateStore = writable(mockData.emailTemplates);

// リードスコアの自動計算
export const scoredLeads = derived(
	[leadStore, activityStore],
	([$leads, $activities]) => {
		return $leads.map(lead => {
			const leadActivities = $activities.filter(a => a.leadId === lead.id);
			let score = lead.score || 0;
			
			// 活動に基づくスコアリング
			leadActivities.forEach(activity => {
				switch(activity.type) {
					case 'email_opened': score += 5; break;
					case 'email_clicked': score += 10; break;
					case 'web_visit': score += 3; break;
					case 'document_download': score += 15; break;
					case 'demo_request': score += 30; break;
				}
			});
			
			// 企業規模によるスコア
			if (lead.companySize === 'enterprise') score += 20;
			else if (lead.companySize === 'medium') score += 10;
			
			return { ...lead, score: Math.min(score, 100) };
		});
	}
);

// 商談の統計情報
export const dealStats = derived(dealStore, $deals => {
	const stats = {
		total: $deals.length,
		byStage: {},
		totalValue: 0,
		avgDealSize: 0,
		winRate: 0
	};
	
	$deals.forEach(deal => {
		stats.byStage[deal.stage] = (stats.byStage[deal.stage] || 0) + 1;
		if (deal.value) stats.totalValue += deal.value;
	});
	
	const closedDeals = $deals.filter(d => d.status === 'closed_won' || d.status === 'closed_lost');
	const wonDeals = $deals.filter(d => d.status === 'closed_won');
	
	stats.avgDealSize = stats.total > 0 ? stats.totalValue / stats.total : 0;
	stats.winRate = closedDeals.length > 0 ? (wonDeals.length / closedDeals.length) * 100 : 0;
	
	return stats;
});

// ヘルパー関数
export const crmActions = {
	// リード関連
	addLead: (lead) => {
		const newLead = {
			...lead,
			id: Date.now().toString(),
			createdAt: new Date().toISOString(),
			status: 'new',
			score: 0
		};
		leadStore.update(leads => [...leads, newLead]);
		return newLead;
	},
	
	updateLead: (id, updates) => {
		leadStore.update(leads => 
			leads.map(lead => lead.id === id ? { ...lead, ...updates } : lead)
		);
	},
	
	// 商談関連
	createDealFromLead: (leadId) => {
		let currentLeads;
		leadStore.subscribe(leads => currentLeads = leads)();
		const lead = currentLeads.find(l => l.id === leadId);
		if (!lead) return null;
		
		const newDeal = {
			id: Date.now().toString(),
			leadId,
			companyName: lead.companyName,
			contactName: lead.name,
			stage: 'qualification',
			status: 'open',
			value: 0,
			createdAt: new Date().toISOString(),
			expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
		};
		
		dealStore.update(deals => [...deals, newDeal]);
		crmActions.updateLead(leadId, { status: 'qualified' });
		return newDeal;
	},
	
	updateDeal: (id, updates) => {
		dealStore.update(deals => 
			deals.map(deal => deal.id === id ? { 
				...deal, 
				...updates,
				updatedAt: new Date().toISOString()
			} : deal)
		);
	},
	
	// 活動記録
	addActivity: (activity) => {
		const newActivity = {
			...activity,
			id: Date.now().toString(),
			date: new Date().toISOString()
		};
		activityStore.update(activities => [...activities, newActivity]);
		return newActivity;
	},
	
	// 活動記録（新しいメソッド）
	recordActivity: (activity) => {
		const newActivity = {
			id: Date.now().toString(),
			type: activity.type || 'note',
			description: activity.description,
			contactName: activity.contactName,
			companyName: activity.companyName,
			leadId: activity.leadId || null,
			dealId: activity.dealId || null,
			customerId: activity.customerId || null,
			date: new Date().toISOString(),
			performedBy: activity.performedBy || '営業担当1'
		};
		activityStore.update(activities => [...activities, newActivity]);
		return newActivity;
	},
	
	// 顧客関連
	convertDealToCustomer: (dealId) => {
		let currentDeals;
		dealStore.subscribe(deals => currentDeals = deals)();
		const deal = currentDeals.find(d => d.id === dealId);
		if (!deal) return null;
		
		const newCustomer = {
			id: Date.now().toString(),
			dealId,
			companyName: deal.companyName,
			contactName: deal.contactName,
			status: 'active',
			contractValue: deal.value,
			contractStartDate: new Date().toISOString(),
			contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
			mrr: deal.value / 12,
			healthScore: 80
		};
		
		customerStore.update(customers => [...customers, newCustomer]);
		crmActions.updateDeal(dealId, { status: 'closed_won' });
		return newCustomer;
	},
	
	// リードを商談に変換（改良版）
	convertLeadToDeal: (lead) => {
		const newDeal = {
			id: Date.now().toString(),
			leadId: lead.id,
			companyName: lead.companyName,
			contactName: lead.name,
			contactEmail: lead.email,
			contactPhone: lead.phone,
			stage: 'qualification',
			status: 'open',
			value: 1000000, // デフォルト値
			probability: 20,
			expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日後
			assignedTo: '山田太郎',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			activities: []
		};
		
		// 商談を追加
		dealStore.update(deals => [...deals, newDeal]);
		
		// リードのステータスを更新
		leadStore.update(leads => 
			leads.map(l => l.id === lead.id ? {...l, status: 'qualified', dealId: newDeal.id} : l)
		);
		
		// アクティビティを記録
		const activity = {
			type: 'note',
			leadId: lead.id,
			dealId: newDeal.id,
			contactName: lead.name,
			companyName: lead.companyName,
			description: 'リードを商談に変換しました',
			date: new Date().toISOString()
		};
		activityStore.update(activities => [...activities, activity]);
		
		return newDeal;
	}
};