<script>
  import { 
    isModalOpen, 
    modalMode, 
    currentEmployee, 
    closeEmployeeModal,
    addNotification 
  } from './stores/uiStore.js';
  import { 
    departmentList, 
    positionList, 
    skillList,
    employeeSkillMap,
    updateEmployee,
    createEmployee 
  } from './stores/employeeStore.js';
  import { STATUS, WORK_LOCATIONS } from './config.js';

  // フォームデータの管理
  let formData = {};
  let selectedSkills = [];
  let errors = {};
  let isSubmitting = false;

  // モーダルが開かれたときにデータを初期化
  $: if ($isModalOpen && $currentEmployee) {
    initializeFormData();
  }

  function initializeFormData() {
    if ($modalMode === 'create') {
      // 新規作成モード
      formData = {
        employeeNumber: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        departmentId: null,
        positionId: null,
        contractType: 'fulltime',
        status: 'active',
        hireDate: new Date().toISOString().split('T')[0],
        birthDate: '',
        workLocation: 'tokyo',
        avatar: null
      };
      selectedSkills = [];
    } else {
      // 表示・編集モード
      formData = { ...$currentEmployee };
      selectedSkills = ($employeeSkillMap.get($currentEmployee.id) || []).map(es => ({
        skillId: es.skill.id,
        level: es.level,
        acquiredDate: es.acquiredDate
      }));
    }
    errors = {};
  }

  // バリデーション
  function validateForm() {
    errors = {};
    
    if (!formData.employeeNumber?.trim()) {
      errors.employeeNumber = '社員番号は必須です';
    }
    if (!formData.firstName?.trim()) {
      errors.firstName = '名は必須です';
    }
    if (!formData.lastName?.trim()) {
      errors.lastName = '姓は必須です';
    }
    if (!formData.email?.trim()) {
      errors.email = 'メールアドレスは必須です';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    if (!formData.departmentId) {
      errors.departmentId = '部署を選択してください';
    }
    if (!formData.positionId) {
      errors.positionId = '役職を選択してください';
    }
    if (!formData.hireDate) {
      errors.hireDate = '入社日は必須です';
    }

    return Object.keys(errors).length === 0;
  }

  // スキル追加
  function addSkill() {
    selectedSkills = [...selectedSkills, {
      skillId: null,
      level: 1,
      acquiredDate: new Date().toISOString().split('T')[0]
    }];
  }

  // スキル削除
  function removeSkill(index) {
    selectedSkills = selectedSkills.filter((_, i) => i !== index);
  }

  // フォーム送信
  async function handleSubmit() {
    if (!validateForm()) return;

    isSubmitting = true;
    try {
      const employeeData = {
        ...formData,
        skills: selectedSkills.filter(skill => skill.skillId)
      };

      if ($modalMode === 'create') {
        await createEmployee(employeeData);
        addNotification('社員を新規登録しました', 'success');
      } else {
        await updateEmployee(employeeData);
        addNotification('社員情報を更新しました', 'success');
      }
      
      closeEmployeeModal();
    } catch (error) {
      addNotification('エラーが発生しました: ' + error.message, 'error');
    } finally {
      isSubmitting = false;
    }
  }

  // 年齢計算
  function calculateAge(birthDate) {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  // 勤続年数計算
  function calculateTenure(hireDate) {
    const today = new Date();
    const hire = new Date(hireDate);
    const years = today.getFullYear() - hire.getFullYear();
    const months = today.getMonth() - hire.getMonth();
    
    if (years < 1) {
      return `${months + (years * 12)}ヶ月`;
    } else {
      return `${years}年${months >= 0 ? months : 12 + months}ヶ月`;
    }
  }

  // アバター表示の代替
  function getInitials(employee) {
    return `${employee.lastName?.charAt(0) || ''}${employee.firstName?.charAt(0) || ''}`;
  }

  // ステータス・雇用形態の表示用ラベル取得
  function getStatusLabel(status) {
    return STATUS.EMPLOYEE[status?.toUpperCase()]?.label || status;
  }

  function getContractTypeLabel(contractType) {
    return STATUS.CONTRACT_TYPE[contractType?.toUpperCase()]?.label || contractType;
  }
</script>

<!-- モーダル -->
{#if $isModalOpen}
  <div class="modal modal-open">
    <div class="modal-box max-w-4xl max-h-screen">
      <!-- ヘッダー -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold">
          {#if $modalMode === 'view'}
            社員詳細
          {:else if $modalMode === 'edit'}
            社員情報編集
          {:else}
            新規社員登録
          {/if}
        </h2>
        <button class="btn btn-sm btn-circle btn-ghost" on:click={closeEmployeeModal}>
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>

      <!-- 表示モード -->
      {#if $modalMode === 'view'}
        <div class="space-y-6">
          <!-- プロフィール部分 -->
          <div class="card bg-base-50">
            <div class="card-body">
              <div class="flex items-start gap-6">
                <!-- アバター -->
                <div class="avatar avatar-placeholder">
                  <div class="w-24 h-24 rounded-full bg-primary text-primary-content">
                    {#if $currentEmployee.avatar}
                      <img src={$currentEmployee.avatar} alt={`${$currentEmployee.lastName} ${$currentEmployee.firstName}`} />
                    {:else}
                      <span class="text-2xl">{getInitials($currentEmployee)}</span>
                    {/if}
                  </div>
                </div>

                <!-- 基本情報 -->
                <div class="flex-1">
                  <h3 class="text-2xl font-bold mb-2">
                    {$currentEmployee.lastName} {$currentEmployee.firstName}
                  </h3>
                  <p class="text-base-content/70 mb-4">
                    {$currentEmployee.employeeNumber} • {$currentEmployee.email}
                  </p>
                  
                  <div class="flex gap-3 mb-4">
                    <div class="badge {STATUS.EMPLOYEE[$currentEmployee.status?.toUpperCase()]?.color || 'badge-neutral'}">
                      {getStatusLabel($currentEmployee.status)}
                    </div>
                    <div class="badge {STATUS.CONTRACT_TYPE[$currentEmployee.contractType?.toUpperCase()]?.color || 'badge-neutral'}">
                      {getContractTypeLabel($currentEmployee.contractType)}
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-base-content/60">部署:</span>
                      <span class="ml-2">{$departmentList.find(d => d.id === $currentEmployee.departmentId)?.name || '-'}</span>
                    </div>
                    <div>
                      <span class="text-base-content/60">役職:</span>
                      <span class="ml-2">{$positionList.find(p => p.id === $currentEmployee.positionId)?.name || '-'}</span>
                    </div>
                    <div>
                      <span class="text-base-content/60">年齢:</span>
                      <span class="ml-2">{calculateAge($currentEmployee.birthDate)}歳</span>
                    </div>
                    <div>
                      <span class="text-base-content/60">勤続年数:</span>
                      <span class="ml-2">{calculateTenure($currentEmployee.hireDate)}</span>
                    </div>
                    <div>
                      <span class="text-base-content/60">入社日:</span>
                      <span class="ml-2">{new Date($currentEmployee.hireDate).toLocaleDateString('ja-JP')}</span>
                    </div>
                    <div>
                      <span class="text-base-content/60">勤務地:</span>
                      <span class="ml-2">{$currentEmployee.workLocation || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 連絡先情報 -->
          <div class="card bg-base-100">
            <div class="card-body">
              <h4 class="card-title text-lg mb-4">連絡先情報</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm text-base-content/60">メールアドレス</label>
                  <p class="font-medium">{$currentEmployee.email}</p>
                </div>
                <div>
                  <label class="text-sm text-base-content/60">電話番号</label>
                  <p class="font-medium">{$currentEmployee.phone || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- スキル情報 -->
          {#if $employeeSkillMap.get($currentEmployee.id)?.length > 0}
            <div class="card bg-base-100">
              <div class="card-body">
                <h4 class="card-title text-lg mb-4">保有スキル</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {#each $employeeSkillMap.get($currentEmployee.id) || [] as employeeSkill}
                    <div class="flex items-center justify-between p-3 bg-base-50 rounded-lg">
                      <div>
                        <div class="font-medium">{employeeSkill.skill.name}</div>
                        <div class="text-xs text-base-content/60">{employeeSkill.skill.category}</div>
                      </div>
                      <div class="text-right">
                        <div class="badge badge-outline badge-sm">
                          レベル {employeeSkill.level}
                        </div>
                        <div class="text-xs text-base-content/60 mt-1">
                          {new Date(employeeSkill.acquiredDate).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          {/if}
        </div>

        <!-- 表示モードのアクション -->
        <div class="modal-action">
          <button class="btn btn-primary" on:click={() => modalMode.set('edit')}>
            編集
          </button>
          <button class="btn btn-ghost" on:click={closeEmployeeModal}>
            閉じる
          </button>
        </div>

      <!-- 編集・作成モード -->
      {:else}
        <form on:submit|preventDefault={handleSubmit}>
          <div class="space-y-6">
            <!-- 基本情報 -->
            <div class="card bg-base-100">
              <div class="card-body">
                <h4 class="card-title text-lg mb-4">基本情報</h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">社員番号 <span class="text-error">*</span></span>
                    </label>
                    <input 
                      type="text" 
                      class="input input-bordered {errors.employeeNumber ? 'input-error' : ''}"
                      bind:value={formData.employeeNumber}
                      disabled={$modalMode === 'edit'}
                      placeholder="EMP001"
                    />
                    {#if errors.employeeNumber}
                      <label class="label">
                        <span class="label-text-alt text-error">{errors.employeeNumber}</span>
                      </label>
                    {/if}
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">メールアドレス <span class="text-error">*</span></span>
                    </label>
                    <input 
                      type="email" 
                      class="input input-bordered {errors.email ? 'input-error' : ''}"
                      bind:value={formData.email}
                      placeholder="example@company.com"
                    />
                    {#if errors.email}
                      <label class="label">
                        <span class="label-text-alt text-error">{errors.email}</span>
                      </label>
                    {/if}
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">姓 <span class="text-error">*</span></span>
                    </label>
                    <input 
                      type="text" 
                      class="input input-bordered {errors.lastName ? 'input-error' : ''}"
                      bind:value={formData.lastName}
                      placeholder="田中"
                    />
                    {#if errors.lastName}
                      <label class="label">
                        <span class="label-text-alt text-error">{errors.lastName}</span>
                      </label>
                    {/if}
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">名 <span class="text-error">*</span></span>
                    </label>
                    <input 
                      type="text" 
                      class="input input-bordered {errors.firstName ? 'input-error' : ''}"
                      bind:value={formData.firstName}
                      placeholder="太郎"
                    />
                    {#if errors.firstName}
                      <label class="label">
                        <span class="label-text-alt text-error">{errors.firstName}</span>
                      </label>
                    {/if}
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">電話番号</span>
                    </label>
                    <input 
                      type="tel" 
                      class="input input-bordered"
                      bind:value={formData.phone}
                      placeholder="090-1234-5678"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">生年月日</span>
                    </label>
                    <input 
                      type="date" 
                      class="input input-bordered"
                      bind:value={formData.birthDate}
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- 組織情報 -->
            <div class="card bg-base-100">
              <div class="card-body">
                <h4 class="card-title text-lg mb-4">組織情報</h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">部署 <span class="text-error">*</span></span>
                    </label>
                    <select 
                      class="select select-bordered {errors.departmentId ? 'select-error' : ''}"
                      bind:value={formData.departmentId}
                    >
                      <option value={null}>部署を選択</option>
                      {#each $departmentList as department}
                        <option value={department.id}>
                          {'　'.repeat(department.level)}{department.name}
                        </option>
                      {/each}
                    </select>
                    {#if errors.departmentId}
                      <label class="label">
                        <span class="label-text-alt text-error">{errors.departmentId}</span>
                      </label>
                    {/if}
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">役職 <span class="text-error">*</span></span>
                    </label>
                    <select 
                      class="select select-bordered {errors.positionId ? 'select-error' : ''}"
                      bind:value={formData.positionId}
                    >
                      <option value={null}>役職を選択</option>
                      {#each $positionList as position}
                        <option value={position.id}>{position.name}</option>
                      {/each}
                    </select>
                    {#if errors.positionId}
                      <label class="label">
                        <span class="label-text-alt text-error">{errors.positionId}</span>
                      </label>
                    {/if}
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">雇用形態</span>
                    </label>
                    <select 
                      class="select select-bordered"
                      bind:value={formData.contractType}
                    >
                      {#each Object.values(STATUS.CONTRACT_TYPE) as contractType}
                        <option value={contractType.value}>{contractType.label}</option>
                      {/each}
                    </select>
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">在籍状況</span>
                    </label>
                    <select 
                      class="select select-bordered"
                      bind:value={formData.status}
                    >
                      {#each Object.values(STATUS.EMPLOYEE) as status}
                        <option value={status.value}>{status.label}</option>
                      {/each}
                    </select>
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">入社日 <span class="text-error">*</span></span>
                    </label>
                    <input 
                      type="date" 
                      class="input input-bordered {errors.hireDate ? 'input-error' : ''}"
                      bind:value={formData.hireDate}
                    />
                    {#if errors.hireDate}
                      <label class="label">
                        <span class="label-text-alt text-error">{errors.hireDate}</span>
                      </label>
                    {/if}
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">勤務地</span>
                    </label>
                    <select 
                      class="select select-bordered"
                      bind:value={formData.workLocation}
                    >
                      <option value={null}>勤務地を選択</option>
                      {#each WORK_LOCATIONS as location}
                        <option value={location}>{location}</option>
                      {/each}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- スキル情報 -->
            <div class="card bg-base-100">
              <div class="card-body">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="card-title text-lg">スキル情報</h4>
                  <button type="button" class="btn btn-outline btn-sm" on:click={addSkill}>
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path>
                    </svg>
                    スキル追加
                  </button>
                </div>

                <div class="space-y-3">
                  {#each selectedSkills as skill, index}
                    <div class="flex items-center gap-3 p-3 bg-base-50 rounded-lg">
                      <div class="flex-1">
                        <select 
                          class="select select-bordered select-sm w-full"
                          bind:value={skill.skillId}
                        >
                          <option value={null}>スキルを選択</option>
                          {#each $skillList as availableSkill}
                            <option value={availableSkill.id}>{availableSkill.name}</option>
                          {/each}
                        </select>
                      </div>
                      <div class="w-24">
                        <select 
                          class="select select-bordered select-sm w-full"
                          bind:value={skill.level}
                        >
                          <option value={1}>レベル1</option>
                          <option value={2}>レベル2</option>
                          <option value={3}>レベル3</option>
                          <option value={4}>レベル4</option>
                          <option value={5}>レベル5</option>
                        </select>
                      </div>
                      <div class="w-32">
                        <input 
                          type="date" 
                          class="input input-bordered input-sm w-full"
                          bind:value={skill.acquiredDate}
                        />
                      </div>
                      <button 
                        type="button" 
                        class="btn btn-ghost btn-sm btn-circle"
                        on:click={() => removeSkill(index)}
                      >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                      </button>
                    </div>
                  {/each}

                  {#if selectedSkills.length === 0}
                    <div class="text-center py-8 text-base-content/60">
                      スキル情報がありません
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>

          <!-- 編集モードのアクション -->
          <div class="modal-action">
            <button 
              type="submit" 
              class="btn btn-primary"
              disabled={isSubmitting}
            >
              {#if isSubmitting}
                <span class="loading loading-spinner loading-sm"></span>
              {/if}
              {$modalMode === 'create' ? '登録' : '更新'}
            </button>
            <button type="button" class="btn btn-ghost" on:click={closeEmployeeModal}>
              キャンセル
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-box {
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .avatar img {
    object-fit: cover;
  }
</style>