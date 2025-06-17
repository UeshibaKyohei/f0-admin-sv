<script lang="ts">
	import '../app.css';
	import IntegratedHeader from './IntegratedHeader.svelte';
	import CompactNav from './CompactNav.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import {
		theme,
		availableThemes,
		themeColors,
		setTheme,
		getThemeDisplayName,
		getCurrentThemeInfo
	} from '$lib/stores/theme.js';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let { children } = $props();
	let navExpanded = $state(false);
	let showCommandPalette = $state(false);

	// キーボードショートカット
	$effect(() => {
		if (browser) {
			const handleKeydown = (e: KeyboardEvent) => {
				if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
					e.preventDefault();
					showCommandPalette = true;
				}
				if (e.key === 'Escape') {
					showCommandPalette = false;
				}
			};
			document.addEventListener('keydown', handleKeydown);
			return () => document.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

<div class="min-h-screen bg-base-200 flex overflow-hidden">
	<!-- コンパクトナビゲーション -->
	<CompactNav bind:expanded={navExpanded} />

	<!-- メインエリア -->
	<div class="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
		<!-- 統合ヘッダー (固定) -->
		<IntegratedHeader bind:showCommandPalette />

		<!-- コンテンツ (スクロール可能) -->
		<main class="flex-1 overflow-y-auto">
			<div class="p-4 lg:p-6">
				<div class="max-w-[1400px] mx-auto">
					{@render children()}
				</div>
			</div>
		</main>
	</div>
</div>

<!-- コマンドパレット -->
{#if showCommandPalette}
	<div class="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
		<div
			class="fixed inset-0 bg-black/50"
			onclick={() => (showCommandPalette = false)}
			role="button"
			tabindex="0"
			onkeypress={(e) => e.key === 'Enter' && (showCommandPalette = false)}
		></div>
		<div class="relative w-full max-w-2xl bg-base-100 rounded-xl shadow-2xl overflow-hidden">
			<div class="p-4 border-b border-base-200">
				<div class="relative">
					<svg
						class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/50"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
					<input
						type="text"
						placeholder="コマンドを入力..."
						class="input input-lg w-full pl-12 pr-4"
						autofocus
					/>
				</div>
			</div>
			<div class="max-h-96 overflow-y-auto p-2">
				<div class="text-xs font-semibold text-base-content/50 px-3 py-2">最近使用</div>
				<button class="w-full text-left px-3 py-2 rounded-lg hover:bg-base-200 flex items-center gap-3">
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
					</svg>
					<div class="flex-1">
						<div class="font-medium">顧客管理</div>
						<div class="text-xs text-base-content/60">顧客情報の管理画面を開く</div>
					</div>
					<kbd class="kbd kbd-sm">⌘1</kbd>
				</button>
				<button class="w-full text-left px-3 py-2 rounded-lg hover:bg-base-200 flex items-center gap-3">
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
					</svg>
					<div class="flex-1">
						<div class="font-medium">売上レポート</div>
						<div class="text-xs text-base-content/60">月次売上レポートを生成</div>
					</div>
					<kbd class="kbd kbd-sm">⌘2</kbd>
				</button>
			</div>
		</div>
	</div>
{/if}


<style>
	:global(body) {
		font-size: 14px;
	}

	:global(::-webkit-scrollbar) {
		width: 6px;
		height: 6px;
	}

	:global(::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(::-webkit-scrollbar-thumb) {
		background: oklch(var(--bc) / 0.2);
		border-radius: 3px;
	}

	:global(::-webkit-scrollbar-thumb:hover) {
		background: oklch(var(--bc) / 0.3);
	}
</style>