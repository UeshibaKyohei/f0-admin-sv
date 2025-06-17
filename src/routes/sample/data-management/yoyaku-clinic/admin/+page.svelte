<script lang="ts">
  import { bookingStore } from '../stores/bookingStore';
  import { resourceStore } from '../stores/resourceStore';
  import { CONFIG } from '../config';
  import WeekView from '../components/Calendar/WeekView.svelte';
  import DayView from '../components/Calendar/DayView.svelte';
  import MonthView from '../components/Calendar/MonthView.svelte';
  import BookingModal from '../components/Booking/BookingModal.svelte';
  import DoctorSchedule from '../components/Resource/DoctorSchedule.svelte';
  import RoomManager from '../components/Resource/RoomManager.svelte';
  import ClinicDashboard from '../components/Dashboard/ClinicDashboard.svelte';
  import CrowdPrediction from '../components/AI/CrowdPrediction.svelte';
  
  // ストアの値を取得
  const { selectedDate, viewMode, filteredBookings, selectedDateBookings, filter, setFilter } = bookingStore;
  const { departments, activeDoctors } = resourceStore;
  
  // 現在の日時
  let currentTime = $state(new Date());
  setInterval(() => currentTime = new Date(), 60000); // 1分ごとに更新
  
  // サイドバーの表示状態（モバイルではデフォルトで非表示）
  let showSidebar = $state(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  
  // 選択されたタブ
  let activeTab = $state<'calendar' | 'resources' | 'analytics' | 'ai'>('calendar');
  
  // 予約モーダルの表示状態
  let showBookingModal = $state(false);
  
  // リソース管理のサブタブ
  let resourceTab = $state<'doctors' | 'rooms' | 'equipment'>('doctors');
  
  // フィルターの状態
  let showFilterDropdown = $state(false);
  let filterDepartment = $state<string>('');
  let filterDoctor = $state<string>('');
  let filterStatus = $state<string>('');
  
  // 日付の操作
  function changeDate(days: number) {
    $selectedDate = new Date($selectedDate.getTime() + days * 24 * 60 * 60 * 1000);
  }
  
  function goToToday() {
    $selectedDate = new Date();
  }
  
  // 統計情報の計算
  const todayStats = $derived.by(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = $filteredBookings.filter(b => b.startTime.startsWith(today));
    
    return {
      total: todayBookings.length,
      completed: todayBookings.filter(b => b.status === 'completed').length,
      inProgress: todayBookings.filter(b => b.status === 'in-progress').length,
      waiting: todayBookings.filter(b => b.status === 'checked-in').length,
      cancelled: todayBookings.filter(b => b.status === 'cancelled').length,
      noShow: todayBookings.filter(b => b.status === 'no-show').length
    };
  });
  
  // 次の予約
  const nextBookings = $derived.by(() => {
    const now = new Date().toISOString();
    return $filteredBookings
      .filter(b => b.startTime > now && b.status === 'booked')
      .slice(0, 5);
  });
  
  // フィルターの適用
  $effect(() => {
    setFilter({
      departmentIds: filterDepartment ? [filterDepartment] : undefined,
      doctorIds: filterDoctor ? [filterDoctor] : undefined,
      statuses: filterStatus ? [filterStatus as any] : undefined
    });
  });
</script>

<div class="min-h-screen bg-base-200">
  <!-- ヘッダー -->
  <div class="navbar bg-base-100 shadow-sm">
    <div class="flex-none">
      <button 
        class="btn btn-square btn-ghost"
        onclick={() => showSidebar = !showSidebar}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>
    <div class="flex-1">
      <h1 class="text-xl font-bold">予約管理システム - {CONFIG.system.clinicName}</h1>
    </div>
    <div class="flex-none">
      <div class="text-sm text-base-content/70">
        {currentTime.toLocaleString(CONFIG.system.locale, CONFIG.ui.dateFormat.datetime)}
      </div>
    </div>
  </div>

  <div class="flex">
    <!-- サイドバー -->
    {#if showSidebar}
      <div class="w-48 lg:w-64 min-h-screen bg-base-100 shadow-md flex-shrink-0">
        <div class="p-3 lg:p-4">
          <!-- 統計サマリー -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold mb-3">本日の状況</h3>
            <div class="grid grid-cols-2 gap-2">
              <div class="bg-base-200 rounded-lg p-2 lg:p-3">
                <div class="text-xl lg:text-2xl font-bold">{todayStats.total}</div>
                <div class="text-xs text-base-content/70">予約総数</div>
              </div>
              <div class="bg-success/20 rounded-lg p-2 lg:p-3">
                <div class="text-xl lg:text-2xl font-bold text-success">{todayStats.completed}</div>
                <div class="text-xs text-base-content/70">診察済み</div>
              </div>
              <div class="bg-warning/20 rounded-lg p-2 lg:p-3">
                <div class="text-xl lg:text-2xl font-bold text-warning">{todayStats.waiting}</div>
                <div class="text-xs text-base-content/70">待機中</div>
              </div>
              <div class="bg-info/20 rounded-lg p-2 lg:p-3">
                <div class="text-xl lg:text-2xl font-bold text-info">{todayStats.inProgress}</div>
                <div class="text-xs text-base-content/70">診察中</div>
              </div>
            </div>
          </div>

          <!-- ナビゲーション -->
          <ul class="menu menu-sm lg:menu-md">
            <li>
              <button 
                class={activeTab === 'calendar' ? 'active' : ''}
                onclick={() => activeTab = 'calendar'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="hidden lg:inline">予約カレンダー</span>
                <span class="lg:hidden">予約</span>
              </button>
            </li>
            <li>
              <button 
                class={activeTab === 'resources' ? 'active' : ''}
                onclick={() => activeTab = 'resources'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span class="hidden lg:inline">リソース管理</span>
                <span class="lg:hidden">リソース</span>
              </button>
            </li>
            <li>
              <button 
                class={activeTab === 'analytics' ? 'active' : ''}
                onclick={() => activeTab = 'analytics'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span class="hidden lg:inline">統計分析</span>
                <span class="lg:hidden">統計</span>
              </button>
            </li>
            <li>
              <button 
                class={activeTab === 'ai' ? 'active' : ''}
                onclick={() => activeTab = 'ai'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span class="hidden lg:inline">AI最適化</span>
                <span class="lg:hidden">AI</span>
              </button>
            </li>
          </ul>

          <div class="divider"></div>

          <!-- 次の予約 -->
          <div>
            <h3 class="text-sm font-semibold mb-3">次の予約</h3>
            <div class="space-y-2">
              {#each nextBookings as booking}
                <div class="bg-base-200 rounded-lg p-2 text-xs">
                  <div class="font-semibold">{booking.patientName}</div>
                  <div class="text-base-content/70">
                    {new Date(booking.startTime).toLocaleTimeString(CONFIG.system.locale, CONFIG.ui.dateFormat.time)}
                    - {booking.doctorName}
                  </div>
                </div>
              {:else}
                <div class="text-sm text-base-content/50">本日の予約はありません</div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- メインコンテンツ -->
    <div class="flex-1 p-3 lg:p-6 overflow-x-auto">
      {#if activeTab === 'calendar'}
        <!-- カレンダータブ -->
        <div class="bg-base-100 rounded-lg shadow-sm p-6">
          <!-- カレンダーヘッダー -->
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h2 class="text-xl lg:text-2xl font-bold">予約カレンダー</h2>
              <div class="btn-group">
                <button 
                  class="btn btn-xs sm:btn-sm {$viewMode === 'month' ? 'btn-active' : ''}"
                  onclick={() => $viewMode = 'month'}
                >
                  月
                </button>
                <button 
                  class="btn btn-xs sm:btn-sm {$viewMode === 'week' ? 'btn-active' : ''}"
                  onclick={() => $viewMode = 'week'}
                >
                  週
                </button>
                <button 
                  class="btn btn-xs sm:btn-sm {$viewMode === 'day' ? 'btn-active' : ''}"
                  onclick={() => $viewMode = 'day'}
                >
                  日
                </button>
              </div>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="flex items-center gap-2">
                <button class="btn btn-xs sm:btn-sm btn-ghost" onclick={() => changeDate(-1)}>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button class="btn btn-xs sm:btn-sm" onclick={goToToday}>今日</button>
                <button class="btn btn-xs sm:btn-sm btn-ghost" onclick={() => changeDate(1)}>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <span class="ml-2 text-sm lg:text-lg font-medium">
                  {$selectedDate.toLocaleDateString(CONFIG.system.locale, CONFIG.ui.dateFormat.long)}
                </span>
              </div>

              <div class="flex gap-2">
                <button 
                  class="btn btn-primary btn-xs sm:btn-sm"
                  onclick={() => showBookingModal = true}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span class="hidden sm:inline">新規予約</span>
                </button>
                <div class="dropdown dropdown-end">
                  <button 
                    class="btn btn-xs sm:btn-sm"
                    onclick={() => showFilterDropdown = !showFilterDropdown}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span class="hidden sm:inline">フィルター</span>
                    {#if filterDepartment || filterDoctor || filterStatus}
                      <div class="badge badge-primary badge-xs"></div>
                    {/if}
                  </button>
                  {#if showFilterDropdown}
                    <div class="dropdown-content z-[1] p-4 shadow-lg bg-base-100 rounded-box w-64 mt-2">
                      <h4 class="font-semibold mb-2">フィルター設定</h4>
                      
                      <!-- 診療科フィルター -->
                      <div class="form-control mb-3">
                        <label class="label p-1">
                          <span class="label-text text-xs">診療科</span>
                        </label>
                        <select 
                          class="select select-bordered select-sm w-full"
                          bind:value={filterDepartment}
                        >
                          <option value="">すべて</option>
                          {#each $departments as dept}
                            <option value={dept.id}>{dept.name}</option>
                          {/each}
                        </select>
                      </div>
                      
                      <!-- 医師フィルター -->
                      <div class="form-control mb-3">
                        <label class="label p-1">
                          <span class="label-text text-xs">担当医</span>
                        </label>
                        <select 
                          class="select select-bordered select-sm w-full"
                          bind:value={filterDoctor}
                        >
                          <option value="">すべて</option>
                          {#each $activeDoctors as doctor}
                            <option value={doctor.id}>{doctor.name}</option>
                          {/each}
                        </select>
                      </div>
                      
                      <!-- ステータスフィルター -->
                      <div class="form-control mb-3">
                        <label class="label p-1">
                          <span class="label-text text-xs">ステータス</span>
                        </label>
                        <select 
                          class="select select-bordered select-sm w-full"
                          bind:value={filterStatus}
                        >
                          <option value="">すべて</option>
                          <option value="booked">予約済</option>
                          <option value="checked-in">待機中</option>
                          <option value="in-progress">診察中</option>
                          <option value="completed">完了</option>
                          <option value="cancelled">キャンセル</option>
                        </select>
                      </div>
                      
                      <!-- アクションボタン -->
                      <div class="flex justify-between mt-4">
                        <button 
                          class="btn btn-sm btn-ghost"
                          onclick={() => {
                            filterDepartment = '';
                            filterDoctor = '';
                            filterStatus = '';
                          }}
                        >
                          クリア
                        </button>
                        <button 
                          class="btn btn-sm btn-primary"
                          onclick={() => showFilterDropdown = false}
                        >
                          適用
                        </button>
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
          
          <!-- フィルター表示 -->
          {#if filterDepartment || filterDoctor || filterStatus}
            <div class="mb-4 flex items-center gap-2 text-sm">
              <span class="font-medium">フィルター中：</span>
              {#if filterDepartment}
                <div class="badge badge-primary">
                  診療科: {$departments.find(d => d.id === filterDepartment)?.name}
                  <button 
                    class="ml-1"
                    onclick={() => filterDepartment = ''}
                  >×</button>
                </div>
              {/if}
              {#if filterDoctor}
                <div class="badge badge-primary">
                  医師: {$activeDoctors.find(d => d.id === filterDoctor)?.name}
                  <button 
                    class="ml-1"
                    onclick={() => filterDoctor = ''}
                  >×</button>
                </div>
              {/if}
              {#if filterStatus}
                <div class="badge badge-primary">
                  ステータス: {filterStatus === 'booked' ? '予約済' :
                               filterStatus === 'checked-in' ? '待機中' :
                               filterStatus === 'in-progress' ? '診察中' :
                               filterStatus === 'completed' ? '完了' :
                               filterStatus === 'cancelled' ? 'キャンセル' : filterStatus}
                  <button 
                    class="ml-1"
                    onclick={() => filterStatus = ''}
                  >×</button>
                </div>
              {/if}
            </div>
          {/if}

          <!-- カレンダービュー -->
          <div class="border rounded-lg p-4 min-h-[600px]">
            {#if $viewMode === 'month'}
              <MonthView selectedDate={$selectedDate} />
            {:else if $viewMode === 'week'}
              <WeekView selectedDate={$selectedDate} />
            {:else if $viewMode === 'day'}
              <DayView selectedDate={$selectedDate} />
            {/if}
          </div>
        </div>
      {:else if activeTab === 'resources'}
        <div class="bg-base-100 rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">リソース管理</h2>
            <div class="tabs tabs-boxed">
              <button 
                class="tab {resourceTab === 'doctors' ? 'tab-active' : ''}"
                onclick={() => resourceTab = 'doctors'}
              >
                医師
              </button>
              <button 
                class="tab {resourceTab === 'rooms' ? 'tab-active' : ''}"
                onclick={() => resourceTab = 'rooms'}
              >
                診察室
              </button>
              <button 
                class="tab {resourceTab === 'equipment' ? 'tab-active' : ''}"
                onclick={() => resourceTab = 'equipment'}
              >
                医療機器
              </button>
            </div>
          </div>
          
          {#if resourceTab === 'doctors'}
            <DoctorSchedule />
          {:else if resourceTab === 'rooms'}
            <RoomManager />
          {:else if resourceTab === 'equipment'}
            <div class="text-center text-base-content/50">
              医療機器管理画面がここに表示されます
            </div>
          {/if}
        </div>
      {:else if activeTab === 'analytics'}
        <div class="bg-base-100 rounded-lg shadow-sm p-6">
          <h2 class="text-2xl font-bold mb-6">統計分析</h2>
          <ClinicDashboard />
        </div>
      {:else if activeTab === 'ai'}
        <div class="bg-base-100 rounded-lg shadow-sm p-6">
          <h2 class="text-2xl font-bold mb-6">AI最適化</h2>
          <CrowdPrediction />
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- 予約モーダル -->
<BookingModal bind:open={showBookingModal} />

<style>
  /* ローカルスタイル */
</style>