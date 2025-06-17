<script>
  import { onMount } from 'svelte';
  
  let dateInput;
  let selectedDate = '';
  
  onMount(async () => {
    const Pikaday = (await import('pikaday')).default;
    
    if (dateInput) {
      const picker = new Pikaday({
        field: dateInput,
        onSelect: function() {
          selectedDate = this.toString('YYYY-MM-DD');
        }
      });
      
      return () => {
        picker.destroy();
      };
    }
  });
</script>

<div class="p-4">
  <h3 class="text-lg font-bold mb-4">Pikadayテスト</h3>
  
  <div class="form-control">
    <label class="label">
      <span class="label-text">日付を選択</span>
    </label>
    <input 
      type="text" 
      bind:this={dateInput}
      class="input input-bordered pika-single"
      placeholder="クリックして日付を選択"
      readonly
    >
  </div>
  
  {#if selectedDate}
    <p class="mt-2">選択された日付: {selectedDate}</p>
  {/if}
</div>