<script>
	import { goto } from '$app/navigation';
	
	const systems = [
		{
			id: 'crm',
			title: 'CRM - 顧客関係管理',
			description: '営業プロセス全体を管理。名刺登録から商談管理、顧客ライフサイクルまで一元管理',
			features: ['リード管理', '商談パイプライン', '顧客分析', 'AI提案'],
			path: '/sample/data-management/crm',
			icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
			color: 'primary'
		},
		{
			id: 'inventory',
			title: '在庫管理',
			description: '在庫の可視化と最適化。リアルタイムトラッキングとAI需要予測',
			features: ['在庫追跡', '入出庫管理', 'アラート機能', '需要予測'],
			path: '/sample/data-management/zaiko',
			icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
			color: 'secondary'
		},
		{
			id: 'product',
			title: '商品管理',
			description: '商品マスタの一元管理。カテゴリ分類、在庫連携、価格管理',
			features: ['商品登録', 'カテゴリ管理', '画像管理', '価格設定'],
			path: '/sample/data-management/product01',
			icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
			color: 'accent'
		},
		{
			id: 'employee',
			title: '従業員管理',
			description: '人事情報の総合管理。組織図、スキル管理、パフォーマンス評価',
			features: ['従業員データ', '組織図', 'スキル管理', '評価管理'],
			path: '/sample/data-management/employee01',
			icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
			color: 'info'
		},
		{
			id: 'file',
			title: 'ファイル管理',
			description: 'ドキュメントの集中管理。フォルダ構造、アクセス権限、バージョン管理',
			features: ['フォルダ管理', 'ファイル共有', 'アクセス権限', 'バージョン管理'],
			path: '/sample/data-management/file-explorer',
			icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
			color: 'warning'
		}
	];
</script>

<div class="min-h-screen bg-base-100 p-6">
	<div class="max-w-7xl mx-auto">
		<div class="text-center mb-10">
			<h1 class="text-4xl font-bold mb-4">データ管理システム</h1>
			<p class="text-lg opacity-70">業務データの一元管理と効率化を実現する統合プラットフォーム</p>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each systems as system}
				<div class="card bg-base-200 hover:shadow-xl transition-shadow cursor-pointer" 
					 onclick={() => goto(system.path)}>
					<div class="card-body">
						<div class="flex items-center gap-4 mb-4">
							<div class={`w-12 h-12 rounded-lg bg-${system.color} bg-opacity-20 flex items-center justify-center`}>
								<svg class={`w-6 h-6 text-${system.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={system.icon}></path>
								</svg>
							</div>
							<h2 class="card-title text-lg">{system.title}</h2>
						</div>
						
						<p class="text-sm opacity-70 mb-4">{system.description}</p>
						
						<div class="flex flex-wrap gap-2">
							{#each system.features as feature}
								<div class="badge badge-outline badge-sm">{feature}</div>
							{/each}
						</div>
						
						<div class="card-actions justify-end mt-4">
							<button class={`btn btn-${system.color} btn-sm`}>
								アクセス
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
								</svg>
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
		
		<div class="mt-10 text-center">
			<div class="stats shadow">
				<div class="stat">
					<div class="stat-title">総データ数</div>
					<div class="stat-value">125,480</div>
					<div class="stat-desc">前月比 +12%</div>
				</div>
				<div class="stat">
					<div class="stat-title">アクティブユーザー</div>
					<div class="stat-value">284</div>
					<div class="stat-desc">本日のログイン</div>
				</div>
				<div class="stat">
					<div class="stat-title">処理速度</div>
					<div class="stat-value">98.5%</div>
					<div class="stat-desc">平均応答時間 0.8秒</div>
				</div>
			</div>
		</div>
	</div>
</div>