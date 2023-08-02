<script>
	import UsqlDatatable from '$lib/UsqlDatatable.svelte';

	let tableName = 'taxi.yellow_jan';
</script>

<!-- https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page?ref=hackernoon.com -->
<label>
	Table Name
	<select bind:value={tableName}>
		<option value="taxi.yellow_jan">yellow_jan</option>
		<option value="taxi.yellow_feb">yellow_feb</option>
		<option value="taxi.yellow_mar">yellow_mar</option>
		<option value="taxi.green_jan">green_jan</option>
		<option value="taxi.green_feb">green_feb</option>
		<option value="taxi.green_mar">green_mar</option>
	</select>
</label>
<main class="w-screen">
	<UsqlDatatable {tableName} />
</main>
