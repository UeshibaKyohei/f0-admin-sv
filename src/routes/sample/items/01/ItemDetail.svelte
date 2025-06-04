<script>
  import { categories, tags, categoryTree } from './stores/itemStore.js';
  import { priceHistoryStorage, stockHistoryStorage } from './api/localStorage.js';
  import { CONFIG } from './config.js';
  
  let { 
    product = null,
    onClose = () => {},
    onSave = () => {}
  } = $props();
  
  // フォームデータの初期化
  let formData = $state(product ? {
    name: product.name,
    description: product.description,
    price: product.price,
    categoryId: product.categoryId,
    tags: [...product.tags],
    images: [...product.images],
    resources: product.resources ? [...product.resources] : [],
    stock: product.stock,
    status: product.status
  } : {
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    tags: [],
    images: [],
    resources: [],
    stock: 0,
    status: 'active'
  });
  
  // 画像の追加・編集用
  let imageUrl = $state('');
  let imageAlt = $state('');
  let editingImageId = $state(null);
  
  // 在庫調整用
  let stockAdjustment = $state(0);
  let stockReason = $state('');
  
  // タブ表示
  let activeTab = $state('basic');
  
  // 価格履歴と在庫履歴
  let priceHistory = $state([]);
  let stockHistory = $state([]);
  
  // 履歴データの読み込み
  $effect(() => {
    if (product) {
      priceHistory = priceHistoryStorage.getByProductId(product.id);
      stockHistory = stockHistoryStorage.getByProductId(product.id);
    }
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
  
  // ファイルタイプを判定
  function getFileType(file) {
    const mimeType = file.type || '';
    const filename = file.name || '';
    
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType === 'application/pdf') return 'document';
    
    // ファイル名から判定
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'mov'].includes(ext)) return 'video';
    if (ext === 'pdf') return 'document';
    
    return 'other';
  }
  
  // ファイル選択ハンドラー
  function handleFileSelect(event) {
    const files = Array.from(event.target.files || []);
    processFiles(files);
  }
  
  // ドラッグ&ドロップハンドラー
  function handleFileDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('border-primary', 'bg-base-200');
    
    const files = Array.from(event.dataTransfer.files || []);
    processFiles(files);
  }
  
  // ファイル処理
  function processFiles(files) {
    files.forEach(file => {
      const reader = new FileReader();
      const fileType = getFileType(file);
      
      reader.onload = (e) => {
        const resource = {
          id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: fileType,
          url: e.target.result,
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          sortOrder: formData.resources.length + formData.images.length + 1
        };
        
        if (fileType === 'image') {
          // 画像の場合は images 配列にも追加（互換性のため）
          const image = {
            ...resource,
            alt: file.name,
            isPrimary: formData.images.length === 0
          };
          formData.images = [...formData.images, image];
        }
        
        formData.resources = [...formData.resources, resource];
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  // URL から画像追加（互換性のため改名）
  function addImageFromUrl() {
    if (!imageUrl) return;
    
    const resource = {
      id: `res-${Date.now()}`,
      type: 'image',
      url: imageUrl,
      filename: imageUrl.split('/').pop() || 'image',
      alt: imageAlt || formData.name,
      isPrimary: formData.images.length === 0,
      sortOrder: formData.images.length + 1
    };
    
    formData.images = [...formData.images, resource];
    formData.resources = [...formData.resources, resource];
    
    imageUrl = '';
    imageAlt = '';
  }
  
  // タグの選択を切り替え
  function toggleTag(tagId) {
    if (formData.tags.includes(tagId)) {
      formData.tags = formData.tags.filter(id => id !== tagId);
    } else {
      formData.tags = [...formData.tags, tagId];
    }
  }
  
  
  // 画像の編集
  function editImage(image) {
    imageUrl = image.url;
    imageAlt = image.alt;
    editingImageId = image.id;
  }
  
  // 画像の削除
  function removeImage(imageId) {
    const wasPrimary = formData.images.find(img => img.id === imageId)?.isPrimary;
    formData.images = formData.images.filter(img => img.id !== imageId);
    formData.resources = formData.resources.filter(res => res.id !== imageId);
    
    // プライマリ画像が削除された場合、最初の画像をプライマリに設定
    if (wasPrimary && formData.images.length > 0) {
      formData.images[0].isPrimary = true;
    }
  }
  
  // リソースの削除
  function removeResource(resourceId) {
    formData.resources = formData.resources.filter(res => res.id !== resourceId);
  }
  
  // プライマリ画像の設定
  function setPrimaryImage(imageId) {
    formData.images = formData.images.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    }));
  }
  
  // 画像の並び順を変更
  function moveImage(index, direction) {
    const newImages = [...formData.images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newImages.length) {
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      newImages.forEach((img, i) => {
        img.sortOrder = i + 1;
      });
      formData.images = newImages;
    }
  }
  
  // 在庫調整
  function adjustStock() {
    if (stockAdjustment === 0 || !stockReason) return;
    
    formData.stock += stockAdjustment;
    const type = stockAdjustment > 0 ? 'addition' : 'removal';
    
    // 履歴に追加（実際の保存はonSave時に行う）
    const newEntry = {
      id: `stock-temp-${Date.now()}`,
      productId: product?.id || 'new',
      quantity: stockAdjustment,
      type,
      reason: stockReason,
      changedAt: new Date(),
      changedBy: 'ユーザー'
    };
    
    stockHistory = [newEntry, ...stockHistory];
    stockAdjustment = 0;
    stockReason = '';
  }
  
  // 保存
  function save() {
    if (!formData.name || !formData.categoryId) {
      alert('商品名とカテゴリーは必須です');
      return;
    }
    
    // 在庫ステータスの自動設定
    const stockStatus = formData.stock === 0 ? 'out_of_stock' : 
                       formData.stock < CONFIG.INVENTORY.LOW_STOCK_THRESHOLD ? 'low_stock' : 'in_stock';
    
    onSave({
      ...formData,
      stockStatus
    });
  }
  
  // バリデーション
  const isValid = $derived(
    formData.name.trim() !== '' && 
    formData.categoryId !== '' &&
    formData.price >= 0 &&
    formData.stock >= 0
  );
</script>

<!-- モーダル -->
<div class="modal modal-open">
  <div class="modal-box max-w-4xl">
    <h3 class="font-bold text-lg mb-4">
      {product ? '商品編集' : '新規商品登録'}
    </h3>
    
    <!-- タブ -->
    <div class="tabs tabs-boxed mb-4">
      <button 
        class="tab"
        class:tab-active={activeTab === 'basic'}
        onclick={() => activeTab = 'basic'}
      >
        基本情報
      </button>
      <button 
        class="tab"
        class:tab-active={activeTab === 'images'}
        onclick={() => activeTab = 'images'}
      >
        画像
      </button>
      <button 
        class="tab"
        class:tab-active={activeTab === 'stock'}
        onclick={() => activeTab = 'stock'}
      >
        在庫管理
      </button>
      {#if product}
        <button 
          class="tab"
          class:tab-active={activeTab === 'history'}
          onclick={() => activeTab = 'history'}
        >
          履歴
        </button>
      {/if}
    </div>
    
    <!-- タブコンテンツ -->
    <div class="space-y-4">
      {#if activeTab === 'basic'}
        <!-- 基本情報タブ -->
        <div class="space-y-6">
          <!-- 商品名 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">商品名 <span class="text-error">*</span></span>
            </label>
            <input 
              type="text" 
              bind:value={formData.name}
              placeholder="商品名を入力"
              class="input input-bordered w-full"
              class:input-error={!formData.name && formData.name !== ''}
            />
          </div>
          
          <!-- 説明 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">商品説明</span>
              <span class="label-text-alt">詳細な説明を記載してください</span>
            </label>
            <textarea 
              bind:value={formData.description}
              placeholder="商品の特徴、仕様、使用方法などを記載"
              class="textarea textarea-bordered h-40 w-full"
              rows="6"
            ></textarea>
          </div>
          
          <!-- 価格とカテゴリー -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">販売価格 <span class="text-error">*</span></span>
              </label>
              <div class="join w-full">
                <span class="join-item btn btn-disabled">¥</span>
                <input 
                  type="number" 
                  bind:value={formData.price}
                  min="0"
                  placeholder="0"
                  class="join-item input input-bordered flex-1"
                />
              </div>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">カテゴリー <span class="text-error">*</span></span>
              </label>
              <select 
                bind:value={formData.categoryId}
                class="select select-bordered w-full"
                class:select-error={!formData.categoryId && formData.categoryId !== ''}
              >
                <option value="">選択してください</option>
                {#each flatCategories as category}
                  <option value={category.id}>{category.displayName}</option>
                {/each}
              </select>
            </div>
          </div>
          
          <!-- ステータスと在庫 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">販売ステータス</span>
              </label>
              <select bind:value={formData.status} class="select select-bordered w-full">
                <option value="active">販売中</option>
                <option value="inactive">非公開</option>
                <option value="discontinued">販売終了</option>
              </select>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">初期在庫数</span>
              </label>
              <input 
                type="number" 
                bind:value={formData.stock}
                min="0"
                placeholder="0"
                class="input input-bordered w-full"
                disabled={product !== null}
              />
              {#if product}
                <label class="label">
                  <span class="label-text-alt text-warning">
                    既存商品の在庫は「在庫管理」タブから変更してください
                  </span>
                </label>
              {/if}
            </div>
          </div>
          
          <!-- タグ -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">商品タグ</span>
              <span class="label-text-alt">複数選択可能</span>
            </label>
            <div class="flex flex-wrap gap-2 p-4 bg-base-200 rounded-lg">
              {#each $tags as tag}
                <label class="cursor-pointer flex items-center">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-xs"
                    checked={formData.tags.includes(tag.id)}
                    onchange={() => toggleTag(tag.id)}
                  />
                  <span class="badge {tag.color} ml-1">{tag.name}</span>
                </label>
              {/each}
            </div>
          </div>
        </div>
        
      {:else if activeTab === 'images'}
        <!-- 画像・リソースタブ -->
        <div class="space-y-4">
          <!-- ファイルアップロードエリア -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">ファイルアップロード</span>
              <span class="label-text-alt">画像、動画、PDFなど</span>
            </label>
            <div 
              class="border-2 border-dashed border-base-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
              ondrop={(e) => handleFileDrop(e)}
              ondragover={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary', 'bg-base-200'); }}
              ondragleave={(e) => { e.currentTarget.classList.remove('border-primary', 'bg-base-200'); }}
              onclick={() => document.getElementById('fileInput').click()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="text-base-content/70 mb-2">
                ファイルをドラッグ&ドロップ、またはクリックして選択
              </p>
              <p class="text-sm text-base-content/50">
                対応形式: 画像 (JPG, PNG, GIF, WebP)、動画 (MP4, WebM)、ドキュメント (PDF)
              </p>
              <input 
                type="file" 
                id="fileInput"
                class="hidden"
                multiple
                accept="image/*,video/*,.pdf"
                onchange={(e) => handleFileSelect(e)}
              />
            </div>
          </div>
          
          <!-- URL入力（互換性のため残す） -->
          <details class="collapse collapse-arrow bg-base-200">
            <summary class="collapse-title">URLから追加</summary>
            <div class="collapse-content">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">リソースURL</span>
                </label>
                <div class="flex gap-2">
                  <input 
                    type="text" 
                    bind:value={imageUrl}
                    placeholder="https://example.com/resource.jpg"
                    class="input input-bordered flex-1"
                  />
                  <button 
                    class="btn btn-primary"
                    onclick={addImageFromUrl}
                    disabled={!imageUrl}
                  >
                    追加
                  </button>
                </div>
              </div>
              
              <div class="form-control mt-2">
                <label class="label">
                  <span class="label-text">説明（画像の場合は代替テキスト）</span>
                </label>
                <input 
                  type="text" 
                  bind:value={imageAlt}
                  placeholder="リソースの説明"
                  class="input input-bordered"
                />
              </div>
            </div>
          </details>
          
          <!-- リソース一覧 -->
          {#if formData.resources.length > 0 || formData.images.length > 0}
            <div class="divider">登録済みリソース</div>
            <div class="space-y-2">
              <!-- 画像リソース -->
              {#each formData.images as image, index}
                <div class="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                  <div class="w-20 h-20 flex items-center justify-center bg-base-300 rounded">
                    {#if image.url.startsWith('data:') || image.url.startsWith('http')}
                      <img 
                        src={image.url} 
                        alt={image.alt}
                        class="w-full h-full object-cover rounded"
                      />
                    {:else}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    {/if}
                  </div>
                  <div class="flex-1">
                    <div class="font-medium flex items-center gap-2">
                      <span class="badge badge-info badge-xs">画像</span>
                      {image.filename || image.alt || '(名称未設定)'}
                    </div>
                    <div class="text-sm text-base-content/70">
                      {#if image.size}
                        {(image.size / 1024 / 1024).toFixed(2)} MB
                      {/if}
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    {#if image.isPrimary}
                      <span class="badge badge-primary">メイン</span>
                    {:else}
                      <button 
                        class="btn btn-ghost btn-xs"
                        onclick={() => setPrimaryImage(image.id)}
                      >
                        メインに設定
                      </button>
                    {/if}
                    
                    <div class="join">
                      <button 
                        class="join-item btn btn-xs"
                        onclick={() => moveImage(index, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </button>
                      <button 
                        class="join-item btn btn-xs"
                        onclick={() => moveImage(index, 'down')}
                        disabled={index === formData.images.length - 1}
                      >
                        ↓
                      </button>
                    </div>
                    
                    <button 
                      class="btn btn-error btn-xs"
                      onclick={() => removeImage(image.id)}
                    >
                      削除
                    </button>
                  </div>
                </div>
              {/each}
              
              <!-- その他のリソース -->
              {#each formData.resources.filter(r => r.type !== 'image') as resource, index}
                <div class="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                  <div class="w-20 h-20 flex items-center justify-center bg-base-300 rounded">
                    {#if resource.type === 'video'}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    {:else if resource.type === 'document'}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    {:else}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    {/if}
                  </div>
                  <div class="flex-1">
                    <div class="font-medium flex items-center gap-2">
                      {#if resource.type === 'video'}
                        <span class="badge badge-success badge-xs">動画</span>
                      {:else if resource.type === 'document'}
                        <span class="badge badge-warning badge-xs">PDF</span>
                      {:else}
                        <span class="badge badge-ghost badge-xs">その他</span>
                      {/if}
                      {resource.filename}
                    </div>
                    <div class="text-sm text-base-content/70">
                      {#if resource.size}
                        {(resource.size / 1024 / 1024).toFixed(2)} MB
                      {/if}
                      {#if resource.mimeType}
                        • {resource.mimeType}
                      {/if}
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button 
                      class="btn btn-error btn-xs"
                      onclick={() => removeResource(resource.id)}
                    >
                      削除
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="text-center py-8 text-base-content/50">
              リソースが登録されていません
            </div>
          {/if}
        </div>
        
      {:else if activeTab === 'stock'}
        <!-- 在庫管理タブ -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">現在の在庫数</span>
          </label>
          <input 
            type="number" 
            bind:value={formData.stock}
            min="0"
            class="input input-bordered"
            readonly={product !== null}
          />
          {#if product}
            <label class="label">
              <span class="label-text-alt text-warning">
                既存商品の在庫は下の在庫調整から変更してください
              </span>
            </label>
          {/if}
        </div>
        
        {#if product}
          <div class="divider">在庫調整</div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">数量</span>
              </label>
              <input 
                type="number" 
                bind:value={stockAdjustment}
                placeholder="+10 または -5"
                class="input input-bordered"
              />
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">理由</span>
              </label>
              <input 
                type="text" 
                bind:value={stockReason}
                placeholder="入荷、販売、破損など"
                class="input input-bordered"
              />
            </div>
          </div>
          
          <button 
            class="btn btn-primary"
            onclick={adjustStock}
            disabled={stockAdjustment === 0 || !stockReason}
          >
            在庫を調整
          </button>
          
          <div class="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>調整後の在庫: {formData.stock + stockAdjustment}</span>
          </div>
        {/if}
        
      {:else if activeTab === 'history'}
        <!-- 履歴タブ -->
        <div class="space-y-6">
          <!-- 価格履歴 -->
          <div>
            <h4 class="text-lg font-semibold mb-2">価格履歴</h4>
            {#if priceHistory.length > 0}
              <div class="overflow-x-auto">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>日時</th>
                      <th>価格</th>
                      <th>変更者</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each priceHistory as entry}
                      <tr>
                        <td>{new Date(entry.changedAt).toLocaleString('ja-JP')}</td>
                        <td class="font-mono">¥{entry.price.toLocaleString()}</td>
                        <td>{entry.changedBy}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {:else}
              <p class="text-base-content/50">価格履歴がありません</p>
            {/if}
          </div>
          
          <!-- 在庫履歴 -->
          <div>
            <h4 class="text-lg font-semibold mb-2">在庫履歴</h4>
            {#if stockHistory.length > 0}
              <div class="overflow-x-auto">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>日時</th>
                      <th>数量</th>
                      <th>種別</th>
                      <th>理由</th>
                      <th>変更者</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each stockHistory as entry}
                      <tr>
                        <td>{new Date(entry.changedAt).toLocaleString('ja-JP')}</td>
                        <td class="font-mono">
                          {#if entry.quantity > 0}
                            <span class="text-success">+{entry.quantity}</span>
                          {:else}
                            <span class="text-error">{entry.quantity}</span>
                          {/if}
                        </td>
                        <td>
                          {#if entry.type === 'addition'}
                            <span class="badge badge-success badge-sm">追加</span>
                          {:else if entry.type === 'removal'}
                            <span class="badge badge-error badge-sm">削除</span>
                          {:else}
                            <span class="badge badge-warning badge-sm">調整</span>
                          {/if}
                        </td>
                        <td>{entry.reason}</td>
                        <td>{entry.changedBy}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {:else}
              <p class="text-base-content/50">在庫履歴がありません</p>
            {/if}
          </div>
        </div>
      {/if}
    </div>
    
    <!-- モーダルアクション -->
    <div class="modal-action">
      <button class="btn btn-ghost" onclick={onClose}>キャンセル</button>
      <button 
        class="btn btn-primary"
        onclick={save}
        disabled={!isValid}
      >
        保存
      </button>
    </div>
  </div>
  
  <!-- 背景クリックで閉じる -->
  <form method="dialog" class="modal-backdrop">
    <button onclick={onClose}>close</button>
  </form>
</div>