<script>
	import { onMount } from 'svelte';
</script>

<div>
	<div class="mb-6">
		<h1 class="text-2xl font-bold mb-2">コンパクト レイアウト</h1>
		<p class="text-base-content/70">省スペースで効率的な作業環境</p>
	</div>
	
	<!-- クイックアクション -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
		<button class="btn btn-sm btn-outline">
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			新規作成
		</button>
		<button class="btn btn-sm btn-outline">
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
			</svg>
			エクスポート
		</button>
		<button class="btn btn-sm btn-outline">
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
			</svg>
			更新
		</button>
		<button class="btn btn-sm btn-outline">
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
			</svg>
			フィルター
		</button>
	</div>

	<!-- コンパクトな統計情報 -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
		<div class="bg-base-100 rounded-lg p-3 border border-base-200">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-xs text-base-content/60">売上</p>
					<p class="text-lg font-bold">¥1.2M</p>
				</div>
				<div class="text-success text-xs">+12%</div>
			</div>
		</div>
		<div class="bg-base-100 rounded-lg p-3 border border-base-200">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-xs text-base-content/60">注文</p>
					<p class="text-lg font-bold">456</p>
				</div>
				<div class="text-warning text-xs">+3%</div>
			</div>
		</div>
		<div class="bg-base-100 rounded-lg p-3 border border-base-200">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-xs text-base-content/60">顧客</p>
					<p class="text-lg font-bold">1,234</p>
				</div>
				<div class="text-info text-xs">+8%</div>
			</div>
		</div>
		<div class="bg-base-100 rounded-lg p-3 border border-base-200">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-xs text-base-content/60">在庫</p>
					<p class="text-lg font-bold">89%</p>
				</div>
				<div class="text-error text-xs">-2%</div>
			</div>
		</div>
	</div>

	<!-- メインコンテンツ -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
		<div class="lg:col-span-2">
			<div class="bg-base-100 rounded-lg border border-base-200 p-4">
				<div class="flex items-center justify-between mb-3">
					<h2 class="font-medium">最近のアクティビティ</h2>
					<button class="btn btn-ghost btn-xs">すべて表示</button>
				</div>
				
				<div class="space-y-2">
					{#each [1, 2, 3, 4, 5] as item}
						<div class="flex items-center gap-3 p-2 hover:bg-base-200/50 rounded-lg transition-colors">
							<div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
								<span class="text-xs text-primary">注</span>
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium truncate">注文 #2024-{String(item).padStart(3, '0')} が処理されました</p>
								<p class="text-xs text-base-content/60">{item}分前</p>
							</div>
							<button class="btn btn-ghost btn-xs btn-square" aria-label="詳細を表示">
								<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
								</svg>
							</button>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<div>
			<div class="bg-base-100 rounded-lg border border-base-200 p-4">
				<h2 class="font-medium mb-3">レイアウトの特徴</h2>
				
				<div class="space-y-3 text-sm">
					<div>
						<h3 class="font-medium text-primary mb-1">省スペース設計</h3>
						<p class="text-xs text-base-content/70">アイコンベースのナビゲーションで画面を最大限活用</p>
					</div>
					
					<div>
						<h3 class="font-medium text-secondary mb-1">統合ヘッダー</h3>
						<p class="text-xs text-base-content/70">検索、ビュー切替、ユーザー情報を1行に集約</p>
					</div>
					
					<div>
						<h3 class="font-medium text-accent mb-1">コマンドパレット</h3>
						<p class="text-xs text-base-content/70">⌘K でクイックアクセス</p>
					</div>
					
					<div>
						<h3 class="font-medium text-info mb-1">高効率UI</h3>
						<p class="text-xs text-base-content/70">必要な情報に素早くアクセス</p>
					</div>
				</div>

				<div class="divider my-3"></div>

				<div class="text-xs text-base-content/60">
					<p>💡 ヒント: ナビゲーションバーの矢印ボタンで展開/折りたたみができます</p>
				</div>
				
				<div class="mt-4">
					<a href="/sample/layout-demo" class="btn btn-primary btn-sm btn-block">レイアウト選択画面</a>
				</div>
			</div>
		</div>
	</div>
</div>