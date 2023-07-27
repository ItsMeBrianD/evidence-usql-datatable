<script lang="ts">
	import type { Readable } from 'svelte/store';
	import { getDbContext } from './context.js';
	import { getPivot, Pivot, type PivotColumn, type ResultColumn, type TableColumn } from './stores/pivot.store.js';
    import {Icon} from "@steeze-ui/svelte-icon";
    import {SortAscending, SortDescending, ArrowsSort} from "@steeze-ui/tabler-icons";

	const db = getDbContext();

	let pivot: Pivot;
	let tableColumns: Readable<TableColumn[]>;
	let resultColumns: Readable<ResultColumn[]>;

	getPivot(db, 'taxi.yellow_jan').then((p) => {
		pivot = p;
		tableColumns = p.tableColumns;
		resultColumns = p.resultColumns;
	});

    const sortIconMap = {
        "asc": SortAscending,
        "desc": SortDescending,
        "": undefined
    }
</script>

{#if pivot && tableColumns}
	<div class="px-4 w-full overflow-auto">
		<section class="flex gap-4">
			<div class="flex flex-col text-sm text-left">
				<p class="font-bold">Table Columns</p>
				{#each $tableColumns as column}
    				<!-- svelte-ignore a11y-no-static-element-interactions -->
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div
						class="flex gap-2 cursor-pointer text-left hover:bg-gray-100"
						on:click={() => pivot.toggleGroup(column.name)}
					>
						<input class="cursor-pointer" type="checkbox" checked={column.grouped} />
						<button>
							{column.name}
						</button>
					</div>
				{/each}
			</div>
			<table class="text-xs">
				<thead>
					<tr>
						<th />
						{#each $resultColumns as column}
							<th>
                                <div class="flex gap-1 px-1">
                                    <button class="hover:bg-gray-100" on:click={() => pivot.toggleSort(column.name)}>{column.name}</button>
                                    <Icon src={sortIconMap[column.sort ?? ""] ?? ArrowsSort} class="w-4" />
                                </div>
                            </th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each $pivot as row, i}
						<tr>
							<th>{i}</th>
							{#each $resultColumns as column}
								<td>{row[column.name]}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</section>
	</div>
{/if}
