<script>
	import { browser } from '$app/environment';

	let selectedLayout = $state('current');
	let demoContent = $state('stats');

	const layouts = [
		{
			id: 'current',
			name: '現在のレイアウト',
			description: '既存のレイアウト（バックアップ済み）',
			features: ['左サイドバー', '上部ヘッダー', '下部フッター', 'ユーザー情報重複あり']
		},
		{
			id: 'minimalist',
			name: 'モダンミニマリスト',
			description: '洗練された空間を重視したデザイン',
			features: ['フローティングサイドバー', '透明感のあるUI', 'モバイル対応', '検索重視']
		},
		{
			id: 'enterprise',
			name: 'エンタープライズ',
			description: '情報密度が高い多機能管理画面',
			features: ['2段階ナビゲーション', 'モジュール切替', 'ステータスバー', '通知システム']
		},
		{
			id: 'compact',
			name: 'コンパクト',
			description: '省スペースで効率的なレイアウト',
			features: ['アイコンナビ', '統合ヘッダー', 'コマンドパレット', 'ビュー切替']
		}
	];

	function applyLayout() {
		if (!browser) return;
		
		alert(`
レイアウトの適用方法:

1. 選択したレイアウトのファイルをコピー:
   - /src/routes/layout-patterns/${selectedLayout}/+layout.svelte
   - /src/routes/layout-patterns/${selectedLayout}/Sidebar.svelte (または他のコンポーネント)
   
2. 現在のレイアウトファイルを置き換え:
   - /src/routes/+layout.svelte
   - /src/routes/Sidebar.svelte
   
3. 必要に応じて、バックアップファイルから復元:
   - /src/routes/layout.backup.svelte
   - /src/routes/sidebar.backup.svelte
		`);
	}
</script>

<div class="container mx-auto p-6 max-w-7xl">
	<div class="mb-8">
		<h1 class="text-3xl font-bold mb-2">レイアウトパターン選択</h1>
		<p class="text-base-content/70">3つの異なるレイアウトパターンから選択してください</p>
	</div>

	<!-- レイアウト選択カード -->
	<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
		{#each layouts as layout}
			<div class="card bg-base-100 shadow-xl {selectedLayout === layout.id ? 'ring-2 ring-primary' : ''}">
				<div class="card-body">
					<h2 class="card-title text-lg">{layout.name}</h2>
					<p class="text-sm text-base-content/70 mb-3">{layout.description}</p>
					
					<div class="space-y-1 mb-4">
						{#each layout.features as feature}
							<div class="flex items-center gap-2 text-sm">
								<svg class="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								<span>{feature}</span>
							</div>
						{/each}
					</div>

					<div class="card-actions">
						<button
							onclick={() => (selectedLayout = layout.id)}
							class="btn btn-sm {selectedLayout === layout.id ? 'btn-primary' : 'btn-outline'} btn-block"
						>
							{selectedLayout === layout.id ? '選択中' : '選択'}
						</button>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- プレビューエリア -->
	<div class="card bg-base-100 shadow-xl mb-8">
		<div class="card-body">
			<div class="flex items-center justify-between mb-4">
				<h2 class="card-title">レイアウトプレビュー</h2>
				<button
					onclick={applyLayout}
					class="btn btn-primary"
					disabled={selectedLayout === 'current'}
				>
					このレイアウトを適用
				</button>
			</div>

			<!-- プレビュー説明 -->
			<div class="alert alert-info mb-4">
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<div>
					<div class="font-medium">レイアウトの特徴</div>
					{#if selectedLayout === 'current'}
						<p>現在使用中のレイアウトです。左側にサイドバー、上部にヘッダー、下部にフッターがあります。</p>
					{:else if selectedLayout === 'minimalist'}
						<p>フローティングサイドバーと透明感のあるデザインで、モダンな印象を与えます。</p>
					{:else if selectedLayout === 'enterprise'}
						<p>多機能で情報密度の高いレイアウト。大規模システムに適しています。</p>
					{:else if selectedLayout === 'compact'}
						<p>省スペース設計で、画面を最大限活用できます。キーボードショートカット対応。</p>
					{/if}
				</div>
			</div>

			<!-- デモコンテンツ切替 -->
			<div class="tabs tabs-boxed mb-4">
				<button
					class="tab {demoContent === 'stats' ? 'tab-active' : ''}"
					onclick={() => (demoContent = 'stats')}
				>
					統計情報
				</button>
				<button
					class="tab {demoContent === 'table' ? 'tab-active' : ''}"
					onclick={() => (demoContent = 'table')}
				>
					データテーブル
				</button>
				<button
					class="tab {demoContent === 'form' ? 'tab-active' : ''}"
					onclick={() => (demoContent = 'form')}
				>
					フォーム
				</button>
			</div>

			<!-- デモコンテンツ -->
			{#if demoContent === 'stats'}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<div class="stat bg-base-200 rounded-lg">
						<div class="stat-title">総売上</div>
						<div class="stat-value text-primary">¥1,234,567</div>
						<div class="stat-desc">前月比 +12%</div>
					</div>
					<div class="stat bg-base-200 rounded-lg">
						<div class="stat-title">新規顧客</div>
						<div class="stat-value text-secondary">89</div>
						<div class="stat-desc">今月の獲得数</div>
					</div>
					<div class="stat bg-base-200 rounded-lg">
						<div class="stat-title">受注件数</div>
						<div class="stat-value">432</div>
						<div class="stat-desc">処理中: 23件</div>
					</div>
					<div class="stat bg-base-200 rounded-lg">
						<div class="stat-title">在庫回転率</div>
						<div class="stat-value">3.2</div>
						<div class="stat-desc text-success">↗︎ 改善中</div>
					</div>
				</div>
			{:else if demoContent === 'table'}
				<div class="overflow-x-auto">
					<table class="table">
						<thead>
							<tr>
								<th>ID</th>
								<th>商品名</th>
								<th>カテゴリ</th>
								<th>価格</th>
								<th>在庫</th>
								<th>ステータス</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>001</td>
								<td>ノートPC Pro</td>
								<td>コンピュータ</td>
								<td>¥198,000</td>
								<td>23</td>
								<td><span class="badge badge-success">販売中</span></td>
							</tr>
							<tr>
								<td>002</td>
								<td>ワイヤレスマウス</td>
								<td>周辺機器</td>
								<td>¥4,980</td>
								<td>156</td>
								<td><span class="badge badge-success">販売中</span></td>
							</tr>
							<tr>
								<td>003</td>
								<td>USBハブ 7ポート</td>
								<td>周辺機器</td>
								<td>¥3,480</td>
								<td>5</td>
								<td><span class="badge badge-warning">在庫少</span></td>
							</tr>
						</tbody>
					</table>
				</div>
			{:else if demoContent === 'form'}
				<div class="max-w-2xl">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control">
							<label class="label">
								<span class="label-text">商品名</span>
							</label>
							<input type="text" placeholder="商品名を入力" class="input input-bordered" />
						</div>
						<div class="form-control">
							<label class="label">
								<span class="label-text">カテゴリ</span>
							</label>
							<select class="select select-bordered">
								<option>コンピュータ</option>
								<option>周辺機器</option>
								<option>ソフトウェア</option>
							</select>
						</div>
						<div class="form-control">
							<label class="label">
								<span class="label-text">価格</span>
							</label>
							<input type="number" placeholder="0" class="input input-bordered" />
						</div>
						<div class="form-control">
							<label class="label">
								<span class="label-text">在庫数</span>
							</label>
							<input type="number" placeholder="0" class="input input-bordered" />
						</div>
					</div>
					<div class="form-control mt-4">
						<label class="label">
							<span class="label-text">説明</span>
						</label>
						<textarea class="textarea textarea-bordered h-24" placeholder="商品の説明を入力"></textarea>
					</div>
					<div class="mt-6 flex gap-2">
						<button class="btn btn-primary">保存</button>
						<button class="btn btn-ghost">キャンセル</button>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- 注意事項 -->
	<div class="alert alert-warning">
		<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
		</svg>
		<div>
			<h3 class="font-bold">レイアウト変更時の注意</h3>
			<p>レイアウトを変更すると、現在のページから離れます。作業中のデータは保存してから変更してください。</p>
		</div>
	</div>
</div>