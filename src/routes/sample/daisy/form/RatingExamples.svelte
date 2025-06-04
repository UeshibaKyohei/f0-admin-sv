<script>
	// Rating state examples
	let basicRating = $state(3);
	let productRating = $state(4);
	let serviceRating = $state(2);
	let halfStarRating = $state(2.5);
	let customRating = $state(3);

	// Interactive ratings
	let interactiveRating = $state(0);
	let reviewRating = $state(0);

	function setRating(rating, value) {
		if (rating === 'basic') basicRating = value;
		else if (rating === 'product') productRating = value;
		else if (rating === 'service') serviceRating = value;
		else if (rating === 'interactive') interactiveRating = value;
		else if (rating === 'review') reviewRating = value;
	}

	function setHalfStarRating(value) {
		halfStarRating = value;
	}

	// Rating labels
	const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
</script>

<div class="space-y-8">
	<!-- Basic Rating -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-neutral badge-sm">Basic</span>
			Basic Star Rating
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text">Product rating</span>
						<span class="label-text-alt">{basicRating}/5 stars</span>
					</label>
					<div class="rating">
						<input
							type="radio"
							name="rating-1"
							class="rating-hidden"
							bind:group={basicRating}
							value={0}
						/>
						{#each [1, 2, 3, 4, 5] as star}
							<input
								type="radio"
								name="rating-1"
								class="mask mask-star-2 bg-orange-400"
								aria-label="{star} star"
								bind:group={basicRating}
								value={star}
							/>
						{/each}
					</div>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Service quality</span>
						<span class="label-text-alt"
							>{serviceRating}/5 - {ratingLabels[serviceRating] || 'Not rated'}</span
						>
					</label>
					<div class="rating">
						<input
							type="radio"
							name="rating-2"
							class="rating-hidden"
							bind:group={serviceRating}
							value={0}
						/>
						{#each [1, 2, 3, 4, 5] as star}
							<input
								type="radio"
								name="rating-2"
								class="mask mask-star-2 bg-yellow-400"
								aria-label="{star} star"
								bind:group={serviceRating}
								value={star}
							/>
						{/each}
					</div>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Read-only rating (4.5/5)</span>
					</label>
					<div class="rating">
						<input type="radio" class="mask mask-star-2 bg-green-500" disabled />
						<input type="radio" class="mask mask-star-2 bg-green-500" disabled checked />
						<input type="radio" class="mask mask-star-2 bg-green-500" disabled checked />
						<input type="radio" class="mask mask-star-2 bg-green-500" disabled checked />
						<input type="radio" class="mask mask-star-2 bg-green-500" disabled checked />
					</div>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;div class="rating"&gt;
  &lt;input type="radio" name="rating-1" class="rating-hidden" bind:group={'{basicRating}'} value={'{0}'} /&gt;
  {'{#each [1, 2, 3, 4, 5] as star}'}
    &lt;input 
      type="radio" 
      name="rating-1" 
      class="mask mask-star-2 bg-orange-400" 
      aria-label="{'{star}'} star" 
      bind:group={'{basicRating}'}
      value={'{star}'}
    /&gt;
  {'{/each}'}
&lt;/div&gt;

&lt;!-- Read-only rating --&gt;
&lt;div class="rating"&gt;
  &lt;input type="radio" class="mask mask-star-2 bg-green-500" disabled checked /&gt;
&lt;/div&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Rating Sizes -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-secondary badge-sm">Sizes</span>
			Rating Sizes
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text">Extra Small (xs)</span>
					</label>
					<div class="rating rating-xs">
						{#each [1, 2, 3, 4, 5] as star}
							<input
								type="radio"
								name="rating-xs"
								class="mask mask-star-2 bg-orange-400"
								checked={star <= 3}
							/>
						{/each}
					</div>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Small (sm)</span>
					</label>
					<div class="rating rating-sm">
						{#each [1, 2, 3, 4, 5] as star}
							<input
								type="radio"
								name="rating-sm"
								class="mask mask-star-2 bg-orange-400"
								checked={star <= 3}
							/>
						{/each}
					</div>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Medium (default)</span>
					</label>
					<div class="rating rating-md">
						{#each [1, 2, 3, 4, 5] as star}
							<input
								type="radio"
								name="rating-md"
								class="mask mask-star-2 bg-orange-400"
								checked={star <= 3}
							/>
						{/each}
					</div>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Large (lg)</span>
					</label>
					<div class="rating rating-lg">
						{#each [1, 2, 3, 4, 5] as star}
							<input
								type="radio"
								name="rating-lg"
								class="mask mask-star-2 bg-orange-400"
								checked={star <= 3}
							/>
						{/each}
					</div>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;div class="rating rating-xs"&gt;
  {'{#each [1, 2, 3, 4, 5] as star}'}
    &lt;input type="radio" name="rating-xs" class="mask mask-star-2 bg-orange-400" /&gt;
  {'{/each}'}
&lt;/div&gt;

&lt;div class="rating rating-sm"&gt;...&lt;/div&gt;
&lt;div class="rating rating-md"&gt;...&lt;/div&gt;
&lt;div class="rating rating-lg"&gt;...&lt;/div&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Half Star Rating -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-accent badge-sm">Half Stars</span>
			Half Star Rating
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text">Half star rating</span>
						<span class="label-text-alt">{halfStarRating}/5 stars</span>
					</label>
					<div class="rating rating-half">
						<input
							type="radio"
							name="rating-half"
							class="rating-hidden"
							bind:group={halfStarRating}
							value={0}
						/>
						<input
							type="radio"
							name="rating-half"
							class="mask mask-star-2 mask-half-1 bg-green-500"
							aria-label="0.5 star"
							bind:group={halfStarRating}
							value={0.5}
						/>
						<input
							type="radio"
							name="rating-half"
							class="mask mask-star-2 mask-half-2 bg-green-500"
							aria-label="1 star"
							bind:group={halfStarRating}
							value={1}
						/>
						<input
							type="radio"
							name="rating-half"
							class="mask mask-star-2 mask-half-1 bg-green-500"
							aria-label="1.5 star"
							bind:group={halfStarRating}
							value={1.5}
						/>
						<input
							type="radio"
							name="rating-half"
							class="mask mask-star-2 mask-half-2 bg-green-500"
							aria-label="2 star"
							bind:group={halfStarRating}
							value={2}
						/>
						<input
							type="radio"
							name="rating-half"
							class="mask mask-star-2 mask-half-1 bg-green-500"
							aria-label="2.5 star"
							bind:group={halfStarRating}
							value={2.5}
						/>
						<input
							type="radio"
							name="rating-half"
							class="mask mask-star-2 mask-half-2 bg-green-500"
							aria-label="3 star"
							bind:group={halfStarRating}
							value={3}
						/>
						<input
							type="radio"
							name="rating-half"
							class="mask mask-star-2 mask-half-1 bg-green-500"
							aria-label="3.5 star"
							bind:group={halfStarRating}
							value={3.5}
						/>
						<input
							type="radio"
							name="rating-half"
							class="mask mask-star-2 mask-half-2 bg-green-500"
							aria-label="4 star"
							bind:group={halfStarRating}
							value={4}
						/>
						<input
							type="radio"
							name="rating-half"
							class="mask mask-star-2 mask-half-1 bg-green-500"
							aria-label="4.5 star"
							bind:group={halfStarRating}
							value={4.5}
						/>
						<input
							type="radio"
							name="rating-half"
							class="mask mask-star-2 mask-half-2 bg-green-500"
							aria-label="5 star"
							bind:group={halfStarRating}
							value={5}
						/>
					</div>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Display-only half star (3.5/5)</span>
					</label>
					<div class="rating rating-half">
						<input type="radio" class="mask mask-star-2 mask-half-1 bg-blue-500" disabled />
						<input type="radio" class="mask mask-star-2 mask-half-2 bg-blue-500" disabled checked />
						<input type="radio" class="mask mask-star-2 mask-half-1 bg-blue-500" disabled />
						<input type="radio" class="mask mask-star-2 mask-half-2 bg-blue-500" disabled checked />
						<input type="radio" class="mask mask-star-2 mask-half-1 bg-blue-500" disabled />
						<input type="radio" class="mask mask-star-2 mask-half-2 bg-blue-500" disabled checked />
						<input type="radio" class="mask mask-star-2 mask-half-1 bg-blue-500" disabled checked />
						<input type="radio" class="mask mask-star-2 mask-half-2 bg-blue-500" disabled />
						<input type="radio" class="mask mask-star-2 mask-half-1 bg-blue-500" disabled />
						<input type="radio" class="mask mask-star-2 mask-half-2 bg-blue-500" disabled />
					</div>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;div class="rating rating-half"&gt;
  &lt;input type="radio" name="rating-half" class="rating-hidden" bind:group={'{halfStarRating}'} value={'{0}'} /&gt;
  &lt;input type="radio" name="rating-half" class="mask mask-star-2 mask-half-1 bg-green-500" aria-label="0.5 star" bind:group={'{halfStarRating}'} value={'{0.5}'} /&gt;
  &lt;input type="radio" name="rating-half" class="mask mask-star-2 mask-half-2 bg-green-500" aria-label="1 star" bind:group={'{halfStarRating}'} value={'{1}'} /&gt;
  &lt;input type="radio" name="rating-half" class="mask mask-star-2 mask-half-1 bg-green-500" aria-label="1.5 star" bind:group={'{halfStarRating}'} value={'{1.5}'} /&gt;
  &lt;!-- ... more half-star inputs ... --&gt;
&lt;/div&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Custom Rating Colors -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-primary badge-sm">Colors</span>
			Custom Rating Colors
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text">Orange stars (classic)</span>
					</label>
					<div class="rating">
						{#each [1, 2, 3, 4, 5] as star}
							<input
								type="radio"
								name="rating-orange"
								class="mask mask-star-2 bg-orange-400"
								checked={star <= 4}
							/>
						{/each}
					</div>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Red hearts</span>
					</label>
					<div class="rating">
						{#each [1, 2, 3, 4, 5] as star}
							<input
								type="radio"
								name="rating-hearts"
								class="mask mask-heart bg-red-400"
								checked={star <= 3}
							/>
						{/each}
					</div>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Blue stars</span>
					</label>
					<div class="rating">
						{#each [1, 2, 3, 4, 5] as star}
							<input
								type="radio"
								name="rating-blue"
								class="mask mask-star bg-blue-400"
								checked={star <= 2}
							/>
						{/each}
					</div>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Purple stars (large)</span>
					</label>
					<div class="rating rating-lg">
						{#each [1, 2, 3, 4, 5] as star}
							<input
								type="radio"
								name="rating-purple"
								class="mask mask-star-2 bg-purple-400"
								checked={star <= 5}
							/>
						{/each}
					</div>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;!-- Orange stars --&gt;
&lt;div class="rating"&gt;
  {'{#each [1, 2, 3, 4, 5] as star}'}
    &lt;input 
      type="radio" 
      name="rating-orange" 
      class="mask mask-star-2 bg-orange-400" 
    /&gt;
  {'{/each}'}
&lt;/div&gt;

&lt;!-- Hearts --&gt;
&lt;div class="rating"&gt;
  {'{#each [1, 2, 3, 4, 5] as star}'}
    &lt;input 
      type="radio" 
      name="rating-hearts" 
      class="mask mask-heart bg-red-400" 
    /&gt;
  {'{/each}'}
&lt;/div&gt;</code
					></pre>
			</div>
		</div>
	</div>

	<!-- Interactive Rating with Feedback -->
	<div class="bg-base-50 rounded-lg border p-6">
		<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
			<span class="badge badge-warning badge-sm">Interactive</span>
			Interactive Rating with Feedback
		</h3>
		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-6">
				<!-- Product review form -->
				<div class="card bg-base-100 shadow-sm">
					<div class="card-body">
						<h4 class="card-title text-lg">Rate this product</h4>

						<div class="form-control">
							<label class="label">
								<span class="label-text">Overall rating</span>
								<span class="label-text-alt"
									>{ratingLabels[interactiveRating] || 'Click to rate'}</span
								>
							</label>
							<div class="rating rating-lg">
								<input
									type="radio"
									name="rating-interactive"
									class="rating-hidden"
									bind:group={interactiveRating}
									value={0}
								/>
								{#each [1, 2, 3, 4, 5] as star}
									<input
										type="radio"
										name="rating-interactive"
										class="mask mask-star-2 bg-yellow-400 transition-colors hover:bg-yellow-500"
										aria-label="{star} star"
										bind:group={interactiveRating}
										value={star}
									/>
								{/each}
							</div>
						</div>

						{#if interactiveRating > 0}
							<div class="alert alert-info">
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
									>You rated this product {interactiveRating} out of 5 stars ({ratingLabels[
										interactiveRating
									]})</span
								>
							</div>
						{/if}

						<div class="card-actions justify-end">
							<button class="btn btn-primary btn-sm" disabled={interactiveRating === 0}>
								Submit Review
							</button>
							<button class="btn btn-ghost btn-sm" onclick={() => (interactiveRating = 0)}>
								Clear
							</button>
						</div>
					</div>
				</div>

				<!-- Quick rating -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Quick service rating</span>
						<span class="label-text-alt">{reviewRating}/5</span>
					</label>
					<div class="flex items-center gap-4">
						<div class="rating">
							<input
								type="radio"
								name="rating-review"
								class="rating-hidden"
								bind:group={reviewRating}
								value={0}
							/>
							{#each [1, 2, 3, 4, 5] as star}
								<input
									type="radio"
									name="rating-review"
									class="mask mask-star-2 bg-orange-400"
									aria-label="{star} star"
									bind:group={reviewRating}
									value={star}
								/>
							{/each}
						</div>
						{#if reviewRating > 0}
							<span class="text-base-content/70 text-sm">
								{ratingLabels[reviewRating]}
							</span>
						{/if}
					</div>
				</div>
			</div>
			<div class="mockup-code text-sm">
				<pre><code
						>&lt;div class="card bg-base-100 shadow-sm"&gt;
  &lt;div class="card-body"&gt;
    &lt;h4 class="card-title text-lg"&gt;Rate this product&lt;/h4&gt;
    
    &lt;div class="form-control"&gt;
      &lt;label class="label"&gt;
        &lt;span class="label-text"&gt;Overall rating&lt;/span&gt;
        &lt;span class="label-text-alt"&gt;{"{ratingLabels[interactiveRating] || 'Click to rate'}"}&lt;/span&gt;
      &lt;/label&gt;
      &lt;div class="rating rating-lg"&gt;
        &lt;input type="radio" name="rating-interactive" class="rating-hidden" bind:group={'{interactiveRating}'} value={'{0}'} /&gt;
        {'{#each [1, 2, 3, 4, 5] as star}'}
          &lt;input 
            type="radio" 
            name="rating-interactive" 
            class="mask mask-star-2 bg-yellow-400 hover:bg-yellow-500 transition-colors" 
            bind:group={'{interactiveRating}'}
            value={'{star}'}
          /&gt;
        {'{/each}'}
      &lt;/div&gt;
    &lt;/div&gt;
    
    {'{#if interactiveRating > 0}'}
      &lt;div class="alert alert-info"&gt;
        &lt;span&gt;You rated this product {'{interactiveRating}'} out of 5 stars&lt;/span&gt;
      &lt;/div&gt;
    {'{/if}'}
  &lt;/div&gt;
&lt;/div&gt;</code
					></pre>
			</div>
		</div>
	</div>
</div>
