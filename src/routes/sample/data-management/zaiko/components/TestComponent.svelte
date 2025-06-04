<script lang="ts">
  let { testProp = 'デフォルト値' } = $props();
</script>

<div class="p-4 border rounded">
  <h3 class="font-bold">テストコンポーネント</h3>
  <p>プロパティ: {testProp}</p>
  <p>現在時刻: {new Date().toLocaleTimeString()}</p>
</div>