<script>
	let showNewLeadModal = $state(false);
	let showBusinessCardModal = $state(false);
	
	// 仮の名刺データ（実際はOCRやAPIから取得）
	let businessCardData = $state({
		name: '',
		company: '',
		position: '',
		email: '',
		phone: ''
	});
</script>

<div class="dropdown dropdown-end">
	<button class="btn btn-primary btn-sm">
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
		</svg>
		新規作成
	</button>
	<ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
		<li><button onclick={() => showBusinessCardModal = true}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
			</svg>
			名刺から登録
		</button></li>
		<li><button onclick={() => showNewLeadModal = true}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
			</svg>
			リード登録
		</button></li>
		<li><button>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
			</svg>
			商談作成
		</button></li>
	</ul>
</div>

<!-- 名刺登録モーダル -->
<input type="checkbox" id="business-card-modal" class="modal-toggle" bind:checked={showBusinessCardModal} />
<div class="modal">
	<div class="modal-box max-w-2xl">
		<h3 class="font-bold text-lg mb-4">名刺から新規リード登録</h3>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<!-- 名刺アップロードエリア -->
			<div>
				<div class="form-control">
					<label class="label">
						<span class="label-text">名刺画像をアップロード</span>
					</label>
					<div class="border-2 border-dashed border-base-300 rounded-lg p-8 text-center">
						<svg class="w-12 h-12 mx-auto mb-4 text-base-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
						</svg>
						<p class="text-sm text-base-content/70">クリックまたはドラッグ＆ドロップ</p>
						<input type="file" class="hidden" accept="image/*" />
					</div>
				</div>
				
				<div class="alert alert-info mt-4">
					<svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
					<span class="text-sm">AI-OCRが自動的に情報を読み取ります</span>
				</div>
			</div>
			
			<!-- 読み取り結果 -->
			<div class="space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text">お名前</span>
					</label>
					<input type="text" bind:value={businessCardData.name} class="input input-bordered" />
				</div>
				
				<div class="form-control">
					<label class="label">
						<span class="label-text">会社名</span>
					</label>
					<input type="text" bind:value={businessCardData.company} class="input input-bordered" />
				</div>
				
				<div class="form-control">
					<label class="label">
						<span class="label-text">役職</span>
					</label>
					<input type="text" bind:value={businessCardData.position} class="input input-bordered" />
				</div>
				
				<div class="form-control">
					<label class="label">
						<span class="label-text">メールアドレス</span>
					</label>
					<input type="email" bind:value={businessCardData.email} class="input input-bordered" />
				</div>
				
				<div class="form-control">
					<label class="label">
						<span class="label-text">電話番号</span>
					</label>
					<input type="tel" bind:value={businessCardData.phone} class="input input-bordered" />
				</div>
			</div>
		</div>
		
		<div class="modal-action">
			<button class="btn btn-ghost" onclick={() => showBusinessCardModal = false}>キャンセル</button>
			<button class="btn btn-primary">
				登録してお礼メールを送信
			</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={() => showBusinessCardModal = false}>close</button>
	</form>
</div>