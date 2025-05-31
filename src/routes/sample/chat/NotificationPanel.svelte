<script>
  import { 
    notifications, 
    pendingAssignments,
    acceptAssignment,
    rejectAssignment,
    acceptEscalation,
    rejectEscalation,
    markNotificationRead,
    removeNotification,
    currentOperator
  } from './supportStore.js';
  
  // 現在のオペレーター向けの通知
  const myNotifications = $derived(
    $notifications.filter(n => n.operatorId === $currentOperator?.id)
  );
  
  // 未読通知数
  const unreadCount = $derived(
    myNotifications.filter(n => !n.read).length
  );
  
  let showPanel = $state(false);
  
  // 通知をクリック
  async function handleNotification(notification) {
    markNotificationRead(notification.id);
    
    // 割り当てまたはエスカレーションの通知の場合、承認/拒否ダイアログを表示
    if (notification.type === 'assignment' || notification.type === 'escalation') {
      const pending = $pendingAssignments[notification.inquiryId || notification.chatId];
      if (pending) {
        showApprovalDialog(notification, pending);
      }
    }
  }
  
  // 承認/拒否ダイアログ
  let showApproval = $state(false);
  let currentApproval = $state(null);
  let rejectReason = $state('');
  
  function showApprovalDialog(notification, pending) {
    currentApproval = { notification, pending };
    showApproval = true;
  }
  
  async function handleAccept() {
    if (!currentApproval) return;
    
    try {
      if (currentApproval.pending.type === 'assignment') {
        await acceptAssignment(currentApproval.notification.inquiryId);
      } else {
        await acceptEscalation(currentApproval.notification.chatId);
      }
      showApproval = false;
      currentApproval = null;
    } catch (error) {
      alert('承認に失敗しました: ' + error.message);
    }
  }
  
  async function handleReject() {
    if (!currentApproval) return;
    
    try {
      if (currentApproval.pending.type === 'assignment') {
        await rejectAssignment(currentApproval.notification.inquiryId, rejectReason);
      } else {
        await rejectEscalation(currentApproval.notification.chatId, rejectReason);
      }
      showApproval = false;
      currentApproval = null;
      rejectReason = '';
    } catch (error) {
      alert('拒否に失敗しました: ' + error.message);
    }
  }
</script>

<!-- 通知ベルアイコン -->
<div class="indicator">
  <button 
    class="btn btn-ghost btn-circle"
    onclick={() => showPanel = !showPanel}
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  </button>
  {#if unreadCount > 0}
    <span class="indicator-item badge badge-sm badge-error">{unreadCount}</span>
  {/if}
</div>

<!-- 通知パネル -->
{#if showPanel}
  <div class="absolute right-0 top-12 w-96 max-h-96 bg-base-100 rounded-lg shadow-xl border border-base-300 overflow-hidden z-50">
    <div class="p-4 border-b border-base-300 flex justify-between items-center">
      <h3 class="font-semibold">通知</h3>
      <button 
        class="btn btn-ghost btn-xs"
        onclick={() => showPanel = false}
      >
        ✕
      </button>
    </div>
    
    <div class="overflow-y-auto max-h-80">
      {#if myNotifications.length === 0}
        <div class="p-8 text-center text-base-content/60">
          通知はありません
        </div>
      {:else}
        {#each myNotifications as notification}
          <div 
            class={`p-4 border-b border-base-300 hover:bg-base-200 cursor-pointer ${!notification.read ? 'bg-base-200' : ''}`}
            onclick={() => handleNotification(notification)}
          >
            <div class="flex items-start gap-3">
              <div class={`badge ${
                notification.type === 'assignment' ? 'badge-primary' :
                notification.type === 'escalation' ? 'badge-warning' :
                notification.type === 'warning' ? 'badge-error' :
                'badge-info'
              }`}>
                {notification.type === 'assignment' ? '割当' :
                 notification.type === 'escalation' ? 'エスカレ' :
                 notification.type === 'warning' ? '警告' :
                 '情報'}
              </div>
              <div class="flex-1">
                <div class="font-medium text-sm">{notification.title}</div>
                <div class="text-sm text-base-content/70 mt-1">
                  {notification.message}
                </div>
                <div class="text-xs text-base-content/50 mt-1">
                  {new Date(notification.createdAt).toLocaleTimeString('ja-JP')}
                </div>
              </div>
              <button 
                class="btn btn-ghost btn-xs"
                onclick={(e) => {
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
              >
                ✕
              </button>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
{/if}

<!-- 承認/拒否ダイアログ -->
{#if showApproval && currentApproval}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">
        {currentApproval.pending.type === 'assignment' ? '問い合わせの割り当て' : 'エスカレーション'}を承認しますか？
      </h3>
      
      <div class="space-y-3">
        <div class="bg-base-200 p-3 rounded">
          <div class="text-sm">
            <div class="font-medium">{currentApproval.notification.title}</div>
            <div class="text-base-content/70 mt-1">
              {currentApproval.notification.message}
            </div>
          </div>
        </div>
        
        {#if currentApproval.pending.reason}
          <div>
            <div class="text-sm font-medium mb-1">理由:</div>
            <div class="text-sm text-base-content/70">
              {currentApproval.pending.reason}
            </div>
          </div>
        {/if}
      </div>
      
      <div class="modal-action">
        <button 
          class="btn btn-ghost"
          onclick={() => {
            showApproval = false;
            currentApproval = null;
          }}
        >
          後で
        </button>
        <button 
          class="btn btn-error"
          onclick={() => {
            rejectReason = prompt('拒否理由を入力してください（任意）') || '';
            if (rejectReason !== null) handleReject();
          }}
        >
          拒否
        </button>
        <button 
          class="btn btn-primary"
          onclick={handleAccept}
        >
          承認
        </button>
      </div>
    </div>
    <div class="modal-backdrop" onclick={() => {
      showApproval = false;
      currentApproval = null;
    }}></div>
  </div>
{/if}

<style>
  /* モバイル対応 */
  @media (max-width: 640px) {
    .absolute {
      position: fixed;
      right: 1rem;
      top: 4rem;
      left: 1rem;
      width: auto;
    }
  }
</style>