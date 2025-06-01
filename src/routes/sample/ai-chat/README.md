# AI Chat UI - Smart Chat Interface with Advanced Features

This is a modern, production-ready AI chat interface built with SvelteKit and DaisyUI v5. It features intelligent suggestion prompts, streaming responses, and a sophisticated UX designed for admin dashboards and business applications.

## 📋 Features Overview

### Core Chat Features
- **Real-time streaming responses** with character-by-character display
- **Intelligent suggestion prompts** - AI predicts next user actions with 3 contextual options
- **Multi-conversation management** with search, pin/unpin functionality
- **Export capabilities** - JSON, Markdown, and plain text formats
- **Auto-save** and conversation history
- **File attachment support** with drag & drop
- **Responsive design** with mobile optimization

### Advanced UI/UX Features
- **Smart loading indicators** with typing animations and status messages
- **Context-aware suggestions** based on user input patterns
- **Prompt templates** for common tasks
- **Keyboard shortcuts** (Ctrl/Cmd+Enter for send)
- **Real-time message search**
- **Theme-aware design** using DaisyUI v5

### Developer Features
- **Mock/Production mode toggle** for easy development and deployment
- **Modular API architecture** for easy customization
- **TypeScript support** (can be enabled)
- **Error handling** and retry mechanisms
- **Configurable settings** for all major features

## 🗄️ Database Schema (RDB Design)

The application is designed to work with the following database structure:

### 1. Users Table
```sql
-- ユーザー情報テーブル
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}', -- UIテーマ、言語設定など
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Conversations Table
```sql
-- 会話テーブル
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL DEFAULT '新しい会話',
    is_pinned BOOLEAN DEFAULT FALSE,
    message_count INTEGER DEFAULT 0, -- メッセージ数のキャッシュ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_conversations_user_updated (user_id, updated_at DESC),
    INDEX idx_conversations_user_pinned (user_id, is_pinned, updated_at DESC)
);
```

### 3. Messages Table
```sql
-- メッセージテーブル
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    suggestions JSONB, -- AI提案の選択肢データ
    model VARCHAR(50), -- 使用したAIモデル名
    token_count INTEGER, -- トークン数（課金計算用）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_messages_conversation (conversation_id, created_at),
    INDEX idx_messages_role (conversation_id, role)
);
```

### 4. Message Attachments Table
```sql
-- 添付ファイルテーブル
CREATE TABLE message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL, -- S3などのファイルパス
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_attachments_message (message_id)
);
```

### 5. Prompt Templates Table
```sql
-- プロンプトテンプレートテーブル
CREATE TABLE prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULLの場合はシステム共通
    title VARCHAR(100) NOT NULL,
    prompt TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    usage_count INTEGER DEFAULT 0, -- 使用回数
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_templates_user_category (user_id, category, usage_count DESC)
);
```

## 🔧 Configuration & Setup

### 1. Environment Variables
```bash
# .env.local
VITE_CHAT_API_ENDPOINT=https://api.your-domain.com/v1/chat
VITE_MODE=production  # or 'mock' for development

# Server-side (if using SvelteKit backend)
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

### 2. Mode Configuration

The application supports two modes:

#### Mock Mode (Development)
- Set `config.mode = 'mock'` in `src/routes/sample/ai-chat/config.js`
- Uses simulated API responses
- Shows sample quick action buttons
- Perfect for UI development and testing

#### Production Mode
- Set `config.mode = 'production'`
- Connects to real API endpoints
- Hides development-only features
- Ready for live deployment

### 3. API Integration Points

The following functions in `src/routes/sample/ai-chat/api/chatApi.js` need to be implemented:

```javascript
// 1. Authentication
function getAuthToken() {
  // Return actual JWT token
  return localStorage.getItem('authToken');
}

// 2. Streaming Response Handler
async function* handleStreamingResponse(response) {
  // Implement Server-Sent Events parsing
  // Return chunks of AI response data
}

// 3. Error Handling
// Add proper error boundaries and retry logic
```

## 🎨 UI Customization Guide

### 1. Theme Integration
The UI uses DaisyUI v5 components and follows modern design patterns:

```javascript
// In config.js, customize colors and appearance
ui: {
  primaryColor: 'blue',      // DaisyUI theme colors
  secondaryColor: 'purple',
  accentColor: 'pink'
}
```

### 2. Suggestion Prompt Customization

Edit `src/routes/sample/ai-chat/mockData.js` to customize AI suggestion patterns:

```javascript
// Add new suggestion patterns
export function generateMockSuggestions(userMessage) {
  // Add custom logic for your domain
  if (lowerMessage.includes('your-domain-keyword')) {
    return [
      {
        id: '1',
        text: 'Domain-specific action 1',
        prompt: 'Detailed prompt for this action...'
      }
      // ... more suggestions
    ];
  }
}
```

### 3. Message Formatting

Customize message display in `ChatMessage.svelte`:

```javascript
// Enhanced markdown processing
function formatMessage(content) {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-base-300 px-1 rounded">$1</code>')
    // Add custom formatting rules
}
```

## 🚀 Implementation Tips & Best Practices

### 1. Performance Optimization
- **Lazy Loading**: Messages are loaded on-demand
- **Virtual Scrolling**: Implement for conversations with 1000+ messages
- **Debounced Search**: Search input has built-in debouncing
- **Memoization**: Use Svelte's reactive statements efficiently

### 2. Error Handling Strategy
```javascript
// Implement exponential backoff for API retries
const retryConfig = {
  attempts: 3,
  delay: 1000,
  backoff: 2
};
```

### 3. Security Considerations
- **Input Sanitization**: All user inputs are escaped
- **File Upload Validation**: Size and type restrictions enforced
- **API Rate Limiting**: Implement on server side
- **CSRF Protection**: Use SvelteKit's built-in CSRF protection

### 4. Accessibility Features
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels
- **High Contrast**: Compatible with system preferences
- **Focus Management**: Proper focus handling for modals

## 🔄 Migration from Mock to Production

### Step 1: Update Configuration
```javascript
// config.js
export const config = {
  mode: 'production', // Change from 'mock'
  api: {
    endpoint: process.env.VITE_CHAT_API_ENDPOINT,
    // ... other production settings
  }
};
```

### Step 2: Implement API Functions
Replace mock implementations in `api/chatApi.js` with actual API calls:

```javascript
// Before (Mock)
if (isMockMode()) {
  return mockData;
}

// After (Production)
const response = await fetch(apiEndpoint, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify(payload)
});
```

### Step 3: Database Integration
Implement the database schema and connect to your preferred database:

- **PostgreSQL**: Recommended for production
- **SQLite**: Good for development/small deployments
- **MySQL**: Alternative option

### Step 4: AI Provider Integration
Connect to your AI service provider:

- **OpenAI GPT-4**: Most popular choice
- **Anthropic Claude**: Alternative option
- **Local Models**: For privacy-sensitive applications

## 📚 Technical Implementation Details

### Svelte 5 Runes Usage
This project uses Svelte 5's new runes system:

```javascript
// State management
let messages = $state([]);
let isLoading = $state(false);

// Derived values
const currentMessages = $derived($messages[$currentConversationId] || []);

// Effects
$effect(() => {
  // Auto-scroll when messages update
  scrollToBottom();
});
```

### DaisyUI v5 Integration
Key patterns used throughout the application:

```html
<!-- Input with icon (correct v5 pattern) -->
<label class="input input-bordered flex items-center gap-2">
  <svg>...</svg>
  <input type="text" class="grow" placeholder="Search..." />
</label>

<!-- Avatar with placeholder -->
<div class="avatar avatar-placeholder">
  <div class="w-10 h-10 rounded-full bg-primary text-primary-content">
    <span>AI</span>
  </div>
</div>
```

### State Management Philosophy
- **Single Source of Truth**: All chat state centralized in stores
- **Immutable Updates**: Proper reactive updates using spread operators
- **Error Boundaries**: Comprehensive error handling at component level

## 🎯 Advanced Features Implementation

### 1. Smart Suggestion Algorithm
The suggestion system analyzes user input patterns:

```javascript
// Pattern Recognition
const patterns = {
  analysis: /分析|データ|レポート/,
  stock: /株価|stock|投資/,
  task: /タスク|予定|スケジュール/
};

// Context-Aware Generation
function generateSuggestions(userMessage, conversationHistory) {
  const context = analyzeContext(conversationHistory);
  const intent = detectIntent(userMessage);
  return buildSuggestions(context, intent);
}
```

### 2. Streaming Response Handling
Real-time character streaming with proper error handling:

```javascript
async function* streamResponse(apiResponse) {
  const reader = apiResponse.body.getReader();
  const decoder = new TextDecoder();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      yield processChunk(chunk);
    }
  } finally {
    reader.releaseLock();
  }
}
```

### 3. File Upload Integration
Secure file handling with validation:

```javascript
// File validation
const validateFile = (file) => {
  const maxSize = getConfig('ui.maxFileSize');
  const allowedTypes = getConfig('ui.allowedFileTypes');
  
  if (file.size > maxSize) throw new Error('File too large');
  if (!allowedTypes.includes(file.type)) throw new Error('Invalid file type');
};
```

## 🔗 Integration with Existing Systems

### Authentication Integration
```javascript
// Integrate with your auth system
function getAuthToken() {
  // Option 1: JWT from localStorage
  return localStorage.getItem('jwt_token');
  
  // Option 2: Session-based auth
  return document.cookie.match(/session_id=([^;]+)/)?.[1];
  
  // Option 3: OAuth2 token
  return await refreshAccessToken();
}
```

### Logging and Analytics
```javascript
// Add to chatStore.js
function logChatEvent(event, data) {
  // Option 1: Send to analytics service
  analytics.track(event, data);
  
  // Option 2: Send to logging service
  logger.info(event, data);
  
  // Option 3: Store in database
  await storeChatMetrics(event, data);
}
```

## 🚨 Common Pitfalls & Solutions

### 1. Svelte 5 Reactivity Issues
**Problem**: UI not updating when nested objects change
**Solution**: Always return new object references

```javascript
// ❌ Wrong
messages.update(msgs => {
  msgs[chatId].push(newMessage);
  return msgs;
});

// ✅ Correct
messages.update(msgs => ({
  ...msgs,
  [chatId]: [...msgs[chatId], newMessage]
}));
```

### 2. DaisyUI v5 Migration Issues
**Problem**: Components not styling correctly
**Solution**: Update to v5 class patterns

```html
<!-- ❌ v4 Pattern -->
<div class="input-group">
  <input class="input input-bordered" />
  <button class="btn">Search</button>
</div>

<!-- ✅ v5 Pattern -->
<label class="input input-bordered flex items-center gap-2">
  <input type="text" class="grow" />
  <button class="btn btn-square">🔍</button>
</label>
```

### 3. Memory Leaks in Streaming
**Problem**: Unclosed streams causing memory issues
**Solution**: Proper cleanup in effect destructors

```javascript
$effect(() => {
  const abortController = new AbortController();
  
  streamingFunction(abortController.signal);
  
  return () => {
    abortController.abort();
  };
});
```

## 📈 Performance Monitoring

### Key Metrics to Track
1. **Response Time**: AI response latency
2. **Token Usage**: Cost optimization
3. **Error Rate**: API failure tracking
4. **User Engagement**: Conversation length and frequency

### Implementation
```javascript
// Add to config.js
monitoring: {
  enableMetrics: true,
  metricsEndpoint: '/api/metrics',
  sampleRate: 0.1 // 10% sampling
}
```

This README provides a comprehensive guide for AI-driven development, enabling easy customization, deployment, and integration with existing systems. The modular architecture ensures that the chat interface can be adapted to various use cases while maintaining high performance and user experience standards.