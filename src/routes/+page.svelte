<script>
  import ContactList from '$lib/components/ContactList.svelte';
  import ContactForm from '$lib/components/ContactForm.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import { contacts } from '$lib/stores/contacts';
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';

  let searchQuery = '';
  let filteredContacts = [];
  let selectedContact = null;
  let isAddingContact = false;
  let isNotificationVisible = false;
  let notificationMessage = '';
  let sortBy = 'name';
  let sortOrder = 'asc';
  let selectedGroup = 'all';
  let selectedContacts = new Set();
  let isDarkMode = false;

  $: {
    filteredContacts = $contacts.filter(contact =>
      (selectedGroup === 'all' || contact.tags.includes(selectedGroup)) &&
      (contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      contact.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    filteredContacts.sort((a, b) => {
      let comparison = 0;
      if (a[sortBy] < b[sortBy]) comparison = -1;
      if (a[sortBy] > b[sortBy]) comparison = 1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  $: groups = ['all', ...new Set($contacts.flatMap(contact => contact.tags))];

  function handleSearch(event) {
    searchQuery = event.detail;
  }

  function handleSelectContact(event) {
    selectedContact = event.detail;
    isAddingContact = false;
  }

  function handleSaveContact(event) {
    if (selectedContact) {
      contacts.update(existingContacts => 
        existingContacts.map(c => c.id === selectedContact.id ? event.detail : c)
      );
      displayNotification('Contact updated successfully');
    } else {
      contacts.update(existingContacts => [...existingContacts, { ...event.detail, id: Date.now() }]);
      displayNotification('New contact added successfully');
    }
    selectedContact = null;
    isAddingContact = false;
  }

  function handleDeleteContact(event) {
    contacts.update(existingContacts => existingContacts.filter(c => c.id !== event.detail));
    selectedContact = null;
    displayNotification('Contact deleted successfully');
  }

  function handleBulkDelete() {
    if (confirm(`Are you sure you want to delete ${selectedContacts.size} contacts?`)) {
      contacts.update(existingContacts => existingContacts.filter(c => !selectedContacts.has(c.id)));
      selectedContacts.clear();
      displayNotification('Contacts deleted successfully');
    }
  }

  function exportToCSV() {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Tags', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...$contacts.map(contact => [
        contact.name,
        contact.email,
        contact.phone,
        contact.company,
        contact.tags.join(';'),
        contact.notes
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'contacts.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  function displayNotification(message) {
    notificationMessage = message;
    isNotificationVisible = true;
    setTimeout(() => {
      isNotificationVisible = false;
    }, 3000);
  }

  function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark');
  }

  onMount(() => {
    if (typeof window !== 'undefined') {
      const storedContacts = localStorage.getItem('contacts');
      if (storedContacts) {
        contacts.set(JSON.parse(storedContacts));
      }
      isDarkMode = localStorage.getItem('darkMode') === 'true';
      if (isDarkMode) document.body.classList.add('dark');
    }
  });

  $: if (typeof window !== 'undefined') {
    localStorage.setItem('contacts', JSON.stringify($contacts));
    localStorage.setItem('darkMode', isDarkMode);
  }
</script>

<main class="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4 transition-colors duration-300">
  <div class="max-w-7xl mx-auto">
    <header class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mb-8 transition-colors duration-300">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-4xl font-extrabold text-gray-800 dark:text-white mb-2">Contact Sphere</h1>
          <p class="text-lg text-gray-600 dark:text-gray-300">Your modern contact management solution</p>
        </div>
        <button
          on:click={toggleDarkMode}
          class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white transition-colors duration-300"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 transition-colors duration-300">
          <div class="flex flex-col sm:flex-row justify-between items-center mb-6">
            <SearchBar on:search={handleSearch} />
            <button
              on:click={() => { isAddingContact = true; selectedContact = null; }}
              class="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              Add New Contact
            </button>
          </div>
          <div class="flex flex-wrap gap-4 mb-4">
            <select
              bind:value={selectedGroup}
              class="p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
            >
              {#each groups as group}
                <option value={group}>{group}</option>
              {/each}
            </select>
            <select
              bind:value={sortBy}
              class="p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
            >
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="company">Sort by Company</option>
            </select>
            <button
              on:click={() => sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'}
              class="p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
            <button
              on:click={handleBulkDelete}
              disabled={selectedContacts.size === 0}
              class="p-2 bg-red-500 text-white rounded disabled:opacity-50"
            >
              Delete Selected ({selectedContacts.size})
            </button>
            <button
              on:click={exportToCSV}
              class="p-2 bg-green-500 text-white rounded"
            >
              Export to CSV
            </button>
          </div>
          <ContactList 
            contacts={filteredContacts}
            bind:selectedContacts
            on:selectContact={handleSelectContact}
            on:deleteContact={handleDeleteContact}
          />
        </div>
      </div>
      <div>
        {#if isAddingContact || selectedContact}
          <div transition:slide={{ duration: 300 }} class="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 transition-colors duration-300">
            <ContactForm 
              contact={selectedContact} 
              on:saveContact={handleSaveContact}
              on:cancelEdit={() => { selectedContact = null; isAddingContact = false; }}
            />
          </div>
        {:else}
          <div class="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 transition-colors duration-300">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">Contact Management Tips</h2>
            <ul class="space-y-3">
              <li class="flex items-center text-gray-700 dark:text-gray-300">
                <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Keep your contact information up to date
              </li>
              <li class="flex items-center text-gray-700 dark:text-gray-300">
                <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Use tags to categorize your contacts
              </li>
              <li class="flex items-center text-gray-700 dark:text-gray-300">
                <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Add notes to remember important details
              </li>
              <li class="flex items-center text-gray-700 dark:text-gray-300">
                <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Regularly review and clean up your contact list
              </li>
            </ul>
          </div>
        {/if}
      </div>
    </div>
  </div>

  {#if isNotificationVisible}
    <div
      transition:fade={{ duration: 300 }}
      class="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center"
    >
      <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
      {notificationMessage}
    </div>
  {/if}
</main>
