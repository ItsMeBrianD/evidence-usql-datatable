import type { UniversalSqlMod } from '../types.js';
import type { InformationSchemaColumn } from '../ddb.types.js';
export const buildGroupString = (g: string[]) => (g.length ? `\ngroup {${g.join(', ')}}` : '');
export const buildSortString = (s: { name: string; sort: 'asc' | 'desc' }[]) =>
	s.length ? `\nsort {${s.map((s) => (s.sort === 'asc' ? s.name : `-${s.name}`)).join(', ')}}` : '';

export const getTableParts = (targetTable: string) => {
	const parts = targetTable.includes('.') ? targetTable.split('.') : ['', targetTable];

	let schema, table, catalog;
	if (parts.length === 3) {
		catalog = parts[0];
		schema = parts[1];
		table = parts[2];
	} else if (parts.length === 2) {
		schema = parts[0];
		table = parts[1];
	} else table = parts[0];

	return {
		schema,
		catalog,
		table
	};
};

export const getTableSchema = async (usql: UniversalSqlMod, targetTable: string) => {
	// TODO: Test to make sure this works with unqualified table names

	const { table, schema } = getTableParts(targetTable);

	const schemaStatement = schema ? `AND table_schema = '${schema}'` : '';
	const columns: InformationSchemaColumn[] = await usql.query(
		`SELECT * FROM information_schema.columns WHERE table_name = '${table}' ${schemaStatement}`
	);

	return columns.map((c) => {
		return {
			name: c.column_name,
			is_numeric: ['DOUBLE', 'BIGINT'].includes(c.data_type),
			grouped: false
		};
	});
};
