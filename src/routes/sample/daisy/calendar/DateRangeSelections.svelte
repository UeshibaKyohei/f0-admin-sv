<script>
	import { onMount } from 'svelte';
	import { HighlightSvelte } from 'svelte-highlight';
	import 'svelte-highlight/styles/dark.css';

	let { copyToClipboard, copySuccess } = $props();

	// Pikadayの日本語設定
	const pikadayI18n = {
		previousMonth: '前月',
		nextMonth: '翌月',
		months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
		weekdays: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
		weekdaysShort: ['日', '月', '火', '水', '木', '金', '土']
	};

	// サンプル1: 基本的な開始日・終了日の選択
	let startDate1 = $state('');
	let endDate1 = $state('');
	let startPicker1, endPicker1;
	let startInput1, endInput1;

	// サンプル2: 期間制限付き日付選択
	let startDate2 = $state('');
	let endDate2 = $state('');
	let startPicker2, endPicker2;
	let startInput2, endInput2;

	// サンプル3: 相互連動する複数のデートピッカー
	let checkInDate = $state('');
	let checkOutDate = $state('');
	let nights = $derived(calculateNights(checkInDate, checkOutDate));
	let checkInPicker, checkOutPicker;
	let checkInInput, checkOutInput;

	// サンプル4: プリセット付き日付範囲選択
	let presetStartDate = $state('');
	let presetEndDate = $state('');
	let presetStartPicker, presetEndPicker;
	let presetStartInput, presetEndInput;

	// サンプル5: イベント期間設定（最小期間制限付き）
	let eventStartDate = $state('');
	let eventEndDate = $state('');
	let eventStartPicker, eventEndPicker;
	let eventStartInput, eventEndInput;

	// サンプル6: カレンダー連携型日付範囲選択
	let callyStartDate = $state('');
	let callyEndDate = $state('');
	let callyStartBtn, callyEndBtn;

	function calculateNights(start, end) {
		if (!start || !end) return 0;
		const startDate = new Date(start);
		const endDate = new Date(end);
		const diffTime = Math.abs(endDate - startDate);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	}

	function handleCallyStartChange(event) {
		if (callyStartBtn && event.target.value) {
			callyStartDate = event.target.value;
			callyStartBtn.innerText = formatDate(event.target.value);

			// 終了日が開始日より前の場合、終了日をリセット
			if (callyEndDate && new Date(callyEndDate) < new Date(callyStartDate)) {
				callyEndDate = '';
				if (callyEndBtn) callyEndBtn.innerText = '終了日を選択';
			}
		}
	}

	function handleCallyEndChange(event) {
		if (callyEndBtn && event.target.value) {
			callyEndDate = event.target.value;
			callyEndBtn.innerText = formatDate(event.target.value);
		}
	}

	function formatDate(dateString) {
		const date = new Date(dateString);
		return date.toLocaleDateString('ja-JP', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function setPresetRange(days) {
		const today = new Date();
		const end = new Date(today);
		end.setDate(today.getDate() + days);

		presetStartDate = today.toISOString().split('T')[0];
		presetEndDate = end.toISOString().split('T')[0];

		if (presetStartPicker) {
			presetStartPicker.setDate(today);
		}
		if (presetEndPicker) {
			presetEndPicker.setDate(end);
		}
	}

	onMount(async () => {
		const Pikaday = (await import('pikaday')).default;

		// サンプル1: 基本的な開始日・終了日
		startPicker1 = new Pikaday({
			field: startInput1,
			format: 'YYYY-MM-DD',
			container: startInput1.parentElement,
			i18n: pikadayI18n,
			firstDay: 0,
			onSelect: function () {
				startDate1 = this.toString('YYYY-MM-DD');
				// 終了日の最小日付を設定
				if (endPicker1) {
					endPicker1.setMinDate(this.getDate());
				}
			}
		});

		endPicker1 = new Pikaday({
			field: endInput1,
			format: 'YYYY-MM-DD',
			container: endInput1.parentElement,
			i18n: pikadayI18n,
			firstDay: 0,
			onSelect: function () {
				endDate1 = this.toString('YYYY-MM-DD');
			}
		});

		// サンプル2: 期間制限付き
		const today = new Date();
		const maxDate = new Date();
		maxDate.setMonth(maxDate.getMonth() + 3); // 3ヶ月後まで

		startPicker2 = new Pikaday({
			field: startInput2,
			format: 'YYYY-MM-DD',
			container: startInput2.parentElement,
			i18n: pikadayI18n,
			firstDay: 0,
			minDate: today,
			maxDate: maxDate,
			onSelect: function () {
				startDate2 = this.toString('YYYY-MM-DD');
				if (endPicker2) {
					endPicker2.setMinDate(this.getDate());
					// 最大30日間の制限
					const max30Days = new Date(this.getDate());
					max30Days.setDate(max30Days.getDate() + 30);
					endPicker2.setMaxDate(max30Days > maxDate ? maxDate : max30Days);
				}
			}
		});

		endPicker2 = new Pikaday({
			field: endInput2,
			format: 'YYYY-MM-DD',
			container: endInput2.parentElement,
			i18n: pikadayI18n,
			firstDay: 0,
			minDate: today,
			maxDate: maxDate,
			onSelect: function () {
				endDate2 = this.toString('YYYY-MM-DD');
			}
		});

		// サンプル3: チェックイン・チェックアウト
		checkInPicker = new Pikaday({
			field: checkInInput,
			format: 'YYYY-MM-DD',
			container: checkInInput.parentElement,
			i18n: pikadayI18n,
			firstDay: 0,
			minDate: today,
			onSelect: function () {
				checkInDate = this.toString('YYYY-MM-DD');
				if (checkOutPicker) {
					// チェックアウトは最短で翌日から
					const minCheckOut = new Date(this.getDate());
					minCheckOut.setDate(minCheckOut.getDate() + 1);
					checkOutPicker.setMinDate(minCheckOut);

					// チェックアウト日が無効になった場合、自動で翌日に設定
					if (!checkOutDate || new Date(checkOutDate) <= this.getDate()) {
						checkOutPicker.setDate(minCheckOut);
						checkOutDate = checkOutPicker.toString('YYYY-MM-DD');
					}
				}
			}
		});

		checkOutPicker = new Pikaday({
			field: checkOutInput,
			format: 'YYYY-MM-DD',
			container: checkOutInput.parentElement,
			i18n: pikadayI18n,
			firstDay: 0,
			minDate: new Date(today.getTime() + 24 * 60 * 60 * 1000), // 明日から
			onSelect: function () {
				checkOutDate = this.toString('YYYY-MM-DD');
			}
		});

		// サンプル4: プリセット付き
		presetStartPicker = new Pikaday({
			field: presetStartInput,
			format: 'YYYY-MM-DD',
			container: presetStartInput.parentElement,
			i18n: pikadayI18n,
			firstDay: 0,
			onSelect: function () {
				presetStartDate = this.toString('YYYY-MM-DD');
				if (presetEndPicker) {
					presetEndPicker.setMinDate(this.getDate());
				}
			}
		});

		presetEndPicker = new Pikaday({
			field: presetEndInput,
			format: 'YYYY-MM-DD',
			container: presetEndInput.parentElement,
			i18n: pikadayI18n,
			firstDay: 0,
			onSelect: function () {
				presetEndDate = this.toString('YYYY-MM-DD');
			}
		});

		// サンプル5: イベント期間（最小3日間）
		eventStartPicker = new Pikaday({
			field: eventStartInput,
			format: 'YYYY-MM-DD',
			container: eventStartInput.parentElement,
			i18n: pikadayI18n,
			firstDay: 0,
			minDate: today,
			onSelect: function () {
				eventStartDate = this.toString('YYYY-MM-DD');
				if (eventEndPicker) {
					// 最小3日間の制限
					const minEnd = new Date(this.getDate());
					minEnd.setDate(minEnd.getDate() + 2); // 3日間なので+2
					eventEndPicker.setMinDate(minEnd);

					// 終了日が無効になった場合、自動で最小期間後に設定
					if (!eventEndDate || new Date(eventEndDate) < minEnd) {
						eventEndPicker.setDate(minEnd);
						eventEndDate = eventEndPicker.toString('YYYY-MM-DD');
					}
				}
			}
		});

		eventEndPicker = new Pikaday({
			field: eventEndInput,
			format: 'YYYY-MM-DD',
			container: eventEndInput.parentElement,
			i18n: pikadayI18n,
			firstDay: 0,
			minDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 3日後から
			onSelect: function () {
				eventEndDate = this.toString('YYYY-MM-DD');
			}
		});

		return () => {
			// クリーンアップ
			startPicker1?.destroy();
			endPicker1?.destroy();
			startPicker2?.destroy();
			endPicker2?.destroy();
			checkInPicker?.destroy();
			checkOutPicker?.destroy();
			presetStartPicker?.destroy();
			presetEndPicker?.destroy();
			eventStartPicker?.destroy();
			eventEndPicker?.destroy();
		};
	});

	// サンプルコード
	const basicRangeCode = `<script>
  import { onMount } from 'svelte';
  
  let startDate = $state('');
  let endDate = $state('');
  let startPicker, endPicker;
  let startInput, endInput;
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    startPicker = new Pikaday({
      field: startInput,
      format: 'YYYY-MM-DD',
      container: startInput.parentElement,
      onSelect: function() {
        startDate = this.toString('YYYY-MM-DD');
        // 終了日の最小日付を設定
        if (endPicker) {
          endPicker.setMinDate(this.getDate());
        }
      }
    });
    
    endPicker = new Pikaday({
      field: endInput,
      format: 'YYYY-MM-DD',
      container: endInput.parentElement,
      onSelect: function() {
        endDate = this.toString('YYYY-MM-DD');
      }
    });
    
    return () => {
      startPicker?.destroy();
      endPicker?.destroy();
    };
  });
<\/script>

<div class="flex gap-4">
  <div class="form-control">
    <label class="label">
      <span class="label-text">開始日</span>
    </label>
    <input type="text" class="input pika-single" bind:this={startInput} />
  </div>
  
  <div class="form-control">
    <label class="label">
      <span class="label-text">終了日</span>
    </label>
    <input type="text" class="input pika-single" bind:this={endInput} />
  </div>
</div>

{#if startDate && endDate}
  <p class="mt-2 text-sm">
    選択期間: {startDate} 〜 {endDate}
  </p>
{/if}`;

	const limitedRangeCode = `<script>
  // 期間制限付き（3ヶ月先まで、最大30日間）
  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  
  startPicker = new Pikaday({
    field: startInput,
    format: 'YYYY-MM-DD',
    container: startInput.parentElement,
    minDate: today,
    maxDate: maxDate,
    onSelect: function() {
      startDate = this.toString('YYYY-MM-DD');
      if (endPicker) {
        endPicker.setMinDate(this.getDate());
        // 最大30日間の制限
        const max30Days = new Date(this.getDate());
        max30Days.setDate(max30Days.getDate() + 30);
        endPicker.setMaxDate(max30Days > maxDate ? maxDate : max30Days);
      }
    }
  });
<\/script>`;

	const hotelBookingCode = `<script>
  // ホテル予約用（自動連動）
  let checkInDate = $state('');
  let checkOutDate = $state('');
  let nights = $derived(calculateNights(checkInDate, checkOutDate));
  
  function calculateNights(start, end) {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  
  checkInPicker = new Pikaday({
    field: checkInInput,
    minDate: today,
    onSelect: function() {
      checkInDate = this.toString('YYYY-MM-DD');
      if (checkOutPicker) {
        // チェックアウトは最短で翌日から
        const minCheckOut = new Date(this.getDate());
        minCheckOut.setDate(minCheckOut.getDate() + 1);
        checkOutPicker.setMinDate(minCheckOut);
        
        // チェックアウト日が無効になった場合、自動で翌日に設定
        if (!checkOutDate || new Date(checkOutDate) <= this.getDate()) {
          checkOutPicker.setDate(minCheckOut);
          checkOutDate = checkOutPicker.toString('YYYY-MM-DD');
        }
      }
    }
  });
<\/script>

{#if nights > 0}
  <div class="badge badge-primary badge-lg">
    {nights}泊
  </div>
{/if}`;

	const callyRangeCode = `<script>
  let callyStartDate = $state('');
  let callyEndDate = $state('');
  
  function handleCallyStartChange(event) {
    if (callyStartBtn && event.target.value) {
      callyStartDate = event.target.value;
      callyStartBtn.innerText = formatDate(event.target.value);
      
      // 終了日が開始日より前の場合、終了日をリセット
      if (callyEndDate && new Date(callyEndDate) < new Date(callyStartDate)) {
        callyEndDate = '';
        if (callyEndBtn) callyEndBtn.innerText = '終了日を選択';
      }
    }
  }
<\/script>

<div class="flex gap-4">
  <button 
    popovertarget="cally-start" 
    class="btn btn-outline"
    bind:this={callyStartBtn}
    style="anchor-name:--cally-start-anchor"
  >
    開始日を選択
  </button>
  
  <button 
    popovertarget="cally-end" 
    class="btn btn-outline"
    bind:this={callyEndBtn}
    style="anchor-name:--cally-end-anchor"
    disabled={!callyStartDate}
  >
    終了日を選択
  </button>
</div>

<div popover id="cally-start" class="dropdown bg-base-100 rounded-box shadow-xl"
     style="position-anchor:--cally-start-anchor">
  <calendar-date class="cally p-4" onchange={handleCallyStartChange}>
    <!-- SVGアイコン -->
  </calendar-date>
</div>`;

	const presetRangeCode = `<script>
  function setPresetRange(days) {
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() + days);
    
    presetStartDate = today.toISOString().split('T')[0];
    presetEndDate = end.toISOString().split('T')[0];
    
    if (presetStartPicker) {
      presetStartPicker.setDate(today);
    }
    if (presetEndPicker) {
      presetEndPicker.setDate(end);
    }
  }
<\/script>

<div class="flex gap-2 mb-4 flex-wrap">
  <button class="btn btn-sm" onclick={() => setPresetRange(7)}>
    今週（7日間）
  </button>
  <button class="btn btn-sm" onclick={() => setPresetRange(30)}>
    今月（30日間）
  </button>
  <button class="btn btn-sm" onclick={() => setPresetRange(90)}>
    四半期（90日間）
  </button>
  <button class="btn btn-sm" onclick={() => setPresetRange(365)}>
    今年（365日間）
  </button>
</div>`;

	const eventPeriodCode = `<script>
  // イベント期間（最小3日間）
  eventStartPicker = new Pikaday({
    field: eventStartInput,
    minDate: today,
    onSelect: function() {
      eventStartDate = this.toString('YYYY-MM-DD');
      if (eventEndPicker) {
        // 最小3日間の制限
        const minEnd = new Date(this.getDate());
        minEnd.setDate(minEnd.getDate() + 2); // 3日間なので+2
        eventEndPicker.setMinDate(minEnd);
        
        // 終了日が無効になった場合、自動で最小期間後に設定
        if (!eventEndDate || new Date(eventEndDate) < minEnd) {
          eventEndPicker.setDate(minEnd);
          eventEndDate = eventEndPicker.toString('YYYY-MM-DD');
        }
      }
    }
  });
<\/script>`;
</script>

<div class="space-y-8">
	<!-- イントロダクション -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title mb-4 text-2xl">
				<span class="mr-2 text-3xl">📆</span>
				日付範囲選択の実装例
			</h2>
			<p class="text-base-content/80">
				開始日と終了日を選択する日付範囲ピッカーの実装パターンです。
				相互連動、期間制限、プリセット機能など、実用的なユースケースに対応した実装例を紹介します。
			</p>
		</div>
	</div>

	<!-- サンプル1: 基本的な開始日・終了日の選択 -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-xl font-bold">1. 基本的な開始日・終了日の選択</h3>
				<button
					class="btn btn-sm btn-ghost"
					onclick={() => copyToClipboard(basicRangeCode, 'basic-range')}
				>
					{#if copySuccess['basic-range']}
						<span class="text-success">✓ コピー完了</span>
					{:else}
						📋 コピー
					{/if}
				</button>
			</div>

			<!-- デモ -->
			<div class="bg-base-200 mb-4 rounded-lg p-6">
				<h4 class="mb-3 font-semibold">デモ</h4>
				<div class="flex flex-wrap gap-4">
					<div class="form-control">
						<label class="label">
							<span class="label-text">開始日</span>
						</label>
						<input
							type="text"
							class="input input-bordered pika-single"
							placeholder="開始日を選択"
							bind:this={startInput1}
							readonly
						/>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text">終了日</span>
						</label>
						<input
							type="text"
							class="input input-bordered pika-single"
							placeholder="終了日を選択"
							bind:this={endInput1}
							readonly
						/>
					</div>
				</div>

				{#if startDate1 && endDate1}
					<div class="alert alert-info mt-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="h-6 w-6 shrink-0 stroke-current"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path></svg
						>
						<span>選択期間: {startDate1} 〜 {endDate1}</span>
					</div>
				{/if}
			</div>

			<div class="alert alert-success mb-4">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/></svg
				>
				<div>
					<h4 class="font-semibold">特徴</h4>
					<ul class="mt-1 list-inside list-disc space-y-1 text-sm">
						<li>開始日を選択すると、終了日の最小日付が自動設定</li>
						<li>終了日は開始日より前の日付を選択不可</li>
						<li>シンプルで直感的な操作性</li>
					</ul>
				</div>
			</div>

			<!-- コード表示切り替え -->
			<div class="collapse-arrow bg-base-200 collapse">
				<input type="checkbox" />
				<div class="collapse-title font-medium">コードを表示</div>
				<div class="collapse-content">
					<HighlightSvelte code={basicRangeCode} />
				</div>
			</div>
		</div>
	</div>

	<!-- サンプル2: 期間制限付き日付選択 -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-xl font-bold">2. 期間制限付き日付選択</h3>
				<button
					class="btn btn-sm btn-ghost"
					onclick={() => copyToClipboard(limitedRangeCode, 'limited-range')}
				>
					{#if copySuccess['limited-range']}
						<span class="text-success">✓ コピー完了</span>
					{:else}
						📋 コピー
					{/if}
				</button>
			</div>

			<!-- デモ -->
			<div class="bg-base-200 mb-4 rounded-lg p-6">
				<h4 class="mb-3 font-semibold">デモ（3ヶ月先まで・最大30日間）</h4>
				<div class="flex flex-wrap gap-4">
					<div class="form-control">
						<label class="label">
							<span class="label-text">開始日</span>
						</label>
						<input
							type="text"
							class="input input-bordered pika-single"
							placeholder="開始日を選択"
							bind:this={startInput2}
							readonly
						/>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text">終了日</span>
						</label>
						<input
							type="text"
							class="input input-bordered pika-single"
							placeholder="終了日を選択"
							bind:this={endInput2}
							readonly
						/>
					</div>
				</div>

				{#if startDate2 && endDate2}
					<div class="alert alert-warning mt-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 shrink-0 stroke-current"
							fill="none"
							viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/></svg
						>
						<span>選択期間: {startDate2} 〜 {endDate2}</span>
					</div>
				{/if}
			</div>

			<div class="alert alert-info mb-4">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="h-6 w-6 shrink-0 stroke-current"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					></path></svg
				>
				<div>
					<h4 class="font-semibold">特徴</h4>
					<ul class="mt-1 list-inside list-disc space-y-1 text-sm">
						<li>今日から3ヶ月先までの期間制限</li>
						<li>最大30日間の選択制限</li>
						<li>過去の日付は選択不可</li>
						<li>レンタルや予約システムに最適</li>
					</ul>
				</div>
			</div>

			<!-- コード表示切り替え -->
			<div class="collapse-arrow bg-base-200 collapse">
				<input type="checkbox" />
				<div class="collapse-title font-medium">コードを表示</div>
				<div class="collapse-content">
					<HighlightSvelte code={limitedRangeCode} />
				</div>
			</div>
		</div>
	</div>

	<!-- サンプル3: ホテル予約（チェックイン・チェックアウト） -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-xl font-bold">3. ホテル予約システム</h3>
				<button
					class="btn btn-sm btn-ghost"
					onclick={() => copyToClipboard(hotelBookingCode, 'hotel-booking')}
				>
					{#if copySuccess['hotel-booking']}
						<span class="text-success">✓ コピー完了</span>
					{:else}
						📋 コピー
					{/if}
				</button>
			</div>

			<!-- デモ -->
			<div class="bg-base-200 mb-4 rounded-lg p-6">
				<h4 class="mb-3 font-semibold">デモ</h4>
				<div class="flex flex-wrap items-end gap-4">
					<div class="form-control">
						<label class="label">
							<span class="label-text">チェックイン</span>
						</label>
						<input
							type="text"
							class="input input-bordered pika-single"
							placeholder="チェックイン日"
							bind:this={checkInInput}
							readonly
						/>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text">チェックアウト</span>
						</label>
						<input
							type="text"
							class="input input-bordered pika-single"
							placeholder="チェックアウト日"
							bind:this={checkOutInput}
							readonly
						/>
					</div>

					{#if nights > 0}
						<div class="badge badge-primary badge-lg">
							{nights}泊
						</div>
					{/if}
				</div>

				{#if checkInDate && checkOutDate}
					<div class="stats mt-4 shadow">
						<div class="stat">
							<div class="stat-title">宿泊期間</div>
							<div class="stat-value text-lg">{nights}泊{nights + 1}日</div>
							<div class="stat-desc">{checkInDate} 〜 {checkOutDate}</div>
						</div>
					</div>
				{/if}
			</div>

			<div class="alert alert-success mb-4">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/></svg
				>
				<div>
					<h4 class="font-semibold">特徴</h4>
					<ul class="mt-1 list-inside list-disc space-y-1 text-sm">
						<li>チェックアウトは必ず翌日以降</li>
						<li>チェックイン日変更時に自動調整</li>
						<li>宿泊日数を自動計算</li>
						<li>直感的なUXで予約ミスを防止</li>
					</ul>
				</div>
			</div>

			<!-- コード表示切り替え -->
			<div class="collapse-arrow bg-base-200 collapse">
				<input type="checkbox" />
				<div class="collapse-title font-medium">コードを表示</div>
				<div class="collapse-content">
					<HighlightSvelte code={hotelBookingCode} />
				</div>
			</div>
		</div>
	</div>

	<!-- サンプル4: プリセット付き日付範囲選択 -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-xl font-bold">4. プリセット付き日付範囲選択</h3>
				<span class="badge badge-secondary">便利機能</span>
			</div>

			<!-- デモ -->
			<div class="bg-base-200 mb-4 rounded-lg p-6">
				<h4 class="mb-3 font-semibold">デモ</h4>

				<div class="mb-4 flex flex-wrap gap-2">
					<button class="btn btn-sm" onclick={() => setPresetRange(7)}> 今週（7日間） </button>
					<button class="btn btn-sm" onclick={() => setPresetRange(30)}> 今月（30日間） </button>
					<button class="btn btn-sm" onclick={() => setPresetRange(90)}> 四半期（90日間） </button>
					<button class="btn btn-sm" onclick={() => setPresetRange(365)}> 今年（365日間） </button>
				</div>

				<div class="flex flex-wrap gap-4">
					<div class="form-control">
						<label class="label">
							<span class="label-text">開始日</span>
						</label>
						<input
							type="text"
							class="input input-bordered pika-single"
							placeholder="開始日を選択"
							bind:this={presetStartInput}
							value={presetStartDate}
							readonly
						/>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text">終了日</span>
						</label>
						<input
							type="text"
							class="input input-bordered pika-single"
							placeholder="終了日を選択"
							bind:this={presetEndInput}
							value={presetEndDate}
							readonly
						/>
					</div>
				</div>

				{#if presetStartDate && presetEndDate}
					<div class="alert mt-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="stroke-info h-6 w-6 shrink-0"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path></svg
						>
						<span>選択期間: {presetStartDate} 〜 {presetEndDate}</span>
					</div>
				{/if}
			</div>

			<!-- コード表示切り替え -->
			<div class="collapse-arrow bg-base-200 collapse">
				<input type="checkbox" />
				<div class="collapse-title font-medium">コードを表示</div>
				<div class="collapse-content">
					<HighlightSvelte code={presetRangeCode} />
				</div>
			</div>
		</div>
	</div>

	<!-- サンプル5: イベント期間設定 -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-xl font-bold">5. イベント期間設定（最小期間制限付き）</h3>
				<span class="badge badge-accent">最小3日間</span>
			</div>

			<!-- デモ -->
			<div class="bg-base-200 mb-4 rounded-lg p-6">
				<h4 class="mb-3 font-semibold">デモ</h4>

				<div class="flex flex-wrap gap-4">
					<div class="form-control">
						<label class="label">
							<span class="label-text">イベント開始日</span>
						</label>
						<input
							type="text"
							class="input input-bordered pika-single"
							placeholder="開始日を選択"
							bind:this={eventStartInput}
							readonly
						/>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text">イベント終了日</span>
						</label>
						<input
							type="text"
							class="input input-bordered pika-single"
							placeholder="終了日を選択"
							bind:this={eventEndInput}
							readonly
						/>
					</div>
				</div>

				{#if eventStartDate && eventEndDate}
					<div class="alert alert-success mt-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 shrink-0 stroke-current"
							fill="none"
							viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/></svg
						>
						<span>
							イベント期間: {eventStartDate} 〜 {eventEndDate}
							（{calculateNights(eventStartDate, eventEndDate) + 1}日間）
						</span>
					</div>
				{/if}

				<div class="text-base-content/60 mt-2 text-sm">※ イベントは最低3日間の開催が必要です</div>
			</div>

			<!-- コード表示切り替え -->
			<div class="collapse-arrow bg-base-200 collapse">
				<input type="checkbox" />
				<div class="collapse-title font-medium">コードを表示</div>
				<div class="collapse-content">
					<HighlightSvelte code={eventPeriodCode} />
				</div>
			</div>
		</div>
	</div>

	<!-- サンプル6: Cally連携型 -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-xl font-bold">6. Cally連携型日付範囲選択</h3>
				<span class="badge badge-info">Web Component</span>
			</div>

			<!-- デモ -->
			<div class="bg-base-200 mb-4 rounded-lg p-6">
				<h4 class="mb-3 font-semibold">デモ</h4>

				<div class="flex flex-wrap gap-4">
					<button
						popovertarget="cally-start-range"
						class="btn btn-outline btn-primary"
						bind:this={callyStartBtn}
						style="anchor-name:--cally-start-anchor"
					>
						開始日を選択
					</button>

					<button
						popovertarget="cally-end-range"
						class="btn btn-outline btn-secondary"
						bind:this={callyEndBtn}
						style="anchor-name:--cally-end-anchor"
						class:btn-disabled={!callyStartDate}
					>
						終了日を選択
					</button>
				</div>

				{#if callyStartDate && callyEndDate}
					<div class="card bg-base-100 mt-4">
						<div class="card-body">
							<h5 class="card-title text-base">選択された期間</h5>
							<p>
								{formatDate(callyStartDate)} 〜 {formatDate(callyEndDate)}
								<span class="badge badge-sm ml-2">
									{calculateNights(callyStartDate, callyEndDate) + 1}日間
								</span>
							</p>
						</div>
					</div>
				{/if}
			</div>

			<!-- コード表示切り替え -->
			<div class="collapse-arrow bg-base-200 collapse">
				<input type="checkbox" />
				<div class="collapse-title font-medium">コードを表示</div>
				<div class="collapse-content">
					<HighlightSvelte code={callyRangeCode} />
				</div>
			</div>
		</div>
	</div>

	<!-- ベストプラクティス -->
	<div class="card bg-primary/10 border-primary/20 border-2">
		<div class="card-body">
			<h3 class="card-title text-primary">
				<span class="mr-2 text-2xl">💡</span>
				日付範囲選択のベストプラクティス
			</h3>
			<ul class="space-y-2 text-sm">
				<li class="flex items-start">
					<span class="text-primary mr-2">✓</span>
					<span>開始日選択後は終了日の最小値を自動設定して、無効な期間選択を防ぐ</span>
				</li>
				<li class="flex items-start">
					<span class="text-primary mr-2">✓</span>
					<span
						>期間の長さや選択可能な日付範囲に制限を設ける場合は、視覚的にフィードバックを提供</span
					>
				</li>
				<li class="flex items-start">
					<span class="text-primary mr-2">✓</span>
					<span>選択された期間の日数や料金などの計算結果をリアルタイムで表示</span>
				</li>
				<li class="flex items-start">
					<span class="text-primary mr-2">✓</span>
					<span>よく使われる期間（今週、今月など）のプリセットボタンを提供</span>
				</li>
				<li class="flex items-start">
					<span class="text-primary mr-2">✓</span>
					<span>モバイル対応を考慮し、タップしやすいサイズとレイアウトを確保</span>
				</li>
			</ul>
		</div>
	</div>
</div>

<!-- Cally Popovers -->
<div
	popover
	id="cally-start-range"
	class="dropdown bg-base-100 rounded-box shadow-xl"
	style="position-anchor:--cally-start-anchor"
>
	<calendar-date class="cally p-4" onchange={handleCallyStartChange} value={callyStartDate}>
		<svg slot="previous" class="size-4 fill-current" viewBox="0 0 24 24">
			<path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
		</svg>
		<svg slot="next" class="size-4 fill-current" viewBox="0 0 24 24">
			<path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
		</svg>
		<calendar-month></calendar-month>
	</calendar-date>
</div>

<div
	popover
	id="cally-end-range"
	class="dropdown bg-base-100 rounded-box shadow-xl"
	style="position-anchor:--cally-end-anchor"
>
	<calendar-date
		class="cally p-4"
		onchange={handleCallyEndChange}
		value={callyEndDate}
		min={callyStartDate}
	>
		<svg slot="previous" class="size-4 fill-current" viewBox="0 0 24 24">
			<path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
		</svg>
		<svg slot="next" class="size-4 fill-current" viewBox="0 0 24 24">
			<path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
		</svg>
		<calendar-month></calendar-month>
	</calendar-date>
</div>
