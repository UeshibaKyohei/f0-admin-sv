<script>
  export let user;
  
  // userが存在しない場合のデフォルト値
  $: safeUser = user || {
    id: '',
    name: 'ゲスト',
    email: '',
    department: 'account',
    role: '',
    avatar: '?',
    level: 1,
    totalPoints: 0,
    badges: [],
    currentStreak: 0,
    weeklyPoints: 0
  };
  
  // ポイントからレベルゲージを計算
  $: levelProgress = (safeUser.totalPoints % 300) / 300 * 100;
</script>

<div class="dropdown dropdown-end">
  <button class="btn btn-ghost btn-circle avatar avatar-placeholder" tabindex="0">
    <div class="w-10 h-10 rounded-full bg-primary text-primary-content">
      <span>{safeUser.avatar}</span>
    </div>
  </button>
  
  <div class="dropdown-content mt-3 z-[1] p-4 shadow-lg bg-base-100 rounded-box w-80" tabindex="0">
    <div class="flex items-center gap-4 mb-4">
      <div class="avatar avatar-placeholder">
        <div class="w-16 h-16 rounded-full bg-primary text-primary-content">
          <span class="text-xl">{safeUser.avatar}</span>
        </div>
      </div>
      <div class="flex-1">
        <h3 class="font-bold text-lg">{safeUser.name}</h3>
        <p class="text-sm opacity-70">{safeUser.role}</p>
        <div class="flex items-center gap-2 mt-1">
          <div class="badge badge-sm badge-outline">{safeUser.department}</div>
          <div class="badge badge-sm badge-primary">Lv.{safeUser.level}</div>
        </div>
      </div>
    </div>

    <!-- レベル進捗 -->
    <div class="mb-4">
      <div class="flex justify-between text-sm mb-1">
        <span>レベル {safeUser.level}</span>
        <span>{safeUser.totalPoints % 300} / 300 XP</span>
      </div>
      <progress class="progress progress-primary w-full" value={levelProgress} max="100"></progress>
    </div>

    <!-- 今週のポイント -->
    <div class="stats shadow w-full mb-4">
      <div class="stat">
        <div class="stat-title">今週の獲得ポイント</div>
        <div class="stat-value text-primary">{safeUser.weeklyPoints}</div>
        <div class="stat-desc">ストリーク: {safeUser.currentStreak}日継続中🔥</div>
      </div>
    </div>

    <!-- バッジ -->
    {#if safeUser.badges && safeUser.badges.length > 0}
      <div class="mb-4">
        <h4 class="text-sm font-semibold mb-2">獲得バッジ</h4>
        <div class="flex flex-wrap gap-2">
          {#each safeUser.badges as badge}
            <div class="tooltip" data-tip={badge.description}>
              <div class="badge badge-lg gap-2 {badge.rarity === 'epic' ? 'badge-primary' : badge.rarity === 'rare' ? 'badge-secondary' : 'badge-outline'}">
                <span>{badge.icon}</span>
                <span>{badge.name}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <div class="divider my-2"></div>
    
    <button class="btn btn-sm btn-ghost w-full justify-start">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      プロフィール設定
    </button>
  </div>
</div>