<!-- Tides.svelte -->
<script>
	import '$lib/styles/card.css';
	import '$lib/styles/global.css';

	/** @type {Array<TideData>} */
	export let tide;
</script>

<div class="card">
	<div class="card-title">Tides</div>
	{#if tide && tide.length > 0}
		<div class="grid grid-cols-2 gap-2">
			{#each tide as item}
				<div>
					<span class="font-weight-bold font-1rem">{item.typeof}</span>: {item.time} @ {item.height}m
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
	}
</style>
