<script lang="ts">
	import type { Readable } from "svelte/store";
    import type {Pivot, Pagination} from "../stores/pivot.store.js"
    export let pivot: Pivot

    let pagination: Readable<Pagination[]>;

    $: pagination = pivot.pagination;
</script>

<div class="flex justify-between">
    <button disabled={$pagination.page === 0} on:click={() => pivot.prevPage()}>
        Prev Page
    </button>
    {$pagination.page + 1} / {$pagination.pages}
    <button on:click={() => pivot.nextPage()}>Next Page</button>
</div>
