<script>
  import { selectedChatId, customers, activeChats, archivedChats } from './supportStore.js';
  import { onMount } from 'svelte';
  
  // 現在のチャット情報
  const currentChat = $derived(
    $activeChats.find(chat => chat.id === $selectedChatId)
  );
  
  // 顧客情報
  const customer = $derived(
    currentChat ? $customers[currentChat.customerId] : null
  );
  
  // 過去の履歴
  const customerHistory = $derived(
    customer ? ($archivedChats[customer.id] || []) : []
  );
  
  // 顧客情報のモックデータを生成
  function generateCustomerData(customerId, customerName) {
    // 注文履歴を生成
    const recentOrders = Array.from({ length: 8 }, (_, i) => ({
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
      date: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: ['配送済み', '配送中', '準備中', 'キャンセル'][Math.floor(Math.random() * 4)],
      amount: Math.floor(Math.random() * 50000) + 5000,
      items: Math.floor(Math.random() * 5) + 1
    }));
    
    // メモ履歴を生成
    const notes = [
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), text: 'VIP顧客として対応', author: '田中' },
      { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), text: '配送トラブルについて丁寧に対応済み', author: '鈴木' },
      { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), text: '長期優良顧客', author: 'システム' }
    ];
    
    // 関連タグ
    const tags = ['頻繁購入者', 'プレミアム会員', '配送注意', 'クーポン利用者', '問い合わせ多い'];
    const customerTags = tags.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2);
    
    return {
      id: customerId,
      name: customerName,
      email: `${customerName.toLowerCase().replace(' ', '.')}@example.com`,
      phone: '090-1234-5678',
      alternatePhone: '03-1234-5678',
      address: '東京都渋谷区渋谷1-2-3 ○○マンション 101号室',
      registeredDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      tier: ['ゴールド', 'シルバー', 'ブロンズ'][Math.floor(Math.random() * 3)],
      totalPurchases: Math.floor(Math.random() * 50),
      totalSpent: Math.floor(Math.random() * 1000000),
      lastOrder: recentOrders[0],
      recentOrders,
      previousComplaints: Math.floor(Math.random() * 3),
      loyaltyPoints: Math.floor(Math.random() * 10000),
      notes,
      tags: customerTags,
      preferences: {
        contactMethod: ['メール', '電話', 'SMS'][Math.floor(Math.random() * 3)],
        deliveryTime: ['午前中', '14-16時', '16-18時', '18-20時'][Math.floor(Math.random() * 4)]
      }
    };
  }
  
  onMount(() => {
    // 選択されたチャットの顧客情報を生成（存在しない場合）
    if (currentChat && !customer) {
      customers.update(cust => {
        if (!cust[currentChat.customerId]) {
          cust[currentChat.customerId] = generateCustomerData(
            currentChat.customerId,
            currentChat.customerName
          );
        }
        return cust;
      });
    }
  });
  
  // 金額をフォーマット
  function formatCurrency(amount) {
    return new Intl.NumberFormat('ja-JP', { 
      style: 'currency', 
      currency: 'JPY' 
    }).format(amount);
  }
  
  // 日付をフォーマット
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ja-JP');
  }
  
  // 相対時間をフォーマット
  function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 30) {
      return `${Math.floor(days / 30)}ヶ月前`;
    } else if (days > 0) {
      return `${days}日前`;
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      return hours > 0 ? `${hours}時間前` : '今日';
    }
  }
</script>

<div class="w-96 bg-base-100 border-l border-base-300 overflow-y-auto flex-shrink-0">
  {#if customer}
    <div class="p-4 space-y-4">
      <!-- 顧客基本情報 -->
      <div>
        <h3 class="font-semibold mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          顧客情報
        </h3>
        
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-base-content/70">名前</span>
            <span class="font-medium">{customer.name}</span>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-base-content/70">メール</span>
            <a href={`mailto:${customer.email}`} class="link link-primary text-sm truncate">
              {customer.email}
            </a>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-base-content/70">電話</span>
            <span class="text-sm">{customer.phone}</span>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-base-content/70">会員ランク</span>
            <div class={`badge ${
              customer.tier === 'ゴールド' ? 'badge-warning' :
              customer.tier === 'シルバー' ? 'badge-ghost' :
              'badge-accent'
            }`}>
              {customer.tier}
              {customer.isVIP ? ' VIP' : ''}
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-base-content/70">登録日</span>
            <span class="text-sm">{formatDate(customer.registeredDate)}</span>
          </div>
          
          {#if customer.previousComplaints > 0}
            <div class="flex items-center justify-between">
              <span class="text-sm text-base-content/70">過去のクレーム</span>
              <span class="text-sm text-error font-medium">{customer.previousComplaints}件</span>
            </div>
          {/if}
        </div>
      </div>
      
      <div class="divider"></div>
      
      <!-- 購入履歴サマリー -->
      <div>
        <h3 class="font-semibold mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          購入履歴
        </h3>
        
        <div class="stats stats-vertical shadow w-full">
          <div class="stat py-2">
            <div class="stat-title text-xs">総購入回数</div>
            <div class="stat-value text-lg">{customer.totalPurchases}回</div>
          </div>
          
          <div class="stat py-2">
            <div class="stat-title text-xs">総購入金額</div>
            <div class="stat-value text-lg">{formatCurrency(customer.totalSpent)}</div>
          </div>
        </div>
      </div>
      
      <!-- 最新の注文 -->
      {#if customer.lastOrder}
        <div>
          <h4 class="font-medium mb-2">最新の注文</h4>
          <div class="card bg-base-200">
            <div class="card-body p-3">
              <div class="text-sm space-y-1">
                <div class="flex justify-between">
                  <span class="text-base-content/70">注文番号</span>
                  <span class="font-mono">{customer.lastOrder.id}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-base-content/70">日付</span>
                  <span>{formatDate(customer.lastOrder.date)}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-base-content/70">ステータス</span>
                  <div class={`badge badge-sm ${
                    customer.lastOrder.status === '配送済み' ? 'badge-success' :
                    customer.lastOrder.status === '配送中' ? 'badge-info' :
                    'badge-warning'
                  }`}>
                    {customer.lastOrder.status}
                  </div>
                </div>
                <div class="flex justify-between">
                  <span class="text-base-content/70">金額</span>
                  <span>{formatCurrency(customer.lastOrder.amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
      
      <div class="divider"></div>
      
      <!-- 過去の問い合わせ履歴 -->
      <div>
        <h3 class="font-semibold mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          過去の問い合わせ ({customerHistory.length})
        </h3>
        
        {#if customerHistory.length > 0}
          <div class="space-y-2 max-h-64 overflow-y-auto">
            {#each customerHistory.slice(0, 5) as history}
              <div class="card bg-base-200">
                <div class="card-body p-3">
                  <div class="text-sm">
                    <div class="flex items-start justify-between mb-1">
                      <div class="font-medium">{history.subject}</div>
                      <div class={`badge badge-xs ${
                        history.resolution === 'resolved' ? 'badge-success' :
                        history.resolution === 'escalated' ? 'badge-error' :
                        'badge-warning'
                      }`}>
                        {history.resolution === 'resolved' ? '解決' :
                         history.resolution === 'escalated' ? 'エスカレーション' :
                         '未解決'}
                      </div>
                    </div>
                    <div class="text-xs text-base-content/70 mb-1">
                      {formatRelativeTime(history.date)} | 
                      対応時間: {history.resolutionTime}分
                    </div>
                    <div class="text-xs">
                      {history.summary}
                    </div>
                    {#if history.satisfactionScore}
                      <div class="mt-1">
                        <span class="text-xs">満足度: </span>
                        {#each Array(5) as _, i}
                          <span class={i < history.satisfactionScore ? 'text-warning' : 'text-base-300'}>
                            ★
                          </span>
                        {/each}
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
            
            {#if customerHistory.length > 5}
              <button class="btn btn-ghost btn-xs btn-block">
                すべて表示 ({customerHistory.length}件)
              </button>
            {/if}
          </div>
        {:else}
          <p class="text-sm text-base-content/60">履歴はありません</p>
        {/if}
      </div>
      
      {#if customer.tags && customer.tags.length > 0}
        <div class="divider"></div>
        
        <!-- タグ -->
        <div>
          <h3 class="font-semibold mb-3">顧客タグ</h3>
          <div class="flex flex-wrap gap-1">
            {#each customer.tags as tag}
              <div class="badge badge-sm">{tag}</div>
            {/each}
          </div>
        </div>
      {/if}
      
      {#if customer.notes && customer.notes.length > 0}
        <div class="divider"></div>
        
        <!-- メモ -->
        <div>
          <h3 class="font-semibold mb-3">顧客メモ</h3>
          <div class="space-y-2">
            {#each customer.notes as note}
              <div class="bg-base-200 rounded p-2">
                <div class="text-xs text-base-content/60 mb-1">
                  {formatDate(note.date)} - {note.author}
                </div>
                <div class="text-sm">{note.text}</div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
      
      {#if customer.recentOrders && customer.recentOrders.length > 1}
        <div class="divider"></div>
        
        <!-- 最近の注文履歴 -->
        <div>
          <h3 class="font-semibold mb-3">最近の注文</h3>
          <div class="space-y-2">
            {#each customer.recentOrders.slice(1, 5) as order}
              <div class="flex items-center justify-between text-sm">
                <div>
                  <div class="font-mono">{order.id}</div>
                  <div class="text-xs text-base-content/60">
                    {formatDate(order.date)} ({order.items}点)
                  </div>
                </div>
                <div class="text-right">
                  <div>{formatCurrency(order.amount)}</div>
                  <div class={`badge badge-xs ${
                    order.status === '配送済み' ? 'badge-success' :
                    order.status === 'キャンセル' ? 'badge-error' :
                    order.status === '配送中' ? 'badge-info' :
                    'badge-warning'
                  }`}>
                    {order.status}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
      
      <div class="divider"></div>
      
      <!-- クイックアクション -->
      <div>
        <h3 class="font-semibold mb-3">クイックアクション</h3>
        <div class="space-y-2">
          <button class="btn btn-sm btn-block btn-ghost justify-start">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            全注文履歴を確認
          </button>
          
          <button class="btn btn-sm btn-block btn-ghost justify-start">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            フォローアップメール
          </button>
          
          <button class="btn btn-sm btn-block btn-ghost justify-start">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            タグを追加
          </button>
        </div>
      </div>
    </div>
  {:else if currentChat}
    <div class="p-4 text-center text-base-content/60">
      <div class="loading loading-spinner loading-sm"></div>
      <p class="mt-2">顧客情報を読み込み中...</p>
    </div>
  {:else}
    <div class="p-4 text-center text-base-content/60">
      <p>チャットを選択してください</p>
    </div>
  {/if}
</div>