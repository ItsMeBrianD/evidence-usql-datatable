export type InformationSchemaTable = {
	is_insertable_into: 'YES' | 'NO';
	is_typed: 'YES' | 'NO';
	table_catalog: string;
	table_name: string;
	table_schema: string;
	table_type: 'VIEW'; // unsure what others are

	// unknowns
	reference_generation: null;
	self_referencing_column_name: null;
	commit_action: null;
	user_defined_type_catalog: null;
	user_defined_type_name: null;
	user_defined_type_schema: null;
};
// TODO: Clean up, we don't really care about most of this
export type InformationSchemaColumn = {
	character_maximum_length: null;
	character_octet_length: null;
	character_set_catalog: null;
	character_set_name: null;
	character_set_schema: null;
	collation_catalog: null;
	collation_name: null;
	collation_schema: null;
	column_default: null;
	column_name: string;
	// TODO: Flush this out
	data_type: 'BIGINT' | 'DOUBLE' | 'TIMESTAMP' | 'VARCHAR';
	datetime_precision: null;
	domain_catalog: null;
	domain_name: null;
	domain_schema: null;
	dtd_identifier: null;
	generation_expression: null;
	identity_cycle: null;
	identity_generation: null;
	identity_increment: null;
	identity_maximum: null;
	identity_minimum: null;
	identity_start: null;
	interval_precision: null;
	interval_type: null;
	is_generated: null;
	is_identity: null;
	is_nullable: 'YES' | 'NO';
	is_self_referencing: null;
	is_updatable: null;
	maximum_cardinality: null;
	numeric_precision: number | null;
	numeric_precision_radix: number | null;
	numeric_scale: number | null;
	ordinal_position: 1;
	scope_catalog: null;
	scope_name: null;
	scope_schema: null;
	table_catalog: string;
	table_name: string;
	table_schema: string;
	udt_catalog: null;
	udt_name: null;
	udt_schema: null;
};
