<script>
	let {
		searchQuery = $bindable(''),
		selectedCategory = $bindable('all'),
		priceRange = $bindable({ min: 0, max: 10000 }),
		stockFilter = $bindable('all'),
		sortBy = $bindable('name'),
		sortOrder = $bindable('asc'),
		categories = []
	} = $props();

	let showAdvancedFilters = $state(false);
	let searchInput = $state();
	let debounceTimer;

	// Debounced search
	function handleSearch(value) {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			searchQuery = value;
		}, 300);
	}

	// Reset filters
	function resetFilters() {
		searchQuery = '';
		selectedCategory = 'all';
		priceRange = { min: 0, max: 10000 };
		stockFilter = 'all';
		sortBy = 'name';
		sortOrder = 'asc';
		if (searchInput) searchInput.value = '';
	}

	// Price range formatter
	function formatPrice(value) {
		return new Intl.NumberFormat('ja-JP', {
			style: 'currency',
			currency: 'JPY',
			maximumFractionDigits: 0
		}).format(value);
	}
</script>

<div class="bg-base-200 mb-6 rounded-lg p-4">
	<!-- Basic Filters -->
	<div class="mb-4 flex flex-col gap-4 lg:flex-row">
		<!-- Search -->
		<div class="form-control flex-1">
			<label class="input input-bordered flex items-center gap-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4 opacity-70"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
				<input
					type="search"
					placeholder="商品名またはSKUで検索..."
					class="grow"
					bind:this={searchInput}
					oninput={(e) => handleSearch(e.target.value)}
				/>
			</label>
		</div>

		<!-- Category -->
		<select class="select select-bordered" bind:value={selectedCategory}>
			<option value="all">すべてのカテゴリ</option>
			{#each categories.slice(1) as category}
				<option value={category}>{category}</option>
			{/each}
		</select>

		<!-- Stock Status -->
		<select class="select select-bordered" bind:value={stockFilter}>
			<option value="all">すべての在庫状態</option>
			<option value="in-stock">在庫あり</option>
			<option value="low-stock">在庫少</option>
			<option value="out-of-stock">在庫なし</option>
		</select>

		<!-- Sort -->
		<div class="join">
			<select class="select select-bordered join-item" bind:value={sortBy}>
				<option value="name">商品名</option>
				<option value="price">価格</option>
				<option value="stock">在庫数</option>
				<option value="createdAt">登録日</option>
			</select>
			<button
				class="btn btn-square join-item"
				onclick={() => (sortOrder = sortOrder === 'asc' ? 'desc' : 'asc')}
			>
				{#if sortOrder === 'asc'}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
						/>
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
						/>
					</svg>
				{/if}
			</button>
		</div>
	</div>

	<!-- Advanced Filters Toggle -->
	<div class="flex items-center justify-between">
		<button
			class="btn btn-ghost btn-sm"
			onclick={() => (showAdvancedFilters = !showAdvancedFilters)}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mr-1 h-4 w-4 transition-transform"
				class:rotate-180={showAdvancedFilters}
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
			詳細フィルター
		</button>

		<button class="btn btn-ghost btn-sm" onclick={resetFilters}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mr-1 h-4 w-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
				/>
			</svg>
			リセット
		</button>
	</div>

	<!-- Advanced Filters -->
	{#if showAdvancedFilters}
		<div class="divider my-2"></div>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<!-- Price Range -->
			<div class="form-control">
				<label class="label">
					<span class="label-text">価格帯</span>
					<span class="label-text-alt">
						{formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
					</span>
				</label>
				<div class="flex items-center gap-2">
					<input
						type="range"
						min="0"
						max="10000"
						step="100"
						class="range range-sm flex-1"
						bind:value={priceRange.min}
					/>
					<span class="w-20 text-right text-sm">{formatPrice(priceRange.min)}</span>
				</div>
				<div class="mt-2 flex items-center gap-2">
					<input
						type="range"
						min="0"
						max="10000"
						step="100"
						class="range range-sm flex-1"
						bind:value={priceRange.max}
					/>
					<span class="w-20 text-right text-sm">{formatPrice(priceRange.max)}</span>
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="form-control">
				<label class="label">
					<span class="label-text">クイックフィルター</span>
				</label>
				<div class="flex flex-wrap gap-2">
					<button
						class="btn btn-xs"
						class:btn-primary={stockFilter === 'low-stock'}
						onclick={() => (stockFilter = stockFilter === 'low-stock' ? 'all' : 'low-stock')}
					>
						在庫少商品のみ
					</button>
					<button
						class="btn btn-xs"
						onclick={() => {
							priceRange = { min: 5000, max: 10000 };
						}}
					>
						高額商品
					</button>
					<button
						class="btn btn-xs"
						onclick={() => {
							const today = new Date();
							const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
							// This would require a date filter implementation
						}}
					>
						新着商品
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.rotate-180 {
		transform: rotate(180deg);
	}
</style>
