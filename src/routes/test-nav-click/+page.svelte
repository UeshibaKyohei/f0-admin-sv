<script>
	let clickedItem = $state(null);
	let hoveredItem = $state(null);
	
	const items = [
		{ id: 'item1', name: 'Item 1' },
		{ id: 'item2', name: 'Item 2' },
		{ id: 'item3', name: 'Item 3' }
	];
</script>

<div class="p-8">
	<h1 class="text-2xl mb-4">ナビゲーションクリックテスト</h1>
	<div class="mb-4">
		<p>clickedItem: {clickedItem || 'なし'}</p>
		<p>hoveredItem: {hoveredItem || 'なし'}</p>
	</div>
	
	<div class="flex gap-4">
		<div class="w-16 bg-base-200 p-2">
			{#each items as item}
				<div class="relative mb-2">
					<button
						class="btn btn-sm w-full"
						onmouseenter={() => {
							console.log('Mouse enter:', item.id);
							hoveredItem = item.id;
						}}
						onmouseleave={() => {
							console.log('Mouse leave:', item.id);
							hoveredItem = null;
						}}
						onclick={() => {
							console.log('Clicked:', item.id);
							if (clickedItem === item.id) {
								clickedItem = null;
							} else {
								clickedItem = item.id;
							}
						}}
					>
						{item.id}
					</button>
					
					{#if hoveredItem === item.id || clickedItem === item.id}
						<div class="absolute left-full ml-2 top-0 bg-primary text-primary-content p-4 rounded">
							{item.name} のサブメニュー
						</div>
					{/if}
				</div>
			{/each}
		</div>
		
		<div class="flex-1">
			<p>左のボタンをクリックまたはホバーしてください</p>
		</div>
	</div>
</div>