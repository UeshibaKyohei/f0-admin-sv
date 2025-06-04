<script>
  import { onMount } from 'svelte';
  
  let dots = $state('');
  let thinkingText = $state('考えています');
  
  const thinkingTexts = [
    '考えています',
    '分析中',
    '情報を収集中',
    '回答を生成中',
    '最適な回答を検討中'
  ];
  
  let textIndex = 0;
  
  onMount(() => {
    // ドットアニメーション
    const dotInterval = setInterval(() => {
      dots = dots.length < 3 ? dots + '.' : '';
    }, 500);
    
    // テキストローテーション
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % thinkingTexts.length;
      thinkingText = thinkingTexts[textIndex];
    }, 2000);
    
    return () => {
      clearInterval(dotInterval);
      clearInterval(textInterval);
    };
  });
</script>

<div class="flex gap-3">
  <div class="avatar avatar-placeholder">
    <div class="w-10 h-10 rounded-full bg-primary text-primary-content">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    </div>
  </div>
  
  <div class="flex flex-col max-w-[70%]">
    <div class="rounded-lg px-4 py-3 bg-base-200">
      <div class="flex items-center gap-3">
        <!-- タイピングインジケーター -->
        <div class="flex gap-1">
          <div class="w-2 h-2 bg-base-content/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div class="w-2 h-2 bg-base-content/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div class="w-2 h-2 bg-base-content/40 rounded-full animate-bounce"></div>
        </div>
        
        <!-- ステータステキスト -->
        <span class="text-sm text-base-content/60">
          {thinkingText}{dots}
        </span>
      </div>
      
      <!-- プログレスバー（オプション） -->
      <div class="mt-2 w-48">
        <progress class="progress progress-primary h-1"></progress>
      </div>
    </div>
    
    <div class="text-xs text-base-content/50 mt-1 px-1">
      AIが応答を準備中...
    </div>
  </div>
</div>

<style>
  @keyframes bounce {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-10px);
    }
  }
</style>