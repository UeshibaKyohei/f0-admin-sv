<!--
  会議室予約システム メインページ
  
  機能概要:
  - ダッシュボード形式で今日の予約状況を表示
  - 会議室一覧とリアルタイム空き状況
  - 新規予約作成への導線
  - 今後の予約一覧
-->

<script>
  import { onMount } from 'svelte';
  import { 
    bookings, 
    todayBookings, 
    upcomingBookings, 
    myBookings,
    bookingStats,
    departmentStats,
    isLoading,
    error,
    initializeBookingStore,
    clearError
  } from './stores/bookingStore';
  import { 
    rooms, 
    roomsByType, 
    roomTypeStats,
    availableRooms,
    selectedDate,
    initializeRoomStore,
    equipment
  } from './stores/roomStore';
  import { CONFIG } from './config';
  import BookingCalendar from './BookingCalendar.svelte';
  import BookingForm from './BookingForm.svelte';
  import QuickBooking from './QuickBooking.svelte';
  import RoomForm from './RoomForm.svelte';
  import DailyScheduleView from './DailyScheduleView.svelte';
  import TestPikaday from './TestPikaday.svelte';

  // UI状態
  let activeTab = $state('dashboard');
  let showBookingForm = $state(false);
  let selectedBooking = $state(null);
  let showRoomForm = $state(false);
  let selectedRoom = $state(null);

  // ページ初期化
  onMount(() => {
    initializeBookingStore();
    initializeRoomStore();
  });

  // 日付フォーマット用ヘルパー
  function formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  }

  // ステータス別のバッジクラス
  function getStatusBadgeClass(status) {
    switch (status) {
      case 'confirmed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'cancelled': return 'badge-error';
      case 'completed': return 'badge-info';
      default: return 'badge-ghost';
    }
  }

  // 会議室タイプ別のアイコン
  function getRoomTypeIcon(type) {
    switch (type) {
      case 'conference': return '🏛️';
      case 'meeting': return '💼';
      case 'training': return '📚';
      case 'phone-booth': return '📞';
      case 'presentation': return '📊';
      default: return '🏢';
    }
  }

  // 今日の日付
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
</script>

<svelte:head>
  <title>{CONFIG.system.companyName} - 会議室予約システム</title>
</svelte:head>

<div class="container mx-auto p-6 space-y-4">
  <!-- シンプルなヘッダー -->
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-2xl font-bold">会議室予約システム</h1>
      <p class="text-sm text-base-content/60">{today}</p>
    </div>
    <button 
      class="btn btn-primary"
      on:click={() => showBookingForm = true}
    >
      <span class="text-lg">➕</span>
      新規予約
    </button>
  </div>

  <!-- エラー表示 -->
  {#if $error}
    <div class="alert alert-error">
      <span>⚠️ {$error}</span>
      <button class="btn btn-sm btn-ghost" on:click={clearError}>✕</button>
    </div>
  {/if}

  <!-- ナビゲーションタブ -->
  <div class="tabs tabs-bordered tabs-lg">
    <button 
      class="tab {activeTab === 'dashboard' ? 'tab-active' : ''}"
      on:click={() => activeTab = 'dashboard'}
    >
      <span class="text-lg mr-2">🏠</span>
      ホーム
    </button>
    <button 
      class="tab {activeTab === 'calendar' ? 'tab-active' : ''}"
      on:click={() => activeTab = 'calendar'}
    >
      <span class="text-lg mr-2">📅</span>
      カレンダー
    </button>
    <button 
      class="tab {activeTab === 'rooms' ? 'tab-active' : ''}"
      on:click={() => activeTab = 'rooms'}
    >
      <span class="text-lg mr-2">🏢</span>
      会議室一覧
    </button>
    <button 
      class="tab {activeTab === 'daily' ? 'tab-active' : ''}"
      on:click={() => activeTab = 'daily'}
    >
      <span class="text-lg mr-2">📋</span>
      詳細日表示
    </button>
  </div>

  <!-- ローディング表示 -->
  {#if $isLoading}
    <div class="flex justify-center py-8">
      <div class="loading loading-spinner loading-lg"></div>
    </div>
  {/if}

  <!-- タブコンテンツ -->
  {#if activeTab === 'dashboard'}
    <div class="space-y-6">
      <!-- クイック予約 -->
      <div class="mb-8">
        <QuickBooking 
          on:created={() => {
            // 予約作成後はデータを再読み込み
            initializeBookingStore();
          }}
        />
      </div>

      <!-- 統計ダッシュボード -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="stat bg-base-200 rounded-box">
          <div class="stat-figure text-primary">
            <span class="text-3xl">📅</span>
          </div>
          <div class="stat-title">今日の予約</div>
          <div class="stat-value text-primary">{$todayBookings.length}</div>
          <div class="stat-desc">件の予約があります</div>
        </div>

        <div class="stat bg-base-200 rounded-box">
          <div class="stat-figure text-secondary">
            <span class="text-3xl">🏢</span>
          </div>
          <div class="stat-title">利用可能会議室</div>
          <div class="stat-value text-secondary">{$availableRooms.length}</div>
          <div class="stat-desc">/ {$rooms.length} 室</div>
        </div>

        <div class="stat bg-base-200 rounded-box">
          <div class="stat-figure text-accent">
            <span class="text-3xl">✅</span>
          </div>
          <div class="stat-title">確定予約率</div>
          <div class="stat-value text-accent">{$bookingStats.confirmationRate}%</div>
          <div class="stat-desc">全予約中</div>
        </div>

        <div class="stat bg-base-200 rounded-box">
          <div class="stat-figure text-info">
            <span class="text-3xl">👥</span>
          </div>
          <div class="stat-title">自分の予約</div>
          <div class="stat-value text-info">{$myBookings.length}</div>
          <div class="stat-desc">件の予約</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 今日の予約一覧 -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title flex items-center gap-2">
              <span class="text-2xl">📋</span>
              今日の予約
            </h2>
            
            {#if $todayBookings.length === 0}
              <div class="text-center py-8 text-base-content/60">
                <span class="text-4xl">🎉</span>
                <p class="mt-2">今日の予約はありません</p>
              </div>
            {:else}
              <div class="space-y-3 max-h-96 overflow-y-auto">
                {#each $todayBookings as booking}
                  <div class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                    <div class="flex-1">
                      <div class="font-semibold">{booking.title}</div>
                      <div class="text-sm text-base-content/70">
                        {booking.roomName} • {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </div>
                      <div class="text-xs text-base-content/60">
                        {booking.userName} • {booking.userDepartment}
                      </div>
                    </div>
                    <div class="flex flex-col items-end gap-1">
                      <span class="badge {getStatusBadgeClass(booking.status)}">
                        {booking.status}
                      </span>
                      <span class="text-xs text-base-content/60">
                        {booking.attendeeCount}名
                      </span>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>

        <!-- 会議室一覧 -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title flex items-center gap-2">
              <span class="text-2xl">🏢</span>
              会議室一覧
            </h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {#each $rooms as room}
                <div class="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
                  <div class="card-body p-4">
                    <h3 class="card-title text-sm flex items-center gap-2">
                      <span>{getRoomTypeIcon(room.type)}</span>
                      {room.name}
                    </h3>
                    <div class="text-xs space-y-1">
                      <div class="flex justify-between">
                        <span>コード:</span>
                        <span class="font-mono">{room.code}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>収容人数:</span>
                        <span>{room.capacity}名</span>
                      </div>
                      <div class="flex justify-between">
                        <span>フロア:</span>
                        <span>{room.floor}F</span>
                      </div>
                    </div>
                    <div class="card-actions justify-end mt-2">
                      <span class="badge badge-sm {room.isActive ? 'badge-success' : 'badge-error'}">
                        {room.isActive ? '利用可能' : '利用不可'}
                      </span>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- 今後の予約 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h2 class="card-title flex items-center gap-2">
            <span class="text-2xl">📅</span>
            今後の予約
          </h2>
          
          {#if $upcomingBookings.length === 0}
            <div class="text-center py-8 text-base-content/60">
              <span class="text-4xl">📝</span>
              <p class="mt-2">今後の予約はありません</p>
            </div>
          {:else}
            <div class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>日時</th>
                    <th>会議室</th>
                    <th>タイトル</th>
                    <th>予約者</th>
                    <th>参加者数</th>
                    <th>ステータス</th>
                  </tr>
                </thead>
                <tbody>
                  {#each $upcomingBookings.slice(0, 10) as booking}
                    <tr class="hover">
                      <td>
                        <div class="text-sm">
                          <div>{formatDate(booking.startTime)}</div>
                          <div class="text-xs text-base-content/60">
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="flex items-center gap-2">
                          <span>{getRoomTypeIcon(booking.roomId)}</span>
                          <div>
                            <div class="font-semibold text-sm">{booking.roomName}</div>
                            <div class="text-xs text-base-content/60">{booking.roomCode}</div>
                          </div>
                        </div>
                      </td>
                      <td class="font-semibold">{booking.title}</td>
                      <td>
                        <div class="text-sm">
                          <div>{booking.userName}</div>
                          <div class="text-xs text-base-content/60">{booking.userDepartment}</div>
                        </div>
                      </td>
                      <td class="text-center">{booking.attendeeCount}名</td>
                      <td>
                        <span class="badge {getStatusBadgeClass(booking.status)}">
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
            
            {#if $upcomingBookings.length > 10}
              <div class="text-center mt-4">
                <button class="btn btn-outline btn-sm">
                  さらに表示 ({$upcomingBookings.length - 10}件)
                </button>
              </div>
            {/if}
          {/if}
        </div>
      </div>

      <!-- 部署別利用統計 -->
      {#if $departmentStats.length > 0}
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title flex items-center gap-2">
              <span class="text-2xl">📊</span>
              部署別利用状況
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each $departmentStats as dept}
                <div class="stat bg-base-200 rounded-box">
                  <div class="stat-title">{dept.department}</div>
                  <div class="stat-value text-sm">{dept.bookingCount}件</div>
                  <div class="stat-desc">{dept.totalHours}時間利用</div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}

      <!-- 会議室タイプ別統計 -->
      {#if $roomTypeStats.length > 0}
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title flex items-center gap-2">
              <span class="text-2xl">🏗️</span>
              会議室タイプ別
            </h2>
            
            <div class="flex flex-wrap gap-4">
              {#each $roomTypeStats as typeStats}
                <div class="flex items-center gap-2 bg-base-200 rounded-full px-4 py-2">
                  <span>{getRoomTypeIcon(typeStats.type)}</span>
                  <span class="text-sm font-semibold">{typeStats.type}</span>
                  <span class="badge badge-sm">{typeStats.count}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>

  {:else if activeTab === 'calendar'}
    <!-- カレンダー表示 -->
    <BookingCalendar />

  {:else if activeTab === 'rooms'}
    <!-- 会議室一覧（詳細版） -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <div class="flex justify-between items-center mb-4">
          <h2 class="card-title flex items-center gap-2">
            <span class="text-2xl">🏢</span>
            会議室詳細一覧
          </h2>
          <button 
            class="btn btn-primary"
            on:click={() => {
              selectedRoom = null;
              showRoomForm = true;
            }}
          >
            <span class="text-lg">➕</span>
            会議室追加
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>会議室名</th>
                <th>タイプ</th>
                <th>収容人数</th>
                <th>フロア</th>
                <th>設備</th>
                <th>状態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {#each $rooms as room}
                <tr class="hover">
                  <td>
                    <div>
                      <div class="font-bold">{room.name}</div>
                      <div class="text-sm opacity-50">{room.code}</div>
                    </div>
                  </td>
                  <td>
                    <span class="flex items-center gap-2">
                      {getRoomTypeIcon(room.type)}
                      {room.type}
                    </span>
                  </td>
                  <td class="text-center">{room.capacity}名</td>
                  <td class="text-center">{room.floor}F</td>
                  <td>
                    <div class="flex flex-wrap gap-1">
                      {#each room.equipment.slice(0, 3) as equipmentId}
                        {@const eq = $equipment.find(e => e.id === equipmentId)}
                        {#if eq}
                          <span class="badge badge-sm">{eq.name}</span>
                        {/if}
                      {/each}
                      {#if room.equipment.length > 3}
                        <span class="badge badge-sm badge-outline">+{room.equipment.length - 3}</span>
                      {/if}
                    </div>
                  </td>
                  <td>
                    <span class="badge {room.isActive ? 'badge-success' : 'badge-error'}">
                      {room.isActive ? '利用可能' : '利用不可'}
                    </span>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <button 
                        class="btn btn-xs btn-outline"
                        on:click={() => {
                          selectedRoom = room;
                          showRoomForm = true;
                        }}
                      >
                        編集
                      </button>
                      <button class="btn btn-xs btn-outline">詳細</button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  
  {:else if activeTab === 'daily'}
    <!-- 詳細日表示 -->
    <DailyScheduleView 
      selectedDate={new Date().toISOString().split('T')[0]}
      on:bookingSelect={(event) => {
        selectedBooking = event.detail.booking;
        showBookingForm = true;
      }}
      on:newBooking={(event) => {
        // 新規予約作成
        showBookingForm = true;
        selectedBooking = null;
        // TODO: 初期値として日時・会議室を設定
      }}
    />
  {/if}
</div>

<!-- 予約作成フォーム -->
<BookingForm 
  isOpen={showBookingForm}
  booking={selectedBooking}
  on:close={() => {
    showBookingForm = false;
    selectedBooking = null;
  }}
  on:created={() => {
    showBookingForm = false;
    selectedBooking = null;
    // 予約一覧を再読み込み
    initializeBookingStore();
  }}
  on:updated={() => {
    showBookingForm = false;
    selectedBooking = null;
    // 予約一覧を再読み込み
    initializeBookingStore();
  }}
/>

<!-- 会議室フォーム -->
<RoomForm 
  isOpen={showRoomForm}
  room={selectedRoom}
  on:close={() => {
    showRoomForm = false;
    selectedRoom = null;
  }}
  on:created={() => {
    showRoomForm = false;
    selectedRoom = null;
    // 会議室一覧を再読み込み
    initializeRoomStore();
  }}
  on:updated={() => {
    showRoomForm = false;
    selectedRoom = null;
    // 会議室一覧を再読み込み
    initializeRoomStore();
  }}
/>

<!-- /container -->

<style>
  .hero {
    min-height: 200px;
  }
  
  .stat {
    padding: 1.5rem;
  }
  
  .card {
    transition: all 0.2s ease;
  }
  
  .card:hover {
    transform: translateY(-2px);
  }
</style>