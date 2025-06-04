<script>
  import { categories, tags } from './stores/itemStore.js';
  import { toggleProductSelection } from './stores/uiStore.js';
  
  let { 
    products = [], 
    viewMode = 'grid',
    selectedProducts = [],
    onSelectAll = () => {},
    onProductClick = () => {}
  } = $props();
  
  // 在庫ステータスのバッジクラスを取得
  function getStockBadgeClass(status) {
    switch (status) {
      case 'in_stock': return 'badge-success';
      case 'low_stock': return 'badge-warning';
      case 'out_of_stock': return 'badge-error';
      default: return '';
    }
  }
  
  // 在庫ステータスのラベルを取得
  function getStockLabel(status) {
    switch (status) {
      case 'in_stock': return '在庫あり';
      case 'low_stock': return '在庫少';
      case 'out_of_stock': return '在庫切れ';
      default: return '';
    }
  }
  
  // 商品ステータスのバッジクラスを取得
  function getStatusBadgeClass(status) {
    switch (status) {
      case 'active': return 'badge-primary';
      case 'inactive': return 'badge-ghost';
      case 'discontinued': return 'badge-error';
      default: return '';
    }
  }
  
  // 商品ステータスのラベルを取得
  function getStatusLabel(status) {
    switch (status) {
      case 'active': return '販売中';
      case 'inactive': return '非公開';
      case 'discontinued': return '販売終了';
      default: return '';
    }
  }
  
  // カテゴリー名を取得
  function getCategoryName(categoryId) {
    const category = $categories.find(c => c.id === categoryId);
    return category ? category.name : '未分類';
  }
  
  // タグ情報を取得
  function getTag(tagId) {
    return $tags.find(t => t.id === tagId);
  }
  
  // 全選択状態を確認
  const isAllSelected = $derived(
    products.length > 0 && products.every(p => selectedProducts.includes(p.id))
  );
</script>

{#if viewMode === 'grid'}
  <!-- グリッドビュー -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {#each products as product}
      <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
        <figure class="relative">
          {#if product.images.length > 0}
            <img 
              src={product.images[0].url} 
              alt={product.images[0].alt}
              class="w-full h-48 object-cover"
            />
          {:else}
            <div class="w-full h-48 bg-base-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          {/if}
          
          <!-- 選択チェックボックス -->
          <div class="absolute top-2 left-2">
            <input 
              type="checkbox" 
              class="checkbox checkbox-primary"
              checked={selectedProducts.includes(product.id)}
              onclick={(e) => {
                e.stopPropagation();
                toggleProductSelection(product.id);
              }}
            />
          </div>
          
          <!-- ステータスバッジ -->
          <div class="absolute top-2 right-2">
            <div class="badge {getStatusBadgeClass(product.status)} badge-sm">
              {getStatusLabel(product.status)}
            </div>
          </div>
        </figure>
        
        <div class="card-body" onclick={() => onProductClick(product)}>
          <h3 class="card-title text-base line-clamp-2">{product.name}</h3>
          
          <div class="text-sm text-base-content/70 mb-2">
            {getCategoryName(product.categoryId)}
          </div>
          
          <div class="flex flex-wrap gap-1 mb-2">
            {#each product.tags as tagId}
              {@const tag = getTag(tagId)}
              {#if tag}
                <div class="badge {tag.color} badge-xs">{tag.name}</div>
              {/if}
            {/each}
          </div>
          
          <div class="flex justify-between items-end">
            <div>
              <div class="text-2xl font-bold text-primary">
                ¥{product.price.toLocaleString()}
              </div>
              <div class="text-sm text-base-content/70">
                在庫: {product.stock}
              </div>
            </div>
            
            <div class="badge {getStockBadgeClass(product.stockStatus)} whitespace-nowrap">
              {getStockLabel(product.stockStatus)}
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
{:else}
  <!-- リストビュー -->
  <div class="overflow-x-auto">
    <table class="table table-zebra">
      <thead>
        <tr>
          <th>
            <label>
              <input 
                type="checkbox" 
                class="checkbox"
                checked={isAllSelected}
                onchange={onSelectAll}
              />
            </label>
          </th>
          <th>画像</th>
          <th>商品名</th>
          <th>カテゴリー</th>
          <th>価格</th>
          <th>在庫</th>
          <th>ステータス</th>
          <th>タグ</th>
          <th>更新日</th>
        </tr>
      </thead>
      <tbody>
        {#each products as product}
          <tr class="hover cursor-pointer" onclick={() => onProductClick(product)}>
            <th onclick={(e) => e.stopPropagation()}>
              <label>
                <input 
                  type="checkbox" 
                  class="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onchange={() => toggleProductSelection(product.id)}
                />
              </label>
            </th>
            <td>
              {#if product.images.length > 0}
                <div class="avatar">
                  <div class="w-12 h-12 rounded">
                    <img src={product.images[0].url} alt={product.images[0].alt} />
                  </div>
                </div>
              {:else}
                <div class="avatar placeholder">
                  <div class="w-12 h-12 rounded bg-base-200 text-base-content/30">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              {/if}
            </td>
            <td>
              <div class="font-bold">{product.name}</div>
              <div class="text-sm text-base-content/70 line-clamp-1">{product.description}</div>
            </td>
            <td>{getCategoryName(product.categoryId)}</td>
            <td class="font-mono">¥{product.price.toLocaleString()}</td>
            <td>
              <div class="flex items-center gap-2">
                <span>{product.stock}</span>
                <div class="badge {getStockBadgeClass(product.stockStatus)} badge-sm">
                  {getStockLabel(product.stockStatus)}
                </div>
              </div>
            </td>
            <td>
              <div class="badge {getStatusBadgeClass(product.status)}">
                {getStatusLabel(product.status)}
              </div>
            </td>
            <td>
              <div class="flex flex-wrap gap-1">
                {#each product.tags as tagId}
                  {@const tag = getTag(tagId)}
                  {#if tag}
                    <div class="badge {tag.color} badge-xs">{tag.name}</div>
                  {/if}
                {/each}
              </div>
            </td>
            <td>
              <div class="text-sm">
                {new Date(product.updatedAt).toLocaleDateString('ja-JP')}
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}