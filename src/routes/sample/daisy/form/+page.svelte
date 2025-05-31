<script>
	import { onMount } from 'svelte';
	import InputExamples from './InputExamples.svelte';
	import TextareaExamples from './TextareaExamples.svelte';
	import LabelExamples from './LabelExamples.svelte';
	import CheckboxExamples from './CheckboxExamples.svelte';
	import RadioExamples from './RadioExamples.svelte';
	import SelectExamples from './SelectExamples.svelte';
	import RangeExamples from './RangeExamples.svelte';
	import ToggleExamples from './ToggleExamples.svelte';
	import FileInputExamples from './FileInputExamples.svelte';
	import ValidatorExamples from './ValidatorExamples.svelte';
	import RatingExamples from './RatingExamples.svelte';
	
	let activeSection = $state('input');
	
	const components = [
		{ id: 'input', name: 'Input', description: 'Text input fields' },
		{ id: 'textarea', name: 'Textarea', description: 'Multi-line text input' },
		{ id: 'checkbox', name: 'Checkbox', description: 'Checkboxes for selection' },
		{ id: 'radio', name: 'Radio', description: 'Radio buttons for single choice' },
		{ id: 'select', name: 'Select', description: 'Dropdown selection' },
		{ id: 'range', name: 'Range', description: 'Range sliders' },
		{ id: 'toggle', name: 'Toggle', description: 'Switch toggles' },
		{ id: 'file-input', name: 'File Input', description: 'File upload inputs' },
		{ id: 'rating', name: 'Rating', description: 'Star rating inputs' },
		{ id: 'label', name: 'Label', description: 'Form labels' },
    { id: 'validator', name: 'Validator', description: 'Form validation' },
	];
	
	function scrollToSection(sectionId) {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
			activeSection = sectionId;
		}
	}
	
	let observer;
	let scrollTimeout;
	
	// シンプルなスクロール位置による判定
	function updateActiveSectionByScroll() {
		const sections = components.map(component => {
			const element = document.getElementById(component.id);
			if (!element) return null;
			
			const rect = element.getBoundingClientRect();
			// セクションの上端が画面上部から200px以内にある場合をアクティブとする
			const distanceFromTop = rect.top;
			
			return {
				id: component.id,
				distanceFromTop: distanceFromTop,
				isInView: distanceFromTop <= 200 && rect.bottom > 0
			};
		}).filter(Boolean);
		
		if (sections.length === 0) return;
		
		// 画面内にあって最も上部に近いセクションを選択
		const activeElements = sections.filter(s => s.isInView);
		if (activeElements.length > 0) {
			const closest = activeElements.reduce((best, current) => 
				Math.abs(current.distanceFromTop) < Math.abs(best.distanceFromTop) ? current : best
			);
			
			if (closest.id !== activeSection) {
				activeSection = closest.id;
			}
		}
	}
	
	function handleScroll() {
		clearTimeout(scrollTimeout);
		scrollTimeout = setTimeout(updateActiveSectionByScroll, 150);
	}
	
	onMount(() => {
		// シンプルなスクロールベースの追従のみ使用
		// Intersection Observerは複雑すぎるので削除
		
		// スクロールイベントリスナー
		window.addEventListener('scroll', handleScroll, { passive: true });
		
		// 初期状態のチェック
		setTimeout(updateActiveSectionByScroll, 300);
		
		return () => {
			window.removeEventListener('scroll', handleScroll);
			clearTimeout(scrollTimeout);
		};
	});
</script>

<div class="min-h-screen bg-base-200">
	<!-- Header -->
	<header class="navbar bg-base-100 shadow-sm border-b">
		<div class="navbar-start">
			<h1 class="text-xl font-bold text-primary">DaisyUI Form Components</h1>
		</div>
		<div class="navbar-center">
			<div class="badge badge-secondary">Cheat Sheet</div>
		</div>
		<div class="navbar-end">
			<div class="text-sm text-base-content/70">
				Svelte 5 + DaisyUI v5.0.37+
			</div>
		</div>
	</header>

	<div class="drawer lg:drawer-open">
		<input id="drawer-toggle" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content">
			<!-- Mobile menu button -->
			<div class="navbar lg:hidden bg-base-100">
				<div class="navbar-start">
					<label for="drawer-toggle" class="btn btn-square btn-ghost">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
						</svg>
					</label>
				</div>
				<div class="navbar-center">
					<span class="font-semibold">Form Components</span>
				</div>
			</div>

			<!-- Main content -->
			<main class="p-6 lg:p-8 max-w-6xl mx-auto">
				<!-- Introduction -->
				<div class="hero bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg mb-8">
					<div class="hero-content text-center">
						<div class="max-w-md">
							<h1 class="text-3xl font-bold mb-4">Form Components Cheat Sheet</h1>
							<p class="text-base-content/80 mb-6">
								Complete collection of DaisyUI v5 Data Input components with Svelte 5 examples. 
								Copy and paste ready code snippets for your next project.
							</p>
							<div class="stats shadow bg-base-100">
								<div class="stat">
									<div class="stat-title">Components</div>
									<div class="stat-value text-primary">{components.length}</div>
								</div>
								<div class="stat">
									<div class="stat-title">Examples</div>
									<div class="stat-value text-secondary">40+</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Quick Navigation -->
				<div class="mb-8">
					<h2 class="text-2xl font-bold mb-4">Quick Navigation</h2>
					<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
						{#each components as component}
							<button 
								class="btn btn-outline btn-sm"
								class:btn-primary={activeSection === component.id}
								onclick={() => scrollToSection(component.id)}
							>
								{component.name}
							</button>
						{/each}
					</div>
				</div>

				<!-- Component Sections -->
				{#each components as component}
					<section id={component.id} class="mb-12 scroll-mt-20">
						<div class="card bg-base-100 shadow-lg">
							<div class="card-body">
								<h2 class="card-title text-2xl flex items-center gap-2">
									<span class="badge badge-primary">{component.name}</span>
									<span class="text-base-content/70 text-base font-normal">
										{component.description}
									</span>
								</h2>
								
								{#if component.id === 'input'}
									<!-- Input Component Examples -->
									<InputExamples />
								{:else if component.id === 'textarea'}
									<!-- Textarea Component Examples -->
									<TextareaExamples />
								{:else if component.id === 'label'}
									<!-- Label Component Examples -->
									<LabelExamples />
								{:else if component.id === 'checkbox'}
									<!-- Checkbox Component Examples -->
									<CheckboxExamples />
								{:else if component.id === 'radio'}
									<!-- Radio Component Examples -->
									<RadioExamples />
								{:else if component.id === 'select'}
									<!-- Select Component Examples -->
									<SelectExamples />
								{:else if component.id === 'range'}
									<!-- Range Component Examples -->
									<RangeExamples />
								{:else if component.id === 'toggle'}
									<!-- Toggle Component Examples -->
									<ToggleExamples />
								{:else if component.id === 'file-input'}
									<!-- File Input Component Examples -->
									<FileInputExamples />
								{:else if component.id === 'rating'}
									<!-- Rating Component Examples -->
									<RatingExamples />
								{:else if component.id === 'validator'}
									<!-- Validator Component Examples -->
									<ValidatorExamples />
								{:else}
									<!-- Placeholder for remaining components -->
									<div class="alert alert-info">
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
										</svg>
										<span>
											{component.name} component examples will be implemented in the next phase.
											This includes various sizes, states, and practical use cases.
										</span>
									</div>
								{/if}
							</div>
						</div>
					</section>
				{/each}

				
			</main>
		</div>

		<!-- Sidebar -->
		<div class="drawer-side">
			<label for="drawer-toggle" aria-label="close sidebar" class="drawer-overlay"></label>
			<aside class="min-h-full w-80 bg-base-100 border-r">
				<div class="p-4">
					<h2 class="text-lg font-bold mb-4 flex items-center gap-2">
						<span class="badge badge-ghost">TOC</span>
						Table of Contents
					</h2>
					
					<ul class="menu menu-lg w-full">
						{#each components as component}
							<li>
								<button 
									class="flex justify-between items-center"
									class:active={activeSection === component.id}
									onclick={() => scrollToSection(component.id)}
								>
									<div>
										<div class="font-medium">{component.name}</div>
										<div class="text-xs text-base-content/60">{component.description}</div>
									</div>
									{#if activeSection === component.id}
										<div class="badge badge-primary badge-xs"></div>
									{/if}
								</button>
							</li>
						{/each}
					</ul>
					
					<div class="divider"></div>
					
					<!-- Sidebar footer -->
					<div class="text-center">
						<div class="text-xs text-base-content/60 mb-2">
							Built with
						</div>
						<div class="flex justify-center gap-2">
							<div class="badge badge-outline badge-xs">Svelte 5</div>
							<div class="badge badge-outline badge-xs">DaisyUI v5</div>
							<div class="badge badge-outline badge-xs">Tailwind v4</div>
						</div>
						<div class="mt-4 text-xs text-base-content/50">
							<div>📁 Modular Components</div>
							<div>🔧 500-line limit enforced</div>
							<!-- デバッグ用：現在のアクティブセクション表示（必要に応じて削除）-->
							<div class="mt-2 text-xs opacity-60">
								Active: {activeSection}
							</div>
						</div>
					</div>
				</div>
			</aside>
		</div>
	</div>
</div>

<style>
	.scroll-mt-20 {
		scroll-margin-top: 5rem;
	}
</style>