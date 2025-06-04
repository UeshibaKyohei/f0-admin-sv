<script>
  let { suggestions = [], onSelect } = $props();
</script>

{#if suggestions && suggestions.length > 0}
  <div class="mt-6 p-6 bg-gradient-to-br from-base-200 to-base-300 rounded-2xl border border-base-300">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-2 h-2 bg-success rounded-full animate-pulse"></div>
      <h3 class="text-lg font-bold">AIからの提案</h3>
    </div>
    
    <p class="text-base-content/80 mb-4">
      より詳細な情報をお求めですか？以下の選択肢からお選びください：
    </p>
    
    <div class="grid grid-cols-1 gap-3">
      {#each suggestions as suggestion, index}
        <button 
          class="group relative overflow-hidden text-left p-4 bg-base-100 hover:bg-base-200 rounded-xl border border-base-300 hover:border-primary transition-all duration-300 hover:shadow-lg"
          onclick={() => onSelect(suggestion)}
        >
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
              {index + 1}
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-base-content mb-1 group-hover:text-primary transition-colors">
                {suggestion.text}
              </h4>
              <p class="text-sm text-base-content/60 line-clamp-2">
                {suggestion.prompt}
              </p>
            </div>
            <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-primary">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>
          
          <!-- ホバー時の背景エフェクト -->
          <div class="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        </button>
      {/each}
    </div>
    
    <div class="mt-4 text-xs text-base-content/50 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
      <span>選択肢をクリックすると入力欄に反映されます</span>
    </div>
  </div>
{/if}