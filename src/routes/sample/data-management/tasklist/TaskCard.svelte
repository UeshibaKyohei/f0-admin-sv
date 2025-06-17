<script>
  import { users, campaigns, clients } from './stores/taskStore';
  import { PRIORITY_CONFIG } from './types';
  
  export let task;
  
  // ユーザー情報を取得
  $: assigneeUsers = task.assignees.map(id => $users.find(u => u.id === id)).filter(Boolean);
  
  // キャンペーン情報を取得
  $: campaign = $campaigns.find(c => c.id === task.campaignId);
  
  // 期限までの日数を計算
  $: daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  // 期限の表示クラス
  $: dueDateClass = daysUntilDue < 0 ? 'text-error' : daysUntilDue <= 1 ? 'text-warning' : 'text-base-content';
</script>

<div class="card bg-base-100 hover:shadow-md transition-shadow duration-200 cursor-pointer">
  <div class="card-body p-4">
    <!-- 優先度とポイント -->
    <div class="flex items-center justify-between mb-2">
      <span class="badge badge-{PRIORITY_CONFIG[task.priority].color} badge-sm">
        {PRIORITY_CONFIG[task.priority].label}
      </span>
      <span class="text-xs font-semibold text-primary">+{task.points}pt</span>
    </div>
    
    <!-- タイトル -->
    <h4 class="font-medium text-sm mb-2 line-clamp-2">{task.title}</h4>
    
    <!-- キャンペーン -->
    {#if campaign}
      <div class="text-xs opacity-70 mb-2 truncate">
        <span class="inline-block w-2 h-2 rounded-full bg-{campaign.color} mr-1"></span>
        {campaign.clientName}
      </div>
    {/if}
    
    <!-- タグ -->
    {#if task.tags.length > 0}
      <div class="flex flex-wrap gap-1 mb-2">
        {#each task.tags.slice(0, 3) as tag}
          <span class="badge badge-ghost badge-xs">{tag}</span>
        {/each}
        {#if task.tags.length > 3}
          <span class="badge badge-ghost badge-xs">+{task.tags.length - 3}</span>
        {/if}
      </div>
    {/if}
    
    <!-- 下部情報 -->
    <div class="flex items-center justify-between mt-auto pt-2">
      <!-- 担当者 -->
      <div class="flex -space-x-2">
        {#each assigneeUsers.slice(0, 3) as user}
          <div class="avatar avatar-placeholder tooltip" data-tip={user.name}>
            <div class="w-6 h-6 rounded-full bg-neutral text-neutral-content ring-2 ring-base-100">
              <span class="text-xs">{user.avatar}</span>
            </div>
          </div>
        {/each}
        {#if assigneeUsers.length > 3}
          <div class="avatar avatar-placeholder">
            <div class="w-6 h-6 rounded-full bg-neutral text-neutral-content ring-2 ring-base-100">
              <span class="text-xs">+{assigneeUsers.length - 3}</span>
            </div>
          </div>
        {/if}
      </div>
      
      <!-- 期限 -->
      <div class="text-xs {dueDateClass} flex items-center gap-1">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {#if daysUntilDue < 0}
          {Math.abs(daysUntilDue)}日超過
        {:else if daysUntilDue === 0}
          本日
        {:else}
          {daysUntilDue}日後
        {/if}
      </div>
    </div>
    
    <!-- 追加情報のインジケーター -->
    <div class="flex gap-2 mt-2">
      {#if task.attachments.length > 0}
        <div class="tooltip" data-tip="{task.attachments.length}個の添付ファイル">
          <svg class="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </div>
      {/if}
      {#if task.comments.length > 0}
        <div class="tooltip" data-tip="{task.comments.length}件のコメント">
          <svg class="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      {/if}
      {#if task.dependencies.length > 0}
        <div class="tooltip" data-tip="{task.dependencies.length}個の依存関係">
          <svg class="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
      {/if}
      {#if task.aiSuggestions && task.aiSuggestions.length > 0}
        <div class="tooltip" data-tip="AI提案あり">
          <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      {/if}
    </div>
  </div>
</div>