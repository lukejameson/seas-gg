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
		{#each tide as item}
			<div>
				<span class="font-weight-bold font-1rem">{item.typeof}</span>: {item.time} @ {item.height}m
			</div>
		{/each}
	{/if}
</div>
