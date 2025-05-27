
    <div class="container mx-auto max-w-4xl">
        <h1 class="text-3xl font-bold mb-8 text-center">DaisyUI 5 アバターイニシャル表示</h1>
        
        <!-- 基本的なイニシャル表示 -->
        <section class="mb-8">
            <h2 class="text-xl font-semibold mb-4">基本的なイニシャル表示</h2>
            <div class="flex gap-4 items-center">
                <!-- 1文字のイニシャル -->
                <div class="avatar avatar-placeholder">
                    <div class="bg-neutral text-neutral-content w-16 rounded-full">
                        <span class="text-xl">A</span>
                    </div>
                </div>
                
                <!-- 2文字のイニシャル -->
                <div class="avatar avatar-placeholder">
                    <div class="bg-neutral text-neutral-content w-16 rounded-full">
                        <span class="text-lg">AB</span>
                    </div>
                </div>
                
                <!-- 日本語のイニシャル例 -->
                <div class="avatar avatar-placeholder">
                    <div class="bg-neutral text-neutral-content w-16 rounded-full">
                        <span class="text-lg">田中</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- 異なるサイズ -->
        <section class="mb-8">
            <h2 class="text-xl font-semibold mb-4">様々なサイズ</h2>
            <div class="flex gap-4 items-center">
                <!-- 特大 -->
                <div class="avatar avatar-placeholder">
                    <div class="bg-neutral text-neutral-content w-24 rounded-full">
                        <span class="text-3xl">L</span>
                    </div>
                </div>
                
                <!-- 大 -->
                <div class="avatar avatar-placeholder">
                    <div class="bg-neutral text-neutral-content w-16 rounded-full">
                        <span class="text-xl">M</span>
                    </div>
                </div>
                
                <!-- 中 -->
                <div class="avatar avatar-placeholder">
                    <div class="bg-neutral text-neutral-content w-12 rounded-full">
                        <span>S</span>
                    </div>
                </div>
                
                <!-- 小 -->
                <div class="avatar avatar-placeholder">
                    <div class="bg-neutral text-neutral-content w-8 rounded-full">
                        <span class="text-xs">XS</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- 色の変更 -->
        <section class="mb-8">
            <h2 class="text-xl font-semibold mb-4">カラーバリエーション</h2>
            <div class="flex gap-4 items-center flex-wrap">
                <!-- プライマリカラー -->
                <div class="avatar avatar-placeholder">
                    <div class="bg-primary text-primary-content w-16 rounded-full">
                        <span class="text-lg">PR</span>
                    </div>
                </div>
                
                <!-- セカンダリカラー -->
                <div class="avatar avatar-placeholder">
                    <div class="bg-secondary text-secondary-content w-16 rounded-full">
                        <span class="text-lg">SE</span>
                    </div>
                </div>
                
                <!-- アクセントカラー -->
                <div class="avatar avatar-placeholder">
                    <div class="bg-accent text-accent-content w-16 rounded-full">
                        <span class="text-lg">AC</span>
                    </div>
                </div>
                
                <!-- 情報カラー -->
                <div class="avatar avatar-placeholder">
                    <div class="bg-info text-info-content w-16 rounded-full">
                        <span class="text-lg">IN</span>
                    </div>
                </div>
                
                <!-- 成功カラー -->
                <div class="avatar avatar-placeholder">
                    <div class="bg-success text-success-content w-16 rounded-full">
                        <span class="text-lg">OK</span>
                    </div>
                </div>
                
                <!-- 警告カラー -->
                <div class="avatar avatar-placeholder">
                    <div class="bg-warning text-warning-content w-16 rounded-full">
                        <span class="text-lg">WA</span>
                    </div>
                </div>
                
                <!-- エラーカラー -->
                <div class="avatar avatar-placeholder">
                    <div class="bg-error text-error-content w-16 rounded-full">
                        <span class="text-lg">ER</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- オンライン状態表示 -->
        <section class="mb-8">
            <h2 class="text-xl font-semibold mb-4">オンライン状態表示</h2>
            <div class="flex gap-4 items-center">
                <!-- オンライン状態 -->
                <div class="avatar avatar-online avatar-placeholder">
                    <div class="bg-primary text-primary-content w-16 rounded-full">
                        <span class="text-lg">ON</span>
                    </div>
                </div>
                
                <!-- オフライン状態 -->
                <div class="avatar avatar-offline avatar-placeholder">
                    <div class="bg-neutral text-neutral-content w-16 rounded-full">
                        <span class="text-lg">OF</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- リング付きアバター -->
        <section class="mb-8">
            <h2 class="text-xl font-semibold mb-4">リング付きアバター</h2>
            <div class="flex gap-4 items-center">
                <div class="avatar avatar-placeholder">
                    <div class="bg-primary text-primary-content ring-primary ring-offset-base-100 w-16 rounded-full ring-2 ring-offset-2">
                        <span class="text-lg">RI</span>
                    </div>
                </div>
                
                <div class="avatar avatar-placeholder">
                    <div class="bg-secondary text-secondary-content ring-secondary ring-offset-base-100 w-16 rounded-full ring-2 ring-offset-2">
                        <span class="text-lg">NG</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- アバターグループ -->
        <section class="mb-8">
            <h2 class="text-xl font-semibold mb-4">アバターグループ</h2>
            <div class="avatar-group -space-x-6">
                <div class="avatar avatar-placeholder">
                    <div class="bg-primary text-primary-content w-12 rounded-full">
                        <span>A</span>
                    </div>
                </div>
                <div class="avatar avatar-placeholder">
                    <div class="bg-secondary text-secondary-content w-12 rounded-full">
                        <span>B</span>
                    </div>
                </div>
                <div class="avatar avatar-placeholder">
                    <div class="bg-accent text-accent-content w-12 rounded-full">
                        <span>C</span>
                    </div>
                </div>
                <div class="avatar avatar-placeholder">
                    <div class="bg-neutral text-neutral-content w-12 rounded-full">
                        <span>+9</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- 実用例：ユーザープロフィール -->
        <section class="mb-8">
            <h2 class="text-xl font-semibold mb-4">実用例：ユーザープロフィールカード</h2>
            <div class="card w-96 bg-base-100 shadow-xl">
                <div class="card-body items-center text-center">
                    <div class="avatar avatar-online avatar-placeholder mb-4">
                        <div class="bg-primary text-primary-content w-20 rounded-full">
                            <span class="text-2xl">山田</span>
                        </div>
                    </div>
                    <h2 class="card-title">山田太郎</h2>
                    <p>フロントエンド開発者</p>
                    <div class="card-actions justify-end">
                        <button class="btn btn-primary">プロフィール表示</button>
                    </div>
                </div>
            </div>
        </section>

        <!-- インジケータ付きアバター -->
        <section class="mb-8">
            <h2 class="text-xl font-semibold mb-4">インジケータ付きアバター</h2>
            <div class="flex gap-4 items-center">
                <div class="avatar avatar-placeholder indicator">
                    <span class="indicator-item badge badge-secondary">New</span>
                    <div class="bg-primary text-primary-content w-16 rounded-full">
                        <span class="text-lg">バッジ</span>
                    </div>
                </div>
                
                <div class="avatar avatar-placeholder indicator">
                    <span class="indicator-item badge badge-error">!</span>
                    <div class="bg-neutral text-neutral-content w-16 rounded-full">
                        <span class="text-lg">通知</span>
                    </div>
                </div>
            </div>
        </section>


        <!-- コード例 -->
        <section class="mb-8">
            <h2 class="text-xl font-semibold mb-4">DaisyUI 5 基本コード</h2>
            <div class="mockup-code">
                <pre data-prefix="1"><code>&lt;div class="avatar avatar-placeholder"&gt;</code></pre>
                <pre data-prefix="2"><code>  &lt;div class="bg-neutral text-neutral-content w-16 rounded-full"&gt;</code></pre>
                <pre data-prefix="3"><code>    &lt;span class="text-lg"&gt;AB&lt;/span&gt;</code></pre>
                <pre data-prefix="4"><code>  &lt;/div&gt;</code></pre>
                <pre data-prefix="5"><code>&lt;/div&gt;</code></pre>
            </div>
        </section>

        <!-- 4系から5系への変更点 -->
        <section class="mb-8">
            <h2 class="text-xl font-semibold mb-4">DaisyUI 4 → 5 の変更点</h2>
            <div class="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                    <h3 class="font-bold">主な変更点:</h3>
                    <ul class="list-disc list-inside">
                        <li>基本的な<code>avatar</code>と<code>avatar-placeholder</code>クラスは同じ</li>
                        <li>オンライン状態: <code>online</code> → <code>avatar-online</code></li>
                        <li>オフライン状態: <code>offline</code> → <code>avatar-offline</code></li>
                        <li>依存関係が0になり、軽量化された</li>
                        <li>CDNリンクが変更: daisyui@5.0.0</li>
                    </ul>
                </div>
            </div>
        </section>
    </div>
