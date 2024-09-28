<script>
  import { createEventDispatcher } from 'svelte';

  export let contact = null;

  const dispatch = createEventDispatcher();

  let name = '';
  let email = '';
  let phone = '';
  let company = '';
  let tags = '';
  let notes = '';

  $: if (contact) {
    name = contact.name;
    email = contact.email;
    phone = contact.phone;
    company = contact.company;
    tags = contact.tags.join(', ');
    notes = contact.notes;
  } else {
    name = '';
    email = '';
    phone = '';
    company = '';
    tags = '';
    notes = '';
  }

  function handleSubmit() {
    const newContact = {
      id: contact ? contact.id : Date.now(),
      name,
      email,
      phone,
      company,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      notes
    };
    dispatch('saveContact', newContact);
    resetForm();
  }

  function handleCancel() {
    dispatch('cancelEdit');
    resetForm();
  }

  function resetForm() {
    name = '';
    email = '';
    phone = '';
    company = '';
    tags = '';
    notes = '';
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="bg-white shadow-md rounded-lg p-6">
  <h2 class="text-2xl font-bold mb-4">{contact ? 'Edit Contact' : 'Add New Contact'}</h2>
  <div class="mb-4">
    <label for="name" class="block text-gray-700 font-bold mb-2">Name</label>
    <input
      type="text"
      id="name"
      bind:value={name}
      required
      class="w-full p-2 border border-gray-300 rounded"
    />
  </div>
  <div class="mb-4">
    <label for="email" class="block text-gray-700 font-bold mb-2">Email</label>
    <input
      type="email"
      id="email"
      bind:value={email}
      required
      class="w-full p-2 border border-gray-300 rounded"
    />
  </div>
  <div class="mb-4">
    <label for="phone" class="block text-gray-700 font-bold mb-2">Phone</label>
    <input
      type="tel"
      id="phone"
      bind:value={phone}
      required
      class="w-full p-2 border border-gray-300 rounded"
    />
  </div>
  <div class="mb-4">
    <label for="company" class="block text-gray-700 font-bold mb-2">Company</label>
    <input
      type="text"
      id="company"
      bind:value={company}
      class="w-full p-2 border border-gray-300 rounded"
    />
  </div>
  <div class="mb-4">
    <label for="tags" class="block text-gray-700 font-bold mb-2">Tags (comma-separated)</label>
    <input
      type="text"
      id="tags"
      bind:value={tags}
      class="w-full p-2 border border-gray-300 rounded"
    />
  </div>
  <div class="mb-4">
    <label for="notes" class="block text-gray-700 font-bold mb-2">Notes</label>
    <textarea
      id="notes"
      bind:value={notes}
      rows="3"
      class="w-full p-2 border border-gray-300 rounded"
    ></textarea>
  </div>
  <div class="flex justify-end">
    <button
      type="button"
      on:click={handleCancel}
      class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
    >
      Cancel
    </button>
    <button
      type="submit"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      {contact ? 'Update' : 'Add'} Contact
    </button>
  </div>
</form>