<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  let searchQuery = '';

  function handleInput() {
    dispatch('search', searchQuery);
  }
</script>

<div class="mb-4">
  <input
    type="text"
    bind:value={searchQuery}
    on:input={handleInput}
    placeholder="Search contacts..."
    class="w-full p-2 border border-gray-300 rounded"
  />
</div>