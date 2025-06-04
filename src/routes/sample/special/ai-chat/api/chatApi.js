import { getApiUrl, isMockMode, getConfig } from '../config.js';

/**
 * チャットAPI統合モジュール
 * 本実装時はこのモジュールの各関数内部を実際のAPI呼び出しに置き換える
 */

/**
 * 会話一覧を取得
 * @param {Object} params - 検索パラメータ
 * @returns {Promise<Array>} 会話リスト
 */
export async function fetchConversations(params = {}) {
  if (isMockMode()) {
    // モックデータを返す
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: '1',
        title: '新しい会話',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'user-1',
        is_pinned: false,
        message_count: 0
      }
    ];
  }
  
  // 本実装時のAPI呼び出し
  const response = await fetch(getApiUrl('/conversations'), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * メッセージを送信
 * @param {string} conversationId - 会話ID
 * @param {Object} message - メッセージオブジェクト
 * @returns {Promise<Object>} レスポンス
 */
export async function sendMessage(conversationId, message) {
  const requestBody = {
    conversation_id: conversationId,
    message: {
      content: message.content,
      role: 'user',
      attachments: message.attachments || []
    },
    settings: {
      model: getConfig('model.default'),
      temperature: getConfig('model.temperature'),
      max_tokens: getConfig('model.maxTokens'),
      stream: getConfig('model.streamResponse')
    }
  };
  
  if (isMockMode()) {
    // モックレスポンスの生成
    const { generateMockResponse, generateMockSuggestions } = await import('../mockData.js');
    await new Promise(resolve => setTimeout(resolve, getConfig('mock.responseDelay.min')));
    
    return {
      message: {
        id: Date.now().toString(),
        conversation_id: conversationId,
        role: 'assistant',
        content: generateMockResponse(message.content),
        created_at: new Date().toISOString()
      },
      suggestions: generateMockSuggestions(message.content)
    };
  }
  
  // 本実装時のAPI呼び出し
  const response = await fetch(getApiUrl('/messages'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  // ストリーミングレスポンスの処理
  if (requestBody.settings.stream) {
    return handleStreamingResponse(response);
  }
  
  return response.json();
}

/**
 * ストリーミングレスポンスの処理
 * @param {Response} response - Fetchレスポンス
 * @returns {AsyncGenerator} ストリーミングデータ
 */
async function* handleStreamingResponse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(data);
          yield parsed;
        } catch (e) {
          console.error('Parse error:', e);
        }
      }
    }
  }
}

/**
 * 会話を作成
 * @param {Object} conversation - 会話データ
 * @returns {Promise<Object>} 作成された会話
 */
export async function createConversation(conversation) {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      id: Date.now().toString(),
      title: conversation.title || '新しい会話',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user-1',
      is_pinned: false,
      message_count: 0
    };
  }
  
  const response = await fetch(getApiUrl('/conversations'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(conversation)
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * 会話を削除
 * @param {string} conversationId - 会話ID
 * @returns {Promise<void>}
 */
export async function deleteConversation(conversationId) {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return;
  }
  
  const response = await fetch(getApiUrl(`/conversations/${conversationId}`), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
}

/**
 * 会話をピン留め/解除
 * @param {string} conversationId - 会話ID
 * @param {boolean} isPinned - ピン留め状態
 * @returns {Promise<Object>} 更新された会話
 */
export async function updateConversationPin(conversationId, isPinned) {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { id: conversationId, is_pinned: isPinned };
  }
  
  const response = await fetch(getApiUrl(`/conversations/${conversationId}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify({ is_pinned: isPinned })
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * 認証トークンの取得（本実装時に実装）
 * @returns {string} 認証トークン
 */
function getAuthToken() {
  // 本実装時は実際の認証トークンを返す
  // 例: return localStorage.getItem('authToken');
  return 'mock-auth-token';
}