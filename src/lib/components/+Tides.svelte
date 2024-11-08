<!-- Tides.svelte -->
<script>
	import '../../app.css';
	/** @type {Array<TideData>} */
	export let tide;
</script>

<div class="card">
	<div class="card-title">Tides</div>
	{#if tide && tide.length > 0}
		<div class="row row-cols-1 row-cols-sm-2 g-1">
			{#each tide as item}
				<div class="col">
					<small>
						<i
							class="fas {item.typeof === 'High' ? 'fa-chevron-up' : 'fa-chevron-down'} me-1"
							style="font-size: 0.8rem;"
						></i>
						<span class="fw-bold">{item.typeof}</span>
						{item.height}m @ {item.time}
					</small>
				</div>
			{/each}
		</div>
	{:else}
		<small class="text-muted">No tide data available</small>
	{/if}
</div>
