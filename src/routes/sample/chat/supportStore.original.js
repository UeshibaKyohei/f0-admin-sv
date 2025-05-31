import { writable, derived, get } from 'svelte/store';

/**
 * Svelte 5 リアクティビティのベストプラクティス
 * 
 * 重要: ストアを更新する際は、必ず新しいオブジェクト/配列を作成すること
 * 
 * ❌ 悪い例:
 * store.update(data => {
 *   data.property = newValue;  // 既存オブジェクトを変更
 *   return data;               // 同じ参照を返す
 * });
 * 
 * ✅ 良い例:
 * store.update(data => {
 *   return { ...data, property: newValue };  // 新しいオブジェクトを作成
 * });
 * 
 * 配列の場合:
 * ✅ return [...array, newItem];           // 追加
 * ✅ return array.filter(item => ...);     // 削除
 * ✅ return array.map(item => ...);        // 更新
 */

// システム全体の状態
export const systemStatus = writable({
  totalOperators: 0,
  availableOperators: 0,
  totalInquiries: 0,
  waitingInquiries: 0,
  avgResponseTime: 0
});

// オペレーター管理
// status の意味：
// - available: 対応可能（新規受付OK）
// - busy: 対応中だが上限には達していない（新規受付OK）
// - break: 休憩中（新規受付NG）
// - offline: オフライン（新規受付NG）
export const operators = writable([
  {
    id: 'op-1',
    name: '田中太郎',
    avatar: '',
    status: 'available',
    skills: ['返品対応', '技術サポート', '一般問い合わせ'],
    maxConcurrent: 3,
    todayHandled: 12
  },
  {
    id: 'op-2',
    name: '鈴木花子',
    avatar: '',
    status: 'available',
    skills: ['返品対応', '配送問い合わせ'],
    maxConcurrent: 3,
    todayHandled: 8
  },
  {
    id: 'op-3',
    name: '佐藤次郎',
    avatar: '',
    status: 'available',
    skills: ['技術サポート', 'VIP対応'],
    maxConcurrent: 2,
    todayHandled: 5
  },
  {
    id: 'op-4',
    name: '山田美咲',
    avatar: '',
    status: 'break',
    skills: ['一般問い合わせ', '返品対応'],
    maxConcurrent: 3,
    todayHandled: 10
  },
  {
    id: 'op-5',
    name: '高橋健一',
    avatar: '',
    status: 'available',
    skills: ['VIP対応', '技術サポート', 'エスカレーション対応'],
    maxConcurrent: 4,
    todayHandled: 15
  }
]);

// 現在のオペレーター（ログインユーザー）
export const currentOperator = writable(null);

// 問い合わせキュー
export const inquiryQueue = writable([]);

// アクティブなチャット（対応中）
export const activeChats = writable([]);

// 顧客データベース
export const customers = writable({});

// チャットメッセージ
export const messages = writable({});

// アーカイブされた履歴
export const archivedChats = writable({});

// 選択中のチャットID
export const selectedChatId = writable(null);

// 問い合わせカテゴリ
export const inquiryCategories = {
  'return': { label: '返品・交換', icon: '↩️', avgTime: 15 },
  'shipping': { label: '配送関連', icon: '📦', avgTime: 10 },
  'product': { label: '商品について', icon: '🛍️', avgTime: 20 },
  'technical': { label: '技術サポート', icon: '🔧', avgTime: 30 },
  'billing': { label: '請求・支払い', icon: '💳', avgTime: 12 },
  'other': { label: 'その他', icon: '💬', avgTime: 15 }
};

// 優先度定義
export const priorities = {
  urgent: { label: '緊急', color: 'badge-error', sla: 5 },
  high: { label: '高', color: 'badge-warning', sla: 15 },
  normal: { label: '中', color: 'badge-primary', sla: 30 },
  low: { label: '低', color: 'badge-ghost', sla: 60 }
};

// チャットステータス
export const chatStatuses = {
  waiting: { label: '待機中', color: 'badge-ghost' },
  assigned: { label: '割当済', color: 'badge-info' },
  'in-progress': { label: '対応中', color: 'badge-success' },
  hold: { label: '保留', color: 'badge-warning' },
  escalated: { label: 'エスカレーション', color: 'badge-error' },
  resolved: { label: '解決済み', color: 'badge-neutral' }
};

// 待機中の問い合わせ（キューから自動計算）
export const waitingInquiries = derived(
  inquiryQueue,
  $queue => $queue.filter(inq => inq.status === 'waiting')
);

// オペレーター別の負荷状況（activeChatsから動的に計算）
export const operatorLoad = derived(
  [operators, activeChats],
  ([$operators, $activeChats]) => {
    return $operators.map(op => {
      const currentChats = $activeChats.filter(chat => chat.assignedTo === op.id);
      const currentChatCount = currentChats.length;
      const isAtCapacity = currentChatCount >= op.maxConcurrent;
      return {
        ...op,
        currentChats: currentChats.map(c => c.id), // IDのみの配列
        currentChatCount,
        load: (currentChatCount / op.maxConcurrent) * 100,
        canTakeMore: (op.status === 'available' || op.status === 'busy') && !isAtCapacity,
        isAtCapacity  // 容量に達しているかを明確に
      };
    });
  }
);

// 現在のオペレーターの容量状況を簡単に取得する関数
export function getCurrentOperatorCapacity() {
  const currentOp = get(currentOperator);
  if (!currentOp) return null;
  
  const activeChatsData = get(activeChats);
  const myActiveChats = activeChatsData.filter(chat => chat.assignedTo === currentOp.id);
  
  return {
    current: myActiveChats.length,
    max: currentOp.maxConcurrent,
    isAtCapacity: myActiveChats.length >= currentOp.maxConcurrent,
    canTakeMore: myActiveChats.length < currentOp.maxConcurrent
  };
}

// 新規問い合わせを追加
export function addInquiry(customerData, initialMessage, category = 'other') {
  const customerId = customerData.id || `customer-${Date.now()}`;
  const inquiryId = `INQ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  
  // 顧客情報を保存/更新
  customers.update(cust => {
    cust[customerId] = {
      ...customerData,
      lastContact: new Date().toISOString()
    };
    return cust;
  });
  
  // VIP顧客や履歴から優先度を自動判定
  const priority = determinePriority(customerData);
  
  const inquiry = {
    id: inquiryId,
    customerId,
    customerName: customerData.name,
    category,
    subject: initialMessage.slice(0, 50) + '...',
    priority,
    status: 'waiting',
    createdAt: new Date().toISOString(),
    slaDeadline: calculateSLA(priority),
    assignedTo: null,
    lockedBy: null,
    initialMessage
  };
  
  inquiryQueue.update(queue => [...queue, inquiry]);
  
  // 通知音（実装では実際の音声ファイルを使用）
  console.log('🔔 新規問い合わせ:', inquiryId);
  
  return inquiryId;
}

// 問い合わせを割り当て
export function assignInquiry(inquiryId, operatorId, force = false) {
  const inquiry = get(inquiryQueue).find(inq => inq.id === inquiryId);
  
  if (!inquiry) {
    throw new Error('問い合わせが見つかりません');
  }
  
  // オペレーターの検証と容量チェック
  const currentOperatorData = get(operators).find(op => op.id === operatorId);
  if (!currentOperatorData) {
    throw new Error('オペレーターが見つかりません');
  }
  
  // 休憩中やオフラインの場合は割り当て不可
  if ((currentOperatorData.status === 'break' || currentOperatorData.status === 'offline') && !force) {
    throw new Error('現在対応不可の状態です');
  }
  
  // 既に他のオペレーターが対応中かチェック
  if (inquiry.lockedBy && inquiry.lockedBy !== operatorId && !force) {
    const lockedByOp = get(operators).find(op => op.id === inquiry.lockedBy);
    throw new Error(`${lockedByOp.name}が対応中です`);
  }
  
  // アクティブなチャットのみをカウント（真実の源は activeChats）
  const activeChatsSnapshot = get(activeChats);
  const operatorActiveChats = activeChatsSnapshot.filter(chat => chat.assignedTo === operatorId);
  
  // オペレーターのキャパシティチェック
  if (operatorActiveChats.length >= currentOperatorData.maxConcurrent && !force) {
    throw new Error(`対応可能な上限（${currentOperatorData.maxConcurrent}件）に達しています`);
  }
  
  // 割り当て実行（イミュータブルに更新）
  inquiryQueue.update(queue => {
    return queue.map(inq => {
      if (inq.id === inquiryId) {
        return {
          ...inq,
          lockedBy: operatorId,
          assignedTo: operatorId,
          status: 'assigned'
        };
      }
      return inq;
    });
  });
  
  // operators の currentChats は使用しない（activeChats が真実の源）
  // ステータスのみ必要に応じて更新する処理をここに追加可能
  
  // アクティブチャットに追加（イミュータブルに更新）
  activeChats.update(chats => {
    if (!chats.find(c => c.id === inquiryId)) {
      return [...chats, {
        ...inquiry,
        assignedTo: operatorId,
        startTime: new Date().toISOString()
      }];
    }
    return chats;
  });
  
  // 初期メッセージを追加
  if (inquiry.initialMessage) {
    messages.update(msgs => {
      const newMsgs = { ...msgs };
      if (!newMsgs[inquiryId]) {
        newMsgs[inquiryId] = [];
      }
      // 顧客からの初期メッセージ
      newMsgs[inquiryId] = [{
        id: `msg-${Date.now()}-init`,
        chatId: inquiryId,
        sender: 'customer',
        content: inquiry.initialMessage,
        timestamp: inquiry.createdAt
      }];
      return newMsgs;
    });
  }
  
  return true;
}

// 優先度の自動判定
function determinePriority(customerData) {
  // VIP顧客
  if (customerData.tier === 'ゴールド' || customerData.isVIP) {
    return 'high';
  }
  
  // 過去のクレーム履歴
  if (customerData.previousComplaints > 2) {
    return 'high';
  }
  
  // 通常
  return 'normal';
}

// SLA期限の計算
function calculateSLA(priority) {
  const slaMinutes = priorities[priority].sla;
  const deadline = new Date();
  deadline.setMinutes(deadline.getMinutes() + slaMinutes);
  return deadline.toISOString();
}

// チャット終了とアーカイブ
export function resolveChat(chatId, resolution, summary) {
  const chat = get(activeChats).find(c => c.id === chatId);
  if (!chat) return;
  
  // アーカイブデータの作成
  const archived = {
    id: chatId,
    customerId: chat.customerId,
    date: chat.createdAt,
    endDate: new Date().toISOString(),
    subject: chat.subject,
    category: chat.category,
    summary,
    resolution,
    messages: get(messages)[chatId] || [],
    operatorId: chat.assignedTo,
    responseTime: calculateResponseTime(chat.createdAt, chat.startTime),
    resolutionTime: calculateResponseTime(chat.startTime, new Date().toISOString()),
    satisfactionScore: null // 後で顧客が評価
  };
  
  // アーカイブに保存（イミュータブルに更新）
  archivedChats.update(archives => {
    const newArchives = { ...archives };
    if (!newArchives[chat.customerId]) {
      newArchives[chat.customerId] = [];
    }
    newArchives[chat.customerId] = [...newArchives[chat.customerId], archived];
    return newArchives;
  });
  
  // アクティブから削除
  activeChats.update(chats => chats.filter(c => c.id !== chatId));
  inquiryQueue.update(queue => queue.filter(inq => inq.id !== chatId));
  
  // オペレーターの本日対応数を更新
  operators.update(ops => {
    return ops.map(op => {
      if (op.id === chat.assignedTo) {
        return {
          ...op,
          todayHandled: op.todayHandled + 1
        };
      }
      return op;
    });
  });
  
  // メッセージをクリア（新しいオブジェクトを作成）
  messages.update(msgs => {
    const newMsgs = { ...msgs };
    delete newMsgs[chatId];
    return newMsgs;
  });
  
  // 選択中のチャットIDが削除されたチャットの場合はクリアまたは他のチャットを選択
  if (get(selectedChatId) === chatId) {
    const remainingChats = get(activeChats).filter(c => c.id !== chatId);
    if (remainingChats.length > 0) {
      // 残っているチャットがある場合は最初のチャットを選択
      selectedChatId.set(remainingChats[0].id);
    } else {
      // チャットがない場合はnullに設定
      selectedChatId.set(null);
    }
  }
}

// 応答/解決時間の計算
function calculateResponseTime(start, end) {
  const diff = new Date(end) - new Date(start);
  return Math.floor(diff / 1000 / 60); // 分単位
}

// メッセージ送信
export function sendMessage(chatId, content, type = 'agent') {
  const message = {
    id: `msg-${Date.now()}-${Math.random()}`,
    chatId,
    type,
    content,
    timestamp: new Date().toISOString(),
    agentId: type === 'agent' ? get(currentOperator)?.id : null
  };
  
  messages.update(msgs => {
    // 新しいオブジェクトを作成してリアクティビティを確保
    const newMsgs = { ...msgs };
    if (!newMsgs[chatId]) {
      newMsgs[chatId] = [message];
    } else {
      // 既存の配列をコピーして新しいメッセージを追加
      newMsgs[chatId] = [...newMsgs[chatId], message];
    }
    return newMsgs;
  });
  
  return message;
}

// チャットステータス更新
export function updateChatStatus(chatId, newStatus) {
  activeChats.update(chats => {
    return chats.map(chat => {
      if (chat.id === chatId) {
        return { ...chat, status: newStatus };
      }
      return chat;
    });
  });
}

// チャット優先度更新
export function updateChatPriority(chatId, newPriority) {
  activeChats.update(chats => {
    return chats.map(chat => {
      if (chat.id === chatId) {
        return { ...chat, priority: newPriority };
      }
      return chat;
    });
  });
  
  inquiryQueue.update(queue => {
    return queue.map(inquiry => {
      if (inquiry.id === chatId) {
        return { ...inquiry, priority: newPriority };
      }
      return inquiry;
    });
  });
}

// エスカレーション
export function escalateChat(chatId, toOperatorId, reason) {
  const chat = get(activeChats).find(c => c.id === chatId);
  if (!chat) return;
  
  const fromOperatorId = chat.assignedTo;
  
  // エスカレーション元のオペレーターはactiveChatsから自動的に更新される
  // 特別な処理は不要
  
  // エスカレーション先に割り当て
  assignInquiry(chatId, toOperatorId, true);
  
  // ステータス更新
  activeChats.update(chats => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      chat.status = 'escalated';
      chat.escalationReason = reason;
    }
    return chats;
  });
  
  // システムメッセージを追加
  const systemMessage = {
    id: `msg-${Date.now()}`,
    chatId,
    type: 'system',
    content: `チャットが${get(operators).find(o => o.id === toOperatorId).name}にエスカレーションされました。理由: ${reason}`,
    timestamp: new Date().toISOString()
  };
  
  messages.update(msgs => {
    const newMsgs = { ...msgs };
    if (!newMsgs[chatId]) {
      newMsgs[chatId] = [systemMessage];
    } else {
      newMsgs[chatId] = [...newMsgs[chatId], systemMessage];
    }
    return newMsgs;
  });
}