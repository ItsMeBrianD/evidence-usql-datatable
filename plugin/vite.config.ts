import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
//@ts-expect-error plugin has issues resolving types. This isn't really important
import wasm from 'vite-plugin-wasm';

export default defineConfig({
	plugins: [sveltekit(), wasm()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	optimizeDeps: {
		exclude: ['@evidence-dev/universal-sql/client-duckdb']
	}
});
