<script>
	import { archivedChats, customers, operators, currentOperator } from './supportStore.js';

	let viewScope = $state('all'); // 'all' or 'personal'
	let filterType = $state('all'); // 'all', 'date', 'customer'
	let selectedDate = $state(new Date().toISOString().split('T')[0]);
	let selectedCustomer = $state('all');
	let searchQuery = $state('');

	// 全ての履歴を時系列でフラット化
	const allArchivedChats = $derived.by(() => {
		const archives = $archivedChats;
		const allChats = [];

		Object.entries(archives).forEach(([customerId, chats]) => {
			chats.forEach((chat) => {
				const customer = $customers[customerId];
				allChats.push({
					...chat,
					customerName: customer?.name || '不明な顧客',
					customerTier: customer?.tier,
					operatorName: $operators.find((op) => op.id === chat.operatorId)?.name || '不明'
				});
			});
		});

		return allChats.sort(
			(a, b) => new Date(b.endTime || b.endDate) - new Date(a.endTime || a.endDate)
		);
	});

	// スコープに応じた履歴
	const scopedChats = $derived.by(() => {
		if (viewScope === 'personal' && $currentOperator) {
			return allArchivedChats.filter((chat) => chat.assignedTo === $currentOperator.id);
		}
		return allArchivedChats;
	});

	// フィルタリングされた履歴
	const filteredChats = $derived.by(() => {
		let chats = scopedChats;

		// 日付フィルター
		if (filterType === 'date') {
			chats = chats.filter((chat) => (chat.endTime || chat.endDate || '').startsWith(selectedDate));
		}

		// 顧客フィルター（全体表示時のみ）
		if (filterType === 'customer' && selectedCustomer !== 'all') {
			chats = chats.filter((chat) => chat.customerId === selectedCustomer);
		}

		// 検索フィルター
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			chats = chats.filter(
				(chat) =>
					chat.customerName.toLowerCase().includes(query) ||
					chat.subject.toLowerCase().includes(query) ||
					chat.summary.toLowerCase().includes(query)
			);
		}

		return chats;
	});

	// 統計情報（スコープに応じて変化）
	const stats = $derived.by(() => {
		const today = new Date().toISOString().split('T')[0];
		const todayChats = scopedChats.filter((chat) => {
			const endTime = chat.endTime || chat.endDate;
			return endTime && endTime.startsWith(today);
		});
		const thisWeekChats = scopedChats.filter((chat) => {
			const endTime = chat.endTime || chat.endDate;
			if (!endTime) return false;
			const chatDate = new Date(endTime);
			const weekAgo = new Date();
			weekAgo.setDate(weekAgo.getDate() - 7);
			return chatDate >= weekAgo;
		});

		return {
			total: scopedChats.length,
			today: todayChats.length,
			thisWeek: thisWeekChats.length,
			avgResponseTime: calculateAvgTime(todayChats, 'responseTime'),
			avgResolutionTime: calculateAvgTime(todayChats, 'resolutionTime'),
			scopeLabel: viewScope === 'personal' ? '個人実績' : '全体実績'
		};
	});

	// 顧客リスト（重複を除去）
	const uniqueCustomers = $derived.by(() => {
		const customerMap = new Map();
		scopedChats.forEach((chat) => {
			if (!customerMap.has(chat.customerId)) {
				customerMap.set(chat.customerId, {
					id: chat.customerId,
					name: chat.customerName,
					count: 0
				});
			}
			customerMap.get(chat.customerId).count++;
		});
		return Array.from(customerMap.values()).sort((a, b) => b.count - a.count);
	});

	function calculateAvgTime(chats, field) {
		if (chats.length === 0) return 0;
		const total = chats.reduce((sum, chat) => sum + (chat[field] || 0), 0);
		return Math.round(total / chats.length);
	}

	function formatTime(minutes) {
		if (minutes < 60) return `${minutes}分`;
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours}時間${mins}分`;
	}

	let selectedChat = $state(null);
</script>

<div class="grid h-full w-full grid-cols-1 lg:grid-cols-[320px_320px_1fr]">
	<!-- フィルターサイドバー -->
	<div class="bg-base-100 border-base-300 hidden flex-col overflow-y-auto border-r lg:flex">
		<!-- スコープ切り替え -->
		<div class="bg-base-200 border-base-300 border-b p-4">
			<div class="tabs tabs-boxed w-full">
				<button
					class={`tab flex-1 ${viewScope === 'all' ? 'tab-active' : ''}`}
					onclick={() => (viewScope = 'all')}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-1 h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
					全体履歴
				</button>
				<button
					class={`tab flex-1 ${viewScope === 'personal' ? 'tab-active' : ''}`}
					onclick={() => (viewScope = 'personal')}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-1 h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
					個人履歴
				</button>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto p-4">
			<h3 class="mb-4 text-lg font-bold">フィルター</h3>

			<!-- 検索 -->
			<div class="form-control mb-4">
				<label class="label">
					<span class="label-text">検索</span>
				</label>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="顧客名、件名、要約で検索"
					class="input input-bordered input-sm"
				/>
			</div>

			<!-- フィルタータイプ -->
			<div class="form-control mb-4">
				<label class="label">
					<span class="label-text">フィルター種別</span>
				</label>
				<select bind:value={filterType} class="select select-bordered select-sm">
					<option value="all">すべて</option>
					<option value="date">日付別</option>
					{#if viewScope === 'all'}
						<option value="customer">顧客別</option>
					{/if}
				</select>
			</div>

			{#if filterType === 'date'}
				<div class="form-control mb-4">
					<label class="label">
						<span class="label-text">日付選択</span>
					</label>
					<input type="date" bind:value={selectedDate} class="input input-bordered input-sm" />
				</div>
			{/if}

			{#if filterType === 'customer' && viewScope === 'all'}
				<div class="form-control mb-4">
					<label class="label">
						<span class="label-text">顧客選択</span>
					</label>
					<select bind:value={selectedCustomer} class="select select-bordered select-sm">
						<option value="all">すべての顧客</option>
						{#each uniqueCustomers.slice(0, 20) as customer}
							<option value={customer.id}>{customer.name} ({customer.count}件)</option>
						{/each}
					</select>
				</div>
			{/if}

			<div class="divider"></div>

			<!-- 統計情報 -->
			<div class="space-y-3">
				<h4 class="flex items-center gap-2 text-sm font-semibold">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
					{stats.scopeLabel}
				</h4>

				<div class="stats stats-vertical w-full shadow">
					<div class="stat py-3">
						<div class="stat-title text-xs">総対応数</div>
						<div class="stat-value text-2xl">{stats.total}</div>
					</div>
					<div class="stat py-3">
						<div class="stat-title text-xs">本日</div>
						<div class="stat-value text-xl">{stats.today}件</div>
					</div>
					<div class="stat py-3">
						<div class="stat-title text-xs">今週</div>
						<div class="stat-value text-xl">{stats.thisWeek}件</div>
					</div>
					<div class="stat py-3">
						<div class="stat-title text-xs">平均初回応答</div>
						<div class="stat-value text-lg">{formatTime(stats.avgResponseTime)}</div>
					</div>
					<div class="stat py-3">
						<div class="stat-title text-xs">平均解決時間</div>
						<div class="stat-value text-lg">{formatTime(stats.avgResolutionTime)}</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- 履歴リスト（中央カラム） -->
	<div class="bg-base-100 border-base-300 overflow-y-auto lg:border-r">
		<div class="p-4">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-bold">
					対応履歴 ({filteredChats.length}件)
				</h2>
			</div>

			<div class="space-y-2">
				{#each filteredChats as chat}
					<button
						class={`card bg-base-200 hover:bg-base-300 w-full text-left transition-colors ${
							selectedChat?.id === chat.id ? 'ring-primary ring-2' : ''
						}`}
						onclick={() => (selectedChat = chat)}
					>
						<div class="card-body p-3">
							<div class="mb-1 flex items-center justify-between">
								<h3 class="text-sm font-medium">{chat.customerName}</h3>
								<div class="flex items-center gap-1">
									{#if chat.customerTier}
										<div
											class={`badge badge-xs ${
												chat.customerTier === 'ゴールド'
													? 'badge-warning'
													: chat.customerTier === 'シルバー'
														? 'badge-ghost'
														: 'badge-accent'
											}`}
										>
											{chat.customerTier}
										</div>
									{/if}
									<div
										class={`badge badge-xs ${
											chat.resolution === 'resolved'
												? 'badge-success'
												: chat.resolution === 'escalated'
													? 'badge-error'
													: 'badge-warning'
										}`}
									>
										{chat.resolution === 'resolved'
											? '解決'
											: chat.resolution === 'escalated'
												? 'エスカ'
												: '未解決'}
									</div>
								</div>
							</div>

							<div class="text-base-content/60 mb-1 text-xs">
								{new Date(chat.endTime || chat.endDate).toLocaleDateString('ja-JP')}
								{new Date(chat.endTime || chat.endDate).toLocaleTimeString('ja-JP', {
									hour: '2-digit',
									minute: '2-digit'
								})}
								{#if viewScope === 'all'}
									<br />対応: {chat.operatorName}
								{/if}
							</div>

							<p class="line-clamp-2 text-sm">{chat.subject}</p>

							<div class="text-base-content/60 mt-1 text-xs">
								応答: {formatTime(chat.responseTime)} / 解決: {formatTime(chat.resolutionTime)}
							</div>
						</div>
					</button>
				{/each}

				{#if filteredChats.length === 0}
					<div class="text-base-content/60 py-8 text-center">
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
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						<p>該当する履歴がありません</p>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- 詳細表示（右カラム） -->
	<div class="bg-base-100 flex flex-col overflow-hidden">
		{#if selectedChat}
			<div class="border-base-300 border-b p-6">
				<div>
					<div class="mb-4 flex items-start justify-between">
						<div class="flex-1">
							<h2 class="mb-2 text-2xl font-bold">{selectedChat.customerName}</h2>
							<div class="text-base-content/60 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
								<span class="flex items-center gap-1">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
									{new Date(selectedChat.endTime || selectedChat.endDate).toLocaleString('ja-JP')}
								</span>
								<span class="flex items-center gap-1">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										/>
									</svg>
									対応: {selectedChat.operatorName}
								</span>
								<span
									class={`flex items-center gap-1 font-medium ${
										selectedChat.resolution === 'resolved'
											? 'text-success'
											: selectedChat.resolution === 'escalated'
												? 'text-error'
												: 'text-warning'
									}`}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d={selectedChat.resolution === 'resolved'
												? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
												: selectedChat.resolution === 'escalated'
													? 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
													: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'}
										/>
									</svg>
									{selectedChat.resolution === 'resolved'
										? '解決済み'
										: selectedChat.resolution === 'escalated'
											? 'エスカレーション'
											: '未解決'}
								</span>
							</div>
						</div>
						<button
							class="btn btn-ghost btn-sm btn-circle ml-4"
							onclick={() => (selectedChat = null)}
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
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
						<div class="bg-base-200 rounded-lg p-4">
							<div class="text-base-content/60 mb-2 text-sm font-medium">対応内容の要約</div>
							<p class="text-sm leading-relaxed">{selectedChat.summary}</p>
						</div>

						<div class="bg-base-200 rounded-lg p-4">
							<div class="text-base-content/60 mb-2 text-sm font-medium">対応メトリクス</div>
							<div class="space-y-2">
								<div class="flex items-center justify-between">
									<span class="text-base-content/70 text-sm">初回応答時間</span>
									<span class="text-sm font-medium">{formatTime(selectedChat.responseTime)}</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-base-content/70 text-sm">解決時間</span>
									<span class="text-sm font-medium">{formatTime(selectedChat.resolutionTime)}</span>
								</div>
								{#if selectedChat.satisfactionScore}
									<div class="flex items-center justify-between">
										<span class="text-base-content/70 text-sm">顧客満足度</span>
										<span class="text-sm">
											{#each Array(5) as _, i}
												<span
													class={i < selectedChat.satisfactionScore
														? 'text-warning'
														: 'text-base-300'}
												>
													★
												</span>
											{/each}
										</span>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="flex-1 overflow-y-auto p-6">
				<h3 class="mb-4 text-lg font-semibold">会話履歴</h3>
				<div class="space-y-3">
					{#each selectedChat.messages as message}
						{#if message.type === 'system'}
							<div class="text-base-content/60 py-2 text-center text-sm">
								{message.content}
							</div>
						{:else}
							<div
								class={`flex ${message.type === 'agent' ? 'justify-end' : 'justify-start'} mb-4`}
							>
								<div class={`max-w-[80%] ${message.type === 'agent' ? 'text-right' : 'text-left'}`}>
									<div class="text-base-content/60 mb-1 text-xs">
										{message.type === 'agent'
											? selectedChat.operatorName
											: selectedChat.customerName}
										<time class="ml-1 opacity-50">
											{new Date(message.timestamp).toLocaleTimeString('ja-JP')}
										</time>
									</div>
									<div
										class={`inline-block rounded-lg p-3 ${
											message.type === 'agent'
												? 'bg-primary text-primary-content'
												: 'bg-base-200 text-base-content'
										} whitespace-pre-wrap`}
									>
										{message.content}
									</div>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{:else}
			<div class="text-base-content/60 flex flex-1 items-center justify-center">
				<div class="text-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mx-auto mb-4 h-16 w-16"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
						/>
					</svg>
					<p class="mb-2 text-lg font-medium">履歴を選択してください</p>
					<p class="text-sm">
						左側のリストから対応履歴を選択すると<br />詳細な会話内容が表示されます
					</p>
				</div>
			</div>
		{/if}
	</div>
</div>
