// 日本の企業名と人名のサンプルデータ
const companyNames = [
	'株式会社テックイノベーション', '合同会社デジタルソリューションズ', 'サイバーネット株式会社',
	'クラウドシステムズ株式会社', '株式会社AIテクノロジー', 'データサイエンス株式会社',
	'株式会社スマートビジネス', 'イノベーションラボ株式会社', '株式会社フューチャーワークス',
	'デジタルトランスフォーム株式会社', '株式会社ネクストステージ', 'グローバルテック株式会社'
];

const lastNames = ['田中', '佐藤', '鈴木', '高橋', '渡辺', '伊藤', '山本', '中村', '小林', '加藤'];
const firstNames = ['太郎', '次郎', '花子', '美咲', '健一', '由美', '大輔', '愛', '隆', '真理子'];
const positions = ['代表取締役', '営業部長', 'マーケティング部長', 'IT部長', '購買部長', '経営企画部長'];

const industries = ['IT・通信', '製造業', '小売業', 'サービス業', '金融業', '不動産業', '医療・福祉'];
const companySizes = ['small', 'medium', 'large', 'enterprise'];
const leadSources = ['展示会', 'Webサイト', '紹介', 'セミナー', '広告', 'コールドコール'];

const dealStages = ['qualification', 'needs_analysis', 'proposal', 'negotiation', 'closed'];
const dealStatuses = ['open', 'closed_won', 'closed_lost'];

const activityTypes = ['call', 'email', 'meeting', 'email_opened', 'email_clicked', 'web_visit', 'document_download'];

// ランダムな日付を生成
function randomDate(start, end) {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// モックデータ生成関数
export function generateMockData() {
	const leads = [];
	const deals = [];
	const customers = [];
	const activities = [];
	const emailTemplates = [];
	
	// メールテンプレート
	emailTemplates.push(
		{
			id: '1',
			name: '展示会お礼メール',
			subject: '【{companyName}】展示会でのご来場ありがとうございました',
			body: `{contactName} 様\n\nお世話になっております。\n{senderName}です。\n\n先日は弊社ブースにお立ち寄りいただき、誠にありがとうございました。\n\n{productName}について、ご興味をお持ちいただけましたら、\nぜひ詳細なご説明の機会をいただければ幸いです。\n\nご都合のよろしい日時をお知らせください。\n\nよろしくお願いいたします。`,
			category: 'initial_approach'
		},
		{
			id: '2',
			name: 'Web問い合わせお礼',
			subject: 'お問い合わせありがとうございます【{productName}】',
			body: `{contactName} 様\n\nこの度は{productName}にお問い合わせいただき、\n誠にありがとうございます。\n\n早速ですが、詳しい資料をお送りさせていただきます。\nまた、デモンストレーションのご希望がございましたら、\nお気軽にお申し付けください。\n\n何かご不明な点がございましたら、\nお気軽にお問い合わせください。`,
			category: 'initial_approach'
		}
	);
	
	// リード生成（500件）
	for (let i = 0; i < 500; i++) {
		const createdAt = randomDate(new Date(2024, 0, 1), new Date());
		const lead = {
			id: `lead_${i + 1}`,
			name: lastNames[Math.floor(Math.random() * lastNames.length)] + ' ' + 
			      firstNames[Math.floor(Math.random() * firstNames.length)],
			email: `contact${i + 1}@example.com`,
			phone: `03-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
			companyName: companyNames[Math.floor(Math.random() * companyNames.length)],
			position: positions[Math.floor(Math.random() * positions.length)],
			industry: industries[Math.floor(Math.random() * industries.length)],
			companySize: companySizes[Math.floor(Math.random() * companySizes.length)],
			source: leadSources[Math.floor(Math.random() * leadSources.length)],
			status: ['new', 'contacted', 'qualified', 'unqualified'][Math.floor(Math.random() * 4)],
			score: Math.floor(Math.random() * 100),
			createdAt: createdAt.toISOString(),
			lastContactedAt: null,
			notes: ''
		};
		leads.push(lead);
		
		// 一部のリードに活動履歴を追加
		if (Math.random() > 0.5) {
			const activityCount = Math.floor(Math.random() * 10) + 1;
			for (let j = 0; j < activityCount; j++) {
				const activityDate = randomDate(createdAt, new Date());
				activities.push({
					id: `activity_${activities.length + 1}`,
					leadId: lead.id,
					type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
					subject: '活動記録',
					description: '顧客とのやり取り',
					date: activityDate.toISOString(),
					duration: Math.floor(Math.random() * 60) + 15
				});
			}
		}
	}
	
	// 商談生成（200件）- qualifiedなリードから
	const qualifiedLeads = leads.filter(l => l.status === 'qualified').slice(0, 200);
	qualifiedLeads.forEach((lead, i) => {
		const createdAt = new Date(lead.createdAt);
		const stage = dealStages[Math.floor(Math.random() * dealStages.length)];
		const status = stage === 'closed' ? 
			(Math.random() > 0.3 ? 'closed_won' : 'closed_lost') : 'open';
		
		const deal = {
			id: `deal_${i + 1}`,
			leadId: lead.id,
			companyName: lead.companyName,
			contactName: lead.name,
			contactEmail: lead.email,
			stage: stage,
			status: status,
			value: Math.floor(Math.random() * 10000000) + 500000, // 50万〜1050万
			probability: stage === 'qualification' ? 20 : 
			            stage === 'needs_analysis' ? 40 :
			            stage === 'proposal' ? 60 :
			            stage === 'negotiation' ? 80 : 100,
			createdAt: createdAt.toISOString(),
			expectedCloseDate: new Date(createdAt.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
			assignedTo: '営業担当' + (Math.floor(Math.random() * 5) + 1),
			notes: '',
			nextAction: '', // 次のアクション（初期値は空）
			updatedAt: createdAt.toISOString()
		};
		deals.push(deal);
		
		// 成約した商談は顧客に変換
		if (status === 'closed_won') {
			customers.push({
				id: `customer_${customers.length + 1}`,
				dealId: deal.id,
				companyName: deal.companyName,
				contactName: deal.contactName,
				contactEmail: deal.contactEmail,
				industry: lead.industry,
				companySize: lead.companySize,
				status: 'active',
				contractValue: deal.value,
				contractStartDate: new Date(deal.expectedCloseDate).toISOString(),
				contractEndDate: new Date(new Date(deal.expectedCloseDate).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
				mrr: Math.floor(deal.value / 12),
				healthScore: Math.floor(Math.random() * 40) + 60, // 60-100
				lastActivityDate: new Date().toISOString(),
				accountManager: 'CS担当' + (Math.floor(Math.random() * 3) + 1)
			});
		}
	});
	
	return {
		leads,
		deals,
		customers,
		activities,
		emailTemplates
	};
}