<script>
  import { tasks, users, campaigns, updateTask, deleteTask } from './stores/taskStore';
  import { selectedTask, isTaskModalOpen, showToast } from './stores/uiStore';
  import { PRIORITY_CONFIG, STATUS_CONFIG } from './types';
  
  // 編集モード
  let isEditMode = false;
  let editedTask = null;
  let newComment = '';
  
  $: task = $selectedTask ? $tasks.find(t => t.id === $selectedTask) : null;
  $: assigneeUsers = task ? task.assignees.map(id => $users.find(u => u.id === id)).filter(Boolean) : [];
  $: campaign = task ? $campaigns.find(c => c.id === task.campaignId) : null;
  
  // タスクが変わったら編集モードをリセット
  $: if (task) {
    isEditMode = false;
    editedTask = { ...task };
  }
  
  // モーダルを閉じる
  function closeModal() {
    isTaskModalOpen.set(false);
    selectedTask.set(null);
    isEditMode = false;
    newComment = '';
  }
  
  // 編集モードの切り替え
  function toggleEditMode() {
    if (isEditMode) {
      // 編集をキャンセル
      editedTask = { ...task };
      isEditMode = false;
    } else {
      // 編集開始
      isEditMode = true;
    }
  }
  
  // タスクの保存
  function saveTask() {
    if (editedTask && task) {
      const updates = {
        title: editedTask.title,
        description: editedTask.description,
        status: editedTask.status,
        priority: editedTask.priority,
        assignees: editedTask.assignees,
        dueDate: editedTask.dueDate,
        estimatedHours: editedTask.estimatedHours,
        actualHours: editedTask.actualHours,
        tags: editedTask.tags,
        campaignId: editedTask.campaignId,
        dependencies: editedTask.dependencies
      };
      
      updateTask(task.id, updates);
      showToast('タスクを更新しました', 'success');
      isEditMode = false;
    }
  }
  
  // タスクの完了
  function completeTask() {
    if (task) {
      updateTask(task.id, { status: 'done' });
      showToast(`タスク「${task.title}」を完了しました！ +${task.points}pt`, 'success');
      closeModal();
    }
  }
  
  // タスクの削除
  function handleDeleteTask() {
    if (task && confirm('このタスクを削除してもよろしいですか？')) {
      deleteTask(task.id);
      showToast('タスクを削除しました', 'info');
      closeModal();
    }
  }
  
  // コメントの追加
  function addComment() {
    if (task && newComment.trim()) {
      const comment = {
        id: `comment-${Date.now()}`,
        userId: 'user-1', // 現在のユーザーID（実際はcurrentUserから取得）
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
        mentions: []
      };
      
      updateTask(task.id, { 
        comments: [...task.comments, comment] 
      });
      
      newComment = '';
      showToast('コメントを追加しました', 'success');
    }
  }
  
  // タグの追加・削除
  let newTag = '';
  
  function addTag() {
    if (editedTask && newTag.trim() && !editedTask.tags.includes(newTag.trim())) {
      editedTask.tags = [...editedTask.tags, newTag.trim()];
      newTag = '';
    }
  }
  
  function removeTag(tag) {
    if (editedTask) {
      editedTask.tags = editedTask.tags.filter(t => t !== tag);
    }
  }
</script>

{#if task}
  <input type="checkbox" id="task-modal" class="modal-toggle" checked={$isTaskModalOpen} />
  <div class="modal modal-open">
    <div class="modal-box max-w-4xl">
      <!-- ヘッダー -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          {#if isEditMode}
            <input 
              type="text" 
              class="input input-bordered w-full text-xl font-bold mb-2"
              bind:value={editedTask.title}
            />
          {:else}
            <h3 class="text-xl font-bold mb-2">{task.title}</h3>
          {/if}
          
          <div class="flex items-center gap-2">
            {#if isEditMode}
              <select class="select select-sm select-bordered" bind:value={editedTask.priority}>
                {#each Object.entries(PRIORITY_CONFIG) as [value, config]}
                  <option value={value}>{config.label}</option>
                {/each}
              </select>
              <select class="select select-sm select-bordered" bind:value={editedTask.status}>
                {#each Object.entries(STATUS_CONFIG) as [value, config]}
                  <option value={value}>{config.label}</option>
                {/each}
              </select>
            {:else}
              <span class="badge badge-{PRIORITY_CONFIG[task.priority].color}">
                {PRIORITY_CONFIG[task.priority].label}
              </span>
              <span class="badge badge-{STATUS_CONFIG[task.status].color}">
                {STATUS_CONFIG[task.status].label}
              </span>
            {/if}
            <span class="badge badge-primary">+{task.points}pt</span>
          </div>
        </div>
        <button class="btn btn-sm btn-circle btn-ghost" onclick={closeModal}>✕</button>
      </div>

      <!-- メインコンテンツ -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左側：詳細情報 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 説明 -->
          <div>
            <h4 class="font-semibold mb-2">説明</h4>
            {#if isEditMode}
              <textarea 
                class="textarea textarea-bordered w-full h-32"
                bind:value={editedTask.description}
              ></textarea>
            {:else}
              <p class="text-sm opacity-80 whitespace-pre-wrap">{task.description || '説明がありません'}</p>
            {/if}
          </div>

          <!-- AI提案（編集モードでは非表示） -->
          {#if !isEditMode && task.aiSuggestions && task.aiSuggestions.length > 0}
            <div>
              <h4 class="font-semibold mb-2 flex items-center gap-2">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI提案
              </h4>
              <div class="space-y-2">
                {#each task.aiSuggestions as suggestion}
                  <div class="alert alert-info">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p class="text-sm">{suggestion.content}</p>
                      <div class="flex items-center gap-2 mt-1">
                        <span class="text-xs opacity-60">確信度: {Math.round(suggestion.confidence * 100)}%</span>
                        {#if !suggestion.applied}
                          <button class="btn btn-xs btn-primary">適用</button>
                        {:else}
                          <span class="badge badge-xs badge-success">適用済み</span>
                        {/if}
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- コメント -->
          <div>
            <h4 class="font-semibold mb-2">コメント ({task.comments.length})</h4>
            {#if task.comments.length > 0}
              <div class="space-y-3 max-h-64 overflow-y-auto">
                {#each task.comments as comment}
                  {@const commentUser = $users.find(u => u.id === comment.userId)}
                  <div class="flex gap-3">
                    <div class="avatar avatar-placeholder">
                      <div class="w-8 h-8 rounded-full bg-neutral text-neutral-content">
                        <span class="text-xs">{commentUser?.avatar || '?'}</span>
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="font-medium text-sm">{commentUser?.name || '不明'}</span>
                        <span class="text-xs opacity-60">
                          {new Date(comment.createdAt).toLocaleString('ja-JP')}
                        </span>
                      </div>
                      <p class="text-sm">{comment.content}</p>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="text-sm opacity-60">コメントはまだありません</p>
            {/if}
            
            <!-- コメント入力 -->
            <div class="mt-4">
              <textarea 
                class="textarea textarea-bordered w-full" 
                placeholder="コメントを入力..."
                rows="2"
                bind:value={newComment}
              ></textarea>
              <button 
                class="btn btn-sm btn-primary mt-2"
                onclick={addComment}
                disabled={!newComment.trim()}
              >
                投稿
              </button>
            </div>
          </div>
        </div>

        <!-- 右側：メタ情報 -->
        <div class="space-y-4">
          <!-- キャンペーン -->
          <div>
            <h4 class="text-sm font-semibold opacity-60 mb-1">キャンペーン</h4>
            {#if isEditMode}
              <select class="select select-bordered select-sm w-full" bind:value={editedTask.campaignId}>
                <option value="">なし</option>
                {#each $campaigns as camp}
                  <option value={camp.id}>{camp.name}</option>
                {/each}
              </select>
            {:else if campaign}
              <div class="flex items-center gap-2">
                <span class="inline-block w-3 h-3 rounded-full bg-{campaign.color}"></span>
                <span class="text-sm">{campaign.name}</span>
              </div>
              <p class="text-xs opacity-60 mt-1">{campaign.clientName}</p>
            {:else}
              <p class="text-sm opacity-60">未設定</p>
            {/if}
          </div>

          <!-- 担当者 -->
          <div>
            <h4 class="text-sm font-semibold opacity-60 mb-2">担当者</h4>
            {#if isEditMode}
              <select 
                class="select select-bordered select-sm w-full" 
                multiple 
                size="4"
                bind:value={editedTask.assignees}
              >
                {#each $users as user}
                  <option value={user.id}>{user.name}</option>
                {/each}
              </select>
              <p class="text-xs opacity-60 mt-1">Ctrlキーを押しながら複数選択</p>
            {:else}
              <div class="flex flex-wrap gap-2">
                {#each assigneeUsers as user}
                  <div class="flex items-center gap-2 bg-base-200 rounded-full px-3 py-1">
                    <div class="avatar avatar-placeholder">
                      <div class="w-6 h-6 rounded-full bg-neutral text-neutral-content">
                        <span class="text-xs">{user.avatar}</span>
                      </div>
                    </div>
                    <span class="text-sm">{user.name}</span>
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <!-- 期限 -->
          <div>
            <h4 class="text-sm font-semibold opacity-60 mb-1">期限</h4>
            {#if isEditMode}
              <input 
                type="date" 
                class="input input-bordered input-sm w-full"
                bind:value={editedTask.dueDate}
              />
            {:else}
              <p class="text-sm">{new Date(task.dueDate).toLocaleDateString('ja-JP')}</p>
            {/if}
          </div>

          <!-- 工数 -->
          <div>
            <h4 class="text-sm font-semibold opacity-60 mb-1">工数</h4>
            {#if isEditMode}
              <div class="space-y-2">
                <div>
                  <label class="text-xs">見積（時間）</label>
                  <input 
                    type="number" 
                    class="input input-bordered input-sm w-full"
                    min="0"
                    step="0.5"
                    bind:value={editedTask.estimatedHours}
                  />
                </div>
                <div>
                  <label class="text-xs">実績（時間）</label>
                  <input 
                    type="number" 
                    class="input input-bordered input-sm w-full"
                    min="0"
                    step="0.5"
                    bind:value={editedTask.actualHours}
                  />
                </div>
              </div>
            {:else}
              <div class="text-sm">
                <p>見積: {task.estimatedHours}時間</p>
                <p>実績: {task.actualHours}時間</p>
                {#if task.actualHours > 0}
                  <progress 
                    class="progress progress-primary w-full mt-1" 
                    value={task.actualHours} 
                    max={task.estimatedHours}
                  ></progress>
                {/if}
              </div>
            {/if}
          </div>

          <!-- タグ -->
          <div>
            <h4 class="text-sm font-semibold opacity-60 mb-2">タグ</h4>
            {#if isEditMode}
              <div class="space-y-2">
                <div class="flex gap-1">
                  <input 
                    type="text" 
                    class="input input-bordered input-sm flex-1"
                    placeholder="タグを追加"
                    bind:value={newTag}
                    onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button class="btn btn-sm btn-primary" onclick={addTag}>追加</button>
                </div>
                <div class="flex flex-wrap gap-1">
                  {#each editedTask.tags as tag}
                    <span class="badge badge-ghost gap-1">
                      {tag}
                      <button onclick={() => removeTag(tag)} class="text-xs">✕</button>
                    </span>
                  {/each}
                </div>
              </div>
            {:else}
              <div class="flex flex-wrap gap-1">
                {#each task.tags as tag}
                  <span class="badge badge-ghost badge-sm">{tag}</span>
                {/each}
              </div>
            {/if}
          </div>

          <!-- 添付ファイル -->
          {#if task.attachments.length > 0}
            <div>
              <h4 class="text-sm font-semibold opacity-60 mb-2">添付ファイル</h4>
              <div class="space-y-1">
                {#each task.attachments as attachment}
                  <a href={attachment.url} class="flex items-center gap-2 text-sm hover:text-primary">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    {attachment.name}
                  </a>
                {/each}
              </div>
            </div>
          {/if}

          <!-- 更新日時 -->
          <div>
            <h4 class="text-sm font-semibold opacity-60 mb-1">更新日時</h4>
            <p class="text-sm">{new Date(task.updatedAt).toLocaleString('ja-JP')}</p>
          </div>
        </div>
      </div>

      <!-- アクション -->
      <div class="modal-action">
        <button class="btn btn-ghost btn-sm" onclick={handleDeleteTask}>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          削除
        </button>
        <div class="flex-1"></div>
        
        {#if isEditMode}
          <button class="btn btn-ghost" onclick={toggleEditMode}>キャンセル</button>
          <button class="btn btn-primary" onclick={saveTask}>保存</button>
        {:else}
          <button class="btn btn-ghost" onclick={closeModal}>閉じる</button>
          <button class="btn btn-primary" onclick={toggleEditMode}>編集</button>
          {#if task.status !== 'done'}
            <button class="btn btn-success" onclick={completeTask}>完了</button>
          {/if}
        {/if}
      </div>
    </div>
    <label class="modal-backdrop" for="task-modal" onclick={closeModal}>
      <input type="hidden" />
    </label>
  </div>
{/if}