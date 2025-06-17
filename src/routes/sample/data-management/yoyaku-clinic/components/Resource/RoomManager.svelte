<script lang="ts">
  import type { Room, Equipment } from '../../types';
  import { resourceStore } from '../../stores/resourceStore';
  
  const { rooms, equipment, roomsByType } = resourceStore;
  
  // フィルター
  let filterType = $state<'all' | Room['type']>('all');
  let filterFloor = $state<'all' | number>('all');
  
  // フィルタリングされた部屋
  const filteredRooms = $derived.by(() => {
    let filtered = $rooms;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(room => room.type === filterType);
    }
    
    if (filterFloor !== 'all') {
      filtered = filtered.filter(room => room.floor === filterFloor);
    }
    
    return filtered;
  });
  
  // 階数のリスト
  const floors = $derived.by(() => {
    const floorSet = new Set($rooms.map(room => room.floor));
    return Array.from(floorSet).sort();
  });
  
  // 部屋の設備を取得
  function getRoomEquipment(room: Room): Equipment[] {
    return $equipment.filter(eq => room.equipment.includes(eq.id));
  }
  
  // 部屋タイプの日本語名
  const roomTypeLabels = {
    consultation: '診察室',
    examination: '検査室',
    treatment: '処置室'
  };
  
  // 部屋タイプのアイコン
  const roomTypeIcons = {
    consultation: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    examination: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    treatment: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
  };
</script>

<div class="room-manager">
  <!-- フィルター -->
  <div class="flex flex-wrap gap-4 mb-6">
    <select 
      class="select select-bordered"
      bind:value={filterType}
    >
      <option value="all">すべてのタイプ</option>
      <option value="consultation">診察室</option>
      <option value="examination">検査室</option>
      <option value="treatment">処置室</option>
    </select>
    
    <select 
      class="select select-bordered"
      bind:value={filterFloor}
    >
      <option value="all">すべての階</option>
      {#each floors as floor}
        <option value={floor}>{floor}階</option>
      {/each}
    </select>
    
    <div class="ml-auto text-sm text-base-content/70">
      表示中: {filteredRooms.length}室 / 全{$rooms.length}室
    </div>
  </div>
  
  <!-- 部屋カード -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each filteredRooms as room}
      {@const roomEquipment = getRoomEquipment(room)}
      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="card-body">
          <div class="flex justify-between items-start">
            <h3 class="card-title text-lg">
              {room.name}
            </h3>
            <div class="badge {room.isActive ? 'badge-success' : 'badge-error'}">
              {room.isActive ? '利用可' : '利用不可'}
            </div>
          </div>
          
          <div class="flex items-center gap-4 text-sm text-base-content/70 my-2">
            <div class="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={roomTypeIcons[room.type]} />
              </svg>
              {roomTypeLabels[room.type]}
            </div>
            <div>
              {room.floor}階
            </div>
            <div>
              定員: {room.capacity}名
            </div>
          </div>
          
          <!-- 設備 -->
          {#if roomEquipment.length > 0}
            <div>
              <div class="text-sm font-medium mb-2">設備</div>
              <div class="flex flex-wrap gap-2">
                {#each roomEquipment as eq}
                  <div class="badge badge-outline badge-sm">
                    {eq.name}
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- 現在の使用状況（デモ） -->
          <div class="mt-4">
            <div class="text-sm font-medium mb-2">本日の稼働率</div>
            <div class="w-full bg-base-200 rounded-full h-2">
              <div 
                class="bg-primary h-2 rounded-full transition-all"
                style="width: {Math.floor(Math.random() * 100)}%"
              ></div>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
  
  <!-- 統計サマリー -->
  <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
    {#each Object.entries($roomsByType) as [type, rooms]}
      <div class="stat bg-base-100 rounded-lg shadow-sm">
        <div class="stat-figure text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={roomTypeIcons[type as Room['type']]} />
          </svg>
        </div>
        <div class="stat-title">{roomTypeLabels[type as Room['type']]}</div>
        <div class="stat-value">{rooms.length}室</div>
        <div class="stat-desc">
          稼働中: {rooms.filter(r => r.isActive).length}室
        </div>
      </div>
    {/each}
  </div>
</div>