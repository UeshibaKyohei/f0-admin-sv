<script>
	// Toggle state examples
	let basicToggle = $state(true);
	let darkMode = $state(false);
	let notifications = $state(true);
	let autoSave = $state(false);
	let analytics = $state(true);
	let marketing = $state(false);
	let isIndeterminate = $state(true);

	// Settings object for grouped toggles
	let settings = $state({
		wifi: true,
		bluetooth: false,
		location: true,
		camera: false,
		microphone: true
	});

	function toggleSetting(key) {
		settings[key] = !settings[key];
	}
</script>

<div class="space-y-8">
	<!-- Basic Toggle -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-neutral badge-sm">Basic</span>
			Basic Toggle Switch
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="toggle" bind:checked={basicToggle} />
						<span class="label-text">Enable feature</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="toggle toggle-primary" bind:checked={darkMode} />
						<span class="label-text">Dark mode {darkMode ? '🌙' : '☀️'}</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="toggle toggle-secondary" bind:checked={notifications} />
						<span class="label-text">Push notifications</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="toggle" checked disabled />
						<span class="label-text">Disabled (checked)</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="toggle" disabled />
						<span class="label-text">Disabled (unchecked)</span>
					</label>
				</div>

				<div class="text-base-content/70 text-sm">
					Basic: {basicToggle} | Dark Mode: {darkMode} | Notifications: {notifications}
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;label class="label cursor-pointer justify-start gap-4"&gt;
  &lt;input type="checkbox" class="toggle" bind:checked={'{basicToggle}'} /&gt;
  &lt;span class="label-text"&gt;Enable feature&lt;/span&gt;
&lt;/label&gt;

&lt;!-- With colors --&gt;
&lt;input type="checkbox" class="toggle toggle-primary" bind:checked={'{darkMode}'} /&gt;
&lt;input type="checkbox" class="toggle toggle-secondary" bind:checked={'{notifications}'} /&gt;

&lt;!-- Disabled states --&gt;
&lt;input type="checkbox" class="toggle" checked disabled /&gt;
&lt;input type="checkbox" class="toggle" disabled /&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Toggle Sizes -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-secondary badge-sm">Sizes</span>
			Toggle Sizes
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="toggle toggle-xs" checked />
						<span class="label-text">Extra Small</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="toggle toggle-sm" checked />
						<span class="label-text">Small</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="toggle toggle-md" checked />
						<span class="label-text">Medium (default)</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="toggle toggle-lg" checked />
						<span class="label-text">Large</span>
					</label>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;input type="checkbox" class="toggle toggle-xs" checked /&gt;
&lt;input type="checkbox" class="toggle toggle-sm" checked /&gt;
&lt;input type="checkbox" class="toggle toggle-md" checked /&gt;
&lt;input type="checkbox" class="toggle toggle-lg" checked /&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Toggle Colors -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-accent badge-sm">Colors</span>
			Toggle Colors
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="toggle toggle-primary" checked />
						<span class="label-text">Primary</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="toggle toggle-secondary" checked />
						<span class="label-text">Secondary</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="toggle toggle-accent" checked />
						<span class="label-text">Accent</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="toggle toggle-success" checked />
						<span class="label-text">Success</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="toggle toggle-warning" checked />
						<span class="label-text">Warning</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="toggle toggle-error" checked />
						<span class="label-text">Error</span>
					</label>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;input type="checkbox" class="toggle toggle-primary" checked /&gt;
&lt;input type="checkbox" class="toggle toggle-secondary" checked /&gt;
&lt;input type="checkbox" class="toggle toggle-accent" checked /&gt;
&lt;input type="checkbox" class="toggle toggle-success" checked /&gt;
&lt;input type="checkbox" class="toggle toggle-warning" checked /&gt;
&lt;input type="checkbox" class="toggle toggle-error" checked /&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Toggle Groups -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-primary badge-sm">Groups</span>
			Toggle Groups & Settings
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-6">
				<!-- App settings -->
				<fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4">
					<legend class="fieldset-legend">App Settings</legend>

					<div class="form-control">
						<label class="label cursor-pointer justify-between">
							<span class="label-text">Auto-save documents</span>
							<input type="checkbox" class="toggle toggle-primary" bind:checked={autoSave} />
						</label>
					</div>

					<div class="form-control">
						<label class="label cursor-pointer justify-between">
							<span class="label-text">Enable analytics</span>
							<input type="checkbox" class="toggle toggle-primary" bind:checked={analytics} />
						</label>
					</div>

					<div class="form-control">
						<label class="label cursor-pointer justify-between">
							<span class="label-text">Marketing emails</span>
							<input type="checkbox" class="toggle toggle-primary" bind:checked={marketing} />
						</label>
					</div>

					<div class="text-base-content/70 mt-2 text-sm">
						Auto-save: {autoSave ? 'ON' : 'OFF'} | Analytics: {analytics ? 'ON' : 'OFF'} | Marketing:
						{marketing ? 'ON' : 'OFF'}
					</div>
				</fieldset>

				<!-- Device settings -->
				<div class="space-y-2">
					<h4 class="font-medium">Device Settings</h4>

					<div class="form-control">
						<label class="label cursor-pointer justify-between">
							<div>
								<div class="label-text">Wi-Fi</div>
								<div class="label-text-alt">Connect to available networks</div>
							</div>
							<input
								type="checkbox"
								class="toggle toggle-success"
								checked={settings.wifi}
								onchange={() => toggleSetting('wifi')}
							/>
						</label>
					</div>

					<div class="form-control">
						<label class="label cursor-pointer justify-between">
							<div>
								<div class="label-text">Bluetooth</div>
								<div class="label-text-alt">Connect to nearby devices</div>
							</div>
							<input
								type="checkbox"
								class="toggle toggle-info"
								checked={settings.bluetooth}
								onchange={() => toggleSetting('bluetooth')}
							/>
						</label>
					</div>

					<div class="form-control">
						<label class="label cursor-pointer justify-between">
							<div>
								<div class="label-text">Location Services</div>
								<div class="label-text-alt">Allow apps to access location</div>
							</div>
							<input
								type="checkbox"
								class="toggle toggle-warning"
								checked={settings.location}
								onchange={() => toggleSetting('location')}
							/>
						</label>
					</div>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4"&gt;
  &lt;legend class="fieldset-legend"&gt;App Settings&lt;/legend&gt;
  
  &lt;label class="label cursor-pointer justify-between"&gt;
    &lt;span class="label-text"&gt;Auto-save documents&lt;/span&gt;
    &lt;input type="checkbox" class="toggle toggle-primary" bind:checked={'{autoSave}'} /&gt;
  &lt;/label&gt;
&lt;/fieldset&gt;

&lt;!-- Device settings --&gt;
&lt;label class="label cursor-pointer justify-between"&gt;
  &lt;div&gt;
    &lt;div class="label-text"&gt;Wi-Fi&lt;/div&gt;
    &lt;div class="label-text-alt"&gt;Connect to available networks&lt;/div&gt;
  &lt;/div&gt;
  &lt;input 
    type="checkbox" 
    class="toggle toggle-success" 
    checked={'{settings.wifi}'}
    onchange={() => toggleSetting('wifi')}
  /&gt;
&lt;/label&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Advanced Toggle Features -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-warning badge-sm">Advanced</span>
			Advanced Toggle Features
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<!-- Toggle with icons -->
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<label class="toggle text-base-content">
							<input type="checkbox" />
							<svg aria-label="enabled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<g
									stroke-linejoin="round"
									stroke-linecap="round"
									stroke-width="4"
									fill="none"
									stroke="currentColor"
								>
									<path d="M20 6 9 17l-5-5"></path>
								</g>
							</svg>
							<svg
								aria-label="disabled"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="4"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M18 6 6 18" />
								<path d="m6 6 12 12" />
							</svg>
						</label>
						<span class="label-text">Toggle with icons</span>
					</label>
				</div>

				<!-- Custom colored toggle -->
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input
							type="checkbox"
							checked
							class="toggle border-indigo-600 bg-indigo-500 checked:border-orange-500 checked:bg-orange-400 checked:text-orange-800"
						/>
						<span class="label-text">Custom colors with Tailwind classes</span>
					</label>
				</div>

				<!-- Indeterminate toggle -->
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input
							type="checkbox"
							class="toggle toggle-primary"
							bind:indeterminate={isIndeterminate}
						/>
						<span class="label-text">Indeterminate toggle</span>
					</label>
				</div>

				<div class="flex gap-2">
					<button class="btn btn-sm btn-outline" onclick={() => (isIndeterminate = true)}>
						Set Indeterminate
					</button>
					<button class="btn btn-sm btn-outline" onclick={() => (isIndeterminate = false)}>
						Clear Indeterminate
					</button>
				</div>

				<div class="text-base-content/70 text-sm">
					Indeterminate: {isIndeterminate}
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;!-- Toggle with icons --&gt;
&lt;label class="toggle text-base-content"&gt;
  &lt;input type="checkbox" /&gt;
  &lt;svg aria-label="enabled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"&gt;
    &lt;g stroke-linejoin="round" stroke-linecap="round" stroke-width="4" fill="none" stroke="currentColor"&gt;
      &lt;path d="M20 6 9 17l-5-5"&gt;&lt;/path&gt;
    &lt;/g&gt;
  &lt;/svg&gt;
  &lt;svg aria-label="disabled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"&gt;
    &lt;path d="M18 6 6 18" /&gt;
    &lt;path d="m6 6 12 12" /&gt;
  &lt;/svg&gt;
&lt;/label&gt;

&lt;!-- Custom colors --&gt;
&lt;input 
  type="checkbox" 
  checked
  class="toggle border-indigo-600 bg-indigo-500 checked:border-orange-500 checked:bg-orange-400 checked:text-orange-800"
/&gt;

&lt;!-- Indeterminate --&gt;
&lt;input 
  type="checkbox" 
  class="toggle toggle-primary"
  bind:indeterminate={'{isIndeterminate}'}
/&gt;</code
					></pre>
			</div>
		</div>
	</div>
</div>
