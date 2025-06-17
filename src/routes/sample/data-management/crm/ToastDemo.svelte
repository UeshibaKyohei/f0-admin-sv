<script>
	import { toast } from '$lib/stores/toastStore.js';
	
	// デモ用のメッセージ
	const demoMessages = {
		success: '保存が完了しました',
		error: 'エラーが発生しました',
		warning: '確認が必要です',
		info: '新しいメッセージがあります'
	};
	
	// 位置オプション
	const positions = [
		{ value: 'top', label: '上部中央' },
		{ value: 'top-start', label: '上部左' },
		{ value: 'top-end', label: '上部右' },
		{ value: 'middle', label: '中央' },
		{ value: 'middle-start', label: '中央左' },
		{ value: 'middle-end', label: '中央右' },
		{ value: 'bottom', label: '下部中央' },
		{ value: 'bottom-start', label: '下部左' },
		{ value: 'bottom-end', label: '下部右' }
	];
	
	// デモ設定
	let selectedType = $state('success');
	let selectedPosition = $state('top-end');
	let customMessage = $state('');
	let duration = $state(3000);
	
	// トースト表示
	function showToast() {
		const message = customMessage || demoMessages[selectedType];
		toast[selectedType](message, {
			position: selectedPosition,
			duration: duration
		});
	}
	
	// 複数のトーストを表示
	function showMultiple() {
		toast.success('処理1が完了しました', { position: selectedPosition });
		setTimeout(() => {
			toast.info('処理2を実行中です', { position: selectedPosition });
		}, 500);
		setTimeout(() => {
			toast.success('全ての処理が完了しました', { position: selectedPosition });
		}, 1000);
	}
	
	// 永続的なトースト（手動で閉じる）
	function showPersistent() {
		toast.warning('この通知は手動で閉じる必要があります', {
			position: selectedPosition,
			duration: 0 // 0 = 自動で消えない
		});
	}
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h3 class="card-title text-lg">トースト通知デモ</h3>
		
		<div class="space-y-4">
			<!-- トーストタイプ選択 -->
			<div class="form-control">
				<label class="label">
					<span class="label-text">通知タイプ</span>
				</label>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
					<label class="label cursor-pointer">
						<input
							type="radio"
							name="type"
							class="radio radio-success"
							value="success"
							bind:group={selectedType}
						/>
						<span class="label-text">成功</span>
					</label>
					<label class="label cursor-pointer">
						<input
							type="radio"
							name="type"
							class="radio radio-error"
							value="error"
							bind:group={selectedType}
						/>
						<span class="label-text">エラー</span>
					</label>
					<label class="label cursor-pointer">
						<input
							type="radio"
							name="type"
							class="radio radio-warning"
							value="warning"
							bind:group={selectedType}
						/>
						<span class="label-text">警告</span>
					</label>
					<label class="label cursor-pointer">
						<input
							type="radio"
							name="type"
							class="radio radio-info"
							value="info"
							bind:group={selectedType}
						/>
						<span class="label-text">情報</span>
					</label>
				</div>
			</div>
			
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
					<span class="label-text">表示時間: {duration}ms</span>
				</label>
				<input
					type="range"
					min="1000"
					max="10000"
					step="1000"
					class="range"
					bind:value={duration}
				/>
				<div class="flex w-full justify-between px-2 text-xs">
					<span>1秒</span>
					<span>5秒</span>
					<span>10秒</span>
				</div>
			</div>
			
			<!-- カスタムメッセージ -->
			<div class="form-control">
				<label class="label">
					<span class="label-text">カスタムメッセージ（任意）</span>
				</label>
				<input
					type="text"
					placeholder="メッセージを入力..."
					class="input input-bordered"
					bind:value={customMessage}
				/>
			</div>
			
			<!-- アクションボタン -->
			<div class="flex flex-wrap gap-2">
				<button class="btn btn-primary" onclick={showToast}>
					トーストを表示
				</button>
				<button class="btn btn-secondary" onclick={showMultiple}>
					複数表示
				</button>
				<button class="btn btn-warning" onclick={showPersistent}>
					永続表示
				</button>
				<button class="btn btn-ghost" onclick={() => toast.clear()}>
					全てクリア
				</button>
			</div>
		</div>
		
		<!-- 使用例 -->
		<div class="divider">使用例</div>
		
		<div class="mockup-code">
			<pre data-prefix="1"><code>import {'{'}' toast {'}'} from '$lib/stores/toastStore.js';</code></pre>
			<pre data-prefix="2"><code></code></pre>
			<pre data-prefix="3"><code>// 成功通知</code></pre>
			<pre data-prefix="4"><code>toast.success('保存しました');</code></pre>
			<pre data-prefix="5"><code></code></pre>
			<pre data-prefix="6"><code>// オプション付き</code></pre>
			<pre data-prefix="7"><code>toast.error('エラーが発生しました', {'{'}</code></pre>
			<pre data-prefix="8"><code>  position: 'top-end',</code></pre>
			<pre data-prefix="9"><code>  duration: 5000</code></pre>
			<pre data-prefix="10"><code>{'}'});</code></pre>
		</div>
	</div>
</div>