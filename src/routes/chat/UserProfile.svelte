<script>
  import { showUserProfile, profileUser } from './chatStore.js';
  import { statusColors } from './mockData.js';
  
  function closeModal() {
    showUserProfile.set(false);
    profileUser.set(null);
  }
  
  function startDirectChat() {
    // 実装: ダイレクトチャットを開始
    console.log('ダイレクトチャットを開始:', $profileUser);
    closeModal();
  }
  
  function callUser() {
    // 実装: 音声通話を開始
    console.log('音声通話を開始:', $profileUser);
  }
  
  function videoCallUser() {
    // 実装: ビデオ通話を開始
    console.log('ビデオ通話を開始:', $profileUser);
  }
</script>

<!-- モーダル背景 -->
<div class="modal modal-open" onclick={closeModal}>
  <div class="modal-box max-w-md" onclick={(e) => e.stopPropagation()}>
    <!-- 閉じるボタン -->
    <button 
      class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
      onclick={closeModal}
    >
      ✕
    </button>
    
    {#if $profileUser}
      <!-- プロフィールヘッダー -->
      <div class="text-center mb-6">
        <div class="avatar online mx-auto mb-4">
          <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src={$profileUser.avatar} alt={$profileUser.name} />
          </div>
        </div>
        
        <h3 class="text-2xl font-bold mb-1">{$profileUser.name}</h3>
        
        <!-- ステータス -->
        <div class="flex items-center justify-center gap-2 mb-2">
          <div class={`badge badge-xs ${statusColors[$profileUser.status]}`}></div>
          <span class="text-sm capitalize">{$profileUser.status}</span>
        </div>
        
        <!-- ステータスメッセージ -->
        {#if $profileUser.statusMessage}
          <p class="text-base-content/70 italic">"{$profileUser.statusMessage}"</p>
        {/if}
      </div>
      
      <!-- ユーザー情報 -->
      <div class="space-y-3 mb-6">
        {#if $profileUser.department}
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <div>
              <div class="text-sm text-base-content/70">部署</div>
              <div class="font-medium">{$profileUser.department}</div>
            </div>
          </div>
        {/if}
        
        {#if $profileUser.role}
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div>
              <div class="text-sm text-base-content/70">役職</div>
              <div class="font-medium">{$profileUser.role}</div>
            </div>
          </div>
        {/if}
        
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <div>
            <div class="text-sm text-base-content/70">メール</div>
            <div class="font-medium text-primary">{$profileUser.id}@example.com</div>
          </div>
        </div>
      </div>
      
      <!-- アクションボタン -->
      <div class="grid grid-cols-3 gap-2 mb-4">
        <button 
          class="btn btn-primary btn-sm"
          onclick={startDirectChat}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          チャット
        </button>
        
        <button 
          class="btn btn-primary btn-outline btn-sm"
          onclick={callUser}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          通話
        </button>
        
        <button 
          class="btn btn-primary btn-outline btn-sm"
          onclick={videoCallUser}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          ビデオ
        </button>
      </div>
      
      <!-- その他のオプション -->
      <div class="divider"></div>
      
      <div class="space-y-2">
        <button class="btn btn-ghost btn-sm btn-block justify-start">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          詳細情報を表示
        </button>
        
        <button class="btn btn-ghost btn-sm btn-block justify-start">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
          通知をミュート
        </button>
        
        <button class="btn btn-error btn-outline btn-sm btn-block justify-start">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          ユーザーをブロック
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  /* モーダルアニメーション */
  .modal-box {
    animation: slideUp 0.3s ease-out;
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>