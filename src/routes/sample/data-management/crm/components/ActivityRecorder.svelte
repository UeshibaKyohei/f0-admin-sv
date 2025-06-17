<script>
	import { crmActions } from '../stores/crmStore.js';
	
	let { entity = null, entityType = 'lead', onClose = () => {}, onSave = () => {} } = $props();
	
	let activityType = $state('note');
	let description = $state('');
	let date = $state(new Date().toISOString().split('T')[0]);
	let time = $state(new Date().toTimeString().slice(0, 5));
	let outcome = $state('');
	let nextAction = $state('');
	let nextActionDate = $state('');
	
	// 活動タイプの定義
	const activityTypes = [
		{ value: 'phone', label: '電話', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
		{ value: 'email', label: 'メール', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
		{ value: 'meeting', label: '会議', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
		{ value: 'note', label: 'メモ', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
		{ value: 'task', label: 'タスク', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' }
	];
	
	// 電話の結果選択肢
	const phoneOutcomes = [
		'つながった - 興味あり',
		'つながった - 興味なし',
		'不在 - 折り返し待ち',
		'不在 - 留守電',
		'番号違い'
	];
	
	// 会議の結果選択肢
	const meetingOutcomes = [
		'初回商談完了',
		'要件ヒアリング完了',
		'提案実施',
		'デモ実施',
		'次回アポ確定',
		'保留',
		'失注'
	];
	
	// 活動を保存
	function saveActivity() {
		const activityData = {
			type: activityType,
			[entityType + 'Id']: entity.id,
			contactName: entity.name || entity.contactName,
			companyName: entity.companyName,
			description: description,
			date: `${date}T${time}:00`,
			outcome: outcome,
			nextAction: nextAction,
			nextActionDate: nextActionDate
		};
		
		// 活動を記録
		const newActivity = crmActions.addActivity(activityData);
		
		// 次のアクションがある場合はタスクも作成
		if (nextAction && nextActionDate) {
			crmActions.addActivity({
				type: 'task',
				[entityType + 'Id']: entity.id,
				contactName: entity.name || entity.contactName,
				companyName: entity.companyName,
				description: nextAction,
				date: nextActionDate + 'T09:00:00',
				status: 'pending'
			});
		}
		
		// コールバック実行
		onSave(newActivity);
		
		// 成功メッセージ
		alert('活動を記録しました');
		
		onClose();
	}
	
	// テンプレート文章の生成
	function generateTemplate() {
		switch (activityType) {
			case 'phone':
				return `${entity.name || entity.contactName}様に電話。`;
			case 'meeting':
				return `${entity.name || entity.contactName}様と商談実施。`;
			case 'email':
				return `${entity.name || entity.contactName}様にメール送信。`;
			default:
				return '';
		}
	}
	
	// 活動タイプ変更時にテンプレートを適用
	$effect(() => {
		if (activityType && !description) {
			description = generateTemplate();
		}
	});
</script>

{#if entity}
<div class="space-y-4">
	<!-- 活動タイプ選択 -->
	<div class="form-control">
		<label class="label">
			<span class="label-text">活動タイプ</span>
		</label>
		<div class="grid grid-cols-3 gap-2 sm:grid-cols-5">
			{#each activityTypes as type}
				<button
					class="btn btn-outline gap-2"
					class:btn-primary={activityType === type.value}
					onclick={() => activityType = type.value}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={type.icon}></path>
					</svg>
					<span class="hidden sm:inline">{type.label}</span>
				</button>
			{/each}
		</div>
	</div>
	
	<!-- 日時 -->
	<div class="grid grid-cols-2 gap-4">
		<div class="form-control">
			<label class="label">
				<span class="label-text">日付</span>
			</label>
			<input 
				type="date" 
				class="input input-bordered"
				bind:value={date}
			/>
		</div>
		<div class="form-control">
			<label class="label">
				<span class="label-text">時刻</span>
			</label>
			<input 
				type="time" 
				class="input input-bordered"
				bind:value={time}
			/>
		</div>
	</div>
	
	<!-- 活動内容 -->
	<div class="form-control">
		<label class="label">
			<span class="label-text">活動内容</span>
		</label>
		<textarea 
			class="textarea textarea-bordered h-24" 
			placeholder="活動の詳細を記入..."
			bind:value={description}
		></textarea>
	</div>
	
	<!-- 結果（電話・会議の場合） -->
	{#if activityType === 'phone' || activityType === 'meeting'}
		<div class="form-control">
			<label class="label">
				<span class="label-text">結果</span>
			</label>
			<select class="select select-bordered" bind:value={outcome}>
				<option value="">選択してください</option>
				{#each (activityType === 'phone' ? phoneOutcomes : meetingOutcomes) as option}
					<option value={option}>{option}</option>
				{/each}
			</select>
		</div>
	{/if}
	
	<!-- 次のアクション -->
	<div class="divider">次のアクション</div>
	
	<div class="form-control">
		<label class="label">
			<span class="label-text">次に行うこと</span>
		</label>
		<input 
			type="text" 
			class="input input-bordered" 
			placeholder="例: 提案書を送付、デモ日程の調整"
			bind:value={nextAction}
		/>
	</div>
	
	{#if nextAction}
		<div class="form-control">
			<label class="label">
				<span class="label-text">実施予定日</span>
			</label>
			<input 
				type="date" 
				class="input input-bordered"
				bind:value={nextActionDate}
				min={new Date().toISOString().split('T')[0]}
			/>
		</div>
	{/if}
	
	<!-- 保存ボタン -->
	<div class="flex gap-2 justify-end">
		<button class="btn btn-ghost" onclick={onClose}>
			キャンセル
		</button>
		<button 
			class="btn btn-primary"
			onclick={saveActivity}
			disabled={!description}
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
			</svg>
			保存
		</button>
	</div>
</div>
{/if}