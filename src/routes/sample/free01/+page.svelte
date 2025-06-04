<script>
</script>

<div class="stepper-container">
	<svg width="900" height="60">
		<!-- 線（進捗済み） -->
		<line x1="45" y1="30" x2="405" y2="30" stroke="#4bb543" stroke-width="4" />
		<!-- 線（未到達） -->
		<line x1="405" y1="30" x2="855" y2="30" stroke="#ccc" stroke-width="4" />
		<!-- 円（進捗済み） -->
		<circle cx="45" cy="30" r="18" fill="#4bb543" />
		<circle cx="135" cy="30" r="18" fill="#4bb543" />
		<circle cx="225" cy="30" r="18" fill="#4bb543" />
		<circle cx="315" cy="30" r="18" fill="#4bb543" />
		<circle cx="405" cy="30" r="18" fill="#4bb543" />
		<!-- 円（未到達） -->
		<circle cx="495" cy="30" r="18" fill="#ccc" />
		<circle cx="585" cy="30" r="18" fill="#ccc" />
		<circle cx="675" cy="30" r="18" fill="#ccc" />
		<circle cx="765" cy="30" r="18" fill="#ccc" />
		<circle cx="855" cy="30" r="18" fill="#ccc" />
		<!-- 番号 -->
		<text x="45" y="36" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">1</text>
		<text x="135" y="36" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">2</text>
		<text x="225" y="36" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">3</text>
		<text x="315" y="36" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">4</text>
		<text x="405" y="36" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">5</text>
		<text x="495" y="36" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">6</text>
		<text x="585" y="36" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">7</text>
		<text x="675" y="36" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">8</text>
		<text x="765" y="36" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">9</text>
		<text x="855" y="36" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">10</text
		>
	</svg>
	<div class="step-labels">
		<div class="step-label">Step 1</div>
		<div class="step-label">Step 2</div>
		<div class="step-label">Step 3</div>
		<div class="step-label">Step 4</div>
		<div class="step-label">Step 5</div>
		<div class="step-label">Step 6</div>
		<div class="step-label">Step 7</div>
		<div class="step-label">Step 8</div>
		<div class="step-label">Step 9</div>
		<div class="step-label">Step 10</div>
	</div>
</div>

<style>
	.stepper-container {
		width: 900px;
		margin: 40px auto;
		text-align: center;
	}
	.step-labels {
		display: flex;
		justify-content: space-between;
		width: 900px;
		margin: 0 auto;
		position: relative;
		top: -10px;
	}
	.step-label {
		width: 60px;
		text-align: center;
		font-size: 12px;
		color: #666;
	}
</style>
