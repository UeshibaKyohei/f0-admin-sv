<script>
  import { activeChats, selectedChatId, resolveChat, chatStatuses, priorities } from './supportStore.js';
  import { onMount } from 'svelte';
  
  let showResolveModal = $state(false);
  let resolvingChatId = $state(null);
  let resolution = $state('resolved');
  let summary = $state('');
  
  // 経過時間を計算
  function getElapsedTime(startTime) {
    const start = new Date(startTime);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000 / 60); // 分単位
    
    if (diff < 1) return '今';
    if (diff < 60) return `${diff}分`;
    return `${Math.floor(diff / 60)}時間${diff % 60}分`;
  }
  
  // タブを選択
  function selectTab(chatId) {
    selectedChatId.set(chatId);
  }
  
  // チャットを終了
  function handleResolveChat(chatId) {
    resolvingChatId = chatId;
    showResolveModal = true;
    summary = '';
  }
  
  // 解決を確定
  function confirmResolve() {
    if (!summary.trim()) {
      alert('要約を入力してください');
      return;
    }
    
    resolveChat(resolvingChatId, resolution, summary);
    showResolveModal = false;
    resolvingChatId = null;
  }
</script>

<div class="bg-base-100 border-b border-base-300 overflow-x-auto flex-shrink-0">
  <div class="flex h-12">
    {#each $activeChats as chat}
      {@const isSelected = $selectedChatId === chat.id}
      <div
        class={`
          flex items-center gap-2 px-3 border-r border-base-300
          hover:bg-base-200 transition-colors min-w-[180px] cursor-pointer
          ${isSelected ? 'bg-base-200 border-b-2 border-b-primary' : ''}
        `}
        onclick={() => selectTab(chat.id)}
        role="tab"
        tabindex="0"
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectTab(chat.id);
          }
        }}
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1">
            <!-- 優先度バッジ -->
            {#if chat.priority === 'urgent' || chat.priority === 'high'}
              <div class={`badge badge-xs ${priorities[chat.priority || 'normal']?.color || 'badge-primary'}`}>!</div>
            {/if}
            
            <!-- 顧客名 -->
            <span class="text-sm font-medium truncate">
              {chat.customerName}
            </span>
            
            <!-- 未読数 -->
            {#if chat.unreadCount > 0}
              <div class="badge badge-primary badge-xs">{chat.unreadCount}</div>
            {/if}
          </div>
          
          <div class="flex items-center gap-2 text-xs text-base-content/60">
            <span>{getElapsedTime(chat.startTime)}</span>
            <span class={`${chatStatuses[chat.status || 'active']?.color || 'badge-success'}`}>•</span>
          </div>
        </div>
        
        <!-- 終了ボタン -->
        <button
          class="btn btn-ghost btn-xs btn-circle opacity-60 hover:opacity-100"
          onclick={(e) => {
            e.stopPropagation();
            handleResolveChat(chat.id);
          }}
          aria-label="チャットを終了"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    {/each}
    
    {#if $activeChats.length === 0}
      <div class="flex items-center px-4 text-base-content/60">
        対応中のチャットはありません
      </div>
    {/if}
  </div>
</div>

<!-- 解決モーダル -->
{#if showResolveModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">チャットを終了</h3>
      
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text">解決ステータス</span>
        </label>
        <select bind:value={resolution} class="select select-bordered">
          <option value="resolved">解決済み</option>
          <option value="unresolved">未解決</option>
          <option value="escalated">エスカレーション</option>
        </select>
      </div>
      
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text">対応内容の要約 (必須)</span>
        </label>
        <textarea 
          bind:value={summary}
          class="textarea textarea-bordered h-24" 
          placeholder="例: 商品の返品手続きを案内。返送用ラベルをメールで送信。"
        ></textarea>
      </div>
      
      <div class="modal-action">
        <button 
          class="btn"
          onclick={() => showResolveModal = false}
        >
          キャンセル
        </button>
        <button 
          class="btn btn-primary"
          onclick={confirmResolve}
          disabled={!summary.trim()}
        >
          終了する
        </button>
      </div>
    </div>
    <div class="modal-backdrop" onclick={() => showResolveModal = false}></div>
  </div>
{/if}