import { browser } from '$app/environment';
import { readable } from 'svelte/store';
import type { PrqlMod } from '../types.js';

export const prqlStore = readable<null | PrqlMod>(null, (set) => {
	if (browser) import('prql-js/dist/bundler').then(set);
	else import('prql-js/dist/node').then(set);
});
