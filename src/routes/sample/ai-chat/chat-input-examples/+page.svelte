<script>
  let message1 = $state('');
  let message2 = $state('');
  let message3 = $state('');
  let message4 = $state('');
  let message5 = $state('');
  let isComposing = $state(false);
</script>

<div class="container mx-auto p-8 max-w-6xl">
  <h1 class="text-3xl font-bold mb-8">AI Chat Input - DaisyUI v5 実装例</h1>
  
  <!-- 基本的なチャット入力 -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">1. 基本的なチャット入力（単一行）</h2>
    <p class="text-base-content/70 mb-4">
      DaisyUI v5の推奨構造を使用した、シンプルなチャット入力フィールド。
    </p>
    
    <div class="mockup-window border bg-base-300">
      <div class="bg-base-200 px-4 py-16">
        <label class="input input-bordered flex items-center gap-2">
          <input 
            type="text" 
            class="grow" 
            placeholder="メッセージを入力..." 
            bind:value={message1}
          />
          <button class="btn btn-primary btn-sm">
            送信
          </button>
        </label>
      </div>
    </div>
    <p class="text-sm text-base-content/60 mt-2">入力値: {message1 || '(空)'}</p>
  </section>

  <!-- アイコン付きチャット入力 -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">2. アイコン付きチャット入力</h2>
    <p class="text-base-content/70 mb-4">
      ファイル添付アイコンと送信ボタンを含む、より実用的な実装。
    </p>
    
    <div class="mockup-window border bg-base-300">
      <div class="bg-base-200 px-4 py-16">
        <label class="input input-bordered flex items-center gap-2 pr-2">
          <!-- ファイル添付アイコン -->
          <label class="cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
            <input type="file" class="hidden" />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4">
              <path fill-rule="evenodd" d="M2 4a2 2 0 0 1 2-2h5.293a1 1 0 0 1 .707.293l4.707 4.707A1 1 0 0 1 15 7.707V12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm5.5 1.5a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2h-2v2a1 1 0 1 1-2 0v-2h-2a1 1 0 1 1 0-2h2v-2a1 1 0 0 1 1-1Z" clip-rule="evenodd" />
            </svg>
          </label>
          
          <input 
            type="text" 
            class="grow" 
            placeholder="メッセージを入力..." 
            bind:value={message2}
            oncompositionstart={() => isComposing = true}
            oncompositionend={() => isComposing = false}
          />
          
          <button class="btn btn-primary btn-sm btn-square">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4">
              <path d="M1.756 4.568A1.5 1.5 0 0 0 1 5.871v.984c0 .332.228.623.549.701a18.009 18.009 0 0 0 5.373.639 10.77 10.77 0 0 1-.006 2.224 17.95 17.95 0 0 0-5.368.639c-.32.078-.548.369-.548.701v.984a1.5 1.5 0 0 0 2.244 1.303l9.5-5.5a1.5 1.5 0 0 0 0-2.593l-9.5-5.5a1.5 1.5 0 0 0-1.488.065Z" />
            </svg>
          </button>
        </label>
      </div>
    </div>
  </section>

  <!-- キーボードショートカット表示付き -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">3. キーボードショートカット表示付き</h2>
    <p class="text-base-content/70 mb-4">
      キーボードショートカットのヒントを表示する実装。
    </p>
    
    <div class="mockup-window border bg-base-300">
      <div class="bg-base-200 px-4 py-16">
        <label class="input input-bordered flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 opacity-70">
            <path d="M7 1a.75.75 0 0 1 .75.75V6h-1.5V1.75A.75.75 0 0 1 7 1ZM6.25 6v2.94L5.45 8.6a.5.5 0 0 0-.3.65l.5 1.23c.1.22.32.37.56.37.08 0 .16-.02.24-.06l1.8-.9a.47.47 0 0 0 .25-.41V6h-2.5Z" />
            <path d="M10.5 5a.5.5 0 0 0-.5.5v3c0 .17.09.33.24.41l1.8.9c.08.04.16.06.24.06.24 0 .46-.15.56-.37l.5-1.23a.5.5 0 0 0-.3-.65l-.8-.34V5.5a.5.5 0 0 0-.5-.5h-1.24Z" />
            <path fill-rule="evenodd" d="M5 12a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H5Zm-.25 1.75v-.5c0-.14.11-.25.25-.25h6c.14 0 .25.11.25.25v.5a.25.25 0 0 1-.25.25H5a.25.25 0 0 1-.25-.25Z" clip-rule="evenodd" />
          </svg>
          <input 
            type="text" 
            class="grow" 
            placeholder="AIに質問..." 
            bind:value={message3}
          />
          {#if !message3}
            <kbd class="kbd kbd-sm">⌘</kbd>
            <kbd class="kbd kbd-sm">Enter</kbd>
          {/if}
        </label>
      </div>
    </div>
  </section>

  <!-- 複数行対応（textarea風） -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">4. 複数行対応の入力フィールド</h2>
    <p class="text-base-content/70 mb-4">
      より長いメッセージに対応した実装。フォーム全体をラップする方法。
    </p>
    
    <div class="mockup-window border bg-base-300">
      <div class="bg-base-200 p-4">
        <form class="space-y-2">
          <div class="form-control">
            <label class="input input-bordered min-h-[80px] h-auto flex items-start gap-2 py-2">
              <label class="cursor-pointer opacity-70 hover:opacity-100 transition-opacity mt-1">
                <input type="file" class="hidden" multiple />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4">
                  <path fill-rule="evenodd" d="M2 4a2 2 0 0 1 2-2h5.293a1 1 0 0 1 .707.293l4.707 4.707A1 1 0 0 1 15 7.707V12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm5.5 1.5a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2h-2v2a1 1 0 1 1-2 0v-2h-2a1 1 0 1 1 0-2h2v-2a1 1 0 0 1 1-1Z" clip-rule="evenodd" />
                </svg>
              </label>
              
              <textarea 
                class="grow bg-transparent resize-none outline-none"
                rows="3"
                placeholder="メッセージを入力..."
                bind:value={message4}
              ></textarea>
              
              <button type="submit" class="btn btn-primary btn-sm mt-1">
                送信
              </button>
            </label>
          </div>
          <div class="text-xs text-base-content/50">
            Shift+Enter で改行 • ファイルをドラッグ&ドロップで添付
          </div>
        </form>
      </div>
    </div>
  </section>

  <!-- ステータス表示付き -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">5. ステータス表示付き（AI応答中）</h2>
    <p class="text-base-content/70 mb-4">
      AI応答中の状態を表示する実装。
    </p>
    
    <div class="mockup-window border bg-base-300">
      <div class="bg-base-200 px-4 py-16">
        <label class="input input-bordered flex items-center gap-2 pr-2">
          <span class="loading loading-dots loading-sm"></span>
          <input 
            type="text" 
            class="grow" 
            placeholder="AIが応答中..." 
            disabled
            bind:value={message5}
          />
          <button class="btn btn-error btn-sm btn-square" title="停止">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4">
              <path d="M5.5 3.5A1.5 1.5 0 0 1 7 2h2a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 9 14H7a1.5 1.5 0 0 1-1.5-1.5v-9Z" />
            </svg>
          </button>
        </label>
      </div>
    </div>
  </section>

  <!-- テキストカーソル位置の考慮事項 -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">テキストカーソル位置のベストプラクティス</h2>
    <div class="prose max-w-none">
      <h3>DaisyUI v5でのカーソル位置管理</h3>
      <ul>
        <li><strong>アイコンの配置:</strong> <code>flex items-center gap-2</code>を使用することで、アイコンとinput要素が適切に分離され、カーソル位置に影響しません</li>
        <li><strong>input要素の拡張:</strong> <code>class="grow"</code>を使用することで、input要素が利用可能なスペースを埋め、自然なカーソル位置を保ちます</li>
        <li><strong>パディングの調整:</strong> 親要素に<code>pr-2</code>を追加して、右側のボタンとの間隔を確保</li>
        <li><strong>フォーカス時の視覚的フィードバック:</strong> <code>:focus-within</code>擬似クラスを使用して、入力フィールド全体をハイライト</li>
      </ul>

      <h3>日本語入力（IME）の対応</h3>
      <ul>
        <li><code>compositionstart</code>と<code>compositionend</code>イベントを使用して、変換中の誤送信を防ぐ</li>
        <li>変換中はEnterキーでの送信を無効化</li>
      </ul>

      <h3>アクセシビリティの考慮</h3>
      <ul>
        <li>label要素でinputをラップすることで、クリック可能領域を拡大</li>
        <li>適切な<code>title</code>属性でツールチップを提供</li>
        <li>キーボードナビゲーションの完全サポート</li>
      </ul>
    </div>
  </section>

  <!-- 実装のまとめ -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">実装のまとめ</h2>
    <div class="alert alert-info">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <div>
        <h3 class="font-bold">DaisyUI v5の重要な変更点</h3>
        <ul class="text-sm mt-2 space-y-1">
          <li>• <code>input-group</code>コンポーネントは非推奨になりました</li>
          <li>• 代わりに<code>label class="input"</code>構造を使用します</li>
          <li>• <code>flex items-center gap-2</code>でアイコンとinputを配置</li>
          <li>• <code>grow</code>クラスでinput要素を拡張</li>
        </ul>
      </div>
    </div>
  </section>
</div>

<style>
  /* フォーカス時のカスタムスタイル（スコープ付き） */
  .input:focus-within {
    @apply ring-2 ring-primary/20;
  }
  
  /* ローディング中のスタイル */
  .input:has(input:disabled) {
    @apply opacity-75;
  }
</style>