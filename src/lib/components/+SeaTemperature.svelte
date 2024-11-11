<!-- Tides.svelte -->
<script>
	import '../../app.css';
	/** @type {SeaTemperature} */
	export let seaTemperature;
</script>

<div class="card">
	<div class="card-title">Sea Temperature</div>
	{#if seaTemperature && seaTemperature.sea_temp_c != 'Not available'}
		<div class="row row-cols-1 row-cols-sm-2 g-1">
			{seaTemperature.sea_temp_c}
		</div>
	{:else}
		<small class="text-muted">No tide data available</small>
	{/if}
</div>
