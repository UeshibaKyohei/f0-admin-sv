<script>
  import { onMount } from 'svelte';
  import { HighlightSvelte } from 'svelte-highlight';
  import 'svelte-highlight/styles/dark.css';
  
  let { copyToClipboard, copySuccess } = $props();
  
  // フォーム統合サンプル1: 基本的なフォーム送信
  let formData = $state({ name: '', date: '', comments: '' });
  let formSubmitResult = $state('');
  let dateInput1;
  
  // フォーム統合サンプル2: バリデーション付き
  let validationForm = $state({ 
    eventDate: '', 
    eventTitle: '',
    errors: {}
  });
  let dateInput2;
  
  // フォーム統合サンプル3: 必須項目とカスタムバリデーション
  let requiredForm = $state({
    birthDate: '',
    age: '',
    errors: {}
  });
  let dateInput3;
  
  // フォーム統合サンプル4: 日付範囲の動的バリデーション
  let rangeForm = $state({
    startDate: '',
    endDate: '',
    errors: {}
  });
  let startDateInput, endDateInput;
  let startPicker, endPicker;
  
  // フォーム統合サンプル5: フォームのリセット機能
  let resetForm = $state({
    appointmentDate: '',
    appointmentTime: '10:00',
    reason: ''
  });
  let dateInput5;
  let resetPicker;
  
  // サンプルコード
  const basicFormCode = `<script>
  import { onMount } from 'svelte';
  
  let formData = $state({ name: '', date: '', comments: '' });
  let formSubmitResult = $state('');
  let dateInput;
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    const picker = new Pikaday({
      field: dateInput,
      container: dateInput.parentElement,
      onSelect: function() {
        formData.date = this.toString('YYYY-MM-DD');
      }
    });
    
    return () => picker.destroy();
  });
  
  function handleSubmit(e) {
    e.preventDefault();
    formSubmitResult = \`送信成功！ 名前: \${formData.name}, 日付: \${formData.date}\`;
  }
<\/script>

<form onsubmit={handleSubmit} class="space-y-4">
  <div class="form-control">
    <label class="label">
      <span class="label-text">お名前</span>
    </label>
    <input 
      type="text" 
      class="input input-bordered"
      bind:value={formData.name}
      required
    />
  </div>
  
  <div class="form-control">
    <label class="label">
      <span class="label-text">日付を選択</span>
    </label>
    <input 
      type="text" 
      class="input input-bordered pika-single"
      bind:this={dateInput}
      value={formData.date}
      placeholder="クリックして日付を選択"
      required
      readonly
    />
  </div>
  
  <div class="form-control">
    <label class="label">
      <span class="label-text">コメント</span>
    </label>
    <textarea 
      class="textarea textarea-bordered" 
      bind:value={formData.comments}
      rows="3"
    ></textarea>
  </div>
  
  <button type="submit" class="btn btn-primary">送信</button>
</form>`;

  const validationFormCode = `<script>
  let validationForm = $state({ 
    eventDate: '', 
    eventTitle: '',
    errors: {}
  });
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    const picker = new Pikaday({
      field: dateInput,
      container: dateInput.parentElement,
      minDate: new Date(), // 今日以降のみ選択可能
      onSelect: function() {
        validationForm.eventDate = this.toString('YYYY-MM-DD');
        validateEventDate();
      }
    });
    
    return () => picker.destroy();
  });
  
  function validateEventDate() {
    const selectedDate = new Date(validationForm.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      validationForm.errors.eventDate = '過去の日付は選択できません';
    } else {
      delete validationForm.errors.eventDate;
    }
  }
  
  function validateForm() {
    validationForm.errors = {};
    
    if (!validationForm.eventTitle.trim()) {
      validationForm.errors.eventTitle = 'イベント名は必須です';
    }
    
    if (!validationForm.eventDate) {
      validationForm.errors.eventDate = '日付を選択してください';
    } else {
      validateEventDate();
    }
    
    return Object.keys(validationForm.errors).length === 0;
  }
  
  function handleSubmit(e) {
    e.preventDefault();
    if (validateForm()) {
      alert('イベントが登録されました！');
    }
  }
<\/script>

<form onsubmit={handleSubmit} class="space-y-4">
  <div class="form-control">
    <label class="label">
      <span class="label-text">イベント名</span>
      <span class="label-text-alt text-error">必須</span>
    </label>
    <input 
      type="text" 
      class="input input-bordered {validationForm.errors.eventTitle ? 'input-error' : ''}"
      bind:value={validationForm.eventTitle}
      onblur={validateForm}
    />
    {#if validationForm.errors.eventTitle}
      <label class="label">
        <span class="label-text-alt text-error">{validationForm.errors.eventTitle}</span>
      </label>
    {/if}
  </div>
  
  <div class="form-control">
    <label class="label">
      <span class="label-text">イベント日</span>
      <span class="label-text-alt text-error">必須</span>
    </label>
    <input 
      type="text" 
      class="input input-bordered pika-single {validationForm.errors.eventDate ? 'input-error' : ''}"
      bind:this={dateInput}
      value={validationForm.eventDate}
      placeholder="今日以降の日付を選択"
      readonly
    />
    {#if validationForm.errors.eventDate}
      <label class="label">
        <span class="label-text-alt text-error">{validationForm.errors.eventDate}</span>
      </label>
    {/if}
  </div>
  
  <button type="submit" class="btn btn-primary">登録</button>
</form>`;

  const ageFormCode = `<script>
  let requiredForm = $state({
    birthDate: '',
    age: '',
    errors: {}
  });
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    
    const picker = new Pikaday({
      field: dateInput,
      container: dateInput.parentElement,
      yearRange: [minDate.getFullYear(), maxDate.getFullYear()],
      maxDate: maxDate, // 18歳以上
      defaultDate: new Date(today.getFullYear() - 25, 0, 1),
      onSelect: function() {
        requiredForm.birthDate = this.toString('YYYY-MM-DD');
        calculateAge();
      }
    });
    
    return () => picker.destroy();
  });
  
  function calculateAge() {
    if (requiredForm.birthDate) {
      const birthDate = new Date(requiredForm.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      requiredForm.age = age.toString();
      
      if (age < 18) {
        requiredForm.errors.birthDate = '18歳以上である必要があります';
      } else {
        delete requiredForm.errors.birthDate;
      }
    }
  }
<\/script>

<form class="space-y-4">
  <div class="form-control">
    <label class="label">
      <span class="label-text">生年月日</span>
      <span class="label-text-alt text-error">必須</span>
    </label>
    <input 
      type="text" 
      class="input input-bordered pika-single {requiredForm.errors.birthDate ? 'input-error' : ''}"
      bind:this={dateInput}
      value={requiredForm.birthDate}
      placeholder="生年月日を選択"
      readonly
    />
    {#if requiredForm.errors.birthDate}
      <label class="label">
        <span class="label-text-alt text-error">{requiredForm.errors.birthDate}</span>
      </label>
    {/if}
  </div>
  
  {#if requiredForm.age}
    <div class="stats shadow">
      <div class="stat">
        <div class="stat-title">年齢</div>
        <div class="stat-value text-primary">{requiredForm.age}歳</div>
      </div>
    </div>
  {/if}
  
  <button 
    type="submit" 
    class="btn btn-primary"
    disabled={!requiredForm.birthDate || requiredForm.errors.birthDate}
  >
    確認
  </button>
</form>`;

  const rangeValidationCode = `<script>
  let rangeForm = $state({
    startDate: '',
    endDate: '',
    errors: {}
  });
  let startDateInput, endDateInput;
  let startPicker, endPicker;
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    startPicker = new Pikaday({
      field: startDateInput,
      container: startDateInput.parentElement,
      minDate: new Date(),
      onSelect: function() {
        rangeForm.startDate = this.toString('YYYY-MM-DD');
        
        // 終了日ピッカーの最小日付を更新
        if (endPicker) {
          const nextDay = new Date(this.getDate());
          nextDay.setDate(nextDay.getDate() + 1);
          endPicker.setMinDate(nextDay);
          
          // 終了日が開始日より前の場合、クリア
          if (rangeForm.endDate && new Date(rangeForm.endDate) <= this.getDate()) {
            rangeForm.endDate = '';
            endPicker.setDate(null);
          }
        }
        validateDates();
      }
    });
    
    endPicker = new Pikaday({
      field: endDateInput,
      container: endDateInput.parentElement,
      minDate: new Date(),
      onSelect: function() {
        rangeForm.endDate = this.toString('YYYY-MM-DD');
        validateDates();
      }
    });
    
    return () => {
      startPicker?.destroy();
      endPicker?.destroy();
    };
  });
  
  function validateDates() {
    rangeForm.errors = {};
    
    if (rangeForm.startDate && rangeForm.endDate) {
      const start = new Date(rangeForm.startDate);
      const end = new Date(rangeForm.endDate);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 30) {
        rangeForm.errors.dateRange = '期間は30日以内で設定してください';
      } else if (diffDays < 0) {
        rangeForm.errors.dateRange = '終了日は開始日より後を選択してください';
      }
    }
  }
<\/script>

<form class="space-y-4">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="form-control">
      <label class="label">
        <span class="label-text">開始日</span>
      </label>
      <input 
        type="text" 
        class="input input-bordered pika-single"
        bind:this={startDateInput}
        value={rangeForm.startDate}
        placeholder="開始日を選択"
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
        bind:this={endDateInput}
        value={rangeForm.endDate}
        placeholder="終了日を選択"
        readonly
      />
    </div>
  </div>
  
  {#if rangeForm.errors.dateRange}
    <div class="alert alert-error">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>{rangeForm.errors.dateRange}</span>
    </div>
  {/if}
  
  <button 
    type="submit" 
    class="btn btn-primary"
    disabled={rangeForm.errors.dateRange || !rangeForm.startDate || !rangeForm.endDate}
  >
    予約する
  </button>
</form>`;

  const resetFormCode = `<script>
  let resetForm = $state({
    appointmentDate: '',
    appointmentTime: '10:00',
    reason: ''
  });
  let dateInput;
  let resetPicker;
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    resetPicker = new Pikaday({
      field: dateInput,
      container: dateInput.parentElement,
      onSelect: function() {
        resetForm.appointmentDate = this.toString('YYYY-MM-DD');
      }
    });
    
    return () => resetPicker.destroy();
  });
  
  function handleReset() {
    // フォームデータをリセット
    resetForm = {
      appointmentDate: '',
      appointmentTime: '10:00',
      reason: ''
    };
    
    // Pikadayのインスタンスもリセット
    if (resetPicker) {
      resetPicker.setDate(null);
    }
  }
  
  function handleSubmit(e) {
    e.preventDefault();
    alert('予約が完了しました！');
    handleReset(); // 送信後に自動リセット
  }
<\/script>

<form onsubmit={handleSubmit} class="space-y-4">
  <div class="form-control">
    <label class="label">
      <span class="label-text">予約日</span>
    </label>
    <input 
      type="text" 
      class="input input-bordered pika-single"
      bind:this={dateInput}
      value={resetForm.appointmentDate}
      placeholder="予約日を選択"
      required
      readonly
    />
  </div>
  
  <div class="form-control">
    <label class="label">
      <span class="label-text">予約時間</span>
    </label>
    <select class="select select-bordered" bind:value={resetForm.appointmentTime}>
      <option value="09:00">09:00</option>
      <option value="10:00">10:00</option>
      <option value="11:00">11:00</option>
      <option value="14:00">14:00</option>
      <option value="15:00">15:00</option>
      <option value="16:00">16:00</option>
    </select>
  </div>
  
  <div class="form-control">
    <label class="label">
      <span class="label-text">理由</span>
    </label>
    <textarea 
      class="textarea textarea-bordered" 
      bind:value={resetForm.reason}
      rows="3"
      placeholder="予約理由を入力"
    ></textarea>
  </div>
  
  <div class="flex gap-2">
    <button type="submit" class="btn btn-primary">予約する</button>
    <button type="button" class="btn btn-ghost" onclick={handleReset}>
      リセット
    </button>
  </div>
</form>`;
  
  // 初期化
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    // 基本フォーム用
    const picker1 = new Pikaday({
      field: dateInput1,
      container: dateInput1.parentElement,
      onSelect: function() {
        formData.date = this.toString('YYYY-MM-DD');
      }
    });
    
    // バリデーション付きフォーム用
    const picker2 = new Pikaday({
      field: dateInput2,
      container: dateInput2.parentElement,
      minDate: new Date(), // 今日以降のみ
      onSelect: function() {
        validationForm.eventDate = this.toString('YYYY-MM-DD');
        validateEventDate();
      }
    });
    
    // 必須項目フォーム用（誕生日）
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    
    const picker3 = new Pikaday({
      field: dateInput3,
      container: dateInput3.parentElement,
      yearRange: [minDate.getFullYear(), maxDate.getFullYear()],
      maxDate: maxDate, // 18歳以上
      defaultDate: new Date(today.getFullYear() - 25, 0, 1),
      onSelect: function() {
        requiredForm.birthDate = this.toString('YYYY-MM-DD');
        calculateAge();
      }
    });
    
    // 日付範囲フォーム用
    startPicker = new Pikaday({
      field: startDateInput,
      container: startDateInput.parentElement,
      minDate: new Date(),
      onSelect: function() {
        rangeForm.startDate = this.toString('YYYY-MM-DD');
        
        if (endPicker) {
          const nextDay = new Date(this.getDate());
          nextDay.setDate(nextDay.getDate() + 1);
          endPicker.setMinDate(nextDay);
          
          if (rangeForm.endDate && new Date(rangeForm.endDate) <= this.getDate()) {
            rangeForm.endDate = '';
            endPicker.setDate(null);
          }
        }
        validateDates();
      }
    });
    
    endPicker = new Pikaday({
      field: endDateInput,
      container: endDateInput.parentElement,
      minDate: new Date(),
      onSelect: function() {
        rangeForm.endDate = this.toString('YYYY-MM-DD');
        validateDates();
      }
    });
    
    // リセット機能付きフォーム用
    resetPicker = new Pikaday({
      field: dateInput5,
      container: dateInput5.parentElement,
      minDate: new Date(),
      onSelect: function() {
        resetForm.appointmentDate = this.toString('YYYY-MM-DD');
      }
    });
    
    return () => {
      picker1.destroy();
      picker2.destroy();
      picker3.destroy();
      startPicker?.destroy();
      endPicker?.destroy();
      resetPicker?.destroy();
    };
  });
  
  // フォーム送信ハンドラ（基本）
  function handleSubmit(e) {
    e.preventDefault();
    formSubmitResult = `送信成功！ 名前: ${formData.name}, 日付: ${formData.date}`;
  }
  
  // バリデーション関数
  function validateEventDate() {
    const selectedDate = new Date(validationForm.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      validationForm.errors.eventDate = '過去の日付は選択できません';
    } else {
      delete validationForm.errors.eventDate;
    }
  }
  
  function validateForm() {
    validationForm.errors = {};
    
    if (!validationForm.eventTitle.trim()) {
      validationForm.errors.eventTitle = 'イベント名は必須です';
    }
    
    if (!validationForm.eventDate) {
      validationForm.errors.eventDate = '日付を選択してください';
    } else {
      validateEventDate();
    }
    
    return Object.keys(validationForm.errors).length === 0;
  }
  
  function handleValidationSubmit(e) {
    e.preventDefault();
    if (validateForm()) {
      alert('イベントが登録されました！');
    }
  }
  
  // 年齢計算
  function calculateAge() {
    if (requiredForm.birthDate) {
      const birthDate = new Date(requiredForm.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      requiredForm.age = age.toString();
      
      if (age < 18) {
        requiredForm.errors.birthDate = '18歳以上である必要があります';
      } else {
        delete requiredForm.errors.birthDate;
      }
    }
  }
  
  // 日付範囲バリデーション
  function validateDates() {
    rangeForm.errors = {};
    
    if (rangeForm.startDate && rangeForm.endDate) {
      const start = new Date(rangeForm.startDate);
      const end = new Date(rangeForm.endDate);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 30) {
        rangeForm.errors.dateRange = '期間は30日以内で設定してください';
      } else if (diffDays < 0) {
        rangeForm.errors.dateRange = '終了日は開始日より後を選択してください';
      }
    }
  }
  
  // フォームリセット
  function handleReset() {
    resetForm = {
      appointmentDate: '',
      appointmentTime: '10:00',
      reason: ''
    };
    
    if (resetPicker) {
      resetPicker.setDate(null);
    }
  }
  
  function handleResetSubmit(e) {
    e.preventDefault();
    alert('予約が完了しました！');
    handleReset();
  }
</script>

<div class="space-y-8">
  <!-- セクションタイトル -->
  <div class="text-center">
    <h2 class="text-3xl font-bold text-primary mb-2">フォーム統合サンプル</h2>
    <p class="text-base-content/70">実開発で使える日付入力とフォームバリデーションの実装例</p>
  </div>

  <!-- 1. 基本的なフォーム送信 -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <h3 class="card-title">1. 基本的なフォーム送信</h3>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(basicFormCode, 'basic-form')}
        >
          {copySuccess['basic-form'] ? '✓ コピー済み' : 'コピー'}
        </button>
      </div>
      
      <!-- デモ -->
      <div class="bg-base-200 p-6 rounded-lg mb-4">
        <form onsubmit={handleSubmit} class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">お名前</span>
            </label>
            <input 
              type="text" 
              class="input input-bordered"
              bind:value={formData.name}
              required
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">日付を選択</span>
            </label>
            <input 
              type="text" 
              class="input input-bordered pika-single"
              bind:this={dateInput1}
              value={formData.date}
              placeholder="クリックして日付を選択"
              required
              readonly
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">コメント</span>
            </label>
            <textarea 
              class="textarea textarea-bordered" 
              bind:value={formData.comments}
              rows="3"
            ></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary">送信</button>
        </form>
        
        {#if formSubmitResult}
          <div class="alert alert-success mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{formSubmitResult}</span>
          </div>
        {/if}
      </div>
      
      <!-- コード表示切り替え -->
      <div class="collapse collapse-arrow bg-base-200">
        <input type="checkbox" />
        <div class="collapse-title font-medium">
          コードを表示
        </div>
        <div class="collapse-content">
          <HighlightSvelte code={basicFormCode} />
        </div>
      </div>
    </div>
  </div>

  <!-- 2. バリデーション付きフォーム -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <h3 class="card-title">2. バリデーション付きフォーム</h3>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(validationFormCode, 'validation-form')}
        >
          {copySuccess['validation-form'] ? '✓ コピー済み' : 'コピー'}
        </button>
      </div>
      
      <!-- デモ -->
      <div class="bg-base-200 p-6 rounded-lg mb-4">
        <form onsubmit={handleValidationSubmit} class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">イベント名</span>
              <span class="label-text-alt text-error">必須</span>
            </label>
            <input 
              type="text" 
              class="input input-bordered {validationForm.errors.eventTitle ? 'input-error' : ''}"
              bind:value={validationForm.eventTitle}
              onblur={validateForm}
            />
            {#if validationForm.errors.eventTitle}
              <label class="label">
                <span class="label-text-alt text-error">{validationForm.errors.eventTitle}</span>
              </label>
            {/if}
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">イベント日</span>
              <span class="label-text-alt text-error">必須</span>
            </label>
            <input 
              type="text" 
              class="input input-bordered pika-single {validationForm.errors.eventDate ? 'input-error' : ''}"
              bind:this={dateInput2}
              value={validationForm.eventDate}
              placeholder="今日以降の日付を選択"
              readonly
            />
            {#if validationForm.errors.eventDate}
              <label class="label">
                <span class="label-text-alt text-error">{validationForm.errors.eventDate}</span>
              </label>
            {/if}
          </div>
          
          <button type="submit" class="btn btn-primary">登録</button>
        </form>
      </div>
      
      <!-- コード表示切り替え -->
      <div class="collapse collapse-arrow bg-base-200">
        <input type="checkbox" />
        <div class="collapse-title font-medium">
          コードを表示
        </div>
        <div class="collapse-content">
          <HighlightSvelte code={validationFormCode} />
        </div>
      </div>
    </div>
  </div>

  <!-- 3. 年齢制限付き誕生日入力 -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <h3 class="card-title">3. 年齢制限付き誕生日入力（18歳以上）</h3>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(ageFormCode, 'age-form')}
        >
          {copySuccess['age-form'] ? '✓ コピー済み' : 'コピー'}
        </button>
      </div>
      
      <!-- デモ -->
      <div class="bg-base-200 p-6 rounded-lg mb-4">
        <form class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">生年月日</span>
              <span class="label-text-alt text-error">必須</span>
            </label>
            <input 
              type="text" 
              class="input input-bordered pika-single {requiredForm.errors.birthDate ? 'input-error' : ''}"
              bind:this={dateInput3}
              value={requiredForm.birthDate}
              placeholder="生年月日を選択"
              readonly
            />
            {#if requiredForm.errors.birthDate}
              <label class="label">
                <span class="label-text-alt text-error">{requiredForm.errors.birthDate}</span>
              </label>
            {/if}
          </div>
          
          {#if requiredForm.age}
            <div class="stats shadow">
              <div class="stat">
                <div class="stat-title">年齢</div>
                <div class="stat-value text-primary">{requiredForm.age}歳</div>
              </div>
            </div>
          {/if}
          
          <button 
            type="submit" 
            class="btn btn-primary"
            disabled={!requiredForm.birthDate || requiredForm.errors.birthDate}
          >
            確認
          </button>
        </form>
      </div>
      
      <div class="alert alert-info mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6 shrink-0 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <div>
          <h3 class="font-bold">実装のポイント</h3>
          <div class="text-xs">
            • yearRangeで選択可能な年の範囲を設定<br/>
            • maxDateで最大日付（18年前）を制限<br/>
            • onSelectで年齢を自動計算
          </div>
        </div>
      </div>
      
      <!-- コード表示切り替え -->
      <div class="collapse collapse-arrow bg-base-200">
        <input type="checkbox" />
        <div class="collapse-title font-medium">
          コードを表示
        </div>
        <div class="collapse-content">
          <HighlightSvelte code={ageFormCode} />
        </div>
      </div>
    </div>
  </div>

  <!-- 4. 日付範囲の動的バリデーション -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <h3 class="card-title">4. 日付範囲の動的バリデーション</h3>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(rangeValidationCode, 'range-form')}
        >
          {copySuccess['range-form'] ? '✓ コピー済み' : 'コピー'}
        </button>
      </div>
      
      <!-- デモ -->
      <div class="bg-base-200 p-6 rounded-lg mb-4">
        <form class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">開始日</span>
              </label>
              <input 
                type="text" 
                class="input input-bordered pika-single"
                bind:this={startDateInput}
                value={rangeForm.startDate}
                placeholder="開始日を選択"
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
                bind:this={endDateInput}
                value={rangeForm.endDate}
                placeholder="終了日を選択"
                readonly
              />
            </div>
          </div>
          
          {#if rangeForm.errors.dateRange}
            <div class="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{rangeForm.errors.dateRange}</span>
            </div>
          {/if}
          
          <button 
            type="submit" 
            class="btn btn-primary"
            disabled={rangeForm.errors.dateRange || !rangeForm.startDate || !rangeForm.endDate}
          >
            予約する
          </button>
        </form>
      </div>
      
      <!-- コード表示切り替え -->
      <div class="collapse collapse-arrow bg-base-200">
        <input type="checkbox" />
        <div class="collapse-title font-medium">
          コードを表示
        </div>
        <div class="collapse-content">
          <HighlightSvelte code={rangeValidationCode} />
        </div>
      </div>
    </div>
  </div>

  <!-- 5. フォームのリセット機能 -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-start mb-4">
        <h3 class="card-title">5. フォームのリセット機能</h3>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => copyToClipboard(resetFormCode, 'reset-form')}
        >
          {copySuccess['reset-form'] ? '✓ コピー済み' : 'コピー'}
        </button>
      </div>
      
      <!-- デモ -->
      <div class="bg-base-200 p-6 rounded-lg mb-4">
        <form onsubmit={handleResetSubmit} class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">予約日</span>
            </label>
            <input 
              type="text" 
              class="input input-bordered pika-single"
              bind:this={dateInput5}
              value={resetForm.appointmentDate}
              placeholder="予約日を選択"
              required
              readonly
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">予約時間</span>
            </label>
            <select class="select select-bordered" bind:value={resetForm.appointmentTime}>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
              <option value="16:00">16:00</option>
            </select>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">理由</span>
            </label>
            <textarea 
              class="textarea textarea-bordered" 
              bind:value={resetForm.reason}
              rows="3"
              placeholder="予約理由を入力"
            ></textarea>
          </div>
          
          <div class="flex gap-2">
            <button type="submit" class="btn btn-primary">予約する</button>
            <button type="button" class="btn btn-ghost" onclick={handleReset}>
              リセット
            </button>
          </div>
        </form>
      </div>
      
      <!-- コード表示切り替え -->
      <div class="collapse collapse-arrow bg-base-200">
        <input type="checkbox" />
        <div class="collapse-title font-medium">
          コードを表示
        </div>
        <div class="collapse-content">
          <HighlightSvelte code={resetFormCode} />
        </div>
      </div>
    </div>
  </div>

  <!-- Tips & ベストプラクティス -->
  <div class="card bg-primary/10 border-2 border-primary/20">
    <div class="card-body">
      <h3 class="card-title text-primary mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        フォーム統合のベストプラクティス
      </h3>
      
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-bold mb-2">バリデーション設計</h4>
          <ul class="text-sm space-y-1">
            <li>• リアルタイムバリデーション（onblur/onSelect）</li>
            <li>• 送信前の包括的なチェック</li>
            <li>• わかりやすいエラーメッセージ</li>
            <li>• 視覚的なフィードバック（input-error）</li>
          </ul>
        </div>
        
        <div>
          <h4 class="font-bold mb-2">ユーザビリティ向上</h4>
          <ul class="text-sm space-y-1">
            <li>• readonlyで直接入力を防止</li>
            <li>• placeholderで入力内容を明示</li>
            <li>• 必須項目の明確な表示</li>
            <li>• 適切なデフォルト値の設定</li>
          </ul>
        </div>
        
        <div>
          <h4 class="font-bold mb-2">日付の制約設定</h4>
          <ul class="text-sm space-y-1">
            <li>• minDate/maxDateで範囲制限</li>
            <li>• 動的な制約の更新（連動）</li>
            <li>• yearRangeで年の選択範囲を制御</li>
            <li>• setMinDate/setMaxDateで動的更新</li>
          </ul>
        </div>
        
        <div>
          <h4 class="font-bold mb-2">状態管理</h4>
          <ul class="text-sm space-y-1">
            <li>• Svelte 5の$stateで状態管理</li>
            <li>• Pikadayインスタンスの適切な管理</li>
            <li>• フォームリセット時の同期</li>
            <li>• メモリリークを防ぐdestroy処理</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>