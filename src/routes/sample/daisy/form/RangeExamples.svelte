<script>
	// Range state examples
	let basicRange = $state(40);
	let volumeRange = $state(50);
	let brightnessRange = $state(75);
	let temperatureRange = $state(22);
	let priceRange = $state(250);
	let stepRange = $state(25);
	let ageRange = $state(25);
	
	// Reactive values
	const volumePercentage = $derived(Math.round(volumeRange));
  const temperatureLabel = $derived(temperatureRange < 18 ? 'Cold' : temperatureRange < 25 ? 'Comfortable' : 'Hot');
  const priceFormatted = $derived(new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
  }).format(priceRange));

</script>

<div class="space-y-8">
	<!-- Basic Range -->
	<div class="border rounded-lg p-6 bg-base-50">
		<h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
			<span class="badge badge-neutral badge-sm">Basic</span>
			Basic Range Slider
		</h3>
		<div class="grid md:grid-cols-2 gap-6">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text">Basic range slider</span>
						<span class="label-text-alt">Value: {basicRange}</span>
					</label>
					<input 
						type="range" 
						min="0" 
						max="100" 
						class="range" 
						bind:value={basicRange} 
					/>
				</div>
				
				<div class="form-control">
					<label class="label">
						<span class="label-text">Volume control</span>
						<span class="label-text-alt">{volumePercentage}%</span>
					</label>
					<input 
						type="range" 
						min="0" 
						max="100" 
						class="range range-primary" 
						bind:value={volumeRange} 
					/>
				</div>
				
				<div class="form-control">
					<label class="label">
						<span class="label-text">Brightness</span>
						<span class="label-text-alt">{brightnessRange}%</span>
					</label>
					<input 
						type="range" 
						min="0" 
						max="100" 
						class="range range-secondary" 
						bind:value={brightnessRange} 
					/>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code>&lt;label class="label"&gt;
  &lt;span class="label-text"&gt;Basic range slider&lt;/span&gt;
  &lt;span class="label-text-alt"&gt;Value: {'{basicRange}'}&lt;/span&gt;
&lt;/label&gt;
&lt;input 
  type="range" 
  min="0" 
  max="100" 
  class="range" 
  bind:value={'{basicRange}'} 
/&gt;

&lt;!-- With colors --&gt;
&lt;input type="range" class="range range-primary" bind:value={'{volumeRange}'} /&gt;
&lt;input type="range" class="range range-secondary" bind:value={'{brightnessRange}'} /&gt;</code></pre>
			</div>
		</div>
	</div>

	<!-- Range Sizes -->
	<div class="border rounded-lg p-6 bg-base-50">
		<h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
			<span class="badge badge-secondary badge-sm">Sizes</span>
			Range Sizes
		</h3>
		<div class="grid md:grid-cols-2 gap-6">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text">Extra Small</span>
					</label>
					<input type="range" min="0" max="100" value="30" class="range range-xs" />
				</div>
				
				<div class="form-control">
					<label class="label">
						<span class="label-text">Small</span>
					</label>
					<input type="range" min="0" max="100" value="40" class="range range-sm" />
				</div>
				
				<div class="form-control">
					<label class="label">
						<span class="label-text">Medium (default)</span>
					</label>
					<input type="range" min="0" max="100" value="50" class="range range-md" />
				</div>
				
				<div class="form-control">
					<label class="label">
						<span class="label-text">Large</span>
					</label>
					<input type="range" min="0" max="100" value="60" class="range range-lg" />
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code>&lt;input type="range" min="0" max="100" value="30" class="range range-xs" /&gt;
&lt;input type="range" min="0" max="100" value="40" class="range range-sm" /&gt;
&lt;input type="range" min="0" max="100" value="50" class="range range-md" /&gt;
&lt;input type="range" min="0" max="100" value="60" class="range range-lg" /&gt;</code></pre>
			</div>
		</div>
	</div>

	<!-- Range Colors -->
	<div class="border rounded-lg p-6 bg-base-50">
		<h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
			<span class="badge badge-accent badge-sm">Colors</span>
			Range Colors
		</h3>
		<div class="grid md:grid-cols-2 gap-6">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text">Primary</span>
					</label>
					<input type="range" min="0" max="100" value="40" class="range range-primary" />
				</div>
				
				<div class="form-control">
					<label class="label">
						<span class="label-text">Secondary</span>
					</label>
					<input type="range" min="0" max="100" value="40" class="range range-secondary" />
				</div>
				
				<div class="form-control">
					<label class="label">
						<span class="label-text">Accent</span>
					</label>
					<input type="range" min="0" max="100" value="40" class="range range-accent" />
				</div>
				
				<div class="form-control">
					<label class="label">
						<span class="label-text">Success</span>
					</label>
					<input type="range" min="0" max="100" value="40" class="range range-success" />
				</div>
				
				<div class="form-control">
					<label class="label">
						<span class="label-text">Warning</span>
					</label>
					<input type="range" min="0" max="100" value="40" class="range range-warning" />
				</div>
				
				<div class="form-control">
					<label class="label">
						<span class="label-text">Error</span>
					</label>
					<input type="range" min="0" max="100" value="40" class="range range-error" />
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code>&lt;input type="range" min="0" max="100" value="40" class="range range-primary" /&gt;
&lt;input type="range" min="0" max="100" value="40" class="range range-secondary" /&gt;
&lt;input type="range" min="0" max="100" value="40" class="range range-accent" /&gt;
&lt;input type="range" min="0" max="100" value="40" class="range range-success" /&gt;
&lt;input type="range" min="0" max="100" value="40" class="range range-warning" /&gt;
&lt;input type="range" min="0" max="100" value="40" class="range range-error" /&gt;</code></pre>
			</div>
		</div>
	</div>

	<!-- Range with Steps and Labels -->
	<div class="border rounded-lg p-6 bg-base-50">
		<h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
			<span class="badge badge-primary badge-sm">Advanced</span>
			Range with Steps and Labels
		</h3>
		<div class="grid md:grid-cols-2 gap-6">
			<div class="space-y-6">
				<!-- Step range with labels -->
				<div class="form-control w-full max-w-xs">
					<label class="label">
						<span class="label-text">Rating level</span>
						<span class="label-text-alt">Level: {stepRange / 25 + 1}</span>
					</label>
					<input 
						type="range" 
						min="0" 
						max="100" 
						class="range range-primary" 
						step="25" 
						bind:value={stepRange} 
					/>
					<div class="flex justify-between px-2.5 mt-2 text-xs">
						<span>|</span>
						<span>|</span>
						<span>|</span>
						<span>|</span>
						<span>|</span>
					</div>
					<div class="flex justify-between px-2.5 mt-1 text-xs">
						<span>1</span>
						<span>2</span>
						<span>3</span>
						<span>4</span>
						<span>5</span>
					</div>
				</div>
				
				<!-- Temperature with labels -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Temperature</span>
						<span class="label-text-alt">{temperatureRange}°C - {temperatureLabel}</span>
					</label>
					<input 
						type="range" 
						min="10" 
						max="35" 
						class="range range-accent" 
						bind:value={temperatureRange} 
					/>
					<div class="flex justify-between px-2 mt-2 text-xs text-base-content/60">
						<span>10°C</span>
						<span>22°C</span>
						<span>35°C</span>
					</div>
				</div>
				
				<!-- Price range -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Budget</span>
						<span class="label-text-alt">{priceFormatted}</span>
					</label>
					<input 
						type="range" 
						min="0" 
						max="1000" 
						step="10"
						class="range range-success" 
						bind:value={priceRange} 
					/>
					<div class="flex justify-between px-2 mt-2 text-xs text-base-content/60">
						<span>$0</span>
						<span>$500</span>
						<span>$1000</span>
					</div>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code>&lt;div class="form-control w-full max-w-xs"&gt;
  &lt;label class="label"&gt;
    &lt;span class="label-text"&gt;Rating level&lt;/span&gt;
    &lt;span class="label-text-alt"&gt;Level: {'{stepRange / 25 + 1}'}&lt;/span&gt;
  &lt;/label&gt;
  &lt;input 
    type="range" 
    min="0" 
    max="100" 
    class="range range-primary" 
    step="25" 
    bind:value={'{stepRange}'} 
  /&gt;
  &lt;div class="flex justify-between px-2.5 mt-2 text-xs"&gt;
    &lt;span&gt;|&lt;/span&gt;
    &lt;span&gt;|&lt;/span&gt;
    &lt;span&gt;|&lt;/span&gt;
    &lt;span&gt;|&lt;/span&gt;
    &lt;span&gt;|&lt;/span&gt;
  &lt;/div&gt;
  &lt;div class="flex justify-between px-2.5 mt-1 text-xs"&gt;
    &lt;span&gt;1&lt;/span&gt;
    &lt;span&gt;2&lt;/span&gt;
    &lt;span&gt;3&lt;/span&gt;
    &lt;span&gt;4&lt;/span&gt;
    &lt;span&gt;5&lt;/span&gt;
  &lt;/div&gt;
&lt;/div&gt;</code></pre>
			</div>
		</div>
	</div>

	<!-- Custom Range Styling -->
	<div class="border rounded-lg p-6 bg-base-50">
		<h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
			<span class="badge badge-warning badge-sm">Custom</span>
			Custom Range Styling
		</h3>
		<div class="grid md:grid-cols-2 gap-6">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text">Custom colors with CSS variables</span>
						<span class="label-text-alt">Age: {ageRange}</span>
					</label>
					<input 
						type="range" 
						min="18" 
						max="80" 
						class="range text-blue-300"
						style="--range-bg: orange; --range-thumb: blue; --range-fill: 0;"
						bind:value={ageRange} 
					/>
				</div>
				
				<div class="form-control">
					<label class="label">
						<span class="label-text">Disabled range</span>
					</label>
					<input 
						type="range" 
						min="0" 
						max="100" 
						value="60"
						class="range range-primary" 
						disabled 
					/>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code>&lt;!-- Custom CSS variables --&gt;
&lt;input 
  type="range" 
  min="18" 
  max="80" 
  class="range text-blue-300"
  style="--range-bg: orange; --range-thumb: blue; --range-fill: 0;"
  bind:value={'{ageRange}'} 
/&gt;

&lt;!-- Disabled state --&gt;
&lt;input 
  type="range" 
  min="0" 
  max="100" 
  value="60"
  class="range range-primary" 
  disabled 
/&gt;</code></pre>
			</div>
		</div>
	</div>
</div>