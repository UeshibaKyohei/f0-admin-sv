<script>
	import { crmActions } from '../stores/crmStore.js';
	
	let { lead = null, onClose = () => {}, onSend = () => {} } = $props();
	
	let selectedTemplate = $state('thank_you');
	let subject = $state('');
	let body = $state('');
	let scheduleType = $state('now');
	let scheduleDate = $state('');
	let scheduleTime = $state('');
	
	// メールテンプレート
	const emailTemplates = {
		thank_you: {
			name: '展示会お礼',
			subject: '【ご挨拶】本日はありがとうございました - {company}',
			body: `{name}様

本日は弊社ブースにお立ち寄りいただき、誠にありがとうございました。

お話しさせていただいた弊社のサービスについて、
改めて詳しい資料をお送りさせていただきます。

ご不明な点やご質問がございましたら、
お気軽にお問い合わせください。

今後ともよろしくお願いいたします。

---
営業部
株式会社Example
TEL: 03-1234-5678
Email: sales@example.com`
		},
		follow_up: {
			name: 'フォローアップ',
			subject: 'Re: 先日のご相談について - {company}',
			body: `{name}様

お世話になっております。
先日はお時間をいただき、ありがとうございました。

ご相談いただいた件について、社内で検討し、
以下のご提案をさせていただきます。

[提案内容]

ご都合のよい日時で、詳細についてご説明させていただければ幸いです。
来週のご予定はいかがでしょうか。

ご検討のほど、よろしくお願いいたします。`
		},
		proposal: {
			name: '提案書送付',
			subject: '【ご提案書送付】{company}様向けソリューションのご提案',
			body: `{name}様

お世話になっております。

先日お打ち合わせでご相談いただいた内容を踏まえ、
提案書を作成いたしましたので、添付にてお送りいたします。

主なポイント：
1. 課題解決のアプローチ
2. 導入スケジュール
3. 費用対効果

ご不明な点がございましたら、お気軽にお問い合わせください。
オンラインでのご説明も可能です。

ご検討のほど、よろしくお願いいたします。`
		},
		nurture: {
			name: '情報提供',
			subject: '【お役立ち情報】{industry}業界の最新トレンドについて',
			body: `{name}様

お世話になっております。

{industry}業界の最新トレンドについて、
お役立ち情報をまとめましたのでご共有させていただきます。

[記事リンク]

このような課題解決のお手伝いもさせていただいておりますので、
ご興味がございましたらお気軽にご連絡ください。

今後ともよろしくお願いいたします。`
		}
	};
	
	// テンプレート選択時の処理
	$effect(() => {
		if (selectedTemplate && lead) {
			const template = emailTemplates[selectedTemplate];
			subject = template.subject
				.replace('{company}', lead.companyName)
				.replace('{industry}', lead.industry || '');
			
			body = template.body
				.replace('{name}', lead.name)
				.replace('{company}', lead.companyName)
				.replace('{industry}', lead.industry || '');
		}
	});
	
	// メール送信処理
	function sendEmail() {
		const emailData = {
			leadId: lead.id,
			to: lead.email,
			subject: subject,
			body: body,
			template: selectedTemplate,
			scheduledAt: scheduleType === 'later' ? `${scheduleDate} ${scheduleTime}` : null,
			status: scheduleType === 'later' ? 'scheduled' : 'sent',
			sentAt: scheduleType === 'now' ? new Date().toISOString() : null
		};
		
		// アクティビティとして記録
		crmActions.addActivity({
			type: 'email',
			leadId: lead.id,
			contactName: lead.name,
			companyName: lead.companyName,
			description: `メール送信: ${subject}`,
			date: new Date().toISOString(),
			metadata: emailData
		});
		
		// リードのステータスを更新
		if (lead.status === 'new') {
			crmActions.updateLead(lead.id, { status: 'contacted' });
		}
		
		// コールバック実行
		onSend(emailData);
		
		// 成功メッセージ
		if (scheduleType === 'now') {
			alert('メールを送信しました');
		} else {
			alert(`メールを${scheduleDate} ${scheduleTime}に予約しました`);
		}
		
		onClose();
	}
</script>

{#if lead}
<div class="space-y-4">
	<!-- テンプレート選択 -->
	<div class="form-control">
		<label class="label">
			<span class="label-text">メールテンプレート</span>
		</label>
		<select class="select select-bordered" bind:value={selectedTemplate}>
			{#each Object.entries(emailTemplates) as [key, template]}
				<option value={key}>{template.name}</option>
			{/each}
		</select>
	</div>
	
	<!-- 宛先 -->
	<div class="form-control">
		<label class="label">
			<span class="label-text">宛先</span>
		</label>
		<input 
			type="email" 
			class="input input-bordered" 
			value={lead.email}
			readonly
		/>
	</div>
	
	<!-- 件名 -->
	<div class="form-control">
		<label class="label">
			<span class="label-text">件名</span>
		</label>
		<input 
			type="text" 
			class="input input-bordered" 
			bind:value={subject}
		/>
	</div>
	
	<!-- 本文 -->
	<div class="form-control">
		<label class="label">
			<span class="label-text">本文</span>
		</label>
		<textarea 
			class="textarea textarea-bordered h-64" 
			bind:value={body}
		></textarea>
	</div>
	
	<!-- 送信タイミング -->
	<div class="form-control">
		<label class="label">
			<span class="label-text">送信タイミング</span>
		</label>
		<div class="flex gap-4">
			<label class="label cursor-pointer gap-2">
				<input 
					type="radio" 
					name="schedule" 
					class="radio"
					value="now"
					bind:group={scheduleType}
				/>
				<span class="label-text">今すぐ送信</span>
			</label>
			<label class="label cursor-pointer gap-2">
				<input 
					type="radio" 
					name="schedule" 
					class="radio"
					value="later"
					bind:group={scheduleType}
				/>
				<span class="label-text">予約送信</span>
			</label>
		</div>
	</div>
	
	{#if scheduleType === 'later'}
		<div class="grid grid-cols-2 gap-4">
			<div class="form-control">
				<label class="label">
					<span class="label-text">送信日</span>
				</label>
				<input 
					type="date" 
					class="input input-bordered"
					bind:value={scheduleDate}
					min={new Date().toISOString().split('T')[0]}
				/>
			</div>
			<div class="form-control">
				<label class="label">
					<span class="label-text">送信時刻</span>
				</label>
				<input 
					type="time" 
					class="input input-bordered"
					bind:value={scheduleTime}
				/>
			</div>
		</div>
	{/if}
	
	<!-- アクションボタン -->
	<div class="flex gap-2 justify-end">
		<button class="btn btn-ghost" onclick={onClose}>
			キャンセル
		</button>
		<button 
			class="btn btn-primary"
			onclick={sendEmail}
			disabled={!subject || !body || (scheduleType === 'later' && (!scheduleDate || !scheduleTime))}
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
			</svg>
			{scheduleType === 'now' ? '送信' : '予約'}
		</button>
	</div>
</div>
{/if}