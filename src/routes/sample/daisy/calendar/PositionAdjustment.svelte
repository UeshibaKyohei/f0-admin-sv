<script>
	import { onMount } from 'svelte';
	import { HighlightSvelte } from 'svelte-highlight';
	import 'svelte-highlight/styles/dark.css';

	export let copyToClipboard;
	export let copySuccess;

	// 各位置のデモ用input要素
	let bottomLeftInput;
	let bottomRightInput;
	let topLeftInput;
	let topRightInput;
	let autoAdjustInput;

	// サンプルコード
	const positionBasicCode = `<script>
  import { onMount } from 'svelte';
  
  let dateInput;
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    const picker = new Pikaday({
      field: dateInput,
      position: 'bottom left', // 表示位置を指定
      reposition: true, // 画面端での自動調整（デフォルト: true）
      format: 'YYYY-MM-DD'
    });
    
    return () => picker.destroy();
  });
<\/script>

<input 
  type="text" 
  class="input pika-single"
  placeholder="カレンダーは左下に表示"
  bind:this={dateInput}
/>`;

	const positionOptionsCode = `// 利用可能な位置オプション
const picker = new Pikaday({
  field: dateInput,
  
  // 基本の4方向
  position: 'bottom left',  // 入力欄の左下（デフォルト）
  position: 'bottom right', // 入力欄の右下
  position: 'top left',     // 入力欄の左上
  position: 'top right',    // 入力欄の右上
  
  // 自動調整オプション
  reposition: true,  // 画面端で自動的に位置を調整（デフォルト: true）
  reposition: false  // 常に指定した位置に固定
});`;

	const repositionDemoCode = `<script>
  import { onMount } from 'svelte';
  
  let dateInput;
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    const picker = new Pikaday({
      field: dateInput,
      position: 'bottom right',
      reposition: true, // 画面端では自動的に位置調整
      format: 'YYYY-MM-DD'
    });
    
    return () => picker.destroy();
  });
<\/script>

<!-- ページ右端に配置した場合、自動的に左側に表示される -->
<div class="flex justify-end">
  <input 
    type="text" 
    class="input pika-single"
    placeholder="画面端では位置が自動調整"
    bind:this={dateInput}
  />
</div>`;

	const containerWithPositionCode = `<script>
  import { onMount } from 'svelte';
  
  let dateInput;
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    const picker = new Pikaday({
      field: dateInput,
      container: dateInput.parentElement, // 親要素内に表示
      position: 'bottom right',
      format: 'YYYY-MM-DD'
    });
    
    return () => picker.destroy();
  });
<\/script>

<div class="form-control relative">
  <label class="label">
    <span class="label-text">相対位置での表示</span>
  </label>
  <input 
    type="text" 
    class="input pika-single"
    placeholder="親要素内に表示"
    bind:this={dateInput}
  />
</div>`;

	onMount(async () => {
		const Pikaday = (await import('pikaday')).default;

		// 各位置のデモを初期化
		if (bottomLeftInput) {
			new Pikaday({
				field: bottomLeftInput,
				position: 'bottom left',
				format: 'YYYY-MM-DD'
			});
		}

		if (bottomRightInput) {
			new Pikaday({
				field: bottomRightInput,
				position: 'bottom right',
				format: 'YYYY-MM-DD'
			});
		}

		if (topLeftInput) {
			new Pikaday({
				field: topLeftInput,
				position: 'top left',
				format: 'YYYY-MM-DD'
			});
		}

		if (topRightInput) {
			new Pikaday({
				field: topRightInput,
				position: 'top right',
				format: 'YYYY-MM-DD'
			});
		}

		if (autoAdjustInput) {
			new Pikaday({
				field: autoAdjustInput,
				position: 'bottom right',
				reposition: true,
				format: 'YYYY-MM-DD'
			});
		}
	});
</script>

<div class="space-y-8">
	<!-- セクションヘッダー -->
	<div class="text-center">
		<h2 class="mb-4 text-3xl font-bold">📍 カレンダー表示位置の調整</h2>
		<p class="text-base-content/70">Pikadayのpositionオプションを使った表示位置のコントロール</p>
	</div>

	<!-- 基本的な位置指定 -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h3 class="card-title">基本的な位置指定</h3>
					<p class="text-base-content/70 mt-1 text-sm">positionオプションで4方向の表示位置を指定</p>
				</div>
				<button
					class="btn btn-sm btn-ghost"
					on:click={() => copyToClipboard(positionBasicCode, 'position-basic')}
				>
					{#if copySuccess['position-basic']}
						<span class="text-success">✓ コピー完了</span>
					{:else}
						📋 コピー
					{/if}
				</button>
			</div>

			<!-- デモ -->
			<div class="bg-base-200 mb-4 rounded-lg p-6">
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="form-control">
						<label class="label">
							<span class="label-text">Bottom Left（デフォルト）</span>
						</label>
						<input
							type="text"
							class="input pika-single"
							placeholder="左下に表示"
							bind:this={bottomLeftInput}
						/>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text">Bottom Right</span>
						</label>
						<input
							type="text"
							class="input pika-single"
							placeholder="右下に表示"
							bind:this={bottomRightInput}
						/>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text">Top Left</span>
						</label>
						<input
							type="text"
							class="input pika-single"
							placeholder="左上に表示"
							bind:this={topLeftInput}
						/>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text">Top Right</span>
						</label>
						<input
							type="text"
							class="input pika-single"
							placeholder="右上に表示"
							bind:this={topRightInput}
						/>
					</div>
				</div>
			</div>

			<!-- コード表示切り替え -->
			<div class="collapse-arrow bg-base-200 collapse">
				<input type="checkbox" />
				<div class="collapse-title font-medium">コードを表示</div>
				<div class="collapse-content">
					<HighlightSvelte code={positionBasicCode} />
				</div>
			</div>
		</div>
	</div>

	<!-- 位置オプション一覧 -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h3 class="card-title">利用可能な位置オプション</h3>
					<p class="text-base-content/70 mt-1 text-sm">
						positionとrepositionオプションの組み合わせ
					</p>
				</div>
				<button
					class="btn btn-sm btn-ghost"
					on:click={() => copyToClipboard(positionOptionsCode, 'position-options')}
				>
					{#if copySuccess['position-options']}
						<span class="text-success">✓ コピー完了</span>
					{:else}
						📋 コピー
					{/if}
				</button>
			</div>

			<!-- コード表示切り替え -->
			<div class="collapse-arrow bg-base-200 collapse">
				<input type="checkbox" />
				<div class="collapse-title font-medium">コードを表示</div>
				<div class="collapse-content">
					<div class="mockup-code">
						<pre><code>{positionOptionsCode}</code></pre>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- 自動位置調整 -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h3 class="card-title">画面端での自動位置調整</h3>
					<p class="text-base-content/70 mt-1 text-sm">repositionオプションによる自動調整機能</p>
				</div>
				<button
					class="btn btn-sm btn-ghost"
					on:click={() => copyToClipboard(repositionDemoCode, 'reposition-demo')}
				>
					{#if copySuccess['reposition-demo']}
						<span class="text-success">✓ コピー完了</span>
					{:else}
						📋 コピー
					{/if}
				</button>
			</div>

			<!-- デモ -->
			<div class="bg-base-200 mb-4 rounded-lg p-6">
				<div class="alert alert-info mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="h-6 w-6 shrink-0 stroke-current"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						></path></svg
					>
					<span class="text-sm"
						>画面右端に配置されたinputは、カレンダーが画面外にはみ出さないよう自動的に位置が調整されます</span
					>
				</div>

				<div class="flex justify-end">
					<div class="form-control">
						<label class="label">
							<span class="label-text">右端での自動調整デモ</span>
						</label>
						<input
							type="text"
							class="input pika-single"
							placeholder="自動的に左側に表示"
							bind:this={autoAdjustInput}
						/>
					</div>
				</div>
			</div>

			<!-- コード表示切り替え -->
			<div class="collapse-arrow bg-base-200 collapse">
				<input type="checkbox" />
				<div class="collapse-title font-medium">コードを表示</div>
				<div class="collapse-content">
					<HighlightSvelte code={repositionDemoCode} />
				</div>
			</div>
		</div>
	</div>

	<!-- containerとpositionの組み合わせ -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h3 class="card-title">containerオプションとの組み合わせ</h3>
					<p class="text-base-content/70 mt-1 text-sm">親要素内での相対位置指定</p>
				</div>
				<button
					class="btn btn-sm btn-ghost"
					on:click={() => copyToClipboard(containerWithPositionCode, 'container-position')}
				>
					{#if copySuccess['container-position']}
						<span class="text-success">✓ コピー完了</span>
					{:else}
						📋 コピー
					{/if}
				</button>
			</div>

			<div class="alert alert-warning mb-4">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/></svg
				>
				<div>
					<p class="font-bold">注意</p>
					<p class="text-sm">
						containerオプションを使用する場合、親要素にposition: relativeが必要です
					</p>
				</div>
			</div>

			<!-- コード表示切り替え -->
			<div class="collapse-arrow bg-base-200 collapse">
				<input type="checkbox" />
				<div class="collapse-title font-medium">コードを表示</div>
				<div class="collapse-content">
					<HighlightSvelte code={containerWithPositionCode} />
				</div>
			</div>
		</div>
	</div>
</div>
