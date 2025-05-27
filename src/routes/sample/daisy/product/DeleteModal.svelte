<script>
  import { onMount } from 'svelte';
  
  let { 
    products = [],
    onConfirm,
    onClose
  } = $props();
  
  let modalRef = $state();
  let isDeleting = $state(false);
  
  // Calculate total value that will be lost
  const totalValue = $derived(
    products.reduce((sum, product) => sum + (product.price * product.stock), 0)
  );
  
  // Show modal on mount
  onMount(() => {
    if (modalRef) {
      modalRef.showModal();
    }
  });
  
  // Handle delete confirmation
  async function handleDelete() {
    isDeleting = true;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onConfirm();
    closeModal();
  }
  
  // Close modal handler
  function closeModal() {
    modalRef?.close();
    setTimeout(onClose, 200); // Wait for animation
  }
  
  // Format price
  function formatPrice(price) {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(price);
  }
</script>

<!-- DaisyUI Modal using dialog element -->
<dialog bind:this={modalRef} class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <!-- Warning Icon -->
    <div class="flex justify-center mb-4">
      <div class="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
    </div>
    
    <!-- Title -->
    <h3 class="font-bold text-lg text-center mb-4">
      {products.length}件の商品を削除しますか？
    </h3>
    
    <!-- Warning Message -->
    <div class="alert alert-warning mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div>
        <div class="text-sm">この操作は取り消せません</div>
        <div class="text-xs opacity-70">削除後は復元できませんのでご注意ください</div>
      </div>
    </div>
    
    <!-- Product Summary -->
    {#if products.length === 1}
      <!-- Single Product -->
      {@const product = products[0]}
      <div class="card card-compact bg-base-200 mb-4">
        <div class="card-body">
          <div class="flex items-center gap-4">
            <div class="avatar">
              <div class="w-16 rounded">
                <img src={product.image} alt={product.name} />
              </div>
            </div>
            <div class="flex-1">
              <h4 class="font-semibold">{product.name}</h4>
              <p class="text-sm opacity-70">SKU: {product.sku}</p>
              <div class="flex gap-4 text-sm mt-1">
                <span>在庫: {product.stock}個</span>
                <span>価格: {formatPrice(product.price)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Multiple Products Summary -->
      <div class="stats stats-vertical lg:stats-horizontal shadow w-full mb-4">
        <div class="stat">
          <div class="stat-title">削除商品数</div>
          <div class="stat-value text-error">{products.length}</div>
          <div class="stat-desc">商品</div>
        </div>
        
        <div class="stat">
          <div class="stat-title">在庫総数</div>
          <div class="stat-value text-warning">
            {products.reduce((sum, p) => sum + p.stock, 0)}
          </div>
          <div class="stat-desc">個</div>
        </div>
        
        <div class="stat">
          <div class="stat-title">在庫総額</div>
          <div class="stat-value text-sm">{formatPrice(totalValue)}</div>
          <div class="stat-desc">の損失</div>
        </div>
      </div>
      
      <!-- Product List Preview -->
      <details class="collapse collapse-arrow bg-base-200 mb-4">
        <summary class="collapse-title text-sm font-medium">
          削除される商品一覧
        </summary>
        <div class="collapse-content">
          <div class="space-y-2 max-h-48 overflow-y-auto">
            {#each products as product}
              <div class="flex items-center gap-2 text-sm">
                <div class="avatar">
                  <div class="w-8 rounded">
                    <img src={product.image} alt={product.name} />
                  </div>
                </div>
                <div class="flex-1">
                  <div class="font-medium">{product.name}</div>
                  <div class="text-xs opacity-70">在庫: {product.stock}個</div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </details>
    {/if}
    
    <!-- Confirmation Input for Bulk Delete -->
    {#if products.length > 5}
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text text-sm">
            確認のため「削除」と入力してください
          </span>
        </label>
        <input 
          type="text" 
          placeholder="削除" 
          class="input input-bordered input-sm"
          oninput={(e) => {
            const confirmButton = document.getElementById('confirm-delete');
            if (confirmButton) {
              confirmButton.disabled = e.target.value !== '削除';
            }
          }}
        />
      </div>
    {/if}
    
    <!-- Actions -->
    <div class="modal-action">
      <button 
        class="btn btn-ghost" 
        onclick={closeModal}
        disabled={isDeleting}
      >
        キャンセル
      </button>
      <button 
        id="confirm-delete"
        class="btn btn-error"
        onclick={handleDelete}
        disabled={isDeleting || (products.length > 5)}
      >
        {#if isDeleting}
          <span class="loading loading-spinner loading-sm"></span>
          削除中...
        {:else}
          削除する
        {/if}
      </button>
    </div>
  </div>
  
  <!-- Click outside to close -->
  <form method="dialog" class="modal-backdrop">
    <button onclick={closeModal}>close</button>
  </form>
</dialog>