<script lang="ts">
    import Pivot from "$lib/Pivot.svelte";
	import { setDbContext } from "$lib/context.js";
	import type { PageData } from "./$types.js";

    export let data: PageData;

    setDbContext(data.__db);
</script>

<Pivot/>
