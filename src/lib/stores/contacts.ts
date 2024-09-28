import { writable } from 'svelte/store';
import type { Contact } from '$lib/types';

export const contacts = writable<Contact[]>([]);