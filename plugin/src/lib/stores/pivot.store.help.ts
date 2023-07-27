export const buildGroupString = (g: string[]) => (g.length ? `\ngroup {${g.join(', ')}}` : '');
export const buildSortString = (s: {name: string, sort: "asc" | "desc"}[]) => s.length
    ? `\nsort {${s.map(s => s.sort === "asc" ? s.name : `-${s.name}`).join(', ')}}`
    : "";

export const getTableSchema = async (usql: UniversalSqlMod, targetTable: string) => {
	// TODO: Test to make sure this works with unqualified table names
	const [schema, tableName] = targetTable.includes('.')
		? targetTable.split('.')
		: ['', targetTable];

	const columns: InformationSchemaColumn = await usql.query(
		`SELECT * FROM information_schema.columns WHERE table_name = '${tableName}' AND table_schema = '${schema}'`
	);

	return columns.map((c) => {
		return {
			name: c.column_name,
			is_numeric: ['DOUBLE', 'BIGINT'].includes(c.data_type)
		};
	});
};
