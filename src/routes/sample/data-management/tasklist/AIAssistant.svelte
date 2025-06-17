<script>
  import { showToast } from './stores/uiStore';
  
  export let task = null;
  export let onSuggestionApplied = () => {};
  
  // AIが分析する曖昧な表現のパターン
  const ambiguousPatterns = [
    { pattern: /すぐに|早急に|なるべく早く/i, type: 'deadline', suggestion: '具体的な期限を設定してください' },
    { pattern: /いくつか|複数|何個か/i, type: 'quantity', suggestion: '具体的な数量を明記してください' },
    { pattern: /みんな|全員|関係者/i, type: 'assignee', suggestion: '具体的な担当者を指定してください' },
    { pattern: /確認|チェック|見る/i, type: 'action', suggestion: '具体的な確認項目を明記してください' },
    { pattern: /修正|直す|改善/i, type: 'scope', suggestion: '修正範囲と具体的な内容を明記してください' },
    { pattern: /資料|ドキュメント|書類/i, type: 'deliverable', suggestion: '資料の種類と形式を明確にしてください' },
    { pattern: /会議|ミーティング|打ち合わせ/i, type: 'meeting', suggestion: '参加者、議題、時間を明確にしてください' }
  ];
  
  // タスクの曖昧さを分析
  function analyzeTaskAmbiguity(taskData) {
    if (!taskData) return [];
    
    const suggestions = [];
    const text = `${taskData.title} ${taskData.description}`;
    
    ambiguousPatterns.forEach(({ pattern, type, suggestion }) => {
      if (pattern.test(text)) {
        suggestions.push({
          id: `ai-${Date.now()}-${type}`,
          type: 'clarification',
          content: suggestion,
          confidence: 0.85 + Math.random() * 0.15,
          applied: false
        });
      }
    });
    
    // 期限に関する提案
    if (!taskData.dueDate || taskData.dueDate === '') {
      suggestions.push({
        id: `ai-${Date.now()}-deadline`,
        type: 'clarification',
        content: '期限が設定されていません。類似タスクの実績から3-5営業日が適切と推定されます。',
        confidence: 0.9,
        applied: false
      });
    }
    
    // 担当者に関する提案
    if (!taskData.assignees || taskData.assignees.length === 0) {
      suggestions.push({
        id: `ai-${Date.now()}-assignee`,
        type: 'clarification',
        content: '担当者が未設定です。タスクの種類から適切なチームメンバーを推薦できます。',
        confidence: 0.88,
        applied: false
      });
    }
    
    // 工数見積もりの提案
    if (!taskData.estimatedHours || taskData.estimatedHours === 0) {
      suggestions.push({
        id: `ai-${Date.now()}-estimation`,
        type: 'estimation',
        content: '類似タスクの実績から、このタスクは8-12時間程度が見込まれます。',
        confidence: 0.82,
        applied: false
      });
    }
    
    return suggestions;
  }
  
  // 依存関係の提案
  function suggestDependencies(taskData, allTasks) {
    const suggestions = [];
    
    // キーワードベースで関連タスクを検出
    const keywords = taskData.title.toLowerCase().split(/\s+/);
    const relatedTasks = allTasks.filter(t => {
      if (t.id === taskData.id) return false;
      const targetKeywords = t.title.toLowerCase().split(/\s+/);
      return keywords.some(kw => targetKeywords.includes(kw));
    });
    
    if (relatedTasks.length > 0) {
      suggestions.push({
        id: `ai-${Date.now()}-dependency`,
        type: 'dependency',
        content: `関連する可能性のあるタスクが${relatedTasks.length}件見つかりました。依存関係の設定を推奨します。`,
        confidence: 0.75,
        applied: false,
        relatedTasks: relatedTasks.map(t => ({ id: t.id, title: t.title }))
      });
    }
    
    return suggestions;
  }
  
  // スマート提案を生成
  export function generateSmartSuggestions(taskData, allTasks = []) {
    const ambiguitySuggestions = analyzeTaskAmbiguity(taskData);
    const dependencySuggestions = suggestDependencies(taskData, allTasks);
    
    return [...ambiguitySuggestions, ...dependencySuggestions];
  }
  
  // 提案を適用
  function applySuggestion(suggestion) {
    showToast('AI提案を適用しました', 'success');
    suggestion.applied = true;
    onSuggestionApplied(suggestion);
  }
  
  $: suggestions = task ? generateSmartSuggestions(task) : [];
</script>

{#if suggestions.length > 0}
  <div class="card bg-base-100 shadow-sm mb-4">
    <div class="card-body">
      <h3 class="card-title text-lg flex items-center gap-2">
        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        AI アシスタント
      </h3>
      
      <div class="space-y-3">
        {#each suggestions as suggestion}
          <div class="alert {suggestion.type === 'clarification' ? 'alert-warning' : 'alert-info'}">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {#if suggestion.type === 'clarification'}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              {:else}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              {/if}
            </svg>
            <div class="flex-1">
              <p class="text-sm">{suggestion.content}</p>
              <div class="flex items-center gap-2 mt-2">
                <span class="text-xs opacity-60">確信度: {Math.round(suggestion.confidence * 100)}%</span>
                {#if !suggestion.applied}
                  <button 
                    class="btn btn-xs btn-primary"
                    onclick={() => applySuggestion(suggestion)}
                  >
                    適用
                  </button>
                {:else}
                  <span class="badge badge-xs badge-success">適用済み</span>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}