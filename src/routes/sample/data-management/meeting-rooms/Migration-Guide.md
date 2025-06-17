# モックから本番への移行ガイド

## 概要

このガイドは、会議室予約システムをモックモードから本番環境へ移行する際の詳細な手順を説明します。
段階的な移行アプローチにより、リスクを最小限に抑えながら本番環境を構築できます。

## 移行前チェックリスト

### 必要な環境
- [ ] PostgreSQL 14以上のデータベース
- [ ] Node.js 18以上のアプリケーションサーバー
- [ ] Redis（キャッシュ用、オプション）
- [ ] 認証プロバイダー（Auth0、AWS Cognito等）
- [ ] メール送信サービス（SendGrid、AWS SES等）

### 必要なアカウント/API
- [ ] メール送信API
- [ ] Slack Webhook URL（オプション）
- [ ] Google Calendar API（オプション）
- [ ] ファイルストレージ（画像アップロード用）

## Phase 1: データベース構築

### 1.1 データベース作成

```bash
# PostgreSQLにログイン
psql -U postgres

# データベース作成
CREATE DATABASE meeting_room_system
  WITH ENCODING = 'UTF8'
  LC_COLLATE = 'ja_JP.UTF-8'
  LC_CTYPE = 'ja_JP.UTF-8'
  TEMPLATE = template0;

# ユーザー作成
CREATE USER meeting_room_app WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE meeting_room_system TO meeting_room_app;
```

### 1.2 スキーマ適用

```bash
# スキーマファイルを適用
psql -U meeting_room_app -d meeting_room_system -f database-schema.sql

# 拡張機能の確認
psql -U meeting_room_app -d meeting_room_system -c "SELECT * FROM pg_extension;"
```

### 1.3 初期データ投入

```sql
-- 本番用の初期データ
-- buildings
INSERT INTO buildings (name, code, address, floors) VALUES
  ('本社ビル', 'HQ', '東京都渋谷区...', 10),
  ('第2ビル', 'B2', '東京都渋谷区...', 5);

-- equipment（実際の設備に合わせて調整）
INSERT INTO equipment (name, type, description) VALUES
  ('プロジェクター（EPSON）', 'projector', '4K対応、HDMI/USB-C'),
  ('電子ホワイトボード', 'whiteboard', 'Microsoft Surface Hub'),
  -- ...

-- rooms（実際の会議室情報）
-- CSVインポートを推奨
```

### 1.4 モックデータの移行（開発環境のみ）

```typescript
// scripts/migrate-mock-data.ts
import { mockBookings, mockRooms, mockUsers } from '../api/mockData';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrateMockData() {
  // ユーザーデータの移行
  for (const user of mockUsers) {
    await pool.query(
      `INSERT INTO users (id, employee_id, name, email, department, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [user.id, user.employeeId, user.name, user.email, user.department, user.role]
    );
  }
  
  // 会議室データの移行
  // ...
}
```

## Phase 2: 認証システムの実装

### 2.1 認証プロバイダーの設定（Auth0の例）

```typescript
// lib/auth/auth0Config.ts
export const auth0Config = {
  domain: process.env.VITE_AUTH0_DOMAIN,
  clientId: process.env.VITE_AUTH0_CLIENT_ID,
  redirectUri: `${window.location.origin}/callback`,
  audience: process.env.VITE_AUTH0_AUDIENCE,
  scope: 'openid profile email'
};
```

### 2.2 認証ストアの実装

```typescript
// stores/authStore.ts
import { writable, derived } from 'svelte/store';
import { createAuth0Client } from '@auth0/auth0-spa-js';

export const auth0Client = writable(null);
export const isAuthenticated = writable(false);
export const user = writable(null);

export async function initializeAuth() {
  const client = await createAuth0Client(auth0Config);
  auth0Client.set(client);
  
  // 既存のセッションをチェック
  const authenticated = await client.isAuthenticated();
  isAuthenticated.set(authenticated);
  
  if (authenticated) {
    const userProfile = await client.getUser();
    user.set(userProfile);
    
    // DBのユーザー情報と同期
    await syncUserWithDatabase(userProfile);
  }
}

export async function login() {
  const client = get(auth0Client);
  await client.loginWithRedirect();
}

export async function logout() {
  const client = get(auth0Client);
  await client.logout({ returnTo: window.location.origin });
}
```

### 2.3 APIトークンの管理

```typescript
// api/authInterceptor.ts
export async function getAuthToken(): Promise<string | null> {
  const client = get(auth0Client);
  if (!client) return null;
  
  try {
    const token = await client.getTokenSilently();
    return token;
  } catch (error) {
    if (error.error === 'login_required') {
      await login();
    }
    return null;
  }
}

// HTTPクライアントへの統合
export class AuthenticatedHttpClient extends HttpClient {
  async request(url: string, options: RequestInit = {}) {
    const token = await getAuthToken();
    
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    
    return super.request(url, options);
  }
}
```

## Phase 3: 本番APIサービスの実装

### 3.1 環境変数の設定

```bash
# .env.production
VITE_API_BASE_URL=https://api.meeting-room.example.com
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_MOCK_MODE=false
```

### 3.2 本番用APIクライアント

```typescript
// api/productionApiClient.ts
import { AuthenticatedHttpClient } from './authInterceptor';
import type { IMeetingRoomApiService } from './apiService.interface';

export class ProductionMeetingRoomApiClient implements IMeetingRoomApiService {
  private http: AuthenticatedHttpClient;
  
  constructor() {
    this.http = new AuthenticatedHttpClient(CONFIG.api.baseUrl);
  }
  
  async getBookings(params?: BookingQueryParams): Promise<Booking[]> {
    const response = await this.http.get('/bookings', { params });
    
    if (!response.ok) {
      throw new ApiError(response.status, response.statusText);
    }
    
    const data = await response.json();
    return data.map(this.transformBookingFromApi);
  }
  
  async createBooking(dto: CreateBookingDto): Promise<Booking> {
    const response = await this.http.post('/bookings', {
      body: JSON.stringify(this.transformBookingToApi(dto)),
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.message, error.details);
    }
    
    const data = await response.json();
    return this.transformBookingFromApi(data);
  }
  
  // データ変換メソッド
  private transformBookingFromApi(apiData: any): Booking {
    return {
      id: apiData.id,
      bookingNumber: apiData.booking_number,
      userId: apiData.user_id,
      userName: apiData.user?.name || '',
      userEmail: apiData.user?.email || '',
      userDepartment: apiData.user?.department || '',
      roomId: apiData.room_id,
      roomName: apiData.room?.name || '',
      roomCode: apiData.room?.code || '',
      startTime: apiData.start_time,
      endTime: apiData.end_time,
      type: apiData.type,
      status: apiData.status,
      title: apiData.title,
      description: apiData.description,
      attendeeCount: apiData.attendee_count,
      createdAt: apiData.created_at,
      updatedAt: apiData.updated_at
    };
  }
  
  private transformBookingToApi(booking: CreateBookingDto): any {
    return {
      user_id: booking.userId,
      room_id: booking.roomId,
      start_time: booking.startTime,
      end_time: booking.endTime,
      type: booking.type,
      title: booking.title,
      description: booking.description,
      attendee_count: booking.attendeeCount,
      required_equipment: booking.requiredEquipment,
      catering_required: booking.cateringRequired,
      catering_details: booking.cateringDetails,
      reminder_settings: booking.reminderSettings
    };
  }
}
```

### 3.3 エラーハンドリングの強化

```typescript
// api/errors.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any,
    public field?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
  
  get isNetworkError() {
    return this.status === 0;
  }
  
  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }
  
  get isValidationError() {
    return this.status === 400 || this.status === 422;
  }
  
  get isServerError() {
    return this.status >= 500;
  }
}

// グローバルエラーハンドラー
export function handleApiError(error: ApiError) {
  if (error.isNetworkError) {
    showError('ネットワークエラーが発生しました。接続を確認してください。');
  } else if (error.isAuthError) {
    showError('認証エラーです。再度ログインしてください。');
    // 自動的にログイン画面へリダイレクト
    goto('/login');
  } else if (error.isValidationError) {
    // フィールドごとのエラーを表示
    if (error.details?.errors) {
      Object.entries(error.details.errors).forEach(([field, messages]) => {
        showFieldError(field, messages[0]);
      });
    } else {
      showError(error.message);
    }
  } else if (error.isServerError) {
    showError('サーバーエラーが発生しました。しばらく経ってから再度お試しください。');
  } else {
    showError(error.message || 'エラーが発生しました');
  }
}
```

## Phase 4: リアルタイム機能の実装

### 4.1 WebSocket接続

```typescript
// api/websocket.ts
export class MeetingRoomWebSocket {
  private ws: WebSocket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  constructor(private url: string) {
    this.connect();
  }
  
  private async connect() {
    const token = await getAuthToken();
    this.ws = new WebSocket(`${this.url}?token=${token}`);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.subscribe();
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
    
    this.ws.onclose = () => {
      this.handleDisconnect();
    };
  }
  
  private subscribe() {
    // 関心のあるイベントを購読
    this.send({
      type: 'subscribe',
      channels: ['bookings', 'rooms']
    });
  }
  
  private handleMessage(data: any) {
    switch (data.type) {
      case 'booking.created':
        bookings.update(list => [...list, data.payload]);
        break;
        
      case 'booking.updated':
        bookings.update(list =>
          list.map(b => b.id === data.payload.id ? data.payload : b)
        );
        break;
        
      case 'booking.deleted':
        bookings.update(list =>
          list.filter(b => b.id !== data.payload.id)
        );
        break;
        
      case 'room.status_changed':
        rooms.update(list =>
          list.map(r => r.id === data.payload.id 
            ? { ...r, isActive: data.payload.isActive } 
            : r
          )
        );
        break;
    }
  }
  
  private handleDisconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      setTimeout(() => {
        console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
        this.connect();
      }, delay);
    }
  }
}
```

### 4.2 Server-Sent Events（代替案）

```typescript
// api/sse.ts
export class MeetingRoomSSE {
  private eventSource: EventSource;
  
  async connect() {
    const token = await getAuthToken();
    this.eventSource = new EventSource(
      `${CONFIG.api.baseUrl}/events?token=${token}`
    );
    
    this.eventSource.addEventListener('booking', (event) => {
      const data = JSON.parse(event.data);
      handleBookingEvent(data);
    });
    
    this.eventSource.addEventListener('room', (event) => {
      const data = JSON.parse(event.data);
      handleRoomEvent(data);
    });
    
    this.eventSource.onerror = () => {
      console.error('SSE connection error');
      // 自動的に再接続を試みる
    };
  }
  
  disconnect() {
    this.eventSource?.close();
  }
}
```

## Phase 5: パフォーマンス最適化

### 5.1 キャッシング戦略

```typescript
// api/cacheManager.ts
export class CacheManager {
  private cache = new Map<string, { data: any; expires: number }>();
  private storage = window.localStorage;
  
  set(key: string, data: any, ttl: number = 300000) { // 5分
    const expires = Date.now() + ttl;
    
    // メモリキャッシュ
    this.cache.set(key, { data, expires });
    
    // 永続化（大きなデータは除く）
    if (JSON.stringify(data).length < 100000) {
      this.storage.setItem(`cache_${key}`, JSON.stringify({ data, expires }));
    }
  }
  
  get(key: string): any | null {
    // メモリキャッシュを確認
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    
    // ローカルストレージを確認
    const stored = this.storage.getItem(`cache_${key}`);
    if (stored) {
      const { data, expires } = JSON.parse(stored);
      if (expires > Date.now()) {
        // メモリキャッシュに復元
        this.cache.set(key, { data, expires });
        return data;
      }
    }
    
    return null;
  }
  
  invalidate(pattern?: string) {
    if (pattern) {
      // パターンに一致するキーを削除
      const regex = new RegExp(pattern);
      Array.from(this.cache.keys())
        .filter(key => regex.test(key))
        .forEach(key => {
          this.cache.delete(key);
          this.storage.removeItem(`cache_${key}`);
        });
    } else {
      // 全てクリア
      this.cache.clear();
      Object.keys(this.storage)
        .filter(key => key.startsWith('cache_'))
        .forEach(key => this.storage.removeItem(key));
    }
  }
}

// キャッシュ付きAPIクライアント
export class CachedApiClient extends ProductionMeetingRoomApiClient {
  private cache = new CacheManager();
  
  async getBookings(params?: BookingQueryParams): Promise<Booking[]> {
    const cacheKey = `bookings_${JSON.stringify(params || {})}`;
    
    // キャッシュを確認
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;
    
    // APIから取得
    const data = await super.getBookings(params);
    
    // キャッシュに保存
    this.cache.set(cacheKey, data, 60000); // 1分
    
    return data;
  }
  
  async createBooking(dto: CreateBookingDto): Promise<Booking> {
    const result = await super.createBooking(dto);
    
    // 関連するキャッシュを無効化
    this.cache.invalidate('bookings_.*');
    this.cache.invalidate(`room_availability_${dto.roomId}_.*`);
    
    return result;
  }
}
```

### 5.2 楽観的更新

```typescript
// stores/optimisticBookingStore.ts
export async function createBookingOptimistic(data: CreateBookingDto) {
  // 仮のIDを生成
  const tempId = `temp_${Date.now()}`;
  const optimisticBooking: Booking = {
    id: tempId,
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // 即座にUIを更新
  bookings.update(list => [...list, optimisticBooking]);
  
  try {
    // APIコール
    const realBooking = await apiService.createBooking(data);
    
    // 仮のデータを実際のデータで置き換え
    bookings.update(list =>
      list.map(b => b.id === tempId ? realBooking : b)
    );
    
    return realBooking;
  } catch (error) {
    // エラー時は仮のデータを削除
    bookings.update(list =>
      list.filter(b => b.id !== tempId)
    );
    
    throw error;
  }
}
```

## Phase 6: 本番環境へのデプロイ

### 6.1 環境別設定

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [sveltekit()],
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.API_URL': JSON.stringify(env.VITE_API_BASE_URL)
    },
    build: {
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['svelte', '@sveltejs/kit'],
            'auth': ['@auth0/auth0-spa-js'],
            'charts': ['chart.js'],
          }
        }
      }
    }
  };
});
```

### 6.2 ヘルスチェック実装

```typescript
// routes/api/health/+server.ts
export async function GET() {
  const checks = {
    database: false,
    cache: false,
    auth: false
  };
  
  try {
    // データベース接続確認
    await db.query('SELECT 1');
    checks.database = true;
  } catch (error) {
    console.error('Database check failed:', error);
  }
  
  try {
    // キャッシュ接続確認
    await redis.ping();
    checks.cache = true;
  } catch (error) {
    console.error('Cache check failed:', error);
  }
  
  try {
    // 認証サービス確認
    await fetch(`https://${AUTH0_DOMAIN}/.well-known/openid-configuration`);
    checks.auth = true;
  } catch (error) {
    console.error('Auth check failed:', error);
  }
  
  const isHealthy = Object.values(checks).every(v => v);
  
  return new Response(JSON.stringify({
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  }), {
    status: isHealthy ? 200 : 503,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

## 移行後のチェックリスト

### 機能テスト
- [ ] ユーザー認証・認可
- [ ] 予約の作成・更新・削除
- [ ] リアルタイム更新
- [ ] 通知機能（メール、Slack）
- [ ] 統計・レポート機能

### パフォーマンステスト
- [ ] ページロード時間 < 3秒
- [ ] API応答時間 < 500ms
- [ ] 同時接続ユーザー数のテスト
- [ ] データベースクエリの最適化

### セキュリティチェック
- [ ] SQL インジェクション対策
- [ ] XSS 対策
- [ ] CSRF 対策
- [ ] 適切な認証・認可
- [ ] HTTPSの強制

### 監視設定
- [ ] エラーログ収集
- [ ] パフォーマンスメトリクス
- [ ] アラート設定
- [ ] バックアップ設定

## トラブルシューティング

### よくある問題と解決策

1. **CORS エラー**
   ```typescript
   // サーバー側で適切なCORSヘッダーを設定
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   }));
   ```

2. **認証トークンの期限切れ**
   ```typescript
   // 自動更新の実装
   setInterval(async () => {
     try {
       await auth0Client.getTokenSilently();
     } catch (error) {
       if (error.error === 'login_required') {
         await login();
       }
     }
   }, 300000); // 5分ごと
   ```

3. **WebSocket接続の安定性**
   ```typescript
   // 接続監視とフォールバック
   if (!supportsWebSocket()) {
     // SSEにフォールバック
     useServerSentEvents();
   }
   ```

このガイドに従って段階的に移行を進めることで、安全に本番環境を構築できます。