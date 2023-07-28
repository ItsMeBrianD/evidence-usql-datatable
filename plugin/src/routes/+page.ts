import type { PageLoad, PageLoadEvent } from './$types.js';

export const prerender = true;

export const load: PageLoad = async ({ params }: PageLoadEvent) => {
	const usql = await import('@evidence-dev/universal-sql/client-duckdb');
	await usql.initDB();
	// @ts-expect-error Error in declared types
	await usql.setParquetURLs({
		taxi: [
			'/yellow_jan.parquet',
			'/yellow_feb.parquet',
			'/yellow_mar.parquet',
			'/green_jan.parquet',
			'/green_feb.parquet',
			'/green_mar.parquet'
		]
	});
	return {
		__db: usql
	};
};
