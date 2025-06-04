<script>
	import { get } from 'svelte/store';
	import {
		waitingInquiries,
		operators,
		operatorLoad,
		currentOperator,
		requestAssignInquiry,
		acceptAssignment,
		assignToSelf,
		inquiryCategories,
		priorities,
		selectedChatId,
		activeChats,
		getCurrentOperatorCapacity
	} from './supportStore.js';

	// 親コンポーネントからビューモード切り替え関数を受け取る
	let { onAssignComplete = () => {} } = $props();

	let selectedInquiry = $state(null);
	let assignError = $state('');
	let sortBy = $state('priority'); // priority, time, category
	let filterCategory = $state('all');

	// 現在のオペレーターの容量状況をリアクティブに取得
	const myCapacity = $derived.by(() => {
		if (!$currentOperator) return null;
		const myActiveChats = $activeChats.filter((chat) => chat.assignedTo === $currentOperator.id);
		return {
			current: myActiveChats.length,
			max: $currentOperator.maxConcurrent,
			isAtCapacity: myActiveChats.length >= $currentOperator.maxConcurrent,
			canTakeMore: myActiveChats.length < $currentOperator.maxConcurrent
		};
	});

	// 問い合わせをソート
	const sortedInquiries = $derived.by(() => {
		let inquiries = [...$waitingInquiries];

		// カテゴリフィルター
		if (filterCategory !== 'all') {
			inquiries = inquiries.filter((inq) => inq.category === filterCategory);
		}

		// ソート
		switch (sortBy) {
			case 'priority':
				const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
				inquiries.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
				break;
			case 'time':
				inquiries.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
				break;
			case 'category':
				inquiries.sort((a, b) => a.category.localeCompare(b.category));
				break;
		}

		return inquiries;
	});

	// SLAまでの残り時間を計算
	function getTimeUntilSLA(deadline) {
		const now = new Date();
		const sla = new Date(deadline);
		const diff = sla - now;

		if (diff < 0) return { text: 'SLA超過', isOverdue: true };

		const minutes = Math.floor(diff / 1000 / 60);
		if (minutes < 60) {
			return { text: `残${minutes}分`, isOverdue: false };
		}

		const hours = Math.floor(minutes / 60);
		return { text: `残${hours}時間`, isOverdue: false };
	}

	// 問い合わせを選択
	function selectInquiry(inquiry) {
		selectedInquiry = inquiry;
		assignError = '';
	}

	// 自分に割り当て
	async function assignToMe() {
		if (!selectedInquiry || !$currentOperator) return;

		// 現在の対応数をチェック
		if (!myCapacity || myCapacity.isAtCapacity) {
			assignError = `対応可能な上限（${myCapacity?.max || 3}件）に達しています`;
			return;
		}

		try {
			// 自分への割り当ては専用関数を使用（通知をスキップ）
			await assignToSelf(selectedInquiry.id);
			selectedInquiry = null;
			assignError = '';
			// 割り当て完了を親コンポーネントに通知
			console.log('Calling onAssignComplete');
			onAssignComplete();
		} catch (error) {
			assignError = error.message;
		}
	}

	// 特定のオペレーターに割り当て
	async function assignToOperator(operatorId) {
		if (!selectedInquiry) return;

		try {
			await requestAssignInquiry(selectedInquiry.id, operatorId);
			selectedInquiry = null;
			assignError = '';
		} catch (error) {
			assignError = error.message;
		}
	}

	// 推奨オペレーターを取得
	function getRecommendedOperators(inquiry) {
		return $operatorLoad
			.filter((op) => op.canTakeMore)
			.sort((a, b) => {
				// スキルマッチングを優先
				const aHasSkill = hasRelevantSkill(a, inquiry.category);
				const bHasSkill = hasRelevantSkill(b, inquiry.category);

				if (aHasSkill && !bHasSkill) return -1;
				if (!aHasSkill && bHasSkill) return 1;

				// 負荷が低い順
				return a.load - b.load;
			})
			.slice(0, 3);
	}

	// スキルマッチング
	function hasRelevantSkill(operator, category) {
		const skillMap = {
			return: '返品対応',
			shipping: '配送問い合わせ',
			product: '一般問い合わせ',
			technical: '技術サポート',
			billing: '一般問い合わせ'
		};

		return operator.skills.includes(skillMap[category] || '一般問い合わせ');
	}
</script>

<div class="flex h-full w-full">
	<!-- 問い合わせリスト -->
	<div class="bg-base-100 border-base-300 flex w-1/2 flex-shrink-0 flex-col border-r">
		<!-- ヘッダー -->
		<div class="border-base-300 border-b p-4">
			<div class="mb-3 flex items-center justify-between">
				<h2 class="text-lg font-bold">
					待機中の問い合わせ ({sortedInquiries.length})
				</h2>

				<!-- ソート -->
				<select bind:value={sortBy} class="select select-sm select-bordered">
					<option value="priority">優先度順</option>
					<option value="time">受付時間順</option>
					<option value="category">カテゴリ順</option>
				</select>
			</div>

			<!-- カテゴリフィルター -->
			<div class="flex flex-wrap gap-1">
				<button
					class={`btn btn-xs ${filterCategory === 'all' ? 'btn-primary' : 'btn-ghost'}`}
					onclick={() => (filterCategory = 'all')}
				>
					すべて
				</button>
				{#each Object.entries(inquiryCategories) as [key, cat]}
					<button
						class={`btn btn-xs ${filterCategory === key ? 'btn-primary' : 'btn-ghost'}`}
						onclick={() => (filterCategory = key)}
					>
						{cat.icon}
						{cat.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- リスト -->
		<div class="flex-1 overflow-y-auto">
			{#each sortedInquiries as inquiry}
				{@const slaTime = getTimeUntilSLA(inquiry.slaDeadline)}
				<button
					class={`
            border-base-300 hover:bg-base-200 w-full border-b p-4 text-left
            ${selectedInquiry?.id === inquiry.id ? 'bg-base-200' : ''}
          `}
					onclick={() => selectInquiry(inquiry)}
				>
					<div class="mb-2 flex items-start justify-between">
						<div class="flex items-center gap-2">
							<div
								class={`badge badge-sm ${priorities[inquiry.priority || 'normal']?.color || 'badge-primary'}`}
							>
								{priorities[inquiry.priority || 'normal']?.label || '中'}
							</div>
							<div class="badge badge-sm badge-ghost">
								{inquiryCategories[inquiry.category].icon}
								{inquiryCategories[inquiry.category].label}
							</div>
						</div>
						<div class={`text-sm font-medium ${slaTime.isOverdue ? 'text-error' : ''}`}>
							{slaTime.text}
						</div>
					</div>

					<div class="mb-1 font-medium">{inquiry.customerName}</div>
					<div class="text-base-content/70 line-clamp-2 text-sm">
						{inquiry.subject}
					</div>

					{#if inquiry.lockedBy}
						<div class="text-warning mt-2 text-xs">
							⚠️ {$operators.find((op) => op.id === inquiry.lockedBy)?.name}が確認中
						</div>
					{/if}
				</button>
			{/each}

			{#if sortedInquiries.length === 0}
				<div class="text-base-content/60 p-8 text-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mx-auto mb-2 h-12 w-12"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
						/>
					</svg>
					<p>待機中の問い合わせはありません</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- 詳細パネル -->
	<div class="bg-base-100 flex flex-1 flex-col overflow-hidden">
		{#if selectedInquiry}
			{@const slaTime = getTimeUntilSLA(selectedInquiry.slaDeadline)}
			<div class="overflow-y-auto p-6">
				<!-- ヘッダー -->
				<div class="mb-6">
					<div class="mb-2 flex items-start justify-between">
						<h3 class="text-xl font-bold">{selectedInquiry.customerName}</h3>
						<div class="flex gap-2">
							<div
								class={`badge ${priorities[selectedInquiry.priority || 'normal']?.color || 'badge-primary'}`}
							>
								{priorities[selectedInquiry.priority || 'normal']?.label || '中'}
							</div>
							<div class={`badge ${slaTime.isOverdue ? 'badge-error' : 'badge-ghost'}`}>
								SLA: {slaTime.text}
							</div>
						</div>
					</div>

					<div class="text-base-content/70 text-sm">
						受付時間: {new Date(selectedInquiry.createdAt).toLocaleString('ja-JP')}
					</div>
				</div>

				<!-- 問い合わせ内容 -->
				<div class="card bg-base-200 mb-6">
					<div class="card-body">
						<div class="mb-2 text-sm font-medium">初回メッセージ:</div>
						<p>{selectedInquiry.initialMessage}</p>
					</div>
				</div>

				<!-- エラー表示 -->
				{#if assignError}
					<div class="alert alert-error mb-4">
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
								d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>{assignError}</span>
					</div>
				{/if}

				<!-- アクション -->
				<div class="space-y-4">
					<!-- 自分に割り当て -->
					<button
						class="btn btn-primary btn-block"
						onclick={assignToMe}
						disabled={!$currentOperator || myCapacity?.isAtCapacity}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
							/>
						</svg>
						{myCapacity?.isAtCapacity
							? `対応上限（${myCapacity.max}件）に達しています`
							: '自分が対応する'}
					</button>

					{#if myCapacity}
						<div class="text-base-content/70 text-center text-sm">
							現在の対応数: {myCapacity.current} / {myCapacity.max}
						</div>
					{/if}

					<!-- 推奨オペレーター -->
					<div>
						<div class="mb-2 text-sm font-medium">推奨オペレーター:</div>
						<div class="space-y-2">
							{#each getRecommendedOperators(selectedInquiry) as op}
								<div class="bg-base-200 flex items-center justify-between rounded-lg p-2">
									<div class="flex items-center gap-2">
										{#if op.avatar}
											<div class="avatar">
												<div class="w-8 rounded-full">
													<img src={op.avatar} alt={op.name} />
												</div>
											</div>
										{:else}
											<div class="avatar avatar-placeholder">
												<div class="bg-neutral text-neutral-content w-8 rounded-full">
													<span class="text-sm">{op.name.charAt(0)}</span>
												</div>
											</div>
										{/if}
										<div>
											<div class="font-medium">{op.name}</div>
											<div class="text-base-content/70 text-xs">
												負荷: {Math.round(op.load)}% ({op.currentChatCount}/{op.maxConcurrent})
											</div>
										</div>
									</div>
									<button class="btn btn-sm btn-ghost" onclick={() => assignToOperator(op.id)}>
										割り当て
									</button>
								</div>
							{/each}
						</div>
					</div>

					<!-- その他のオペレーター -->
					<details class="collapse-arrow bg-base-200 collapse">
						<summary class="collapse-title text-sm font-medium"> その他のオペレーター </summary>
						<div class="collapse-content">
							<div class="max-h-60 space-y-2 overflow-y-auto pr-2">
								{#each $operatorLoad as op}
									<div class="flex items-center justify-between p-2">
										<div class="flex items-center gap-2">
											{#if op.avatar}
												<div class="avatar">
													<div class="w-8 rounded-full">
														<img src={op.avatar} alt={op.name} />
													</div>
												</div>
											{:else}
												<div class="avatar avatar-placeholder">
													<div class="bg-neutral text-neutral-content w-8 rounded-full">
														<span class="text-sm">{op.name.charAt(0)}</span>
													</div>
												</div>
											{/if}
											<div>
												<div class="font-medium">{op.name}</div>
												<div class="text-xs">
													<span
														class={`badge badge-xs ${
															op.status === 'available'
																? 'badge-success'
																: op.status === 'busy'
																	? 'badge-warning'
																	: op.status === 'break'
																		? 'badge-info'
																		: 'badge-ghost'
														}`}
													>
														{op.status}
													</span>
													<span class="ml-1">
														{op.currentChatCount}/{op.maxConcurrent}
													</span>
												</div>
											</div>
										</div>
										<button
											class="btn btn-xs btn-ghost"
											onclick={() => assignToOperator(op.id)}
											disabled={op.status !== 'available' && op.status !== 'busy'}
										>
											割り当て
										</button>
									</div>
								{/each}
							</div>
						</div>
					</details>
				</div>
			</div>
		{:else}
			<div class="text-base-content/60 flex flex-1 items-center justify-center">
				<div class="text-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mx-auto mb-2 h-12 w-12"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
						/>
					</svg>
					<p>問い合わせを選択してください</p>
				</div>
			</div>
		{/if}
	</div>
</div>
