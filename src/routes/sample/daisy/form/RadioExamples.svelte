<script>
	// Radio state examples
	let selectedPlan = $state('basic');
	let selectedColor = $state('blue');
	let selectedSize = $state('medium');
	let selectedTheme = $state('default');
	let selectedPayment = $state('credit');
	let selectedNotification = $state('email');
</script>

<div class="space-y-8">
	<!-- Basic Radio -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-neutral badge-sm">Basic</span>
			Basic Radio Buttons
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="radio" name="radio-1" class="radio" checked />
						<span class="label-text">Option 1 (checked)</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="radio" name="radio-1" class="radio" />
						<span class="label-text">Option 2</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="radio" name="radio-2" class="radio" checked disabled />
						<span class="label-text">Disabled checked</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="radio" name="radio-3" class="radio" disabled />
						<span class="label-text">Disabled unchecked</span>
					</label>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;label class="label cursor-pointer justify-start gap-4"&gt;
  &lt;input type="radio" name="radio-1" class="radio" checked /&gt;
  &lt;span class="label-text"&gt;Option 1&lt;/span&gt;
&lt;/label&gt;

&lt;!-- Disabled states --&gt;
&lt;input type="radio" name="radio-2" class="radio" checked disabled /&gt;
&lt;input type="radio" name="radio-3" class="radio" disabled /&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Radio Sizes -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-secondary badge-sm">Sizes</span>
			Radio Sizes
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="radio" name="radio-size" class="radio radio-xs" checked />
						<span class="label-text">Extra Small</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="radio" name="radio-size" class="radio radio-sm" />
						<span class="label-text">Small</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="radio" name="radio-size" class="radio radio-md" />
						<span class="label-text">Medium (default)</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="radio" name="radio-size" class="radio radio-lg" />
						<span class="label-text">Large</span>
					</label>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;input type="radio" name="radio-size" class="radio radio-xs" checked /&gt;
&lt;input type="radio" name="radio-size" class="radio radio-sm" /&gt;
&lt;input type="radio" name="radio-size" class="radio radio-md" /&gt;
&lt;input type="radio" name="radio-size" class="radio radio-lg" /&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Radio Colors -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-accent badge-sm">Colors</span>
			Radio Colors
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="radio" name="radio-color" class="radio radio-primary" checked />
						<span class="label-text">Primary</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="radio" name="radio-color" class="radio radio-secondary" />
						<span class="label-text">Secondary</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="radio" name="radio-color" class="radio radio-accent" />
						<span class="label-text">Accent</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="radio" name="radio-color" class="radio radio-success" />
						<span class="label-text">Success</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="radio" name="radio-color" class="radio radio-warning" />
						<span class="label-text">Warning</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="radio" name="radio-color" class="radio radio-error" />
						<span class="label-text">Error</span>
					</label>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;input type="radio" name="radio-color" class="radio radio-primary" checked /&gt;
&lt;input type="radio" name="radio-color" class="radio radio-secondary" /&gt;
&lt;input type="radio" name="radio-color" class="radio radio-accent" /&gt;
&lt;input type="radio" name="radio-color" class="radio radio-success" /&gt;
&lt;input type="radio" name="radio-color" class="radio radio-warning" /&gt;
&lt;input type="radio" name="radio-color" class="radio radio-error" /&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Radio Groups -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-primary badge-sm">Groups</span>
			Radio Button Groups
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-6">
				<!-- Plan selection -->
				<fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4">
					<legend class="fieldset-legend">Select Plan</legend>

					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-4">
							<input
								type="radio"
								name="plan"
								class="radio radio-primary"
								value="basic"
								bind:group={selectedPlan}
							/>
							<div>
								<div class="label-text font-medium">Basic Plan</div>
								<div class="label-text-alt">$9/month - Essential features</div>
							</div>
						</label>
					</div>

					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-4">
							<input
								type="radio"
								name="plan"
								class="radio radio-primary"
								value="pro"
								bind:group={selectedPlan}
							/>
							<div>
								<div class="label-text font-medium">Pro Plan</div>
								<div class="label-text-alt">$19/month - Advanced features</div>
							</div>
						</label>
					</div>

					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-4">
							<input
								type="radio"
								name="plan"
								class="radio radio-primary"
								value="enterprise"
								bind:group={selectedPlan}
							/>
							<div>
								<div class="label-text font-medium">Enterprise Plan</div>
								<div class="label-text-alt">$49/month - All features + support</div>
							</div>
						</label>
					</div>

					<div class="text-base-content/70 mt-2 text-sm">
						Selected: {selectedPlan}
					</div>
				</fieldset>

				<!-- Payment method -->
				<div class="space-y-2">
					<h4 class="font-medium">Payment Method</h4>

					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-4">
							<input
								type="radio"
								name="payment"
								class="radio radio-secondary"
								value="credit"
								bind:group={selectedPayment}
							/>
							<span class="label-text">Credit Card</span>
						</label>
					</div>

					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-4">
							<input
								type="radio"
								name="payment"
								class="radio radio-secondary"
								value="paypal"
								bind:group={selectedPayment}
							/>
							<span class="label-text">PayPal</span>
						</label>
					</div>

					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-4">
							<input
								type="radio"
								name="payment"
								class="radio radio-secondary"
								value="bank"
								bind:group={selectedPayment}
							/>
							<span class="label-text">Bank Transfer</span>
						</label>
					</div>

					<div class="text-base-content/70 text-sm">
						Selected: {selectedPayment}
					</div>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4"&gt;
  &lt;legend class="fieldset-legend"&gt;Select Plan&lt;/legend&gt;
  
  &lt;label class="label cursor-pointer justify-start gap-4"&gt;
    &lt;input 
      type="radio" 
      name="plan" 
      class="radio radio-primary"
      value="basic"
      bind:group={'{selectedPlan}'}
    /&gt;
    &lt;div&gt;
      &lt;div class="label-text font-medium"&gt;Basic Plan&lt;/div&gt;
      &lt;div class="label-text-alt"&gt;$9/month&lt;/div&gt;
    &lt;/div&gt;
  &lt;/label&gt;
&lt;/fieldset&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Button-style Radio -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-warning badge-sm">Styled</span>
			Button-style Radio Buttons
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<!-- Join buttons -->
				<div class="join">
					<input
						class="join-item btn btn-square"
						type="radio"
						name="size-options"
						aria-label="S"
						value="small"
						bind:group={selectedSize}
					/>
					<input
						class="join-item btn btn-square"
						type="radio"
						name="size-options"
						aria-label="M"
						value="medium"
						bind:group={selectedSize}
					/>
					<input
						class="join-item btn btn-square"
						type="radio"
						name="size-options"
						aria-label="L"
						value="large"
						bind:group={selectedSize}
					/>
					<input
						class="join-item btn btn-square"
						type="radio"
						name="size-options"
						aria-label="XL"
						value="extra-large"
						bind:group={selectedSize}
					/>
				</div>

				<!-- Vertical join buttons -->
				<div class="join join-vertical">
					<input
						type="radio"
						name="theme-buttons"
						class="btn theme-controller join-item"
						aria-label="Light"
						value="light"
						bind:group={selectedTheme}
					/>
					<input
						type="radio"
						name="theme-buttons"
						class="btn theme-controller join-item"
						aria-label="Dark"
						value="dark"
						bind:group={selectedTheme}
					/>
					<input
						type="radio"
						name="theme-buttons"
						class="btn theme-controller join-item"
						aria-label="Auto"
						value="auto"
						bind:group={selectedTheme}
					/>
				</div>

				<div class="text-base-content/70 text-sm">
					Size: {selectedSize} | Theme: {selectedTheme}
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;!-- Join buttons --&gt;
&lt;div class="join"&gt;
  &lt;input 
    class="join-item btn btn-square" 
    type="radio" 
    name="size-options" 
    aria-label="S"
    value="small"
    bind:group={'{selectedSize}'}
  /&gt;
  &lt;input 
    class="join-item btn btn-square" 
    type="radio" 
    name="size-options" 
    aria-label="M"
    value="medium"
    bind:group={'{selectedSize}'}
  /&gt;
&lt;/div&gt;

&lt;!-- Vertical join --&gt;
&lt;div class="join join-vertical"&gt;
  &lt;input 
    type="radio" 
    name="theme-buttons" 
    class="btn theme-controller join-item"
    aria-label="Light"
    value="light"
    bind:group={'{selectedTheme}'}
  /&gt;
&lt;/div&gt;</code
					></pre>
			</div>
		</div>
	</div>
</div>
