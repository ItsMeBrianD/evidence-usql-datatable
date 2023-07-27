// TODO: This should be moved to @evidence-dev/component-utilities

import { getContext, setContext } from 'svelte';
import type { UniversalSqlMod } from './types.js';

export const DB_CONTEXT_KEY = 'evidence-usql-db';

export const setDbContext = (mod: UniversalSqlMod) =>
	setContext<UniversalSqlMod>(DB_CONTEXT_KEY, mod);
export const getDbContext = () => getContext<UniversalSqlMod>(DB_CONTEXT_KEY);
