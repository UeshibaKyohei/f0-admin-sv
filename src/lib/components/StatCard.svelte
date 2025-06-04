<script lang="ts">
	// 統計カードコンポーネント
	export let title = '';
	export let value = '';
	export let change = '';
	export let trend = 'up';
	export let iconType = '';
</script>

<div class="card bg-base-100 shadow-sm transition-shadow hover:shadow-md">
	<div class="card-body p-4">
		<div class="flex items-start justify-between">
			<div>
				<h2 class="mb-1 text-base">{title}</h2>
				<p class="text-2xl font-bold">{value}</p>
			</div>
			{#if iconType}
				<div
					class="text-primary rounded-full p-2"
					style="background-color: color-mix(in srgb, var(--primary) 10%, transparent);"
				>
					{#if iconType === 'users'}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
					{:else if iconType === 'chart-line'}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
							/>
						</svg>
					{:else if iconType === 'shopping-cart'}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
					{:else if iconType === 'arrow-turn-down'}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M16 17l-4 4m0 0l-4-4m4 4V3"
							/>
						</svg>
					{/if}
				</div>
			{/if}
		</div>
		<div class="mt-2">
			<span class={`text-sm ${trend === 'up' ? 'text-success' : 'text-error'}`}>
				{change}
				{#if trend === 'up'}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="inline h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 10l7-7m0 0l7 7m-7-7v18"
						/>
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="inline h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 14l-7 7m0 0l-7-7m7 7V3"
						/>
					</svg>
				{/if}
				<span class="text-base-content/60 ml-1">先月比</span>
			</span>
		</div>
	</div>
</div>
