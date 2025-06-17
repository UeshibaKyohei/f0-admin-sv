<script lang="ts">
	import { browser } from '$app/environment';

	let currentTime = $state(new Date().toLocaleString('ja-JP'));
	let systemStatus = $state('正常');
	let activeUsers = $state(42);
	let cpuUsage = $state(35);

	// 時刻更新
	$effect(() => {
		if (browser) {
			const interval = setInterval(() => {
				currentTime = new Date().toLocaleString('ja-JP');
			}, 1000);
			return () => clearInterval(interval);
		}
	});

	// システムステータスのシミュレーション
	$effect(() => {
		if (browser) {
			const interval = setInterval(() => {
				activeUsers = Math.floor(Math.random() * 20) + 35;
				cpuUsage = Math.floor(Math.random() * 30) + 25;
			}, 5000);
			return () => clearInterval(interval);
		}
	});
</script>

<footer class="bg-base-100 border-t border-base-300 px-4 py-2">
	<div class="flex items-center justify-between text-xs">
		<div class="flex items-center gap-6">
			<!-- システムステータス -->
			<div class="flex items-center gap-2">
				<span class="text-base-content/60">システム:</span>
				<div class="flex items-center gap-1">
					<span class="w-2 h-2 bg-success rounded-full"></span>
					<span class="text-success">{systemStatus}</span>
				</div>
			</div>

			<!-- アクティブユーザー -->
			<div class="flex items-center gap-2">
				<svg class="w-4 h-4 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
				</svg>
				<span>{activeUsers} 人</span>
			</div>

			<!-- CPU使用率 -->
			<div class="flex items-center gap-2">
				<span class="text-base-content/60">CPU:</span>
				<div class="w-20 h-2 bg-base-200 rounded-full overflow-hidden">
					<div 
						class="h-full bg-primary transition-all duration-500"
						style="width: {cpuUsage}%"
					></div>
				</div>
				<span>{cpuUsage}%</span>
			</div>

			<!-- データベース接続 -->
			<div class="flex items-center gap-2">
				<span class="text-base-content/60">DB:</span>
				<span class="text-success">接続中</span>
			</div>
		</div>

		<div class="flex items-center gap-6">
			<!-- バージョン情報 -->
			<span class="text-base-content/60">v2.0.0</span>

			<!-- 現在時刻 -->
			<div class="flex items-center gap-2">
				<svg class="w-4 h-4 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span>{currentTime}</span>
			</div>
		</div>
	</div>
</footer>