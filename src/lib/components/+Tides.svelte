<!-- Tides.svelte -->
<script>
	import '../../app.css';
	import Icon from './+Icon.svelte';
	/** @type {Array<TideData>} */
	export let tide;
</script>

<div class="card">
	<div class="card-title">Tides</div>
	{#if tide && tide.length > 0}
		<div class="row row-cols-1 row-cols-sm-2 g-1">
			{#each tide as item}
				<div class="col-6 col-md-4">
					<small style="display: block;">
						<Icon name={item.typeof === 'High' ? 'chevronUp' : 'chevronDown'} size="12px"></Icon>
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
