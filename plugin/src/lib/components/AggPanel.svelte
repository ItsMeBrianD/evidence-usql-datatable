<script lang="ts">
	import { Icon } from '@steeze-ui/svelte-icon';
	import { Abacus } from '@steeze-ui/tabler-icons';
	import type { Readable } from 'svelte/store';
	import type { Pivot, TableColumn } from '../stores/pivot.store.js';
	import ContextMenu from './ContextMenu.svelte';
	export let pivot: Pivot;

	let tableColumns: Readable<TableColumn[]>;

	$: tableColumns = pivot.tableColumns;
</script>

<p class="font-bold text-sm">Columns</p>
{#each $tableColumns as column (column.name)}
	<div class="flex justify-between gap-2 odd:bg-gray-200 px-2">
		<input class="cursor-pointer" type="checkbox" disabled checked={column.grouped} />
		<button
			class="text-left flex-1 cursor-pointer hover:bg-gray-900/10 truncate"
			on:click={() => pivot.toggleGroup(column.name)}
		>
			{column.name}
		</button>
		<div class="min-w-fit">
			{#if !column.grouped && column.is_numeric}
				<ContextMenu>
					<button on:click={() => pivot.clearAggs(column.name)} slot="handle">
						<Icon src={Abacus} class="w-3 h-3 {column.aggs?.length ? 'text-green-600' : ''}" />
					</button>
					<div class="flex flex-col gap-2">
						<button
							class="hover:bg-gray-100 w-full text-sm"
							class:bg-green-200={column.aggs?.includes('avg')}
							class:hover:bg-green-400={column.aggs?.includes('avg')}
							on:click={() => pivot.toggleAgg(column.name, 'avg')}
						>
							Average
						</button>
						<hr class="my-0 border-gray-800" />
						<button
							class="hover:bg-gray-100 w-full text-sm"
							class:bg-green-200={column.aggs?.includes('sum')}
							class:hover:bg-green-400={column.aggs?.includes('sum')}
							on:click={() => pivot.toggleAgg(column.name, 'sum')}
						>
							Sum
						</button>
						<hr class="my-0 border-gray-800" />
						<button
							class="hover:bg-gray-100 w-full text-sm"
							class:bg-green-200={column.aggs?.includes('min')}
							class:hover:bg-green-400={column.aggs?.includes('min')}
							on:click={() => pivot.toggleAgg(column.name, 'min')}
						>
							Minimum
						</button>
						<hr class="my-0 border-gray-800" />
						<button
							class="hover:bg-gray-100 w-full text-sm"
							class:bg-green-200={column.aggs?.includes('max')}
							class:hover:bg-green-400={column.aggs?.includes('max')}
							on:click={() => pivot.toggleAgg(column.name, 'max')}
						>
							Maximum
						</button>
					</div>
				</ContextMenu>
			{/if}
		</div>
	</div>
{/each}
