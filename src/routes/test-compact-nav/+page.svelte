<script>
	import CompactNav from '../CompactNav.svelte';
	
	let expanded = $state(false);
</script>

<div class="flex h-screen">
	<CompactNav bind:expanded />
	<div class="flex-1 p-8">
		<h1 class="text-2xl font-bold mb-4">CompactNavのテスト</h1>
		<p>左側のナビゲーションで、閉じた状態でサブメニューアイコンをクリックしてみてください。</p>
		<p class="mt-4">現在の状態: {expanded ? '展開' : '閉じている'}</p>
	</div>
</div>