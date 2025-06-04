<script>
	// File input state examples
	let selectedFiles = $state(null);
	let profileImage = $state(null);
	let documents = $state(null);
	let csvFile = $state(null);

	// Handle file selection
	function handleFileChange(event) {
		const files = event.target.files;
		if (files && files.length > 0) {
			selectedFiles = files;
		}
	}

	function handleProfileImageChange(event) {
		const files = event.target.files;
		if (files && files.length > 0) {
			profileImage = files[0];
		}
	}

	function handleDocumentsChange(event) {
		const files = event.target.files;
		if (files && files.length > 0) {
			documents = files;
		}
	}

	function handleCsvChange(event) {
		const files = event.target.files;
		if (files && files.length > 0) {
			csvFile = files[0];
		}
	}

	function clearFiles() {
		selectedFiles = null;
		profileImage = null;
		documents = null;
		csvFile = null;
	}

	function formatFileSize(bytes) {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
</script>

<div class="space-y-8">
	<!-- Basic File Input -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-neutral badge-sm">Basic</span>
			Basic File Input
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text">Choose file</span>
					</label>
					<input type="file" class="file-input" onchange={handleFileChange} />
					{#if selectedFiles && selectedFiles.length > 0}
						<label class="label">
							<span class="label-text-alt"
								>Selected: {selectedFiles[0].name} ({formatFileSize(selectedFiles[0].size)})</span
							>
						</label>
					{/if}
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Profile image</span>
					</label>
					<input
						type="file"
						class="file-input file-input-primary"
						accept="image/*"
						onchange={handleProfileImageChange}
					/>
					{#if profileImage}
						<label class="label">
							<span class="label-text-alt">✅ {profileImage.name}</span>
						</label>
					{/if}
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Multiple documents</span>
					</label>
					<input
						type="file"
						class="file-input file-input-secondary"
						multiple
						accept=".pdf,.doc,.docx,.txt"
						onchange={handleDocumentsChange}
					/>
					{#if documents && documents.length > 0}
						<label class="label">
							<span class="label-text-alt">📎 {documents.length} file(s) selected</span>
						</label>
					{/if}
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Disabled file input</span>
					</label>
					<input type="file" class="file-input" disabled />
				</div>

				{#if selectedFiles || profileImage || documents || csvFile}
					<button class="btn btn-outline btn-sm" onclick={clearFiles}> Clear all files </button>
				{/if}
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;input type="file" class="file-input" onchange={'{handleFileChange}'} /&gt;

&lt;!-- With colors --&gt;
&lt;input type="file" class="file-input file-input-primary" accept="image/*" /&gt;
&lt;input type="file" class="file-input file-input-secondary" multiple /&gt;

&lt;!-- Accept specific file types --&gt;
&lt;input 
  type="file" 
  class="file-input" 
  accept=".pdf,.doc,.docx,.txt"
  multiple
/&gt;

&lt;!-- Disabled --&gt;
&lt;input type="file" class="file-input" disabled /&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- File Input Sizes -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-secondary badge-sm">Sizes</span>
			File Input Sizes
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text">Extra Small</span>
					</label>
					<input type="file" class="file-input file-input-xs" />
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Small</span>
					</label>
					<input type="file" class="file-input file-input-sm" />
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Medium (default)</span>
					</label>
					<input type="file" class="file-input file-input-md" />
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Large</span>
					</label>
					<input type="file" class="file-input file-input-lg" />
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;input type="file" class="file-input file-input-xs" /&gt;
&lt;input type="file" class="file-input file-input-sm" /&gt;
&lt;input type="file" class="file-input file-input-md" /&gt;
&lt;input type="file" class="file-input file-input-lg" /&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- File Input Colors -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-accent badge-sm">Colors</span>
			File Input Colors
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text">Primary</span>
					</label>
					<input type="file" class="file-input file-input-primary" />
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Secondary</span>
					</label>
					<input type="file" class="file-input file-input-secondary" />
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Accent</span>
					</label>
					<input type="file" class="file-input file-input-accent" />
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Success</span>
					</label>
					<input type="file" class="file-input file-input-success" />
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Warning</span>
					</label>
					<input type="file" class="file-input file-input-warning" />
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Error</span>
					</label>
					<input type="file" class="file-input file-input-error" />
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;input type="file" class="file-input file-input-primary" /&gt;
&lt;input type="file" class="file-input file-input-secondary" /&gt;
&lt;input type="file" class="file-input file-input-accent" /&gt;
&lt;input type="file" class="file-input file-input-success" /&gt;
&lt;input type="file" class="file-input file-input-warning" /&gt;
&lt;input type="file" class="file-input file-input-error" /&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- File Input with Fieldset -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-primary badge-sm">Fieldset</span>
			File Input with Fieldset
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4">
					<legend class="fieldset-legend">Upload Documents</legend>
					<input
						type="file"
						class="file-input file-input-primary"
						multiple
						accept=".pdf,.doc,.docx"
					/>
					<label class="label">
						<span class="label-text-alt">Max size: 10MB per file</span>
					</label>
				</fieldset>

				<fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4">
					<legend class="fieldset-legend">CSV Data Import</legend>
					<input
						type="file"
						class="file-input file-input-accent"
						accept=".csv"
						onchange={handleCsvChange}
					/>
					<label class="label">
						<span class="label-text-alt">Only CSV files are allowed</span>
					</label>
					{#if csvFile}
						<div class="alert alert-success mt-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6 shrink-0 stroke-current"
								fill="none"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span>CSV file ready: {csvFile.name}</span>
						</div>
					{/if}
				</fieldset>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4"&gt;
  &lt;legend class="fieldset-legend"&gt;Upload Documents&lt;/legend&gt;
  &lt;input 
    type="file" 
    class="file-input file-input-primary" 
    multiple
    accept=".pdf,.doc,.docx"
  /&gt;
  &lt;label class="label"&gt;
    &lt;span class="label-text-alt"&gt;Max size: 10MB per file&lt;/span&gt;
  &lt;/label&gt;
&lt;/fieldset&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Advanced File Input -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-warning badge-sm">UI Samples</span>
			Advanced File Input UI Patterns
		</h3>
		<div class="alert alert-info mb-4">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="h-6 w-6 shrink-0 stroke-current"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				></path>
			</svg>
			<span
				>These are UI design samples. Drag & drop and preview functionality require additional
				JavaScript implementation.</span
			>
		</div>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<!-- Drag and drop area simulation -->
				<div class="form-control w-full">
					<label class="label">
						<span class="label-text">Drag & Drop Style UI (click to select files)</span>
					</label>
					<div class="w-full">
						<label
							class="border-base-300 hover:border-primary hover:bg-base-100 block w-full cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200"
						>
							<input type="file" class="sr-only" multiple accept="image/*" />
							<div class="space-y-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="text-base-content/50 mx-auto h-12 w-12"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
									/>
								</svg>
								<div class="text-base-content/70 text-sm">Click to upload or drag and drop</div>
								<div class="text-base-content/50 text-xs">PNG, JPG, GIF up to 10MB</div>
							</div>
						</label>
					</div>
					<label class="label">
						<span class="label-text-alt"
							>⚠️ UI sample - drag & drop requires custom JS implementation</span
						>
					</label>
				</div>

				<!-- File input with preview -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Image with preview area (UI sample)</span>
					</label>
					<div class="flex items-start gap-4">
						<input type="file" class="file-input file-input-sm" accept="image/*" />
						<div
							class="border-base-300 text-base-content/50 bg-base-100 flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed text-xs"
						>
							<div class="text-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="mx-auto mb-1 h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
								Preview
							</div>
						</div>
					</div>
					<label class="label">
						<span class="label-text-alt"
							>⚠️ Preview functionality requires custom implementation</span
						>
					</label>
				</div>

				<!-- Ghost style file input -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Ghost style file input</span>
					</label>
					<input type="file" class="file-input file-input-ghost" />
					<label class="label">
						<span class="label-text-alt">✅ This style works without additional code</span>
					</label>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;!-- Drag & drop UI sample --&gt;
&lt;div class="w-full"&gt;
  &lt;label class="w-full block border-2 border-dashed border-base-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-base-100 transition-all duration-200"&gt;
    &lt;input type="file" class="sr-only" multiple accept="image/*" /&gt;
    &lt;div class="space-y-2"&gt;
      &lt;svg class="h-12 w-12 mx-auto text-base-content/50" ...&gt;&lt;/svg&gt;
      &lt;div class="text-sm text-base-content/70"&gt;
        Click to upload or drag and drop
      &lt;/div&gt;
      &lt;div class="text-xs text-base-content/50"&gt;
        PNG, JPG, GIF up to 10MB
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/label&gt;
&lt;/div&gt;

&lt;!-- Preview area UI sample --&gt;
&lt;div class="flex gap-4 items-start"&gt;
  &lt;input type="file" class="file-input file-input-sm" accept="image/*" /&gt;
  &lt;div class="w-20 h-20 border-2 border-dashed border-base-300 rounded-lg flex items-center justify-center"&gt;
    Preview
  &lt;/div&gt;
&lt;/div&gt;

&lt;!-- Working ghost style --&gt;
&lt;input type="file" class="file-input file-input-ghost" /&gt;</code
					></pre>
			</div>
		</div>
	</div>
</div>
