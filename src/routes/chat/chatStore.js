import { writable, derived } from 'svelte/store';

// 現在のユーザー情報
export const currentUser = writable(null);

// 選択中のチャット
export const selectedChat = writable(null);

// チャットリスト
export const chats = writable([]);

// メッセージリスト（チャットIDをキーとした辞書）
export const messages = writable({});

// オンラインユーザーリスト
export const onlineUsers = writable(new Set());

// タイピング中のユーザー
export const typingUsers = writable(new Map());

// UI状態
export const showUserProfile = writable(false);
export const profileUser = writable(null);
export const sidebarOpen = writable(true);
export const isMobile = writable(false);
export const searchQuery = writable('');
export const showEmojiPicker = writable(false);

// 未読メッセージ数の計算
export const unreadCounts = derived(
  [messages, currentUser],
  ([$messages, $currentUser]) => {
    const counts = {};
    
    if (!$currentUser) return counts;
    
    Object.entries($messages).forEach(([chatId, chatMessages]) => {
      counts[chatId] = chatMessages.filter(
        msg => !msg.readBy?.includes($currentUser.id) && msg.senderId !== $currentUser.id
      ).length;
    });
    
    return counts;
  }
);

// 総未読数
export const totalUnread = derived(
  unreadCounts,
  $unreadCounts => Object.values($unreadCounts).reduce((sum, count) => sum + count, 0)
);

// フィルターされたチャット
export const filteredChats = derived(
  [chats, searchQuery],
  ([$chats, $searchQuery]) => {
    if (!$searchQuery) return $chats;
    
    const query = $searchQuery.toLowerCase();
    return $chats.filter(chat => 
      chat.name.toLowerCase().includes(query) ||
      chat.lastMessage?.toLowerCase().includes(query)
    );
  }
);

// メッセージ送信（実際はAPIコール）
export async function sendMessage(chatId, content, type = 'text', attachments = []) {
  const newMessage = {
    id: `msg-${Date.now()}`,
    chatId,
    senderId: currentUser.get().id,
    content,
    type,
    attachments,
    timestamp: new Date().toISOString(),
    readBy: [currentUser.get().id],
    reactions: []
  };
  
  messages.update(msgs => {
    if (!msgs[chatId]) msgs[chatId] = [];
    msgs[chatId].push(newMessage);
    return msgs;
  });
  
  // チャットの最終メッセージを更新
  chats.update(chatList => {
    const chat = chatList.find(c => c.id === chatId);
    if (chat) {
      chat.lastMessage = content;
      chat.lastMessageTime = newMessage.timestamp;
    }
    return chatList;
  });
  
  // 実際のプロダクションではここでAPIコールやWebSocket送信を行う
  // await api.sendMessage(newMessage);
  
  return newMessage;
}

// メッセージを既読にする
export function markAsRead(chatId, messageIds) {
  const userId = currentUser.get().id;
  
  messages.update(msgs => {
    if (msgs[chatId]) {
      msgs[chatId].forEach(msg => {
        if (messageIds.includes(msg.id) && !msg.readBy.includes(userId)) {
          msg.readBy.push(userId);
        }
      });
    }
    return msgs;
  });
}

// タイピング状態の更新
export function setTyping(chatId, userId, isTyping) {
  typingUsers.update(users => {
    if (isTyping) {
      users.set(`${chatId}-${userId}`, {
        userId,
        chatId,
        timestamp: Date.now()
      });
    } else {
      users.delete(`${chatId}-${userId}`);
    }
    return users;
  });
}

// リアクションの追加/削除
export function toggleReaction(chatId, messageId, emoji) {
  const userId = currentUser.get().id;
  
  messages.update(msgs => {
    const message = msgs[chatId]?.find(m => m.id === messageId);
    if (message) {
      const reactionIndex = message.reactions.findIndex(
        r => r.emoji === emoji && r.userId === userId
      );
      
      if (reactionIndex >= 0) {
        message.reactions.splice(reactionIndex, 1);
      } else {
        message.reactions.push({ emoji, userId });
      }
    }
    return msgs;
  });
}