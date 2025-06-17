<script lang="ts">
  import { goto } from '$app/navigation';
  
  import { CONFIG } from './config';
  
  // デモユーザーの選択
  let selectedRole = $state<'none' | 'admin' | 'patient'>('none');
  
  // ロールに応じてページ遷移
  function handleRoleSelect(role: 'admin' | 'patient') {
    selectedRole = role;
    
    if (CONFIG.isMockMode) {
      // モックモード: デモユーザーとして自動ログイン
      setTimeout(() => {
        goto(`/sample/data-management/yoyaku-clinic/${role}`);
      }, 500);
    } else {
      // 本実装モード: 実際の認証処理を実行
      // TODO: 認証APIを呼び出し、成功後にページ遷移
      console.error('Real authentication not implemented yet');
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center p-4">
  <div class="max-w-4xl w-full">
    <!-- タイトル -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-4">{CONFIG.system.clinicName}</h1>
      <p class="text-xl text-base-content/70">予約管理システム{CONFIG.isMockMode ? ' デモ版' : ''}</p>
    </div>
    
    <!-- ロール選択カード -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- 管理者側 -->
      <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
        <div class="card-body">
          <div class="flex justify-center mb-4">
            <div class="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          
          <h2 class="card-title justify-center text-2xl mb-3">病院スタッフ</h2>
          <p class="text-center text-base-content/70 mb-6">
            予約管理・患者情報・統計分析など、クリニック運営に必要な全機能にアクセスできます
          </p>
          
          <div class="space-y-2 mb-6">
            <div class="flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              予約カレンダー管理
            </div>
            <div class="flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              医師・診察室スケジュール
            </div>
            <div class="flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              統計分析・AI最適化
            </div>
          </div>
          
          <div class="card-actions">
            <button 
              class="btn btn-primary w-full"
              onclick={() => handleRoleSelect('admin')}
              disabled={selectedRole !== 'none'}
            >
              {#if selectedRole === 'admin'}
                <span class="loading loading-spinner"></span>
                ログイン中...
              {:else}
                管理画面にログイン
              {/if}
            </button>
          </div>
          
          {#if CONFIG.isMockMode}
            <div class="text-xs text-center text-base-content/50 mt-2">
              デモ: {CONFIG.demoUsers.admin.name}としてログイン
            </div>
          {/if}
        </div>
      </div>
      
      <!-- 患者側 -->
      <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
        <div class="card-body">
          <div class="flex justify-center mb-4">
            <div class="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          
          <h2 class="card-title justify-center text-2xl mb-3">患者様</h2>
          <p class="text-center text-base-content/70 mb-6">
            オンラインで診療予約の作成・確認・変更ができ、待ち時間も確認できます
          </p>
          
          <div class="space-y-2 mb-6">
            <div class="flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              24時間オンライン予約
            </div>
            <div class="flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              リアルタイム空き状況確認
            </div>
            <div class="flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              予約変更・キャンセル
            </div>
          </div>
          
          <div class="card-actions">
            <button 
              class="btn btn-success w-full"
              onclick={() => handleRoleSelect('patient')}
              disabled={selectedRole !== 'none'}
            >
              {#if selectedRole === 'patient'}
                <span class="loading loading-spinner"></span>
                ログイン中...
              {:else}
                予約サイトにログイン
              {/if}
            </button>
          </div>
          
          {#if CONFIG.isMockMode}
            <div class="text-xs text-center text-base-content/50 mt-2">
              デモ: {CONFIG.demoUsers.patient.name}さんとしてログイン
            </div>
          {/if}
        </div>
      </div>
    </div>
    
    <!-- 説明 -->
    <div class="mt-12 text-center">
      <div class="bg-base-100 rounded-lg p-6 shadow-lg">
        <h3 class="text-lg font-semibold mb-3">
          🏥 {CONFIG.isMockMode ? 'デモシステム' : 'システム'}について
        </h3>
        <p class="text-sm text-base-content/70 mb-4">
          {#if CONFIG.isMockMode}
            このデモでは、医療クリニックの予約管理システムを病院スタッフ側と患者側の両方の視点から体験できます。
            実際の診療データを模したサンプルデータが含まれており、リアルな操作感を体験いただけます。
          {:else}
            医療クリニックの予約管理システムです。病院スタッフ側と患者側の両方の機能を提供しています。
          {/if}
        </p>
        <div class="flex flex-wrap gap-4 justify-center text-sm">
          <div class="badge badge-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            リアルタイム更新
          </div>
          <div class="badge badge-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            AI予測機能
          </div>
          <div class="badge badge-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            モバイル対応
          </div>
        </div>
      </div>
    </div>
  </div>
</div>