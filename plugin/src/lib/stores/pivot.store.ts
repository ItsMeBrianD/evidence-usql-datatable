import { browser } from '$app/environment';
import { BaseStore } from './BaseStore.js';
import { type Writable, writable, type Readable, derived, get } from 'svelte/store';
import type { ArrowTable, PrqlMod } from '../types.js';
import { buildGroupString, buildSortString, getTableSchema } from './pivot.store.help.js';

export type PivotColumn = {
	name: string;
	is_numeric: boolean;
};

export type TableColumn = PivotColumn & {
	grouped: boolean;
};

export type ResultColumn = PivotColumn & {
	sort: 'asc' | 'desc' | undefined;
};

const PossibleSorts = ['asc', 'desc', undefined];

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

	constructor(readonly mod: PrqlMod, readonly usql: UniversalSqlMod, readonly targetTable: string) {
		super();
		this.pub([]);
		this.update();
		getTableSchema(usql, targetTable).then((columns) => this._tableColumns.set(columns));
	}

	private async update() {
		// TODO: Cancel previous query when updating (if previous query is running)
		let prqlQuery = `from ${this.targetTable}`;
		// Add Groups
		const groups = get(this.tableColumns)
			.filter((tc) => tc.grouped)
			.map((tc) => tc.name);
		if (groups.length > 0) {
			prqlQuery +=
				buildGroupString(groups) + ` ( aggregate { rows = count ${get(this.resultColumns)[0].name} } ) `;
			prqlQuery += "\n sort { -rows }"
		}
		const sorts = get(this.resultColumns).filter((tc) => tc.sort);
		if (sorts.length > 0) {
			prqlQuery += buildSortString(sorts);
		}
		// Limit to 100 rows
		// This should be changed to pagination
		prqlQuery += `\ntake 100`;
		console.log(prqlQuery);
		try {
			const sql = this.mod.compile(prqlQuery);
			if (!sql) {
				console.warn(`Failed to execute pivot query against ${this.targetTable}.`, {
					prql: prqlQuery,
					sql: sql,
					targetTable: this.targetTable,
					groups: this.groups
				});
				return;
			}
			const result = await this.usql.query(sql);
			this.pub(result);
			const oldResultColumns = get(this.resultColumns);
			this._resultColumns.set(
				result._evidenceColumnTypes.map((ect) => {
					return {
						name: ect.name,
						is_numeric: ect.evidenceType === 'number',
						sort: oldResultColumns.find((c) => c.name === ect.name)?.sort
					};
				})
			);
		} catch (e) {
			console.log(e.message);
			const errorType = JSON.parse<{ inner: PrqlCompileError[] }>(e.message);
			console.error(errorType.inner[0].display);
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
		)

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
				console.log(
					col.sort,
					PossibleSorts.indexOf(col.sort),
					(PossibleSorts.indexOf(col.sort) + 1) % PossibleSorts.length
				);
				const sortIndex = (PossibleSorts.indexOf(col.sort) + 1) % PossibleSorts.length;
				return {
					...col,
					sort: PossibleSorts[sortIndex]
				};
			});
			console.log({ updated });
			return updated;
		});
		this.update();
	}
}

export async function getPivot(usql: UniversalSqlMod, targetTable: string) {
	const prqlMod = await (browser ? import('prql-js/dist/bundler') : import('prql-js/dist/node'));
	return new Pivot(prqlMod, usql, targetTable);
}
