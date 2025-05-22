<script lang="ts">
  import StatCard from '$lib/components/StatCard.svelte';
  
  // ダッシュボードのデータ
  const stats = $state([
    { title: 'ユーザー数', value: '1,234', change: '+12%', iconType: 'users', trend: 'up' },
    { title: '売上', value: '¥2.4M', change: '+8.2%', iconType: 'chart-line', trend: 'up' },
    { title: '注文数', value: '854', change: '+4.3%', iconType: 'shopping-cart', trend: 'up' },
    { title: '直帰率', value: '42%', change: '-2.1%', iconType: 'arrow-turn-down', trend: 'down' }
  ]);

  const recentActivities = $state([
    { user: '田中太郎', action: 'ログイン', time: '5分前', status: 'success' },
    { user: '佐藤花子', action: '新規注文 #1234', time: '15分前', status: 'success' },
    { user: '鈴木一郎', action: '支払い完了', time: '30分前', status: 'success' },
    { user: '高橋次郎', action: '商品返品', time: '1時間前', status: 'warning' },
    { user: '伊藤三郎', action: 'アカウント作成', time: '2時間前', status: 'success' }
  ]);

  // 月間データ（チャート用）
  const monthlyData = $state({
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: [
      { name: '売上', data: [4500, 5200, 4800, 5800, 6000, 6500] },
      { name: 'コスト', data: [2800, 3100, 2950, 3200, 3500, 3800] }
    ]
  });

  // 円グラフデータ
  const pieData = $state([
    { name: '新規顧客', value: 35, color: 'primary' },
    { name: 'リピーター', value: 45, color: 'secondary' },
    { name: '一見客', value: 20, color: 'accent' }
  ]);
</script>

<div class="space-y-6">
  <!-- 統計カード -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {#each stats as stat}
      <StatCard 
        title={stat.title} 
        value={stat.value} 
        change={stat.change} 
        trend={stat.trend} 
        iconType={stat.iconType} 
      />
    {/each}
  </div>

  <!-- チャートとアクティビティ -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- 折れ線グラフ -->
    <div class="card bg-base-100 border border-base-200/40 lg:col-span-2 overflow-hidden">
      <div class="card-body p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-base font-medium">月間売上推移</h2>
            <p class="text-base-content/60 text-sm mt-1">直近の売上とコストの比較</p>
          </div>
          <div class="flex gap-3 items-center">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-primary"></span>
              <span class="text-sm">売上</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-secondary"></span>
              <span class="text-sm">コスト</span>
            </div>
            <div class="dropdown dropdown-end">
              <div role="button" class="btn btn-ghost btn-xs" aria-label="グラフ期間を選択">
                期間
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div class="data-visualization h-72 w-full relative mt-4">
          <!-- 売上推移グラフ -->
          <div class="w-full h-full">
            <svg viewBox="0 0 600 200" class="w-full h-full" preserveAspectRatio="none">
              <!-- 背景グラデーション -->
              <defs>
                <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.2" />
                  <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.01" />
                </linearGradient>
                <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="var(--secondary)" stop-opacity="0.15" />
                  <stop offset="100%" stop-color="var(--secondary)" stop-opacity="0.01" />
                </linearGradient>
              </defs>
              
              <!-- グリッド線 -->
              <line x1="0" y1="0" x2="600" y2="0" stroke="var(--base-300)" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="4" />
              <line x1="0" y1="50" x2="600" y2="50" stroke="var(--base-300)" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="4" />
              <line x1="0" y1="100" x2="600" y2="100" stroke="var(--base-300)" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="4" />
              <line x1="0" y1="150" x2="600" y2="150" stroke="var(--base-300)" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="4" />
              <line x1="0" y1="200" x2="600" y2="200" stroke="var(--base-300)" stroke-width="1" stroke-opacity="0.5" />
              
              <!-- 売上データ曲線と塗りつぶし -->
              <path 
                d="M0,120 L100,100 L200,110 L300,80 L400,70 L500,50 L600,50 L600,200 L0,200 Z" 
                fill="url(#primaryGradient)" 
              />
              <path 
                d="M0,120 L100,100 L200,110 L300,80 L400,70 L500,50" 
                fill="none" 
                stroke="var(--primary)" 
                stroke-width="3" 
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              
              <!-- コストデータ曲線と塗りつぶし -->
              <path 
                d="M0,160 L100,150 L200,155 L300,140 L400,130 L500,120 L600,120 L600,200 L0,200 Z" 
                fill="url(#secondaryGradient)" 
              />
              <path 
                d="M0,160 L100,150 L200,155 L300,140 L400,130 L500,120" 
                fill="none" 
                stroke="var(--secondary)" 
                stroke-width="3" 
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              
              <!-- データポイント -->
              <circle cx="0" cy="120" r="5" fill="var(--base-100)" stroke="var(--primary)" stroke-width="2" />
              <circle cx="100" cy="100" r="5" fill="var(--base-100)" stroke="var(--primary)" stroke-width="2" />
              <circle cx="200" cy="110" r="5" fill="var(--base-100)" stroke="var(--primary)" stroke-width="2" />
              <circle cx="300" cy="80" r="5" fill="var(--base-100)" stroke="var(--primary)" stroke-width="2" />
              <circle cx="400" cy="70" r="5" fill="var(--base-100)" stroke="var(--primary)" stroke-width="2" />
              <circle cx="500" cy="50" r="5" fill="var(--base-100)" stroke="var(--primary)" stroke-width="2" />
              <!-- データポイント (売上) -->
              {#each monthlyData.datasets[0].data as value, i}
                <circle 
                  cx={i * 100} 
                  cy={200 - (value / 7000 * 200)} 
                  r="4" 
                  fill="var(--primary)" 
                />
              {/each}
              
              <!-- データポイント (コスト) -->
              {#each monthlyData.datasets[1].data as value, i}
                <circle 
                  cx={i * 100} 
                  cy={200 - (value / 7000 * 200)} 
                  r="4" 
                  fill="var(--secondary)" 
                />
              {/each}
            </svg>
          </div>
          
          <!-- X軸ラベル -->
          <div class="flex justify-between mt-2">
            {#each monthlyData.labels as label}
              <div class="text-sm text-base-content/70">{label}</div>
            {/each}
          </div>
        </div>
        <div class="flex justify-center gap-6 mt-4">
          {#each monthlyData.datasets as dataset}
            <div class="flex items-center gap-2">
              <div class={`w-3 h-3 rounded-full ${dataset.name === '売上' ? 'bg-primary' : 'bg-secondary'}`}></div>
              <span class="text-sm">{dataset.name}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- 活動履歴 -->
    <div class="dashboard-card">
      <div class="card-body p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-base font-medium">最近のアクティビティ</h2>
            <p class="text-base-content/60 text-sm mt-1">ユーザーのアクティビティ</p>
          </div>
          <button class="btn btn-ghost btn-sm btn-circle" aria-label="メニューを開く">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </button>
        </div>
        <div class="space-y-5">
          {#each recentActivities as activity}
            <div class="flex items-center gap-4 border-b border-base-200/50 pb-4 last:border-0 last:pb-0 hover:bg-base-200/20 p-2 rounded-lg transition-colors">
              <div class="avatar avatar-placeholder">
                <div class="bg-primary/10 text-primary rounded-xl w-12 h-12 grid place-items-center shadow-sm border border-primary/5">
                  <span class="text-lg font-medium">{activity.user.charAt(0)}</span>
                </div>
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <p class="font-semibold">{activity.user}</p>
                  <span class="text-xs bg-base-200/70 px-2 py-1 rounded-full text-base-content/70">{activity.time}</span>
                </div>
                <p class="text-sm mt-1 text-base-content/80">{activity.action}</p>
              </div>
              <div class="badge {activity.status === 'success' ? 'badge-success bg-success/10 text-success border-success/20' : 'badge-warning bg-warning/10 text-warning border-warning/20'} border px-3 py-3">{activity.status}</div>
            </div>
          {/each}
        </div>
        <div class="card-actions justify-center mt-6">
          <button class="btn btn-outline btn-sm rounded-full px-6 gap-2 hover:bg-primary/10 transition-colors">
            すべての活動を表示
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 下部コンテンツ -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <!-- 顧客分布 -->
    <div class="dashboard-card">
      <div class="card-body p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-base font-medium">顧客分布</h2>
            <p class="text-base-content/60 text-sm mt-1">顧客セグメント分析</p>
          </div>
          <div class="dropdown dropdown-end">
            <div role="button" class="btn btn-ghost btn-sm btn-circle" aria-label="メニューを開く">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-6">
          <!-- 円グラフ -->
          <div class="data-visualization flex justify-center items-center">
            <svg viewBox="0 0 100 100" class="w-48 h-48">
              <!-- グラデーション定義 -->
              <defs>
                <linearGradient id="primaryFill" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="var(--primary)" />
                  <stop offset="100%" stop-color="var(--primary-focus)" />
                </linearGradient>
                <linearGradient id="secondaryFill" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="var(--secondary)" />
                  <stop offset="100%" stop-color="var(--secondary-focus)" />
                </linearGradient>
                <linearGradient id="accentFill" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="var(--accent)" />
                  <stop offset="100%" stop-color="var(--accent-focus)" />
                </linearGradient>
                <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.2" />
                </filter>
              </defs>
              
              <!-- 円グラフのセグメント -->
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#primaryFill)" stroke-width="15" stroke-dasharray="{pieData[0].value * 2.51} 251" stroke-dashoffset="0" transform="rotate(-90 50 50)" filter="url(#dropShadow)" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#secondaryFill)" stroke-width="15" stroke-dasharray="{pieData[1].value * 2.51} 251" stroke-dashoffset="{-pieData[0].value * 2.51}" transform="rotate(-90 50 50)" filter="url(#dropShadow)" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#accentFill)" stroke-width="15" stroke-dasharray="{pieData[2].value * 2.51} 251" stroke-dashoffset="{-(pieData[0].value + pieData[1].value) * 2.51}" transform="rotate(-90 50 50)" filter="url(#dropShadow)" />
              
              <!-- 中央の円 -->
              <circle cx="50" cy="50" r="30" fill="var(--base-100)" filter="url(#dropShadow)" />
              <text x="50" y="45" text-anchor="middle" dominant-baseline="middle" class="text-sm font-medium" fill="var(--base-content-60)">合計</text>
              <text x="50" y="62" text-anchor="middle" dominant-baseline="middle" class="text-2xl font-bold" fill="var(--base-content)">100%</text>
            </svg>
          </div>
          <!-- 凡例 -->
          <div class="flex flex-col justify-center space-y-4">
            {#each pieData as segment}
              <div class="flex items-center gap-3">
                <div class="w-5 h-5 rounded-md shadow-sm" style="background: var(--{segment.color});"></div>
                <div class="flex-1">
                  <div class="flex justify-between items-center">
                    <span class="font-medium">{segment.name}</span>
                    <span class="text-sm font-bold bg-base-200/70 px-2 py-0.5 rounded-full">{segment.value}%</span>
                  </div>
                  <div class="w-full bg-base-200/50 h-2 rounded-full mt-2 overflow-hidden">
                    <div class="h-full rounded-full" style="width: {segment.value}%; background: var(--{segment.color});"></div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- タスク -->
    <div class="dashboard-card">
      <div class="card-body p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-xl font-bold tracking-tight">今後のタスク</h2>
            <p class="text-base-content/60 text-sm mt-1">作業予定と優先度</p>
          </div>
          <div class="badge badge-primary badge-lg badge-outline px-3 py-3">進行中: 3/5</div>
        </div>
        <div class="space-y-3">
          <div class="flex items-center p-3 rounded-xl hover:bg-base-200/50 transition-colors border border-base-200/50 shadow-sm">
            <input type="checkbox" class="checkbox checkbox-primary mr-4" />
            <div class="flex-1">
              <span class="font-medium">レポート作成</span>
              <div class="flex items-center gap-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-xs text-base-content/60">期限: 15:00</span>
              </div>
            </div>
            <div class="badge badge-error badge-sm px-3 py-3">高</div>
          </div>
          <div class="flex items-center p-3 rounded-xl hover:bg-base-200/50 transition-colors border border-base-200/50 shadow-sm">
            <input type="checkbox" class="checkbox checkbox-primary mr-4" />
            <div class="flex-1">
              <span class="font-medium">ミーティング準備</span>
              <div class="flex items-center gap-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-xs text-base-content/60">期限: 16:30</span>
              </div>
            </div>
            <div class="badge badge-warning badge-sm px-3 py-3">中</div>
          </div>
          <div class="flex items-center p-3 rounded-xl hover:bg-base-200/50 transition-colors border border-base-200/50 shadow-sm">
            <input type="checkbox" class="checkbox checkbox-primary mr-4" />
            <div class="flex-1">
              <span class="font-medium">月末締め処理</span>
              <div class="flex items-center gap-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-xs text-base-content/60">期限: 18:00</span>
              </div>
            </div>
            <div class="badge badge-warning badge-sm px-3 py-3">中</div>
          </div>
        </div>
        <div class="card-actions justify-end mt-6">
          <button class="btn btn-primary btn-sm rounded-lg shadow-md gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            タスク追加
          </button>
        </div>
      </div>
    </div>

    <!-- お知らせ -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="flex justify-between items-center mb-4">
          <h2 class="card-title">お知らせ</h2>
          <button class="btn btn-ghost btn-sm" aria-label="お知らせメニューを開く">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </button>
        </div>
        <div class="space-y-4">
          <div class="card card-compact card-bordered border-info bg-info/5 hover:bg-info/10 transition-colors cursor-pointer">
            <div class="card-body">
              <div class="flex items-center gap-2">
                <div class="badge badge-info badge-sm">INFO</div>
                <h3 class="font-medium flex-1">システムメンテナンス</h3>
                <span class="text-xs text-base-content/60">2日前</span>
              </div>
              <p class="text-sm text-base-content/80">5月25日 23:00～翌2:00にシステムメンテナンスを実施します。</p>
            </div>
          </div>
          <div class="card card-compact card-bordered border-success bg-success/5 hover:bg-success/10 transition-colors cursor-pointer">
            <div class="card-body">
              <div class="flex items-center gap-2">
                <div class="badge badge-success badge-sm">NEW</div>
                <h3 class="font-medium flex-1">新機能リリース</h3>
                <span class="text-xs text-base-content/60">1週間前</span>
              </div>
              <p class="text-sm text-base-content/80">AIを活用した予測分析機能がリリースされました。</p>
            </div>
          </div>
          <div class="card card-compact card-bordered border-warning bg-warning/5 hover:bg-warning/10 transition-colors cursor-pointer">
            <div class="card-body">
              <div class="flex items-center gap-2">
                <div class="badge badge-warning badge-sm">ALERT</div>
                <h3 class="font-medium flex-1">価格改定のお知らせ</h3>
                <span class="text-xs text-base-content/60">2週間前</span>
              </div>
              <p class="text-sm text-base-content/80">6月1日より一部サービスの価格を改定いたします。</p>
            </div>
          </div>
        </div>
        <div class="card-actions justify-center mt-4">
          <button class="btn btn-ghost btn-sm">
            すべてのお知らせを表示
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
