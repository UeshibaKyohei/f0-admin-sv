<script>
  import { onMount } from 'svelte';
  
  let { 
    product = null,
    categories = [],
    onSave,
    onClose
  } = $props();
  
  let modalRef = $state();
  
  // Form state
  let formData = $state({
    name: '',
    sku: '',
    category: '',
    price: 0,
    stock: 0,
    status: 'active',
    description: '',
    image: ''
  });
  
  // Initialize form data
  $effect(() => {
    if (product) {
      formData = { ...product };
    } else {
      formData = {
        name: '',
        sku: generateSKU(),
        category: categories[1] || '',
        price: 0,
        stock: 0,
        status: 'active',
        description: '',
        image: `https://picsum.photos/seed/${Date.now()}/400/400`
      };
    }
  });
  
  // Show modal on mount
  onMount(() => {
    if (modalRef) {
      modalRef.showModal();
    }
  });
  
  // Generate SKU
  function generateSKU() {
    return 'SKU-' + Date.now().toString(36).toUpperCase();
  }
  
  // Handle form submission
  function handleSubmit(e) {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.category || formData.price < 0 || formData.stock < 0) {
      // In real app, show toast notification
      return;
    }
    
    onSave(formData);
  }
  
  // Handle file upload
  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload to a server
      // For demo, we'll use a placeholder
      formData.image = `https://picsum.photos/seed/${Date.now()}/400/400`;
    }
  }
  
  // Close modal handler
  function closeModal() {
    modalRef?.close();
    setTimeout(onClose, 200); // Wait for animation
  }
</script>

<!-- DaisyUI Modal using dialog element -->
<dialog bind:this={modalRef} class="modal modal-bottom sm:modal-middle">
  <div class="modal-box max-w-2xl">
    <!-- Header -->
    <h3 class="font-bold text-lg mb-4">
      {product ? '商品を編集' : '新規商品を作成'}
    </h3>
    
    <!-- Form -->
    <form onsubmit={handleSubmit}>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Left Column -->
        <div class="space-y-4">
          <!-- Product Name -->
          <div class="form-control">
            <label class="label" for="name">
              <span class="label-text">商品名 <span class="text-error">*</span></span>
            </label>
            <input 
              id="name"
              type="text" 
              class="input input-bordered"
              bind:value={formData.name}
              required
            />
          </div>
          
          <!-- SKU -->
          <div class="form-control">
            <label class="label" for="sku">
              <span class="label-text">SKU</span>
            </label>
            <label class="input input-bordered flex items-center gap-2">
              <input 
                id="sku"
                type="text" 
                class="grow"
                bind:value={formData.sku}
              />
              <button 
                type="button"
                class="btn btn-ghost btn-sm btn-square"
                onclick={() => formData.sku = generateSKU()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </label>
          </div>
          
          <!-- Category -->
          <div class="form-control">
            <label class="label" for="category">
              <span class="label-text">カテゴリ <span class="text-error">*</span></span>
            </label>
            <select 
              id="category"
              class="select select-bordered"
              bind:value={formData.category}
              required
            >
              <option value="" disabled>カテゴリを選択</option>
              {#each categories.slice(1) as category}
                <option value={category}>{category}</option>
              {/each}
            </select>
          </div>
          
          <!-- Price -->
          <div class="form-control">
            <label class="label" for="price">
              <span class="label-text">価格 <span class="text-error">*</span></span>
            </label>
            <label class="input input-bordered flex items-center gap-2">
              <span>¥</span>
              <input 
                id="price"
                type="number" 
                class="grow"
                bind:value={formData.price}
                min="0"
                required
              />
            </label>
          </div>
        </div>
        
        <!-- Right Column -->
        <div class="space-y-4">
          <!-- Stock -->
          <div class="form-control">
            <label class="label" for="stock">
              <span class="label-text">在庫数 <span class="text-error">*</span></span>
              <span class="label-text-alt">現在: {formData.stock}個</span>
            </label>
            <input 
              id="stock"
              type="number" 
              class="input input-bordered"
              bind:value={formData.stock}
              min="0"
              required
            />
            <label class="label">
              <span class="label-text-alt">
                {#if formData.stock === 0}
                  <span class="text-error">在庫切れです</span>
                {:else if formData.stock < 10}
                  <span class="text-warning">在庫が少なくなっています</span>
                {:else}
                  <span class="text-success">在庫は十分です</span>
                {/if}
              </span>
            </label>
          </div>
          
          <!-- Status -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">ステータス</span>
            </label>
            <div class="join">
              <input 
                type="radio" 
                name="status" 
                class="join-item btn"
                aria-label="販売中"
                checked={formData.status === 'active'}
                onchange={() => formData.status = 'active'}
              />
              <input 
                type="radio" 
                name="status" 
                class="join-item btn"
                aria-label="停止中"
                checked={formData.status === 'inactive'}
                onchange={() => formData.status = 'inactive'}
              />
            </div>
          </div>
          
          <!-- Image -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">商品画像</span>
            </label>
            <div class="flex items-center gap-4">
              <div class="avatar">
                <div class="w-24 rounded-lg bg-base-200">
                  <img src={formData.image} alt="Product preview" />
                </div>
              </div>
              <input 
                type="file" 
                class="file-input file-input-bordered file-input-sm flex-1"
                accept="image/*"
                onchange={handleImageUpload}
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Description -->
      <div class="form-control mt-4">
        <label class="label" for="description">
          <span class="label-text">商品説明</span>
          <span class="label-text-alt">{formData.description.length}/500</span>
        </label>
        <textarea 
          id="description"
          class="textarea textarea-bordered h-24"
          bind:value={formData.description}
          placeholder="商品の詳細な説明を入力してください..."
          maxlength="500"
        ></textarea>
      </div>
      
      <!-- Actions -->
      <div class="modal-action">
        <button type="button" class="btn btn-ghost" onclick={closeModal}>
          キャンセル
        </button>
        <button type="submit" class="btn btn-primary">
          {product ? '更新' : '作成'}
        </button>
      </div>
    </form>
  </div>
  
  <!-- Click outside to close -->
  <form method="dialog" class="modal-backdrop">
    <button onclick={closeModal}>close</button>
  </form>
</dialog>