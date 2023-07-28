<script context="module">
	export const evidenceInclude = true;
</script>

<script lang="ts">
	import type { Readable } from 'svelte/store';
	import {
		getPivot,
		Pivot,
		type Pagination,
		type ResultColumn,
		type TableColumn
	} from './stores/pivot.store.js';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { SortAscending, SortDescending, ArrowsSort } from '@steeze-ui/tabler-icons';

	export let tableName: string;

	let pivot: Pivot;
	let tableColumns: Readable<TableColumn[]>;
	let resultColumns: Readable<ResultColumn[]>;
	let pagination: Readable<Pagination>;

	$: getPivot(tableName).then((p) => {
		pivot = p;
		tableColumns = p.tableColumns;
		resultColumns = p.resultColumns;
		pagination = p.pagination;
	});

	const sortIconMap = {
		asc: SortAscending,
		desc: SortDescending,
		'': undefined
	};
</script>

{#if pivot && tableColumns}
	<div class="px-4 w-full overflow-auto">
		<p class="font-bold text-lg block w-full bg-gray-300 px-2 py-1">{tableName}</p>

		<section class="flex gap-4 w-full">
			<div class="flex flex-col text-xs text-left w-56">
				<p class="font-bold text-sm">Table Columns</p>
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
								<button
									class="hover:bg-gray-100 text-[10px]"
									class:bg-green-200={column.aggs?.includes('avg')}
									class:hover:bg-green-400={column.aggs?.includes('avg')}
									on:click={() => pivot.toggleAgg(column.name, 'avg')}>avg</button
								>
								<button
									class="hover:bg-gray-100 text-[10px]"
									class:bg-green-200={column.aggs?.includes('sum')}
									class:hover:bg-green-400={column.aggs?.includes('sum')}
									on:click={() => pivot.toggleAgg(column.name, 'sum')}>sum</button
								>
								<button
									class="hover:bg-gray-100 text-[10px]"
									class:bg-green-200={column.aggs?.includes('min')}
									class:hover:bg-green-400={column.aggs?.includes('min')}
									on:click={() => pivot.toggleAgg(column.name, 'min')}>min</button
								>
								<button
									class="hover:bg-gray-100 text-[10px]"
									class:bg-green-200={column.aggs?.includes('max')}
									class:hover:bg-green-400={column.aggs?.includes('max')}
									on:click={() => pivot.toggleAgg(column.name, 'max')}>max</button
								>
							{/if}
						</div>
					</div>
				{/each}
				<div class="flex justify-between">
					<button disabled={$pagination.page === 0} on:click={() => pivot.prevPage()}>
						Prev Page
					</button>
					{$pagination.page + 1} / {$pagination.pages}
					<button on:click={() => pivot.nextPage()}>Next Page</button>
				</div>
			</div>
			<div class="text-xs flex-1 w-full overflow-x-auto">
				<table class="">
					<thead>
						<tr>
							<th />
							{#each $resultColumns as column}
								<th class="odd:bg-gray-500/10">
									<div class="flex gap-1 px-1">
										<button
											class="hover:bg-gray-100"
											on:click={() => pivot.toggleSort(column.name)}
										>
											{column.name}
										</button>
										<Icon src={sortIconMap[column.sort ?? ''] ?? ArrowsSort} class="w-4" />
									</div>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each $pivot as row, i}
							<tr class="odd:bg-gray-100">
								<th>{i + 1 + $pagination.page * $pagination.itemsPerPage}</th>
								{#each $resultColumns as column}
									<td class="odd:bg-gray-500/10">{row[column.name]?.toLocaleString() ?? 'null'}</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	</div>
{/if}
