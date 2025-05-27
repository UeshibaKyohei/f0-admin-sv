<script>
	// Svelte 5 runes syntax
	let emailValue = $state('');
	let urlValue = $state('https://');
	let usernameValue = $state('');
	let passwordValue = $state('');
	let phoneValue = $state('');
	let numberValue = $state('');
	let dateValue = $state('');
	let selectValue = $state('');
	let checkboxChecked = $state(false);
	let toggleChecked = $state(false);

  const passwordPattern = '(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}';
	
	// Form submit handler
	function handleSubmit(event) {
		event.preventDefault();
		alert('Form submitted successfully!');
	}

</script>

<!-- Basic examples -->
<div class="space-y-6">
	<h3 class="text-lg font-semibold">Basic Validation</h3>
	
	<!-- Email validation -->
	<div class="form-control">
		<label class="label">
			<span class="label-text">Email Validation</span>
			<span class="label-text-alt">Native HTML5 validation</span>
		</label>
		<input 
			type="email" 
			class="input validator" 
			bind:value={emailValue}
			required 
			placeholder="[email protected]" 
		/>
		<div class="validator-hint">Enter valid email address</div>
	</div>
	
	<!-- URL validation -->
	<div class="form-control">
		<label class="label">
			<span class="label-text">URL Validation</span>
			<span class="label-text-alt">Must be valid URL format</span>
		</label>
		<input 
			type="url" 
			class="input validator" 
			bind:value={urlValue}
			required 
			placeholder="https://"
			pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9-].*[a-zA-Z0-9])?.)+[a-zA-Z].*$" 
			title="Must be valid URL" 
		/>
		<p class="validator-hint">Must be valid URL</p>
	</div>
</div>

<div class="divider"></div>

<!-- Pattern validation examples -->
<div class="space-y-6">
	<h3 class="text-lg font-semibold">Pattern Validation</h3>
	
	<!-- Username validation -->
	<div class="form-control">
		<label class="label">
			<span class="label-text">Username</span>
			<span class="label-text-alt">Letters, numbers, dash only</span>
		</label>
		<input 
			type="text" 
			class="input validator" 
			bind:value={usernameValue}
			required 
			placeholder="Username" 
			pattern="[A-Za-z][A-Za-z0-9\-]*" 
			minlength="3" 
			maxlength="30" 
			title="Only letters, numbers or dash" 
		/>
		<p class="validator-hint">
			Must be 3 to 30 characters<br/>
			containing only letters, numbers or dash
		</p>
	</div>
	
	<!-- Password validation -->
	<div class="form-control">
		<label class="label">
			<span class="label-text">Password</span>
			<span class="label-text-alt">Strong password required</span>
		</label>
		<input 
			type="password" 
			class="input validator" 
			bind:value={passwordValue}
			required 
			placeholder="Password" 
			minlength="8" 
			pattern={passwordPattern}
			title="Must be more than 8 characters, including number, lowercase letter, uppercase letter" 
		/>
		<p class="validator-hint">
			Must be more than 8 characters, including<br/>
			At least one number<br/>
			At least one lowercase letter<br/>
			At least one uppercase letter
		</p>
	</div>
	
	<!-- Phone validation -->
	<div class="form-control">
		<label class="label">
			<span class="label-text">Phone Number</span>
			<span class="label-text-alt">10 digits</span>
		</label>
		<input 
			type="tel" 
			class="input validator tabular-nums" 
			bind:value={phoneValue}
			required 
			placeholder="Phone" 
			pattern="[0-9]*" 
			minlength="10" 
			maxlength="10" 
			title="Must be 10 digits" 
		/>
		<p class="validator-hint">Must be 10 digits</p>
	</div>
</div>

<div class="divider"></div>

<!-- Range validation examples -->
<div class="space-y-6">
	<h3 class="text-lg font-semibold">Range & Date Validation</h3>
	
	<!-- Number range validation -->
	<div class="form-control">
		<label class="label">
			<span class="label-text">Number Range</span>
			<span class="label-text-alt">Between 1 and 10</span>
		</label>
		<input 
			type="number" 
			class="input validator" 
			bind:value={numberValue}
			required 
			placeholder="Type a number between 1 to 10" 
			min="1" 
			max="10"
			title="Must be between 1 to 10" 
		/>
		<p class="validator-hint">Must be between 1 to 10</p>
	</div>
	
	<!-- Date validation -->
	<div class="form-control">
		<label class="label">
			<span class="label-text">Date Selection</span>
			<span class="label-text-alt">Year 2025 only</span>
		</label>
		<input 
			type="date" 
			class="input validator" 
			bind:value={dateValue}
			required 
			placeholder="Pick a date in 2025" 
			min="2025-01-01" 
			max="2025-12-31"
			title="Must be in 2025" 
		/>
		<p class="validator-hint">Must be in 2025</p>
	</div>
</div>

<div class="divider"></div>

<!-- Other form controls with validation -->
<div class="space-y-6">
	<h3 class="text-lg font-semibold">Form Controls with Validation</h3>
	
	<!-- Select validation -->
	<div class="form-control">
		<label class="label">
			<span class="label-text">Required Selection</span>
		</label>
		<select class="select validator" bind:value={selectValue} required>
			<option disabled selected value="">Choose an option</option>
			<option value="tabs">Tabs</option>
			<option value="spaces">Spaces</option>
		</select>
		<p class="validator-hint">Required</p>
	</div>
	
	<!-- Checkbox validation -->
	<div class="form-control">
		<label class="label cursor-pointer">
			<span class="label-text">Terms and Conditions</span>
			<input 
				type="checkbox" 
				class="checkbox validator" 
				bind:checked={checkboxChecked}
				required 
				title="Required" 
			/>
		</label>
		<p class="validator-hint">You must accept the terms</p>
	</div>
	
	<!-- Toggle validation -->
	<div class="form-control">
		<label class="label cursor-pointer">
			<span class="label-text">Enable notifications</span>
			<input 
				type="checkbox" 
				class="toggle validator" 
				bind:checked={toggleChecked}
				required 
				title="Required" 
			/>
		</label>
		<p class="validator-hint">Required</p>
	</div>
</div>

<div class="divider"></div>

<!-- Complete form example -->
<div class="space-y-6">
	<h3 class="text-lg font-semibold">Complete Form Example</h3>
	
	<form onsubmit={handleSubmit} class="space-y-4">
		<fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-6">
			<legend class="fieldset-legend">User Registration</legend>
			
			<!-- Email with icon -->
			<div class="form-control mb-4">
				<label class="input validator">
					<svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
							<rect width="20" height="16" x="2" y="4" rx="2"></rect>
							<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
						</g>
					</svg>
					<input type="email" placeholder="[email protected]" required />
				</label>
				<div class="validator-hint">Enter valid email address</div>
			</div>
			
			<!-- Username with icon -->
			<div class="form-control mb-4">
				<label class="input validator">
					<svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
							<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
							<circle cx="12" cy="7" r="4"></circle>
						</g>
					</svg>
					<input 
						type="text"
						required
						placeholder="Username"
						pattern="[A-Za-z][A-Za-z0-9\-]*"
						minlength="3"
						maxlength="30"
						title="Only letters, numbers or dash"
					/>
				</label>
				<p class="validator-hint">
					Must be 3 to 30 characters<br/>
					containing only letters, numbers or dash
				</p>
			</div>
			
			<!-- Password with icon -->
			<div class="form-control mb-4">
				<label class="input validator">
					<svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
							<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
							<circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
						</g>
					</svg>
					<input
						type="password"
						required
						placeholder="Password"
						minlength="8"
						pattern={passwordPattern}
						title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
					/>
				</label>
				<p class="validator-hint">
					Must be more than 8 characters, including<br/>
					At least one number<br/>
					At least one lowercase letter<br/>
					At least one uppercase letter
				</p>
			</div>
			
			<!-- Submit button -->
			<button class="btn btn-primary w-full" type="submit">
				Register
			</button>
		</fieldset>
	</form>
</div>

<div class="divider"></div>

<!-- Validation states showcase -->
<div class="space-y-6">
	<h3 class="text-lg font-semibold">Validation States</h3>
	
	<div class="alert alert-info">
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
		</svg>
		<div>
			<p class="font-semibold">How DaisyUI Validator Works</p>
			<p class="text-sm">
				The <code class="badge badge-sm">validator</code> class automatically applies error or success styling 
				based on HTML5 validation attributes. Invalid inputs show error styles, valid inputs show success styles.
			</p>
		</div>
	</div>
	
	<!-- Examples of different states -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<!-- Invalid state example -->
		<div class="form-control">
			<label class="label">
				<span class="label-text">Invalid State (type invalid email)</span>
			</label>
			<input 
				type="email" 
				class="input validator" 
				value="invalid-email"
				required 
			/>
			<div class="validator-hint">This shows when invalid</div>
		</div>
		
		<!-- Valid state example -->
		<div class="form-control">
			<label class="label">
				<span class="label-text">Valid State</span>
			</label>
			<input 
				type="email" 
				class="input validator" 
				value="valid@email.com"
				required 
			/>
			<div class="validator-hint">This hides when valid</div>
		</div>
	</div>
</div>

<!-- Code examples -->
<div class="divider"></div>

<div class="space-y-6">
	<h3 class="text-lg font-semibold">Code Examples</h3>
	
	<div class="mockup-code">
		<pre><code>{`<!-- Basic validator usage -->
<input type="email" class="input validator" required />
<div class="validator-hint">Enter valid email</div>

<!-- With pattern validation -->
<input 
  type="text" 
  class="input validator" 
  pattern="[A-Za-z][A-Za-z0-9-]*" 
  minlength="3" 
  maxlength="30"
  required 
/>
<p class="validator-hint">3-30 chars, letters/numbers/dash</p>

<!-- Other form controls -->
<select class="select validator" required>
  <option value="">Choose...</option>
  <option>Option 1</option>
</select>

<input type="checkbox" class="checkbox validator" required />
<input type="checkbox" class="toggle validator" required />`}</code></pre>
	</div>
</div>