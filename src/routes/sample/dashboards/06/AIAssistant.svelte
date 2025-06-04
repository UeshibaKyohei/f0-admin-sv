<script>
	import { onMount, onDestroy } from 'svelte';
	import { config, isFeatureEnabled } from './config.js';
	import * as dataService from './services/dataService.js';

	let { isAIActive = true, onInsight = () => {} } = $props();

	// チャット状態
	let messages = $state([]);
	let inputMessage = $state('');
	let isThinking = $state(false);
	let isTyping = $state(false);
	let showSuggestions = $state(true);

	// AI機能の状態
	let voiceEnabled = $state(false);
	let isListening = $state(false);
	let currentLanguage = $state('ja');

	// クイックアクション
	const quickActions = [
		{ id: 'summary', label: '本日のサマリーを生成', icon: '📊' },
		{ id: 'anomaly', label: '異常を検出', icon: '🔍' },
		{ id: 'optimize', label: 'システムを最適化', icon: '⚡' },
		{ id: 'report', label: 'レポートを作成', icon: '📄' },
		{ id: 'predict', label: '将来を予測', icon: '🔮' },
		{ id: 'help', label: 'ヘルプ', icon: '❓' }
	];

	// サンプル提案
	const sampleQueries = [
		'今月の売上予測を教えて',
		'システムパフォーマンスに問題はある？',
		'在庫レベルの最適化提案を見せて',
		'先週と比較して異常な変化はある？',
		'明日のワークフローを最適化して'
	];

	onMount(() => {
		// 初期メッセージを追加
		addAIMessage(config.AI_ASSISTANT.PERSONALITY.greeting);

		// 音声認識の初期化
		if (isFeatureEnabled('ENABLE_VOICE_COMMANDS')) {
			initializeVoiceRecognition();
		}
	});

	onDestroy(() => {
		stopListening();
	});

	function initializeVoiceRecognition() {
		if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
			voiceEnabled = true;
		}
	}

	async function sendMessage() {
		if (!inputMessage.trim()) return;

		const userMessage = inputMessage;
		inputMessage = '';

		// ユーザーメッセージを追加
		messages = [
			...messages,
			{
				id: Date.now(),
				type: 'user',
				content: userMessage,
				timestamp: new Date().toISOString()
			}
		];

		// AI思考中の表示
		isThinking = true;

		try {
			// AIレスポンスを取得
			const response = await dataService.getAIResponse(userMessage);

			// タイピングアニメーション
			isThinking = false;
			isTyping = true;

			// レスポンスを段階的に表示
			await typeMessage(response.message);

			// アクションがある場合は実行
			if (response.action) {
				handleAIAction(response.action);
			}

			// インサイトがある場合は親コンポーネントに通知
			if (response.insight) {
				onInsight(response.insight);
			}
		} catch (error) {
			console.error('AI response error:', error);
			addAIMessage('申し訳ございません。エラーが発生しました。もう一度お試しください。');
		} finally {
			isThinking = false;
			isTyping = false;
		}
	}

	async function typeMessage(message) {
		const words = message.split(' ');
		let currentMessage = '';

		const messageId = Date.now();
		messages = [
			...messages,
			{
				id: messageId,
				type: 'ai',
				content: '',
				timestamp: new Date().toISOString()
			}
		];

		for (const word of words) {
			currentMessage += (currentMessage ? ' ' : '') + word;
			messages = messages.map((msg) =>
				msg.id === messageId ? { ...msg, content: currentMessage } : msg
			);
			await new Promise((resolve) => setTimeout(resolve, 50));
		}
	}

	function addAIMessage(content) {
		messages = [
			...messages,
			{
				id: Date.now(),
				type: 'ai',
				content,
				timestamp: new Date().toISOString()
			}
		];
	}

	async function handleQuickAction(action) {
		inputMessage = '';

		switch (action.id) {
			case 'summary':
				await sendMessageWithText('本日のビジネスサマリーを生成してください');
				break;
			case 'anomaly':
				await sendMessageWithText('システム全体の異常を検出してください');
				break;
			case 'optimize':
				await sendMessageWithText('現在のシステムパフォーマンスを最適化する提案をしてください');
				break;
			case 'report':
				await sendMessageWithText('経営陣向けのエグゼクティブレポートを生成してください');
				break;
			case 'predict':
				await sendMessageWithText('今後30日間のビジネス予測を表示してください');
				break;
			case 'help':
				await sendMessageWithText('利用可能な機能を教えてください');
				break;
		}
	}

	async function sendMessageWithText(text) {
		inputMessage = text;
		await sendMessage();
	}

	function handleAIAction(action) {
		console.log('AI Action:', action);
		// ここで実際のアクションを実行
	}

	function toggleVoice() {
		if (isListening) {
			stopListening();
		} else {
			startListening();
		}
	}

	function startListening() {
		if (!voiceEnabled) return;
		isListening = true;
		// 実際の音声認識実装はここに
	}

	function stopListening() {
		isListening = false;
	}

	function handleKeyPress(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function copyMessage(content) {
		navigator.clipboard.writeText(content);
		// コピー成功の通知を表示
	}
</script>

<div class="flex h-full flex-col">
	<!-- AIアシスタントヘッダー -->
	<div class="from-primary to-secondary bg-gradient-to-r p-px">
		<div class="bg-base-300 px-6 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="relative">
						<div
							class="from-primary to-secondary flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-2xl"
						>
							{config.AI_ASSISTANT.PERSONALITY.avatar}
						</div>
						{#if isAIActive}
							<div
								class="bg-success border-base-300 absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2"
							></div>
						{/if}
					</div>
					<div>
						<h2 class="text-lg font-bold">{config.AI_ASSISTANT.PERSONALITY.name}</h2>
						<p class="text-sm opacity-70">AIアシスタント</p>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<!-- 言語選択 -->
					<select class="select select-sm bg-base-100" bind:value={currentLanguage}>
						<option value="ja">日本語</option>
						<option value="en">English</option>
						<option value="zh">中文</option>
						<option value="ko">한국어</option>
					</select>

					<!-- 音声コントロール -->
					{#if voiceEnabled}
						<button
							class="btn btn-circle btn-sm {isListening ? 'btn-error' : 'btn-ghost'}"
							onclick={toggleVoice}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="h-4 w-4"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
								/>
							</svg>
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- チャットエリア -->
	<div class="flex-1 space-y-4 overflow-y-auto p-4">
		{#each messages as message}
			<div class="flex {message.type === 'user' ? 'justify-end' : 'justify-start'}">
				<div class="max-w-[80%] lg:max-w-[60%]">
					<div class="flex items-start gap-2 {message.type === 'user' ? 'flex-row-reverse' : ''}">
						{#if message.type === 'ai'}
							<div
								class="from-primary to-secondary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm"
							>
								{config.AI_ASSISTANT.PERSONALITY.avatar}
							</div>
						{/if}

						<div class="space-y-1">
							<div class="chat {message.type === 'user' ? 'chat-end' : 'chat-start'}">
								<div
									class="chat-bubble {message.type === 'user'
										? 'chat-bubble-primary'
										: 'chat-bubble-secondary'}"
								>
									{message.content}
								</div>
							</div>

							<div
								class="flex items-center gap-2 text-xs opacity-70 {message.type === 'user'
									? 'justify-end'
									: ''}"
							>
								<span>{new Date(message.timestamp).toLocaleTimeString('ja-JP')}</span>
								{#if message.type === 'ai'}
									<button
										class="hover:opacity-70"
										onclick={() => copyMessage(message.content)}
										title="コピー"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											class="h-3 w-3"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
											/>
										</svg>
									</button>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>
		{/each}

		{#if isThinking}
			<div class="flex justify-start">
				<div class="flex items-center gap-2">
					<div
						class="from-primary to-secondary flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-sm"
					>
						{config.AI_ASSISTANT.PERSONALITY.avatar}
					</div>
					<div class="chat chat-start">
						<div class="chat-bubble chat-bubble-secondary">
							<span class="loading loading-dots loading-sm"></span>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- クイックアクション -->
	{#if showSuggestions && messages.length <= 1}
		<div class="px-4 pb-2">
			<div class="grid grid-cols-2 gap-2 lg:grid-cols-3">
				{#each quickActions as action}
					<button class="btn btn-sm btn-outline" onclick={() => handleQuickAction(action)}>
						<span class="mr-1">{action.icon}</span>
						{action.label}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- サンプルクエリ -->
	{#if showSuggestions && messages.length <= 1}
		<div class="px-4 pb-2">
			<p class="mb-2 text-xs opacity-70">こんな質問もできます：</p>
			<div class="flex flex-wrap gap-2">
				{#each sampleQueries as query}
					<button
						class="badge badge-outline hover:badge-primary cursor-pointer"
						onclick={() => sendMessageWithText(query)}
					>
						{query}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- 入力エリア -->
	<div class="border-base-300 border-t p-4">
		<div class="flex gap-2">
			<div class="relative flex-1">
				<textarea
					class="textarea textarea-bordered bg-base-100 w-full resize-none"
					placeholder="メッセージを入力..."
					bind:value={inputMessage}
					onkeypress={handleKeyPress}
					rows="2"
				></textarea>
				{#if isListening}
					<div class="absolute top-2 right-2">
						<span class="badge badge-error badge-sm animate-pulse">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="mr-1 h-3 w-3"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
								/>
							</svg>
							聞いています...
						</span>
					</div>
				{/if}
			</div>
			<button
				class="btn btn-primary"
				onclick={sendMessage}
				disabled={!inputMessage.trim() || isThinking}
			>
				{#if isThinking}
					<span class="loading loading-spinner loading-sm"></span>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-5 w-5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
						/>
					</svg>
				{/if}
			</button>
		</div>
	</div>
</div>
