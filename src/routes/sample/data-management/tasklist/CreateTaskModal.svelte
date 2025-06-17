<script>
  import { createTask, users, campaigns } from './stores/taskStore';
  import { showToast } from './stores/uiStore';
  import AIAssistant from './AIAssistant.svelte';
  import { PRIORITY_CONFIG } from './types';
  
  export let isOpen = false;
  export let onClose = () => {};
  
  // 新規タスクのデータ
  let newTask = {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignees: [],
    dueDate: '',
    estimatedHours: 0,
    actualHours: 0,
    tags: [],
    clientId: '',
    campaignId: '',
    dependencies: [],
    attachments: [],
    comments: [],
    points: 10
  };
  
  // タグ入力
  let tagInput = '';
  
  function addTag() {
    if (tagInput.trim() && !newTask.tags.includes(tagInput.trim())) {
      newTask.tags = [...newTask.tags, tagInput.trim()];
      tagInput = '';
    }
  }
  
  function removeTag(tag) {
    newTask.tags = newTask.tags.filter(t => t !== tag);
  }
  
  // タスク作成
  function handleCreateTask() {
    if (!newTask.title.trim()) {
      showToast('タスク名を入力してください', 'error');
      return;
    }
    
    // ポイント計算（優先度に基づく）
    newTask.points = PRIORITY_CONFIG[newTask.priority].points;
    
    createTask(newTask);
    showToast('タスクを作成しました', 'success');
    resetForm();
    onClose();
  }
  
  // フォームリセット
  function resetForm() {
    newTask = {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignees: [],
      dueDate: '',
      estimatedHours: 0,
      actualHours: 0,
      tags: [],
      clientId: '',
      campaignId: '',
      dependencies: [],
      attachments: [],
      comments: [],
      points: 10
    };
    tagInput = '';
  }
  
  // AI提案が適用された時の処理
  function handleAISuggestionApplied(suggestion) {
    // 実際の実装では、提案内容に基づいてフォームを更新
    console.log('AI suggestion applied:', suggestion);
  }
  
  // キャンペーン選択時にクライアントを自動設定
  $: if (newTask.campaignId) {
    const campaign = $campaigns.find(c => c.id === newTask.campaignId);
    if (campaign) {
      newTask.clientId = campaign.clientId;
    }
  }
</script>

{#if isOpen}
<input type="checkbox" id="create-task-modal" class="modal-toggle" checked={true} />
<div class="modal modal-open">
  <div class="modal-box max-w-3xl">
    <h3 class="font-bold text-lg mb-4">新規タスク作成</h3>
    
    <!-- AI アシスタント -->
    <AIAssistant 
      task={newTask} 
      onSuggestionApplied={handleAISuggestionApplied}
    />
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 左列 -->
      <div class="space-y-4">
        <!-- タスク名 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">タスク名 <span class="text-error">*</span></span>
          </label>
          <input 
            type="text" 
            class="input input-bordered w-full" 
            placeholder="例: 夏季キャンペーンのバナー作成"
            bind:value={newTask.title}
          />
        </div>
        
        <!-- 説明 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">説明</span>
          </label>
          <textarea 
            class="textarea textarea-bordered h-24" 
            placeholder="タスクの詳細な説明を入力..."
            bind:value={newTask.description}
          ></textarea>
        </div>
        
        <!-- キャンペーン -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">キャンペーン</span>
          </label>
          <select class="select select-bordered w-full" bind:value={newTask.campaignId}>
            <option value="">選択してください</option>
            {#each $campaigns as campaign}
              <option value={campaign.id}>{campaign.name}</option>
            {/each}
          </select>
        </div>
        
        <!-- タグ -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">タグ</span>
          </label>
          <div class="flex gap-2">
            <input 
              type="text" 
              class="input input-bordered flex-1" 
              placeholder="タグを入力してEnter"
              bind:value={tagInput}
              onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <button class="btn btn-primary" onclick={addTag}>追加</button>
          </div>
          {#if newTask.tags.length > 0}
            <div class="flex flex-wrap gap-2 mt-2">
              {#each newTask.tags as tag}
                <div class="badge badge-lg gap-2">
                  {tag}
                  <button onclick={() => removeTag(tag)}>
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
      
      <!-- 右列 -->
      <div class="space-y-4">
        <!-- 優先度 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">優先度</span>
          </label>
          <select class="select select-bordered w-full" bind:value={newTask.priority}>
            {#each Object.entries(PRIORITY_CONFIG) as [value, config]}
              <option value={value}>{config.label} (+{config.points}pt)</option>
            {/each}
          </select>
        </div>
        
        <!-- 担当者 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">担当者</span>
          </label>
          <select 
            class="select select-bordered w-full" 
            multiple 
            bind:value={newTask.assignees}
          >
            {#each $users as user}
              <option value={user.id}>{user.name} ({user.department})</option>
            {/each}
          </select>
          <label class="label">
            <span class="label-text-alt">Ctrlキーを押しながら複数選択</span>
          </label>
        </div>
        
        <!-- 期限 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">期限</span>
          </label>
          <input 
            type="date" 
            class="input input-bordered w-full" 
            bind:value={newTask.dueDate}
          />
        </div>
        
        <!-- 見積工数 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">見積工数（時間）</span>
          </label>
          <input 
            type="number" 
            class="input input-bordered w-full" 
            min="0"
            step="0.5"
            bind:value={newTask.estimatedHours}
          />
        </div>
      </div>
    </div>
    
    <!-- アクション -->
    <div class="modal-action">
      <button class="btn btn-ghost" onclick={() => {resetForm(); onClose();}}>
        キャンセル
      </button>
      <button class="btn btn-primary" onclick={handleCreateTask}>
        タスクを作成
      </button>
    </div>
  </div>
  <label class="modal-backdrop" for="create-task-modal" onclick={onClose}>
    <input type="hidden" />
  </label>
</div>
{/if}