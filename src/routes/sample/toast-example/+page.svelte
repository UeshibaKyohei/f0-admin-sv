<script>
	import { toast } from '$lib/stores/toastStore.js';
	
	// 位置オプション
	const positions = [
		{ value: 'top-start', label: '左上' },
		{ value: 'top-center', label: '中央上' },
		{ value: 'top-end', label: '右上' },
		{ value: 'middle-start', label: '左中' },
		{ value: 'middle-center', label: '中央' },
		{ value: 'middle-end', label: '右中' },
		{ value: 'bottom-start', label: '左下' },
		{ value: 'bottom-center', label: '中央下' },
		{ value: 'bottom-end', label: '右下' }
	];
	
	let selectedPosition = $state('top-end');
	let customMessage = $state('カスタムメッセージ');
	let duration = $state(3000);
	
	// 各種通知のデモ
	function showSuccess() {
		toast.success('正常に保存されました！', {
			position: selectedPosition,
			duration: duration
		});
	}
	
	function showError() {
		toast.error('エラーが発生しました', {
			position: selectedPosition,
			duration: duration
		});
	}
	
	function showWarning() {
		toast.warning('注意が必要です', {
			position: selectedPosition,
			duration: duration
		});
	}
	
	function showInfo() {
		toast.info('お知らせがあります', {
			position: selectedPosition,
			duration: duration
		});
	}
	
	function showCustom() {
		toast.info(customMessage, {
			position: selectedPosition,
			duration: duration
		});
	}
	
	// 複数通知のデモ
	function showMultiple() {
		toast.success('1つ目の通知', { position: 'top-end' });
		setTimeout(() => {
			toast.info('2つ目の通知', { position: 'top-end' });
		}, 500);
		setTimeout(() => {
			toast.warning('3つ目の通知', { position: 'top-end' });
		}, 1000);
	}
	
	// 永続的な通知
	function showPersistent() {
		toast.warning('手動で閉じる必要があります', {
			position: selectedPosition,
			duration: 0 // 0 = 自動で消えない
		});
	}
	
	// 実用的な例
	function simulateSave() {
		// 保存処理をシミュレート
		const button = event.target;
		button.disabled = true;
		button.textContent = '保存中...';
		
		setTimeout(() => {
			toast.success('データを保存しました', {
				position: 'bottom-end'
			});
			button.disabled = false;
			button.textContent = '保存する';
		}, 1500);
	}
	
	function simulateDelete() {
		if (confirm('本当に削除しますか？')) {
			toast.error('アイテムを削除しました', {
				position: 'top-center'
			});
		}
	}
</script>

<div class="container mx-auto p-6 max-w-6xl">
	<h1 class="text-3xl font-bold mb-8">トースト通知のデモ</h1>
	
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- 設定パネル -->
		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title">通知設定</h2>
				
				<!-- 位置選択 -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">表示位置</span>
					</label>
					<select class="select select-bordered" bind:value={selectedPosition}>
						{#each positions as pos}
							<option value={pos.value}>{pos.label}</option>
						{/each}
					</select>
				</div>
				
				<!-- 表示時間 -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">表示時間（ミリ秒）</span>
						<span class="label-text-alt">{duration}ms</span>
					</label>
					<input 
						type="range" 
						min="1000" 
						max="10000" 
						step="500"
						bind:value={duration}
						class="range range-primary" 
					/>
					<div class="w-full flex justify-between text-xs px-2 mt-1">
						<span>1秒</span>
						<span>5秒</span>
						<span>10秒</span>
					</div>
				</div>
				
				<!-- カスタムメッセージ -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">カスタムメッセージ</span>
					</label>
					<input 
						type="text" 
						placeholder="メッセージを入力" 
						class="input input-bordered"
						bind:value={customMessage}
					/>
				</div>
			</div>
		</div>
		
		<!-- 通知タイプ -->
		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title">通知タイプ</h2>
				
				<div class="space-y-3">
					<button class="btn btn-success btn-block" onclick={showSuccess}>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
						成功通知
					</button>
					
					<button class="btn btn-error btn-block" onclick={showError}>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
						エラー通知
					</button>
					
					<button class="btn btn-warning btn-block" onclick={showWarning}>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
						</svg>
						警告通知
					</button>
					
					<button class="btn btn-info btn-block" onclick={showInfo}>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
						情報通知
					</button>
					
					<button class="btn btn-secondary btn-block" onclick={showCustom}>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
						</svg>
						カスタム通知
					</button>
				</div>
			</div>
		</div>
		
		<!-- 特殊な例 -->
		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title">特殊な例</h2>
				
				<div class="space-y-3">
					<button class="btn btn-outline btn-block" onclick={showMultiple}>
						複数の通知を表示
					</button>
					
					<button class="btn btn-outline btn-block" onclick={showPersistent}>
						手動で閉じる通知
					</button>
					
					<button class="btn btn-outline btn-block" onclick={() => toast.clear()}>
						すべての通知をクリア
					</button>
				</div>
			</div>
		</div>
		
		<!-- 実用的な例 -->
		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title">実用的な例</h2>
				
				<div class="space-y-3">
					<button class="btn btn-primary btn-block" onclick={simulateSave}>
						保存する
					</button>
					
					<button class="btn btn-error btn-outline btn-block" onclick={simulateDelete}>
						削除する
					</button>
					
					<div class="divider">フォームの例</div>
					
					<form onsubmit={(e) => {
						e.preventDefault();
						toast.success('フォームを送信しました', {
							position: 'top-center'
						});
					}}>
						<div class="form-control">
							<input 
								type="email" 
								placeholder="メールアドレス" 
								class="input input-bordered"
								required
							/>
						</div>
						<button type="submit" class="btn btn-primary btn-sm mt-2">
							送信
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>
	
	<!-- 使い方 -->
	<div class="card bg-base-200 mt-6">
		<div class="card-body">
			<h2 class="card-title">使い方</h2>
			
			<div class="mockup-code">
				<pre data-prefix="1"><code>import { toast } from '$lib/stores/toastStore.js';</code></pre>
				<pre data-prefix="2"><code></code></pre>
				<pre data-prefix="3"><code>// 基本的な使い方</code></pre>
				<pre data-prefix="4"><code>toast.success('保存しました');</code></pre>
				<pre data-prefix="5"><code>toast.error('エラーが発生しました');</code></pre>
				<pre data-prefix="6"><code>toast.warning('注意が必要です');</code></pre>
				<pre data-prefix="7"><code>toast.info('お知らせ');</code></pre>
				<pre data-prefix="8"><code></code></pre>
				<pre data-prefix="9"><code>// オプション付き</code></pre>
				<pre data-prefix="10"><code>toast.success('保存しました', {</code></pre>
				<pre data-prefix="11"><code>  position: 'bottom-end',</code></pre>
				<pre data-prefix="12"><code>  duration: 5000</code></pre>
				<pre data-prefix="13"><code>});</code></pre>
			</div>
		</div>
	</div>
</div>