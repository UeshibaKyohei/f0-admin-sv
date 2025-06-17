<script>
	import { crmActions } from '../stores/crmStore.js';
	
	let showScanner = $state(false);
	let isScanning = $state(false);
	let scanResult = $state(null);
	let uploadedFile = $state(null);
	
	// 名刺データのサンプル（実際のOCR結果を模擬）
	const sampleBusinessCards = [
		{
			name: '田中 太郎',
			nameKana: 'タナカ タロウ',
			company: '株式会社テックイノベーション',
			position: '営業部 部長',
			email: 'tanaka@techinnovation.jp',
			phone: '03-1234-5678',
			mobile: '090-1234-5678',
			address: '東京都渋谷区道玄坂1-2-3 イノベーションビル10F',
			website: 'https://techinnovation.jp'
		},
		{
			name: '佐藤 花子',
			nameKana: 'サトウ ハナコ',
			company: 'デジタルソリューションズ株式会社',
			position: 'マーケティング課 課長',
			email: 'h.sato@digital-solutions.co.jp',
			phone: '06-9876-5432',
			mobile: '080-9876-5432',
			address: '大阪府大阪市北区梅田2-3-4 デジタルタワー20F',
			website: 'https://digital-solutions.co.jp'
		},
		{
			name: '山田 次郎',
			nameKana: 'ヤマダ ジロウ',
			company: 'AIテクノロジー株式会社',
			position: '代表取締役社長',
			email: 'yamada@ai-tech.jp',
			phone: '045-123-4567',
			mobile: '070-1234-5678',
			address: '神奈川県横浜市西区みなとみらい3-4-5 AIビル15F',
			website: 'https://ai-tech.jp'
		}
	];
	
	// ファイルアップロード処理
	function handleFileUpload(event) {
		const file = event.target.files[0];
		if (file && file.type.startsWith('image/')) {
			uploadedFile = file;
			simulateScan();
		}
	}
	
	// OCRスキャンのシミュレーション
	function simulateScan() {
		isScanning = true;
		
		// 2秒後にランダムな名刺データを返す
		setTimeout(() => {
			const randomCard = sampleBusinessCards[Math.floor(Math.random() * sampleBusinessCards.length)];
			scanResult = {
				...randomCard,
				source: '名刺スキャン',
				scanDate: new Date().toISOString()
			};
			isScanning = false;
		}, 2000);
	}
	
	// リードとして登録
	function registerAsLead() {
		if (!scanResult) return;
		
		const leadData = {
			name: scanResult.name,
			email: scanResult.email,
			phone: scanResult.phone,
			companyName: scanResult.company,
			position: scanResult.position,
			source: '展示会',
			status: 'new',
			industry: getIndustryFromCompany(scanResult.company),
			companySize: getCompanySize(),
			notes: `名刺スキャンより登録\n住所: ${scanResult.address}\nWebサイト: ${scanResult.website}`,
			metadata: {
				nameKana: scanResult.nameKana,
				mobile: scanResult.mobile,
				scanDate: scanResult.scanDate
			}
		};
		
		crmActions.addLead(leadData);
		
		// 成功メッセージ
		alert(`${scanResult.name}様をリードとして登録しました`);
		
		// リセット
		scanResult = null;
		uploadedFile = null;
		showScanner = false;
	}
	
	// 業界を推定（実際はAIや辞書から判定）
	function getIndustryFromCompany(companyName) {
		if (companyName.includes('テック') || companyName.includes('デジタル') || companyName.includes('AI')) {
			return 'IT・ソフトウェア';
		} else if (companyName.includes('製造') || companyName.includes('工業')) {
			return '製造業';
		}
		return 'その他';
	}
	
	// 企業規模をランダムに設定
	function getCompanySize() {
		const sizes = ['1-50名', '51-200名', '201-500名', '501-1000名', '1001名以上'];
		return sizes[Math.floor(Math.random() * sizes.length)];
	}
	
	// ドラッグ&ドロップ処理
	function handleDrop(event) {
		event.preventDefault();
		const file = event.dataTransfer.files[0];
		if (file && file.type.startsWith('image/')) {
			uploadedFile = file;
			simulateScan();
		}
	}
	
	function handleDragOver(event) {
		event.preventDefault();
	}
</script>

<div>
	<button 
		class="btn btn-primary gap-2"
		onclick={() => showScanner = true}
	>
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
		</svg>
		名刺スキャン
	</button>
	
	<!-- スキャナーモーダル -->
	<input type="checkbox" id="scanner-modal" class="modal-toggle" bind:checked={showScanner} />
	<div class="modal">
		<div class="modal-box max-w-2xl">
			<h3 class="font-bold text-lg mb-4">名刺スキャン</h3>
			
			{#if !scanResult}
				<!-- アップロードエリア -->
				<div 
					class="border-2 border-dashed border-base-300 rounded-lg p-8 text-center"
					ondrop={handleDrop}
					ondragover={handleDragOver}
				>
					{#if isScanning}
						<div class="flex flex-col items-center gap-4">
							<span class="loading loading-spinner loading-lg"></span>
							<p>名刺を解析中...</p>
						</div>
					{:else}
						<svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
						</svg>
						<p class="mb-2">名刺画像をドラッグ&ドロップ</p>
						<p class="text-sm opacity-70 mb-4">または</p>
						<label class="btn btn-primary">
							ファイルを選択
							<input 
								type="file" 
								accept="image/*" 
								class="hidden"
								onchange={handleFileUpload}
							/>
						</label>
						<p class="text-sm opacity-50 mt-4">対応形式: JPG, PNG, PDF</p>
					{/if}
				</div>
				
				<!-- デモ用ボタン -->
				<div class="divider">または</div>
				<div class="text-center">
					<button 
						class="btn btn-outline btn-primary"
						onclick={simulateScan}
						disabled={isScanning}
					>
						デモデータでスキャンをシミュレート
					</button>
				</div>
			{:else}
				<!-- スキャン結果 -->
				<div class="space-y-4">
					<div class="alert alert-success">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
						<span>名刺の解析が完了しました</span>
					</div>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control">
							<label class="label">
								<span class="label-text">氏名</span>
							</label>
							<input 
								type="text" 
								class="input input-bordered" 
								bind:value={scanResult.name}
							/>
						</div>
						
						<div class="form-control">
							<label class="label">
								<span class="label-text">フリガナ</span>
							</label>
							<input 
								type="text" 
								class="input input-bordered" 
								bind:value={scanResult.nameKana}
							/>
						</div>
						
						<div class="form-control">
							<label class="label">
								<span class="label-text">会社名</span>
							</label>
							<input 
								type="text" 
								class="input input-bordered" 
								bind:value={scanResult.company}
							/>
						</div>
						
						<div class="form-control">
							<label class="label">
								<span class="label-text">役職</span>
							</label>
							<input 
								type="text" 
								class="input input-bordered" 
								bind:value={scanResult.position}
							/>
						</div>
						
						<div class="form-control">
							<label class="label">
								<span class="label-text">メールアドレス</span>
							</label>
							<input 
								type="email" 
								class="input input-bordered" 
								bind:value={scanResult.email}
							/>
						</div>
						
						<div class="form-control">
							<label class="label">
								<span class="label-text">電話番号</span>
							</label>
							<input 
								type="tel" 
								class="input input-bordered" 
								bind:value={scanResult.phone}
							/>
						</div>
						
						<div class="form-control">
							<label class="label">
								<span class="label-text">携帯番号</span>
							</label>
							<input 
								type="tel" 
								class="input input-bordered" 
								bind:value={scanResult.mobile}
							/>
						</div>
						
						<div class="form-control">
							<label class="label">
								<span class="label-text">Webサイト</span>
							</label>
							<input 
								type="url" 
								class="input input-bordered" 
								bind:value={scanResult.website}
							/>
						</div>
						
						<div class="form-control md:col-span-2">
							<label class="label">
								<span class="label-text">住所</span>
							</label>
							<input 
								type="text" 
								class="input input-bordered" 
								bind:value={scanResult.address}
							/>
						</div>
					</div>
					
					<div class="flex gap-2 justify-end">
						<button 
							class="btn btn-ghost"
							onclick={() => {
								scanResult = null;
								uploadedFile = null;
							}}
						>
							やり直す
						</button>
						<button 
							class="btn btn-primary"
							onclick={registerAsLead}
						>
							リードとして登録
						</button>
					</div>
				</div>
			{/if}
			
			<div class="modal-action">
				<button 
					class="btn"
					onclick={() => {
						showScanner = false;
						scanResult = null;
						uploadedFile = null;
					}}
				>
					閉じる
				</button>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button onclick={() => showScanner = false}>close</button>
		</form>
	</div>
</div>