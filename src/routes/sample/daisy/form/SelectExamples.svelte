<script>
	// Select state examples
	let selectedColor = $state('');
	let selectedFont = $state('');
	let selectedCountry = $state('');
	let selectedBrowser = $state('');
	let selectedFramework = $state('svelte');
	let selectedCategory = $state('');
	let selectedPriority = $state('medium');

	// Multiple selection examples
	let selectedCountries = $state(new Set());
	let selectedSkills = $state(new Set());

	const countries = [
		{ value: 'us', name: 'United States', flag: '🇺🇸' },
		{ value: 'ca', name: 'Canada', flag: '🇨🇦' },
		{ value: 'mx', name: 'Mexico', flag: '🇲🇽' },
		{ value: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
		{ value: 'fr', name: 'France', flag: '🇫🇷' },
		{ value: 'de', name: 'Germany', flag: '🇩🇪' },
		{ value: 'jp', name: 'Japan', flag: '🇯🇵' },
		{ value: 'au', name: 'Australia', flag: '🇦🇺' },
		{ value: 'sg', name: 'Singapore', flag: '🇸🇬' },
		{ value: 'kr', name: 'South Korea', flag: '🇰🇷' }
	];

	const skills = [
		'JavaScript',
		'TypeScript',
		'React',
		'Svelte',
		'Vue',
		'Angular',
		'Node.js',
		'Python',
		'PHP',
		'Java',
		'C#',
		'Go',
		'Rust',
		'CSS',
		'HTML',
		'Tailwind CSS',
		'Bootstrap',
		'SASS',
		'MongoDB',
		'PostgreSQL',
		'MySQL',
		'Redis',
		'AWS',
		'Docker',
		'Kubernetes',
		'Git'
	];

	function toggleCountry(countryValue) {
		if (selectedCountries.has(countryValue)) {
			selectedCountries.delete(countryValue);
		} else {
			selectedCountries.add(countryValue);
		}
		selectedCountries = new Set(selectedCountries); // リアクティビティをトリガー
	}

	function toggleSkill(skill) {
		if (selectedSkills.has(skill)) {
			selectedSkills.delete(skill);
		} else {
			selectedSkills.add(skill);
		}
		selectedSkills = new Set(selectedSkills); // リアクティビティをトリガー
	}
</script>

<div class="space-y-8">
	<!-- Basic Select -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-neutral badge-sm">Basic</span>
			Basic Select
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<select class="select" bind:value={selectedColor}>
					<option disabled selected>Pick a color</option>
					<option value="red">Crimson</option>
					<option value="orange">Amber</option>
					<option value="purple">Velvet</option>
					<option value="blue">Ocean</option>
				</select>

				<select class="select select-ghost" bind:value={selectedFont}>
					<option disabled selected>Pick a font</option>
					<option value="inter">Inter</option>
					<option value="poppins">Poppins</option>
					<option value="raleway">Raleway</option>
					<option value="roboto">Roboto</option>
				</select>

				<select class="select" disabled>
					<option>Disabled select</option>
					<option>Option 1</option>
					<option>Option 2</option>
				</select>

				<div class="text-base-content/70 text-sm">
					Color: {selectedColor} | Font: {selectedFont}
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;select class="select" bind:value={'{selectedColor}'}&gt;
  &lt;option disabled selected&gt;Pick a color&lt;/option&gt;
  &lt;option value="red"&gt;Crimson&lt;/option&gt;
  &lt;option value="orange"&gt;Amber&lt;/option&gt;
  &lt;option value="purple"&gt;Velvet&lt;/option&gt;
&lt;/select&gt;

&lt;!-- Ghost style --&gt;
&lt;select class="select select-ghost" bind:value={'{selectedFont}'}&gt;
  &lt;option disabled selected&gt;Pick a font&lt;/option&gt;
  &lt;option value="inter"&gt;Inter&lt;/option&gt;
&lt;/select&gt;

&lt;!-- Disabled --&gt;
&lt;select class="select" disabled&gt;
  &lt;option&gt;Disabled select&lt;/option&gt;
&lt;/select&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Select Sizes -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-secondary badge-sm">Sizes</span>
			Select Sizes
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<select class="select select-xs">
					<option disabled selected>Extra Small</option>
					<option>XS Apple</option>
					<option>XS Orange</option>
					<option>XS Tomato</option>
				</select>

				<select class="select select-sm">
					<option disabled selected>Small</option>
					<option>Small Apple</option>
					<option>Small Orange</option>
					<option>Small Tomato</option>
				</select>

				<select class="select select-md">
					<option disabled selected>Medium (default)</option>
					<option>Medium Apple</option>
					<option>Medium Orange</option>
					<option>Medium Tomato</option>
				</select>

				<select class="select select-lg">
					<option disabled selected>Large</option>
					<option>Large Apple</option>
					<option>Large Orange</option>
					<option>Large Tomato</option>
				</select>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;select class="select select-xs"&gt;
  &lt;option disabled selected&gt;Extra Small&lt;/option&gt;
  &lt;option&gt;XS Apple&lt;/option&gt;
&lt;/select&gt;

&lt;select class="select select-sm"&gt;
  &lt;option disabled selected&gt;Small&lt;/option&gt;
  &lt;option&gt;Small Apple&lt;/option&gt;
&lt;/select&gt;

&lt;select class="select select-md"&gt;
  &lt;option disabled selected&gt;Medium&lt;/option&gt;
  &lt;option&gt;Medium Apple&lt;/option&gt;
&lt;/select&gt;

&lt;select class="select select-lg"&gt;
  &lt;option disabled selected&gt;Large&lt;/option&gt;
  &lt;option&gt;Large Apple&lt;/option&gt;
&lt;/select&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Select Colors -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-accent badge-sm">Colors</span>
			Select Colors
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<select class="select select-primary">
					<option disabled selected>Primary</option>
					<option>Option 1</option>
					<option>Option 2</option>
				</select>

				<select class="select select-secondary">
					<option disabled selected>Secondary</option>
					<option>Option 1</option>
					<option>Option 2</option>
				</select>

				<select class="select select-accent">
					<option disabled selected>Accent</option>
					<option>Option 1</option>
					<option>Option 2</option>
				</select>

				<select class="select select-success">
					<option disabled selected>Success</option>
					<option>Option 1</option>
					<option>Option 2</option>
				</select>

				<select class="select select-warning">
					<option disabled selected>Warning</option>
					<option>Option 1</option>
					<option>Option 2</option>
				</select>

				<select class="select select-error">
					<option disabled selected>Error</option>
					<option>Option 1</option>
					<option>Option 2</option>
				</select>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;select class="select select-primary"&gt;
  &lt;option disabled selected&gt;Primary&lt;/option&gt;
  &lt;option&gt;Option 1&lt;/option&gt;
&lt;/select&gt;

&lt;select class="select select-secondary"&gt;
  &lt;option disabled selected&gt;Secondary&lt;/option&gt;
  &lt;option&gt;Option 1&lt;/option&gt;
&lt;/select&gt;

&lt;select class="select select-accent"&gt;
  &lt;option disabled selected&gt;Accent&lt;/option&gt;
  &lt;option&gt;Option 1&lt;/option&gt;
&lt;/select&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Select with Fieldset -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-primary badge-sm">Fieldset</span>
			Select with Fieldset
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4">
					<legend class="fieldset-legend">Browsers</legend>
					<select class="select" bind:value={selectedBrowser}>
						<option disabled selected>Pick a browser</option>
						<option value="chrome">Chrome</option>
						<option value="firefox">Firefox</option>
						<option value="safari">Safari</option>
						<option value="edge">Edge</option>
					</select>
					<span class="label text-base-content/70 text-sm">Choose your preferred browser</span>
				</fieldset>

				<fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4">
					<legend class="fieldset-legend">Development</legend>
					<select class="select select-primary" bind:value={selectedFramework}>
						<option value="svelte">Svelte</option>
						<option value="react">React</option>
						<option value="vue">Vue</option>
						<option value="angular">Angular</option>
					</select>
					<span class="label text-base-content/70 text-sm">Selected: {selectedFramework}</span>
				</fieldset>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4"&gt;
  &lt;legend class="fieldset-legend"&gt;Browsers&lt;/legend&gt;
  &lt;select class="select" bind:value={'{selectedBrowser}'}&gt;
    &lt;option disabled selected&gt;Pick a browser&lt;/option&gt;
    &lt;option value="chrome"&gt;Chrome&lt;/option&gt;
    &lt;option value="firefox"&gt;Firefox&lt;/option&gt;
    &lt;option value="safari"&gt;Safari&lt;/option&gt;
  &lt;/select&gt;
  &lt;span class="label"&gt;Choose your preferred browser&lt;/span&gt;
&lt;/fieldset&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Multiple Select -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-warning badge-sm">Multiple</span>
			Multiple Selection (Better UX)
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<!-- Improved multiple select with dropdown -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Select multiple countries (Dropdown + Checkboxes)</span>
					</label>
					<div class="dropdown dropdown-bottom w-full">
						<label tabindex="0" class="btn btn-outline w-full justify-between">
							{#if selectedCountries.size > 0}
								{[...selectedCountries].slice(0, 2).join(', ')}{selectedCountries.size > 2
									? ` +${selectedCountries.size - 2} more`
									: ''}
							{:else}
								Select countries...
							{/if}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</label>
						<ul
							tabindex="0"
							class="dropdown-content menu bg-base-100 rounded-box z-[1] max-h-60 w-full overflow-auto p-2 shadow"
						>
							{#each countries as country}
								<li>
									<label class="label hover:bg-base-200 cursor-pointer justify-start gap-3 rounded">
										<input
											type="checkbox"
											class="checkbox checkbox-primary checkbox-sm"
											checked={selectedCountries.has(country.value)}
											onchange={() => toggleCountry(country.value)}
										/>
										<div class="flex items-center gap-2">
											<span class="text-lg">{country.flag}</span>
											<span class="label-text">{country.name}</span>
										</div>
									</label>
								</li>
							{/each}
						</ul>
					</div>
					<label class="label">
						<span class="label-text-alt">Selected: {selectedCountries.size} countries</span>
						{#if selectedCountries.size > 0}
							<button class="btn btn-ghost btn-xs" onclick={() => (selectedCountries = new Set())}>
								Clear all
							</button>
						{/if}
					</label>
				</div>

				<!-- Tags-style multiple select -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Select skills (Tags)</span>
					</label>
					<div class="dropdown dropdown-bottom w-full">
						<label
							tabindex="0"
							class="input input-bordered flex min-h-12 cursor-pointer flex-wrap items-center gap-1"
						>
							{#each [...selectedSkills] as skill}
								<div class="badge badge-primary gap-1">
									{skill}
									<button
										class="btn btn-circle btn-ghost btn-xs"
										onclick={() => toggleSkill(skill)}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-3 w-3"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
							{/each}
							{#if selectedSkills.size === 0}
								<span class="text-base-content/50">Choose skills...</span>
							{/if}
						</label>
						<ul
							tabindex="0"
							class="dropdown-content menu bg-base-100 rounded-box z-[1] max-h-48 w-full overflow-auto p-2 shadow"
						>
							{#each skills.filter((skill) => !selectedSkills.has(skill)) as skill}
								<li>
									<button class="justify-start" onclick={() => toggleSkill(skill)}>
										<span class="label-text">{skill}</span>
									</button>
								</li>
							{/each}
							{#if skills.filter((skill) => !selectedSkills.has(skill)).length === 0}
								<li><span class="text-base-content/50 p-2">All skills selected</span></li>
							{/if}
						</ul>
					</div>
				</div>

				<!-- Standard multiple select (for comparison) -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Standard HTML multiple select (hard to use)</span>
					</label>
					<select class="select select-primary select-sm" multiple size="4">
						<option value="us">United States 🇺🇸</option>
						<option value="ca">Canada 🇨🇦</option>
						<option value="mx">Mexico 🇲🇽</option>
						<option value="uk">United Kingdom 🇬🇧</option>
						<option value="fr">France 🇫🇷</option>
						<option value="de">Germany 🇩🇪</option>
						<option value="jp">Japan 🇯🇵</option>
						<option value="au">Australia 🇦🇺</option>
					</select>
					<label class="label">
						<span class="label-text-alt text-warning"
							>❌ Hard to use - requires Ctrl/Cmd + click</span
						>
					</label>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;script&gt;
  let selectedCountries = $state(new Set());
  let countries = [
    {`{ value: 'us', name: 'United States', flag: '🇺🇸' }`},
    {`{ value: 'ca', name: 'Canada', flag: '🇨🇦' }`},
    // ...
  ];
  
  function toggleCountry(country) `{`
    selectedCountries.has(country) 
      ? selectedCountries.delete(country) 
      : selectedCountries.add(country);
    selectedCountries = new Set(selectedCountries);
  `}`
&lt;/script&gt;

&lt;div class="dropdown dropdown-bottom w-full"&gt;
  &lt;label tabindex="0" class="btn btn-outline w-full justify-between"&gt;
    {'{#if selectedCountries.size > 0}'}
      {"{[...selectedCountries].slice(0, 2).join(', ')}{selectedCountries.size > 2 ? ` +${" +
							"}{selectedCountries.size - 2} more` : ''}"}
    {'{:else}'}
      Select countries...
    {'{/if}'}
  &lt;/label&gt;
  &lt;ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full"&gt;
    {'{#each countries as country}'}
      &lt;li&gt;
        &lt;label class="label cursor-pointer justify-start gap-3"&gt;
          &lt;input 
            type="checkbox" 
            class="checkbox checkbox-primary checkbox-sm"
            checked={'{selectedCountries.has(country.value)}'}
            onchange={() => toggleCountry(country.value)}
          /&gt;
          &lt;span&gt;{'{country.flag}'} {'{country.name}'}&lt;/span&gt;
        &lt;/label&gt;
      &lt;/li&gt;
    {'{/each}'}
  &lt;/ul&gt;
&lt;/div&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Grouped Options -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-info badge-sm">Groups</span>
			Grouped Options
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text">Task Priority</span>
					</label>
					<select class="select select-accent" bind:value={selectedPriority}>
						<optgroup label="Critical">
							<option value="urgent">Urgent</option>
							<option value="high">High Priority</option>
						</optgroup>
						<optgroup label="Normal">
							<option value="medium">Medium Priority</option>
							<option value="low">Low Priority</option>
						</optgroup>
						<optgroup label="Optional">
							<option value="future">Future Enhancement</option>
							<option value="nice-to-have">Nice to Have</option>
						</optgroup>
					</select>
					<label class="label">
						<span class="label-text-alt">Selected: {selectedPriority}</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Geographic Region</span>
					</label>
					<select class="select">
						<optgroup label="North America">
							<option value="us">United States</option>
							<option value="ca">Canada</option>
							<option value="mx">Mexico</option>
						</optgroup>
						<optgroup label="Europe">
							<option value="uk">United Kingdom</option>
							<option value="fr">France</option>
							<option value="de">Germany</option>
							<option value="es">Spain</option>
						</optgroup>
						<optgroup label="Asia Pacific">
							<option value="jp">Japan</option>
							<option value="au">Australia</option>
							<option value="sg">Singapore</option>
						</optgroup>
					</select>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;select class="select select-accent" bind:value={'{selectedPriority}'}&gt;
  &lt;optgroup label="Critical"&gt;
    &lt;option value="urgent"&gt;Urgent&lt;/option&gt;
    &lt;option value="high"&gt;High Priority&lt;/option&gt;
  &lt;/optgroup&gt;
  &lt;optgroup label="Normal"&gt;
    &lt;option value="medium"&gt;Medium Priority&lt;/option&gt;
    &lt;option value="low"&gt;Low Priority&lt;/option&gt;
  &lt;/optgroup&gt;
  &lt;optgroup label="Optional"&gt;
    &lt;option value="future"&gt;Future Enhancement&lt;/option&gt;
    &lt;option value="nice-to-have"&gt;Nice to Have&lt;/option&gt;
  &lt;/optgroup&gt;
&lt;/select&gt;</code
					></pre>
			</div>
		</div>
	</div>
</div>
