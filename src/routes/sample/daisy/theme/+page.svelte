<!-- src/routes/theme-settings/+page.svelte -->
<script>
	import { theme, availableThemes, themeColors, setTheme, getThemeDisplayName, getCurrentThemeInfo } from '$lib/stores/theme.js';
	import { onMount } from 'svelte';
	
	// 現在のテーマ
	$: currentTheme = $theme;
	$: themeInfo = getCurrentThemeInfo();
	
	// 検索フィルター
	let searchTerm = '';
	
	// カテゴリフィルター
	let selectedCategory = 'all';
	const themeCategories = {
		light: ['light', 'cupcake', 'emerald', 'corporate', 'garden', 'lofi', 'pastel', 'fantasy', 'wireframe', 'luxury', 'cmyk', 'autumn', 'business', 'winter'],
		dark: ['dark', 'synthwave', 'halloween', 'forest', 'black', 'dracula', 'night', 'coffee', 'dim', 'abyss'],
		colorful: ['bumblebee', 'retro', 'cyberpunk', 'valentine', 'aqua', 'acid', 'lemonade', 'sunset', 'caramellatte', 'silk'],
		minimal: ['wireframe', 'black', 'luxury', 'nord']
	};
	
	// フィルタリングされたテーマ
	$: filteredThemes = availableThemes.filter(themeName => {
		const matchesSearch = themeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			getThemeDisplayName(themeName).toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesCategory = selectedCategory === 'all' || 
			// @ts-ignore
			themeCategories[selectedCategory]?.includes(themeName);
		
		return matchesSearch && matchesCategory;
	});
	
	// テーマプレビュー関数
	function previewTheme(themeName) {
		setTheme(themeName);
	}
	
	// お気に入りテーマの管理
	let favoriteThemes = [];
	
	onMount(() => {
		try {
			const saved = localStorage.getItem('favorite-themes');
			if (saved) {
				favoriteThemes = JSON.parse(saved);
			}
		} catch (e) {
			console.warn('Failed to load favorite themes:', e);
		}
	});
	
	function toggleFavorite(themeName) {
		if (favoriteThemes.includes(themeName)) {
			favoriteThemes = favoriteThemes.filter(name => name !== themeName);
		} else {
			favoriteThemes = [...favoriteThemes, themeName];
		}
		
		try {
			localStorage.setItem('favorite-themes', JSON.stringify(favoriteThemes));
		} catch (e) {
			console.warn('Failed to save favorite themes:', e);
		}
	}
	
	// ランダムテーマ選択
	function selectRandomTheme() {
		const randomIndex = Math.floor(Math.random() * availableThemes.length);
		const randomTheme = availableThemes[randomIndex];
		setTheme(randomTheme);
	}
	
	// テーマエクスポート/インポート
	function exportSettings() {
		const settings = {
			currentTheme: currentTheme,
			favoriteThemes: favoriteThemes,
			exportDate: new Date().toISOString()
		};
		
		const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'theme-settings.json';
		a.click();
		URL.revokeObjectURL(url);
	}
	
	function importSettings(event) {
		const file = event.target.files[0];
		if (!file) return;
		
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const settings = JSON.parse(e.target.result);
				if (settings.currentTheme && availableThemes.includes(settings.currentTheme)) {
					setTheme(settings.currentTheme);
				}
				if (Array.isArray(settings.favoriteThemes)) {
					favoriteThemes = settings.favoriteThemes.filter(name => availableThemes.includes(name));
					localStorage.setItem('favorite-themes', JSON.stringify(favoriteThemes));
				}
			} catch (e) {
				alert('設定ファイルの形式が正しくありません。');
			}
		};
		reader.readAsText(file);
	}
</script>

<svelte:head>
	<title>テーマ設定</title>
	<meta name="description" content="DaisyUI テーマの選択と設定" />
</svelte:head>

<div class="container mx-auto px-4 py-8 space-y-8">
	<!-- ヘッダー -->
	<div class="text-center">
		<h1 class="text-4xl font-bold mb-4">🎨 テーマ設定</h1>
		<p class="text-lg text-base-content/70 mb-6">
			お好みのテーマを選択してサイトの外観をカスタマイズできます
		</p>
		
		<!-- 現在のテーマ情報 -->
		<div class="card bg-base-200 shadow-lg max-w-md mx-auto">
			<div class="card-body text-center">
				<h2 class="card-title justify-center">現在のテーマ</h2>
				<div class="flex justify-center items-center gap-3 my-4">
					<!-- カラーパレット -->
					<div class="flex gap-1">
						{#each Object.values(themeInfo.colors) as color}
							<div 
								class="w-6 h-6 rounded-full border-2 border-base-content/20"
								style="background: {color}"
							></div>
						{/each}
					</div>
					<div>
						<div class="font-bold text-lg">{themeInfo.displayName}</div>
						<div class="text-sm opacity-70">{themeInfo.name}</div>
					</div>
				</div>
				<div class="badge {themeInfo.isDark ? 'badge-neutral' : 'badge-primary'}">
					{themeInfo.isDark ? 'ダークテーマ' : 'ライトテーマ'}
				</div>
			</div>
		</div>
	</div>

	<!-- コントロール -->
	<div class="card bg-base-200 shadow-lg">
		<div class="card-body">
			<div class="flex flex-col lg:flex-row gap-4 items-center">
				<!-- 検索 -->
				<div class="form-control flex-1">
					<label class="label">
						<span class="label-text">テーマを検索</span>
					</label>
					<input 
						type="text" 
						placeholder="テーマ名で検索..." 
						class="input input-bordered w-full"
						bind:value={searchTerm}
					/>
				</div>
				
				<!-- カテゴリフィルター -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">カテゴリ</span>
					</label>
					<select class="select select-bordered" bind:value={selectedCategory}>
						<option value="all">すべて</option>
						<option value="light">ライト系</option>
						<option value="dark">ダーク系</option>
						<option value="colorful">カラフル系</option>
						<option value="minimal">ミニマル系</option>
					</select>
				</div>
				
				<!-- アクションボタン -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">アクション</span>
					</label>
					<div class="flex gap-2">
						<button class="btn btn-secondary btn-sm" on:click={selectRandomTheme}>
							🎲 ランダム
						</button>
						<div class="dropdown dropdown-end">
							<div tabindex="0" role="button" class="btn btn-neutral btn-sm">
								⚙️ 設定
							</div>
							<ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
								<li><button on:click={exportSettings}>エクスポート</button></li>
								<li>
									<label>
										インポート
										<input 
											type="file" 
											accept=".json" 
											class="hidden"
											on:change={importSettings}
										/>
									</label>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- お気に入りテーマ -->
	{#if favoriteThemes.length > 0}
		<div class="card bg-base-200 shadow-lg">
			<div class="card-body">
				<h2 class="card-title">⭐ お気に入りテーマ</h2>
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
					{#each favoriteThemes as themeName}
						<button
							class="btn btn-outline btn-sm h-auto min-h-[4rem] flex-col p-3"
							class:btn-primary={currentTheme === themeName}
							on:click={() => previewTheme(themeName)}
						>
							<div class="text-xs font-medium mb-1">{getThemeDisplayName(themeName)}</div>
							<div class="flex gap-1">
								{#each Object.values(themeColors[themeName] || themeColors.light).slice(0, 3) as color}
									<div 
										class="w-3 h-3 rounded-full border border-base-content/20"
										style="background: {color}"
									></div>
								{/each}
							</div>
							{#if currentTheme === themeName}
								<div class="text-xs opacity-70 mt-1">適用中</div>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- テーマ一覧 -->
	<div class="card bg-base-200 shadow-lg">
		<div class="card-body">
			<div class="flex justify-between items-center mb-4">
				<h2 class="card-title">
					🎨 テーマ一覧 
					<div class="badge badge-neutral">{filteredThemes.length}個</div>
				</h2>
			</div>
			
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
				{#each filteredThemes as themeName}
					<div class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
						<div class="card-body p-4">
							<!-- テーマ名 -->
							<div class="flex justify-between items-start mb-3">
								<div>
									<h3 class="font-bold text-sm">{getThemeDisplayName(themeName)}</h3>
									<p class="text-xs opacity-70">{themeName}</p>
								</div>
								<button 
									class="btn btn-ghost btn-xs"
									class:text-warning={favoriteThemes.includes(themeName)}
									on:click|stopPropagation={() => toggleFavorite(themeName)}
								>
									{favoriteThemes.includes(themeName) ? '⭐' : '☆'}
								</button>
							</div>
							
							<!-- カラーパレット -->
							<div class="grid grid-cols-4 gap-1 mb-3">
								{#each Object.values(themeColors[themeName] || themeColors.light) as color}
									<div 
										class="w-full aspect-square rounded border border-base-content/20"
										style="background: {color}"
										title={color}
									></div>
								{/each}
							</div>
							
							<!-- プレビューサンプル -->
							<div class="space-y-2 mb-3" data-theme={themeName}>
								<div class="flex gap-1">
									<div class="btn btn-primary btn-xs">Primary</div>
									<div class="btn btn-secondary btn-xs">Secondary</div>
								</div>
								<div class="flex gap-1">
									<div class="badge badge-accent badge-sm">Accent</div>
									<div class="badge badge-neutral badge-sm">Neutral</div>
								</div>
							</div>
							
							<!-- アクションボタン -->
							<div class="card-actions justify-center">
								<button
									class="btn btn-sm w-full"
									class:btn-primary={currentTheme === themeName}
									class:btn-outline={currentTheme !== themeName}
									on:click={() => previewTheme(themeName)}
								>
									{currentTheme === themeName ? '✓ 適用中' : '適用する'}
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
			
			{#if filteredThemes.length === 0}
				<div class="text-center py-8">
					<div class="text-6xl mb-4">🔍</div>
					<h3 class="text-lg font-bold mb-2">テーマが見つかりません</h3>
					<p class="text-base-content/70">検索条件を変更してお試しください</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- テーマプレビューセクション -->
	<div class="card bg-base-200 shadow-lg">
		<div class="card-body">
			<h2 class="card-title">🖼️ コンポーネントプレビュー</h2>
			<p class="text-base-content/70 mb-6">
				現在選択中のテーマ「{themeInfo.displayName}」でのコンポーネント表示例
			</p>
			
			<!-- ボタンプレビュー -->
			<div class="mb-6">
				<h3 class="text-lg font-semibold mb-3">ボタン</h3>
				<div class="flex flex-wrap gap-2">
					<button class="btn btn-primary">Primary</button>
					<button class="btn btn-secondary">Secondary</button>
					<button class="btn btn-accent">Accent</button>
					<button class="btn btn-neutral">Neutral</button>
					<button class="btn btn-ghost">Ghost</button>
					<button class="btn btn-outline">Outline</button>
					<button class="btn btn-success">Success</button>
					<button class="btn btn-warning">Warning</button>
					<button class="btn btn-error">Error</button>
				</div>
			</div>
			
			<!-- アラートプレビュー -->
			<div class="mb-6">
				<h3 class="text-lg font-semibold mb-3">アラート</h3>
				<div class="space-y-2">
					<div class="alert alert-info">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
						<span>情報: 新しいアップデートが利用可能です。</span>
					</div>
					<div class="alert alert-success">
						<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>成功: テーマが正常に適用されました！</span>
					</div>
					<div class="alert alert-warning">
						<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
						</svg>
						<span>警告: 一部の設定が古い可能性があります。</span>
					</div>
					<div class="alert alert-error">
						<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>エラー: 接続に失敗しました。</span>
					</div>
				</div>
			</div>
			
			<!-- フォームプレビュー -->
			<div class="mb-6">
				<h3 class="text-lg font-semibold mb-3">フォーム要素</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<div class="form-control">
						<label class="label">
							<span class="label-text">テキスト入力</span>
						</label>
						<input type="text" placeholder="入力してください" class="input input-bordered" />
					</div>
					<div class="form-control">
						<label class="label">
							<span class="label-text">セレクト</span>
						</label>
						<select class="select select-bordered">
							<option disabled selected>選択してください</option>
							<option>オプション 1</option>
							<option>オプション 2</option>
							<option>オプション 3</option>
						</select>
					</div>
					<div class="form-control">
						<label class="label">
							<span class="label-text">テキストエリア</span>
						</label>
						<textarea class="textarea textarea-bordered" placeholder="メッセージを入力"></textarea>
					</div>
				</div>
				
				<!-- チェックボックスとラジオ -->
				<div class="mt-4 space-y-2">
					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-2">
							<input type="checkbox" class="checkbox checkbox-primary" />
							<span class="label-text">プライマリチェックボックス</span>
						</label>
					</div>
					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-2">
							<input type="radio" name="radio-demo" class="radio radio-secondary" checked />
							<span class="label-text">セカンダリラジオボタン</span>
						</label>
					</div>
					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-2">
							<input type="checkbox" class="toggle toggle-accent" />
							<span class="label-text">アクセントトグル</span>
						</label>
					</div>
				</div>
			</div>
			
			<!-- プログレスとレーティング -->
			<div class="mb-6">
				<h3 class="text-lg font-semibold mb-3">その他のコンポーネント</h3>
				<div class="space-y-4">
					<div>
						<div class="text-sm font-medium mb-1">プログレスバー</div>
						<progress class="progress progress-primary w-full" value="32" max="100"></progress>
						<progress class="progress progress-secondary w-full" value="70" max="100"></progress>
						<progress class="progress progress-accent w-full" value="85" max="100"></progress>
					</div>
					
					<div>
						<div class="text-sm font-medium mb-2">レーティング</div>
						<div class="rating">
							<input type="radio" name="rating-demo" class="mask mask-star-2 bg-orange-400" />
							<input type="radio" name="rating-demo" class="mask mask-star-2 bg-orange-400" checked />
							<input type="radio" name="rating-demo" class="mask mask-star-2 bg-orange-400" />
							<input type="radio" name="rating-demo" class="mask mask-star-2 bg-orange-400" />
							<input type="radio" name="rating-demo" class="mask mask-star-2 bg-orange-400" />
						</div>
					</div>
					
					<div>
						<div class="text-sm font-medium mb-2">バッジ</div>
						<div class="flex flex-wrap gap-2">
							<div class="badge badge-primary">Primary</div>
							<div class="badge badge-secondary">Secondary</div>
							<div class="badge badge-accent">Accent</div>
							<div class="badge badge-success">Success</div>
							<div class="badge badge-warning">Warning</div>
							<div class="badge badge-error">Error</div>
							<div class="badge badge-info">Info</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- 使用方法 -->
	<div class="card bg-base-200 shadow-lg">
		<div class="card-body">
			<h2 class="card-title">💡 テーマ機能について</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<h3 class="font-bold mb-2">✨ 主な機能</h3>
					<ul class="list-disc list-inside space-y-1 text-sm">
						<li>35種類のDaisyUIテーマから選択可能</li>
						<li>リアルタイムプレビュー</li>
						<li>お気に入りテーマの保存</li>
						<li>テーマ設定のエクスポート/インポート</li>
						<li>カテゴリ別フィルタリング</li>
						<li>ランダムテーマ選択</li>
					</ul>
				</div>
				<div>
					<h3 class="font-bold mb-2">🔧 技術仕様</h3>
					<ul class="list-disc list-inside space-y-1 text-sm">
						<li>Tailwind CSS v4対応</li>
						<li>DaisyUI v5使用</li>
						<li>Svelte 5 + SvelteKit</li>
						<li>ローカルストレージで設定保存</li>
						<li>システムテーマ自動検出</li>
						<li>ちらつき防止機能</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>