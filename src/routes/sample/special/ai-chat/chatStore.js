import { writable, derived, get } from 'svelte/store';
import { getConfig, isMockMode } from './config.js';
import * as chatApi from './api/chatApi.js';
import { mockPromptTemplates } from './mockData.js';

/**
 * AIチャットストア
 * 会話とメッセージの状態管理を行う
 */

// 会話リスト
export const conversations = writable([]);

// 現在選択中の会話ID
export const currentConversationId = writable(null);

// メッセージ（会話IDごとに管理）
export const messages = writable({});

// ローディング状態
export const isLoading = writable(false);

// エラー状態
export const error = writable(null);

// プロンプトテンプレート
export const promptTemplates = writable([]);

// 設定
export const settings = writable({
  temperature: getConfig('model.temperature'),
  maxTokens: getConfig('model.maxTokens'),
  streamResponse: getConfig('model.streamResponse'),
  saveHistory: getConfig('chat.enableHistory'),
  autoTitle: getConfig('chat.enableAutoTitle')
});

/**
 * 初期化処理
 */
export async function initializeChat() {
  try {
    // プロンプトテンプレートの読み込み
    if (isMockMode()) {
      promptTemplates.set(mockPromptTemplates);
    }
    
    // 会話リストの取得
    const convs = await chatApi.fetchConversations();
    conversations.set(convs);
    
    // 初期会話の作成または選択
    if (convs.length === 0) {
      await createNewConversation();
    } else {
      currentConversationId.set(convs[0].id);
    }
  } catch (err) {
    console.error('Chat initialization error:', err);
    error.set('チャットの初期化に失敗しました。');
  }
}

// 新しい会話を作成
export async function createNewConversation() {
  // 現在の会話が空の場合は新規作成しない
  const currentId = get(currentConversationId);
  const currentMessages = get(messages)[currentId] || [];
  
  if (currentMessages.length === 0 && currentId) {
    return currentId;
  }
  
  try {
    const newConversation = await chatApi.createConversation({
      title: '新しい会話'
    });
    
    conversations.update(convs => [newConversation, ...convs]);
    messages.update(msgs => ({ ...msgs, [newConversation.id]: [] }));
    currentConversationId.set(newConversation.id);
    
    return newConversation.id;
  } catch (err) {
    console.error('Create conversation error:', err);
    error.set('会話の作成に失敗しました。');
    return null;
  }
}

// 会話を削除
export async function deleteConversation(id) {
  try {
    await chatApi.deleteConversation(id);
    
    conversations.update(convs => convs.filter(c => c.id !== id));
    messages.update(msgs => {
      const newMsgs = { ...msgs };
      delete newMsgs[id];
      return newMsgs;
    });
    
    // 削除した会話が現在選択中の場合、別の会話を選択
    if (get(currentConversationId) === id) {
      const remainingConvs = get(conversations);
      if (remainingConvs.length > 0) {
        currentConversationId.set(remainingConvs[0].id);
      } else {
        await createNewConversation();
      }
    }
  } catch (err) {
    console.error('Delete conversation error:', err);
    error.set('会話の削除に失敗しました。');
  }
}

// 会話のタイトルを更新
export function updateConversationTitle(id, title) {
  conversations.update(convs => 
    convs.map(c => c.id === id ? { ...c, title, updated_at: new Date().toISOString() } : c)
  );
}

// 会話をピン留め/解除
export async function togglePinConversation(id) {
  const conversation = get(conversations).find(c => c.id === id);
  if (!conversation) return;
  
  try {
    await chatApi.updateConversationPin(id, !conversation.is_pinned);
    conversations.update(convs => 
      convs.map(c => c.id === id ? { ...c, is_pinned: !c.is_pinned } : c)
    );
  } catch (err) {
    console.error('Toggle pin error:', err);
    error.set('ピン留めの更新に失敗しました。');
  }
}

// メッセージを送信
export async function sendMessage(content, options = {}) {
  const conversationId = get(currentConversationId);
  if (!conversationId) return;
  
  const userMessage = {
    id: Date.now().toString(),
    role: 'user',
    content,
    timestamp: new Date().toISOString()
  };
  
  // ユーザーメッセージを追加
  messages.update(msgs => ({
    ...msgs,
    [conversationId]: [...(msgs[conversationId] || []), userMessage]
  }));
  
  // 自動タイトル生成
  const currentMessages = get(messages)[conversationId];
  if (currentMessages.length === 1 && get(settings).autoTitle) {
    const title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
    updateConversationTitle(conversationId, title);
  }
  
  // AIレスポンスを生成
  isLoading.set(true);
  error.set(null);
  
  try {
    if (getConfig('model.streamResponse')) {
      await handleStreamingResponse(conversationId, userMessage);
    } else {
      await handleNormalResponse(conversationId, userMessage);
    }
    
    // 会話の更新日時を更新
    conversations.update(convs => 
      convs.map(c => c.id === conversationId ? { ...c, updated_at: new Date().toISOString() } : c)
    );
  } catch (err) {
    error.set('メッセージの送信に失敗しました。');
    console.error('Send message error:', err);
  } finally {
    isLoading.set(false);
  }
}

// ストリーミングレスポンスの処理
async function handleStreamingResponse(conversationId, userMessage) {
  if (isMockMode()) {
    // モックのストリーミング処理
    await simulateStreamingResponse(conversationId, userMessage.content);
  } else {
    // 本実装時のストリーミング処理
    const assistantMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      suggestions: []
    };
    
    // 空のメッセージを追加
    messages.update(msgs => ({
      ...msgs,
      [conversationId]: [...msgs[conversationId], assistantMessage]
    }));
    
    // ストリーミングレスポンスの処理
    const response = await chatApi.sendMessage(conversationId, userMessage);
    
    for await (const chunk of response) {
      if (chunk.choices?.[0]?.delta?.content) {
        assistantMessage.content += chunk.choices[0].delta.content;
        
        messages.update(msgs => {
          const newMsgs = { ...msgs };
          const convMessages = [...newMsgs[conversationId]];
          convMessages[convMessages.length - 1] = { ...assistantMessage };
          newMsgs[conversationId] = convMessages;
          return newMsgs;
        });
      }
      
      // 選択肢が含まれている場合
      if (chunk.suggestions) {
        assistantMessage.suggestions = chunk.suggestions;
      }
    }
  }
}

// 通常のレスポンスの処理
async function handleNormalResponse(conversationId, userMessage) {
  const response = await chatApi.sendMessage(conversationId, userMessage);
  
  const assistantMessage = {
    id: response.message.id,
    role: 'assistant',
    content: response.message.content,
    timestamp: response.message.created_at,
    suggestions: response.suggestions || []
  };
  
  messages.update(msgs => ({
    ...msgs,
    [conversationId]: [...msgs[conversationId], assistantMessage]
  }));
}

// モックのストリーミングレスポンス
async function simulateStreamingResponse(conversationId, userMessage) {
  const { generateMockResponse, generateMockSuggestions } = await import('./mockData.js');
  
  // 初期の思考時間
  await new Promise(resolve => setTimeout(resolve, getConfig('mock.responseDelay.min')));
  
  const assistantMessage = {
    id: Date.now().toString(),
    role: 'assistant',
    content: '',
    timestamp: new Date().toISOString(),
    suggestions: []
  };
  
  // 空のメッセージを追加
  messages.update(msgs => ({
    ...msgs,
    [conversationId]: [...msgs[conversationId], assistantMessage]
  }));
  
  // モックレスポンスを段階的に生成
  const fullResponse = generateMockResponse(userMessage);
  const chars = fullResponse.split('');
  let currentContent = '';
  
  // 文字単位でストリーミング
  for (let i = 0; i < chars.length; i++) {
    const delay = chars[i].match(/[。、！？\n]/) 
      ? getConfig('mock.streamingSpeed.punctuationDelay') 
      : getConfig('mock.streamingSpeed.charDelay');
    
    await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 20));
    
    currentContent += chars[i];
    assistantMessage.content = currentContent;
    
    messages.update(msgs => {
      const newMsgs = { ...msgs };
      const convMessages = [...newMsgs[conversationId]];
      convMessages[convMessages.length - 1] = { ...assistantMessage };
      newMsgs[conversationId] = convMessages;
      return newMsgs;
    });
  }
  
  // 選択肢を生成
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (getConfig('mock.enableMockSuggestions')) {
    const suggestions = generateMockSuggestions(userMessage);
    assistantMessage.suggestions = suggestions;
    
    messages.update(msgs => {
      const newMsgs = { ...msgs };
      const convMessages = [...newMsgs[conversationId]];
      convMessages[convMessages.length - 1] = { ...assistantMessage };
      newMsgs[conversationId] = convMessages;
      return newMsgs;
    });
  }
}

// 最後のメッセージを再生成
export async function regenerateLastMessage() {
  const conversationId = get(currentConversationId);
  const currentMessages = get(messages)[conversationId] || [];
  
  if (currentMessages.length < 2) return;
  
  // 最後のアシスタントメッセージを削除
  const lastUserMessageIndex = currentMessages.findLastIndex(m => m.role === 'user');
  if (lastUserMessageIndex === -1) return;
  
  messages.update(msgs => ({
    ...msgs,
    [conversationId]: currentMessages.slice(0, lastUserMessageIndex + 1)
  }));
  
  // 最後のユーザーメッセージで再送信
  await sendMessage(currentMessages[lastUserMessageIndex].content);
}

// 生成を停止
export function stopGeneration() {
  isLoading.set(false);
}

// チャット履歴をエクスポート
export function exportChatHistory(conversationId, format = 'json') {
  const conversation = get(conversations).find(c => c.id === conversationId);
  const conversationMessages = get(messages)[conversationId] || [];
  
  if (!conversation) return;
  
  const exportData = {
    conversation,
    messages: conversationMessages,
    exported_at: new Date().toISOString()
  };
  
  let content, filename, mimeType;
  
  switch (format) {
    case 'json':
      content = JSON.stringify(exportData, null, 2);
      filename = `chat-${conversation.title}-${new Date().toISOString()}.json`;
      mimeType = 'application/json';
      break;
    case 'markdown':
      content = generateMarkdown(exportData);
      filename = `chat-${conversation.title}-${new Date().toISOString()}.md`;
      mimeType = 'text/markdown';
      break;
    case 'txt':
      content = generatePlainText(exportData);
      filename = `chat-${conversation.title}-${new Date().toISOString()}.txt`;
      mimeType = 'text/plain';
      break;
    default:
      return;
  }
  
  // ダウンロード処理
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Markdown形式でエクスポート
function generateMarkdown(data) {
  let content = `# ${data.conversation.title}\n\n`;
  content += `**作成日時**: ${new Date(data.conversation.created_at).toLocaleString()}\n`;
  content += `**エクスポート日時**: ${new Date(data.exported_at).toLocaleString()}\n\n`;
  content += '---\n\n';
  
  data.messages.forEach(msg => {
    content += `### ${msg.role === 'user' ? 'ユーザー' : 'アシスタント'}\n`;
    content += `*${new Date(msg.timestamp).toLocaleString()}*\n\n`;
    content += `${msg.content}\n\n`;
    content += '---\n\n';
  });
  
  return content;
}

// プレーンテキスト形式でエクスポート
function generatePlainText(data) {
  let content = `会話: ${data.conversation.title}\n`;
  content += `作成日時: ${new Date(data.conversation.created_at).toLocaleString()}\n`;
  content += `エクスポート日時: ${new Date(data.exported_at).toLocaleString()}\n\n`;
  content += '=====================================\n\n';
  
  data.messages.forEach(msg => {
    content += `[${msg.role === 'user' ? 'ユーザー' : 'アシスタント'}] `;
    content += `${new Date(msg.timestamp).toLocaleString()}\n`;
    content += `${msg.content}\n\n`;
    content += '-------------------------------------\n\n';
  });
  
  return content;
}

// 会話を検索
export const searchConversations = derived(
  conversations,
  $conversations => (query) => {
    if (!query) return $conversations;
    
    const lowerQuery = query.toLowerCase();
    return $conversations.filter(conv => 
      conv.title.toLowerCase().includes(lowerQuery)
    );
  }
);