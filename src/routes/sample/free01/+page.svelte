<script>
  import { onMount } from 'svelte';
  
  let dateInput;
  let selectedDate = '';
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    const picker = new Pikaday({
      field: dateInput,
      format: 'YYYY-MM-DD',
      onSelect: function() {
        selectedDate = this.toString('YYYY-MM-DD');
      }
    });
    
    return () => picker.destroy();
  });
</script>

<div class="form-control">
  <label for="date-picker" class="label">
    <span class="label-text">日付を選択</span>
  </label>
  <input
    id="date-picker" 
    type="text" 
    class="input pika-single"
    placeholder="クリックして日付を選択"
    bind:this={dateInput}
  />
  {#if selectedDate}
    <div class="label">
      <span class="label-text-alt">選択された日付: {selectedDate}</span>
    </div>
  {/if}
</div>
