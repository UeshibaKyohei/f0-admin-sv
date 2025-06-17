<script>
  import { users, currentUser, tasks } from './stores/taskStore';
  import { showToast } from './stores/uiStore';
  import { config } from './config.js';
  
  // ゲーミフィケーション機能が無効の場合は何も表示しない
  $: shouldShowGamification = config.FEATURE_GAMIFICATION;
  
  // チーム全体のリーダーボード
  $: leaderboard = $users
    .map(user => ({
      ...user,
      completedTasks: $tasks.filter(t => 
        t.assignees && t.assignees.includes(user.id) && t.status === 'done'
      ).length
    }))
    .sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0))
    .slice(0, 5);
  
  // アチーブメント定義
  const achievements = [
    {
      id: 'first-task',
      name: '初めの一歩',
      description: '最初のタスクを完了',
      icon: '🎯',
      condition: (user, tasks) => tasks.filter(t => t.assignees && t.assignees.includes(user.id) && t.status === 'done').length >= 1,
      points: 50,
      rarity: 'common'
    },
    {
      id: 'speed-demon',
      name: 'スピードデーモン',
      description: '期限の3日前にタスクを完了',
      icon: '⚡',
      condition: (user, tasks) => {
        return tasks.some(t => {
          if (!t.assignees || !t.assignees.includes(user.id) || t.status !== 'done') return false;
          const dueDate = new Date(t.dueDate);
          const completedDate = new Date(t.updatedAt);
          const daysDiff = (dueDate - completedDate) / (1000 * 60 * 60 * 24);
          return daysDiff >= 3;
        });
      },
      points: 100,
      rarity: 'rare'
    },
    {
      id: 'team-player',
      name: 'チームプレイヤー',
      description: '他部門のタスクを5回支援',
      icon: '🤝',
      condition: (user, tasks) => {
        const userDept = user.department;
        const crossDeptTasks = tasks.filter(t => {
          if (!t.assignees || !t.assignees.includes(user.id)) return false;
          const otherAssignees = t.assignees.filter(id => id !== user.id);
          return otherAssignees.some(id => {
            const otherUser = $users.find(u => u.id === id);
            return otherUser && otherUser.department !== userDept;
          });
        });
        return crossDeptTasks.length >= 5;
      },
      points: 150,
      rarity: 'rare'
    },
    {
      id: 'perfectionist',
      name: '完璧主義者',
      description: '10個のタスクを期限内に完了',
      icon: '✨',
      condition: (user, tasks) => {
        const completedOnTime = tasks.filter(t => {
          if (!t.assignees || !t.assignees.includes(user.id) || t.status !== 'done') return false;
          const dueDate = new Date(t.dueDate);
          const completedDate = new Date(t.updatedAt);
          return completedDate <= dueDate;
        });
        return completedOnTime.length >= 10;
      },
      points: 300,
      rarity: 'epic'
    },
    {
      id: 'marathon-runner',
      name: 'マラソンランナー',
      description: '30日連続でタスクを完了',
      icon: '🏃',
      condition: (user) => user.currentStreak >= 30,
      points: 500,
      rarity: 'legendary'
    }
  ];
  
  // ユーザーが獲得可能なアチーブメントをチェック
  function checkAchievements(user) {
    if (!user || !user.badges) return [];
    const earnedIds = user.badges.map(b => b.id);
    return achievements.filter(achievement => {
      if (earnedIds.includes(achievement.id)) return false;
      return achievement.condition(user, $tasks);
    });
  }
  
  $: availableAchievements = $currentUser ? checkAchievements($currentUser) : [];
  
  // アチーブメント獲得
  function claimAchievement(achievement) {
    const newBadge = {
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      rarity: achievement.rarity,
      earnedAt: new Date().toISOString()
    };
    
    // ユーザーのバッジに追加（実際の実装では store を更新）
    showToast(`🎉 アチーブメント「${achievement.name}」を獲得しました！ +${achievement.points}pt`, 'success');
  }
  
  // 次のレベルまでの進捗
  $: nextLevelProgress = $currentUser ? ($currentUser.totalPoints % 300) / 300 * 100 : 0;
  $: pointsToNextLevel = $currentUser ? 300 - ($currentUser.totalPoints % 300) : 300;
</script>

<!-- ゲーミフィケーション機能の表示制御 -->
{#if shouldShowGamification}
<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <!-- 個人の進捗 -->
  {#if $currentUser}
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <h3 class="card-title text-lg">マイステータス</h3>
        
        <!-- レベル進捗 -->
        <div class="mb-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-2xl font-bold">レベル {$currentUser.level}</span>
            <span class="text-sm opacity-70">次のレベルまで {pointsToNextLevel}pt</span>
          </div>
          <progress class="progress progress-primary w-full" value={nextLevelProgress} max="100"></progress>
        </div>
        
        <!-- 統計 -->
        <div class="stats stats-vertical shadow">
          <div class="stat">
            <div class="stat-figure text-primary">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div class="stat-title">今週のポイント</div>
            <div class="stat-value text-primary">{$currentUser.weeklyPoints}</div>
            <div class="stat-desc">先週比 +15%</div>
          </div>
          
          <div class="stat">
            <div class="stat-figure text-secondary">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="stat-title">ストリーク</div>
            <div class="stat-value text-secondary">{$currentUser.currentStreak}日</div>
            <div class="stat-desc">継続中 🔥</div>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <h3 class="card-title text-lg">マイステータス</h3>
        <div class="text-center py-8 opacity-50">
          <div class="loading loading-spinner loading-md"></div>
          <p class="mt-2">読み込み中...</p>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- リーダーボード -->
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <h3 class="card-title text-lg">週間リーダーボード</h3>
      
      <div class="space-y-2">
        {#each leaderboard as user, index}
          {@const isCurrentUser = $currentUser && user.id === $currentUser.id}
          <div class="flex items-center gap-3 p-2 rounded-lg {isCurrentUser ? 'bg-primary/10' : ''}">
            <!-- 順位 -->
            <div class="text-2xl font-bold w-8 text-center">
              {#if index === 0}
                <span class="text-warning">🥇</span>
              {:else if index === 1}
                <span class="text-gray-400">🥈</span>
              {:else if index === 2}
                <span class="text-orange-600">🥉</span>
              {:else}
                {index + 1}
              {/if}
            </div>
            
            <!-- ユーザー情報 -->
            <div class="flex-1">
              <div class="font-medium {isCurrentUser ? 'text-primary' : ''}">{user.name}</div>
              <div class="text-xs opacity-70">{user.department}</div>
            </div>
            
            <!-- ポイント -->
            <div class="text-right">
              <div class="font-bold">{user.weeklyPoints}pt</div>
              <div class="text-xs opacity-70">{user.completedTasks}タスク</div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
  
  <!-- アチーブメント -->
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <h3 class="card-title text-lg">獲得可能なアチーブメント</h3>
      
      {#if availableAchievements.length > 0}
        <div class="space-y-2">
          {#each availableAchievements.slice(0, 3) as achievement}
            <div class="card bg-base-200">
              <div class="card-body p-3">
                <div class="flex items-start gap-3">
                  <span class="text-2xl">{achievement.icon}</span>
                  <div class="flex-1">
                    <h4 class="font-medium">{achievement.name}</h4>
                    <p class="text-xs opacity-70">{achievement.description}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="badge badge-xs badge-{achievement.rarity === 'legendary' ? 'error' : achievement.rarity === 'epic' ? 'primary' : achievement.rarity === 'rare' ? 'secondary' : 'ghost'}">
                        {achievement.rarity}
                      </span>
                      <span class="text-xs font-medium">+{achievement.points}pt</span>
                    </div>
                  </div>
                  <button 
                    class="btn btn-xs btn-primary"
                    onclick={() => claimAchievement(achievement)}
                  >
                    獲得
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-sm opacity-70">現在獲得可能なアチーブメントはありません</p>
      {/if}
      
      <button class="btn btn-sm btn-ghost w-full mt-2">
        すべてのアチーブメントを見る
      </button>
    </div>
  </div>
</div>
{:else}
<!-- ゲーミフィケーション機能が無効時の代替表示（本実装時） -->
<div class="alert alert-info">
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  <span>ゲーミフィケーション機能は本実装時に有効化されます</span>
</div>
{/if}