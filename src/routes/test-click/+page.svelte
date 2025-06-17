<script>
	let clickedItem = $state(null);
	
	function handleClick(value) {
		console.log('Button clicked, value:', value);
		clickedItem = value;
	}
</script>

<div class="p-8">
	<h1 class="text-2xl mb-4">クリックイベントテスト</h1>
	<p class="mb-4">clickedItem: {clickedItem}</p>
	
	<button 
		class="btn btn-primary"
		onclick={() => handleClick('test')}
	>
		クリックしてください
	</button>
	
	<button 
		class="btn btn-secondary ml-4"
		onclick={() => {
			console.log('Inline clicked');
			clickedItem = 'inline';
		}}
	>
		インラインクリック
	</button>
</div>