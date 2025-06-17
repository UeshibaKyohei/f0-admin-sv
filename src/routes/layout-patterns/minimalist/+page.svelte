<script>
	import { onMount } from 'svelte';
</script>

<div class="p-6">
	<h1 class="text-3xl font-bold mb-6">モダンミニマリスト レイアウト</h1>
	
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
		<div class="card bg-base-100 shadow-sm border border-base-200">
			<div class="card-body">
				<h2 class="card-title text-lg">売上高</h2>
				<p class="text-3xl font-bold text-primary">¥2,345,678</p>
				<p class="text-sm text-base-content/60">前月比 +15%</p>
			</div>
		</div>
		<div class="card bg-base-100 shadow-sm border border-base-200">
			<div class="card-body">
				<h2 class="card-title text-lg">顧客数</h2>
				<p class="text-3xl font-bold text-secondary">1,234</p>
				<p class="text-sm text-base-content/60">新規 +56</p>
			</div>
		</div>
		<div class="card bg-base-100 shadow-sm border border-base-200">
			<div class="card-body">
				<h2 class="card-title text-lg">受注数</h2>
				<p class="text-3xl font-bold">567</p>
				<p class="text-sm text-base-content/60">処理中 23件</p>
			</div>
		</div>
		<div class="card bg-base-100 shadow-sm border border-base-200">
			<div class="card-body">
				<h2 class="card-title text-lg">達成率</h2>
				<p class="text-3xl font-bold text-success">92%</p>
				<p class="text-sm text-base-content/60">目標まであと少し</p>
			</div>
		</div>
	</div>

	<div class="card bg-base-100 shadow-sm border border-base-200">
		<div class="card-body">
			<h2 class="card-title mb-4">レイアウトの特徴</h2>
			<ul class="space-y-2">
				<li class="flex items-center gap-2">
					<span class="text-success">✓</span>
					フローティングサイドバーによる柔軟なレイアウト
				</li>
				<li class="flex items-center gap-2">
					<span class="text-success">✓</span>
					透明感のあるモダンなデザイン
				</li>
				<li class="flex items-center gap-2">
					<span class="text-success">✓</span>
					モバイルファーストな設計
				</li>
				<li class="flex items-center gap-2">
					<span class="text-success">✓</span>
					検索機能を中心としたナビゲーション
				</li>
			</ul>
			
			<div class="mt-6">
				<a href="/sample/layout-demo" class="btn btn-primary">レイアウト選択画面に戻る</a>
			</div>
		</div>
	</div>
</div>