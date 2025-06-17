<script>
  export let stats;
</script>

<div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
  <!-- 全タスク -->
  <div class="stats shadow">
    <div class="stat">
      <div class="stat-figure text-primary">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <div class="stat-title">全タスク</div>
      <div class="stat-value text-primary">{stats.total}</div>
    </div>
  </div>

  <!-- 進行中 -->
  <div class="stats shadow">
    <div class="stat">
      <div class="stat-figure text-warning">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div class="stat-title">進行中</div>
      <div class="stat-value text-warning">{stats.inProgress}</div>
    </div>
  </div>

  <!-- 完了済み -->
  <div class="stats shadow">
    <div class="stat">
      <div class="stat-figure text-success">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="stat-title">完了</div>
      <div class="stat-value text-success">{stats.completed}</div>
      <div class="stat-desc">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</div>
    </div>
  </div>

  <!-- 本日期限 -->
  <div class="stats shadow">
    <div class="stat">
      <div class="stat-figure text-info">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="stat-title">本日期限</div>
      <div class="stat-value text-info">{stats.dueToday}</div>
    </div>
  </div>

  <!-- 期限超過 -->
  <div class="stats shadow">
    <div class="stat">
      <div class="stat-figure text-error">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="stat-title">期限超過</div>
      <div class="stat-value text-error">{stats.overdue}</div>
    </div>
  </div>
</div>