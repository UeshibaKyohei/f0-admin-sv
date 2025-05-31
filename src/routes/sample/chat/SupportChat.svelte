<script>
  import { onMount, tick } from 'svelte';
  import { 
    selectedChatId, 
    messages, 
    sendMessage,
    updateChatStatus,
    updateChatPriority,
    currentOperator,
    chatStatuses,
    priorities,
    inquiryCategories,
    operators,
    escalateChat,
    activeChats,
    customers,
    archivedChats,
    responseTemplates
  } from './supportStore.js';
  import { replaceTemplateVariables } from './api/validators.js';
  import { debugSettings } from './api/debugStore.js';
  
  let messageContainer;
  let messageText = $state('');
  let showTemplates = $state(false);
  let showTemplateModal = $state(false);
  let isTyping = $state(false);
  let showEscalateModal = $state(false);
  let escalateToId = $state('');
  let escalateReason = $state('');
  let showHistory = $state(false);
  
  // 現在のチャット情報
  const currentChat = $derived($activeChats.find(c => c.id === $selectedChatId));
  const currentCustomer = $derived($customers[currentChat?.customerId]);
  const customerHistory = $derived($archivedChats[currentChat?.customerId] || []);
  
  // メッセージリスト（リアクティビティを確保）
  const chatMessages = $derived.by(() => {
    if (!currentChat) return [];
    // messagesストアの変更を検知するため、全体を参照
    const allMessages = $messages;
    return allMessages[currentChat.id] || [];
  });
  
  // カテゴリ別にフィルタリングされたテンプレート
  const relevantTemplates = $derived.by(() => {
    if (!currentChat) return [];
    // 現在のチャットのカテゴリに関連するテンプレートを優先
    const allTemplates = $responseTemplates;
    const categoryTemplates = allTemplates.filter(t => 
      t.category === currentChat.category || t.category === 'general'
    );
    const otherTemplates = allTemplates.filter(t => 
      t.category !== currentChat.category && t.category !== 'general'
    );
    return [...categoryTemplates, ...otherTemplates];
  });
  
  // メッセージ送信
  async function handleSend() {
    if (!messageText.trim()) return;
    
    // メッセージを送信
    await sendMessage(currentChat.id, messageText.trim(), 'agent');
    messageText = '';
    
    // デバッグモードで自動返信がONの場合のみ顧客からの返信を生成
    if ($debugSettings.autoReply) {
      setTimeout(() => {
        const responses = [
          'ありがとうございます。確認させていただきます。',
          'はい、そちらでお願いします。',
          'もう少し詳しく教えていただけますか？',
          '承知いたしました。',
          'いつ頃になりますでしょうか？'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        sendMessage(currentChat.id, randomResponse, 'customer');
      }, 1000 + Math.random() * 2000);
    }
    
    tick().then(() => {
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    });
  }
  
  // テンプレート選択
  function selectTemplate(template) {
    // 変数を置換してメッセージに設定
    const replacedText = replaceTemplateVariables(template.content, {
      customer: currentCustomer,
      operator: $currentOperator,
      chat: currentChat
    });
    messageText = replacedText;
    showTemplateModal = false;
  }
  
  // ステータス変更
  function changeStatus(status) {
    updateChatStatus(currentChat.id, status);
  }
  
  // 優先度変更
  function changePriority(priority) {
    updateChatPriority(currentChat.id, priority);
  }
  
  // エスカレーション
  async function handleEscalate() {
    if (!escalateToId || !escalateReason.trim()) {
      alert('エスカレーション先と理由を入力してください');
      return;
    }
    
    try {
      await escalateChat(currentChat.id, escalateToId, escalateReason);
      showEscalateModal = false;
      escalateToId = '';
      escalateReason = '';
      alert('エスカレーション依頼を送信しました');
    } catch (error) {
      alert('エスカレーションに失敗しました: ' + error.message);
    }
  }
  
  // 利用可能なオペレーター（エスカレーション先）
  const availableOperators = $derived(
    $operators.filter(op => 
      op.id !== $currentOperator?.id && 
      (op.status === 'available' || op.skills.includes('エスカレーション対応'))
    )
  );
  
  // 初期メッセージを設定
  onMount(() => {
    if (currentChat && !chatMessages.length) {
      // 顧客の初回メッセージ
      messages.update(msgs => {
        msgs[currentChat.id] = [{
          id: `msg-init-${currentChat.id}`,
          chatId: currentChat.id,
          type: 'customer',
          content: currentChat.initialMessage,
          timestamp: currentChat.createdAt
        }];
        return msgs;
      });
    }
  });
  
  // チャット切り替え時やメッセージ追加時にスクロール
  $effect(() => {
    if (currentChat && chatMessages.length > 0) {
      tick().then(() => {
        if (messageContainer) {
          messageContainer.scrollTop = messageContainer.scrollHeight;
        }
      });
    }
  });
</script>

{#if currentChat}
  <div class="flex flex-col h-full bg-base-100">
    <!-- チャットヘッダー -->
    <div class="bg-base-100 border-b border-base-300 flex-shrink-0">
      <!-- 上段：顧客情報とアクション -->
      <div class="px-4 py-2 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-lg">{currentChat.customerName}</h3>
              {#if currentCustomer?.tier}
                <div class={`badge badge-sm ${
                  currentCustomer.tier === 'ゴールド' ? 'badge-warning' :
                  currentCustomer.tier === 'シルバー' ? 'badge-ghost' :
                  'badge-accent'
                }`}>
                  {currentCustomer.tier}
                </div>
              {/if}
            </div>
            <div class="text-sm text-base-content/60">
              {inquiryCategories[currentChat.category]?.icon} {inquiryCategories[currentChat.category]?.label}
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- 履歴表示トグル -->
          <div class="tooltip tooltip-bottom" data-tip="過去の履歴">
            <button 
              class={`btn btn-circle btn-sm ${showHistory ? 'btn-primary' : 'btn-ghost'}`}
              onclick={() => showHistory = !showHistory}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          
          <!-- その他のアクション -->
          <div class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-ghost btn-circle btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </label>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-48 z-10">
              <li class="menu-title">
                <span>アクション</span>
              </li>
              <li>
                <a onclick={() => showEscalateModal = true} class="text-error">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  エスカレーション
                </a>
              </li>
              <li>
                <a>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  メモを追加
                </a>
              </li>
              <li>
                <a>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 11-9.032-4.026m9.032 4.026A9.001 9.001 0 0112 21m9.032-6.316A9.001 9.001 0 0112 3" />
                  </svg>
                  転送
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- 下段：ステータスと情報 -->
      <div class="px-4 pb-2 flex items-center justify-between border-t border-base-300">
        <div class="flex items-center gap-4 text-sm">
          <!-- ステータス -->
          <div class="flex items-center gap-2">
            <span class="text-base-content/60">ステータス:</span>
            <div class="dropdown dropdown-hover">
              <label tabindex="0" class={`badge ${chatStatuses[currentChat.status || 'active']?.color || 'badge-success'} cursor-pointer`}>
                {chatStatuses[currentChat.status || 'active']?.label || '対応中'}
              </label>
              <ul tabindex="0" class="dropdown-content menu p-1 shadow bg-base-100 rounded-box w-32 z-10">
                {#each Object.entries(chatStatuses) as [key, status]}
                  <li><a onclick={() => changeStatus(key)} class="text-sm py-1">{status.label}</a></li>
                {/each}
              </ul>
            </div>
          </div>
          
          <!-- 優先度 -->
          <div class="flex items-center gap-2">
            <span class="text-base-content/60">優先度:</span>
            <div class="dropdown dropdown-hover">
              <label tabindex="0" class={`badge ${priorities[currentChat.priority || 'normal']?.color || 'badge-primary'} cursor-pointer`}>
                {priorities[currentChat.priority || 'normal']?.label || '中'}
              </label>
              <ul tabindex="0" class="dropdown-content menu p-1 shadow bg-base-100 rounded-box w-32 z-10">
                {#each Object.entries(priorities) as [key, priority]}
                  <li><a onclick={() => changePriority(key)} class="text-sm py-1">{priority.label}</a></li>
                {/each}
              </ul>
            </div>
          </div>
          
          <!-- 経過時間 -->
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-base-content/60">
              {new Date(currentChat.startTime).toLocaleTimeString('ja-JP')}から対応中
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- メッセージエリア -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <div 
        bind:this={messageContainer}
        class="flex-1 overflow-y-auto p-4 space-y-4"
      >
          {#if chatMessages.length === 0 && currentChat.initialMessage}
            <!-- 初期メッセージがない場合のフォールバック -->
            <div class="chat chat-start">
              <div class="chat-header">
                {currentChat.customerName}
                <time class="text-xs opacity-50 ml-1">
                  {new Date(currentChat.createdAt).toLocaleTimeString('ja-JP')}
                </time>
              </div>
              <div class="chat-bubble whitespace-pre-wrap">
                {currentChat.initialMessage}
              </div>
            </div>
          {/if}
          
          {#each chatMessages as message}
            <div class={`chat ${message.type === 'agent' ? 'chat-end' : message.type === 'system' ? 'chat-center' : 'chat-start'}`}>
              {#if message.type === 'system'}
                <div class="text-sm text-base-content/60 text-center">
                  {message.content}
                </div>
              {:else}
                <div class="chat-header">
                  {message.type === 'agent' ? 
                    ($currentOperator?.name || '不明') : 
                    currentChat.customerName
                  }
                  <time class="text-xs opacity-50 ml-1">
                    {new Date(message.timestamp).toLocaleTimeString('ja-JP')}
                  </time>
                </div>
                <div class={`chat-bubble ${message.type === 'agent' ? 'chat-bubble-primary' : ''} whitespace-pre-wrap`}>
                  {message.content}
                </div>
              {/if}
            </div>
          {/each}
          
          {#if isTyping}
            <div class="chat chat-start">
              <div class="chat-bubble">
                <span class="loading loading-dots loading-sm"></span>
              </div>
            </div>
          {/if}
      </div>
      
      <!-- 入力エリア -->
      <div class="border-t border-base-300 p-3 bg-base-100 flex-shrink-0">
          <!-- クイックアクション -->
          <div class="mb-2 flex items-center justify-between">
            <div class="text-xs text-base-content/60">
              {#if isTyping}
                <span class="loading loading-spinner loading-xs"></span>
                <span class="ml-1">入力中...</span>
              {:else}
                メッセージを入力
              {/if}
            </div>
            
            <!-- テンプレートボタン -->
            <button 
              class="btn btn-ghost btn-xs gap-1"
              onclick={() => showTemplateModal = true}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              テンプレート
            </button>
          </div>
          
          <!-- 入力フィールド -->
          <div class="flex gap-2">
            <textarea
              bind:value={messageText}
              onkeydown={(e) => {
                // Ctrl+Enter または Cmd+Enter で送信
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`メッセージを入力... (${navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Enterで送信)`}
              class="textarea textarea-bordered flex-1 min-h-[3rem] max-h-32"
              rows="1"
            />
            
            <button 
              class="btn btn-primary btn-circle btn-sm"
              onclick={handleSend}
              disabled={!messageText.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
      </div>
    </div>
      
    <!-- 履歴パネル -->
    {#if showHistory}
      <div class="w-80 border-l border-base-300 overflow-y-auto bg-base-100">
        <div class="p-4">
          <h3 class="font-semibold mb-3">過去の問い合わせ履歴</h3>
        
        {#if customerHistory.length > 0}
          <div class="space-y-3">
            {#each customerHistory as history}
              <div class="card bg-base-200">
                <div class="card-body p-3">
                  <div class="text-sm">
                    <div class="font-medium mb-1">
                      {history.subject}
                    </div>
                    <div class="text-base-content/70 mb-2">
                      {new Date(history.date).toLocaleDateString('ja-JP')} | 
                      {history.resolution === 'resolved' ? '解決済み' : '未解決'}
                    </div>
                    <div class="text-xs">
                      {history.summary}
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-sm text-base-content/60">履歴はありません</p>
        {/if}
        </div>
      </div>
    {/if}
  </div>
  
  <!-- エスカレーションモーダル -->
  {#if showEscalateModal}
    <div class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">エスカレーション</h3>
        
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">エスカレーション先</span>
          </label>
          <select bind:value={escalateToId} class="select select-bordered">
            <option value="">選択してください</option>
            {#each availableOperators as op}
              <option value={op.id}>
                {op.name} 
                ({op.skills.join(', ')})
                - {op.status === 'available' ? '対応可能' : '対応中'}
              </option>
            {/each}
          </select>
        </div>
        
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">理由</span>
          </label>
          <textarea 
            bind:value={escalateReason}
            class="textarea textarea-bordered" 
            placeholder="エスカレーションの理由を記入"
            rows="3"
          ></textarea>
        </div>
        
        <div class="modal-action">
          <button class="btn" onclick={() => showEscalateModal = false}>
            キャンセル
          </button>
          <button 
            class="btn btn-error"
            onclick={handleEscalate}
            disabled={!escalateToId || !escalateReason.trim()}
          >
            エスカレーション実行
          </button>
        </div>
      </div>
      <div class="modal-backdrop" onclick={() => showEscalateModal = false}></div>
    </div>
  {/if}
  
  <!-- テンプレートモーダル -->
  {#if showTemplateModal}
    <div class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-lg mb-4">テンプレートを選択</h3>
        
        <div class="space-y-2 max-h-96 overflow-y-auto">
          {#each relevantTemplates as template}
            <div 
              class="card bg-base-200 hover:bg-base-300 cursor-pointer transition-colors"
              onclick={() => selectTemplate(template)}
            >
              <div class="card-body p-3">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-medium text-sm mb-1">{template.title}</h4>
                    <p class="text-sm text-base-content/80 whitespace-pre-wrap">
                      {template.content}
                    </p>
                  </div>
                  <div class={`badge badge-sm ${
                    template.category === currentChat?.category ? 'badge-primary' : 
                    template.category === 'general' ? 'badge-ghost' : 
                    'badge-neutral'
                  }`}>
                    {inquiryCategories[template.category]?.label || template.category}
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
        
        <div class="modal-action">
          <button class="btn btn-sm" onclick={() => showTemplateModal = false}>
            キャンセル
          </button>
        </div>
      </div>
      <div class="modal-backdrop" onclick={() => showTemplateModal = false}></div>
    </div>
  {/if}
{/if}