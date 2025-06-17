<!--
  会議室追加・編集フォーム
-->

<script>
  import { createEventDispatcher } from 'svelte';
  import { equipment, createRoom, updateRoom, isLoading, error } from './stores/roomStore';
  import { CONFIG } from './config';

  const dispatch = createEventDispatcher();

  // Props
  let { room = null, isOpen = false } = $props();

  // フォームデータ
  let formData = $state({
    name: '',
    code: '',
    type: 'meeting',
    floor: 1,
    capacity: 6,
    area: 20,
    description: '',
    color: '#3b82f6',
    equipment: [],
    features: [],
    isActive: true,
    accessControl: {
      requireApproval: false,
      allowedDepartments: [],
      allowedRoles: ['admin', 'manager', 'user']
    }
  });

  // バリデーションエラー
  let validationErrors = $state({});

  // フォーム初期化
  $effect(() => {
    if (isOpen) {
      if (room) {
        // 編集モード
        formData = { ...room };
      } else {
        // 新規作成モード
        resetForm();
      }
      clearValidationErrors();
    }
  });

  function resetForm() {
    formData = {
      name: '',
      code: '',
      type: 'meeting',
      floor: 1,
      capacity: 6,
      area: 20,
      description: '',
      color: '#3b82f6',
      equipment: [],
      features: [],
      isActive: true,
      accessControl: {
        requireApproval: false,
        allowedDepartments: [],
        allowedRoles: ['admin', 'manager', 'user']
      }
    };
  }

  // バリデーション
  function validateForm() {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = '会議室名は必須です';
    }

    if (!formData.code.trim()) {
      errors.code = '会議室コードは必須です';
    }

    if (formData.capacity < 1) {
      errors.capacity = '収容人数は1人以上で入力してください';
    }

    if (formData.area && formData.area < 1) {
      errors.area = '面積は1㎡以上で入力してください';
    }

    validationErrors = errors;
    return Object.keys(errors).length === 0;
  }

  // 設備の切り替え
  function toggleEquipment(equipmentId) {
    if (formData.equipment.includes(equipmentId)) {
      formData.equipment = formData.equipment.filter(id => id !== equipmentId);
    } else {
      formData.equipment = [...formData.equipment, equipmentId];
    }
  }

  // 機能の追加
  function addFeature() {
    const feature = prompt('機能を入力してください:');
    if (feature && feature.trim()) {
      formData.features = [...formData.features, feature.trim()];
    }
  }

  // 機能の削除
  function removeFeature(index) {
    formData.features = formData.features.filter((_, i) => i !== index);
  }

  // フォーム送信
  async function handleSubmit() {
    if (!validateForm()) return;

    const roomData = {
      ...formData,
      building: '本社ビル', // TODO: 建物選択機能
      hourlyRate: null,
      imageUrl: null,
      mapPosition: { x: 100, y: 100 }
    };

    try {
      let result;
      if (room) {
        // 更新
        result = await updateRoom(room.id, roomData);
        if (result) {
          dispatch('updated', { room: result });
          closeModal();
        }
      } else {
        // 新規作成
        result = await createRoom(roomData);
        if (result) {
          dispatch('created', { room: result });
          closeModal();
        }
      }
    } catch (err) {
      console.error('会議室保存エラー:', err);
    }
  }

  // モーダルを閉じる
  function closeModal() {
    dispatch('close');
    clearValidationErrors();
  }

  function clearValidationErrors() {
    validationErrors = {};
  }

  // 会議室タイプのオプション
  const roomTypes = [
    { value: 'meeting', label: '会議室' },
    { value: 'conference', label: '役員会議室' },
    { value: 'training', label: '研修室' },
    { value: 'presentation', label: 'プレゼンテーション室' },
    { value: 'phone-booth', label: '電話ブース' },
    { value: 'lounge', label: 'ラウンジ' }
  ];

  // 権限のオプション
  const roleOptions = [
    { value: 'admin', label: '管理者' },
    { value: 'manager', label: 'マネージャー' },
    { value: 'user', label: '一般ユーザー' },
    { value: 'guest', label: 'ゲスト' }
  ];
</script>

{#if isOpen}
  <div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-3xl max-h-screen overflow-y-auto">
      <div class="sticky top-0 bg-base-100 pb-4 border-b border-base-300 mb-4">
        <h3 class="font-bold text-lg flex items-center gap-2">
          <span class="text-2xl">🏢</span>
          {room ? '会議室編集' : '新規会議室追加'}
        </h3>
        <button 
          class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4" 
          on:click={closeModal}
        >
          ✕
        </button>
      </div>

      <!-- エラー表示 -->
      {#if $error}
        <div class="alert alert-error">
          <span>⚠️ {$error}</span>
        </div>
      {/if}

      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <!-- 基本情報 -->
        <div class="card bg-base-200">
          <div class="card-body">
            <h4 class="card-title text-base">基本情報</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- 会議室名 -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text">会議室名 <span class="text-error">*</span></span>
                </label>
                <input 
                  type="text" 
                  bind:value={formData.name}
                  class="input input-bordered {validationErrors.name ? 'input-error' : ''}"
                  placeholder="例: ミーティングルームA"
                />
                {#if validationErrors.name}
                  <label class="label">
                    <span class="label-text-alt text-error">{validationErrors.name}</span>
                  </label>
                {/if}
              </div>

              <!-- 会議室コード -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text">会議室コード <span class="text-error">*</span></span>
                </label>
                <input 
                  type="text" 
                  bind:value={formData.code}
                  class="input input-bordered {validationErrors.code ? 'input-error' : ''}"
                  placeholder="例: A3-01"
                />
                {#if validationErrors.code}
                  <label class="label">
                    <span class="label-text-alt text-error">{validationErrors.code}</span>
                  </label>
                {/if}
              </div>

              <!-- 会議室タイプ -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text">タイプ</span>
                </label>
                <select bind:value={formData.type} class="select select-bordered">
                  {#each roomTypes as type}
                    <option value={type.value}>{type.label}</option>
                  {/each}
                </select>
              </div>

              <!-- フロア -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text">フロア</span>
                </label>
                <input 
                  type="number" 
                  bind:value={formData.floor}
                  min="1"
                  max="50"
                  class="input input-bordered"
                />
              </div>

              <!-- 収容人数 -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text">収容人数 <span class="text-error">*</span></span>
                </label>
                <input 
                  type="number" 
                  bind:value={formData.capacity}
                  min="1"
                  max="100"
                  class="input input-bordered {validationErrors.capacity ? 'input-error' : ''}"
                />
                {#if validationErrors.capacity}
                  <label class="label">
                    <span class="label-text-alt text-error">{validationErrors.capacity}</span>
                  </label>
                {/if}
              </div>

              <!-- 面積 -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text">面積（㎡）</span>
                </label>
                <input 
                  type="number" 
                  bind:value={formData.area}
                  min="1"
                  step="0.1"
                  class="input input-bordered {validationErrors.area ? 'input-error' : ''}"
                />
                {#if validationErrors.area}
                  <label class="label">
                    <span class="label-text-alt text-error">{validationErrors.area}</span>
                  </label>
                {/if}
              </div>

              <!-- カラー -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text">カレンダー表示色</span>
                </label>
                <input 
                  type="color" 
                  bind:value={formData.color}
                  class="input input-bordered h-12"
                />
              </div>

              <!-- 利用可能フラグ -->
              <div class="form-control">
                <label class="cursor-pointer label justify-start gap-2">
                  <input 
                    type="checkbox" 
                    bind:checked={formData.isActive}
                    class="checkbox" 
                  />
                  <span class="label-text">利用可能</span>
                </label>
              </div>
            </div>

            <!-- 説明 -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">説明</span>
              </label>
              <textarea 
                bind:value={formData.description}
                class="textarea textarea-bordered h-20"
                placeholder="会議室の特徴や利用方法など"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- 設備 -->
        <div class="card bg-base-200">
          <div class="card-body">
            <h4 class="card-title text-base">設備</h4>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              {#each $equipment as eq}
                <label class="cursor-pointer label gap-2">
                  <input 
                    type="checkbox" 
                    on:change={() => toggleEquipment(eq.id)}
                    checked={formData.equipment.includes(eq.id)}
                    class="checkbox checkbox-sm" 
                  />
                  <span class="label-text text-sm">{eq.name}</span>
                </label>
              {/each}
            </div>
          </div>
        </div>

        <!-- 特徴・機能 -->
        <div class="card bg-base-200">
          <div class="card-body">
            <div class="flex justify-between items-center mb-4">
              <h4 class="card-title text-base">特徴・機能</h4>
              <button type="button" class="btn btn-sm btn-outline" on:click={addFeature}>
                追加
              </button>
            </div>
            
            <div class="space-y-2">
              {#each formData.features as feature, index}
                <div class="flex items-center gap-2">
                  <span class="flex-1 text-sm">{feature}</span>
                  <button 
                    type="button" 
                    class="btn btn-xs btn-circle btn-outline"
                    on:click={() => removeFeature(index)}
                  >
                    ✕
                  </button>
                </div>
              {/each}
              
              {#if formData.features.length === 0}
                <p class="text-sm text-base-content/60">特徴や機能を追加してください</p>
              {/if}
            </div>
          </div>
        </div>

        <!-- アクセス制御 -->
        <div class="card bg-base-200">
          <div class="card-body">
            <h4 class="card-title text-base">アクセス制御</h4>
            
            <div class="space-y-4">
              <!-- 承認必須 -->
              <div class="form-control">
                <label class="cursor-pointer label justify-start gap-2">
                  <input 
                    type="checkbox" 
                    bind:checked={formData.accessControl.requireApproval}
                    class="checkbox" 
                  />
                  <span class="label-text">予約に管理者承認が必要</span>
                </label>
              </div>

              <!-- 利用可能権限 -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text">利用可能権限</span>
                </label>
                <div class="flex flex-wrap gap-2">
                  {#each roleOptions as role}
                    <label class="cursor-pointer label gap-2">
                      <input 
                        type="checkbox" 
                        value={role.value}
                        checked={formData.accessControl.allowedRoles.includes(role.value)}
                        on:change={(e) => {
                          if (e.target.checked) {
                            formData.accessControl.allowedRoles = [...formData.accessControl.allowedRoles, role.value];
                          } else {
                            formData.accessControl.allowedRoles = formData.accessControl.allowedRoles.filter(r => r !== role.value);
                          }
                        }}
                        class="checkbox checkbox-sm" 
                      />
                      <span class="label-text text-sm">{role.label}</span>
                    </label>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 送信ボタン -->
        <div class="modal-action">
          <button type="button" class="btn" on:click={closeModal}>
            キャンセル
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            disabled={$isLoading || Object.keys(validationErrors).length > 0}
          >
            {#if $isLoading}
              <span class="loading loading-spinner loading-sm"></span>
            {/if}
            {room ? '更新' : '追加'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-box {
    border-radius: 1rem;
  }

  .form-control {
    margin-bottom: 0.5rem;
  }

  .input-error, .select-error {
    border-color: hsl(var(--er));
  }

  .checkbox:checked {
    background-color: hsl(var(--p));
    border-color: hsl(var(--p));
  }
</style>