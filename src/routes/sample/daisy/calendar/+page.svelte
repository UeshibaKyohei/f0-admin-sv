<script>
	import BasicImplementations from './BasicImplementations.svelte';
	import PositionAdjustment from './PositionAdjustment.svelte';
	import FormIntegrations from './FormIntegrations.svelte';
	import DateRangeSelections from './DateRangeSelections.svelte';
	import CustomizationExamples from './CustomizationExamples.svelte';
	import PracticaluseCases from './PracticaluseCases.svelte';

	import { onMount } from 'svelte';

	let activeSection = 'basic';
	let sections = [
		{ id: 'basic', name: '基本的な実装例', icon: '📅' },
		{ id: 'position', name: '位置調整', icon: '📍' },
		{ id: 'form', name: 'フォーム統合', icon: '📝' },
		{ id: 'range', name: '日付範囲選択', icon: '📆' },
		{ id: 'custom', name: 'カスタマイズ例', icon: '🎨' },
		{ id: 'usecase', name: '実用的なユースケース', icon: '💼' }
	];

	let copySuccess = {};

	function copyToClipboard(code, id) {
		navigator.clipboard.writeText(code).then(() => {
			copySuccess[id] = true;
			setTimeout(() => {
				copySuccess[id] = false;
			}, 2000);
		});
	}

	onMount(() => {
		// スムーズスクロール対応
		const handleHashChange = () => {
			const hash = window.location.hash.slice(1);
			if (hash && sections.find((s) => s.id === hash)) {
				activeSection = hash;
			}
		};

		handleHashChange();
		window.addEventListener('hashchange', handleHashChange);

		return () => {
			window.removeEventListener('hashchange', handleHashChange);
		};
	});
</script>

<div class="bg-base-300 min-h-screen">
	<!-- ヘッダー -->
	<div class="bg-base-100 sticky top-0 z-50 shadow-lg">
		<div class="container mx-auto px-4 py-6">
			<h1 class="text-primary text-4xl font-bold">DaisyUI Calendar チートシート</h1>
			<p class="text-base-content/70 mt-2">コピペで使えるカレンダー・デートピッカーの実装例集</p>
		</div>

		<!-- ナビゲーション -->
		<div class="border-base-300 border-t">
			<div class="container mx-auto px-4">
				<div class="scrollbar-thin flex gap-2 overflow-x-auto py-2">
					{#each sections as section}
						<a
							href="#{section.id}"
							class="btn btn-sm {activeSection === section.id
								? 'btn-primary'
								: 'btn-ghost'} whitespace-nowrap"
							on:click={() => (activeSection = section.id)}
						>
							<span class="mr-1 text-lg">{section.icon}</span>
							{section.name}
						</a>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- メインコンテンツ -->
	<div class="container mx-auto px-4 py-8">
		<div class="grid gap-6 lg:grid-cols-4">
			<!-- サイドバー -->
			<aside class="lg:col-span-1">
				<div class="sticky top-32 space-y-4">
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h2 class="card-title text-lg">クイックナビ</h2>
							<ul class="menu menu-sm">
								{#each sections as section}
									<li>
										<a
											href="#{section.id}"
											class={activeSection === section.id ? 'active' : ''}
											on:click={() => (activeSection = section.id)}
										>
											<span class="text-lg">{section.icon}</span>
											{section.name}
										</a>
									</li>
								{/each}
							</ul>
						</div>
					</div>

					<div class="card bg-primary/10 border-primary/20 border-2">
						<div class="card-body">
							<h3 class="text-primary font-bold">💡 使い方のヒント</h3>
							<p class="text-sm">
								各サンプルの右上にある「コピー」ボタンをクリックすると、
								コードをクリップボードにコピーできます。
							</p>
						</div>
					</div>
				</div>
			</aside>

			<!-- コンテンツエリア -->
			<main class="lg:col-span-3">
				<div class="space-y-8">
					{#if activeSection === 'basic'}
						<BasicImplementations {copyToClipboard} {copySuccess} />
					{:else if activeSection === 'position'}
						<PositionAdjustment {copyToClipboard} {copySuccess} />
					{:else if activeSection === 'form'}
						<FormIntegrations {copyToClipboard} {copySuccess} />
					{:else if activeSection === 'range'}
						<DateRangeSelections {copyToClipboard} {copySuccess} />
					{:else if activeSection === 'custom'}
						<CustomizationExamples {copyToClipboard} {copySuccess} />
					{:else if activeSection === 'usecase'}
						<PracticaluseCases {copyToClipboard} {copySuccess} />
					{/if}
				</div>
			</main>
		</div>
	</div>
</div>

<style>
	/* カスタムスクロールバー */
	.scrollbar-thin {
		scrollbar-width: thin;
		scrollbar-color: oklch(var(--bc) / 0.2) transparent;
	}

	.scrollbar-thin::-webkit-scrollbar {
		height: 8px;
	}

	.scrollbar-thin::-webkit-scrollbar-track {
		background: transparent;
	}

	.scrollbar-thin::-webkit-scrollbar-thumb {
		background-color: oklch(var(--bc) / 0.2);
		border-radius: 4px;
	}

	.scrollbar-thin::-webkit-scrollbar-thumb:hover {
		background-color: oklch(var(--bc) / 0.3);
	}
</style>
