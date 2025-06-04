<div class="space-y-8">
	<!-- Regular Labels -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-neutral badge-sm">Regular</span>
			Regular Label Syntax
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<label class="input">
					<span class="label">Username</span>
					<input type="text" placeholder="Enter username" />
				</label>

				<label class="input">
					<span class="label">Email</span>
					<input type="email" placeholder="Enter email" />
				</label>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;label class="input"&gt;
  &lt;span class="label"&gt;Username&lt;/span&gt;
  &lt;input type="text" placeholder="Enter username" /&gt;
&lt;/label&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Floating Labels -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-secondary badge-sm">Floating</span>
			Floating Labels
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<label class="floating-label">
					<input type="text" placeholder="john@example.com" class="input input-md" />
					<span>Your Email</span>
				</label>

				<label class="floating-label">
					<input type="text" placeholder="John Doe" class="input input-md" />
					<span>Full Name</span>
				</label>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;label class="floating-label"&gt;
  &lt;input type="text" placeholder="john@example.com" class="input input-md" /&gt;
  &lt;span&gt;Your Email&lt;/span&gt;
&lt;/label&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Floating Label Sizes -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-accent badge-sm">Sizes</span>
			Floating Label Sizes
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<label class="floating-label">
					<input type="text" placeholder="Extra Small" class="input input-xs" />
					<span>Extra Small</span>
				</label>
				<label class="floating-label">
					<input type="text" placeholder="Small" class="input input-sm" />
					<span>Small</span>
				</label>
				<label class="floating-label">
					<input type="text" placeholder="Medium" class="input input-md" />
					<span>Medium</span>
				</label>
				<label class="floating-label">
					<input type="text" placeholder="Large" class="input input-lg" />
					<span>Large</span>
				</label>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;label class="floating-label"&gt;
  &lt;input type="text" placeholder="Small" class="input input-sm" /&gt;
  &lt;span&gt;Small&lt;/span&gt;
&lt;/label&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Fieldset Examples -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-primary badge-sm">Fieldset</span>
			Fieldset with Labels
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
					<legend class="fieldset-legend">Page details</legend>
					<label class="label">Title</label>
					<input type="text" class="input" placeholder="My awesome page" />
					<label class="label">Slug</label>
					<input type="text" class="input" placeholder="my-awesome-page" />
					<label class="label">Author</label>
					<input type="text" class="input" placeholder="Name" />
				</fieldset>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4"&gt;
  &lt;legend class="fieldset-legend"&gt;Page details&lt;/legend&gt;
  &lt;label class="label"&gt;Title&lt;/label&gt;
  &lt;input type="text" class="input" placeholder="My awesome page" /&gt;
  &lt;label class="label"&gt;Slug&lt;/label&gt;
  &lt;input type="text" class="input" placeholder="my-awesome-page" /&gt;
&lt;/fieldset&gt;</code
					></pre>
			</div>
		</div>
	</div>
</div>
