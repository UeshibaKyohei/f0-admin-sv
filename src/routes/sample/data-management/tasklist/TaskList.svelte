<script>
  import { filteredTasks, users, campaigns, updateTask, viewSettings } from './stores/taskStore';
  import { selectedTask, isTaskModalOpen } from './stores/uiStore';
  import { PRIORITY_CONFIG, STATUS_CONFIG } from './types';
  
  // ソート関数
  function sortTasks(tasks) {
    return [...tasks].sort((a, b) => {
      let compareValue = 0;
      
      switch ($viewSettings.sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          compareValue = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'dueDate':
          compareValue = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'created':
          compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          compareValue = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }

      return $viewSettings.sortOrder === 'asc' ? compareValue : -compareValue;
    });
  }
  
  $: sortedTasks = sortTasks($filteredTasks);
  
  // タスククリック
  function handleTaskClick(task, event) {
    event.preventDefault();
    event.stopPropagation();
    selectedTask.set(task.id);
    isTaskModalOpen.set(true);
  }
  
  // ステータス変更
  function handleStatusChange(taskId, newStatus) {
    updateTask(taskId, { status: newStatus });
  }
  
  // ソート変更
  function changeSort(sortBy) {
    if ($viewSettings.sortBy === sortBy) {
      viewSettings.update(v => ({ ...v, sortOrder: v.sortOrder === 'asc' ? 'desc' : 'asc' }));
    } else {
      viewSettings.update(v => ({ ...v, sortBy, sortOrder: 'asc' }));
    }
  }
</script>

<div class="overflow-x-auto">
  <table class="table table-zebra">
    <thead>
      <tr>
        <th class="w-12">
          <label>
            <input type="checkbox" class="checkbox checkbox-sm" />
          </label>
        </th>
        <th>
          <button 
            class="flex items-center gap-1 hover:text-primary"
            onclick={() => changeSort('priority')}
          >
            優先度
            {#if $viewSettings.sortBy === 'priority'}
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {#if $viewSettings.sortOrder === 'asc'}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                {:else}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                {/if}
              </svg>
            {/if}
          </button>
        </th>
        <th>タスク名</th>
        <th>ステータス</th>
        <th>担当者</th>
        <th>キャンペーン</th>
        <th>
          <button 
            class="flex items-center gap-1 hover:text-primary"
            onclick={() => changeSort('dueDate')}
          >
            期限
            {#if $viewSettings.sortBy === 'dueDate'}
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {#if $viewSettings.sortOrder === 'asc'}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                {:else}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                {/if}
              </svg>
            {/if}
          </button>
        </th>
        <th>ポイント</th>
        <th class="w-20"></th>
      </tr>
    </thead>
    <tbody>
      {#each sortedTasks as task}
        {@const assigneeUsers = task.assignees.map(id => $users.find(u => u.id === id)).filter(Boolean)}
        {@const campaign = $campaigns.find(c => c.id === task.campaignId)}
        {@const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
        <tr class="hover">
          <td onclick={(e) => e.stopPropagation()}>
            <label>
              <input type="checkbox" class="checkbox checkbox-sm" />
            </label>
          </td>
          <td class="cursor-pointer" onclick={(e) => handleTaskClick(task, e)}>
            <span class="badge badge-{PRIORITY_CONFIG[task.priority].color} badge-sm">
              {PRIORITY_CONFIG[task.priority].label}
            </span>
          </td>
          <td class="cursor-pointer" onclick={(e) => handleTaskClick(task, e)}>
            <div>
              <div class="font-medium">{task.title}</div>
              {#if task.tags.length > 0}
                <div class="flex gap-1 mt-1">
                  {#each task.tags.slice(0, 3) as tag}
                    <span class="badge badge-ghost badge-xs">{tag}</span>
                  {/each}
                </div>
              {/if}
            </div>
          </td>
          <td>
            <select 
              class="select select-ghost select-xs w-28"
              value={task.status}
              onclick={(e) => e.stopPropagation()}
              onchange={(e) => handleStatusChange(task.id, e.target.value)}
            >
              {#each Object.entries(STATUS_CONFIG) as [value, config]}
                <option value={value}>{config.label}</option>
              {/each}
            </select>
          </td>
          <td class="cursor-pointer" onclick={(e) => handleTaskClick(task, e)}>
            <div class="flex -space-x-2">
              {#each assigneeUsers.slice(0, 3) as user}
                <div class="avatar avatar-placeholder tooltip" data-tip={user.name}>
                  <div class="w-8 h-8 rounded-full bg-neutral text-neutral-content ring-2 ring-base-100">
                    <span class="text-xs">{user.avatar}</span>
                  </div>
                </div>
              {/each}
              {#if assigneeUsers.length > 3}
                <div class="avatar avatar-placeholder">
                  <div class="w-8 h-8 rounded-full bg-neutral text-neutral-content ring-2 ring-base-100">
                    <span class="text-xs">+{assigneeUsers.length - 3}</span>
                  </div>
                </div>
              {/if}
            </div>
          </td>
          <td class="cursor-pointer" onclick={(e) => handleTaskClick(task, e)}>
            {#if campaign}
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-{campaign.color}"></span>
                <span class="text-sm truncate max-w-[150px]">{campaign.name}</span>
              </div>
            {:else}
              <span class="text-sm opacity-50">-</span>
            {/if}
          </td>
          <td class="cursor-pointer" onclick={(e) => handleTaskClick(task, e)}>
            <div class="text-sm {daysUntilDue < 0 ? 'text-error' : daysUntilDue <= 1 ? 'text-warning' : ''}">
              {#if daysUntilDue < 0}
                <span class="font-medium">{Math.abs(daysUntilDue)}日超過</span>
              {:else if daysUntilDue === 0}
                <span class="font-medium">本日</span>
              {:else}
                {new Date(task.dueDate).toLocaleDateString('ja-JP')}
              {/if}
            </div>
          </td>
          <td class="cursor-pointer" onclick={(e) => handleTaskClick(task, e)}>
            <span class="badge badge-sm badge-primary">+{task.points}pt</span>
          </td>
          <td>
            <div class="dropdown dropdown-end">
              <button class="btn btn-ghost btn-xs" tabindex="0" onclick={(e) => e.stopPropagation()}>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              <ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52" tabindex="0">
                <li><a>編集</a></li>
                <li><a>複製</a></li>
                <li><a>アーカイブ</a></li>
                <li class="text-error"><a>削除</a></li>
              </ul>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  
  {#if sortedTasks.length === 0}
    <div class="text-center py-16">
      <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-lg font-medium mb-2">タスクが見つかりません</p>
      <p class="text-sm opacity-60">フィルター条件を変更するか、新しいタスクを作成してください</p>
    </div>
  {/if}
</div>