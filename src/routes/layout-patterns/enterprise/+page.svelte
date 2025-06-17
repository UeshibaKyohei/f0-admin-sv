<script>
	import { onMount } from 'svelte';
</script>

<div class="p-6">
	<div class="mb-6">
		<h1 class="text-2xl font-bold">エンタープライズ レイアウト</h1>
		<div class="text-sm breadcrumbs">
			<ul>
				<li><a href="/">ホーム</a></li>
				<li><a href="/sample/layout-demo">レイアウトデモ</a></li>
				<li>エンタープライズ</li>
			</ul>
		</div>
	</div>
	
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
		<div class="lg:col-span-2">
			<div class="card bg-base-100 shadow-sm">
				<div class="card-body">
					<h2 class="card-title text-lg mb-4">業務ダッシュボード</h2>
					
					<div class="grid grid-cols-2 gap-4 mb-4">
						<div class="stat bg-base-200 rounded-lg p-4">
							<div class="stat-title text-xs">本日の売上</div>
							<div class="stat-value text-2xl">¥456,789</div>
							<div class="stat-desc text-xs">前日比 +12%</div>
						</div>
						<div class="stat bg-base-200 rounded-lg p-4">
							<div class="stat-title text-xs">処理件数</div>
							<div class="stat-value text-2xl">234</div>
							<div class="stat-desc text-xs">未処理: 12件</div>
						</div>
					</div>

					<div class="overflow-x-auto">
						<table class="table table-sm">
							<thead>
								<tr>
									<th>処理番号</th>
									<th>顧客名</th>
									<th>金額</th>
									<th>ステータス</th>
									<th>担当者</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>ORD-2024-001</td>
									<td>株式会社ABC</td>
									<td>¥123,456</td>
									<td><span class="badge badge-success badge-sm">完了</span></td>
									<td>山田太郎</td>
								</tr>
								<tr>
									<td>ORD-2024-002</td>
									<td>XYZ商事</td>
									<td>¥89,012</td>
									<td><span class="badge badge-warning badge-sm">処理中</span></td>
									<td>佐藤花子</td>
								</tr>
								<tr>
									<td>ORD-2024-003</td>
									<td>DEF工業</td>
									<td>¥234,567</td>
									<td><span class="badge badge-info badge-sm">確認待ち</span></td>
									<td>鈴木一郎</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>

		<div>
			<div class="card bg-base-100 shadow-sm">
				<div class="card-body">
					<h2 class="card-title text-lg mb-4">システム情報</h2>
					
					<div class="space-y-3">
						<div>
							<div class="flex justify-between text-sm mb-1">
								<span>CPU使用率</span>
								<span>45%</span>
							</div>
							<progress class="progress progress-primary" value="45" max="100"></progress>
						</div>
						
						<div>
							<div class="flex justify-between text-sm mb-1">
								<span>メモリ使用率</span>
								<span>62%</span>
							</div>
							<progress class="progress progress-secondary" value="62" max="100"></progress>
						</div>
						
						<div>
							<div class="flex justify-between text-sm mb-1">
								<span>ディスク使用率</span>
								<span>78%</span>
							</div>
							<progress class="progress progress-warning" value="78" max="100"></progress>
						</div>
					</div>

					<div class="divider"></div>

					<div class="text-sm space-y-2">
						<div class="flex justify-between">
							<span class="text-base-content/60">稼働時間</span>
							<span>24日 15時間</span>
						</div>
						<div class="flex justify-between">
							<span class="text-base-content/60">最終更新</span>
							<span>10分前</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="card bg-base-100 shadow-sm">
		<div class="card-body">
			<h2 class="card-title mb-4">レイアウトの特徴</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<h3 class="font-medium mb-2">主な機能</h3>
					<ul class="space-y-1 text-sm">
						<li class="flex items-center gap-2">
							<span class="text-success">✓</span>
							2段階ナビゲーション（モジュール切替＋詳細メニュー）
						</li>
						<li class="flex items-center gap-2">
							<span class="text-success">✓</span>
							ステータスバーによるシステム監視
						</li>
						<li class="flex items-center gap-2">
							<span class="text-success">✓</span>
							高密度な情報表示
						</li>
						<li class="flex items-center gap-2">
							<span class="text-success">✓</span>
							通知システムの統合
						</li>
					</ul>
				</div>
				<div>
					<h3 class="font-medium mb-2">適用シーン</h3>
					<ul class="space-y-1 text-sm">
						<li class="flex items-center gap-2">
							<span class="text-info">•</span>
							大規模な業務システム
						</li>
						<li class="flex items-center gap-2">
							<span class="text-info">•</span>
							多部門での利用
						</li>
						<li class="flex items-center gap-2">
							<span class="text-info">•</span>
							リアルタイム監視が必要なシステム
						</li>
						<li class="flex items-center gap-2">
							<span class="text-info">•</span>
							複雑な権限管理
						</li>
					</ul>
				</div>
			</div>
			
			<div class="mt-6">
				<a href="/sample/layout-demo" class="btn btn-primary btn-sm">レイアウト選択画面に戻る</a>
			</div>
		</div>
	</div>
</div>