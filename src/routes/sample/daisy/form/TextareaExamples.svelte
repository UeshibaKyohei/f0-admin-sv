<script>
	// Textarea state examples
	let textareaValue = $state('');
	let bioValue = $state('');
</script>

<div class="space-y-8">
	<!-- Basic Textarea -->
	<div class="border rounded-lg p-6 bg-base-50">
		<h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
			<span class="badge badge-neutral badge-sm">Basic</span>
			Basic Textarea
		</h3>
		<div class="grid md:grid-cols-2 gap-6">
			<div class="space-y-4">
				<textarea class="textarea" placeholder="Bio" bind:value={textareaValue}></textarea>
				<textarea class="textarea h-24" placeholder="Fixed height (h-24)" bind:value={bioValue}></textarea>
				<div class="text-sm text-base-content/70">
					Bio length: {textareaValue.length} characters
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code>&lt;textarea class="textarea" placeholder="Bio" bind:value={'{textareaValue}'}&gt;&lt;/textarea&gt;
&lt;textarea class="textarea h-24" placeholder="Fixed height"&gt;&lt;/textarea&gt;</code></pre>
			</div>
		</div>
	</div>

	<!-- Textarea with Fieldset -->
	<div class="border rounded-lg p-6 bg-base-50">
		<h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
			<span class="badge badge-secondary badge-sm">Fieldset</span>
			Textarea with Fieldset
		</h3>
		<div class="grid md:grid-cols-2 gap-6">
			<div class="space-y-4">
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Your bio</legend>
					<textarea class="textarea h-24" placeholder="Tell us about yourself..."></textarea>
					<div class="label">Optional - will be displayed on your profile</div>
				</fieldset>
			</div>
			<div class="mockup-code text-sm">
				<pre><code>&lt;fieldset class="fieldset"&gt;
  &lt;legend class="fieldset-legend"&gt;Your bio&lt;/legend&gt;
  &lt;textarea class="textarea h-24" placeholder="Bio"&gt;&lt;/textarea&gt;
  &lt;div class="label"&gt;Optional&lt;/div&gt;
&lt;/fieldset&gt;</code></pre>
			</div>
		</div>
	</div>

	<!-- Textarea Sizes -->
	<div class="border rounded-lg p-6 bg-base-50">
		<h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
			<span class="badge badge-accent badge-sm">Sizes</span>
			Textarea Sizes
		</h3>
		<div class="grid md:grid-cols-2 gap-6">
			<div class="space-y-4">
				<textarea class="textarea textarea-xs" placeholder="Extra Small"></textarea>
				<textarea class="textarea textarea-sm" placeholder="Small"></textarea>
				<textarea class="textarea textarea-md" placeholder="Medium (default)"></textarea>
				<textarea class="textarea textarea-lg" placeholder="Large"></textarea>
			</div>
			<div class="mockup-code text-sm">
				<pre><code>&lt;textarea class="textarea textarea-xs" placeholder="Extra Small"&gt;&lt;/textarea&gt;
&lt;textarea class="textarea textarea-sm" placeholder="Small"&gt;&lt;/textarea&gt;
&lt;textarea class="textarea textarea-md" placeholder="Medium"&gt;&lt;/textarea&gt;
&lt;textarea class="textarea textarea-lg" placeholder="Large"&gt;&lt;/textarea&gt;</code></pre>
			</div>
		</div>
	</div>
</div>