<script lang="ts">
  // ユーザープロファイル
  const userProfile = $state({
    name: '田中太郎',
    email: 'tanaka@example.com',
    role: '管理者',
    avatar: null,
    department: 'マーケティング部',
    phone: '03-1234-5678',
    language: 'ja',
    timezone: 'Asia/Tokyo'
  });

  // アプリケーション設定
  const appSettings = $state({
    theme: 'light',
    sidebarCollapsed: false,
    animationsEnabled: true,
    highContrastMode: false,
    fontScale: 'medium',
    notificationsEnabled: true,
    autoSave: true,
    itemsPerPage: 10
  });

  // 通知設定
  const notificationSettings = $state({
    email: true,
    push: true,
    sms: false,
    emailDigest: 'daily',
    loginAlerts: true,
    systemUpdates: true,
    marketingEmails: false,
    activitySummary: true
  });

  // セキュリティ設定
  const securitySettings = $state({
    twoFactorEnabled: false,
    lastPasswordChange: '2025-03-15',
    sessionTimeout: 30,
    ipRestrictions: false,
    loginHistory: [
      { date: '2025-05-22T08:20:00', ip: '192.168.1.1', device: 'MacBook Pro', location: '東京, 日本' },
      { date: '2025-05-21T14:10:00', ip: '192.168.1.1', device: 'iPhone 16', location: '東京, 日本' },
      { date: '2025-05-20T09:45:00', ip: '192.168.1.1', device: 'MacBook Pro', location: '東京, 日本' }
    ]
  });

  // APIキー
  const apiKeys = $state([
    { name: 'プロダクション', key: 'pk_live_*************', created: '2024-10-15', lastUsed: '2025-05-21' },
    { name: 'テスト環境', key: 'pk_test_*************', created: '2024-10-15', lastUsed: '2025-05-20' }
  ]);

  // 設定タブ
  let activeTab = $state('profile');

  // フォーム送信処理
  function handleSubmit() {
    // 実際のアプリケーションではAPIリクエストなどを行う
    alert('設定が保存されました');
  }

  // 日付フォーマット
  function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold">設定</h1>
  </div>

  <div class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <!-- タブナビゲーション -->
      <div class="tabs tabs-boxed bg-base-200 p-1 mb-6">
        <button 
          class={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`} 
          on:click={() => activeTab = 'profile'}
        >
          プロフィール
        </button>
        <button 
          class={`tab ${activeTab === 'app' ? 'tab-active' : ''}`} 
          on:click={() => activeTab = 'app'}
        >
          アプリケーション
        </button>
        <button 
          class={`tab ${activeTab === 'notifications' ? 'tab-active' : ''}`} 
          on:click={() => activeTab = 'notifications'}
        >
          通知
        </button>
        <button 
          class={`tab ${activeTab === 'security' ? 'tab-active' : ''}`} 
          on:click={() => activeTab = 'security'}
        >
          セキュリティ
        </button>
        <button 
          class={`tab ${activeTab === 'api' ? 'tab-active' : ''}`} 
          on:click={() => activeTab = 'api'}
        >
          API
        </button>
      </div>

      <!-- プロフィール設定 -->
      {#if activeTab === 'profile'}
        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <div class="flex flex-col md:flex-row gap-8">
            <div class="md:w-1/4 flex flex-col items-center">
              <div class="avatar placeholder">
                <div class="bg-neutral-focus text-neutral-content rounded-full w-24">
                  <span class="text-3xl">{userProfile.name.charAt(0)}</span>
                </div>
              </div>
              <button class="btn btn-outline btn-sm mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                画像を変更
              </button>
            </div>
            <div class="md:w-3/4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                  <!-- svelte-ignore a11y_label_has_associated_control -->
                  <label class="label">
                    <span class="label-text">名前</span>
                  </label>
                  <input 
                    type="text" 
                    class="input input-bordered" 
                    bind:value={userProfile.name}
                  />
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">メールアドレス</span>
                  </label>
                  <input 
                    type="email" 
                    class="input input-bordered" 
                    bind:value={userProfile.email}
                  />
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">部署</span>
                  </label>
                  <input 
                    type="text" 
                    class="input input-bordered" 
                    bind:value={userProfile.department}
                  />
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">電話番号</span>
                  </label>
                  <input 
                    type="tel" 
                    class="input input-bordered" 
                    bind:value={userProfile.phone}
                  />
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">言語</span>
                  </label>
                  <select class="select select-bordered" bind:value={userProfile.language}>
                    <option value="ja">日本語</option>
                    <option value="en">English</option>
                    <option value="zh">中文</option>
                    <option value="ko">한국어</option>
                  </select>
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">タイムゾーン</span>
                  </label>
                  <select class="select select-bordered" bind:value={userProfile.timezone}>
                    <option value="Asia/Tokyo">Asia/Tokyo (GMT+9:00)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (GMT-7:00)</option>
                    <option value="Europe/London">Europe/London (GMT+0:00)</option>
                    <option value="Australia/Sydney">Australia/Sydney (GMT+10:00)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-end">
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      {/if}

      <!-- アプリケーション設定 -->
      {#if activeTab === 'app'}
        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <span class="label-text">テーマ</span>
              </label>
              <div class="flex gap-3 mt-2">
                <label class="cursor-pointer flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="theme" 
                    class="radio radio-primary" 
                    checked={appSettings.theme === 'light'} 
                    on:change={() => appSettings.theme = 'light'}
                  />
                  <span>ライト</span>
                </label>
                <label class="cursor-pointer flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="theme" 
                    class="radio radio-primary" 
                    checked={appSettings.theme === 'dark'} 
                    on:change={() => appSettings.theme = 'dark'}
                  />
                  <span>ダーク</span>
                </label>
                <label class="cursor-pointer flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="theme" 
                    class="radio radio-primary" 
                    checked={appSettings.theme === 'system'} 
                    on:change={() => appSettings.theme = 'system'}
                  />
                  <span>システム設定に合わせる</span>
                </label>
              </div>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <span class="label-text">フォントサイズ</span>
              </label>
              <div class="flex gap-3 mt-2">
                <label class="cursor-pointer flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="fontScale" 
                    class="radio radio-primary" 
                    checked={appSettings.fontScale === 'small'} 
                    on:change={() => appSettings.fontScale = 'small'}
                  />
                  <span>小</span>
                </label>
                <label class="cursor-pointer flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="fontScale" 
                    class="radio radio-primary" 
                    checked={appSettings.fontScale === 'medium'} 
                    on:change={() => appSettings.fontScale = 'medium'}
                  />
                  <span>中</span>
                </label>
                <label class="cursor-pointer flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="fontScale" 
                    class="radio radio-primary" 
                    checked={appSettings.fontScale === 'large'} 
                    on:change={() => appSettings.fontScale = 'large'}
                  />
                  <span>大</span>
                </label>
              </div>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input 
                  type="checkbox" 
                  class="toggle toggle-primary" 
                  bind:checked={appSettings.sidebarCollapsed}
                />
                <span class="label-text">サイドバーを折りたたむ</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input 
                  type="checkbox" 
                  class="toggle toggle-primary" 
                  bind:checked={appSettings.animationsEnabled}
                />
                <span class="label-text">アニメーションを有効にする</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input 
                  type="checkbox" 
                  class="toggle toggle-primary" 
                  bind:checked={appSettings.highContrastMode}
                />
                <span class="label-text">ハイコントラストモード</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input 
                  type="checkbox" 
                  class="toggle toggle-primary" 
                  bind:checked={appSettings.autoSave}
                />
                <span class="label-text">自動保存</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">1ページあたりの表示件数</span>
              </label>
              <select class="select select-bordered" bind:value={appSettings.itemsPerPage}>
                <option value={5}>5件</option>
                <option value={10}>10件</option>
                <option value={25}>25件</option>
                <option value={50}>50件</option>
                <option value={100}>100件</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end">
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      {/if}

      <!-- 通知設定 -->
      {#if activeTab === 'notifications'}
        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <h3 class="text-lg font-medium mb-4">通知方法</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input 
                  type="checkbox" 
                  class="toggle toggle-primary" 
                  bind:checked={notificationSettings.email}
                />
                <span class="label-text">メール通知</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input 
                  type="checkbox" 
                  class="toggle toggle-primary" 
                  bind:checked={notificationSettings.push}
                />
                <span class="label-text">プッシュ通知</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input 
                  type="checkbox" 
                  class="toggle toggle-primary" 
                  bind:checked={notificationSettings.sms}
                />
                <span class="label-text">SMS通知</span>
              </label>
            </div>
          </div>

          <div class="divider"></div>

          <h3 class="text-lg font-medium mb-4">通知設定</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input 
                  type="checkbox" 
                  class="toggle toggle-primary" 
                  bind:checked={notificationSettings.loginAlerts}
                />
                <span class="label-text">ログインアラート</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input 
                  type="checkbox" 
                  class="toggle toggle-primary" 
                  bind:checked={notificationSettings.systemUpdates}
                />
                <span class="label-text">システムアップデート</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input 
                  type="checkbox" 
                  class="toggle toggle-primary" 
                  bind:checked={notificationSettings.marketingEmails}
                />
                <span class="label-text">マーケティングメール</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input 
                  type="checkbox" 
                  class="toggle toggle-primary" 
                  bind:checked={notificationSettings.activitySummary}
                />
                <span class="label-text">アクティビティサマリー</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">メールダイジェスト</span>
              </label>
              <select class="select select-bordered" bind:value={notificationSettings.emailDigest}>
                <option value="never">送信しない</option>
                <option value="daily">毎日</option>
                <option value="weekly">毎週</option>
                <option value="monthly">毎月</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end">
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      {/if}

      <!-- セキュリティ設定 -->
      {#if activeTab === 'security'}
        <div class="space-y-8">
          <div>
            <h3 class="text-lg font-medium mb-4">アカウントセキュリティ</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-control">
                <label class="label cursor-pointer justify-start gap-3">
                  <input 
                    type="checkbox" 
                    class="toggle toggle-primary" 
                    bind:checked={securitySettings.twoFactorEnabled}
                  />
                  <span class="label-text">二要素認証</span>
                </label>
                <p class="text-sm text-base-content/60 mt-1 ml-11">
                  アカウントにログインする際に追加の確認が必要になります
                </p>
              </div>

              <div class="form-control">
                <label class="label cursor-pointer justify-start gap-3">
                  <input 
                    type="checkbox" 
                    class="toggle toggle-primary" 
                    bind:checked={securitySettings.ipRestrictions}
                  />
                  <span class="label-text">IPアドレス制限</span>
                </label>
                <p class="text-sm text-base-content/60 mt-1 ml-11">
                  特定のIPアドレスからのみログインを許可します
                </p>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">セッションタイムアウト（分）</span>
                </label>
                <select class="select select-bordered" bind:value={securitySettings.sessionTimeout}>
                  <option value={15}>15分</option>
                  <option value={30}>30分</option>
                  <option value={60}>1時間</option>
                  <option value={120}>2時間</option>
                  <option value={240}>4時間</option>
                </select>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">最終パスワード変更日</span>
                </label>
                <div class="input input-bordered flex items-center">
                  <span>{formatDate(securitySettings.lastPasswordChange).split(' ')[0]}</span>
                </div>
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button class="btn btn-outline">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                パスワード変更
              </button>
              <button class="btn btn-outline btn-error">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                すべてのセッションからログアウト
              </button>
            </div>
          </div>

          <div class="divider"></div>

          <div>
            <h3 class="text-lg font-medium mb-4">ログイン履歴</h3>
            <div class="overflow-x-auto">
              <table class="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>日時</th>
                    <th>IPアドレス</th>
                    <th>デバイス</th>
                    <th>場所</th>
                  </tr>
                </thead>
                <tbody>
                  {#each securitySettings.loginHistory as login}
                    <tr>
                      <td>{formatDate(login.date)}</td>
                      <td>{login.ip}</td>
                      <td>{login.device}</td>
                      <td>{login.location}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
            <div class="flex justify-end mt-4">
              <button class="btn btn-ghost btn-sm">
                すべての履歴を表示
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      {/if}

      <!-- API設定 -->
      {#if activeTab === 'api'}
        <div class="space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">APIキー</h3>
            <button class="btn btn-primary btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              新規APIキー
            </button>
          </div>
          
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead>
                <tr>
                  <th>名前</th>
                  <th>キー</th>
                  <th>作成日</th>
                  <th>最終使用日</th>
                  <th class="w-20">操作</th>
                </tr>
              </thead>
              <tbody>
                {#each apiKeys as key}
                  <tr>
                    <td>{key.name}</td>
                    <td>
                      <div class="flex items-center gap-2">
                        <span class="font-mono">{key.key}</span>
                        <button class="btn btn-ghost btn-xs" aria-label="コピー">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td>{key.created}</td>
                    <td>{key.lastUsed}</td>
                    <td>
                      <button class="btn btn-ghost btn-xs text-error" aria-label="削除">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <div class="divider"></div>

          <div>
            <h3 class="text-lg font-medium mb-4">APIドキュメント</h3>
            <p class="mb-4">APIの使用方法については、以下のドキュメントを参照してください。</p>
            <div class="flex flex-col sm:flex-row gap-3">
              <a href="#" class="btn btn-outline">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                APIドキュメント
              </a>
              <a href="#" class="btn btn-outline">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                コードサンプル
              </a>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
