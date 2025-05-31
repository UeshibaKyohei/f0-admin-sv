<script>
  import { 
    currentOperator, 
    operators,
    activeChats,
    inquiryQueue,
    notifications,
    pendingAssignments,
    addInquiry,
    requestAssignInquiry,
    requestEscalateChat,
    acceptAssignment,
    rejectAssignment,
    acceptEscalation,
    rejectEscalation,
    sendMessage,
    updateOperatorStatus
  } from './supportStore.js';
  import { 
    generateRandomInquiry,
    startRandomInquiryGeneration,
    stopRandomInquiryGeneration,
    isGeneratingInquiries
  } from './api/demoDataGenerator.js';
  import { debugSettings } from './api/debugStore.js';
  
  let showPanel = $state(false);
  let selectedOperatorId = $state('op-1');
  
  // デバッグモードの切り替え
  $effect(() => {
    if ($debugSettings.autoGenerate) {
      startRandomInquiryGeneration();
    } else {
      stopRandomInquiryGeneration();
    }
  });
  
  // オペレーター切り替え
  function switchOperator(operatorId) {
    const operator = $operators.find(op => op.id === operatorId);
    if (operator) {
      currentOperator.set(operator);
      selectedOperatorId = operatorId;
    }
  }
  
  // テスト用の問い合わせ生成
  async function generateTestInquiry() {
    const categories = ['billing', 'technical', 'account', 'product', 'other'];
    const priorities = ['high', 'normal', 'low'];
    const names = ['山田太郎', '田中花子', '佐藤次郎', '鈴木美咲', '高橋健一'];
    const messages = [
      'パスワードをリセットしたいのですが',
      '請求書の金額が間違っているようです',
      '商品が届きません',
      'エラーが発生して使えません',
      'アカウントが停止されました'
    ];
    
    await addInquiry({
      customerName: names[Math.floor(Math.random() * names.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      initialMessage: messages[Math.floor(Math.random() * messages.length)]
    });
  }
  
  // 割り当てテスト
  async function testAssignment() {
    const inquiry = $inquiryQueue[0];
    if (!inquiry) {
      alert('問い合わせがありません');
      return;
    }
    
    const targetOperator = $operators.find(op => op.id !== $currentOperator?.id);
    if (!targetOperator) {
      alert('他のオペレーターがいません');
      return;
    }
    
    await requestAssignInquiry(inquiry.id, targetOperator.id);
  }
  
  // エスカレーションテスト
  async function testEscalation() {
    const myChat = $activeChats.find(chat => chat.assignedTo === $currentOperator?.id);
    if (!myChat) {
      alert('対応中のチャットがありません');
      return;
    }
    
    const targetOperator = $operators.find(op => 
      op.id !== $currentOperator?.id && op.skills.includes('エスカレーション対応')
    );
    if (!targetOperator) {
      alert('エスカレーション先がありません');
      return;
    }
    
    await requestEscalateChat(myChat.id, targetOperator.id, 'テストエスカレーション');
  }
  
  // 容量テスト
  async function fillToCapacity() {
    const operator = $operators.find(op => op.id === selectedOperatorId);
    if (!operator) return;
    
    const currentCount = $activeChats.filter(chat => chat.assignedTo === selectedOperatorId).length;
    const toAdd = operator.maxConcurrent - currentCount;
    
    for (let i = 0; i < toAdd; i++) {
      await generateTestInquiry();
      const inquiry = $inquiryQueue[$inquiryQueue.length - 1];
      if (inquiry) {
        await requestAssignInquiry(inquiry.id, selectedOperatorId);
        // 自動承認（デモ用）
        await acceptAssignment(inquiry.id);
      }
    }
  }
  
  // 通知処理
  async function processNotifications() {
    const myNotifications = $notifications.filter(n => n.operatorId === selectedOperatorId);
    
    for (const notification of myNotifications) {
      if (notification.type === 'assignment') {
        const pending = $pendingAssignments[notification.inquiryId];
        if (pending) {
          // ランダムに承認/拒否
          if (Math.random() > 0.3) {
            await acceptAssignment(notification.inquiryId);
          } else {
            await rejectAssignment(notification.inquiryId, 'テスト拒否');
          }
        }
      } else if (notification.type === 'escalation') {
        const pending = $pendingAssignments[notification.chatId];
        if (pending) {
          // ランダムに承認/拒否
          if (Math.random() > 0.3) {
            await acceptEscalation(notification.chatId);
          } else {
            await rejectEscalation(notification.chatId, 'テスト拒否');
          }
        }
      }
    }
  }
  
  // オペレーターステータス変更
  async function toggleOperatorStatus(operatorId) {
    const operator = $operators.find(op => op.id === operatorId);
    if (!operator) return;
    
    const newStatus = operator.status === 'available' ? 'away' : 'available';
    await updateOperatorStatus(operatorId, newStatus);
  }
</script>

<div class="fixed bottom-4 right-4 z-50">
  <div class="tooltip tooltip-left" data-tip="テスト・デバッグ機能">
    <button 
      class="btn btn-circle btn-warning shadow-lg"
      onclick={() => showPanel = !showPanel}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    </button>
  </div>
</div>

{#if showPanel}
  <div class="fixed bottom-20 right-4 w-96 bg-base-100 rounded-lg shadow-xl border border-base-300 z-50">
    <!-- ヘッダー -->
    <div class="flex justify-between items-center p-4 border-b border-base-300 bg-warning/10">
      <div>
        <h3 class="font-bold text-lg">テスト・デバッグパネル</h3>
        <p class="text-xs text-base-content/60">開発・デモ用の機能です</p>
      </div>
      <button 
        class="btn btn-ghost btn-sm btn-circle"
        onclick={() => showPanel = false}
      >
        ✕
      </button>
    </div>
    
    <!-- デバッグモード設定 -->
    <div class="p-4 border-b border-base-300 bg-base-200">
      <div class="space-y-2">
        <label class="label cursor-pointer">
          <span class="label-text text-sm">問い合わせ自動生成</span>
          <input 
            type="checkbox" 
            class="toggle toggle-sm toggle-warning"
            bind:checked={$debugSettings.autoGenerate}
          />
        </label>
        <label class="label cursor-pointer">
          <span class="label-text text-sm">顧客自動返信</span>
          <input 
            type="checkbox" 
            class="toggle toggle-sm toggle-warning"
            bind:checked={$debugSettings.autoReply}
          />
        </label>
        <label class="label cursor-pointer">
          <span class="label-text text-sm">統計情報表示</span>
          <input 
            type="checkbox" 
            class="toggle toggle-sm"
            bind:checked={$debugSettings.showStats}
          />
        </label>
      </div>
    </div>
    
    <div class="p-4 overflow-y-auto max-h-[60vh]">
    
    <!-- 現在のオペレーター -->
    <div class="mb-4 p-3 bg-base-200 rounded">
      <div class="text-sm font-medium mb-2">現在のオペレーター</div>
      <select 
        bind:value={selectedOperatorId}
        onchange={(e) => switchOperator(e.target.value)}
        class="select select-sm select-bordered w-full"
      >
        {#each $operators as operator}
          <option value={operator.id}>
            {operator.name} ({operator.status})
          </option>
        {/each}
      </select>
    </div>
    
      <!-- テスト機能 -->
      <div class="space-y-2">
        <div class="divider text-sm">問い合わせ管理</div>
        <button 
          class="btn btn-sm btn-primary w-full"
          onclick={generateRandomInquiry}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新規問い合わせを生成
        </button>
      
      <div class="divider text-sm">割り当てテスト</div>
      <button 
        class="btn btn-sm btn-secondary w-full"
        onclick={testAssignment}
      >
        他のオペレーターに割り当て依頼
      </button>
      
      <button 
        class="btn btn-sm btn-secondary w-full"
        onclick={fillToCapacity}
      >
        選択中のオペレーターを容量まで埋める
      </button>
      
      <div class="divider text-sm">エスカレーション</div>
      <button 
        class="btn btn-sm btn-warning w-full"
        onclick={testEscalation}
      >
        エスカレーションをテスト
      </button>
      
      <div class="divider text-sm">通知処理</div>
      <button 
        class="btn btn-sm btn-info w-full"
        onclick={processNotifications}
      >
        通知を自動処理
      </button>
      
      <div class="divider text-sm">オペレーター管理</div>
      <div class="space-y-1">
        {#each $operators as operator}
          {@const chatCount = $activeChats.filter(c => c.assignedTo === operator.id).length}
          <div class="flex items-center justify-between p-2 bg-base-200 rounded">
            <div class="text-sm">
              <div class="font-medium">{operator.name}</div>
              <div class="text-xs text-base-content/60">
                {chatCount}/{operator.maxConcurrent} チャット
              </div>
            </div>
            <button 
              class={`btn btn-xs ${operator.status === 'available' ? 'btn-success' : 'btn-ghost'}`}
              onclick={() => toggleOperatorStatus(operator.id)}
            >
              {operator.status}
            </button>
          </div>
        {/each}
      </div>
    </div>
    
      <!-- 統計情報 -->
      {#if $debugSettings.showStats}
        <div class="mt-4 p-3 bg-base-200 rounded text-xs">
          <div class="font-medium mb-1">システム統計</div>
          <div>問い合わせキュー: {$inquiryQueue.length}件</div>
          <div>アクティブチャット: {$activeChats.length}件</div>
          <div>通知: {$notifications.length}件</div>
          <div>承認待ち: {Object.keys($pendingAssignments).length}件</div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  @media (max-width: 640px) {
    .fixed {
      left: 1rem;
      right: 1rem;
      width: auto;
    }
  }
</style>