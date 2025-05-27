<script>
	// Form state examples
	let inputValue = $state('');
	let emailValue = $state('');
	let urlValue = $state('https://');
	let searchValue = $state('');
	let pathValue = $state('src/app/');
</script>

<div class="space-y-8">
	<!-- Basic Input -->
	<div class="border rounded-lg p-6 bg-base-50">
		<h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
			<span class="badge badge-neutral badge-sm">Basic</span>
			Basic Text Input
		</h3>
		<div class="grid md:grid-cols-2 gap-6">
			<div class="space-y-4">
				<input type="text" placeholder="Type here" class="input" bind:value={inputValue} />
				<input type="email" placeholder="Email address" class="input" bind:value={emailValue} />
				<input type="password" placeholder="Password" class="input" />
				<div class="text-sm text-base-content/70">
					Value: "{inputValue}" | Email: "{emailValue}"
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code>&lt;input type="text" placeholder="Type here" class="input" bind:value={'{inputValue}'} /&gt;
&lt;input type="email" placeholder="Email" class="input" bind:value={'{emailValue}'} /&gt;
&lt;input type="password" placeholder="Password" class="input" /&gt;</code></pre>
			</div>
		</div>
	</div>

	<!-- Input Sizes -->
	<div class="border rounded-lg p-6 bg-base-50">
		<h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
			<span class="badge badge-secondary badge-sm">Sizes</span>
			Input Sizes
		</h3>
		<div class="grid md:grid-cols-2 gap-6">
			<div class="space-y-4">
				<input type="text" placeholder="Extra Small" class="input input-xs" />
				<input type="text" placeholder="Small" class="input input-sm" />
				<input type="text" placeholder="Medium (default)" class="input input-md" />
				<input type="text" placeholder="Large" class="input input-lg" />
			</div>
			<div class="mockup-code text-sm">
				<pre><code>&lt;input class="input input-xs" placeholder="Extra Small" /&gt;
&lt;input class="input input-sm" placeholder="Small" /&gt;
&lt;input class="input input-md" placeholder="Medium" /&gt;
&lt;input class="input input-lg" placeholder="Large" /&gt;</code></pre>
			</div>
		</div>
	</div>

	<!-- Input with Icons -->
	<div class="border rounded-lg p-6 bg-base-50">
		<h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
			<span class="badge badge-accent badge-sm">Icons</span>
			Input with Icons
		</h3>
		<div class="grid md:grid-cols-2 gap-6">
			<div class="space-y-4">
				<!-- Search input -->
				<label class="input">
					<svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
							<circle cx="11" cy="11" r="8"></circle>
							<path d="m21 21-4.3-4.3"></path>
						</g>
					</svg>
					<input type="search" placeholder="Search" bind:value={searchValue} />
					<kbd class="kbd kbd-sm">⌘</kbd>
					<kbd class="kbd kbd-sm">K</kbd>
				</label>
				
				<!-- URL input -->
				<label class="input">
					<svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
							<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
							<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
						</g>
					</svg>
					<input type="url" placeholder="https://" bind:value={urlValue} />
				</label>
				
				<!-- File path input -->
				<label class="input">
					<svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
							<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
							<path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
						</g>
					</svg>
					<input type="text" class="grow" placeholder="index.php" />
				</label>
			</div>
			<div class="mockup-code text-sm">
				<pre><code>&lt;label class="input"&gt;
  &lt;svg class="h-[1em] opacity-50" ...&gt;&lt;/svg&gt;
  &lt;input type="search" placeholder="Search" /&gt;
  &lt;kbd class="kbd kbd-sm"&gt;⌘&lt;/kbd&gt;
  &lt;kbd class="kbd kbd-sm"&gt;K&lt;/kbd&gt;
&lt;/label&gt;

&lt;label class="input"&gt;
  &lt;svg class="h-[1em] opacity-50" ...&gt;&lt;/svg&gt;
  &lt;input type="url" placeholder="https://" /&gt;
&lt;/label&gt;</code></pre>
			</div>
		</div>
	</div>

	<!-- Input with Labels and Badges -->
	<div class="border rounded-lg p-6 bg-base-50">
		<h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
			<span class="badge badge-primary badge-sm">Labels</span>
			Input with Labels & Badges
		</h3>
		<div class="grid md:grid-cols-2 gap-6">
			<div class="space-y-4">
				<!-- Prefix label -->
				<label class="input">
					<span class="label">https://</span>
					<input type="text" placeholder="URL" />
				</label>
				
				<!-- Suffix label -->
				<label class="input">
					<input type="text" placeholder="domain name" />
					<span class="label">.com</span>
				</label>
				
				<!-- Path with badge -->
				<label class="input">
					Path
					<input type="text" class="grow" placeholder="src/app/" bind:value={pathValue} />
					<span class="badge badge-neutral badge-xs">Optional</span>
				</label>
				
				<!-- Date input -->
				<label class="input">
					<span class="label">Publish date</span>
					<input type="date" />
				</label>
			</div>
			<div class="mockup-code text-sm">
				<pre><code>&lt;label class="input"&gt;
  &lt;span class="label"&gt;https://&lt;/span&gt;
  &lt;input type="text" placeholder="URL" /&gt;
&lt;/label&gt;

&lt;label class="input"&gt;
  Path
  &lt;input type="text" class="grow" placeholder="src/app/" /&gt;
  &lt;span class="badge badge-neutral badge-xs"&gt;Optional&lt;/span&gt;
&lt;/label&gt;</code></pre>
			</div>
		</div>
	</div>

	<!-- States and Validation -->
	<div class="border rounded-lg p-6 bg-base-50">
		<h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
			<span class="badge badge-warning badge-sm">States</span>
			Input States & Validation
		</h3>
		<div class="grid md:grid-cols-2 gap-6">
			<div class="space-y-4">
				<input type="text" placeholder="Default state" class="input" />
				<input type="text" placeholder="Disabled state" class="input" disabled />
				
				<!-- Validation example -->
				<label class="input validator">
					<svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
							<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
							<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
						</g>
					</svg>
					<input 
						type="url" 
						required 
						placeholder="https://" 
						value="https://"
						pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9\-].*[a-zA-Z0-9])?\.)+[a-zA-Z].*$"
						title="Must be valid URL" 
					/>
				</label>
				<p class="validator-hint text-sm text-base-content/70">Must be valid URL</p>
			</div>
			<div class="mockup-code text-sm">
				<pre><code>&lt;input class="input" placeholder="Default" /&gt;
&lt;input class="input" placeholder="Disabled" disabled /&gt;

&lt;label class="input validator"&gt;
  &lt;input 
    type="url" 
    required 
    pattern="^(https?://)?..."
    title="Must be valid URL" 
  /&gt;
&lt;/label&gt;
&lt;p class="validator-hint"&gt;Must be valid URL&lt;/p&gt;</code></pre>
			</div>
		</div>
	</div>
</div>