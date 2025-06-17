<script lang="ts">
	let clickedItem = $state<string | null>(null);
	let hoveredItem = $state<string | null>(null);
	
	const testItems = [
		{ path: '/test1', text: 'Test 1' },
		{ path: '/test2', text: 'Test 2' }
	];
	
	function handleClick(path: string) {
		console.log('Click event fired for:', path);
		if (clickedItem === path) {
			clickedItem = null;
		} else {
			clickedItem = path;
		}
	}
</script>

<div class="p-8">
	<h2 class="text-xl font-bold mb-4">クリックテスト</h2>
	<p class="mb-4">現在のclickedItem: {clickedItem || 'なし'}</p>
	<p class="mb-4">現在のhoveredItem: {hoveredItem || 'なし'}</p>
	
	{#each testItems as item}
		<div class="relative mb-2">
			<button
				class="btn btn-sm"
				onmouseenter={() => (hoveredItem = item.path)}
				onmouseleave={() => (hoveredItem = null)}
				onclick={() => handleClick(item.path)}
			>
				{item.text}
			</button>
			
			{#if hoveredItem === item.path || clickedItem === item.path}
				<div class="absolute left-full ml-2 top-0 bg-base-200 p-2 rounded">
					サブメニュー for {item.text}
				</div>
			{/if}
		</div>
	{/each}
</div>