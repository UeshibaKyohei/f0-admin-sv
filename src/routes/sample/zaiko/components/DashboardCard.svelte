<script lang="ts">
  let { 
    title = '',
    value = '',
    subtitle = '',
    color = 'primary',
    icon = '',
    trend = null as number | null
  } = $props();
</script>

<div class="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
  <div class="card-body">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h3 class="text-sm font-medium text-base-content/70">{title}</h3>
        <p class="text-2xl font-bold mt-2 text-{color}">{value}</p>
        {#if subtitle}
          <p class="text-xs text-base-content/60 mt-1">{subtitle}</p>
        {/if}
        {#if trend !== null}
          <div class="flex items-center mt-2">
            {#if trend > 0}
              <svg class="w-4 h-4 text-success mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
              <span class="text-xs text-success">+{trend}%</span>
            {:else if trend < 0}
              <svg class="w-4 h-4 text-error mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"></path>
              </svg>
              <span class="text-xs text-error">{trend}%</span>
            {:else}
              <span class="text-xs text-base-content/60">変化なし</span>
            {/if}
          </div>
        {/if}
      </div>
      {#if icon}
        <div class="text-{color}/20">
          <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
            {@html icon}
          </svg>
        </div>
      {/if}
    </div>
  </div>
</div>