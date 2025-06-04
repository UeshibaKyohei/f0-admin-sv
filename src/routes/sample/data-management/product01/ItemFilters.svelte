<script>
  import { categories, tags, categoryTree } from './stores/itemStore.js';
  import { filters, updateFilter } from './stores/uiStore.js';
  
  let searchInput = $state($filters.search);
  let selectedCategory = $state($filters.categoryId);
  let selectedTags = $state([...$filters.tags]);
  let selectedStockStatus = $state([...$filters.stockStatus]);
  let selectedStatus = $state([...$filters.status]);
  let minPrice = $state($filters.priceRange.min);
  let maxPrice = $state($filters.priceRange.max);
  let sortBy = $state($filters.sortBy);
  let sortOrder = $state($filters.sortOrder);
  
  // フィルターの適用
  function applyFilters() {
    updateFilter('search', searchInput);
    updateFilter('categoryId', selectedCategory);
    updateFilter('tags', selectedTags);
    updateFilter('stockStatus', selectedStockStatus);
    updateFilter('status', selectedStatus);
    updateFilter('priceRange', { min: minPrice, max: maxPrice });
    updateFilter('sortBy', sortBy);
    updateFilter('sortOrder', sortOrder);
  }
  
  // リアルタイム検索
  $effect(() => {
    updateFilter('search', searchInput);
  });
  
  // その他のフィルターは変更時に即座に適用
  $effect(() => {
    updateFilter('categoryId', selectedCategory);
  });
  
  $effect(() => {
    updateFilter('tags', [...selectedTags]);
  });
  
  $effect(() => {
    updateFilter('stockStatus', [...selectedStockStatus]);
  });
  
  $effect(() => {
    updateFilter('status', [...selectedStatus]);
  });
  
  $effect(() => {
    updateFilter('sortBy', sortBy);
  });
  
  $effect(() => {
    updateFilter('sortOrder', sortOrder);
  });
  
  // カテゴリーツリーをフラットなリストに変換
  function flattenCategories(categories, prefix = '') {
    let flat = [];
    categories.forEach(cat => {
      flat.push({ ...cat, displayName: prefix + cat.name });
      if (cat.children && cat.children.length > 0) {
        flat = flat.concat(flattenCategories(cat.children, prefix + '　'));
      }
    });
    return flat;
  }
  
  const flatCategories = $derived(flattenCategories($categoryTree));
  
  // タグの選択を切り替え
  function toggleTag(tagId) {
    if (selectedTags.includes(tagId)) {
      selectedTags = selectedTags.filter(id => id !== tagId);
    } else {
      selectedTags = [...selectedTags, tagId];
    }
  }
  
  // 在庫ステータスの選択を切り替え
  function toggleStockStatus(status) {
    if (selectedStockStatus.includes(status)) {
      selectedStockStatus = selectedStockStatus.filter(s => s !== status);
    } else {
      selectedStockStatus = [...selectedStockStatus, status];
    }
  }
  
  // 商品ステータスの選択を切り替え
  function toggleStatus(status) {
    if (selectedStatus.includes(status)) {
      selectedStatus = selectedStatus.filter(s => s !== status);
    } else {
      selectedStatus = [...selectedStatus, status];
    }
  }
</script>

<div class="space-y-4">
  <!-- 検索とソート -->
  <div class="flex flex-wrap gap-4">
    <div class="flex-1 min-w-[200px]">
      <div class="form-control">
        <label class="label">
          <span class="label-text">商品検索</span>
        </label>
        <div class="relative">
          <input 
            type="text" 
            bind:value={searchInput}
            placeholder="商品名または説明で検索..."
            class="input input-bordered w-full pr-10"
          />
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
    
    <div class="w-48">
      <div class="form-control">
        <label class="label">
          <span class="label-text">並び順</span>
        </label>
        <select bind:value={sortBy} class="select select-bordered">
          <option value="name">商品名</option>
          <option value="price">価格</option>
          <option value="stock">在庫数</option>
          <option value="createdAt">作成日</option>
          <option value="updatedAt">更新日</option>
        </select>
      </div>
    </div>
    
    <div class="w-32">
      <div class="form-control">
        <label class="label">
          <span class="label-text">順序</span>
        </label>
        <select bind:value={sortOrder} class="select select-bordered">
          <option value="asc">昇順</option>
          <option value="desc">降順</option>
        </select>
      </div>
    </div>
  </div>
  
  <!-- 詳細フィルター -->
  <details class="collapse collapse-arrow bg-base-200">
    <summary class="collapse-title font-medium">
      詳細フィルター
      {#if selectedCategory || selectedTags.length > 0 || selectedStockStatus.length > 0 || selectedStatus.length > 0 || minPrice || maxPrice}
        <span class="badge badge-primary badge-sm ml-2">適用中</span>
      {/if}
    </summary>
    <div class="collapse-content">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        <!-- カテゴリー -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">カテゴリー</span>
          </label>
          <select bind:value={selectedCategory} class="select select-bordered select-sm">
            <option value={null}>すべて</option>
            {#each flatCategories as category}
              <option value={category.id}>{category.displayName}</option>
            {/each}
          </select>
        </div>
        
        <!-- 価格範囲 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">価格範囲</span>
          </label>
          <div class="flex gap-2 items-center">
            <input 
              type="number" 
              bind:value={minPrice}
              placeholder="最小"
              class="input input-bordered input-sm w-24"
              onchange={applyFilters}
            />
            <span>〜</span>
            <input 
              type="number" 
              bind:value={maxPrice}
              placeholder="最大"
              class="input input-bordered input-sm w-24"
              onchange={applyFilters}
            />
          </div>
        </div>
      </div>
      
      <!-- タグ -->
      <div class="form-control mt-4">
        <label class="label">
          <span class="label-text">タグ</span>
        </label>
        <div class="flex flex-wrap gap-2">
          {#each $tags as tag}
            <label class="cursor-pointer">
              <input 
                type="checkbox" 
                class="checkbox checkbox-xs"
                checked={selectedTags.includes(tag.id)}
                onchange={() => toggleTag(tag.id)}
              />
              <span class="badge {tag.color} ml-1">{tag.name}</span>
            </label>
          {/each}
        </div>
      </div>
      
      <!-- 在庫ステータス -->
      <div class="form-control mt-4">
        <label class="label">
          <span class="label-text">在庫ステータス</span>
        </label>
        <div class="flex flex-wrap gap-4">
          <label class="cursor-pointer flex items-center">
            <input 
              type="checkbox" 
              class="checkbox checkbox-success checkbox-sm"
              checked={selectedStockStatus.includes('in_stock')}
              onchange={() => toggleStockStatus('in_stock')}
            />
            <span class="ml-2">在庫あり</span>
          </label>
          <label class="cursor-pointer flex items-center">
            <input 
              type="checkbox" 
              class="checkbox checkbox-warning checkbox-sm"
              checked={selectedStockStatus.includes('low_stock')}
              onchange={() => toggleStockStatus('low_stock')}
            />
            <span class="ml-2">在庫少</span>
          </label>
          <label class="cursor-pointer flex items-center">
            <input 
              type="checkbox" 
              class="checkbox checkbox-error checkbox-sm"
              checked={selectedStockStatus.includes('out_of_stock')}
              onchange={() => toggleStockStatus('out_of_stock')}
            />
            <span class="ml-2">在庫切れ</span>
          </label>
        </div>
      </div>
      
      <!-- 商品ステータス -->
      <div class="form-control mt-4">
        <label class="label">
          <span class="label-text">商品ステータス</span>
        </label>
        <div class="flex flex-wrap gap-4">
          <label class="cursor-pointer flex items-center">
            <input 
              type="checkbox" 
              class="checkbox checkbox-primary checkbox-sm"
              checked={selectedStatus.includes('active')}
              onchange={() => toggleStatus('active')}
            />
            <span class="ml-2">販売中</span>
          </label>
          <label class="cursor-pointer flex items-center">
            <input 
              type="checkbox" 
              class="checkbox checkbox-sm"
              checked={selectedStatus.includes('inactive')}
              onchange={() => toggleStatus('inactive')}
            />
            <span class="ml-2">非公開</span>
          </label>
          <label class="cursor-pointer flex items-center">
            <input 
              type="checkbox" 
              class="checkbox checkbox-error checkbox-sm"
              checked={selectedStatus.includes('discontinued')}
              onchange={() => toggleStatus('discontinued')}
            />
            <span class="ml-2">販売終了</span>
          </label>
        </div>
      </div>
    </div>
  </details>
</div>