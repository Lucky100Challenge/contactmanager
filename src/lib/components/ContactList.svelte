<script>
  import { createEventDispatcher } from 'svelte';

  export let contacts;
  export let selectedContacts = new Set();

  const dispatch = createEventDispatcher();

  function handleSelectContact(contact) {
    dispatch('selectContact', contact);
  }

  function handleDeleteContact(id) {
    if (confirm('Are you sure you want to delete this contact?')) {
      dispatch('deleteContact', id);
    }
  }

  function toggleSelectContact(id) {
    if (selectedContacts.has(id)) {
      selectedContacts.delete(id);
    } else {
      selectedContacts.add(id);
    }
    selectedContacts = selectedContacts; // trigger reactivity
  }
</script>

<div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden transition-colors duration-300">
  {#if contacts.length === 0}
    <p class="p-4 text-gray-500 dark:text-gray-400">No contacts found.</p>
  {:else}
    <ul class="divide-y divide-gray-200 dark:divide-gray-700">
      {#each contacts as contact (contact.id)}
        <li class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center transition-colors duration-300">
          <div class="flex items-center">
            <input
              type="checkbox"
              checked={selectedContacts.has(contact.id)}
              on:change={() => toggleSelectContact(contact.id)}
              class="mr-4"
            />
            <div>
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white">{contact.name}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300">{contact.email}</p>
              <p class="text-sm text-gray-600 dark:text-gray-300">{contact.phone}</p>
              <p class="text-sm text-gray-600 dark:text-gray-300">{contact.company}</p>
              <div class="mt-1">
                {#each contact.tags as tag}
                  <span class="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded-full mr-1 mb-1">{tag}</span>
                {/each}
              </div>
            </div>
          </div>
          <div>
            <button
              on:click={() => handleSelectContact(contact)}
              class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-2"
            >
              Edit
            </button>
            <button
              on:click={() => handleDeleteContact(contact.id)}
              class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Delete
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>