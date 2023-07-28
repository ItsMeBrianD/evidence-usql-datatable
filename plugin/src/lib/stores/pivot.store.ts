import { BaseStore } from './BaseStore.js';
import { type Writable, writable, type Readable, derived, get } from 'svelte/store';
import type { ArrowTable } from '../types.js';
import { getTableParts, getTableSchema } from './pivot.store.help.js';
import * as usql from '@evidence-dev/universal-sql/client-duckdb';
// @ts-expect-error @uwdata/mosaic-sql is a javascript package, we can just trust it though.
import { Query, count, desc, avg, sum, min, max } from '@uwdata/mosaic-sql';

export type Agg = 'avg' | 'sum' | 'min' | 'max';
export type Sort = 'asc' | 'desc' | undefined;

// TODO: Add ordinals somehow
export type PivotColumn = {
	name: string;
	is_numeric: boolean;
};
export type TableColumn = PivotColumn & {
	grouped: boolean;
	is_numeric: boolean;
	aggs?: Agg[];
};

export type ResultColumn = PivotColumn & {
	sort: Sort;
};

const PossibleSorts: Sort[] = ['asc', 'desc', undefined];

const aggMap: Record<Agg, (s: string) => unknown> = {
	avg: avg,
	sum: sum,
	min: min,
	max: max
};

export type Pagination = { page: number; itemsPerPage: number; pages: number };

export class Pivot extends BaseStore<ArrowTable> {
	private readonly _tableColumns: Writable<TableColumn[]> = writable([]);
	/**
	 * Table columns are columns that are present in the underlying table
	 * This does not represent the results of the pivoted query, or any computed columns that have been added
	 */
	readonly tableColumns: Readable<TableColumn[]> = derived(
		[this._tableColumns],
		([$columns]) => $columns
	);

	private readonly _resultColumns: Writable<ResultColumn[]> = writable([]);
	/**
	 * Result columns are columns that are present in the result of the pivoted query
	 * This may equal tableColumns, but is not guarunteed to
	 */
	readonly resultColumns: Readable<ResultColumn[]> = derived(
		[this._resultColumns],
		([$columns]) => $columns
	);

	constructor(readonly targetTable: string) {
		super([]);
		this.update();
		getTableSchema(usql, targetTable).then((columns) => this._tableColumns.set(columns));
	}

	private buildSql() {
		const { schema, table } = getTableParts(this.targetTable);
		console.log({ schema, table });

		const query = Query.from(`${schema ? schema + '.' : ''}${table}`);
		const groups = get(this.tableColumns)
			.filter((c) => c.grouped)
			.map((c) => c.name);
		const sorts = get(this.resultColumns).filter((c) => c.sort);
		const aggCols = get(this.tableColumns).filter((c) => c.aggs?.length);

		const derivedColumns: string[] = [];

		if (groups.length) {
			query.groupby(...groups);
			// TODO: This should become a global agg or something
			query.select({ rows: count() });
			derivedColumns.push('rows');
		}

		if (aggCols.length) {
			for (const col of aggCols) {
				for (const agg of col.aggs ?? []) {
					const aggFunc = aggMap[agg];
					derivedColumns.push(`${col.name}_${agg}`);
					query.select({ [`${col.name}_${agg}`]: aggFunc(col.name) });
				}
			}
		}

		if (!aggCols.length && !groups.length) {
			query.select('*');
		} else if (groups.length) {
			query.select(...groups);
			derivedColumns.push(...groups);
		}

		for (const sortCol of sorts) {
			const sortIsTable = get(this.tableColumns).some((c) => c.name === sortCol.name);
			const sortIsDerived = derivedColumns.some((dc) => dc === sortCol.name);
			if (sortIsTable || sortIsDerived) {
				query.orderby(sortCol.sort === 'asc' ? sortCol.name : desc(sortCol.name));
			}
		}

		// Grab a copy before we add selected
		const pagesQuery = query.clone();

		const { itemsPerPage, page } = get(this.pagination);
		query.limit(itemsPerPage).offset(page * itemsPerPage);

		return { query: query.toString(), pagesQuery: pagesQuery.toString() };
	}

	private async update() {
		// TODO: Cancel previous query when updating (if previous query is running)
		try {
			const { query, pagesQuery } = this.buildSql();
			const result = await usql.query(query);
			this.pub(result);
			const oldResultColumns = get(this.resultColumns);
			this._resultColumns.set(
				result._evidenceColumnTypes.map((ect: { name: string; evidenceType: string }) => {
					return {
						name: ect.name,
						is_numeric: ect.evidenceType === 'number',
						sort: oldResultColumns.find((c) => c.name === ect.name)?.sort
					};
				})
			);
			// TODO: Figure out how many rows result would have without a limit/offset

			const pagesSql = `SELECT COUNT(*) / ${
				get(this.pagination).itemsPerPage
			} as pages FROM (${pagesQuery});`;
			const pagesResult = await usql.query(pagesSql);
			const pageNum = Math.ceil(pagesResult[0].pages);
			this._pagination.update(($pagination) => ({ ...$pagination, pages: pageNum }));
		} catch (e) {
			//@ts-expect-error e is an error
			console.log(e.message);
		}
	}

	toggleGroup(group: string) {
		// TODO: Test for this case
		if (!get(this.tableColumns).some((c) => c.name === group)) {
			console.warn('Cannot group by non-existent column.');
			return;
		}

		this._tableColumns.update(($_tableColumns) =>
			$_tableColumns.map((col) => (col.name === group ? { ...col, grouped: !col.grouped } : col))
		);
		// Remove all sorts when changing groupings
		this._resultColumns.update(($_resultColumns) =>
			$_resultColumns.map((col) => ({ ...col, sort: undefined }))
		);
		// setting page triggers an update
		this._pagination.update((p) => ({ ...p, page: 0 }));
		this.update();
	}

	toggleSort(resultCol: string) {
		// TODO: Test for this case
		if (!get(this.resultColumns).some((c) => c.name === resultCol)) {
			console.warn('Cannot sort by non-existent column.');
			return;
		}

		this._resultColumns.update(($_resultColumns) => {
			const updated = $_resultColumns.map((col) => {
				if (col.name !== resultCol) return col;
				const sortIndex = (PossibleSorts.indexOf(col.sort) + 1) % PossibleSorts.length;
				return {
					...col,
					sort: PossibleSorts[sortIndex]
				};
			});
			return updated;
		});
		this.update();
	}

	toggleAgg(tableCol: string, aggType: 'sum' | 'avg' | 'min' | 'max') {
		this._tableColumns.update(($_tableColumns) =>
			$_tableColumns.map((col) => {
				if (col.name !== tableCol) return col;
				if (!col.aggs) col.aggs = [];
				if (col.aggs.includes(aggType)) col.aggs = col.aggs.filter((a) => a !== aggType);
				else col.aggs.push(aggType);
				return col;
			})
		);
		this.update();
	}

	// Pagination
	// TODO: make this a store so reactivity works properly

	private _pagination = writable<Pagination>({ page: 0, itemsPerPage: 20, pages: 0 });
	readonly pagination: Readable<Pagination> = derived(
		[this._pagination],
		([$pagination]) => $pagination
	);

	nextPage() {
		this._pagination.update((p) => ({ ...p, page: p.page + 1 }));
		this.update();
	}
	prevPage() {
		this._pagination.update((p) => ({ ...p, page: p.page - 1 }));
		this.update();
	}
	firstPage() {
		this._pagination.update((p) => ({ ...p, page: 0 }));
		this.update();
	}
	lastPage() {
		this._pagination.update((p) => ({ ...p, page: p.pages - 1 }));
		this.update();
	}
}

export async function getPivot(targetTable: string) {
	return new Pivot(targetTable);
}
