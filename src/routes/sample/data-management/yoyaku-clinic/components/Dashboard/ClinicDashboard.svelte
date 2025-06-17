<script lang="ts">
  import { bookingStore } from '../../stores/bookingStore';
  import { resourceStore } from '../../stores/resourceStore';
  import { generateDailyStats } from '../../api/mockData';
  
  const { filteredBookings } = bookingStore;
  const { departments, activeDoctors } = resourceStore;
  
  // 日付範囲
  let dateRange = $state<'today' | 'week' | 'month'>('week');
  
  // 統計データを計算
  const statsData = $derived.by(() => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();
    
    switch (dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
    }
    
    const bookings = $filteredBookings.filter(b => {
      const bookingDate = new Date(b.startTime);
      return bookingDate >= startDate && bookingDate <= endDate;
    });
    
    // 基本統計
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const noShowBookings = bookings.filter(b => b.status === 'no-show').length;
    
    // 診療科別統計
    const departmentStats = $departments.map(dept => {
      const deptBookings = bookings.filter(b => b.departmentId === dept.id);
      return {
        ...dept,
        bookings: deptBookings.length,
        completed: deptBookings.filter(b => b.status === 'completed').length,
        revenue: deptBookings.length * (3000 + Math.random() * 5000)
      };
    });
    
    // 医師別統計
    const doctorStats = $activeDoctors.map(doctor => {
      const docBookings = bookings.filter(b => b.doctorId === doctor.id);
      return {
        ...doctor,
        bookings: docBookings.length,
        completed: docBookings.filter(b => b.status === 'completed').length,
        avgWaitTime: 15 + Math.random() * 20,
        utilization: (docBookings.length / (doctor.maxPatientsPerDay * 7)) * 100
      };
    });
    
    // 時間帯別統計
    const hourlyStats = Array.from({ length: 12 }, (_, i) => {
      const hour = i + 8;
      const hourBookings = bookings.filter(b => {
        const bookingHour = new Date(b.startTime).getHours();
        return bookingHour === hour;
      });
      return {
        hour,
        bookings: hourBookings.length,
        completed: hourBookings.filter(b => b.status === 'completed').length
      };
    });
    
    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      noShowBookings,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings * 100).toFixed(1) : 0,
      cancellationRate: totalBookings > 0 ? (cancelledBookings / totalBookings * 100).toFixed(1) : 0,
      noShowRate: totalBookings > 0 ? (noShowBookings / totalBookings * 100).toFixed(1) : 0,
      departmentStats,
      doctorStats,
      hourlyStats
    };
  });
  
  // チャートの最大値を計算
  const maxHourlyBookings = $derived(Math.max(...statsData.hourlyStats.map(h => h.bookings), 1));
</script>

<div class="clinic-dashboard">
  <!-- 期間選択 -->
  <div class="flex justify-between items-center mb-6">
    <h3 class="text-xl font-semibold">クリニック統計</h3>
    <div class="tabs tabs-boxed">
      <button 
        class="tab {dateRange === 'today' ? 'tab-active' : ''}"
        onclick={() => dateRange = 'today'}
      >
        今日
      </button>
      <button 
        class="tab {dateRange === 'week' ? 'tab-active' : ''}"
        onclick={() => dateRange = 'week'}
      >
        過去7日
      </button>
      <button 
        class="tab {dateRange === 'month' ? 'tab-active' : ''}"
        onclick={() => dateRange = 'month'}
      >
        過去30日
      </button>
    </div>
  </div>
  
  <!-- KPIカード -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <div class="stat bg-base-100 rounded-lg shadow-sm">
      <div class="stat-figure text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <div class="stat-title">総予約数</div>
      <div class="stat-value">{statsData.totalBookings}</div>
      <div class="stat-desc">
        {dateRange === 'today' ? '本日' : dateRange === 'week' ? '過去7日間' : '過去30日間'}
      </div>
    </div>
    
    <div class="stat bg-base-100 rounded-lg shadow-sm">
      <div class="stat-figure text-success">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="stat-title">診察完了率</div>
      <div class="stat-value">{statsData.completionRate}%</div>
      <div class="stat-desc">{statsData.completedBookings}件完了</div>
    </div>
    
    <div class="stat bg-base-100 rounded-lg shadow-sm">
      <div class="stat-figure text-warning">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="stat-title">キャンセル率</div>
      <div class="stat-value">{statsData.cancellationRate}%</div>
      <div class="stat-desc">{statsData.cancelledBookings}件</div>
    </div>
    
    <div class="stat bg-base-100 rounded-lg shadow-sm">
      <div class="stat-figure text-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="stat-title">無断キャンセル率</div>
      <div class="stat-value">{statsData.noShowRate}%</div>
      <div class="stat-desc">{statsData.noShowBookings}件</div>
    </div>
  </div>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- 時間帯別予約数 -->
    <div class="bg-base-100 rounded-lg shadow-sm p-6">
      <h4 class="text-lg font-semibold mb-4">時間帯別予約数</h4>
      <div class="space-y-3">
        {#each statsData.hourlyStats as stat}
          <div class="flex items-center gap-3">
            <div class="text-sm w-16">{stat.hour}:00</div>
            <div class="flex-1">
              <div class="w-full bg-base-200 rounded-full h-6">
                <div 
                  class="bg-primary h-6 rounded-full relative"
                  style="width: {(stat.bookings / maxHourlyBookings) * 100}%"
                >
                  {#if stat.bookings > 0}
                    <span class="absolute right-2 top-0 h-full flex items-center text-xs text-primary-content">
                      {stat.bookings}件
                    </span>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
    
    <!-- 診療科別統計 -->
    <div class="bg-base-100 rounded-lg shadow-sm p-6">
      <h4 class="text-lg font-semibold mb-4">診療科別実績</h4>
      <div class="space-y-4">
        {#each statsData.departmentStats as dept}
          <div class="border-l-4 pl-4" style="border-color: {dept.color}">
            <div class="flex justify-between items-start">
              <div>
                <div class="font-medium">{dept.name}</div>
                <div class="text-sm text-base-content/70">
                  予約: {dept.bookings}件 / 完了: {dept.completed}件
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium">
                  ¥{dept.revenue.toLocaleString()}
                </div>
                <div class="text-xs text-base-content/70">推定収益</div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
    
    <!-- 医師別パフォーマンス -->
    <div class="bg-base-100 rounded-lg shadow-sm p-6 lg:col-span-2">
      <h4 class="text-lg font-semibold mb-4">医師別パフォーマンス</h4>
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>医師名</th>
              <th>診療科</th>
              <th>予約数</th>
              <th>完了数</th>
              <th>平均待ち時間</th>
              <th>稼働率</th>
            </tr>
          </thead>
          <tbody>
            {#each statsData.doctorStats as doctor}
              <tr>
                <td class="font-medium">{doctor.name}</td>
                <td>
                  {$departments.filter(d => doctor.departmentIds.includes(d.id)).map(d => d.name).join('・')}
                </td>
                <td>{doctor.bookings}</td>
                <td>{doctor.completed}</td>
                <td>{doctor.avgWaitTime.toFixed(0)}分</td>
                <td>
                  <div class="flex items-center gap-2">
                    <div class="w-20 bg-base-200 rounded-full h-2">
                      <div 
                        class="h-2 rounded-full {doctor.utilization > 80 ? 'bg-warning' : 'bg-success'}"
                        style="width: {Math.min(doctor.utilization, 100)}%"
                      ></div>
                    </div>
                    <span class="text-xs">{doctor.utilization.toFixed(0)}%</span>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>