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
	} from './stores/pivot.store.js';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { SortAscending, SortDescending, ArrowsSort } from '@steeze-ui/tabler-icons';
	import {page} from "$app/stores"

	import AggPanel from "./components/AggPanel.svelte";
	import Paginator from "./components/Paginator.svelte";

	export let tableName: string;

	let pivot: Pivot;
	let resultColumns: Readable<ResultColumn[]>;
	let pagination: Readable<Pagination>;

	$: usql = $page.data.__db;

	$: usql &&
		getPivot(tableName, usql).then((p) => {
			pivot = p;
			resultColumns = p.resultColumns;
			pagination = p.pagination;
		});

	const sortIconMap = {
		asc: SortAscending,
		desc: SortDescending,
		'': undefined
	};

</script>

{#if !usql}
	Error loading client duckdb instance.
{:else if pivot}
	<div class="px-4 w-full overflow-auto">
		<p class="font-bold text-lg block w-full bg-gray-300 px-2 py-1">{tableName}</p>

		<section class="flex gap-4 w-full">
			<div class="flex flex-col justify-start text-xs text-left relative transition w-40">
				<AggPanel {pivot}/>
				<Paginator {pivot}/>
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
