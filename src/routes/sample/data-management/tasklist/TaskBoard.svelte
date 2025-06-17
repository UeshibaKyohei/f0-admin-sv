<script>
  import { tasksByStatus, moveTask, reorderTasksInStatus, users, campaigns } from './stores/taskStore';
  import { draggedTaskId, dropTargetStatus, selectedTask, isTaskModalOpen } from './stores/uiStore';
  import TaskCard from './TaskCard.svelte';
  import TaskModal from './TaskModal.svelte';
  import { STATUS_CONFIG } from './types';
  
  // ドラッグ中のターゲットインデックス
  let dragOverIndex = null;
  let dragOverStatus = null;
  
  // ドラッグ開始
  function handleDragStart(e, taskId) {
    draggedTaskId.set(taskId);
    e.dataTransfer.effectAllowed = 'move';
  }
  
  // タスク上でのドラッグオーバー
  function handleDragOverTask(e, status, index) {
    e.preventDefault();
    e.stopPropagation();
    dragOverIndex = index;
    dragOverStatus = status;
  }
  
  // コラム上でのドラッグオーバー
  function handleDragOver(e, status) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dropTargetStatus.set(status);
  }
  
  // ドラッグ終了
  function handleDragLeave() {
    dropTargetStatus.set(null);
  }
  
  // ドロップ
  async function handleDrop(e, status) {
    e.preventDefault();
    const taskId = $draggedTaskId;
    if (taskId) {
      const draggedTask = Object.values($tasksByStatus).flat().find(t => t.id === taskId);
      if (draggedTask) {
        // 異なるステータスへの移動
        if (draggedTask.status !== status) {
          // dragOverIndexがnullの場合は最後に追加
          const targetIndex = dragOverIndex !== null ? dragOverIndex : $tasksByStatus[status].length;
          await moveTask(taskId, status, targetIndex);
        } 
        // 同じステータス内での並び替え
        else if (dragOverIndex !== null) {
          await reorderTasksInStatus(status, taskId, dragOverIndex);
        }
      }
    }
    draggedTaskId.set(null);
    dropTargetStatus.set(null);
    dragOverIndex = null;
    dragOverStatus = null;
  }
  
  // タスククリック
  function handleTaskClick(task) {
    selectedTask.set(task.id);
    isTaskModalOpen.set(true);
  }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
  {#each Object.entries(STATUS_CONFIG) as [status, config]}
    <div 
      class="bg-base-100 rounded-lg shadow-sm p-4 min-h-[500px] transition-all duration-200
             {$dropTargetStatus === status ? 'ring-2 ring-primary ring-opacity-50 bg-primary/5' : ''}"
      ondragover={(e) => handleDragOver(e, status)}
      ondragleave={handleDragLeave}
      ondrop={(e) => handleDrop(e, status)}
    >
      <!-- カラムヘッダー -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <div class="badge badge-{config.color} badge-sm"></div>
          <h3 class="font-semibold">{config.label}</h3>
          <span class="text-sm opacity-60">({$tasksByStatus[status].length})</span>
        </div>
        <button class="btn btn-ghost btn-xs btn-circle">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      
      <!-- タスクリスト -->
      <div class="space-y-3" 
        ondragover={(e) => {
          e.preventDefault();
          // リストの最後にドロップする場合
          if ($tasksByStatus[status].length > 0) {
            dragOverIndex = $tasksByStatus[status].length;
            dragOverStatus = status;
          }
        }}
      >
        {#each $tasksByStatus[status] as task, index (task.id)}
          <div class="relative">
            {#if dragOverStatus === status && dragOverIndex === index && $draggedTaskId && $draggedTaskId !== task.id}
              <div class="h-1 bg-primary mb-2 rounded"></div>
            {/if}
            <div
              draggable="true"
              ondragstart={(e) => handleDragStart(e, task.id)}
              ondragover={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const y = e.clientY - rect.top;
                const height = rect.height;
                
                // マウスが要素の上半分にある場合は上に挿入
                if (y < height / 2) {
                  dragOverIndex = index;
                } else {
                  // 下半分にある場合は下に挿入
                  dragOverIndex = index + 1;
                }
                dragOverStatus = status;
              }}
              onclick={() => handleTaskClick(task)}
              class="cursor-move transition-all duration-200"
            >
              <TaskCard {task} />
            </div>
          </div>
        {/each}
        {#if dragOverStatus === status && dragOverIndex === $tasksByStatus[status].length && $draggedTaskId}
          <div class="h-1 bg-primary rounded"></div>
        {/if}
      </div>
      
      <!-- 空の状態 -->
      {#if $tasksByStatus[status].length === 0}
        <div class="text-center py-8 opacity-50">
          <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p class="text-sm">タスクがありません</p>
        </div>
      {/if}
    </div>
  {/each}
</div>

