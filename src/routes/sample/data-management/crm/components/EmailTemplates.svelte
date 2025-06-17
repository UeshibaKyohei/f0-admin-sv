<script>
	import { emailTemplateStore, crmActions } from '../stores/crmStore.js';
	import { toast } from '$lib/stores/toastStore.js';
	
	let selectedTemplate = $state(null);
	let showTemplateEditor = $state(false);
	let editMode = $state('');
	let searchQuery = $state('');
	let filterCategory = $state('all');
	
	// テンプレートエディタの状態
	let editingTemplate = $state({
		name: '',
		category: 'lead',
		subject: '',
		body: '',
		variables: []
	});
	
	// カテゴリー定義
	const categories = {
		lead: { label: 'リード向け', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
		deal: { label: '商談向け', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
		customer: { label: '顧客向け', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
		general: { label: '汎用', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }
	};
	
	// デフォルトテンプレート
	const defaultTemplates = [
		{
			id: '1',
			name: '展示会お礼',
			category: 'lead',
			subject: '【ご挨拶】本日はありがとうございました - {' + 'companyName}様',
			body: '{' + 'contactName}様\n\n本日は弊社ブースにお立ち寄りいただき、誠にありがとうございました。\n\nお話しさせていただいた弊社のサービスについて、\n改めて詳しい資料をお送りさせていただきます。\n\nご不明な点やご質問がございましたら、\nお気軽にお問い合わせください。\n\n今後ともよろしくお願いいたします。\n\n---\n{' + 'senderName}\n営業部\n株式会社Example\nTEL: 03-1234-5678\nEmail: sales@example.com',
			variables: ['contactName', 'companyName', 'senderName']
		},
		{
			id: '2',
			name: '初回商談後フォロー',
			category: 'deal',
			subject: '先日はお時間をいただきありがとうございました',
			body: '{' + 'contactName}様\n\nお世話になっております。\n先日はお忙しい中、貴重なお時間をいただき\n誠にありがとうございました。\n\nお打ち合わせでご相談いただいた点について、\n社内で検討し、以下の資料を準備いたしました。\n\n[添付資料]\n・サービス詳細資料\n・導入事例集\n・お見積書\n\nご不明な点がございましたら、\nお気軽にお問い合わせください。\n\n次回のお打ち合わせ日程についても、\nご都合をお聞かせいただければ幸いです。\n\nよろしくお願いいたします。\n\n---\n{' + 'senderName}',
			variables: ['contactName', 'senderName']
		},
		{
			id: '3',
			name: '契約更新のご案内',
			category: 'customer',
			subject: '【重要】ご契約更新のご案内',
			body: '{' + 'contactName}様\n\nいつもお世話になっております。\n{' + 'companyName}様のご契約更新時期が近づいてまいりましたので、\nご案内させていただきます。\n\n現在のご契約内容：\n・プラン: {' + 'planName}\n・契約期間: {' + 'contractPeriod}\n・更新予定日: {' + 'renewalDate}\n\nこの1年間のご利用状況を拝見し、\n更なる活用方法についてご提案させていただければと思います。\n\nつきましては、更新のお手続きと合わせて、\n今後の活用方法についてお打ち合わせの機会を\nいただけますでしょうか。\n\nご都合のよろしい日時をお知らせください。\n\nよろしくお願いいたします。\n\n---\nカスタマーサクセス部\n{' + 'senderName}',
			variables: ['contactName', 'companyName', 'planName', 'contractPeriod', 'renewalDate', 'senderName']
		}
	];
	
	// 初期テンプレートの設定
	if ($emailTemplateStore.length === 0) {
		emailTemplateStore.set(defaultTemplates);
	}
	
	// フィルタリングされたテンプレート
	const filteredTemplates = $derived.by(() => {
		let templates = [...$emailTemplateStore];
		
		// カテゴリーフィルター
		if (filterCategory !== 'all') {
			templates = templates.filter(t => t.category === filterCategory);
		}
		
		// 検索フィルター
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			templates = templates.filter(t => 
				t.name.toLowerCase().includes(query) ||
				t.subject.toLowerCase().includes(query) ||
				t.body.toLowerCase().includes(query)
			);
		}
		
		return templates;
	});
	
	// 新規テンプレート作成
	function createNewTemplate() {
		editMode = 'create';
		editingTemplate = {
			name: '',
			category: 'lead',
			subject: '',
			body: '',
			variables: []
		};
		showTemplateEditor = true;
	}
	
	// テンプレート編集
	function editTemplate(template) {
		editMode = 'edit';
		editingTemplate = { ...template };
		showTemplateEditor = true;
	}
	
	// テンプレート保存
	function saveTemplate() {
		// 変数の抽出
		const variablePattern = /\{([^}]+)\}/g;
		const variables = [];
		let match;
		
		while ((match = variablePattern.exec(editingTemplate.subject + ' ' + editingTemplate.body)) !== null) {
			if (!variables.includes(match[1])) {
				variables.push(match[1]);
			}
		}
		
		editingTemplate.variables = variables;
		
		if (editMode === 'create') {
			emailTemplateStore.update(templates => [
				...templates,
				{
					...editingTemplate,
					id: Date.now().toString(),
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				}
			]);
		} else {
			emailTemplateStore.update(templates => 
				templates.map(t => t.id === editingTemplate.id 
					? { ...editingTemplate, updatedAt: new Date().toISOString() }
					: t
				)
			);
		}
		
		showTemplateEditor = false;
		toast.success('テンプレートを保存しました');
	}
	
	// 削除確認モーダルの状態
	let showDeleteConfirm = $state(false);
	let deleteTargetId = $state(null);
	
	// テンプレート削除
	function deleteTemplate(id) {
		deleteTargetId = id;
		showDeleteConfirm = true;
	}
	
	// 削除実行
	function executeDelete() {
		emailTemplateStore.update(templates => templates.filter(t => t.id !== deleteTargetId));
		toast.success('テンプレートを削除しました');
		showDeleteConfirm = false;
		deleteTargetId = null;
	}
	
	// プレビューテキストの生成
	function getPreviewText(body) {
		return body.substring(0, 100) + (body.length > 100 ? '...' : '');
	}
</script>

<div class="space-y-6">
	<!-- ヘッダー -->
	<div class="flex justify-between items-center">
		<h2 class="text-2xl font-bold">メールテンプレート</h2>
		<button 
			class="btn btn-primary gap-2"
			onclick={createNewTemplate}
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
			</svg>
			新規作成
		</button>
	</div>
	
	<!-- フィルターバー -->
	<div class="flex flex-wrap gap-4 items-center">
		<div class="form-control flex-1 min-w-[200px]">
			<input 
				type="text" 
				placeholder="テンプレート名、件名、本文で検索..." 
				class="input input-bordered"
				bind:value={searchQuery}
			/>
		</div>
		
		<div class="flex gap-2">
			<button 
				class="btn btn-sm"
				class:btn-active={filterCategory === 'all'}
				onclick={() => filterCategory = 'all'}
			>
				すべて
			</button>
			{#each Object.entries(categories) as [key, cat]}
				<button 
					class="btn btn-sm"
					class:btn-active={filterCategory === key}
					onclick={() => filterCategory = key}
				>
					{cat.label}
				</button>
			{/each}
		</div>
	</div>
	
	<!-- テンプレート一覧 -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each filteredTemplates as template}
			<div class="card bg-base-200 hover:shadow-lg transition-shadow">
				<div class="card-body">
					<div class="flex justify-between items-start">
						<h3 class="card-title text-base">{template.name}</h3>
						<div class="badge badge-outline">{categories[template.category]?.label || template.category}</div>
					</div>
					
					<div class="space-y-2 mt-2">
						<div>
							<p class="text-xs opacity-70">件名:</p>
							<p class="text-sm font-medium">{template.subject}</p>
						</div>
						
						<div>
							<p class="text-xs opacity-70">本文:</p>
							<p class="text-sm opacity-80">{getPreviewText(template.body)}</p>
						</div>
						
						{#if template.variables && template.variables.length > 0}
							<div>
								<p class="text-xs opacity-70">変数:</p>
								<div class="flex flex-wrap gap-1 mt-1">
									{#each template.variables as variable}
										<span class="badge badge-sm badge-primary">{'{'}{variable}{'}'}</span>
									{/each}
								</div>
							</div>
						{/if}
					</div>
					
					<div class="card-actions justify-end mt-4">
						<button 
							class="btn btn-ghost btn-sm"
							onclick={() => editTemplate(template)}
						>
							編集
						</button>
						<button 
							class="btn btn-ghost btn-sm text-error"
							onclick={() => deleteTemplate(template.id)}
						>
							削除
						</button>
					</div>
				</div>
			</div>
		{/each}
		
		{#if filteredTemplates.length === 0}
			<div class="col-span-full text-center py-12 opacity-50">
				<svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
				</svg>
				<p>テンプレートが見つかりません</p>
			</div>
		{/if}
	</div>
</div>

<!-- テンプレートエディターモーダル -->
<input type="checkbox" id="template-editor-modal" class="modal-toggle" bind:checked={showTemplateEditor} />
<div class="modal">
	<div class="modal-box max-w-5xl">
		<h3 class="font-bold text-2xl mb-6">
			{editMode === 'create' ? '新規テンプレート作成' : 'テンプレート編集'}
		</h3>
		
		<div class="space-y-6">
			<!-- 基本情報 -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="form-control w-full">
					<label class="label">
						<span class="label-text font-semibold">テンプレート名</span>
						<span class="label-text-alt text-error">*必須</span>
					</label>
					<input 
						type="text" 
						class="input input-bordered w-full" 
						placeholder="例: 展示会お礼メール"
						bind:value={editingTemplate.name}
					/>
				</div>
				
				<div class="form-control w-full">
					<label class="label">
						<span class="label-text font-semibold">カテゴリー</span>
					</label>
					<select class="select select-bordered w-full" bind:value={editingTemplate.category}>
						{#each Object.entries(categories) as [key, cat]}
							<option value={key}>{cat.label}</option>
						{/each}
					</select>
				</div>
			</div>
			
			<!-- 件名 -->
			<div class="form-control w-full">
				<label class="label">
					<span class="label-text font-semibold">件名</span>
					<span class="label-text-alt text-error">*必須</span>
				</label>
				<input 
					type="text" 
					class="input input-bordered w-full" 
					placeholder="例: 【ご挨拶】本日はありがとうございました - {'{'}companyName{'}'}様"
					bind:value={editingTemplate.subject}
				/>
				<label class="label">
					<span class="label-text-alt opacity-70">件名にも変数を使用できます</span>
				</label>
			</div>
			
			<!-- 本文 -->
			<div class="form-control w-full">
				<label class="label">
					<span class="label-text font-semibold">本文</span>
					<span class="label-text-alt text-error">*必須</span>
				</label>
				<textarea 
					class="textarea textarea-bordered w-full h-72 font-mono text-sm" 
					placeholder="メール本文を入力..."
					bind:value={editingTemplate.body}
				></textarea>
				<label class="label">
					<span class="label-text-alt opacity-70">改行はそのまま反映されます</span>
				</label>
			</div>
			
			<!-- 変数の説明 -->
			<div class="alert alert-info">
				<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
				<div class="space-y-2">
					<p class="font-semibold text-base">変数の使い方</p>
					<p class="text-sm">{'{contactName}'}, {'{companyName}'}, {'{senderName}'}などの形式で変数を挿入できます。</p>
					<p class="text-sm">送信時に実際の値に置き換わります。</p>
					<div class="flex flex-wrap gap-2 mt-2">
						<span class="badge badge-sm">{'{}'}で囲む</span>
						<span class="badge badge-sm">大文字小文字を正確に</span>
						<span class="badge badge-sm">スペースを含めない</span>
					</div>
				</div>
			</div>
		</div>
		
		<div class="modal-action mt-8">
			<button class="btn" onclick={() => showTemplateEditor = false}>
				キャンセル
			</button>
			<button 
				class="btn btn-primary"
				onclick={saveTemplate}
				disabled={!editingTemplate.name || !editingTemplate.subject || !editingTemplate.body}
			>
				<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
				</svg>
				保存
			</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={() => showTemplateEditor = false}>close</button>
	</form>
</div>

<!-- 削除確認モーダル -->
<input type="checkbox" id="delete-confirm-modal" class="modal-toggle" bind:checked={showDeleteConfirm} />
<div class="modal">
	<div class="modal-box">
		<h3 class="font-bold text-lg mb-4">テンプレートの削除</h3>
		
		<p class="py-4">
			このテンプレートを削除してもよろしいですか？
			<br />
			<span class="text-error">この操作は元に戻せません。</span>
		</p>
		
		<div class="modal-action">
			<button 
				class="btn"
				onclick={() => showDeleteConfirm = false}
			>
				キャンセル
			</button>
			<button 
				class="btn btn-error"
				onclick={executeDelete}
			>
				削除する
			</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={() => showDeleteConfirm = false}>close</button>
	</form>
</div>