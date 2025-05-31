<script>
  import { onMount } from 'svelte';
  import ChatSidebar from './ChatSidebar.svelte';
  import ChatWindow from './ChatWindow.svelte';
  import UserProfile from './UserProfile.svelte';
  import { 
    currentUser, 
    selectedChat, 
    showUserProfile, 
    isMobile,
    sidebarOpen
  } from './chatStore.js';
  
  // レスポンシブ対応
  let innerWidth = $state(0);
  
  $effect(() => {
    isMobile.set(innerWidth < 768);
  });
  
  // キーボードショートカット
  function handleKeydown(e) {
    // Ctrl/Cmd + K: ユーザー検索
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      // 検索フォーカスのイベントを発行
      window.dispatchEvent(new CustomEvent('focus-search'));
    }
    
    // Escape: サイドバーを閉じる（モバイル）
    if (e.key === 'Escape' && $isMobile && $sidebarOpen) {
      sidebarOpen.set(false);
    }
  }
  
  onMount(() => {
    // 初期ユーザー設定（実際はログイン情報から取得）
    currentUser.set({
      id: 'current-user',
      name: '山田太郎',
      avatar: 'https://img.daisyui.com/images/profile/demo/1@40.webp',
      status: 'online',
      statusMessage: '対応可能です'
    });
  });
</script>

<svelte:window bind:innerWidth on:keydown={handleKeydown} />

<div class="flex h-screen bg-base-200">
  <!-- サイドバー -->
  <ChatSidebar />
  
  <!-- メインチャットエリア -->
  <div class="flex-1 flex flex-col">
    {#if $selectedChat}
      <ChatWindow />
    {:else}
      <!-- チャット未選択時の表示 -->
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <div class="text-6xl mb-4">💬</div>
          <h2 class="text-2xl font-bold mb-2">チャットを選択してください</h2>
          <p class="text-base-content/70">
            左側のリストからチャットを選択するか、新しいチャットを開始してください
          </p>
        </div>
      </div>
    {/if}
  </div>
  
  <!-- ユーザープロフィールモーダル -->
  {#if $showUserProfile}
    <UserProfile />
  {/if}
</div>

<style>
  /* アニメーション */
  :global(.slide-in) {
    animation: slideIn 0.3s ease-out;
  }
  
  :global(.fade-in) {
    animation: fadeIn 0.2s ease-out;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>