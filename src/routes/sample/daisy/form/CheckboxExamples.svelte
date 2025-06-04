<script>
	// Checkbox state examples
	let basicChecked = $state(true);
	let terms = $state(false);
	let newsletter = $state(true);
	let updates = $state(false);
	let permissions = $state(['read', 'write']);
	let selectedFeatures = $state(['dark-mode']);
	let isIndeterminate = $state(true);

	// Handle checkbox group changes
	function handlePermissionChange(permission, checked) {
		if (checked) {
			permissions = [...permissions, permission];
		} else {
			permissions = permissions.filter((p) => p !== permission);
		}
	}

	function handleFeatureChange(feature, checked) {
		if (checked) {
			selectedFeatures = [...selectedFeatures, feature];
		} else {
			selectedFeatures = selectedFeatures.filter((f) => f !== feature);
		}
	}
</script>

<div class="space-y-8">
	<!-- Basic Checkbox -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-neutral badge-sm">Basic</span>
			Basic Checkbox
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="checkbox" bind:checked={basicChecked} />
						<span class="label-text">Remember me</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="checkbox" bind:checked={terms} />
						<span class="label-text">I accept the terms and conditions</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="checkbox" checked disabled />
						<span class="label-text">Disabled checked</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="checkbox" disabled />
						<span class="label-text">Disabled unchecked</span>
					</label>
				</div>

				<div class="text-base-content/70 text-sm">
					Basic: {basicChecked} | Terms: {terms}
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;label class="label cursor-pointer justify-start gap-4"&gt;
  &lt;input type="checkbox" class="checkbox" bind:checked={'{basicChecked}'} /&gt;
  &lt;span class="label-text"&gt;Remember me&lt;/span&gt;
&lt;/label&gt;

&lt;!-- Disabled states --&gt;
&lt;input type="checkbox" class="checkbox" checked disabled /&gt;
&lt;input type="checkbox" class="checkbox" disabled /&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Checkbox Sizes -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-secondary badge-sm">Sizes</span>
			Checkbox Sizes
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="checkbox checkbox-xs" checked />
						<span class="label-text">Extra Small</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="checkbox checkbox-sm" checked />
						<span class="label-text">Small</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="checkbox checkbox-md" checked />
						<span class="label-text">Medium (default)</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="checkbox checkbox-lg" checked />
						<span class="label-text">Large</span>
					</label>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;input type="checkbox" class="checkbox checkbox-xs" checked /&gt;
&lt;input type="checkbox" class="checkbox checkbox-sm" checked /&gt;
&lt;input type="checkbox" class="checkbox checkbox-md" checked /&gt;
&lt;input type="checkbox" class="checkbox checkbox-lg" checked /&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Checkbox Colors -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-accent badge-sm">Colors</span>
			Checkbox Colors
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="checkbox checkbox-primary" checked />
						<span class="label-text">Primary</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="checkbox checkbox-secondary" checked />
						<span class="label-text">Secondary</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="checkbox checkbox-accent" checked />
						<span class="label-text">Accent</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="checkbox checkbox-success" checked />
						<span class="label-text">Success</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="checkbox checkbox-warning" checked />
						<span class="label-text">Warning</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="checkbox checkbox-error" checked />
						<span class="label-text">Error</span>
					</label>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;input type="checkbox" class="checkbox checkbox-primary" checked /&gt;
&lt;input type="checkbox" class="checkbox checkbox-secondary" checked /&gt;
&lt;input type="checkbox" class="checkbox checkbox-accent" checked /&gt;
&lt;input type="checkbox" class="checkbox checkbox-success" checked /&gt;
&lt;input type="checkbox" class="checkbox checkbox-warning" checked /&gt;
&lt;input type="checkbox" class="checkbox checkbox-error" checked /&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Checkbox Groups -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-primary badge-sm">Groups</span>
			Checkbox Groups
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-6">
				<!-- Permission checkboxes -->
				<fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4">
					<legend class="fieldset-legend">User Permissions</legend>

					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-4">
							<input
								type="checkbox"
								class="checkbox checkbox-primary"
								checked={permissions.includes('read')}
								onchange={(e) => handlePermissionChange('read', e.target.checked)}
							/>
							<span class="label-text">Read Access</span>
						</label>
					</div>

					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-4">
							<input
								type="checkbox"
								class="checkbox checkbox-primary"
								checked={permissions.includes('write')}
								onchange={(e) => handlePermissionChange('write', e.target.checked)}
							/>
							<span class="label-text">Write Access</span>
						</label>
					</div>

					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-4">
							<input
								type="checkbox"
								class="checkbox checkbox-primary"
								checked={permissions.includes('admin')}
								onchange={(e) => handlePermissionChange('admin', e.target.checked)}
							/>
							<span class="label-text">Admin Access</span>
						</label>
					</div>

					<div class="text-base-content/70 mt-2 text-sm">
						Selected: {permissions.join(', ') || 'None'}
					</div>
				</fieldset>

				<!-- Features checkboxes -->
				<div class="space-y-2">
					<h4 class="font-medium">App Features</h4>

					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-4">
							<input
								type="checkbox"
								class="checkbox checkbox-secondary"
								checked={selectedFeatures.includes('dark-mode')}
								onchange={(e) => handleFeatureChange('dark-mode', e.target.checked)}
							/>
							<span class="label-text">Dark Mode</span>
						</label>
					</div>

					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-4">
							<input
								type="checkbox"
								class="checkbox checkbox-secondary"
								checked={selectedFeatures.includes('notifications')}
								onchange={(e) => handleFeatureChange('notifications', e.target.checked)}
							/>
							<span class="label-text">Push Notifications</span>
						</label>
					</div>

					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-4">
							<input
								type="checkbox"
								class="checkbox checkbox-secondary"
								checked={selectedFeatures.includes('analytics')}
								onchange={(e) => handleFeatureChange('analytics', e.target.checked)}
							/>
							<span class="label-text">Analytics Tracking</span>
						</label>
					</div>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4"&gt;
  &lt;legend class="fieldset-legend"&gt;User Permissions&lt;/legend&gt;
  
  &lt;label class="label cursor-pointer justify-start gap-4"&gt;
    &lt;input 
      type="checkbox" 
      class="checkbox checkbox-primary"
      checked={"{permissions.includes('read')"}'
      onchange={(e) => handlePermissionChange('read', e.target.checked)}
    /&gt;
    &lt;span class="label-text"&gt;Read Access&lt;/span&gt;
  &lt;/label&gt;
&lt;/fieldset&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Indeterminate State -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-warning badge-sm">Advanced</span>
			Indeterminate State
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input
							type="checkbox"
							class="checkbox checkbox-primary"
							bind:indeterminate={isIndeterminate}
						/>
						<span class="label-text">Indeterminate checkbox</span>
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
						>&lt;input 
  type="checkbox" 
  class="checkbox checkbox-primary"
  bind:indeterminate={'{isIndeterminate}'}
/&gt;

&lt;!-- JavaScript method --&gt;
&lt;script&gt;
  document.getElementById("my-checkbox").indeterminate = true;
&lt;/script&gt;</code
					></pre>
			</div>
		</div>
	</div>
</div>
