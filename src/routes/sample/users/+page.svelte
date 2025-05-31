<script>
import { onMount } from 'svelte';
  
  const holidays = [
  '2025-06-05',
  '2025-06-12'
].map(d => new Date(d));

onMount(async () => {
  const Pikaday = (await import('pikaday')).default;

  const picker = new Pikaday({
    field: document.getElementById('datepicker'),
    onDraw: function() {
      // すべてのボタンを取得
      document.querySelectorAll('.pika-single button.pika-button').forEach(btn => {
        const year = Number(btn.getAttribute('data-pika-year'));
        const month = Number(btn.getAttribute('data-pika-month'));
        const day = Number(btn.getAttribute('data-pika-day'));
        // 休日判定
        if (holidays.some(h => h.getFullYear() === year && h.getMonth() === month && h.getDate() === day)) {
          btn.classList.add('is-holiday');
          console.log(year + ' ' + month + ' ' + day)
        } else {
          btn.classList.remove('is-holiday');
          console.log('not holiday' + year + ' ' + month + ' ' + day);
        }
      });
    }
  });
});



</script>

<div class="form-control">
  <input 
    id="datepicker"
    type="text" 
    class="input input-bordered pika-single"

    placeholder="営業日を選択"
    readonly
  />
</div>

<style>
:global(.pika-single .pika-button.is-holiday) {
  background-color: #ffe4e1;
  color: #d00;
}
</style>