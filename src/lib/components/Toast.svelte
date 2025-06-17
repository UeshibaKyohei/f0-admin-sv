<script>
	import { toast, toastPositions } from '$lib/stores/toastStore.js';
	import { fly, fade } from 'svelte/transition';
	
	// 位置ごとにトーストをグループ化
	const toastsByPosition = $derived.by(() => {
		const grouped = {};
		$toast.forEach(t => {
			if (!grouped[t.position]) {
				grouped[t.position] = [];
			}
			grouped[t.position].push(t);
		});
		return grouped;
	});
	
	// タイプに応じたアイコンとクラスを取得
	function getToastStyle(type) {
		switch (type) {
			case 'success':
				return {
					alertClass: 'alert-success',
					icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
				};
			case 'error':
				return {
					alertClass: 'alert-error',
					icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
				};
			case 'warning':
				return {
					alertClass: 'alert-warning',
					icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
				};
			case 'info':
			default:
				return {
					alertClass: 'alert-info',
					icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
				};
		}
	}
</script>

<!-- トーストコンテナ -->
{#each Object.entries(toastsByPosition) as [position, toasts]}
	<div class="toast {toastPositions[position]}">
		{#each toasts as item (item.id)}
			{@const style = getToastStyle(item.type)}
			<div 
				class="alert {style.alertClass} shadow-lg max-w-sm"
				in:fly={{ y: -20, duration: 300 }}
				out:fade={{ duration: 200 }}
			>
				<!-- アイコン -->
				<svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={style.icon}></path>
				</svg>
				
				<!-- メッセージ -->
				<span class="text-sm font-medium">{item.message}</span>
				
				<!-- 手動で閉じるボタン（自動消去しない場合のみ表示） -->
				{#if item.duration === 0}
					<button 
						class="btn btn-ghost btn-xs"
						onclick={() => toast.dismiss(item.id)}
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
					</button>
				{/if}
			</div>
		{/each}
	</div>
{/each}

<style>
	/* トーストの基本スタイル */
	.toast {
		z-index: 9999;
		pointer-events: none;
	}
	
	.toast > * {
		pointer-events: auto;
	}
	
	/* レスポンシブ対応 */
	@media (max-width: 640px) {
		.alert {
			max-width: calc(100vw - 2rem);
		}
	}
</style>